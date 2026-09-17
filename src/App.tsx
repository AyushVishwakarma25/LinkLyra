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
} from '@hugeicons/core-free-icons';
import { UserProfile, ProfileCardData } from './types';
import { DEFAULT_STARTER_PROFILE } from './data';
import { BuilderSidebar } from './components/BuilderSidebar';
import { LivePreview } from './components/LivePreview';
import { CardEditorModal } from './components/CardEditorModal';
import { AuthModal } from './components/AuthModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { LandingPage } from './components/LandingPage';
import { PublicProfilePage } from './app/[username]/page';
import { AccountSettings, AccountSubTab } from './components/AccountSettings';
import { OnboardingModal } from './components/OnboardingModal';
import { Button, ButtonGroup } from './components/ui';
import { profileService, DbProfile, isAgencyUserEmail } from './lib/firebase';
import { checkUserOnboardingEligibility } from './lib/onboardingService';
import { User } from 'firebase/auth';

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
    plan: isAgencyUserEmail(user.email) ? 'agency' : 'free',
  };
}

function getRouteUsername(): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  const userParam = searchParams.get('user') || searchParams.get('u');
  if (userParam) return userParam;

  const domainParam = searchParams.get('domain') || searchParams.get('d');
  if (domainParam) return domainParam;

  const hostname = window.location.hostname;
  const isPlatformHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.run.app') ||
    hostname.endsWith('.web.app') ||
    hostname.endsWith('.firebaseapp.com') ||
    hostname.endsWith('.ai.studio');

  if (!isPlatformHost && hostname && hostname !== '') {
    return hostname;
  }

  const path = window.location.pathname.replace(/^\//, '');
  const segments = path.split('/').filter(Boolean);
  if (segments[0] === 'app' && segments[1]) {
    return segments[1];
  }
  if (segments.length === 1 && segments[0] !== 'index.html' && segments[0] !== 'api') {
    return segments[0];
  }

  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (hash && hash !== 'dashboard' && hash !== 'explore' && hash !== 'studio' && hash !== 'landing') {
    return hash;
  }
  return null;
}

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  const routeUsername = getRouteUsername();
  const explicitStudio = searchParams.get('view') === 'studio' || searchParams.get('edit') === 'true' || window.location.hash === '#studio';
  const initialIsDirectPublic = Boolean(routeUsername) && !explicitStudio;

  // Primary App View: 'landing' (Conversational Landing Page) | 'studio' (Sidebar + Preview) | 'preview_only' (Live interactive mobile view) | 'public' (Full public page)
  const [appMode, setAppMode] = useState<'landing' | 'studio' | 'preview_only' | 'public'>(() => {
    if (initialIsDirectPublic) return 'public';
    if (explicitStudio) return 'studio';
    return 'landing';
  });

  // Active sidebar tab (Links, Profile, Theme, Analytics, Share)
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    'links' | 'profile' | 'appearance' | 'analytics' | 'share'
  >('links');

  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
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

  const handleUpgradeToPro = async (plan: 'pro') => {
    setProfile((prev) => ({
      ...prev,
      plan: 'pro',
    }));

    if (currentUser) {
      try {
        await profileService.updateProfile(currentUser.uid, {
          plan: 'pro',
        });
      } catch (err) {
        console.error('Error updating plan to pro in Firestore:', err);
      }
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
            const isAgency = isAgencyUserEmail(user.email) || dbProf.plan === 'agency' || dbProf.role === 'agency';
            
            setProfile({
              id: dbProf.id,
              name: dbProf.full_name || 'My Page',
              headline: dbProf.bio || '',
              avatarUrl: dbProf.avatar_url || '',
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
              cards: (dbLinks || []).map((l) => ({
                id: l.id,
                sectionId: l.section_id,
                title: l.title,
                subtitle: l.subtitle,
                linkUrl: l.link_url,
                color: l.color,
                logoSrc: l.logo_url,
                badgeText: l.badge_text,
                expanded: l.expanded,
                isActive: l.is_active !== false,
                clicks: l.clicks || 0,
                templateType: l.template_type,
                music: l.music,
                podcast: l.podcast,
                isPremium: l.is_premium || Boolean(l.template_type?.startsWith('music_') || l.template_type?.startsWith('podcast_')),
                realEstate: l.real_estate
                  ? {
                      propertyName: l.real_estate.property_name || l.real_estate.propertyName || l.title,
                      location: l.real_estate.location || '',
                      priceBracket: l.real_estate.price_bracket || l.real_estate.priceBracket || '',
                      propertyType: l.real_estate.property_type || l.real_estate.propertyType || '',
                    }
                  : undefined,
                coaching: l.coaching
                  ? {
                      courseName: l.coaching.course_name || l.coaching.courseName || l.title,
                      examTrack: l.coaching.exam_track || l.coaching.examTrack || '',
                      batchTiming: l.coaching.batch_timing || l.coaching.batchTiming || '',
                      feeStructure: l.coaching.fee_structure || l.coaching.feeStructure || '',
                    }
                  : undefined,
                creatorStats: l.creator_stats || (l as any).creatorStats,
                creatorWork: l.creator_work || (l as any).creatorWork,
                featuredWork: l.featured_work || (l as any).featuredWork,
                creatorPackages: l.creator_packages || (l as any).creatorPackages,
                brandInquiry: l.brand_inquiry || (l as any).brandInquiry,
                recommendation: l.recommendation,
                clientReview: l.client_review || (l as any).clientReview,
                customWhatsappPhone: l.custom_whatsapp_phone,
              })),
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
        } catch (err) {
          console.error('Error syncing from Cloud Firestore:', err);
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
    if (editingCard) {
      // Update existing
      setProfile((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === savedCard.id ? savedCard : c)),
      }));

      if (currentUser) {
        setIsSyncing(true);
        try {
          await profileService.updateLink(savedCard.id, {
            section_id: savedCard.sectionId,
            title: savedCard.title,
            subtitle: savedCard.subtitle || '',
            link_url: savedCard.linkUrl,
            color: savedCard.color,
            logo_url: savedCard.logoSrc || '',
            badge_text: savedCard.badgeText || '',
            expanded: savedCard.expanded,
            is_active: savedCard.isActive,
            template_type: savedCard.templateType,
            real_estate: savedCard.realEstate
              ? {
                  property_name: savedCard.realEstate.propertyName,
                  location: savedCard.realEstate.location,
                  price_bracket: savedCard.realEstate.priceBracket,
                  property_type: savedCard.realEstate.propertyType,
                }
              : undefined,
            coaching: savedCard.coaching
              ? {
                  course_name: savedCard.coaching.courseName,
                  exam_track: savedCard.coaching.examTrack,
                  batch_timing: savedCard.coaching.batchTiming,
                  fee_structure: savedCard.coaching.feeStructure,
                }
              : undefined,
            creator_stats: savedCard.creatorStats,
            creator_work: savedCard.creatorWork,
            featured_work: savedCard.featuredWork,
            creator_packages: savedCard.creatorPackages,
            brand_inquiry: savedCard.brandInquiry,
            recommendation: savedCard.recommendation,
            client_review: savedCard.clientReview,
            custom_whatsapp_phone: savedCard.customWhatsappPhone,
            music: savedCard.music || undefined,
            podcast: savedCard.podcast || undefined,
            is_premium: savedCard.isPremium || Boolean(savedCard.templateType?.startsWith('music_') || savedCard.templateType?.startsWith('podcast_')),
          });
        } catch (err) {
          console.error('Error updating link:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    } else {
      // Add new card
      let createdId = savedCard.id;
      if (currentUser) {
        setIsSyncing(true);
        try {
          const newDoc = await profileService.addLink(currentUser.uid, {
            section_id: savedCard.sectionId,
            title: savedCard.title,
            subtitle: savedCard.subtitle || '',
            link_url: savedCard.linkUrl,
            color: savedCard.color,
            logo_url: savedCard.logoSrc || '',
            badge_text: savedCard.badgeText || '',
            expanded: savedCard.expanded,
            is_active: savedCard.isActive,
            template_type: savedCard.templateType,
            music: savedCard.music || undefined,
            podcast: savedCard.podcast || undefined,
            is_premium: savedCard.isPremium || Boolean(savedCard.templateType?.startsWith('music_') || savedCard.templateType?.startsWith('podcast_')),
            real_estate: savedCard.realEstate
              ? {
                  property_name: savedCard.realEstate.propertyName,
                  location: savedCard.realEstate.location,
                  price_bracket: savedCard.realEstate.priceBracket,
                  property_type: savedCard.realEstate.propertyType,
                }
              : undefined,
            coaching: savedCard.coaching
              ? {
                  course_name: savedCard.coaching.courseName,
                  exam_track: savedCard.coaching.examTrack,
                  batch_timing: savedCard.coaching.batchTiming,
                  fee_structure: savedCard.coaching.feeStructure,
                }
              : undefined,
            creator_stats: savedCard.creatorStats,
            creator_work: savedCard.creatorWork,
            featured_work: savedCard.featuredWork,
            creator_packages: savedCard.creatorPackages,
            brand_inquiry: savedCard.brandInquiry,
            recommendation: savedCard.recommendation,
            client_review: savedCard.clientReview,
            custom_whatsapp_phone: savedCard.customWhatsappPhone,
            display_order: profile.cards.length,
          });
          createdId = newDoc.id;
        } catch (err) {
          console.error('Error adding link:', err);
        } finally {
          setIsSyncing(false);
        }
      }

      setProfile((prev) => ({
        ...prev,
        cards: [...prev.cards, { ...savedCard, id: createdId }],
      }));
    }
  };

  const handleDeleteCard = async (id: string) => {
    setProfile((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== id),
    }));

    if (currentUser) {
      await profileService.deleteLink(id);
    }
  };

  const handleToggleCardActive = async (id: string) => {
    const targetCard = profile.cards.find((c) => c.id === id);
    const newStatus = targetCard ? targetCard.isActive === false : false;

    setProfile((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === id ? { ...c, isActive: newStatus } : c
      ),
    }));

    if (currentUser) {
      await profileService.updateLink(id, { is_active: newStatus });
    }
  };

  const handleMoveCard = async (index: number, direction: 'up' | 'down') => {
    const newCards = [...profile.cards];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCards.length) return;

    const temp = newCards[index];
    newCards[index] = newCards[targetIndex];
    newCards[targetIndex] = temp;

    setProfile((prev) => ({
      ...prev,
      cards: newCards,
    }));

    if (currentUser) {
      await profileService.reorderLinks(
        currentUser.uid,
        newCards.map((c) => c.id)
      );
    }
  };

  const handleAddSection = async (title: string) => {
    let createdId = `sec_${Date.now()}`;
    if (currentUser) {
      setIsSyncing(true);
      try {
        const doc = await profileService.addSection(currentUser.uid, {
          title,
          position: (profile.sections || []).length,
          is_visible: true,
        });
        createdId = doc.id;
      } catch (err) {
        console.error('Failed to add section to cloud:', err);
      } finally {
        setIsSyncing(false);
      }
    }

    const newSec = {
      id: createdId,
      title,
      position: (profile.sections || []).length,
      is_visible: true,
    };

    setProfile((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSec],
    }));
  };

  const handleDeleteSection = async (sectionId: string) => {
    setProfile((prev) => ({
      ...prev,
      sections: (prev.sections || []).filter((s) => s.id !== sectionId),
      cards: prev.cards.map((c) =>
        c.sectionId === sectionId ? { ...c, sectionId: undefined } : c
      ),
    }));

    if (currentUser) {
      await profileService.deleteSection(sectionId);
    }
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updated,
    }));

    if (currentUser) {
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
      if (updated.socials !== undefined) updates.socials = updated.socials;
      if (updated.customDomain !== undefined) updates.custom_domain = updated.customDomain;
      if (updated.accountSettings !== undefined) updates.accountSettings = updated.accountSettings;
      if (updated.plan !== undefined) updates.plan = updated.plan;

      await profileService.updateProfile(currentUser.uid, updates);
    }
  };

  const handleManualSave = async () => {
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
          socials: profile.socials,
          custom_domain: profile.customDomain,
          accountSettings: profile.accountSettings,
          plan: profile.plan,
        };
        await profileService.updateProfile(currentUser.uid, updates);
      }
    } catch (err) {
      console.error('Error in manual save:', err);
      throw err;
    }
  };

  const handleCardClick = (card: ProfileCardData) => {
    setProfile((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === card.id ? { ...c, clicks: (c.clicks || 0) + 1 } : c
      ),
    }));
    profileService.recordClick(card.id);

    if (card.linkUrl && card.linkUrl !== '#') {
      const finalUrl =
        card.linkUrl.startsWith('http://') || card.linkUrl.startsWith('https://')
          ? card.linkUrl
          : `https://${card.linkUrl}`;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
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
        const isAgency = isAgencyUserEmail(user.email) || dbProf.plan === 'agency' || dbProf.role === 'agency';
        setProfile({
          id: dbProf.id,
          name: dbProf.full_name || 'My Page',
          headline: dbProf.bio || '',
          avatarUrl: dbProf.avatar_url || '',
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
          cards: (dbLinks || []).map((l) => ({
            id: l.id,
            sectionId: l.section_id,
            title: l.title,
            subtitle: l.subtitle,
            linkUrl: l.link_url,
            color: l.color,
            logoSrc: l.logo_url,
            badgeText: l.badge_text,
            expanded: l.expanded,
            isActive: l.is_active !== false,
            clicks: l.clicks || 0,
            templateType: l.template_type,
            music: l.music,
            podcast: l.podcast,
            isPremium: l.is_premium || Boolean(l.template_type?.startsWith('music_') || l.template_type?.startsWith('podcast_')),
            realEstate: l.real_estate
              ? {
                  propertyName: l.real_estate.property_name || l.real_estate.propertyName || l.title,
                  location: l.real_estate.location || '',
                  priceBracket: l.real_estate.price_bracket || l.real_estate.priceBracket || '',
                  propertyType: l.real_estate.property_type || l.real_estate.propertyType || '',
                }
              : undefined,
            coaching: l.coaching
              ? {
                  courseName: l.coaching.course_name || l.coaching.courseName || l.title,
                  examTrack: l.coaching.exam_track || l.coaching.examTrack || '',
                  batchTiming: l.coaching.batch_timing || l.coaching.batchTiming || '',
                  feeStructure: l.coaching.fee_structure || l.coaching.feeStructure || '',
                }
              : undefined,
            creatorStats: l.creator_stats || (l as any).creatorStats,
            creatorWork: l.creator_work || (l as any).creatorWork,
            featuredWork: l.featured_work || (l as any).featuredWork,
            creatorPackages: l.creator_packages || (l as any).creatorPackages,
            brandInquiry: l.brand_inquiry || (l as any).brandInquiry,
            recommendation: l.recommendation,
            clientReview: l.client_review || (l as any).clientReview,
            customWhatsappPhone: l.custom_whatsapp_phone,
          })),
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
    setProfile((prev) => ({
      ...prev,
      cards: DEFAULT_STARTER_PROFILE.cards,
    }));
    if (currentUser) {
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
      } catch (err) {
        console.warn('Reset links notice:', err);
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

  // If in full public visitor view
  if (appMode === 'public') {
    return (
      <PublicProfilePage
        username={profile.username}
        onBackToEditor={() => setAppMode('studio')}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#ECE7DC] text-[#1C1E22] antialiased">
      {/* Top Global App Header Navigation */}
      <header className="bg-white border-b border-black/10 px-3 sm:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs z-30">
        {/* Brand Logo & Handle */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setAppMode('landing')}
            className="flex items-center gap-2 min-w-0 text-left hover:opacity-85 transition-opacity"
            title="Back to Landing Page"
          >
            <div className="w-8 h-8 rounded-xl bg-[#1C1E22] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
              LL
            </div>
            <div className="hidden sm:block min-w-0">
              <span className="font-extrabold text-sm text-[#1C1E22] tracking-tight block truncate">
                LinkLyra
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-[#737882]">
                <span className="font-mono text-[#5E4BF7] font-semibold truncate">
                  /@{profile.username}
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
            </div>
          </button>

          {/* Cloud Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 text-[11px] text-[#737882] shrink-0">
            <HugeiconsIcon icon={CloudIcon} size={14} className={currentUser ? 'text-emerald-500' : 'text-[#737882]'} />
            <span className="truncate">
              {currentUser
                ? isSyncing
                  ? 'Saving...'
                  : 'Saved'
                : 'Local Draft'}
            </span>
          </div>
        </div>

        {/* View Mode Switcher ButtonGroup */}
        <ButtonGroup variant="tertiary" size="sm" className="hidden sm:inline-flex bg-black/5 p-0.5 rounded-lg border border-black/5">
          <Button
            onClick={() => setAppMode('landing')}
            isSelected={appMode === 'landing'}
            className="rounded-md"
            title="Landing Page"
          >
            <HugeiconsIcon icon={Home01Icon} size={14} />
            <span>Home</span>
          </Button>
          <Button
            onClick={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
                return;
              }
              setAppMode('studio');
            }}
            isSelected={appMode === 'studio'}
            className="rounded-md"
          >
            <ButtonGroup.Separator />
            Studio
          </Button>
          <Button
            onClick={() => {
              if (!currentUser) {
                setIsAuthModalOpen(true);
                return;
              }
              setAppMode('preview_only');
            }}
            isSelected={appMode === 'preview_only'}
            className="rounded-md"
          >
            <ButtonGroup.Separator />
            Live Preview
          </Button>
          <Button
            onClick={() => setAppMode('public')}
            isSelected={appMode === 'public'}
            className="rounded-md"
          >
            <ButtonGroup.Separator />
            <HugeiconsIcon icon={ViewIcon} size={14} />
            <span>Visitor View</span>
          </Button>
        </ButtonGroup>

        {/* Right Header Actions: Auth & Share */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ButtonGroup variant="secondary" size="sm">
            <Button
              onClick={() => {
                setActiveSidebarTab('share');
                if (appMode === 'preview_only') setAppMode('studio');
              }}
              title="Share & QR Code"
            >
              <HugeiconsIcon icon={Share01Icon} size={14} />
              <span className="hidden md:inline">Share / QR</span>
            </Button>
            {currentUser ? (
              <Button
                variant="primary"
                onClick={() => handleOpenAccountSettings('profile')}
                title="Account & Security Settings"
              >
                <ButtonGroup.Separator />
                <HugeiconsIcon icon={UserCheck01Icon} size={14} className="text-emerald-400" />
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'Account'}
                </span>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <ButtonGroup.Separator />
                <HugeiconsIcon icon={UserCheck01Icon} size={14} className="text-emerald-400" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </ButtonGroup>
        </div>
      </header>

      {/* Main Studio Body Workspace */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Side: Builder Sidebar (Expanded width to use available space comfortably) */}
        <div
          className={`h-full flex flex-col transition-all duration-300 min-w-0 ${
            appMode === 'studio'
              ? 'flex w-full lg:w-[520px] xl:w-[600px] 2xl:w-[660px]'
              : 'hidden lg:flex lg:w-[520px] xl:w-[600px] 2xl:w-[660px]'
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
            onToggleCardActive={handleToggleCardActive}
            onOpenPublicView={() => setAppMode('public')}
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
          className={`h-full flex-1 flex flex-col overflow-hidden bg-[#E5DFD3] transition-all duration-300 min-w-0 ${
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

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden bg-white border-t border-black/10 px-2 py-1.5 flex items-center justify-around shrink-0 z-30 shadow-md">
        <button
          type="button"
          onClick={() => {
            setAppMode('studio');
            setActiveSidebarTab('links');
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold ${
            appMode === 'studio' && activeSidebarTab === 'links'
              ? 'text-[#5E4BF7]'
              : 'text-[#737882]'
          }`}
        >
          <HugeiconsIcon icon={Link01Icon} size={16} />
          <span>Links</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAppMode('studio');
            setActiveSidebarTab('profile');
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold ${
            appMode === 'studio' && activeSidebarTab === 'profile'
              ? 'text-[#5E4BF7]'
              : 'text-[#737882]'
          }`}
        >
          <HugeiconsIcon icon={UserIcon} size={16} />
          <span>Profile</span>
        </button>

        {/* Center Floating Action Button (+ Add Link) */}
        <button
          type="button"
          onClick={handleAddCard}
          className="w-10 h-10 -mt-3 rounded-full bg-[#5E4BF7] text-white flex items-center justify-center shadow-lg active:scale-95 shrink-0"
          title="Add Link Card"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={20} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={() => {
            setAppMode('studio');
            setActiveSidebarTab('appearance');
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold ${
            appMode === 'studio' && activeSidebarTab === 'appearance'
              ? 'text-[#5E4BF7]'
              : 'text-[#737882]'
          }`}
        >
          <HugeiconsIcon icon={ColorsIcon} size={16} />
          <span>Theme</span>
        </button>

        <button
          type="button"
          onClick={() => setAppMode('preview_only')}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-bold ${
            appMode === 'preview_only'
              ? 'text-[#5E4BF7]'
              : 'text-[#737882]'
          }`}
        >
          <HugeiconsIcon icon={ViewIcon} size={16} />
          <span>Preview</span>
        </button>
      </div>

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
