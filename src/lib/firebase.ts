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
import { CardColor, CardTemplateType, SocialLinks, CanvasTheme } from '../types';

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
  linkType: 'url' | 'youtube' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'spotify' | 'product' | 'email' | 'phone' | 'real_estate' | 'coaching';
  color?: CardColor;
  badgeText?: string;
  position: number;
  isActive: boolean;
  openInNewTab: boolean;
  sectionId: string | null;
  clickCount: number;
  realEstate?: any;
  coaching?: any;
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
  button_style?: 'rounded' | 'square' | 'pill' | 'glass';
  background_type?: 'color' | 'gradient' | 'image';
  background_value?: string;
  socials?: SocialLinks;
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
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

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

  // 5. Get User Profile & Page
  async getProfile(userId: string): Promise<DbProfile | null> {
    try {
      // Check pages/{pageId} first
      const pageSnap = await getDoc(doc(db, 'pages', userId));
      if (pageSnap.exists()) {
        const pageData = pageSnap.data() as FirestorePage;
        return {
          id: userId,
          username: pageData.username,
          full_name: pageData.title,
          bio: pageData.bio || '',
          avatar_url: pageData.avatarUrl || '',
          business_phone: pageData.businessPhone,
          theme: (pageData.themeId as any) || 'warm',
          font_family: pageData.fontFamily,
          button_style: pageData.buttonStyle,
          background_type: pageData.backgroundType,
          background_value: pageData.backgroundValue,
        };
      }

      // Check profiles/{userId} fallback
      const snap = await getDoc(doc(db, 'profiles', userId));
      if (snap.exists()) {
        return snap.data() as DbProfile;
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

  // 7. Update Profile & Page
  async updateProfile(userId: string, updates: Partial<DbProfile>) {
    try {
      const currentProfile = await this.getProfile(userId);
      if (updates.username && currentProfile && currentProfile.username !== updates.username) {
        const cleanOld = currentProfile.username.toLowerCase();
        const cleanNew = updates.username.toLowerCase();
        await deleteDoc(doc(db, 'usernames', cleanOld));
        await setDoc(doc(db, 'usernames', cleanNew), { userId, pageId: userId, username: cleanNew });
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
      pageUpdates.updatedAt = serverTimestamp();

      await setDoc(doc(db, 'pages', userId), pageUpdates, { merge: true });
      await setDoc(
        doc(db, 'users', userId),
        {
          ...(updates.full_name ? { displayName: updates.full_name } : {}),
          ...(updates.avatar_url ? { photoURL: updates.avatar_url } : {}),
          ...(updates.username ? { username: updates.username } : {}),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await setDoc(doc(db, 'profiles', userId), { ...updates, id: userId }, { merge: true });
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
            expanded: l.linkType === 'real_estate' || l.linkType === 'coaching',
            is_active: l.isActive ?? true,
            clicks: l.clickCount ?? 0,
            display_order: l.position ?? 0,
            template_type: (l.linkType as any) || 'standard',
            real_estate: l.realEstate,
            coaching: l.coaching,
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

    const firestoreLink: FirestoreLink = {
      title: link.title,
      url: link.link_url,
      description: link.subtitle || '',
      icon: link.logo_url || 'globe',
      thumbnailUrl: link.logo_url || '',
      linkType: (link.template_type as any) || 'url',
      color: link.color,
      badgeText: link.badge_text || '',
      position: link.display_order ?? 0,
      isActive: link.is_active ?? true,
      openInNewTab: true,
      sectionId: link.section_id || null,
      clickCount: 0,
      realEstate: link.real_estate,
      coaching: link.coaching,
      customWhatsappPhone: link.custom_whatsapp_phone,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const rootLink: DbLink = {
      id: newLinkId,
      profile_id: pageId,
      section_id: link.section_id || null,
      title: link.title,
      subtitle: link.subtitle || '',
      link_url: link.link_url,
      color: link.color,
      logo_url: link.logo_url || '',
      badge_text: link.badge_text || '',
      expanded: link.expanded ?? false,
      is_active: link.is_active ?? true,
      clicks: 0,
      display_order: link.display_order ?? 0,
      template_type: link.template_type || 'standard',
      real_estate: link.real_estate,
      coaching: link.coaching,
      custom_whatsapp_phone: link.custom_whatsapp_phone,
      created_at: new Date().toISOString(),
    };

    try {
      // Write to subcollection: pages/{pageId}/links/{linkId}
      await setDoc(doc(db, 'pages', pageId, 'links', newLinkId), firestoreLink);
      // Write to root: links/{linkId}
      await setDoc(doc(db, 'links', newLinkId), rootLink);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `pages/${pageId}/links/${newLinkId}`);
    }

    return rootLink;
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

      if (pageId) {
        await setDoc(doc(db, 'pages', pageId, 'links', linkId), subUpdates, { merge: true }).catch(() => {});
      }
      await updateDoc(doc(db, 'links', linkId), updates);
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
        batch.update(subRef, { position: index });
        const rootRef = doc(db, 'links', id);
        batch.update(rootRef, { display_order: index });
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

  // 18. Get Real-Time Analytics Summary
  async getAnalyticsSummary(pageId: string) {
    try {
      const snap = await getDocs(collection(db, 'pages', pageId, 'analytics'));
      let totalViews = 0;
      let totalClicks = 0;
      const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
      const referrerCounts: Record<string, number> = {};
      const linkClickCounts: Record<string, number> = {};

      snap.forEach((d) => {
        const data = d.data();
        if (data.type === 'page_view') {
          totalViews++;
        } else if (data.type === 'link_click') {
          totalClicks++;
          if (data.linkId) {
            linkClickCounts[data.linkId] = (linkClickCounts[data.linkId] || 0) + 1;
          }
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
        deviceCounts,
        referrerCounts,
        linkClickCounts,
      };
    } catch (err) {
      console.warn('Could not read analytics collection:', err);
      return null;
    }
  },
};
