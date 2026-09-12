export type CardColor = 'purple' | 'orange' | 'yellow' | 'green' | 'dark';

export type CardTemplateType =
  | 'standard'
  | 'real_estate'
  | 'coaching_institute'
  | 'youtube'
  | 'spotify'
  | 'instagram'
  | 'tiktok'
  | 'product'
  | 'email'
  | 'phone';

export interface RealEstateMetadata {
  propertyName?: string;
  location?: string; // e.g., "Whitefield, Bengaluru"
  priceBracket?: string; // e.g., "₹75L - 1.2Cr"
  propertyType?: string; // e.g., "3 BHK Apartment / Villa"
}

export interface CoachingMetadata {
  courseName?: string;
  examTrack?: string; // e.g., "JEE / NEET / Spoken English"
  batchTiming?: string; // e.g., "Morning / Evening"
  feeStructure?: string; // e.g., "₹45,000 / year"
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
  badgeText?: string; // e.g. "NEW", "WATCH", "READ", "HOT", "FREE", "SHOP", "FOR SALE", "ADMISSION OPEN"
  expanded?: boolean;
  isActive?: boolean;
  clicks?: number;
  position?: number;
  templateType?: CardTemplateType;
  realEstate?: RealEstateMetadata;
  coaching?: CoachingMetadata;
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

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  name: string;
  headline: string;
  avatarUrl: string;
  businessPhone?: string; // Dedicated WhatsApp lead phone number, e.g. "919876543210"
  theme?: CanvasTheme;
  buttonStyle?: 'rounded' | 'square' | 'pill' | 'glass';
  buttonColor?: string;
  fontFamily?: string;
  backgroundType?: 'color' | 'gradient' | 'image';
  backgroundValue?: string;
  isPublished?: boolean;
  plan?: 'free' | 'pro' | 'business';
  socials?: SocialLinks;
  sections?: DbSection[];
  cards: ProfileCardData[];
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
