import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { MusicNote01Icon } from '@hugeicons/core-free-icons';

export interface MusicianEditorProps {
  releaseTitle: string;
  setReleaseTitle: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  artistName: string;
  setArtistName: (val: string) => void;
  releaseType: 'Single' | 'EP' | 'Album' | 'Remix';
  setReleaseType: (val: 'Single' | 'EP' | 'Album' | 'Remix') => void;
  releaseDate: string;
  setReleaseDate: (val: string) => void;
  audioPreviewUrl: string;
  setAudioPreviewUrl: (val: string) => void;
  spotifyUrl: string;
  setSpotifyUrl: (val: string) => void;
  setLinkUrl: (val: string) => void;
  appleMusicUrl: string;
  setAppleMusicUrl: (val: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (val: string) => void;
  amazonMusicUrl: string;
  setAmazonMusicUrl: (val: string) => void;
  templateType: string;
  bookingRate: string;
  setBookingRate: (val: string) => void;
  epkDownloadUrl: string;
  epkDownloadUrlSetter?: (val: string) => void;
  setEpkDownloadUrl: (val: string) => void;
  epkBio: string;
  setEpkBio: (val: string) => void;
}

export const MusicianEditor: React.FC<MusicianEditorProps> = ({
  releaseTitle,
  setReleaseTitle,
  title,
  setTitle,
  artistName,
  setArtistName,
  releaseType,
  setReleaseType,
  releaseDate,
  setReleaseDate,
  audioPreviewUrl,
  setAudioPreviewUrl,
  spotifyUrl,
  setSpotifyUrl,
  setLinkUrl,
  appleMusicUrl,
  setAppleMusicUrl,
  youtubeUrl,
  setYoutubeUrl,
  amazonMusicUrl,
  setAmazonMusicUrl,
  templateType,
  bookingRate,
  setBookingRate,
  epkDownloadUrl,
  setEpkDownloadUrl,
  epkBio,
  setEpkBio,
}) => {
  return (
    <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3.5">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
          <HugeIcon icon={MusicNote01Icon} size={14} className="w-3.5 h-3.5 text-rose-600" /> Musician & Audio Setup
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          Premium Artist Suite
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Track / Release Title *</label>
          <input
            type="text"
            placeholder="e.g. Neon Mirage"
            value={releaseTitle}
            onChange={(e) => {
              setReleaseTitle(e.target.value);
              if (!title || title.includes('Neon Mirage')) {
                setTitle(e.target.value);
              }
            }}
            className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Artist / Band Name</label>
          <input
            type="text"
            placeholder="e.g. Lyra Sound"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Release Type</label>
          <select
            value={releaseType}
            onChange={(e) => setReleaseType(e.target.value as 'Single' | 'EP' | 'Album' | 'Remix')}
            className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
          >
            <option value="Single">Single</option>
            <option value="EP">EP</option>
            <option value="Album">Album</option>
            <option value="Remix">Remix</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">Release Date / Year</label>
          <input
            type="text"
            placeholder="e.g. Nov 2026"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
          />
        </div>
      </div>

      {/* Audio Preview File */}
      <div>
        <label className="text-xs font-semibold text-stone-700 block mb-1">
          Direct MP3 / Audio Stream URL (For In-Card Sound Player)
        </label>
        <input
          type="url"
          placeholder="https://example.com/preview.mp3 (Leave empty for synthetic sound demo)"
          value={audioPreviewUrl}
          onChange={(e) => setAudioPreviewUrl(e.target.value)}
          className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs font-mono text-stone-600"
        />
      </div>

      {/* Streaming Links for Smart Music Card */}
      <div className="pt-2 border-t border-rose-200/60 space-y-2">
        <span className="text-[11px] font-bold text-rose-900 block">
          🎧 Smart Music Streaming Links (Spotify, Apple, YouTube, Amazon):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-stone-500 block">Spotify URL:</span>
            <input
              type="url"
              placeholder="https://open.spotify.com/track/..."
              value={spotifyUrl}
              onChange={(e) => {
                setSpotifyUrl(e.target.value);
                setLinkUrl(e.target.value);
              }}
              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">Apple Music URL:</span>
            <input
              type="url"
              placeholder="https://music.apple.com/..."
              value={appleMusicUrl}
              onChange={(e) => setAppleMusicUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">YouTube / Music Video:</span>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">Amazon Music URL:</span>
            <input
              type="url"
              placeholder="https://music.amazon.com/..."
              value={amazonMusicUrl}
              onChange={(e) => setAmazonMusicUrl(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-200 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Booking & EPK info */}
      {(templateType === 'music_book_me' || templateType === 'music_press_kit' || templateType === 'music_booking_inquiry') && (
        <div className="pt-2 border-t border-rose-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Performance Rate / Quote</label>
            <input
              type="text"
              placeholder="e.g. $1,000 - $3,000 / ₹50k - ₹1.5L"
              value={bookingRate}
              onChange={(e) => setBookingRate(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Media Kit / EPK Download Link</label>
            <input
              type="url"
              placeholder="https://dropbox.com/epk.pdf"
              value={epkDownloadUrl}
              onChange={(e) => setEpkDownloadUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-stone-700 block mb-1">Press Bio / Promoter Blurb</label>
            <input
              type="text"
              placeholder="Short compelling artist bio for concert buyers and festival talent programmers"
              value={epkBio}
              onChange={(e) => setEpkBio(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};
