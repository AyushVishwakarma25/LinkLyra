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
  cardData = null,
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

  const modalTitle = cardData?.title || 'Brand Partnership Inquiry';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-black/10 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-black/5 relative shrink-0">
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-[#737882] hover:text-[#1C1E22] transition-colors cursor-pointer"
            title="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-black/10 text-[#737882] text-[10px] font-semibold uppercase tracking-wider mb-1.5 shadow-2xs">
            Brand Collaboration
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#1C1E22] tracking-tight pr-8">
            {modalTitle}
          </h2>
          <p className="text-xs text-[#737882] mt-0.5 leading-relaxed">
            Submit your collaboration brief. Direct response within 24 hours.
          </p>

          {selectedPackage && (
            <div className="mt-2.5 p-2 sm:p-2.5 rounded-xl bg-white border border-black/10 flex items-center justify-between text-xs shadow-2xs">
              <div>
                <span className="text-[#737882] block text-[10px] font-medium">Selected Package:</span>
                <span className="font-semibold text-[#1C1E22]">{selectedPackage.name}</span>
              </div>
              <div className="font-bold text-[#1C1E22] text-xs bg-[#FAF8F5] px-2 py-1 rounded-lg border border-black/5">
                {selectedPackage.price}
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5 text-xs text-[#1C1E22]">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C1E22]">Inquiry Sent Successfully!</h3>
                <p className="text-xs text-[#737882] max-w-xs mx-auto mt-1 leading-relaxed">
                  Thank you, <span className="font-semibold text-[#1C1E22]">{contactName}</span>! Your brief for <span className="font-semibold text-[#1C1E22]">{brandName}</span> has been received.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                {creatorPhone && (
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <HugeiconsIcon icon={BubbleChatIcon} size={15} />
                    Chat on WhatsApp
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-black/10 hover:bg-black hover:text-white text-[#1C1E22] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {isPreview && (
                <div className="p-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center gap-1.5">
                  <span>Preview mode: submissions are simulated</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center justify-between gap-2">
                  <span className="break-words min-w-0 flex-1 font-medium">{errorMessage}</span>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="underline font-bold hover:text-rose-950 shrink-0 cursor-pointer"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1C1E22] mb-1">
                    Brand / Company *
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={Building01Icon} size={14} className="text-[#737882] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Studio, Nova Labs"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1C1E22] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1C1E22] mb-1">
                    Contact Person *
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={UserIcon} size={14} className="text-[#737882] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1C1E22] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1C1E22] mb-1">
                    Work Email *
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={Mail01Icon} size={14} className="text-[#737882] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1C1E22] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#1C1E22] mb-1">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={BubbleChatIcon} size={14} className="text-[#737882] absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1C1E22] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Type Select */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1C1E22] mb-1">
                  Deliverable Format
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1C1E22] cursor-pointer"
                >
                  {CAMPAIGN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget & Timeline Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1C1E22] mb-1">
                    Budget Estimate
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={DollarSquareIcon} size={14} className="text-[#737882] absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1C1E22] cursor-pointer"
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
                  <label className="block text-[11px] font-semibold text-[#1C1E22] mb-1">
                    Target Timeline
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={Clock01Icon} size={14} className="text-[#737882] absolute left-3 top-2.5 pointer-events-none" />
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1C1E22] cursor-pointer"
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
                <label className="block text-[11px] font-semibold text-[#1C1E22] mb-1">
                  Campaign Brief & Goal (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your product, target audience, angle, or any specific requirements..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1C1E22] resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1C1E22] hover:bg-black text-white font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin" />
                      <span>Sending Brief...</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={SentIcon} size={15} />
                      <span>Submit Brand Inquiry</span>
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
