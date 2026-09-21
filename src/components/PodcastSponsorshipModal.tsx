import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  SentIcon,
  CheckmarkCircle01Icon,
  BubbleChatIcon,
  DollarSquareIcon,
  Mail01Icon,
  UserIcon,
  Mic01Icon,
  Building01Icon,
  Calendar01Icon,
  Download01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { ProfileCardData } from '../types';
import { profileService } from '../lib/firebase';

export interface PodcastSponsorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  podcastTitle?: string;
  hostName?: string;
  hostPhone?: string;
  mediaKitUrl?: string;
  cardData?: ProfileCardData | null;
  isPreview?: boolean;
}

const AD_SLOT_TYPES = [
  'Host-Read Mid-Roll (60s with personal story)',
  'Pre-Roll (15-30s introduction slot)',
  'Post-Roll & Show Notes Promo (30s)',
  'Full Episode Title Sponsorship (Exclusive)',
  'Quarterly 4-Episode Package (Best Value)',
  'Newsletter + Audio Bundle',
  'Custom Partnership / Guest Appearance',
];

const BUDGET_RANGES = [
  'Under $1,000 / ₹50,000',
  '$1,000 - $2,500 / ₹50k - ₹1.5L',
  '$2,500 - $5,000 / ₹1.5L - ₹3.5L',
  '$5,000 - $10,000 / ₹3.5L - ₹7L',
  '$10,000+ / ₹7L+',
  'CPM-Based / Long-term Retainer',
];

export const PodcastSponsorshipModal: React.FC<PodcastSponsorshipModalProps> = ({
  isOpen,
  onClose,
  pageId = '',
  podcastTitle = 'The Show',
  hostName = 'Host',
  hostPhone = '',
  mediaKitUrl = '',
  cardData = null,
  isPreview = false,
}) => {
  const [brandName, setBrandName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adSlot, setAdSlot] = useState(AD_SLOT_TYPES[0]);
  const [budget, setBudget] = useState(
    cardData?.podcast?.cpmRate || BUDGET_RANGES[1]
  );
  const [targetMonth, setTargetMonth] = useState('');
  const [pitch, setPitch] = useState('');
  const [hp, setHp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return;

    if (!brandName.trim() || !contactName.trim() || !email.trim()) {
      setErrorMessage('Please provide your brand name, your name, and a valid work email.');
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
        throw new Error('Podcast host page ID is missing. Please refresh and try again.');
      }

      await profileService.submitLead(pageId, {
        type: 'podcast_sponsorship',
        name: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        companyOrBrand: brandName.trim(),
        campaignType: adSlot,
        budgetOrPrice: budget,
        timelineOrDate: targetMonth || 'Upcoming Slots',
        details: pitch.trim(),
        selectedPackageName: `Podcast Ad: ${adSlot}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting podcast sponsorship request:', err);
      setErrorMessage(err?.message || 'Failed to submit sponsorship inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const rawNumber = (hostPhone || '').replace(/\D/g, '');
    const cleanNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
    const msg = `Hi ${hostName}! I just submitted a sponsorship inquiry for *${podcastTitle}* from *${brandName}* for *${adSlot}* (Budget: ${budget}). Looking forward to partnering!`;
    const url = cleanNumber
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setBrandName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setPitch('');
    setTargetMonth('');
    setHp('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 bg-[#1C1E22] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold">
              <HugeiconsIcon icon={Mic01Icon} size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Sponsor {podcastTitle}
              </h2>
              <p className="text-[11px] text-stone-300">
                Reach an engaged, high-intent audience
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={24} />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
               Sponsorship Request Dispatched!
            </h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              Thank you for choosing <strong>{podcastTitle}</strong>. Our partnership team will review your brand details, audience alignment, and confirm available episode inventory within 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              {mediaKitUrl && (
                <a
                  href={mediaKitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <HugeiconsIcon icon={Download01Icon} size={14} />
                  <span>Download Media Kit</span>
                </a>
              )}
              {hostPhone && (
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full sm:w-auto py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <HugeiconsIcon icon={BubbleChatIcon} size={14} className="text-white" />
                  <span>Notify Host via WhatsApp</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
            {isPreview && (
              <div className="p-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                <span>Preview: submissions aren't saved</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
                <span>{errorMessage}</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Brand / Company Name *
                </label>
                <div className="relative">
                  <HugeiconsIcon icon={Building01Icon} size={14} className="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Linear / Notion"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Contact Person *
                </label>
                <div className="relative">
                  <HugeiconsIcon icon={UserIcon} size={14} className="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins (Head of Growth)"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Work Email *
                </label>
                <div className="relative">
                  <HugeiconsIcon icon={Mail01Icon} size={14} className="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="sarah@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="+1 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Sponsorship Slot
                </label>
                <select
                  value={adSlot}
                  onChange={(e) => setAdSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50 font-medium"
                >
                  {AD_SLOT_TYPES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Estimated Campaign Budget
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50 font-medium"
                >
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Target Launch Month / Timeframe
              </label>
              <div className="relative">
                <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Next month / Q3 Product Launch"
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Campaign Goal & Key Product Pitch
              </label>
              <textarea
                rows={2}
                placeholder="What is your product and what exclusive offer or link should we share with listeners?"
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#1C1E22] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                    <span>Sending Brief...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={SentIcon} size={14} />
                    <span>Request Sponsorship Slot</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
