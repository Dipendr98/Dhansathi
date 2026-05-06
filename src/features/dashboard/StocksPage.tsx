import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { fetchLiveStocks, getMarketOverview, searchAndFetchStocks } from '@/lib/stockApi';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/stores/languageStore';
import { T } from '@/lib/translations';
import type { StockData, StockSignal } from '@/types';

/* ─── Screener Presets (moved from mockStocks — still pure frontend logic) ── */

type ScreenerPreset = 'momentum' | 'oversold' | 'delivery' | 'fresh52w' | 'beginner';

const SCREENER_PRESETS: { key: ScreenerPreset; label: string; icon: string }[] = [
  { key: 'momentum', label: 'Momentum Breakout', icon: 'rocket_launch' },
  { key: 'oversold', label: 'Oversold Bounce', icon: 'trending_up' },
  { key: 'delivery', label: 'Delivery Kings', icon: 'local_shipping' },
  { key: 'fresh52w', label: 'Fresh 52W High', icon: 'star' },
  { key: 'beginner', label: 'Beginner Safe', icon: 'shield' },
];

function hasDeliveryData(stock: StockData): boolean {
  return stock.delivery_source === 'exchange' && stock.delivery_pct > 0;
}

function filterByPreset(stocks: StockData[], preset: ScreenerPreset): StockData[] {
  switch (preset) {
    case 'momentum':
      return stocks.filter((s) => s.change_pct > 1 && s.rsi_14 > 50 && s.rsi_14 < 75);
    case 'oversold':
      return stocks.filter((s) => s.rsi_14 < 35);
    case 'delivery':
      return stocks.filter((s) => hasDeliveryData(s) && s.delivery_pct > 50);
    case 'fresh52w':
      return stocks.filter((s) => s.price >= s.week_52_high * 0.95);
    case 'beginner':
      return stocks.filter((s) => s.pe_ratio > 0 && s.pe_ratio < 30 && s.rsi_14 >= 40 && s.rsi_14 <= 60);
    default:
      return stocks;
  }
}

function getSignalLabel(sig: StockSignal): { text: string; color: string } {
  switch (sig) {
    case 'strong_buy': return { text: 'STRONG BUY', color: 'bg-india-green text-white' };
    case 'buy': return { text: 'BULLISH', color: 'bg-india-green text-white' };
    case 'hold': return { text: 'NEUTRAL', color: 'bg-outline text-white' };
    case 'sell': return { text: 'BEARISH', color: 'bg-error text-white' };
    case 'strong_sell': return { text: 'OVERSOLD', color: 'bg-saffron text-white' };
    default: return { text: 'NEUTRAL', color: 'bg-outline text-white' };
  }
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatVolume(v: number): string {
  if (v >= 1_000_000_0) return `${(v / 1_000_000_0).toFixed(1)}Cr`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toString();
}

function getCurrencySymbol(currency?: string): string {
  switch ((currency || 'INR').toUpperCase()) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'INR': return '₹';
    default: return `${currency} `;
  }
}

function formatPrice(stock: StockData): string {
  return `${getCurrencySymbol(stock.currency)}${stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDelivery(stock: StockData): string {
  return hasDeliveryData(stock) ? `${stock.delivery_pct.toFixed(1)}%` : 'N/A';
}

/* ─── Pagination ─────────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function StocksPage() {
  const lang = useLanguageStore((s) => s.lang);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [marketPulse, setMarketPulse] = useState<{ nifty50: number; change: number; changePct: number; advances: number; declines: number; sentiment: string } | null>(null);

  const [activePreset, setActivePreset] = useState<ScreenerPreset | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set(['RELIANCE', 'TCS', 'HDFCBANK']));
  const [globalSearchResults, setGlobalSearchResults] = useState<StockData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch live stock data on mount ─────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    async function loadStocks() {
      setLoading(true);
      try {
        const [liveStocks, overview] = await Promise.all([
          fetchLiveStocks(),
          getMarketOverview(),
        ]);
        if (!cancelled) {
          setStocks(liveStocks);
          setLastUpdated(overview.lastUpdated);
          setMarketPulse({
            nifty50: overview.nifty50,
            change: overview.nifty50Change,
            changePct: overview.nifty50ChangePct,
            advances: overview.advances,
            declines: overview.declines,
            sentiment: overview.marketSentiment,
          });
        }
      } catch (err) {
        console.error('[StocksPage] Failed to fetch live data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadStocks();
    return () => { cancelled = true; };
  }, []);

  /* Global search with debounce */
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);

    // Clear previous timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // If search is empty or short, clear global results
    if (value.trim().length < 2) {
      setGlobalSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Debounce: wait 500ms before searching Yahoo Finance
    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchAndFetchStocks(value.trim());
        setGlobalSearchResults(results);
      } catch (err) {
        console.error('[StocksPage] Global search failed:', err);
        setGlobalSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  /* Filtered stocks — combines local Nifty 50 filter + global search results */
  const filtered = useMemo(() => {
    let list = activePreset ? filterByPreset(stocks, activePreset) : stocks;

    if (search.trim()) {
      const q = search.toLowerCase();
      // First filter local Nifty 50 stocks
      const localMatches = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q),
      );

      // Merge with global search results (avoid duplicates)
      const localSymbols = new Set(localMatches.map((s) => s.symbol));
      const uniqueGlobal = globalSearchResults.filter((s) => !localSymbols.has(s.symbol));

      list = [...localMatches, ...uniqueGlobal];
    }
    return list;
  }, [activePreset, search, stocks, globalSearchResults]);

  /* Pagination */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const viewStart = (page - 1) * PAGE_SIZE + 1;
  const viewEnd = Math.min(page * PAGE_SIZE, filtered.length);

  /* Reset page when filters change */
  const handlePreset = (p: ScreenerPreset) => {
    setActivePreset(activePreset === p ? null : p);
    setPage(1);
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-on-surface-variant font-body text-sm mb-1">
            {T('stocks', 'subtitle', lang)}
          </p>
          <h1 className="text-3xl font-headline font-bold text-on-surface">{T('stocks', 'title', lang)}</h1>
        </div>
        {lastUpdated && (
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">{T('stocks', 'lastUpdated', lang)}</p>
            <p className="text-xs text-on-surface-variant">{new Date(lastUpdated).toLocaleTimeString('en-IN')}</p>
          </div>
        )}
      </div>

      {/* ── Market Overview Bar ──────────────────────────────────────────────── */}
      {marketPulse && (
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-surface-container-lowest shadow-ambient">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Nifty 50</span>
            <span className="font-mono font-bold text-on-surface">{marketPulse.nifty50.toLocaleString('en-IN')}</span>
            <span className={cn('font-mono font-bold text-sm', marketPulse.changePct >= 0 ? 'text-india-green' : 'text-error')}>
              {marketPulse.changePct >= 0 ? '+' : ''}{marketPulse.changePct.toFixed(2)}%
            </span>
          </div>
          <div className="h-5 w-px bg-outline-variant/40 hidden sm:block" />
          <div className="flex items-center gap-3 text-xs">
            <span className="text-india-green font-semibold">▲ {marketPulse.advances}</span>
            <span className="text-error font-semibold">▼ {marketPulse.declines}</span>
          </div>
          <div className="h-5 w-px bg-outline-variant/40 hidden sm:block" />
          <span className={cn(
            'text-[10px] font-bold px-2.5 py-1 rounded-md uppercase',
            marketPulse.sentiment === 'bullish' ? 'bg-india-green text-white' :
              marketPulse.sentiment === 'bearish' ? 'bg-error text-white' :
                'bg-outline text-white',
          )}>
            {marketPulse.sentiment}
          </span>
        </div>
      )}

      {/* ── Preset filters ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {SCREENER_PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => handlePreset(preset.key)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
              activePreset === preset.key
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 hover:bg-surface-container-low',
            )}
          >
            <span className="material-symbols-outlined text-lg">{preset.icon}</span>
            {T('stocks', preset.key, lang)}
          </button>
        ))}
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search any stock worldwide (e.g., AAPL, Tesla, Zomato)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
        />
      </div>

      {/* ── Global search indicator ──────────────────────────────────────────── */}
      {isSearching && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span>Searching stocks worldwide...</span>
        </div>
      )}
      {search.trim().length >= 2 && !isSearching && globalSearchResults.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-sm text-india-green">public</span>
          <span>Showing {filtered.length} results including global stocks from Yahoo Finance</span>
        </div>
      )}

      {/* ── Loading state ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm font-medium">{T('stocks', 'fetchingData', lang)}</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ──────────────────────────────────────────────── */}
          <div className="hidden md:block bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/20">
                    <th className="text-left px-5 py-3.5 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">{T('stocks', 'stock', lang)}</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">{T('stocks', 'cmp', lang)}</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">{T('stocks', 'changePct', lang)}</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">{T('stocks', 'volume', lang)}</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">{T('stocks', 'deliveryPct', lang)}</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">{T('stocks', 'rsi', lang)}</th>
                    <th className="text-center px-5 py-3.5 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">{T('stocks', 'signal', lang)}</th>
                    <th className="text-center px-5 py-3.5 font-semibold text-on-surface-variant text-xs uppercase tracking-wider w-12" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((stock, idx) => {
                    const sig = getSignalLabel(stock.signal);
                    const isPositive = stock.change_pct >= 0;
                    const highDelivery = hasDeliveryData(stock) && stock.delivery_pct > 50;

                    return (
                      <tr
                        key={stock.symbol}
                        className={cn(
                          'border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors',
                          idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-white/50',
                        )}
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-on-surface">{stock.symbol}</p>
                          <p className="text-xs text-on-surface-variant truncate max-w-[180px]">{stock.name}</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-mono font-bold text-on-surface">{formatPrice(stock)}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={cn('font-mono font-bold', isPositive ? 'text-india-green' : 'text-error')}>
                            {isPositive ? '+' : ''}{stock.change_pct.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-on-surface-variant">
                          {formatVolume(stock.volume)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={cn('font-mono', highDelivery ? 'font-bold text-tertiary' : 'text-on-surface-variant')}>
                            {formatDelivery(stock)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-on-surface-variant">
                          {stock.rsi_14}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={cn('inline-block text-[10px] font-bold px-2.5 py-1 rounded-md', sig.color)}>
                            {sig.text}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => toggleWatchlist(stock.symbol)}
                            className="text-outline hover:text-saffron transition-colors"
                            title={watchlist.has(stock.symbol) ? 'Remove from watchlist' : 'Add to watchlist'}
                          >
                            <span className={cn('material-symbols-outlined text-xl', watchlist.has(stock.symbol) && 'filled text-saffron')}>
                              star
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 bg-surface-container-low border-t border-outline-variant/20">
                <p className="text-xs text-on-surface-variant">
                  {T('stocks', 'viewing', lang)} <span className="font-bold">{viewStart}-{viewEnd}</span> of{' '}
                  <span className="font-bold">{filtered.length}</span> {T('stocks', 'ofStocks', lang)}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Mobile card view ───────────────────────────────────────────── */}
          <div className="md:hidden space-y-4">
            {paginated.map((stock) => {
              const sig = getSignalLabel(stock.signal);
              const isPositive = stock.change_pct >= 0;
              const highDelivery = hasDeliveryData(stock) && stock.delivery_pct > 50;

              return (
                <div key={stock.symbol} className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-on-surface">{stock.symbol}</p>
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md', sig.color)}>
                          {sig.text}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">{stock.name}</p>
                    </div>
                    <button
                      onClick={() => toggleWatchlist(stock.symbol)}
                      className="shrink-0 text-outline hover:text-saffron transition-colors"
                    >
                      <span className={cn('material-symbols-outlined text-xl', watchlist.has(stock.symbol) && 'filled text-saffron')}>
                        star
                      </span>
                    </button>
                  </div>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="font-mono font-bold text-xl text-on-surface">{formatPrice(stock)}</span>
                    <span className={cn('font-mono font-bold text-sm', isPositive ? 'text-india-green' : 'text-error')}>
                      {isPositive ? '+' : ''}{stock.change_pct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-surface-container-low rounded-xl p-3 text-center">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Volume</p>
                      <p className="font-mono text-sm text-on-surface">{formatVolume(stock.volume)}</p>
                    </div>
                    <div className={cn('rounded-xl p-3 text-center', highDelivery ? 'bg-tertiary-fixed/40' : 'bg-surface-container-low')}>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Delivery</p>
                      <p className={cn('font-mono text-sm', highDelivery ? 'font-bold text-tertiary' : 'text-on-surface')}>
                        {formatDelivery(stock)}
                      </p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-3 text-center">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">RSI</p>
                      <p className="font-mono text-sm text-on-surface">{stock.rsi_14}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length > 0 && (
              <div className="flex items-center justify-between px-2 py-3">
                <p className="text-xs text-on-surface-variant">
                  {T('stocks', 'viewing', lang)} <span className="font-bold">{viewStart}-{viewEnd}</span> of{' '}
                  <span className="font-bold">{filtered.length}</span> {T('stocks', 'ofStocks', lang)}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Bottom cards row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Pulse card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary shadow-ambient">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-2xl">monitoring</span>
            <h2 className="font-headline font-bold text-lg">{T('stocks', 'marketPulse', lang)}</h2>
          </div>
          <p className="text-on-primary/80 text-sm leading-relaxed mb-5">
            {marketPulse ? (
              <>
                Nifty 50 at <span className="font-mono font-bold">{marketPulse.nifty50.toLocaleString('en-IN')}</span>
                {' '}({marketPulse.changePct >= 0 ? '+' : ''}{marketPulse.changePct.toFixed(2)}%).
                {' '}{marketPulse.advances} advancing, {marketPulse.declines} declining.
                {' '}Market sentiment: <span className="font-bold capitalize">{marketPulse.sentiment}</span>.
              </>
            ) : (
              T('stocks', 'loadingMarket', lang)
            )}
          </p>
          <button className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-lg">analytics</span>
            {T('stocks', 'analyzeSector', lang)}
          </button>
        </div>

        {/* Data Source info card */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <h2 className="font-headline font-bold text-lg text-on-surface mb-3">{T('stocks', 'dataSources', lang)}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
              <div className="w-10 h-10 rounded-xl bg-india-green/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-india-green">verified</span>
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm">Yahoo Finance chart feed</p>
                <p className="text-xs text-on-surface-variant">CMP, change, volume and Nifty index fetched live</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-primary">calculate</span>
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm">Technical Indicators</p>
                <p className="text-xs text-on-surface-variant">RSI and SMA calculated from daily close history; delivery shows N/A when source does not provide it</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
              <div className="w-10 h-10 rounded-xl bg-saffron/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-saffron">timer</span>
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm">5-Minute Cache</p>
                <p className="text-xs text-on-surface-variant">Auto-refreshes data every 5 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
