import React, { useState, useEffect, useRef } from 'react';
import {
  ProfileCardData,
  CardColor,
  CardTemplateType,
  RealEstateMetadata,
  RealEstateStatusTag,
  CreatorStatsMetadata,
  CreatorWorkMetadata,
  FeaturedWorkItem,
  CreatorPackagesMetadata,
  CollaborationPackageItem,
  AffiliateRecommendationMetadata,
  ClientReviewMetadata,
  CoachingMetadata,
  MusicMetadata,
  PodcastMetadata,
  DbSection,
} from '../../types';
import { UI_KIT } from '../../lib/ui-kit';
import { ProfileCard } from '../ProfileCard';
import { generateWhatsAppIntentUrl } from '../../lib/whatsapp';
import { uploadImageToStorage } from '../../lib/storage';
import { isValidExternalUrl, normalizeExternalUrl } from '../../lib/url';
import { HugeIcon } from '../HugeIcon';
import {
  ArrowLeft01Icon,
  Cancel01Icon,
  Delete02Icon,
  Loading03Icon,
  StarIcon,
  Tick01Icon,
  Upload01Icon,
} from '@hugeicons/core-free-icons';

import {
  CategoryTab,
  normalizeRole,
  ALL_TEMPLATES,
  AVAILABLE_COLORS,
} from './templateData';
import { TemplatePicker } from './TemplatePicker';
import { RealEstateEditor } from './RealEstateEditor';
import { CreatorEditor } from './CreatorEditor';
import { MusicianEditor } from './MusicianEditor';
import { PodcasterEditor } from './PodcasterEditor';

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
  const [statusTag, setStatusTag] = useState<RealEstateStatusTag>('just_listed');
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
  const [uploadError, setUploadError] = useState<string | null>(null);
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
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image exceeds 2MB. Please upload an image under 2MB for fast loading.');
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    try {
      const url = await uploadImageToStorage(file, 'card_image');
      setLogoSrc(url);
    } catch (err) {
      console.error('Error uploading image to storage:', err);
      setUploadError('Failed to upload image. Please try again.');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCard: ProfileCardData = {
      id: initialCard ? initialCard.id : `card_${Date.now()}`,
      sectionId: selectedSectionId || undefined,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      linkUrl: normalizeExternalUrl(linkUrl.trim()) || linkUrl.trim() || 'https://',
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div
        className="bg-stone-50 w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-white shrink-0">
          <div className="w-12 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
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
            <TemplatePicker
              normalizedRole={normalized}
              categoryTabs={CATEGORY_TABS}
              selectedCategoryTab={selectedCategoryTab}
              onSelectCategoryTab={setSelectedCategoryTab}
              visibleTemplates={visibleTemplates}
              templateType={templateType}
              onSelectTemplate={(type) => {
                handleSelectTemplate(type);
                setActiveView('configure');
              }}
            />
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
                  <RealEstateEditor
                    propertyName={propertyName}
                    setPropertyName={setPropertyName}
                    title={title}
                    setTitle={setTitle}
                    priceBracket={priceBracket}
                    setPriceBracket={setPriceBracket}
                    location={location}
                    setLocation={setLocation}
                    propertyType={propertyType}
                    setPropertyType={setPropertyType}
                    statusTag={statusTag}
                    setStatusTag={setStatusTag}
                    featuredAmenity={featuredAmenity}
                    setFeaturedAmenity={setFeaturedAmenity}
                  />
                )}

                {/* 2-4. CREATOR STATS, FEATURED WORK, RECOMMENDATION FIELDS */}
                <CreatorEditor
                  templateType={templateType}
                  instagramFollowers={instagramFollowers}
                  setInstagramFollowers={setInstagramFollowers}
                  engagementRate={engagementRate}
                  setEngagementRate={setEngagementRate}
                  monthlyReach={monthlyReach}
                  setMonthlyReach={setMonthlyReach}
                  primaryNiche={primaryNiche}
                  setPrimaryNiche={setPrimaryNiche}
                  brandName={brandName}
                  setBrandName={setBrandName}
                  resultsMetric={resultsMetric}
                  setResultsMetric={setResultsMetric}
                  clientTestimonial={clientTestimonial}
                  setClientTestimonial={setClientTestimonial}
                  productName={productName}
                  setProductName={setProductName}
                  recommendationBrand={recommendationBrand}
                  setRecommendationBrand={setRecommendationBrand}
                  discountCode={discountCode}
                  setDiscountCode={setDiscountCode}
                  productPrice={productPrice}
                  setProductPrice={setProductPrice}
                  setTitle={setTitle}
                />

                {/* 5. MUSICIAN / RECORDING ARTIST FORM */}
                {isMusicianType && (
                  <MusicianEditor
                    releaseTitle={releaseTitle}
                    setReleaseTitle={setReleaseTitle}
                    title={title}
                    setTitle={setTitle}
                    artistName={artistName}
                    setArtistName={setArtistName}
                    releaseType={releaseType}
                    setReleaseType={setReleaseType}
                    releaseDate={releaseDate}
                    setReleaseDate={setReleaseDate}
                    audioPreviewUrl={audioPreviewUrl}
                    setAudioPreviewUrl={setAudioPreviewUrl}
                    spotifyUrl={spotifyUrl}
                    setSpotifyUrl={setSpotifyUrl}
                    setLinkUrl={setLinkUrl}
                    appleMusicUrl={appleMusicUrl}
                    setAppleMusicUrl={setAppleMusicUrl}
                    youtubeUrl={youtubeUrl}
                    setYoutubeUrl={setYoutubeUrl}
                    amazonMusicUrl={amazonMusicUrl}
                    setAmazonMusicUrl={setAmazonMusicUrl}
                    templateType={templateType}
                    bookingRate={bookingRate}
                    setBookingRate={setBookingRate}
                    epkDownloadUrl={epkDownloadUrl}
                    setEpkDownloadUrl={setEpkDownloadUrl}
                    epkBio={epkBio}
                    setEpkBio={setEpkBio}
                  />
                )}

                {/* 6. PODCASTER & SPONSOR ME KILLER CARD FORM */}
                {isPodcastType && (
                  <PodcasterEditor
                    episodeTitle={episodeTitle}
                    setEpisodeTitle={setEpisodeTitle}
                    title={title}
                    setTitle={setTitle}
                    episodeNumber={episodeNumber}
                    setEpisodeNumber={setEpisodeNumber}
                    podcastDuration={podcastDuration}
                    setPodcastDuration={setPodcastDuration}
                    podcastReleaseDate={podcastReleaseDate}
                    setPodcastReleaseDate={setPodcastReleaseDate}
                    monthlyDownloads={monthlyDownloads}
                    setMonthlyDownloads={setMonthlyDownloads}
                    audienceSize={audienceSize}
                    setAudienceSize={setAudienceSize}
                    listenerDemographics={listenerDemographics}
                    setListenerDemographics={setListenerDemographics}
                    pastSponsorsStr={pastSponsorsStr}
                    setPastSponsorsStr={setPastSponsorsStr}
                    mediaKitUrl={mediaKitUrl}
                    setMediaKitUrl={setMediaKitUrl}
                    youtubeChannelUrl={youtubeChannelUrl}
                    setYoutubeChannelUrl={setYoutubeChannelUrl}
                    applePodcastsUrl={applePodcastsUrl}
                    setApplePodcastsUrl={setApplePodcastsUrl}
                    spotifyPodcastsUrl={spotifyPodcastsUrl}
                    setSpotifyPodcastsUrl={setSpotifyPodcastsUrl}
                    setLinkUrl={setLinkUrl}
                  />
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
                    type="text"
                    placeholder="https://... or example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className={`w-full px-3.5 py-2 bg-white rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 shadow-xs transition-colors ${
                      linkUrl && linkUrl !== 'https://' && !isValidExternalUrl(linkUrl)
                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                        : 'border-black/10 focus:ring-[#5E4BF7]'
                    }`}
                  />
                  {linkUrl && linkUrl !== 'https://' && !isValidExternalUrl(linkUrl) ? (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Please enter a valid web link (e.g. example.com or https://...).</span>
                    </p>
                  ) : linkUrl && linkUrl !== 'https://' && isValidExternalUrl(linkUrl) ? (
                    <p className="text-[10px] text-emerald-700 font-medium mt-1 truncate">
                      ✓ Target: {normalizeExternalUrl(linkUrl)}
                    </p>
                  ) : null}
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
                  <p className="text-[10px] text-[#737882] mt-1">Image limit: max 2MB (PNG, JPG, WebP)</p>
                  {uploadError && (
                    <p className="text-[10px] font-semibold text-rose-600 mt-1 animate-fadeIn">{uploadError}</p>
                  )}
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

        {/* Footer (Safe area padded for iOS & Android) */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 pb-[max(0.875rem,env(safe-area-inset-bottom,0px))] border-t border-stone-200 flex items-center justify-between bg-white shrink-0">
          {activeView === 'picker' ? (
            <>
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => setActiveView('configure')}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl hover:bg-stone-100 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200 touch-manipulation"
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
                className="min-h-[44px] px-4 py-2 rounded-xl hover:bg-black/5 text-xs font-bold text-[#737882] transition-colors cursor-pointer touch-manipulation"
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
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer touch-manipulation"
                >
                  <HugeIcon icon={Delete02Icon} size={14} className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveView('picker')}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl hover:bg-stone-100 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200 touch-manipulation"
                >
                  <HugeIcon icon={ArrowLeft01Icon} size={14} className="w-3.5 h-3.5" />
                  <span>Change Template</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] px-4 py-2 rounded-xl hover:bg-black/5 text-xs font-bold text-[#737882] transition-colors cursor-pointer touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="card-editor-form"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#1C1E22] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer touch-manipulation"
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

export default CardEditorModal;
