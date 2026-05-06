import type { GovernmentScheme, UserProfile } from '@/types';
import { calculateAge } from '@/lib/utils';

interface MatchResult {
  scheme: GovernmentScheme;
  score: number;
  matchedCriteria: string[];
  missedCriteria: string[];
  estimatedBenefit: string;
}

/**
 * Client-side scheme matching engine
 * Scores user profiles against government schemes on 8 criteria
 */
export function matchSchemes(profile: UserProfile, schemes: GovernmentScheme[]): MatchResult[] {
  const results: MatchResult[] = [];

  for (const scheme of schemes) {
    const { score, matched, missed } = calculateScore(profile, scheme);
    if (score >= 30) {
      results.push({
        scheme,
        score,
        matchedCriteria: matched,
        missedCriteria: missed,
        estimatedBenefit: scheme.benefits || 'Varies',
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function calculateScore(
  profile: UserProfile,
  scheme: GovernmentScheme
): { score: number; matched: string[]; missed: string[] } {
  const matched: string[] = [];
  const missed: string[] = [];
  let totalWeight = 0;
  let earnedWeight = 0;

  const criteria = scheme.eligibility_criteria;
  if (!criteria) return { score: 100, matched: ['Open to all'], missed: [] };

  // Age check (20 points)
  if (criteria.min_age || criteria.max_age) {
    totalWeight += 20;
    const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : 30;
    const minOk = !criteria.min_age || age >= criteria.min_age;
    const maxOk = !criteria.max_age || age <= criteria.max_age;
    if (minOk && maxOk) {
      earnedWeight += 20;
      matched.push(`Age ${age} within ${criteria.min_age || 0}-${criteria.max_age || 100} range`);
    } else {
      missed.push(`Age must be ${criteria.min_age || 0}-${criteria.max_age || 100} (yours: ${age})`);
    }
  }

  // State check (15 points)
  if (criteria.states && criteria.states.length > 0) {
    totalWeight += 15;
    if (criteria.states.includes('All') || (profile.state && criteria.states.includes(profile.state))) {
      earnedWeight += 15;
      matched.push('State eligibility met');
    } else {
      missed.push(`Available in: ${criteria.states.slice(0, 3).join(', ')}${criteria.states.length > 3 ? '...' : ''}`);
    }
  }

  // Category check (15 points)
  if (criteria.categories && criteria.categories.length > 0) {
    totalWeight += 15;
    if (criteria.categories.includes('All') || (profile.category && criteria.categories.includes(profile.category))) {
      earnedWeight += 15;
      matched.push(`Category ${profile.category || 'general'} eligible`);
    } else {
      missed.push(`For categories: ${criteria.categories.join(', ')}`);
    }
  }

  // Income check (15 points)
  if (criteria.max_income) {
    totalWeight += 15;
    const income = profile.annual_income || 300000;
    if (income <= criteria.max_income) {
      earnedWeight += 15;
      matched.push('Income within limit');
    } else {
      missed.push(`Income must be below \u20B9${(criteria.max_income / 100000).toFixed(1)}L`);
    }
  }

  // Occupation check (15 points)
  if (criteria.occupations && criteria.occupations.length > 0) {
    totalWeight += 15;
    if (criteria.occupations.includes('All') || (profile.occupation && criteria.occupations.includes(profile.occupation))) {
      earnedWeight += 15;
      matched.push('Occupation eligible');
    } else {
      missed.push(`For: ${criteria.occupations.join(', ')}`);
    }
  }

  // Gender check (10 points)
  if (criteria.gender && criteria.gender !== 'any') {
    totalWeight += 10;
    if (!profile.gender || profile.gender === criteria.gender) {
      earnedWeight += 10;
      matched.push('Gender eligibility met');
    } else {
      missed.push(`Only for ${criteria.gender}`);
    }
  }

  // BPL check (5 points)
  if (criteria.is_bpl) {
    totalWeight += 5;
    if (profile.is_bpl) {
      earnedWeight += 5;
      matched.push('BPL status verified');
    } else {
      missed.push('Requires BPL card');
    }
  }

  const score = totalWeight === 0 ? 100 : Math.round((earnedWeight / totalWeight) * 100);
  return { score, matched, missed };
}

export function getTopMatches(profile: UserProfile, schemes: GovernmentScheme[], limit: number = 5): MatchResult[] {
  return matchSchemes(profile, schemes).slice(0, limit);
}

export function calculateTotalBenefit(matches: MatchResult[]): number {
  let total = 0;
  for (const m of matches) {
    const amount = m.scheme.benefits;
    if (amount) {
      const num = parseInt(amount.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(num)) total += num;
    }
  }
  return total;
}
