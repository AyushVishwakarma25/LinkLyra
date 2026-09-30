import {
  Building01Icon,
  PlayIcon,
  ShoppingBag01Icon,
  StarIcon,
  MusicNote01Icon,
  Mic01Icon,
  Video01Icon,
  Calendar01Icon,
  Mortarboard01Icon,
  SentIcon,
  Link01Icon,
  UserCheck01Icon,
  Analytics01Icon,
  DollarSquareIcon,
  File01Icon,
  Book01Icon,
} from '@hugeicons/core-free-icons';
import { CardTemplateType } from '../../types';
import { UI_KIT } from '../../lib/ui-kit';

export type CategoryTab =
  | 'for_you'
  | 'video'
  | 'monetize'
  | 'comedian'
  | 'fashion'
  | 'tech_finance'
  | 'fitness'
  | 'musician'
  | 'podcast'
  | 'standard';

export interface TemplateCardItem {
  id: CardTemplateType;
  title: string;
  category:
    | 'video'
    | 'monetize'
    | 'comedian'
    | 'fashion'
    | 'tech_finance'
    | 'fitness'
    | 'musician'
    | 'podcast'
    | 'standard';
  categoryLabel: string;
  description: string;
  badge?: string;
  icon: any;
  featured?: boolean;
}

export function normalizeRole(rawRole?: string): {
  category:
    | 'video'
    | 'monetize'
    | 'comedian'
    | 'fashion'
    | 'tech_finance'
    | 'fitness'
    | 'musician'
    | 'podcast';
  roleName: string;
  roleHeadline: string;
} {
  const r = (rawRole || '').toLowerCase();
  if (r.includes('comed') || r.includes('standup') || r.includes('actor') || r.includes('entertain')) {
    return {
      category: 'comedian',
      roleName: 'Comedian & Entertainer',
      roleHeadline: 'Tour dates, stand-up video spotlights, ticket booking & corporate event inquiries',
    };
  }
  if (r.includes('fashion') || r.includes('beauty') || r.includes('style') || r.includes('lifestyle') || r.includes('makeup')) {
    return {
      category: 'fashion',
      roleName: 'Fashion & Lifestyle Creator',
      roleHeadline: 'Shop my look, affiliate discount codes, brand PR requests & outfit reels',
    };
  }
  if (r.includes('tech') || r.includes('finance') || r.includes('business') || r.includes('developer') || r.includes('money')) {
    return {
      category: 'tech_finance',
      roleName: 'Tech, Finance & Business',
      roleHeadline: 'Verified media kits, 1-on-1 strategy calls, gear recommendations & sponsorship decks',
    };
  }
  if (r.includes('fit') || r.includes('gym') || r.includes('health') || r.includes('train') || r.includes('yoga') || r.includes('diet')) {
    return {
      category: 'fitness',
      roleName: 'Fitness & Wellness Coach',
      roleHeadline: 'Workout programs, personal training intake, supplement discounts & habit guides',
    };
  }
  if (r.includes('music') || r.includes('artist') || r.includes('band') || r.includes('singer') || r.includes('dj')) {
    return {
      category: 'musician',
      roleName: 'Musician & Recording Artist',
      roleHeadline: 'Smart streaming hubs, audio snippet preview, gig booking & tour dates for artists',
    };
  }
  if (r.includes('podcast') || r.includes('audio') || r.includes('host') || r.includes('show')) {
    return {
      category: 'podcast',
      roleName: 'Podcaster & Host',
      roleHeadline: 'Sponsor media kit, latest episode player, streaming hubs & verified demographics',
    };
  }
  return {
    category: 'video',
    roleName: 'Content Creator',
    roleHeadline: 'Auto-thumbnail video spotlights, brand inquiries, UGC rate cards & instant fan tips',
  };
}

export const ALL_TEMPLATES: TemplateCardItem[] = [
  // 1. Video & Reel Showcase (Auto-Thumbnails)
  {
    id: 'video_spotlight',
    title: 'Featured Video / Reel',
    category: 'video',
    categoryLabel: 'Auto-Thumbnail',
    description: 'Paste any YouTube video, Short, or Instagram Reel to display HD cover & play button.',
    badge: 'HIGH ENGAGEMENT',
    icon: PlayIcon,
    featured: true,
  },
  {
    id: 'featured_work',
    title: 'Brand Campaign Spotlight',
    category: 'video',
    categoryLabel: 'Past Work',
    description: 'Showcase top-performing video reels, past brand campaigns, views & engagement.',
    icon: Video01Icon,
    featured: true,
  },

  // 2. Monetization & Tips Suite
  {
    id: 'tip_support',
    title: 'Direct UPI & Fan Support',
    category: 'monetize',
    categoryLabel: 'Zero Fee',
    description: 'Receive instant tips via Google Pay, PhonePe, Paytm with 0% platform fee.',
    badge: 'POPULAR',
    icon: DollarSquareIcon,
    featured: true,
  },
  {
    id: 'creator_packages',
    title: 'Collaboration Rate Card',
    category: 'monetize',
    categoryLabel: 'Sponsorships',
    description: 'Transparent rates and deliverables for UGC Videos, Instagram Reels, and Story combos.',
    badge: 'HIGH CONVERTING',
    icon: DollarSquareIcon,
    featured: true,
  },
  {
    id: 'brand_inquiry',
    title: 'Brand Sponsorship Inquiry',
    category: 'monetize',
    categoryLabel: 'Lead Capture',
    description: 'Capture brand campaign briefs, budget ranges, and timelines directly to your inbox.',
    badge: 'LEAD MAGNET',
    icon: SentIcon,
    featured: true,
  },
  {
    id: 'work_with_me',
    title: 'Work With Me Pitch',
    category: 'monetize',
    categoryLabel: 'Availability',
    description: 'Availability status, creative specialties, and collaboration pitch for brands.',
    icon: UserCheck01Icon,
  },

  // 3. Comedians & Live Entertainment Suite
  {
    id: 'live_tour',
    title: 'Live Tour Dates & Tickets',
    category: 'comedian',
    categoryLabel: 'Live Events',
    description: 'List upcoming comedy shows, cities, venues, and direct ticketing links with sold out tags.',
    badge: 'TOUR DATES',
    icon: Calendar01Icon,
    featured: true,
  },

  // 4. Fashion, Beauty & Lifestyle Suite
  {
    id: 'recommendation',
    title: 'Shop My Look / Gear',
    category: 'fashion',
    categoryLabel: 'Affiliate Deal',
    description: 'Product photo, price, direct buy link, and 1-tap coupon discount code copy.',
    badge: 'SHOP LOOK',
    icon: ShoppingBag01Icon,
    featured: true,
  },

  // 5. Tech, Finance & Business Suite
  {
    id: 'creator_stats',
    title: 'Audience Reach & Media Kit',
    category: 'tech_finance',
    categoryLabel: 'Social Proof',
    description: 'Multi-platform verified follower count, monthly impressions, and engagement metrics.',
    badge: 'VERIFIED',
    icon: Analytics01Icon,
    featured: true,
  },
  {
    id: 'media_kit',
    title: 'Downloadable One-Sheet Media Kit',
    category: 'tech_finance',
    categoryLabel: 'Press Kit',
    description: 'One-page media kit with audience demographics, past partners, and brand stats.',
    icon: File01Icon,
  },
  {
    id: 'client_reviews',
    title: 'Brand / Client Testimonials',
    category: 'tech_finance',
    categoryLabel: 'Testimonials',
    description: 'Verified reviews and praise from brand managers and sponsors you collaborated with.',
    icon: StarIcon,
  },

  // 6. Fitness & Wellness Suite
  {
    id: 'coaching_institute',
    title: 'Masterclass / Cohort Program',
    category: 'fitness',
    categoryLabel: 'Programs',
    description: 'Curriculum highlights, next batch schedule, pricing breakdown & WhatsApp enrollment.',
    badge: 'ENROLLING',
    icon: Mortarboard01Icon,
    featured: true,
  },

  // 7. Musician & Recording Artist Suite
  {
    id: 'music_smart_card',
    title: 'Smart Streaming Hub',
    category: 'musician',
    categoryLabel: 'Multi-Platform',
    description: 'Multi-platform player linking Spotify, Apple Music, YouTube & Amazon in one card.',
    badge: 'SMART LINK',
    icon: MusicNote01Icon,
    featured: true,
  },
  {
    id: 'music_latest_release',
    title: 'Latest Release Showcase',
    category: 'musician',
    categoryLabel: 'New Single',
    description: 'Featured single or album artwork with instant audio snippet preview.',
    badge: 'OUT NOW',
    icon: PlayIcon,
    featured: true,
  },
  {
    id: 'music_merch',
    title: 'Artist Merch Store',
    category: 'musician',
    categoryLabel: 'Merchandise',
    description: 'Tour apparel, vinyl records, posters, and physical merchandise.',
    icon: ShoppingBag01Icon,
  },
  {
    id: 'music_book_me',
    title: 'Book Live Performance',
    category: 'musician',
    categoryLabel: 'Gig Inquiries',
    description: 'Gig booking inquiries, festival rates, and promoter technical rider.',
    icon: Mic01Icon,
  },

  // 8. Podcasters & Show Creators Suite
  {
    id: 'podcast_sponsor_me',
    title: 'Sponsor The Podcast',
    category: 'podcast',
    categoryLabel: 'Sponsorships',
    description: 'Audience size, verified downloads, listener demographics & CPM rates.',
    badge: 'SPONSOR ME',
    icon: Mic01Icon,
    featured: true,
  },
  {
    id: 'podcast_latest_episode',
    title: 'Latest Episode Player',
    category: 'podcast',
    categoryLabel: 'New Episode',
    description: 'Play audio episode with duration, show notes, and guest details.',
    badge: 'NEW EPISODE',
    icon: PlayIcon,
    featured: true,
  },
  {
    id: 'podcast_listen_on',
    title: 'Listen On Favorite App',
    category: 'podcast',
    categoryLabel: 'Platform Hub',
    description: 'One-click links to Apple Podcasts, Spotify, YouTube & Amazon.',
    icon: MusicNote01Icon,
  },

  // 9. Standard Link
  {
    id: 'standard',
    title: 'Standard Custom Link',
    category: 'standard',
    categoryLabel: 'Basic Link',
    description: 'Clean link card with custom title, subtitle, icon, and click tracking.',
    icon: Link01Icon,
  },
];

export const AVAILABLE_COLORS = Object.values(UI_KIT.cardPalettes);

export const PRESET_BADGES = [
  'FEATURED',
  'NEW REEL',
  'YOUTUBE',
  'HOT DEAL',
  'COLLAB',
  'POPULAR',
  'LIMITED TIME',
  'LIVE TOUR',
];
