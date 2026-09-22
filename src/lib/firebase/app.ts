import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../../firebase-applet-config.json';
import {
  CardColor,
  CardTemplateType,
  SocialLinks,
  CanvasTheme,
  OnboardingProfile,
  CardStyleType,
  WallpaperMode,
  FooterSettings,
  RealEstateMetadata,
  CoachingMetadata,
  CreatorStatsMetadata,
  CreatorWorkMetadata,
  FeaturedWorkItem,
  CreatorPackagesMetadata,
  BrandInquiryMetadata,
  AffiliateRecommendationMetadata,
  ClientReviewMetadata,
  MusicMetadata,
  PodcastMetadata,
  UserAccountSettings,
} from '../../types';

// Structured Firestore Error Protocol
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const isOffline =
    errMessage.includes('offline') ||
    errMessage.includes('client is offline') ||
    errMessage.includes('Could not reach Cloud Firestore backend');

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  if (isOffline) {
    console.warn('Firestore offline notice (operating from cache):', JSON.stringify(errInfo));
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively strips undefined values from objects/arrays so Firestore doesn't reject them.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (
    typeof data === 'object' &&
    data !== null &&
    (data.constructor === Object || data.constructor === undefined)
  ) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// Silence SDK internal logging to prevent sandbox timeout warnings from polluting errors
setLogLevel('silent');

// Singleton Firebase Application & Service Initialization
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

function createFirestoreInstance() {
  const dbId = (!firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === '(default)')
    ? undefined
    : firebaseConfig.firestoreDatabaseId;

  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, dbId);
  } catch {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
}

export const db = createFirestoreInstance();
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// --------------------------------------------------------------------------
// Core Database Interfaces
// --------------------------------------------------------------------------
export interface FirestoreUser {
  displayName: string;
  email: string;
  photoURL: string;
  username: string;
  plan: 'free' | 'pro' | 'business' | 'agency';
  createdAt: unknown;
  updatedAt: unknown;
  accountSettings?: UserAccountSettings;
}

export interface FirestorePage {
  userId: string;
  username: string;
  title: string;
  bio: string;
  avatarUrl: string;
  isPublished: boolean;
  themeId: string;
  backgroundType: 'color' | 'gradient' | 'image';
  backgroundValue: string;
  fontFamily: string;
  textColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill' | 'smooth' | 'glass';
  buttonColor: string;
  cardStyle?: CardStyleType;
  wallpaperMode?: WallpaperMode;
  wallpaperTint?: number;
  cardBgColor?: string;
  cardTextColor?: string;
  stickers?: string[];
  footerSettings?: FooterSettings;
  businessPhone?: string;
  customDomain?: string;
  whiteLabel?: boolean;
  role?: string;
  socials?: SocialLinks;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface FirestoreLink {
  id?: string;
  title: string;
  url: string;
  description: string;
  icon: string;
  thumbnailUrl: string;
  linkType: 'url' | 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'spotify' | 'product' | 'email' | 'phone' | 'real_estate' | 'coaching' | 'creator_work' | 'creator_stats' | 'creator_packages' | 'featured_work' | 'brand_inquiry' | 'media_kit' | 'recommendation' | 'home_valuation' | 'showing_booking' | 'client_review' | 'lead_form';
  templateType?: CardTemplateType;
  color?: CardColor;
  badgeText?: string;
  position: number;
  isActive: boolean;
  openInNewTab?: boolean;
  sectionId: string | null;
  clickCount: number;
  realEstate?: RealEstateMetadata;
  coaching?: CoachingMetadata;
  creatorStats?: CreatorStatsMetadata;
  creatorWork?: CreatorWorkMetadata;
  featuredWork?: FeaturedWorkItem;
  creatorPackages?: CreatorPackagesMetadata;
  brandInquiry?: BrandInquiryMetadata;
  recommendation?: AffiliateRecommendationMetadata;
  clientReview?: ClientReviewMetadata;
  music?: MusicMetadata;
  podcast?: PodcastMetadata;
  isPremium?: boolean;
  customWhatsappPhone?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FirestoreSection {
  id: string;
  title: string;
  position: number;
  isVisible: boolean;
  is_visible?: boolean;
  page_id?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FirestoreTheme {
  name: string;
  isPremium: boolean;
  config: {
    backgroundType: string;
    backgroundValue: string;
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
    buttonStyle: string;
    fontFamily: string;
  };
}

export interface FirestoreAnalyticsEvent {
  type: 'page_view' | 'link_click';
  linkId: string | null;
  visitorId: string;
  country: string;
  device: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  referrer: string;
  timestamp: unknown;
}

// Backward Compatibility Aliases for UI components
export interface DbProfile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  business_phone?: string;
  theme?: CanvasTheme;
  font_family?: string;
  button_style?: 'rounded' | 'square' | 'pill' | 'smooth' | 'glass';
  background_type?: 'color' | 'gradient' | 'image';
  background_value?: string;
  card_style?: CardStyleType;
  wallpaper_mode?: WallpaperMode;
  wallpaper_tint?: number;
  card_bg_color?: string;
  card_text_color?: string;
  button_color?: string;
  stickers?: string[];
  footer_settings?: FooterSettings;
  socials?: SocialLinks;
  plan?: 'free' | 'pro' | 'business' | 'agency';
  role?: string;
  has_completed_onboarding?: boolean;
  onboarding_profile?: OnboardingProfile;
  page_archetype?: string;
  custom_domain?: string;
  whiteLabel?: boolean;
  accountSettings?: UserAccountSettings;
  created_at?: string;
  updated_at?: string;
}

export interface DbLink {
  id: string;
  profile_id: string;
  section_id?: string | null;
  title: string;
  subtitle?: string;
  link_url: string;
  color: CardColor;
  logo_url?: string;
  badge_text?: string;
  expanded?: boolean;
  is_active?: boolean;
  clicks?: number;
  display_order: number;
  template_type?: CardTemplateType;
  real_estate?: RealEstateMetadata;
  coaching?: CoachingMetadata;
  creator_stats?: CreatorStatsMetadata;
  creator_work?: CreatorWorkMetadata;
  featured_work?: FeaturedWorkItem;
  creator_packages?: CreatorPackagesMetadata;
  brand_inquiry?: BrandInquiryMetadata;
  recommendation?: AffiliateRecommendationMetadata;
  client_review?: ClientReviewMetadata;
  music?: MusicMetadata;
  podcast?: PodcastMetadata;
  is_premium?: boolean;
  custom_whatsapp_phone?: string;
  created_at?: string;
}

export interface DbSection {
  id: string;
  title: string;
  position: number;
  is_visible?: boolean;
}

export const DEFAULT_THEMES: Record<string, FirestoreTheme> = {
  minimal: {
    name: 'Minimal',
    isPremium: false,
    config: {
      backgroundType: 'color',
      backgroundValue: '#ffffff',
      textColor: '#111111',
      buttonColor: '#111111',
      buttonTextColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
  },
  warm: {
    name: 'Warm Linen',
    isPremium: false,
    config: {
      backgroundType: 'color',
      backgroundValue: '#ECE7DC',
      textColor: '#1C1E22',
      buttonColor: '#5E4BF7',
      buttonTextColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Plus Jakarta Sans',
    },
  },
  dark: {
    name: 'Dark Obsidian',
    isPremium: false,
    config: {
      backgroundType: 'color',
      backgroundValue: '#191A1E',
      textColor: '#FFFFFF',
      buttonColor: '#5E4BF7',
      buttonTextColor: '#FFFFFF',
      buttonStyle: 'glass',
      fontFamily: 'Plus Jakarta Sans',
    },
  },
  glass: {
    name: 'Glass Frost',
    isPremium: false,
    config: {
      backgroundType: 'color',
      backgroundValue: '#F5F2EB',
      textColor: '#1C1E22',
      buttonColor: 'rgba(255, 255, 255, 0.8)',
      buttonTextColor: '#1C1E22',
      buttonStyle: 'pill',
      fontFamily: 'Plus Jakarta Sans',
    },
  },
  creator: {
    name: 'Creator Burst',
    isPremium: false,
    config: {
      backgroundType: 'color',
      backgroundValue: '#FAF8F5',
      textColor: '#191A1E',
      buttonColor: '#E75646',
      buttonTextColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Plus Jakarta Sans',
    },
  },
  business: {
    name: 'Business Emerald',
    isPremium: false,
    config: {
      backgroundType: 'color',
      backgroundValue: '#062B2B',
      textColor: '#FFFFFF',
      buttonColor: '#10B981',
      buttonTextColor: '#FFFFFF',
      buttonStyle: 'rounded',
      fontFamily: 'Plus Jakarta Sans',
    },
  },
};
