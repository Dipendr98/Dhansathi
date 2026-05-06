import { useSubscriptionStore } from '@/stores/subscriptionStore';

interface AdBannerProps {
  slot: 'sidebar' | 'inline' | 'banner';
  className?: string;
}

export default function AdBanner({ slot, className }: AdBannerProps) {
  const currentPlan = useSubscriptionStore((s) => s.currentPlan);

  // Don't show ads to paid users
  if (currentPlan !== 'free') return null;

  const sizes: Record<string, string> = {
    sidebar: 'w-[300px] h-[250px]',
    inline: 'w-full h-[90px]',
    banner: 'w-full h-[60px]',
  };

  return (
    <div className={`${sizes[slot]} rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-center overflow-hidden ${className || ''}`}>
      {/* Replace with actual Google AdSense code */}
      {/* <ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" /> */}
      <div className="text-center">
        <p className="text-xs text-on-surface-variant/40 font-medium">Advertisement</p>
        <p className="text-[10px] text-on-surface-variant/30 mt-1">Upgrade to Pro to remove ads</p>
      </div>
    </div>
  );
}
