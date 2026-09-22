import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Calendar01Icon,
  Location01Icon,
  CheckmarkCircle01Icon,
  BubbleChatIcon,
  CallIcon,
  Mail01Icon,
  UserIcon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { ProfileCardData, RealEstateMetadata } from '../types';
import { profileService } from '../lib/firebase';
import { safeOpenUrl } from '../lib/url';

export interface ShowingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  agentName?: string;
  agentPhone?: string;
  cardData?: ProfileCardData | null;
  isPreview?: boolean;
}

const TIME_SLOTS = [
  'Morning (10:00 AM - 12:00 PM)',
  'Afternoon (1:00 PM - 3:00 PM)',
  'Late Afternoon (3:30 PM - 5:30 PM)',
  'Evening (5:30 PM - 7:00 PM)',
];

const BUYER_STATUSES = [
  { id: 'pre_approved', label: 'Pre-Approved Mortgage', icon: '🏦' },
  { id: 'all_cash', label: 'All-Cash Buyer', icon: '💵' },
  { id: 'first_time', label: 'First-Time Homebuyer', icon: '🔑' },
  { id: 'investor', label: 'Investor / Relocation', icon: '📈' },
];

export const ShowingBookingModal: React.FC<ShowingBookingModalProps> = ({
  isOpen,
  onClose,
  pageId = '',
  agentName = 'Agent',
  agentPhone = '',
  cardData = null,
  isPreview = false,
}) => {
  const realEstate: RealEstateMetadata | undefined = cardData?.realEstate;
  const propertyTitle = realEstate?.propertyName || cardData?.title || 'Featured Property Listing';
  const propertyPrice = realEstate?.price || realEstate?.priceBracket || '';
  const propertyLocation = realEstate?.location || '';
  const propertyType = realEstate?.propertyType || '';

  // Get tomorrow's date formatted as YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [buyerStatus, setBuyerStatus] = useState(BUYER_STATUSES[0].label);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [hp, setHp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return;

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Please fill in your Name, Phone Number, and Email.');
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
        type: 'showing_request',
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        propertyTitle: propertyTitle,
        timelineOrDate: `${date} • ${timeSlot}`,
        buyerStatus: buyerStatus,
        details: notes.trim(),
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting showing request:', err);
      let msg = err?.message || 'Failed to submit showing request. Please try again.';
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
    const msg = `Hi ${agentName}! I've booked a private showing for *${propertyTitle}* on *${date}* during *${timeSlot}*. Buyer status: ${buyerStatus}. Looking forward to connecting!`;
    const url = cleanNumber 
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    safeOpenUrl(url);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
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
        <div className="p-3.5 sm:p-5 bg-gradient-to-br from-emerald-950 via-teal-900 to-stone-900 text-white relative shrink-0">
          <button
            onClick={handleResetAndClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <HugeiconsIcon icon={Calendar01Icon} size={13} />
            Schedule Private Tour
          </div>

          <h2 className="text-base sm:text-2xl font-bold tracking-tight pr-8">
            Book a Showing
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200 mt-0.5 leading-snug">
            Tour with licensed agent <span className="font-semibold text-white">{agentName}</span>.
          </p>

          {/* Property Card Snapshot */}
          <div className="mt-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-white text-xs sm:text-base line-clamp-1">{propertyTitle}</h3>
                {propertyLocation && (
                  <p className="text-[11px] sm:text-xs text-emerald-200 flex items-center gap-1 mt-0.5">
                    <HugeiconsIcon icon={Location01Icon} size={12} className="text-emerald-300 shrink-0" />
                    {propertyLocation}
                  </p>
                )}
                {propertyType && (
                  <p className="text-[10px] sm:text-[11px] text-emerald-100/80 mt-0.5">{propertyType}</p>
                )}
              </div>
              {propertyPrice && (
                <div className="text-right shrink-0">
                  <span className="text-[9px] sm:text-[10px] text-emerald-200 uppercase tracking-wider block">Price</span>
                  <span className="font-bold text-emerald-300 text-xs sm:text-base">{propertyPrice}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-3.5 text-stone-800 text-xs sm:text-sm">
          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={36} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900">Showing Request Confirmed!</h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto mt-1">
                  We've reserved your tour request for <span className="font-semibold text-stone-700">{propertyTitle}</span> on <span className="font-semibold text-stone-700">{date}</span> ({timeSlot}). {agentName} will reach out shortly.
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
                    Confirm with Agent on WhatsApp
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Close
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

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Preferred Showing Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Time Window *
                  </label>
                  <div className="relative">
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Buyer Status */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Buyer Financing Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BUYER_STATUSES.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setBuyerStatus(status.label)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                        buyerStatus === status.label
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-semibold ring-1 ring-emerald-500'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                      }`}
                    >
                      <span className="text-base">{status.icon}</span>
                      <span className="truncate">{status.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={UserIcon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <HugeiconsIcon icon={CallIcon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (512) 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <HugeiconsIcon icon={Mail01Icon} size={16} className="text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Questions or Special Accommodations (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Need wheelchair accessibility, specific room measurements, HOA details, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                      Requesting Tour...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Calendar01Icon} size={16} />
                      Confirm Showing Request
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
