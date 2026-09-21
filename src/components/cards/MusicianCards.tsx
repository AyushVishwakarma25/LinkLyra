import React, { useState, useRef, useEffect } from 'react';
import { HugeIcon } from '../HugeIcon';
import {
  MusicNote01Icon,
  PlayIcon,
  PauseIcon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  Ticket02Icon,
  ShoppingBag01Icon,
  Download01Icon,
  VolumeHighIcon,
  HeadphonesIcon,
  DiscIcon,
} from '@hugeicons/core-free-icons';
import { ProfileCardData, MusicMetadata, TourDateItem, MerchItem } from '../../types';
import { UI_KIT } from '../../lib/ui-kit';
import { sanitizeUrl } from '../../lib/security';

export interface MusicianCardProps {
  card: ProfileCardData;
  interactive?: boolean;
  businessPhone?: string;
  onOpenMusicBookingModal?: (card: ProfileCardData) => void;
  onMissingPhone?: () => void;
  onLinkClick?: (e: React.MouseEvent) => void;
}

// Sample audio fallback snippet for instant interactive demo
const DEMO_AUDIO_URL = 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg';

// -------------------------------------------------------------------
// 1. SMART MUSIC CARD (Multi-platform streaming router)
// -------------------------------------------------------------------
export const SmartMusicCard: React.FC<MusicianCardProps> = ({
  card,
  interactive = true,
  onLinkClick,
}) => {
  const music: MusicMetadata = card.music || {};
  const [preferredPlatform, setPreferredPlatform] = useState<string>('');
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('linklyra_preferred_music_platform');
      if (saved) {
        setPreferredPlatform(saved);
      } else if (music.preferredPlatformDefault) {
        setPreferredPlatform(music.preferredPlatformDefault);
      }
    } catch (_) {}
  }, [music.preferredPlatformDefault]);

  const selectPlatform = (plat: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.setItem('linklyra_preferred_music_platform', plat);
      setPreferredPlatform(plat);
    } catch (_) {}

    if (url) {
      const safeUrl = sanitizeUrl(url);
      if (safeUrl && safeUrl !== '#') {
        window.open(safeUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const platforms = [
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🟢',
      url: music.spotifyUrl || 'https://open.spotify.com',
    },
    {
      id: 'apple',
      name: 'Apple Music',
      icon: '🍎',
      url: music.appleMusicUrl || 'https://music.apple.com',
    },
    {
      id: 'youtube',
      name: 'YouTube Music',
      icon: '🔴',
      url: music.youtubeUrl || 'https://music.youtube.com',
    },
    {
      id: 'amazon',
      name: 'Amazon Music',
      icon: '🟠',
      url: music.amazonMusicUrl || 'https://music.amazon.com',
    },
  ];

  const activePlatform = platforms.find((p) => p.id === preferredPlatform);

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-sm space-y-4"
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-300">
          <HugeIcon icon={DiscIcon} size={14} className="w-3.5 h-3.5 text-stone-300" />
          <span>Smart Streaming Link</span>
        </div>
        {activePlatform && (
          <span className="text-[10px] font-medium text-stone-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            Prefers {activePlatform.name}
          </span>
        )}
      </div>

      {/* Main Track & Artwork Info */}
      <div className="flex items-center gap-3.5">
        <div className="w-16 h-16 rounded-xl bg-stone-800 overflow-hidden shrink-0 border border-white/10 shadow-sm relative group">
          {music.coverArtUrl ? (
            <img
              src={music.coverArtUrl}
              alt={music.releaseTitle || card.title || 'Album artwork'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-400">
              <HugeIcon icon={MusicNote01Icon} size={24} className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
            {music.releaseType || 'Latest Single'}
          </span>
          <h3 className="text-base font-bold text-white tracking-tight truncate">
            {music.releaseTitle || card.title || 'New Release'}
          </h3>
          <p className="text-xs text-stone-300 truncate mt-0.5">
            {music.artistName || card.subtitle || 'Available on all major platforms'}
          </p>
        </div>
      </div>

      {/* Platform Launch or Platform Chooser */}
      {activePlatform && !showPlatformSelector ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={(e) => selectPlatform(activePlatform.id, activePlatform.url, e)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white hover:bg-stone-100 text-[#191A1E] flex items-center justify-between shadow-sm transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{activePlatform.icon}</span>
              <span>Play on {activePlatform.name}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600">
              <span>Listen</span>
              <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5 text-stone-800" />
            </div>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPlatformSelector(true);
            }}
            className="w-full text-center text-[11px] text-stone-400 hover:text-white py-1 transition-colors cursor-pointer"
          >
            Switch streaming service...
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-stone-400 font-medium">
            Select your streaming service:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={(e) => selectPlatform(p.id, p.url, e)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{p.icon}</span>
                  <span className="truncate">{p.name}</span>
                </div>
                <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3 text-stone-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------------
// 2. LATEST RELEASE CARD (Artwork + Audio Preview + Stream Links)
// -------------------------------------------------------------------
export const MusicLatestReleaseCard: React.FC<MusicianCardProps> = ({
  card,
}) => {
  const music: MusicMetadata = card.music || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleOpenStream = (url?: string) => {
    const targetUrl = url || music.spotifyUrl || card.linkUrl || 'https://open.spotify.com';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-sm space-y-4"
    >
      <audio
        ref={audioRef}
        src={music.audioPreviewUrl || DEMO_AUDIO_URL}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-stone-300 border border-white/10 flex items-center gap-1.5">
          <HugeIcon icon={DiscIcon} size={12} className="w-3 h-3" />
          <span>{music.releaseType || 'Latest Release'}</span>
        </span>
        {music.releaseDate && (
          <span className="text-[11px] text-stone-400 font-medium">
            {music.releaseDate}
          </span>
        )}
      </div>

      <div className="flex gap-3.5 items-center">
        <div className="relative w-16 h-16 rounded-xl bg-stone-800 overflow-hidden shrink-0 border border-white/10">
          {music.coverArtUrl ? (
            <img
              src={music.coverArtUrl}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-400">
              <HugeIcon icon={MusicNote01Icon} size={24} className="w-6 h-6" />
            </div>
          )}

          {/* Audio Play Overlay */}
          <button
            type="button"
            onClick={toggleAudio}
            title={isPlaying ? 'Pause Preview' : 'Play Preview'}
            className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors text-white cursor-pointer"
          >
            {isPlaying ? (
              <HugeIcon icon={PauseIcon} size={20} className="w-5 h-5 text-white" />
            ) : (
              <HugeIcon icon={PlayIcon} size={20} className="w-5 h-5 text-white translate-x-0.5" />
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-white tracking-tight truncate">
            {music.releaseTitle || card.title || 'Track Title'}
          </h3>
          <p className="text-xs text-stone-300 truncate mt-0.5">
            {music.artistName || card.subtitle || 'Artist Name'}
          </p>

          <div className="mt-2 flex items-center gap-2">
            {isPlaying ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[11px] text-stone-300 font-medium">Playing Audio Preview</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleAudio}
                className="text-[11px] font-medium text-stone-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <HugeIcon icon={VolumeHighIcon} size={12} className="w-3 h-3" />
                <span>Tap artwork to preview audio</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stream Buttons Bar */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => handleOpenStream(music.spotifyUrl)}
          className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Spotify</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3 text-stone-400" />
        </button>

        <button
          type="button"
          onClick={() => handleOpenStream(music.appleMusicUrl)}
          className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>Apple</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3 text-stone-400" />
        </button>

        <button
          type="button"
          onClick={() => handleOpenStream(music.youtubeUrl)}
          className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span>YouTube</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3 text-stone-400" />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 3. STREAMING HUB CARD (Alias mapped to clean router)
// -------------------------------------------------------------------
export const MusicStreamingHubCard: React.FC<MusicianCardProps> = (props) => {
  return <SmartMusicCard {...props} />;
};

// -------------------------------------------------------------------
// 4. BOOK ME FOR LIVE SHOWS
// -------------------------------------------------------------------
export const MusicBookMeCard: React.FC<MusicianCardProps> = ({
  card,
  onOpenMusicBookingModal,
}) => {
  const music: MusicMetadata = card.music || {};

  return (
    <div
      id={card.id}
      onClick={() => onOpenMusicBookingModal && onOpenMusicBookingModal(card)}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-sm cursor-pointer hover:border-white/20 transition-all select-none space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-stone-300 border border-white/10">
          Live Shows & Festivals
        </span>
        <span className="text-xs text-stone-400 font-medium">
          Direct Booking
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {card.title || 'Book Live Performance'}
        </h3>
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
          {music.epkBio || card.subtitle || 'Available for club tours, festival stages, private performances & DJ sets.'}
        </p>
      </div>

      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
          <span>Available for direct bookings</span>
        </div>
        <button
          type="button"
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-100 text-[#191A1E] font-bold text-xs shadow-sm transition-colors cursor-pointer"
        >
          Inquire Dates
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 5. UPCOMING SHOWS & TOUR DATES
// -------------------------------------------------------------------
export const MusicUpcomingShowsCard: React.FC<MusicianCardProps> = ({
  card,
}) => {
  const music: MusicMetadata = card.music || {};
  const tourDates: TourDateItem[] = music.tourDates && music.tourDates.length > 0
    ? music.tourDates
    : [
        { date: 'Nov 14', city: 'Austin, TX', venue: 'Empire Control Room', ticketUrl: '#', soldOut: false },
        { date: 'Nov 20', city: 'Los Angeles, CA', venue: 'The Roxy Theatre', ticketUrl: '#', soldOut: false },
        { date: 'Dec 02', city: 'New York, NY', venue: 'Brooklyn Steel', ticketUrl: '#', soldOut: true },
      ];

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
          <HugeIcon icon={Calendar03Icon} size={16} className="w-4 h-4 text-stone-300" />
          <span>{card.title || 'Upcoming Tour Dates'}</span>
        </h3>
        <span className="text-xs font-semibold text-stone-400">
          Live Shows
        </span>
      </div>

      <div className="divide-y divide-white/10">
        {tourDates.map((item, idx) => (
          <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {item.date} • {item.city}
              </div>
              <div className="text-[11px] text-stone-400 truncate mt-0.5">
                {item.venue}
              </div>
            </div>

            <div>
              {item.soldOut ? (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/5 text-stone-400 border border-white/10">
                  Sold Out
                </span>
              ) : (
                <a
                  href={item.ticketUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-stone-100 text-[#191A1E] transition-colors inline-flex items-center gap-1 shadow-sm"
                >
                  <span>Tickets</span>
                  <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3 text-[#191A1E]" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 6. IN-CARD MUSIC PLAYER (Clean minimal preview)
// -------------------------------------------------------------------
export const MusicPlayerCard: React.FC<MusicianCardProps> = ({
  card,
}) => {
  return <MusicLatestReleaseCard card={card} />;
};

// -------------------------------------------------------------------
// 7. MERCH CARD (Clean minimal product showcase)
// -------------------------------------------------------------------
export const MusicMerchCard: React.FC<MusicianCardProps> = ({
  card,
}) => {
  const music: MusicMetadata = card.music || {};
  const merchItems: MerchItem[] = music.merchItems && music.merchItems.length > 0
    ? music.merchItems
    : [
        { name: 'Tour Vinyl (Limited Edition)', price: '$35.00', buyUrl: card.linkUrl || '#' },
        { name: 'Heavyweight Album Hoodie', price: '$65.00', buyUrl: card.linkUrl || '#' },
      ];

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeIcon icon={ShoppingBag01Icon} size={16} className="w-4 h-4 text-stone-300" />
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {card.title || 'Official Artist Merch'}
          </h3>
        </div>
        <span className="text-[10px] font-bold uppercase text-stone-300 bg-white/10 px-2 py-0.5 rounded-full">
          Store
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {merchItems.map((item, idx) => (
          <a
            key={idx}
            href={item.buyUrl || card.linkUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-100 flex items-center justify-between transition-colors group"
          >
            <div className="min-w-0 pr-2">
              <span className="text-xs font-semibold block truncate text-white">
                {item.name}
              </span>
              <span className="text-[11px] font-bold text-stone-300 mt-0.5 block">
                {item.price}
              </span>
            </div>
            <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5 text-stone-400 group-hover:text-white shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 8. PRESS KIT (EPK)
// -------------------------------------------------------------------
export const MusicPressKitCard: React.FC<MusicianCardProps> = ({
  card,
}) => {
  const music: MusicMetadata = card.music || {};
  const downloadUrl = music.epkDownloadUrl || card.linkUrl || '#';

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Electronic Press Kit (EPK)
        </span>
        <span className="text-[11px] text-stone-400">Promoters & Media</span>
      </div>

      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {card.title || 'Press Assets & Stage Rider'}
        </h3>
        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
          {music.epkBio || card.subtitle || 'High-res photos, bio, technical input list, and stage plot for sound engineers.'}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/10">
        <span className="text-[11px] text-stone-400">PDF • Press Assets</span>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#191A1E] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <HugeIcon icon={Download01Icon} size={14} className="w-3.5 h-3.5" />
          <span>Download EPK</span>
        </a>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 9. BOOKING INQUIRY CARD
// -------------------------------------------------------------------
export const MusicBookingInquiryCard: React.FC<MusicianCardProps> = ({
  card,
  onOpenMusicBookingModal,
}) => {
  return (
    <div
      id={card.id}
      onClick={() => onOpenMusicBookingModal && onOpenMusicBookingModal(card)}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-sm cursor-pointer hover:border-white/20 transition-all flex items-center justify-between gap-3 select-none"
    >
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
          Booking Inquiry
        </span>
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
          {card.title || 'Live Performance Inquiries'}
        </h3>
        <p className="text-xs text-stone-400 truncate mt-0.5">
          {card.subtitle || 'Check tour dates, festival availability & performance rates'}
        </p>
      </div>

      <div className="px-3.5 py-2 rounded-xl bg-white text-[#191A1E] font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm">
        <span>Inquire</span>
        <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};
