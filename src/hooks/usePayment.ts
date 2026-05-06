import { useState, useCallback } from 'react';
import { loadRazorpayScript, initiatePayment } from '@/lib/razorpay';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import type { SubscriptionPlan } from '@/types';
import toast from 'react-hot-toast';

interface PaymentState {
    loading: boolean;
    error: string | null;
}

export function usePayment() {
    const [state, setState] = useState<PaymentState>({ loading: false, error: null });
    const user = useAuthStore((s) => s.user);
    const updateProfile = useAuthStore((s) => s.updateProfile);
    const setPlan = useSubscriptionStore((s) => s.setPlan);

    const handleUpgrade = useCallback(
        async (plan: SubscriptionPlan, isAnnual: boolean) => {
            if (!user) {
                toast.error('Please sign in to upgrade your plan.');
                return;
            }

            if (plan === 'free') {
                // Downgrade to free
                try {
                    await updateProfile({ plan: 'free' });
                    setPlan('free');
                    toast.success('Switched to Free plan.');
                } catch {
                    toast.error('Failed to update plan.');
                }
                return;
            }

            setState({ loading: true, error: null });

            try {
                const loaded = await loadRazorpayScript();
                if (!loaded) {
                    throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
                }

                await initiatePayment(
                    plan,
                    isAnnual,
                    {
                        name: user.full_name || '',
                        email: user.email,
                        phone: user.phone,
                    },
                    // onSuccess
                    async (response) => {
                        try {
                            // In production, verify payment on backend before updating plan
                            // For now, update plan directly after successful payment
                            console.log('[Payment] Success:', response);

                            await updateProfile({ plan });
                            setPlan('pro');

                            toast.success(
                                `🎉 Welcome to Pro! Your payment was successful.`,
                                { duration: 5000 }
                            );

                            setState({ loading: false, error: null });
                        } catch (err) {
                            console.error('[Payment] Profile update failed:', err);
                            toast.error('Payment succeeded but plan update failed. Please contact support.');
                            setState({ loading: false, error: 'Plan update failed' });
                        }
                    },
                    // onFailure
                    () => {
                        toast.error('Payment was cancelled or failed.');
                        setState({ loading: false, error: 'Payment cancelled' });
                    }
                );
            } catch (err: any) {
                console.error('[Payment] Error:', err);
                toast.error(err.message || 'Payment failed. Please try again.');
                setState({ loading: false, error: err.message });
            }
        },
        [user, updateProfile, setPlan]
    );

    return {
        ...state,
        handleUpgrade,
    };
}