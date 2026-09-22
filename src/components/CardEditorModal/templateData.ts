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
  | 'creator'
  | 'musician'
  | 'podcast'
  | 'real_estate'
  | 'coach'
  | 'standard';

export interface TemplateCardItem {
  id: CardTemplateType;
  title: string;
  category: 'creator' | 'musician' | 'podcast' | 'real_estate' | 'coach' | 'standard';
  categoryLabel: string;
  description: string;
  badge?: string;
  icon: any;
  featured?: boolean;
}

export function normalizeRole(rawRole?: string): {
  category: 'creator' | 'musician' | 'podcast' | 'real_estate' | 'coach';
  roleName: string;
  roleHeadline: string;
} {
  const r = (rawRole || '').toLowerCase();
  if (r.includes('music') || r.includes('artist') || r.includes('band') || r.includes('singer')) {
    return {
      category: 'musician',
      roleName: 'Musician & Artist',
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
  if (r.includes('realt') || r.includes('estate') || r.includes('property') || r.includes('broker')) {
    return {
      category: 'real_estate',
      roleName: 'Real Estate Professional',
      roleHeadline: 'Property listings, VIP showing schedulers & automated home valuation CMA tools',
    };
  }
  if (r.includes('coach') || r.includes('educat') || r.includes('teach') || r.includes('institute') || r.includes('mentor')) {
    return {
      category: 'coach',
      roleName: 'Coach & Educator',
      roleHeadline: 'Cohort batches, syllabus highlights, strategy sessions & student enrollment',
    };
  }
  return {
    category: 'creator',
    roleName: 'Content Creator',
    roleHeadline: 'High-converting brand inquiries, UGC rate cards, media kits & audience reach stats',
  };
}

export const ALL_TEMPLATES: TemplateCardItem[] = [
  // Content Creator Suite
  {
    id: 'brand_inquiry',
    title: 'Brand Deal Inquiry',
    category: 'creator',
    categoryLabel: 'Lead Capture',
    description: 'Direct campaign brief and sponsorship lead capture form for brands.',
    badge: 'HIGH CONVERTING',
    icon: SentIcon,
    featured: true,
  },
  {
    id: 'work_with_me',
    title: 'Work With Me',
    category: 'creator',
    categoryLabel: 'Availability',
    description: 'Availability status, UGC packages, and creative collaboration pitch.',
    badge: 'POPULAR',
    icon: UserCheck01Icon,
    featured: true,
  },
  {
    id: 'creator_stats',
    title: 'Creator Reach & Analytics',
    category: 'creator',
    categoryLabel: 'Social Proof',
    description: 'Multi-platform verified follower count, impressions & engagement rate.',
    badge: 'VERIFIED',
    icon: Analytics01Icon,
  },
  {
    id: 'featured_work',
    title: 'Featured Work & Reel',
    category: 'creator',
    categoryLabel: 'Showcase',
    description: 'Showcase top-performing video reels, past brand campaigns & metrics.',
    icon: Video01Icon,
  },
  {
    id: 'creator_packages',
    title: 'Rate Card & Packages',
    category: 'creator',
    categoryLabel: 'Monetization',
    description: 'Transparent pricing with turnaround time for UGC, Reels and stories.',
    icon: DollarSquareIcon,
  },
  {
    id: 'recommendation',
    title: 'Affiliate Deal & Gear',
    category: 'creator',
    categoryLabel: 'Commerce',
    description: 'Curated products and gear with exclusive community discount codes.',
    icon: ShoppingBag01Icon,
  },
  {
    id: 'media_kit',
    title: 'Media Kit (One-Sheet)',
    category: 'creator',
    categoryLabel: 'PR & Press',
    description: 'One-page media kit with audience breakdown, demographics & past sponsors.',
    icon: File01Icon,
  },

  // Musician & Recording Artist Suite
  {
    id: 'music_smart_card',
    title: 'Smart Music Card',
    category: 'musician',
    categoryLabel: 'Smart Link',
    description: 'Multi-platform player linking Spotify, Apple Music, YouTube & Amazon.',
    badge: 'SMART LINK',
    icon: MusicNote01Icon,
    featured: true,
  },
  {
    id: 'music_latest_release',
    title: 'Latest Release Showcase',
    category: 'musician',
    categoryLabel: 'New Music',
    description: 'Featured single or album artwork with instant audio snippet preview.',
    badge: 'OUT NOW',
    icon: PlayIcon,
    featured: true,
  },
  {
    id: 'music_upcoming_shows',
    title: 'Tour Dates & Tickets',
    category: 'musician',
    categoryLabel: 'Live Events',
    description: 'List upcoming concerts with cities, venues, and direct ticket links.',
    badge: 'LIVE DATES',
    icon: Calendar01Icon,
    featured: true,
  },
  {
    id: 'music_book_me',
    title: 'Book Me (Live Shows)',
    category: 'musician',
    categoryLabel: 'Gig Inquiries',
    description: 'Gig booking inquiries, festival rates, and promoter technical rider.',
    icon: Mic01Icon,
  },
  {
    id: 'music_streaming_hub',
    title: 'Streaming Hub',
    category: 'musician',
    categoryLabel: 'Music Routing',
    description: 'Clean multi-platform selector for fans to stream anywhere.',
    icon: PlayIcon,
  },
  {
    id: 'music_player',
    title: 'In-Card Audio Player',
    category: 'musician',
    categoryLabel: 'Audio Stream',
    description: 'Plays audio preview directly inside your link page with volume controls.',
    icon: MusicNote01Icon,
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
    id: 'music_press_kit',
    title: 'Electronic Press Kit (EPK)',
    category: 'musician',
    categoryLabel: 'Press & Media',
    description: 'High-res press assets, promoter biography, and hospitality rider.',
    icon: File01Icon,
  },
  {
    id: 'music_booking_inquiry',
    title: 'Concert Booking Form',
    category: 'musician',
    categoryLabel: 'Promoter Leads',
    description: 'Dedicated form for promoters and venues to request a performance quote.',
    icon: SentIcon,
  },

  // Podcasters & Show Creators Suite
  {
    id: 'podcast_sponsor_me',
    title: 'Sponsor The Podcast',
    category: 'podcast',
    categoryLabel: 'Sponsorships',
    description: 'Audience size, verified downloads, listener demographics & CPM rates.',
    badge: 'KILLER CARD',
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
  {
    id: 'podcast_youtube',
    title: 'Watch On YouTube',
    category: 'podcast',
    categoryLabel: 'Video Show',
    description: 'Direct video podcast link with custom video player thumbnail.',
    icon: Video01Icon,
  },
  {
    id: 'podcast_archive',
    title: 'Episode Archive',
    category: 'podcast',
    categoryLabel: 'Directory',
    description: 'Organized library of past episodes, topics, and transcripts.',
    icon: Book01Icon,
  },
  {
    id: 'podcast_newsletter',
    title: 'Show Notes & Newsletter',
    category: 'podcast',
    categoryLabel: 'Audience Capture',
    description: 'Weekly deep dives, links, and reading lists delivered to listeners.',
    icon: SentIcon,
  },
  {
    id: 'podcast_stats',
    title: 'Audience Demographics',
    category: 'podcast',
    categoryLabel: 'Verified Metrics',
    description: 'Verified download numbers, top listener countries, and age profile.',
    icon: Analytics01Icon,
  },
  {
    id: 'podcast_sponsor_inquiry',
    title: 'Sponsor Lead Form',
    category: 'podcast',
    categoryLabel: 'Direct Pitch',
    description: 'Direct proposal submission for brands wanting to advertise on the show.',
    icon: SentIcon,
  },

  // Real Estate Sales Engine Suite
  {
    id: 'real_estate',
    title: 'Featured Property Listing',
    category: 'real_estate',
    categoryLabel: 'Listing Showcase',
    description: 'High-res photos, bed/bath specs, asking price & tour scheduler.',
    badge: 'HOT LISTING',
    icon: Building01Icon,
    featured: true,
  },
  {
    id: 'showing_booking',
    title: 'Schedule Private Showing',
    category: 'real_estate',
    categoryLabel: 'Tour Scheduler',
    description: 'VIP property tour scheduler with preferred date and time capture.',
    badge: 'BOOK SHOWING',
    icon: Calendar01Icon,
    featured: true,
  },
  {
    id: 'home_valuation',
    title: 'Home Valuation (CMA)',
    category: 'real_estate',
    categoryLabel: 'Seller Leads',
    description: 'Automated comparative market report tool to generate seller leads.',
    badge: 'SELLER MAGNET',
    icon: Analytics01Icon,
    featured: true,
  },
  {
    id: 'client_reviews',
    title: 'Client Sales Reviews',
    category: 'real_estate',
    categoryLabel: 'Verified Social Proof',
    description: 'Verified testimonials from buyers and sellers with property details.',
    icon: StarIcon,
  },

  // Coach & Educator Suite
  {
    id: 'coaching_institute',
    title: 'Course Batch / Cohort',
    category: 'coach',
    categoryLabel: 'Course Admissions',
    description: 'Curriculum syllabus, batch schedule, fee structure, and enrollment.',
    badge: 'ENROLLING',
    icon: Mortarboard01Icon,
    featured: true,
  },

  // Standard Link
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

export const PRESET_BADGES = ['FEATURED', 'HOT DEAL', 'AVAILABLE NOW', 'JUST LISTED', 'TOP RATED', 'LIMITED TIME'];

export const REAL_ESTATE_SUGGESTIONS = {
  propertyTypes: ['3 BHK Luxury Apartment', '4 BHK Villa with Pool', '2 BHK Modern Condo', 'Commercial Office Space', 'Gated Plot'],
  locations: ['Austin, TX', 'Beverly Hills, CA', 'Bandra West, Mumbai', 'Whitefield, Bengaluru', 'Downtown Dubai'],
  priceBrackets: ['$749,000', '$1,250,000', '₹1.5 Cr - 2.2 Cr', 'Rent: $3,200/mo', '$2,800,000'],
  statusTags: ['just_listed', 'open_house', 'price_drop'] as const,
};
