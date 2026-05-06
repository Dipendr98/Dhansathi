import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchLiveStocks, getMarketOverview } from '@/lib/stockApi';
import {
  getRandomSchemes,
  calculateSchemeMatches,
  calculateUnclaimedBenefits,
  getTopMatches,
} from '@/lib/schemeService';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { T } from '@/lib/translations';
import { calculateSIP, formatINR } from '@/lib/utils';
import type { StockData } from '@/types';

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const lang = useLanguageStore((s) => s.lang);
  // user IS the UserProfile in our store
  const profile = user;
  const hasProfile = !!(profile && (profile.state || profile.annual_income || profile.date_of_birth));

  /* ── Live data state ───────────────────────────────────────────────────── */
  const [topStocks, setTopStocks] = useState<StockData[]>([]);
  const [marketData, setMarketData] = useState<{ nifty: number; change: number; changePct: number } | null>(null);
  const [loadingStocks, setLoadingStocks] = useState(true);

  /* ── Fetch live market data on mount ────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [stocks, overview] = await Promise.all([
          fetchLiveStocks(),
          getMarketOverview(),
        ]);
        if (!cancelled) {
          // Get top 5 movers by absolute change %
          const sorted = [...stocks].sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct));
          setTopStocks(sorted.slice(0, 5));
          setMarketData({
            nifty: overview.nifty50,
            change: overview.nifty50Change,
            changePct: overview.nifty50ChangePct,
          });
        }
      } catch (err) {
        console.error('[DashboardHome] Failed to load market data:', err);
      } finally {
        if (!cancelled) setLoadingStocks(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  /* ── Scheme data (instant, no API call needed) ─────────────────────── */
  const schemeData = useMemo(() => {
    if (hasProfile && profile) {
      const matches = getTopMatches(profile, 3);
      const benefits = calculateUnclaimedBenefits(profile);
      return { matches, benefits, personalized: true };
    }
    // No profile → show random schemes
    const randomSchemes = getRandomSchemes(3);
    return {
      matches: randomSchemes.map((s) => ({ scheme: s, score: 0, reasons: [], missingCriteria: [] })),
      benefits: { totalAmount: 324000, schemeCount: 8, topSchemes: [] },
      personalized: false,
    };
  }, [hasProfile, profile]);

  /* ── SIP projections based on unclaimed benefits ────────────────────── */
  const monthlyAmount = Math.round(schemeData.benefits.totalAmount / 12);
  const sip5yr = calculateSIP(monthlyAmount, 0.12, 5);
  const sip10yr = calculateSIP(monthlyAmount, 0.12, 10);
  const sip20yr = calculateSIP(monthlyAmount, 0.12, 20);

  /* ── Greeting ──────────────────────────────────────────────────────── */
  const greetingText = (() => {
    const h = new Date().getHours();
    if (lang === 'hi') {
      if (h < 12) return 'सुप्रभात';
      if (h < 17) return 'नमस्कार';
      return 'शुभ संध्या';
    }
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'there';

  /* ── Stat cards (dynamic) ─────────────────────────────────────────── */
  const statCards = [
    {
      label: T('home', 'unclaimedBenefits', lang),
      value: formatINR(schemeData.benefits.totalAmount),
      sub: T('home', 'acrossSchemes', lang).replace('{count}', String(schemeData.benefits.schemeCount)),
      icon: 'account_balance',
      border: 'border-tertiary',
      iconBg: 'bg-tertiary-fixed',
      iconColor: 'text-tertiary',
    },
    {
      label: T('home', 'nifty50', lang),
      value: marketData ? marketData.nifty.toLocaleString('en-IN') : '—',
      sub: marketData ? `${marketData.changePct >= 0 ? '▲' : '▼'} ${marketData.changePct >= 0 ? '+' : ''}${marketData.changePct.toFixed(2)}% today` : T('common', 'loading', lang),
      subColor: marketData && marketData.changePct >= 0 ? 'text-india-green' : 'text-error',
      icon: 'trending_up',
      border: 'border-primary',
      iconBg: 'bg-primary-fixed',
      iconColor: 'text-primary',
    },
    {
      label: T('home', 'eligibleSchemes', lang),
      value: schemeData.personalized
        ? schemeData.matches.length.toString()
        : `${schemeData.matches.length}+`,
      sub: schemeData.personalized ? T('home', 'matchedProfile', lang) : T('home', 'completeProfile', lang),
      icon: 'verified',
      border: 'border-secondary',
      iconBg: 'bg-secondary-fixed',
      iconColor: 'text-secondary',
    },
    {
      label: T('home', 'topMovers', lang),
      value: topStocks.length > 0 ? topStocks[0].symbol : '—',
      sub: topStocks.length > 0
        ? `${topStocks[0].change_pct >= 0 ? '+' : ''}${topStocks[0].change_pct.toFixed(2)}% today`
        : T('common', 'loading', lang),
      subColor: topStocks.length > 0 && topStocks[0].change_pct >= 0 ? 'text-india-green' : 'text-error',
      icon: 'rocket_launch',
      border: 'border-saffron',
      iconBg: 'bg-saffron/15',
      iconColor: 'text-saffron',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <p className="text-on-surface-variant font-body text-sm mb-1">{greetingText}, {userName}</p>
        <h1 className="text-3xl font-headline font-bold text-on-surface">{T('home', 'title', lang)}</h1>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`bg-surface-container-lowest rounded-2xl p-5 border-t-4 ${card.border} shadow-ambient transition-transform hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-on-surface-variant text-sm font-medium">{card.label}</p>
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-xl ${card.iconColor}`}>{card.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-mono font-bold text-on-surface">{card.value}</p>
            <p className={`text-xs mt-1 font-medium ${card.subColor ?? 'text-on-surface-variant'}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Crossover banner ───────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-container p-6 md:p-8 text-on-primary shadow-ambient">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">swap_horiz</span>
              <h2 className="font-headline font-bold text-xl">{T('home', 'crossoverTitle', lang)}</h2>
            </div>
            <p className="text-on-primary/80 text-sm max-w-md">
              {schemeData.personalized ? (
                <>You have <span className="font-mono font-bold">{formatINR(schemeData.benefits.totalAmount)}</span> in unclaimed benefits.</>
              ) : (
                <>Indians leave <span className="font-mono font-bold">₹2,00,000 Cr</span> unclaimed every year. Complete your profile to find yours.</>
              )}
              {' '}{T('home', 'seeSIP', lang)}
            </p>
          </div>

          {/* Right - SIP projections */}
          <div className="flex items-center gap-4 md:gap-6">
            {[
              { yr: '5yr', val: formatINR(sip5yr) },
              { yr: '10yr', val: formatINR(sip10yr) },
              { yr: '20yr', val: formatINR(sip20yr) },
            ].map((p) => (
              <div key={p.yr} className="text-center">
                <p className="text-on-primary/60 text-[10px] font-bold uppercase tracking-wider">{p.yr}</p>
                <p className="font-mono font-bold text-xl">{p.val}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <Link
            to="/dashboard/crossover"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
            {T('home', 'exploreCrossover', lang)}
          </Link>
        </div>
      </div>

      {/* ── AI Insight card ────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-tertiary-fixed/30 border border-tertiary-fixed p-5 md:p-6 shadow-ambient">
        <div className="flex items-start gap-3">
          {/* Pulsing dot */}
          <div className="relative mt-1.5 shrink-0">
            <span className="block w-3 h-3 rounded-full bg-tertiary" />
            <span className="absolute inset-0 w-3 h-3 rounded-full bg-tertiary animate-ping opacity-40" />
          </div>

          <div className="space-y-1">
            <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-xl">psychology</span>
              {T('home', 'aiInsight', lang)}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {marketData ? (
                <>
                  Nifty 50 is trading at <span className="font-mono font-bold">{marketData.nifty.toLocaleString('en-IN')}</span>
                  {' '}({marketData.changePct >= 0 ? '+' : ''}{marketData.changePct.toFixed(2)}%).
                  {' '}{topStocks.length > 0 && (
                    <>
                      Top mover today: <span className="font-bold">{topStocks[0].symbol}</span> at
                      {' '}<span className="font-mono">{topStocks[0].change_pct >= 0 ? '+' : ''}{topStocks[0].change_pct.toFixed(2)}%</span>.
                    </>
                  )}
                  {' '}{schemeData.personalized && schemeData.benefits.schemeCount > 0 && (
                    <>You have {schemeData.benefits.schemeCount} eligible schemes with potential benefits of {formatINR(schemeData.benefits.totalAmount)}.</>
                  )}
                </>
              ) : (
                T('home', 'loadingInsights', lang)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Split layout: Top schemes + Top Movers ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Scheme Matches */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline font-bold text-lg text-on-surface">
              {schemeData.personalized ? T('home', 'topSchemeMatches', lang) : T('home', 'featuredSchemes', lang)}
            </h2>
            <Link
              to="/dashboard/schemes"
              className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1"
            >
              {T('home', 'viewAll', lang)}
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </Link>
          </div>

          <div className="space-y-4">
            {schemeData.matches.map((match) => {
              const scheme = match.scheme;
              return (
                <div
                  key={scheme.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm truncate">{scheme.name}</p>
                    {scheme.name_hi && (
                      <p className="text-on-surface-variant text-xs">{scheme.name_hi}</p>
                    )}
                    <p className="text-[10px] font-mono text-tertiary font-bold">{scheme.benefits}</p>
                  </div>
                  {match.score > 0 ? (
                    <div className="shrink-0 ml-4 w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
                      <span className="font-mono font-bold text-primary text-sm">{match.score}%</span>
                    </div>
                  ) : (
                    <div className="shrink-0 ml-4">
                      <span className="material-symbols-outlined text-xl text-on-surface-variant">chevron_right</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Market Movers */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline font-bold text-lg text-on-surface">{T('home', 'topMarketMovers', lang)}</h2>
            <Link
              to="/dashboard/stocks"
              className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1"
            >
              {T('home', 'screener', lang)}
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </Link>
          </div>

          {loadingStocks ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {topStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                    <span className={`material-symbols-outlined text-xl ${stock.change_pct >= 0 ? 'text-india-green' : 'text-error'}`}>
                      {stock.change_pct >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-on-surface text-sm">{stock.symbol}</p>
                    <p className="text-on-surface-variant text-xs truncate">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-on-surface text-sm">
                      ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`font-mono font-bold text-xs ${stock.change_pct >= 0 ? 'text-india-green' : 'text-error'}`}>
                      {stock.change_pct >= 0 ? '+' : ''}{stock.change_pct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
