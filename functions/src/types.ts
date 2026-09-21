export type SubscriptionPlanType = 'free' | 'pro' | 'business' | 'agency';
export type BillingCycle = 'monthly' | 'yearly';

export interface CreateOrderRequest {
  plan: 'pro' | 'business';
  billingCycle: BillingCycle;
}

export interface VerifyPaymentRequest {
  order_id: string;
  payment_id: string;
  signature: string;
}

export interface ConsumeCreditsRequest {
  amount: number;
  reason: string;
}

export interface ClaimDomainRequest {
  domain: string;
}

export interface ReleaseDomainRequest {
  domain?: string;
}
