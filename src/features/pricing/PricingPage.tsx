import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { usePayment } from '@/hooks/usePayment';
import { PLAN_PRICES, getPlanConfigs } from '@/stores/subscriptionStore';
import type { SubscriptionPlan } from '@/types';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    }),
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
};

interface PlanCard {
    id: SubscriptionPlan;
    name: string;
    tagline: string;
    features: string[];
    highlighted: boolean;
    badge?: string;
}

function getDynamicPlans(): PlanCard[] {
    const configs = getPlanConfigs();
    return configs.map((c) => ({
        id: c.id as SubscriptionPlan,
        name: c.name,
        tagline: c.tagline,
        features: c.displayFeatures.filter((f) => f.enabled).map((f) => f.text),
        highlighted: c.id === 'pro',
        badge: c.id === 'pro' ? 'Most Popular' : undefined,
    }));
}

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(false);
    const user = useAuthStore((s) => s.user);
    const currentPlan = user?.plan || 'free';
    const { handleUpgrade, loading } = usePayment();
    const PLANS = getDynamicPlans();

    function getPrice(planId: SubscriptionPlan) {
        const prices = PLAN_PRICES[planId as keyof typeof PLAN_PRICES];
        if (!prices) return 0;
        return isAnnual ? prices.yearly : prices.monthly;
    }

    function getMonthlyEquivalent(planId: SubscriptionPlan) {
        const prices = PLAN_PRICES[planId as keyof typeof PLAN_PRICES];
        if (!prices) return 0;
        if (isAnnual) return Math.round(prices.yearly / 12);
        return prices.monthly;
    }

    function getSavings(planId: SubscriptionPlan) {
        const prices = PLAN_PRICES[planId as keyof typeof PLAN_PRICES];
        if (!prices || prices.monthly === 0) return 0;
        return prices.monthly * 12 - prices.yearly;
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8 pb-16 max-w-4xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={fadeUp} custom={0} className="text-center">
                <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">
                    Choose Your Plan
                </h1>
                <p className="text-on-surface-variant mt-2 max-w-lg mx-auto">
                    Unlock powerful features to maximize your financial journey with DhanSathi
                </p>

                {/* Annual/Monthly Toggle */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <span
                        className={cn(
                            'text-sm font-semibold transition-colors',
                            !isAnnual ? 'text-on-surface' : 'text-on-surface-variant'
                        )}
                    >
                        Monthly
                    </span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className={cn(
                            'relative w-14 h-7 rounded-full transition-colors duration-200',
                            isAnnual ? 'bg-primary' : 'bg-surface-container-high'
                        )}
                    >
                        <span
                            className={cn(
                                'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200',
                                isAnnual && 'translate-x-7'
                            )}
                        />
                    </button>
                    <span
                        className={cn(
                            'text-sm font-semibold transition-colors',
                            isAnnual ? 'text-on-surface' : 'text-on-surface-variant'
                        )}
                    >
                        Annual
                    </span>
                    {isAnnual && (
                        <span className="text-[10px] font-bold uppercase bg-india-green/10 text-india-green px-2 py-0.5 rounded-md">
                            Save up to 17%
                        </span>
                    )}
                </div>
            </motion.div>

            {/* Plan Cards */}
            <motion.div
                variants={fadeUp}
                custom={1}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
            >
                {PLANS.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    const price = getPrice(plan.id);
                    const monthlyEq = getMonthlyEquivalent(plan.id);
                    const savings = getSavings(plan.id);

                    return (
                        <div
                            key={plan.id}
                            className={cn(
                                'relative bg-surface-container-lowest rounded-2xl border-2 p-6 flex flex-col transition-all',
                                plan.highlighted
                                    ? 'border-primary shadow-xl shadow-primary/10 scale-[1.02]'
                                    : 'border-outline-variant/20 hover:border-outline-variant/40',
                                isCurrent && 'ring-2 ring-primary/30'
                            )}
                        >
                            {/* Badge */}
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-primary to-primary-container text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-lg">
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            {/* Plan Name */}
                            <div className="mb-4">
                                <h3 className="font-headline text-xl font-bold text-on-surface">
                                    {plan.name}
                                </h3>
                                <p className="text-xs text-on-surface-variant mt-1">{plan.tagline}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="font-mono text-3xl font-extrabold text-on-surface">
                                        {price === 0 ? 'Free' : `₹${monthlyEq}`}
                                    </span>
                                    {price > 0 && (
                                        <span className="text-on-surface-variant text-sm">/month</span>
                                    )}
                                </div>
                                {isAnnual && price > 0 && (
                                    <div className="mt-1 space-y-0.5">
                                        <p className="text-xs text-on-surface-variant">
                                            Billed ₹{price}/year
                                        </p>
                                        {savings > 0 && (
                                            <p className="text-xs font-semibold text-india-green">
                                                Save ₹{savings}/year
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 flex-1 mb-6">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-india-green text-[18px] mt-0.5">
                                            check_circle
                                        </span>
                                        <span className="text-sm text-on-surface">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            {isCurrent ? (
                                <button
                                    disabled
                                    className="w-full py-3 rounded-xl font-bold text-sm bg-surface-container-high text-on-surface-variant cursor-default"
                                >
                                    Current Plan
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUpgrade(plan.id, isAnnual)}
                                    disabled={loading}
                                    className={cn(
                                        'w-full py-3 rounded-xl font-bold text-sm transition-all',
                                        plan.highlighted
                                            ? 'bg-gradient-to-r from-primary to-primary-container text-white hover:shadow-lg hover:shadow-primary/20'
                                            : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high',
                                        loading && 'opacity-50 cursor-wait'
                                    )}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                            Processing...
                                        </span>
                                    ) : plan.id === 'free' ? (
                                        'Downgrade to Free'
                                    ) : (
                                        `Upgrade to ${plan.name}`
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </motion.div>

            {/* Payment Info */}
            <motion.div
                variants={fadeUp}
                custom={2}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 text-center"
            >
                <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-primary">verified_user</span>
                    <span className="material-symbols-outlined text-primary">lock</span>
                    <span className="material-symbols-outlined text-primary">credit_card</span>
                </div>
                <p className="text-sm text-on-surface font-semibold">Secure payments powered by Razorpay</p>
                <p className="text-xs text-on-surface-variant mt-1">
                    UPI, Credit/Debit Cards, Net Banking, and Wallets accepted. Cancel anytime.
                </p>
            </motion.div>
        </motion.div>
    );
}