import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLiveStocks, searchAndFetchStocks } from '@/lib/stockApi';
import type { StockData } from '@/types';
import { useLanguageStore } from '@/stores/languageStore';
import { T } from '@/lib/translations';

/* -- Animation helpers ---------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

/* -- Types ---------------------------------------------------- */

type AlertCategory = 'buy' | 'sell' | 'caution';

interface GeneratedAlert {
  id: string;
  symbol: string;
  name: string;
  alertType: string;
  currentPrice: number;
  currency?: string;
  indicatorLabel: string;
  indicatorValue: string;
  category: AlertCategory;
  icon: string;
}

interface UserAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  currency?: string;
  status: 'active' | 'triggered';
  triggeredAt?: string;
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

function formatStockPrice(value: number, currency?: string): string {
  return `${getCurrencySymbol(currency)}${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

interface SchemeAlert {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  type: 'deadline' | 'new_scheme';
  read: boolean;
}

/* -- Scheme data (kept as-is) --------------------------------- */

const SCHEME_ALERTS: SchemeAlert[] = [
  {
    id: 's1',
    title: 'PM Kisan - 16th Installment',
    description: 'eKYC completion deadline for 16th installment. Complete your Aadhaar-linked eKYC to receive benefits.',
    deadline: 'April 30, 2026',
    type: 'deadline',
    read: false,
  },
  {
    id: 's2',
    title: 'PMJJBY Renewal Due',
    description: 'Annual premium auto-debit for Pradhan Mantri Jeevan Jyoti Bima Yojana is scheduled.',
    deadline: 'June 1, 2026',
    type: 'deadline',
    read: true,
  },
  {
    id: 's3',
    title: 'New: PM Vishwakarma Yojana',
    description: 'Government has launched a new scheme for traditional artisans and craftspeople with subsidized credit and skill training.',
    type: 'new_scheme',
    read: false,
  },
  {
    id: 's4',
    title: 'New: Digital India Internship Scheme',
    description: 'Internship opportunities with stipend for students in government digital projects.',
    type: 'new_scheme',
    read: false,
  },
];

/* -- Alert generation logic ----------------------------------- */

function generateAlertsFromStocks(stocks: StockData[]): GeneratedAlert[] {
  const alerts: GeneratedAlert[] = [];
  let idCounter = 1;

  for (const stock of stocks) {
    // RSI Oversold
    if (stock.rsi_14 < 30) {
      alerts.push({
        id: `gen-${idCounter++}`,
        symbol: stock.symbol,
        name: stock.name,
        alertType: 'Oversold opportunity',
        currentPrice: stock.price,
        currency: stock.currency,
        indicatorLabel: 'RSI',
        indicatorValue: stock.rsi_14.toFixed(1),
        category: 'buy',
        icon: 'trending_down',
      });
    }

    // RSI Overbought
    if (stock.rsi_14 > 70) {
      alerts.push({
        id: `gen-${idCounter++}`,
        symbol: stock.symbol,
        name: stock.name,
        alertType: 'Overbought warning',
        currentPrice: stock.price,
        currency: stock.currency,
        indicatorLabel: 'RSI',
        indicatorValue: stock.rsi_14.toFixed(1),
        category: 'sell',
        icon: 'trending_up',
      });
    }

    // Near 52-week high
    if (stock.week_52_high > 0 && stock.price > 0.95 * stock.week_52_high) {
      alerts.push({
        id: `gen-${idCounter++}`,
        symbol: stock.symbol,
        name: stock.name,
        alertType: 'Near 52-week high',
        currentPrice: stock.price,
        currency: stock.currency,
        indicatorLabel: '52W High',
        indicatorValue: formatStockPrice(stock.week_52_high, stock.currency),
        category: 'caution',
        icon: 'vertical_align_top',
      });
    }

    // Near 52-week low
    if (stock.week_52_low > 0 && stock.price < 1.05 * stock.week_52_low) {
      alerts.push({
        id: `gen-${idCounter++}`,
        symbol: stock.symbol,
        name: stock.name,
        alertType: 'Near 52-week low - potential value buy',
        currentPrice: stock.price,
        currency: stock.currency,
        indicatorLabel: '52W Low',
        indicatorValue: formatStockPrice(stock.week_52_low, stock.currency),
        category: 'buy',
        icon: 'vertical_align_bottom',
      });
    }

    // High PE warning
    if (stock.pe_ratio > 50) {
      alerts.push({
        id: `gen-${idCounter++}`,
        symbol: stock.symbol,
        name: stock.name,
        alertType: 'High valuation alert',
        currentPrice: stock.price,
        currency: stock.currency,
        indicatorLabel: 'P/E',
        indicatorValue: stock.pe_ratio.toFixed(1),
        category: 'sell',
        icon: 'warning',
      });
    }

    // Low PE opportunity
    if (stock.pe_ratio > 0 && stock.pe_ratio < 12) {
      alerts.push({
        id: `gen-${idCounter++}`,
        symbol: stock.symbol,
        name: stock.name,
        alertType: 'Attractive valuation',
        currentPrice: stock.price,
        currency: stock.currency,
        indicatorLabel: 'P/E',
        indicatorValue: stock.pe_ratio.toFixed(1),
        category: 'buy',
        icon: 'diamond',
      });
    }

    // Volume spike
    if (stock.avg_volume > 0 && stock.volume > 1.5 * stock.avg_volume) {
      alerts.push({
        id: `gen-${idCounter++}`,
        symbol: stock.symbol,
        name: stock.name,
        alertType: 'Unusual volume',
        currentPrice: stock.price,
        currency: stock.currency,
        indicatorLabel: 'Vol/Avg',
        indicatorValue: `${(stock.volume / stock.avg_volume).toFixed(1)}x`,
        category: 'caution',
        icon: 'equalizer',
      });
    }

    // Strong buy signal
    if (stock.signal === 'strong_buy') {
      alerts.push({
        id: `gen-${idCounter++}`,
        symbol: stock.symbol,
        name: stock.name,
        alertType: 'Strong buy signal',
        currentPrice: stock.price,
        currency: stock.currency,
        indicatorLabel: 'Signal',
        indicatorValue: 'Strong Buy',
        category: 'buy',
        icon: 'rocket_launch',
      });
    }

    // Strong sell signal
    if (stock.signal === 'strong_sell') {
      alerts.push({
        id: `gen-${idCounter++}`,
        symbol: stock.symbol,
        name: stock.name,
        alertType: 'Strong sell signal',
        currentPrice: stock.price,
        currency: stock.currency,
        indicatorLabel: 'Signal',
        indicatorValue: 'Strong Sell',
        category: 'sell',
        icon: 'south',
      });
    }
  }

  return alerts;
}

function badgeClasses(category: AlertCategory): string {
  switch (category) {
    case 'buy':
      return 'bg-green-500/10 text-green-700 border border-green-500/20';
    case 'sell':
      return 'bg-red-500/10 text-red-700 border border-red-500/20';
    case 'caution':
      return 'bg-orange-500/10 text-orange-700 border border-orange-500/20';
  }
}

function iconBgClass(category: AlertCategory): string {
  switch (category) {
    case 'buy':
      return 'bg-green-500/10';
    case 'sell':
      return 'bg-red-500/10';
    case 'caution':
      return 'bg-orange-500/10';
  }
}

function iconTextClass(category: AlertCategory): string {
  switch (category) {
    case 'buy':
      return 'text-green-600';
    case 'sell':
      return 'text-red-600';
    case 'caution':
      return 'text-orange-600';
  }
}

/* -- Component ------------------------------------------------ */

export default function AlertsPage() {
  const lang = useLanguageStore((s) => s.lang);
  const [activeTab, setActiveTab] = useState<'stocks' | 'schemes'>('stocks');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formSymbol, setFormSymbol] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [formCondition, setFormCondition] = useState<'above' | 'below'>('above');
  const [formPrice, setFormPrice] = useState('');

  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [generatedAlerts, setGeneratedAlerts] = useState<GeneratedAlert[]>([]);
  const [userAlerts, setUserAlerts] = useState<UserAlert[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchLiveStocks();
        if (cancelled) return;
        setStocks(data);
        setGeneratedAlerts(generateAlertsFromStocks(data));
        if (data.length > 0) {
          setFormSymbol(data[0].symbol);
        }
      } catch {
        // fallback: empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const q = stockSearch.trim();
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAndFetchStocks(q);
        setSearchResults(results.filter((result) => !stocks.some((stock) => stock.symbol === result.symbol)));
        if (results[0]) setFormSymbol(results[0].symbol);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [stockSearch, stocks]);

  const stockUniverse = useMemo(() => {
    const seen = new Set<string>();
    return [...stocks, ...searchResults].filter((stock) => {
      if (seen.has(stock.symbol)) return false;
      seen.add(stock.symbol);
      return true;
    });
  }, [stocks, searchResults]);

  const stockMap = useMemo(() => new Map(stockUniverse.map((s) => [s.symbol, s])), [stockUniverse]);

  const totalAlertCount = generatedAlerts.length + userAlerts.filter((a) => a.status === 'active').length;

  function handleCreateAlert() {
    const target = parseFloat(formPrice);
    if (!formSymbol || isNaN(target) || target <= 0) return;
    const stock = stockMap.get(formSymbol);
    const currentPrice = stock?.price ?? 0;
    const isTriggered =
      (formCondition === 'above' && currentPrice >= target) ||
      (formCondition === 'below' && currentPrice <= target);

    const newAlert: UserAlert = {
      id: `user-${Date.now()}`,
      symbol: formSymbol,
      condition: formCondition,
      targetPrice: target,
      currentPrice,
      currency: stock?.currency,
      status: isTriggered ? 'triggered' : 'active',
      triggeredAt: isTriggered ? 'Just now' : undefined,
    };
    setUserAlerts((prev) => [newAlert, ...prev]);
    setFormPrice('');
    setShowCreateForm(false);
  }

  const activeUserAlerts = userAlerts.filter((a) => a.status === 'active');
  const triggeredUserAlerts = userAlerts.filter((a) => a.status === 'triggered');

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8 pb-16"
    >
      {/* -- Page Header -- */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">
          {T('alerts', 'title', lang)}
        </h1>
        <p className="text-on-surface-variant mt-1">
          {T('alerts', 'subtitle', lang)}
        </p>
      </motion.div>

      {/* -- Tabs -- */}
      <motion.div variants={fadeUp} custom={1} className="flex space-x-2">
        {[
          { key: 'stocks' as const, label: T('alerts', 'stockAlerts', lang), icon: 'trending_up', count: totalAlertCount },
          { key: 'schemes' as const, label: T('alerts', 'schemeAlerts', lang), icon: 'account_balance', count: SCHEME_ALERTS.filter((s) => !s.read).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-saffron text-white'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* -- Stock Alerts Tab -- */}
      <AnimatePresence mode="wait">
        {activeTab === 'stocks' && (
          <motion.div
            key="stocks"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Loading state */}
            {loading && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <p className="text-on-surface-variant font-semibold text-sm">{T('alerts', 'loadingData', lang)}</p>
              </div>
            )}

            {/* Smart Alerts (generated from stock data) */}
            {!loading && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
                <div className="p-6 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-headline font-bold text-on-surface">{T('alerts', 'smartAlerts', lang)}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {generatedAlerts.length} {T('alerts', 'alertsDetected', lang)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-green-500/10 text-green-700 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span>{T('alerts', 'live', lang)}</span>
                    </span>
                  </div>
                </div>

                {generatedAlerts.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="w-20 h-20 mx-auto bg-surface-container-high rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-on-surface-variant text-[32px]">
                        check_circle
                      </span>
                    </div>
                    <p className="font-semibold text-on-surface">{T('alerts', 'noAlerts', lang)}</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {T('alerts', 'normalRanges', lang)}
                    </p>
                  </div>
                )}

                <div className="divide-y divide-outline-variant/10">
                  {generatedAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgClass(alert.category)}`}>
                          <span className={`material-symbols-outlined text-[20px] ${iconTextClass(alert.category)}`}>
                            {alert.icon}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-on-surface font-mono">{alert.symbol}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClasses(alert.category)}`}>
                              {alert.category === 'buy' ? T('alerts', 'buySignal', lang) : alert.category === 'sell' ? T('alerts', 'warning', lang) : T('alerts', 'caution', lang)}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {alert.alertType}
                            <span className="mx-1.5 text-outline-variant">|</span>
                            <span className="font-mono font-semibold">{alert.indicatorLabel}: {alert.indicatorValue}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-on-surface">
                          {formatStockPrice(alert.currentPrice, alert.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User-created price alerts */}
            {!loading && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
                <div className="p-6 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-headline font-bold text-on-surface">{T('alerts', 'priceAlerts', lang)}</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {activeUserAlerts.length} {T('alerts', 'activeAlerts', lang)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-container text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showCreateForm ? 'close' : 'add'}
                    </span>
                    <span>{T('alerts', showCreateForm ? 'cancel' : 'createAlert', lang)}</span>
                  </button>
                </div>

                {/* Create Alert Form */}
                <AnimatePresence>
                  {showCreateForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mx-6 mb-4 p-5 bg-primary-fixed/30 rounded-xl border border-primary/10">
                        <h4 className="font-semibold text-on-surface text-sm mb-4">{T('alerts', 'newStockAlert', lang)}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                              Search stock
                            </label>
                            <input
                              type="text"
                              value={stockSearch}
                              onChange={(e) => setStockSearch(e.target.value)}
                              placeholder="Tesla, AAPL, RELIANCE..."
                              className="w-full bg-white border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                            {searching && (
                              <p className="mt-1 text-[10px] font-semibold text-primary">Searching worldwide...</p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                              {T('alerts', 'symbol', lang)}
                            </label>
                            <select
                              value={formSymbol}
                              onChange={(e) => setFormSymbol(e.target.value)}
                              className="w-full bg-white border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            >
                              {stockUniverse.map((s) => (
                                <option key={s.symbol} value={s.symbol}>
                                  {s.symbol} {s.currency && s.currency !== 'INR' ? `(${s.currency})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                              {T('alerts', 'condition', lang)}
                            </label>
                            <select
                              value={formCondition}
                              onChange={(e) => setFormCondition(e.target.value as 'above' | 'below')}
                              className="w-full bg-white border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            >
                              <option value="above">{T('alerts', 'priceAbove', lang)}</option>
                              <option value="below">{T('alerts', 'priceBelow', lang)}</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                              {T('alerts', 'targetPrice', lang)} ({getCurrencySymbol(stockMap.get(formSymbol)?.currency)})
                            </label>
                            <input
                              type="number"
                              placeholder="e.g. 2800"
                              value={formPrice}
                              onChange={(e) => setFormPrice(e.target.value)}
                              className="w-full bg-white border border-outline-variant/30 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={handleCreateAlert}
                              className="w-full bg-primary text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-primary-container transition-colors"
                            >
                              {T('alerts', 'create', lang)}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active user alerts list */}
                <div className="divide-y divide-outline-variant/10">
                  {activeUserAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-surface-container-low/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[20px]">
                            {alert.condition === 'above' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface font-mono">{alert.symbol}</p>
                          <p className="text-xs text-on-surface-variant">
                            {alert.condition === 'above' ? T('alerts', 'priceGoesAbove', lang) : T('alerts', 'priceDropsBelow', lang)}{' '}
                            <span className="font-mono font-semibold">{'\u20B9'}{alert.targetPrice.toLocaleString('en-IN')}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-on-surface">
                          {formatStockPrice(alert.currentPrice, alert.currency)}
                        </p>
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse" />
                          <span>{T('alerts', 'active', lang)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                  {activeUserAlerts.length === 0 && !showCreateForm && (
                    <div className="px-6 py-8 text-center">
                      <p className="text-sm text-on-surface-variant">
                        {T('alerts', 'noCustomAlerts', lang)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Triggered User Alerts History */}
            {!loading && triggeredUserAlerts.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
                <div className="p-6 pb-4">
                  <h3 className="font-headline font-bold text-on-surface">{T('alerts', 'triggeredHistory', lang)}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {T('alerts', 'recentTriggered', lang)}
                  </p>
                </div>
                <div className="divide-y divide-outline-variant/10">
                  {triggeredUserAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="px-6 py-4 flex items-center justify-between opacity-70"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-saffron/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-saffron text-[20px]">
                            notifications_active
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface font-mono">{alert.symbol}</p>
                          <p className="text-xs text-on-surface-variant">
                            {T('alerts', 'crossed', lang)} {formatStockPrice(alert.targetPrice, alert.currency)} ({alert.condition})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-on-surface">
                          {formatStockPrice(alert.currentPrice, alert.currency)}
                        </p>
                        <span className="text-xs text-on-surface-variant">{alert.triggeredAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* -- Scheme Alerts Tab -- */}
        {activeTab === 'schemes' && (
          <motion.div
            key="schemes"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Deadline Reminders */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-error text-[20px]">schedule</span>
                  <h3 className="font-headline font-bold text-on-surface">{T('alerts', 'deadlineReminders', lang)}</h3>
                </div>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {SCHEME_ALERTS.filter((s) => s.type === 'deadline').map((alert) => (
                  <div
                    key={alert.id}
                    className="px-6 py-4 hover:bg-surface-container-low/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          alert.read ? 'bg-surface-container-high' : 'bg-error-container'
                        }`}>
                          <span className={`material-symbols-outlined text-[20px] ${
                            alert.read ? 'text-on-surface-variant' : 'text-error'
                          }`}>
                            event_upcoming
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-on-surface">{alert.title}</p>
                            {!alert.read && (
                              <span className="w-2 h-2 bg-error rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-on-surface-variant mt-1">{alert.description}</p>
                        </div>
                      </div>
                      {alert.deadline && (
                        <span className="text-xs font-mono font-semibold text-error bg-error-container px-3 py-1 rounded-lg whitespace-nowrap ml-4">
                          {alert.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Scheme Notifications */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">new_releases</span>
                  <h3 className="font-headline font-bold text-on-surface">{T('alerts', 'newSchemeNotifications', lang)}</h3>
                </div>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {SCHEME_ALERTS.filter((s) => s.type === 'new_scheme').map((alert) => (
                  <div
                    key={alert.id}
                    className="px-6 py-4 hover:bg-surface-container-low/50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-tertiary text-[20px]">
                          auto_awesome
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-on-surface">{alert.title}</p>
                          {!alert.read && (
                            <span className="text-[10px] font-bold bg-tertiary text-white px-2 py-0.5 rounded-full uppercase">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-on-surface-variant mt-1">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty state */}
                {SCHEME_ALERTS.filter((s) => s.type === 'new_scheme').length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="w-20 h-20 mx-auto bg-surface-container-high rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-on-surface-variant text-[32px]">
                        notifications_off
                      </span>
                    </div>
                    <p className="font-semibold text-on-surface">{T('alerts', 'noNewSchemes', lang)}</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {T('alerts', 'notifyMatch', lang)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -- Upgrade Prompt -- */}
      <motion.div
        variants={fadeUp}
        custom={5}
        className="bg-gradient-to-r from-secondary to-secondary-container rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[24px]">workspace_premium</span>
          </div>
          <div>
            <p className="font-headline font-bold text-white text-lg">{T('alerts', 'upgradePro', lang)}</p>
            <p className="text-white/80 text-sm">
              {T('alerts', 'upgradeDesc', lang)}
            </p>
          </div>
        </div>
        <button className="bg-white text-secondary font-bold text-sm px-6 py-3 rounded-xl hover:shadow-lg transition-all whitespace-nowrap">
          {T('alerts', 'upgradeNow', lang)} — {'\u20B9'}199/mo
        </button>
      </motion.div>
    </motion.div>
  );
}
