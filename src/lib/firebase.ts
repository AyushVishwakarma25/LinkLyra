import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateAuthProfile,
  sendPasswordResetEmail,
  updatePassword as updateAuthPassword,
  sendEmailVerification,
  deleteUser as deleteAuthUser,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  increment,
  writeBatch,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  normalizeUsername,
  validateUsername,
  checkUsernameAvailability,
  suggestAvailableUsername,
} from './username';
import {
  parseUserAgent,
  getVisitorId,
  isBot,
  shouldRecordPageView,
} from './analytics';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  CardColor,
  CardTemplateType,
  SocialLinks,
  CanvasTheme,
  SubscriptionRecord,
  PaymentInvoiceRecord,
  CreditTransactionRecord,
  SubscriptionPlanType,
  BillingCycle,
  OnboardingProfile,
  CardStyleType,
  WallpaperMode,
  FooterSettings,
  LeadType,
  LeadRecord,
  SpecializedAnalyticsSummary,
} from '../types';

// Structured Firestore Error Protocol mandated by Skill guidelines
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
 * Firestore setDoc/updateDoc throws an error if any field (even nested) is undefined.
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
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
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
    }, dbId as any);
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
// Core Linktree Database Types
// --------------------------------------------------------------------------

export interface FirestoreUser {
  displayName: string;
  email: string;
  photoURL: string;
  username: string;
  plan: 'free' | 'pro' | 'business';
  createdAt: any;
  updatedAt: any;
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
  createdAt: any;
  updatedAt: any;
}

export interface FirestoreLink {
  id?: string;
  title: string;
  url: string;
  description: string;
  icon: string;
  thumbnailUrl: string;
  linkType: 'url' | 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'spotify' | 'product' | 'email' | 'phone' | 'real_estate' | 'coaching' | 'creator_work' | 'creator_stats' | 'creator_packages' | 'featured_work' | 'brand_inquiry' | 'media_kit' | 'recommendation' | 'home_valuation' | 'showing_booking' | 'client_review' | 'lead_form';
  color?: CardColor;
  badgeText?: string;
  position: number;
  isActive: boolean;
  openInNewTab: boolean;
  sectionId: string | null;
  clickCount: number;
  realEstate?: any;
  coaching?: any;
  creatorStats?: any;
  creatorWork?: any;
  featuredWork?: any;
  creatorPackages?: any;
  brandInquiry?: any;
  recommendation?: any;
  clientReview?: any;
  music?: any;
  podcast?: any;
  isPremium?: boolean;
  customWhatsappPhone?: string;
  createdAt: any;
  updatedAt: any;
}

export interface FirestoreSocialLink {
  id?: string;
  platform: string;
  url: string;
  username: string;
  icon: string;
  position: number;
  isVisible: boolean;
}

export interface FirestoreSection {
  id: string;
  title: string;
  position: number;
  isVisible: boolean;
  createdAt?: any;
  updatedAt?: any;
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
  timestamp: any;
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
  accountSettings?: any;
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
  real_estate?: any;
  coaching?: any;
  creator_stats?: any;
  creator_work?: any;
  featured_work?: any;
  creator_packages?: any;
  brand_inquiry?: any;
  recommendation?: any;
  client_review?: any;
  music?: any;
  podcast?: any;
  is_premium?: boolean;
  custom_whatsapp_phone?: string;
  created_at?: string;
}

export interface DbSection {
  id: string;
  title: string;
  position: number;
  is_visible: boolean;
}

// --------------------------------------------------------------------------
// Default Themes Catalog
// --------------------------------------------------------------------------
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
      backgroundValue: '#EFEBE4',
      textColor: '#1C1E22',
      buttonColor: '#10B981',
      buttonTextColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Plus Jakarta Sans',
    },
  },
  portfolio: {
    name: 'Portfolio Gold',
    isPremium: false,
    config: {
      backgroundType: 'color',
      backgroundValue: '#FAF8F5',
      textColor: '#1C1E22',
      buttonColor: '#F8BA38',
      buttonTextColor: '#191A1E',
      buttonStyle: 'rounded',
      fontFamily: 'Plus Jakarta Sans',
    },
  },
};

// --------------------------------------------------------------------------
// Unified Firebase Service Layer
// --------------------------------------------------------------------------
export const profileService = {
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // 1. Account Provisioning (Used by both Email Sign-up and Google Sign-in)
  async provisionAccount(user: User, desiredUsername?: string): Promise<{ profile: DbProfile; username: string }> {
    const rawCandidate = desiredUsername || user.displayName || user.email?.split('@')[0] || 'creator';

    // Suggest available username (handles normalization, transliteration, reserved check, numeric suffixes)
    const finalUsername = await suggestAvailableUsername(
      rawCandidate,
      async (candidate) => {
        const snap = await getDoc(doc(db, 'usernames', candidate));
        return !snap.exists();
      },
      user.uid
    );

    const validation = validateUsername(finalUsername);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid username generated.');
    }

    const fullName = user.displayName || 'Creator';
    const avatarUrl =
      user.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

    const newProfile: DbProfile = {
      id: user.uid,
      username: finalUsername,
      full_name: fullName,
      bio: '',
      avatar_url: avatarUrl,
      theme: 'warm',
      socials: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Atomic transaction: claim username doc and create core documents
    await runTransaction(db, async (tx) => {
      const usernameRef = doc(db, 'usernames', finalUsername);
      const usernameSnap = await tx.get(usernameRef);
      if (usernameSnap.exists()) {
        const data = usernameSnap.data();
        if (data?.uid && data.uid !== user.uid) {
          throw new Error(`Username @${finalUsername} is already taken. Please choose another.`);
        }
      }

      // Claim username
      tx.set(usernameRef, {
        userId: user.uid,
        uid: user.uid,
        pageId: user.uid,
        username: finalUsername,
        createdAt: serverTimestamp(),
      });

      // 1. users/{uid}
      tx.set(
        doc(db, 'users', user.uid),
        sanitizeForFirestore({
          displayName: fullName,
          email: user.email || '',
          photoURL: avatarUrl,
          username: finalUsername,
          plan: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      );

      // 2. pages/{uid}
      tx.set(
        doc(db, 'pages', user.uid),
        sanitizeForFirestore({
          userId: user.uid,
          username: finalUsername,
          title: fullName,
          bio: '',
          avatarUrl: avatarUrl,
          isPublished: true,
          themeId: 'warm',
          backgroundType: 'color',
          backgroundValue: '#ECE7DC',
          fontFamily: 'Plus Jakarta Sans',
          textColor: '#1C1E22',
          buttonStyle: 'rounded',
          buttonColor: '#5E4BF7',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      );

      // 3. profiles/{uid}
      tx.set(doc(db, 'profiles', user.uid), sanitizeForFirestore(newProfile), { merge: true });
    });

    return { profile: newProfile, username: finalUsername };
  },

  // 1b. Google One-Click Login
  async signInWithGoogle(): Promise<{ user: User; profile: DbProfile }> {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    let profile: DbProfile | null = null;
    try {
      profile = await this.getProfile(user.uid);
    } catch (fetchErr) {
      console.warn('Initial profile retrieval notice during Google sign-in:', fetchErr);
    }

    if (!profile) {
      const provisioned = await this.provisionAccount(user);
      profile = provisioned.profile;
    }

    return { user, profile };
  },

  // 2. Email/Password Sign Up
  async signUp(email: string, password: string, fullName: string, username: string) {
    const cleanUsername = (username || '').toLowerCase().trim();
    const validation = validateUsername(cleanUsername);
    if (!validation.valid) {
      throw new Error(validation.reason || 'Invalid username.');
    }

    // Check availability upfront before user creation
    const avail = await checkUsernameAvailability(cleanUsername);
    if (!avail.available) {
      throw new Error(avail.reason || `Username @${cleanUsername} is already taken.`);
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    try {
      await updateAuthProfile(user, { displayName: fullName });
      await this.provisionAccount(user, cleanUsername);
      // Trigger email verification non-blockingly
      sendEmailVerification(user).catch((e) => console.warn('Verification email notice:', e));
    } catch (err: any) {
      // If provisioning failed, rollback Auth user to prevent orphaned accounts
      try {
        await deleteAuthUser(user);
      } catch (delErr) {
        console.warn('Rollback user delete notice:', delErr);
      }
      throw new Error(err.message || 'Failed to complete registration.');
    }

    return user;
  },

  // 3. Email/Password Sign In
  async signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  },

  // 4. Sign Out
  async signOut() {
    await firebaseSignOut(auth);
  },

  // 4b. Send Password Reset Email
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Password reset error:', err);
      throw new Error(err.message || 'Failed to send password reset email.');
    }
  },

  // 4c. Update Current User Password
  async updateAccountPassword(newPassword: string): Promise<void> {
    if (!auth.currentUser) throw new Error('No user is currently authenticated.');
    try {
      await updateAuthPassword(auth.currentUser, newPassword);
    } catch (err: any) {
      console.error('Update password error:', err);
      if (err.code === 'auth/requires-recent-login') {
        throw new Error('This action is sensitive and requires a recent login. Please sign out and sign back in to change your password.');
      }
      throw new Error(err.message || 'Failed to update password.');
    }
  },

  // 4d. Send Email Verification
  async sendVerificationEmail(): Promise<void> {
    if (!auth.currentUser) throw new Error('No user is currently authenticated.');
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (err: any) {
      console.error('Send email verification error:', err);
      throw new Error(err.message || 'Failed to send verification email.');
    }
  },

  // 4e. Delete User Account & Purge Data (Invokes Cloud Function deleteAccount)
  async deleteUserAccount(userId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      throw new Error('User is not authorized or not signed in.');
    }

    try {
      const deleteAccountFn = httpsCallable(functions, 'deleteAccount');
      await deleteAccountFn({});
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error('Delete account error:', err);
      throw new Error(err.message || 'Failed to delete account.');
    }
  },

  // 4f. Full User Data Export (GDPR compliant JSON backup)
  async exportAllUserData(userId: string) {
    try {
      const profile = await this.getProfile(userId);
      const links = await this.getLinks(userId);
      const sections = await this.getSections(userId);
      const leads = await this.getLeads(userId);
      const subscription = await this.getUserSubscription(userId);
      const invoices = await this.getPaymentInvoices(userId);
      const analytics = await this.getAnalyticsSummary(userId);

      const exportBundle = {
        exportTimestamp: new Date().toISOString(),
        application: 'LinkLyra Creator Studio',
        user: {
          id: userId,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || '',
          emailVerified: auth.currentUser?.emailVerified || false,
        },
        profile,
        socialLinks: profile?.socials || {},
        sections,
        links,
        leads,
        subscription,
        invoices,
        analyticsSummary: analytics,
      };

      return exportBundle;
    } catch (err) {
      console.error('Export error:', err);
      throw new Error('Failed to assemble complete account export bundle.');
    }
  },

  // 5. Get User Profile & Page
  async getProfile(userId: string): Promise<DbProfile | null> {
    try {
      // Check pages/{pageId} first
      const pageSnap = await getDoc(doc(db, 'pages', userId));
      const profileSnap = await getDoc(doc(db, 'profiles', userId));
      let userData: any = null;
      if (auth.currentUser?.uid === userId) {
        try {
          const userSnap = await getDoc(doc(db, 'users', userId));
          if (userSnap.exists()) userData = userSnap.data();
        } catch {
          // ignore if user doc cannot be read
        }
      }
      const profileData = profileSnap.exists() ? (profileSnap.data() as DbProfile) : null;

      const effectivePlan = (userData?.plan || profileData?.plan || 'free') as 'free' | 'pro' | 'business' | 'agency';
      const isAgency = effectivePlan === 'agency';

      if (pageSnap.exists()) {
        const pageData = pageSnap.data() as FirestorePage;
        return {
          id: userId,
          username: pageData.username || profileData?.username || '',
          full_name: pageData.title || profileData?.full_name || '',
          bio: pageData.bio || profileData?.bio || '',
          avatar_url: pageData.avatarUrl || profileData?.avatar_url || '',
          business_phone: pageData.businessPhone || profileData?.business_phone,
          theme: (pageData.themeId as any) || profileData?.theme || 'warm',
          font_family: pageData.fontFamily || profileData?.font_family,
          button_style: pageData.buttonStyle || profileData?.button_style,
          background_type: pageData.backgroundType || profileData?.background_type,
          background_value: pageData.backgroundValue || profileData?.background_value,
          card_style: (pageData as any).cardStyle || profileData?.card_style || 'fill',
          wallpaper_mode: (pageData as any).wallpaperMode || profileData?.wallpaper_mode || 'color',
          wallpaper_tint: (pageData as any).wallpaperTint ?? profileData?.wallpaper_tint ?? 20,
          card_bg_color: (pageData as any).cardBgColor || profileData?.card_bg_color,
          card_text_color: (pageData as any).cardTextColor || profileData?.card_text_color,
          button_color: (pageData as any).buttonColor || profileData?.button_color,
          stickers: (pageData as any).stickers || profileData?.stickers || [],
          footer_settings: (pageData as any).footerSettings || profileData?.footer_settings,
          plan: effectivePlan,
          role: isAgency ? 'agency' : (profileData?.role || 'creator'),
          has_completed_onboarding: profileData?.has_completed_onboarding ?? profileData?.onboarding_profile?.onboardingCompleted ?? false,
          onboarding_profile: profileData?.onboarding_profile || (pageSnap.data() as any)?.onboarding_profile || undefined,
          page_archetype: profileData?.page_archetype,
          socials: profileData?.socials,
          custom_domain: profileData?.custom_domain || (pageSnap.data() as any)?.customDomain || (pageSnap.data() as any)?.custom_domain || '',
          accountSettings: auth.currentUser?.uid === userId ? (userData?.accountSettings || undefined) : undefined,
        };
      }

      if (profileData) {
        return {
          ...profileData,
          plan: effectivePlan,
          role: isAgency ? 'agency' : (profileData.role || 'creator'),
          custom_domain: profileData.custom_domain || '',
        };
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('offline') || errMsg.includes('client is offline')) {
        console.warn('Firestore offline notice: Returning local/empty profile while offline.');
        return null;
      }
      handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    }
    return null;
  },

  // 6. Public lookup by username handle
  async getProfileByUsername(
    username: string
  ): Promise<{ profile: DbProfile; links: DbLink[] } | null> {
    if (!username) return null;
    const cleanUsername = username.toLowerCase().trim();

    try {
      // 1. Check usernames index
      const userLookupSnap = await getDoc(doc(db, 'usernames', cleanUsername));
      if (userLookupSnap.exists()) {
        const userId = userLookupSnap.data()?.userId || userLookupSnap.data()?.pageId;
        if (userId) {
          const profile = await this.getProfile(userId);
          if (profile) {
            const links = await this.getLinks(userId);
            return { profile, links };
          }
        }
      }

      // 2. Query pages collection where username == cleanUsername
      const qPages = query(collection(db, 'pages'), where('username', '==', cleanUsername));
      const qPageSnap = await getDocs(qPages);
      if (!qPageSnap.empty) {
        const pageDoc = qPageSnap.docs[0];
        const pageData = pageDoc.data() as FirestorePage;
        const pageId = pageDoc.id;
        const profile: DbProfile = {
          id: pageId,
          username: pageData.username,
          full_name: pageData.title,
          bio: pageData.bio,
          avatar_url: pageData.avatarUrl,
          business_phone: pageData.businessPhone,
          theme: (pageData.themeId as any) || 'warm',
          font_family: pageData.fontFamily,
          button_style: pageData.buttonStyle,
          background_type: pageData.backgroundType,
          background_value: pageData.backgroundValue,
          custom_domain: (pageDoc.data() as any).customDomain || '',
        };
        const links = await this.getLinks(pageId);
        return { profile, links };
      }

      // 3. Fallback: Query profiles collection where username == cleanUsername
      const qProfiles = query(collection(db, 'profiles'), where('username', '==', cleanUsername));
      const qProfileSnap = await getDocs(qProfiles);
      if (!qProfileSnap.empty) {
        const profileDoc = qProfileSnap.docs[0];
        const profileData = profileDoc.data() as DbProfile;
        const links = await this.getLinks(profileDoc.id);
        return { profile: { ...profileData, id: profileDoc.id }, links };
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'pages');
    }

    return null;
  },

  // 6b. Public lookup by Custom Domain Mapping (e.g. bio.ayush.design or links.domain.com)
  async getProfileByDomain(
    domain: string
  ): Promise<{ profile: DbProfile; links: DbLink[] } | null> {
    if (!domain) return null;
    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

    try {
      // Check domains routing index collection only (strictly validated claims)
      const domainDocSnap = await getDoc(doc(db, 'domains', cleanDomain));
      if (domainDocSnap.exists()) {
        const data = domainDocSnap.data();
        const userId = data?.userId || data?.uid || data?.pageId;
        if (userId) {
          const profile = await this.getProfile(userId);
          if (profile) {
            const links = await this.getLinks(userId);
            return { profile, links };
          }
        }
      }
    } catch (err) {
      console.warn('Domain lookup query notice:', err);
    }

    return null;
  },

  // 6c. Save & Bind Custom Domain to User Account via Cloud Functions
  async saveCustomDomain(userId: string, domain: string): Promise<void> {
    const cleanDomain = (domain || '').toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    try {
      if (cleanDomain) {
        const claimFn = httpsCallable<{ domain: string }, { success: boolean; domain: string }>(
          functions,
          'claimCustomDomain'
        );
        await claimFn({ domain: cleanDomain });
      } else {
        const releaseFn = httpsCallable<{ domain?: string }, { success: boolean }>(
          functions,
          'releaseCustomDomain'
        );
        await releaseFn({});
      }
    } catch (err: any) {
      console.error('saveCustomDomain error:', err);
      throw new Error(err?.message || 'Failed to update custom domain settings.');
    }
  },

  // 6d. Save & Persist Account Settings & Preferences (Isolated to users/{uid} only)
  async updateAccountSettings(userId: string, settings: any): Promise<void> {
    try {
      await setDoc(
        doc(db, 'users', userId),
        sanitizeForFirestore({
          accountSettings: settings,
          preferences: settings.preferences,
          emailNotifications: settings.emailNotifications,
          whatsappNotifications: settings.whatsappNotifications,
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/accountSettings`);
    }
  },

  // 7. Update Profile & Page
  async updateProfile(userId: string, updates: Partial<DbProfile>) {
    try {
      const currentProfile = await this.getProfile(userId);
      if (updates.username) {
        const cleanNew = updates.username.toLowerCase().trim();
        const currentUsername = (currentProfile?.username || '').toLowerCase().trim();

        if (cleanNew !== currentUsername) {
          const val = validateUsername(cleanNew);
          if (!val.valid) {
            throw new Error(val.reason || 'Invalid username format.');
          }

          // Transactional username update: check collision, claim new, release old
          await runTransaction(db, async (tx) => {
            const newDocRef = doc(db, 'usernames', cleanNew);
            const newSnap = await tx.get(newDocRef);
            if (newSnap.exists()) {
              const data = newSnap.data();
              if (data?.userId && data.userId !== userId && data?.uid !== userId) {
                throw new Error(`Username @${cleanNew} is already taken.`);
              }
            }

            // Claim new username
            tx.set(newDocRef, {
              userId,
              uid: userId,
              pageId: userId,
              username: cleanNew,
              updatedAt: serverTimestamp(),
            });

            // Delete old username claim if different
            if (currentUsername) {
              const oldDocRef = doc(db, 'usernames', currentUsername);
              tx.delete(oldDocRef);
            }
          });
        }
      }

      const pageUpdates: Partial<FirestorePage> = {};
      if (updates.full_name !== undefined) pageUpdates.title = updates.full_name;
      if (updates.bio !== undefined) pageUpdates.bio = updates.bio;
      if (updates.avatar_url !== undefined) pageUpdates.avatarUrl = updates.avatar_url;
      if (updates.username !== undefined) pageUpdates.username = updates.username;
      if (updates.business_phone !== undefined) pageUpdates.businessPhone = updates.business_phone;
      if (updates.theme !== undefined) pageUpdates.themeId = updates.theme;
      if (updates.font_family !== undefined) pageUpdates.fontFamily = updates.font_family;
      if (updates.button_style !== undefined) pageUpdates.buttonStyle = updates.button_style;
      if (updates.background_type !== undefined) pageUpdates.backgroundType = updates.background_type;
      if (updates.background_value !== undefined) pageUpdates.backgroundValue = updates.background_value;
      if (updates.card_style !== undefined) pageUpdates.cardStyle = updates.card_style;
      if (updates.wallpaper_mode !== undefined) pageUpdates.wallpaperMode = updates.wallpaper_mode;
      if (updates.wallpaper_tint !== undefined) pageUpdates.wallpaperTint = updates.wallpaper_tint;
      if (updates.card_bg_color !== undefined) pageUpdates.cardBgColor = updates.card_bg_color;
      if (updates.card_text_color !== undefined) pageUpdates.cardTextColor = updates.card_text_color;
      if (updates.button_color !== undefined) pageUpdates.buttonColor = updates.button_color;
      if (updates.stickers !== undefined) pageUpdates.stickers = updates.stickers;
      if (updates.footer_settings !== undefined) pageUpdates.footerSettings = updates.footer_settings;
      pageUpdates.updatedAt = serverTimestamp();

      await setDoc(doc(db, 'pages', userId), sanitizeForFirestore(pageUpdates), { merge: true });

      const userUpdates: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.full_name) userUpdates.displayName = updates.full_name;
      if (updates.avatar_url) userUpdates.photoURL = updates.avatar_url;
      if (updates.username) userUpdates.username = updates.username;
      if (updates.accountSettings) userUpdates.accountSettings = updates.accountSettings;

      await setDoc(doc(db, 'users', userId), sanitizeForFirestore(userUpdates), { merge: true });

      // Strip protected fields from public profile (plan, role, customDomain, whiteLabel, accountSettings)
      const {
        plan: _plan,
        role: _role,
        custom_domain: _customDomain,
        customDomain: _customDomainCamel,
        whiteLabel: _whiteLabel,
        white_label: _whiteLabelSnake,
        accountSettings: _accountSettings,
        userId: _uid,
        id: _id,
        ...safeProfileUpdates
      } = updates as any;

      await setDoc(doc(db, 'profiles', userId), sanitizeForFirestore({ ...safeProfileUpdates, id: userId }), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `pages/${userId}`);
    }
  },

  // 8. Get Links (from pages/{pageId}/links subcollection + fallback)
  async getLinks(pageId: string): Promise<DbLink[]> {
    try {
      // 1. Read from pages/{pageId}/links subcollection
      const subcollectionRef = collection(db, 'pages', pageId, 'links');
      const snap = await getDocs(subcollectionRef);
      if (!snap.empty) {
        const subLinks: DbLink[] = [];
        snap.forEach((d) => {
          const l = d.data() as FirestoreLink;
          subLinks.push({
            id: d.id,
            profile_id: pageId,
            section_id: (l as any).sectionId || (l as any).section_id || null,
            title: l.title,
            subtitle: l.description || '',
            link_url: l.url,
            color: (l.color || 'purple') as CardColor,
            logo_url: l.thumbnailUrl || l.icon || '',
            badge_text: l.badgeText || '',
            expanded: l.linkType === 'real_estate' || l.linkType === 'coaching' || l.linkType === 'creator_stats' || l.linkType === 'creator_packages' || l.linkType === 'creator_work' || l.linkType === 'featured_work' || l.linkType === 'brand_inquiry' || l.linkType === 'media_kit' || l.linkType === 'recommendation' || l.linkType === 'home_valuation' || l.linkType === 'showing_booking' || l.linkType === 'client_review',
            is_active: l.isActive ?? true,
            clicks: l.clickCount ?? 0,
            display_order: l.position ?? 0,
            template_type: (l.linkType as any) || 'standard',
            real_estate: l.realEstate,
            coaching: l.coaching,
            creator_stats: l.creatorStats,
            creator_work: l.creatorWork,
            featured_work: l.featuredWork,
            creator_packages: l.creatorPackages,
            brand_inquiry: l.brandInquiry,
            recommendation: l.recommendation,
            client_review: l.clientReview,
            music: l.music,
            podcast: l.podcast,
            is_premium: l.isPremium,
            custom_whatsapp_phone: l.customWhatsappPhone,
          });
        });
        return subLinks.sort((a, b) => a.display_order - b.display_order);
      }

      // 2. Fallback to /links root collection
      const q = query(collection(db, 'links'), where('profile_id', '==', pageId));
      const rootSnap = await getDocs(q);
      const links: DbLink[] = [];
      rootSnap.forEach((d) => {
        const data = d.data() as DbLink;
        links.push({
          ...data,
          id: d.id,
          section_id: (data as any).section_id || (data as any).sectionId || null,
        });
      });
      return links.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('offline') || errMsg.includes('client is offline')) {
        console.warn('Firestore offline notice: Returning empty links array while offline.');
        return [];
      }
      handleFirestoreError(err, OperationType.LIST, `pages/${pageId}/links`);
      return [];
    }
  },

  // 9. Add Link Card (Writes to both subcollection & root for complete reliability)
  async addLink(
    pageId: string,
    link: Omit<DbLink, 'id' | 'profile_id' | 'display_order'> & { display_order?: number }
  ): Promise<DbLink> {
    const newLinkId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const firestoreLink: Record<string, any> = {
      title: link.title || '',
      url: link.link_url || 'https://',
      description: link.subtitle || '',
      icon: link.logo_url || 'globe',
      thumbnailUrl: link.logo_url || '',
      linkType: (link.template_type as any) || 'url',
      color: link.color || 'white',
      badgeText: link.badge_text || '',
      position: link.display_order ?? 0,
      isActive: link.is_active ?? true,
      openInNewTab: true,
      sectionId: link.section_id || null,
      clickCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (link.real_estate !== undefined) firestoreLink.realEstate = link.real_estate;
    if (link.coaching !== undefined) firestoreLink.coaching = link.coaching;
    if (link.creator_stats !== undefined) firestoreLink.creatorStats = link.creator_stats;
    if (link.creator_work !== undefined) firestoreLink.creatorWork = link.creator_work;
    if (link.featured_work !== undefined) firestoreLink.featuredWork = link.featured_work;
    if (link.creator_packages !== undefined) firestoreLink.creatorPackages = link.creator_packages;
    if (link.brand_inquiry !== undefined) firestoreLink.brandInquiry = link.brand_inquiry;
    if (link.recommendation !== undefined) firestoreLink.recommendation = link.recommendation;
    if (link.client_review !== undefined) firestoreLink.clientReview = link.client_review;
    if (link.music !== undefined) firestoreLink.music = link.music;
    if (link.podcast !== undefined) firestoreLink.podcast = link.podcast;
    if (link.is_premium !== undefined) firestoreLink.isPremium = link.is_premium;
    if (link.custom_whatsapp_phone !== undefined) firestoreLink.customWhatsappPhone = link.custom_whatsapp_phone;

    const rootLink: Record<string, any> = {
      id: newLinkId,
      profile_id: pageId,
      section_id: link.section_id || null,
      title: link.title || '',
      subtitle: link.subtitle || '',
      link_url: link.link_url || 'https://',
      color: link.color || 'white',
      logo_url: link.logo_url || '',
      badge_text: link.badge_text || '',
      expanded: link.expanded ?? false,
      is_active: link.is_active ?? true,
      clicks: 0,
      display_order: link.display_order ?? 0,
      template_type: link.template_type || 'standard',
      created_at: new Date().toISOString(),
    };

    if (link.real_estate !== undefined) rootLink.real_estate = link.real_estate;
    if (link.coaching !== undefined) rootLink.coaching = link.coaching;
    if (link.creator_stats !== undefined) rootLink.creator_stats = link.creator_stats;
    if (link.creator_work !== undefined) rootLink.creator_work = link.creator_work;
    if (link.featured_work !== undefined) rootLink.featured_work = link.featured_work;
    if (link.creator_packages !== undefined) rootLink.creator_packages = link.creator_packages;
    if (link.brand_inquiry !== undefined) rootLink.brand_inquiry = link.brand_inquiry;
    if (link.recommendation !== undefined) rootLink.recommendation = link.recommendation;
    if (link.client_review !== undefined) rootLink.client_review = link.client_review;
    if (link.music !== undefined) rootLink.music = link.music;
    if (link.podcast !== undefined) rootLink.podcast = link.podcast;
    if (link.is_premium !== undefined) rootLink.is_premium = link.is_premium;
    if (link.custom_whatsapp_phone !== undefined) rootLink.custom_whatsapp_phone = link.custom_whatsapp_phone;

    try {
      const sanitizedFirestoreLink = sanitizeForFirestore(firestoreLink);
      const sanitizedRootLink = sanitizeForFirestore(rootLink);
      // Write to subcollection: pages/{pageId}/links/{linkId}
      await setDoc(doc(db, 'pages', pageId, 'links', newLinkId), sanitizedFirestoreLink);
      // Write to root: links/{linkId}
      await setDoc(doc(db, 'links', newLinkId), sanitizedRootLink);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `pages/${pageId}/links/${newLinkId}`);
    }

    return rootLink as DbLink;
  },

  // 10. Update Link Card (Flexible signature)
  async updateLink(
    pageIdOrLinkId: string,
    linkIdOrUpdates: string | Partial<DbLink>,
    maybeUpdates?: Partial<DbLink>
  ) {
    let pageId = auth.currentUser?.uid || '';
    let linkId = '';
    let updates: Partial<DbLink> = {};

    if (typeof linkIdOrUpdates === 'string') {
      pageId = pageIdOrLinkId;
      linkId = linkIdOrUpdates;
      updates = maybeUpdates || {};
    } else {
      linkId = pageIdOrLinkId;
      updates = linkIdOrUpdates;
    }

    try {
      const subUpdates: any = { updatedAt: serverTimestamp() };
      if (updates.title !== undefined) subUpdates.title = updates.title;
      if (updates.subtitle !== undefined) subUpdates.description = updates.subtitle;
      if (updates.link_url !== undefined) subUpdates.url = updates.link_url;
      if (updates.color !== undefined) subUpdates.color = updates.color;
      if (updates.badge_text !== undefined) subUpdates.badgeText = updates.badge_text;
      if (updates.logo_url !== undefined) subUpdates.thumbnailUrl = updates.logo_url;
      if (updates.is_active !== undefined) subUpdates.isActive = updates.is_active;
      if (updates.display_order !== undefined) subUpdates.position = updates.display_order;
      if (updates.section_id !== undefined) subUpdates.sectionId = updates.section_id;
      if (updates.template_type !== undefined) subUpdates.linkType = updates.template_type;
      if (updates.real_estate !== undefined) subUpdates.realEstate = updates.real_estate;
      if (updates.coaching !== undefined) subUpdates.coaching = updates.coaching;
      if (updates.creator_stats !== undefined) subUpdates.creatorStats = updates.creator_stats;
      if (updates.creator_work !== undefined) subUpdates.creatorWork = updates.creator_work;
      if (updates.featured_work !== undefined) subUpdates.featuredWork = updates.featured_work;
      if (updates.creator_packages !== undefined) subUpdates.creatorPackages = updates.creator_packages;
      if (updates.brand_inquiry !== undefined) subUpdates.brandInquiry = updates.brand_inquiry;
      if (updates.recommendation !== undefined) subUpdates.recommendation = updates.recommendation;
      if (updates.client_review !== undefined) subUpdates.clientReview = updates.client_review;
      if (updates.music !== undefined) subUpdates.music = updates.music;
      if (updates.podcast !== undefined) subUpdates.podcast = updates.podcast;
      if (updates.is_premium !== undefined) subUpdates.isPremium = updates.is_premium;
      if (updates.custom_whatsapp_phone !== undefined) subUpdates.customWhatsappPhone = updates.custom_whatsapp_phone;

      const sanitizedSubUpdates = sanitizeForFirestore(subUpdates);
      const sanitizedUpdates = sanitizeForFirestore({ ...updates, updatedAt: serverTimestamp() });

      if (pageId) {
        await setDoc(doc(db, 'pages', pageId, 'links', linkId), sanitizedSubUpdates, { merge: true }).catch(() => {});
      }
      // Use setDoc with merge: true to avoid "No document to update" error if the doc was not previously written to root links
      await setDoc(doc(db, 'links', linkId), sanitizedUpdates, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `links/${linkId}`);
    }
  },

  // 11. Record Analytics Event (pages/{pageId}/analytics/{eventId})
  async recordClick(pageIdOrLinkId: string, linkIdOrPageId?: string) {
    // Normalizes recordClick(pageId, linkId) while supporting legacy recordClick(linkId, pageId)
    let pageId = '';
    let linkId = '';

    if (linkIdOrPageId) {
      pageId = pageIdOrLinkId;
      linkId = linkIdOrPageId;
    } else {
      linkId = pageIdOrLinkId;
      pageId = auth.currentUser?.uid || '';
    }

    if (!pageId || !linkId) return;

    // Skip recording if current user is the owner (creator clicking/previewing their own links)
    if (auth.currentUser && auth.currentUser.uid === pageId) {
      return;
    }

    // Ignore automated bots/crawlers
    if (isBot()) {
      return;
    }

    try {
      // 1. Increment click count atomically in pages/{pageId}/links/{linkId}
      await updateDoc(doc(db, 'pages', pageId, 'links', linkId), {
        clickCount: increment(1),
      }).catch((err) => {
        console.warn('Notice updating link clickCount:', err);
      });

      // 2. Create immutable raw analytics event with expireAt (+90 days) for TTL policy
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const uaInfo = parseUserAgent();
      const visitorId = getVisitorId();
      const expireAt = Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000);

      const eventData: Record<string, any> = {
        type: 'link_click',
        linkId,
        visitorId,
        device: uaInfo.device,
        browser: uaInfo.browser,
        referrer: typeof document !== 'undefined' && document.referrer ? document.referrer.slice(0, 150) : 'direct',
        timestamp: serverTimestamp(),
        expireAt,
      };

      await setDoc(doc(db, 'pages', pageId, 'analytics', eventId), eventData);
    } catch (err) {
      console.warn('Click event logged with notice:', err);
    }
  },

  // 12. Record Page View Event (pages/{pageId}/analytics/{eventId})
  async recordPageView(pageId: string) {
    if (!pageId) return;

    // Skip recording if creator is viewing their own page
    if (auth.currentUser && auth.currentUser.uid === pageId) {
      return;
    }

    // Ignore automated bots/crawlers
    if (isBot()) {
      return;
    }

    // Deduplicate: once per visitor per 30 minutes for this page
    if (!shouldRecordPageView(pageId)) {
      return;
    }

    try {
      const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const uaInfo = parseUserAgent();
      const visitorId = getVisitorId();
      const expireAt = Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000);

      const eventData: Record<string, any> = {
        type: 'page_view',
        linkId: null,
        visitorId,
        device: uaInfo.device,
        browser: uaInfo.browser,
        referrer: typeof document !== 'undefined' && document.referrer ? document.referrer.slice(0, 150) : 'direct',
        timestamp: serverTimestamp(),
        expireAt,
      };

      await setDoc(doc(db, 'pages', pageId, 'analytics', eventId), eventData);
    } catch (err) {
      console.warn('Page view event logged with notice:', err);
    }
  },

  // View tracking alias
  async recordView(pageId: string) {
    return this.recordPageView(pageId);
  },

  // 13. Delete Link (Flexible signature)
  async deleteLink(pageIdOrLinkId: string, maybeLinkId?: string): Promise<boolean> {
    const pageId = maybeLinkId ? pageIdOrLinkId : (auth.currentUser?.uid || '');
    const linkId = maybeLinkId ? maybeLinkId : pageIdOrLinkId;

    try {
      if (pageId) {
        await deleteDoc(doc(db, 'pages', pageId, 'links', linkId)).catch(() => {});
      }
      await deleteDoc(doc(db, 'links', linkId)).catch(() => {});
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `links/${linkId}`);
      return false;
    }
  },

  // 14. Batch Reorder Links
  async reorderLinks(pageId: string, linkIds: string[]) {
    try {
      const batch = writeBatch(db);
      linkIds.forEach((id, index) => {
        const subRef = doc(db, 'pages', pageId, 'links', id);
        batch.set(subRef, { position: index, updatedAt: serverTimestamp() }, { merge: true });
        const rootRef = doc(db, 'links', id);
        batch.set(rootRef, { display_order: index }, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `pages/${pageId}/links reorder`);
    }
  },

  // 15. Get Sections (pages/{pageId}/sections)
  async getSections(pageId: string): Promise<FirestoreSection[]> {
    try {
      const snap = await getDocs(collection(db, 'pages', pageId, 'sections'));
      const sections: FirestoreSection[] = [];
      snap.forEach((d) => {
        const data = d.data();
        sections.push({
          id: d.id,
          title: data.title,
          position: data.position ?? 0,
          isVisible: data.isVisible ?? true,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      return sections.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    } catch (err) {
      console.warn('Could not fetch sections:', err);
      return [];
    }
  },

  // 16. Add Section (Supports both polymorphic signatures)
  async addSection(
    pageId: string,
    titleOrData: string | { title: string; position?: number; is_visible?: boolean },
    position: number = 0
  ): Promise<FirestoreSection> {
    const sectionId = `sec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const title = typeof titleOrData === 'string' ? titleOrData : titleOrData.title;
    const pos = typeof titleOrData === 'string' ? position : (titleOrData.position ?? position);
    const isVisible = typeof titleOrData === 'string' ? true : (titleOrData.is_visible ?? true);

    const sectionData: FirestoreSection = {
      id: sectionId,
      title: (title || '').trim(),
      position: pos,
      isVisible,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'pages', pageId, 'sections', sectionId), sectionData);
      return sectionData;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `pages/${pageId}/sections/${sectionId}`);
      return sectionData;
    }
  },

  // 17. Delete Section
  async deleteSection(pageIdOrSectionId: string, maybeSectionId?: string): Promise<boolean> {
    const pageId = maybeSectionId ? pageIdOrSectionId : (auth.currentUser?.uid || '');
    const sectionId = maybeSectionId || pageIdOrSectionId;

    try {
      if (pageId) {
        await deleteDoc(doc(db, 'pages', pageId, 'sections', sectionId));
      }
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `pages/${pageId}/sections/${sectionId}`);
      return false;
    }
  },

  // 18. Get Analytics Summary from Daily Rollups (pages/{pageId}/stats/{yyyy-mm-dd})
  async getAnalyticsSummary(pageId: string, days: number = 30): Promise<SpecializedAnalyticsSummary> {
    const defaultSummary: SpecializedAnalyticsSummary = {
      totalViews: 0,
      totalClicks: 0,
      ctr: '0.0',
      propertyViews: 0,
      showingRequests: 0,
      homeValuations: 0,
      brandInquiries: 0,
      mediaKitDownloads: 0,
      packageClicks: 0,
      packageBookings: 0,
      generalContacts: 0,
      musicBookings: 0,
      podcastSponsorships: 0,
      estimatedPipelineValueINR: 0,
      deviceCounts: { mobile: 0, desktop: 0, tablet: 0 },
      browserCounts: {},
      referrerCounts: {},
      linkClickCounts: {},
      topLinks: [],
      dailyStats: [],
    };

    if (!pageId) return defaultSummary;

    try {
      // Calculate start date string for the last N days (YYYY-MM-DD)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);
      const startDateStr = startDate.toISOString().split('T')[0];

      // Query bounded daily rollups at pages/{pageId}/stats where date >= startDateStr
      const statsQuery = query(
        collection(db, 'pages', pageId, 'stats'),
        where('date', '>=', startDateStr)
      );

      const snap = await getDocs(statsQuery);

      let totalViews = 0;
      let totalClicks = 0;
      let showingRequests = 0;
      let homeValuations = 0;
      let brandInquiries = 0;
      let mediaKitDownloads = 0;
      let packageBookings = 0;
      let generalContacts = 0;
      let musicBookings = 0;
      let podcastSponsorships = 0;
      let propertyViews = 0;

      const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
      const browserCounts: Record<string, number> = {};
      const referrerCounts: Record<string, number> = {};
      const linkClickCounts: Record<string, number> = {};
      const dailyMap: Record<string, { date: string; views: number; clicks: number }> = {};

      // Initialize all days in the range so the timeline has continuous points
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        dailyMap[dStr] = { date: dStr, views: 0, clicks: 0 };
      }

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const views = Number(data.views || 0);
        const clicks = Number(data.clicks || 0);
        const date = data.date || docSnap.id;

        totalViews += views;
        totalClicks += clicks;

        if (dailyMap[date]) {
          dailyMap[date].views += views;
          dailyMap[date].clicks += clicks;
        } else {
          dailyMap[date] = { date, views, clicks };
        }

        // Aggregate devices
        if (data.devices && typeof data.devices === 'object') {
          for (const [dev, count] of Object.entries(data.devices)) {
            const cleanDev = ['mobile', 'desktop', 'tablet'].includes(dev) ? dev : 'mobile';
            deviceCounts[cleanDev] = (deviceCounts[cleanDev] || 0) + Number(count || 0);
          }
        }

        // Aggregate browsers
        if (data.browsers && typeof data.browsers === 'object') {
          for (const [browser, count] of Object.entries(data.browsers)) {
            browserCounts[browser] = (browserCounts[browser] || 0) + Number(count || 0);
          }
        }

        // Aggregate referrers
        if (data.referrers && typeof data.referrers === 'object') {
          for (const [ref, count] of Object.entries(data.referrers)) {
            referrerCounts[ref] = (referrerCounts[ref] || 0) + Number(count || 0);
          }
        }

        // Aggregate per-link clicks
        if (data.linkClicks && typeof data.linkClicks === 'object') {
          for (const [linkId, count] of Object.entries(data.linkClicks)) {
            linkClickCounts[linkId] = (linkClickCounts[linkId] || 0) + Number(count || 0);
          }
        }

        // Aggregate conversions / event types
        if (data.eventTypes && typeof data.eventTypes === 'object') {
          showingRequests += Number(data.eventTypes.showing_request || data.eventTypes.showing || 0);
          homeValuations += Number(data.eventTypes.home_valuation || data.eventTypes.valuation || 0);
          brandInquiries += Number(data.eventTypes.brand_inquiry || data.eventTypes.brand || 0);
          mediaKitDownloads += Number(data.eventTypes.media_kit_download || 0);
          packageBookings += Number(data.eventTypes.package_booking || 0);
          generalContacts += Number(data.eventTypes.general_contact || 0);
          musicBookings += Number(data.eventTypes.music_booking || 0);
          podcastSponsorships += Number(data.eventTypes.podcast_sponsorship || 0);
          propertyViews += Number(data.eventTypes.property_view || 0);
        }
      });

      // Assemble top links sorted by clicks descending
      const topLinks = Object.entries(linkClickCounts)
        .map(([linkId, clicks]) => ({ linkId, clicks }))
        .sort((a, b) => b.clicks - a.clicks);

      const dailyStats = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
      const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

      return {
        totalViews,
        totalClicks,
        ctr,
        propertyViews,
        showingRequests,
        homeValuations,
        brandInquiries,
        mediaKitDownloads,
        packageClicks: totalClicks,
        packageBookings,
        generalContacts,
        musicBookings,
        podcastSponsorships,
        estimatedPipelineValueINR: (showingRequests * 50000) + (brandInquiries * 25000) + (packageBookings * 15000),
        deviceCounts,
        browserCounts,
        referrerCounts,
        linkClickCounts,
        topLinks,
        dailyStats,
      };
    } catch (err) {
      console.warn('Could not read analytics stats rollups:', err);
      return defaultSummary;
    }
  },

  // -------------------------------------------------------------
  // 18.1 Leads & Inquiries CRM Management
  // -------------------------------------------------------------

  // Submit Lead (Public visitor: Showing Request, Brand Inquiry, Home Valuation)
  async submitLead(
    pageId: string,
    lead: {
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
      buyerStatus?: string;
      propertyAddress?: string;
      propertyCondition?: string;
      selectedPackageName?: string;
      _hp?: string; // Honeypot spam field
    }
  ): Promise<LeadRecord> {
    const cleanPageId = (pageId || '').trim();
    if (!cleanPageId || cleanPageId === 'public_page') {
      throw new Error('A valid pageId is required to submit an inquiry.');
    }

    // 1. Honeypot check: Bots fill hidden fields; humans do not
    if (lead._hp && lead._hp.trim().length > 0) {
      throw new Error('Spam submission detected.');
    }

    // 2. Client-side rate limit (1 submission per 30 seconds)
    try {
      const lastSubmit = localStorage.getItem('linklyra_last_lead_submit');
      if (lastSubmit) {
        const elapsed = Date.now() - Number(lastSubmit);
        if (elapsed < 30000) {
          const remainingSec = Math.ceil((30000 - elapsed) / 1000);
          throw new Error(`Please wait ${remainingSec}s before submitting another inquiry.`);
        }
      }
    } catch (storageErr: any) {
      if (storageErr.message?.includes('before submitting')) {
        throw storageErr;
      }
    }

    // 3. Validation matching Firestore Security Rules limits
    const cleanName = (lead.name || '').trim();
    if (!cleanName || cleanName.length > 100) {
      throw new Error('Name is required and cannot exceed 100 characters.');
    }

    const cleanEmail = (lead.email || '').trim().toLowerCase();
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || cleanEmail.length > 150 || !EMAIL_REGEX.test(cleanEmail)) {
      throw new Error('A valid email address is required (maximum 150 characters).');
    }

    const cleanPhone = lead.phone ? lead.phone.trim() : undefined;
    if (cleanPhone && cleanPhone.length > 30) {
      throw new Error('Phone number cannot exceed 30 characters.');
    }

    const cleanDetails = lead.details ? lead.details.trim() : undefined;
    if (cleanDetails && cleanDetails.length > 2000) {
      throw new Error('Message details cannot exceed 2000 characters.');
    }

    const cleanCompany = lead.companyOrBrand ? lead.companyOrBrand.trim() : undefined;
    if (cleanCompany && cleanCompany.length > 150) {
      throw new Error('Company name cannot exceed 150 characters.');
    }

    const cleanAddress = lead.propertyAddress ? lead.propertyAddress.trim() : undefined;
    if (cleanAddress && cleanAddress.length > 300) {
      throw new Error('Property address cannot exceed 300 characters.');
    }

    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const nowIso = new Date().toISOString();

    const record: LeadRecord = sanitizeForFirestore({
      id: leadId,
      pageId: cleanPageId,
      type: lead.type,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      companyOrBrand: cleanCompany,
      campaignType: lead.campaignType ? lead.campaignType.trim() : undefined,
      budgetOrPrice: lead.budgetOrPrice ? lead.budgetOrPrice.trim() : undefined,
      timelineOrDate: lead.timelineOrDate ? lead.timelineOrDate.trim() : undefined,
      details: cleanDetails,
      propertyTitle: lead.propertyTitle ? lead.propertyTitle.trim() : undefined,
      buyerStatus: lead.buyerStatus ? lead.buyerStatus.trim() : undefined,
      propertyAddress: cleanAddress,
      propertyCondition: lead.propertyCondition ? lead.propertyCondition.trim() : undefined,
      selectedPackageName: lead.selectedPackageName ? lead.selectedPackageName.trim() : undefined,
      status: 'new' as const,
      createdAt: nowIso,
    });

    // Write to Firestore - never swallow errors!
    await setDoc(doc(db, 'pages', cleanPageId, 'leads', leadId), {
      ...record,
      serverTimestamp: serverTimestamp(),
    });

    // Record submission timestamp for rate limiting
    try {
      localStorage.setItem('linklyra_last_lead_submit', Date.now().toString());
    } catch {
      // ignore storage quota issues
    }

    // Telemetry: record lead event in background with TTL
    const uaInfo = parseUserAgent();
    setDoc(doc(db, 'pages', cleanPageId, 'analytics', `evt_${leadId}`), {
      type: lead.type,
      linkId: null,
      visitorId: getVisitorId(),
      device: uaInfo.device,
      browser: uaInfo.browser,
      referrer: typeof document !== 'undefined' && document.referrer ? document.referrer.slice(0, 150) : 'direct',
      timestamp: serverTimestamp(),
      expireAt: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
    }).catch(() => {});

    return record;
  },

  // Get all leads for page owner
  async getLeads(pageId: string): Promise<LeadRecord[]> {
    if (!pageId || pageId === 'public_page') return [];
    try {
      const snap = await getDocs(collection(db, 'pages', pageId, 'leads'));
      const leads: LeadRecord[] = [];
      snap.forEach((d) => leads.push({ id: d.id, ...(d.data() as any) }));
      return leads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch (err) {
      console.warn('Notice: fetching leads:', err);
      return [];
    }
  },

  // Update lead status in CRM
  async updateLeadStatus(pageId: string, leadId: string, status: string, notes?: string): Promise<boolean> {
    try {
      const updates: any = { status };
      if (notes !== undefined) updates.notes = notes;

      await updateDoc(doc(db, 'pages', pageId, 'leads', leadId), updates).catch(() => {});
      return true;
    } catch (err) {
      console.warn('Notice: updating lead status:', err);
      return false;
    }
  },

  // Delete lead
  async deleteLead(pageId: string, leadId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'pages', pageId, 'leads', leadId)).catch(() => {});
      return true;
    } catch (err) {
      console.warn('Notice: deleting lead:', err);
      return false;
    }
  },

  // -------------------------------------------------------------
  // 19. Subscriptions, Credits & Razorpay Billing Management
  // -------------------------------------------------------------

  // Get active subscription record
  async getUserSubscription(userId: string): Promise<SubscriptionRecord | null> {
    try {
      const subDoc = await getDoc(doc(db, 'users', userId, 'subscriptions', 'current'));
      if (subDoc.exists()) {
        return { id: subDoc.id, ...subDoc.data() } as SubscriptionRecord;
      }

      // Root level fallback
      const rootSubDoc = await getDoc(doc(db, 'subscriptions', userId));
      if (rootSubDoc.exists()) {
        return { id: rootSubDoc.id, ...rootSubDoc.data() } as SubscriptionRecord;
      }
      return null;
    } catch (err) {
      console.warn('Notice: subscription record query:', err);
      return null;
    }
  },

  // Save or update subscription record
  async saveUserSubscription(userId: string, data: Partial<SubscriptionRecord>): Promise<SubscriptionRecord> {
    const now = new Date().toISOString();
    const periodEnd = data.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const record: SubscriptionRecord = {
      id: 'current',
      userId,
      plan: data.plan || 'pro',
      status: data.status || 'active',
      billingCycle: data.billingCycle || 'monthly',
      amount: data.amount ?? 499,
      currency: data.currency || 'INR',
      startDate: data.startDate || now,
      currentPeriodStart: data.currentPeriodStart || now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      canceledAt: data.canceledAt,
      razorpaySubscriptionId: data.razorpaySubscriptionId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpayOrderId: data.razorpayOrderId,
      razorpaySignature: data.razorpaySignature,
      creditsMonthly: data.creditsMonthly ?? (data.plan === 'business' ? 2500 : 500),
      creditsRemaining: data.creditsRemaining ?? (data.plan === 'business' ? 2500 : 500),
      creditsUsed: data.creditsUsed ?? 0,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    try {
      // Write to user subcollection
      await setDoc(doc(db, 'users', userId, 'subscriptions', 'current'), record);
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}/subscriptions/current`);
      return record;
    }
  },

  // Get payment invoice records
  async getPaymentInvoices(userId: string): Promise<PaymentInvoiceRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'payments'));
      const invoices: PaymentInvoiceRecord[] = [];
      snap.forEach((d) => {
        invoices.push({ id: d.id, ...d.data() } as PaymentInvoiceRecord);
      });

      return invoices.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
    } catch (err) {
      console.warn('Notice: fetching invoices:', err);
      return [];
    }
  },

  // Record a payment invoice from Razorpay
  async recordPaymentInvoice(userId: string, invoice: Omit<PaymentInvoiceRecord, 'id'>): Promise<PaymentInvoiceRecord> {
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const fullInvoice: PaymentInvoiceRecord = {
      id: invoiceId,
      ...invoice,
    };

    try {
      await setDoc(doc(db, 'users', userId, 'payments', invoiceId), fullInvoice);
      return fullInvoice;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${userId}/payments/${invoiceId}`);
      return fullInvoice;
    }
  },

  // Get credit transactions
  async getCreditTransactions(userId: string): Promise<CreditTransactionRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'credit_transactions'));
      const list: CreditTransactionRecord[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as CreditTransactionRecord);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.warn('Notice: reading credit transactions:', err);
      return [];
    }
  },

  // Add credit transaction and update balance
  async logCreditTransaction(
    userId: string,
    type: 'monthly_grant' | 'top_up' | 'ai_generation' | 'lead_export' | 'custom_domain' | 'bonus',
    amount: number,
    description: string,
    currentBalance: number
  ): Promise<CreditTransactionRecord> {
    const txId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newBalance = Math.max(0, currentBalance + amount);
    const tx: CreditTransactionRecord = {
      id: txId,
      userId,
      type,
      amount,
      description,
      balanceAfter: newBalance,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', userId, 'credit_transactions', txId), tx);
      await updateDoc(doc(db, 'users', userId, 'subscriptions', 'current'), {
        creditsRemaining: newBalance,
        ...(amount < 0 ? { creditsUsed: increment(Math.abs(amount)) } : {}),
      }).catch(() => {});
      return tx;
    } catch (err) {
      console.warn('Notice: logging credit transaction:', err);
      return tx;
    }
  },

  // Cancel subscription (server-side callable)
  async cancelSubscription(_userId?: string): Promise<boolean> {
    try {
      const cancelFn = httpsCallable(functions, 'cancelSubscription');
      await cancelFn();
      return true;
    } catch (err) {
      console.error('Error cancelling subscription via Cloud Functions:', err);
      return false;
    }
  },

  // Consume credits (server-side callable)
  async consumeCredits(amount: number, reason: string): Promise<{ success: boolean; creditsRemaining: number }> {
    try {
      const consumeFn = httpsCallable<{ amount: number; reason: string }, { success: boolean; creditsRemaining: number }>(
        functions,
        'consumeCredits'
      );
      const res = await consumeFn({ amount, reason });
      return res.data;
    } catch (err: any) {
      console.error('Error consuming credits via Cloud Functions:', err);
      throw new Error(err.message || 'Failed to consume credits.');
    }
  },
};
