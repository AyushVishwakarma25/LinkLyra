import React, { useState, useEffect } from 'react';
import { HugeIcon } from './HugeIcon';
import {
  CrownIcon,
  CreditCardIcon,
  Invoice01Icon,
  Calendar01Icon,
  Shield01Icon,
  FlashIcon,
  CheckmarkCircle01Icon,
  ArrowReloadHorizontalIcon,
  Clock01Icon,
  ColorsIcon,
  Download01Icon,
  CancelCircleIcon,
  LockIcon,
  ArrowRight01Icon,
  Tick01Icon,
  GlobeIcon,
  Building01Icon,
} from '@hugeicons/core-free-icons';
import {
  UserProfile,
  SubscriptionRecord,
  PaymentInvoiceRecord,
  SubscriptionPlanType,
} from '../types';
import { profileService, isAgencyUserEmail } from '../lib/firebase';
import { PLANS_CONFIG } from '../lib/razorpay';
import { User } from 'firebase/auth';
import { Button, ButtonGroup } from './ui';

export interface BillingDashboardProps {
  profile: UserProfile;
  currentUser: User | null;
  onOpenUpgradeModal: () => void;
  onProfileUpdate: (updated: Partial<UserProfile>) => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  profile,
  currentUser,
  onOpenUpgradeModal,
  onProfileUpdate,
}) => {
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [invoices, setInvoices] = useState<PaymentInvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices'>('overview');
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [selectedInvoiceModal, setSelectedInvoiceModal] = useState<PaymentInvoiceRecord | null>(null);

  const fetchBillingData = async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [sub, invList] = await Promise.all([
        profileService.getUserSubscription(currentUser.uid),
        profileService.getPaymentInvoices(currentUser.uid),
      ]);

      if (sub) {
        setSubscription(sub);
      } else {
        // Free tier fallback
        const freeSub: SubscriptionRecord = {
          id: 'current',
          userId: currentUser.uid,
          plan: (profile.plan as SubscriptionPlanType) || 'free',
          status: 'active',
          billingCycle: 'monthly',
          amount: 0,
          currency: 'INR',
          startDate: new Date().toISOString(),
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSubscription(freeSub);
      }

      setInvoices(invList || []);
    } catch (err) {
      console.warn('Billing fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [currentUser?.uid, profile.plan]);

  const handleCancelPlan = async () => {
    if (!currentUser?.uid) return;
    if (!window.confirm('Are you sure you want to cancel your subscription at the end of the current billing cycle?')) {
      return;
    }
    setCancelingSubscription(true);
    try {
      await profileService.cancelSubscription(currentUser.uid);
      setSubscription((prev) => (prev ? { ...prev, cancelAtPeriodEnd: true } : null));
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    } finally {
      setCancelingSubscription(false);
    }
  };

  const userEmail = currentUser?.email || profile.email || '';
  const isAgency = isAgencyUserEmail(userEmail) || profile.plan === 'agency' || profile.role === 'agency';
  const currentPlan: SubscriptionPlanType = isAgency
    ? 'agency'
    : ((subscription?.plan || profile.plan || 'free') as SubscriptionPlanType);
  const planInfo = PLANS_CONFIG[currentPlan] || PLANS_CONFIG.free;
  const isPro = isAgency || currentPlan === 'pro' || currentPlan === 'business';

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div className="py-12 px-4 text-center text-xs text-[#737882] flex flex-col items-center justify-center gap-3">
        <HugeIcon icon={ArrowReloadHorizontalIcon} size={20} className="w-5 h-5 animate-spin text-[#5E4BF7]" />
        <span className="font-semibold text-[#1C1E22]">Loading subscription details...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 text-[#1C1E22]">
      {/* 1. Sub-Navigation Tabs */}
      <ButtonGroup variant="secondary" size="md" fullWidth className="w-full">
        <Button
          fullWidth
          variant={activeTab === 'overview' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('overview')}
        >
          <HugeIcon icon={CreditCardIcon} size={14} className="w-3.5 h-3.5" />
          <span>Plan Overview</span>
        </Button>

        <Button
          fullWidth
          variant={activeTab === 'invoices' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('invoices')}
        >
          <HugeIcon icon={Invoice01Icon} size={14} className="w-3.5 h-3.5" />
          <span>Invoices</span>
          {invoices.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'invoices' ? 'bg-white text-[#1C1E22]' : 'bg-[#1C1E22] text-white'
            }`}>
              {invoices.length}
            </span>
          )}
        </Button>
      </ButtonGroup>

      {/* ======================================================== */}
      {/* TAB 1: PLAN OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Active Plan Card */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/10 shadow-2xs space-y-4">
            {/* Header: Plan & Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isPro ? 'bg-[#F8BA38] text-[#191A1E]' : 'bg-black/5 text-[#555962]'
                    }`}
                  >
                    {isPro ? 'LinkLyra Pro' : 'Starter Free Plan'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{subscription?.status === 'active' ? 'Active' : 'Free Tier'}</span>
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 pt-1">
                  <h3 className="text-xl sm:text-2xl font-black text-[#1C1E22] tracking-tight">
                    {currentPlan === 'free' ? '₹0' : `₹${subscription?.amount || planInfo.priceMonthlyINR}`}
                  </h3>
                  <span className="text-xs font-semibold text-[#737882]">
                    / {subscription?.billingCycle || 'month'}
                  </span>
                </div>
                <p className="text-xs text-[#555962]">{planInfo.description}</p>
              </div>

              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isPro ? 'bg-[#F8BA38]/15 text-[#D99A16]' : 'bg-black/5 text-[#737882]'
                }`}
              >
                <HugeIcon icon={CrownIcon} size={20} className="w-5 h-5" />
              </div>
            </div>

            {/* Structured Billing Period Metadata List */}
            <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-black/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#737882] font-semibold">Billing Frequency</span>
                <span className="font-extrabold text-[#1C1E22] capitalize">
                  {subscription?.billingCycle || 'Monthly'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737882] font-semibold">Start Date</span>
                <span className="font-mono font-bold text-[#1C1E22]">
                  {formatDate(subscription?.startDate || subscription?.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#737882] font-semibold">
                  {isPro ? 'Next Renewal Date' : 'Account Status'}
                </span>
                <span className="font-mono font-bold text-[#1C1E22]">
                  {isPro ? formatDate(subscription?.currentPeriodEnd) : 'Free Forever'}
                </span>
              </div>
            </div>

            {/* Plan Action Buttons */}
            <div className="pt-2 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
              {!isPro ? (
                <button
                  type="button"
                  onClick={onOpenUpgradeModal}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white text-xs font-black shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HugeIcon icon={CrownIcon} size={16} className="w-4 h-4 text-[#F8BA38]" />
                  <span>Upgrade to Pro (₹199 / month)</span>
                </button>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onOpenUpgradeModal}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1C1E22] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Change Billing Plan
                  </button>

                  {subscription?.cancelAtPeriodEnd ? (
                    <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                      <HugeIcon icon={Clock01Icon} size={14} className="w-3.5 h-3.5" />
                      <span>Cancels on {formatDate(subscription.currentPeriodEnd)}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={cancelingSubscription}
                      onClick={handleCancelPlan}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                    >
                      {cancelingSubscription ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Feature Matrix / Capability Status */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/10 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#737882]">
                Feature Access & Limits
              </h4>
              <span className="text-[11px] font-bold text-[#5E4BF7]">
                {isPro ? '100% Unlocked' : 'Starter Limits'}
              </span>
            </div>

            <div className="space-y-2">
              {/* Feature 1: Themes */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-black/5 text-xs">
                <div className="flex items-center gap-2">
                  <HugeIcon icon={ColorsIcon} size={16} className="w-4 h-4 text-[#5E4BF7] shrink-0" />
                  <span className="font-bold text-[#1C1E22]">12+ Designer Themes</span>
                </div>
                {isPro ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-[#737882] bg-black/5 px-2 py-0.5 rounded-md">
                    5 Free Themes
                  </span>
                )}
              </div>

              {/* Feature 2: Custom Domain */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-black/5 text-xs">
                <div className="flex items-center gap-2">
                  <HugeIcon icon={GlobeIcon} size={16} className="w-4 h-4 text-[#5E4BF7] shrink-0" />
                  <span className="font-bold text-[#1C1E22]">Custom Domain Mapping</span>
                </div>
                {isPro ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Active</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenUpgradeModal}
                    className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <HugeIcon icon={LockIcon} size={12} className="w-3 h-3 text-amber-600" />
                    <span>Pro Only</span>
                  </button>
                )}
              </div>

              {/* Feature 3: White Label Branding */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-black/5 text-xs">
                <div className="flex items-center gap-2">
                  <HugeIcon icon={Shield01Icon} size={16} className="w-4 h-4 text-[#5E4BF7] shrink-0" />
                  <span className="font-bold text-[#1C1E22]">Remove LinkLyra Branding</span>
                </div>
                {isPro ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 stroke-[3]" />
                    <span>White-Label</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenUpgradeModal}
                    className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <HugeIcon icon={LockIcon} size={12} className="w-3 h-3 text-amber-600" />
                    <span>Pro Only</span>
                  </button>
                )}
              </div>

              {/* Feature 4: Bio & Headline Writing */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-black/5 text-xs">
                <div className="flex items-center gap-2">
                  <HugeIcon icon={FlashIcon} size={16} className="w-4 h-4 text-[#5E4BF7] shrink-0" />
                  <span className="font-bold text-[#1C1E22]">Bio & Headline Writing</span>
                </div>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isPro ? 'Unlimited Pro' : 'Basic'}</span>
                </span>
              </div>

              {/* Feature 5: CRM Leads Export */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-black/5 text-xs">
                <div className="flex items-center gap-2">
                  <HugeIcon icon={Building01Icon} size={16} className="w-4 h-4 text-[#5E4BF7] shrink-0" />
                  <span className="font-bold text-[#1C1E22]">Leads CRM & CSV Export</span>
                </div>
                {isPro ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Unlimited Export</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenUpgradeModal}
                    className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <HugeIcon icon={LockIcon} size={12} className="w-3 h-3 text-amber-600" />
                    <span>Pro Only</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pro Upgrade Promotion (shown for Free accounts) */}
          {!isPro && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[#1C1E22] text-white space-y-3 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-[#F8BA38] text-[#191A1E]">
                  <HugeIcon icon={CrownIcon} size={16} className="w-4 h-4" />
                </div>
                <h4 className="font-black text-sm text-white">Upgrade to LinkLyra Pro</h4>
              </div>

              <p className="text-xs text-[#BABEC9] leading-relaxed">
                Connect your custom domain, remove branding, unlock all 12+ themes, and boost bio conversions with priority analytics.
              </p>

              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white text-xs font-black shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Unlock All Pro Features (₹199 / mo)</span>
                <HugeIcon icon={ArrowRight01Icon} size={14} className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INVOICES & RECEIPTS */}
      {/* ======================================================== */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#1C1E22]">Payment Invoices & Receipts</h3>
              <p className="text-[11px] text-[#737882]">
                Official tax invoices for verified payments.
              </p>
            </div>
            <span className="text-xs font-bold text-[#737882] bg-black/5 px-2.5 py-1 rounded-full">
              {invoices.length} Record{invoices.length === 1 ? '' : 's'}
            </span>
          </div>

          {invoices.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl bg-[#FAF8F5] border border-black/5 space-y-2">
              <HugeIcon icon={Invoice01Icon} size={32} className="w-8 h-8 text-[#9DA2AC] mx-auto" />
              <p className="font-bold text-xs text-[#1C1E22]">No invoices found</p>
              <p className="text-[11px] text-[#737882] max-w-xs mx-auto">
                When you complete an upgrade via Razorpay, your official GST-ready receipts will appear here.
              </p>
              {!isPro && (
                <button
                  type="button"
                  onClick={onOpenUpgradeModal}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#5E4BF7] text-white text-xs font-bold hover:bg-[#4E3BE5] transition-colors cursor-pointer"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-2xl bg-[#FAF8F5] border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-black/15 transition-all"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#1C1E22] truncate">
                        {inv.invoiceNumber}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-black bg-emerald-100 text-emerald-800">
                        PAID
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#737882]">
                      <span>{inv.planName}</span>
                      <span>•</span>
                      <span>{formatDate(inv.paidAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                    <span className="font-black text-xs text-[#1C1E22]">
                      {inv.currency === 'INR' ? '₹' : '$'}{inv.amount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceModal(inv)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-black/10 text-xs font-bold text-[#5E4BF7] hover:bg-[#5E4BF7]/5 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <HugeIcon icon={Download01Icon} size={12} className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invoice Printable Receipt Modal */}
      {selectedInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-black/15 shadow-2xl p-5 sm:p-6 text-[#1C1E22] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1C1E22] text-white flex items-center justify-center font-black text-xs">
                  LL
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#1C1E22]">Payment Receipt</h4>
                  <span className="text-[10px] text-[#737882] font-mono">{selectedInvoiceModal.invoiceNumber}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceModal(null)}
                className="p-1 rounded-full hover:bg-black/5 text-[#737882] cursor-pointer"
              >
                <HugeIcon icon={CancelCircleIcon} size={20} className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#737882]">Product / Plan</span>
                <span className="font-bold text-[#1C1E22]">{selectedInvoiceModal.planName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#737882]">Amount Paid</span>
                <span className="font-black text-sm text-[#1C1E22]">
                  {selectedInvoiceModal.currency === 'INR' ? '₹' : '$'}{selectedInvoiceModal.amount}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#737882]">Date</span>
                <span className="font-medium text-[#1C1E22]">{formatDate(selectedInvoiceModal.paidAt)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#737882]">Payment Gateway</span>
                <span className="font-medium text-[#1C1E22]">Razorpay Secure</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-[#737882]">Payment ID</span>
                <span className="font-mono text-[11px] text-[#5E4BF7] truncate max-w-[180px]">
                  {selectedInvoiceModal.razorpayPaymentId}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#737882]">Payment Status</span>
                <span className="font-extrabold text-emerald-600">Captured & Confirmed</span>
              </div>
            </div>

            <div className="pt-3 border-t border-black/10">
              <ButtonGroup variant="secondary" size="md" fullWidth className="w-full">
                <Button
                  fullWidth
                  onClick={() => window.print()}
                >
                  <HugeIcon icon={Download01Icon} size={14} className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setSelectedInvoiceModal(null)}
                >
                  <span>Done</span>
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
