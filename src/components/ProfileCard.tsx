import React, { useState } from 'react';
import { HugeIcon } from './HugeIcon';
import {
  ArrowUpRight01Icon,
  Location01Icon,
  Calendar03Icon,
  Message01Icon,
  PlayIcon,
  Download01Icon,
  Copy01Icon,
  Tick01Icon,
  StarIcon,
  CalculatorIcon,
  Book02Icon,
  Clock01Icon,
  CreditCardIcon,
  GalleryThumbnailsIcon,
} from '@hugeicons/core-free-icons';
import {
  CardColor,
  CardTemplateType,
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
  ProfileCardData,
  CollaborationPackageItem,
} from '../types';
import { UI_KIT } from '../lib/ui-kit';
import { generateWhatsAppIntentUrl } from '../lib/whatsapp';
import {
  SmartMusicCard,
  MusicLatestReleaseCard,
  MusicStreamingHubCard,
  MusicBookMeCard,
  MusicUpcomingShowsCard,
  MusicPlayerCard,
  MusicMerchCard,
  MusicPressKitCard,
  MusicBookingInquiryCard,
} from './cards/MusicianCards';
import {
  PodcastSponsorMeCard,
  PodcastLatestEpisodeCard,
  PodcastListenOnCard,
  PodcastWatchOnYouTubeCard,
  PodcastArchiveCard,
  PodcastNewsletterCard,
  PodcastStatsCard,
  PodcastSponsorInquiryCard,
} from './cards/PodcasterCards';

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
  isPremium?: boolean;
  businessPhone?: string;
  customWhatsappPhone?: string;

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

export const COLOR_CONFIG = UI_KIT.cardPalettes;

export const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  title,
  subtitle,
  linkUrl,
  color,
  logoSrc,
  badgeText,
  expanded = false,
  templateType = 'standard',
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
  interactive = true,
}) => {
  const theme = UI_KIT.cardPalettes[color] || UI_KIT.cardPalettes.purple;
  const [copiedCode, setCopiedCode] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Construct card object for WhatsApp intent generation
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
    isPremium,
    customWhatsappPhone,
  };

  const handleOpenLead = (e: React.MouseEvent) => {
    e.stopPropagation();

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
    if ((templateType === 'music_booking_inquiry' || templateType === 'music_book_me') && onOpenMusicBookingModal) {
      onOpenMusicBookingModal(cardData);
      return;
    }
    if ((templateType === 'podcast_sponsor_inquiry' || templateType === 'podcast_sponsor_me') && onOpenPodcastSponsorModal) {
      onOpenPodcastSponsorModal(cardData);
      return;
    }

    if (onLinkClick) {
      onLinkClick(e);
      return;
    }

    if (onClick) {
      onClick();
      return;
    }

    // Dynamic WhatsApp intent generation
    const intent = generateWhatsAppIntentUrl(cardData, businessPhone);

    if (!intent.hasPhone) {
      if (linkUrl && linkUrl !== 'https://' && linkUrl !== '#') {
        window.open(linkUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      if (onMissingPhone) {
        onMissingPhone();
      } else {
        alert(
          'WhatsApp business phone is not configured yet. Please configure your WhatsApp number in profile settings to receive leads directly.'
        );
      }
      return;
    }

    if (intent.url) {
      window.open(intent.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // -------------------------------------------------------------
  // 1. REAL ESTATE PROPERTY CARD
  // -------------------------------------------------------------
  if (templateType === 'real_estate') {
    const propertyPrice = realEstate?.price || realEstate?.priceBracket || '$749,000';
    const propertyLoc = realEstate?.location || 'Austin, TX';
    const propertyTypeStr = realEstate?.propertyType || '3 Bed • 2 Bath • 1,850 sq ft';
    const statusTag = realEstate?.statusTag || 'just_listed';
    const firstImage = (realEstate?.images && realEstate.images[0]) || logoSrc || '';
    const imgSrc = firstImage && firstImage.trim() !== ''
      ? firstImage
      : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80';

    return (
      <div
        id={id}
        className={`w-full max-w-full overflow-hidden bg-white text-stone-900 rounded-[24px] border border-stone-200/90 shadow-sm transition-all duration-200 select-none ${
          interactive ? 'hover:shadow-md hover:-translate-y-0.5' : ''
        }`}
      >
        {/* Photo Banner with Badges */}
        <div className="relative w-full h-44 sm:h-52 bg-stone-100 overflow-hidden">
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Top Status & Price Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md border border-white/20">
              {statusTag === 'open_house' ? '📍 Open House' : statusTag === 'price_drop' ? '🏷️ Price Drop' : '🔥 Just Listed'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold bg-emerald-600 text-white shadow-md">
              {propertyPrice}
            </span>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="text-base sm:text-lg font-bold tracking-tight line-clamp-1">{title}</h3>
            <p className="text-xs text-stone-200 flex items-center gap-1 mt-0.5">
              <HugeIcon icon={Location01Icon} size={14} className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {propertyLoc}
            </p>
          </div>
        </div>

        {/* Specs & Action Row */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs sm:text-sm text-stone-600 font-medium pb-2 border-b border-stone-100">
            <span>{propertyTypeStr}</span>
            {realEstate?.featuredAmenity && (
              <span className="text-stone-500 text-[11px] truncate max-w-[140px]">{realEstate.featuredAmenity}</span>
            )}
          </div>

          {subtitle && (
            <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{subtitle}</p>
          )}

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenShowingModal) {
                  onOpenShowingModal(cardData);
                } else {
                  handleOpenLead(e);
                }
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95"
            >
              <HugeIcon icon={Calendar03Icon} size={14} className="w-3.5 h-3.5" />
              Book Showing
            </button>

            <button
              type="button"
              onClick={handleOpenLead}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-all active:scale-95"
            >
              <HugeIcon icon={Message01Icon} size={14} className="w-3.5 h-3.5 text-[#25D366]" />
              WhatsApp Agent
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. CREATOR STATS / MEDIA KIT METRICS CARD
  // -------------------------------------------------------------
  if (templateType === 'creator_stats') {
    const ig = creatorStats?.instagramFollowers || '82K';
    const eng = creatorStats?.engagementRate || '4.8%';
    const reach = creatorStats?.monthlyReach || '1.2M';
    const niche = creatorStats?.primaryNiche || 'Tech & Lifestyle';

    return (
      <div
        id={id}
        onClick={(e) => {
          if (onOpenMediaKitModal) onOpenMediaKitModal();
          else handleOpenLead(e);
        }}
        className={`w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xs transition-all duration-200 select-none ${
          interactive ? 'cursor-pointer hover:border-white/20' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
              <HugeIcon icon={StarIcon} size={16} className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">{title || 'Creator Metrics & Reach'}</h3>
              <p className="text-[11px] text-stone-400">{niche} • Verified Audience</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-stone-200 border border-white/15">
            📊 Media Kit
          </span>
        </div>

        {/* 3-Metric Stats Bento Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 py-2 text-center">
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#181B1E] border border-white/5">
            <span className="text-base sm:text-xl font-black text-white block">{ig}</span>
            <span className="text-[10px] sm:text-xs text-stone-400 font-medium">Followers</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-[#181B1E] border border-white/5">
            <span className="text-base sm:text-xl font-black text-emerald-400 block">{eng}</span>
            <span className="text-[10px] sm:text-xs text-stone-400 font-medium">Avg Eng.</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-[#181B1E] border border-white/5">
            <span className="text-base sm:text-xl font-black text-amber-300 block">{reach}</span>
            <span className="text-[10px] sm:text-xs text-stone-400 font-medium">Mo. Reach</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
          <span>{creatorStats?.primaryDemographics || '74% Age 18-34 • High Purchasing Power'}</span>
          <span className="font-semibold text-white inline-flex items-center gap-1">
            View Kit <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. FEATURED WORK / CAMPAIGN SPOTLIGHT (Card 8 in Reference Image)
  // -------------------------------------------------------------
  if (templateType === 'featured_work') {
    const metric = featuredWork?.resultsMetric || 'Learn in ontlow';

    return (
      <div
        id={id}
        onClick={handleOpenLead}
        className={`w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 space-y-2.5 shadow-2xs transition-all duration-200 select-none ${
          interactive ? 'cursor-pointer hover:border-white/20' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20">
            {badgeText || '⚡ LOAD AWARNES'}
          </span>
          <button type="button" className="text-stone-400 hover:text-white p-1 flex items-center gap-0.5">
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
            <span className="w-1 h-1 rounded-full bg-current" />
          </button>
        </div>

        <div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
          <span className="text-stone-400 text-[11px] font-medium truncate">
            {metric}
          </span>
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-100 text-[#1C1E22] text-xs font-semibold transition-colors shrink-0 shadow-2xs"
          >
            Learn More
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. COLLABORATION PACKAGES / RATE CARD
  // -------------------------------------------------------------
  if (templateType === 'creator_packages') {
    const packages = creatorPackages?.packages || [
      { id: '1', name: 'UGC Video', deliverables: '1x 45s High-Converting UGC Reel + Raw Hooks', price: '₹8,000 ($100)', turnaround: '3 Days' },
      { id: '2', name: 'Dedicated Instagram Reel', deliverables: '1x Sponsored Reel + Grid Post + Link in Bio', price: '₹15,000 ($180)', turnaround: '4 Days', isPopular: true },
      { id: '3', name: 'Reel + Story Bundle', deliverables: '1x Dedicated Reel + 3x Stories with Link Sticker', price: '₹20,000 ($240)', turnaround: '5 Days' },
    ];

    return (
      <div
        id={id}
        className="w-full max-w-full overflow-hidden bg-white text-stone-900 rounded-[24px] border border-stone-200/90 p-4 sm:p-5 shadow-sm space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900">{title || '💰 Collaboration Packages'}</h3>
            <p className="text-xs text-stone-500">{subtitle || 'Transparent creator rates & instant booking'}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
            Rates
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`p-3 rounded-2xl border transition-all ${
                pkg.isPopular
                  ? 'border-purple-500/60 bg-purple-50/40 shadow-2xs'
                  : 'border-stone-200/80 bg-stone-50/40 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-stone-900">{pkg.name}</span>
                    {pkg.isPopular && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-purple-600 text-white">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">{pkg.deliverables}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-sm sm:text-base text-purple-950 block">{pkg.price}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenBrandInquiryModal) onOpenBrandInquiryModal(pkg, cardData);
                      else handleOpenLead(e);
                    }}
                    className="mt-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold transition-all active:scale-95 shadow-2xs"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. WORK WITH ME CARD
  // -------------------------------------------------------------
  if (templateType === 'work_with_me') {
    const status = creatorWork?.availabilityStatus || '🔥 Available for UGC / Sponsorships / Reels';
    const deliverables = creatorWork?.deliverables || ['UGC Videos', 'Reels', 'Brand Ambassadorship', 'Product Demos'];
    const turnaround = creatorWork?.turnaroundTime || '3 - 5 Days Turnaround';

    return (
      <div
        id={id}
        onClick={(e) => {
          if (onOpenBrandInquiryModal) onOpenBrandInquiryModal(null, cardData);
          else handleOpenLead(e);
        }}
        className={`w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xs transition-all duration-200 select-none ${
          interactive ? 'cursor-pointer hover:border-white/20' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">{status}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-stone-300">
            {turnaround}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">{title || 'Work With Me'}</h3>
        <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{subtitle || creatorWork?.pitchText || 'High-converting video creative tailored for your brand growth.'}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {deliverables.map((item, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[#181B1E] text-stone-200 border border-white/5">
              {item}
            </span>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
          <span>Inquire within 24hr response</span>
          <span className="font-bold text-white inline-flex items-center gap-1">
            Let's Collaborate <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 6. AFFILIATE RECOMMENDATION / PRODUCT CARD
  // -------------------------------------------------------------
  if (templateType === 'recommendation') {
    const product = recommendation?.productName || title;
    const brand = recommendation?.brandName || subtitle || 'Recommended Gear';
    const price = recommendation?.price || '$149';
    const code = recommendation?.discountCode || '';
    const discountText = recommendation?.discountText || 'Special Discount';
    const rawImg = recommendation?.productImageUrl || logoSrc || '';
    const img = rawImg && rawImg.trim() !== ''
      ? rawImg
      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';

    return (
      <div
        id={id}
        className="w-full max-w-full overflow-hidden bg-white text-stone-900 rounded-[24px] border border-stone-200/90 p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={img}
            alt={product}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-stone-100 shrink-0 border border-stone-100"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">{brand}</span>
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{product}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-extrabold text-xs sm:text-sm text-stone-900">{price}</span>
              {code && (
                <button
                  type="button"
                  onClick={(e) => handleCopyCode(code, e)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 transition-colors"
                  title="Copy discount code"
                >
                  {copiedCode ? <HugeIcon icon={Tick01Icon} size={12} className="w-3 h-3 text-emerald-600" /> : <HugeIcon icon={Copy01Icon} size={12} className="w-3 h-3" />}
                  <span>{copiedCode ? 'COPIED!' : code}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenLead}
          className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shrink-0 active:scale-95 inline-flex items-center gap-1"
        >
          <span>Get Deal</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 7. CLIENT REVIEWS / TESTIMONIAL CARD
  // -------------------------------------------------------------
  if (templateType === 'client_reviews') {
    const rating = clientReview?.rating || 5;
    const reviewText = clientReview?.reviewText || subtitle || 'Ayush helped us find our dream home in Austin $50k under budget. Highly recommended!';
    const clientName = clientReview?.clientName || title || 'Sarah & Michael M.';
    const propertyInfo = clientReview?.clientTitleOrProperty || 'Buyer • 1204 Pine Street';

    return (
      <div
        id={id}
        className="w-full max-w-full overflow-hidden bg-stone-50 text-stone-900 rounded-[24px] border border-stone-200/80 p-4 sm:p-5 shadow-2xs space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: rating }).map((_, i) => (
              <HugeIcon key={i} icon={StarIcon} size={16} className="w-4 h-4 text-amber-500" />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            Verified Client
          </span>
        </div>

        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
          "{reviewText}"
        </p>

        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-stone-900 block">{clientName}</span>
            <span className="text-[11px] text-stone-500">{propertyInfo}</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 8. HOME VALUATION CMA CARD
  // -------------------------------------------------------------
  if (templateType === 'home_valuation') {
    return (
      <div
        id={id}
        onClick={(e) => {
          if (onOpenValuationModal) onOpenValuationModal();
          else handleOpenLead(e);
        }}
        className={`w-full max-w-full overflow-hidden bg-[#202428] text-white rounded-2xl border border-white/10 p-4 sm:p-5 shadow-2xs transition-all duration-200 select-none ${
          interactive ? 'cursor-pointer hover:border-white/20' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300">
            🏡 Seller Lead Tool
          </span>
          <HugeIcon icon={CalculatorIcon} size={16} className="w-4 h-4 text-amber-300" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{title || "What's Your Home Worth?"}</h3>
        <p className="text-xs text-amber-100/80 mt-1 leading-relaxed">{subtitle || 'Get a free, no-obligation Comparative Market Analysis (CMA) report for your neighborhood.'}</p>

        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-amber-200">
          <span>Instant MLS Comps</span>
          <span className="font-bold text-white inline-flex items-center gap-1">
            Get Free Report <HugeIcon icon={ArrowUpRight01Icon} size={16} className="w-4 h-4" />
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 9. MUSICIANS & ARTISTS PREMIUM CARDS
  // -------------------------------------------------------------
  if (templateType === 'music_smart_card') {
    return (
      <SmartMusicCard
        card={cardData}
        interactive={interactive}
        onLinkClick={onLinkClick}
      />
    );
  }

  if (templateType === 'music_latest_release') {
    return (
      <MusicLatestReleaseCard
        card={cardData}
        interactive={interactive}
        onLinkClick={onLinkClick}
      />
    );
  }

  if (templateType === 'music_streaming_hub') {
    return (
      <MusicStreamingHubCard
        card={cardData}
        interactive={interactive}
        onLinkClick={onLinkClick}
      />
    );
  }

  if (templateType === 'music_book_me') {
    return (
      <MusicBookMeCard
        card={cardData}
        interactive={interactive}
        onOpenMusicBookingModal={onOpenMusicBookingModal}
      />
    );
  }

  if (templateType === 'music_upcoming_shows') {
    return (
      <MusicUpcomingShowsCard
        card={cardData}
        interactive={interactive}
      />
    );
  }

  if (templateType === 'music_player') {
    return (
      <MusicPlayerCard
        card={cardData}
        interactive={interactive}
      />
    );
  }

  if (templateType === 'music_merch') {
    return (
      <MusicMerchCard
        card={cardData}
        interactive={interactive}
      />
    );
  }

  if (templateType === 'music_press_kit') {
    return (
      <MusicPressKitCard
        card={cardData}
        interactive={interactive}
      />
    );
  }

  if (templateType === 'music_booking_inquiry') {
    return (
      <MusicBookingInquiryCard
        card={cardData}
        interactive={interactive}
        onOpenMusicBookingModal={onOpenMusicBookingModal}
      />
    );
  }

  // -------------------------------------------------------------
  // 10. PODCASTERS PREMIUM CARDS
  // -------------------------------------------------------------
  if (templateType === 'podcast_sponsor_me') {
    return (
      <PodcastSponsorMeCard
        card={cardData}
        interactive={interactive}
        onOpenPodcastSponsorModal={onOpenPodcastSponsorModal}
      />
    );
  }

  if (templateType === 'podcast_latest_episode') {
    return (
      <PodcastLatestEpisodeCard
        card={cardData}
        interactive={interactive}
        onLinkClick={onLinkClick}
      />
    );
  }

  if (templateType === 'podcast_listen_on') {
    return (
      <PodcastListenOnCard
        card={cardData}
        interactive={interactive}
      />
    );
  }

  if (templateType === 'podcast_youtube') {
    return (
      <PodcastWatchOnYouTubeCard
        card={cardData}
        interactive={interactive}
      />
    );
  }

  if (templateType === 'podcast_archive') {
    return (
      <PodcastArchiveCard
        card={cardData}
        interactive={interactive}
      />
    );
  }

  if (templateType === 'podcast_newsletter') {
    return (
      <PodcastNewsletterCard
        card={cardData}
        interactive={interactive}
      />
    );
  }

  if (templateType === 'podcast_stats') {
    return (
      <PodcastStatsCard
        card={cardData}
        interactive={interactive}
      />
    );
  }

  if (templateType === 'podcast_sponsor_inquiry') {
    return (
      <PodcastSponsorInquiryCard
        card={cardData}
        interactive={interactive}
        onOpenPodcastSponsorModal={onOpenPodcastSponsorModal}
      />
    );
  }

  // -------------------------------------------------------------
  // 11. EXPANDED / FEATURED CARD
  // -------------------------------------------------------------
  if (expanded) {
    const isCoaching = templateType === 'coaching_institute' && coaching;

    return (
      <div
        id={id}
        onClick={handleOpenLead}
        className={`w-full max-w-full overflow-hidden ${theme.bgClass} ${theme.textClass} rounded-2xl p-4 sm:p-5 transition-all duration-200 select-none shadow-2xs ${
          interactive ? 'cursor-pointer hover:shadow-xs active:scale-[0.99]' : ''
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
              {logoSrc && logoSrc.trim() !== '' && !logoError ? (
                <img
                  src={logoSrc}
                  alt=""
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              ) : isCoaching ? (
                <HugeIcon icon={Book02Icon} size={18} className="w-4 h-4 text-[#191A1E]" />
              ) : (
                <HugeIcon icon={GalleryThumbnailsIcon} size={16} className="text-[#191A1E]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm sm:text-base font-bold tracking-tight truncate block">
                {title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {badgeText && (
              <span
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] font-bold tracking-wide uppercase whitespace-nowrap ${theme.badgeBgClass}`}
              >
                {badgeText}
              </span>
            )}
            <div
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors shrink-0 ${theme.arrowBtnClass}`}
              title="Connect"
            >
              <span className="text-xs font-bold whitespace-nowrap">Connect</span>
              <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Coaching Institute Badges */}
        {isCoaching && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
            {coaching.examTrack && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${theme.badgeBgClass} ${theme.badgeBorderClass}`}>
                <HugeIcon icon={Book02Icon} size={12} className="w-3 h-3 shrink-0" />
                <span className="truncate">{coaching.examTrack}</span>
              </span>
            )}
            {coaching.batchTiming && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${theme.badgeBgClass} ${theme.badgeBorderClass}`}>
                <HugeIcon icon={Clock01Icon} size={12} className="w-3 h-3 shrink-0" />
                <span className="truncate">{coaching.batchTiming}</span>
              </span>
            )}
            {coaching.feeStructure && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-white text-[#191A1E] shadow-2xs">
                <HugeIcon icon={CreditCardIcon} size={12} className="w-3 h-3 shrink-0 text-[#5E4BF7]" />
                <span className="truncate">{coaching.feeStructure}</span>
              </span>
            )}
          </div>
        )}

        {subtitle && (
          <p className={`text-xs sm:text-sm md:text-base font-medium leading-snug break-words line-clamp-3 ${theme.subtextClass}`}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 10. STANDARD COMPACT CARD
  // -------------------------------------------------------------
  return (
    <div
      id={id}
      onClick={handleOpenLead}
      className={`w-full max-w-full overflow-hidden ${theme.bgClass} ${theme.textClass} rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5 transition-all duration-150 select-none flex items-center justify-between gap-3 shadow-2xs ${
        interactive ? 'cursor-pointer hover:opacity-95 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
          {logoSrc && logoSrc.trim() !== '' && !logoError ? (
            <img
              src={logoSrc}
              alt=""
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <HugeIcon icon={GalleryThumbnailsIcon} size={16} className={color === 'purple' ? 'text-[#584CE4]' : 'text-[#191A1E]'} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-xs sm:text-sm font-bold tracking-tight truncate leading-tight">
              {title}
            </h3>
          </div>

          {subtitle && (
            <p className={`text-[11px] truncate ${theme.subtextClass} font-normal mt-0.5`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {badgeText && (
          <span
            className={`hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase whitespace-nowrap ${theme.badgeBgClass}`}
          >
            {badgeText}
          </span>
        )}
        <div
          className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold transition-colors shrink-0 shadow-2xs ${theme.arrowBtnClass}`}
          title="Connect"
        >
          <span>Connect</span>
          <HugeIcon icon={ArrowUpRight01Icon} size={13} className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};


