import React, { useState, useRef } from 'react';
import { HugeIcon } from '../HugeIcon';
import {
  Mic01Icon,
  PlayIcon,
  PauseIcon,
  ArrowUpRight01Icon,
  Download01Icon,
  Clock01Icon,
  SentIcon,
  Analytics01Icon,
  CheckmarkCircle02Icon,
  Mail01Icon,
  YoutubeIcon,
  Search01Icon,
  MoreHorizontalIcon,
} from '@hugeicons/core-free-icons';
import { ProfileCardData, PodcastMetadata, PodcastEpisodeItem } from '../../types';

export interface PodcasterCardProps {
  card: ProfileCardData;
  interactive?: boolean;
  businessPhone?: string;
  onOpenPodcastSponsorModal?: (card: ProfileCardData) => void;
  onMissingPhone?: () => void;
  onLinkClick?: (e: React.MouseEvent) => void;
}

const DEMO_AUDIO_URL = 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg';

// -------------------------------------------------------------------
// 1. SPONSOR THE PODCAST (Card 1 in Reference Image)
// -------------------------------------------------------------------
export const PodcastSponsorMeCard: React.FC<PodcasterCardProps> = ({
  card,
  onOpenPodcastSponsorModal,
}) => {
  const podcast: PodcastMetadata = card.podcast || {};
  const downloads = podcast.monthlyDownloads || '130,000+';
  const listeners = podcast.audienceSize || '122,800s Listeners';
  const statsLine = podcast.listenerDemographics || '130.08 KB, Five Podcast, Presisiad & Figineer';

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xs space-y-3.5"
    >
      {/* Top Badges Row */}
      <div className="flex items-center justify-between gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#2A2F35] text-stone-200 border border-white/10">
          + Sponsor The Podcast
        </span>
        <button
          type="button"
          onClick={() => onOpenPodcastSponsorModal && onOpenPodcastSponsorModal(card)}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          Knowledge Base
        </button>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {card.title || 'Sponsor The Podcast (MB & Audience Stats)'}
        </h3>
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
          {card.subtitle || 'Submit your podcast sponsorship inquiry to our team'}
        </p>
      </div>

      {/* 2-Column Key Metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-[#181B1E] border border-white/5">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
            Downloads
          </span>
          <div className="text-base sm:text-lg font-black text-white mt-0.5">
            {downloads}
          </div>
          <span className="text-[10px] text-stone-400">Total Downloads</span>
        </div>

        <div className="p-3 rounded-xl bg-[#181B1E] border border-white/5">
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
            Access
          </span>
          <div className="text-base sm:text-lg font-black text-white mt-0.5 truncate">
            {listeners}
          </div>
          <span className="text-[10px] text-stone-400">Total Listeners</span>
        </div>
      </div>

      {/* Middle Statistics Strip */}
      <div className="p-2.5 rounded-xl bg-[#181B1E] border border-white/5 text-xs text-stone-300 flex items-center justify-between">
        <span className="text-[11px] text-stone-400 font-medium">Download Statistics:</span>
        <span className="text-xs font-semibold text-stone-200 truncate ml-2">{statsLine}</span>
      </div>

      {/* 4-Column Rate Breakdown */}
      <div>
        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
          Download Rate Statistics
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="p-2 rounded-xl bg-[#181B1E] border border-white/5">
            <span className="text-xs font-bold text-white block">16.6K</span>
            <span className="text-[9px] text-stone-400">Share</span>
          </div>
          <div className="p-2 rounded-xl bg-[#181B1E] border border-white/5">
            <span className="text-xs font-bold text-white block">21ml</span>
            <span className="text-[9px] text-stone-400">Store</span>
          </div>
          <div className="p-2 rounded-xl bg-[#181B1E] border border-white/5">
            <span className="text-xs font-bold text-white block">123.3K</span>
            <span className="text-[9px] text-stone-400">Streams</span>
          </div>
          <div className="p-2 rounded-xl bg-[#181B1E] border border-white/5">
            <span className="text-xs font-bold text-white block">016</span>
            <span className="text-[9px] text-stone-400">More</span>
          </div>
        </div>
      </div>

      {/* Dual Bottom Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
        <a
          href={podcast.mediaKitUrl || card.linkUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 rounded-xl bg-[#2A2F35] hover:bg-[#343B42] text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <HugeIcon icon={Download01Icon} size={14} className="w-3.5 h-3.5 text-stone-400" />
          <span>Download Statistics</span>
        </a>

        <button
          type="button"
          onClick={() => onOpenPodcastSponsorModal && onOpenPodcastSponsorModal(card)}
          className="py-2.5 px-3 rounded-xl bg-[#584CE4] hover:bg-[#4C40D6] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Share / Inquire</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 2. AUDIO PLAYER / EPISODE CARD (Cards 3, 4, 5 in Reference Image)
// -------------------------------------------------------------------
export const PodcastLatestEpisodeCard: React.FC<PodcasterCardProps> = ({
  card,
}) => {
  const podcast: PodcastMetadata = card.podcast || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(16);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleOpenStream = (url?: string) => {
    const targetUrl = url || podcast.spotifyPodcastsUrl || card.linkUrl || 'https://open.spotify.com';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 space-y-3 shadow-2xs"
    >
      <audio
        ref={audioRef}
        src={podcast.audioUrl || DEMO_AUDIO_URL}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Category Badge */}
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
          {podcast.episodeNumber || '⚡ PODCAST PREVIEW'}
        </span>
        <button
          type="button"
          onClick={() => handleOpenStream()}
          className="text-stone-400 hover:text-white p-1"
        >
          <HugeIcon icon={MoreHorizontalIcon} size={14} className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Episode Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#3730A3] flex items-center justify-center shrink-0 border border-white/10 text-white">
          <HugeIcon icon={Mic01Icon} size={20} className="w-5 h-5 text-indigo-200" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white tracking-tight truncate">
            {podcast.episodeTitle || card.title || 'Neon Mirage (Official Single)'}
          </h3>
          <p className="text-[11px] text-stone-400 truncate mt-0.5">
            {card.subtitle || 'Sanctent Player • Naonin reneo or dring episode • 5 track name • 20 mins ago'}
          </p>
        </div>
      </div>

      {/* Interactive Scrub Bar & Controls */}
      <div className="p-2.5 rounded-xl bg-[#181B1E] border border-white/5 space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={togglePlay}
            className="w-6 h-6 rounded-full bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <HugeIcon icon={PauseIcon} size={12} className="w-3 h-3" />
            ) : (
              <HugeIcon icon={PlayIcon} size={12} className="w-3 h-3 ml-0.5" />
            )}
          </button>

          {/* Time scrubber */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] text-stone-400 font-mono">0:58</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="flex-1 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
            />
            <span className="text-[10px] text-stone-400 font-mono">
              {podcast.duration || '5:58'}
            </span>
          </div>
        </div>

        {/* Platform Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <button
            type="button"
            onClick={() => handleOpenStream(podcast.spotifyPodcastsUrl)}
            className="px-2.5 py-1 rounded-lg bg-[#252A2F] hover:bg-[#2F353C] text-[10px] font-semibold text-stone-200 flex items-center gap-1 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
            <span>Spotify ▾</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenStream(podcast.applePodcastsUrl)}
            className="px-2.5 py-1 rounded-lg bg-[#252A2F] hover:bg-[#2F353C] text-[10px] font-semibold text-stone-200 flex items-center gap-1 transition-colors"
          >
            <span>Apple Podcasts ▾</span>
          </button>
        </div>
      </div>

      {/* Dual Bottom Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleOpenStream()}
          className="py-2 px-3 rounded-xl bg-[#584CE4] hover:bg-[#4C40D6] text-white text-xs font-bold text-center transition-colors cursor-pointer"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={() => handleOpenStream()}
          className="py-2 px-3 rounded-xl bg-[#2A2F35] hover:bg-[#343B42] text-stone-300 text-xs font-bold text-center transition-colors cursor-pointer"
        >
          Hide
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 3. LISTEN ON DIRECTORY (Card 15 in Reference Image)
// -------------------------------------------------------------------
export const PodcastListenOnCard: React.FC<PodcasterCardProps> = ({
  card,
}) => {
  const podcast: PodcastMetadata = card.podcast || {};

  const platforms = [
    { name: 'Best Eveares', url: podcast.spotifyPodcastsUrl || 'https://spotify.com' },
    { name: 'Family', url: podcast.applePodcastsUrl || 'https://apple.com' },
    { name: 'Spotify', url: podcast.spotifyPodcastsUrl || 'https://open.spotify.com' },
    { name: 'Amazon Music', url: podcast.amazonMusicUrl || 'https://music.amazon.com' },
  ];

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 space-y-3 shadow-2xs"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
          MUSIC | LIVE TOURS
        </span>
        <HugeIcon icon={MoreHorizontalIcon} size={14} className="w-3.5 h-3.5 text-stone-400" />
      </div>

      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
        {card.title || 'Enter the Port Room to Podcast App'}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-[#181B1E] hover:bg-[#252A2F] border border-white/5 text-xs font-medium text-stone-200 flex items-center justify-between transition-colors"
          >
            <span>{p.name}</span>
            <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3 text-stone-400" />
          </a>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 4. WATCH ON YOUTUBE / VIDEO SHOWCASE (Card 13 in Reference Image)
// -------------------------------------------------------------------
export const PodcastWatchOnYouTubeCard: React.FC<PodcasterCardProps> = ({
  card,
}) => {
  const podcast: PodcastMetadata = card.podcast || {};
  const youtubeUrl = podcast.youtubeChannelUrl || card.linkUrl || 'https://youtube.com';

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 shadow-2xs"
    >
      {/* 16:9 Video Showcase */}
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full h-44 sm:h-48 bg-black/90 flex items-center justify-center group cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95">
          <HugeIcon icon={PlayIcon} size={18} className="w-4.5 h-4.5 ml-0.5 text-stone-900" />
        </div>
      </a>

      {/* Caption strip */}
      <div className="p-3.5 bg-[#181B1E] flex items-center justify-between text-xs">
        <div>
          <h3 className="font-bold text-white text-xs sm:text-sm">
            {card.title || '17 Podcast Counting Campaign'}
          </h3>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {card.subtitle || '80 N W Naws ST • 11 date • 10 5pm'}
          </p>
        </div>
        <HugeIcon icon={YoutubeIcon} size={18} className="w-4.5 h-4.5 text-red-500 shrink-0" />
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 5. EPISODE ARCHIVE / TOUR SCHEDULE (Card 14 in Reference Image)
// -------------------------------------------------------------------
export const PodcastArchiveCard: React.FC<PodcasterCardProps> = ({
  card,
}) => {
  const podcast: PodcastMetadata = card.podcast || {};

  const items = podcast.episodesArchive && podcast.episodesArchive.length > 0
    ? podcast.episodesArchive
    : [
        { episodeNumber: 'Bo. H5, 7 tise', title: 'Be Way Tear 6 now 1 ad 6:00 up', duration: 'Details', listenUrl: '#' },
        { episodeNumber: 'No. H5, 7 tleo', title: 'Think Lasic 6 to care 6pm', duration: 'Details', listenUrl: '#' },
        { episodeNumber: 'Jan 25, 2023', title: 'Share ago: 1.0B fr | 120 Listenaps', duration: 'Details', listenUrl: '#' },
      ];

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 space-y-3 shadow-2xs"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
          <span>🕒 {card.title || 'The Happy Fall Tour 2021'}</span>
        </h3>
        <span className="text-xs font-semibold text-amber-400">
          Free
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {items.map((item, idx) => (
          <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-stone-200 block truncate">
                {item.episodeNumber} / {item.title}
              </span>
            </div>
            <a
              href={item.listenUrl || '#'}
              className="px-3.5 py-1 rounded-full bg-white hover:bg-stone-100 text-[#1C1E22] text-xs font-semibold transition-colors shrink-0"
            >
              Details
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 6. CREATOR STATS / PERFORMANCE (Card 7 & 9 in Reference Image)
// -------------------------------------------------------------------
export const PodcastStatsCard: React.FC<PodcasterCardProps> = ({
  card,
}) => {
  const podcast: PodcastMetadata = card.podcast || {};
  const [visible, setVisible] = useState(true);

  const val1 = podcast.monthlyDownloads || '5.2%';
  const val2 = podcast.audienceSize || '4.2%';
  const val3 = podcast.chartRank || '2.2%';

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 space-y-3 shadow-2xs"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
          {card.title || 'Creator News & Performance'}
        </h3>
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="px-2.5 py-1 rounded-lg bg-[#2A2F35] hover:bg-[#343B42] text-stone-300 text-xs font-medium transition-colors cursor-pointer"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>

      {visible && (
        <>
          {/* 3-Column Solid Colored Stat Boxes */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-3 rounded-xl bg-[#2D2A54] border border-[#4338CA]/40">
              <div className="text-base sm:text-lg font-black text-white">{val1}</div>
              <div className="text-[10px] text-indigo-200 mt-0.5">Avg. View</div>
            </div>

            <div className="p-3 rounded-xl bg-[#133E2B] border border-[#059669]/40">
              <div className="text-base sm:text-lg font-black text-white">{val2}</div>
              <div className="text-[10px] text-emerald-200 mt-0.5">Avg. View</div>
            </div>

            <div className="p-3 rounded-xl bg-[#3D2E14] border border-[#D97706]/40">
              <div className="text-base sm:text-lg font-black text-white">{val3}</div>
              <div className="text-[10px] text-amber-200 mt-0.5">Avg. Views</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 pt-1 border-t border-white/5">
            <span>{card.subtitle || 'Last 5 Items by Comicssant Name'}</span>
            <span className="text-stone-300 font-semibold cursor-pointer hover:text-white">Learn in &gt;</span>
          </div>
        </>
      )}
    </div>
  );
};

// -------------------------------------------------------------------
// 7. NEWSLETTER SUBSCRIPTION CARD
// -------------------------------------------------------------------
export const PodcastNewsletterCard: React.FC<PodcasterCardProps> = ({
  card,
}) => {
  const podcast: PodcastMetadata = card.podcast || {};
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 space-y-3 shadow-2xs"
    >
      <div className="flex items-center gap-2">
        <HugeIcon icon={Mail01Icon} size={16} className="w-4 h-4 text-amber-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
          Show Notes & Updates
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {podcast.newsletterHeadline || card.title || 'Get The Backstage Show Notes'}
        </h3>
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
          {podcast.newsletterPitch || card.subtitle || 'Every week we send out episode transcripts, reading lists & founder insights.'}
        </p>
      </div>

      {subscribed ? (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold">
          <HugeIcon icon={CheckmarkCircle02Icon} size={16} className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>You're in! Check your inbox for updates.</span>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="name@work.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-[#181B1E] border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-white hover:bg-stone-200 text-[#1C1E22] text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
          >
            <span>Subscribe</span>
            <HugeIcon icon={SentIcon} size={12} className="w-3 h-3" />
          </button>
        </form>
      )}
    </div>
  );
};

// -------------------------------------------------------------------
// 8. SPONSOR INQUIRY CARD
// -------------------------------------------------------------------
export const PodcastSponsorInquiryCard: React.FC<PodcasterCardProps> = ({
  card,
  onOpenPodcastSponsorModal,
}) => {
  return (
    <div
      id={card.id}
      onClick={() => onOpenPodcastSponsorModal && onOpenPodcastSponsorModal(card)}
      className="w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xs cursor-pointer hover:border-white/20 transition-all flex items-center justify-between gap-3 select-none"
    >
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
          🤝 Sponsor My Podcast
        </span>
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
          {card.title || 'Inquire About Podcast Advertising'}
        </h3>
        <p className="text-xs text-stone-400 truncate mt-0.5">
          {card.subtitle || 'Pre-roll, mid-roll, and title sponsorships with audience attribution'}
        </p>
      </div>

      <div className="px-3.5 py-2 rounded-xl bg-[#584CE4] text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-2xs">
        <span>Inquire</span>
        <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};
