import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PlusSignIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Edit01Icon,
  Delete01Icon,
  Share01Icon,
  Copy01Icon,
  ArrowUpRight01Icon,
  ViewIcon,
  CheckmarkCircle01Icon,
  Tick01Icon,
  UserCheck01Icon,
  Link01Icon,
  UserIcon,
  ColorsIcon,
  QrCodeIcon,
  ChartBarLineIcon,
  TrendingUpIcon,
  Layers01Icon,
  Building01Icon,
  Upload01Icon,
  Folder01Icon,
  FolderAddIcon,
  SmartPhone01Icon,
  ComputerIcon,
  Tablet01Icon,
  GlobeIcon,
  CrownIcon,
  LockIcon,
  CreditCardIcon,
  Settings01Icon,
  Loading03Icon,
  Mail01Icon,
  GalleryThumbnailsIcon,
  MusicNote01Icon,
  Mic01Icon,
  FloppyDiskIcon,
} from '@hugeicons/core-free-icons';
import { UserProfile, ProfileCardData, CanvasTheme, SocialLinks, DbSection } from '../types';
import { BRAND_LOGOS } from '../data';
import { Button, ButtonGroup } from './ui';
import { COLOR_CONFIG } from './ProfileCard';
import { User } from 'firebase/auth';
import { uploadImageToStorage } from '../lib/storage';
import { profileService } from '../lib/firebase';
import { BillingDashboard } from './BillingDashboard';
import { AccountSettings, AccountSubTab } from './AccountSettings';
import { DesignSettingsPanel } from './DesignSettingsPanel';
import { LeadsDashboard } from './LeadsDashboard';

export type SidebarTabKey =
  | 'links'
  | 'leads'
  | 'appearance'
  | 'analytics'
  | 'settings'
  | 'profile'
  | 'billing'
  | 'share';

export interface BuilderSidebarProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onManualSave?: () => Promise<void> | void;
  onAddCard: () => void;
  onEditCard: (card: ProfileCardData) => void;
  onDeleteCard: (id: string) => void;
  onMoveCard: (index: number, direction: 'up' | 'down') => void;
  onToggleCardActive: (id: string) => void;
  onOpenPublicView: () => void;
  onOpenAuth?: () => void;
  currentUser?: User | null;
  activeSidebarTab?: SidebarTabKey;
  onTabChange?: (tab: SidebarTabKey) => void;
  onOpenAccountSettings?: (initialTab?: AccountSubTab) => void;
  onAddSection?: (title: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onOpenProModal?: (lockedFeatureName?: string) => void;
  onSignOut?: () => void;
  onResetLinks?: () => void;
  onOpenOnboarding?: () => void;
}

const THEME_OPTIONS: { id: CanvasTheme; name: string; hex: string; desc: string; isPro: boolean }[] = [
  { id: 'warm', name: 'Warm Linen', hex: '#F5F2EB', desc: 'Tactile contrast & warm paper tone', isPro: false },
  { id: 'cream', name: 'Alabaster Cream', hex: '#FAF8F5', desc: 'Soft neutral for personal brands', isPro: false },
  { id: 'light', name: 'Studio White', hex: '#FFFFFF', desc: 'Minimalist clean gallery canvas', isPro: false },
  { id: 'clay', name: 'Warm Clay', hex: '#EFEBE4', desc: 'Muted architectural tone', isPro: false },
  { id: 'dark', name: 'Midnight Obsidian', hex: '#191A1E', desc: 'High-contrast midnight dark mode', isPro: false },
  { id: 'minimal', name: 'Minimal Monochrome', hex: '#F8F9FA', desc: 'High readability black & white aesthetic', isPro: true },
  { id: 'glass', name: 'Glass Frost Pro', hex: '#EAE6DF', desc: 'Frosted blur background with subtle gradient', isPro: true },
  { id: 'creator', name: 'Sunset Coral Pro', hex: '#FFF8F6', desc: 'Energetic warm coral creator highlights', isPro: true },
  { id: 'business', name: 'Emerald Business Pro', hex: '#F2FBF6', desc: 'Modern professional green tone', isPro: true },
  { id: 'portfolio', name: 'Champagne Gold Pro', hex: '#FFFDF5', desc: 'Premium golden highlights for showcases', isPro: true },
];

const BUTTON_STYLE_OPTIONS: { id: 'rounded' | 'square' | 'pill' | 'glass'; name: string; desc: string }[] = [
  { id: 'rounded', name: 'Rounded (16px)', desc: 'Modern balanced soft curve' },
  { id: 'pill', name: 'Pill Shape (Full)', desc: 'Capsule dynamic friendly corners' },
  { id: 'square', name: 'Architectural (6px)', desc: 'Clean geometric precision' },
  { id: 'glass', name: 'Glass Frosted', desc: 'Semi-transparent blur overlay' },
];

const FONT_OPTIONS = [
  { id: 'Plus Jakarta Sans', name: 'Modern Sans', preview: 'Clean & readable' },
  { id: 'Playfair Display', name: 'Editorial Serif', preview: 'Sophisticated & premium' },
  { id: 'JetBrains Mono', name: 'Mono Code', preview: 'Technical & sharp' },
  { id: 'Outfit', name: 'Geometric', preview: 'Bold & contemporary' },
];

const CardThumbnailBadge: React.FC<{ card: ProfileCardData; cardTheme: any }> = ({ card, cardTheme }) => {
  const [imgError, setImgError] = useState(false);
  const hasValidLogo = Boolean(card.logoSrc && card.logoSrc.trim() !== '' && !imgError);

  const renderFallbackIcon = () => {
    const t = card.templateType || '';
    if (t.startsWith('music_') || t === 'music_smart_card') {
      return <HugeiconsIcon icon={MusicNote01Icon} size={18} />;
    }
    if (t.startsWith('podcast_') || t === 'podcast_sponsor_me') {
      return <HugeiconsIcon icon={Mic01Icon} size={18} />;
    }
    if (t === 'real_estate') {
      return <HugeiconsIcon icon={Building01Icon} size={18} />;
    }
    return <HugeiconsIcon icon={GalleryThumbnailsIcon} size={18} />;
  };

  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-stone-200/80 bg-stone-50 text-[#1C1E22] transition-transform group-hover:scale-105 overflow-hidden"
      style={{
        backgroundColor: hasValidLogo ? '#ffffff' : `${cardTheme?.bgHex || '#5E4BF7'}15`,
        color: cardTheme?.bgHex || '#5E4BF7',
      }}
    >
      {hasValidLogo ? (
        <img
          src={card.logoSrc}
          alt=""
          className="w-6 h-6 object-contain"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        renderFallbackIcon()
      )}
    </div>
  );
};

export const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
  profile,
  onUpdateProfile,
  onManualSave,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onMoveCard,
  onToggleCardActive,
  onOpenPublicView,
  onOpenAuth,
  currentUser,
  activeSidebarTab,
  onTabChange,
  onOpenAccountSettings,
  onAddSection,
  onDeleteSection,
  onOpenProModal,
  onSignOut,
  onResetLinks,
  onOpenOnboarding,
}) => {
  const [internalTab, setInternalTab] = useState<SidebarTabKey>('links');
  const [copied, setCopied] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  // Manual Save State & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const handleTriggerSave = async () => {
    setIsSaving(true);
    try {
      if (onManualSave) {
        await onManualSave();
      } else {
        onUpdateProfile({});
      }
      setJustSaved(true);
      setShowSaveToast(true);
      setTimeout(() => setJustSaved(false), 2500);
      setTimeout(() => setShowSaveToast(false), 3500);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Section Creator State
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Content Menu state for minimalist UI
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);
  const [showQuickSocialModal, setShowQuickSocialModal] = useState(false);

  // Live Analytics Summary State
  const [analyticsData, setAnalyticsData] = useState<{
    totalViews: number;
    totalClicks: number;
    ctr: string;
    deviceCounts: Record<string, number>;
    referrerCounts: Record<string, number>;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    if (currentUser?.uid && (activeSidebarTab === 'analytics' || internalTab === 'analytics')) {
      setIsLoadingStats(true);
      profileService.getAnalyticsSummary(currentUser.uid).then((summary) => {
        if (summary) {
          setAnalyticsData(summary);
        }
        setIsLoadingStats(false);
      });
    }
  }, [currentUser, activeSidebarTab, internalTab]);

  const handleAvatarFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarUploadError('Image exceeds 2MB. Please upload an image under 2MB for fast loading.');
      return;
    }
    setAvatarUploadError(null);
    setIsUploadingAvatar(true);
    try {
      const url = await uploadImageToStorage(file, 'avatar', currentUser?.uid);
      onUpdateProfile({ avatarUrl: url });
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setAvatarUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const rawTab = activeSidebarTab || internalTab;
  const currentTab: SidebarTabKey = rawTab === 'profile' ? 'settings' : rawTab;
  const setTab = (tab: SidebarTabKey) => {
    setInternalTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const getPublicUrl = () => {
    return `${window.location.origin}?user=${profile.username}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPublicUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialChange = (key: keyof SocialLinks, value: string) => {
    const updatedSocials: SocialLinks = {
      ...(profile.socials || {}),
      [key]: value.trim() ? value.trim() : undefined,
    };
    onUpdateProfile({ socials: updatedSocials });
  };

  const handleCreateSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    if (onAddSection) {
      onAddSection(newSectionTitle.trim());
    } else {
      const newSec: DbSection = {
        id: `sec_${Date.now()}`,
        title: newSectionTitle.trim(),
        position: (profile.sections || []).length,
        is_visible: true,
      };
      onUpdateProfile({ sections: [...(profile.sections || []), newSec] });
    }
    setNewSectionTitle('');
    setShowAddSection(false);
  };

  const totalClicks = profile.cards.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const activeLinksCount = profile.cards.filter((c) => c.isActive !== false).length;
  const topCard = [...profile.cards].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];

  // Unread / New inquiries count for CRM badge
  const [unreadLeadsCount, setUnreadLeadsCount] = useState<number>(0);

  useEffect(() => {
    const pageId = currentUser?.uid || profile.username || 'public_page';
    const localKey = `linklyra_leads_${pageId}`;
    try {
      const cached = localStorage.getItem(localKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setUnreadLeadsCount(parsed.filter((l: any) => l.status === 'new').length);
        }
      }
    } catch {
      // ignore
    }

    profileService
      .getLeads(pageId)
      .then((leads) => {
        if (Array.isArray(leads)) {
          setUnreadLeadsCount(leads.filter((l: any) => l.status === 'new').length);
        }
      })
      .catch(() => {});
  }, [currentUser?.uid, profile.username]);

  const navItems = [
    { id: 'links' as const, label: 'Links', icon: Link01Icon, badge: profile.cards.length },
    { id: 'leads' as const, label: 'Inquiries', icon: Mail01Icon, badge: unreadLeadsCount > 0 ? unreadLeadsCount : undefined },
    { id: 'appearance' as const, label: 'Appearance', icon: ColorsIcon },
    { id: 'analytics' as const, label: 'Analytics', icon: ChartBarLineIcon },
    { id: 'settings' as const, label: 'Settings', icon: Settings01Icon },
    { id: 'billing' as const, label: 'Billing', icon: CreditCardIcon, pro: profile.plan === 'pro' || profile.plan === 'business' },
    { id: 'share' as const, label: 'Share', icon: Share01Icon },
  ];

  return (
    <div className="w-full max-w-full h-full bg-white border-r border-black/10 flex flex-col md:flex-row shadow-sm overflow-hidden">
      {/* Left Navigation Sidebar Rail (Desktop / Tablet) */}
      <aside className="hidden md:flex w-[74px] lg:w-[82px] h-full bg-[#FAF8F5] border-r border-black/10 flex-col items-center justify-between py-3.5 px-1.5 shrink-0 select-none">
        {/* Top: Logo & Username */}
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="w-8 h-8 rounded-xl bg-[#1C1E22] text-white flex items-center justify-center font-black text-xs shadow-xs">
            LL
          </div>
          <span className="text-[9px] font-mono font-bold text-[#737882] truncate max-w-[68px] text-center">
            @{profile.username}
          </span>
        </div>

        {/* Middle: Navigation Buttons */}
        <nav aria-label="Dashboard Navigation" className="w-full flex flex-col items-center gap-1.5 my-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative group active:scale-95 ${
                  isActive
                    ? 'bg-[#1C1E22] text-white shadow-xs font-bold'
                    : 'text-[#737882] hover:text-[#1C1E22] hover:bg-black/5 font-medium'
                }`}
                title={item.label}
              >
                <div className="relative">
                  <HugeiconsIcon icon={Icon} size={18} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-black flex items-center justify-center ${
                        isActive
                          ? 'bg-[#5E4BF7] text-white'
                          : 'bg-[#1C1E22] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.pro && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#F8BA38] text-[#191A1E] rounded-full flex items-center justify-center text-[7px] font-black shadow-2xs">
                      ★
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Account Settings & Auth Avatar */}
        <div className="w-full flex flex-col items-center pt-2 border-t border-black/5">
          <button
            type="button"
            onClick={() => onOpenAccountSettings ? onOpenAccountSettings('profile') : onOpenAuth?.()}
            className="w-8 h-8 rounded-full overflow-hidden border border-black/15 hover:ring-2 hover:ring-[#1C1E22] transition-all relative shrink-0 cursor-pointer shadow-2xs group"
            title={currentUser ? `Account: ${currentUser.email || currentUser.displayName || profile.name}` : 'Sign In / Account'}
          >
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={profile.name || 'Account'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </button>
        </div>
      </aside>

      {/* Main Workspace Column */}
      <div className="flex-1 h-full flex flex-col min-w-0 bg-white overflow-hidden">
        {/* Mobile Navigation Header (Only visible on small mobile screens - optimized for touch) */}
        <div className="md:hidden border-b border-black/5 bg-[#FAF8F5] px-2.5 py-2 overflow-x-auto scrollbar-none shrink-0 flex items-center gap-1.5 touch-scroll">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 touch-manipulation active:scale-95 ${
                  isActive
                    ? 'bg-[#1C1E22] text-white shadow-xs'
                    : 'text-[#737882] hover:text-[#1C1E22] hover:bg-black/5 bg-white/60'
                }`}
              >
                <HugeiconsIcon icon={Icon} size={15} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-black/10 text-[#1C1E22]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-black/5 bg-white flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-[#1C1E22] text-base sm:text-xl tracking-tight truncate">
              {currentTab === 'links' && 'Content'}
              {currentTab === 'leads' && 'Inquiries & Leads'}
              {currentTab === 'appearance' && 'Appearance'}
              {currentTab === 'analytics' && 'Analytics'}
              {currentTab === 'settings' && 'Settings'}
              {currentTab === 'billing' && 'Billing'}
              {currentTab === 'share' && 'Share'}
            </h2>
            <p className="text-[11px] text-[#737882] truncate">
              {currentTab === 'links' && `${profile.cards.length} link${profile.cards.length === 1 ? '' : 's'} • @${profile.username}`}
              {currentTab === 'leads' && 'Inbound bookings, sponsor deals, and client requests'}
              {currentTab === 'appearance' && 'Themes, button styling, and typography'}
              {currentTab === 'analytics' && 'Real-time page views and link clicks'}
              {currentTab === 'settings' && 'Profile photo, bio, and social accounts'}
              {currentTab === 'billing' && 'Manage subscription plan and receipts'}
              {currentTab === 'share' && 'Share your link on social media and bios'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Dedicated Save Progress Button using Universal UI Kit */}
            <Button
              id="header-save-button"
              variant="primary"
              size="md"
              onClick={handleTriggerSave}
              disabled={isSaving}
              isLoading={isSaving}
              className={justSaved ? '!bg-emerald-600 !border-emerald-600 shadow-xs' : ''}
              title="Save all changes"
            >
              {!isSaving && (
                justSaved ? (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} className="text-emerald-200" />
                ) : (
                  <HugeiconsIcon icon={FloppyDiskIcon} size={15} />
                )
              )}
              <span>{isSaving ? 'Saving...' : justSaved ? 'Saved!' : 'Save'}</span>
            </Button>

            {/* Preview Button using Universal UI Kit */}
            <Button
              size="md"
              variant="secondary"
              onClick={onOpenPublicView}
              title="Open live visitor view"
            >
              <HugeiconsIcon icon={ViewIcon} size={15} />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 max-w-full [scrollbar-gutter:stable]">
        {/* ===================== TAB 1: LINKS ===================== */}
        {currentTab === 'links' && (
          <div className="space-y-4 max-w-full">
            {/* Minimalist Profile Hero Header (Matching Reference Design) */}
            <div className="flex items-center gap-3.5 p-3 sm:p-3.5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs">
              <div
                onClick={() => avatarFileInputRef.current?.click()}
                className="relative w-12 h-12 rounded-full overflow-hidden border border-stone-200 bg-stone-100 shrink-0 cursor-pointer group"
                title="Change profile avatar"
              >
                <img
                  src={
                    profile.avatarUrl && profile.avatarUrl.trim() !== ''
                      ? profile.avatarUrl
                      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <HugeiconsIcon icon={Edit01Icon} size={14} className="text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-[#1C1E22] truncate leading-tight">
                  {profile.name || 'Ayush Vishwakarma'}
                </h3>
                <p className="text-xs text-[#737882] mt-0.5 leading-snug break-words">
                  {profile.headline || 'Host of The Founders'}
                </p>

                {/* Social icons row */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setTab('settings')}
                    className="w-6 h-6 rounded-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] flex items-center justify-center transition-colors text-[11px]"
                    title="LinkedIn"
                  >
                    <svg className="w-3.5 h-3.5 fill-[#0A66C2]" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('settings')}
                    className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-[#1C1E22] flex items-center justify-center transition-colors text-[11px]"
                    title="Email / Contact"
                  >
                    <HugeiconsIcon icon={Mail01Icon} size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('settings')}
                    className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-[#1C1E22] flex items-center justify-center transition-colors"
                    title="Add or edit social profiles"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Minimalist Action Buttons Row (Image matching) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowAddSection(!showAddSection)}
                className="w-full min-h-[44px] py-2.5 px-4 bg-stone-100 hover:bg-stone-200/80 active:bg-stone-200 text-[#1C1E22] rounded-full text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-black/5 touch-manipulation active:scale-95"
              >
                <HugeiconsIcon icon={FolderAddIcon} size={15} />
                <span>Add Collection</span>
              </button>

              <button
                type="button"
                onClick={onAddCard}
                className="w-full min-h-[44px] py-2.5 px-4 bg-[#1C1E22] hover:bg-black active:bg-[#0E0F11] text-white rounded-full text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs touch-manipulation active:scale-95"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={15} />
                <span>Add Link</span>
              </button>
            </div>

            {/* Quick Inline Section Creator */}
            {showAddSection && (
              <form
                onSubmit={handleCreateSectionSubmit}
                className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 animate-fadeIn"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1C1E22] block">
                    Create Collection / Section Header
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddSection(false)}
                    className="text-xs text-[#737882] hover:text-[#1C1E22]"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Featured Deals, Courses, Socials..."
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-[#1C1E22] focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <Button type="submit" variant="primary" size="sm" className="rounded-xl">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {['Featured Deals', 'Courses & Batches', 'My Portfolio', 'Social Profiles'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewSectionTitle(tag)}
                      className="px-2 py-0.5 rounded-full bg-white border border-stone-200 text-[10px] font-semibold text-[#737882] hover:text-[#1C1E22]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>
            )}

            {/* Existing Sections List (if any) */}
            {profile.sections && profile.sections.length > 0 && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#737882]">
                  <span>Collections ({profile.sections.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.sections.map((sec) => (
                    <span
                      key={sec.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-xl border border-stone-200 text-xs font-bold text-[#1C1E22] shadow-2xs"
                    >
                      <HugeiconsIcon icon={Folder01Icon} size={12} className="text-[#1C1E22]" />
                      <span>{sec.title}</span>
                      {onDeleteSection && (
                        <button
                          type="button"
                          onClick={() => onDeleteSection(sec.id)}
                          className="text-[#737882] hover:text-red-600 ml-1"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Link Cards List (Minimalist Clean Cards matching Image) */}
            <div className="space-y-3 max-w-full">
              {profile.cards.length === 0 ? (
                <div className="text-center py-10 px-4 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-2.5 shadow-xs border border-stone-200 text-[#1C1E22]">
                    <HugeiconsIcon icon={Link01Icon} size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-[#1C1E22]">No links created yet</h3>
                  <p className="text-xs text-[#737882] mt-1 mb-3.5 max-w-xs mx-auto">
                    Add social media, portfolio, newsletter, or external links.
                  </p>
                  <button
                    type="button"
                    onClick={onAddCard}
                    className="px-5 py-2.5 bg-[#1C1E22] text-white rounded-full text-xs font-bold hover:bg-black transition-colors"
                  >
                    + Add Link
                  </button>
                </div>
              ) : (
                profile.cards.map((card, index) => {
                  const cardTheme = COLOR_CONFIG[card.color] || COLOR_CONFIG.purple;
                  const isFirst = index === 0;
                  const isLast = index === profile.cards.length - 1;
                  const isMenuOpen = activeCardMenuId === card.id;

                  return (
                    <div
                      key={card.id}
                      className={`group relative p-3.5 sm:p-4 rounded-[22px] sm:rounded-[24px] border transition-all max-w-full ${
                        card.isActive !== false
                          ? 'bg-white border-stone-200/90 shadow-2xs hover:border-stone-300'
                          : 'bg-stone-50/60 border-dashed border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 min-w-0">
                        {/* Left: Soft Rounded Icon Box with Gallery fallback */}
                        <CardThumbnailBadge card={card} cardTheme={cardTheme} />

                        {/* Middle: Title & Subtitle (Clicks / URL) */}
                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEditCard(card)}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm sm:text-base font-bold text-[#1C1E22] truncate leading-tight">
                              {card.title}
                            </h4>
                            {card.badgeText && (
                              <span className="px-1.5 py-0.5 rounded-full bg-stone-100 text-[#1C1E22] font-semibold text-[9px] truncate max-w-[80px]">
                                {card.badgeText}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#737882] truncate font-normal mt-0.5">
                            {card.clicks || 0} clicks
                            {card.linkUrl && (
                              <span className="ml-1 text-stone-400">
                                • {card.linkUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Right: Three Dots Action Menu Button */}
                        <div className="relative shrink-0 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveCardMenuId(isMenuOpen ? null : card.id)}
                            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full hover:bg-stone-100 active:bg-stone-200 text-[#737882] hover:text-[#1C1E22] flex items-center justify-center transition-colors touch-manipulation"
                            title="More options"
                            aria-label="More options for this card"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>

                          {/* Sleek Floating Dropdown Menu */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-11 w-48 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-1.5 z-30 animate-fadeIn text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  onEditCard(card);
                                }}
                                className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 flex items-center gap-2 font-medium touch-manipulation"
                              >
                                <HugeiconsIcon icon={Edit01Icon} size={15} className="text-stone-500" />
                                <span>Edit Card</span>
                              </button>

                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  onMoveCard(index, 'up');
                                }}
                                className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 flex items-center gap-2 font-medium disabled:opacity-30 disabled:pointer-events-none touch-manipulation"
                              >
                                <HugeiconsIcon icon={ArrowUp01Icon} size={15} className="text-stone-500" />
                                <span>Move Up</span>
                              </button>

                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  onMoveCard(index, 'down');
                                }}
                                className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 flex items-center gap-2 font-medium disabled:opacity-30 disabled:pointer-events-none touch-manipulation"
                              >
                                <HugeiconsIcon icon={ArrowDown01Icon} size={15} className="text-stone-500" />
                                <span>Move Down</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  onToggleCardActive(card.id);
                                }}
                                className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 flex items-center gap-2 font-medium touch-manipulation"
                              >
                                <HugeiconsIcon icon={ViewIcon} size={15} className="text-stone-500" />
                                <span>{card.isActive !== false ? 'Hide Link' : 'Show Link'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  if (card.linkUrl) {
                                    navigator.clipboard.writeText(card.linkUrl);
                                  }
                                }}
                                className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-[#1C1E22] hover:bg-stone-50 active:bg-stone-100 flex items-center gap-2 font-medium touch-manipulation"
                              >
                                <HugeiconsIcon icon={Copy01Icon} size={15} className="text-stone-500" />
                                <span>Copy URL</span>
                              </button>

                              <div className="h-px bg-stone-100 my-1" />

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCardMenuId(null);
                                  onDeleteCard(card.id);
                                }}
                                className="w-full min-h-[40px] px-3.5 py-2.5 text-left text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center gap-2 font-medium touch-manipulation"
                              >
                                <HugeiconsIcon icon={Delete01Icon} size={15} />
                                <span>Delete Card</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 2: PROFILE & BIO ===================== */}
        {(currentTab === 'profile' || currentTab === 'settings') && (
          <div className="space-y-4 max-w-full">
            {/* Top Settings Summary Bar */}
            <div className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[#1C1E22] flex items-center gap-1.5">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-emerald-600 shrink-0" />
                  <span>Profile Identity & Details</span>
                </h3>
                <p className="text-[11px] text-[#737882] mt-0.5 truncate">
                  Changes preview in real-time. Save anytime from the top bar.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 max-w-full">
              {/* Profile Photo / Avatar Upload */}
              <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-2.5">
                <label className="text-xs font-bold text-[#1C1E22] block">
                  Profile Photo
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-black/10 bg-black/5 shrink-0">
                    <img
                      src={
                        profile.avatarUrl && profile.avatarUrl.trim() !== ''
                          ? profile.avatarUrl
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                      }
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <HugeiconsIcon icon={Loading03Icon} size={20} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <input
                      type="file"
                      ref={avatarFileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleAvatarFileUpload(e.target.files[0]);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#1C1E22] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <HugeiconsIcon icon={Upload01Icon} size={14} />
                      <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                    <p className="text-[10px] text-[#737882]">Max 2MB (PNG, JPG, WebP)</p>
                    {avatarUploadError && (
                      <p className="text-[10px] font-semibold text-rose-600 animate-fadeIn">{avatarUploadError}</p>
                    )}
                    <input
                      type="url"
                      value={profile.avatarUrl}
                      onChange={(e) => onUpdateProfile({ avatarUrl: e.target.value })}
                      placeholder="Or paste image URL"
                      className="w-full px-2.5 py-1 bg-black/5 rounded-lg border border-black/10 text-[11px] font-mono text-[#1C1E22] focus:outline-none focus:ring-1 focus:ring-[#5E4BF7]"
                    />
                  </div>
                </div>
              </div>

              {/* Display Name and Username Handle in a clean responsive 2-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => onUpdateProfile({ name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                    Handle / Username (Public URL)
                  </label>
                  <div className="flex items-center min-w-0">
                    <span className="px-3 py-2 bg-black/5 border border-r-0 border-black/10 rounded-l-xl text-xs font-bold text-[#737882] shrink-0">
                      /
                    </span>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) =>
                        onUpdateProfile({
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                        })
                      }
                      className="flex-1 min-w-0 px-3 py-2 bg-white rounded-r-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1C1E22] block mb-1">
                  Bio / Headline
                </label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => onUpdateProfile({ headline: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                  placeholder="Creator, Designer, Developer, Founder"
                />
              </div>

              {/* WhatsApp Contact Box */}
              <div className="p-3.5 bg-[#1C1E22] text-white rounded-2xl border border-black/10 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <HugeiconsIcon icon={Share01Icon} size={15} className="text-white/80" />
                    <span>WhatsApp Contact</span>
                  </div>
                  {profile.businessPhone ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white font-semibold text-[10px]">
                      <HugeiconsIcon icon={Tick01Icon} size={11} className="text-white" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium text-[10px]">
                      Optional
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-white/90 block mb-1">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={profile.businessPhone || ''}
                      onChange={(e) => onUpdateProfile({ businessPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-white/10 rounded-xl border border-white/15 text-white placeholder-white/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 shadow-xs font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-white/60 mt-1.5 leading-normal">
                    Allows visitors to message or send inquiries directly to your WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Icons Editor in a responsive 2-column layout */}
            <div className="pt-3 border-t border-black/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#1C1E22]">Social Links</h3>
                  <p className="text-[11px] text-[#737882]">
                    Add handles to display icons directly beneath your bio
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
                    WhatsApp (Phone or Chat Link)
                  </label>
                  <input
                    type="text"
                    placeholder="+1234567890 or https://wa.me/..."
                    value={profile.socials?.whatsapp || ''}
                    onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1C1E22]"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
                    Instagram
                  </label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/username"
                    value={profile.socials?.instagram || ''}
                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
                    X (Twitter)
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/yourhandle"
                    value={profile.socials?.twitter || ''}
                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
                    YouTube
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@channel"
                    value={profile.socials?.youtube || ''}
                    onChange={(e) => handleSocialChange('youtube', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={profile.socials?.linkedin || ''}
                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
                    GitHub
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={profile.socials?.github || ''}
                    onChange={(e) => handleSocialChange('github', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] block mb-0.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={profile.socials?.email || ''}
                    onChange={(e) => handleSocialChange('email', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                  />
                </div>
              </div>
            </div>

            {/* Dedicated Save Progress Footer Section */}
            <div className="pt-4 border-t border-black/10 mt-6 sticky bottom-0 bg-white/95 backdrop-blur-md py-3 z-10">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1C1E22] flex items-center gap-1.5">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} className="text-emerald-600 shrink-0" />
                    <span>Save profile & links</span>
                  </div>
                  <p className="text-[11px] text-[#737882] truncate">
                    Persist your bio, handle, WhatsApp routing, and social accounts.
                  </p>
                </div>
                <button
                  id="save-settings-button"
                  type="button"
                  onClick={handleTriggerSave}
                  disabled={isSaving}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer shrink-0 ${
                    justSaved
                      ? 'bg-emerald-600 text-white'
                      : isSaving
                      ? 'bg-stone-200 text-stone-600'
                      : 'bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white active:scale-95'
                  }`}
                >
                  {isSaving ? (
                    <HugeiconsIcon icon={Loading03Icon} size={15} className="animate-spin" />
                  ) : justSaved ? (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />
                  ) : (
                    <HugeiconsIcon icon={FloppyDiskIcon} size={15} />
                  )}
                  <span>{isSaving ? 'Saving Changes...' : justSaved ? 'Settings Saved!' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 3: APPEARANCE & DESIGN SETTINGS ===================== */}
        {currentTab === 'appearance' && (
          <DesignSettingsPanel
            profile={profile}
            onUpdateProfile={onUpdateProfile}
            onManualSave={onManualSave}
            onOpenProModal={onOpenProModal}
            onOpenOnboarding={onOpenOnboarding}
          />
        )}

        {/* ===================== TAB 4: ANALYTICS & STATS ===================== */}
        {currentTab === 'analytics' && (
          <div className="space-y-4 max-w-full">
            <div>
              <h3 className="text-xs font-bold text-[#1C1E22]">Live Traffic & Stats</h3>
              <p className="text-[11px] text-[#737882] mt-0.5">
                Real-time page views and link clicks
              </p>
            </div>

            {/* Key Metrics Overview Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-1 min-w-0">
                <div className="flex items-center justify-between text-[#737882]">
                  <span className="text-[9px] font-bold uppercase truncate">Views</span>
                  <HugeiconsIcon icon={ViewIcon} size={12} className="text-[#5E4BF7] shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-[#1C1E22] truncate">
                  {(analyticsData?.totalViews ?? totalClicks * 3).toLocaleString()}
                </div>
                <div className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5 truncate">
                  <HugeiconsIcon icon={TrendingUpIcon} size={10} className="shrink-0" />
                  <span>Live</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-1 min-w-0">
                <div className="flex items-center justify-between text-[#737882]">
                  <span className="text-[9px] font-bold uppercase truncate">Clicks</span>
                  <HugeiconsIcon icon={TrendingUpIcon} size={12} className="text-[#E75646] shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-[#1C1E22] truncate">
                  {(analyticsData?.totalClicks ?? totalClicks).toLocaleString()}
                </div>
                <div className="text-[9px] text-[#737882] font-semibold truncate">
                  Across all cards
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-1 min-w-0">
                <div className="flex items-center justify-between text-[#737882]">
                  <span className="text-[9px] font-bold uppercase truncate">Click Rate</span>
                  <HugeiconsIcon icon={TrendingUpIcon} size={12} className="text-[#F8BA38] shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-[#1C1E22] truncate">
                  {analyticsData?.ctr ?? (totalClicks > 0 ? '33.3' : '0.0')}%
                </div>
                <div className="text-[9px] text-[#737882] font-semibold truncate">
                  Click rate
                </div>
              </div>
            </div>

            {/* Device Distribution */}
            <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-2">
              <label className="text-[10px] font-bold text-[#737882] uppercase tracking-wider block">
                Device Distribution
              </label>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-[#FAF8F5] rounded-xl border border-black/5">
                  <HugeiconsIcon icon={SmartPhone01Icon} size={16} className="mx-auto text-[#5E4BF7] mb-1" />
                  <div className="font-bold text-[#1C1E22]">
                    {analyticsData?.deviceCounts?.mobile ?? 72}%
                  </div>
                  <div className="text-[9px] text-[#737882]">Mobile</div>
                </div>
                <div className="p-2 bg-[#FAF8F5] rounded-xl border border-black/5">
                  <HugeiconsIcon icon={ComputerIcon} size={16} className="mx-auto text-[#1C1E22] mb-1" />
                  <div className="font-bold text-[#1C1E22]">
                    {analyticsData?.deviceCounts?.desktop ?? 24}%
                  </div>
                  <div className="text-[9px] text-[#737882]">Desktop</div>
                </div>
                <div className="p-2 bg-[#FAF8F5] rounded-xl border border-black/5">
                  <HugeiconsIcon icon={Tablet01Icon} size={16} className="mx-auto text-[#E75646] mb-1" />
                  <div className="font-bold text-[#1C1E22]">
                    {analyticsData?.deviceCounts?.tablet ?? 4}%
                  </div>
                  <div className="text-[9px] text-[#737882]">Tablet</div>
                </div>
              </div>
            </div>

            {/* Top Performing Link Card */}
            {topCard && profile.cards.length > 0 && (
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-black/5 space-y-1.5 max-w-full">
                <span className="text-[10px] font-bold text-[#737882] uppercase tracking-wider block">
                  Top Performing Link
                </span>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-black/10 shadow-2xs gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#1C1E22] truncate">{topCard.title}</h4>
                    <p className="text-[10px] text-[#737882] truncate">{topCard.linkUrl}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#5E4BF7] text-white shrink-0">
                    {topCard.clicks || 0} clicks
                  </span>
                </div>
              </div>
            )}

            {/* Per-card Click Breakdown */}
            <div className="space-y-1.5 max-w-full">
              <label className="text-[10px] font-bold text-[#737882] uppercase tracking-wider block">
                Clicks Breakdown
              </label>
              {profile.cards.length === 0 ? (
                <p className="text-xs text-[#737882] py-2">No links created yet.</p>
              ) : (
                profile.cards.map((c) => {
                  const cardTheme = COLOR_CONFIG[c.color] || COLOR_CONFIG.purple;
                  const pct = totalClicks > 0 ? Math.round(((c.clicks || 0) / totalClicks) * 100) : 0;
                  return (
                    <div
                      key={c.id}
                      className="p-2.5 bg-white rounded-xl border border-black/10 flex items-center justify-between gap-2 text-xs min-w-0"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cardTheme.bgHex }}
                        />
                        <span className="font-semibold text-[#1C1E22] truncate">{c.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-[#737882]">{pct}%</span>
                        <span className="font-bold text-[#1C1E22] bg-black/5 px-1.5 py-0.5 rounded-full text-[10px]">
                          {c.clicks || 0}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 5: SHARE & QR ===================== */}
        {currentTab === 'share' && (
          <div className="space-y-4 max-w-full">
            <div>
              <h3 className="text-xs font-bold text-[#1C1E22]">Public Link & QR Code</h3>
              <p className="text-[11px] text-[#737882] mt-0.5">
                Share your LinkCards URL on bios, resumes, and socials
              </p>
            </div>

            {/* Share URL Box */}
            <div className="p-3.5 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-2.5 max-w-full">
              <label className="text-[10px] font-bold text-[#737882] uppercase tracking-wider block">
                Your Link in Bio URL
              </label>
              <div className="flex items-center gap-1.5 min-w-0">
                <input
                  type="text"
                  readOnly
                  value={getPublicUrl()}
                  className="flex-1 min-w-0 px-2.5 py-2 bg-black/5 rounded-xl text-xs font-mono text-[#1C1E22] border border-black/10 select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-[#1C1E22] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all active:scale-95 shadow-2xs shrink-0"
                >
                  {copied ? <HugeiconsIcon icon={Tick01Icon} size={14} className="text-emerald-400" /> : <HugeiconsIcon icon={Copy01Icon} size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenPublicView}
                className="w-full py-2.5 px-3 bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
              >
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="shrink-0" />
                <span>Open Full Visitor Page</span>
              </button>
            </div>

            {/* QR Code generator */}
            <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-2xs text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#1C1E22]">
                <HugeiconsIcon icon={QrCodeIcon} size={16} className="text-[#5E4BF7] shrink-0" />
                <span>Instant QR Code</span>
              </div>
              <div className="w-36 h-36 mx-auto p-2 bg-white rounded-2xl border border-black/10 shadow-xs flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    getPublicUrl()
                  )}`}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
        {/* ===================== TAB 6: BILLING & PLANS ===================== */}
        {currentTab === 'billing' && (
          <div className="space-y-4 max-w-full">
            <BillingDashboard
              profile={profile}
              currentUser={currentUser || null}
              onOpenUpgradeModal={() => onOpenProModal ? onOpenProModal('Pro Upgrade') : undefined}
              onProfileUpdate={onUpdateProfile}
            />
          </div>
        )}

        {/* ===================== TAB 7: LEADS & INQUIRIES CRM ===================== */}
        {currentTab === 'leads' && (
          <div className="space-y-4 max-w-full">
            <LeadsDashboard
              profile={profile}
              currentUser={currentUser || null}
              onOpenProModal={onOpenProModal}
            />
          </div>
        )}
      </div>

      {/* Floating Save Confirmation Notification */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 bg-[#1C1E22] text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-emerald-400 shrink-0" />
          <span>Profile & social accounts saved successfully!</span>
        </div>
      )}
    </div>
    </div>
  );
};
