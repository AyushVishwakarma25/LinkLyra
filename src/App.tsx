import React, { useState, useEffect } from 'react';
import {
  Eye,
  Plus,
  Link2,
  UserCheck,
  Share2,
  Palette,
  User as UserIcon,
  Cloud,
  Home,
} from 'lucide-react';
import { UserProfile, ProfileCardData } from './types';
import { DEFAULT_STARTER_PROFILE } from './data';
import { BuilderSidebar } from './components/BuilderSidebar';
import { LivePreview } from './components/LivePreview';
import { CardEditorModal } from './components/CardEditorModal';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { PublicProfilePage } from './app/[username]/page';
import { profileService, DbProfile } from './lib/firebase';
import { User } from 'firebase/auth';

const STORAGE_KEY = 'linkcards_user_profile_v2';

function getRouteUsername(): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  const userParam = searchParams.get('user') || searchParams.get('u');
  if (userParam) return userParam;

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Sync profile changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  }, [profile]);

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

          if (dbProf) {
            setProfile({
              id: dbProf.id,
              name: dbProf.full_name,
              headline: dbProf.bio,
              avatarUrl: dbProf.avatar_url,
              username: dbProf.username,
              businessPhone: dbProf.business_phone,
              theme: dbProf.theme || 'warm',
              fontFamily: dbProf.font_family,
              buttonStyle: dbProf.button_style,
              backgroundType: dbProf.background_type,
              backgroundValue: dbProf.background_value,
              socials: dbProf.socials,
              sections: dbSections,
              cards: dbLinks.map((l) => ({
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
                realEstate: l.real_estate
                  ? {
                      propertyName: l.real_estate.property_name || l.title,
                      location: l.real_estate.location || '',
                      priceBracket: l.real_estate.price_bracket || '',
                      propertyType: l.real_estate.property_type || '',
                    }
                  : undefined,
                coaching: l.coaching
                  ? {
                      courseName: l.coaching.course_name || l.title,
                      examTrack: l.coaching.exam_track || '',
                      batchTiming: l.coaching.batch_timing || '',
                      feeStructure: l.coaching.fee_structure || '',
                    }
                  : undefined,
                customWhatsappPhone: l.custom_whatsapp_phone,
              })),
            });
          }
        } catch (err) {
          console.error('Error syncing from Cloud Firestore:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

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
          custom_whatsapp_phone: savedCard.customWhatsappPhone,
        });
        setIsSyncing(false);
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

      await profileService.updateProfile(currentUser.uid, updates);
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

  // If in landing page view
  if (appMode === 'landing') {
    return (
      <>
        <LandingPage
          onOpenStudio={(claimedHandle) => {
            if (claimedHandle) {
              setProfile((prev) => ({ ...prev, username: claimedHandle }));
            }
            setAppMode('studio');
          }}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenVisitorDemo={() => setAppMode('public')}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
          }}
          onSignOut={() => {
            setCurrentUser(null);
          }}
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
              LC
            </div>
            <div className="hidden sm:block min-w-0">
              <span className="font-extrabold text-sm text-[#1C1E22] tracking-tight block truncate">
                LinkCards
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-[#737882]">
                <span className="font-mono text-[#5E4BF7] font-semibold truncate">
                  /@{profile.username}
                </span>
              </div>
            </div>
          </button>

          {/* Cloud Firestore Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 text-[11px] text-[#737882] shrink-0">
            <Cloud className={`w-3 h-3 ${currentUser ? 'text-emerald-500' : 'text-[#737882]'}`} />
            <span className="truncate">
              {currentUser
                ? isSyncing
                  ? 'Saving...'
                  : 'Firestore Live'
                : 'Local Draft'}
            </span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-black/5 p-1 rounded-full border border-black/5 shrink-0">
          <button
            type="button"
            onClick={() => setAppMode('landing')}
            className="px-2.5 py-1 rounded-full text-xs font-bold text-[#737882] hover:text-[#1C1E22] transition-all flex items-center gap-1"
            title="Landing Page"
          >
            <Home className="w-3 h-3" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <button
            type="button"
            onClick={() => setAppMode('studio')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              appMode === 'studio'
                ? 'bg-white text-[#1C1E22] shadow-xs'
                : 'text-[#737882] hover:text-[#1C1E22]'
            }`}
          >
            Studio
          </button>
          <button
            type="button"
            onClick={() => setAppMode('preview_only')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              appMode === 'preview_only'
                ? 'bg-[#5E4BF7] text-white shadow-xs'
                : 'text-[#737882] hover:text-[#1C1E22]'
            }`}
          >
            Live Preview
          </button>
          <button
            type="button"
            onClick={() => setAppMode('public')}
            className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold text-[#737882] hover:text-[#1C1E22] transition-all flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Visitor View</span>
          </button>
        </div>

        {/* Right Header Actions: Auth & Share */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveSidebarTab('share');
              if (appMode === 'preview_only') setAppMode('studio');
            }}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold bg-white hover:bg-black/5 border border-black/10 text-[#1C1E22] flex items-center gap-1.5 shadow-2xs transition-colors"
            title="Share & QR Code"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Share / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-[#1C1E22] hover:bg-black text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline truncate max-w-[120px]">
              {currentUser ? currentUser.displayName || 'Account' : 'Sign In'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Studio Body Workspace */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Side: Builder Sidebar */}
        <div
          className={`h-full flex flex-col transition-all duration-300 min-w-0 ${
            appMode === 'studio'
              ? 'flex w-full lg:w-[440px] xl:w-[480px]'
              : 'hidden lg:flex lg:w-[440px] xl:w-[480px]'
          }`}
        >
          <BuilderSidebar
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
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
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
          />
        </div>

        {/* Right Side: Live Interactive Canvas Preview */}
        <div
          className={`h-full flex-1 flex-col overflow-y-auto bg-[#E5DFD3] transition-all duration-300 min-w-0 ${
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
          <Link2 className="w-4 h-4" />
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
          <UserIcon className="w-4 h-4" />
          <span>Profile</span>
        </button>

        {/* Center Floating Action Button (+ Add Link) */}
        <button
          type="button"
          onClick={handleAddCard}
          className="w-10 h-10 -mt-3 rounded-full bg-[#5E4BF7] text-white flex items-center justify-center shadow-lg active:scale-95 shrink-0"
          title="Add Link Card"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
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
          <Palette className="w-4 h-4" />
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
          <Eye className="w-4 h-4" />
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
      />

      {/* Google Cloud / Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
        onSignOut={() => {
          setCurrentUser(null);
        }}
      />
    </div>
  );
}
