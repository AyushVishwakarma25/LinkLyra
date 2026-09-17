import React, { useState } from 'react';
import { HugeIcon } from './HugeIcon';
import {
  Tick01Icon,
  CrownIcon,
  Cancel01Icon,
  ShieldIcon,
  ArrowRight01Icon,
  CreditCardIcon,
  CheckmarkCircle01Icon,
  Building01Icon,
} from '@hugeicons/core-free-icons';
import { UserProfile, SubscriptionPlanType, BillingCycle, SubscriptionRecord, PaymentInvoiceRecord } from '../types';
import { Button, ButtonGroup } from './ui';
import { PLANS_CONFIG, initiateRazorpaySubscriptionCheckout } from '../lib/razorpay';
import { profileService } from '../lib/firebase';
import { User } from 'firebase/auth';

export interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  currentUser?: User | null;
  onUpgradeSuccess: (plan: SubscriptionPlanType, invoice?: PaymentInvoiceRecord) => void;
  lockedFeatureName?: string;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentUser,
  onUpgradeSuccess,
  lockedFeatureName = 'Pro Feature',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanType>('pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [currencyMode, setCurrencyMode] = useState<'INR' | 'USD'>('INR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<PaymentInvoiceRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlanConfig = PLANS_CONFIG[selectedPlan];
  const priceDisplay =
    currencyMode === 'INR'
      ? billingCycle === 'yearly'
        ? `₹${currentPlanConfig.priceYearlyINR}`
        : `₹${currentPlanConfig.priceMonthlyINR}`
      : billingCycle === 'yearly'
      ? `$${currentPlanConfig.priceYearlyUSD}`
      : `$${currentPlanConfig.priceMonthlyUSD}`;

  const monthlyEquivalent =
    currencyMode === 'INR'
      ? billingCycle === 'yearly'
        ? `₹${Math.round(currentPlanConfig.priceYearlyINR / 12)}/mo`
        : `₹${currentPlanConfig.priceMonthlyINR}/mo`
      : billingCycle === 'yearly'
      ? `$${Math.round(currentPlanConfig.priceYearlyUSD / 12)}/mo`
      : `$${currentPlanConfig.priceMonthlyUSD}/mo`;

  const handleRazorpayCheckout = async () => {
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      await initiateRazorpaySubscriptionCheckout({
        plan: selectedPlan,
        billingCycle,
        userName: profile.name || currentUser?.displayName || 'Creator',
        userEmail: currentUser?.email || 'creator@linklyra.com',
        userPhone: profile.businessPhone || '',
        onSuccess: async (paymentData) => {
          const now = new Date();
          const startDate = now.toISOString();
          const periodEnd = new Date(
            now.getTime() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
          ).toISOString();
          const invoiceNum = `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

          const invoice: PaymentInvoiceRecord = {
            id: `inv_${Date.now()}`,
            userId: currentUser?.uid || profile.id || 'anonymous_user',
            invoiceNumber: invoiceNum,
            planName: currentPlanConfig.name,
            billingCycle,
            amount: paymentData.amountPaid,
            currency: paymentData.currency,
            status: 'captured',
            razorpayPaymentId: paymentData.razorpay_payment_id,
            razorpayOrderId: paymentData.razorpay_order_id,
            paymentMethod: 'Razorpay (Cards / UPI / NetBanking)',
            paidAt: startDate,
            receiptUrl: `https://linklyra.com/receipts/${invoiceNum}`,
            notes: `Activated ${currentPlanConfig.name} with full unlimited access`,
          };

          const subscription: Partial<SubscriptionRecord> = {
            userId: currentUser?.uid || profile.id || 'anonymous_user',
            plan: selectedPlan,
            status: 'active',
            billingCycle,
            amount: paymentData.amountPaid,
            currency: paymentData.currency,
            startDate,
            currentPeriodStart: startDate,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            razorpayPaymentId: paymentData.razorpay_payment_id,
            razorpayOrderId: paymentData.razorpay_order_id,
          };

          if (currentUser?.uid) {
            await profileService.saveUserSubscription(currentUser.uid, subscription);
            await profileService.recordPaymentInvoice(currentUser.uid, invoice);
          }

          setIsProcessing(false);
          setSuccessReceipt(invoice);
          onUpgradeSuccess(selectedPlan, invoice);
        },
        onError: (err) => {
          setIsProcessing(false);
          setErrorMsg(err?.message || 'Payment could not be completed. Please try again.');
        },
        onDismiss: () => {
          setIsProcessing(false);
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err?.message || 'Failed to initiate Razorpay checkout.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] rounded-2xl border border-black/15 shadow-sm overflow-hidden text-[#1C1E22] my-auto">
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-[#1C1E22]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#737882] hover:text-[#1C1E22] transition-colors cursor-pointer"
        >
          <HugeIcon icon={Cancel01Icon} size={16} className="w-4 h-4" />
        </button>

        {successReceipt ? (
          /* Payment Success & Invoice Card */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <HugeIcon icon={CheckmarkCircle01Icon} size={32} className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs mb-2 border border-emerald-200">
                <HugeIcon icon={ShieldIcon} size={14} className="w-3.5 h-3.5" />
                <span>PAYMENT CONFIRMED</span>
              </span>
              <h2 className="text-2xl font-black text-[#1C1E22] tracking-tight">
                Welcome to {successReceipt.planName}!
              </h2>
              <p className="text-xs text-[#737882] mt-1">
                Your subscription is now active and all premium features are fully unlocked.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-white rounded-xl p-4 border border-black/10 text-left space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <span className="text-xs font-bold text-[#737882]">Invoice Number</span>
                <span className="text-xs font-mono font-bold text-[#1C1E22]">{successReceipt.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <span className="text-xs font-bold text-[#737882]">Payment ID</span>
                <span className="text-xs font-mono font-bold text-[#1C1E22] truncate max-w-[200px]">
                  {successReceipt.razorpayPaymentId}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <span className="text-xs font-bold text-[#737882]">Amount Paid</span>
                <span className="text-sm font-black text-[#1C1E22]">
                  {successReceipt.currency === 'INR' ? '₹' : '$'}{successReceipt.amount} ({successReceipt.billingCycle})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#737882]">Status</span>
                <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                  <HugeIcon icon={CheckmarkCircle01Icon} size={14} className="w-3.5 h-3.5" />
                  <span>Unlimited Access Unlocked</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl bg-[#1C1E22] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              Continue to Studio
            </button>
          </div>
        ) : (
          /* Plan Selection & Razorpay Checkout Screen */
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/5 text-[#1C1E22] font-extrabold text-xs">
                <HugeIcon icon={CrownIcon} size={14} className="w-3.5 h-3.5" />
                <span>INSTANT UNLOCK</span>
              </span>
              {lockedFeatureName && (
                <span className="text-xs text-[#737882] font-semibold truncate">
                  • Unlock {lockedFeatureName}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[#1C1E22] leading-tight">
              Upgrade to Unlock All Features
            </h2>
            <p className="text-xs sm:text-sm text-[#555962] mt-1 leading-relaxed">
              Unlock custom domains, all 12+ premium themes, white-labeling, and advanced profile tools.
            </p>

            {/* Plan Selector (Pro vs Business) */}
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setSelectedPlan('pro')}
                className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                  selectedPlan === 'pro'
                    ? 'border-[#1C1E22] bg-black/5 shadow-2xs'
                    : 'border-black/10 bg-white hover:border-black/20'
                }`}
              >
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#1C1E22]">
                  <HugeIcon icon={CrownIcon} size={14} className="w-3.5 h-3.5 text-amber-500" />
                  <span>Creator Pro</span>
                </div>
                <div className="mt-1 text-sm font-black text-[#1C1E22]">
                  {currencyMode === 'INR' ? '₹199' : '$4'}
                  <span className="text-[10px] font-normal text-[#737882]">/mo</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">All Themes • No Limits</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('business')}
                className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                  selectedPlan === 'business'
                    ? 'border-[#1C1E22] bg-black/5 shadow-2xs'
                    : 'border-black/10 bg-white hover:border-black/20'
                }`}
              >
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#1C1E22]">
                  <HugeIcon icon={Building01Icon} size={14} className="w-3.5 h-3.5 text-blue-600" />
                  <span>Agency & Team</span>
                </div>
                <div className="mt-1 text-sm font-black text-[#1C1E22]">
                  {currencyMode === 'INR' ? '₹699' : '$12'}
                  <span className="text-[10px] font-normal text-[#737882]">/mo</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">5 Profiles + Team CRM</p>
              </button>
            </div>

            {/* Billing Cycle Controls & Currency Switch ButtonGroup */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 p-1.5 bg-white rounded-xl border border-black/10 text-xs">
              <ButtonGroup variant="tertiary" size="sm">
                <Button
                  onClick={() => setBillingCycle('monthly')}
                  isSelected={billingCycle === 'monthly'}
                  className="rounded-lg"
                >
                  Monthly
                </Button>
                <Button
                  onClick={() => setBillingCycle('yearly')}
                  isSelected={billingCycle === 'yearly'}
                  className="rounded-lg gap-1.5"
                >
                  <ButtonGroup.Separator />
                  <span>Annual</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black">
                    SAVE 35%
                  </span>
                </Button>
              </ButtonGroup>

              <ButtonGroup variant="outline" size="sm">
                <Button
                  onClick={() => setCurrencyMode('INR')}
                  isSelected={currencyMode === 'INR'}
                  className="rounded-lg font-bold"
                >
                  ₹ INR
                </Button>
                <Button
                  onClick={() => setCurrencyMode('USD')}
                  isSelected={currencyMode === 'USD'}
                  className="rounded-lg font-bold"
                >
                  <ButtonGroup.Separator />
                  $ USD
                </Button>
              </ButtonGroup>
            </div>

            {/* Price Summary */}
            <div className="mt-4 p-3.5 rounded-xl bg-white border border-black/10 flex items-center justify-between shadow-2xs">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#1C1E22]">{priceDisplay}</span>
                  <span className="text-xs text-[#737882] font-semibold">
                    {billingCycle === 'yearly' ? '/ year' : '/ month'}
                  </span>
                </div>
                <p className="text-[11px] text-[#737882] mt-0.5">
                  Effective rate: <strong>{monthlyEquivalent}</strong> • Billed {billingCycle}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-extrabold">
                  <HugeIcon icon={CheckmarkCircle01Icon} size={14} className="w-3.5 h-3.5" />
                  <span>Full Access</span>
                </span>
                <p className="text-[10px] text-[#737882] mt-0.5">Cancel anytime</p>
              </div>
            </div>

            {/* Features list */}
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1">
              {currentPlanConfig.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[#1C1E22] font-semibold">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <HugeIcon icon={Tick01Icon} size={12} className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Action CTA */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRazorpayCheckout}
                className="w-full py-3.5 px-6 rounded-xl bg-[#1C1E22] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isProcessing ? (
                  <span>Opening Secure Gateway...</span>
                ) : (
                  <>
                    <HugeIcon icon={CreditCardIcon} size={16} className="w-4 h-4" />
                    <span>Pay {priceDisplay} with UPI / Card</span>
                    <HugeIcon icon={ArrowRight01Icon} size={16} className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center text-[11px] text-[#737882] px-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <HugeIcon icon={ShieldIcon} size={14} className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>UPI, Cards & NetBanking Supported</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
