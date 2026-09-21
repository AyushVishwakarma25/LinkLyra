import { PlanPricingConfig, SubscriptionPlanType, BillingCycle } from '../types';
import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

// -------------------------------------------------------------
// Pricing Tiers Configuration
// -------------------------------------------------------------

export const PLANS_CONFIG: Record<SubscriptionPlanType, PlanPricingConfig> = {
  free: {
    plan: 'free',
    name: 'Starter Free',
    description: 'Perfect for creators just getting started with bio links.',
    priceMonthlyINR: 0,
    priceYearlyINR: 0,
    priceMonthlyUSD: 0,
    priceYearlyUSD: 0,
    features: [
      'Unlimited standard links & cards',
      '5 clean starter themes (Warm, Alabaster, Obsidian, etc.)',
      'Lead capture (WhatsApp & Email)',
      'Real-time link click counter',
      'QR code download & sharing',
      'Smart bio formatting suggestions',
    ],
  },
  pro: {
    plan: 'pro',
    name: 'Creator Pro',
    badge: 'MOST POPULAR',
    isPopular: true,
    description: 'Instantly unlock Pro themes, custom domain, white-labeling, and 500 monthly AI credits.',
    priceMonthlyINR: 199,
    priceYearlyINR: 1499, // ~₹125/mo
    priceMonthlyUSD: 4,
    priceYearlyUSD: 36, // $3/mo
    features: [
      '500 AI generation & enhancement credits / month included',
      'All 12+ Pro Themes Unlocked (Glass, Gold, Sunset, Emerald, etc.)',
      'Custom Domain Mapping (e.g. links.yourdomain.com)',
      '100% White-Label (Remove all LinkLyra branding)',
      'Verified Gold/Blue badge on your profile header',
      'Unlimited theme customization & typography styling',
      'Advanced Traffic Analytics (Referrers, Top Links, Device & Browser Breakdown)',
      'Priority 24/7 Creator Support via WhatsApp',
    ],
  },
  business: {
    plan: 'business',
    name: 'Agency & Business',
    badge: 'BEST VALUE FOR TEAMS',
    description: 'Complete suite for businesses, real estate brokers, agencies, and teams with 2,500 monthly AI credits.',
    priceMonthlyINR: 699,
    priceYearlyINR: 5499, // ~₹458/mo
    priceMonthlyUSD: 12,
    priceYearlyUSD: 108, // $9/mo
    features: [
      '2,500 AI generation & enhancement credits / month included',
      'Everything in Pro included (100% Unlocked)',
      '5 Multi-profile sub-accounts & team workspace',
      'Unlimited Lead CRM Export to CSV / Google Sheets',
      'Dedicated Webhook integrations & Meta/Google Pixel tracking',
      'Automated client CRM sync & priority routing',
      'Dedicated Account Manager & 99.9% uptime SLA',
    ],
  },
  agency: {
    plan: 'agency',
    name: 'Agency VIP Partner',
    badge: 'UNLIMITED VIP ACCESS',
    isPopular: true,
    description: 'Exclusive Agency & Partner tier with complimentary unlimited profiles, white-labeling, and full platform access.',
    priceMonthlyINR: 0,
    priceYearlyINR: 0,
    priceMonthlyUSD: 0,
    priceYearlyUSD: 0,
    features: [
      'VIP Agency Access granted directly to your verified partner email',
      'Unlimited custom domain mappings & instant SSL issuance',
      '100% Complete White-labeling (Zero LinkLyra badges or watermarks)',
      'Unlimited client profiles & sub-accounts',
      'Instant Lead & inquiry alerts (Email & WhatsApp integration)',
      'Full CSV & JSON automated CRM export suite',
      'Priority dedicated 24/7 engineering support',
    ],
  },
};

// -------------------------------------------------------------
// Razorpay Script Loader
// -------------------------------------------------------------

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK from checkout.razorpay.com');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

// -------------------------------------------------------------
// Razorpay Configuration & Key Resolution
// -------------------------------------------------------------

export function getRazorpayKeyId(): string {
  const envKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
  if (envKey && envKey.trim() !== '' && !envKey.includes('placeholder')) {
    return envKey.trim();
  }
  return '';
}

export function saveCustomRazorpayKey(_keyId: string) {
  // Deprecated: Keys must be configured via environment secrets
}

export interface RazorpayCheckoutOptions {
  plan: SubscriptionPlanType;
  billingCycle: BillingCycle;
  userName: string;
  userEmail: string;
  userPhone?: string;
  onSuccess: (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    amountPaid: number;
    currency: string;
    plan: SubscriptionPlanType;
    billingCycle: BillingCycle;
    invoiceNumber?: string;
  }) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
}

/**
 * Initiates Razorpay checkout with server-side order generation and HMAC verification:
 * 1. Invokes createCheckoutOrder Cloud Function (server-side price verification)
 * 2. Opens official Razorpay modal
 * 3. On modal success, invokes verifyPayment Cloud Function (HMAC verification & atomic invoice/subscription grant)
 * 4. Invokes onSuccess only after server-side verification succeeds
 */
export async function initiateRazorpaySubscriptionCheckout({
  plan,
  billingCycle,
  userName,
  userEmail,
  userPhone,
  onSuccess,
  onError,
  onDismiss,
}: RazorpayCheckoutOptions) {
  const planConfig = PLANS_CONFIG[plan];
  if (!planConfig) {
    onError?.(new Error('Invalid plan selected'));
    return;
  }

  if (plan === 'free' || plan === 'agency') {
    onError?.(new Error('Checkout is not required for free or agency partner tiers.'));
    return;
  }

  const keyId = getRazorpayKeyId();
  if (!keyId) {
    const msg = 'Payments are not configured. Please configure VITE_RAZORPAY_KEY_ID in your environment.';
    console.error(msg);
    onError?.(new Error(msg));
    return;
  }

  const isScriptLoaded = await loadRazorpayScript();
  if (!isScriptLoaded || !window.Razorpay) {
    onError?.(new Error('Razorpay checkout SDK failed to load. Please check your internet connection.'));
    return;
  }

  // 1. Create order server-side via Cloud Function
  let orderData: { orderId: string; amount: number; currency: string };
  try {
    const createOrderFn = httpsCallable<
      { plan: string; billingCycle: string },
      { orderId: string; amount: number; currency: string }
    >(functions, 'createCheckoutOrder');

    const orderRes = await createOrderFn({ plan, billingCycle });
    orderData = orderRes.data;
  } catch (err: any) {
    console.error('Server order creation failed:', err);
    onError?.(new Error(err.message || 'Failed to create payment order on server.'));
    return;
  }

  // 2. Open Razorpay Checkout modal with the server-generated order ID
  try {
    const options = {
      key: keyId,
      order_id: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'LinkLyra',
      description: `${planConfig.name} (${billingCycle === 'yearly' ? 'Annual' : 'Monthly'})`,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      prefill: {
        name: userName || 'LinkLyra Creator',
        email: userEmail || 'creator@linklyra.com',
        contact: userPhone || '',
      },
      notes: {
        plan,
        billingCycle,
      },
      theme: {
        color: '#5E4BF7',
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        // 3. Verify Payment on Server via Cloud Function
        try {
          const verifyFn = httpsCallable<
            { order_id: string; payment_id: string; signature: string },
            { success: boolean; plan: string; invoiceNumber: string; message?: string }
          >(functions, 'verifyPayment');

          const verifyRes = await verifyFn({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });

          if (!verifyRes.data.success) {
            throw new Error(verifyRes.data.message || 'Payment verification failed on server.');
          }

          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            amountPaid: orderData.amount / 100,
            currency: orderData.currency,
            plan,
            billingCycle,
            invoiceNumber: verifyRes.data.invoiceNumber,
          });
        } catch (verifyErr: any) {
          console.error('Payment verification failed on server:', verifyErr);
          onError?.(new Error(verifyErr.message || 'Payment verification failed on server.'));
        }
      },
      modal: {
        ondismiss: function () {
          onDismiss?.();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err: any) {
    console.error('Failed to open Razorpay modal:', err);
    onError?.(new Error(err.message || 'Failed to open Razorpay modal.'));
  }
}
