import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlanType = 'free' | 'pro';

interface PlanFeatures {
  schemeMatchLimit: number;
  stockFilters: number;
  stockAlerts: number;
  watchlistLimit: number;
  aiQueriesPerDay: number;
  simulationsPerMonth: number;
  showAds: boolean;
  emailSupport: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  taxCalculator: boolean;
  budgetAnalyzer: boolean;
  monthlyReport: boolean;
  exportData: boolean;
}

interface PlanDisplayFeature {
  text: string;
  enabled: boolean;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  displayFeatures: PlanDisplayFeature[];
  features: PlanFeatures;
}

interface SubscriptionState {
  currentPlan: PlanType;
  planExpiry: string | null;
  isAnnual: boolean;
  aiQueriesUsedToday: number;
  simulationsUsedThisMonth: number;
  features: PlanFeatures;
  setPlan: (plan: PlanType) => void;
  canAccess: (feature: keyof PlanFeatures) => boolean;
  getRemainingAIQueries: () => number;
  getRemainingSimulations: () => number;
  useAIQuery: () => boolean;
  useSimulation: () => boolean;
  resetDailyLimits: () => void;
  resetMonthlyLimits: () => void;
}

// ── Default plan features (internal limits) ─────────────────────────────────

const DEFAULT_PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    schemeMatchLimit: 5,
    stockFilters: 3,
    stockAlerts: 3,
    watchlistLimit: 0,
    aiQueriesPerDay: 0,
    simulationsPerMonth: 0,
    showAds: true,
    emailSupport: false,
    prioritySupport: false,
    apiAccess: false,
    taxCalculator: false,
    budgetAnalyzer: false,
    monthlyReport: false,
    exportData: false,
  },
  pro: {
    schemeMatchLimit: 999,
    stockFilters: 999,
    stockAlerts: 999,
    watchlistLimit: 999,
    aiQueriesPerDay: 999,
    simulationsPerMonth: 30,
    showAds: false,
    emailSupport: true,
    prioritySupport: true,
    apiAccess: false,
    taxCalculator: true,
    budgetAnalyzer: true,
    monthlyReport: true,
    exportData: true,
  },
};

// ── Default plan prices ─────────────────────────────────────────────────────

const DEFAULT_PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 199, yearly: 1999 },
};

// ── Default plan configs (for admin editing) ────────────────────────────────

const DEFAULT_PLAN_CONFIGS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Get started with basic features',
    monthlyPrice: 0,
    yearlyPrice: 0,
    displayFeatures: [
      { text: '5 scheme matches/month', enabled: true },
      { text: '3 stock filters', enabled: true },
      { text: '3 stock alerts', enabled: true },
      { text: 'Basic dashboard', enabled: true },
      { text: 'Community support', enabled: true },
    ],
    features: DEFAULT_PLAN_FEATURES.free,
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Everything you need for smart investing',
    monthlyPrice: 199,
    yearlyPrice: 1999,
    displayFeatures: [
      { text: 'Unlimited scheme matches', enabled: true },
      { text: 'All stock filters & screeners', enabled: true },
      { text: 'Unlimited stock alerts', enabled: true },
      { text: 'Unlimited watchlist', enabled: true },
      { text: 'Unlimited AI queries/day', enabled: true },
      { text: '30 simulations/month', enabled: true },
      { text: 'Tax Calculator', enabled: true },
      { text: 'Budget Analyzer', enabled: true },
      { text: 'Monthly Reports', enabled: true },
      { text: 'Export data & reports', enabled: true },
      { text: 'Priority support', enabled: true },
      { text: 'No ads', enabled: true },
    ],
    features: DEFAULT_PLAN_FEATURES.pro,
  },
];

// ── Storage key ─────────────────────────────────────────────────────────────

const PLAN_CONFIGS_STORAGE_KEY = 'dhansathi_plan_configs';

// ── Dynamic getters ─────────────────────────────────────────────────────────

export function getPlanConfigs(): PlanConfig[] {
  try {
    const stored = localStorage.getItem(PLAN_CONFIGS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return DEFAULT_PLAN_CONFIGS;
}

export function savePlanConfigs(configs: PlanConfig[]) {
  localStorage.setItem(PLAN_CONFIGS_STORAGE_KEY, JSON.stringify(configs));
}

export function getPlanPrices(): Record<PlanType, { monthly: number; yearly: number }> {
  const configs = getPlanConfigs();
  const prices: Record<string, { monthly: number; yearly: number }> = {};
  for (const c of configs) {
    prices[c.id] = { monthly: c.monthlyPrice, yearly: c.yearlyPrice };
  }
  return prices as Record<PlanType, { monthly: number; yearly: number }>;
}

export function getPlanFeatures(): Record<PlanType, PlanFeatures> {
  const configs = getPlanConfigs();
  const features: Record<string, PlanFeatures> = {};
  for (const c of configs) {
    features[c.id] = c.features;
  }
  return features as Record<PlanType, PlanFeatures>;
}

// ── Backward-compatible exports ─────────────────────────────────────────────

// These are now dynamic getters that read from localStorage
const PLAN_FEATURES = new Proxy(DEFAULT_PLAN_FEATURES, {
  get(_target, prop: string) {
    const features = getPlanFeatures();
    return features[prop as PlanType] ?? DEFAULT_PLAN_FEATURES[prop as PlanType];
  },
});

const PLAN_PRICES = new Proxy(DEFAULT_PLAN_PRICES, {
  get(_target, prop: string) {
    const prices = getPlanPrices();
    return prices[prop as PlanType] ?? DEFAULT_PLAN_PRICES[prop as PlanType];
  },
});

// ── Zustand store ───────────────────────────────────────────────────────────

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      currentPlan: 'free' as PlanType,
      planExpiry: null,
      isAnnual: false,
      aiQueriesUsedToday: 0,
      simulationsUsedThisMonth: 0,

      get features() {
        const allFeatures = getPlanFeatures();
        return allFeatures[get().currentPlan];
      },

      setPlan: (plan: PlanType) => set({ currentPlan: plan }),

      canAccess: (feature: keyof PlanFeatures) => {
        const allFeatures = getPlanFeatures();
        const plan = allFeatures[get().currentPlan];
        const value = plan[feature];
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value > 0;
        return false;
      },

      getRemainingAIQueries: () => {
        const { currentPlan, aiQueriesUsedToday } = get();
        const allFeatures = getPlanFeatures();
        const limit = allFeatures[currentPlan].aiQueriesPerDay;
        if (limit >= 999) return 999;
        return Math.max(0, limit - aiQueriesUsedToday);
      },

      getRemainingSimulations: () => {
        const { currentPlan, simulationsUsedThisMonth } = get();
        const allFeatures = getPlanFeatures();
        const limit = allFeatures[currentPlan].simulationsPerMonth;
        if (limit >= 999) return 999;
        return Math.max(0, limit - simulationsUsedThisMonth);
      },

      useAIQuery: () => {
        const remaining = get().getRemainingAIQueries();
        if (remaining <= 0) return false;
        set((s) => ({ aiQueriesUsedToday: s.aiQueriesUsedToday + 1 }));
        return true;
      },

      useSimulation: () => {
        const remaining = get().getRemainingSimulations();
        if (remaining <= 0) return false;
        set((s) => ({ simulationsUsedThisMonth: s.simulationsUsedThisMonth + 1 }));
        return true;
      },

      resetDailyLimits: () => set({ aiQueriesUsedToday: 0 }),
      resetMonthlyLimits: () => set({ simulationsUsedThisMonth: 0 }),
    }),
    { name: 'dhansathi-subscription' }
  )
);

export { PLAN_FEATURES, PLAN_PRICES, DEFAULT_PLAN_CONFIGS };