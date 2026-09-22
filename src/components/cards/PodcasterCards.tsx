import React, { useState, useRef } from 'react';
import { HugeIcon } from '../HugeIcon';
import {
  Mic01Icon,
  PlayIcon,
  PauseIcon,
  ArrowUpRight01Icon,
  SentIcon,
  CheckmarkCircle02Icon,
  Mail01Icon,
  YoutubeIcon,
} from '@hugeicons/core-free-icons';
import { ProfileCardData, PodcastMetadata } from '../../types';
import { safeOpenUrl, normalizeExternalUrl } from '../../lib/url';

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
  const downloads = podcast.monthlyDownloads || '120,000+';
  const listeners = podcast.audienceSize || '45,000+';
  const demographics = podcast.listenerDemographics || 'US / EU • Tech, Business & Design Founders';

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-sm space-y-4"
    >
      {/* Top Badges Row */}
      <div className="flex items-center justify-between gap-2">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-stone-300 border border-white/10">
          Sponsor The Show
        </span>
        <span className="text-[11px] text-stone-400 font-medium">
          Verified Reach
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {card.title || 'Sponsorship & Ad Inventory'}
        </h3>
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
          {card.subtitle || 'Pre-roll, mid-roll, and title sponsor packages with guaranteed audio impressions.'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Monthly Downloads
          </span>
          <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
            {downloads}
          </div>
          <span className="text-[10px] text-stone-400">IAB Certified</span>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Active Audience
          </span>
          <div className="text-base sm:text-lg font-extrabold text-white mt-0.5 truncate">
            {listeners}
          </div>
          <span className="text-[10px] text-stone-400">Weekly Listeners</span>
        </div>
      </div>

      {/* Demographics Strip */}
      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-stone-300 flex items-center justify-between">
        <span className="text-[11px] text-stone-400 font-medium">Core Audience:</span>
        <span className="text-xs font-semibold text-stone-200 truncate ml-2">{demographics}</span>
      </div>

      {/* Action Button */}
      <div className="pt-1 border-t border-white/10">
        <button
          type="button"
          onClick={() => onOpenPodcastSponsorModal && onOpenPodcastSponsorModal(card)}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-[#191A1E] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <span>Inquire About Sponsorship</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 2. AUDIO PLAYER / EPISODE CARD
// -------------------------------------------------------------------
export const PodcastLatestEpisodeCard: React.FC<PodcasterCardProps> = ({
  card,
}) => {
  const podcast: PodcastMetadata = card.podcast || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio playback not allowed or failed:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleOpenStream = (url?: string) => {
    const targetUrl = url || podcast.spotifyPodcastsUrl || card.linkUrl || 'https://open.spotify.com';
    safeOpenUrl(targetUrl);
  };

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 space-y-4 shadow-sm"
    >
      <audio
        ref={audioRef}
        src={podcast.audioUrl || DEMO_AUDIO_URL}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Category Badge */}
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-stone-300 border border-white/10">
          {podcast.episodeNumber || 'Latest Episode'}
        </span>
        <span className="text-[11px] text-stone-400 font-medium">
          {podcast.duration || '42 mins'}
        </span>
      </div>

      {/* Episode Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-xl bg-stone-800 flex items-center justify-center shrink-0 border border-white/10 text-white">
          <HugeIcon icon={Mic01Icon} size={22} className="w-5.5 h-5.5 text-stone-300" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-white tracking-tight truncate">
            {podcast.episodeTitle || card.title || 'Latest Episode Title'}
          </h3>
          <p className="text-[11px] text-stone-400 truncate mt-0.5">
            {card.subtitle || 'Audio interview & deep dive discussion'}
          </p>
        </div>
      </div>

      {/* Audio Playback Controls */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-white text-[#191A1E] flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm cursor-pointer"
        >
          {isPlaying ? (
            <HugeIcon icon={PauseIcon} size={14} className="w-3.5 h-3.5" />
          ) : (
            <HugeIcon icon={PlayIcon} size={14} className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white">
            {isPlaying ? 'Playing Audio Snippet' : 'Preview Audio Snippet'}
          </div>
          <div className="text-[10px] text-stone-400">
            {isPlaying ? 'Tap pause to stop' : 'Tap play to listen'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleOpenStream()}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Full Episode</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3 text-stone-300" />
        </button>
      </div>

      {/* Platforms Bar */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
        <button
          type="button"
          onClick={() => handleOpenStream(podcast.spotifyPodcastsUrl)}
          className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Spotify Podcasts</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3 text-stone-400" />
        </button>
        <button
          type="button"
          onClick={() => handleOpenStream(podcast.applePodcastsUrl)}
          className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Apple Podcasts</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={12} className="w-3 h-3 text-stone-400" />
        </button>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 3. LISTEN ON DIRECTORY
// -------------------------------------------------------------------
export const PodcastListenOnCard: React.FC<PodcasterCardProps> = ({
  card,
}) => {
  const podcast: PodcastMetadata = card.podcast || {};

  const platforms = [
    { name: 'Apple Podcasts', url: podcast.applePodcastsUrl || 'https://podcasts.apple.com' },
    { name: 'Spotify', url: podcast.spotifyPodcastsUrl || 'https://open.spotify.com' },
    { name: 'YouTube Podcasts', url: podcast.youtubeChannelUrl || 'https://youtube.com' },
    { name: 'Amazon Music', url: podcast.amazonMusicUrl || 'https://music.amazon.com' },
  ];

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 space-y-3 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
          Subscribe & Follow
        </span>
        <span className="text-[11px] text-stone-400">All Platforms</span>
      </div>

      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
        {card.title || 'Listen On Your Favorite App'}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {platforms.map((p) => (
          <a
            key={p.name}
            href={normalizeExternalUrl(p.url) || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-stone-200 flex items-center justify-between transition-colors"
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
// 4. WATCH ON YOUTUBE (Alias mapped to clean video showcase)
// -------------------------------------------------------------------
export const PodcastWatchOnYouTubeCard: React.FC<PodcasterCardProps> = ({
  card,
}) => {
  const podcast: PodcastMetadata = card.podcast || {};
  const youtubeUrl = podcast.youtubeChannelUrl || card.linkUrl || 'https://youtube.com';

  return (
    <div
      id={card.id}
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 shadow-sm"
    >
      <a
        href={normalizeExternalUrl(youtubeUrl) || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full h-40 sm:h-44 bg-black flex items-center justify-center group cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-white text-[#191A1E] flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95">
          <HugeIcon icon={PlayIcon} size={18} className="w-4.5 h-4.5 ml-0.5 text-[#191A1E]" />
        </div>
      </a>

      <div className="p-3.5 bg-white/5 flex items-center justify-between text-xs">
        <div>
          <h3 className="font-bold text-white text-xs sm:text-sm">
            {card.title || 'Watch Video Episodes on YouTube'}
          </h3>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {card.subtitle || 'Full studio recording, guest video & clips'}
          </p>
        </div>
        <HugeIcon icon={YoutubeIcon} size={18} className="w-4.5 h-4.5 text-red-500 shrink-0" />
      </div>
    </div>
  );
};

// -------------------------------------------------------------------
// 5. EPISODE ARCHIVE
// -------------------------------------------------------------------
export const PodcastArchiveCard: React.FC<PodcasterCardProps> = (props) => {
  return <PodcastLatestEpisodeCard {...props} />;
};

// -------------------------------------------------------------------
// 6. CREATOR STATS / PERFORMANCE
// -------------------------------------------------------------------
export const PodcastStatsCard: React.FC<PodcasterCardProps> = (props) => {
  return <PodcastSponsorMeCard {...props} />;
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
      className="w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 space-y-3 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <HugeIcon icon={Mail01Icon} size={16} className="w-4 h-4 text-stone-300" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300">
          Show Notes & Updates
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          {podcast.newsletterHeadline || card.title || 'Get Weekly Show Transcripts'}
        </h3>
        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
          {podcast.newsletterPitch || card.subtitle || 'Weekly curated summaries, guest reading lists, and key takeaways.'}
        </p>
      </div>

      {subscribed ? (
        <div className="p-3 bg-white/10 border border-white/20 rounded-xl flex items-center gap-2 text-stone-200 text-xs font-semibold">
          <HugeIcon icon={CheckmarkCircle02Icon} size={16} className="w-4 h-4 text-white shrink-0" />
          <span>You're subscribed! Check your inbox.</span>
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="name@work.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-white hover:bg-stone-200 text-[#191A1E] text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
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
export const PodcastSponsorInquiryCard: React.FC<PodcasterCardProps> = (props) => {
  return <PodcastSponsorMeCard {...props} />;
};
