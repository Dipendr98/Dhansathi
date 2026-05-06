import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { PlanType } from '@/stores/subscriptionStore';

interface UpgradePromptProps {
  feature: string;
  requiredPlan: PlanType;
  currentPlan: PlanType;
  compact?: boolean;
}

export default function UpgradePrompt({ feature, requiredPlan, currentPlan, compact }: UpgradePromptProps) {
  const planLabel = 'Pro';
  const price = '₹199';

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-tertiary/10 border border-primary/20 px-4 py-3"
      >
        <span className="material-symbols-outlined text-primary">lock</span>
        <p className="text-sm text-on-surface-variant flex-1">
          <strong>{feature}</strong> requires {planLabel} plan
        </p>
        <Link
          to="/dashboard/settings"
          className="text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition"
        >
          Upgrade {price}/mo
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary/5 via-surface-container to-tertiary/5 border border-outline-variant/30 p-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
      </div>
      <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
        Unlock {feature}
      </h3>
      <p className="text-on-surface-variant text-sm max-w-md mb-6">
        This feature is available on the <strong className="text-primary">{planLabel}</strong> plan.
        Upgrade to unlock {feature.toLowerCase()} and more premium features.
      </p>
      <div className="flex gap-3">
        <Link
          to="/dashboard/settings"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-sky-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all duration-300"
        >
          <span className="material-symbols-outlined text-lg">rocket_launch</span>
          Upgrade to {planLabel} — {price}/mo
        </Link>
      </div>
      <p className="text-xs text-on-surface-variant/60 mt-4">
        You're currently on the <span className="capitalize">{currentPlan}</span> plan
      </p>
    </motion.div>
  );
}
