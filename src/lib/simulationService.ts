// ─── DhanMitra AI Simulation Service ──────────────────────────────────────────
// Runs stock simulations entirely in the browser — NO Supabase storage needed.
//
// Two modes:
//   1. SMART LOCAL MODE (default, no API key):
//      → Uses real stock data from stockApi + scenario-aware analysis engine
//      → Generates intelligent predictions based on technical indicators
//      → Works immediately, no setup needed
//
//   2. FULL AI MODE (with API key — VITE_LLM_API_KEY):
//      → Calls OpenAI/Claude API via Supabase Edge Function proxy
//      → Full multi-agent analysis like MiroFish paper
//      → Much deeper, more accurate predictions
//
// Usage:
//   import { runSimulation } from '@/lib/simulationService';
//   const result = await runSimulation({ symbol: 'RELIANCE', scenario: 'rbi_rate', horizon: '1 Month' });
// ──────────────────────────────────────────────────────────────────────────────

import { fetchStockBySymbol } from '@/lib/stockApi';
import type { StockData } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SimulationRequest {
  symbol: string;
  scenarioId: string | null;   // Preset scenario ID
  customScenario: string;      // Custom scenario text
  horizon: '1 Day' | '1 Week' | '2 Weeks' | '1 Month' | '1 Year';
}

export interface SimulationResult {
  direction: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;           // 0-100
  priceRange: { low: number; high: number };
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  expectedReturn: number;       // percentage
  riskReward: number;
  keyDrivers: string[];
  riskFactors: string[];
  timeline: { date: string; event: string }[];
  agentInsights: {
    technical: string;
    fundamental: string;
    institutional: string;
    macro: string;
    risk: string;
  };
  source: 'ai' | 'smart_local'; // Which engine generated this
  hindiSummary: string;
  reasoning?: string;
}

export interface SimulationProgress {
  stage: string;
  percent: number;
  message: string;
}

const DHANMITRA_NVIDIA_MODEL = 'google/gemma-4-31b-it';

function hasExchangeDelivery(stock: StockData): boolean {
  return stock.delivery_source === 'exchange' && stock.delivery_pct > 0;
}

function deliveryLabel(stock: StockData): string {
  return hasExchangeDelivery(stock) ? `${stock.delivery_pct.toFixed(1)}%` : 'N/A';
}

// ─── Scenario Context Database ──────────────────────────────────────────────
// Each scenario has domain-specific analysis rules for the local engine

interface ScenarioContext {
  title: string;
  biasDirection: 'bullish' | 'bearish' | 'neutral';
  impactMultiplier: number;     // How much the scenario affects price (0.5-2.0)
  sectorSensitivity: Record<string, number>; // Sector-specific impact (-1 to 1)
  keyDriverTemplates: string[];
  riskTemplates: string[];
  timelineTemplates: (horizon: string, stock: StockData) => { date: string; event: string }[];
}

const SCENARIO_CONTEXTS: Record<string, ScenarioContext> = {
  rbi_rate: {
    title: 'RBI Rate Cut',
    biasDirection: 'bullish',
    impactMultiplier: 1.3,
    sectorSensitivity: {
      'Banking': 0.9, 'Finance': 0.8, 'Infrastructure': 0.6, 'Automobile': 0.5,
      'IT': 0.1, 'Pharma': 0.1, 'FMCG': 0.2, 'Oil & Gas': 0.2,
      'Power': 0.3, 'Metals': 0.3, 'Telecom': 0.2, 'Cement': 0.5,
    },
    keyDriverTemplates: [
      'RBI rate cut of 25-50 bps reduces cost of borrowing for {sector} sector',
      'Lower interest rates boost loan demand and improve NIM for banks',
      'Housing and auto EMIs become cheaper, driving demand in real economy',
      'FII inflows typically increase post rate cut due to carry trade dynamics',
      'Cheaper credit accelerates capex plans across corporate India',
    ],
    riskTemplates: [
      'Rate cut may signal concerns about economic slowdown',
      'If inflation rebounds, RBI may reverse course quickly',
      'Global rate differentials may weaken INR, offsetting domestic gains',
    ],
    timelineTemplates: (horizon, stock) => [
      { date: 'Day 1-2', event: `Initial knee-jerk rally expected. Banking stocks may gap up 1-3%. ${stock.symbol} targets ₹${Math.round(stock.price * 1.015).toLocaleString('en-IN')}` },
      { date: 'Week 1', event: 'Rate-sensitive sectors outperform. FII buying picks up. Nifty Bank leads broad market rally' },
      { date: 'Week 2-3', event: `Consolidation phase as market prices in the cut. ${stock.symbol} may test SMA-20 at ₹${stock.sma_20.toLocaleString('en-IN')}` },
      { date: 'Week 4', event: `If credit growth data confirms acceleration, second leg of rally possible towards ₹${Math.round(stock.price * 1.05).toLocaleString('en-IN')}` },
    ],
  },
  earnings_beat: {
    title: 'Earnings Beat',
    biasDirection: 'bullish',
    impactMultiplier: 1.5,
    sectorSensitivity: {
      'IT': 0.9, 'Banking': 0.7, 'Pharma': 0.7, 'FMCG': 0.6,
      'Automobile': 0.6, 'Finance': 0.7, 'Telecom': 0.5,
      'Oil & Gas': 0.5, 'Metals': 0.5, 'Infrastructure': 0.4,
    },
    keyDriverTemplates: [
      '{stock} beats quarterly earnings estimates by 10-20%, signaling strong execution',
      'Revenue growth exceeds street expectations with margin expansion',
      'Management guidance raised for next 2 quarters, boosting forward PE',
      'Analyst upgrades expected from top brokerages post-results',
      'Delivery percentage likely to spike as institutional investors accumulate',
    ],
    riskTemplates: [
      'Strong results may already be priced in if stock rallied pre-earnings',
      'One good quarter doesn\'t guarantee sustained performance improvement',
      'Sector headwinds could limit upside despite company-specific outperformance',
    ],
    timelineTemplates: (horizon, stock) => [
      { date: 'Result Day', event: `Expected gap-up opening of 3-5%. Volume likely 2-3x average. Target: ₹${Math.round(stock.price * 1.04).toLocaleString('en-IN')}` },
      { date: 'Day 2-3', event: 'Post-earnings momentum as analyst reports and target revisions come in' },
      { date: 'Week 1', event: `Short covering + fresh institutional buying. ${stock.symbol} may reach ₹${Math.round(stock.price * 1.07).toLocaleString('en-IN')}` },
      { date: 'Week 2-4', event: 'Price stabilizes at new level. Watch for sector rotation and profit booking near 52-week high' },
    ],
  },
  policy_change: {
    title: 'Policy Change',
    biasDirection: 'neutral',
    impactMultiplier: 1.2,
    sectorSensitivity: {
      'Infrastructure': 0.8, 'Banking': 0.5, 'Power': 0.7, 'Defence': 0.6,
      'Automobile': 0.4, 'FMCG': -0.1, 'IT': -0.1, 'Pharma': 0.3,
    },
    keyDriverTemplates: [
      'Major government policy reform creates new growth opportunity for {sector} sector',
      'Budget allocation or PLI scheme extension benefits direct stakeholders',
      'Regulatory clarity reduces uncertainty premium in stock valuation',
      'Policy creates structural tailwind for next 3-5 years of earnings growth',
    ],
    riskTemplates: [
      'Implementation timeline may be longer than market expects',
      'Policy execution risk — gap between announcement and on-ground impact',
      'Opposition or legal challenges could delay or dilute the policy',
      'Market may have already discounted the policy if leaks preceded announcement',
    ],
    timelineTemplates: (horizon, stock) => [
      { date: 'Day 1', event: 'Initial market reaction driven by headline impact. Sector-wide move expected' },
      { date: 'Week 1', event: `Market digests policy details. ${stock.symbol} likely to see increased institutional interest` },
      { date: 'Week 2-3', event: 'Analyst reports quantify policy impact on earnings. Stock re-rates accordingly' },
      { date: 'Month 1', event: 'Long-term positioning begins. Watch for delivery % and FII/DII data for confirmation' },
    ],
  },
  global_crash: {
    title: 'Global Crash',
    biasDirection: 'bearish',
    impactMultiplier: 2.0,
    sectorSensitivity: {
      'IT': -0.8, 'Banking': -0.7, 'Metals': -0.9, 'Oil & Gas': -0.7,
      'Automobile': -0.6, 'Finance': -0.8, 'Infrastructure': -0.5,
      'FMCG': -0.2, 'Pharma': -0.3, 'Power': -0.4, 'Telecom': -0.3,
    },
    keyDriverTemplates: [
      'Global risk-off sentiment triggers massive FII selling across emerging markets',
      'INR depreciates sharply against USD, impacting import-dependent sectors',
      'Credit spreads widen globally, increasing cost of capital for Indian corporates',
      'VIX spikes above 25, triggering stop-loss cascades and margin calls',
      'Correlation across asset classes increases — no hiding place in equities',
    ],
    riskTemplates: [
      'V-shaped recovery if crash is sentiment-driven without fundamental damage',
      'RBI and government may intervene with emergency measures (rate cuts, fiscal stimulus)',
      'Domestic retail SIP flows provide valuation floor for quality large-caps',
      'Global central bank coordination could reverse sentiment rapidly',
    ],
    timelineTemplates: (horizon, stock) => [
      { date: 'Day 1-2', event: `Sharp selloff. ${stock.symbol} may drop 5-10% with circuit filters possible. Target support: ₹${Math.round(stock.price * 0.92).toLocaleString('en-IN')}` },
      { date: 'Week 1', event: 'Dead cat bounce likely followed by retesting lows. Volume surges 3-5x average' },
      { date: 'Week 2', event: `If 52-week low (₹${stock.week_52_low.toLocaleString('en-IN')}) holds, early bottom fishing by DIIs begins` },
      { date: 'Week 3-4', event: 'Gradual stabilization if global contagion contained. Quality names recover first' },
    ],
  },
  fii_dii: {
    title: 'FII/DII Flow',
    biasDirection: 'bullish',
    impactMultiplier: 1.1,
    sectorSensitivity: {
      'Banking': 0.8, 'IT': 0.6, 'Finance': 0.7, 'Oil & Gas': 0.4,
      'FMCG': 0.3, 'Automobile': 0.5, 'Infrastructure': 0.5,
      'Pharma': 0.3, 'Metals': 0.4, 'Telecom': 0.3,
    },
    keyDriverTemplates: [
      'FII net buying of ₹5,000+ Cr in cash segment signals renewed confidence in India',
      'DII (mutual fund + insurance) buying provides strong valuation support',
      'Index heavyweights see delivery-based accumulation, confirming institutional intent',
      'ETF inflows from global India-focused funds adding to buying pressure',
    ],
    riskTemplates: [
      'FII flows are volatile and can reverse quickly on global triggers',
      'Strong flows may be concentrated in few large-cap names, creating breadth divergence',
      'If US yields rise, FII money may rotate back to developed markets',
    ],
    timelineTemplates: (horizon, stock) => [
      { date: 'Day 1-3', event: `Gradual price appreciation as institutional buying builds. ${stock.symbol} delivery % expected >50%` },
      { date: 'Week 1', event: `Sustained buying pushes ${stock.symbol} towards ₹${Math.round(stock.price * 1.03).toLocaleString('en-IN')}. Nifty breadth improves` },
      { date: 'Week 2', event: 'Mid-cap rotation begins as institutional money cascades down the market-cap ladder' },
      { date: 'Month 1', event: 'If monthly FII data confirms net buying >₹10,000 Cr, sustained uptrend confirmed' },
    ],
  },
  commodity: {
    title: 'Commodity Shock',
    biasDirection: 'bearish',
    impactMultiplier: 1.4,
    sectorSensitivity: {
      'Oil & Gas': -0.9, 'Automobile': -0.6, 'FMCG': -0.4, 'Metals': 0.7,
      'Mining': 0.6, 'Power': -0.3, 'Banking': -0.2, 'IT': 0.1,
      'Pharma': -0.2, 'Infrastructure': -0.3,
    },
    keyDriverTemplates: [
      'Crude oil spike to $100+ puts pressure on India\'s current account deficit',
      'Input cost inflation squeezes margins for manufacturing companies',
      'INR weakens as oil import bill surges, creating twin deficit concerns',
      'RBI may be forced to pause rate cuts to combat imported inflation',
    ],
    riskTemplates: [
      'Strategic petroleum reserves and government intervention may cap oil impact',
      'Commodity-linked companies (metals, mining) benefit from higher prices',
      'India\'s growing renewable energy capacity reduces long-term oil dependency',
      'OPEC+ supply response may normalize prices within 2-3 months',
    ],
    timelineTemplates: (horizon, stock) => [
      { date: 'Day 1', event: `Immediate market selloff. Oil-sensitive ${stock.symbol} may drop 2-4%` },
      { date: 'Week 1', event: `Market assesses duration and magnitude of commodity shock. ${stock.symbol} finds support near SMA-50` },
      { date: 'Week 2', event: 'Sector divergence emerges — commodity producers rally while consumers decline' },
      { date: 'Month 1', event: 'If oil normalizes, recovery rally. If sustained, structural re-rating of affected sectors' },
    ],
  },
};

// ─── Smart Local Engine ─────────────────────────────────────────────────────
// Generates intelligent predictions using real stock data + scenario rules

function runLocalSimulation(
  stock: StockData,
  request: SimulationRequest,
): SimulationResult {
  const scenario = request.scenarioId ? SCENARIO_CONTEXTS[request.scenarioId] : null;
  const isCustom = !scenario && request.customScenario.trim().length > 0;

  // ── Base direction from technicals ──────────────────────────────────────
  let technicalScore = 0;

  // RSI analysis
  if (stock.rsi_14 < 30) technicalScore += 3;
  else if (stock.rsi_14 < 40) technicalScore += 1;
  else if (stock.rsi_14 > 70) technicalScore -= 3;
  else if (stock.rsi_14 > 60) technicalScore -= 1;

  // SMA analysis
  if (stock.price > stock.sma_20) technicalScore += 1;
  else technicalScore -= 1;
  if (stock.price > stock.sma_50) technicalScore += 1;
  else technicalScore -= 1;
  if (stock.price > stock.sma_200) technicalScore += 1;
  else technicalScore -= 1;

  // Delivery analysis only runs when the live data source provides exchange delivery.
  if (hasExchangeDelivery(stock) && stock.delivery_pct > 55) technicalScore += 1;
  if (hasExchangeDelivery(stock) && stock.delivery_pct > 65) technicalScore += 1;

  // Volume analysis
  if (stock.volume > stock.avg_volume * 1.3) technicalScore += 1;

  // ── Scenario bias ─────────────────────────────────────────────────────
  let scenarioScore = 0;
  if (scenario) {
    const sectorImpact = scenario.sectorSensitivity[stock.sector] ?? 0;
    const biasValue = scenario.biasDirection === 'bullish' ? 1 : scenario.biasDirection === 'bearish' ? -1 : 0;
    scenarioScore = biasValue * scenario.impactMultiplier * (1 + Math.abs(sectorImpact)) * 3;
    scenarioScore += sectorImpact * 2;
  } else if (isCustom) {
    // For custom scenarios, use a slight bullish bias (most custom scenarios are "what if good thing happens")
    const customText = request.customScenario.toLowerCase();
    if (customText.includes('crash') || customText.includes('fall') || customText.includes('drop') || customText.includes('loss') || customText.includes('war') || customText.includes('negative')) {
      scenarioScore = -3;
    } else if (customText.includes('grow') || customText.includes('rise') || customText.includes('acquisition') || customText.includes('expansion') || customText.includes('bullish')) {
      scenarioScore = 3;
    } else {
      scenarioScore = 1; // Slight bullish bias for neutral custom scenarios
    }
  }

  // ── Compute final direction and confidence ─────────────────────────────
  const totalScore = technicalScore + scenarioScore;
  const direction: SimulationResult['direction'] =
    totalScore > 2 ? 'Bullish' : totalScore < -2 ? 'Bearish' : 'Neutral';

  // Confidence: base 50, modified by score strength
  const dataQualityPenalty = stock.data_quality === 'live' ? 0 : 8;
  const confidence = Math.min(88, Math.max(30, 50 + Math.abs(totalScore) * 4 - dataQualityPenalty));

  // ── Price targets ─────────────────────────────────────────────────────
  const horizonDays = request.horizon === '1 Day' ? 1 : request.horizon === '1 Week' ? 7 : request.horizon === '2 Weeks' ? 14 : request.horizon === '1 Year' ? 365 : 30;
  const dailyVolatility = Math.abs(stock.change_pct) * 0.5 + 0.5; // Approximate daily volatility %
  const totalMovePercent = dailyVolatility * Math.sqrt(horizonDays) * (scenario?.impactMultiplier ?? 1);

  const moveDirection = direction === 'Bullish' ? 1 : direction === 'Bearish' ? -1 : 0;
  const expectedMove = stock.price * (totalMovePercent / 100) * moveDirection;

  const targetPrice = Math.round(stock.price + expectedMove);
  const stopLoss = direction === 'Bullish'
    ? Math.round(stock.price * 0.97)
    : Math.round(stock.price * 1.03);

  const priceLow = direction === 'Bearish'
    ? Math.round(stock.price - stock.price * totalMovePercent / 80)
    : Math.round(stock.price * 0.99);
  const priceHigh = direction === 'Bullish'
    ? Math.round(stock.price + stock.price * totalMovePercent / 80)
    : Math.round(stock.price * 1.01);

  const expectedReturn = ((targetPrice - stock.price) / stock.price) * 100;
  const riskReward = Math.abs(expectedReturn) / Math.abs(((stopLoss - stock.price) / stock.price) * 100);

  // ── Key drivers ───────────────────────────────────────────────────────
  const keyDrivers: string[] = [];

  // Technical drivers
  if (stock.rsi_14 < 35) keyDrivers.push(`RSI at ${stock.rsi_14.toFixed(0)} indicates oversold conditions — bounce potential`);
  else if (stock.rsi_14 > 65) keyDrivers.push(`RSI at ${stock.rsi_14.toFixed(0)} indicates overbought territory — correction risk`);

  if (stock.price > stock.sma_200) keyDrivers.push(`Trading above 200-DMA (₹${stock.sma_200.toLocaleString('en-IN')}) — long-term uptrend intact`);
  else keyDrivers.push(`Trading below 200-DMA (₹${stock.sma_200.toLocaleString('en-IN')}) — long-term downtrend`);

  if (hasExchangeDelivery(stock) && stock.delivery_pct > 55) {
    keyDrivers.push(`High exchange delivery percentage (${stock.delivery_pct.toFixed(1)}%) signals stronger cash-market participation`);
  }

  // Scenario-specific drivers
  if (scenario) {
    const drivers = scenario.keyDriverTemplates
      .map(d => d.replace('{stock}', stock.symbol).replace('{sector}', stock.sector))
      .slice(0, 3);
    keyDrivers.push(...drivers);
  } else if (isCustom) {
    keyDrivers.push(`Custom scenario: "${request.customScenario.slice(0, 80)}${request.customScenario.length > 80 ? '...' : ''}"`);
    keyDrivers.push(`${stock.sector} sector sensitivity to this scenario based on historical patterns`);
  }

  // Ensure at least 3 drivers
  if (keyDrivers.length < 3) {
    keyDrivers.push(`Volume at ${(stock.volume / 1000000).toFixed(1)}M vs average ${(stock.avg_volume / 1000000).toFixed(1)}M — ${stock.volume > stock.avg_volume ? 'above' : 'below'} average interest`);
  }

  // ── Risk factors ───────────────────────────────────────────────────────
  const riskFactors: string[] = [];

  if (scenario) {
    riskFactors.push(...scenario.riskTemplates.slice(0, 2));
  }

  // Universal risks
  if (stock.pe_ratio > 50) riskFactors.push(`Elevated P/E ratio (${stock.pe_ratio.toFixed(1)}x) leaves limited margin of safety`);
  if (stock.price > stock.week_52_high * 0.95) riskFactors.push(`Near 52-week high — potential for profit booking and resistance`);
  if (stock.price < stock.week_52_low * 1.1) riskFactors.push(`Near 52-week low — sentiment remains weak, potential value trap`);
  riskFactors.push('Global macro events (US Fed, geopolitics) can override stock-specific catalysts');

  if (riskFactors.length < 3) {
    riskFactors.push('Liquidity risk during volatile sessions may cause wider spreads');
  }

  // ── Timeline ──────────────────────────────────────────────────────────
  const timeline = scenario
    ? scenario.timelineTemplates(request.horizon, stock)
    : [
      { date: 'Day 1-2', event: `Initial market reaction. ${stock.symbol} likely to test ₹${direction === 'Bullish' ? Math.round(stock.price * 1.02).toLocaleString('en-IN') : Math.round(stock.price * 0.98).toLocaleString('en-IN')}` },
      { date: 'Week 1', event: `${direction === 'Bullish' ? 'Positive' : 'Negative'} momentum builds. Watch volume for confirmation` },
      { date: 'Week 2', event: `Key level: SMA-20 at ₹${stock.sma_20.toLocaleString('en-IN')}. ${direction === 'Bullish' ? 'Support' : 'Resistance'} expected here` },
      { date: 'Week 3-4', event: `Target zone: ₹${targetPrice.toLocaleString('en-IN')}. Review stop-loss at ₹${stopLoss.toLocaleString('en-IN')}` },
    ];

  // ── Agent insights ────────────────────────────────────────────────────
  const agentInsights = {
    technical: `${stock.symbol} RSI: ${stock.rsi_14.toFixed(0)}, Price vs SMA20: ${stock.price > stock.sma_20 ? 'ABOVE' : 'BELOW'} (₹${stock.sma_20.toLocaleString('en-IN')}), SMA50: ${stock.price > stock.sma_50 ? 'ABOVE' : 'BELOW'}, SMA200: ${stock.price > stock.sma_200 ? 'ABOVE' : 'BELOW'}. Signal: ${stock.signal.toUpperCase()}. Signal source: ${stock.signal_source || 'live_history'}.`,
    fundamental: `P/E: ${stock.pe_ratio.toFixed(1)}x. Market cap: ₹${(stock.market_cap / 100).toFixed(0)} Cr. Sector: ${stock.sector}. ${stock.pe_ratio < 15 ? 'Value territory.' : stock.pe_ratio > 50 ? 'Premium valuation, priced for perfection.' : 'Fair valuation range.'}`,
    institutional: `Volume ${stock.volume > stock.avg_volume ? 'ABOVE' : 'BELOW'} average (${((stock.volume / Math.max(stock.avg_volume, 1) - 1) * 100).toFixed(0)}%). Delivery: ${deliveryLabel(stock)}${hasExchangeDelivery(stock) ? ' from exchange delivery feed.' : ' because the live quote provider does not publish exchange delivery percentage.'}`,
    macro: `${stock.sector} sector ${scenario ? `sensitivity to "${scenario.title}": ${(scenario.sectorSensitivity[stock.sector] ?? 0) > 0 ? 'POSITIVE' : (scenario.sectorSensitivity[stock.sector] ?? 0) < 0 ? 'NEGATIVE' : 'NEUTRAL'}` : 'under current market conditions'}. India VIX environment suggests ${direction === 'Bearish' ? 'elevated' : 'moderate'} risk.`,
    risk: `Stop-loss: ₹${stopLoss.toLocaleString('en-IN')} (${((Math.abs(stopLoss - stock.price) / stock.price) * 100).toFixed(1)}% from CMP). Risk-reward ratio: ${riskReward.toFixed(1)}:1. ${riskReward > 2 ? 'Favorable setup.' : 'Tight risk management required.'}`,
  };

  // ── Hindi summary ─────────────────────────────────────────────────────
  const hindiDirection = direction === 'Bullish' ? 'तेजी' : direction === 'Bearish' ? 'मंदी' : 'तटस्थ';
  const hindiSummary = `${stock.symbol} के लिए ${scenario?.title ?? 'कस्टम'} परिदृश्य में ${hindiDirection} का संकेत है। AI विश्वास: ${Math.round(confidence)}%। लक्ष्य मूल्य: ₹${targetPrice.toLocaleString('en-IN')}। स्टॉप-लॉस: ₹${stopLoss.toLocaleString('en-IN')}।`;

  return {
    direction,
    confidence: Math.round(confidence),
    priceRange: { low: priceLow, high: priceHigh },
    currentPrice: stock.price,
    targetPrice,
    stopLoss,
    expectedReturn: Math.round(expectedReturn * 100) / 100,
    riskReward: Math.round(riskReward * 100) / 100,
    keyDrivers,
    riskFactors,
    timeline,
    agentInsights,
    source: 'smart_local',
    hindiSummary,
  };
}

// ─── Full AI Engine (via LLM API) ──────────────────────────────────────────
// Calls OpenAI/Claude API via Supabase Edge Function or direct proxy

async function runAISimulation(
  stock: StockData,
  request: SimulationRequest,
  onProgress?: (progress: SimulationProgress) => void,
  userProfile?: { state?: string; occupation?: string; annual_income?: number; category?: string } | null,
): Promise<SimulationResult | null> {
  // Prefer the Vercel NVIDIA proxy in the browser so production can use Gemma 4
  // without exposing the API key in client assets.
  const nvidiaKey = import.meta.env?.DEV ? import.meta.env?.VITE_NVIDIA_API_KEY : '';
  const legacyKey = import.meta.env?.VITE_LLM_API_KEY;
  const hasNvidiaProxy = typeof window !== 'undefined';
  const canUseNvidia = hasNvidiaProxy || !!nvidiaKey;
  const apiKey = nvidiaKey || legacyKey;

  if (!canUseNvidia && !legacyKey) return null;

  try {
    onProgress?.({ stage: 'Building market context...', percent: 15, message: 'Analyzing technical indicators' });

    const scenario = request.scenarioId ? SCENARIO_CONTEXTS[request.scenarioId] : null;
    const scenarioText = scenario
      ? scenario.title + ': ' + (SCENARIO_CONTEXTS[request.scenarioId!]?.keyDriverTemplates[0] ?? '')
      : request.customScenario;

    const prompt = buildLLMPrompt(stock, scenarioText, request.horizon);

    // Add user context to prompt if profile available
    let userContext = '';
    if (userProfile) {
      const parts: string[] = [];
      if (userProfile.state) parts.push(`State: ${userProfile.state}`);
      if (userProfile.occupation) parts.push(`Occupation: ${userProfile.occupation}`);
      if (userProfile.annual_income) parts.push(`Annual Income: ₹${userProfile.annual_income.toLocaleString('en-IN')}`);
      if (userProfile.category) parts.push(`Category: ${userProfile.category.toUpperCase()}`);
      if (parts.length > 0) {
        userContext = `\n\nInvestor Profile:\n${parts.join('\n')}\nTailor risk assessment and recommendations to this investor's profile.`;
      }
    }

    onProgress?.({ stage: 'Running multi-agent analysis...', percent: 40, message: 'Gemma 4 trading agents analyzing in parallel' });

    // Check if using Supabase Edge Function or direct API
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
    let response: Response;

    if (!canUseNvidia && supabaseUrl && !supabaseUrl.includes('placeholder')) {
      // Use Supabase Edge Function as proxy (hides API key)
      response = await fetch(`${supabaseUrl}/functions/v1/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          stock_symbol: stock.symbol,
          scenario: scenarioText,
          horizon: request.horizon,
          stock_data: {
            price: stock.price,
            change_pct: stock.change_pct,
            rsi_14: stock.rsi_14,
            sma_20: stock.sma_20,
            sma_50: stock.sma_50,
            sma_200: stock.sma_200,
            pe_ratio: stock.pe_ratio,
            delivery_pct: stock.delivery_pct,
            volume: stock.volume,
            sector: stock.sector,
          },
        }),
        signal: AbortSignal.timeout(120000), // 120 second timeout
      });
    } else {
      // Use Pollination API via proxy (or legacy direct API)
      // Use NVIDIA if available, then legacy
      const isNvidia = canUseNvidia;
      
      const apiBase = isNvidia
        ? (typeof window !== 'undefined' ? `${window.location.origin}/api/nvidia/v1` : 'http://localhost:5173/api/nvidia/v1')
        : (import.meta.env?.VITE_LLM_BASE_URL || 'https://api.openai.com/v1');
          
      const model = isNvidia
        ? (import.meta.env?.VITE_DHANMITRA_MODEL || DHANMITRA_NVIDIA_MODEL)
        : (import.meta.env?.VITE_LLM_MODEL || 'gpt-4o-mini');

      response = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are DhanMitra AI (धनमित्र AI), a cautious multi-agent market simulation system. Use only the supplied market data, never invent missing delivery data, never promise profit, and return ONLY valid JSON.' + userContext },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          ...(isNvidia && model.includes('glm') ? {
            extra_body: {
              chat_template_kwargs: {
                enable_thinking: true,
                clear_thinking: false
              }
            }
          } : {})
        }),
        signal: AbortSignal.timeout(120000),
      });
    }

    onProgress?.({ stage: 'Processing AI response...', percent: 75, message: 'Parsing prediction data' });

    if (!response.ok) {
      console.error('[simulationService] LLM API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.prediction || '';
    const reasoning = data.choices?.[0]?.message?.reasoning_content;

    try {
      const parsed = JSON.parse(content);
      onProgress?.({ stage: 'Complete', percent: 100, message: 'Simulation ready' });

      return {
        direction: parsed.direction || 'Neutral',
        confidence: parsed.confidence || 60,
        priceRange: {
          low: parsed.price_range?.low || stock.price * 0.95,
          high: parsed.price_range?.high || stock.price * 1.05,
        },
        currentPrice: stock.price,
        targetPrice: parsed.target_price || stock.price,
        stopLoss: parsed.stop_loss || stock.price * 0.97,
        expectedReturn: parsed.expected_return_pct || 0,
        riskReward: parsed.risk_reward_ratio || 1,
        keyDrivers: parsed.catalysts || parsed.key_drivers || [],
        riskFactors: parsed.risks || parsed.risk_factors || [],
        timeline: (parsed.timeline || []).map((t: { date?: string; period?: string; event?: string; description?: string }) => ({
          date: t.date || t.period || '',
          event: t.event || t.description || '',
        })),
        agentInsights: {
          technical: parsed.agent_consensus?.technical || '',
          fundamental: parsed.agent_consensus?.fundamental || '',
          institutional: parsed.agent_consensus?.institutional || '',
          macro: parsed.agent_consensus?.macro || '',
          risk: parsed.agent_consensus?.risk || '',
        },
        source: 'ai',
        hindiSummary: parsed.hindi_summary || '',
        reasoning: reasoning || parsed.reasoning || '',
      };
    } catch {
      console.error('[simulationService] Failed to parse LLM response');
      return null;
    }
  } catch (err) {
    console.error('[simulationService] AI simulation failed:', err);
    return null;
  }
}

// ─── LLM Prompt Builder ────────────────────────────────────────────────────

function buildLLMPrompt(stock: StockData, scenario: string, horizon: string): string {
  return `Analyze ${stock.symbol} (${stock.name}) under this scenario: "${scenario}"
Prediction horizon: ${horizon}

CURRENT MARKET DATA:
- Price: ₹${stock.price.toLocaleString('en-IN')}
- Change: ${stock.change_pct >= 0 ? '+' : ''}${stock.change_pct.toFixed(2)}%
- Sector: ${stock.sector}
- RSI-14: ${stock.rsi_14.toFixed(1)}
- SMA-20: ₹${stock.sma_20.toLocaleString('en-IN')} (${stock.price > stock.sma_20 ? 'ABOVE' : 'BELOW'})
- SMA-50: ₹${stock.sma_50.toLocaleString('en-IN')} (${stock.price > stock.sma_50 ? 'ABOVE' : 'BELOW'})
- SMA-200: ₹${stock.sma_200.toLocaleString('en-IN')} (${stock.price > stock.sma_200 ? 'ABOVE' : 'BELOW'})
- P/E Ratio: ${stock.pe_ratio.toFixed(1)}x
- Volume: ${stock.volume.toLocaleString('en-IN')} (Avg: ${stock.avg_volume.toLocaleString('en-IN')})
- Delivery %: ${deliveryLabel(stock)}${hasExchangeDelivery(stock) ? '' : ' (not supplied by current live source; do not use delivery in signal)'}
- 52W High: ₹${stock.week_52_high.toLocaleString('en-IN')}
- 52W Low: ₹${stock.week_52_low.toLocaleString('en-IN')}

You have 5 specialist agents:
1. Technical Analyst — RSI, SMA, price/volume trend
2. Fundamental Analyst — P/E, earnings, sector position
3. Institutional Flow Analyst — volume, liquidity, delivery only if supplied
4. Macro & Sentiment Analyst — RBI, global cues, sector trends
5. Risk Manager — Stop-loss, position sizing, risk-reward

Return ONLY this JSON:
{
  "direction": "Bullish" | "Bearish" | "Neutral",
  "confidence": 1-100,
  "target_price": number,
  "stop_loss": number,
  "expected_return_pct": number,
  "risk_reward_ratio": number,
  "price_range": { "low": number, "high": number },
  "catalysts": ["string", ...],
  "risks": ["string", ...],
  "timeline": [{ "date": "string", "event": "string" }, ...],
  "agent_consensus": {
    "technical": "string",
    "fundamental": "string",
    "institutional": "string",
    "macro": "string",
    "risk": "string"
  },
  "hindi_summary": "string (2-3 sentences in Hindi)"
}

Important constraints:
- This is an educational probability simulation, not a guaranteed profit call.
- Do not claim 100% certainty.
- If delivery is N/A, explicitly say it is unavailable and do not infer institutional accumulation from it.`;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Run a stock simulation. Tries AI mode first (if API key configured),
 * falls back to smart local engine.
 *
 * No data is stored — everything runs in memory and returns immediately.
 */
export async function runSimulation(
  request: SimulationRequest,
  onProgress?: (progress: SimulationProgress) => void,
  userProfile?: { state?: string; occupation?: string; annual_income?: number; category?: string } | null,
): Promise<SimulationResult> {
  onProgress?.({ stage: 'Fetching stock data...', percent: 5, message: `Loading ${request.symbol} market data` });

  // 1. Fetch real stock data
  const stock = await fetchStockBySymbol(request.symbol);
  if (!stock) {
    throw new Error(`Stock ${request.symbol} not found in Nifty 50`);
  }

  onProgress?.({ stage: 'Analyzing market conditions...', percent: 20, message: 'Processing technical indicators' });

  // 2. Try AI mode first. In the browser, the Vercel NVIDIA proxy is available
  // without a public API key.
  const hasAIBackend = typeof window !== 'undefined' || !!import.meta.env?.VITE_LLM_API_KEY;

  if (hasAIBackend) {
    onProgress?.({ stage: 'Connecting to DhanMitra AI...', percent: 30, message: 'Gemma 4 multi-agent analysis starting' });

    const aiResult = await runAISimulation(stock, request, onProgress, userProfile);
    if (aiResult) return aiResult;

    // If AI fails, fall through to local engine
    console.warn('[simulationService] AI mode failed, using smart local engine');
  }

  // 3. Smart local engine (always works)
  onProgress?.({ stage: 'Running local analysis engine...', percent: 60, message: 'Technical + scenario analysis' });

  await new Promise((r) => setTimeout(r, 800)); // Brief pause for UX

  onProgress?.({ stage: 'Generating prediction...', percent: 85, message: 'Computing price targets' });

  await new Promise((r) => setTimeout(r, 500));

  const result = runLocalSimulation(stock, request);

  onProgress?.({ stage: 'Complete', percent: 100, message: 'Simulation ready' });

  return result;
}

/**
 * Check if Full AI mode is available (API key configured)
 */
export function isAIModeAvailable(): boolean {
  return typeof window !== 'undefined' || !!import.meta.env?.VITE_LLM_API_KEY;
}

/**
 * Get the list of available scenario presets
 */
export function getScenarioPresets() {
  return Object.entries(SCENARIO_CONTEXTS).map(([id, ctx]) => ({
    id,
    title: ctx.title,
    bias: ctx.biasDirection,
  }));
}
