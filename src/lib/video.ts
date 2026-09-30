/**
 * LinkLyra Video & Media Detection Engine
 * 
 * Automatically detects YouTube videos, Shorts, Instagram Reels, and TikTok clips.
 * Extracts video IDs, generates high-resolution thumbnail URLs, and provides metadata.
 */

export interface VideoMediaInfo {
  isVideo: boolean;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'vimeo' | 'other';
  videoId?: string;
  thumbnailUrl?: string;
  fallbackThumbnailUrl?: string;
  badgeLabel?: string;
  isShortOrReel?: boolean;
  aspectRatio?: '16:9' | '9:16';
  cleanEmbedUrl?: string;
}

/**
 * Extracts YouTube Video ID from any standard or shortened YouTube URL.
 * Handles:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/live/dQw4w9WgXcQ
 */
export function extractYouTubeId(url: string): { videoId: string; isShort: boolean } | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // YouTube Shorts
  const shortsMatch = trimmed.match(/(?:youtube\.com\/(?:shorts|live)\/)([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return { videoId: shortsMatch[1], isShort: true };
  }

  // Standard YouTube Watch
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return { videoId: watchMatch[1], isShort: false };
  }

  return null;
}

/**
 * Extracts Instagram Reel or Post code from URL.
 * Handles:
 * - https://www.instagram.com/reel/C-xyz123/
 * - https://www.instagram.com/reels/C-xyz123/
 * - https://www.instagram.com/p/C-xyz123/
 */
export function extractInstagramReelCode(url: string): { code: string; isReel: boolean } | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  const reelMatch = trimmed.match(/(?:instagram\.com\/(?:reel|reels|p)\/)([a-zA-Z0-9_-]+)/i);
  if (reelMatch && reelMatch[1]) {
    return {
      code: reelMatch[1],
      isReel: trimmed.includes('/reel') || trimmed.includes('/reels'),
    };
  }

  return null;
}

/**
 * Checks if a URL is a TikTok video link.
 */
export function extractTikTokId(url: string): { videoId: string } | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const tiktokMatch = trimmed.match(/(?:tiktok\.com\/@[^/]+\/video\/)(\d+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    return { videoId: tiktokMatch[1] };
  }
  return null;
}

/**
 * Detects any video media from a URL and returns rich thumbnail & badge info.
 */
export function detectVideoMedia(url: string | null | undefined): VideoMediaInfo {
  if (!url) {
    return { isVideo: false, platform: 'other' };
  }

  // 1. YouTube Detection
  const yt = extractYouTubeId(url);
  if (yt) {
    return {
      isVideo: true,
      platform: 'youtube',
      videoId: yt.videoId,
      // maxresdefault is 1280x720 HD thumbnail; hqdefault is reliable 480x360 fallback
      thumbnailUrl: `https://img.youtube.com/vi/${yt.videoId}/maxresdefault.jpg`,
      fallbackThumbnailUrl: `https://img.youtube.com/vi/${yt.videoId}/hqdefault.jpg`,
      badgeLabel: yt.isShort ? 'YOUTUBE SHORTS' : 'YOUTUBE VIDEO',
      isShortOrReel: yt.isShort,
      cleanEmbedUrl: `https://www.youtube-nocookie.com/embed/${yt.videoId}?autoplay=1&rel=0`,
    };
  }

  // 2. Instagram Reel Detection
  const ig = extractInstagramReelCode(url);
  if (ig) {
    return {
      isVideo: true,
      platform: 'instagram',
      videoId: ig.code,
      badgeLabel: 'INSTAGRAM REEL',
      isShortOrReel: true,
    };
  }

  // 3. TikTok Detection
  const tt = extractTikTokId(url);
  if (tt) {
    return {
      isVideo: true,
      platform: 'tiktok',
      videoId: tt.videoId,
      badgeLabel: 'TIKTOK VIDEO',
      isShortOrReel: true,
    };
  }

  return { isVideo: false, platform: 'other' };
}
