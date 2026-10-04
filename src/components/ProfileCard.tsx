import React from 'react';
import {
  CardColor,
  CardTemplateType,
  CardStyleType,
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
  TipSupportMetadata,
  VideoSpotlightMetadata,
  LiveTourMetadata,
  ProfileCardData,
  CollaborationPackageItem,
} from '../types';
import { generateWhatsAppIntentUrl } from '../lib/whatsapp';
import { safeOpenUrl } from '../lib/url';
import { detectVideoMedia } from '../lib/video';
import { useToast } from '../context/ToastContext';
import {
  COLOR_CONFIG,
  getCardRadiusClass,
  getButtonRadiusClass,
  getCardSurfaceClass,
} from './cards/CardStyles';
import { renderRegisteredCard } from './cards/CardRegistry';

export { COLOR_CONFIG, getCardRadiusClass, getButtonRadiusClass, getCardSurfaceClass };

export interface ProfileCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  linkUrl: string;
  color: CardColor;
  logoSrc?: string;
  badgeText?: string;
  expanded?: boolean;
  templateType?: CardTemplateType;

  // Metadata props
  realEstate?: RealEstateMetadata;
  showingBooking?: ShowingBookingMetadata;
  homeValuation?: HomeValuationMetadata;
  clientReview?: ClientReviewMetadata;
  creatorWork?: CreatorWorkMetadata;
  creatorStats?: CreatorStatsMetadata;
  featuredWork?: FeaturedWorkItem;
  creatorPackages?: CreatorPackagesMetadata;
  brandInquiry?: BrandInquiryMetadata;
  recommendation?: AffiliateRecommendationMetadata;
  mediaKit?: MediaKitMetadata;
  coaching?: CoachingMetadata;
  music?: MusicMetadata;
  podcast?: PodcastMetadata;
  tipSupport?: TipSupportMetadata;
  videoMedia?: VideoSpotlightMetadata;
  liveTour?: LiveTourMetadata;
  isPremium?: boolean;
  businessPhone?: string;
  customWhatsappPhone?: string;
  cardStyle?: CardStyleType;
  buttonStyle?: 'rounded' | 'square' | 'pill' | 'glass' | 'smooth';
  cardBgColor?: string;
  cardTextColor?: string;
  customAccentColor?: string;

  // Custom modal triggers
  onOpenShowingModal?: (card: ProfileCardData) => void;
  onOpenValuationModal?: () => void;
  onOpenBrandInquiryModal?: (pkg?: CollaborationPackageItem | null, card?: ProfileCardData) => void;
  onOpenMediaKitModal?: () => void;
  onOpenMusicBookingModal?: (card: ProfileCardData) => void;
  onOpenPodcastSponsorModal?: (card: ProfileCardData) => void;

  onClick?: () => void;
  onLinkClick?: (e: React.MouseEvent) => void;
  onMissingPhone?: () => void;
  interactive?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = (props) => {
  const {
    id,
    title,
    subtitle,
    linkUrl,
    color,
    logoSrc,
    badgeText,
    expanded = false,
    templateType = 'standard',
    buttonStyle = 'rounded',
    realEstate,
    showingBooking,
    homeValuation,
    clientReview,
    creatorWork,
    creatorStats,
    featuredWork,
    creatorPackages,
    brandInquiry,
    recommendation,
    mediaKit,
    coaching,
    music,
    podcast,
    tipSupport,
    videoMedia,
    liveTour,
    isPremium,
    businessPhone,
    customWhatsappPhone,
    onOpenShowingModal,
    onOpenValuationModal,
    onOpenBrandInquiryModal,
    onOpenMediaKitModal,
    onOpenMusicBookingModal,
    onOpenPodcastSponsorModal,
    onClick,
    onLinkClick,
    onMissingPhone,
  } = props;

  const toast = useToast();
  const radiusClass = getCardRadiusClass(buttonStyle);

  const isWhatsAppLink = Boolean(
    (linkUrl &&
      (linkUrl.includes('wa.me') ||
        linkUrl.includes('whatsapp.com') ||
        linkUrl.startsWith('whatsapp:'))) ||
      customWhatsappPhone ||
      (templateType === 'real_estate' && !showingBooking) ||
      templateType === 'coaching_institute'
  );

  // Construct card object for WhatsApp intent generation and modal dispatch
  const cardData: ProfileCardData = {
    id: id || 'card',
    title,
    subtitle,
    linkUrl,
    color,
    logoSrc,
    badgeText,
    expanded,
    templateType: (templateType as CardTemplateType) || 'standard',
    realEstate,
    showingBooking,
    homeValuation,
    clientReview,
    creatorWork,
    creatorStats,
    featuredWork,
    creatorPackages,
    brandInquiry,
    recommendation,
    mediaKit,
    coaching,
    music,
    podcast,
    tipSupport,
    videoMedia,
    liveTour,
    isPremium,
    customWhatsappPhone,
  };

  const handleOpenLead = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Ensure click analytics is recorded for any lead or modal interaction
    if (onLinkClick) {
      onLinkClick(e);
    } else if (onClick) {
      onClick();
    }

    // Trigger specialized modals if applicable
    if (templateType === 'showing_booking' && onOpenShowingModal) {
      onOpenShowingModal(cardData);
      return;
    }
    if (templateType === 'home_valuation' && onOpenValuationModal) {
      onOpenValuationModal();
      return;
    }
    if (templateType === 'brand_inquiry' && onOpenBrandInquiryModal) {
      onOpenBrandInquiryModal(null, cardData);
      return;
    }
    if (templateType === 'media_kit' && onOpenMediaKitModal) {
      onOpenMediaKitModal();
      return;
    }
    if (
      (templateType === 'music_booking_inquiry' || templateType === 'music_book_me') &&
      onOpenMusicBookingModal
    ) {
      onOpenMusicBookingModal(cardData);
      return;
    }
    if (
      (templateType === 'podcast_sponsor_inquiry' || templateType === 'podcast_sponsor_me') &&
      onOpenPodcastSponsorModal
    ) {
      onOpenPodcastSponsorModal(cardData);
      return;
    }

    if (onLinkClick || onClick) {
      return;
    }

    // Dynamic WhatsApp intent generation
    const intent = generateWhatsAppIntentUrl(cardData, businessPhone);

    if (!intent.hasPhone) {
      if (linkUrl && linkUrl !== '#' && linkUrl !== 'https://' && linkUrl !== 'http://') {
        const opened = safeOpenUrl(linkUrl);
        if (opened) return;
      }
      if (onMissingPhone) {
        onMissingPhone();
      } else {
        toast.warning(
          'WhatsApp business phone is not configured yet. Please configure your WhatsApp number in profile settings to receive leads directly.'
        );
      }
      return;
    }

    if (intent.url) {
      safeOpenUrl(intent.url);
    }
  };

  // Check for auto-detected video media
  const detectedVideo = detectVideoMedia(linkUrl || videoMedia?.videoUrl);
  let resolvedTemplateType = templateType;
  if (
    detectedVideo.isVideo &&
    templateType === 'standard' &&
    !isWhatsAppLink
  ) {
    resolvedTemplateType = 'video_spotlight';
  }

  return (
    <>
      {renderRegisteredCard({
        props: { ...props, templateType: resolvedTemplateType },
        cardData,
        radiusClass,
        isWhatsAppLink,
        handleOpenLead,
      })}
    </>
  );
};
