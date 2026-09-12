import { UserProfile } from './types';

export const BRAND_LOGOS: Record<string, string> = {
  youtube: 'https://cdn.simpleicons.org/youtube/FF0000',
  spotify: 'https://cdn.simpleicons.org/spotify/1DB954',
  github: 'https://cdn.simpleicons.org/github/181717',
  x: 'https://cdn.simpleicons.org/x/000000',
  twitter: 'https://cdn.simpleicons.org/x/000000',
  instagram: 'https://cdn.simpleicons.org/instagram/E4405F',
  linkedin: 'https://cdn.simpleicons.org/linkedin/0A66C2',
  substack: 'https://cdn.simpleicons.org/substack/FF6719',
  figma: 'https://cdn.simpleicons.org/figma/F24E1E',
  discord: 'https://cdn.simpleicons.org/discord/5865F2',
  tiktok: 'https://cdn.simpleicons.org/tiktok/000000',
  twitch: 'https://cdn.simpleicons.org/twitch/9146FF',
  calendly: 'https://cdn.simpleicons.org/calendly/006BFF',
  gumroad: 'https://cdn.simpleicons.org/gumroad/000000',
  store: 'https://cdn.simpleicons.org/shopify/7AB55C',
  podcast: 'https://cdn.simpleicons.org/applepodcasts/872EC4',
  web: 'https://cdn.simpleicons.org/safari/000000',
};

// Clean starter default profile (no demo personas)
export const DEFAULT_STARTER_PROFILE: UserProfile = {
  id: 'creator_profile',
  username: 'creator',
  name: 'Your Name',
  headline: 'Digital Creator & Builder',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  theme: 'warm',
  socials: {},
  cards: [],
};
