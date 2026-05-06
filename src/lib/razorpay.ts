import type { SubscriptionPlan } from '@/types';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  subscription_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || '';

const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; yearly: number; name: string }> = {
  free: { monthly: 0, yearly: 0, name: 'Free' },
  pro: { monthly: 19900, yearly: 199900, name: 'Pro' }, // in paise
};

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initiatePayment(
  plan: SubscriptionPlan,
  isAnnual: boolean,
  user: { name: string; email: string; phone?: string },
  onSuccess: (response: RazorpayResponse) => void,
  onFailure: () => void
): Promise<void> {
  if (plan === 'free') return;

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    console.error('Razorpay SDK failed to load');
    onFailure();
    return;
  }

  const price = PLAN_PRICES[plan];
  const amount = isAnnual ? price.yearly : price.monthly;

  const options: RazorpayOptions = {
    key: RAZORPAY_KEY,
    amount,
    currency: 'INR',
    name: 'DhanSathi',
    description: `${price.name} Plan - ${isAnnual ? 'Annual' : 'Monthly'}`,
    handler: onSuccess,
    prefill: {
      name: user.name,
      email: user.email,
      contact: user.phone || '',
    },
    theme: { color: '#006194' },
    modal: { ondismiss: onFailure },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}

export function getAffiliateLinks() {
  return {
    zerodha: 'https://zerodha.com/open-account?c=DHANSATHI',
    groww: 'https://groww.in/signup?ref=dhansathi',
    angelOne: 'https://www.angelone.in/open-demat-account?ref=dhansathi',
    policyBazaar: 'https://www.policybazaar.com/?ref=dhansathi',
    bankBazaar: 'https://www.bankbazaar.com/?ref=dhansathi',
    paytmMoney: 'https://www.paytmmoney.com/?ref=dhansathi',
    kuvera: 'https://kuvera.in/?ref=dhansathi',
    etMoney: 'https://www.etmoney.com/?ref=dhansathi',
  };
}
