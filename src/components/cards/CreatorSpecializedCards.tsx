import React, { useState } from 'react';
import { HugeIcon } from '../HugeIcon';
import {
  PlayIcon,
  ArrowUpRight01Icon,
  Copy01Icon,
  Tick01Icon,
  Calendar03Icon,
  Location01Icon,
  CreditCardIcon,
} from '@hugeicons/core-free-icons';
import { ProfileCardData } from '../../types';
import { detectVideoMedia } from '../../lib/video';
import { safeOpenUrl } from '../../lib/url';
import { UI_KIT } from '../../lib/ui-kit';
import { useToast } from '../../context/ToastContext';

// -------------------------------------------------------------
// 1. VIDEO SPOTLIGHT CARD (YouTube Videos, Shorts, Instagram Reels)
// -------------------------------------------------------------
export interface VideoSpotlightCardProps {
  card: ProfileCardData;
  interactive?: boolean;
  onLinkClick?: (e: React.MouseEvent) => void;
  radiusClass?: string;
}

export const VideoSpotlightCard: React.FC<VideoSpotlightCardProps> = ({
  card,
  interactive = true,
  onLinkClick,
  radiusClass = 'rounded-2xl',
}) => {
  const { title, subtitle, linkUrl, badgeText, logoSrc, videoMedia, cardBgColor, cardTextColor } = card;
  const videoInfo = detectVideoMedia(linkUrl || videoMedia?.videoUrl);
  const [thumbError, setThumbError] = useState(false);

  // Resolved thumbnail: user uploaded logo > videoMedia thumb > auto-extracted YouTube/Reel thumb
  const resolvedThumbnail =
    (!thumbError && (videoMedia?.thumbnailUrl || videoInfo.thumbnailUrl || logoSrc)) ||
    (videoInfo.fallbackThumbnailUrl) ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

  const badge = badgeText || videoInfo.badgeLabel || 'FEATURED VIDEO';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLinkClick) {
      onLinkClick(e);
      return;
    }
    if (linkUrl) {
      safeOpenUrl(linkUrl);
    }
  };

  const isShortOrReel = videoInfo.isShortOrReel || videoMedia?.isShortOrReel;

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor: cardBgColor || undefined,
        color: cardTextColor || undefined,
      }}
      className={`group w-full max-w-full overflow-hidden ${
        cardBgColor ? 'border border-black/10' : 'bg-[#191A1E] text-white border border-white/10'
      } ${radiusClass} shadow-sm transition-all duration-200 select-none ${
        interactive ? 'cursor-pointer hover:border-white/25 hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      {/* Video Banner Container */}
      <div className={`relative w-full ${isShortOrReel ? 'h-64 sm:h-72' : 'h-48 sm:h-56'} bg-stone-900 overflow-hidden`}>
        <img
          src={resolvedThumbnail}
          alt={title || 'Video Thumbnail'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setThumbError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-black/75 text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {badge}
          </span>
          {videoMedia?.duration && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white backdrop-blur-md border border-white/15">
              {videoMedia.duration}
            </span>
          )}
        </div>

        {/* Center Glowing Play Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl backdrop-blur-xs group-hover:scale-110 group-hover:bg-red-600 transition-all border border-white/30">
            <HugeIcon icon={PlayIcon} size={26} className="ml-1 text-white" />
          </div>
        </div>

        {/* Bottom Banner Title */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
          <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug drop-shadow-sm">
            {title || 'Watch Featured Video'}
          </h3>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white/5 border-t border-white/10">
        <div className="min-w-0 flex-1">
          {subtitle ? (
            <p className="text-xs text-stone-300 truncate font-medium">{subtitle}</p>
          ) : (
            <p className="text-[11px] text-stone-400 truncate">
              {videoInfo.platform === 'youtube'
                ? 'Watch on YouTube'
                : videoInfo.platform === 'instagram'
                ? 'Watch on Instagram Reels'
                : 'Click to watch video'}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#191A1E] text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-sm active:scale-95"
        >
          <span>Watch</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. CREATOR TIP & SUPPORT ME CARD (Direct UPI / GPay / PhonePe)
// -------------------------------------------------------------
export interface TipSupportCardProps {
  card: ProfileCardData;
  interactive?: boolean;
  onLinkClick?: (e: React.MouseEvent) => void;
  radiusClass?: string;
}

export const TipSupportCard: React.FC<TipSupportCardProps> = ({
  card,
  interactive = true,
  onLinkClick,
  radiusClass = 'rounded-2xl',
}) => {
  const { title, subtitle, tipSupport, linkUrl, cardBgColor, cardTextColor } = card;
  const toast = useToast();

  const presetAmounts = tipSupport?.presetAmounts || [100, 250, 500, 1000];
  const [selectedAmount, setSelectedAmount] = useState<number>(
    tipSupport?.defaultAmount || presetAmounts[1] || 250
  );
  const [copiedUpi, setCopiedUpi] = useState(false);

  const upiId = tipSupport?.upiId || '';
  const creatorName = tipSupport?.creatorName || title || 'Creator';
  const thankYou = tipSupport?.thankYouMessage || subtitle || 'Thanks for supporting my creative work! ☕';

  const handlePay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLinkClick) onLinkClick(e);

    if (upiId && upiId.includes('@')) {
      // Build standard universal mobile UPI deep link
      const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(creatorName)}&am=${selectedAmount}&cu=INR&tn=${encodeURIComponent('Support for ' + creatorName)}`;
      
      // On mobile devices, window.location.href triggers native UPI app picker (GPay, PhonePe, Paytm)
      const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = upiUrl;
        return;
      }

      // On desktop, copy UPI ID with clear toast guidance
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      toast.success(`Copied UPI ID: ${upiId}. Open GPay/PhonePe to pay ₹${selectedAmount}!`);
      setTimeout(() => setCopiedUpi(false), 3000);
      return;
    }

    // Fallback to external payment link (e.g. Topmate, BuyMeACoffee)
    const fallbackLink = tipSupport?.paymentLink || linkUrl;
    if (fallbackLink && fallbackLink !== '#' && fallbackLink !== 'https://') {
      safeOpenUrl(fallbackLink);
    } else {
      toast.info('Creator has not configured their UPI ID yet.');
    }
  };

  const handleCopyUpi = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success(`Copied ${upiId} to clipboard!`);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  return (
    <div
      style={{
        backgroundColor: cardBgColor || undefined,
        color: cardTextColor || undefined,
      }}
      className={`w-full max-w-full overflow-hidden ${
        cardBgColor ? 'border border-black/10' : 'bg-white text-stone-900 border border-stone-200/90'
      } ${radiusClass} p-4 sm:p-5 shadow-sm space-y-3.5`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 font-black text-lg shrink-0 shadow-2xs">
            ☕
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-tight">
              {title || 'Support My Creative Journey'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{thankYou}</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 shrink-0">
          TIP JAR
        </span>
      </div>

      {/* Preset Amounts Grid */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
          Choose Tip Amount
        </label>
        <div className="grid grid-cols-4 gap-2">
          {presetAmounts.map((amt) => {
            const isSelected = selectedAmount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAmount(amt);
                }}
                className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-extrabold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#191A1E] text-white shadow-xs scale-102 ring-2 ring-black/10'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                ₹{amt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Row */}
      <div className="pt-1 space-y-2">
        <button
          type="button"
          onClick={handlePay}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <HugeIcon icon={CreditCardIcon} size={16} className="w-4 h-4" />
          <span>Pay ₹{selectedAmount} via UPI (GPay / PhonePe)</span>
        </button>

        {upiId && (
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 px-1">
            <span className="truncate">UPI: <code className="font-mono text-stone-800 font-semibold">{upiId}</code></span>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors ml-2 shrink-0 cursor-pointer"
            >
              {copiedUpi ? (
                <>
                  <HugeIcon icon={Tick01Icon} size={12} className="text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <HugeIcon icon={Copy01Icon} size={12} />
                  <span>Copy UPI</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. COMEDIAN & ARTIST LIVE TOUR CARD
// -------------------------------------------------------------
export interface LiveTourCardProps {
  card: ProfileCardData;
  interactive?: boolean;
  onLinkClick?: (e: React.MouseEvent) => void;
  radiusClass?: string;
}

export const LiveTourCard: React.FC<LiveTourCardProps> = ({
  card,
  interactive = true,
  onLinkClick,
  radiusClass = 'rounded-2xl',
}) => {
  const { title, subtitle, liveTour, linkUrl, cardBgColor, cardTextColor } = card;

  const tourTitle = liveTour?.tourTitle || title || '🎤 Live Comedy & Tour Dates';
  const dates = liveTour?.dates || [
    { id: '1', date: 'Sat, Nov 14', city: 'Mumbai', venue: 'NCPA Theatre', ticketUrl: linkUrl || 'https://insider.in' },
    { id: '2', date: 'Fri, Nov 20', city: 'Bengaluru', venue: 'Good Shepherd Hall', ticketUrl: linkUrl || 'https://bookmyshow.com' },
    { id: '3', date: 'Sun, Nov 29', city: 'Delhi NCR', venue: 'Siri Fort Auditorium', ticketUrl: linkUrl || 'https://bookmyshow.com', soldOut: true },
  ];

  const handleTicketClick = (url: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLinkClick) onLinkClick(e);
    if (url && url !== '#') {
      safeOpenUrl(url);
    }
  };

  return (
    <div
      style={{
        backgroundColor: cardBgColor || undefined,
        color: cardTextColor || undefined,
      }}
      className={`w-full max-w-full overflow-hidden ${
        cardBgColor ? 'border border-black/10' : 'bg-[#191A1E] text-white border border-white/10'
      } ${radiusClass} p-4 sm:p-5 shadow-sm space-y-3.5`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-stone-300 border border-white/10 inline-block mb-1">
            TOUR DATES
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{tourTitle}</h3>
          {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="space-y-2 pt-1">
        {dates.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 hover:bg-white/10 transition-colors"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{item.city}</span>
                <span className="text-[11px] text-amber-400 font-semibold">• {item.date}</span>
              </div>
              <p className="text-[11px] text-stone-400 truncate mt-0.5">{item.venue}</p>
            </div>

            <div>
              {item.soldOut ? (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                  SOLD OUT
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleTicketClick(item.ticketUrl, e)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-200 text-[#191A1E] text-xs font-bold transition-all active:scale-95 shadow-2xs shrink-0 flex items-center gap-1"
                >
                  <span>Tickets</span>
                  <HugeIcon icon={ArrowUpRight01Icon} size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
