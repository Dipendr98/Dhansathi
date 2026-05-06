import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useLanguageStore } from '@/stores/languageStore';
import { T } from '@/lib/translations';
import { fetchLiveStocks, searchAndFetchStocks } from '@/lib/stockApi';
import type { StockData } from '@/types';

/* ── Animation helpers ─────────────────────────── */

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

/* ── Types & data ──────────────────────────────── */

interface RiskProfile {
  label: string;
  rate: number;
  color: string;
  bgClass: string;
  activeClass: string;
}

const RISK_PROFILES: RiskProfile[] = [
  { label: 'Low', rate: 7, color: '#138808', bgClass: 'bg-surface-container-low', activeClass: 'bg-tertiary text-white' },
  { label: 'Moderate', rate: 12, color: '#006194', bgClass: 'bg-surface-container-low', activeClass: 'bg-primary text-white' },
  { label: 'High', rate: 15, color: '#FF9933', bgClass: 'bg-surface-container-low', activeClass: 'bg-saffron text-white' },
];

const FUND_CATEGORIES = [
  { name: 'Large Cap Index (Nifty 50)', y1: '12.5%', y3: '14.2%', y5: 12.8, y10: '13.1%' },
  { name: 'Flexi Cap Fund', y1: '15.8%', y3: '16.5%', y5: 14.2, y10: '15.0%' },
  { name: 'ELSS Tax Saver', y1: '18.2%', y3: '15.8%', y5: 13.5, y10: '14.5%' },
  { name: 'Mid Cap Fund', y1: '22.5%', y3: '19.2%', y5: 16.1, y10: '17.2%' },
  { name: 'Small Cap Fund', y1: '28.1%', y3: '22.5%', y5: 18.5, y10: '19.8%' },
  { name: 'Balanced Advantage', y1: '11.2%', y3: '12.8%', y5: 11.5, y10: '12.0%' },
];

const SCHEME_SIP_MAP = [
  {
    scheme: 'PM Kisan Samman Nidhi',
    annualBenefit: '₹6,000',
    sipPotential: '₹500/mo',
    tenYrValue: '₹1,15,019',
  },
  {
    scheme: 'LIC Unclaimed Maturity',
    annualBenefit: '₹2,40,000',
    sipPotential: '₹20,000/mo',
    tenYrValue: '₹46,00,759',
  },
  {
    scheme: 'EPF Dormant Balance',
    annualBenefit: '₹78,000',
    sipPotential: '₹6,500/mo',
    tenYrValue: '₹14,95,247',
  },
];

/* ── SIP Calculator ────────────────────────────── */

function calculateSIP(monthly: number, ratePercent: number, years: number): number {
  const r = ratePercent / 100 / 12;
  const n = years * 12;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

function formatINR(amount: number): string {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`;
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(2)} L`;
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
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

function formatStockPrice(stock: StockData): string {
  return `${getCurrencySymbol(stock.currency)}${stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateChartData(monthly: number) {
  const data = [];
  for (let year = 0; year <= 25; year++) {
    data.push({
      year: `Yr ${year}`,
      Low: Math.round(calculateSIP(monthly, 7, year)),
      Moderate: Math.round(calculateSIP(monthly, 12, year)),
      High: Math.round(calculateSIP(monthly, 15, year)),
    });
  }
  return data;
}

/* ── Circular Progress Ring ────────────────────── */

function HealthScoreRing({ score }: { score: number }) {
  const radius = 54;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75 ? '#138808' : score >= 50 ? '#FF9933' : '#ba1a1a';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-surface-container-high"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-extrabold text-on-surface">{score}</span>
        <span className="text-xs text-on-surface-variant font-medium">/ 100</span>
      </div>
    </div>
  );
}

/* ── Custom Tooltip ────────────────────────────── */

interface ChartTooltipPayload {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: ChartTooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-outline-variant/20 p-3 text-xs">
      <p className="font-bold text-on-surface mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-mono font-semibold">
          {entry.name}: {formatINR(entry.value)}
        </p>
      ))}
    </div>
  );
}

/* ── Page Component ────────────────────────────── */

export default function CrossoverPage() {
  const lang = useLanguageStore((s) => s.lang);
  const [sipAmount, setSipAmount] = useState(5000);
  const [selectedRisk, setSelectedRisk] = useState(1); // Moderate
  const [liveStocks, setLiveStocks] = useState<StockData[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockSipAmount, setStockSipAmount] = useState(5000);
  const [stockSearch, setStockSearch] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rate = RISK_PROFILES[selectedRisk].rate;

  // Fetch live Nifty 50 stocks
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStocksLoading(true);
      try {
        const data = await fetchLiveStocks();
        if (!cancelled) {
          setLiveStocks(data);
          if (data.length > 0) setSelectedStock(data[0].symbol);
        }
      } catch (err) {
        console.error('[CrossoverPage] Failed to fetch stocks:', err);
      } finally {
        if (!cancelled) setStocksLoading(false);
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
        setSearchResults(results.filter((result) => !liveStocks.some((stock) => stock.symbol === result.symbol)));
        if (results[0]) setSelectedStock(results[0].symbol);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [stockSearch, liveStocks]);

  const stockUniverse = useMemo(() => {
    const seen = new Set<string>();
    return [...liveStocks, ...searchResults].filter((stock) => {
      if (seen.has(stock.symbol)) return false;
      seen.add(stock.symbol);
      return true;
    });
  }, [liveStocks, searchResults]);

  // Top 10 stocks by signal strength for SIP recommendations
  const topSipStocks = useMemo(() => {
    const signalScore = (s: StockData) => {
      if (s.signal === 'strong_buy') return 5;
      if (s.signal === 'buy') return 4;
      if (s.signal === 'hold') return 3;
      if (s.signal === 'sell') return 2;
      return 1;
    };
    return [...stockUniverse]
      .sort((a, b) => signalScore(b) - signalScore(a) || b.change_pct - a.change_pct)
      .slice(0, 10);
  }, [stockUniverse]);

  // Selected stock details
  const activeStock = useMemo(
    () => stockUniverse.find((s) => s.symbol === selectedStock) || null,
    [stockUniverse, selectedStock],
  );

  // Stock SIP projections using the stock's implied annual return
  const stockSipProjections = useMemo(() => {
    if (!activeStock) return null;
    // Use change_pct annualized as a rough estimate, clamped to realistic range
    const impliedAnnual = Math.max(5, Math.min(25, activeStock.change_pct * 52));
    const conservativeRate = Math.max(8, impliedAnnual * 0.6);
    const moderateRate = Math.max(10, impliedAnnual * 0.8);
    const aggressiveRate = Math.max(12, impliedAnnual);
    return {
      conservative: { rate: conservativeRate, y5: calculateSIP(stockSipAmount, conservativeRate, 5), y10: calculateSIP(stockSipAmount, conservativeRate, 10) },
      moderate: { rate: moderateRate, y5: calculateSIP(stockSipAmount, moderateRate, 5), y10: calculateSIP(stockSipAmount, moderateRate, 10) },
      aggressive: { rate: aggressiveRate, y5: calculateSIP(stockSipAmount, aggressiveRate, 5), y10: calculateSIP(stockSipAmount, aggressiveRate, 10) },
      sharesPerMonth: stockSipAmount / activeStock.price,
      totalInvested5: stockSipAmount * 60,
      totalInvested10: stockSipAmount * 120,
    };
  }, [activeStock, stockSipAmount]);

  const projections = useMemo(
    () => ({
      fiveYr: calculateSIP(sipAmount, rate, 5),
      tenYr: calculateSIP(sipAmount, rate, 10),
      twentyYr: calculateSIP(sipAmount, rate, 20),
    }),
    [sipAmount, rate],
  );

  const chartData = useMemo(() => generateChartData(sipAmount), [sipAmount]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-8 pb-16"
    >
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">
          {T('crossover', 'title', lang)}
        </h1>
        <p className="text-on-surface-variant mt-1">
          {T('crossover', 'subtitle', lang)}
        </p>
      </motion.div>

      {/* ── Hero Banner ── */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container p-8 md:p-12 text-white"
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-2">
            {T('crossover', 'yourBenefits', lang)}
          </p>
          <p className="font-mono text-4xl md:text-5xl font-extrabold tracking-tight">
            ₹3,24,000
          </p>
          <p className="text-white/70 mt-3 text-sm max-w-md">
            {T('crossover', 'convertWealth', lang)}
          </p>
        </div>
      </motion.div>

      {/* ── SIP Controls ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly SIP Slider */}
        <motion.div
          variants={fadeUp}
          custom={2}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-on-surface">{T('crossover', 'monthlySIP', lang)}</h3>
            <span className="font-mono text-xl font-extrabold text-primary">
              ₹{sipAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={50000}
            step={500}
            value={sipAmount}
            onChange={(e) => setSipAmount(Number(e.target.value))}
            className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-on-surface-variant mt-2">
            <span className="font-mono">₹500</span>
            <span className="font-mono">₹25,000</span>
            <span className="font-mono">₹50,000</span>
          </div>
        </motion.div>

        {/* Risk Appetite Selector */}
        <motion.div
          variants={fadeUp}
          custom={3}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6"
        >
          <h3 className="font-headline font-bold text-on-surface mb-4">{T('crossover', 'riskAppetite', lang)}</h3>
          <div className="grid grid-cols-2 gap-3">
            {RISK_PROFILES.map((profile, idx) => (
              <button
                key={profile.label}
                onClick={() => setSelectedRisk(idx)}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${selectedRisk === idx
                  ? profile.activeClass + ' shadow-md'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
              >
                {T('crossover', profile.label.toLowerCase() as 'low' | 'moderate' | 'high', lang)}
                <span className="block text-xs opacity-80 mt-0.5">{profile.rate}% p.a.</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── SIP Projection Cards ── */}
      <motion.div variants={fadeUp} custom={4} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: T('crossover', 'years5', lang), value: projections.fiveYr, icon: 'event', color: 'from-tertiary to-tertiary-container' },
          { label: T('crossover', 'years10', lang), value: projections.tenYr, icon: 'trending_up', color: 'from-primary to-primary-container' },
          { label: T('crossover', 'years20', lang), value: projections.twentyYr, icon: 'rocket_launch', color: 'from-saffron to-secondary-container' },
        ].map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color}`} />
            <div className="flex items-center space-x-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                {card.icon}
              </span>
              <span className="text-sm font-semibold text-on-surface-variant">{card.label}</span>
            </div>
            <p className="font-mono text-2xl md:text-3xl font-extrabold text-on-surface">
              {formatINR(card.value)}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {T('crossover', 'atReturn', lang).replace('{rate}', String(rate))}
            </p>
          </div>
        ))}
      </motion.div>

      {/* ── Growth Chart ── */}
      <motion.div
        variants={fadeUp}
        custom={5}
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6"
      >
        <h3 className="font-headline font-bold text-on-surface mb-1">{T('crossover', 'growthProjection', lang)}</h3>
        <p className="text-sm text-on-surface-variant mb-6">
          {T('crossover', 'comparisonDesc', lang)} ₹{sipAmount.toLocaleString('en-IN')}{T('crossover', 'perMonth', lang)}
        </p>
        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="gradLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#138808" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#138808" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMod" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#006194" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#006194" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9933" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: '#707881' }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tickFormatter={(v: number) => formatINR(v)}
                tick={{ fontSize: 11, fill: '#707881' }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="Low"
                stroke="#138808"
                fill="url(#gradLow)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Moderate"
                stroke="#006194"
                fill="url(#gradMod)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="High"
                stroke="#FF9933"
                fill="url(#gradHigh)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── SIP Returns Comparison Table ── */}
      <motion.div
        variants={fadeUp}
        custom={5.5}
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden"
      >
        <div className="p-6 pb-3">
          <h3 className="font-headline font-bold text-on-surface">{T('crossover', 'mfComparison', lang)}</h3>
          <p className="text-sm text-on-surface-variant mt-1">
            {T('crossover', 'mfDesc', lang)}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-outline-variant/20 bg-surface-container-low">
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  {T('crossover', 'fundCategory', lang)}
                </th>
                <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  {T('crossover', 'return1Y', lang)}
                </th>
                <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  {T('crossover', 'return3Y', lang)}
                </th>
                <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  {T('crossover', 'return5Y', lang)}
                </th>
                <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  {T('crossover', 'return10Y', lang)}
                </th>
                <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  SIP ₹5000 (10Y)
                </th>
              </tr>
            </thead>
            <tbody>
              {FUND_CATEGORIES.map((fund, idx) => (
                <tr
                  key={fund.name}
                  className={`border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${idx % 2 === 0 ? '' : 'bg-surface-container-low/30'
                    }`}
                >
                  <td className="px-6 py-4 font-semibold text-on-surface">{fund.name}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-on-surface">{fund.y1}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-on-surface">{fund.y3}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-on-surface">{fund.y5}%</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-on-surface">{fund.y10}</td>
                  <td className="px-6 py-4 text-right font-mono font-extrabold text-primary">
                    {formatINR(calculateSIP(5000, fund.y5, 10))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Financial Health Score + SIP Formula ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Health Score */}
        <motion.div
          variants={fadeUp}
          custom={6}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 text-center"
        >
          <h3 className="font-headline font-bold text-on-surface mb-6">{T('crossover', 'healthScore', lang)}</h3>
          <HealthScoreRing score={72} />
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: T('crossover', 'savings', lang), value: '82%', color: 'text-tertiary' },
              { label: T('crossover', 'debt', lang), value: '65%', color: 'text-saffron' },
              { label: T('crossover', 'invest', lang), value: '70%', color: 'text-primary' },
            ].map((item) => (
              <div key={item.label}>
                <p className={`font-mono text-lg font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-on-surface-variant">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* SIP Formula */}
        <motion.div
          variants={fadeUp}
          custom={7}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6"
        >
          <h3 className="font-headline font-bold text-on-surface mb-4">{T('crossover', 'sipFormula', lang)}</h3>
          <div className="bg-surface-container rounded-xl p-6 text-center">
            <p className="font-mono text-lg md:text-xl font-bold text-primary leading-relaxed">
              FV = P × [{'{'}(1+r)<sup>n</sup> - 1{'}'}/r] × (1+r)
            </p>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { symbol: 'FV', desc: T('crossover', 'futureValue', lang) },
              { symbol: 'P', desc: `${T('crossover', 'monthlyAmount', lang)} (₹${sipAmount.toLocaleString('en-IN')})` },
              { symbol: 'r', desc: `${T('crossover', 'monthlyRate', lang)} (${(rate / 12).toFixed(2)}%)` },
              { symbol: 'n', desc: T('crossover', 'totalInstall', lang) },
            ].map((item) => (
              <div key={item.symbol} className="flex items-start space-x-3">
                <span className="font-mono text-sm font-bold text-primary bg-primary-fixed px-2 py-1 rounded-lg min-w-[32px] text-center">
                  {item.symbol}
                </span>
                <span className="text-sm text-on-surface-variant">{item.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Scheme-to-SIP Mapper ── */}
      <motion.div
        variants={fadeUp}
        custom={8}
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden"
      >
        <div className="p-6 pb-3">
          <h3 className="font-headline font-bold text-on-surface">{T('crossover', 'schemeToSIP', lang)}</h3>
          <p className="text-sm text-on-surface-variant mt-1">
            {T('crossover', 'convertBenefits', lang)}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-outline-variant/20 bg-surface-container-low">
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  {T('crossover', 'scheme', lang)}
                </th>
                <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  {T('crossover', 'annualBenefit', lang)}
                </th>
                <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  {T('crossover', 'sipPotential', lang)}
                </th>
                <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">
                  {T('crossover', 'tenYrValue', lang)}
                </th>
              </tr>
            </thead>
            <tbody>
              {SCHEME_SIP_MAP.map((row, idx) => (
                <tr
                  key={row.scheme}
                  className={`border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${idx % 2 === 0 ? '' : 'bg-surface-container-low/30'
                    }`}
                >
                  <td className="px-6 py-4 font-semibold text-on-surface">{row.scheme}</td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-on-surface">
                    {row.annualBenefit}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-tertiary">
                    {row.sipPotential}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-extrabold text-primary">
                    {row.tenYrValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── 📈 Real Stock SIP Simulator ── */}
      <motion.div variants={fadeUp} custom={9}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-india-green to-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">candlestick_chart</span>
          </div>
          <div>
            <h2 className="font-headline text-xl font-extrabold text-on-surface">
              {lang === 'hi' ? 'स्टॉक SIP सिम्युलेटर' : 'Stock SIP Simulator'}
            </h2>
            <p className="text-sm text-on-surface-variant">
              {lang === 'hi' ? 'भारत और अंतरराष्ट्रीय स्टॉक्स के साथ SIP प्रोजेक्शन' : 'SIP projections for Indian and international stocks'}
            </p>
          </div>
        </div>

        {stocksLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm font-medium">
              {lang === 'hi' ? 'लाइव स्टॉक डेटा लोड हो रहा है...' : 'Loading live stock data...'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stock Picker + SIP Amount */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Stock Selector */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6">
                <h3 className="font-headline font-bold text-on-surface mb-4">
                  {lang === 'hi' ? 'स्टॉक खोजें और चुनें' : 'Search and Pick a Stock'}
                </h3>
                <input
                  type="text"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  placeholder="Tesla, AAPL, NVDA, RELIANCE..."
                  className="w-full mb-3 px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {searching && (
                  <p className="mb-3 text-xs font-semibold text-primary">
                    {lang === 'hi' ? 'दुनिया भर के स्टॉक्स खोजे जा रहे हैं...' : 'Searching stocks worldwide...'}
                  </p>
                )}
                <select
                  value={selectedStock || ''}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {stockUniverse.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} — {formatStockPrice(s)} ({s.change_pct >= 0 ? '+' : ''}{s.change_pct.toFixed(2)}%)
                    </option>
                  ))}
                </select>

                {activeStock && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-surface-container-low rounded-xl p-3 text-center">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">CMP</p>
                      <p className="font-mono text-sm font-bold text-on-surface">{formatStockPrice(activeStock)}</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-3 text-center">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">RSI</p>
                      <p className="font-mono text-sm font-bold text-on-surface">{activeStock.rsi_14}</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-3 text-center">
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Signal</p>
                      <p className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block ${activeStock.signal === 'strong_buy' || activeStock.signal === 'buy' ? 'bg-india-green text-white' : activeStock.signal === 'hold' ? 'bg-outline text-white' : 'bg-error text-white'}`}>
                        {activeStock.signal.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock SIP Amount */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline font-bold text-on-surface">
                    {lang === 'hi' ? 'मासिक SIP राशि' : 'Monthly SIP Amount'}
                  </h3>
                  <span className="font-mono text-xl font-extrabold text-primary">
                    ₹{stockSipAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={50000}
                  step={500}
                  value={stockSipAmount}
                  onChange={(e) => setStockSipAmount(Number(e.target.value))}
                  className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
                />
                {activeStock && stockSipProjections && (
                  <p className="text-xs text-on-surface-variant mt-3">
                    ≈ <span className="font-mono font-bold">{stockSipProjections.sharesPerMonth.toFixed(2)}</span> {lang === 'hi' ? 'शेयर/माह' : 'shares/month'} @ {formatStockPrice(activeStock)}
                  </p>
                )}
              </div>
            </div>

            {/* Stock SIP Projection Cards */}
            {stockSipProjections && activeStock && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: lang === 'hi' ? 'कंजर्वेटिव (5Y)' : 'Conservative (5Y)', value: stockSipProjections.conservative.y5, rate: stockSipProjections.conservative.rate, color: 'from-tertiary to-tertiary-container', icon: 'shield' },
                  { label: lang === 'hi' ? 'मॉडरेट (5Y)' : 'Moderate (5Y)', value: stockSipProjections.moderate.y5, rate: stockSipProjections.moderate.rate, color: 'from-primary to-primary-container', icon: 'balance' },
                  { label: lang === 'hi' ? 'एग्रेसिव (5Y)' : 'Aggressive (5Y)', value: stockSipProjections.aggressive.y5, rate: stockSipProjections.aggressive.rate, color: 'from-saffron to-secondary-container', icon: 'rocket_launch' },
                ].map((card) => (
                  <div key={card.label} className="relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 hover:shadow-lg transition-shadow">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color}`} />
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{card.icon}</span>
                      <span className="text-sm font-semibold text-on-surface-variant">{card.label}</span>
                    </div>
                    <p className="font-mono text-2xl font-extrabold text-on-surface">{formatINR(card.value)}</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {lang === 'hi' ? `${card.rate.toFixed(1)}% वार्षिक रिटर्न पर` : `at ${card.rate.toFixed(1)}% p.a. return`}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {lang === 'hi' ? 'निवेश:' : 'Invested:'} {formatINR(stockSipProjections.totalInvested5)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Top SIP-Worthy Stocks Table */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
              <div className="p-6 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-india-green">verified</span>
                  <h3 className="font-headline font-bold text-on-surface">
                    {lang === 'hi' ? 'SIP के लिए टॉप स्टॉक्स (लाइव)' : 'Top SIP-Worthy Stocks (Live)'}
                  </h3>
                </div>
                <p className="text-sm text-on-surface-variant mt-1">
                  {lang === 'hi' ? 'सिग्नल स्ट्रेंथ और मोमेंटम के आधार पर रैंक किया गया' : 'Ranked by signal strength and momentum from the loaded stock universe'}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-outline-variant/20 bg-surface-container-low">
                      <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Stock</th>
                      <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">CMP</th>
                      <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Change</th>
                      <th className="text-center px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">Signal</th>
                      <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">SIP ₹5K (5Y)</th>
                      <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs uppercase tracking-wider">SIP ₹5K (10Y)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSipStocks.map((stock, idx) => {
                      const impliedRate = Math.max(10, Math.min(20, stock.change_pct * 52 * 0.8));
                      const sip5y = calculateSIP(5000, impliedRate, 5);
                      const sip10y = calculateSIP(5000, impliedRate, 10);
                      const isPositive = stock.change_pct >= 0;
                      const signalColor = stock.signal === 'strong_buy' || stock.signal === 'buy'
                        ? 'bg-india-green text-white'
                        : stock.signal === 'hold' ? 'bg-outline text-white' : 'bg-error text-white';

                      return (
                        <tr
                          key={stock.symbol}
                          onClick={() => setSelectedStock(stock.symbol)}
                          className={`border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer ${idx % 2 === 0 ? '' : 'bg-surface-container-low/30'} ${selectedStock === stock.symbol ? 'ring-2 ring-primary/30 bg-primary-fixed/20' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-on-surface">{stock.symbol}</p>
                            <p className="text-xs text-on-surface-variant truncate max-w-[150px]">{stock.name}</p>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-on-surface">
                            {formatStockPrice(stock)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-mono font-bold ${isPositive ? 'text-india-green' : 'text-error'}`}>
                              {isPositive ? '+' : ''}{stock.change_pct.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md ${signalColor}`}>
                              {stock.signal.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-semibold text-tertiary">
                            {formatINR(sip5y)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-extrabold text-primary">
                            {formatINR(sip10y)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 bg-surface-container-low border-t border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant">
                  ⚠️ {lang === 'hi' ? 'अस्वीकरण: ये अनुमान ऐतिहासिक डेटा पर आधारित हैं। वास्तविक रिटर्न भिन्न हो सकते हैं। निवेश बाजार जोखिमों के अधीन है।' : 'Disclaimer: Projections are estimates based on current momentum. Actual returns may vary. Investments are subject to market risks.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
