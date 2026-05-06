"""
DhanSathi — NSE Stock Data Pipeline
====================================
Fetches live stock data from Yahoo Finance (free, no API key needed),
computes technical indicators, and updates Supabase.

Run daily via cron or manually:
    python stock_data_pipeline.py

Environment variables:
    SUPABASE_URL          - Your Supabase project URL
    SUPABASE_SERVICE_KEY  - Supabase service role key

No stock API key needed — uses yfinance (free & open source).
"""

import os
import sys
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

import yfinance as yf
import numpy as np
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
log = logging.getLogger('stock_pipeline')

# ---------------------------------------------------------------------------
#  Configuration
# ---------------------------------------------------------------------------

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

# NSE Stocks to track (symbol → Yahoo Finance ticker)
# Yahoo Finance uses ".NS" suffix for NSE stocks
NSE_STOCKS: Dict[str, Dict[str, str]] = {
    'RELIANCE':   {'yf': 'RELIANCE.NS',  'name': 'Reliance Industries Ltd.',   'sector': 'Conglomerate'},
    'TCS':        {'yf': 'TCS.NS',       'name': 'Tata Consultancy Services',  'sector': 'IT'},
    'HDFCBANK':   {'yf': 'HDFCBANK.NS',  'name': 'HDFC Bank Limited',          'sector': 'Banking'},
    'INFY':       {'yf': 'INFY.NS',      'name': 'Infosys Limited',            'sector': 'IT'},
    'ICICIBANK':  {'yf': 'ICICIBANK.NS', 'name': 'ICICI Bank Limited',         'sector': 'Banking'},
    'TATAMOTORS': {'yf': 'TATAMOTORS.NS','name': 'Tata Motors Limited',        'sector': 'Auto'},
    'BAJFINANCE': {'yf': 'BAJFINANCE.NS','name': 'Bajaj Finance Limited',      'sector': 'Finance'},
    'ADANIENT':   {'yf': 'ADANIENT.NS',  'name': 'Adani Enterprises Ltd.',     'sector': 'Conglomerate'},
    'SBIN':       {'yf': 'SBIN.NS',      'name': 'State Bank of India',        'sector': 'Banking'},
    'WIPRO':      {'yf': 'WIPRO.NS',     'name': 'Wipro Limited',              'sector': 'IT'},
    'HINDUNILVR': {'yf': 'HINDUNILVR.NS','name': 'Hindustan Unilever',         'sector': 'FMCG'},
    'ITC':        {'yf': 'ITC.NS',       'name': 'ITC Limited',                'sector': 'FMCG'},
    'BHARTIARTL': {'yf': 'BHARTIARTL.NS','name': 'Bharti Airtel Limited',      'sector': 'Telecom'},
    'SUNPHARMA':  {'yf': 'SUNPHARMA.NS', 'name': 'Sun Pharmaceutical',        'sector': 'Pharma'},
    'MARUTI':     {'yf': 'MARUTI.NS',    'name': 'Maruti Suzuki India',        'sector': 'Auto'},
    'AXISBANK':   {'yf': 'AXISBANK.NS',  'name': 'Axis Bank Limited',          'sector': 'Banking'},
    'KOTAKBANK':  {'yf': 'KOTAKBANK.NS', 'name': 'Kotak Mahindra Bank',       'sector': 'Banking'},
    'TATASTEEL':  {'yf': 'TATASTEEL.NS', 'name': 'Tata Steel Limited',        'sector': 'Metals'},
    'NTPC':       {'yf': 'NTPC.NS',      'name': 'NTPC Limited',              'sector': 'Energy'},
    'HCLTECH':    {'yf': 'HCLTECH.NS',   'name': 'HCL Technologies',          'sector': 'IT'},
    'LT':         {'yf': 'LT.NS',        'name': 'Larsen & Toubro',           'sector': 'Infrastructure'},
    'ASIANPAINT': {'yf': 'ASIANPAINT.NS','name': 'Asian Paints Limited',      'sector': 'Consumer'},
    'POWERGRID':  {'yf': 'POWERGRID.NS', 'name': 'Power Grid Corp',           'sector': 'Energy'},
    'ULTRACEMCO': {'yf': 'ULTRACEMCO.NS','name': 'UltraTech Cement',          'sector': 'Cement'},
    'TITAN':      {'yf': 'TITAN.NS',     'name': 'Titan Company Limited',     'sector': 'Consumer'},
    'ONGC':       {'yf': 'ONGC.NS',      'name': 'Oil & Natural Gas Corp',    'sector': 'Energy'},
    'JSWSTEEL':   {'yf': 'JSWSTEEL.NS',  'name': 'JSW Steel Limited',         'sector': 'Metals'},
    'M&M':        {'yf': 'M&M.NS',       'name': 'Mahindra & Mahindra',       'sector': 'Auto'},
    'NESTLEIND':  {'yf': 'NESTLEIND.NS', 'name': 'Nestle India Limited',      'sector': 'FMCG'},
    'TECHM':      {'yf': 'TECHM.NS',     'name': 'Tech Mahindra Limited',     'sector': 'IT'},
    'DRREDDY':    {'yf': 'DRREDDY.NS',   'name': 'Dr. Reddys Laboratories',   'sector': 'Pharma'},
    'DIVISLAB':   {'yf': 'DIVISLAB.NS',  'name': 'Divis Laboratories',        'sector': 'Pharma'},
    'COALINDIA':  {'yf': 'COALINDIA.NS', 'name': 'Coal India Limited',        'sector': 'Mining'},
    'BAJAJFINSV': {'yf': 'BAJAJFINSV.NS','name': 'Bajaj Finserv Limited',     'sector': 'Finance'},
    'INDUSINDBK': {'yf': 'INDUSINDBK.NS','name': 'IndusInd Bank Limited',     'sector': 'Banking'},
    'GRASIM':     {'yf': 'GRASIM.NS',    'name': 'Grasim Industries',         'sector': 'Cement'},
    'CIPLA':      {'yf': 'CIPLA.NS',     'name': 'Cipla Limited',             'sector': 'Pharma'},
    'HEROMOTOCO': {'yf': 'HEROMOTOCO.NS','name': 'Hero MotoCorp Limited',     'sector': 'Auto'},
    'EICHERMOT':  {'yf': 'EICHERMOT.NS', 'name': 'Eicher Motors Limited',     'sector': 'Auto'},
    'BPCL':       {'yf': 'BPCL.NS',      'name': 'Bharat Petroleum Corp',     'sector': 'Energy'},
    'TATACONSUM': {'yf': 'TATACONSUM.NS','name': 'Tata Consumer Products',    'sector': 'FMCG'},
    'APOLLOHOSP': {'yf': 'APOLLOHOSP.NS','name': 'Apollo Hospitals',          'sector': 'Healthcare'},
    'BRITANNIA':  {'yf': 'BRITANNIA.NS', 'name': 'Britannia Industries',      'sector': 'FMCG'},
    'SBILIFE':    {'yf': 'SBILIFE.NS',   'name': 'SBI Life Insurance',        'sector': 'Insurance'},
    'HDFC LIFE':  {'yf': 'HDFCLIFE.NS',  'name': 'HDFC Life Insurance',       'sector': 'Insurance'},
    'WIPRO':      {'yf': 'WIPRO.NS',     'name': 'Wipro Limited',             'sector': 'IT'},
}

# ---------------------------------------------------------------------------
#  Technical Indicator Calculations
# ---------------------------------------------------------------------------

def compute_rsi(closes: List[float], period: int = 14) -> Optional[float]:
    """Compute RSI (Relative Strength Index)."""
    if len(closes) < period + 1:
        return None
    deltas = [closes[i] - closes[i - 1] for i in range(1, len(closes))]
    gains = [d if d > 0 else 0 for d in deltas[-period:]]
    losses = [-d if d < 0 else 0 for d in deltas[-period:]]
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100 - (100 / (1 + rs)), 2)


def compute_sma(closes: List[float], period: int) -> Optional[float]:
    """Simple Moving Average."""
    if len(closes) < period:
        return None
    return round(sum(closes[-period:]) / period, 2)


def compute_ema(closes: List[float], period: int) -> Optional[float]:
    """Exponential Moving Average."""
    if len(closes) < period:
        return None
    multiplier = 2 / (period + 1)
    ema = sum(closes[:period]) / period
    for price in closes[period:]:
        ema = (price - ema) * multiplier + ema
    return round(ema, 2)


def compute_macd(closes: List[float]) -> tuple:
    """MACD (12, 26, 9)."""
    ema12 = compute_ema(closes, 12)
    ema26 = compute_ema(closes, 26)
    if ema12 is None or ema26 is None:
        return None, None
    macd_line = round(ema12 - ema26, 2)
    return macd_line, None  # Signal line needs more history


def compute_bollinger(closes: List[float], period: int = 20) -> tuple:
    """Bollinger Bands (20, 2)."""
    if len(closes) < period:
        return None, None
    sma = sum(closes[-period:]) / period
    variance = sum((c - sma) ** 2 for c in closes[-period:]) / period
    std = variance ** 0.5
    return round(sma + 2 * std, 2), round(sma - 2 * std, 2)


def compute_atr(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> Optional[float]:
    """Average True Range."""
    if len(closes) < period + 1:
        return None
    trs = []
    for i in range(1, len(closes)):
        tr = max(
            highs[i] - lows[i],
            abs(highs[i] - closes[i - 1]),
            abs(lows[i] - closes[i - 1]),
        )
        trs.append(tr)
    return round(sum(trs[-period:]) / period, 2)


def determine_signal(rsi: Optional[float], change_pct: float, sma_20: Optional[float], price: float) -> str:
    """Determine buy/sell signal based on technicals."""
    if rsi is not None:
        if rsi < 25:
            return 'strong_buy'
        if rsi < 35 and change_pct > 0:
            return 'buy'
        if rsi > 75:
            return 'strong_sell'
        if rsi > 65 and change_pct < 0:
            return 'sell'
    if sma_20 is not None and price > sma_20 * 1.02:
        return 'buy'
    if sma_20 is not None and price < sma_20 * 0.98:
        return 'sell'
    return 'neutral'


# ---------------------------------------------------------------------------
#  Data Fetching
# ---------------------------------------------------------------------------

def fetch_stock_data(symbol: str, yf_ticker: str) -> Optional[Dict[str, Any]]:
    """Fetch stock data from Yahoo Finance."""
    try:
        ticker = yf.Ticker(yf_ticker)

        # Get 1 year of daily data for indicator calculation
        hist = ticker.history(period='1y')
        if hist.empty or len(hist) < 30:
            log.warning(f'  {symbol}: Insufficient data ({len(hist)} days)')
            return None

        # Current data
        closes = hist['Close'].tolist()
        highs = hist['High'].tolist()
        lows = hist['Low'].tolist()
        volumes = hist['Volume'].tolist()

        current_price = round(closes[-1], 2)
        prev_close = round(closes[-2], 2) if len(closes) > 1 else current_price
        change = round(current_price - prev_close, 2)
        change_pct = round((change / prev_close) * 100, 2) if prev_close > 0 else 0

        # Volume
        current_volume = int(volumes[-1])
        avg_volume = int(sum(volumes[-20:]) / min(20, len(volumes)))

        # Delivery % — yfinance doesn't provide this directly, estimate from volume pattern
        # Higher volume ratio to average suggests more delivery-based trading
        delivery_pct = round(min(70, max(25, 40 + (avg_volume / max(1, current_volume) - 1) * 20)), 1)

        # Market cap from info
        info = ticker.info or {}
        market_cap = info.get('marketCap', 0)
        pe_ratio = info.get('trailingPE', 0) or 0

        # 52-week high/low
        week_52_high = round(max(highs[-252:]) if len(highs) >= 252 else max(highs), 2)
        week_52_low = round(min(lows[-252:]) if len(lows) >= 252 else min(lows), 2)

        # Technical indicators
        rsi = compute_rsi(closes)
        sma_20 = compute_sma(closes, 20)
        sma_50 = compute_sma(closes, 50)
        sma_200 = compute_sma(closes, 200)
        ema_12 = compute_ema(closes, 12)
        ema_26 = compute_ema(closes, 26)
        macd, macd_signal = compute_macd(closes)
        bb_upper, bb_lower = compute_bollinger(closes)
        atr = compute_atr(highs, lows, closes)
        signal = determine_signal(rsi, change_pct, sma_20, current_price)

        return {
            'symbol': symbol,
            'price': current_price,
            'change': change,
            'change_pct': change_pct,
            'volume': current_volume,
            'avg_volume': avg_volume,
            'delivery_pct': delivery_pct,
            'market_cap': market_cap,
            'pe_ratio': round(pe_ratio, 2),
            'week_52_high': week_52_high,
            'week_52_low': week_52_low,
            'rsi_14': rsi,
            'sma_20': sma_20,
            'sma_50': sma_50,
            'sma_200': sma_200,
            'ema_12': ema_12,
            'ema_26': ema_26,
            'macd': macd,
            'macd_signal': macd_signal,
            'bb_upper': bb_upper,
            'bb_lower': bb_lower,
            'atr_14': atr,
            'signal': signal,
            'date': datetime.now().strftime('%Y-%m-%d'),
            # Daily OHLCV for the latest day
            'open': round(float(hist['Open'].iloc[-1]), 2),
            'high': round(float(hist['High'].iloc[-1]), 2),
            'low': round(float(hist['Low'].iloc[-1]), 2),
            'close': current_price,
        }

    except Exception as e:
        log.error(f'  {symbol}: Error fetching data — {e}')
        return None


# ---------------------------------------------------------------------------
#  Supabase Upload
# ---------------------------------------------------------------------------

def upload_to_supabase(sb: Client, stocks: List[Dict[str, Any]]) -> None:
    """Upload stock data to Supabase tables."""

    for stock in stocks:
        symbol = stock['symbol']
        meta = NSE_STOCKS.get(symbol, {})

        try:
            # 1. Upsert stock_master
            sb.table('stock_master').upsert({
                'symbol': symbol,
                'company_name': meta.get('name', symbol),
                'sector': meta.get('sector', 'Unknown'),
                'market_cap': stock['market_cap'],
                'is_nifty50': True,
                'is_active': True,
            }, on_conflict='symbol').execute()

            # 2. Upsert stock_daily_data
            sb.table('stock_daily_data').upsert({
                'symbol': symbol,
                'date': stock['date'],
                'open_price': stock['open'],
                'high_price': stock['high'],
                'low_price': stock['low'],
                'close_price': stock['close'],
                'volume': stock['volume'],
                'delivery_pct': stock['delivery_pct'],
            }, on_conflict='symbol,date').execute()

            # 3. Upsert stock_indicators
            sb.table('stock_indicators').upsert({
                'symbol': symbol,
                'date': stock['date'],
                'rsi_14': stock['rsi_14'],
                'sma_20': stock['sma_20'],
                'sma_50': stock['sma_50'],
                'sma_200': stock['sma_200'],
                'ema_12': stock['ema_12'],
                'ema_26': stock['ema_26'],
                'macd': stock['macd'],
                'macd_signal': stock['macd_signal'],
                'bollinger_upper': stock['bb_upper'],
                'bollinger_lower': stock['bb_lower'],
                'atr_14': stock['atr_14'],
                'high_52w': stock['week_52_high'],
                'low_52w': stock['week_52_low'],
                'signal': stock['signal'],
            }, on_conflict='symbol,date').execute()

            log.info(f'  ✅ {symbol}: ₹{stock["price"]:,.2f} ({stock["change_pct"]:+.2f}%) RSI={stock["rsi_14"]} → {stock["signal"].upper()}')

        except Exception as e:
            log.error(f'  ❌ {symbol}: Upload failed — {e}')


# ---------------------------------------------------------------------------
#  JSON Export (for dev mode without Supabase)
# ---------------------------------------------------------------------------

def export_to_json(stocks: List[Dict[str, Any]], output_path: str = 'src/data/liveStocks.json') -> None:
    """Export stock data as JSON for frontend to consume directly (dev mode)."""

    formatted = []
    for stock in stocks:
        meta = NSE_STOCKS.get(stock['symbol'], {})
        formatted.append({
            'symbol': stock['symbol'],
            'name': meta.get('name', stock['symbol']),
            'sector': meta.get('sector', 'Unknown'),
            'price': stock['price'],
            'change': stock['change'],
            'change_pct': stock['change_pct'],
            'volume': stock['volume'],
            'avg_volume': stock['avg_volume'],
            'delivery_pct': stock['delivery_pct'],
            'market_cap': stock['market_cap'],
            'pe_ratio': stock['pe_ratio'],
            'week_52_high': stock['week_52_high'],
            'week_52_low': stock['week_52_low'],
            'rsi_14': stock['rsi_14'],
            'sma_20': stock['sma_20'],
            'sma_50': stock['sma_50'],
            'sma_200': stock['sma_200'],
            'signal': stock['signal'],
            'updated_at': datetime.now().isoformat(),
        })

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            'stocks': formatted,
            'last_updated': datetime.now().isoformat(),
            'count': len(formatted),
        }, f, indent=2, ensure_ascii=False)

    log.info(f'📄 Exported {len(formatted)} stocks to {output_path}')


# ---------------------------------------------------------------------------
#  Main
# ---------------------------------------------------------------------------

def main():
    log.info('='*60)
    log.info('DhanSathi Stock Data Pipeline')
    log.info('='*60)

    # Determine mode
    use_supabase = bool(SUPABASE_URL and SUPABASE_KEY)

    if use_supabase:
        log.info(f'Mode: SUPABASE (uploading to {SUPABASE_URL[:40]}...)')
        sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        log.info('Mode: LOCAL JSON (no Supabase configured)')
        log.info('  → Set SUPABASE_URL & SUPABASE_SERVICE_KEY in .env for live mode')
        sb = None

    # Fetch all stocks
    log.info(f'\nFetching data for {len(NSE_STOCKS)} NSE stocks...\n')
    all_stocks: List[Dict[str, Any]] = []
    failed = 0

    for symbol, info in NSE_STOCKS.items():
        yf_ticker = info['yf']
        log.info(f'  Fetching {symbol} ({yf_ticker})...')
        data = fetch_stock_data(symbol, yf_ticker)
        if data:
            all_stocks.append(data)
        else:
            failed += 1
        time.sleep(0.5)  # Rate limit — be nice to Yahoo

    log.info(f'\n✅ Successfully fetched: {len(all_stocks)}/{len(NSE_STOCKS)} stocks')
    if failed > 0:
        log.warning(f'⚠️  Failed: {failed} stocks')

    # Upload or export
    if use_supabase and sb:
        log.info('\nUploading to Supabase...\n')
        upload_to_supabase(sb, all_stocks)
    else:
        export_to_json(all_stocks)

    # Summary
    log.info('\n' + '='*60)
    log.info('Pipeline Complete!')
    log.info(f'  Stocks processed: {len(all_stocks)}')
    log.info(f'  Last updated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')

    # Print top movers
    if all_stocks:
        gainers = sorted(all_stocks, key=lambda x: x['change_pct'], reverse=True)[:5]
        losers = sorted(all_stocks, key=lambda x: x['change_pct'])[:5]

        log.info('\n📈 Top Gainers:')
        for s in gainers:
            log.info(f'  {s["symbol"]}: ₹{s["price"]:,.2f} ({s["change_pct"]:+.2f}%)')

        log.info('\n📉 Top Losers:')
        for s in losers:
            log.info(f'  {s["symbol"]}: ₹{s["price"]:,.2f} ({s["change_pct"]:+.2f}%)')

    log.info('='*60)


if __name__ == '__main__':
    main()
