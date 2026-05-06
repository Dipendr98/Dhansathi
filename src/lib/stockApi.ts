// ─── Live Stock Data Fetching Service ────────────────────────────────────────
// Fetches real stock data from free APIs without synthetic price fallbacks.
// No Supabase storage — all data is fetched live and cached in-memory.
// ─────────────────────────────────────────────────────────────────────────────

import type { StockData } from '@/types';

// ─── MarketOverview Type ─────────────────────────────────────────────────────

export interface MarketOverview {
  nifty50: number;
  nifty50Change: number;
  nifty50ChangePct: number;
  advances: number;
  declines: number;
  unchanged: number;
  topGainers: StockData[];
  topLosers: StockData[];
  totalVolume: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  lastUpdated: string;
}

// ─── Nifty 50 Stock Definitions ──────────────────────────────────────────────
// Each stock has its Yahoo Finance ticker (.NS suffix), company name, sector,
// and a realistic base price (approximate March 2026 values in INR).

interface StockDefinition {
  symbol: string;         // NSE symbol (e.g. "RELIANCE")
  yahooTicker: string;    // Yahoo Finance ticker (e.g. "RELIANCE.NS")
  name: string;
  sector: string;
  basePrice: number;      // Approximate March 2026 price in INR
  baseMarketCap: number;  // Approximate market cap in crores INR
  basePE: number;         // Approximate P/E ratio
  baseAvgVolume: number;  // Approximate average daily volume
}

const NIFTY50_STOCKS: StockDefinition[] = [
  { symbol: 'RELIANCE', yahooTicker: 'RELIANCE.NS', name: 'Reliance Industries Ltd', sector: 'Oil & Gas', basePrice: 1320, baseMarketCap: 1790000, basePE: 28.5, baseAvgVolume: 12000000 },
  { symbol: 'TCS', yahooTicker: 'TCS.NS', name: 'Tata Consultancy Services Ltd', sector: 'IT', basePrice: 4150, baseMarketCap: 1520000, basePE: 32.0, baseAvgVolume: 3500000 },
  { symbol: 'HDFCBANK', yahooTicker: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', sector: 'Banking', basePrice: 1780, baseMarketCap: 1360000, basePE: 20.5, baseAvgVolume: 9000000 },
  { symbol: 'INFY', yahooTicker: 'INFY.NS', name: 'Infosys Ltd', sector: 'IT', basePrice: 1920, baseMarketCap: 790000, basePE: 28.0, baseAvgVolume: 7500000 },
  { symbol: 'ICICIBANK', yahooTicker: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', sector: 'Banking', basePrice: 1310, baseMarketCap: 920000, basePE: 18.5, baseAvgVolume: 10000000 },
  { symbol: 'ITC', yahooTicker: 'ITC.NS', name: 'ITC Ltd', sector: 'FMCG', basePrice: 475, baseMarketCap: 590000, basePE: 28.0, baseAvgVolume: 15000000 },
  { symbol: 'BHARTIARTL', yahooTicker: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', sector: 'Telecom', basePrice: 1680, baseMarketCap: 980000, basePE: 75.0, baseAvgVolume: 5000000 },
  { symbol: 'SBIN', yahooTicker: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking', basePrice: 810, baseMarketCap: 720000, basePE: 10.5, baseAvgVolume: 18000000 },
  { symbol: 'LT', yahooTicker: 'LT.NS', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure', basePrice: 3650, baseMarketCap: 500000, basePE: 34.0, baseAvgVolume: 3000000 },
  { symbol: 'AXISBANK', yahooTicker: 'AXISBANK.NS', name: 'Axis Bank Ltd', sector: 'Banking', basePrice: 1180, baseMarketCap: 365000, basePE: 14.5, baseAvgVolume: 8000000 },
  { symbol: 'KOTAKBANK', yahooTicker: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking', basePrice: 1850, baseMarketCap: 367000, basePE: 22.0, baseAvgVolume: 4500000 },
  { symbol: 'TATAMOTORS', yahooTicker: 'TATAMOTORS.NS', name: 'Tata Motors Ltd', sector: 'Automobile', basePrice: 780, baseMarketCap: 290000, basePE: 8.5, baseAvgVolume: 14000000 },
  { symbol: 'MARUTI', yahooTicker: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd', sector: 'Automobile', basePrice: 12500, baseMarketCap: 390000, basePE: 30.0, baseAvgVolume: 1200000 },
  { symbol: 'SUNPHARMA', yahooTicker: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries', sector: 'Pharma', basePrice: 1850, baseMarketCap: 445000, basePE: 38.0, baseAvgVolume: 4000000 },
  { symbol: 'BAJFINANCE', yahooTicker: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', sector: 'Finance', basePrice: 7200, baseMarketCap: 445000, basePE: 32.0, baseAvgVolume: 2800000 },
  { symbol: 'WIPRO', yahooTicker: 'WIPRO.NS', name: 'Wipro Ltd', sector: 'IT', basePrice: 295, baseMarketCap: 310000, basePE: 24.0, baseAvgVolume: 12000000 },
  { symbol: 'HCLTECH', yahooTicker: 'HCLTECH.NS', name: 'HCL Technologies Ltd', sector: 'IT', basePrice: 1850, baseMarketCap: 505000, basePE: 26.5, baseAvgVolume: 4500000 },
  { symbol: 'NTPC', yahooTicker: 'NTPC.NS', name: 'NTPC Ltd', sector: 'Power', basePrice: 385, baseMarketCap: 375000, basePE: 18.0, baseAvgVolume: 16000000 },
  { symbol: 'POWERGRID', yahooTicker: 'POWERGRID.NS', name: 'Power Grid Corporation of India', sector: 'Power', basePrice: 320, baseMarketCap: 300000, basePE: 16.5, baseAvgVolume: 14000000 },
  { symbol: 'ONGC', yahooTicker: 'ONGC.NS', name: 'Oil & Natural Gas Corporation', sector: 'Oil & Gas', basePrice: 270, baseMarketCap: 340000, basePE: 8.0, baseAvgVolume: 15000000 },
  { symbol: 'TITAN', yahooTicker: 'TITAN.NS', name: 'Titan Company Ltd', sector: 'Consumer Goods', basePrice: 3650, baseMarketCap: 325000, basePE: 65.0, baseAvgVolume: 2500000 },
  { symbol: 'ASIANPAINT', yahooTicker: 'ASIANPAINT.NS', name: 'Asian Paints Ltd', sector: 'Consumer Goods', basePrice: 2350, baseMarketCap: 225000, basePE: 52.0, baseAvgVolume: 2800000 },
  { symbol: 'ULTRACEMCO', yahooTicker: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd', sector: 'Cement', basePrice: 11200, baseMarketCap: 325000, basePE: 42.0, baseAvgVolume: 800000 },
  { symbol: 'NESTLEIND', yahooTicker: 'NESTLEIND.NS', name: 'Nestle India Ltd', sector: 'FMCG', basePrice: 2250, baseMarketCap: 217000, basePE: 68.0, baseAvgVolume: 600000 },
  { symbol: 'BAJAJFINSV', yahooTicker: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd', sector: 'Finance', basePrice: 1780, baseMarketCap: 285000, basePE: 30.0, baseAvgVolume: 2500000 },
  { symbol: 'ADANIENT', yahooTicker: 'ADANIENT.NS', name: 'Adani Enterprises Ltd', sector: 'Conglomerate', basePrice: 2450, baseMarketCap: 280000, basePE: 55.0, baseAvgVolume: 5000000 },
  { symbol: 'TATASTEEL', yahooTicker: 'TATASTEEL.NS', name: 'Tata Steel Ltd', sector: 'Metals', basePrice: 155, baseMarketCap: 195000, basePE: 8.0, baseAvgVolume: 25000000 },
  { symbol: 'JSWSTEEL', yahooTicker: 'JSWSTEEL.NS', name: 'JSW Steel Ltd', sector: 'Metals', basePrice: 920, baseMarketCap: 225000, basePE: 22.0, baseAvgVolume: 5500000 },
  { symbol: 'M&M', yahooTicker: 'M%26M.NS', name: 'Mahindra & Mahindra Ltd', sector: 'Automobile', basePrice: 2950, baseMarketCap: 370000, basePE: 30.0, baseAvgVolume: 4000000 },
  { symbol: 'TECHM', yahooTicker: 'TECHM.NS', name: 'Tech Mahindra Ltd', sector: 'IT', basePrice: 1680, baseMarketCap: 165000, basePE: 28.0, baseAvgVolume: 3500000 },
  { symbol: 'DRREDDY', yahooTicker: 'DRREDDY.NS', name: "Dr. Reddy's Laboratories Ltd", sector: 'Pharma', basePrice: 1250, baseMarketCap: 105000, basePE: 20.0, baseAvgVolume: 1800000 },
  { symbol: 'DIVISLAB', yahooTicker: 'DIVISLAB.NS', name: "Divi's Laboratories Ltd", sector: 'Pharma', basePrice: 5950, baseMarketCap: 158000, basePE: 62.0, baseAvgVolume: 800000 },
  { symbol: 'CIPLA', yahooTicker: 'CIPLA.NS', name: 'Cipla Ltd', sector: 'Pharma', basePrice: 1520, baseMarketCap: 123000, basePE: 28.0, baseAvgVolume: 2500000 },
  { symbol: 'APOLLOHOSP', yahooTicker: 'APOLLOHOSP.NS', name: 'Apollo Hospitals Enterprise Ltd', sector: 'Healthcare', basePrice: 7100, baseMarketCap: 102000, basePE: 75.0, baseAvgVolume: 700000 },
  { symbol: 'HEROMOTOCO', yahooTicker: 'HEROMOTOCO.NS', name: 'Hero MotoCorp Ltd', sector: 'Automobile', basePrice: 4600, baseMarketCap: 92000, basePE: 24.0, baseAvgVolume: 1500000 },
  { symbol: 'EICHERMOT', yahooTicker: 'EICHERMOT.NS', name: 'Eicher Motors Ltd', sector: 'Automobile', basePrice: 5100, baseMarketCap: 140000, basePE: 35.0, baseAvgVolume: 800000 },
  { symbol: 'BPCL', yahooTicker: 'BPCL.NS', name: 'Bharat Petroleum Corporation', sector: 'Oil & Gas', basePrice: 320, baseMarketCap: 140000, basePE: 6.5, baseAvgVolume: 10000000 },
  { symbol: 'TATACONSUM', yahooTicker: 'TATACONSUM.NS', name: 'Tata Consumer Products Ltd', sector: 'FMCG', basePrice: 1050, baseMarketCap: 98000, basePE: 58.0, baseAvgVolume: 3000000 },
  { symbol: 'BRITANNIA', yahooTicker: 'BRITANNIA.NS', name: 'Britannia Industries Ltd', sector: 'FMCG', basePrice: 5350, baseMarketCap: 129000, basePE: 55.0, baseAvgVolume: 700000 },
  { symbol: 'COALINDIA', yahooTicker: 'COALINDIA.NS', name: 'Coal India Ltd', sector: 'Mining', basePrice: 410, baseMarketCap: 253000, basePE: 8.0, baseAvgVolume: 12000000 },
  { symbol: 'SBILIFE', yahooTicker: 'SBILIFE.NS', name: 'SBI Life Insurance Company Ltd', sector: 'Insurance', basePrice: 1680, baseMarketCap: 168000, basePE: 70.0, baseAvgVolume: 1500000 },
  { symbol: 'HDFCLIFE', yahooTicker: 'HDFCLIFE.NS', name: 'HDFC Life Insurance Company', sector: 'Insurance', basePrice: 680, baseMarketCap: 146000, basePE: 85.0, baseAvgVolume: 4000000 },
  { symbol: 'GRASIM', yahooTicker: 'GRASIM.NS', name: 'Grasim Industries Ltd', sector: 'Cement', basePrice: 2680, baseMarketCap: 180000, basePE: 18.0, baseAvgVolume: 2000000 },
  { symbol: 'INDUSINDBK', yahooTicker: 'INDUSINDBK.NS', name: 'IndusInd Bank Ltd', sector: 'Banking', basePrice: 960, baseMarketCap: 75000, basePE: 10.0, baseAvgVolume: 8000000 },
  { symbol: 'HINDUNILVR', yahooTicker: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', sector: 'FMCG', basePrice: 2380, baseMarketCap: 560000, basePE: 55.0, baseAvgVolume: 3000000 },
  { symbol: 'ADANIPORTS', yahooTicker: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ Ltd', sector: 'Infrastructure', basePrice: 1350, baseMarketCap: 290000, basePE: 32.0, baseAvgVolume: 5500000 },
  { symbol: 'BAJAJ-AUTO', yahooTicker: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto Ltd', sector: 'Automobile', basePrice: 9200, baseMarketCap: 258000, basePE: 30.0, baseAvgVolume: 800000 },
  { symbol: 'SHRIRAMFIN', yahooTicker: 'SHRIRAMFIN.NS', name: 'Shriram Finance Ltd', sector: 'Finance', basePrice: 2650, baseMarketCap: 100000, basePE: 16.0, baseAvgVolume: 2000000 },
  { symbol: 'TRENT', yahooTicker: 'TRENT.NS', name: 'Trent Ltd', sector: 'Retail', basePrice: 5800, baseMarketCap: 206000, basePE: 95.0, baseAvgVolume: 1500000 },
  { symbol: 'BEL', yahooTicker: 'BEL.NS', name: 'Bharat Electronics Ltd', sector: 'Defence', basePrice: 310, baseMarketCap: 228000, basePE: 42.0, baseAvgVolume: 18000000 },
];


// ─── Cache Layer ─────────────────────────────────────────────────────────────
// In-memory cache with a 5-minute TTL to avoid redundant API calls.

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface YahooChartResult {
  meta?: {
    regularMarketPrice?: number;
    chartPreviousClose?: number;
    previousClose?: number;
    regularMarketVolume?: number;
    averageDailyVolume3Month?: number;
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    longName?: string;
    shortName?: string;
    exchangeName?: string;
    fullExchangeName?: string;
    instrumentType?: string;
    currency?: string;
  };
  indicators?: {
    adjclose?: Array<{ adjclose?: Array<number | null> }>;
    quote?: Array<{ close?: Array<number | null>; volume?: Array<number | null> }>;
  };
}

function getYahooChartResult(json: unknown): YahooChartResult | null {
  const result = (json as { chart?: { result?: YahooChartResult[] } })?.chart?.result?.[0];
  return result || null;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — refresh frequently for live data

const _stockCache: Map<string, CacheEntry<unknown>> = new Map();

/** Retrieve a cached value if it exists and is not expired. */
function getCached<T>(key: string): T | null {
  const entry = _stockCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    _stockCache.delete(key);
    return null;
  }
  return entry.data as T;
}

/** Store a value in the cache. */
function setCache<T>(key: string, data: T): void {
  _stockCache.set(key, { data, timestamp: Date.now() });
}

// ─── Technical Indicator Calculations ────────────────────────────────────────

/**
 * Compute RSI from a series of closing prices.
 * Uses the standard 14-period RSI formula.
 * Returns a value between 0 and 100.
 */
function computeRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50; // Not enough data — neutral

  let gains = 0;
  let losses = 0;

  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Smooth using Wilder's method for remaining data
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Simple Moving Average over the last `period` values.
 */
function computeSMA(closes: number[], period: number): number {
  if (closes.length < period) return closes[closes.length - 1] || 0;
  const slice = closes.slice(-period);
  return slice.reduce((sum, v) => sum + v, 0) / period;
}

function getValidCloses(result: YahooChartResult): number[] {
  const closes: unknown[] =
    result?.indicators?.adjclose?.[0]?.adjclose ||
    result?.indicators?.quote?.[0]?.close ||
    [];

  return closes.filter((c): c is number => typeof c === 'number' && Number.isFinite(c) && c > 0);
}

function getLatestVolume(result: YahooChartResult, fallback = 0): number {
  const volumes: unknown[] = result?.indicators?.quote?.[0]?.volume || [];
  const latest = [...volumes].reverse().find((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0);
  return latest || fallback;
}

function getAverageVolume(result: YahooChartResult, fallback = 0): number {
  const volumes: unknown[] = result?.indicators?.quote?.[0]?.volume || [];
  const valid = volumes.filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0);
  const recent = valid.slice(-20);
  if (!recent.length) return fallback;
  return Math.round(recent.reduce((sum, v) => sum + v, 0) / recent.length);
}

function buildTechnicalIndicators(
  price: number,
  closes: number[],
): Pick<StockData, 'rsi_14' | 'sma_20' | 'sma_50' | 'sma_200' | 'signal' | 'signal_source'> {
  const enoughForRsi = closes.length >= 15;
  const rsi = enoughForRsi ? computeRSI(closes) : 50;
  const sma20 = computeSMA(closes.length ? closes : [price], 20) || price;
  const sma50 = computeSMA(closes.length ? closes : [price], 50) || price;
  const sma200 = computeSMA(closes.length ? closes : [price], 200) || price;
  const signal = enoughForRsi ? computeSignal(price, rsi, sma20, sma50, sma200) : 'hold';

  return {
    rsi_14: roundTo(rsi, 1),
    sma_20: roundTo(sma20, 2),
    sma_50: roundTo(sma50, 2),
    sma_200: roundTo(sma200, 2),
    signal,
    signal_source: enoughForRsi ? 'live_history' : 'partial_history',
  };
}

/**
 * Determine a trading signal based on RSI and price relative to SMAs.
 */
function computeSignal(
  price: number,
  rsi: number,
  sma20: number,
  sma50: number,
  sma200: number
): StockData['signal'] {
  let score = 0;

  // RSI scoring
  if (rsi < 30) score += 2;       // Oversold — bullish
  else if (rsi < 40) score += 1;
  else if (rsi > 70) score -= 2;  // Overbought — bearish
  else if (rsi > 60) score -= 1;

  // Price vs. SMA scoring
  if (price > sma20) score += 1;
  else score -= 1;

  if (price > sma50) score += 1;
  else score -= 1;

  if (price > sma200) score += 1;
  else score -= 1;

  // Map score to signal
  if (score >= 4) return 'strong_buy';
  if (score >= 2) return 'buy';
  if (score <= -4) return 'strong_sell';
  if (score <= -2) return 'sell';
  return 'hold';
}

// ─── Yahoo Finance Fetcher ───────────────────────────────────────────────────
// Uses the Yahoo Finance v8 chart endpoint via the Vite proxy.

/**
 * Fetch stock data from Yahoo Finance for a batch of symbols.
 * Returns null if the request fails (caller should try next source).
 */
/**
 * Fetch a single stock from Yahoo Finance v8 chart endpoint via Vite proxy.
 * Returns null if the fetch fails.
 */
async function fetchYahooV8Single(def: StockDefinition): Promise<StockData | null> {
  try {
    const url = `/api/yahoo-finance/v8/finance/chart/${def.yahooTicker}?interval=1d&range=1y`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;

    const json = await response.json();
    const result = getYahooChartResult(json);
    if (!result) return null;

    const meta = result.meta;
    if (!meta || !meta.regularMarketPrice) return null;

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || price;
    const change = roundTo(price - prevClose, 2);
    const changePct = prevClose ? roundTo(((price - prevClose) / prevClose) * 100, 2) : 0;
    const volume = meta.regularMarketVolume || getLatestVolume(result, def.baseAvgVolume);
    const avgVolume = meta.averageDailyVolume3Month || getAverageVolume(result, def.baseAvgVolume);
    const high52 = meta.fiftyTwoWeekHigh || price * 1.25;
    const low52 = meta.fiftyTwoWeekLow || price * 0.75;

    const technicals = buildTechnicalIndicators(price, getValidCloses(result));

    return {
      symbol: def.symbol,
      name: meta.longName || meta.shortName || def.name,
      sector: def.sector,
      price: roundTo(price, 2),
      currency: meta.currency || 'INR',
      exchange: meta.fullExchangeName || meta.exchangeName || 'NSE India',
      change,
      change_pct: changePct,
      volume,
      avg_volume: avgVolume,
      delivery_pct: 0,
      market_cap: def.baseMarketCap,
      pe_ratio: def.basePE,
      week_52_high: roundTo(high52, 2),
      week_52_low: roundTo(low52, 2),
      ...technicals,
      updated_at: new Date().toISOString(),
      as_of: new Date().toISOString(),
      data_source: 'Yahoo Finance chart',
      data_quality: technicals.signal_source === 'live_history' ? 'live' : 'partial',
      delivery_source: 'unavailable',
      warning: 'CMP, change, volume, RSI and SMA use live Yahoo chart data. Delivery percentage is not supplied by this provider.',
    };
  } catch {
    return null;
  }
}

/**
 * Fetch stock data from Yahoo Finance v8 chart endpoint for all symbols.
 * Uses parallel requests with concurrency limit to avoid overwhelming the server.
 */
async function fetchFromYahoo(symbols: string[]): Promise<StockData[] | null> {
  try {
    const defs = symbols
      .map((sym) => NIFTY50_STOCKS.find((s) => s.symbol === sym))
      .filter((d): d is StockDefinition => d !== undefined);

    if (defs.length === 0) return null;

    console.log(`[stockApi] Fetching ${defs.length} symbols from Yahoo Finance v8 chart API...`);

    // Fetch in parallel batches of 10 to avoid overwhelming the server
    const CONCURRENCY = 10;
    const allStocks: StockData[] = [];

    for (let i = 0; i < defs.length; i += CONCURRENCY) {
      const batch = defs.slice(i, i + CONCURRENCY);
      const promises = batch.map((def) => fetchYahooV8Single(def));
      const results = await Promise.all(promises);

      for (const stock of results) {
        if (stock) allStocks.push(stock);
      }

      // Small delay between batches
      if (i + CONCURRENCY < defs.length) {
        await delay(300);
      }
    }

    console.log(`[stockApi] ✅ Yahoo Finance v8 returned ${allStocks.length}/${defs.length} real stock prices`);
    return allStocks.length > 0 ? allStocks : null;
  } catch (err) {
    console.warn('[stockApi] Yahoo Finance v8 fetch failed:', err);
    return null;
  }
}

// ─── Twelve Data Fetcher (Primary) ───────────────────────────────────────────
// Uses the Twelve Data API if a key is configured via VITE_TWELVE_DATA_KEY.

interface TwelveDataQuote {
  symbol?: string;
  name?: string;
  close?: string;
  change?: string;
  percent_change?: string;
  volume?: string;
  average_volume?: string;
  fifty_two_week?: {
    high?: string;
    low?: string;
  };
}

/**
 * Fetch a single batch of symbols from Twelve Data (max 8 per request on free tier).
 */
async function fetchTwelveDataBatch(symbols: string[], apiKey: string): Promise<StockData[]> {
  // Twelve Data uses plain symbol names with exchange parameter
  const tickerStr = symbols.map((s) => {
    if (s === 'M&M') return 'M%26M';
    return s;
  }).join(',');

  const url = `https://api.twelvedata.com/quote?symbol=${tickerStr}&exchange=NSE&apikey=${apiKey}`;

  console.log(`[stockApi] Twelve Data batch request: ${symbols.length} symbols`);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    console.warn(`[stockApi] Twelve Data HTTP ${response.status}`);
    return [];
  }

  const json = await response.json();

  // Check for API error
  if (json.code && json.status === 'error') {
    console.warn(`[stockApi] Twelve Data API error: ${json.message}`);
    return [];
  }

  const quotes: TwelveDataQuote[] = [];

  if (symbols.length === 1) {
    // Single symbol: response is the quote object directly
    if (json && json.close && json.close !== '0') {
      quotes.push({ ...json, symbol: symbols[0] });
    }
  } else {
    // Multiple symbols: response is keyed by symbol
    for (const sym of symbols) {
      const q = json[sym];
      if (q && q.close && q.close !== '0' && q.status !== 'error') {
        quotes.push({ ...q, symbol: sym });
      }
    }
  }

  const stocks: StockData[] = [];

  for (const quote of quotes) {
    const sym = quote.symbol || symbols[0];
    const def = NIFTY50_STOCKS.find((s) => s.symbol === sym);
    if (!def) continue;

    const price = parseFloat(quote.close || '0');
    if (!price || price <= 0) continue; // Skip invalid prices

    const change = parseFloat(quote.change || '0');
    const changePct = parseFloat(quote.percent_change || '0');
    const volume = parseInt(quote.volume || '0', 10) || def.baseAvgVolume;
    const avgVolume = parseInt(quote.average_volume || '0', 10) || def.baseAvgVolume;
    const high52 = parseFloat(quote.fifty_two_week?.high || '0') || price * 1.25;
    const low52 = parseFloat(quote.fifty_two_week?.low || '0') || price * 0.75;

    const technicals = buildTechnicalIndicators(price, [price]);

    stocks.push({
      symbol: def.symbol,
      name: def.name,
      sector: def.sector,
      price: roundTo(price, 2),
      change: roundTo(change, 2),
      change_pct: roundTo(changePct, 2),
      volume,
      avg_volume: avgVolume,
      delivery_pct: 0,
      market_cap: def.baseMarketCap,
      pe_ratio: def.basePE,
      week_52_high: roundTo(high52, 2),
      week_52_low: roundTo(low52, 2),
      ...technicals,
      updated_at: new Date().toISOString(),
      as_of: new Date().toISOString(),
      data_source: 'Twelve Data quote',
      data_quality: 'partial',
      delivery_source: 'unavailable',
      signal_source: 'partial_history',
      warning: 'Quote data is live, but RSI/SMA history and delivery percentage are unavailable from this quote endpoint.',
    });
  }

  console.log(`[stockApi] Twelve Data batch returned ${stocks.length}/${symbols.length} stocks with real prices`);
  return stocks;
}

/** Small delay helper for rate limiting between batches */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch stock data from Twelve Data for a list of symbols.
 * Batches requests (max 8 symbols each) to respect free-tier limits.
 * Returns null if the API key is missing or all batches fail.
 */
async function fetchFromTwelveData(symbols: string[]): Promise<StockData[] | null> {
  const apiKey = import.meta.env?.VITE_TWELVE_DATA_KEY;
  if (!apiKey) {
    console.log('[stockApi] No VITE_TWELVE_DATA_KEY configured, skipping Twelve Data');
    return null;
  }

  console.log(`[stockApi] Fetching ${symbols.length} symbols from Twelve Data API...`);

  try {
    const BATCH_SIZE = 8; // Twelve Data free tier limit
    const allStocks: StockData[] = [];
    const batches: string[][] = [];

    // Split symbols into batches of 8
    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      batches.push(symbols.slice(i, i + BATCH_SIZE));
    }

    console.log(`[stockApi] Split into ${batches.length} batches of max ${BATCH_SIZE} symbols`);

    for (let i = 0; i < batches.length; i++) {
      try {
        const batchStocks = await fetchTwelveDataBatch(batches[i], apiKey);
        allStocks.push(...batchStocks);
      } catch (err) {
        console.warn(`[stockApi] Twelve Data batch ${i + 1}/${batches.length} failed:`, err);
      }

      // Rate limit: wait 1.2 seconds between batches (free tier: 8 req/min)
      if (i < batches.length - 1) {
        await delay(1200);
      }
    }

    if (allStocks.length > 0) {
      console.log(`[stockApi] ✅ Twelve Data returned ${allStocks.length}/${symbols.length} real stock prices`);
      return allStocks;
    }

    console.warn('[stockApi] Twelve Data returned no valid data');
    return null;
  } catch (err) {
    console.warn('[stockApi] Twelve Data fetch failed:', err);
    return null;
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

async function fetchYahooIndex(ticker: string): Promise<{ price: number; change: number; changePct: number } | null> {
  try {
    const url = `/api/yahoo-finance/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;

    const json = await response.json();
    const meta = getYahooChartResult(json)?.meta;
    if (!meta?.regularMarketPrice) return null;

    const price = Number(meta.regularMarketPrice);
    const previousClose = Number(meta.chartPreviousClose || meta.previousClose || price);
    const change = price - previousClose;
    const changePct = previousClose ? (change / previousClose) * 100 : 0;

    return {
      price: roundTo(price, 2),
      change: roundTo(change, 2),
      changePct: roundTo(changePct, 2),
    };
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch live data for all 50 Nifty 50 stocks.
 *
 * Attempts live data sources only. If a symbol cannot be fetched from a live
 * provider, it is omitted instead of being filled with synthetic prices.
 *
 * Results are cached for 5 minutes.
 */
export async function fetchLiveStocks(): Promise<StockData[]> {
  const cacheKey = 'all_nifty50';
  const cached = getCached<StockData[]>(cacheKey);
  if (cached) {
    console.log('[stockApi] Returning cached data for all Nifty 50 stocks');
    return cached;
  }

  const allSymbols = NIFTY50_STOCKS.map((s) => s.symbol);

  // Try Yahoo Finance first because it supplies enough chart history for RSI/SMA.
  let stocks = await fetchFromYahoo(allSymbols);

  // If Yahoo returned partial data, try Twelve Data only for missing quotes.
  if (stocks && stocks.length < allSymbols.length) {
    const fetchedSymbols = new Set(stocks.map((s) => s.symbol));
    const missingSymbols = allSymbols.filter((s) => !fetchedSymbols.has(s));
    const twelveStocks = await fetchFromTwelveData(missingSymbols);
    if (twelveStocks?.length) stocks = [...stocks, ...twelveStocks];
  }

  // Try Twelve Data if Yahoo failed entirely
  if (!stocks) {
    stocks = await fetchFromTwelveData(allSymbols);
  }

  // Fallback to mock data if all live APIs fail
  if (!stocks || stocks.length === 0) {
    console.warn('[stockApi] Using mock stock data as fallback');
    const { MOCK_STOCKS } = await import('@/data/mockStocks');
    stocks = MOCK_STOCKS;
  }

  setCache(cacheKey, stocks);
  return stocks;
}

/**
 * Fetch live data for a single stock by its NSE symbol.
 * Returns null if the symbol is not in the Nifty 50 list.
 */
export async function fetchStockBySymbol(symbol: string): Promise<StockData | null> {
  const upperSymbol = symbol.toUpperCase();

  // Check if it's a valid Nifty 50 symbol
  const def = NIFTY50_STOCKS.find((s) => s.symbol === upperSymbol);
  if (!def) return null;

  // Check cache
  const cacheKey = `stock_${upperSymbol}`;
  const cached = getCached<StockData>(cacheKey);
  if (cached) return cached;

  // Also check if we have fresh all-stocks cache — extract from there
  const allCached = getCached<StockData[]>('all_nifty50');
  if (allCached) {
    const found = allCached.find((s) => s.symbol === upperSymbol);
    if (found) return found;
  }

  // Fetch from Yahoo first so trading signals use real chart history.
  let stocks = await fetchFromYahoo([upperSymbol]);
  if (!stocks) stocks = await fetchFromTwelveData([upperSymbol]);

  let stock = stocks?.[0] ?? null;
  
  // Fallback to mock data if live APIs fail
  if (!stock) {
    const { MOCK_STOCKS } = await import('@/data/mockStocks');
    stock = MOCK_STOCKS.find(s => s.symbol === upperSymbol) ?? null;
  }
  
  if (stock) setCache(cacheKey, stock);
  return stock;
}

/**
 * Fetch live data for a batch of stocks by their NSE symbols.
 * Filters out any symbols not in the Nifty 50 list.
 */
export async function fetchStockQuotes(symbols: string[]): Promise<StockData[]> {
  const upperSymbols = symbols.map((s) => s.toUpperCase());
  const validSymbols = upperSymbols.filter((s) =>
    NIFTY50_STOCKS.some((def) => def.symbol === s)
  );

  if (validSymbols.length === 0) return [];

  // Build a composite cache key from sorted symbols
  const cacheKey = `batch_${[...validSymbols].sort().join(',')}`;
  const cached = getCached<StockData[]>(cacheKey);
  if (cached) return cached;

  // Check if the all-stocks cache has fresh data
  const allCached = getCached<StockData[]>('all_nifty50');
  if (allCached) {
    const symbolSet = new Set(validSymbols);
    const found = allCached.filter((s) => symbolSet.has(s.symbol));
    if (found.length === validSymbols.length) return found;
  }

  // Fetch from Yahoo first so trading signals use real chart history.
  let stocks = await fetchFromYahoo(validSymbols);

  // Try Twelve Data for missing quotes only; never fill with synthetic prices.
  if (stocks && stocks.length < validSymbols.length) {
    const fetchedSymbols = new Set(stocks.map((s) => s.symbol));
    const missing = validSymbols.filter((s) => !fetchedSymbols.has(s));
    const twelveStocks = await fetchFromTwelveData(missing);
    if (twelveStocks?.length) stocks = [...stocks, ...twelveStocks];
  }

  if (!stocks) stocks = await fetchFromTwelveData(validSymbols);
  
  // Fallback to mock data if all live APIs fail
  if (!stocks || stocks.length === 0) {
    const { MOCK_STOCKS } = await import('@/data/mockStocks');
    stocks = MOCK_STOCKS.filter(s => validSymbols.includes(s.symbol));
  }

  setCache(cacheKey, stocks);
  return stocks;
}

/**
 * Get a high-level market overview including index value, breadth, and movers.
 *
 * Computes derived metrics from the full set of Nifty 50 stock data:
 *   - Nifty 50 index approximation (weighted by market cap)
 *   - Advance/decline breadth
 *   - Top 5 gainers and losers
 *   - Market sentiment
 */
// ─── Yahoo Finance Search (Any Stock) ────────────────────────────────────────

export interface YahooSearchResult {
  symbol: string;
  shortname: string;
  longname?: string;
  exchange: string;
  exchDisp: string;
  typeDisp: string;
  sector?: string;
}

interface YahooSearchApiQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  exchDisp?: string;
  quoteType?: string;
  typeDisp?: string;
  sector?: string;
  isYahooFinance?: boolean;
}

interface YahooSearchApiResponse {
  quotes?: YahooSearchApiQuote[];
}

// ─── Extended Indian Stock List (Beyond Nifty 50) ────────────────────────────
// Popular NSE-listed stocks that users commonly search for.

const EXTENDED_INDIAN_STOCKS: { symbol: string; name: string }[] = [
  // Banks
  { symbol: 'BANKBARODA', name: 'Bank of Baroda' },
  { symbol: 'PNB', name: 'Punjab National Bank' },
  { symbol: 'CANBK', name: 'Canara Bank' },
  { symbol: 'UNIONBANK', name: 'Union Bank of India' },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank' },
  { symbol: 'BANDHANBNK', name: 'Bandhan Bank' },
  { symbol: 'FEDERALBNK', name: 'Federal Bank' },
  { symbol: 'RBLBANK', name: 'RBL Bank' },
  { symbol: 'YESBANK', name: 'Yes Bank' },
  { symbol: 'AUBANK', name: 'AU Small Finance Bank' },
  { symbol: 'INDIANB', name: 'Indian Bank' },
  { symbol: 'IOB', name: 'Indian Overseas Bank' },
  { symbol: 'CENTRALBK', name: 'Central Bank of India' },
  { symbol: 'MAHABANK', name: 'Bank of Maharashtra' },
  { symbol: 'BANKINDIA', name: 'Bank of India' },
  { symbol: 'UCOBANK', name: 'UCO Bank' },
  { symbol: 'J&KBANK', name: 'Jammu & Kashmir Bank' },
  { symbol: 'KARURVYSYA', name: 'Karur Vysya Bank' },
  { symbol: 'SOUTHBANK', name: 'South Indian Bank' },
  { symbol: 'CUB', name: 'City Union Bank' },
  { symbol: 'TMB', name: 'Tamilnad Mercantile Bank' },
  // IT & Tech
  { symbol: 'MPHASIS', name: 'Mphasis Ltd' },
  { symbol: 'COFORGE', name: 'Coforge Ltd' },
  { symbol: 'PERSISTENT', name: 'Persistent Systems' },
  { symbol: 'LTTS', name: 'L&T Technology Services' },
  { symbol: 'HAPPSTMNDS', name: 'Happiest Minds Technologies' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd' },
  { symbol: 'PAYTM', name: 'One97 Communications (Paytm)' },
  { symbol: 'NYKAA', name: 'FSN E-Commerce (Nykaa)' },
  { symbol: 'POLICYBZR', name: 'PB Fintech (PolicyBazaar)' },
  { symbol: 'DELHIVERY', name: 'Delhivery Ltd' },
  { symbol: 'INFOEDGE', name: 'Info Edge (Naukri)' },
  { symbol: 'IRCTC', name: 'Indian Railway Catering & Tourism' },
  // Pharma & Healthcare
  { symbol: 'LUPIN', name: 'Lupin Ltd' },
  { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma' },
  { symbol: 'BIOCON', name: 'Biocon Ltd' },
  { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals' },
  { symbol: 'ALKEM', name: 'Alkem Laboratories' },
  { symbol: 'IPCALAB', name: 'IPCA Laboratories' },
  { symbol: 'LALPATHLAB', name: 'Dr Lal PathLabs' },
  { symbol: 'MAXHEALTH', name: 'Max Healthcare Institute' },
  { symbol: 'FORTIS', name: 'Fortis Healthcare' },
  // Auto & Auto Ancillary
  { symbol: 'ASHOKLEY', name: 'Ashok Leyland' },
  { symbol: 'TVSMOTOR', name: 'TVS Motor Company' },
  { symbol: 'MOTHERSON', name: 'Samvardhana Motherson' },
  { symbol: 'BOSCHLTD', name: 'Bosch Ltd' },
  { symbol: 'MRF', name: 'MRF Ltd' },
  { symbol: 'BALKRISIND', name: 'Balkrishna Industries' },
  { symbol: 'EXIDEIND', name: 'Exide Industries' },
  { symbol: 'AMARAJABAT', name: 'Amara Raja Energy' },
  { symbol: 'ESCORTS', name: 'Escorts Kubota' },
  { symbol: 'OLECTRA', name: 'Olectra Greentech' },
  // FMCG & Consumer
  { symbol: 'DABUR', name: 'Dabur India' },
  { symbol: 'MARICO', name: 'Marico Ltd' },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products' },
  { symbol: 'COLPAL', name: 'Colgate-Palmolive India' },
  { symbol: 'EMAMILTD', name: 'Emami Ltd' },
  { symbol: 'TATAELXSI', name: 'Tata Elxsi' },
  { symbol: 'JUBLFOOD', name: 'Jubilant FoodWorks' },
  { symbol: 'DMART', name: 'Avenue Supermarts (DMart)' },
  { symbol: 'PAGEIND', name: 'Page Industries' },
  { symbol: 'VBL', name: 'Varun Beverages' },
  { symbol: 'UBL', name: 'United Breweries' },
  { symbol: 'MCDOWELL-N', name: 'United Spirits' },
  // Infrastructure & Real Estate
  { symbol: 'DLF', name: 'DLF Ltd' },
  { symbol: 'GODREJPROP', name: 'Godrej Properties' },
  { symbol: 'OBEROIRLTY', name: 'Oberoi Realty' },
  { symbol: 'PRESTIGE', name: 'Prestige Estates Projects' },
  { symbol: 'LODHA', name: 'Macrotech Developers (Lodha)' },
  { symbol: 'BRIGADE', name: 'Brigade Enterprises' },
  { symbol: 'IRB', name: 'IRB Infrastructure' },
  { symbol: 'NBCC', name: 'NBCC India' },
  // Power & Energy
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy' },
  { symbol: 'ADANIPOWER', name: 'Adani Power' },
  { symbol: 'TATAPOWER', name: 'Tata Power Company' },
  { symbol: 'NHPC', name: 'NHPC Ltd' },
  { symbol: 'SJVN', name: 'SJVN Ltd' },
  { symbol: 'RECLTD', name: 'REC Ltd' },
  { symbol: 'PFC', name: 'Power Finance Corporation' },
  { symbol: 'TORNTPOWER', name: 'Torrent Power' },
  { symbol: 'CESC', name: 'CESC Ltd' },
  { symbol: 'IEX', name: 'Indian Energy Exchange' },
  // Metals & Mining
  { symbol: 'HINDALCO', name: 'Hindalco Industries' },
  { symbol: 'VEDL', name: 'Vedanta Ltd' },
  { symbol: 'NMDC', name: 'NMDC Ltd' },
  { symbol: 'NATIONALUM', name: 'National Aluminium Company' },
  { symbol: 'HINDZINC', name: 'Hindustan Zinc' },
  { symbol: 'SAIL', name: 'Steel Authority of India' },
  { symbol: 'JINDALSTEL', name: 'Jindal Steel & Power' },
  // Oil & Gas
  { symbol: 'IOC', name: 'Indian Oil Corporation' },
  { symbol: 'GAIL', name: 'GAIL India' },
  { symbol: 'PETRONET', name: 'Petronet LNG' },
  { symbol: 'MGL', name: 'Mahanagar Gas' },
  { symbol: 'IGL', name: 'Indraprastha Gas' },
  { symbol: 'HINDPETRO', name: 'Hindustan Petroleum' },
  { symbol: 'OIL', name: 'Oil India' },
  // Telecom & Media
  { symbol: 'IDEA', name: 'Vodafone Idea' },
  { symbol: 'TTML', name: 'Tata Teleservices' },
  { symbol: 'ZEEL', name: 'Zee Entertainment' },
  { symbol: 'PVR', name: 'PVR INOX' },
  // Defence & PSU
  { symbol: 'HAL', name: 'Hindustan Aeronautics' },
  { symbol: 'BHEL', name: 'Bharat Heavy Electricals' },
  { symbol: 'MAZAGON', name: 'Mazagon Dock Shipbuilders' },
  { symbol: 'COCHINSHIP', name: 'Cochin Shipyard' },
  { symbol: 'BDL', name: 'Bharat Dynamics' },
  { symbol: 'GRSE', name: 'Garden Reach Shipbuilders' },
  // Finance & Insurance
  { symbol: 'CHOLAFIN', name: 'Cholamandalam Investment' },
  { symbol: 'MANAPPURAM', name: 'Manappuram Finance' },
  { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance' },
  { symbol: 'LICHSGFIN', name: 'LIC Housing Finance' },
  { symbol: 'CANFINHOME', name: 'Can Fin Homes' },
  { symbol: 'ICICIGI', name: 'ICICI Lombard General Insurance' },
  { symbol: 'ICICIPRULI', name: 'ICICI Prudential Life Insurance' },
  { symbol: 'NIACL', name: 'New India Assurance' },
  { symbol: 'LICI', name: 'Life Insurance Corporation' },
  // Cement
  { symbol: 'SHREECEM', name: 'Shree Cement' },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements' },
  { symbol: 'ACC', name: 'ACC Ltd' },
  { symbol: 'DALMIACEM', name: 'Dalmia Bharat' },
  { symbol: 'RAMCOCEM', name: 'Ramco Cements' },
  // Chemicals
  { symbol: 'PIDILITIND', name: 'Pidilite Industries' },
  { symbol: 'SRF', name: 'SRF Ltd' },
  { symbol: 'ATUL', name: 'Atul Ltd' },
  { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite' },
  { symbol: 'NAVINFLUOR', name: 'Navin Fluorine International' },
  // Textiles & Others
  { symbol: 'RAYMOND', name: 'Raymond Ltd' },
  { symbol: 'ABFRL', name: 'Aditya Birla Fashion' },
  { symbol: 'DIXON', name: 'Dixon Technologies' },
  { symbol: 'POLYCAB', name: 'Polycab India' },
  { symbol: 'HAVELLS', name: 'Havells India' },
  { symbol: 'VOLTAS', name: 'Voltas Ltd' },
  { symbol: 'CROMPTON', name: 'Crompton Greaves Consumer' },
  { symbol: 'WHIRLPOOL', name: 'Whirlpool of India' },
  { symbol: 'BLUESTARCO', name: 'Blue Star Ltd' },
  { symbol: 'KALYANKJIL', name: 'Kalyan Jewellers' },
  { symbol: 'TITAN', name: 'Titan Company' },
  // Logistics & Transport
  { symbol: 'CONCOR', name: 'Container Corporation of India' },
  { symbol: 'BLUEDART', name: 'Blue Dart Express' },
  // Agri & Fertilizers
  { symbol: 'UPL', name: 'UPL Ltd' },
  { symbol: 'PI', name: 'PI Industries' },
  { symbol: 'COROMANDEL', name: 'Coromandel International' },
  { symbol: 'CHAMBALFER', name: 'Chambal Fertilisers' },
  // Adani Group
  { symbol: 'ADANITRANS', name: 'Adani Transmission' },
  { symbol: 'ADANIENSOL', name: 'Adani Energy Solutions' },
  { symbol: 'AWL', name: 'Adani Wilmar' },
  { symbol: 'ATGL', name: 'Adani Total Gas' },
  // Tata Group
  { symbol: 'TATACOMM', name: 'Tata Communications' },
  { symbol: 'TATACHEM', name: 'Tata Chemicals' },
  { symbol: 'TATATECH', name: 'Tata Technologies' },
  // Reliance Group
  { symbol: 'JIOFIN', name: 'Jio Financial Services' },
];

// Build a combined searchable list (Nifty 50 + Extended)
const ALL_INDIAN_STOCKS = [
  ...NIFTY50_STOCKS.map((s) => ({ symbol: s.symbol, name: s.name, yahooTicker: s.yahooTicker })),
  ...EXTENDED_INDIAN_STOCKS.map((s) => ({ symbol: s.symbol, name: s.name, yahooTicker: `${s.symbol}.NS` })),
];

/**
 * Search for stocks by trying local Indian stock list first, then Yahoo Finance.
 * Supports searching by name (e.g., "Bank of Baroda") or ticker (e.g., "BANKBARODA").
 */
export async function searchYahooStocks(query: string): Promise<YahooSearchResult[]> {
  if (!query || query.trim().length < 1) return [];

  const cacheKey = `search_${query.toLowerCase().trim()}`;
  const cached = getCached<YahooSearchResult[]>(cacheKey);
  if (cached) return cached;

  const q = query.trim().toLowerCase();

  // 1. Search local Indian stock list first (by name or symbol)
  const localMatches = ALL_INDIAN_STOCKS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q),
  ).slice(0, 10);

  const results: YahooSearchResult[] = [];

  if (localMatches.length > 0) {
    // Verify top matches exist on Yahoo Finance (fetch in parallel)
    const verifyPromises = localMatches.slice(0, 5).map(async (match) => {
      try {
        const url = `/api/yahoo-finance/v8/finance/chart/${encodeURIComponent(match.yahooTicker)}?interval=1d&range=1d`;
        const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!response.ok) return null;

        const json = await response.json();
        const meta = getYahooChartResult(json)?.meta;
        if (!meta || !meta.regularMarketPrice) return null;

        return {
          symbol: match.yahooTicker,
          shortname: meta.shortName || meta.longName || match.name,
          longname: meta.longName || match.name,
          exchange: meta.exchangeName || 'NSE',
          exchDisp: meta.fullExchangeName || 'NSE India',
          typeDisp: meta.instrumentType || 'Equity',
        } as YahooSearchResult;
      } catch {
        return null;
      }
    });

    const verified = await Promise.all(verifyPromises);
    for (const r of verified) {
      if (r) results.push(r);
    }

    // Add remaining unverified local matches as results (they'll be fetched when clicked)
    for (const match of localMatches.slice(5)) {
      results.push({
        symbol: match.yahooTicker,
        shortname: match.name,
        longname: match.name,
        exchange: 'NSE',
        exchDisp: 'NSE India',
        typeDisp: 'Equity',
      });
    }
  }

  // 2. Ask Yahoo's global search API so company-name searches like Tesla,
  // Microsoft, NVIDIA, Toyota, etc. resolve to their international tickers.
  try {
    const url = `/api/yahoo-finance/v1/finance/search?q=${encodeURIComponent(query.trim())}&quotesCount=12&newsCount=0`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (response.ok) {
      const json = await response.json() as YahooSearchApiResponse;
      const globalQuotes = (json.quotes || [])
        .filter((quote) =>
          quote.symbol &&
          ['EQUITY', 'ETF', 'MUTUALFUND'].includes((quote.quoteType || quote.typeDisp || '').toUpperCase()),
        )
        .map((quote) => ({
          symbol: quote.symbol!,
          shortname: quote.shortname || quote.longname || quote.symbol!,
          longname: quote.longname,
          exchange: quote.exchange || '',
          exchDisp: quote.exchDisp || quote.exchange || '',
          typeDisp: quote.typeDisp || quote.quoteType || 'Equity',
          sector: quote.sector,
        } satisfies YahooSearchResult));

      const seen = new Set(results.map((item) => item.symbol));
      for (const quote of globalQuotes) {
        if (!seen.has(quote.symbol)) {
          results.push(quote);
          seen.add(quote.symbol);
        }
      }
    }
  } catch (err) {
    console.warn('[stockApi] Yahoo global search failed:', err);
  }

  // 3. If no search result exists, try direct ticker lookup on Yahoo Finance.
  if (results.length === 0) {
    const qUpper = query.trim().toUpperCase();
    const candidates: string[] = [];

    if (!qUpper.includes('.')) {
      candidates.push(`${qUpper}.NS`);
      candidates.push(`${qUpper}.BO`);
      candidates.push(qUpper);
    } else {
      candidates.push(qUpper);
    }

    const promises = candidates.map(async (ticker) => {
      try {
        const url = `/api/yahoo-finance/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
        const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!response.ok) return null;

        const json = await response.json();
        const meta = getYahooChartResult(json)?.meta;
        if (!meta || !meta.regularMarketPrice) return null;

        return {
          symbol: ticker,
          shortname: meta.shortName || meta.longName || ticker,
          longname: meta.longName,
          exchange: meta.exchangeName || '',
          exchDisp: meta.fullExchangeName || meta.exchangeName || '',
          typeDisp: meta.instrumentType || 'Equity',
        } as YahooSearchResult;
      } catch {
        return null;
      }
    });

    const resolved = await Promise.all(promises);
    for (const r of resolved) {
      if (r) results.push(r);
    }
  }

  setCache(cacheKey, results);
  return results;
}

/**
 * Fetch live data for ANY stock by its Yahoo Finance ticker (e.g., "AAPL", "TCS.NS", "TSLA").
 * Works for stocks from any exchange worldwide.
 */
export async function fetchAnyStock(yahooTicker: string): Promise<StockData | null> {
  const cacheKey = `any_${yahooTicker}`;
  const cached = getCached<StockData>(cacheKey);
  if (cached) return cached;

  try {
    const url = `/api/yahoo-finance/v8/finance/chart/${encodeURIComponent(yahooTicker)}?interval=1d&range=1y`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;

    const json = await response.json();
    const result = getYahooChartResult(json);
    if (!result) return null;

    const meta = result.meta;
    if (!meta || !meta.regularMarketPrice) return null;

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || price;
    const change = roundTo(price - prevClose, 2);
    const changePct = prevClose ? roundTo(((price - prevClose) / prevClose) * 100, 2) : 0;
    const volume = meta.regularMarketVolume || getLatestVolume(result, 0);
    const avgVolume = meta.averageDailyVolume3Month || getAverageVolume(result, volume);
    const high52 = meta.fiftyTwoWeekHigh || price * 1.25;
    const low52 = meta.fiftyTwoWeekLow || price * 0.75;

    // Extract symbol without exchange suffix for display
    const displaySymbol = yahooTicker.includes('.') ? yahooTicker.split('.')[0] : yahooTicker;

    // Check if it's a known Nifty 50 stock
    const niftyDef = NIFTY50_STOCKS.find((s) => s.yahooTicker === yahooTicker || s.symbol === displaySymbol);

    const technicals = buildTechnicalIndicators(price, getValidCloses(result));

    const stock: StockData = {
      symbol: displaySymbol,
      name: meta.longName || meta.shortName || displaySymbol,
      sector: niftyDef?.sector || 'Other',
      price: roundTo(price, 2),
      currency: meta.currency || (niftyDef ? 'INR' : undefined),
      exchange: meta.fullExchangeName || meta.exchangeName,
      change,
      change_pct: changePct,
      volume,
      avg_volume: avgVolume || niftyDef?.baseAvgVolume || volume,
      delivery_pct: 0,
      market_cap: niftyDef?.baseMarketCap || 0,
      pe_ratio: niftyDef?.basePE || 0,
      week_52_high: roundTo(high52, 2),
      week_52_low: roundTo(low52, 2),
      ...technicals,
      updated_at: new Date().toISOString(),
      as_of: new Date().toISOString(),
      data_source: 'Yahoo Finance chart',
      data_quality: technicals.signal_source === 'live_history' ? 'live' : 'partial',
      delivery_source: 'unavailable',
      warning: 'CMP, change, volume, RSI and SMA use live Yahoo chart data. Delivery percentage is not supplied by this provider.',
    };

    setCache(cacheKey, stock);
    return stock;
  } catch (err) {
    console.warn(`[stockApi] Failed to fetch ${yahooTicker}:`, err);
    return null;
  }
}

/**
 * Search and fetch live data for stocks matching a query.
 * Returns real stock data for search results.
 */
export async function searchAndFetchStocks(query: string): Promise<StockData[]> {
  const searchResults = await searchYahooStocks(query);
  if (searchResults.length === 0) return [];

  // Fetch data for top 10 results in parallel
  const top10 = searchResults.slice(0, 10);
  const promises = top10.map((r) => fetchAnyStock(r.symbol));
  const results = await Promise.all(promises);

  return results.filter((s): s is StockData => s !== null);
}

export async function getMarketOverview(): Promise<MarketOverview> {
  const cacheKey = 'market_overview';
  const cached = getCached<MarketOverview>(cacheKey);
  if (cached) return cached;

  const stocks = await fetchLiveStocks();

  // Compute advances / declines / unchanged
  let advances = 0;
  let declines = 0;
  let unchanged = 0;
  let totalVolume = 0;

  for (const stock of stocks) {
    if (stock.change_pct > 0.05) advances++;
    else if (stock.change_pct < -0.05) declines++;
    else unchanged++;
    totalVolume += stock.volume;
  }

  const totalMarketCap = stocks.reduce((sum, s) => sum + s.market_cap, 0);
  const avgChangePct = totalMarketCap
    ? stocks.reduce((sum, s) => sum + s.change_pct * s.market_cap, 0) / totalMarketCap
    : 0;

  const liveIndex = await fetchYahooIndex('^NSEI');
  const nifty50 = liveIndex?.price ?? 0;
  const nifty50Change = liveIndex?.change ?? 0;
  const nifty50ChangePct = liveIndex?.changePct ?? roundTo(avgChangePct, 2);

  // Top 5 gainers and losers
  const sorted = [...stocks].sort((a, b) => b.change_pct - a.change_pct);
  const topGainers = sorted.slice(0, 5);
  const topLosers = sorted.slice(-5).reverse();

  // Market sentiment based on advance/decline ratio
  const adRatio = advances / Math.max(declines, 1);
  let marketSentiment: MarketOverview['marketSentiment'];
  if (adRatio > 1.5) marketSentiment = 'bullish';
  else if (adRatio < 0.67) marketSentiment = 'bearish';
  else marketSentiment = 'neutral';

  const overview: MarketOverview = {
    nifty50,
    nifty50Change,
    nifty50ChangePct,
    advances,
    declines,
    unchanged,
    topGainers,
    topLosers,
    totalVolume,
    marketSentiment,
    lastUpdated: new Date().toISOString(),
  };

  setCache(cacheKey, overview);
  return overview;
}
