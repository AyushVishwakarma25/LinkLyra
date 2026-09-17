export type CardColor = 'purple' | 'orange' | 'yellow' | 'green' | 'dark';

export type CardTemplateType =
  | 'standard'
  | 'real_estate'
  | 'showing_booking'
  | 'home_valuation'
  | 'open_house'
  | 'client_reviews'
  | 'work_with_me'
  | 'creator_stats'
  | 'featured_work'
  | 'creator_packages'
  | 'brand_inquiry'
  | 'media_kit'
  | 'recommendation'
  | 'coaching_institute'
  | 'youtube'
  | 'spotify'
  | 'instagram'
  | 'tiktok'
  | 'product'
  | 'email'
  | 'phone'
  // Musicians & Artists Premium Templates
  | 'music_latest_release'
  | 'music_streaming_hub'
  | 'music_book_me'
  | 'music_upcoming_shows'
  | 'music_player'
  | 'music_merch'
  | 'music_press_kit'
  | 'music_booking_inquiry'
  | 'music_smart_card'
  // Podcasters Premium Templates
  | 'podcast_latest_episode'
  | 'podcast_listen_on'
  | 'podcast_youtube'
  | 'podcast_archive'
  | 'podcast_newsletter'
  | 'podcast_sponsor_inquiry'
  | 'podcast_stats'
  | 'podcast_sponsor_me';

// -------------------------------------------------------------
// Real Estate Specialized Metadata
// -------------------------------------------------------------
export type RealEstateStatusTag =
  | 'just_listed'
  | 'open_house'
  | 'price_drop'
  | 'exclusive'
  | 'under_contract'
  | 'sold';

export interface RealEstateMetadata {
  propertyName?: string;
  location?: string; // e.g., "Austin, TX" or "Whitefield, Bengaluru"
  price?: string; // e.g., "$749,000" or "₹1.85 Cr"
  priceBracket?: string; // Backward compatibility alias
  propertyType?: string; // e.g., "3 Bed • 2 Bath • 1,850 sq ft" or "Single Family Home"
  bedrooms?: number | string; // e.g. 3
  bathrooms?: number | string; // e.g. 2
  sqft?: string | number; // e.g. "1,850 sq ft"
  statusTag?: RealEstateStatusTag;
  openHouseDate?: string; // e.g., "Sunday, Oct 12"
  openHouseTime?: string; // e.g., "2:00 PM - 4:00 PM"
  mlsLink?: string; // e.g. "https://mls.com/listing/12345"
  virtualTourUrl?: string;
  images?: string[]; // Multiple photo gallery
  brochureUrl?: string;
  featuredAmenity?: string; // e.g. "Pool & Spa • Solar Powered"
}

export interface ShowingBookingMetadata {
  propertyTitle?: string;
  availableDays?: string; // e.g. "Mon-Sat"
  availableSlots?: string[]; // e.g. ["10:00 AM - 12:00 PM", "1:00 PM - 3:00 PM", "4:00 PM - 6:00 PM"]
  requirePreApproval?: boolean;
}

export interface HomeValuationMetadata {
  headline?: string;
  subheadline?: string;
  serviceAreas?: string[]; // e.g. ["Austin", "Westlake", "Cedar Park"]
}

export interface ClientReviewMetadata {
  rating?: number; // 1 to 5
  reviewText?: string;
  clientName?: string;
  clientTitleOrProperty?: string; // e.g. "Buyer • 1204 Pine St (Sold $50k over asking)"
  avatarUrl?: string;
  verifiedDeal?: boolean;
}

// -------------------------------------------------------------
// Content Creator Specialized Metadata
// -------------------------------------------------------------
export interface CreatorWorkMetadata {
  availabilityStatus?: string; // e.g., "Available for UGC / Sponsorships / Reels"
  deliverables?: string[]; // e.g., ["UGC Videos", "Sponsored Reels", "Product Reviews", "Story Bundles", "Brand Ambassadorship"]
  turnaroundTime?: string; // e.g., "3 - 5 Days"
  pitchText?: string; // e.g., "Helping tech & lifestyle brands scale with authentic high-conversion video hooks."
}

export interface CreatorStatsMetadata {
  instagramFollowers?: string; // e.g. "82K"
  youtubeSubscribers?: string; // e.g. "140K"
  tiktokFollowers?: string; // e.g. "210K"
  engagementRate?: string; // e.g. "4.8%"
  monthlyReach?: string; // e.g. "1.2M"
  primaryNiche?: string; // e.g. "Tech & Productivity"
  primaryDemographics?: string; // e.g. "72% Age 18-34 (US & IN)"
  verifiedBadge?: boolean;
}

export interface FeaturedWorkItem {
  id?: string;
  title: string; // e.g. "Notion App Workflow Review"
  brandName: string; // e.g. "Notion"
  brandLogoUrl?: string;
  videoUrl?: string; // YouTube / Reel URL
  thumbnailUrl?: string;
  resultsMetric?: string; // e.g. "🔥 340K Views • 12.4% CTR"
  clientTestimonial?: string; // e.g. "Ayush delivered top-performing creative in our Q2 campaign."
}

export interface CollaborationPackageItem {
  id: string;
  name: string; // e.g. "UGC Video Package"
  deliverables: string; // e.g. "1x 45s High-Hook UGC Video + Raw Footage"
  price: string; // e.g. "₹8,000" or "$100"
  turnaround: string; // e.g. "3 business days"
  isPopular?: boolean;
}

export interface CreatorPackagesMetadata {
  headline?: string;
  packages: CollaborationPackageItem[];
}

export interface BrandInquiryMetadata {
  headline?: string;
  subheadline?: string;
  acceptedCampaignTypes?: string[];
  budgetRanges?: string[];
}

export interface AffiliateRecommendationMetadata {
  productName: string; // e.g. "Sony WH-1000XM5 Headphones"
  brandName: string; // e.g. "Sony"
  price?: string; // e.g. "$348" or "₹26,990"
  discountCode?: string; // e.g. "AYUSH20"
  discountText?: string; // e.g. "20% OFF at Checkout"
  productImageUrl?: string;
  affiliateUrl: string;
}

export interface MediaKitMetadata {
  title?: string;
  description?: string;
  oneSheetPdfUrl?: string;
  lastUpdated?: string;
}

// -------------------------------------------------------------
// Coaching Specialized Metadata
// -------------------------------------------------------------
export interface CoachingMetadata {
  courseName?: string;
  examTrack?: string; // e.g., "JEE / NEET / Spoken English"
  batchTiming?: string; // e.g., "Morning / Evening"
  feeStructure?: string; // e.g., "₹45,000 / year"
}

// -------------------------------------------------------------
// Musicians & Artists Specialized Metadata
// -------------------------------------------------------------
export interface TourDateItem {
  id?: string;
  date: string; // e.g. "Nov 18, 2026"
  city: string; // e.g. "Austin, TX"
  venue: string; // e.g. "Moody Amphitheater"
  ticketUrl?: string;
  soldOut?: boolean;
}

export interface MerchItem {
  id?: string;
  name: string; // e.g. "Limited Tour Vinyl"
  price: string; // e.g. "$35.00" or "₹1,499"
  imageUrl?: string;
  buyUrl?: string;
}

export interface MusicMetadata {
  releaseTitle?: string;
  artistName?: string;
  releaseType?: 'Single' | 'EP' | 'Album' | 'Remix';
  releaseDate?: string;
  coverArtUrl?: string;
  audioPreviewUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  amazonMusicUrl?: string;
  tourDates?: TourDateItem[];
  merchItems?: MerchItem[];
  epkBio?: string;
  epkDownloadUrl?: string;
  bookingRate?: string;
  preferredPlatformDefault?: 'spotify' | 'apple' | 'youtube' | 'amazon';
  genres?: string[];
  trackDuration?: string;
  smartAudioSnippetUrl?: string;
}

// -------------------------------------------------------------
// Podcasters Specialized Metadata
// -------------------------------------------------------------
export interface PodcastEpisodeItem {
  id?: string;
  episodeNumber?: string; // e.g. "EP 48"
  title: string;
  duration?: string; // e.g. "45m"
  releaseDate?: string;
  listenUrl?: string;
}

export interface PodcastMetadata {
  episodeTitle?: string;
  episodeNumber?: string;
  duration?: string;
  releaseDate?: string;
  audioUrl?: string;
  videoUrl?: string;
  applePodcastsUrl?: string;
  spotifyPodcastsUrl?: string;
  youtubeChannelUrl?: string;
  overcastUrl?: string;
  amazonMusicUrl?: string;
  pocketCastsUrl?: string;
  rssFeedUrl?: string;
  // Killer Card "Sponsor Me" fields:
  monthlyDownloads?: string; // e.g. "450K+"
  audienceSize?: string; // e.g. "120K Subscribers"
  listenerDemographics?: string; // e.g. "74% 21-38 Tech, Founders & Creatives"
  pastSponsors?: string[]; // e.g. ["Notion", "Linear", "Vercel", "Athletic Greens"]
  mediaKitUrl?: string;
  cpmRate?: string; // e.g. "$45 CPM / ₹35,000 per slot"
  sponsorPitch?: string;
  newsletterHeadline?: string;
  newsletterPitch?: string;
  chartRank?: string; // e.g. "#4 in Technology & Startups"
  episodesArchive?: PodcastEpisodeItem[];
}

export interface SocialLinks {
  whatsapp?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
  linkedin?: string;
  email?: string;
  website?: string;
  spotify?: string;
  discord?: string;
  tiktok?: string;
}

export interface DbSection {
  id: string;
  page_id?: string;
  title: string;
  position: number;
  is_visible: boolean;
}

export interface ProfileCardData {
  id: string;
  pageId?: string;
  sectionId?: string | null;
  title: string;
  subtitle?: string;
  linkUrl: string;
  color: CardColor;
  logoSrc?: string;
  badgeText?: string; // e.g. "NEW", "HOT", "FOR SALE", "JUST LISTED", "HIRE ME"
  expanded?: boolean;
  isActive?: boolean;
  clicks?: number;
  position?: number;
  templateType?: CardTemplateType;
  
  // Specialized domain metadata
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
  customWhatsappPhone?: string; // Optional card-level WhatsApp phone override
}

export type CanvasTheme =
  | 'warm'
  | 'cream'
  | 'light'
  | 'dark'
  | 'clay'
  | 'minimal'
  | 'glass'
  | 'creator'
  | 'business'
  | 'portfolio';

export type PageArchetype =
  | 'standard'
  | 'hire_me_creator'
  | 'realtor_showcase'
  | 'musician'
  | 'podcaster'
  | 'coaching';

export interface UserAccountSettings {
  emailNotifications: {
    newLeads: boolean;
    weeklyDigest: boolean;
    productUpdates: boolean;
    billingAlerts: boolean;
  };
  whatsappNotifications: {
    newLeads: boolean;
  };
  preferences: {
    timezone: string;
    currency: 'INR' | 'USD';
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    dashboardTheme: 'light' | 'dark' | 'system';
  };
  privacy: {
    searchEngineIndexing: boolean;
    cookieConsentBanner: boolean;
    hideBranding: boolean;
    customDomain?: string;
  };
}

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  name: string;
  headline: string;
  avatarUrl: string;
  businessPhone?: string; // Dedicated WhatsApp lead phone number, e.g. "919876543210"
  theme?: CanvasTheme;
  pageArchetype?: PageArchetype; // 'standard' | 'hire_me_creator' | 'realtor_showcase' | 'musician' | 'podcaster'
  hireMeMode?: boolean; // When true, enables Creator Sales Page mode
  hasCompletedOnboarding?: boolean;
  realtorLicenseNo?: string; // e.g. "TREC #0742918" or "RERA Reg. A51800021"
  realtorBrokerage?: string; // e.g. "Compass Real Estate" or "Luxury Sotheby's"
  buttonStyle?: 'rounded' | 'square' | 'pill' | 'glass';
  buttonColor?: string;
  fontFamily?: string;
  backgroundType?: 'color' | 'gradient' | 'image';
  backgroundValue?: string;
  isPublished?: boolean;
  plan?: 'free' | 'pro' | 'business' | 'agency';
  socials?: SocialLinks;
  sections?: DbSection[];
  cards: ProfileCardData[];
  customDomain?: string;
  accountSettings?: UserAccountSettings;
  onboardingProfile?: OnboardingProfile;
}

// -------------------------------------------------------------
// Lead & CRM Entities (Saved in Firestore)
// -------------------------------------------------------------
export type LeadType =
  | 'showing_request'
  | 'brand_inquiry'
  | 'home_valuation'
  | 'general_contact'
  | 'media_kit_download'
  | 'package_booking'
  | 'music_booking'
  | 'podcast_sponsorship';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export interface LeadRecord {
  id: string;
  pageId: string;
  type: LeadType;
  name: string;
  email: string;
  phone?: string;
  companyOrBrand?: string;
  campaignType?: string;
  budgetOrPrice?: string;
  timelineOrDate?: string;
  details?: string;
  propertyTitle?: string;
  buyerStatus?: string; // e.g. "Pre-Approved", "Cash Buyer"
  propertyAddress?: string;
  propertyCondition?: string;
  selectedPackageName?: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
}

// -------------------------------------------------------------
// Specialized Telemetry & Analytics
// -------------------------------------------------------------
export interface SpecializedAnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  overallCtr: number;
  // Real Estate Metrics
  propertyViews: number;
  listingClicks: number;
  showingRequests: number;
  homeValuations: number;
  // Creator Metrics
  brandInquiries: number;
  mediaKitDownloads: number;
  packageClicks: number;
  estimatedPipelineValueINR: number;
}

// -------------------------------------------------------------
// Database MVP Entities
// -------------------------------------------------------------

export interface DbPage {
  id: string;
  user_id: string;
  username: string;
  title: string;
  bio: string;
  profile_image: string;
  is_published: boolean;
  theme_id?: string;
  background_type?: 'color' | 'gradient' | 'image';
  background_value?: string;
  font_family?: string;
  text_color?: string;
  button_style?: 'rounded' | 'square' | 'pill' | 'glass';
  button_color?: string;
  page_archetype?: PageArchetype;
  hire_me_mode?: boolean;
  realtor_license_no?: string;
  realtor_brokerage?: string;
  created_at: string;
  updated_at: string;
}

export interface DbSocialLink {
  id: string;
  page_id: string;
  platform: string;
  username?: string;
  url: string;
  position: number;
  is_visible: boolean;
}

export interface DbPageSettings {
  id: string;
  page_id: string;
  theme_id: string;
  background_type: 'color' | 'gradient' | 'image';
  background_value: string;
  font_family: string;
  text_color: string;
  button_color: string;
  button_style: 'rounded' | 'square' | 'pill' | 'glass';
  button_radius: string;
  custom_css?: string;
}

export interface DbPageView {
  id: string;
  page_id: string;
  visitor_id?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  referrer?: string;
  created_at: string;
}

export interface DbLinkClick {
  id: string;
  link_id: string;
  page_id: string;
  visitor_id?: string;
  country?: string;
  device?: string;
  referrer?: string;
  created_at: string;
}

export interface DbSubscriber {
  id: string;
  page_id: string;
  email: string;
  created_at: string;
}

// -------------------------------------------------------------
// Razorpay & Subscription Billing Entities
// -------------------------------------------------------------

export type SubscriptionPlanType = 'free' | 'pro' | 'business' | 'agency';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due' | 'expired';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionRecord {
  id: string;
  userId: string;
  plan: SubscriptionPlanType;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: number; // in INR (₹) or USD ($)
  currency: string; // 'INR' | 'USD'
  startDate: string; // ISO String
  currentPeriodStart: string; // ISO String
  currentPeriodEnd: string; // Expiration/Renewal ISO String
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  razorpaySubscriptionId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  creditsMonthly?: number;
  creditsRemaining?: number;
  creditsUsed?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInvoiceRecord {
  id: string;
  userId: string;
  invoiceNumber: string;
  planName: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  status: 'captured' | 'refunded' | 'failed';
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  paymentMethod: string;
  paidAt: string;
  receiptUrl?: string;
  notes?: string;
}

export interface CreditTransactionRecord {
  id: string;
  userId: string;
  type: 'monthly_grant' | 'top_up' | 'ai_generation' | 'lead_export' | 'custom_domain' | 'bonus';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface PlanPricingConfig {
  plan: SubscriptionPlanType;
  name: string;
  badge?: string;
  description: string;
  priceMonthlyINR: number;
  priceYearlyINR: number; // billed annually
  priceMonthlyUSD: number;
  priceYearlyUSD: number;
  features: string[];
  isPopular?: boolean;
}

// -------------------------------------------------------------
// Onboarding System Strongly Typed Model
// -------------------------------------------------------------

export type OnboardingPrimaryRole =
  | 'creator'
  | 'real_estate'
  | 'coach'
  | 'freelancer'
  | 'designer'
  | 'consultant'
  | 'business'
  | 'agency'
  | 'other';

// Role-specific goals:
export type CreatorGoal =
  | 'brand_collaborations'
  | 'showcase_work'
  | 'media_kit'
  | 'ugc_clients'
  | 'affiliate_sales'
  | 'grow_audience';

export type RealEstateGoal =
  | 'property_enquiries'
  | 'schedule_showing'
  | 'seller_leads'
  | 'showcase_listings'
  | 'whatsapp_leads'
  | 'local_credibility';

export type CoachGoal =
  | 'student_enquiries'
  | 'promote_courses'
  | 'admissions'
  | 'consultations'
  | 'whatsapp_leads'
  | 'resources';

export type FreelancerGoal =
  | 'get_clients'
  | 'showcase_portfolio'
  | 'book_calls'
  | 'sell_services'
  | 'collect_enquiries';

export type DesignerGoal =
  | 'get_clients'
  | 'showcase_portfolio'
  | 'book_calls'
  | 'sell_services'
  | 'collect_enquiries';

export type ConsultantGoal =
  | 'book_discovery_calls'
  | 'client_advisory'
  | 'showcase_case_studies'
  | 'collect_inquiries'
  | 'lead_qualification';

export type BusinessGoal =
  | 'sell_products'
  | 'generate_leads'
  | 'whatsapp_sales'
  | 'website_visits'
  | 'showcase_products';

export type AgencyGoal =
  | 'retainer_clients'
  | 'portfolio_showcase'
  | 'schedule_audit'
  | 'inbound_rfp'
  | 'whatsapp_inquiries';

export type OtherGoal =
  | 'share_links'
  | 'grow_audience'
  | 'contact_me'
  | 'showcase_projects'
  | 'whatsapp_connect';

export type OnboardingGoal =
  | CreatorGoal
  | RealEstateGoal
  | CoachGoal
  | FreelancerGoal
  | DesignerGoal
  | ConsultantGoal
  | BusinessGoal
  | AgencyGoal
  | OtherGoal;

export type OnboardingLeadSource =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'twitter_x'
  | 'whatsapp'
  | 'google_search'
  | 'referrals'
  | 'offline_qr'
  | 'other';

export type OnboardingPrimaryCTA =
  | 'whatsapp_chat'
  | 'book_call'
  | 'schedule_showing'
  | 'view_portfolio'
  | 'view_listings'
  | 'send_inquiry'
  | 'buy_product'
  | 'join_cohort'
  | 'download_epk_or_kit'
  | 'custom_link';

export interface CreatorRoleData {
  primaryPlatform?: 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'linkedin' | 'other';
  niche?: string;
  followerCountEstimate?: string;
  mediaKitUrl?: string;
  collabRateStartingAt?: string;
}

export interface RealEstateRoleData {
  brokerage?: string;
  licenseNumber?: string;
  serviceAreas?: string[];
  primaryPropertyType?: 'residential' | 'luxury' | 'commercial' | 'plots' | 'rentals';
  avgListingPrice?: string;
}

export interface CoachRoleData {
  fieldOrSubject?: string;
  courseFormat?: 'cohort' | '1on1' | 'self_paced' | 'workshop';
  instituteOrBrand?: string;
  nextCohortDate?: string;
}

export interface FreelanceDesignerRoleData {
  specialty?: string;
  experienceYears?: string;
  portfolioUrl?: string;
  hourlyOrStartingRate?: string;
}

export interface BusinessRoleData {
  businessName?: string;
  industry?: string;
  websiteUrl?: string;
  storeType?: 'ecommerce' | 'physical_store' | 'services' | 'd2c';
}

export interface AgencyRoleData {
  agencyName?: string;
  coreServices?: string[];
  teamSize?: string;
  clientIndustries?: string[];
}

export interface ConsultantRoleData {
  advisoryFocus?: string;
  targetClientele?: string;
  bookingCalendarUrl?: string;
}

export type RoleDataMap = {
  creator: CreatorRoleData;
  real_estate: RealEstateRoleData;
  coach: CoachRoleData;
  freelancer: FreelanceDesignerRoleData;
  designer: FreelanceDesignerRoleData;
  consultant: ConsultantRoleData;
  business: BusinessRoleData;
  agency: AgencyRoleData;
  other: Record<string, any>;
};

export interface GeneratedCardConfig {
  id: string;
  title: string;
  subtitle?: string;
  linkUrl: string;
  color: CardColor;
  templateType: CardTemplateType;
  badgeText?: string;
  position: number;
  isActive: boolean;
  isPremium?: boolean;
  priorityWeight?: number;
  sourceGoal?: OnboardingGoal;
  sourceCTA?: OnboardingPrimaryCTA;
  // Domain metadata
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
  customWhatsappPhone?: string;
}

export interface OnboardingProfile {
  onboardingCompleted: boolean;
  onboardingVersion: number;
  fullName: string;
  username: string;
  profilePhoto?: string;
  bio?: string;
  country: string;
  whatsapp?: string;
  primaryRole: OnboardingPrimaryRole;
  goals: OnboardingGoal[];
  leadSources: OnboardingLeadSource[];
  primaryCTA: OnboardingPrimaryCTA;
  roleData: Record<string, any>;
  generatedCardSet: GeneratedCardConfig[];
  completedAt?: string | null;
}

