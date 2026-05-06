import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { calculateAge } from '@/lib/utils';
import type {
  GovernmentScheme,
  SchemeMatch,
  SchemeStatus,
  SchemeType,
  UserProfile,
} from '@/types';

// ─── State Shape ────────────────────────────────────────────────────────────

interface SchemeFilter {
  type: SchemeType | 'all';
  search: string;
  status: SchemeStatus | 'all';
}

interface SchemeState {
  schemes: GovernmentScheme[];
  matches: SchemeMatch[];
  loading: boolean;
  selectedScheme: GovernmentScheme | null;
  filter: SchemeFilter;
}

interface SchemeActions {
  fetchSchemes: () => Promise<void>;
  calculateMatches: (userProfile: UserProfile) => void;
  applyForScheme: (schemeId: string) => Promise<void>;
  setFilter: (update: Partial<SchemeFilter>) => void;
  setSelectedScheme: (scheme: GovernmentScheme | null) => void;
}

type SchemeStore = SchemeState & SchemeActions;

// ─── Match Calculation ──────────────────────────────────────────────────────

function computeSchemeMatch(
  scheme: GovernmentScheme,
  profile: UserProfile,
): SchemeMatch {
  let score = 0;
  const reasons: string[] = [];
  const missingCriteria: string[] = [];
  const criteria = scheme.eligibility_criteria;

  // Age match (+20)
  if (criteria.min_age != null || criteria.max_age != null) {
    if (profile.date_of_birth) {
      const age = calculateAge(profile.date_of_birth);
      const minOk = criteria.min_age == null || age >= criteria.min_age;
      const maxOk = criteria.max_age == null || age <= criteria.max_age;
      if (minOk && maxOk) {
        score += 20;
        reasons.push(`Age ${age} is within eligible range`);
      } else {
        missingCriteria.push(
          `Age must be ${criteria.min_age ?? '—'}–${criteria.max_age ?? '—'} years`,
        );
      }
    } else {
      missingCriteria.push('Date of birth not provided');
    }
  } else {
    // No age restriction — award the points
    score += 20;
    reasons.push('No age restriction');
  }

  // State match (+20)
  if (criteria.states && criteria.states.length > 0) {
    if (profile.state && criteria.states.includes(profile.state)) {
      score += 20;
      reasons.push(`Available in ${profile.state}`);
    } else if (!profile.state) {
      missingCriteria.push('State not provided in profile');
    } else {
      missingCriteria.push(
        `Only available in: ${criteria.states.slice(0, 3).join(', ')}${criteria.states.length > 3 ? '...' : ''}`,
      );
    }
  } else {
    // No state restriction — central scheme, available everywhere
    score += 20;
    reasons.push('Available across all states');
  }

  // Category match (+15)
  if (criteria.categories && criteria.categories.length > 0) {
    if (profile.category && criteria.categories.includes(profile.category)) {
      score += 15;
      reasons.push(`Eligible for ${profile.category.toUpperCase()} category`);
    } else if (!profile.category) {
      missingCriteria.push('Category not set in profile');
    } else {
      missingCriteria.push(
        `Category must be: ${criteria.categories.join(', ')}`,
      );
    }
  } else {
    score += 15;
    reasons.push('Open to all categories');
  }

  // Income match (+15)
  if (criteria.max_income != null) {
    if (profile.annual_income != null) {
      if (profile.annual_income <= criteria.max_income) {
        score += 15;
        reasons.push('Annual income within limit');
      } else {
        missingCriteria.push(
          `Annual income must be below INR ${criteria.max_income.toLocaleString('en-IN')}`,
        );
      }
    } else {
      missingCriteria.push('Annual income not provided');
    }
  } else {
    score += 15;
    reasons.push('No income restriction');
  }

  // Occupation match (+10)
  if (criteria.occupations && criteria.occupations.length > 0) {
    if (
      profile.occupation &&
      criteria.occupations
        .map((o) => o.toLowerCase())
        .includes(profile.occupation.toLowerCase())
    ) {
      score += 10;
      reasons.push(`Occupation "${profile.occupation}" is eligible`);
    } else if (!profile.occupation) {
      missingCriteria.push('Occupation not provided');
    } else {
      missingCriteria.push(
        `Occupation must be: ${criteria.occupations.join(', ')}`,
      );
    }
  } else {
    score += 10;
    reasons.push('Open to all occupations');
  }

  // Gender match (+10)
  if (criteria.gender && criteria.gender !== 'any') {
    if (profile.gender === criteria.gender) {
      score += 10;
      reasons.push(`Eligible for ${profile.gender} applicants`);
    } else if (!profile.gender) {
      missingCriteria.push('Gender not set in profile');
    } else {
      missingCriteria.push(`Only for ${criteria.gender} applicants`);
    }
  } else {
    score += 10;
    reasons.push('Open to all genders');
  }

  // BPL match (+10)
  if (criteria.is_bpl === true) {
    if (profile.is_bpl === true) {
      score += 10;
      reasons.push('BPL card holder');
    } else if (profile.is_bpl === false) {
      missingCriteria.push('Requires BPL card');
    } else {
      missingCriteria.push('BPL status not provided');
    }
  } else {
    score += 10;
    reasons.push('No BPL requirement');
  }

  return { scheme, score, reasons, missingCriteria };
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useSchemeStore = create<SchemeStore>((set, get) => ({
  // State
  schemes: [],
  matches: [],
  loading: false,
  selectedScheme: null,
  filter: {
    type: 'all',
    search: '',
    status: 'all',
  },

  // ── Fetch Schemes ───────────────────────────────────────────────────────

  fetchSchemes: async () => {
    set({ loading: true });

    try {
      let query = supabase.from('schemes').select('*').order('created_at', { ascending: false });

      const { filter } = get();
      if (filter.type !== 'all') {
        query = query.eq('type', filter.type);
      }
      if (filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }
      if (filter.search.trim()) {
        query = query.or(
          `name.ilike.%${filter.search}%,description.ilike.%${filter.search}%,ministry.ilike.%${filter.search}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('[schemeStore] fetchSchemes error:', error.message);
        set({ loading: false });
        return;
      }

      set({ schemes: (data ?? []) as GovernmentScheme[], loading: false });
    } catch (err) {
      console.error('[schemeStore] fetchSchemes exception:', err);
      set({ loading: false });
    }
  },

  // ── Calculate Matches ───────────────────────────────────────────────────

  calculateMatches: (userProfile) => {
    const { schemes } = get();

    const matches = schemes
      .filter((s) => s.status === 'active')
      .map((scheme) => computeSchemeMatch(scheme, userProfile))
      .sort((a, b) => b.score - a.score);

    set({ matches });
  },

  // ── Apply for Scheme ────────────────────────────────────────────────────

  applyForScheme: async (schemeId) => {
    // Record the application attempt in Supabase for tracking
    const { error } = await supabase.from('scheme_applications').insert({
      scheme_id: schemeId,
      applied_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[schemeStore] applyForScheme error:', error.message);
      throw new Error(error.message);
    }

    // Open the official application URL in a new tab
    const { schemes } = get();
    const scheme = schemes.find((s) => s.id === schemeId);
    if (scheme?.application_url) {
      window.open(scheme.application_url, '_blank', 'noopener,noreferrer');
    }
  },

  // ── Set Filter ──────────────────────────────────────────────────────────

  setFilter: (update) => {
    set((state) => ({
      filter: { ...state.filter, ...update },
    }));
  },

  // ── Set Selected Scheme ─────────────────────────────────────────────────

  setSelectedScheme: (scheme) => {
    set({ selectedScheme: scheme });
  },
}));

// ─── Derived selectors ──────────────────────────────────────────────────────

/** Get filtered schemes from current state */
export const selectFilteredSchemes = (state: SchemeStore) => {
  return state.schemes;
};

/** Get top N matches */
export const selectTopMatches = (n: number) => (state: SchemeStore) =>
  state.matches.slice(0, n);
