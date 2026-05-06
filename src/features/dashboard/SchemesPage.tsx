import { useEffect, useState, useMemo } from 'react';
import {
  calculateSchemeMatches,
  calculateUnclaimedBenefits,
  searchSchemes as searchSchemesService,
} from '@/lib/schemeService';
import { getPrimarySchemeCategory, loadLiveSchemeFeed, mergeSchemeFeeds, type LiveSchemeFeed } from '@/lib/liveSchemeFeed';
import { useAuthStore } from '@/stores/authStore';
import type { SchemeType, GovernmentScheme } from '@/types';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/stores/languageStore';
import { T } from '@/lib/translations';

/* ─── Category tag color map ────────────────────────────────────────────── */

function categoryTag(ministry: string): { label: string; cls: string } {
  const m = ministry.toLowerCase();
  if (m.includes('health')) return { label: 'Health', cls: 'bg-secondary-fixed text-secondary' };
  if (m.includes('finance') || m.includes('pension') || m.includes('labour')) return { label: 'Finance', cls: 'bg-primary-fixed text-primary' };
  if (m.includes('education') || m.includes('skill')) return { label: 'Education', cls: 'bg-surface-variant text-on-surface-variant' };
  if (m.includes('agriculture') || m.includes('farmer')) return { label: 'Agriculture', cls: 'bg-tertiary-fixed text-tertiary' };
  if (m.includes('housing') || m.includes('urban')) return { label: 'Housing', cls: 'bg-saffron/20 text-saffron' };
  if (m.includes('women') || m.includes('child')) return { label: 'Women', cls: 'bg-error-container text-error' };
  if (m.includes('rural') || m.includes('panchayati')) return { label: 'Rural', cls: 'bg-india-green/10 text-india-green' };
  if (m.includes('food')) return { label: 'Food', cls: 'bg-saffron/10 text-saffron' };
  if (m.includes('energy') || m.includes('petroleum') || m.includes('power')) return { label: 'Energy', cls: 'bg-primary-fixed text-primary' };
  if (m.includes('social') || m.includes('empowerment')) return { label: 'Social', cls: 'bg-secondary-fixed text-secondary' };
  return { label: 'General', cls: 'bg-surface-container-high text-on-surface-variant' };
}

/* ─── Filter types ───────────────────────────────────────────────────────── */

type FilterType = 'all' | SchemeType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'central', label: 'Central' },
  { key: 'state', label: 'State' },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function SchemesPage() {
  const lang = useLanguageStore((s) => s.lang);
  const user = useAuthStore((s) => s.user);
  // user IS the UserProfile in our store
  const profile = user;

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [liveFeed, setLiveFeed] = useState<LiveSchemeFeed | null>(null);

  useEffect(() => {
    let mounted = true;

    loadLiveSchemeFeed().then((feed) => {
      if (mounted) setLiveFeed(feed);
    });

    return () => {
      mounted = false;
    };
  }, []);

  /* ── Determine data source based on user profile ───────────────────────── */
  // If user has filled profile details → show personalized matches
  // If no profile → show random diverse schemes
  const hasProfile = !!(profile && (profile.state || profile.annual_income || profile.date_of_birth));

  const allSchemes = useMemo(() => mergeSchemeFeeds(liveFeed?.schemes || []), [liveFeed]);

  const schemeMatches = useMemo(() => {
    if (hasProfile && profile) {
      return calculateSchemeMatches(profile, allSchemes);
    }
    return null;
  }, [hasProfile, profile, allSchemes]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const scheme of allSchemes) {
      const category = getPrimarySchemeCategory(scheme);
      counts.set(category, (counts.get(category) || 0) + 1);
    }

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [allSchemes]);

  const unclaimedBenefits = useMemo(() => {
    if (hasProfile && profile) {
      return calculateUnclaimedBenefits(profile);
    }
    return null;
  }, [hasProfile, profile]);

  /* ── Display schemes (either matched or general) ───────────────────────── */
  const displaySchemes = useMemo(() => {
    let schemes: GovernmentScheme[];

    if (schemeMatches) {
      // User has profile → show schemes sorted by match score
      schemes = schemeMatches.map((m) => m.scheme);
    } else {
      // No profile → show all schemes (random order on first visit)
      schemes = allSchemes;
    }

    // Apply type filter
    if (activeFilter !== 'all') {
      schemes = schemes.filter((s) => s.type === activeFilter);
    }

    if (activeCategory !== 'all') {
      schemes = schemes.filter((s) => getPrimarySchemeCategory(s) === activeCategory);
    }

    // Apply search
    if (search.trim()) {
      schemes = searchSchemesService(search, schemes);
    }

    return schemes;
  }, [schemeMatches, allSchemes, activeFilter, activeCategory, search]);

  const schemesByCategory = useMemo(() => {
    const groups = new Map<string, GovernmentScheme[]>();
    for (const scheme of displaySchemes) {
      const category = getPrimarySchemeCategory(scheme);
      groups.set(category, [...(groups.get(category) || []), scheme]);
    }

    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  }, [displaySchemes]);

  /* ── Get match score for a scheme ──────────────────────────────────────── */
  function getMatchScore(schemeId: string): number | null {
    if (!schemeMatches) return null;
    const match = schemeMatches.find((m) => m.scheme.id === schemeId);
    return match ? match.score : null;
  }

  /* Eligibility stats */
  const eligibleCount = schemeMatches ? schemeMatches.filter((m) => m.score >= 60).length : 0;
  const totalBenefits = unclaimedBenefits
    ? `₹${unclaimedBenefits.totalAmount.toLocaleString('en-IN')}`
    : '—';
  const eligibilityScore = schemeMatches
    ? Math.round(schemeMatches.reduce((sum, m) => sum + m.score, 0) / Math.max(1, schemeMatches.length))
    : 0;

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-on-surface-variant font-body text-sm mb-1">
            {hasProfile ? T('schemes', 'personalized', lang) : T('schemes', 'completeForMatch', lang)}
          </p>
          <h1 className="text-3xl font-headline font-bold text-on-surface">{T('schemes', 'title', lang)}</h1>
          <p className="text-xs text-on-surface-variant mt-2">
            Live catalog from myScheme. Last synced:{' '}
            <span className="font-semibold text-on-surface">
              {liveFeed?.meta?.updated_at
                ? new Date(liveFeed.meta.updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : 'static fallback'}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-2xl text-primary">{allSchemes.length.toLocaleString('en-IN')}+</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">{T('schemes', 'schemesCount', lang)}</p>
          {!!liveFeed?.meta?.new_count && (
            <p className="mt-1 text-[10px] font-bold text-tertiary">{liveFeed.meta.new_count} new today</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-5">
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Official Source</p>
          <p className="mt-1 font-headline font-bold text-on-surface">myScheme, Government of India</p>
          <a
            href="https://www.myscheme.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            Visit source <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-5">
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Categories</p>
          <p className="mt-1 font-mono font-bold text-2xl text-primary">{categories.length}</p>
          <p className="text-xs text-on-surface-variant">Grouped for faster discovery</p>
        </div>
        <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-5">
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">New Launches</p>
          <p className="mt-1 font-mono font-bold text-2xl text-tertiary">{liveFeed?.meta?.new_count || 0}</p>
          <p className="text-xs text-on-surface-variant">Detected since last sync</p>
        </div>
      </div>

      {/* ── Profile completion prompt (if no profile) ────────────────────── */}
      {!hasProfile && (
        <div className="rounded-2xl bg-gradient-to-r from-saffron/10 via-white to-india-green/10 border border-saffron/20 p-5 md:p-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-2xl text-saffron mt-0.5">person_add</span>
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-on-surface">{T('schemes', 'completeYourProfile', lang)}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
{T('schemes', 'addDetails', lang)}
              </p>
              <a
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-bold text-sm px-4 py-2 rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
{T('schemes', 'goToSettings', lang)}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Eligibility summary card (only if profile exists) ────────────── */}
      {hasProfile && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-ambient">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Score ring */}
            <div className="relative shrink-0 w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="10" className="text-surface-container-high" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke="currentColor" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(eligibilityScore / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-bold text-2xl text-primary">{eligibilityScore}%</span>
              </div>
            </div>

            {/* Summary text */}
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="font-headline font-bold text-xl text-on-surface">{T('schemes', 'eligibilitySummary', lang)}</h2>
              <p className="text-sm text-on-surface-variant">
{T('schemes', 'eligibleFor', lang)} <span className="font-bold text-on-surface">{eligibleCount} {T('schemes', 'schemesWith', lang)}</span>{' '}
                <span className="font-mono font-bold text-tertiary">{totalBenefits}</span> {T('schemes', 'perYear', lang)}
              </p>
              <p className="text-xs text-on-surface-variant">
{T('schemes', 'updateDetails', lang)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter pills + Search ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Filter pills */}
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                activeFilter === f.key
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
              )}
            >
{f.key === 'all' ? T('schemes', 'all', lang) : f.key === 'central' ? T('schemes', 'central', lang) : T('schemes', 'state', lang)}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={T('schemes', 'searchPlaceholder', lang)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors',
            activeCategory === 'all'
              ? 'bg-tertiary text-white'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
          )}
        >
          All categories
        </button>
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors',
              activeCategory === category.name
                ? 'bg-tertiary text-white'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
            )}
          >
            {category.name} <span className="font-mono opacity-75">({category.count})</span>
          </button>
        ))}
      </div>

      {/* ── Scheme cards grid ──────────────────────────────────────────────── */}
      {displaySchemes.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">search_off</span>
          <p className="text-on-surface-variant font-medium">{T('schemes', 'noMatch', lang)}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {schemesByCategory.map(([category, schemes]) => (
            <section key={category} className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div>
                  <h2 className="font-headline font-bold text-xl text-on-surface">{category}</h2>
                  <p className="text-xs text-on-surface-variant">{schemes.length} schemes in this category</p>
                </div>
                <span className="font-mono text-sm font-bold text-primary">{schemes.filter((scheme) => scheme.is_new).length} new</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {schemes.map((scheme) => {
            const cat = categoryTag(scheme.ministry);
            const score = getMatchScore(scheme.id);

            return (
              <div
                key={scheme.id}
                className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient flex flex-col transition-transform hover:-translate-y-0.5"
              >
                {/* Top row: name + match badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-headline font-bold text-on-surface text-sm leading-snug truncate">
                      {scheme.name}
                    </h3>
                    {scheme.name_hi && (
                      <p className="text-on-surface-variant text-xs mt-0.5">{scheme.name_hi}</p>
                    )}
                  </div>
                  {score !== null ? (
                    <div className={cn(
                      'shrink-0 w-11 h-11 rounded-full flex items-center justify-center',
                      score >= 80 ? 'bg-india-green/15' : score >= 60 ? 'bg-primary-fixed' : 'bg-surface-container-high',
                    )}>
                      <span className={cn(
                        'font-mono font-bold text-xs',
                        score >= 80 ? 'text-india-green' : score >= 60 ? 'text-primary' : 'text-on-surface-variant',
                      )}>
                        {score}%
                      </span>
                    </div>
                  ) : (
                    <div className="shrink-0 w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-on-surface-variant">info</span>
                    </div>
                  )}
                </div>

                {/* Ministry tag + category */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cat.cls}`}>
                    {cat.label}
                  </span>
                  {scheme.is_new && (
                    <span className="text-[10px] font-bold text-white bg-tertiary px-2 py-0.5 rounded-md">
                      New
                    </span>
                  )}
                  <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">
                    {scheme.type === 'central' ? 'Central' : 'State'}
                  </span>
                </div>

                {/* Benefit amount */}
                <p className="font-mono font-bold text-lg text-on-surface mb-3">{scheme.benefits}</p>

                {/* Description */}
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4 line-clamp-2 flex-1">
                  {scheme.description}
                </p>

                {/* Documents required */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
{T('schemes', 'docsRequired', lang)}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {scheme.documents_required.slice(0, 4).map((doc) => (
                      <span
                        key={doc}
                        className="text-[10px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md"
                      >
                        {doc}
                      </span>
                    ))}
                    {scheme.documents_required.length > 4 && (
                      <span className="text-[10px] text-primary font-semibold px-2 py-0.5">
                        +{scheme.documents_required.length - 4} {T('schemes', 'more', lang)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                {scheme.application_url ? (
                  <a
                    href={scheme.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-bold text-sm px-4 py-2.5 rounded-xl transition-colors w-full"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
{T('schemes', 'applyNow', lang)}
                  </a>
                ) : (
                  <div className="mt-auto inline-flex items-center justify-center gap-2 bg-surface-container-high text-on-surface-variant font-bold text-sm px-4 py-2.5 rounded-xl w-full">
                    <span className="material-symbols-outlined text-lg">info</span>
{T('schemes', 'visitOffice', lang)}
                  </div>
                )}
              </div>
            );
          })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ── Scheme count footer ──────────────────────────────────────────── */}
      <div className="text-center py-4">
        <p className="text-xs text-on-surface-variant">
{T('schemes', 'showing', lang)} <span className="font-bold">{displaySchemes.length}</span> {T('schemes', 'of', lang)}{' '}
          <span className="font-bold">{allSchemes.length}</span> {T('schemes', 'govSchemes', lang)}
          {' '}Data sourced from myScheme and local curated fallback.
        </p>
      </div>
    </div>
  );
}
