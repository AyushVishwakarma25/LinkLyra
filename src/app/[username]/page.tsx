import React, { useState, useEffect } from 'react';
import { HugeIcon } from '../../components/HugeIcon';
import {
  Search01Icon,
  PreferenceHorizontalIcon,
  Share01Icon,
  Tick01Icon,
  AlertCircleIcon,
  Cancel01Icon,
  Home01Icon,
} from '@hugeicons/core-free-icons';
import { profileService, DbProfile, DbLink, DbSection } from '../../lib/firebase';
import { ProfileCard } from '../../components/ProfileCard';
import { SocialIconsRow } from '../../components/SocialIconsRow';
import { UI_KIT } from '../../lib/ui-kit';
import { generateWhatsAppIntentUrl } from '../../lib/whatsapp';
import { ProfileCardData } from '../../types';
import { useLeadModals } from '../../hooks/useLeadModals';
import { LeadModalHost } from '../../components/LeadModalHost';
import { resolveRoute, getRouteTarget } from '../../lib/routing';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { safeOpenUrl } from '../../lib/url';
import { linkToCard } from '../../lib/mappers';

export interface PublicProfilePageProps {
  username?: string;
  onBackToEditor?: () => void;
  isEmbedded?: boolean;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  username: propUsername,
  onBackToEditor,
}) => {
  // Resolve target username or custom domain using unified routing engine
  const resolvedRoute = resolveRoute();
  const routeTarget = getRouteTarget();
  const username = propUsername || routeTarget || '';

  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [links, setLinks] = useState<DbLink[]>([]);
  const [sections, setSections] = useState<DbSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Client SEO Metadata
  useDocumentMeta({
    title: profile
      ? `${profile.full_name || profile.username} (@${profile.username}) | LinkLyra`
      : 'LinkLyra - Bio & Links',
    description: profile?.bio || 'Check out my links, work, and updates on LinkLyra.',
    image: profile?.avatar_url,
    canonical: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const availableColors = ['all', 'purple', 'orange', 'yellow', 'green', 'dark'];

  // Fetch creator data by username or domain from Cloud Firestore
  useEffect(() => {
    async function loadCreatorData() {
      if (!username) {
        setError('No username provided.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const domainParam = searchParams.get('domain') || searchParams.get('d');

        let result = null;
        if (domainParam) {
          result = await profileService.getProfileByDomain(domainParam);
        } else if (resolvedRoute === 'domain' || username.includes('.')) {
          result = await profileService.getProfileByDomain(username);
        }

        if (!result) {
          result = await profileService.getProfileByUsername(username);
        }

        if (result && result.profile) {
          setProfile(result.profile);
          setLinks(result.links);

          // Track page view event
          profileService.recordView(result.profile.id);

          // Load sections
          const secs = await profileService.getSections(result.profile.id);
          setSections(secs);
        } else {
          setError(`Creator profile "@${username}" could not be found.`);
        }
      } catch (err: any) {
        console.error('Failed to load profile for user:', username, err);
        setError('An error occurred while loading this profile.');
      } finally {
        setLoading(false);
      }
    }

    loadCreatorData();
  }, [username]);

  const [missingPhoneAlert, setMissingPhoneAlert] = useState(false);
  const leadModals = useLeadModals();

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = (link: DbLink) => {
    // Record click analytics atomically (skips bots and owner views)
    if (profile?.id || link.profile_id) {
      profileService.recordClick(profile?.id || link.profile_id, link.id);
    }

    const cardData = linkToCard(link);

    // Direct interactive Lead Inquiry Triggers
    if (link.template_type === 'brand_inquiry') {
      leadModals.openBrandInquiry(null, cardData);
      return;
    }
    if (link.template_type === 'music_booking_inquiry' || link.template_type === 'music_book_me') {
      leadModals.openMusicBooking(cardData);
      return;
    }
    if (link.template_type === 'podcast_sponsor_inquiry' || link.template_type === 'podcast_sponsor_me') {
      leadModals.openPodcastSponsor(cardData);
      return;
    }
    if (link.template_type === 'showing_booking') {
      leadModals.openShowing(cardData);
      return;
    }
    if (link.template_type === 'home_valuation') {
      leadModals.openValuation(cardData);
      return;
    }
    if (link.template_type === 'media_kit' || link.template_type === 'music_press_kit') {
      leadModals.openMediaKit(cardData);
      return;
    }

    // Dynamic WhatsApp intent generation for localized business cards
    if (link.template_type === 'real_estate' || link.template_type === 'coaching_institute') {
      const intent = generateWhatsAppIntentUrl(cardData, profile?.business_phone);

      if (!intent.hasPhone) {
        setMissingPhoneAlert(true);
        if (link.link_url && link.link_url !== '#' && link.link_url !== 'https://') {
          safeOpenUrl(link.link_url);
        }
        return;
      }

      if (intent.url) {
        safeOpenUrl(intent.url);
        return;
      }
    }

    if (link.link_url && link.link_url !== '#' && link.link_url !== 'https://') {
      safeOpenUrl(link.link_url);
    }
  };

  // Filter links by active status, search query, and color
  const activeLinks = links.filter((l) => l.is_active !== false);

  const filteredLinks = activeLinks.filter((link) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (link.title || '').toLowerCase().includes(q) ||
      (link.subtitle || '').toLowerCase().includes(q) ||
      (link.badge_text || '').toLowerCase().includes(q);
    const matchesColor = colorFilter === 'all' || link.color === colorFilter;
    return matchesSearch && matchesColor;
  });

  const themeKey = profile?.theme || 'warm';
  const themeConfig = UI_KIT.canvasThemes[themeKey] || UI_KIT.canvasThemes.warm;
  const bgClass = themeConfig.bgClass;
  const isDarkTheme = themeConfig.isDark;

  const isCustomImageWallpaper =
    profile?.wallpaper_mode === 'image' && Boolean(profile?.background_value);
  const tintPercent =
    typeof profile?.wallpaper_tint === 'number' ? profile.wallpaper_tint : 20;

  return (
    <div className="min-h-screen bg-[#ECE7DC] flex flex-col antialiased text-[#1C1E22] overflow-x-hidden">
      {/* Main Visitor Canvas */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 md:p-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 rounded-full border-3 border-[#5E4BF7] border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-[#737882]">Loading profile...</p>
          </div>
        ) : error || !profile ? (
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-black/10 text-center space-y-4 shadow-sm my-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#5E4BF7]/10 text-[#5E4BF7] flex items-center justify-center mx-auto">
              <HugeIcon icon={AlertCircleIcon} size={28} className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-extrabold uppercase tracking-wider">
                404 Not Found
              </span>
              <h2 className="text-xl font-extrabold text-[#1C1E22]">Profile Not Found</h2>
              <p className="text-xs text-[#737882] max-w-xs mx-auto">
                {error || `The page @${username} does not exist or may have been renamed.`}
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={username ? `/?claim=${encodeURIComponent(username)}` : '/'}
                className="w-full py-3 px-5 rounded-xl bg-[#5E4BF7] text-white text-xs font-bold hover:bg-[#4E3BE5] transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Claim @{username || 'handle'} & Create Yours</span>
              </a>
              {onBackToEditor ? (
                <button
                  type="button"
                  onClick={onBackToEditor}
                  className="w-full py-2.5 px-5 rounded-xl bg-stone-100 text-[#1C1E22] text-xs font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Back to Studio Editor
                </button>
              ) : (
                <a
                  href="/"
                  className="w-full py-2.5 px-5 rounded-xl bg-transparent text-[#737882] hover:text-[#1C1E22] text-xs font-semibold transition-colors"
                >
                  Explore LinkLyra
                </a>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`w-full max-w-xl ${
              isCustomImageWallpaper ? 'bg-stone-900' : bgClass
            } relative rounded-[28px] sm:rounded-[36px] p-4 sm:p-7 md:p-8 shadow-md border border-black/10 flex flex-col justify-between min-h-[580px] overflow-hidden`}
            style={
              isCustomImageWallpaper
                ? {
                    backgroundImage: `url(${profile.background_value})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }
                : undefined
            }
          >
            {/* Custom Wallpaper Dimming / Tint Overlay */}
            {isCustomImageWallpaper && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-0"
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${tintPercent / 100})`,
                }}
              />
            )}

            <div className="space-y-4 max-w-full relative z-10">
              {/* Top Navigation Breadcrumb Bar */}
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-black/5">
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#737882] min-w-0 font-medium">
                  <a
                    href="/"
                    className="hover:text-[#1C1E22] transition-colors truncate flex items-center gap-1"
                  >
                    <HugeIcon icon={Home01Icon} size={13} className="w-3.5 h-3.5 shrink-0" />
                    <span>Home</span>
                  </a>
                  <span className={`text-[10px] shrink-0 ${isDarkTheme ? 'text-white/30' : 'text-black/20'}`}>
                    /
                  </span>
                  <span className="font-bold text-[#5E4BF7] truncate">
                    @{profile.username || 'creator'}
                  </span>
                </nav>

                {/* Breadcrumb Menu: 3 lines button opening Search, Filter, Share dropdown */}
                <div className="shrink-0 relative">
                  <button
                    type="button"
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    aria-label="Menu"
                    title="Search, Filter, Share menu"
                    className={`w-7 h-7 min-w-[28px] min-h-[28px] rounded-lg border shadow-2xs flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                      showQuickActions
                        ? 'bg-[#1C1E22] text-white border-black'
                        : 'bg-white/95 text-[#1C1E22] border-black/10 hover:bg-black/5'
                    }`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="4" y1="6.5" x2="20" y2="6.5" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="17.5" x2="20" y2="17.5" />
                    </svg>
                  </button>

                  {/* Floating Dropdown Menu with names: Search, Filter, Share */}
                  {showQuickActions && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowQuickActions(false)}
                      />
                      <div className="absolute right-0 top-9 w-48 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-black/10 py-1.5 z-40 animate-fadeIn text-xs text-[#1C1E22]">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSearch((prev) => !prev);
                            setShowQuickActions(false);
                          }}
                          className="w-full px-3.5 py-2.5 text-left font-semibold hover:bg-black/5 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className={showSearch ? 'text-[#5E4BF7]' : 'text-[#1C1E22]'}>
                            Search
                          </span>
                          {showSearch && (
                            <span className="text-[10px] text-[#5E4BF7] font-bold px-1.5 py-0.5 rounded bg-[#5E4BF7]/10">
                              Active
                            </span>
                          )}
                        </button>

                        <div className="h-px bg-black/5 my-1" />

                        <div className="px-3.5 py-2">
                          <div className="flex items-center justify-between mb-1.5 font-semibold text-[#1C1E22]">
                            <span>Filter</span>
                            <span className="text-[10px] text-[#5E4BF7] font-bold capitalize">
                              {colorFilter === 'all' ? 'All' : colorFilter}
                            </span>
                          </div>
                          <select
                            value={colorFilter}
                            onChange={(e) => {
                              setColorFilter(e.target.value);
                              setShowQuickActions(false);
                            }}
                            className="w-full bg-[#FAF8F5] border border-black/10 rounded-lg px-2 py-1.5 text-xs text-[#1C1E22] font-medium outline-hidden focus:border-[#5E4BF7] cursor-pointer"
                          >
                            <option value="all">All Colors</option>
                            <option value="purple">Purple</option>
                            <option value="orange">Orange</option>
                            <option value="yellow">Yellow</option>
                            <option value="green">Green</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>

                        <div className="h-px bg-black/5 my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            handleShare();
                            setShowQuickActions(false);
                          }}
                          className="w-full px-3.5 py-2.5 text-left font-semibold hover:bg-black/5 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>Share</span>
                          {copied && (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              Copied!
                            </span>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Creator Profile Header (Full Width, Host of The Founders title fully visible!) */}
              <div className="flex items-center gap-3 sm:gap-3.5 pt-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white shrink-0">
                  <img
                    src={
                      profile.avatar_url && profile.avatar_url.trim() !== ''
                        ? profile.avatar_url
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
                  <h1
                    className={`text-base sm:text-lg md:text-xl font-bold leading-tight ${
                      isDarkTheme ? 'text-white' : 'text-[#1C1E22]'
                    }`}
                  >
                    {profile.full_name}
                  </h1>
                  <p
                    className={`text-xs sm:text-sm font-medium mt-0.5 leading-snug break-words ${
                      isDarkTheme ? 'text-white/80' : 'text-[#737882]'
                    }`}
                  >
                    {profile.bio || 'Host of The Founders'}
                  </p>
                </div>
              </div>

              {/* Social Media Icons Bar */}
              {profile.socials && Object.values(profile.socials).some(Boolean) && (
                <div className="pt-0.5">
                  <SocialIconsRow socials={profile.socials} isDark={isDarkTheme} />
                </div>
              )}

              {/* Search Bar if toggled */}
              {showSearch && (
                <div className="relative animate-fadeIn">
                  <input
                    type="text"
                    placeholder="Search links, keywords, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-white pl-3.5 pr-8 py-2 rounded-2xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737882] hover:text-[#1C1E22] cursor-pointer"
                    >
                      <HugeIcon icon={Cancel01Icon} size={14} className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Links Stack */}
              <div className="space-y-3 pt-1 max-w-full">
                {filteredLinks.length === 0 ? (
                  <div className="text-center py-10 bg-white/70 rounded-3xl border border-dashed border-black/15 p-5">
                    <p className="text-xs sm:text-sm font-bold text-[#1C1E22]">No links found</p>
                    <p className="text-[11px] sm:text-xs text-[#737882] mt-1 max-w-xs mx-auto">
                      {searchQuery || colorFilter !== 'all'
                        ? 'No links match the active filters.'
                        : 'This profile has no public links published.'}
                    </p>
                    {(searchQuery || colorFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setColorFilter('all');
                        }}
                        className="mt-3 px-3.5 py-1 rounded-full bg-black/5 hover:bg-black/10 text-xs font-semibold text-[#1C1E22]"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  (() => {
                    const hasSections = sections && sections.length > 0;

                    const renderCardItem = (link: DbLink) => {
                      const cardData = linkToCard(link);
                      return (
                        <div
                          key={link.id}
                          onClick={() => handleOpenLink(link)}
                          className="cursor-pointer group block max-w-full overflow-hidden"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleOpenLink(link);
                            }
                          }}
                        >
                          <ProfileCard
                            {...cardData}
                            businessPhone={profile.business_phone}
                            interactive={true}
                            onMissingPhone={() => setMissingPhoneAlert(true)}
                            onClick={() => handleOpenLink(link)}
                            onLinkClick={(e) => {
                              e.stopPropagation();
                              handleOpenLink(link);
                            }}
                            onOpenShowingModal={(c) => leadModals.openShowing(c || cardData)}
                            onOpenValuationModal={() => leadModals.openValuation(cardData)}
                            onOpenBrandInquiryModal={(pkg, c) => leadModals.openBrandInquiry(pkg, c || cardData)}
                            onOpenMediaKitModal={() => leadModals.openMediaKit(cardData)}
                            onOpenMusicBookingModal={(c) => leadModals.openMusicBooking(c || cardData)}
                            onOpenPodcastSponsorModal={(c) => leadModals.openPodcastSponsor(c || cardData)}
                          />
                        </div>
                      );
                    };

                    if (!hasSections || searchQuery || colorFilter !== 'all') {
                      return filteredLinks.map(renderCardItem);
                    }

                    const unsectioned = filteredLinks.filter((l) => !l.section_id);
                    const sectionGroups = sections.map((sec) => ({
                      section: sec,
                      links: filteredLinks.filter((l) => l.section_id === sec.id),
                    }));

                    return (
                      <div className="space-y-4">
                        {unsectioned.map(renderCardItem)}

                        {sectionGroups.map(
                          ({ section, links: groupLinks }) =>
                            groupLinks.length > 0 && (
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
                                  {groupLinks.map(renderCardItem)}
                                </div>
                              </div>
                            )
                        )}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Missing Phone Alert */}
              {missingPhoneAlert && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-fadeIn">
                  <HugeIcon icon={AlertCircleIcon} size={16} className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold block">WhatsApp Contact Needed</span>
                    <span className="text-[11px] text-amber-800">
                      This business card is configured for direct WhatsApp lead routing, but no WhatsApp contact number is registered yet.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMissingPhoneAlert(false)}
                    className="p-1 text-amber-700 hover:text-amber-950 rounded-lg shrink-0 cursor-pointer"
                  >
                    <HugeIcon icon={Cancel01Icon} size={14} className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer: Shown unless page has whiteLabel === true */}
            {!profile.whiteLabel && (
              <footer className="pt-6 pb-1 text-center space-y-2 shrink-0">
                <a
                  href={`https://linklyra.web.app/?ref=${encodeURIComponent(profile.username || 'creator')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-black/10 text-[10px] sm:text-[11px] font-bold text-[#1C1E22] shadow-2xs hover:shadow-xs transition-all max-w-full truncate group cursor-pointer"
                >
                  <span className="shrink-0 font-extrabold text-[#5E4BF7] group-hover:scale-105 transition-transform">LinkLyra</span>
                  <span className="text-[#737882] font-normal">•</span>
                  <span className="text-[#737882] font-medium truncate">@{profile.username}</span>
                </a>

                {copied && (
                  <div className="animate-fadeIn text-xs font-semibold text-emerald-700 bg-emerald-50 py-0.5 px-3 rounded-full border border-emerald-200 inline-block">
                    Link copied to clipboard!
                  </div>
                )}
              </footer>
            )}
          </div>
        )}
      </main>

      {/* Centralized Lead Modals Host for Public Profile */}
      <LeadModalHost
        leadModals={leadModals}
        pageId={profile?.id || username}
        creatorName={profile?.full_name || username}
        creatorPhone={profile?.business_phone || ''}
        isPreview={false}
      />
    </div>
  );
};
