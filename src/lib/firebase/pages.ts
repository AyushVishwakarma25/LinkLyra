import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  auth,
  db,
  functions,
  sanitizeForFirestore,
  handleFirestoreError,
  OperationType,
  DbProfile,
  DbLink,
  FirestorePage,
  FirestoreUser,
} from './app';
import { pageToProfile } from '../mappers';
import { linksService } from './links';
import { UserAccountSettings } from '../../types';

export const pagesService = {
  // Canonical Page / Profile retrieval: pages/{userId} and users/{userId}
  async getProfile(userId: string): Promise<DbProfile | null> {
    if (!userId) return null;

    try {
      const pageRef = doc(db, 'pages', userId);
      const pageSnap = await getDoc(pageRef);

      let userData: Partial<FirestoreUser> | null = null;
      try {
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (userSnap.exists()) userData = userSnap.data() as FirestoreUser;
      } catch {
        // ignore if user doc cannot be read in background
      }

      if (pageSnap.exists()) {
        const pageData = pageSnap.data() as FirestorePage;
        return pageToProfile({ ...pageData, id: userId }, userData || undefined);
      }

      // If page doesn't exist yet but user does, initialize page
      if (userData) {
        return pageToProfile({ id: userId, username: userData.username }, userData);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('offline') || errMsg.includes('client is offline')) {
        console.warn('Firestore offline notice: Returning null while offline.');
        return null;
      }
      handleFirestoreError(err, OperationType.GET, `pages/${userId}`);
    }

    return null;
  },

  // Public lookup by username
  async getProfileByUsername(
    username: string
  ): Promise<{ profile: DbProfile; links: DbLink[] } | null> {
    if (!username) return null;
    const cleanUsername = username.toLowerCase().trim();

    try {
      // 1. Check usernames index collection
      const userLookupSnap = await getDoc(doc(db, 'usernames', cleanUsername));
      if (userLookupSnap.exists()) {
        const pageId = userLookupSnap.data()?.pageId || userLookupSnap.data()?.userId || userLookupSnap.data()?.uid;
        if (pageId) {
          const profile = await this.getProfile(pageId);
          if (profile) {
            const links = await linksService.getLinks(pageId);
            return { profile, links };
          }
        }
      }

      // 2. Query canonical pages collection where username == cleanUsername
      const qPages = query(collection(db, 'pages'), where('username', '==', cleanUsername), limit(1));
      const qPageSnap = await getDocs(qPages);
      if (!qPageSnap.empty) {
        const pageDoc = qPageSnap.docs[0];
        const pageId = pageDoc.id;
        const pageData = pageDoc.data();
        let userDocData: any = null;
        const targetUserId = pageData.userId || pageId;
        if (targetUserId) {
          try {
            const uSnap = await getDoc(doc(db, 'users', targetUserId));
            if (uSnap.exists()) userDocData = uSnap.data();
          } catch {
            // ignore
          }
        }
        const profile = pageToProfile({ ...pageData, id: pageId }, userDocData || undefined);
        const links = await linksService.getLinks(pageId);
        return { profile, links };
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('offline') || errMsg.includes('client is offline')) {
        console.warn('Firestore offline notice for username lookup:', cleanUsername);
        return null;
      }
      handleFirestoreError(err, OperationType.GET, `usernames/${cleanUsername}`);
    }

    return null;
  },

  // Public lookup by custom domain
  async getProfileByDomain(
    domain: string
  ): Promise<{ profile: DbProfile; links: DbLink[] } | null> {
    if (!domain) return null;
    const cleanDomain = domain.toLowerCase().trim();

    try {
      // 1. Check domains index collection
      const domainSnap = await getDoc(doc(db, 'domains', cleanDomain));
      if (domainSnap.exists()) {
        const pageId = domainSnap.data()?.pageId || domainSnap.data()?.uid || domainSnap.data()?.userId;
        if (pageId) {
          const profile = await this.getProfile(pageId);
          if (profile) {
            const links = await linksService.getLinks(pageId);
            return { profile, links };
          }
        }
      }

      // 2. Query canonical pages collection where customDomain == cleanDomain
      const qPages = query(collection(db, 'pages'), where('customDomain', '==', cleanDomain), limit(1));
      const qPageSnap = await getDocs(qPages);
      if (!qPageSnap.empty) {
        const pageDoc = qPageSnap.docs[0];
        const pageId = pageDoc.id;
        const profile = pageToProfile({ ...pageDoc.data(), id: pageId });
        const links = await linksService.getLinks(pageId);
        return { profile, links };
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('offline') || errMsg.includes('client is offline')) {
        console.warn('Firestore offline notice for domain lookup:', cleanDomain);
        return null;
      }
      handleFirestoreError(err, OperationType.GET, `domains/${cleanDomain}`);
    }

    return null;
  },

  // Update canonical page document (pages/{userId})
  async updateProfile(userId: string, updates: Partial<DbProfile>): Promise<void> {
    const pageUpdates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    // Map public fields to canonical camelCase
    if (updates.full_name !== undefined) pageUpdates.title = updates.full_name;
    if (updates.bio !== undefined) pageUpdates.bio = updates.bio;
    if (updates.avatar_url !== undefined) {
      pageUpdates.avatarUrl = updates.avatar_url;
      pageUpdates.avatar_url = updates.avatar_url;
      pageUpdates.photoURL = updates.avatar_url;
    }
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
    if (updates.socials !== undefined) pageUpdates.socials = updates.socials;
    if (updates.custom_domain !== undefined) pageUpdates.customDomain = updates.custom_domain;
    if (updates.whiteLabel !== undefined) pageUpdates.whiteLabel = updates.whiteLabel;

    try {
      await setDoc(doc(db, 'pages', userId), sanitizeForFirestore(pageUpdates), { merge: true });

      // If user account settings are included, sync them safely to users/{userId} without plan/role
      if (updates.accountSettings !== undefined) {
        const userUpdates: Record<string, unknown> = {
          updatedAt: serverTimestamp(),
          accountSettings: updates.accountSettings,
        };
        await setDoc(doc(db, 'users', userId), sanitizeForFirestore(userUpdates), { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `pages/${userId}`);
    }
  },

  async updateProfileDesign(
    userId: string,
    themeId: string,
    backgroundType: 'color' | 'gradient' | 'image',
    backgroundValue: string,
    fontFamily: string,
    buttonStyle: 'rounded' | 'square' | 'pill' | 'smooth' | 'glass'
  ): Promise<void> {
    await this.updateProfile(userId, {
      theme: themeId as DbProfile['theme'],
      background_type: backgroundType,
      background_value: backgroundValue,
      font_family: fontFamily,
      button_style: buttonStyle,
    });
  },

  async updateWhiteLabelStatus(userId: string, enabled: boolean): Promise<boolean> {
    const setWhiteLabelFn = httpsCallable<{ enabled: boolean }, { success: boolean; whiteLabel: boolean }>(
      functions,
      'setWhiteLabel'
    );
    const res = await setWhiteLabelFn({ enabled });
    return Boolean(res.data.whiteLabel);
  },

  async claimCustomDomain(domain: string): Promise<{ success: boolean; domain: string }> {
    const claimDomainFn = httpsCallable<{ domain: string }, { success: boolean; domain: string }>(
      functions,
      'claimCustomDomain'
    );
    const result = await claimDomainFn({ domain });
    return result.data;
  },

  async releaseCustomDomain(domain?: string): Promise<{ success: boolean }> {
    const releaseDomainFn = httpsCallable<{ domain?: string }, { success: boolean }>(
      functions,
      'releaseCustomDomain'
    );
    const result = await releaseDomainFn({ domain });
    return result.data;
  },

  async checkDomainAvailability(domain: string): Promise<boolean> {
    const clean = domain.trim().toLowerCase();
    const snap = await getDoc(doc(db, 'domains', clean));
    return !snap.exists();
  },

  async updateAccountSettings(userId: string, settings: UserAccountSettings | Record<string, unknown>): Promise<void> {
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
};
