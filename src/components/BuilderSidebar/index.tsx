import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Link01Icon,
  ColorsIcon,
  ChartBarLineIcon,
  Share01Icon,
  CreditCardIcon,
  Settings01Icon,
  CheckmarkCircle01Icon,
  FloppyDiskIcon,
  ViewIcon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import { SpecializedAnalyticsSummary, SocialLinks, DbSection } from '../../types';
import { Button } from '../ui';
import { User } from 'firebase/auth';
import { uploadImageToStorage } from '../../lib/storage';
import { profileService } from '../../lib/firebase';
import { BillingDashboard } from '../BillingDashboard';
import { DesignSettingsPanel } from '../DesignSettingsPanel';
import { LeadsDashboard } from '../LeadsDashboard';
import { normalizeExternalUrl } from '../../lib/url';

import { SidebarTabKey, BuilderSidebarProps } from './types';
import { LinksTab } from './LinksTab';
import { SettingsTab } from './SettingsTab';
import { AnalyticsTab } from './AnalyticsTab';
import { ShareTab } from './ShareTab';

export type { SidebarTabKey, BuilderSidebarProps };
export { LinksTab, SettingsTab, AnalyticsTab, ShareTab };

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

  // Live Analytics Summary State & Date Range Selector
  const [analyticsData, setAnalyticsData] = useState<SpecializedAnalyticsSummary | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [analyticsDays, setAnalyticsDays] = useState<7 | 30 | 90>(30);
  const [copiedAnalyticsLink, setCopiedAnalyticsLink] = useState(false);

  useEffect(() => {
    if (currentUser?.uid && (activeSidebarTab === 'analytics' || internalTab === 'analytics')) {
      setIsLoadingStats(true);
      profileService.getAnalyticsSummary(currentUser.uid, analyticsDays).then((summary) => {
        if (summary) {
          setAnalyticsData(summary);
        }
        setIsLoadingStats(false);
      }).catch((err) => {
        console.warn('Error loading analytics summary:', err);
        setIsLoadingStats(false);
      });
    }
  }, [currentUser, activeSidebarTab, internalTab, analyticsDays]);

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
    const trimmed = value.trim();
    let finalVal: string | undefined = trimmed || undefined;
    if (finalVal && key !== 'whatsapp' && key !== 'email') {
      const normalized = normalizeExternalUrl(finalVal);
      if (normalized) {
        finalVal = normalized;
      }
    }
    const updatedSocials: SocialLinks = {
      ...(profile.socials || {}),
      [key]: finalVal,
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
    const pageId = profile.id || currentUser?.uid || profile.username || '';
    if (!pageId) return;
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
      .catch((err) => {
        console.error('Failed to fetch unread leads count:', err);
      });
  }, [profile.id, currentUser?.uid, profile.username]);

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
          <LinksTab
            profile={profile}
            onAddCard={onAddCard}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
            onMoveCard={onMoveCard}
            onToggleCardActive={onToggleCardActive}
            onDeleteSection={onDeleteSection}
            setTab={setTab}
            avatarFileInputRef={avatarFileInputRef}
            showAddSection={showAddSection}
            setShowAddSection={setShowAddSection}
            newSectionTitle={newSectionTitle}
            setNewSectionTitle={setNewSectionTitle}
            handleCreateSectionSubmit={handleCreateSectionSubmit}
            activeCardMenuId={activeCardMenuId}
            setActiveCardMenuId={setActiveCardMenuId}
          />
        )}

        {/* ===================== TAB 2: PROFILE & BIO ===================== */}
        {currentTab === 'settings' && (
          <SettingsTab
            profile={profile}
            onUpdateProfile={onUpdateProfile}
            avatarFileInputRef={avatarFileInputRef}
            isUploadingAvatar={isUploadingAvatar}
            avatarUploadError={avatarUploadError}
            handleAvatarFileUpload={handleAvatarFileUpload}
            handleSocialChange={handleSocialChange}
            handleTriggerSave={handleTriggerSave}
            isSaving={isSaving}
            justSaved={justSaved}
          />
        )}

        {/* ===================== TAB 3: APPEARANCE ===================== */}
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
          <AnalyticsTab
            profile={profile}
            analyticsData={analyticsData}
            isLoadingStats={isLoadingStats}
            analyticsDays={analyticsDays}
            setAnalyticsDays={setAnalyticsDays}
            copiedAnalyticsLink={copiedAnalyticsLink}
            setCopiedAnalyticsLink={setCopiedAnalyticsLink}
          />
        )}

        {/* ===================== TAB 5: SHARE & QR ===================== */}
        {currentTab === 'share' && (
          <ShareTab
            profile={profile}
            getPublicUrl={getPublicUrl}
            handleCopyLink={handleCopyLink}
            copied={copied}
            onOpenPublicView={onOpenPublicView}
          />
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
