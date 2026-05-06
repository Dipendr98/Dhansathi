import { create } from 'zustand';
import { useAuthStore } from '@/stores/authStore';

// ─── Types ──────────────────────────────────────────────────────────────────

type Plan = 'free' | 'pro';

// Credit categories for different features
type CreditCategory = 'dhanmitra' | 'ai_chat';

interface PlanState {
  plan: Plan;
  creditsUsed: Record<CreditCategory, number>;
  creditsDate: string; // YYYY-MM-DD of last reset
}

interface PlanActions {
  useCredit: (category?: CreditCategory) => boolean;
  getRemainingCredits: (category?: CreditCategory) => number;
  getMaxCredits: (category?: CreditCategory) => number;
  upgradeToPro: () => void;
}

type PlanStore = PlanState & PlanActions;

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'dhansathi_plan';

function getToday(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getMaxCreditsForCategory(plan: Plan, category: CreditCategory): number {
  if (plan === 'pro') {
    return Infinity; // Unlimited for pro users
  }
  // Free plan limits
  return category === 'dhanmitra' ? 10 : 20;
}

/** Read the actual plan from authStore (single source of truth) */
function getEffectivePlan(): Plan {
  try {
    const user = useAuthStore.getState().user;
    if (user?.plan === 'pro') return 'pro';
  } catch { /* ignore if authStore not ready */ }
  return 'free';
}

const DEFAULT_CREDITS_USED: Record<CreditCategory, number> = { dhanmitra: 0, ai_chat: 0 };

function loadFromStorage(): PlanState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Reset credits if the stored date is not today
      if (parsed.creditsDate !== getToday()) {
        return { plan: parsed.plan || 'free', creditsUsed: { ...DEFAULT_CREDITS_USED }, creditsDate: getToday() };
      }
      // Migrate from old single-number format
      const creditsUsed = typeof parsed.creditsUsed === 'number'
        ? { dhanmitra: parsed.creditsUsed, ai_chat: parsed.creditsUsed } as Record<CreditCategory, number>
        : { ...DEFAULT_CREDITS_USED, ...parsed.creditsUsed } as Record<CreditCategory, number>;
      return { plan: parsed.plan || 'free', creditsUsed, creditsDate: parsed.creditsDate };
    }
  } catch {
    // ignore parse errors
  }
  return { plan: 'free', creditsUsed: { ...DEFAULT_CREDITS_USED }, creditsDate: getToday() };
}

function saveToStorage(state: PlanState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const usePlanStore = create<PlanStore>((set, get) => {
  const initial = loadFromStorage();

  return {
    ...initial,

    useCredit: (category: CreditCategory = 'ai_chat') => {
      const state = get();
      const effectivePlan = getEffectivePlan();
      // Auto-reset if date changed
      const today = getToday();
      let creditsUsed = { ...state.creditsUsed };
      let creditsDate = state.creditsDate;
      if (creditsDate !== today) {
        creditsUsed = { ...DEFAULT_CREDITS_USED };
        creditsDate = today;
      }

      const max = getMaxCreditsForCategory(effectivePlan, category);
      if ((creditsUsed[category] || 0) >= max) return false;

      creditsUsed[category] = (creditsUsed[category] || 0) + 1;

      const next: PlanState = {
        plan: state.plan,
        creditsUsed,
        creditsDate,
      };
      set(next);
      saveToStorage(next);
      return true;
    },

    getRemainingCredits: (category: CreditCategory = 'ai_chat') => {
      const state = get();
      const effectivePlan = getEffectivePlan();
      const today = getToday();
      const used = state.creditsDate !== today ? 0 : (state.creditsUsed[category] || 0);
      return getMaxCreditsForCategory(effectivePlan, category) - used;
    },

    getMaxCredits: (category: CreditCategory = 'ai_chat') => {
      const effectivePlan = getEffectivePlan();
      return getMaxCreditsForCategory(effectivePlan, category);
    },

    upgradeToPro: () => {
      const state = get();
      const today = getToday();
      const next: PlanState = {
        plan: 'pro',
        creditsUsed: state.creditsDate !== today ? { ...DEFAULT_CREDITS_USED } : state.creditsUsed,
        creditsDate: today,
      };
      set(next);
      saveToStorage(next);
    },
  };
});
