import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  SentIcon,
  CheckmarkCircle01Icon,
  BubbleChatIcon,
  Building01Icon,
  DollarSquareIcon,
  Mail01Icon,
  UserIcon,
  Clock01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { ProfileCardData, CollaborationPackageItem } from '../types';
import { profileService } from '../lib/firebase';
import { safeOpenUrl } from '../lib/url';

export interface BrandInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  creatorName?: string;
  creatorPhone?: string;
  selectedPackage?: CollaborationPackageItem | null;
  cardData?: ProfileCardData | null;
  isPreview?: boolean;
}

const CAMPAIGN_TYPES = [
  'UGC Video',
  'Dedicated Instagram Reel',
  'Reel + Story Bundle',
  'YouTube Integration',
  'Product Review & Demo',
  'Brand Ambassador',
  'Event / Speaking',
  'Custom Campaign',
];

const BUDGET_OPTIONS = [
  '₹8,000 - ₹15,000 ($100 - $180)',
  '₹15,000 - ₹30,000 ($180 - $360)',
  '₹30,000 - ₹60,000 ($360 - $750)',
  '₹60,000+ ($750+)',
  'Budget to be discussed',
];

const TIMELINE_OPTIONS = [
  'Immediate (Rush / 3 Days)',
  'Within 1 - 2 Weeks',
  'This Month',
  'Flexible / Planning Phase',
];

export const BrandInquiryModal: React.FC<BrandInquiryModalProps> = ({
  isOpen,
  onClose,
  pageId = '',
  creatorName = 'Creator',
  creatorPhone = '',
  selectedPackage = null,
  cardData: _cardData = null,
  isPreview = false,
}) => {
  const [brandName, setBrandName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [campaignType, setCampaignType] = useState<string>(
    selectedPackage?.name ? selectedPackage.name : 'Dedicated Instagram Reel'
  );
  const [budget, setBudget] = useState<string>(
    selectedPackage?.price ? selectedPackage.price : '₹15,000 - ₹30,000 ($180 - $360)'
  );
  const [timeline, setTimeline] = useState<string>('Within 1 - 2 Weeks');
  const [details, setDetails] = useState('');
  const [hp, setHp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return;

    if (!brandName.trim() || !email.trim() || !contactName.trim()) {
      setErrorMessage('Please fill in your Brand Name, Contact Name, and Work Email.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (isPreview) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setSubmitted(true);
        return;
      }

      if (!pageId) {
        throw new Error('Creator page ID is missing. Please refresh and try again.');
      }

      await profileService.submitLead(pageId, {
        type: 'brand_inquiry',
        name: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        companyOrBrand: brandName.trim(),
        campaignType: campaignType,
        budgetOrPrice: budget,
        timelineOrDate: timeline,
        details: details.trim(),
        selectedPackageName: selectedPackage?.name || '',
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting brand inquiry:', err);
      let msg = err?.message || 'Failed to submit inquiry. Please try again.';
      try {
        const parsed = JSON.parse(msg);
        if (parsed.error) {
          msg = parsed.error;
        }
      } catch {
        // use raw message
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const rawNumber = (creatorPhone || '').replace(/\D/g, '');
    const cleanNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
    const msg = `Hi ${creatorName}! I just submitted a brand sponsorship inquiry from *${brandName}* for *${campaignType}* (Budget: ${budget}). Let's connect!`;
    const url = cleanNumber 
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    safeOpenUrl(url);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setBrandName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setDetails('');
    setHp('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92dvh] sm:max-h-[88vh] flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-[#1C1E22] text-white relative shrink-0">
          <button
            onClick={handleResetAndClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-stone-300 text-[11px] font-semibold uppercase tracking-wider mb-1">
            Brand Collaboration Inquiry
          </div>
          <h2 className="text-base sm:text-2xl font-bold tracking-tight pr-8">
            Work With {creatorName}
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5 leading-snug">
            Submit your sponsorship or UGC campaign brief. Direct response within 24 hours.
          </p>

          {selectedPackage && (
            <div className="mt-2 p-2 sm:p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Selected Package:</span>
                <span className="font-semibold text-white">{selectedPackage.name}</span>
              </div>
              <div className="font-bold text-amber-300 text-xs sm:text-sm bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                {selectedPackage.price}
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-3.5 text-stone-800 text-xs sm:text-sm">
          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={36} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900">Inquiry Sent Successfully!</h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mt-1">
                  Thank you, <span className="font-semibold text-stone-700">{contactName}</span>! Your campaign brief for <span className="font-semibold text-stone-700">{brandName}</span> has been routed directly to {creatorName}.
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
                {creatorPhone && (
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <HugeiconsIcon icon={BubbleChatIcon} size={16} />
                    Chat on WhatsApp Now
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              {isPreview && (
                <div className="p-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <span>Preview mode: submissions are simulated</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 animate-fadeIn">
                  <span className="break-words min-w-0 flex-1 font-medium">{errorMessage}</span>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="underline font-bold hover:text-rose-950 shrink-0 cursor-pointer text-xs"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Honeypot field for bot protection */}
              <input
                type="text"
                name="_hp"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* Brand & Contact Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Brand / Company Name *
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={Building01Icon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nike, Notion, Plum"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Contact Person Name *
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={UserIcon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Connor"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Work Email *
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={Mail01Icon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="sarah@brand.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    WhatsApp / Phone Number
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={BubbleChatIcon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Type Select */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Deliverable / Campaign Format
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CAMPAIGN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget & Timeline Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Budget Bracket
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={DollarSquareIcon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {BUDGET_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Target Timeline
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={Clock01Icon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {TIMELINE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Campaign Brief */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Campaign Brief & Goal (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your product, target audience, angle, or any specific requirements..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                      Sending Brief...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={SentIcon} size={16} />
                      Submit Brand Inquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
