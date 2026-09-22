import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Location01Icon,
  CheckmarkCircle01Icon,
  BubbleChatIcon,
  CallIcon,
  Mail01Icon,
  UserIcon,
  CalculatorIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { profileService } from '../lib/firebase';
import { safeOpenUrl } from '../lib/url';

export interface HomeValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  agentName?: string;
  agentPhone?: string;
  isPreview?: boolean;
}

const PROPERTY_TYPES = [
  'Single Family Home',
  'Luxury Villa / Estate',
  'Condo / Apartment',
  'Townhouse',
  'Commercial / Multi-Family',
  'Vacant Land / Plot',
];

const BEDROOM_OPTIONS = ['1 Bed', '2 Bed', '3 Bed', '4 Bed', '5+ Beds'];
const CONDITIONS = ['Move-in Ready / Luxury', 'Good / Minor Updates', 'Needs Renovation', 'New Construction'];
const TIMELINES = ['Selling in 1-3 Months', 'Selling in 3-6 Months', 'Just Curious / Refinancing', '1+ Year Out'];

export const HomeValuationModal: React.FC<HomeValuationModalProps> = ({
  isOpen,
  onClose,
  pageId = '',
  agentName = 'Agent',
  agentPhone = '',
  isPreview = false,
}) => {
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);
  const [bedrooms, setBedrooms] = useState(BEDROOM_OPTIONS[2]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [timeline, setTimeline] = useState(TIMELINES[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return;

    if (!address.trim() || !name.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Please fill in your Property Address, Name, Phone Number, and Email.');
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
        throw new Error('Agent page ID is missing. Please refresh and try again.');
      }

      await profileService.submitLead(pageId, {
        type: 'home_valuation',
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        propertyAddress: address.trim(),
        propertyTitle: `${bedrooms} ${propertyType} at ${address}`,
        propertyCondition: `${condition} • ${timeline}`,
        timelineOrDate: timeline,
        details: `Property Type: ${propertyType}, Beds: ${bedrooms}, Condition: ${condition}, Selling Timeline: ${timeline}`,
      });

      setSubmitted(true);    } catch (err: any) {
      console.error('Error submitting home valuation request:', err);
      let msg = err?.message || 'Failed to submit valuation request. Please try again.';
      try {
        const parsed = JSON.parse(msg);
        if (parsed.error) msg = parsed.error;
      } catch {
        // use raw message
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const rawNumber = (agentPhone || '').replace(/\D/g, '');
    const cleanNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
    const msg = `Hi ${agentName}! I requested a free Home Valuation (CMA) for my property at *${address}* (${bedrooms} ${propertyType}). Looking forward to your market report!`;
    const url = cleanNumber 
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    safeOpenUrl(url);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setAddress('');
    setName('');
    setPhone('');
    setEmail('');
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
        <div className="p-3.5 sm:p-5 bg-gradient-to-br from-amber-950 via-stone-900 to-stone-900 text-white relative shrink-0">
          <button
            onClick={handleResetAndClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <HugeiconsIcon icon={CalculatorIcon} size={13} />
            Free Comparative Market Analysis (CMA)
          </div>

          <h2 className="text-base sm:text-2xl font-bold tracking-tight pr-8">
            What's Your Home Worth?
          </h2>
          <p className="text-xs sm:text-sm text-amber-200 mt-0.5 leading-snug">
            Get an instant custom valuation and recent neighborhood comps report from <span className="font-semibold text-white">{agentName}</span>.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-3.5 text-stone-800 text-xs sm:text-sm">
          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={36} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900">Valuation Request Received!</h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mt-1">
                  Thank you, <span className="font-semibold text-stone-700">{name}</span>! {agentName} is analyzing MLS recent closed sales around <span className="font-semibold text-stone-700">{address}</span> and will deliver your custom CMA report within a few hours.
                </p>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
                {agentPhone && (
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <HugeiconsIcon icon={BubbleChatIcon} size={16} />
                    Chat with Agent on WhatsApp
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

              {/* Property Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Property Street Address & Neighborhood *
                </label>
                <div className="relative">
                  <HugeiconsIcon icon={Location01Icon} size={16} className="text-amber-600 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 742 Evergreen Terrace, Austin, TX 78704"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Property Type & Bedrooms Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {BEDROOM_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition & Timeline Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Property Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Selling Timeline
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {TIMELINES.map((tl) => (
                      <option key={tl} value={tl}>
                        {tl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Owner Name *
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={UserIcon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Hayes"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={CallIcon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (512) 555-0123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email for CMA Valuation Report *
                </label>
                <div className="relative">
                  <HugeiconsIcon icon={Mail01Icon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                      Generating Request...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={CalculatorIcon} size={16} />
                      Get Free Home Valuation Report
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
