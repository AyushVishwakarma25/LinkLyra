import React, { useState } from 'react';
import { HugeIcon } from './HugeIcon';
import {
  Share01Icon,
  AlertCircleIcon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { SegmentedControl } from './ui';
import { UserProfile, ProfileCardData, CollaborationPackageItem } from '../types';
import { ProfileCard } from './ProfileCard';
import { SocialIconsRow } from './SocialIconsRow';
import { UI_KIT } from '../lib/ui-kit';
import { generateWhatsAppIntentUrl } from '../lib/whatsapp';
import { useLeadModals } from '../hooks/useLeadModals';
import { LeadModalHost } from './LeadModalHost';

export interface LivePreviewProps {
  profile: UserProfile;
  onCardClick?: (card: ProfileCardData) => void;
  isInteractive?: boolean;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  profile,
  onCardClick,
  isInteractive = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'ios' | 'desktop'>('mobile');
  const [missingPhoneNotice, setMissingPhoneNotice] = useState(false);

  // In-Preview Interactive Lead Modals via centralized hook
  const leadModals = useLeadModals();

  const activeCards = profile.cards.filter((c) => c.isActive !== false);

  const handleShare = () => {
    const url = `${window.location.origin}?user=${profile.username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCardInteraction = (card: ProfileCardData) => {
    if (onCardClick) {
      onCardClick(card);
    }

    // Direct Lead Inquiry Triggers
    if (card.templateType === 'brand_inquiry') {
      leadModals.openBrandInquiry(null, card);
      return;
    }
    if (card.templateType === 'music_booking_inquiry' || card.templateType === 'music_book_me') {
      leadModals.openMusicBooking(card);
      return;
    }
    if (card.templateType === 'podcast_sponsor_inquiry' || card.templateType === 'podcast_sponsor_me') {
      leadModals.openPodcastSponsor(card);
      return;
    }
    if (card.templateType === 'showing_booking') {
      leadModals.openShowing(card);
      return;
    }
    if (card.templateType === 'home_valuation') {
      leadModals.openValuation(card);
      return;
    }
    if (card.templateType === 'media_kit' || card.templateType === 'music_press_kit') {
      leadModals.openMediaKit(card);
      return;
    }

    // WhatsApp intent cards
    if (card.templateType === 'real_estate' || card.templateType === 'coaching_institute') {
      const intent = generateWhatsAppIntentUrl(card, profile.businessPhone);
      if (!intent.hasPhone) {
        setMissingPhoneNotice(true);
        return;
      }
      if (intent.url) {
        window.open(intent.url, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    if (card.linkUrl && card.linkUrl !== '#' && card.linkUrl !== 'https://') {
      const finalUrl =
        card.linkUrl.startsWith('http://') || card.linkUrl.startsWith('https://')
          ? card.linkUrl
          : `https://${card.linkUrl}`;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const themeConfig = UI_KIT.canvasThemes[profile.theme || 'warm'] || UI_KIT.canvasThemes.warm;
  const bgClass = themeConfig.bgClass;
  const isDarkTheme = themeConfig.isDark;

  const isCustomImageWallpaper =
    profile.wallpaperMode === 'image' ||
    profile.backgroundType === 'image' ||
    (Boolean(profile.backgroundValue) &&
      (profile.backgroundValue?.startsWith('http') ||
        profile.backgroundValue?.startsWith('data:image')));

  const tintPercent = typeof profile.wallpaperTint === 'number' ? profile.wallpaperTint : 20;

  const canvasContent = (
    <>
      <div className="space-y-4 max-w-full">
          {/* Top Bar: Share Icon Only */}
          <div className="flex items-center justify-end py-1 px-0.5 pb-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share"
              title="Share profile link"
              className={`p-2 rounded-full border shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                isDarkTheme || (isCustomImageWallpaper && tintPercent >= 30)
                  ? 'bg-black/40 text-white border-white/20 hover:bg-black/60'
                  : 'bg-white/90 text-[#1C1E22] border-black/10 hover:bg-white'
              }`}
            >
              <HugeIcon icon={Share01Icon} size={15} className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Hero Section (Full Width, Host of The Founders title fully visible!) */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 pt-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white shrink-0 ring-1 ring-black/5">
              <img
                src={
                  profile.avatarUrl && profile.avatarUrl.trim() !== ''
                    ? profile.avatarUrl
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                }
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                className={`text-base sm:text-lg font-bold leading-tight ${
                  isDarkTheme ? 'text-white' : 'text-[#1C1E22]'
                }`}
              >
                {profile.name}
              </h2>
              {/* Fully visible Title / Headline with clean word wrap and spacious layout */}
              <p
                className={`text-xs sm:text-[13px] font-medium mt-0.5 leading-snug break-words ${
                  isDarkTheme ? 'text-white/80' : 'text-[#555A64]'
                }`}
              >
                {profile.headline || 'Host of The Founders'}
              </p>
            </div>
          </div>

          {/* Social Icons Bar */}
          {profile.socials && Object.values(profile.socials).some(Boolean) && (
            <div className="pt-0.5">
              <SocialIconsRow socials={profile.socials} isDark={isDarkTheme} />
            </div>
          )}

          {/* Optional Profile Badges & Stickers */}
          {profile.stickers && profile.stickers.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5">
              {profile.stickers.map((sticker, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-2xs border ${
                    isDarkTheme
                      ? 'bg-white/10 text-white border-white/15'
                      : 'bg-white/90 text-[#1C1E22] border-black/10'
                  } animate-fadeIn`}
                >
                  {sticker}
                </span>
              ))}
            </div>
          )}

          {/* Links Stack */}
          <div className="space-y-3 pt-1 max-w-full">
            {activeCards.length === 0 ? (
              <div className="text-center py-10 bg-white/60 rounded-3xl border border-dashed border-black/15 p-5">
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    isDarkTheme ? 'text-white' : 'text-[#1C1E22]'
                  }`}
                >
                  No links to display
                </p>
                <p className="text-[11px] sm:text-xs text-[#737882] mt-1 max-w-xs mx-auto">
                  Add links from the editor to see them appear live.
                </p>
              </div>
            ) : (
              (() => {
                const sections = profile.sections || [];
                const hasSections = sections.length > 0;

                const renderSingleCard = (card: ProfileCardData) => (
                  <div key={card.id} className="max-w-full overflow-hidden">
                    <ProfileCard
                      id={card.id}
                      title={card.title}
                      subtitle={card.subtitle}
                      linkUrl={card.linkUrl}
                      color={card.color}
                      logoSrc={card.logoSrc}
                      badgeText={card.badgeText}
                      expanded={card.expanded}
                      templateType={card.templateType}
                      cardStyle={profile.cardStyle}
                      buttonStyle={profile.buttonStyle}
                      cardBgColor={profile.cardBgColor}
                      cardTextColor={profile.cardTextColor}
                      customAccentColor={profile.buttonColor}
                      realEstate={card.realEstate}
                      showingBooking={card.showingBooking}
                      homeValuation={card.homeValuation}
                      clientReview={card.clientReview}
                      creatorWork={card.creatorWork}
                      creatorStats={card.creatorStats}
                      featuredWork={card.featuredWork}
                      creatorPackages={card.creatorPackages}
                      brandInquiry={card.brandInquiry}
                      recommendation={card.recommendation}
                      mediaKit={card.mediaKit}
                      coaching={card.coaching}
                      music={card.music}
                      podcast={card.podcast}
                      isPremium={card.isPremium}
                      businessPhone={profile.businessPhone}
                      customWhatsappPhone={card.customWhatsappPhone}
                      interactive={isInteractive}
                      onMissingPhone={() => setMissingPhoneNotice(true)}
                      onClick={() => handleCardInteraction(card)}
                      onLinkClick={(e) => {
                        e.stopPropagation();
                        handleCardInteraction(card);
                      }}
                      onOpenBrandInquiryModal={(pkg, c) => leadModals.openBrandInquiry(pkg, c || card)}
                      onOpenMusicBookingModal={(c) => leadModals.openMusicBooking(c || card)}
                      onOpenPodcastSponsorModal={(c) => leadModals.openPodcastSponsor(c || card)}
                      onOpenShowingModal={(c) => leadModals.openShowing(c || card)}
                      onOpenValuationModal={() => leadModals.openValuation(card)}
                      onOpenMediaKitModal={() => leadModals.openMediaKit(card)}
                    />
                  </div>
                );

                if (!hasSections) {
                  return activeCards.map(renderSingleCard);
                }

                // Render by sections
                const unsectionedCards = activeCards.filter((c) => !c.sectionId);
                const sectionedCardsMap = sections.map((sec) => ({
                  section: sec,
                  cards: activeCards.filter((c) => c.sectionId === sec.id),
                }));

                return (
                  <div className="space-y-4">
                    {/* Unsectioned Cards First */}
                    {unsectionedCards.map(renderSingleCard)}

                    {/* Section Groups */}
                    {sectionedCardsMap.map(
                      ({ section, cards }) =>
                        cards.length > 0 && (
                          <div key={section.id} className="space-y-2 pt-2">
                            <div className="flex items-center gap-2 px-1">
                              <span
                                className={`text-xs font-bold uppercase tracking-wider ${
                                  isDarkTheme ? 'text-white/80' : 'text-[#737882]'
                                }`}
                              >
                                {section.title}
                              </span>
                              <div
                                className={`h-px flex-1 ${
                                  isDarkTheme ? 'bg-white/15' : 'bg-black/10'
                                }`}
                              />
                            </div>
                            <div className="space-y-2.5">
                              {cards.map(renderSingleCard)}
                            </div>
                          </div>
                        )
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Missing Phone Feedback Toast / Banner */}
        {missingPhoneNotice && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-fadeIn">
            <HugeIcon icon={AlertCircleIcon} size={16} className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-bold block">WhatsApp Phone Missing</span>
              <span className="text-[11px] text-amber-800">
                To route leads directly to WhatsApp, add your business WhatsApp phone number in the <strong>Profile</strong> tab in the sidebar editor.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMissingPhoneNotice(false)}
              className="p-1 text-amber-700 hover:text-amber-950 rounded-lg shrink-0 cursor-pointer"
            >
              <HugeIcon icon={Cancel01Icon} size={14} className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Clean Footer */}
        <div className="pt-6 pb-1 text-center shrink-0">
          {profile.footerSettings?.showWatermark !== false && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/10 text-[10px] sm:text-[11px] font-bold text-[#1C1E22] shadow-2xs max-w-full truncate">
              <span className="shrink-0">LinkLyra</span>
              <span className="text-[#737882] font-normal">•</span>
              <span className="text-[#737882] font-medium truncate">@{profile.username}</span>
            </div>
          )}

          {profile.footerSettings?.customFooterText && (
            <p className={`text-[11px] mt-2 font-medium ${isDarkTheme ? 'text-white/60' : 'text-[#737882]'}`}>
              {profile.footerSettings.customFooterText}
            </p>
          )}

          {copied && (
            <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 py-0.5 px-3 rounded-full border border-emerald-200 inline-block animate-fadeIn">
              Profile link copied!
            </div>
          )}
        </div>
    </>
  );

  return (
    <div className="flex flex-col flex-1 h-full w-full items-center justify-start p-2.5 sm:p-4 overflow-hidden select-none">
      {/* Device Viewport Selector */}
      <div className="mb-2 sm:mb-3 shrink-0 z-20">
        <SegmentedControl
          value={deviceMode}
          onChange={(val) => setDeviceMode(val as any)}
          variant="light"
          size="sm"
          options={[
            {
              value: 'mobile',
              label: 'Mobile',
              title: 'Mobile view',
            },
            {
              value: 'ios',
              label: 'IOS',
              title: 'IOS view',
            },
            {
              value: 'desktop',
              label: 'Desktop',
              title: 'Desktop view',
            },
          ]}
        />
      </div>

      {/* Clean Preview Canvas Frame */}
      <div
        className={`w-full transition-[max-width,height] duration-200 relative flex flex-col my-auto rounded-2xl border border-black/10 shadow-xl overflow-hidden bg-white ${
          deviceMode === 'ios'
            ? 'max-w-[390px] h-[min(780px,calc(100vh-140px))] min-h-[500px]'
            : deviceMode === 'mobile'
            ? 'max-w-[420px] h-[min(780px,calc(100vh-140px))] min-h-[500px]'
            : 'max-w-2xl h-[min(820px,calc(100vh-140px))] min-h-[500px]'
        }`}
      >
        {/* Scrollable Screen Body (Native vertical scrolling to view cards and links) */}
        <div
          id="preview-screen-viewport"
          style={{
            fontFamily:
              profile.fontFamily === 'Space Mono'
                ? "'Space Mono', monospace"
                : profile.fontFamily === 'Playfair Display'
                ? "'Playfair Display', serif"
                : profile.fontFamily === 'Syne'
                ? "'Syne', sans-serif"
                : profile.fontFamily === 'Inter'
                ? "'Inter', sans-serif"
                : "'Plus Jakarta Sans', sans-serif",
          }}
          className="flex-1 w-full overflow-y-auto overflow-x-hidden touch-scroll overscroll-contain p-4 sm:p-5 relative select-none flex flex-col justify-between"
        >
          {/* Background Layer (Prevents shorthand vs non-shorthand CSS style conflict during rerenders) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {isCustomImageWallpaper && profile.backgroundValue ? (
              <img
                src={profile.backgroundValue}
                alt="Wallpaper"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : profile.wallpaperMode === 'gradient' ? (
              <div className="w-full h-full bg-gradient-to-br from-[#FAF8F5] to-[#E2DAD0]" />
            ) : profile.wallpaperMode === 'mesh' ? (
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'radial-gradient(at 0% 0%, #C4B5FD 0px, transparent 55%), radial-gradient(at 100% 100%, #FBCFE8 0px, transparent 55%)',
                  backgroundColor: '#FAF8F5',
                }}
              />
            ) : profile.wallpaperMode === 'pattern' ? (
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  backgroundColor: '#FAF8F5',
                }}
              />
            ) : profile.wallpaperMode === 'blur' ? (
              <div className="w-full h-full backdrop-blur-xl bg-white/70" />
            ) : (
              <div className={`w-full h-full ${bgClass}`} />
            )}
          </div>

          {/* Wallpaper Dimming & Contrast Tint Overlay */}
          {tintPercent > 0 && (
            <div
              className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-200"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${tintPercent / 100})`,
              }}
            />
          )}

          {/* If Blur Wallpaper is active, render ambient colored glowing blurred orbs in background */}
          {profile.wallpaperMode === 'blur' && (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="absolute -top-12 -left-12 w-52 h-52 rounded-full bg-purple-400/30 blur-3xl animate-pulse" />
              <div className="absolute top-1/2 -right-12 w-56 h-56 rounded-full bg-pink-300/30 blur-3xl" />
              <div className="absolute -bottom-12 left-1/3 w-60 h-60 rounded-full bg-amber-200/40 blur-3xl" />
            </div>
          )}

          {/* Actual Page Content (Elevated above tint overlay) */}
          <div className="relative z-10 flex-1 flex flex-col justify-between">
            {canvasContent}
          </div>
        </div>
      </div>

      {/* Centralized Lead Modals Host (In-Preview interactive mode) */}
      <LeadModalHost
        leadModals={leadModals}
        pageId={profile.id || profile.username || 'creator'}
        creatorName={profile.name}
        creatorPhone={profile.businessPhone}
        profile={profile}
        isPreview={true}
      />
    </div>
  );
};
