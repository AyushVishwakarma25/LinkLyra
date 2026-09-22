import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  SentIcon,
  CheckmarkCircle01Icon,
  BubbleChatIcon,
  Calendar01Icon,
  Mail01Icon,
  UserIcon,
  Location01Icon,
  MusicNote01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { ProfileCardData } from '../types';
import { profileService } from '../lib/firebase';
import { safeOpenUrl } from '../lib/url';

export interface MusicBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId?: string;
  artistName?: string;
  artistPhone?: string;
  cardData?: ProfileCardData | null;
  isPreview?: boolean;
}

const EVENT_TYPES = [
  'Festival / Concert Stage',
  'Club / Live Music Venue',
  'College / University Fest',
  'Wedding / Private Reception',
  'Corporate Gala / Conference',
  'Private Party / House Show',
  'Tour Opening Act',
  'Other Live Event',
];

const SET_FORMATS = [
  'Full Live Band (60-90 mins)',
  'Acoustic Duo / Trio (45-60 mins)',
  'Solo Acoustic Showcase',
  'DJ / Live Producer Set',
  'Custom Performance',
];

const BUDGET_BRACKETS = [
  'Under $1,000 / ₹50,000',
  '$1,000 - $3,000 / ₹50,000 - ₹1.5 Lakh',
  '$3,000 - $7,500 / ₹1.5 - ₹4 Lakh',
  '$7,500 - $15,000 / ₹4 - ₹10 Lakh',
  '$15,000+ / ₹10 Lakh+',
  'Custom / Negotiable Budget',
];

export const MusicBookingModal: React.FC<MusicBookingModalProps> = ({
  isOpen,
  onClose,
  pageId = '',
  artistName = 'Artist',
  artistPhone = '',
  cardData = null,
  isPreview = false,
}) => {
  const [organizerName, setOrganizerName] = useState('');
  const [companyOrOrganization, setCompanyOrOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [setFormat, setSetFormat] = useState(SET_FORMATS[0]);
  const [eventDate, setEventDate] = useState('');
  const [venueAndCity, setVenueAndCity] = useState('');
  const [budget, setBudget] = useState(
    cardData?.music?.bookingRate || BUDGET_BRACKETS[1]
  );
  const [notes, setNotes] = useState('');
  const [hp, setHp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return;

    if (!organizerName.trim() || !email.trim()) {
      setErrorMessage('Please provide your name and email address.');
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
        throw new Error('Artist page ID is missing. Please refresh and try again.');
      }

      await profileService.submitLead(pageId, {
        type: 'music_booking',
        name: organizerName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        companyOrBrand: companyOrOrganization.trim(),
        campaignType: `${eventType} (${setFormat})`,
        budgetOrPrice: budget,
        timelineOrDate: eventDate || 'TBD',
        propertyAddress: venueAndCity.trim(),
        details: notes.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting booking inquiry:', err);
      setErrorMessage(err?.message || 'Failed to submit booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const rawNumber = (artistPhone || '').replace(/\D/g, '');
    const cleanNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
    const msg = `Hi ${artistName}! I submitted a booking request for *${eventType}* in *${venueAndCity || 'your city'}* on *${eventDate || 'an upcoming date'}* (Budget: ${budget}). Let's discuss availability!`;
    const url = cleanNumber
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    safeOpenUrl(url);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setOrganizerName('');
    setCompanyOrOrganization('');
    setEmail('');
    setPhone('');
    setNotes('');
    setVenueAndCity('');
    setEventDate('');
    setHp('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              <HugeiconsIcon icon={MusicNote01Icon} size={16} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Book {artistName} Live
              </h2>
              <p className="text-[11px] text-stone-300">
                Direct booking inquiry & availability check
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
              Booking Request Sent!
            </h3>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
              Your inquiry for <strong>{artistName}</strong> has been logged in their management dashboard. They or their team will respond via email shortly.
            </p>

            {artistPhone && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
                >
                  <HugeiconsIcon icon={BubbleChatIcon} size={16} className="text-white" />
                  <span>Notify via WhatsApp Now</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Close Window
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
                  Organizer / Promoter Name *
                </label>
                <div className="relative">
                  <HugeiconsIcon icon={UserIcon} size={14} className="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Organization / Venue / Festival
                </label>
                <input
                  type="text"
                  placeholder="e.g. Red Rocks / College Fest"
                  value={companyOrOrganization}
                  onChange={(e) => setCompanyOrOrganization(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Contact Email *
                </label>
                <div className="relative">
                  <HugeiconsIcon icon={Mail01Icon} size={14} className="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="alex@eventproductions.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Event Category
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 font-medium"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Desired Set Format
                </label>
                <select
                  value={setFormat}
                  onChange={(e) => setSetFormat(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 font-medium"
                >
                  {SET_FORMATS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Event Date
                </label>
                <div className="relative">
                  <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  City & Venue Name
                </label>
                <div className="relative">
                  <HugeiconsIcon icon={Location01Icon} size={14} className="text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Austin, TX • Stubb's"
                    value={venueAndCity}
                    onChange={(e) => setVenueAndCity(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Estimated Budget / Offer
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 font-medium"
              >
                {BUDGET_BRACKETS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Sound System / Rider / Event Details
              </label>
              <textarea
                rows={2}
                placeholder="Expected attendee count, stage setup, hospitality, or travel notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 resize-none"
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
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={SentIcon} size={14} />
                    <span>Submit Booking Inquiry</span>
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
