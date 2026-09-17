import { initializeApp, getApps, getApp } from 'firebase/app';
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
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
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

// Singleton Firebase Application & Service Initialization
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Connection validation test on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore connection notice: Client is initializing or offline.');
    }
  }
}
testConnection();

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
  buttonStyle: 'rounded' | 'square' | 'pill' | 'glass';
  buttonColor: string;
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

// Agency & VIP Whitelisted Account Emails
export const AGENCY_WHITELIST_EMAILS = [
  'reachtoayush25@gmail.com',
  'sharma25ayush@gmail.com',
];

export function isAgencyUserEmail(email?: string | null): boolean {
  if (!email) return false;
  return AGENCY_WHITELIST_EMAILS.includes(email.toLowerCase().trim());
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
  button_style?: 'rounded' | 'square' | 'pill' | 'glass';
  background_type?: 'color' | 'gradient' | 'image';
  background_value?: string;
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

  // 1. Google One-Click Login
  async signInWithGoogle(): Promise<{ user: User; profile: DbProfile }> {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    let profile = await this.getProfile(user.uid);
    if (!profile) {
      const generatedUsername = (user.displayName || user.email?.split('@')[0] || 'creator')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '');

      profile = {
        id: user.uid,
        username: generatedUsername,
        full_name: user.displayName || 'Creator',
        bio: '',
        avatar_url:
          user.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        theme: 'warm',
        socials: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        // 1. Save to users/{userId}
        await setDoc(doc(db, 'users', user.uid), {
          displayName: profile.full_name,
          email: user.email || '',
          photoURL: profile.avatar_url,
          username: generatedUsername,
          plan: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // 2. Save to pages/{pageId} (pageId = user.uid)
        await setDoc(doc(db, 'pages', user.uid), {
          userId: user.uid,
          username: generatedUsername,
          title: profile.full_name,
          bio: profile.bio,
          avatarUrl: profile.avatar_url,
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
        });

        // 3. Backward compatibility collections
        await setDoc(doc(db, 'profiles', user.uid), profile);
        await setDoc(doc(db, 'usernames', generatedUsername), {
          userId: user.uid,
          pageId: user.uid,
          username: generatedUsername,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
      }
    }

    return { user, profile };
  },

  // 2. Email/Password Sign Up
  async signUp(email: string, password: string, fullName: string, username: string) {
    const cleanUsername = (username || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

    try {
      const usernameDoc = await getDoc(doc(db, 'usernames', cleanUsername));
      if (usernameDoc.exists()) {
        throw new Error(`Username @${cleanUsername} is already taken. Please choose another.`);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already taken')) {
        throw err;
      }
      handleFirestoreError(err, OperationType.GET, `usernames/${cleanUsername}`);
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await updateAuthProfile(user, { displayName: fullName });

    const newProfile: DbProfile = {
      id: user.uid,
      username: cleanUsername,
      full_name: fullName,
      bio: '',
      avatar_url:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      theme: 'warm',
      socials: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // 1. users/{userId}
      await setDoc(doc(db, 'users', user.uid), {
        displayName: fullName,
        email: email,
        photoURL: newProfile.avatar_url,
        username: cleanUsername,
        plan: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. pages/{pageId}
      await setDoc(doc(db, 'pages', user.uid), {
        userId: user.uid,
        username: cleanUsername,
        title: fullName,
        bio: '',
        avatarUrl: newProfile.avatar_url,
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
      });

      // 3. profiles & usernames
      await setDoc(doc(db, 'profiles', user.uid), newProfile);
      await setDoc(doc(db, 'usernames', cleanUsername), {
        userId: user.uid,
        pageId: user.uid,
        username: cleanUsername,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
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

  // 4e. Delete User Account & Purge Data
  async deleteUserAccount(userId: string): Promise<void> {
    const user = auth.currentUser;
    try {
      // 1. Delete Firestore records
      await deleteDoc(doc(db, 'users', userId)).catch(() => {});
      await deleteDoc(doc(db, 'profiles', userId)).catch(() => {});
      await deleteDoc(doc(db, 'pages', userId)).catch(() => {});
      await deleteDoc(doc(db, 'subscriptions', userId)).catch(() => {});
      
      // Delete user's links
      const linksSnap = await getDocs(collection(db, 'pages', userId, 'links')).catch(() => null);
      if (linksSnap) {
        for (const d of linksSnap.docs) {
          await deleteDoc(doc(db, 'pages', userId, 'links', d.id)).catch(() => {});
          await deleteDoc(doc(db, 'links', d.id)).catch(() => {});
        }
      }

      // 2. Delete Firebase Auth user if authenticated
      if (user && user.uid === userId) {
        await deleteAuthUser(user);
      }
    } catch (err: any) {
      console.error('Delete account error:', err);
      if (err.code === 'auth/requires-recent-login') {
        throw new Error('Deleting your account requires a recent authentication. Please sign out, sign back in, and try again.');
      }
      throw new Error(err.message || 'Failed to delete account.');
    }
  },

  // 4f. Full User Data Export (GDPR compliant JSON backup)
  async exportAllUserData(userId: string) {
    try {
      const profile = await this.getProfile(userId);
      const links = await this.getLinks(userId);
      const sections = await this.getSections(userId);
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
        sections,
        links,
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
      const userSnap = await getDoc(doc(db, 'users', userId));
      const profileData = profileSnap.exists() ? (profileSnap.data() as DbProfile) : null;
      const userData = userSnap.exists() ? userSnap.data() : null;

      const userEmail = auth.currentUser?.email || (userData?.email as string) || '';
      const isAgency = isAgencyUserEmail(userEmail) || profileData?.plan === 'agency' || profileData?.role === 'agency';

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
          plan: isAgency ? 'agency' : (profileData?.plan || 'free'),
          role: isAgency ? 'agency' : (profileData?.role || 'creator'),
          has_completed_onboarding: profileData?.has_completed_onboarding ?? profileData?.onboarding_profile?.onboardingCompleted ?? false,
          onboarding_profile: profileData?.onboarding_profile || (pageSnap.data() as any)?.onboarding_profile || undefined,
          page_archetype: profileData?.page_archetype,
          socials: profileData?.socials,
          custom_domain: profileData?.custom_domain || (pageSnap.data() as any)?.customDomain || (pageSnap.data() as any)?.custom_domain || '',
          accountSettings: profileData?.accountSettings || userData?.accountSettings || undefined,
        };
      }

      if (profileData) {
        return {
          ...profileData,
          plan: isAgency ? 'agency' : (profileData.plan || 'free'),
          role: isAgency ? 'agency' : (profileData.role || 'creator'),
          custom_domain: profileData.custom_domain || '',
        };
      }
    } catch (err) {
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
      // 1. Check domains routing index collection
      const domainDocSnap = await getDoc(doc(db, 'domains', cleanDomain));
      if (domainDocSnap.exists()) {
        const userId = domainDocSnap.data()?.userId || domainDocSnap.data()?.pageId;
        if (userId) {
          const profile = await this.getProfile(userId);
          if (profile) {
            const links = await this.getLinks(userId);
            return { profile, links };
          }
        }
      }

      // 2. Query pages collection where customDomain == cleanDomain
      const qPages = query(collection(db, 'pages'), where('customDomain', '==', cleanDomain));
      const pageSnap = await getDocs(qPages);
      if (!pageSnap.empty) {
        const pageDoc = pageSnap.docs[0];
        const profile = await this.getProfile(pageDoc.id);
        if (profile) {
          const links = await this.getLinks(pageDoc.id);
          return { profile, links };
        }
      }

      // 3. Query profiles collection where custom_domain == cleanDomain
      const qProfiles = query(collection(db, 'profiles'), where('custom_domain', '==', cleanDomain));
      const profSnap = await getDocs(qProfiles);
      if (!profSnap.empty) {
        const profDoc = profSnap.docs[0];
        const profile = await this.getProfile(profDoc.id);
        if (profile) {
          const links = await this.getLinks(profDoc.id);
          return { profile, links };
        }
      }
    } catch (err) {
      console.warn('Domain lookup query notice:', err);
    }

    return null;
  },

  // 6c. Save & Bind Custom Domain to User Account
  async saveCustomDomain(userId: string, domain: string): Promise<void> {
    const cleanDomain = (domain || '').toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    try {
      if (cleanDomain) {
        await setDoc(
          doc(db, 'domains', cleanDomain),
          sanitizeForFirestore({
            domain: cleanDomain,
            userId,
            pageId: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
          { merge: true }
        );
      }

      await setDoc(
        doc(db, 'pages', userId),
        sanitizeForFirestore({
          customDomain: cleanDomain,
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      );

      await setDoc(
        doc(db, 'profiles', userId),
        sanitizeForFirestore({
          custom_domain: cleanDomain,
          updated_at: new Date().toISOString(),
        }),
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `domains/${cleanDomain}`);
    }
  },

  // 6d. Save & Persist Account Settings & Preferences
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

      await setDoc(
        doc(db, 'profiles', userId),
        sanitizeForFirestore({
          accountSettings: settings,
          custom_domain: settings.privacy?.customDomain || '',
          updated_at: new Date().toISOString(),
        }),
        { merge: true }
      );

      if (settings.privacy?.customDomain) {
        await this.saveCustomDomain(userId, settings.privacy.customDomain);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/preferences`);
    }
  },

  // 7. Update Profile & Page
  async updateProfile(userId: string, updates: Partial<DbProfile>) {
    try {
      const currentProfile = await this.getProfile(userId);
      if (updates.username && currentProfile?.username && currentProfile.username !== updates.username) {
        const cleanOld = (currentProfile.username || '').toLowerCase();
        const cleanNew = (updates.username || '').toLowerCase();
        if (cleanOld) {
          await deleteDoc(doc(db, 'usernames', cleanOld)).catch(() => {});
        }
        if (cleanNew) {
          await setDoc(doc(db, 'usernames', cleanNew), { userId, pageId: userId, username: cleanNew });
        }
      } else if (updates.username && (!currentProfile?.username || currentProfile.username !== updates.username)) {
        const cleanNew = (updates.username || '').toLowerCase();
        if (cleanNew) {
          await setDoc(doc(db, 'usernames', cleanNew), { userId, pageId: userId, username: cleanNew });
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
      if (updates.custom_domain !== undefined) (pageUpdates as any).customDomain = updates.custom_domain;
      pageUpdates.updatedAt = serverTimestamp();

      await setDoc(doc(db, 'pages', userId), sanitizeForFirestore(pageUpdates), { merge: true });
      await setDoc(
        doc(db, 'users', userId),
        sanitizeForFirestore({
          ...(updates.full_name ? { displayName: updates.full_name } : {}),
          ...(updates.avatar_url ? { photoURL: updates.avatar_url } : {}),
          ...(updates.username ? { username: updates.username } : {}),
          ...(updates.plan ? { plan: updates.plan } : {}),
          ...(updates.accountSettings ? { accountSettings: updates.accountSettings } : {}),
          updatedAt: serverTimestamp(),
        }),
        { merge: true }
      );
      await setDoc(doc(db, 'profiles', userId), sanitizeForFirestore({ ...updates, id: userId }), { merge: true });

      if (updates.custom_domain) {
        await this.saveCustomDomain(userId, updates.custom_domain);
      }
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
    } catch (err) {
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
  async recordClick(linkId: string, pageId?: string, visitorId?: string) {
    const targetPageId = pageId || auth.currentUser?.uid;
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    try {
      // 1. Increment click count in subcollection and root
      if (targetPageId) {
        await updateDoc(doc(db, 'pages', targetPageId, 'links', linkId), {
          clickCount: increment(1),
        }).catch(() => {});

        // 2. Create immutable analytics event at pages/{pageId}/analytics/{eventId}
        await setDoc(doc(db, 'pages', targetPageId, 'analytics', eventId), {
          type: 'link_click',
          linkId: linkId,
          visitorId: visitorId || 'anonymous-id',
          country: 'IN',
          device: window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
          referrer: document.referrer || 'direct',
          timestamp: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, 'links', linkId), {
        clicks: increment(1),
      }).catch(() => {});
    } catch (err) {
      console.warn('Click event logged with notice:', err);
    }
  },

  // 12. Record Page View Event (pages/{pageId}/analytics/{eventId})
  async recordPageView(pageId: string, visitorId?: string) {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    try {
      await setDoc(doc(db, 'pages', pageId, 'analytics', eventId), {
        type: 'page_view',
        linkId: null,
        visitorId: visitorId || 'anonymous-id',
        country: 'IN',
        device: window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Safari',
        referrer: document.referrer || 'direct',
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Page view event logged with notice:', err);
    }
  },

  // View tracking alias
  async recordView(pageId: string, visitorId?: string) {
    return this.recordPageView(pageId, visitorId);
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

  // 18. Get Real-Time Analytics Summary & Specialized Vertical Metrics
  async getAnalyticsSummary(pageId: string) {
    try {
      const snap = await getDocs(collection(db, 'pages', pageId, 'analytics'));
      let totalViews = 0;
      let totalClicks = 0;
      let propertyViews = 0;
      let showingRequests = 0;
      let homeValuations = 0;
      let brandInquiries = 0;
      let mediaKitDownloads = 0;
      let packageClicks = 0;

      const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
      const referrerCounts: Record<string, number> = {};
      const linkClickCounts: Record<string, number> = {};

      snap.forEach((d) => {
        const data = d.data();
        const eventType = data.type;
        if (eventType === 'page_view') {
          totalViews++;
        } else if (eventType === 'link_click') {
          totalClicks++;
          if (data.linkId) {
            linkClickCounts[data.linkId] = (linkClickCounts[data.linkId] || 0) + 1;
          }
        } else if (eventType === 'property_view') {
          propertyViews++;
        } else if (eventType === 'showing_request') {
          showingRequests++;
        } else if (eventType === 'home_valuation') {
          homeValuations++;
        } else if (eventType === 'brand_inquiry') {
          brandInquiries++;
        } else if (eventType === 'media_kit_download') {
          mediaKitDownloads++;
        } else if (eventType === 'package_booking') {
          packageClicks++;
        }

        const dev = (data.device || 'mobile').toLowerCase();
        if (deviceCounts[dev] !== undefined) {
          deviceCounts[dev]++;
        } else {
          deviceCounts.mobile++;
        }

        const ref = data.referrer || 'direct';
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      });

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
        packageClicks,
        deviceCounts,
        referrerCounts,
        linkClickCounts,
      };
    } catch (err) {
      console.warn('Could not read analytics collection:', err);
      return null;
    }
  },

  // -------------------------------------------------------------
  // 18.1 Leads & Inquiries CRM Management
  // -------------------------------------------------------------

  // Submit Lead (Public visitor: Showing Request, Brand Inquiry, Home Valuation)
  async submitLead(
    pageId: string,
    lead: {
      type: 'showing_request' | 'brand_inquiry' | 'home_valuation' | 'general_contact' | 'media_kit_download' | 'package_booking';
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
    }
  ): Promise<any> {
    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const nowIso = new Date().toISOString();

    const record = sanitizeForFirestore({
      id: leadId,
      pageId,
      ...lead,
      status: 'new',
      createdAt: nowIso,
      serverTimestamp: serverTimestamp(),
    });

    try {
      // 1. Write to creator subcollection: pages/{pageId}/leads/{leadId}
      await setDoc(doc(db, 'pages', pageId, 'leads', leadId), record);
      // 2. Root fallback collection
      await setDoc(doc(db, 'leads', leadId), record).catch(() => {});
      // 3. Record specialized analytics event
      await setDoc(doc(db, 'pages', pageId, 'analytics', `evt_${leadId}`), {
        type: lead.type,
        linkId: null,
        visitorId: 'lead-visitor',
        country: 'IN',
        device: window.innerWidth < 640 ? 'mobile' : 'desktop',
        referrer: document.referrer || 'direct',
        timestamp: serverTimestamp(),
      }).catch(() => {});

      return record;
    } catch (err) {
      console.warn('Notice: lead submit write:', err);
      return record;
    }
  },

  // Get all leads for page owner
  async getLeads(pageId: string): Promise<any[]> {
    try {
      // 1. Try subcollection
      const snap = await getDocs(collection(db, 'pages', pageId, 'leads'));
      if (!snap.empty) {
        const leads: any[] = [];
        snap.forEach((d) => leads.push({ id: d.id, ...d.data() }));
        return leads.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }

      // 2. Fallback to root collection
      const q = query(collection(db, 'leads'), where('pageId', '==', pageId));
      const rootSnap = await getDocs(q);
      const leads: any[] = [];
      rootSnap.forEach((d) => leads.push({ id: d.id, ...d.data() }));
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
      await updateDoc(doc(db, 'leads', leadId), updates).catch(() => {});
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
      await deleteDoc(doc(db, 'leads', leadId)).catch(() => {});
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
      // 1. Write to user subcollection
      await setDoc(doc(db, 'users', userId, 'subscriptions', 'current'), record);
      // 2. Write to root collection for fast querying
      await setDoc(doc(db, 'subscriptions', userId), record).catch(() => {});
      // 3. Update profile plan
      await updateDoc(doc(db, 'profiles', userId), { plan: record.plan }).catch(() => {});
      await updateDoc(doc(db, 'users', userId), { plan: record.plan }).catch(() => {});

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
      await setDoc(doc(db, 'payments', invoiceId), fullInvoice).catch(() => {});
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

  // Cancel subscription
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'users', userId, 'subscriptions', 'current'), {
        cancelAtPeriodEnd: true,
        canceledAt: now,
      });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/subscriptions/current`);
      return false;
    }
  },
};
