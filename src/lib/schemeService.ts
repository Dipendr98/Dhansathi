// ─── Live Scheme Matching Service ────────────────────────────────────────────
// Works entirely offline with embedded scheme data. No Supabase dependency.
// Provides scoring, filtering, search, and benefit estimation against UserProfile.
// ─────────────────────────────────────────────────────────────────────────────

import { GOVERNMENT_SCHEMES } from '@/data/governmentSchemes';
import { calculateAge } from '@/lib/utils';
import type { GovernmentScheme, SchemeMatch, UserProfile } from '@/types';

// ─── Exported Types ─────────────────────────────────────────────────────────

export interface UnclaimedBenefits {
  totalAmount: number;
  schemeCount: number;
  topSchemes: Array<{ name: string; amount: number; hindi_name?: string }>;
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Parse a monetary amount from a human-readable benefit string.
 * Handles patterns like "₹6,000/year", "₹5,00,000 health cover",
 * "₹2.67 lakh", "Up to ₹10 lakh", "₹1,250/month", etc.
 * Returns annualised amount in rupees, or 0 if unparseable.
 */
function parseBenefitAmount(benefits: string): number {
  if (!benefits) return 0;

  const cleaned = benefits.replace(/,/g, '');

  // Try to find a number followed by "crore" / "cr"
  const croreMatch = cleaned.match(/([\d.]+)\s*(?:crore|cr)/i);
  if (croreMatch) {
    return parseFloat(croreMatch[1]) * 1_00_00_000;
  }

  // Try to find a number followed by "lakh" / "L" (but not "lakh loan" -- still count it)
  const lakhMatch = cleaned.match(/([\d.]+)\s*(?:lakh|lac|L\b)/i);
  if (lakhMatch) {
    return parseFloat(lakhMatch[1]) * 1_00_000;
  }

  // Try plain number with optional rupee symbol: "₹6000", "Rs. 6000", "6000/year"
  const plainMatch = cleaned.match(/(?:₹|Rs\.?\s*)([\d.]+)/i);
  if (plainMatch) {
    let amount = parseFloat(plainMatch[1]);
    // Annualise if stated per month
    if (/month/i.test(benefits)) {
      amount *= 12;
    }
    return amount;
  }

  // Last resort: any standalone number
  const numMatch = cleaned.match(/([\d]+)/);
  if (numMatch) {
    let amount = parseInt(numMatch[1], 10);
    if (/month/i.test(benefits)) {
      amount *= 12;
    }
    return amount;
  }

  return 0;
}

/**
 * Fisher-Yates shuffle (immutable -- returns a new array).
 */
function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── Core Match Engine ──────────────────────────────────────────────────────

/**
 * Score a single scheme against a user profile.
 *
 * Scoring breakdown (100 total):
 *   Age match:        +20
 *   State match:      +20
 *   Category match:   +15
 *   Income match:     +15
 *   Occupation match: +10
 *   Gender match:     +10
 *   BPL status match: +10
 *
 * Mirrors the algorithm from schemeStore.ts `computeSchemeMatch`, enhanced
 * with occupation case-insensitive matching and partial-match support.
 */
function computeSchemeMatch(
  scheme: GovernmentScheme,
  profile: UserProfile,
): SchemeMatch {
  let score = 0;
  const reasons: string[] = [];
  const missingCriteria: string[] = [];
  const criteria = scheme.eligibility_criteria;

  // ── Age match (+20) ───────────────────────────────────────────────────
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
          `Age must be ${criteria.min_age ?? '0'}\u2013${criteria.max_age ?? '100+'} years`,
        );
      }
    } else {
      missingCriteria.push('Date of birth not provided');
    }
  } else {
    score += 20;
    reasons.push('No age restriction');
  }

  // ── State match (+20) ─────────────────────────────────────────────────
  if (criteria.states && criteria.states.length > 0) {
    if (
      criteria.states.includes('All') ||
      (profile.state &&
        criteria.states
          .map((s) => s.toLowerCase())
          .includes(profile.state.toLowerCase()))
    ) {
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
    score += 20;
    reasons.push('Available across all states');
  }

  // ── Category match (+15) ──────────────────────────────────────────────
  if (criteria.categories && criteria.categories.length > 0) {
    if (
      criteria.categories.includes('All') ||
      (profile.category &&
        criteria.categories
          .map((c) => c.toLowerCase())
          .includes(profile.category.toLowerCase()))
    ) {
      score += 15;
      reasons.push(`Eligible for ${(profile.category ?? 'general').toUpperCase()} category`);
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

  // ── Income match (+15) ────────────────────────────────────────────────
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

  // ── Occupation match (+10) ────────────────────────────────────────────
  if (criteria.occupations && criteria.occupations.length > 0) {
    const normalised = criteria.occupations.map((o) => o.toLowerCase());
    if (
      normalised.includes('all') ||
      (profile.occupation && normalised.includes(profile.occupation.toLowerCase()))
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

  // ── Gender match (+10) ────────────────────────────────────────────────
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

  // ── BPL status match (+10) ────────────────────────────────────────────
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

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Get all schemes (for anonymous / new users). Returns every embedded scheme.
 */
export function getAllSchemes(): GovernmentScheme[] {
  return GOVERNMENT_SCHEMES;
}

/**
 * Get a random selection of N schemes, picking from different categories
 * to ensure the user sees variety on the landing / preview page.
 *
 * Strategy: group by ministry, pick one from each in round-robin, then
 * fill remaining slots randomly from whatever is left.
 */
export function getRandomSchemes(count: number = 6): GovernmentScheme[] {
  const active = GOVERNMENT_SCHEMES.filter((s) => s.status === 'active');
  if (active.length <= count) return shuffle(active);

  // Group by ministry for diversity
  const byMinistry = new Map<string, GovernmentScheme[]>();
  for (const scheme of active) {
    const key = scheme.ministry.toLowerCase();
    if (!byMinistry.has(key)) byMinistry.set(key, []);
    byMinistry.get(key)!.push(scheme);
  }

  const result: GovernmentScheme[] = [];
  const usedIds = new Set<string>();

  // Round-robin: pick one random scheme per ministry
  const ministryKeys = shuffle([...byMinistry.keys()]);
  for (const key of ministryKeys) {
    if (result.length >= count) break;
    const pool = byMinistry.get(key)!;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    result.push(pick);
    usedIds.add(pick.id);
  }

  // Fill remaining slots from the full pool, avoiding duplicates
  if (result.length < count) {
    const remaining = shuffle(active.filter((s) => !usedIds.has(s.id)));
    for (const scheme of remaining) {
      if (result.length >= count) break;
      result.push(scheme);
    }
  }

  return shuffle(result);
}

/**
 * Calculate eligibility match score for a user profile against all active schemes.
 * Returns results sorted by match score (highest first).
 */
export function calculateSchemeMatches(
  profile: UserProfile,
  schemes: GovernmentScheme[] = GOVERNMENT_SCHEMES,
): SchemeMatch[] {
  return schemes
    .filter((s) => s.status === 'active')
    .map((scheme) => computeSchemeMatch(scheme, profile))
    .sort((a, b) => b.score - a.score);
}

/**
 * Get the top N scheme matches for a user.
 */
export function getTopMatches(
  profile: UserProfile,
  count: number = 5,
): SchemeMatch[] {
  return calculateSchemeMatches(profile).slice(0, count);
}

/**
 * Filter schemes by category (ministry or type keyword).
 * Case-insensitive partial match against ministry, type, or benefits fields.
 */
export function getSchemesByCategory(category: string): GovernmentScheme[] {
  const lower = category.toLowerCase();

  // Special handling for type-based categories
  if (lower === 'central' || lower === 'state') {
    return GOVERNMENT_SCHEMES.filter((s) => s.type === lower);
  }

  return GOVERNMENT_SCHEMES.filter(
    (s) =>
      s.ministry.toLowerCase().includes(lower) ||
      s.benefits.toLowerCase().includes(lower) ||
      (s.state && s.state.toLowerCase().includes(lower)),
  );
}

/**
 * Search schemes by name, description, or ministry.
 * Supports multi-word queries (all words must appear in at least one field).
 * Optionally searches within a provided subset; defaults to all schemes.
 */
export function searchSchemes(
  query: string,
  schemes?: GovernmentScheme[],
): GovernmentScheme[] {
  const pool = schemes ?? GOVERNMENT_SCHEMES;
  const trimmed = query.trim();
  if (!trimmed) return pool;

  const words = trimmed
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  return pool.filter((scheme) => {
    const haystack = [
      scheme.name,
      scheme.name_hi ?? '',
      scheme.description,
      scheme.description_hi ?? '',
      scheme.ministry,
      scheme.benefits,
      scheme.state ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return words.every((word) => haystack.includes(word));
  });
}

/**
 * Calculate the total potential unclaimed benefits for a user profile.
 *
 * Considers all active schemes where the user scores above 60 (likely eligible).
 * Parses monetary amounts from the `benefits` field and annualises them.
 */
export function calculateUnclaimedBenefits(
  profile: UserProfile,
): UnclaimedBenefits {
  const matches = calculateSchemeMatches(profile);
  const eligible = matches.filter((m) => m.score > 60);

  const topSchemes: Array<{ name: string; amount: number; hindi_name?: string }> = [];
  let totalAmount = 0;

  for (const match of eligible) {
    const amount = parseBenefitAmount(match.scheme.benefits);
    if (amount > 0) {
      topSchemes.push({
        name: match.scheme.name,
        amount,
        hindi_name: match.scheme.name_hi,
      });
      totalAmount += amount;
    }
  }

  // Sort top schemes by amount descending
  topSchemes.sort((a, b) => b.amount - a.amount);

  return {
    totalAmount,
    schemeCount: eligible.length,
    topSchemes,
  };
}

/**
 * Get schemes that have upcoming deadlines (within the next 90 days).
 * Returns schemes sorted by deadline (earliest first).
 */
export function getUpcomingDeadlines(): GovernmentScheme[] {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + 90);

  return GOVERNMENT_SCHEMES
    .filter((s) => {
      if (!s.deadline || s.status !== 'active') return false;
      const dl = new Date(s.deadline);
      return dl >= now && dl <= cutoff;
    })
    .sort((a, b) => {
      const da = new Date(a.deadline!).getTime();
      const db = new Date(b.deadline!).getTime();
      return da - db;
    });
}

/**
 * Get count of schemes grouped by ministry (category).
 * Returns an array sorted by count descending.
 */
export function getSchemeCategoryStats(): Array<{
  category: string;
  count: number;
}> {
  const counts = new Map<string, number>();

  for (const scheme of GOVERNMENT_SCHEMES) {
    const key = scheme.ministry;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
