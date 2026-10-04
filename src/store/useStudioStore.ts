import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserProfile, ProfileCardData } from '../types';
import { DEFAULT_STARTER_PROFILE } from '../data';
import { SidebarTabKey } from '../components/BuilderSidebar';
import { AccountSubTab } from '../components/AccountSettings';
import { profileService, DbProfile, DbSection } from '../lib/firebase';
import { linkToCard, cardToLinkDoc } from '../lib/mappers';
import { checkUserOnboardingEligibility } from '../lib/onboardingService';
import { resolveRoute, getRouteTarget } from '../lib/routing';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type AppMode = 'landing' | 'studio' | 'preview_only' | 'public' | 'terms' | 'privacy' | 'contact';

export const STORAGE_KEY = 'linklyra_user_profile_v2';

export function createFreshUserProfile(user: User, claimedHandle?: string | null): UserProfile {
  const emailPrefix = user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') : '';
  const cleanUsername = (claimedHandle || emailPrefix || `creator_${user.uid.slice(0, 5)}`).toLowerCase();
  const cleanDisplayName = user.displayName || emailPrefix || 'My Page';

  return {
    id: user.uid,
    email: user.email || '',
    username: cleanUsername,
    name: cleanDisplayName,
    headline: 'Digital Creator & Entrepreneur',
    avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    theme: 'warm',
    fontFamily: 'plus-jakarta',
    buttonStyle: 'rounded',
    backgroundType: 'color',
    backgroundValue: '#FDFBF7',
    socials: {},
    sections: [],
    cards: [],
    plan: 'free',
  };
}

function getInitialProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading localStorage', e);
  }
  return DEFAULT_STARTER_PROFILE;
}

function getInitialAppMode(): AppMode {
  const route = resolveRoute();
  if (route === 'terms') return 'terms';
  if (route === 'privacy') return 'privacy';
  if (route === 'contact') return 'contact';
  if (route === 'profile' || route === 'domain' || route === '404') return 'public';
  if (route === 'studio') return 'studio';
  return 'landing';
}

export interface StudioState {
  // Navigation & Mode
  appMode: AppMode;
  routeTarget: string | null;
  activeSidebarTab: SidebarTabKey;
  previewDevice: 'mobile' | 'desktop';

  // Auth & Sync
  currentUser: User | null;
  isAuthChecking: boolean;
  isSyncing: boolean;
  saveStatus: SaveStatus;
  lastFailedAction: (() => void) | null;
  pendingClaimedHandle: string | null;

  // Profile Data
  profile: UserProfile;

  // Modals & Panels
  isModalOpen: boolean;
  editingCard: ProfileCardData | null;
  isAuthModalOpen: boolean;
  isOnboardingOpen: boolean;
  isAccountModalOpen: boolean;
  accountModalInitialTab: AccountSubTab;
  isProModalOpen: boolean;
  proLockedFeature: string;

  // Setters
  setAppMode: (mode: AppMode) => void;
  setActiveSidebarTab: (tab: SidebarTabKey) => void;
  setPreviewDevice: (device: 'mobile' | 'desktop') => void;
  setCurrentUser: (user: User | null) => void;
  setIsAuthChecking: (checking: boolean) => void;
  setProfile: (updater: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  setEditingCard: (card: ProfileCardData | null) => void;
  setIsModalOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsOnboardingOpen: (open: boolean) => void;
  setIsAccountModalOpen: (open: boolean) => void;
  setAccountModalInitialTab: (tab: AccountSubTab) => void;
  setIsProModalOpen: (open: boolean) => void;
  setProLockedFeature: (feature: string) => void;
  setPendingClaimedHandle: (handle: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setLastFailedAction: (action: (() => void) | null) => void;

  // Actions
  loadUserData: (user: User, pendingClaimedHandle?: string | null) => Promise<void>;
  saveCard: (card: ProfileCardData, onError?: (err: unknown, retry: () => void) => void) => Promise<void>;
  deleteCard: (id: string, onError?: (err: unknown, retry: () => void) => void) => Promise<void>;
  toggleCardActive: (id: string, onError?: (err: unknown, retry: () => void) => void) => Promise<void>;
  reorderCards: (newCards: ProfileCardData[], onError?: (err: unknown, retry: () => void) => void) => Promise<void>;
  moveCard: (index: number, direction: 'up' | 'down', onError?: (err: unknown, retry: () => void) => void) => Promise<void>;
  addSection: (title: string, onError?: (err: unknown, retry: () => void) => void) => Promise<void>;
  deleteSection: (sectionId: string, onError?: (err: unknown, retry: () => void) => void) => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>, onError?: (err: unknown, retry: () => void) => void) => Promise<void>;
  manualSave: (onSuccess?: () => void, onError?: (err: unknown, retry: () => void) => void) => Promise<void>;
  resetLinks: (onError?: (err: unknown, retry: () => void) => void) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  // Navigation & Mode
  appMode: getInitialAppMode(),
  routeTarget: getRouteTarget(),
  activeSidebarTab: 'links',
  previewDevice: 'mobile',

  // Auth & Sync
  currentUser: null,
  isAuthChecking: true,
  isSyncing: false,
  saveStatus: 'idle',
  lastFailedAction: null,
  pendingClaimedHandle: null,

  // Profile Data
  profile: getInitialProfile(),

  // Modals & Panels
  isModalOpen: false,
  editingCard: null,
  isAuthModalOpen: false,
  isOnboardingOpen: false,
  isAccountModalOpen: false,
  accountModalInitialTab: 'profile',
  isProModalOpen: false,
  proLockedFeature: 'LinkLyra Pro',

  // Basic Setters
  setAppMode: (mode) => set({ appMode: mode }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setPreviewDevice: (device) => set({ previewDevice: device }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setIsAuthChecking: (checking) => set({ isAuthChecking: checking }),
  setProfile: (updater) =>
    set((state) => {
      const nextProfile = typeof updater === 'function' ? updater(state.profile) : updater;
      // Persist to user-scoped cache
      if (state.currentUser) {
        try {
          localStorage.setItem(`${STORAGE_KEY}_${state.currentUser.uid}`, JSON.stringify(nextProfile));
        } catch (_) {}
      }
      return { profile: nextProfile };
    }),
  setEditingCard: (card) => set({ editingCard: card }),
  setIsModalOpen: (open) => set({ isModalOpen: open }),
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setIsOnboardingOpen: (open) => set({ isOnboardingOpen: open }),
  setIsAccountModalOpen: (open) => set({ isAccountModalOpen: open }),
  setAccountModalInitialTab: (tab) => set({ accountModalInitialTab: tab }),
  setIsProModalOpen: (open) => set({ isProModalOpen: open }),
  setProLockedFeature: (feature) => set({ proLockedFeature: feature }),
  setPendingClaimedHandle: (handle) => set({ pendingClaimedHandle: handle }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setLastFailedAction: (action) => set({ lastFailedAction: action }),

  // Load User Data & Cloud Hydration
  loadUserData: async (user: User, pendingClaimedHandle?: string | null) => {
    set({ isSyncing: true, currentUser: user });
    try {
      const dbProf = await profileService.getProfile(user.uid);
      const dbLinks = await profileService.getLinks(user.uid);
      const dbSections = await profileService.getSections(user.uid);

      const eligibility = await checkUserOnboardingEligibility(user.uid, dbProf, dbLinks?.length || 0);

      if (dbProf) {
        const isAgency = dbProf.plan === 'agency' || dbProf.role === 'agency';
        const resolvedAvatar =
          dbProf.avatar_url && !dbProf.avatar_url.includes('unsplash.com')
            ? dbProf.avatar_url
            : user.photoURL || dbProf.avatar_url || '';

        if (user.photoURL && (!dbProf.avatar_url || dbProf.avatar_url.includes('unsplash.com'))) {
          profileService.updateProfile(user.uid, { avatar_url: user.photoURL }).catch(() => {});
        }

        const hydratedProfile: UserProfile = {
          id: dbProf.id,
          name: dbProf.full_name || 'My Page',
          headline: dbProf.bio || '',
          avatarUrl: resolvedAvatar,
          username: dbProf.username || `creator_${user.uid.slice(0, 5)}`,
          businessPhone: dbProf.business_phone,
          theme: dbProf.theme || 'warm',
          fontFamily: dbProf.font_family,
          buttonStyle: dbProf.button_style,
          backgroundType: dbProf.background_type,
          backgroundValue: dbProf.background_value,
          cardStyle: dbProf.card_style || 'fill',
          wallpaperMode: dbProf.wallpaper_mode || 'color',
          wallpaperTint: dbProf.wallpaper_tint ?? 20,
          cardBgColor: dbProf.card_bg_color,
          cardTextColor: dbProf.card_text_color,
          buttonColor: dbProf.button_color,
          stickers: dbProf.stickers || [],
          footerSettings: dbProf.footer_settings,
          socials: dbProf.socials || {},
          plan: isAgency ? 'agency' : (dbProf.plan || 'free'),
          customDomain: dbProf.custom_domain || '',
          accountSettings: dbProf.accountSettings,
          sections: dbSections || [],
          cards: (dbLinks || []).map(linkToCard),
        };

        set({
          profile: hydratedProfile,
          isOnboardingOpen: eligibility.needsOnboarding,
        });
      } else {
        const userKey = `${STORAGE_KEY}_${user.uid}`;
        let userScopedData: UserProfile | null = null;
        try {
          const saved = localStorage.getItem(userKey);
          if (saved) userScopedData = JSON.parse(saved);
        } catch (_) {}

        if (userScopedData && userScopedData.id === user.uid) {
          set({
            profile: userScopedData,
            isOnboardingOpen: eligibility.needsOnboarding,
          });
        } else {
          const freshProfile = createFreshUserProfile(user, pendingClaimedHandle);
          set({
            profile: freshProfile,
            isOnboardingOpen: true,
          });
        }
      }
    } catch (err: any) {
      console.warn('Notice syncing from Cloud Firestore (operating in cached mode):', err?.message || err);
      const userKey = `${STORAGE_KEY}_${user.uid}`;
      try {
        const saved = localStorage.getItem(userKey);
        if (saved) {
          const userScopedData = JSON.parse(saved);
          if (userScopedData && userScopedData.id === user.uid) {
            set({ profile: userScopedData });
          }
        }
      } catch (_) {}
    } finally {
      set({ isSyncing: false, isAuthChecking: false });
    }
  },

  // Save Card (Add or Update) with Optimistic UI & Rollback
  saveCard: async (savedCard, onError) => {
    const { profile, editingCard, currentUser } = get();
    const prevProfile = profile;
    const isEditing = Boolean(editingCard);

    if (isEditing) {
      set({
        profile: {
          ...profile,
          cards: profile.cards.map((c) => (c.id === savedCard.id ? savedCard : c)),
        },
      });

      if (currentUser) {
        set({ isSyncing: true, saveStatus: 'saving' });
        try {
          const targetIndex = profile.cards.findIndex((c) => c.id === savedCard.id);
          const linkDoc = cardToLinkDoc(savedCard, targetIndex >= 0 ? targetIndex : 0, currentUser.uid);
          await profileService.updateLink(savedCard.id, linkDoc);
          set({ saveStatus: 'saved' });
        } catch (err) {
          set({ profile: prevProfile, saveStatus: 'error' });
          const retry = () => get().saveCard(savedCard, onError);
          set({ lastFailedAction: retry });
          onError?.(err, retry);
        } finally {
          set({ isSyncing: false });
        }
      }
    } else {
      const tempId = savedCard.id || `card_${Date.now()}`;
      const tempCard = { ...savedCard, id: tempId };
      set({
        profile: {
          ...profile,
          cards: [...profile.cards, tempCard],
        },
      });

      if (currentUser) {
        set({ isSyncing: true, saveStatus: 'saving' });
        try {
          const linkDoc = cardToLinkDoc(savedCard, profile.cards.length, currentUser.uid);
          const newDoc = await profileService.addLink(currentUser.uid, linkDoc);
          set((state) => ({
            profile: {
              ...state.profile,
              cards: state.profile.cards.map((c) => (c.id === tempId ? { ...c, id: newDoc.id } : c)),
            },
            saveStatus: 'saved',
          }));
        } catch (err) {
          set({ profile: prevProfile, saveStatus: 'error' });
          const retry = () => get().saveCard(savedCard, onError);
          set({ lastFailedAction: retry });
          onError?.(err, retry);
        } finally {
          set({ isSyncing: false });
        }
      }
    }
  },

  // Delete Card with Optimistic UI & Rollback
  deleteCard: async (id, onError) => {
    const { profile, currentUser } = get();
    const prevProfile = profile;
    set({
      profile: {
        ...profile,
        cards: profile.cards.filter((c) => c.id !== id),
      },
    });

    if (currentUser) {
      set({ isSyncing: true, saveStatus: 'saving' });
      try {
        await profileService.deleteLink(id);
        set({ saveStatus: 'saved' });
      } catch (err) {
        set({ profile: prevProfile, saveStatus: 'error' });
        const retry = () => get().deleteCard(id, onError);
        set({ lastFailedAction: retry });
        onError?.(err, retry);
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  // Toggle Card Active State
  toggleCardActive: async (id, onError) => {
    const { profile, currentUser } = get();
    const prevProfile = profile;
    const targetCard = profile.cards.find((c) => c.id === id);
    const newStatus = targetCard ? targetCard.isActive === false : false;

    set({
      profile: {
        ...profile,
        cards: profile.cards.map((c) => (c.id === id ? { ...c, isActive: newStatus } : c)),
      },
    });

    if (currentUser) {
      set({ isSyncing: true, saveStatus: 'saving' });
      try {
        await profileService.updateLink(id, { is_active: newStatus });
        set({ saveStatus: 'saved' });
      } catch (err) {
        set({ profile: prevProfile, saveStatus: 'error' });
        const retry = () => get().toggleCardActive(id, onError);
        set({ lastFailedAction: retry });
        onError?.(err, retry);
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  // Reorder Cards
  reorderCards: async (newCards, onError) => {
    const { profile, currentUser } = get();
    const prevProfile = profile;
    set({
      profile: {
        ...profile,
        cards: newCards,
      },
    });

    if (currentUser) {
      set({ isSyncing: true, saveStatus: 'saving' });
      try {
        await profileService.reorderLinks(
          currentUser.uid,
          newCards.map((c) => c.id)
        );
        set({ saveStatus: 'saved' });
      } catch (err) {
        set({ profile: prevProfile, saveStatus: 'error' });
        const retry = () => get().reorderCards(newCards, onError);
        set({ lastFailedAction: retry });
        onError?.(err, retry);
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  // Move Card Up or Down
  moveCard: async (index, direction, onError) => {
    const { profile, reorderCards } = get();
    const newCards = [...profile.cards];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCards.length) return;

    const temp = newCards[index];
    newCards[index] = newCards[targetIndex];
    newCards[targetIndex] = temp;

    await reorderCards(newCards, onError);
  },

  // Add Section
  addSection: async (title, onError) => {
    const { profile, currentUser } = get();
    const prevProfile = profile;
    const tempId = `sec_${Date.now()}`;
    const newSec: DbSection = {
      id: tempId,
      title,
      position: (profile.sections || []).length,
      is_visible: true,
    };

    set({
      profile: {
        ...profile,
        sections: [...(profile.sections || []), newSec],
      },
    });

    if (currentUser) {
      set({ isSyncing: true, saveStatus: 'saving' });
      try {
        const doc = await profileService.addSection(currentUser.uid, {
          title,
          position: (profile.sections || []).length,
          is_visible: true,
        });
        set((state) => ({
          profile: {
            ...state.profile,
            sections: (state.profile.sections || []).map((s) => (s.id === tempId ? { ...s, id: doc.id } : s)),
          },
          saveStatus: 'saved',
        }));
      } catch (err) {
        set({ profile: prevProfile, saveStatus: 'error' });
        const retry = () => get().addSection(title, onError);
        set({ lastFailedAction: retry });
        onError?.(err, retry);
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  // Delete Section
  deleteSection: async (sectionId, onError) => {
    const { profile, currentUser } = get();
    const prevProfile = profile;
    set({
      profile: {
        ...profile,
        sections: (profile.sections || []).filter((s) => s.id !== sectionId),
        cards: profile.cards.map((c) => (c.sectionId === sectionId ? { ...c, sectionId: undefined } : c)),
      },
    });

    if (currentUser) {
      set({ isSyncing: true, saveStatus: 'saving' });
      try {
        await profileService.deleteSection(sectionId);
        set({ saveStatus: 'saved' });
      } catch (err) {
        set({ profile: prevProfile, saveStatus: 'error' });
        const retry = () => get().deleteSection(sectionId, onError);
        set({ lastFailedAction: retry });
        onError?.(err, retry);
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  // Update Profile Attributes
  updateProfile: async (updated, onError) => {
    const { profile, currentUser } = get();
    const prevProfile = profile;
    set({
      profile: {
        ...profile,
        ...updated,
      },
    });

    if (currentUser) {
      set({ isSyncing: true, saveStatus: 'saving' });
      try {
        const updates: Partial<DbProfile> = {};
        if (updated.name !== undefined) updates.full_name = updated.name;
        if (updated.headline !== undefined) updates.bio = updated.headline;
        if (updated.avatarUrl !== undefined) updates.avatar_url = updated.avatarUrl;
        if (updated.username !== undefined) updates.username = updated.username;
        if (updated.businessPhone !== undefined) updates.business_phone = updated.businessPhone;
        if (updated.theme !== undefined) updates.theme = updated.theme;
        if (updated.fontFamily !== undefined) updates.font_family = updated.fontFamily;
        if (updated.buttonStyle !== undefined) updates.button_style = updated.buttonStyle;
        if (updated.backgroundType !== undefined) updates.background_type = updated.backgroundType;
        if (updated.backgroundValue !== undefined) updates.background_value = updated.backgroundValue;
        if (updated.cardStyle !== undefined) updates.card_style = updated.cardStyle;
        if (updated.wallpaperMode !== undefined) updates.wallpaper_mode = updated.wallpaperMode;
        if (updated.wallpaperTint !== undefined) updates.wallpaper_tint = updated.wallpaperTint;
        if (updated.cardBgColor !== undefined) updates.card_bg_color = updated.cardBgColor;
        if (updated.cardTextColor !== undefined) updates.card_text_color = updated.cardTextColor;
        if (updated.buttonColor !== undefined) updates.button_color = updated.buttonColor;
        if (updated.stickers !== undefined) updates.stickers = updated.stickers;
        if (updated.footerSettings !== undefined) updates.footer_settings = updated.footerSettings;
        if (updated.socials !== undefined) updates.socials = updated.socials;
        if (updated.customDomain !== undefined) updates.custom_domain = updated.customDomain;
        if (updated.accountSettings !== undefined) updates.accountSettings = updated.accountSettings;

        await profileService.updateProfile(currentUser.uid, updates);
        set({ saveStatus: 'saved' });
      } catch (err) {
        set({ profile: prevProfile, saveStatus: 'error' });
        const retry = () => get().updateProfile(updated, onError);
        set({ lastFailedAction: retry });
        onError?.(err, retry);
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  // Manual Save Trigger
  manualSave: async (onSuccess, onError) => {
    const { profile, currentUser } = get();
    const prevProfile = profile;
    set({ saveStatus: 'saving', isSyncing: true });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      if (currentUser) {
        const updates: Partial<DbProfile> = {
          full_name: profile.name,
          bio: profile.headline,
          avatar_url: profile.avatarUrl,
          username: profile.username,
          business_phone: profile.businessPhone,
          theme: profile.theme,
          font_family: profile.fontFamily,
          button_style: profile.buttonStyle,
          background_type: profile.backgroundType,
          background_value: profile.backgroundValue,
          card_style: profile.cardStyle,
          wallpaper_mode: profile.wallpaperMode,
          wallpaper_tint: profile.wallpaperTint,
          card_bg_color: profile.cardBgColor,
          card_text_color: profile.cardTextColor,
          button_color: profile.buttonColor,
          stickers: profile.stickers,
          footer_settings: profile.footerSettings,
          socials: profile.socials,
          custom_domain: profile.customDomain,
          accountSettings: profile.accountSettings,
        };
        await profileService.updateProfile(currentUser.uid, updates);
      }
      set({ saveStatus: 'saved' });
      onSuccess?.();
    } catch (err) {
      set({ profile: prevProfile, saveStatus: 'error' });
      const retry = () => get().manualSave(onSuccess, onError);
      set({ lastFailedAction: retry });
      onError?.(err, retry);
      throw err;
    } finally {
      set({ isSyncing: false });
    }
  },

  // Reset Links to Starter Templates
  resetLinks: async (onError) => {
    const { profile, currentUser } = get();
    const prevProfile = profile;
    set({
      profile: {
        ...profile,
        cards: DEFAULT_STARTER_PROFILE.cards,
      },
    });

    if (currentUser) {
      set({ isSyncing: true, saveStatus: 'saving' });
      try {
        const existing = await profileService.getLinks(currentUser.uid);
        for (const l of existing) {
          await profileService.deleteLink(l.id);
        }
        for (let i = 0; i < DEFAULT_STARTER_PROFILE.cards.length; i++) {
          const c = DEFAULT_STARTER_PROFILE.cards[i];
          await profileService.addLink(currentUser.uid, {
            title: c.title,
            subtitle: c.subtitle || '',
            link_url: c.linkUrl,
            color: c.color,
            logo_url: c.logoSrc || '',
            badge_text: c.badgeText || '',
            expanded: c.expanded,
            is_active: c.isActive,
            template_type: c.templateType,
            display_order: i,
          });
        }
        set({ saveStatus: 'saved' });
      } catch (err) {
        set({ profile: prevProfile, saveStatus: 'error' });
        const retry = () => get().resetLinks(onError);
        set({ lastFailedAction: retry });
        onError?.(err, retry);
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  // Sign Out Clean Reset
  signOut: async () => {
    try {
      await profileService.signOut();
      set({
        currentUser: null,
        profile: DEFAULT_STARTER_PROFILE,
        isOnboardingOpen: false,
        isAccountModalOpen: false,
        isAuthModalOpen: false,
        appMode: 'landing',
      });
    } catch (e) {
      console.error('Sign out error:', e);
    }
  },
}));
