import type { StockData, StockSignal } from '@/types';

function signal(rsi: number, changePct: number): StockSignal {
  if (rsi < 30) return 'strong_buy';
  if (rsi < 40 && changePct > 0) return 'buy';
  if (rsi > 70) return 'strong_sell';
  if (rsi > 60 && changePct < 0) return 'sell';
  return 'hold';
}

export const MOCK_STOCKS: StockData[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Conglomerate', price: 2942.50, change: 36.10, change_pct: 1.24, volume: 4200000, avg_volume: 3800000, delivery_pct: 54.2, market_cap: 1990000000000, pe_ratio: 28.5, week_52_high: 3024.90, week_52_low: 2220.30, rsi_14: 62, sma_20: 2880, sma_50: 2810, sma_200: 2650, signal: 'buy', updated_at: new Date().toISOString() },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', price: 3982.90, change: 4.78, change_pct: 0.12, volume: 1500000, avg_volume: 1800000, delivery_pct: 58.9, market_cap: 1450000000000, pe_ratio: 32.1, week_52_high: 4250.00, week_52_low: 3310.00, rsi_14: 52, sma_20: 3960, sma_50: 3900, sma_200: 3750, signal: 'hold', updated_at: new Date().toISOString() },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Banking', price: 1442.20, change: -30.89, change_pct: -2.10, volume: 8400000, avg_volume: 7200000, delivery_pct: 38.2, market_cap: 1100000000000, pe_ratio: 18.9, week_52_high: 1794.00, week_52_low: 1363.55, rsi_14: 28, sma_20: 1510, sma_50: 1550, sma_200: 1580, signal: 'strong_buy', updated_at: new Date().toISOString() },
  { symbol: 'INFY', name: 'Infosys Limited', sector: 'IT', price: 1532.00, change: -6.90, change_pct: -0.45, volume: 2100000, avg_volume: 2500000, delivery_pct: 42.5, market_cap: 636000000000, pe_ratio: 27.3, week_52_high: 1960.00, week_52_low: 1355.00, rsi_14: 48, sma_20: 1545, sma_50: 1580, sma_200: 1520, signal: 'hold', updated_at: new Date().toISOString() },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', sector: 'Banking', price: 1092.40, change: 10.28, change_pct: 0.95, volume: 6100000, avg_volume: 5500000, delivery_pct: 51.8, market_cap: 766000000000, pe_ratio: 17.2, week_52_high: 1310.00, week_52_low: 895.15, rsi_14: 59, sma_20: 1075, sma_50: 1050, sma_200: 980, signal: 'buy', updated_at: new Date().toISOString() },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', sector: 'Auto', price: 984.15, change: 32.55, change_pct: 3.42, volume: 12800000, avg_volume: 9500000, delivery_pct: 61.0, market_cap: 362000000000, pe_ratio: 8.2, week_52_high: 1063.00, week_52_low: 597.50, rsi_14: 74, sma_20: 940, sma_50: 880, sma_200: 790, signal: 'buy', updated_at: new Date().toISOString() },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', sector: 'Finance', price: 6840.00, change: -98.35, change_pct: -1.42, volume: 900000, avg_volume: 1100000, delivery_pct: 44.1, market_cap: 424000000000, pe_ratio: 30.5, week_52_high: 8190.00, week_52_low: 6187.80, rsi_14: 41, sma_20: 6920, sma_50: 7050, sma_200: 7200, signal: 'sell', updated_at: new Date().toISOString() },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', sector: 'Conglomerate', price: 3214.55, change: 90.08, change_pct: 2.88, volume: 3700000, avg_volume: 3200000, delivery_pct: 29.4, market_cap: 368000000000, pe_ratio: 70.2, week_52_high: 3590.00, week_52_low: 2142.00, rsi_14: 68, sma_20: 3100, sma_50: 2950, sma_200: 2800, signal: 'buy', updated_at: new Date().toISOString() },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', price: 628.30, change: 8.45, change_pct: 1.36, volume: 15200000, avg_volume: 13000000, delivery_pct: 39.8, market_cap: 560000000000, pe_ratio: 10.1, week_52_high: 729.80, week_52_low: 555.35, rsi_14: 55, sma_20: 615, sma_50: 600, sma_200: 590, signal: 'hold', updated_at: new Date().toISOString() },
  { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'IT', price: 485.20, change: -3.15, change_pct: -0.65, volume: 3400000, avg_volume: 4000000, delivery_pct: 35.6, market_cap: 252000000000, pe_ratio: 22.8, week_52_high: 550.00, week_52_low: 380.00, rsi_14: 42, sma_20: 492, sma_50: 500, sma_200: 470, signal: 'hold', updated_at: new Date().toISOString() },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'FMCG', price: 2510.00, change: -22.50, change_pct: -0.89, volume: 1200000, avg_volume: 1500000, delivery_pct: 48.3, market_cap: 590000000000, pe_ratio: 55.2, week_52_high: 2835.00, week_52_low: 2172.05, rsi_14: 38, sma_20: 2545, sma_50: 2580, sma_200: 2520, signal: 'hold', updated_at: new Date().toISOString() },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG', price: 442.80, change: 5.60, change_pct: 1.28, volume: 8900000, avg_volume: 7500000, delivery_pct: 56.7, market_cap: 552000000000, pe_ratio: 24.1, week_52_high: 499.00, week_52_low: 398.50, rsi_14: 58, sma_20: 435, sma_50: 428, sma_200: 420, signal: 'buy', updated_at: new Date().toISOString() },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', sector: 'Telecom', price: 1580.00, change: 18.40, change_pct: 1.18, volume: 3200000, avg_volume: 2800000, delivery_pct: 47.1, market_cap: 942000000000, pe_ratio: 72.5, week_52_high: 1680.00, week_52_low: 1200.00, rsi_14: 64, sma_20: 1555, sma_50: 1520, sma_200: 1400, signal: 'buy', updated_at: new Date().toISOString() },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharma', price: 1725.00, change: -8.50, change_pct: -0.49, volume: 1800000, avg_volume: 2200000, delivery_pct: 43.9, market_cap: 414000000000, pe_ratio: 35.8, week_52_high: 1936.00, week_52_low: 1270.00, rsi_14: 45, sma_20: 1740, sma_50: 1760, sma_200: 1650, signal: 'hold', updated_at: new Date().toISOString() },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', sector: 'Auto', price: 12450.00, change: 155.00, change_pct: 1.26, volume: 420000, avg_volume: 380000, delivery_pct: 62.4, market_cap: 389000000000, pe_ratio: 29.8, week_52_high: 13680.00, week_52_low: 9830.00, rsi_14: 61, sma_20: 12200, sma_50: 11900, sma_200: 11200, signal: 'buy', updated_at: new Date().toISOString() },
  { symbol: 'AXISBANK', name: 'Axis Bank Limited', sector: 'Banking', price: 1085.50, change: -12.30, change_pct: -1.12, volume: 5600000, avg_volume: 5000000, delivery_pct: 40.2, market_cap: 335000000000, pe_ratio: 13.5, week_52_high: 1272.00, week_52_low: 948.80, rsi_14: 35, sma_20: 1100, sma_50: 1120, sma_200: 1080, signal: 'hold', updated_at: new Date().toISOString() },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', price: 1820.00, change: 24.50, change_pct: 1.37, volume: 2400000, avg_volume: 2100000, delivery_pct: 52.1, market_cap: 362000000000, pe_ratio: 20.3, week_52_high: 2064.00, week_52_low: 1690.00, rsi_14: 57, sma_20: 1795, sma_50: 1780, sma_200: 1750, signal: 'hold', updated_at: new Date().toISOString() },
  { symbol: 'TATASTEEL', name: 'Tata Steel Limited', sector: 'Metals', price: 132.50, change: 3.80, change_pct: 2.95, volume: 28000000, avg_volume: 22000000, delivery_pct: 33.8, market_cap: 162000000000, pe_ratio: 0, week_52_high: 156.00, week_52_low: 108.85, rsi_14: 72, sma_20: 126, sma_50: 120, sma_200: 118, signal: 'strong_sell', updated_at: new Date().toISOString() },
  { symbol: 'NTPC', name: 'NTPC Limited', sector: 'Energy', price: 355.80, change: 6.20, change_pct: 1.77, volume: 9800000, avg_volume: 8500000, delivery_pct: 44.5, market_cap: 345000000000, pe_ratio: 16.8, week_52_high: 400.00, week_52_low: 285.00, rsi_14: 63, sma_20: 348, sma_50: 340, sma_200: 320, signal: 'buy', updated_at: new Date().toISOString() },
  { symbol: 'TECHM', name: 'Tech Mahindra Limited', sector: 'IT', price: 1285.00, change: -18.50, change_pct: -1.42, volume: 2200000, avg_volume: 2600000, delivery_pct: 38.7, market_cap: 125000000000, pe_ratio: 30.2, week_52_high: 1640.00, week_52_low: 1102.00, rsi_14: 33, sma_20: 1320, sma_50: 1380, sma_200: 1340, signal: 'strong_buy', updated_at: new Date().toISOString() },
];

export type ScreenerPreset = 'momentum' | 'oversold' | 'delivery' | 'fresh52w' | 'beginner';

export const SCREENER_PRESETS: { key: ScreenerPreset; label: string; icon: string }[] = [
  { key: 'momentum', label: 'Momentum Breakout', icon: 'rocket_launch' },
  { key: 'oversold', label: 'Oversold Bounce', icon: 'trending_up' },
  { key: 'delivery', label: 'Delivery Kings', icon: 'local_shipping' },
  { key: 'fresh52w', label: 'Fresh 52W High', icon: 'star' },
  { key: 'beginner', label: 'Beginner Safe', icon: 'shield' },
];

export function filterByPreset(stocks: StockData[], preset: ScreenerPreset): StockData[] {
  switch (preset) {
    case 'momentum':
      return stocks.filter((s) => s.change_pct > 1 && s.rsi_14 > 50 && s.rsi_14 < 75);
    case 'oversold':
      return stocks.filter((s) => s.rsi_14 < 35);
    case 'delivery':
      return stocks.filter((s) => s.delivery_pct > 50);
    case 'fresh52w':
      return stocks.filter((s) => s.price >= s.week_52_high * 0.95);
    case 'beginner':
      return stocks.filter((s) => s.pe_ratio > 0 && s.pe_ratio < 30 && s.rsi_14 >= 40 && s.rsi_14 <= 60);
    default:
      return stocks;
  }
}

export function getSignalLabel(sig: StockSignal): { text: string; color: string } {
  switch (sig) {
    case 'strong_buy':  return { text: 'STRONG BUY', color: 'bg-india-green text-white' };
    case 'buy':         return { text: 'BULLISH', color: 'bg-india-green text-white' };
    case 'hold':        return { text: 'NEUTRAL', color: 'bg-outline text-white' };
    case 'sell':        return { text: 'BEARISH', color: 'bg-error text-white' };
    case 'strong_sell': return { text: 'OVERSOLD', color: 'bg-saffron text-white' };
  }
}
