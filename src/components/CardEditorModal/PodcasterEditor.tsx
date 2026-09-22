import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { Mic01Icon, StarIcon } from '@hugeicons/core-free-icons';

export interface PodcasterEditorProps {
  episodeTitle: string;
  setEpisodeTitle: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  episodeNumber: string;
  setEpisodeNumber: (val: string) => void;
  podcastDuration: string;
  setPodcastDuration: (val: string) => void;
  podcastReleaseDate: string;
  setPodcastReleaseDate: (val: string) => void;
  monthlyDownloads: string;
  setMonthlyDownloads: (val: string) => void;
  audienceSize: string;
  setAudienceSize: (val: string) => void;
  listenerDemographics: string;
  setListenerDemographics: (val: string) => void;
  pastSponsorsStr: string;
  setPastSponsorsStr: (val: string) => void;
  mediaKitUrl: string;
  setMediaKitUrl: (val: string) => void;
  youtubeChannelUrl: string;
  setYoutubeChannelUrl: (val: string) => void;
  applePodcastsUrl: string;
  setApplePodcastsUrl: (val: string) => void;
  spotifyPodcastsUrl: string;
  setSpotifyPodcastsUrl: (val: string) => void;
  setLinkUrl: (val: string) => void;
}

export const PodcasterEditor: React.FC<PodcasterEditorProps> = ({
  episodeTitle,
  setEpisodeTitle,
  title,
  setTitle,
  episodeNumber,
  setEpisodeNumber,
  podcastDuration,
  setPodcastDuration,
  podcastReleaseDate,
  setPodcastReleaseDate,
  monthlyDownloads,
  setMonthlyDownloads,
  audienceSize,
  setAudienceSize,
  listenerDemographics,
  setListenerDemographics,
  pastSponsorsStr,
  setPastSponsorsStr,
  mediaKitUrl,
  setMediaKitUrl,
  youtubeChannelUrl,
  setYoutubeChannelUrl,
  applePodcastsUrl,
  setApplePodcastsUrl,
  spotifyPodcastsUrl,
  setSpotifyPodcastsUrl,
  setLinkUrl,
}) => {
  return (
    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3.5">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
          <HugeIcon icon={Mic01Icon} size={14} className="w-3.5 h-3.5 text-amber-600" /> Podcast & Sponsorship Engine
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          Premium Podcaster Suite
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-stone-700 block mb-1">Episode / Show Title</label>
          <input
            type="text"
            placeholder="e.g. Bootstrapping to $10M ARR"
            value={episodeTitle}
            onChange={(e) => {
              setEpisodeTitle(e.target.value);
              if (!title || title.includes('Building') || title.includes('EP')) {
                setTitle(e.target.value);
              }
            }}
            className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Episode #</label>
          <input
            type="text"
            placeholder="e.g. EP 148"
            value={episodeNumber}
            onChange={(e) => setEpisodeNumber(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Duration</label>
          <input
            type="text"
            placeholder="e.g. 52m"
            value={podcastDuration}
            onChange={(e) => setPodcastDuration(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-stone-700 block mb-1">Release Schedule / Date</label>
          <input
            type="text"
            placeholder="e.g. Every Tuesday"
            value={podcastReleaseDate}
            onChange={(e) => setPodcastReleaseDate(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
          />
        </div>
      </div>

      {/* KILLER CARD: SPONSOR ME METRICS */}
      <div className="p-3 bg-white rounded-xl border border-amber-200/80 space-y-2.5">
        <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
          <HugeIcon icon={StarIcon} size={14} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          Killer Card: "Sponsor Me" Media Kit Stats
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
              Monthly Downloads:
            </span>
            <input
              type="text"
              placeholder="e.g. 450,000+"
              value={monthlyDownloads}
              onChange={(e) => setMonthlyDownloads(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-semibold"
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
              Total Audience / Subscribers:
            </span>
            <input
              type="text"
              placeholder="e.g. 120,000+ Subscribers"
              value={audienceSize}
              onChange={(e) => setAudienceSize(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 rounded-lg border border-stone-200 text-xs font-semibold"
            />
          </div>
          <div className="sm:col-span-2">
            <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
              Listener Demographics:
            </span>
            <input
              type="text"
              placeholder="e.g. 78% 22-38 • Tech Founders, Operators & Software Engineers"
              value={listenerDemographics}
              onChange={(e) => setListenerDemographics(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 rounded-lg border border-stone-200 text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
              Past Verified Sponsors (comma-separated):
            </span>
            <input
              type="text"
              placeholder="e.g. Notion, Linear, Vercel, Athletic Greens, Riverside"
              value={pastSponsorsStr}
              onChange={(e) => setPastSponsorsStr(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 rounded-lg border border-stone-200 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
              Download Media Kit Link (PDF):
            </span>
            <input
              type="url"
              placeholder="https://linklyra.com/mediakit.pdf"
              value={mediaKitUrl}
              onChange={(e) => setMediaKitUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 rounded-lg border border-stone-200 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
              YouTube Channel URL:
            </span>
            <input
              type="url"
              placeholder="https://youtube.com/@mychannel"
              value={youtubeChannelUrl}
              onChange={(e) => setYoutubeChannelUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 rounded-lg border border-stone-200 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Audio Directory URLs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-stone-500 block">Apple Podcasts URL:</span>
          <input
            type="url"
            placeholder="https://podcasts.apple.com/..."
            value={applePodcastsUrl}
            onChange={(e) => setApplePodcastsUrl(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs"
          />
        </div>
        <div>
          <span className="text-[10px] text-stone-500 block">Spotify Podcasts URL:</span>
          <input
            type="url"
            placeholder="https://open.spotify.com/show/..."
            value={spotifyPodcastsUrl}
            onChange={(e) => {
              setSpotifyPodcastsUrl(e.target.value);
              setLinkUrl(e.target.value);
            }}
            className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
