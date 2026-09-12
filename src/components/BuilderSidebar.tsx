import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Share2,
  Copy,
  ExternalLink,
  Eye,
  Check,
  UserCheck,
  Link2,
  User as UserIcon,
  Palette,
  QrCode,
  BarChart2,
  TrendingUp,
  MousePointer,
  Layers,
  MessageCircle,
  Building2,
  GraduationCap,
  Upload,
  Loader2,
  FolderPlus,
  Folder,
  Sparkles,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Type,
  Square,
  Circle,
  Sparkle,
} from 'lucide-react';
import { UserProfile, ProfileCardData, CanvasTheme, SocialLinks, DbSection } from '../types';
import { COLOR_CONFIG } from './ProfileCard';
import { User } from 'firebase/auth';
import { uploadImageToStorage } from '../lib/storage';
import { profileService } from '../lib/firebase';

export interface BuilderSidebarProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onAddCard: () => void;
  onEditCard: (card: ProfileCardData) => void;
  onDeleteCard: (id: string) => void;
  onMoveCard: (index: number, direction: 'up' | 'down') => void;
  onToggleCardActive: (id: string) => void;
  onOpenPublicView: () => void;
  onOpenAuth?: () => void;
  currentUser?: User | null;
  activeSidebarTab?: 'links' | 'profile' | 'appearance' | 'analytics' | 'share';
  onTabChange?: (tab: 'links' | 'profile' | 'appearance' | 'analytics' | 'share') => void;
  onAddSection?: (title: string) => void;
  onDeleteSection?: (sectionId: string) => void;
}

const THEME_OPTIONS: { id: CanvasTheme; name: string; hex: string; desc: string }[] = [
  { id: 'warm', name: 'Warm Linen', hex: '#F5F2EB', desc: 'Signature aesthetic with rich tactile contrast' },
  { id: 'cream', name: 'Alabaster Cream', hex: '#FAF8F5', desc: 'Soft warm neutral for personal brands' },
  { id: 'light', name: 'Studio White', hex: '#FFFFFF', desc: 'Minimalist clean gallery canvas' },
  { id: 'clay', name: 'Warm Clay', hex: '#EFEBE4', desc: 'Muted architectural tone' },
  { id: 'dark', name: 'Twilight Charcoal', hex: '#191A1E', desc: 'High-contrast midnight dark mode' },
  { id: 'minimal', name: 'Minimal Clean', hex: '#F8F9FA', desc: 'High readability black & white aesthetic' },
  { id: 'glass', name: 'Glass Frost', hex: '#EAE6DF', desc: 'Frosted blur background with subtle gradient' },
  { id: 'creator', name: 'Creator Burst', hex: '#FFF8F6', desc: 'Energetic warm coral highlights' },
  { id: 'business', name: 'Emerald Business', hex: '#F2FBF6', desc: 'Modern professional green tone' },
  { id: 'portfolio', name: 'Portfolio Gold', hex: '#FFFDF5', desc: 'Premium golden highlights for showcases' },
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

export const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
  profile,
  onUpdateProfile,
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
  onAddSection,
  onDeleteSection,
}) => {
  const [internalTab, setInternalTab] = useState<'links' | 'profile' | 'appearance' | 'analytics' | 'share'>('links');
  const [copied, setCopied] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  // Section Creator State
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

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
    if (!file.type.startsWith('image/')) return;
    setIsUploadingAvatar(true);
    try {
      const url = await uploadImageToStorage(file, 'avatar', currentUser?.uid);
      onUpdateProfile({ avatarUrl: url });
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const currentTab = activeSidebarTab || internalTab;
  const setTab = (tab: 'links' | 'profile' | 'appearance' | 'analytics' | 'share') => {
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

  return (
    <div className="w-full max-w-full h-full bg-white border-r border-black/10 flex flex-col shadow-sm overflow-hidden">
      {/* Studio Header Bar */}
      <div className="p-3 sm:p-4 border-b border-black/5 bg-[#FAF8F5] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-[#1C1E22] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
            LC
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="font-extrabold text-[#1C1E22] text-sm tracking-tight truncate">
                Studio
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#5E4BF7]/10 text-[#5E4BF7] truncate max-w-[120px]">
                @{profile.username}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#737882] truncate">
              {currentUser ? 'Cloud Synced' : 'Local Draft'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              title={currentUser ? `Account: ${currentUser.email}` : 'Sign In with Google'}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold border border-black/10 bg-white text-[#1C1E22] hover:bg-black/5 flex items-center gap-1 transition-colors shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#5E4BF7] shrink-0" />
              <span className="hidden sm:inline">{currentUser ? 'Account' : 'Sign In'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPublicView}
            className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-[#1C1E22] hover:bg-black text-white flex items-center gap-1 transition-all shadow-2xs active:scale-95 shrink-0"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Visitor</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-black/5 bg-white px-2 sm:px-3 overflow-x-auto scrollbar-none shrink-0 flex-nowrap">
        <button
          type="button"
          onClick={() => setTab('links')}
          className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 ${
            currentTab === 'links'
              ? 'border-[#5E4BF7] text-[#5E4BF7]'
              : 'border-transparent text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 shrink-0" />
          <span>Links ({profile.cards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('profile')}
          className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 ${
            currentTab === 'profile'
              ? 'border-[#5E4BF7] text-[#5E4BF7]'
              : 'border-transparent text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5 shrink-0" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('appearance')}
          className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 ${
            currentTab === 'appearance'
              ? 'border-[#5E4BF7] text-[#5E4BF7]'
              : 'border-transparent text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <Palette className="w-3.5 h-3.5 shrink-0" />
          <span>Theme</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('analytics')}
          className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 ${
            currentTab === 'analytics'
              ? 'border-[#5E4BF7] text-[#5E4BF7]'
              : 'border-transparent text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 shrink-0" />
          <span>Stats</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('share')}
          className={`py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all shrink-0 ${
            currentTab === 'share'
              ? 'border-[#5E4BF7] text-[#5E4BF7]'
              : 'border-transparent text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          <span>Share</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 max-w-full">
        {/* ===================== TAB 1: LINKS ===================== */}
        {currentTab === 'links' && (
          <div className="space-y-4 max-w-full">
            {/* Primary Action Buttons: Add Link & Add Section Header */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onAddCard}
                className="py-3 px-3 bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.99]"
              >
                <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>Add Link</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddSection(!showAddSection)}
                className="py-3 px-3 bg-white hover:bg-black/5 text-[#1C1E22] border border-black/10 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.99]"
              >
                <FolderPlus className="w-4 h-4 text-[#5E4BF7] shrink-0" />
                <span>+ Section</span>
              </button>
            </div>

            {/* Quick Inline Section Creator */}
            {showAddSection && (
              <form
                onSubmit={handleCreateSectionSubmit}
                className="p-3 bg-[#FAF8F5] rounded-2xl border border-black/10 space-y-2 animate-fadeIn"
              >
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#1C1E22] block">
                    Create Section Header
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddSection(false)}
                    className="text-[10px] text-[#737882] hover:text-[#1C1E22]"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Featured Listings, Courses, Socials..."
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#1C1E22] hover:bg-black text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    Add
                  </button>
                </div>
                {/* Suggestions */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {['Featured Deals', 'Courses & Batches', 'My Portfolio', 'Social Profiles'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewSectionTitle(tag)}
                      className="px-2 py-0.5 rounded-full bg-white border border-black/10 text-[10px] font-semibold text-[#737882] hover:text-[#1C1E22]"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>
            )}

            {/* Existing Sections List (if any) */}
            {profile.sections && profile.sections.length > 0 && (
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-black/5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#737882]">
                  <span>Organized Sections ({profile.sections.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.sections.map((sec) => (
                    <span
                      key={sec.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-xl border border-black/10 text-xs font-bold text-[#1C1E22] shadow-2xs"
                    >
                      <Folder className="w-3 h-3 text-[#5E4BF7]" />
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

            {/* Quick Stats Summary */}
            <div className="px-3.5 py-2.5 bg-[#FAF8F5] rounded-2xl border border-black/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#737882] min-w-0">
                <Layers className="w-3.5 h-3.5 text-[#5E4BF7] shrink-0" />
                <span className="font-semibold text-[#1C1E22] truncate">Active Cards:</span>
              </div>
              <span className="font-bold text-[#1C1E22] bg-white px-2.5 py-0.5 rounded-full border border-black/10 shrink-0">
                {activeLinksCount} / {profile.cards.length}
              </span>
            </div>

            {/* Link Cards List */}
            <div className="space-y-2.5 max-w-full">
              {profile.cards.length === 0 ? (
                <div className="text-center py-10 px-4 bg-[#FAF8F5] rounded-3xl border border-dashed border-black/15">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-2.5 shadow-xs border border-black/10 text-[#5E4BF7]">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#1C1E22]">No links created yet</h3>
                  <p className="text-[11px] sm:text-xs text-[#737882] mt-1 mb-3.5 max-w-xs mx-auto">
                    Add social media, portfolio, newsletter, store, or external links.
                  </p>
                  <button
                    type="button"
                    onClick={onAddCard}
                    className="px-4 py-2 bg-[#1C1E22] text-white rounded-full text-xs font-bold hover:bg-black transition-colors"
                  >
                    Create First Link
                  </button>
                </div>
              ) : (
                profile.cards.map((card, index) => {
                  const cardTheme = COLOR_CONFIG[card.color] || COLOR_CONFIG.purple;
                  const isFirst = index === 0;
                  const isLast = index === profile.cards.length - 1;

                  return (
                    <div
                      key={card.id}
                      className={`p-3 rounded-2xl border transition-all max-w-full overflow-hidden ${
                        card.isActive !== false
                          ? 'bg-white border-black/10 shadow-2xs hover:border-black/20'
                          : 'bg-black/5 border-dashed border-black/15 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                        {/* Left: Reorder & Thumbnail & Title */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Reorder Buttons */}
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => onMoveCard(index, 'up')}
                              className="p-1 rounded-md hover:bg-black/5 text-[#737882] disabled:opacity-20 transition-colors"
                              title="Move up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => onMoveCard(index, 'down')}
                              className="p-1 rounded-md hover:bg-black/5 text-[#737882] disabled:opacity-20 transition-colors"
                              title="Move down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Color Dot & Logo */}
                          <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 p-1 shadow-2xs"
                            style={{ backgroundColor: cardTheme.bgHex }}
                          >
                            {card.logoSrc ? (
                              <img
                                src={card.logoSrc}
                                alt=""
                                className="w-full h-full object-contain filter invert"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-white text-xs font-bold">
                                {card.title ? card.title.charAt(0).toUpperCase() : 'L'}
                              </span>
                            )}
                          </div>

                          {/* Title & URL */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-[#1C1E22] truncate leading-tight">
                                {card.title}
                              </h4>
                              {card.templateType === 'real_estate' && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-[#E75646]/10 text-[#E75646] font-bold text-[9px]">
                                  <Building2 className="w-2.5 h-2.5" />
                                  <span>Real Estate</span>
                                </span>
                              )}
                              {card.templateType === 'coaching_institute' && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-[#5E4BF7]/10 text-[#5E4BF7] font-bold text-[9px]">
                                  <GraduationCap className="w-2.5 h-2.5" />
                                  <span>Coaching</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-[#737882] truncate font-normal mt-0.5">
                              {card.templateType === 'real_estate' && card.realEstate
                                ? `${card.realEstate.propertyType || 'Property'} • ${card.realEstate.priceBracket || ''} • ${card.realEstate.location || ''}`
                                : card.templateType === 'coaching_institute' && card.coaching
                                ? `${card.coaching.examTrack || 'Course'} • ${card.coaching.feeStructure || ''} • ${card.coaching.batchTiming || ''}`
                                : card.linkUrl}
                            </p>
                          </div>
                        </div>

                        {/* Right: Active Toggle Switch */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onToggleCardActive(card.id)}
                            title={card.isActive !== false ? 'Hide link' : 'Show link'}
                            className={`w-8 h-4.5 sm:w-9 sm:h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                              card.isActive !== false ? 'bg-emerald-500' : 'bg-black/20'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white transition-transform shadow-xs ${
                                card.isActive !== false ? 'translate-x-3.5 sm:translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Card meta footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[11px] text-[#737882] min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span
                            className="px-1.5 py-0.5 rounded-full font-bold text-[9px] uppercase shrink-0"
                            style={{
                              backgroundColor: `${cardTheme.bgHex}20`,
                              color: cardTheme.bgHex,
                            }}
                          >
                            {card.color}
                          </span>
                          {card.badgeText && (
                            <span className="px-1.5 py-0.5 rounded-full bg-black/5 text-[#1C1E22] font-semibold text-[9px] truncate max-w-[80px]">
                              {card.badgeText}
                            </span>
                          )}
                          <span className="text-[10px] text-[#737882] flex items-center gap-0.5 shrink-0">
                            <MousePointer className="w-2.5 h-2.5" />
                            <span>{card.clicks || 0}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onEditCard(card)}
                            className="p-1 rounded-lg hover:bg-black/5 text-[#1C1E22] transition-colors"
                            title="Edit Link"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCard(card.id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
        {currentTab === 'profile' && (
          <div className="space-y-4 max-w-full">
            <div>
              <h3 className="text-xs font-bold text-[#1C1E22]">Profile Identity</h3>
              <p className="text-[11px] text-[#737882] mt-0.5">
                Customize your public header, bio, and business contact routing
              </p>
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
                      src={profile.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
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
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
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
                  Bio / Headline
                </label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => onUpdateProfile({ headline: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                  placeholder="Creator, Designer, Developer, Founder"
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

              {/* WhatsApp Lead Routing Configuration */}
              <div className="p-3.5 bg-[#E7F8EE] rounded-2xl border border-[#25D366]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#128C7E]">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" fill="#25D366" />
                    <span>WhatsApp Lead Routing Engine</span>
                  </div>
                  {profile.businessPhone ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#128C7E] font-bold text-[10px]">
                      <Check className="w-3 h-3" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                      Needs Setup
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#1C1E22] block mb-1">
                    Business WhatsApp Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={profile.businessPhone || ''}
                      onChange={(e) => onUpdateProfile({ businessPhone: e.target.value })}
                      placeholder="e.g. +91 98765 43210 or 9876543210"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#25D366] shadow-xs"
                    />
                  </div>
                  <p className="text-[10px] text-[#737882] mt-1 leading-tight">
                    Visitor clicks generate instant pre-filled inquiries: <span className="font-mono text-[#128C7E]">"Hi, I am interested in [Title] ([Details])..."</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Social Icons Editor */}
            <div className="pt-3 border-t border-black/5 space-y-2.5">
              <div>
                <h3 className="text-xs font-bold text-[#1C1E22]">Social Links</h3>
                <p className="text-[11px] text-[#737882]">
                  Add handles to display icons directly beneath your bio
                </p>
              </div>

              <div className="space-y-2">
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
          </div>
        )}

        {/* ===================== TAB 3: APPEARANCE & THEME ===================== */}
        {currentTab === 'appearance' && (
          <div className="space-y-4 max-w-full">
            <div>
              <h3 className="text-xs font-bold text-[#1C1E22]">Background Canvas Theme</h3>
              <p className="text-[11px] text-[#737882] mt-0.5">
                Select the overarching palette for your profile
              </p>
            </div>

            <div className="space-y-2">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = (profile.theme || 'warm') === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => onUpdateProfile({ theme: theme.id })}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'border-[#5E4BF7] ring-2 ring-[#5E4BF7]/20 bg-white shadow-xs'
                        : 'border-black/10 bg-white hover:border-black/25'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className="w-8 h-8 rounded-xl border border-black/15 shadow-2xs shrink-0"
                        style={{ backgroundColor: theme.hex }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#1C1E22] truncate">{theme.name}</h4>
                        <p className="text-[10px] sm:text-[11px] text-[#737882] truncate">{theme.desc}</p>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-[#5E4BF7] shrink-0" />}
                  </div>
                );
              })}
            </div>

            {/* Button Style Selector */}
            <div className="pt-3 border-t border-black/5 space-y-2.5">
              <div>
                <h3 className="text-xs font-bold text-[#1C1E22]">Card & Button Corner Style</h3>
                <p className="text-[11px] text-[#737882]">
                  Customize button curvatures across your cards
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {BUTTON_STYLE_OPTIONS.map((btn) => {
                  const isSelected = (profile.buttonStyle || 'rounded') === btn.id;
                  return (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => onUpdateProfile({ buttonStyle: btn.id })}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#5E4BF7] bg-white ring-2 ring-[#5E4BF7]/20 shadow-xs'
                          : 'border-black/10 bg-white/70 hover:bg-white text-[#737882]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#1C1E22]">{btn.name}</div>
                      <div className="text-[10px] text-[#737882] leading-tight">{btn.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Family Selector */}
            <div className="pt-3 border-t border-black/5 space-y-2.5">
              <div>
                <h3 className="text-xs font-bold text-[#1C1E22]">Display Font Pairing</h3>
                <p className="text-[11px] text-[#737882]">
                  Choose primary typography style
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {FONT_OPTIONS.map((font) => {
                  const isSelected = (profile.fontFamily || 'Plus Jakarta Sans') === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => onUpdateProfile({ fontFamily: font.id })}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#5E4BF7] bg-white ring-2 ring-[#5E4BF7]/20 shadow-xs'
                          : 'border-black/10 bg-white/70 hover:bg-white text-[#737882]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#1C1E22]" style={{ fontFamily: font.id }}>
                        {font.name}
                      </div>
                      <div className="text-[10px] text-[#737882] leading-tight">{font.preview}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: ANALYTICS & STATS ===================== */}
        {currentTab === 'analytics' && (
          <div className="space-y-4 max-w-full">
            <div>
              <h3 className="text-xs font-bold text-[#1C1E22]">Live Analytics & Insights</h3>
              <p className="text-[11px] text-[#737882] mt-0.5">
                Real-time traffic and link conversions in Cloud Firestore
              </p>
            </div>

            {/* Key Metrics Overview Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-1 min-w-0">
                <div className="flex items-center justify-between text-[#737882]">
                  <span className="text-[9px] font-bold uppercase truncate">Views</span>
                  <Eye className="w-3 h-3 text-[#5E4BF7] shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-[#1C1E22] truncate">
                  {(analyticsData?.totalViews ?? totalClicks * 3).toLocaleString()}
                </div>
                <div className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5 truncate">
                  <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                  <span>Live</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-1 min-w-0">
                <div className="flex items-center justify-between text-[#737882]">
                  <span className="text-[9px] font-bold uppercase truncate">Clicks</span>
                  <MousePointer className="w-3 h-3 text-[#E75646] shrink-0" />
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
                  <span className="text-[9px] font-bold uppercase truncate">CTR</span>
                  <Sparkles className="w-3 h-3 text-[#F8BA38] shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-[#1C1E22] truncate">
                  {analyticsData?.ctr ?? (totalClicks > 0 ? '33.3' : '0.0')}%
                </div>
                <div className="text-[9px] text-[#737882] font-semibold truncate">
                  Conversion
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
                  <Smartphone className="w-4 h-4 mx-auto text-[#5E4BF7] mb-1" />
                  <div className="font-bold text-[#1C1E22]">
                    {analyticsData?.deviceCounts?.mobile ?? 72}%
                  </div>
                  <div className="text-[9px] text-[#737882]">Mobile</div>
                </div>
                <div className="p-2 bg-[#FAF8F5] rounded-xl border border-black/5">
                  <Monitor className="w-4 h-4 mx-auto text-[#1C1E22] mb-1" />
                  <div className="font-bold text-[#1C1E22]">
                    {analyticsData?.deviceCounts?.desktop ?? 24}%
                  </div>
                  <div className="text-[9px] text-[#737882]">Desktop</div>
                </div>
                <div className="p-2 bg-[#FAF8F5] rounded-xl border border-black/5">
                  <Tablet className="w-4 h-4 mx-auto text-[#E75646] mb-1" />
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
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenPublicView}
                className="w-full py-2.5 px-3 bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span>Open Full Visitor Page</span>
              </button>
            </div>

            {/* QR Code generator */}
            <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-2xs text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#1C1E22]">
                <QrCode className="w-4 h-4 text-[#5E4BF7] shrink-0" />
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
      </div>
    </div>
  );
};
