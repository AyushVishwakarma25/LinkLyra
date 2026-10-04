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

export interface CheckDomainStatusRequest {
  domain: string;
}

export interface CheckDomainStatusResponse {
  domain: string;
  isConfigured: boolean;
  strategy: 'cname' | 'apex_a' | 'txt_challenge' | null;
  detectedCnames: string[];
  detectedIps: string[];
  detectedTxt: string[];
  expectedCname: string;
  expectedIps: string[];
  challengeToken: string;
  challengeRecordName: string;
  message: string;
}

export interface IngestionBatchEvent {
  type: string;
  pageId: string;
  linkId?: string | null;
  visitorId: string;
  device?: string;
  browser?: string;
  referrer?: string;
  country?: string;
  timestamp?: number;
}

export interface IngestAnalyticsBatchRequest {
  events: IngestionBatchEvent[];
}
