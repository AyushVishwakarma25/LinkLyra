import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ViewIcon,
  PlusSignIcon,
  Link01Icon,
  UserCheck01Icon,
  Share01Icon,
  ColorsIcon,
  UserIcon,
  CloudIcon,
  Home01Icon,
  CrownIcon,
  Mail01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons';
import { UserProfile, ProfileCardData } from './types';
import { DEFAULT_STARTER_PROFILE } from './data';
import { BuilderSidebar, SidebarTabKey } from './components/BuilderSidebar';
import { LivePreview } from './components/LivePreview';
import { CardEditorModal } from './components/CardEditorModal';
import { AuthModal } from './components/AuthModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { LandingPage } from './components/LandingPage';
import { TermsPage, PrivacyPage, ContactPage } from './components/Legal';
import { PublicProfilePage } from './app/[username]/page';
import { AccountSettings, AccountSubTab } from './components/AccountSettings';
import { OnboardingModal } from './components/OnboardingModal';
import { Button, ButtonGroup, SegmentedControl } from './components/ui';
import { profileService, DbProfile } from './lib/firebase';
import { linkToCard, cardToLinkDoc } from './lib/mappers';
import { usePlan } from './hooks/usePlan';
import { checkUserOnboardingEligibility } from './lib/onboardingService';
import { resolveRoute, getRouteTarget } from './lib/routing';
import { safeOpenUrl } from './lib/url';
import { User } from 'firebase/auth';
import { ToastProvider, useToast } from './context/ToastContext';
import { ConfirmProvider } from './components/ConfirmDialog';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const STORAGE_KEY = 'linklyra_user_profile_v2';

function createFreshUserProfile(user: User, claimedHandle?: string | null): UserProfile {
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
    cards: [], // Fresh account: zero cards, strictly isolated from previous accounts
    plan: 'free',
  };
}

function StudioApp() {
  const initialRoute = resolveRoute();
  const initialIsDirectPublic = initialRoute === 'profile' || initialRoute === 'domain' || initialRoute === '404';
  const explicitStudio = initialRoute === 'studio';
  const initialRouteTarget = getRouteTarget();

  const [routeTarget] = useState<string | null>(initialRouteTarget);

  // Primary App View: 'landing' | 'studio' | 'preview_only' | 'public' | 'terms' | 'privacy' | 'contact'
  const [appMode, setAppMode] = useState<'landing' | 'studio' | 'preview_only' | 'public' | 'terms' | 'privacy' | 'contact'>(() => {
    if (initialRoute === 'terms') return 'terms';
    if (initialRoute === 'privacy') return 'privacy';
    if (initialRoute === 'contact') return 'contact';
    if (initialIsDirectPublic) return 'public';
    if (explicitStudio) return 'studio';
    return 'landing';
  });

  // Active sidebar tab (Links, Profile, Theme, Analytics, Share, Leads, Billing)
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTabKey>('links');

  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastFailedAction, setLastFailedAction] = useState<(() => void) | null>(null);
  const toast = useToast();
  const [pendingClaimedHandle, setPendingClaimedHandle] = useState<string | null>(null);

  // Account Settings Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalInitialTab, setAccountModalInitialTab] = useState<AccountSubTab>('profile');

  const handleOpenAccountSettings = (tab: AccountSubTab = 'profile') => {
    setAccountModalInitialTab(tab);
    setIsAccountModalOpen(true);
  };

  // Creator Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }

    return DEFAULT_STARTER_PROFILE;
  });

  const { plan: hookPlan } = usePlan();

  useEffect(() => {
    if (hookPlan) {
      setProfile((prev) => (prev.plan !== hookPlan ? { ...prev, plan: hookPlan } : prev));
    }
  }, [hookPlan]);

  // Card editor modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ProfileCardData | null>(null);

  // Pro Upgrade modal state
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proLockedFeature, setProLockedFeature] = useState<string>('LinkLyra Pro');

  const handleOpenProModal = (featureName?: string) => {
    setProLockedFeature(featureName || 'LinkLyra Pro');
    setIsProModalOpen(true);
  };

  const handleUpgradeToPro = (_plan?: any) => {
    // Plan is granted and verified on the server; usePlan hook will automatically update state.
  };

  // Email verification banner state
  const [emailBannerDismissed, setEmailBannerDismissed] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleResendVerification = async () => {
    setResendStatus('sending');
    try {
      await profileService.sendVerificationEmail();
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 4000);
    } catch (err: any) {
      console.warn('Failed to resend verification email:', err);
      setResendStatus('error');
      setTimeout(() => setResendStatus('idle'), 4000);
    }
  };

  // Sync profile changes to user-scoped localStorage
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(`${STORAGE_KEY}_${currentUser.uid}`, JSON.stringify(profile));
      } catch (e) {
        console.error('Error writing to localStorage', e);
      }
    }
  }, [profile, currentUser]);

  // Subscribe to Firebase Auth changes & load user's Firestore data
  useEffect(() => {
    const unsubscribe = profileService.onAuthStateChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
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

            // If user has a photo from Google Auth / user.photoURL that isn't yet persisted in Firestore pages doc, auto-sync it
            if (user.photoURL && (!dbProf.avatar_url || dbProf.avatar_url.includes('unsplash.com'))) {
              profileService.updateProfile(user.uid, { avatar_url: user.photoURL }).catch(() => {});
            }
            
            setProfile({
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
            });

            if (eligibility.needsOnboarding) {
              setIsOnboardingOpen(true);
            }
          } else {
            // Fresh new user! No Firestore profile exists yet.
            // Check if user has specific cached state for their UID:
            const userKey = `${STORAGE_KEY}_${user.uid}`;
            let userScopedData: UserProfile | null = null;
            try {
              const saved = localStorage.getItem(userKey);
              if (saved) userScopedData = JSON.parse(saved);
            } catch (_) {}

            if (userScopedData && userScopedData.id === user.uid) {
              setProfile(userScopedData);
              if (eligibility.needsOnboarding) {
                setIsOnboardingOpen(true);
              }
            } else {
              // Brand new account: wipe any prior state, initialize clean and launch onboarding!
              const freshProfile = createFreshUserProfile(user, pendingClaimedHandle);
              setProfile(freshProfile);
              setIsOnboardingOpen(true);
            }
          }
        } catch (err: any) {
          console.warn('Notice syncing from Cloud Firestore (operating in offline/cached mode):', err?.message || err);
          // Graceful fallback to user-scoped local cache if network is offline/slow
          const userKey = `${STORAGE_KEY}_${user.uid}`;
          try {
            const saved = localStorage.getItem(userKey);
            if (saved) {
              const userScopedData = JSON.parse(saved);
              if (userScopedData && userScopedData.id === user.uid) {
                setProfile(userScopedData);
              }
            }
          } catch (_) {}
        } finally {
          setIsSyncing(false);
          setIsAuthChecking(false);
        }
      } else {
        setIsAuthChecking(false);
      }
    });

    return () => unsubscribe();
  }, [pendingClaimedHandle]);

  // Guard dashboard: only authenticated users are allowed to access studio / dashboard
  useEffect(() => {
    if (!isAuthChecking && (appMode === 'studio' || appMode === 'preview_only') && !currentUser) {
      setAppMode('landing');
      setIsAuthModalOpen(true);
    }
  }, [appMode, currentUser, isAuthChecking]);

  // Handlers for Link management
  const handleAddCard = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEditCard = (card: ProfileCardData) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleSaveCard = async (savedCard: ProfileCardData) => {
    const prevProfile = profile;
    const isEditing = Boolean(editingCard);

    if (isEditing) {
      // Update existing
      setProfile((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === savedCard.id ? savedCard : c)),
      }));

      if (currentUser) {
        setIsSyncing(true);
        setSaveStatus('saving');
        try {
          const targetIndex = profile.cards.findIndex((c) => c.id === savedCard.id);
          const linkDoc = cardToLinkDoc(savedCard, targetIndex >= 0 ? targetIndex : 0, currentUser.uid);
          await profileService.updateLink(savedCard.id, linkDoc);
          setSaveStatus('saved');
        } catch (err) {
          console.error('Error updating link:', err);
          setProfile(prevProfile);
          setSaveStatus('error');
          const retry = () => handleSaveCard(savedCard);
          setLastFailedAction(() => retry);
          toast.error('Failed to update card.', { label: 'Retry', onClick: retry });
        } finally {
          setIsSyncing(false);
        }
      }
    } else {
      // Add new card
      const tempId = savedCard.id || `card_${Date.now()}`;
      const tempCard = { ...savedCard, id: tempId };
      setProfile((prev) => ({
        ...prev,
        cards: [...prev.cards, tempCard],
      }));

      if (currentUser) {
        setIsSyncing(true);
        setSaveStatus('saving');
        try {
          const linkDoc = cardToLinkDoc(savedCard, profile.cards.length, currentUser.uid);
          const newDoc = await profileService.addLink(currentUser.uid, linkDoc);
          setProfile((prev) => ({
            ...prev,
            cards: prev.cards.map((c) => (c.id === tempId ? { ...c, id: newDoc.id } : c)),
          }));
          setSaveStatus('saved');
        } catch (err) {
          console.error('Error adding link:', err);
          setProfile(prevProfile);
          setSaveStatus('error');
          const retry = () => handleSaveCard(savedCard);
          setLastFailedAction(() => retry);
          toast.error('Failed to add card.', { label: 'Retry', onClick: retry });
        } finally {
          setIsSyncing(false);
        }
      }
    }
  };

  const handleDeleteCard = async (id: string) => {
    const prevProfile = profile;
    setProfile((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== id),
    }));

    if (currentUser) {
      setIsSyncing(true);
      setSaveStatus('saving');
      try {
        await profileService.deleteLink(id);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Error deleting link:', err);
        setProfile(prevProfile);
        setSaveStatus('error');
        const retry = () => handleDeleteCard(id);
        setLastFailedAction(() => retry);
        toast.error('Failed to delete card.', { label: 'Retry', onClick: retry });
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleToggleCardActive = async (id: string) => {
    const prevProfile = profile;
    const targetCard = profile.cards.find((c) => c.id === id);
    const newStatus = targetCard ? targetCard.isActive === false : false;

    setProfile((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === id ? { ...c, isActive: newStatus } : c
      ),
    }));

    if (currentUser) {
      setIsSyncing(true);
      setSaveStatus('saving');
      try {
        await profileService.updateLink(id, { is_active: newStatus });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Error toggling link active:', err);
        setProfile(prevProfile);
        setSaveStatus('error');
        const retry = () => handleToggleCardActive(id);
        setLastFailedAction(() => retry);
        toast.error('Failed to toggle card visibility.', { label: 'Retry', onClick: retry });
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleReorderCards = async (newCards: ProfileCardData[]) => {
    const prevProfile = profile;
    setProfile((prev) => ({
      ...prev,
      cards: newCards,
    }));

    if (currentUser) {
      setIsSyncing(true);
      setSaveStatus('saving');
      try {
        await profileService.reorderLinks(
          currentUser.uid,
          newCards.map((c) => c.id)
        );
        setSaveStatus('saved');
      } catch (err) {
        console.error('Error reordering links:', err);
        setProfile(prevProfile);
        setSaveStatus('error');
        const retry = () => handleReorderCards(newCards);
        setLastFailedAction(() => retry);
        toast.error('Failed to save card order.', { label: 'Retry', onClick: retry });
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleMoveCard = async (index: number, direction: 'up' | 'down') => {
    const newCards = [...profile.cards];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCards.length) return;

    const temp = newCards[index];
    newCards[index] = newCards[targetIndex];
    newCards[targetIndex] = temp;

    await handleReorderCards(newCards);
  };

  const handleAddSection = async (title: string) => {
    const prevProfile = profile;
    const tempId = `sec_${Date.now()}`;
    const newSec = {
      id: tempId,
      title,
      position: (profile.sections || []).length,
      is_visible: true,
    };

    setProfile((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSec],
    }));

    if (currentUser) {
      setIsSyncing(true);
      setSaveStatus('saving');
      try {
        const doc = await profileService.addSection(currentUser.uid, {
          title,
          position: (profile.sections || []).length,
          is_visible: true,
        });
        setProfile((prev) => ({
          ...prev,
          sections: (prev.sections || []).map((s) => (s.id === tempId ? { ...s, id: doc.id } : s)),
        }));
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to add section to cloud:', err);
        setProfile(prevProfile);
        setSaveStatus('error');
        const retry = () => handleAddSection(title);
        setLastFailedAction(() => retry);
        toast.error('Failed to add section.', { label: 'Retry', onClick: retry });
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    const prevProfile = profile;
    setProfile((prev) => ({
      ...prev,
      sections: (prev.sections || []).filter((s) => s.id !== sectionId),
      cards: prev.cards.map((c) =>
        c.sectionId === sectionId ? { ...c, sectionId: undefined } : c
      ),
    }));

    if (currentUser) {
      setIsSyncing(true);
      setSaveStatus('saving');
      try {
        await profileService.deleteSection(sectionId);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to delete section:', err);
        setProfile(prevProfile);
        setSaveStatus('error');
        const retry = () => handleDeleteSection(sectionId);
        setLastFailedAction(() => retry);
        toast.error('Failed to delete section.', { label: 'Retry', onClick: retry });
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    const prevProfile = profile;
    setProfile((prev) => ({
      ...prev,
      ...updated,
    }));

    if (currentUser) {
      setIsSyncing(true);
      setSaveStatus('saving');
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
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to update profile:', err);
        setProfile(prevProfile);
        setSaveStatus('error');
        const retry = () => handleUpdateProfile(updated);
        setLastFailedAction(() => retry);
        toast.error('Failed to save profile changes.', { label: 'Retry', onClick: retry });
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleManualSave = async () => {
    const prevProfile = profile;
    setSaveStatus('saving');
    setIsSyncing(true);
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
      setSaveStatus('saved');
      toast.success('All changes saved successfully');
    } catch (err) {
      console.error('Error in manual save:', err);
      setProfile(prevProfile);
      setSaveStatus('error');
      const retry = () => handleManualSave();
      setLastFailedAction(() => retry);
      toast.error('Failed to save changes.', { label: 'Retry', onClick: retry });
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCardClick = (card: ProfileCardData) => {
    // In studio builder preview, do NOT mutate click counts or record analytics.
    // Only navigate to the target URL if it's a valid link.
    if (card.linkUrl && card.linkUrl !== '#' && card.linkUrl !== 'https://') {
      safeOpenUrl(card.linkUrl);
    }
  };

  const handleSignOut = async () => {
    try {
      await profileService.signOut();
      setCurrentUser(null);
      setProfile(DEFAULT_STARTER_PROFILE);
      setIsOnboardingOpen(false);
      setIsAccountModalOpen(false);
      setIsAuthModalOpen(false);
      setAppMode('landing');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const handleAuthSuccess = async (user: User | null) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    if (!user) return;

    setAppMode('studio');
    setIsSyncing(true);
    try {
      const [dbProf, dbLinks, dbSections] = await Promise.all([
        profileService.getProfile(user.uid),
        profileService.getLinks(user.uid),
        profileService.getSections(user.uid),
      ]);

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

        setProfile({
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
          socials: dbProf.socials || {},
          plan: isAgency ? 'agency' : (dbProf.plan || 'free'),
          customDomain: dbProf.custom_domain || '',
          accountSettings: dbProf.accountSettings,
          sections: dbSections || [],
          cards: (dbLinks || []).map(linkToCard),
        });

        if (eligibility.needsOnboarding) {
          setIsOnboardingOpen(true);
        }
      } else {
        // Fresh user without Firestore profile: initialize clean profile for this user and open onboarding!
        const freshProfile = createFreshUserProfile(user, pendingClaimedHandle);
        setProfile(freshProfile);
        setIsOnboardingOpen(true);
      }
    } catch (e) {
      console.error('Error loading user profile after auth success:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetLinks = async () => {
    const prevProfile = profile;
    setProfile((prev) => ({
      ...prev,
      cards: DEFAULT_STARTER_PROFILE.cards,
    }));
    if (currentUser) {
      setIsSyncing(true);
      setSaveStatus('saving');
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
        setSaveStatus('saved');
      } catch (err) {
        console.error('Reset links error:', err);
        setProfile(prevProfile);
        setSaveStatus('error');
        const retry = () => handleResetLinks();
        setLastFailedAction(() => retry);
        toast.error('Failed to reset links.', { label: 'Retry', onClick: retry });
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // If in landing page view
  if (appMode === 'landing') {
    return (
      <>
        <LandingPage
          onOpenStudio={(claimedHandle) => {
            if (claimedHandle) {
              setPendingClaimedHandle(claimedHandle);
              setProfile((prev) => ({ ...prev, username: claimedHandle }));
            }
            if (!currentUser) {
              setIsAuthModalOpen(true);
              return;
            }
            setAppMode('studio');
          }}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenVisitorDemo={() => setAppMode('public')}
          onOpenProModal={handleOpenProModal}
          currentUser={currentUser}
          userProfile={profile}
          onSignOut={handleSignOut}
          onOpenAccountSettings={(tab) => handleOpenAccountSettings(tab || 'profile')}
          onOpenTerms={() => setAppMode('terms')}
          onOpenPrivacy={() => setAppMode('privacy')}
          onOpenContact={() => setAppMode('contact')}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onAuthSuccess={handleAuthSuccess}
          onSignOut={() => {
            handleSignOut();
            setIsAuthModalOpen(false);
          }}
          onOpenAccountSettings={() => {
            setIsAuthModalOpen(false);
            setActiveSidebarTab('profile');
            setAppMode('studio');
          }}
        />
        <ProUpgradeModal
          isOpen={isProModalOpen}
          onClose={() => setIsProModalOpen(false)}
          profile={profile}
          onUpgradeSuccess={handleUpgradeToPro}
          lockedFeatureName={proLockedFeature}
        />
      </>
    );
  }

  // Terms and Conditions standalone page view
  if (appMode === 'terms') {
    return (
      <TermsPage
        onBack={() => setAppMode('landing')}
        onOpenPrivacy={() => setAppMode('privacy')}
        onOpenContact={() => setAppMode('contact')}
        onOpenStudio={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setAppMode('studio');
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />
    );
  }

  // Privacy Policy standalone page view
  if (appMode === 'privacy') {
    return (
      <PrivacyPage
        onBack={() => setAppMode('landing')}
        onOpenTerms={() => setAppMode('terms')}
        onOpenContact={() => setAppMode('contact')}
        onOpenStudio={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setAppMode('studio');
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />
    );
  }

  // Contact & Support standalone page view
  if (appMode === 'contact') {
    return (
      <ContactPage
        onBack={() => setAppMode('landing')}
        onOpenTerms={() => setAppMode('terms')}
        onOpenPrivacy={() => setAppMode('privacy')}
        onOpenStudio={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setAppMode('studio');
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
      />
    );
  }

  // If in full public visitor view
  if (appMode === 'public') {
    return (
      <PublicProfilePage
        username={routeTarget || profile.username}
      />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-[#ECE7DC] text-[#1C1E22] antialiased">
      {/* Non-blocking Email Verification Banner */}
      {currentUser && !currentUser.emailVerified && !emailBannerDismissed && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 text-xs text-amber-900 flex items-center justify-between gap-2 shrink-0 z-40">
          <div className="flex items-center gap-2 min-w-0">
            <HugeiconsIcon icon={Mail01Icon} size={16} className="text-amber-700 shrink-0" />
            <span className="truncate">
              Please verify your email address (<strong>{currentUser.email}</strong>) to secure your account.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendStatus === 'sending'}
              className="font-bold underline hover:text-amber-950 text-amber-800 cursor-pointer disabled:opacity-50"
            >
              {resendStatus === 'sending'
                ? 'Sending...'
                : resendStatus === 'sent'
                ? 'Email Sent!'
                : resendStatus === 'error'
                ? 'Failed to send'
                : 'Resend Verification'}
            </button>
            <button
              type="button"
              onClick={() => setEmailBannerDismissed(true)}
              className="text-amber-600 hover:text-amber-900 text-base leading-none px-1 cursor-pointer"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Top Global App Header Navigation (Safe Area optimized for iOS notch / Android status bar) */}
      <header className="bg-white border-b border-black/10 px-3 sm:px-6 pt-[max(0.5rem,env(safe-area-inset-top,0px))] pb-2 sm:pb-2.5 flex items-center justify-between shrink-0 shadow-2xs z-30">
        {/* Brand Logo & Handle */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setAppMode('landing')}
            className="flex items-center gap-2 min-w-0 text-left hover:opacity-85 transition-opacity min-h-[44px] py-1"
            title="Back to Landing Page"
          >
            <div className="w-8 h-8 rounded-xl bg-[#1C1E22] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
              LL
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-[#1C1E22] tracking-tight block truncate">
                  LinkLyra
                </span>
                {profile.plan === 'pro' || profile.plan === 'business' ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#F8BA38] text-[#191A1E] font-black text-[8px]">
                    PRO
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full bg-black/5 text-[#737882] font-bold text-[8px]">
                    FREE
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#737882] truncate font-mono text-[#5E4BF7] font-semibold">
                /@{profile.username}
              </div>
            </div>
          </button>
        </div>

        {/* View Mode Switcher via Universal UI Kit SegmentedControl (No ' | ' separators!) */}
        <div className="hidden sm:block">
          <SegmentedControl
            value={appMode}
            onChange={(val) => {
              if (val === 'public') {
                const url = profile.username ? `/?user=${encodeURIComponent(profile.username)}` : '/';
                window.open(url, '_blank');
                return;
              }
              if ((val === 'studio' || val === 'preview_only') && !currentUser) {
                setIsAuthModalOpen(true);
                return;
              }
              setAppMode(val as any);
            }}
            size="sm"
            options={[
              {
                value: 'landing',
                label: 'Home',
                icon: <HugeiconsIcon icon={Home01Icon} size={14} />,
                title: 'Landing Page',
              },
              {
                value: 'studio',
                label: 'Studio',
                title: 'Creator Studio',
              },
              {
                value: 'preview_only',
                label: 'Live Preview',
                title: 'Live Mobile Preview',
              },
              {
                value: 'public',
                label: 'Visitor View',
                icon: <HugeiconsIcon icon={ViewIcon} size={14} />,
                title: 'Visitor View',
              },
            ]}
          />
        </div>

        {/* Right Header Actions: Auth & Share */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setActiveSidebarTab('share');
              if (appMode === 'preview_only') setAppMode('studio');
            }}
            title="Share & QR Code"
          >
            <HugeiconsIcon icon={Share01Icon} size={14} />
            <span className="hidden md:inline">Share</span>
          </Button>

          {currentUser ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => handleOpenAccountSettings('profile')}
              title="Account & Security Settings"
            >
              <HugeiconsIcon icon={UserCheck01Icon} size={14} className="text-emerald-400" />
              <span className="hidden sm:inline truncate max-w-[110px]">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'Account'}
              </span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <HugeiconsIcon icon={UserCheck01Icon} size={14} className="text-emerald-400" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Studio Body Workspace */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Side: Builder Sidebar (Fixed width on desktop so clicking options never resizes container) */}
        <div
          className={`h-full flex flex-col min-w-0 ${
            appMode === 'studio'
              ? 'flex w-full lg:w-[500px] xl:w-[560px] 2xl:w-[620px] lg:flex-none lg:shrink-0'
              : 'hidden lg:flex lg:w-[500px] xl:w-[560px] 2xl:w-[620px] lg:flex-none lg:shrink-0'
          }`}
        >
          <BuilderSidebar
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onManualSave={handleManualSave}
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onMoveCard={handleMoveCard}
            onReorderCards={handleReorderCards}
            onToggleCardActive={handleToggleCardActive}
            onOpenPublicView={() => {
              const url = profile.username ? `/?user=${encodeURIComponent(profile.username)}` : '/';
              window.open(url, '_blank');
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            currentUser={currentUser}
            activeSidebarTab={activeSidebarTab}
            onTabChange={(tab) => setActiveSidebarTab(tab)}
            onOpenAccountSettings={handleOpenAccountSettings}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onOpenProModal={handleOpenProModal}
            onSignOut={handleSignOut}
            onResetLinks={handleResetLinks}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        </div>

        {/* Right Side: Live Interactive Canvas Preview */}
        <div
          className={`h-full flex-1 flex flex-col overflow-hidden bg-[#E5DFD3] min-w-0 ${
            appMode === 'preview_only' ? 'flex w-full' : 'hidden lg:flex'
          }`}
        >
          <LivePreview
            profile={profile}
            isInteractive={true}
            onCardClick={handleCardClick}
          />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Optimized for iPhone Home Indicator & Android Navigation Bar) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden bg-white/95 backdrop-blur-md border-t border-black/10 px-2 pt-1.5 pb-[max(0.625rem,env(safe-area-inset-bottom,0px))] grid grid-cols-5 items-center shrink-0 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      >
        {/* 1. Links Tab */}
        <button
          type="button"
          onClick={() => {
            setAppMode('studio');
            setActiveSidebarTab('links');
          }}
          className={`flex flex-col items-center justify-center w-full min-h-[44px] py-1 px-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 touch-manipulation cursor-pointer ${
            appMode === 'studio' && activeSidebarTab === 'links'
              ? 'text-[#5E4BF7] bg-[#5E4BF7]/10'
              : 'text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <div className="relative">
            <HugeiconsIcon icon={Link01Icon} size={19} />
            {profile.cards.length > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#5E4BF7] text-white text-[8px] font-black flex items-center justify-center shadow-xs">
                {profile.cards.length}
              </span>
            )}
          </div>
          <span className="mt-1 tracking-tight">Links</span>
        </button>

        {/* 2. Theme / Appearance Tab */}
        <button
          type="button"
          onClick={() => {
            setAppMode('studio');
            setActiveSidebarTab('appearance');
          }}
          className={`flex flex-col items-center justify-center w-full min-h-[44px] py-1 px-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 touch-manipulation cursor-pointer ${
            appMode === 'studio' && activeSidebarTab === 'appearance'
              ? 'text-[#5E4BF7] bg-[#5E4BF7]/10'
              : 'text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <HugeiconsIcon icon={ColorsIcon} size={19} />
          <span className="mt-1 tracking-tight">Theme</span>
        </button>

        {/* 3. Center Floating Action Button (+ Add Link) */}
        <div className="flex flex-col items-center justify-center -mt-6">
          <button
            type="button"
            onClick={() => {
              if (appMode === 'preview_only') setAppMode('studio');
              setActiveSidebarTab('links');
              handleAddCard();
            }}
            className="w-12 h-12 rounded-full bg-[#1C1E22] hover:bg-black active:scale-90 text-white flex items-center justify-center shadow-lg shadow-black/25 ring-4 ring-white transition-transform touch-manipulation cursor-pointer"
            title="Add Link Card"
            aria-label="Add new link card"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={22} strokeWidth={2.5} />
          </button>
          <span className="text-[10px] font-extrabold text-[#1C1E22] mt-0.5 tracking-tight">Add</span>
        </div>

        {/* 4. Leads / Inquiries Tab */}
        <button
          type="button"
          onClick={() => {
            setAppMode('studio');
            setActiveSidebarTab('leads');
          }}
          className={`flex flex-col items-center justify-center w-full min-h-[44px] py-1 px-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 touch-manipulation cursor-pointer ${
            appMode === 'studio' && activeSidebarTab === 'leads'
              ? 'text-[#5E4BF7] bg-[#5E4BF7]/10'
              : 'text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <HugeiconsIcon icon={Mail01Icon} size={19} />
          <span className="mt-1 tracking-tight">Inquiries</span>
        </button>

        {/* 5. Live Preview / Editor Toggle */}
        <button
          type="button"
          onClick={() => setAppMode(appMode === 'preview_only' ? 'studio' : 'preview_only')}
          className={`flex flex-col items-center justify-center w-full min-h-[44px] py-1 px-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 touch-manipulation cursor-pointer ${
            appMode === 'preview_only'
              ? 'text-[#5E4BF7] bg-[#5E4BF7]/10'
              : 'text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <HugeiconsIcon icon={ViewIcon} size={19} />
          <span className="mt-1 tracking-tight">{appMode === 'preview_only' ? 'Editor' : 'Preview'}</span>
        </button>
      </nav>

      {/* Card Editor Modal */}
      <CardEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        initialCard={editingCard}
        businessPhone={profile.businessPhone}
        sections={profile.sections || []}
        userRole={
          profile.onboardingProfile?.roleData?.persona ||
          profile.onboardingProfile?.primaryRole ||
          (profile as any).onboarding_profile?.roleData?.persona ||
          (profile as any).onboarding_profile?.primaryRole ||
          profile.pageArchetype ||
          (profile as any).page_archetype ||
          'creator'
        }
      />

      {/* Google Cloud / Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
        onSignOut={() => {
          handleSignOut();
          setIsAuthModalOpen(false);
        }}
        onOpenAccountSettings={() => {
          setIsAuthModalOpen(false);
          handleOpenAccountSettings('profile');
        }}
      />

      {/* User Onboarding Flow (Triggered on login or when clicking Setup Wizard) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        user={currentUser}
        currentProfile={profile}
        onComplete={(updatedProfile, newCards) => {
          setProfile((prev) => {
            const updated: UserProfile = {
              ...prev,
              ...updatedProfile,
              cards: newCards && newCards.length > 0
                ? newCards.map((l: any) => ({
                    id: l.id,
                    sectionId: l.section_id || null,
                    title: l.title,
                    subtitle: l.subtitle || '',
                    linkUrl: l.link_url || l.linkUrl || '',
                    color: l.color || 'purple',
                    logoSrc: l.logo_url || l.logoSrc || '',
                    badgeText: l.badge_text || l.badgeText || '',
                    expanded: l.expanded,
                    isActive: l.is_active !== false && l.isActive !== false,
                    clicks: l.clicks || 0,
                    templateType: l.template_type || l.templateType,
                    music: l.music,
                    podcast: l.podcast,
                    isPremium: l.is_premium || l.isPremium || Boolean((l.template_type || l.templateType)?.startsWith('music_') || (l.template_type || l.templateType)?.startsWith('podcast_')),
                  }))
                : prev.cards,
            };
            return updated;
          });
          setIsOnboardingOpen(false);
        }}
      />

      {/* Pro Upgrade & Paywall Modal */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        profile={profile}
        onUpgradeSuccess={handleUpgradeToPro}
        lockedFeatureName={proLockedFeature}
      />

      {/* User Account, Security, Billing & Preferences Modal Hub */}
      <AccountSettings
        isOpen={isAccountModalOpen}
        initialTab={accountModalInitialTab}
        onClose={() => setIsAccountModalOpen(false)}
        profile={profile}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onSignOut={handleSignOut}
        onOpenProModal={handleOpenProModal}
        onOpenPublicView={() => setAppMode('public')}
        onResetLinks={handleResetLinks}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <StudioApp />
      </ConfirmProvider>
    </ToastProvider>
  );
}
