import type { PlanLimits, SubscriptionPlan } from '@/types';

// ─── Subscription Plan Limits ───────────────────────────────────────────────

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    schemes_per_month: 5,
    stock_alerts: 3,
    simulations_per_month: 2,
    watchlist_size: 10,
    export_reports: false,
    ai_insights: false,
    priority_support: false,
  },
  pro: {
    schemes_per_month: 50,
    stock_alerts: 20,
    simulations_per_month: 20,
    watchlist_size: 50,
    export_reports: true,
    ai_insights: true,
    priority_support: false,
  },
};

// ─── Indian States ──────────────────────────────────────────────────────────

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

// ─── Stock Sectors ──────────────────────────────────────────────────────────

export const STOCK_SECTORS = [
  'IT', 'Banking', 'FMCG', 'Pharma', 'Auto', 'Energy',
  'Metals', 'Infra', 'Cement', 'Telecom', 'Finance', 'Retail',
  'Insurance', 'Chemicals', 'Conglomerate',
] as const;

// ─── Simulation Constants ───────────────────────────────────────────────────

export const SIMULATION_POLL_INTERVAL_MS = 5000;
export const SIMULATION_MAX_POLLS = 60; // 5 min max

// ─── App Metadata ───────────────────────────────────────────────────────────

export const APP_NAME = 'DhanSathi';
export const APP_NAME_HI = 'धनसाथी';
export const APP_TAGLINE = 'Your Indian Financial Intelligence Partner';
