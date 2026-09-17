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
// 1. SMART MUSIC CARD (Special Card - Auto-detects & lets visitor choose)
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
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const platforms = [
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🟢',
      color: 'bg-[#1DB954] text-black hover:bg-[#1aa34a]',
      badgeColor: 'border-[#1DB954] text-[#1DB954]',
      url: music.spotifyUrl || 'https://open.spotify.com',
    },
    {
      id: 'apple',
      name: 'Apple Music',
      icon: '🍎',
      color: 'bg-[#FA243C] text-white hover:bg-[#e01e34]',
      badgeColor: 'border-[#FA243C] text-[#FA243C]',
      url: music.appleMusicUrl || 'https://music.apple.com',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '🔴',
      color: 'bg-[#FF0000] text-white hover:bg-[#d90000]',
      badgeColor: 'border-[#FF0000] text-[#FF0000]',
      url: music.youtubeUrl || 'https://youtube.com',
    },
    {
      id: 'amazon',
      name: 'Amazon Music',
      icon: '🟠',
      color: 'bg-[#FF9900] text-black hover:bg-[#e68a00]',
      badgeColor: 'border-[#FF9900] text-[#FF9900]',
      url: music.amazonMusicUrl || 'https://music.amazon.com',
    },
  ];

  const activePlatform = platforms.find((p) => p.id === preferredPlatform);

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xs relative"
    >
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
          <HugeIcon icon={DiscIcon} size={12} className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Smart Music Card</span>
        </div>
        {activePlatform && (
          <span className="text-[10px] font-semibold text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
            Prefers {activePlatform.name}
          </span>
        )}
      </div>

      {/* Main Track & Artwork Info */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-800 overflow-hidden shrink-0 border border-stone-700 shadow-sm relative group">
          {music.coverArtUrl ? (
            <img
              src={music.coverArtUrl}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#181B1E] text-stone-400">
              <HugeIcon icon={MusicNote01Icon} size={28} className="w-7 h-7" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
            {music.releaseType || 'Latest Release'}
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate">
            {music.releaseTitle || card.title || 'New Single Out Now'}
          </h3>
          <p className="text-xs text-stone-400 truncate mt-0.5">
            {music.artistName || card.subtitle || 'Listen on your favorite streaming app'}
          </p>
        </div>
      </div>

      {/* Platform Detection / Smart Quick Launch */}
      {activePlatform && !showPlatformSelector ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={(e) => selectPlatform(activePlatform.id, activePlatform.url, e)}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-transform active:scale-98 ${activePlatform.color}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{activePlatform.icon}</span>
              <span>Play on {activePlatform.name}</span>
            </div>
            <div className="flex items-center gap-1 opacity-90 text-[11px]">
              <span>Listen Now</span>
              <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPlatformSelector(true);
            }}
            className="w-full text-center text-[11px] text-stone-400 hover:text-white py-1 transition-colors"
          >
            Switch to another app (Apple Music, YouTube, Amazon)...
          </button>
        </div>
      ) : (
        <div>
          <p className="text-[11px] text-stone-400 font-medium mb-2.5">
            Choose where you'd like to stream:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={(e) => selectPlatform(p.id, p.url, e)}
                className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/90 border border-stone-700/60 text-white text-xs font-semibold flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{p.icon}</span>
                  <span className="truncate">{p.name}</span>
                </div>
                <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3 text-stone-400 group-hover:text-white shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------------
// 2. LATEST RELEASE CARD
// -------------------------------------------------------------------
export const MusicLatestReleaseCard: React.FC<MusicianCardProps> = ({
  card,
  interactive = true,
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
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xs relative"
    >
      <audio
        ref={audioRef}
        src={music.audioPreviewUrl || DEMO_AUDIO_URL}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 flex items-center gap-1.5">
          <HugeIcon icon={DiscIcon} size={12} className="w-3 h-3" />
          <span>{music.releaseType || 'Latest Release'}</span>
        </span>
        {music.releaseDate && (
          <span className="text-[11px] text-stone-400 font-medium">
            {music.releaseDate}
          </span>
        )}
      </div>

      <div className="flex gap-3.5 items-center mb-3.5">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-800 overflow-hidden shrink-0 border border-stone-700">
          {music.coverArtUrl ? (
            <img
              src={music.coverArtUrl}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-rose-400">
              <HugeIcon icon={MusicNote01Icon} size={32} className="w-8 h-8" />
            </div>
          )}

          {/* In-Artwork Audio Play Overlay */}
          <button
            type="button"
            onClick={toggleAudio}
            title={isPlaying ? 'Pause Preview' : 'Play Preview'}
            className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors text-white"
          >
            {isPlaying ? (
              <HugeIcon icon={PauseIcon} size={24} className="w-6 h-6 text-white" />
            ) : (
              <HugeIcon icon={PlayIcon} size={24} className="w-6 h-6 text-white translate-x-0.5" />
            )}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
            {music.releaseTitle || card.title || 'New Release Title'}
          </h3>
          <p className="text-xs text-stone-300 truncate mt-0.5">
            {music.artistName || card.subtitle || 'Artist Name'}
          </p>

          {/* Equalizer Wave or Preview hint */}
          <div className="mt-2 flex items-center gap-2">
            {isPlaying ? (
              <div className="flex items-end gap-1 h-3.5">
                <span className="w-1 bg-rose-400 rounded-full animate-pulse h-full" />
                <span className="w-1 bg-rose-400 rounded-full animate-pulse h-2/3" />
                <span className="w-1 bg-rose-400 rounded-full animate-pulse h-full" />
                <span className="w-1 bg-rose-400 rounded-full animate-pulse h-1/2" />
                <span className="text-[10px] text-rose-300 font-bold ml-1">Playing Preview</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleAudio}
                className="text-[11px] font-semibold text-stone-400 hover:text-white flex items-center gap-1"
              >
                <HugeIcon icon={VolumeHighIcon} size={12} className="w-3 h-3" />
                <span>Tap artwork to listen</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stream Buttons Bar */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-800">
        <button
          type="button"
          onClick={() => handleOpenStream(music.spotifyUrl)}
          className="py-2 px-2.5 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-[#1DB954] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <span>Spotify</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={() => handleOpenStream(music.appleMusicUrl)}
          className="py-2 px-2.5 rounded-xl bg-[#FA243C]/15 hover:bg-[#FA243C]/25 text-[#FA243C] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <span>Apple</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={() => handleOpenStream(music.youtubeUrl)}
          className="py-2 px-2.5 rounded-xl bg-[#FF0000]/15 hover:bg-[#FF0000]/25 text-red-400 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <span>YouTube</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 3. STREAMING HUB CARD (Spotify / Apple Music / YouTube)
// -------------------------------------------------------------------
export const MusicStreamingHubCard: React.FC<MusicianCardProps> = ({
  card,
}) => {
  const music: MusicMetadata = card.music || {};

  const services = [
    { name: 'Spotify', url: music.spotifyUrl || 'https://open.spotify.com', color: 'hover:border-[#1DB954] hover:text-[#1DB954]' },
    { name: 'Apple Music', url: music.appleMusicUrl || 'https://music.apple.com', color: 'hover:border-[#FA243C] hover:text-[#FA243C]' },
    { name: 'YouTube Music', url: music.youtubeUrl || 'https://music.youtube.com', color: 'hover:border-[#FF0000] hover:text-[#FF0000]' },
    { name: 'Amazon Music', url: music.amazonMusicUrl || 'https://music.amazon.com', color: 'hover:border-[#FF9900] hover:text-[#FF9900]' },
  ];

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-stone-900 text-white rounded-[24px] border border-stone-800 p-4 sm:p-5 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
            Streaming Hub
          </span>
          <h3 className="text-base font-bold text-white tracking-tight">
            {card.title || 'Listen On Your Platform'}
          </h3>
        </div>
        <HugeIcon icon={HeadphonesIcon} size={20} className="w-5 h-5 text-purple-400" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {services.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-xl bg-stone-800/80 border border-stone-700/60 text-xs font-semibold text-stone-200 flex items-center justify-between transition-all ${s.color}`}
          >
            <span>{s.name}</span>
            <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5 opacity-60" />
          </a>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 4. BOOK ME FOR LIVE SHOWS / LIVE SHOWS & FESTIVALS (Card 10 in Reference Image)
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
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 space-y-3 shadow-2xs cursor-pointer hover:border-white/20 transition-all select-none"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
          ⚡ LIVE SHOWS & FESTIVALS
        </span>
        <span className="text-xs text-stone-400 flex items-center gap-1 font-medium">
          Sign In ▾
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {card.title || 'Book Market Live Shows & Festivals'}
        </h3>
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
          {music.epkBio || card.subtitle || 'Enodk • 1 hour ago • Chok & frns to yours'}
        </p>
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Ineply is here to show</span>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-full bg-white hover:bg-stone-100 text-[#1C1E22] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
        >
          Book Live Show
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 5. UPCOMING SHOWS & TOUR DATES (Card 14 in Reference Image)
// -------------------------------------------------------------------
export const MusicUpcomingShowsCard: React.FC<MusicianCardProps> = ({
  card,
}) => {
  const music: MusicMetadata = card.music || {};
  const tourDates: TourDateItem[] = music.tourDates && music.tourDates.length > 0
    ? music.tourDates
    : [
        { date: 'Bo. H5, 7 tise', city: 'Be Way Tear', venue: '6 now 1 ad 6:00 up', ticketUrl: '#', soldOut: false },
        { date: 'No. H5, 7 tleo', city: 'Think Lasic', venue: '6 to care 6pm', ticketUrl: '#', soldOut: false },
        { date: 'Jan 25, 2023', city: 'Share ago: 1.0B fr', venue: '120 Listenaps', ticketUrl: '#', soldOut: false },
      ];

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 space-y-3 shadow-2xs"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>🕒 {card.title || 'The Happy Fall Tour 2021'}</span>
          </h3>
        </div>
        <span className="text-xs font-semibold text-amber-400">
          Free
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {tourDates.map((item, idx) => (
          <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-stone-200 truncate">
                {item.date} / {item.city} • <span className="text-stone-400 font-normal">{item.venue}</span>
              </div>
            </div>

            <div>
              <a
                href={item.ticketUrl || '#'}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-stone-100 text-[#1C1E22] transition-colors inline-flex items-center shadow-2xs"
              >
                Details
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 6. IN-CARD MUSIC PLAYER
// -------------------------------------------------------------------
export const MusicPlayerCard: React.FC<MusicianCardProps> = ({
  card,
}) => {
  const music: MusicMetadata = card.music || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const togglePlay = (e: React.MouseEvent) => {
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

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xs space-y-3"
    >
      <audio
        ref={audioRef}
        src={music.audioPreviewUrl || DEMO_AUDIO_URL}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
          <HugeIcon icon={DiscIcon} size={12} className="w-3 h-3" /> In-App Music Player
        </span>
        <span className="text-[10px] text-stone-400 font-mono">
          {music.trackDuration || '03:42'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95"
        >
          {isPlaying ? (
            <HugeIcon icon={PauseIcon} size={20} className="w-5 h-5 text-white" />
          ) : (
            <HugeIcon icon={PlayIcon} size={20} className="w-5 h-5 text-white translate-x-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white tracking-tight truncate">
            {music.releaseTitle || card.title || 'Selected Track Demo'}
          </h4>
          <p className="text-xs text-stone-400 truncate">
            {music.artistName || card.subtitle || 'Audio Preview'}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 7. MERCH CARD
// -------------------------------------------------------------------
export const MusicMerchCard: React.FC<MusicianCardProps> = ({
  card,
}) => {
  const music: MusicMetadata = card.music || {};
  const merchItems: MerchItem[] = music.merchItems && music.merchItems.length > 0
    ? music.merchItems
    : [
        { name: 'Limited Edition Tour Vinyl (Gatefold)', price: '$35.00', buyUrl: card.linkUrl || 'https://' },
        { name: 'Embroidered Heavyweight Hoodie', price: '$65.00', buyUrl: card.linkUrl || 'https://' },
      ];

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-stone-900 text-white rounded-[24px] border border-stone-800 p-4 sm:p-5 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeIcon icon={ShoppingBag01Icon} size={16} className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {card.title || 'Official Merch Store'}
          </h3>
        </div>
        <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
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
            className="p-3 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-stone-100 flex items-center justify-between transition-colors group"
          >
            <div className="min-w-0 pr-2">
              <span className="text-xs font-semibold block truncate text-white">
                {item.name}
              </span>
              <span className="text-[11px] font-bold text-amber-300">
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
      className="w-full max-w-full overflow-hidden bg-stone-900 text-white rounded-[24px] border border-stone-800 p-4 sm:p-5 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
          📸 Electronic Press Kit (EPK)
        </span>
        <span className="text-[11px] text-stone-400">Promoters & Media</span>
      </div>

      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {card.title || 'Official Press Kit & Stage Rider'}
        </h3>
        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
          {music.epkBio || card.subtitle || 'High-resolution press photos, biography, technical input list & stage layout for festival sound engineers.'}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-800">
        <span className="text-[11px] text-stone-400">PDF • 300 DPI Photos</span>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
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
      className="w-full max-w-full overflow-hidden bg-stone-900 text-white rounded-[24px] border border-stone-800 p-4 sm:p-5 shadow-sm cursor-pointer hover:border-stone-700 transition-all flex items-center justify-between gap-3 select-none"
    >
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
          📩 Booking Inquiry
        </span>
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
          {card.title || 'Send Booking Inquiry'}
        </h3>
        <p className="text-xs text-stone-400 truncate mt-0.5">
          {card.subtitle || 'Check tour dates, private performance availability & technical rider'}
        </p>
      </div>

      <div className="px-3.5 py-2 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs shrink-0 flex items-center gap-1">
        <span>Inquire</span>
        <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};
