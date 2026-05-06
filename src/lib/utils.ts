import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupee currency */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format large numbers in Indian notation (Cr, L, K) */
export function formatCompactINR(amount: number): string {
  if (amount >= 1_00_00_00_000) {
    return `${(amount / 1_00_00_00_000).toFixed(2)} Cr`;
  }
  if (amount >= 1_00_00_000) {
    return `${(amount / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (amount >= 1_00_000) {
    return `${(amount / 1_00_000).toFixed(2)} L`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toFixed(2);
}

/** Format percentage with sign */
export function formatPct(pct: number, decimals = 2): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(decimals)}%`;
}

/** Calculate age from date of birth string (YYYY-MM-DD) */
export function calculateAge(dob: string): number {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/** Sleep utility for polling */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate SIP Future Value
 * FV = P × [{(1+r)^n - 1}/r] × (1+r)
 * @param monthly - Monthly SIP amount
 * @param annualRate - Annual return rate (e.g. 0.12 for 12%)
 * @param years - Investment horizon in years
 */
export function calculateSIP(monthly: number, annualRate: number, years: number): number {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

/** Format volume (4200000 → 4.2M) */
export function formatVolume(vol: number): string {
  if (vol >= 1_00_00_000) return `${(vol / 1_00_00_000).toFixed(1)}Cr`;
  if (vol >= 1_00_000) return `${(vol / 1_00_000).toFixed(1)}L`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toString();
}

/** Get greeting based on time of day */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
