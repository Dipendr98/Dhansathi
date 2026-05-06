import { cn } from '@/lib/utils';
import type { PlanType } from '@/stores/subscriptionStore';

interface PlanBadgeProps {
  plan: PlanType;
  size?: 'sm' | 'md';
}

export default function PlanBadge({ plan, size = 'sm' }: PlanBadgeProps) {
  const label = plan === 'pro' ? 'PRO' : 'FREE';
  return (
    <span
      className={cn(
        'inline-flex items-center font-bold tracking-wider rounded-full',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1',
        plan === 'pro' && 'bg-gradient-to-r from-primary to-sky-500 text-white',
        plan === 'free' && 'bg-surface-container-high text-on-surface-variant'
      )}
    >
      {plan !== 'free' && <span className="material-symbols-outlined text-xs mr-0.5" style={{ fontSize: size === 'sm' ? '10px' : '12px' }}>workspace_premium</span>}
      {label}
    </span>
  );
}
