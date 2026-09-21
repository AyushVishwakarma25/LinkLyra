// -------------------------------------------------------------
// Server-Side Billing & Pricing Configuration (Source of Truth)
// -------------------------------------------------------------

export interface PlanConfig {
  plan: 'pro' | 'business';
  name: string;
  priceMonthlyINR: number;
  priceYearlyINR: number;
  creditsMonthly: number;
}

export const SERVER_PLANS: Record<string, PlanConfig> = {
  pro: {
    plan: 'pro',
    name: 'Creator Pro',
    priceMonthlyINR: 199,
    priceYearlyINR: 1499,
    creditsMonthly: 500,
  },
  business: {
    plan: 'business',
    name: 'Agency & Business',
    priceMonthlyINR: 699,
    priceYearlyINR: 5499,
    creditsMonthly: 2500,
  },
};

// -------------------------------------------------------------
// Seller / Business Details for Tax Invoices
// -------------------------------------------------------------
export const SELLER_CONFIG = {
  // Legal business / company entity name
  legalName: 'FALCON CANVAS AI',
  // TODO: Add registered office address
  address: 'TODO: YOUR_REGISTERED_OFFICE_ADDRESS',
  // 15-digit GSTIN (Goods and Services Tax Identification Number)
  gstin: '09BSHPV5501M1Z6',
  // Set applicable GST/tax rate percentage (e.g. 18 for 18% GST)
  taxRatePercent: 18,
};
