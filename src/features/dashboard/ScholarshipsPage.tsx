import { useEffect, useMemo, useState } from 'react';
import { SCHOLARSHIP_SOURCES } from '@/data/scholarshipSources';
import { cn } from '@/lib/utils';
import { CustomSelect } from '@/components/shared/CustomSelect';

type ScholarshipLevel =
  | 'school'
  | 'diploma'
  | 'graduation'
  | 'postgraduation'
  | 'phd'
  | 'technical'
  | 'abroad';

type ScholarshipProvider = 'central' | 'state' | 'public-sector';
type LevelFilter = 'all' | ScholarshipLevel;
type ProviderFilter = 'all' | ScholarshipProvider;

export interface LiveScholarship {
  id: string;
  name: string;
  provider: ScholarshipProvider;
  department: string;
  education_levels: ScholarshipLevel[];
  target_groups: string[];
  benefits: string;
  eligibility: string;
  documents_required: string[];
  application_url: string;
  portal: string;
  source: string;
  source_url: string;
  specifications_url?: string;
  faq_url?: string;
  schemeOpenDate?: string;
  studentApplicationCloseDate?: string;
  deadline_hint: string;
  status: 'open' | 'expired';
  state?: string;
  university?: string;
  programs?: string[];
}

interface ScholarshipFeed {
  meta?: {
    source: string;
    source_url?: string;
    fetched_at: string;
    total: number;
    include_expired?: boolean;
  };
  scholarships: LiveScholarship[];
  error?: string;
}

const LEVEL_LABELS: Record<ScholarshipLevel, string> = {
  school: 'School',
  diploma: 'Diploma',
  graduation: 'Graduation',
  postgraduation: 'Post Graduation',
  phd: 'PhD / Research',
  technical: 'Technical / Professional',
  abroad: 'Study Abroad',
};

const LEVEL_FILTERS: { key: LevelFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'school', label: 'School', icon: 'school' },
  { key: 'diploma', label: 'Diploma', icon: 'workspace_premium' },
  { key: 'graduation', label: 'Graduation', icon: 'cast_for_education' },
  { key: 'postgraduation', label: 'Post Graduation', icon: 'local_library' },
  { key: 'phd', label: 'PhD', icon: 'science' },
  { key: 'technical', label: 'Technical', icon: 'engineering' },
  { key: 'abroad', label: 'Study Abroad', icon: 'flight_takeoff' },
];

const PROVIDER_FILTERS: { key: ProviderFilter; label: string }[] = [
  { key: 'all', label: 'All Sources' },
  { key: 'central', label: 'Central Govt' },
  { key: 'state', label: 'State Govt' },
  { key: 'public-sector', label: 'Public Sector' },
];

function providerTag(provider: ScholarshipProvider): { label: string; cls: string } {
  if (provider === 'central') return { label: 'Central', cls: 'bg-primary-fixed text-primary' };
  if (provider === 'state') return { label: 'State', cls: 'bg-tertiary-fixed text-tertiary' };
  return { label: 'Public Sector', cls: 'bg-secondary-fixed text-secondary' };
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function scholarshipMatchesSearch(scholarship: LiveScholarship, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return [
    scholarship.name,
    scholarship.department,
    scholarship.portal,
    scholarship.benefits,
    scholarship.eligibility,
    scholarship.state || '',
    scholarship.university || '',
    ...(scholarship.programs || []),
    ...scholarship.target_groups,
    ...scholarship.education_levels.map((level) => LEVEL_LABELS[level]),
  ]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

function formatDate(value?: string) {
  if (!value) return null;
  return new Date(`${value}T00:00:00+05:30`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ScholarshipsPage() {
  const [activeLevel, setActiveLevel] = useState<LevelFilter>('all');
  const [activeProvider, setActiveProvider] = useState<ProviderFilter>('all');
  const [activeState, setActiveState] = useState<string>('all');
  const [activeUniversity, setActiveUniversity] = useState<string>('all');
  const [activeProgram, setActiveProgram] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [feed, setFeed] = useState<ScholarshipFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const day = new Date().toISOString().split('T')[0];
    const cacheKey = `dhansathi-live-scholarships-v5:${day}`;

    async function loadScholarships() {
      setLoading(true);
      setError(null);

      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as ScholarshipFeed;
          if (mounted) setFeed(parsed);
          return;
        }

        let response;
        try {
          response = await fetch(`/scholarships.json?day=${day}`, { cache: 'no-store' });
          if (!response.ok) throw new Error('JSON missing');
        } catch {
          // Fallback to live scrape if static JSON is missing
          response = await fetch(`/api/scholarships?day=${day}`, { cache: 'no-store' });
        }
        
        if (!response.ok) throw new Error(`Live scholarship fetch failed: ${response.status}`);

        const nextFeed = (await response.json()) as ScholarshipFeed;
        if (nextFeed.error) throw new Error(nextFeed.error);

        localStorage.setItem(cacheKey, JSON.stringify(nextFeed));
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('dhansathi-live-scholarships') && key !== cacheKey) {
            localStorage.removeItem(key);
          }
        }

        if (mounted) setFeed(nextFeed);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unable to load live scholarship data.');
          setFeed(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadScholarships();

    return () => {
      mounted = false;
    };
  }, []);

  const scholarships = feed?.scholarships || [];

  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    scholarships.forEach(s => s.state && states.add(s.state));
    return Array.from(states).sort();
  }, [scholarships]);

  const uniqueUniversities = useMemo(() => {
    const universities = new Set<string>();
    scholarships.forEach(s => s.university && universities.add(s.university));
    return Array.from(universities).sort();
  }, [scholarships]);

  const uniquePrograms = useMemo(() => {
    const programs = new Set<string>();
    scholarships.forEach(s => s.programs?.forEach(p => programs.add(p)));
    return Array.from(programs).sort();
  }, [scholarships]);

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((scholarship) => {
      const levelMatch = activeLevel === 'all' || scholarship.education_levels.includes(activeLevel);
      const providerMatch = activeProvider === 'all' || scholarship.provider === activeProvider;
      const stateMatch = activeState === 'all' || scholarship.state === activeState;
      const universityMatch = activeUniversity === 'all' || scholarship.university === activeUniversity;
      const programMatch = activeProgram === 'all' || (scholarship.programs && scholarship.programs.includes(activeProgram));
      
      return levelMatch && providerMatch && stateMatch && universityMatch && programMatch && scholarshipMatchesSearch(scholarship, search);
    });
  }, [activeLevel, activeProvider, activeState, activeUniversity, activeProgram, scholarships, search]);

  const levelCounts = useMemo(() => {
    return LEVEL_FILTERS.reduce<Record<string, number>>((acc, filter) => {
      if (filter.key === 'all') {
        acc[filter.key] = scholarships.length;
      } else {
        const level = filter.key;
        acc[filter.key] = scholarships.filter((scholarship) => scholarship.education_levels.includes(level)).length;
      }
      return acc;
    }, {});
  }, [scholarships]);

  const centralCount = scholarships.filter((s) => s.provider === 'central').length;
  const stateCount = scholarships.filter((s) => s.provider === 'state').length;
  const publicSectorCount = scholarships.filter((s) => s.provider === 'public-sector').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-on-surface-variant font-body text-sm mb-1">
            Live scholarships for Indian students across education levels
          </p>
          <h1 className="text-3xl font-headline font-bold text-on-surface">Government Scholarships</h1>
          <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
            This page fetches current scholarship data from official/public sources instead of saving scholarship records
            in the website code. Expired student application windows are filtered out automatically.
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            Last live fetch:{' '}
            <span className="font-semibold text-on-surface">
              {feed?.meta?.fetched_at
                ? new Date(feed.meta.fetched_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : loading
                  ? 'loading'
                  : 'not available'}
            </span>
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:min-w-[360px]">
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-4 text-center">
            <p className="font-mono font-bold text-2xl text-primary">{scholarships.length}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Open Now</p>
          </div>
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-4 text-center">
            <p className="font-mono font-bold text-2xl text-tertiary">{centralCount}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Central</p>
          </div>
          <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-4 text-center">
            <p className="font-mono font-bold text-2xl text-secondary">{stateCount + publicSectorCount}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Other</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-primary-fixed via-white to-tertiary-fixed/60 border border-outline-variant/20 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-3xl text-primary mt-0.5">sync</span>
            <div>
              <h2 className="font-headline font-bold text-on-surface">Daily live source refresh</h2>
              <p className="text-sm text-on-surface-variant mt-1">
                The website requests today&apos;s live feed from NSP through the API layer. No scholarship database is stored in the app.
              </p>
            </div>
          </div>
          <a
            href="https://scholarships.gov.in/All-Scholarships"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            Open NSP
          </a>
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-headline font-bold text-lg text-on-surface">Official Sources</h2>
          <p className="text-xs text-on-surface-variant">Primary feed comes from NSP. Other official portals are shown for verification and direct applications.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {SCHOLARSHIP_SOURCES.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-headline font-bold text-sm text-on-surface">{source.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{source.description}</p>
                </div>
                <span className="material-symbols-outlined text-lg text-primary">open_in_new</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {LEVEL_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveLevel(filter.key)}
              className={cn(
                'shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors',
                activeLevel === filter.key
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
              )}
            >
              <span className="material-symbols-outlined text-base">{filter.icon}</span>
              {filter.label}
              <span className="font-mono opacity-75">({levelCounts[filter.key] || 0})</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {PROVIDER_FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveProvider(filter.key)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-colors',
                  activeProvider === filter.key
                    ? 'bg-tertiary text-white'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 md:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course, caste, ministry, portal..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <CustomSelect
            value={activeState}
            onChange={setActiveState}
            options={[
              { value: 'all', label: 'All States' },
              ...uniqueStates.map(state => ({ value: state, label: state }))
            ]}
          />

          <CustomSelect
            value={activeUniversity}
            onChange={setActiveUniversity}
            options={[
              { value: 'all', label: 'All Universities' },
              ...uniqueUniversities.map(uni => ({ value: uni, label: uni }))
            ]}
          />

          <CustomSelect
            value={activeProgram}
            onChange={setActiveProgram}
            options={[
              { value: 'all', label: 'All Specific Programs' },
              ...uniquePrograms.map(prog => ({ value: prog, label: prog }))
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-primary mb-4 block animate-spin">progress_activity</span>
          <p className="text-on-surface-variant font-medium">Fetching live scholarship data...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-error-container/70 border border-error/20 p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-error mb-3 block">cloud_off</span>
          <h2 className="font-headline font-bold text-on-surface">Live source unavailable</h2>
          <p className="text-sm text-on-surface-variant mt-2">{error}</p>
          <a
            href="https://scholarships.gov.in/All-Scholarships"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-bold text-sm px-4 py-2.5 rounded-xl"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            Check NSP directly
          </a>
        </div>
      ) : filteredScholarships.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">search_off</span>
          <p className="text-on-surface-variant font-medium">No open scholarships match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredScholarships.map((scholarship) => {
            const tag = providerTag(scholarship.provider);
            const closeDate = formatDate(scholarship.studentApplicationCloseDate);

            return (
              <article
                key={scholarship.id}
                className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient flex flex-col transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h2 className="font-headline font-bold text-on-surface text-base leading-snug">
                      {scholarship.name}
                    </h2>
                    <p className="text-on-surface-variant text-xs mt-1">{scholarship.department}</p>
                  </div>
                  <div className="shrink-0 w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">school</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${tag.cls}`}>
                    {tag.label}
                  </span>
                  <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">
                    {scholarship.portal}
                  </span>
                  <span className="text-[10px] font-bold text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded-md">
                    Open
                  </span>
                  {scholarship.state && (
                    <span className="text-[10px] font-semibold text-primary bg-primary-fixed/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>
                      {scholarship.state}
                    </span>
                  )}
                  {scholarship.university && (
                    <span className="text-[10px] font-semibold text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">account_balance</span>
                      {scholarship.university}
                    </span>
                  )}
                  {scholarship.programs && scholarship.programs.length > 0 && (
                    <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-md">
                      {scholarship.programs.join(', ')}
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Benefits</p>
                <p className="font-mono font-bold text-base text-on-surface mb-3">{scholarship.benefits}</p>

                <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                  {scholarship.eligibility}
                </p>

                <div className="mb-4">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Education Level
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {scholarship.education_levels.map((level) => (
                      <span
                        key={level}
                        className="text-[10px] text-primary font-semibold bg-primary-fixed px-2 py-0.5 rounded-md"
                      >
                        {LEVEL_LABELS[level]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Who Can Apply
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {scholarship.target_groups.slice(0, 4).map((group) => (
                      <span
                        key={group}
                        className="text-[10px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 mb-4 space-y-2">
                  <p className="text-[10px] font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
                    Source: Official government portal
                  </p>
                  <p className="text-[10px] text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-secondary">update</span>
                    Last checked: {feed?.meta?.fetched_at ? new Date(feed.meta.fetched_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Today'}
                  </p>
                  <p className="text-[10px] text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-tertiary">info</span>
                    Status: <span className="font-semibold capitalize">{scholarship.status}</span>
                  </p>
                  <p className="text-[10px] font-semibold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">link</span>
                    Apply only on: <a href={scholarship.application_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary truncate">official link</a>
                  </p>
                  <div className="mt-2 bg-error-container/40 rounded-lg p-2 flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-sm text-error shrink-0 mt-0.5">warning</span>
                    <p className="text-[9px] font-medium text-on-surface leading-snug">
                      <span className="text-error font-bold uppercase tracking-wider">Warning:</span> Do not share OTP, Aadhaar password, or bank details with anyone. Use only the official portal.
                    </p>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-base text-secondary">event</span>
                    <span>{closeDate ? `Student application open till ${closeDate}` : "Verify deadline on official website"}</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={scholarship.specifications_url || scholarship.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">description</span>
                      Details
                    </a>
                    <a
                      href={scholarship.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:text-primary font-bold px-3 py-2.5 rounded-xl transition-colors"
                      aria-label="Apply on official portal"
                    >
                      <span className="material-symbols-outlined text-lg">open_in_new</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="text-center py-4">
        <p className="text-xs text-on-surface-variant">
          Showing <span className="font-bold">{filteredScholarships.length}</span> of{' '}
          <span className="font-bold">{scholarships.length}</span> live open scholarship entries. Verify final rules on the official portal before applying.
        </p>
      </div>
    </div>
  );
}
