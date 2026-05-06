"""
DhanMitra AI Simulation Worker (formerly MiroFish)
===================================================
Async worker that polls Supabase for pending stock simulations,
fetches real market data via yfinance, builds Indian market context,
and calls an LLM to generate multi-agent simulation reports.

Usage:
    python dhanmitra_worker.py

Environment variables (see .env.example):
    SUPABASE_URL, SUPABASE_SERVICE_KEY, LLM_API_KEY, LLM_BASE_URL, LLM_MODEL
"""

import asyncio
import json
import logging
import os
import re
import sys
import traceback
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import yfinance as yf
from dotenv import load_dotenv
from openai import AsyncOpenAI
from supabase import create_client, Client

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

POLL_INTERVAL_SECONDS = 5
MAX_RETRIES = 3

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("dhanmitra_worker")

# ---------------------------------------------------------------------------
# Scenario context maps (8 scenario types)
# ---------------------------------------------------------------------------

SCENARIO_CONTEXTS: Dict[str, Dict[str, Any]] = {
    "earnings_beat": {
        "label": "Earnings Beat",
        "prompt_hint": (
            "The company has reported quarterly earnings that significantly "
            "exceeded analyst estimates. Analyze the likely price reaction "
            "considering historical post-earnings moves in Indian markets, "
            "sector rotation patterns, and institutional positioning."
        ),
        "focus_areas": [
            "revenue growth vs guidance",
            "margin expansion",
            "institutional buying post-results",
            "sector peer comparison",
        ],
    },
    "earnings_miss": {
        "label": "Earnings Miss",
        "prompt_hint": (
            "The company has reported quarterly earnings that missed analyst "
            "estimates. Evaluate the downside risk, support levels, and "
            "whether FII/DII flows might cushion or amplify the fall."
        ),
        "focus_areas": [
            "revenue decline drivers",
            "margin compression",
            "institutional selling pressure",
            "historical recovery patterns",
        ],
    },
    "sector_rotation": {
        "label": "Sector Rotation",
        "prompt_hint": (
            "There are signs of capital rotating into or out of this stock's "
            "sector. Analyze FII/DII flow data, thematic ETF movements, and "
            "RBI policy impact on the sector. Consider monsoon/seasonal "
            "effects if applicable."
        ),
        "focus_areas": [
            "FII/DII net flows in sector",
            "sector ETF performance",
            "RBI monetary policy stance",
            "global sector correlations",
        ],
    },
    "macro_event": {
        "label": "Macro Economic Event",
        "prompt_hint": (
            "A significant macroeconomic event (RBI rate decision, Union "
            "Budget, global trade policy, crude oil shock, rupee movement) "
            "is impacting or about to impact the market. Analyze the stock's "
            "sensitivity to macro factors."
        ),
        "focus_areas": [
            "RBI repo rate impact",
            "INR/USD correlation",
            "crude oil sensitivity",
            "government policy changes",
            "global risk-on/risk-off flows",
        ],
    },
    "technical_breakout": {
        "label": "Technical Breakout",
        "prompt_hint": (
            "The stock is showing a technical breakout pattern (or breakdown). "
            "Analyze key support/resistance levels, volume confirmation, "
            "delivery percentage trends, and RSI/MACD signals specific to "
            "NSE/BSE trading patterns."
        ),
        "focus_areas": [
            "key support and resistance levels",
            "volume and delivery percentage",
            "RSI and MACD signals",
            "Bollinger Band positioning",
            "52-week high/low proximity",
        ],
    },
    "fii_dii_activity": {
        "label": "FII/DII Activity",
        "prompt_hint": (
            "Significant FII (Foreign Institutional Investor) or DII "
            "(Domestic Institutional Investor) activity has been detected "
            "in this stock or its sector. Analyze the implications of "
            "institutional flow changes."
        ),
        "focus_areas": [
            "FII net buy/sell trend",
            "DII accumulation/distribution",
            "bulk/block deal analysis",
            "promoter holding changes",
            "mutual fund exposure",
        ],
    },
    "ipo_listing": {
        "label": "IPO / Recent Listing",
        "prompt_hint": (
            "This stock has recently listed via IPO or has upcoming IPO. "
            "Analyze listing gains potential, grey market premium signals, "
            "anchor investor patterns, and post-listing price discovery "
            "typical of Indian IPO markets."
        ),
        "focus_areas": [
            "subscription ratios",
            "grey market premium",
            "anchor investor allocation",
            "peer valuation comparison",
            "lock-in period expiry impact",
        ],
    },
    "custom": {
        "label": "Custom Scenario",
        "prompt_hint": (
            "Analyze this stock based on the user's custom scenario "
            "description. Apply comprehensive Indian market context "
            "including NSE/BSE dynamics, regulatory environment, and "
            "domestic macro factors."
        ),
        "focus_areas": [
            "user-defined scenario factors",
            "technical indicators",
            "fundamental analysis",
            "market sentiment",
        ],
    },
}

# ---------------------------------------------------------------------------
# Indian market context (appended to every simulation prompt)
# ---------------------------------------------------------------------------

INDIAN_MARKET_CONTEXT = """
## Indian Stock Market Context (NSE/BSE)

### Market Structure
- NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) are the two
  primary exchanges. NSE handles ~90% of equity derivatives volume.
- Trading hours: 9:15 AM to 3:30 PM IST (pre-open 9:00-9:15 AM).
- T+1 settlement cycle since January 2023.
- Circuit breaker limits: 5%, 10%, 20% for individual stocks; market-wide
  at 10%, 15%, 20% of Nifty/Sensex.

### Key Indices
- Nifty 50 (NSE benchmark), Sensex (BSE benchmark)
- Nifty Bank, Nifty IT, Nifty Pharma, Nifty FMCG (sectoral)
- Nifty Midcap 150, Nifty Smallcap 250

### Institutional Flows
- FII (Foreign Institutional Investors): Major market movers; net flows
  strongly correlate with Nifty direction. Track via NSDL/CDSL data.
- DII (Domestic Institutional Investors): SIP flows (~Rs 18,000+ crore/month)
  provide systematic buying support and often act as counter to FII selling.
- Mutual fund AUM has crossed Rs 60 lakh crore.

### RBI & Macro Factors
- RBI repo rate decisions (bi-monthly MPC meetings) directly impact banking,
  NBFC, real estate, and auto sectors.
- INR/USD movement affects IT (revenue in USD) and oil/gas (import costs).
- Crude oil prices: India imports ~85% of oil; high crude is negative for
  fiscal deficit and INR.
- Monsoon: Critical for rural economy, FMCG demand, and agri-input stocks.
- Union Budget (February): Major policy catalyst every year.
- GST collections: Indicator of economic activity.

### Sector-Specific Patterns
- IT: Follows NASDAQ, impacted by US Fed rates and visa policies.
- Banking/NBFC: Driven by credit growth, NPA trends, and RBI policy.
- Pharma: US FDA approvals, ANDA pipeline, and domestic formulation growth.
- Auto: Monthly sales data (1st week), festive season demand, EV transition.
- Metals: Linked to China demand, global commodity cycles.
- FMCG: Defensive; monsoon and rural demand driven.
- Real Estate: Linked to interest rates, RERA, and urbanization trends.

### Delivery & Volume Analysis
- Delivery percentage above 50% suggests genuine buying interest.
- High volume with low delivery often indicates speculative/operator activity.
- Bulk deals (>0.5% of shares) and block deals must be disclosed.

### Regulatory Environment
- SEBI (Securities and Exchange Board of India) is the regulator.
- SEBI's ASM (Additional Surveillance Measure) and GSM (Graded Surveillance
  Measure) frameworks can restrict trading in volatile stocks.
- Insider trading regulations and disclosure norms under SEBI (PIT) rules.
"""

# ---------------------------------------------------------------------------
# Stock data fetching via yfinance
# ---------------------------------------------------------------------------


def fetch_stock_data(symbol: str) -> Dict[str, Any]:
    """
    Fetch stock data from Yahoo Finance for the given NSE symbol.
    Returns OHLCV data, basic info, and computed indicators.
    """
    # Append .NS for NSE symbols if not already suffixed
    yf_symbol = symbol if symbol.endswith((".NS", ".BO")) else f"{symbol}.NS"

    logger.info(f"Fetching data for {yf_symbol} via yfinance...")

    try:
        ticker = yf.Ticker(yf_symbol)

        # Fetch 6 months of daily data
        hist = ticker.history(period="6mo", interval="1d")

        if hist.empty:
            # Try BSE suffix as fallback
            yf_symbol = f"{symbol}.BO"
            ticker = yf.Ticker(yf_symbol)
            hist = ticker.history(period="6mo", interval="1d")

        if hist.empty:
            return {"error": f"No data found for {symbol}", "symbol": symbol}

        # Basic info
        info = {}
        try:
            raw_info = ticker.info
            info = {
                "company_name": raw_info.get("longName", raw_info.get("shortName", symbol)),
                "sector": raw_info.get("sector", "Unknown"),
                "industry": raw_info.get("industry", "Unknown"),
                "market_cap": raw_info.get("marketCap"),
                "pe_ratio": raw_info.get("trailingPE"),
                "pb_ratio": raw_info.get("priceToBook"),
                "dividend_yield": raw_info.get("dividendYield"),
                "52w_high": raw_info.get("fiftyTwoWeekHigh"),
                "52w_low": raw_info.get("fiftyTwoWeekLow"),
                "avg_volume": raw_info.get("averageVolume"),
                "beta": raw_info.get("beta"),
            }
        except Exception as e:
            logger.warning(f"Could not fetch info for {yf_symbol}: {e}")

        # Compute technical indicators
        close = hist["Close"]
        indicators = {}

        if len(close) >= 14:
            # RSI-14
            delta = close.diff()
            gain = delta.where(delta > 0, 0).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            indicators["rsi_14"] = round(float(rsi.iloc[-1]), 2)

        if len(close) >= 20:
            sma_20 = close.rolling(window=20).mean()
            indicators["sma_20"] = round(float(sma_20.iloc[-1]), 2)

            # Bollinger Bands
            std_20 = close.rolling(window=20).std()
            indicators["bollinger_upper"] = round(float((sma_20 + 2 * std_20).iloc[-1]), 2)
            indicators["bollinger_lower"] = round(float((sma_20 - 2 * std_20).iloc[-1]), 2)

        if len(close) >= 50:
            indicators["sma_50"] = round(float(close.rolling(window=50).mean().iloc[-1]), 2)

        if len(close) >= 200:
            indicators["sma_200"] = round(float(close.rolling(window=200).mean().iloc[-1]), 2)

        # EMA 12, 26 and MACD
        if len(close) >= 26:
            ema_12 = close.ewm(span=12, adjust=False).mean()
            ema_26 = close.ewm(span=26, adjust=False).mean()
            macd_line = ema_12 - ema_26
            signal_line = macd_line.ewm(span=9, adjust=False).mean()
            indicators["ema_12"] = round(float(ema_12.iloc[-1]), 2)
            indicators["ema_26"] = round(float(ema_26.iloc[-1]), 2)
            indicators["macd"] = round(float(macd_line.iloc[-1]), 2)
            indicators["macd_signal"] = round(float(signal_line.iloc[-1]), 2)

        # ATR-14
        if len(hist) >= 14:
            high = hist["High"]
            low = hist["Low"]
            prev_close = close.shift(1)
            tr = pd.concat([
                high - low,
                (high - prev_close).abs(),
                (low - prev_close).abs()
            ], axis=1).max(axis=1)
            atr = tr.rolling(window=14).mean()
            indicators["atr_14"] = round(float(atr.iloc[-1]), 2)

        # Recent price data (last 30 days for the prompt)
        recent = hist.tail(30)
        price_data = []
        for date, row in recent.iterrows():
            price_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            })

        # Current price
        current_price = round(float(close.iloc[-1]), 2)
        prev_price = round(float(close.iloc[-2]), 2) if len(close) >= 2 else current_price
        change_pct = round(((current_price - prev_price) / prev_price) * 100, 2)

        return {
            "symbol": symbol,
            "yf_symbol": yf_symbol,
            "info": info,
            "current_price": current_price,
            "previous_close": prev_price,
            "change_pct": change_pct,
            "indicators": indicators,
            "recent_prices": price_data,
            "data_points": len(hist),
        }

    except Exception as e:
        logger.error(f"Error fetching stock data for {symbol}: {e}")
        return {"error": str(e), "symbol": symbol}


# ---------------------------------------------------------------------------
# LLM prompt construction
# ---------------------------------------------------------------------------


def build_simulation_prompt(
    stock_data: Dict[str, Any],
    scenario_type: str,
    scenario_description: Optional[str],
    prediction_horizon: str,
) -> str:
    """
    Build the multi-agent simulation prompt for the LLM.
    """
    scenario = SCENARIO_CONTEXTS.get(scenario_type, SCENARIO_CONTEXTS["custom"])

    horizon_labels = {
        "1_day": "1 Trading Day",
        "1_week": "1 Week (5 Trading Days)",
        "2_weeks": "2 Weeks (10 Trading Days)",
        "1_month": "1 Month (~22 Trading Days)",
        "3_months": "3 Months (~66 Trading Days)",
    }
    horizon_label = horizon_labels.get(prediction_horizon, prediction_horizon)

    # Format stock info
    info = stock_data.get("info", {})
    indicators = stock_data.get("indicators", {})

    stock_summary = f"""
### Stock: {stock_data.get('symbol', 'Unknown')}
- Company: {info.get('company_name', 'N/A')}
- Sector: {info.get('sector', 'N/A')} | Industry: {info.get('industry', 'N/A')}
- Current Price: Rs {stock_data.get('current_price', 'N/A')}
- Change: {stock_data.get('change_pct', 0)}%
- Market Cap: {info.get('market_cap', 'N/A')}
- P/E Ratio: {info.get('pe_ratio', 'N/A')} | P/B Ratio: {info.get('pb_ratio', 'N/A')}
- 52W High: {info.get('52w_high', 'N/A')} | 52W Low: {info.get('52w_low', 'N/A')}
- Beta: {info.get('beta', 'N/A')}
"""

    indicator_summary = "\n### Technical Indicators\n"
    for key, value in indicators.items():
        indicator_summary += f"- {key}: {value}\n"

    # Recent prices as compact table
    recent = stock_data.get("recent_prices", [])
    price_table = "\n### Recent Price Data (Last 30 Trading Days)\n"
    price_table += "Date | Open | High | Low | Close | Volume\n"
    price_table += "--- | --- | --- | --- | --- | ---\n"
    for p in recent[-15:]:  # Last 15 days to keep prompt manageable
        price_table += (
            f"{p['date']} | {p['open']} | {p['high']} | "
            f"{p['low']} | {p['close']} | {p['volume']:,}\n"
        )

    # Custom scenario description
    custom_desc = ""
    if scenario_description:
        custom_desc = f"\n### User's Scenario Description\n{scenario_description}\n"

    prompt = f"""
# DhanMitra AI Multi-Agent Stock Simulation
# धनमित्र AI बहु-एजेंट स्टॉक सिमुलेशन

You are DhanMitra AI (धनमित्र AI), an advanced multi-agent stock simulation
system built for the Indian stock market. You must simulate a panel of 5
specialist agents analyzing the given stock and scenario, then synthesize
their views into a final prediction.

## Scenario: {scenario.get('label', scenario_type)}
{scenario.get('prompt_hint', '')}

## Prediction Horizon: {horizon_label}

{stock_summary}
{indicator_summary}
{price_table}
{custom_desc}

{INDIAN_MARKET_CONTEXT}

---

## SIMULATION INSTRUCTIONS

You must role-play as 5 specialist agents in sequence, then produce a
synthesis report. Each agent should provide 2-3 paragraphs of analysis.

### Agent 1: Technical Analyst (तकनीकी विश्लेषक)
Analyze chart patterns, support/resistance, RSI, MACD, Bollinger Bands,
volume trends, and delivery data. Reference NSE-specific patterns.

### Agent 2: Fundamental Analyst (मौलिक विश्लेषक)
Evaluate valuation metrics, earnings quality, sector fundamentals,
competitive positioning, and growth drivers in the Indian context.

### Agent 3: Institutional Flow Analyst (संस्थागत प्रवाह विश्लेषक)
Analyze FII/DII activity, mutual fund holdings, bulk/block deals,
promoter holding changes, and pledge patterns.

### Agent 4: Macro & Sentiment Analyst (समष्टि और भावना विश्लेषक)
Evaluate RBI policy impact, INR/USD, crude oil, global cues, domestic
news sentiment, and seasonal/monsoon factors.

### Agent 5: Risk Manager (जोखिम प्रबंधक)
Identify key risks: regulatory (SEBI/ASM/GSM), liquidity risk, earnings
risk, sector-specific risks, and global contagion. Define stop-loss and
position sizing guidance.

### Focus Areas for This Scenario
{chr(10).join(f'- {area}' for area in scenario.get('focus_areas', []))}

---

## OUTPUT FORMAT

After the 5 agent analyses, provide a **PREDICTION SUMMARY** in EXACTLY
this JSON format (wrapped in ```json``` code block):

```json
{{
  "direction": "bullish" | "bearish" | "neutral",
  "confidence": <number 1-100>,
  "target_price": <number>,
  "stop_loss": <number>,
  "expected_return_pct": <number>,
  "risk_reward_ratio": "<string like 1:2.5>",
  "key_levels": {{
    "support_1": <number>,
    "support_2": <number>,
    "resistance_1": <number>,
    "resistance_2": <number>
  }},
  "catalysts": ["<catalyst 1>", "<catalyst 2>", ...],
  "risks": ["<risk 1>", "<risk 2>", ...],
  "agent_consensus": {{
    "technical": "bullish" | "bearish" | "neutral",
    "fundamental": "bullish" | "bearish" | "neutral",
    "institutional": "bullish" | "bearish" | "neutral",
    "macro_sentiment": "bullish" | "bearish" | "neutral",
    "risk_assessment": "low" | "moderate" | "high"
  }},
  "summary_hi": "<1-2 line summary in Hindi>",
  "summary_en": "<1-2 line summary in English>"
}}
```

IMPORTANT: The prediction JSON block MUST appear at the very end of your
response. Do not add any text after the JSON block.
"""
    return prompt


# ---------------------------------------------------------------------------
# LLM call
# ---------------------------------------------------------------------------


async def call_llm(prompt: str) -> str:
    """
    Call the LLM API with the simulation prompt and return the raw response.
    """
    client = AsyncOpenAI(
        api_key=LLM_API_KEY,
        base_url=LLM_BASE_URL,
    )

    response = await client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are DhanMitra AI (धनमित्र AI), a sophisticated multi-agent "
                    "stock market simulation system specialized in the Indian stock "
                    "market (NSE/BSE). You provide detailed, data-driven analysis. "
                    "Always include the structured JSON prediction at the end."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=4000,
    )

    return response.choices[0].message.content or ""


# ---------------------------------------------------------------------------
# Response parsing
# ---------------------------------------------------------------------------


def parse_prediction(raw_report: str) -> Optional[Dict[str, Any]]:
    """
    Extract the JSON prediction block from the LLM response.
    """
    # Try to find JSON in code blocks
    json_match = re.search(r"```json\s*(\{.*?\})\s*```", raw_report, re.DOTALL)

    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            logger.warning("Found JSON block but failed to parse it")

    # Fallback: try to find any JSON object near the end
    json_candidates = re.findall(r"\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}", raw_report)
    for candidate in reversed(json_candidates):
        try:
            parsed = json.loads(candidate)
            if "direction" in parsed and "confidence" in parsed:
                return parsed
        except json.JSONDecodeError:
            continue

    logger.warning("Could not extract prediction JSON from LLM response")
    return None


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------


def get_supabase_client() -> Client:
    """Create a Supabase client using service role key."""
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def fetch_pending_simulations(supabase: Client) -> List[Dict[str, Any]]:
    """Fetch all simulations with status 'pending'."""
    result = (
        supabase.table("simulations")
        .select("*")
        .eq("status", "pending")
        .order("created_at", desc=False)
        .limit(5)
        .execute()
    )
    return result.data or []


def update_simulation_status(
    supabase: Client,
    sim_id: str,
    status: str,
    progress: int,
    extra: Optional[Dict[str, Any]] = None,
):
    """Update simulation status and progress."""
    data: Dict[str, Any] = {"status": status, "progress": progress}
    if extra:
        data.update(extra)
    supabase.table("simulations").update(data).eq("id", sim_id).execute()


# ---------------------------------------------------------------------------
# Main simulation pipeline
# ---------------------------------------------------------------------------


async def run_simulation(supabase: Client, simulation: Dict[str, Any]):
    """
    Execute a single simulation: fetch data, build prompt, call LLM, parse.
    """
    sim_id = simulation["id"]
    symbol = simulation["stock_symbol"]
    scenario_type = simulation.get("scenario_type", "custom")
    scenario_desc = simulation.get("scenario_description")
    horizon = simulation.get("prediction_horizon", "1_week")

    logger.info(f"Starting simulation {sim_id} for {symbol} ({scenario_type})")

    try:
        # Stage 1: Graph Building (fetching stock data)
        update_simulation_status(
            supabase, sim_id, "graph_building", 10,
            {"started_at": datetime.utcnow().isoformat()},
        )

        stock_data = fetch_stock_data(symbol)

        if "error" in stock_data:
            raise ValueError(f"Stock data fetch failed: {stock_data['error']}")

        # Store seed data
        update_simulation_status(
            supabase, sim_id, "env_setup", 25,
            {"seed_data": stock_data},
        )

        # Stage 2: Build prompt
        prompt = build_simulation_prompt(
            stock_data, scenario_type, scenario_desc, horizon
        )

        # Stage 3: LLM Simulation
        update_simulation_status(supabase, sim_id, "simulating", 50)

        raw_report = await call_llm(prompt)

        # Stage 4: Parse and report
        update_simulation_status(supabase, sim_id, "reporting", 80)

        prediction = parse_prediction(raw_report)

        # Stage 5: Complete
        update_simulation_status(
            supabase,
            sim_id,
            "completed",
            100,
            {
                "prediction": prediction,
                "raw_report": raw_report,
                "completed_at": datetime.utcnow().isoformat(),
            },
        )

        logger.info(f"Simulation {sim_id} completed successfully")

    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        logger.error(f"Simulation {sim_id} failed: {error_msg}")
        logger.error(traceback.format_exc())

        update_simulation_status(
            supabase,
            sim_id,
            "failed",
            0,
            {
                "error_message": error_msg,
                "completed_at": datetime.utcnow().isoformat(),
            },
        )


# ---------------------------------------------------------------------------
# Worker loop
# ---------------------------------------------------------------------------


async def worker_loop():
    """Main polling loop that checks for pending simulations."""
    logger.info("=" * 60)
    logger.info("DhanMitra AI Worker (धनमित्र AI) starting...")
    logger.info(f"Supabase URL: {SUPABASE_URL[:30]}..." if SUPABASE_URL else "Supabase URL: NOT SET")
    logger.info(f"LLM Model: {LLM_MODEL}")
    logger.info(f"LLM Base URL: {LLM_BASE_URL}")
    logger.info(f"Poll interval: {POLL_INTERVAL_SECONDS}s")
    logger.info("=" * 60)

    # Validate configuration
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
        sys.exit(1)

    if not LLM_API_KEY:
        logger.error("LLM_API_KEY must be set in .env")
        sys.exit(1)

    supabase = get_supabase_client()

    while True:
        try:
            pending = fetch_pending_simulations(supabase)

            if pending:
                logger.info(f"Found {len(pending)} pending simulation(s)")
                for sim in pending:
                    await run_simulation(supabase, sim)
            else:
                logger.debug("No pending simulations")

        except KeyboardInterrupt:
            logger.info("Worker stopped by user")
            break
        except Exception as e:
            logger.error(f"Worker loop error: {e}")
            logger.error(traceback.format_exc())

        await asyncio.sleep(POLL_INTERVAL_SECONDS)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

# pandas import (needed for ATR calculation in fetch_stock_data)
try:
    import pandas as pd
except ImportError:
    logger.warning("pandas not installed; ATR calculation will be skipped")
    pd = None  # type: ignore

if __name__ == "__main__":
    try:
        asyncio.run(worker_loop())
    except KeyboardInterrupt:
        logger.info("DhanMitra AI Worker shut down.")
