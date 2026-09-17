import React, { useState, useRef, useEffect } from 'react';
import { HugeIcon } from './HugeIcon';
import {
  Cancel01Icon,
  Tick01Icon,
  Delete02Icon,
  Upload01Icon,
  Loading03Icon,
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
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Analytics01Icon,
  DollarSquareIcon,
  File01Icon,
  Book01Icon,
} from '@hugeicons/core-free-icons';
import {
  CardColor,
  CardTemplateType,
  ProfileCardData,
  RealEstateMetadata,
  ShowingBookingMetadata,
  HomeValuationMetadata,
  ClientReviewMetadata,
  CreatorWorkMetadata,
  CreatorStatsMetadata,
  FeaturedWorkItem,
  CreatorPackagesMetadata,
  BrandInquiryMetadata,
  AffiliateRecommendationMetadata,
  MediaKitMetadata,
  CoachingMetadata,
  MusicMetadata,
  PodcastMetadata,
  TourDateItem,
  MerchItem,
  PodcastEpisodeItem,
  DbSection,
  CollaborationPackageItem,
} from '../types';
import { ProfileCard } from './ProfileCard';
import { UI_KIT } from '../lib/ui-kit';
import { generateWhatsAppIntentUrl } from '../lib/whatsapp';
import { uploadImageToStorage } from '../lib/storage';

export interface CardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: ProfileCardData) => void;
  onDelete?: (id: string) => void;
  initialCard?: ProfileCardData | null;
  businessPhone?: string;
  sections?: DbSection[];
  userRole?: string;
}

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

const AVAILABLE_COLORS = Object.values(UI_KIT.cardPalettes);

const PRESET_BADGES = ['FEATURED', 'HOT DEAL', 'AVAILABLE NOW', 'JUST LISTED', 'TOP RATED', 'LIMITED TIME'];

const REAL_ESTATE_SUGGESTIONS = {
  propertyTypes: ['3 BHK Luxury Apartment', '4 BHK Villa with Pool', '2 BHK Modern Condo', 'Commercial Office Space', 'Gated Plot'],
  locations: ['Austin, TX', 'Beverly Hills, CA', 'Bandra West, Mumbai', 'Whitefield, Bengaluru', 'Downtown Dubai'],
  priceBrackets: ['$749,000', '$1,250,000', '₹1.5 Cr - 2.2 Cr', 'Rent: $3,200/mo', '$2,800,000'],
  statusTags: ['just_listed', 'open_house', 'price_drop'] as const,
};

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialCard,
  businessPhone = '',
  sections = [],
  userRole,
}) => {
  const isEditing = Boolean(initialCard);
  const normalized = normalizeRole(userRole);

  // Active view: 'picker' for template discovery & selection, 'configure' for customization
  const [activeView, setActiveView] = useState<'picker' | 'configure'>(initialCard ? 'configure' : 'picker');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<CategoryTab>('for_you');

  // Template Category & Type
  const [templateType, setTemplateType] = useState<CardTemplateType>('standard');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Core Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('https://');
  const [color, setColor] = useState<CardColor>('purple');
  const [logoSrc, setLogoSrc] = useState('');
  const [badgeText, setBadgeText] = useState('HOT DEAL');
  const [expanded, setExpanded] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [customWhatsappPhone, setCustomWhatsappPhone] = useState('');

  // 1. Real Estate Specific Fields
  const [propertyName, setPropertyName] = useState('');
  const [location, setLocation] = useState('Austin, TX');
  const [priceBracket, setPriceBracket] = useState('$749,000');
  const [propertyType, setPropertyType] = useState('3 Bed • 2 Bath • 1,850 sq ft');
  const [statusTag, setStatusTag] = useState<'just_listed' | 'open_house' | 'price_drop'>('just_listed');
  const [featuredAmenity, setFeaturedAmenity] = useState('Pool & Rooftop Deck');

  // 2. Creator Stats
  const [instagramFollowers, setInstagramFollowers] = useState('82.4K');
  const [engagementRate, setEngagementRate] = useState('4.8%');
  const [monthlyReach, setMonthlyReach] = useState('1.2M');
  const [primaryNiche, setPrimaryNiche] = useState('Tech, SaaS & Lifestyle');
  const [primaryDemographics, setPrimaryDemographics] = useState('74% Age 18-34 • Global Reach');

  // 3. Work With Me
  const [availabilityStatus, setAvailabilityStatus] = useState('🔥 Available for UGC / Sponsorships / Reels');
  const [deliverablesStr, setDeliverablesStr] = useState('UGC Videos, Dedicated Reels, Brand Ambassadorship, Product Unboxing');
  const [turnaroundTime, setTurnaroundTime] = useState('3 - 5 Days Turnaround');

  // 4. Featured Work
  const [brandName, setBrandName] = useState('Notion');
  const [resultsMetric, setResultsMetric] = useState('🔥 340K Views • 12% Engagement');
  const [videoUrl, setVideoUrl] = useState('https://instagram.com/reel/example');
  const [clientTestimonial, setClientTestimonial] = useState('Delivered the highest ROI among all our Q3 creator partnerships!');

  // 5. Creator Packages
  const [packagesList, setPackagesList] = useState<CollaborationPackageItem[]>([
    { id: '1', name: 'UGC Video', deliverables: '1x 45s High-Converting UGC Reel + Raw Hooks', price: '₹8,000 ($100)', turnaround: '3 Days' },
    { id: '2', name: 'Dedicated Instagram Reel', deliverables: '1x Sponsored Reel + Grid Post + Link in Bio', price: '₹15,000 ($180)', turnaround: '4 Days', isPopular: true },
    { id: '3', name: 'Reel + Story Bundle', deliverables: '1x Dedicated Reel + 3x Stories with Link Sticker', price: '₹20,000 ($240)', turnaround: '5 Days' },
  ]);

  // 6. Affiliate Recommendation
  const [productName, setProductName] = useState('Sony WH-1000XM5 Headphones');
  const [recommendationBrand, setRecommendationBrand] = useState('Sony Audio');
  const [productPrice, setProductPrice] = useState('$348');
  const [discountCode, setDiscountCode] = useState('CREATOR20');
  const [discountText, setDiscountText] = useState('20% OFF');

  // 7. Client Review
  const [clientReviewName, setClientReviewName] = useState('Sarah & Michael M.');
  const [clientReviewText, setClientReviewText] = useState('Ayush sold our home in 4 days for $50k over asking price. Incredible negotiation!');
  const [clientTitleOrProperty, setClientTitleOrProperty] = useState('Seller • 1204 Pine Street');
  const [rating, setRating] = useState(5);

  // 8. Coaching Institute
  const [courseName, setCourseName] = useState('');
  const [examTrack, setExamTrack] = useState('JEE / NEET');
  const [batchTiming, setBatchTiming] = useState('Morning (8:00 AM - 12:00 PM)');
  const [feeStructure, setFeeStructure] = useState('₹45,000 / year');

  // 9. Musicians & Artists
  const [releaseTitle, setReleaseTitle] = useState('Neon Mirage');
  const [artistName, setArtistName] = useState('Lyra Sound');
  const [releaseType, setReleaseType] = useState<'Single' | 'EP' | 'Album' | 'Remix'>('Single');
  const [releaseDate, setReleaseDate] = useState('2026');
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('https://open.spotify.com');
  const [appleMusicUrl, setAppleMusicUrl] = useState('https://music.apple.com');
  const [youtubeUrl, setYoutubeUrl] = useState('https://youtube.com');
  const [amazonMusicUrl, setAmazonMusicUrl] = useState('https://music.amazon.com');
  const [bookingRate, setBookingRate] = useState('$1,000 - $3,000 / ₹50k - ₹1.5L');
  const [epkBio, setEpkBio] = useState('Available for headline sets, festivals, college fests & private performances.');
  const [epkDownloadUrl, setEpkDownloadUrl] = useState('');

  // 10. Podcasters & "Sponsor Me" Killer Card
  const [episodeTitle, setEpisodeTitle] = useState('Bootstrapping to $10M ARR');
  const [episodeNumber, setEpisodeNumber] = useState('EP 148');
  const [podcastDuration, setPodcastDuration] = useState('52m');
  const [podcastReleaseDate, setPodcastReleaseDate] = useState('This week');
  const [spotifyPodcastsUrl, setSpotifyPodcastsUrl] = useState('https://open.spotify.com');
  const [applePodcastsUrl, setApplePodcastsUrl] = useState('https://podcasts.apple.com');
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState('https://youtube.com');
  const [monthlyDownloads, setMonthlyDownloads] = useState('450,000+');
  const [audienceSize, setAudienceSize] = useState('120,000+ Subscribers');
  const [listenerDemographics, setListenerDemographics] = useState('78% 22-38 • Tech Founders, Operators & Engineers');
  const [pastSponsorsStr, setPastSponsorsStr] = useState('Notion, Linear, Vercel, Athletic Greens, Riverside');
  const [mediaKitUrl, setMediaKitUrl] = useState('');
  const [sponsorPitch, setSponsorPitch] = useState('Put your product in front of thousands of high-earning decision makers every week.');

  // Image Upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when initialCard changes
  useEffect(() => {
    if (initialCard) {
      setActiveView('configure');
      const type = initialCard.templateType || 'standard';
      setTemplateType(type);
      setSelectedSectionId(initialCard.sectionId || '');
      setTitle(initialCard.title || '');
      setSubtitle(initialCard.subtitle || '');
      setLinkUrl(initialCard.linkUrl || 'https://');
      setColor(initialCard.color || 'purple');
      setLogoSrc(initialCard.logoSrc || '');
      setBadgeText(initialCard.badgeText || '');
      setExpanded(initialCard.expanded ?? true);
      setIsActive(initialCard.isActive !== false);
      setCustomWhatsappPhone(initialCard.customWhatsappPhone || '');

      if (initialCard.realEstate) {
        setPropertyName(initialCard.realEstate.propertyName || initialCard.title || '');
        setLocation(initialCard.realEstate.location || '');
        setPriceBracket(initialCard.realEstate.price || initialCard.realEstate.priceBracket || '');
        setPropertyType(initialCard.realEstate.propertyType || '');
        setStatusTag(initialCard.realEstate.statusTag || 'just_listed');
        setFeaturedAmenity(initialCard.realEstate.featuredAmenity || '');
      }

      if (initialCard.creatorStats) {
        setInstagramFollowers(initialCard.creatorStats.instagramFollowers || '82.4K');
        setEngagementRate(initialCard.creatorStats.engagementRate || '4.8%');
        setMonthlyReach(initialCard.creatorStats.monthlyReach || '1.2M');
        setPrimaryNiche(initialCard.creatorStats.primaryNiche || 'Tech & Lifestyle');
        setPrimaryDemographics(initialCard.creatorStats.primaryDemographics || '');
      }

      if (initialCard.creatorWork) {
        setAvailabilityStatus(initialCard.creatorWork.availabilityStatus || '');
        setDeliverablesStr((initialCard.creatorWork.deliverables || []).join(', '));
        setTurnaroundTime(initialCard.creatorWork.turnaroundTime || '');
      }

      if (initialCard.featuredWork) {
        setBrandName(initialCard.featuredWork.brandName || '');
        setResultsMetric(initialCard.featuredWork.resultsMetric || '');
        setVideoUrl(initialCard.featuredWork.videoUrl || '');
        setClientTestimonial(initialCard.featuredWork.clientTestimonial || '');
      }

      if (initialCard.creatorPackages?.packages) {
        setPackagesList(initialCard.creatorPackages.packages);
      }

      if (initialCard.recommendation) {
        setProductName(initialCard.recommendation.productName || '');
        setRecommendationBrand(initialCard.recommendation.brandName || '');
        setProductPrice(initialCard.recommendation.price || '');
        setDiscountCode(initialCard.recommendation.discountCode || '');
        setDiscountText(initialCard.recommendation.discountText || '');
      }

      if (initialCard.clientReview) {
        setClientReviewName(initialCard.clientReview.clientName || '');
        setClientReviewText(initialCard.clientReview.reviewText || '');
        setClientTitleOrProperty(initialCard.clientReview.clientTitleOrProperty || '');
        setRating(initialCard.clientReview.rating || 5);
      }

      if (initialCard.coaching) {
        setCourseName(initialCard.coaching.courseName || initialCard.title || '');
        setExamTrack(initialCard.coaching.examTrack || '');
        setBatchTiming(initialCard.coaching.batchTiming || '');
        setFeeStructure(initialCard.coaching.feeStructure || '');
      }

      if (initialCard.music) {
        setReleaseTitle(initialCard.music.releaseTitle || initialCard.title || '');
        setArtistName(initialCard.music.artistName || '');
        setReleaseType(initialCard.music.releaseType || 'Single');
        setReleaseDate(initialCard.music.releaseDate || '2026');
        setAudioPreviewUrl(initialCard.music.audioPreviewUrl || '');
        setSpotifyUrl(initialCard.music.spotifyUrl || 'https://open.spotify.com');
        setAppleMusicUrl(initialCard.music.appleMusicUrl || 'https://music.apple.com');
        setYoutubeUrl(initialCard.music.youtubeUrl || 'https://youtube.com');
        setAmazonMusicUrl(initialCard.music.amazonMusicUrl || 'https://music.amazon.com');
        setBookingRate(initialCard.music.bookingRate || '');
        setEpkBio(initialCard.music.epkBio || '');
        setEpkDownloadUrl(initialCard.music.epkDownloadUrl || '');
      }

      if (initialCard.podcast) {
        setEpisodeTitle(initialCard.podcast.episodeTitle || initialCard.title || '');
        setEpisodeNumber(initialCard.podcast.episodeNumber || 'EP 148');
        setPodcastDuration(initialCard.podcast.duration || '52m');
        setPodcastReleaseDate(initialCard.podcast.releaseDate || 'This week');
        setSpotifyPodcastsUrl(initialCard.podcast.spotifyPodcastsUrl || 'https://open.spotify.com');
        setApplePodcastsUrl(initialCard.podcast.applePodcastsUrl || 'https://podcasts.apple.com');
        setYoutubeChannelUrl(initialCard.podcast.youtubeChannelUrl || 'https://youtube.com');
        setMonthlyDownloads(initialCard.podcast.monthlyDownloads || '450,000+');
        setAudienceSize(initialCard.podcast.audienceSize || '120,000+ Subscribers');
        setListenerDemographics(initialCard.podcast.listenerDemographics || '78% 22-38 • Tech Founders, Operators & Engineers');
        setPastSponsorsStr((initialCard.podcast.pastSponsors || []).join(', ') || 'Notion, Linear, Vercel, Athletic Greens');
        setMediaKitUrl(initialCard.podcast.mediaKitUrl || '');
        setSponsorPitch(initialCard.podcast.sponsorPitch || '');
      }
    } else {
      setActiveView('picker');
      setSelectedCategoryTab('for_you');
      setTemplateType('standard');
      setSelectedSectionId('');
      setTitle('');
      setSubtitle('');
      setLinkUrl('https://');
      setColor('purple');
      setLogoSrc('');
      setBadgeText('');
      setExpanded(false);
      setIsActive(true);
      setCustomWhatsappPhone('');
    }
  }, [initialCard, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploading(true);
    try {
      const url = await uploadImageToStorage(file, 'card_image');
      setLogoSrc(url);
    } catch (err) {
      console.error('Error uploading image to storage:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Switch template archetype with smart presets
  const handleSelectTemplate = (type: CardTemplateType) => {
    setTemplateType(type);
    if (type === 'work_with_me') {
      setTitle('🔥 Work With Me');
      setSubtitle('Available for UGC, Sponsored Reels & Creative Campaigns');
      setColor('purple');
      setExpanded(true);
    } else if (type === 'creator_stats') {
      setTitle('📊 Creator Reach & Analytics');
      setSubtitle('Verified multi-platform audience and engagement stats');
      setColor('purple');
      setExpanded(true);
    } else if (type === 'featured_work') {
      setTitle('🎬 Notion Productivity Campaign');
      setSubtitle('340K Views with 12.4% Click-Through Rate');
      setColor('stone');
      setExpanded(true);
    } else if (type === 'creator_packages') {
      setTitle('💰 Collaboration Packages');
      setSubtitle('Transparent rates with fast 3-5 day turnaround');
      setColor('purple');
      setExpanded(true);
    } else if (type === 'brand_inquiry') {
      setTitle('📩 Inquire for Brand Deals');
      setSubtitle('Submit campaign brief, budget and timeline directly');
      setColor('purple');
      setExpanded(false);
    } else if (type === 'recommendation') {
      setTitle('🛍️ My Studio Setup & Gear');
      setSubtitle('Curated gear with exclusive community discount codes');
      setColor('purple');
      setExpanded(false);
    } else if (type === 'media_kit') {
      setTitle('📄 Creator Media Kit 2026');
      setSubtitle('View one-sheet, demographics, and past brand partnerships');
      setColor('purple');
      setExpanded(false);
    } else if (type === 'real_estate') {
      setTitle(propertyName || 'Luxury Sunset Villa');
      setSubtitle('Private pool, panoramic city views, chef kitchen');
      setPriceBracket('$1,250,000');
      setColor('green');
      setExpanded(true);
    } else if (type === 'showing_booking') {
      setTitle('📅 Schedule Private Home Tour');
      setSubtitle('Pick your preferred date and time for a guided showing');
      setColor('green');
      setExpanded(false);
    } else if (type === 'home_valuation') {
      setTitle("🏡 What's Your Home Worth?");
      setSubtitle('Get a free instant Comparative Market Analysis (CMA) report');
      setColor('yellow');
      setExpanded(true);
    } else if (type === 'client_reviews') {
      setTitle('⭐️ Client Testimonial');
      setSubtitle('Verified buyer & seller reviews');
      setColor('stone');
      setExpanded(true);
    } else if (type === 'coaching_institute') {
      setTitle('Target JEE & NEET 2027');
      setSubtitle('Admissions open for new batch');
      setColor('blue');
      setExpanded(true);
    } else if (type === 'music_smart_card') {
      setTitle('Neon Mirage (Official Single)');
      setSubtitle('Available on Spotify, Apple Music, YouTube & Amazon');
      setColor('stone');
      setExpanded(true);
    } else if (type === 'music_latest_release') {
      setTitle('Neon Mirage');
      setSubtitle('Out now on all major streaming platforms');
      setColor('rose');
      setExpanded(true);
    } else if (type === 'music_streaming_hub') {
      setTitle('Stream My Music Everywhere');
      setSubtitle('Pick your preferred streaming app');
      setColor('purple');
      setExpanded(true);
    } else if (type === 'music_book_me') {
      setTitle('Book Live Shows & Festivals');
      setSubtitle('Available for headline sets, campus fests & tours');
      setColor('amber');
      setExpanded(true);
    } else if (type === 'music_upcoming_shows') {
      setTitle('Fall / Winter Tour 2026');
      setSubtitle('Live dates & tickets in 5 cities');
      setColor('stone');
      setExpanded(true);
    } else if (type === 'music_player') {
      setTitle('Listen to Track Preview');
      setSubtitle('In-card high fidelity audio stream');
      setColor('purple');
      setExpanded(true);
    } else if (type === 'music_merch') {
      setTitle('Official Artist Merch Store');
      setSubtitle('Tour tees, hoodies & vinyl LPs');
      setColor('amber');
      setExpanded(true);
    } else if (type === 'music_press_kit') {
      setTitle('Electronic Press Kit (EPK)');
      setSubtitle('High-res photos, rider & promoter bio');
      setColor('blue');
      setExpanded(true);
    } else if (type === 'music_booking_inquiry') {
      setTitle('Concert Booking Inquiry');
      setSubtitle('Request availability & technical rider');
      setColor('amber');
      setExpanded(false);
    } else if (type === 'podcast_sponsor_me') {
      setTitle('Sponsor The Podcast');
      setSubtitle('450K+ monthly downloads across tech & founders');
      setColor('purple');
      setExpanded(true);
    } else if (type === 'podcast_latest_episode') {
      setTitle('EP 148: Building to $10M ARR');
      setSubtitle('Deep dive into distribution, pricing and product craft');
      setColor('purple');
      setExpanded(true);
    } else if (type === 'podcast_listen_on') {
      setTitle('Listen On Your Favorite App');
      setSubtitle('Apple Podcasts, Spotify, YouTube & Amazon');
      setColor('purple');
      setExpanded(true);
    } else if (type === 'podcast_youtube') {
      setTitle('Watch Full Video Episodes');
      setSubtitle('4K multi-camera studio discussions');
      setColor('rose');
      setExpanded(true);
    } else if (type === 'podcast_archive') {
      setTitle('Browse All Episodes');
      setSubtitle('Complete backlog with show transcripts');
      setColor('stone');
      setExpanded(true);
    } else if (type === 'podcast_newsletter') {
      setTitle('Backstage Show Notes & Transcripts');
      setSubtitle('Weekly deep dives & reading lists delivered to your inbox');
      setColor('amber');
      setExpanded(true);
    } else if (type === 'podcast_stats') {
      setTitle('Verified Podcast Audience & Stats');
      setSubtitle('450K downloads • Top 10 Tech Chart');
      setColor('purple');
      setExpanded(true);
    } else if (type === 'podcast_sponsor_inquiry') {
      setTitle('Request Sponsorship Deck');
      setSubtitle('Inquire for Q3/Q4 host-read sponsorships');
      setColor('purple');
      setExpanded(false);
    }
  };

  const isMusicianType = templateType.startsWith('music_');
  const isPodcastType = templateType.startsWith('podcast_');

  // Build live preview object
  const previewRealEstate: RealEstateMetadata | undefined =
    templateType === 'real_estate'
      ? {
          propertyName: propertyName.trim() || title.trim(),
          location: location.trim(),
          price: priceBracket.trim(),
          priceBracket: priceBracket.trim(),
          propertyType: propertyType.trim(),
          statusTag: statusTag,
          featuredAmenity: featuredAmenity.trim(),
          images: logoSrc ? [logoSrc] : undefined,
        }
      : undefined;

  const previewCreatorStats: CreatorStatsMetadata | undefined =
    templateType === 'creator_stats'
      ? {
          instagramFollowers,
          engagementRate,
          monthlyReach,
          primaryNiche,
          primaryDemographics,
        }
      : undefined;

  const previewCreatorWork: CreatorWorkMetadata | undefined =
    templateType === 'work_with_me'
      ? {
          availabilityStatus,
          deliverables: deliverablesStr.split(',').map((s) => s.trim()).filter(Boolean),
          turnaroundTime,
          pitchText: subtitle,
        }
      : undefined;

  const previewFeaturedWork: FeaturedWorkItem | undefined =
    templateType === 'featured_work'
      ? {
          title: title || 'Featured Creative Campaign',
          brandName,
          resultsMetric,
          videoUrl,
          clientTestimonial,
          thumbnailUrl: logoSrc || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600',
        }
      : undefined;

  const previewCreatorPackages: CreatorPackagesMetadata | undefined =
    templateType === 'creator_packages'
      ? {
          packages: packagesList,
        }
      : undefined;

  const previewRecommendation: AffiliateRecommendationMetadata | undefined =
    templateType === 'recommendation'
      ? {
          productName,
          brandName: recommendationBrand,
          price: productPrice,
          discountCode,
          discountText,
          affiliateUrl: linkUrl || 'https://',
          productImageUrl: logoSrc || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
        }
      : undefined;

  const previewClientReview: ClientReviewMetadata | undefined =
    templateType === 'client_reviews'
      ? {
          clientName: clientReviewName,
          reviewText: clientReviewText,
          clientTitleOrProperty,
          rating,
        }
      : undefined;

  const previewCoaching: CoachingMetadata | undefined =
    templateType === 'coaching_institute'
      ? {
          courseName: courseName.trim() || title.trim(),
          examTrack: examTrack.trim(),
          batchTiming: batchTiming.trim(),
          feeStructure: feeStructure.trim(),
        }
      : undefined;

  const previewMusic: MusicMetadata | undefined = isMusicianType
    ? {
        releaseTitle: releaseTitle.trim() || title.trim(),
        artistName: artistName.trim(),
        releaseType,
        releaseDate: releaseDate.trim(),
        audioPreviewUrl: audioPreviewUrl.trim() || undefined,
        spotifyUrl: spotifyUrl.trim(),
        appleMusicUrl: appleMusicUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        amazonMusicUrl: amazonMusicUrl.trim(),
        bookingRate: bookingRate.trim(),
        epkBio: epkBio.trim(),
        epkDownloadUrl: epkDownloadUrl.trim() || undefined,
        preferredPlatformDefault: 'spotify',
        coverArtUrl: logoSrc || undefined,
      }
    : undefined;

  const previewPodcast: PodcastMetadata | undefined = isPodcastType
    ? {
        episodeTitle: episodeTitle.trim() || title.trim(),
        episodeNumber: episodeNumber.trim(),
        duration: podcastDuration.trim(),
        releaseDate: podcastReleaseDate.trim(),
        spotifyPodcastsUrl: spotifyPodcastsUrl.trim(),
        applePodcastsUrl: applePodcastsUrl.trim(),
        youtubeChannelUrl: youtubeChannelUrl.trim(),
        monthlyDownloads: monthlyDownloads.trim(),
        audienceSize: audienceSize.trim(),
        listenerDemographics: listenerDemographics.trim(),
        pastSponsors: pastSponsorsStr.split(',').map((s) => s.trim()).filter(Boolean),
        mediaKitUrl: mediaKitUrl.trim() || undefined,
        sponsorPitch: sponsorPitch.trim() || subtitle.trim(),
      }
    : undefined;

  const previewCard: ProfileCardData = {
    id: initialCard ? initialCard.id : 'preview-card',
    title: title.trim() || 'Card Title',
    subtitle: subtitle.trim() || undefined,
    linkUrl: linkUrl.trim() || 'https://',
    color,
    logoSrc: logoSrc || undefined,
    badgeText: badgeText.trim() || undefined,
    expanded,
    isActive,
    templateType,
    realEstate: previewRealEstate,
    creatorStats: previewCreatorStats,
    creatorWork: previewCreatorWork,
    featuredWork: previewFeaturedWork,
    creatorPackages: previewCreatorPackages,
    recommendation: previewRecommendation,
    clientReview: previewClientReview,
    coaching: previewCoaching,
    music: previewMusic,
    podcast: previewPodcast,
    isPremium: isMusicianType || isPodcastType,
    customWhatsappPhone: customWhatsappPhone.trim() || undefined,
  };

  const whatsAppIntent = generateWhatsAppIntentUrl(previewCard, businessPhone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCard: ProfileCardData = {
      id: initialCard ? initialCard.id : `card_${Date.now()}`,
      sectionId: selectedSectionId || undefined,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      linkUrl: linkUrl.trim() || 'https://',
      color,
      logoSrc: logoSrc || undefined,
      badgeText: badgeText.trim() || undefined,
      expanded,
      isActive,
      templateType,
      realEstate: previewRealEstate,
      creatorStats: previewCreatorStats,
      creatorWork: previewCreatorWork,
      featuredWork: previewFeaturedWork,
      creatorPackages: previewCreatorPackages,
      recommendation: previewRecommendation,
      clientReview: previewClientReview,
      coaching: previewCoaching,
      music: previewMusic,
      podcast: previewPodcast,
      isPremium: isMusicianType || isPodcastType,
      customWhatsappPhone: customWhatsappPhone.trim() || undefined,
      clicks: initialCard?.clicks || 0,
    };

    onSave(finalCard);
    onClose();
  };

  const currentTemplateMeta =
    ALL_TEMPLATES.find((t) => t.id === templateType) ||
    ALL_TEMPLATES.find((t) => t.id === 'standard') ||
    ALL_TEMPLATES[0];

  const CATEGORY_TABS: Array<{ id: CategoryTab; label: string; count: number }> = [
    {
      id: 'for_you',
      label: `★ For You (${normalized.roleName})`,
      count: ALL_TEMPLATES.filter((t) => t.category === normalized.category || t.category === 'standard').length,
    },
    {
      id: 'creator',
      label: 'Content Creator',
      count: ALL_TEMPLATES.filter((t) => t.category === 'creator').length,
    },
    {
      id: 'musician',
      label: 'Musicians & Artists',
      count: ALL_TEMPLATES.filter((t) => t.category === 'musician').length,
    },
    {
      id: 'podcast',
      label: 'Podcasters & Shows',
      count: ALL_TEMPLATES.filter((t) => t.category === 'podcast').length,
    },
    {
      id: 'real_estate',
      label: 'Real Estate Engine',
      count: ALL_TEMPLATES.filter((t) => t.category === 'real_estate').length,
    },
    {
      id: 'coach',
      label: 'Coaches & Academies',
      count: ALL_TEMPLATES.filter((t) => t.category === 'coach').length,
    },
    {
      id: 'standard',
      label: 'Standard Link',
      count: 1,
    },
  ];

  const visibleTemplates = ALL_TEMPLATES.filter((t) => {
    if (selectedCategoryTab === 'for_you') {
      return t.category === normalized.category || t.category === 'standard';
    }
    return t.category === selectedCategoryTab;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-sm animate-fadeIn overflow-hidden">
      <div
        className="bg-stone-50 w-full max-w-2xl rounded-[28px] sm:rounded-[32px] border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-2xl bg-[#1C1E22] text-white flex items-center justify-center shadow-xs shrink-0">
              <HugeIcon icon={StarIcon} size={16} className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-[#1C1E22] truncate">
                {activeView === 'picker'
                  ? isEditing
                    ? 'Switch Card Template'
                    : 'Add High-Converting Card'
                  : isEditing
                  ? 'Edit High-Converting Card'
                  : `Configure ${currentTemplateMeta.title}`}
              </h2>
              <p className="text-xs text-[#737882] truncate">
                {activeView === 'picker'
                  ? `Curated templates tailored for ${normalized.roleName}`
                  : 'Customize card content, live interactive preview & lead capture'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeView === 'picker' && isEditing && (
              <button
                type="button"
                onClick={() => setActiveView('configure')}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
              >
                <HugeIcon icon={ArrowLeft01Icon} size={14} className="w-3.5 h-3.5" />
                <span>Keep Current Card</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close (Esc)"
              className="px-2.5 py-1.5 rounded-xl hover:bg-stone-100 flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer border border-stone-200"
            >
              <HugeIcon icon={Cancel01Icon} size={16} className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-full text-stone-800">
          {activeView === 'picker' ? (
            <div className="space-y-4">
              {/* Role Context & Guidance Banner */}
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1C1E22] text-white">
                        Curated Workflow
                      </span>
                      <span className="text-xs font-bold text-[#1C1E22]">
                        {normalized.roleName}
                      </span>
                    </div>
                    <p className="text-xs text-[#737882] leading-relaxed">
                      {normalized.roleHeadline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Horizontal Category Pill Tabs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#737882]">
                    Filter By Category
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {visibleTemplates.length} templates
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                  {CATEGORY_TABS.map((tab) => {
                    const isActiveTab = selectedCategoryTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedCategoryTab(tab.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                          isActiveTab
                            ? 'bg-[#1C1E22] text-white border-[#1C1E22] shadow-2xs'
                            : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 border-stone-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Curated Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {visibleTemplates.map((item) => {
                  const isCurrent = templateType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleSelectTemplate(item.id);
                        setActiveView('configure');
                      }}
                      className={`group text-left p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-2xs hover:shadow-xs active:scale-[0.99] ${
                        isCurrent
                          ? 'bg-stone-50 border-[#1C1E22] ring-2 ring-[#1C1E22]/10'
                          : 'bg-white hover:bg-white border-stone-200 hover:border-[#1C1E22]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="w-8 h-8 rounded-xl bg-stone-100 text-[#1C1E22] group-hover:bg-[#1C1E22] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                            <HugeIcon icon={item.icon} size={16} className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 uppercase tracking-wider whitespace-nowrap border border-stone-200/60">
                                {item.badge}
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1C1E22] text-white uppercase tracking-wider whitespace-nowrap">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-sm font-bold text-[#1C1E22] leading-snug mb-1 group-hover:text-black">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#737882] leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-[#1C1E22]">
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
                          {item.categoryLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#1C1E22] group-hover:translate-x-0.5 transition-transform font-bold">
                          Use Template <HugeIcon icon={ArrowRight01Icon} size={13} className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Active Template Switcher Bar */}
              <div className="p-3.5 bg-white rounded-2xl border border-stone-200 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 text-[#1C1E22] flex items-center justify-center shrink-0">
                    <HugeIcon icon={currentTemplateMeta.icon} size={16} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Template: {currentTemplateMeta.categoryLabel}
                      </span>
                      {currentTemplateMeta.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                          {currentTemplateMeta.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-[#1C1E22] truncate block">
                      {currentTemplateMeta.title}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveView('picker')}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-xs font-bold text-[#1C1E22] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border border-stone-200/80"
                >
                  <HugeIcon icon={ArrowLeft01Icon} size={13} className="w-3.5 h-3.5" />
                  <span>Change Template</span>
                </button>
              </div>

              {/* Live Preview Box */}
              <div className="space-y-1.5 max-w-full">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#737882] block">
                    Interactive Preview
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Responsive Card
                  </span>
                </div>
                <div className="p-3 bg-white/70 rounded-2xl border border-black/10 shadow-2xs max-w-full overflow-hidden">
                  <ProfileCard
                    title={previewCard.title}
                    subtitle={previewCard.subtitle}
                    linkUrl={previewCard.linkUrl}
                    color={previewCard.color}
                    logoSrc={previewCard.logoSrc}
                    badgeText={previewCard.badgeText}
                    expanded={previewCard.expanded}
                    templateType={previewCard.templateType}
                    realEstate={previewCard.realEstate}
                    creatorStats={previewCard.creatorStats}
                    creatorWork={previewCard.creatorWork}
                    featuredWork={previewCard.featuredWork}
                    creatorPackages={previewCard.creatorPackages}
                    recommendation={previewCard.recommendation}
                    clientReview={previewCard.clientReview}
                    coaching={previewCard.coaching}
                    music={previewCard.music}
                    podcast={previewCard.podcast}
                    businessPhone={businessPhone}
                    customWhatsappPhone={previewCard.customWhatsappPhone}
                    interactive={false}
                  />
                </div>
              </div>

              <form id="card-editor-form" onSubmit={handleSubmit} className="space-y-4 max-w-full">
            {/* 1. REAL ESTATE PROPERTY FIELDS */}
            {templateType === 'real_estate' && (
              <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-xs text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <HugeIcon icon={Building01Icon} size={14} className="w-3.5 h-3.5" /> Real Estate Listing Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Property Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Modern Hill Country Estate"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setPropertyName(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Price / Price Bracket *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. $1,250,000 or ₹1.8 Cr"
                      value={priceBracket}
                      onChange={(e) => setPriceBracket(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Location & City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Austin, TX (Zilker Park)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Property Specs *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4 Bed • 3.5 Bath • 3,200 sq ft"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Listing Status Tag</label>
                    <select
                      value={statusTag}
                      onChange={(e) => setStatusTag(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="just_listed">🔥 Just Listed</option>
                      <option value="open_house">📍 Open House This Weekend</option>
                      <option value="price_drop">🏷️ Price Reduced</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Key Feature / Amenity</label>
                    <input
                      type="text"
                      placeholder="e.g. Infinity Pool • Smart Home"
                      value={featuredAmenity}
                      onChange={(e) => setFeaturedAmenity(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. CREATOR STATS FIELDS */}
            {templateType === 'creator_stats' && (
              <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider flex items-center gap-1">
                  <HugeIcon icon={Analytics01Icon} size={14} className="w-3.5 h-3.5" /> Audience & Engagement Metrics
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">Followers</label>
                    <input
                      type="text"
                      value={instagramFollowers}
                      onChange={(e) => setInstagramFollowers(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">Avg Engagement</label>
                    <input
                      type="text"
                      value={engagementRate}
                      onChange={(e) => setEngagementRate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold text-center text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">Monthly Reach</label>
                    <input
                      type="text"
                      value={monthlyReach}
                      onChange={(e) => setMonthlyReach(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-bold text-center text-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Creator Niche</label>
                  <input
                    type="text"
                    placeholder="e.g. AI Tools, Productivity, Tech & Design"
                    value={primaryNiche}
                    onChange={(e) => setPrimaryNiche(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>
            )}

            {/* 3. FEATURED WORK FIELDS */}
            {templateType === 'featured_work' && (
              <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider flex items-center gap-1">
                  <HugeIcon icon={PlayIcon} size={14} className="w-3.5 h-3.5" /> Featured Reel / Video Showcase
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Sponsoring Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Notion or Samsung"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Results Metric</label>
                    <input
                      type="text"
                      placeholder="e.g. 🔥 420K Views • 14% Click Rate"
                      value={resultsMetric}
                      onChange={(e) => setResultsMetric(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Client Quote / Testimonial</label>
                  <input
                    type="text"
                    placeholder="e.g. One of our highest performing sponsored campaigns!"
                    value={clientTestimonial}
                    onChange={(e) => setClientTestimonial(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>
            )}

            {/* 4. AFFILIATE RECOMMENDATION */}
            {templateType === 'recommendation' && (
              <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-xs text-purple-900 uppercase tracking-wider flex items-center gap-1">
                  <HugeIcon icon={ShoppingBag01Icon} size={14} className="w-3.5 h-3.5" /> Affiliate Product / Gear Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shure SM7B Microphone"
                      value={productName}
                      onChange={(e) => {
                        setProductName(e.target.value);
                        setTitle(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Shure Audio"
                      value={recommendationBrand}
                      onChange={(e) => setRecommendationBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Discount Code (1-Tap Copy)</label>
                    <input
                      type="text"
                      placeholder="e.g. AYUSH20"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono font-bold text-purple-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Price</label>
                    <input
                      type="text"
                      placeholder="e.g. $399"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. MUSICIAN / RECORDING ARTIST FORM */}
            {isMusicianType && (
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
                      onChange={(e) => setReleaseType(e.target.value as any)}
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
            )}

            {/* 6. PODCASTER & SPONSOR ME KILLER CARD FORM */}
            {isPodcastType && (
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
            )}

            {/* Standard Title & Destination for other cards */}
            {templateType !== 'real_estate' && templateType !== 'recommendation' && (
              <div>
                <label className="text-xs font-bold text-[#1C1E22] block mb-1">Card Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Work With Me or Schedule Showing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                />
              </div>
            )}

            {/* Subtitle / Description */}
            <div>
              <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                Description / Pitch (Optional)
              </label>
              <input
                type="text"
                placeholder="Short persuasive sentence summarizing the offer"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
              />
            </div>

            {/* Destination URL */}
            <div>
              <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                Destination URL / Listing Link
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
              />
            </div>

            {/* Photo / Image URL */}
            <div>
              <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                Card Image / Thumbnail URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={logoSrc}
                  onChange={(e) => setLogoSrc(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-2 bg-white hover:bg-stone-50 border border-black/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isUploading ? <HugeIcon icon={Loading03Icon} size={14} className="w-3.5 h-3.5 animate-spin" /> : <HugeIcon icon={Upload01Icon} size={14} className="w-3.5 h-3.5" />}
                  <span>Upload</span>
                </button>
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-xs font-bold text-[#1C1E22] block mb-1.5">Card Accent Palette</label>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {AVAILABLE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`py-2 px-1 rounded-xl sm:rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      color === c.id ? 'border-black ring-2 ring-black/20 shadow-xs' : 'border-black/10'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    <span
                      className={`text-[10px] sm:text-xs font-bold truncate max-w-full ${
                        c.id === 'yellow' || c.id === 'green' ? 'text-[#191A1E]' : 'text-white'
                      }`}
                    >
                      {c.name}
                    </span>
                    {color === c.id && (
                      <HugeIcon
                        icon={Tick01Icon}
                        size={12}
                        className={`w-3 h-3 ${
                          c.id === 'yellow' || c.id === 'green' ? 'text-[#191A1E]' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section Assignment */}
            {sections && sections.length > 0 && (
              <div>
                <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                  Assign to Section (Optional)
                </label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                >
                  <option value="">-- No Section (General Links) --</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      📁 {sec.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form>
        </div>
      )}
    </div>

        {/* Footer actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-stone-200 flex items-center justify-between bg-white shrink-0">
          {activeView === 'picker' ? (
            <>
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => setActiveView('configure')}
                  className="px-3 py-1.5 rounded-xl hover:bg-stone-100 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                >
                  <HugeIcon icon={ArrowLeft01Icon} size={14} className="w-3.5 h-3.5" />
                  <span>Return to Card Form</span>
                </button>
              ) : (
                <span className="text-xs text-[#737882]">
                  Select any template to customize
                </span>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl hover:bg-black/5 text-xs font-bold text-[#737882] transition-colors cursor-pointer"
              >
                Close
              </button>
            </>
          ) : (
            <>
              {isEditing && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (initialCard) {
                      onDelete(initialCard.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <HugeIcon icon={Delete02Icon} size={14} className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveView('picker')}
                  className="px-3 py-1.5 rounded-xl hover:bg-stone-100 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                >
                  <HugeIcon icon={ArrowLeft01Icon} size={14} className="w-3.5 h-3.5" />
                  <span>Change Template</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl hover:bg-black/5 text-xs font-bold text-[#737882] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="card-editor-form"
                  className="px-5 py-2 rounded-xl bg-[#1C1E22] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Update Card' : 'Add to Showcase'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
