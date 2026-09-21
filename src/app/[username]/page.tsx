import React, { useState, useEffect } from 'react';
import { HugeIcon } from '../../components/HugeIcon';
import {
  Search01Icon,
  PreferenceHorizontalIcon,
  Share01Icon,
  Tick01Icon,
  AlertCircleIcon,
  ArrowLeft01Icon,
  Cancel01Icon,
  Home01Icon,
} from '@hugeicons/core-free-icons';
import { profileService, DbProfile, DbLink, DbSection } from '../../lib/firebase';
import { ProfileCard } from '../../components/ProfileCard';
import { SocialIconsRow } from '../../components/SocialIconsRow';
import { UI_KIT } from '../../lib/ui-kit';
import { generateWhatsAppIntentUrl } from '../../lib/whatsapp';
import { ProfileCardData } from '../../types';

export interface PublicProfilePageProps {
  username?: string;
  onBackToEditor?: () => void;
  isEmbedded?: boolean;
}

export const PublicProfilePage: React.FC<PublicProfilePageProps> = ({
  username: propUsername,
  onBackToEditor,
}) => {
  const getUsernameFromLocation = (): string => {
    if (propUsername) return propUsername;

    const path = window.location.pathname.replace(/^\//, '');
    const segments = path.split('/').filter(Boolean);

    if (segments[0] === 'app' && segments[1]) {
      return segments[1];
    }
    if (segments.length === 1 && segments[0] !== 'index.html' && segments[0] !== 'api') {
      return segments[0];
    }

    const searchParams = new URLSearchParams(window.location.search);
    const userParam = searchParams.get('user') || searchParams.get('u');
    if (userParam) return userParam;

    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (hash && hash !== 'dashboard' && hash !== 'explore') return hash;

    return 'creator';
  };

  const username = getUsernameFromLocation();

  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [links, setLinks] = useState<DbLink[]>([]);
  const [sections, setSections] = useState<DbSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const availableColors = ['all', 'purple', 'orange', 'yellow', 'green', 'dark'];

  // Fetch creator data by username from Cloud Firestore
  useEffect(() => {
    async function loadCreatorData() {
      setLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const domainParam = searchParams.get('domain') || searchParams.get('d');
        
        let result = null;
        if (domainParam) {
          result = await profileService.getProfileByDomain(domainParam);
        }
        
        if (!result) {
          result = await profileService.getProfileByUsername(username);
        }

        if (!result && username.includes('.')) {
          result = await profileService.getProfileByDomain(username);
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
          // If no remote profile found, check if this is the current active local session
          const saved = localStorage.getItem('linklyra_user_profile_v2') || localStorage.getItem('linkcards_user_profile_v2');
          if (saved) {
            try {
              const localProfile = JSON.parse(saved);
              if (localProfile.username === username || username === 'creator') {
                setProfile({
                  id: localProfile.id,
                  username: localProfile.username,
                  full_name: localProfile.name,
                  bio: localProfile.headline,
                  avatar_url: localProfile.avatarUrl,
                  business_phone: localProfile.businessPhone,
                  theme: localProfile.theme,
                  socials: localProfile.socials,
                });
                setSections(localProfile.sections || []);
                setLinks(
                  localProfile.cards.map((c: any, i: number) => ({
                    id: c.id,
                    profile_id: localProfile.id,
                    section_id: c.sectionId,
                    title: c.title,
                    subtitle: c.subtitle,
                    link_url: c.linkUrl,
                    color: c.color,
                    logo_url: c.logoSrc,
                    badge_text: c.badgeText,
                    expanded: c.expanded,
                    is_active: c.isActive !== false,
                    clicks: c.clicks || 0,
                    display_order: i,
                    template_type: c.templateType,
                    real_estate: c.realEstate
                      ? {
                          property_name: c.realEstate.propertyName,
                          location: c.realEstate.location,
                          price_bracket: c.realEstate.priceBracket,
                          property_type: c.realEstate.propertyType,
                        }
                      : undefined,
                    coaching: c.coaching
                      ? {
                          course_name: c.coaching.courseName,
                          exam_track: c.coaching.examTrack,
                          batch_timing: c.coaching.batchTiming,
                          fee_structure: c.coaching.feeStructure,
                        }
                      : undefined,
                    custom_whatsapp_phone: c.customWhatsappPhone,
                  }))
                );
                setLoading(false);
                return;
              }
            } catch (e) {
              console.error(e);
            }
          }
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

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = (link: DbLink) => {
    // Record click analytics atomically
    profileService.recordClick(link.id);

    // Dynamic WhatsApp intent generation for localized business cards
    if (link.template_type === 'real_estate' || link.template_type === 'coaching_institute') {
      const cardData: ProfileCardData = {
        id: link.id,
        title: link.title,
        subtitle: link.subtitle,
        linkUrl: link.link_url,
        color: link.color,
        logoSrc: link.logo_url,
        badgeText: link.badge_text,
        expanded: link.expanded,
        templateType: link.template_type,
        realEstate: link.real_estate
          ? {
              propertyName: link.real_estate.property_name || link.title,
              location: link.real_estate.location || '',
              priceBracket: link.real_estate.price_bracket || '',
              propertyType: link.real_estate.property_type || '',
            }
          : undefined,
        coaching: link.coaching
          ? {
              courseName: link.coaching.course_name || link.title,
              examTrack: link.coaching.exam_track || '',
              batchTiming: link.coaching.batch_timing || '',
              feeStructure: link.coaching.fee_structure || '',
            }
          : undefined,
        customWhatsappPhone: link.custom_whatsapp_phone,
      };

      const intent = generateWhatsAppIntentUrl(cardData, profile?.business_phone);

      if (!intent.hasPhone) {
        setMissingPhoneAlert(true);
        if (link.link_url && link.link_url !== '#' && link.link_url !== 'https://') {
          const finalUrl =
            link.link_url.startsWith('http://') || link.link_url.startsWith('https://')
              ? link.link_url
              : `https://${link.link_url}`;
          window.open(finalUrl, '_blank', 'noopener,noreferrer');
        }
        return;
      }

      if (intent.url) {
        window.open(intent.url, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    if (link.link_url && link.link_url !== '#' && link.link_url !== 'https://') {
      const finalUrl =
        link.link_url.startsWith('http://') || link.link_url.startsWith('https://')
          ? link.link_url
          : `https://${link.link_url}`;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
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
      {/* Top Floating Banner */}
      {onBackToEditor && (
        <div className="w-full bg-[#1C1E22] text-white px-3 sm:px-4 py-2 flex items-center justify-between text-xs shadow-md z-30 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0" />
            <span className="font-semibold truncate">Visitor View</span>
            <span className="text-white/60 font-mono hidden sm:inline truncate">
              /{username}
            </span>
          </div>
          <button
            type="button"
            onClick={onBackToEditor}
            className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <HugeIcon icon={ArrowLeft01Icon} size={14} className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
        </div>
      )}

      {/* Main Visitor Canvas */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 md:p-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 rounded-full border-3 border-[#5E4BF7] border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-[#737882]">Loading profile...</p>
          </div>
        ) : error || !profile ? (
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-black/10 text-center space-y-4 shadow-sm my-auto">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <HugeIcon icon={AlertCircleIcon} size={24} className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#1C1E22]">Profile Not Found</h2>
            <p className="text-xs text-[#737882]">
              {error || `The user @${username} does not exist or has not published any links yet.`}
            </p>
            {onBackToEditor ? (
              <button
                type="button"
                onClick={onBackToEditor}
                className="px-5 py-2.5 rounded-full bg-[#1C1E22] text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Back to Studio Editor
              </button>
            ) : (
              <a
                href="/"
                className="inline-block px-5 py-2.5 rounded-full bg-[#5E4BF7] text-white text-xs font-bold hover:bg-[#4E3BE5] transition-colors"
              >
                Create Your Profile
              </a>
            )}
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

                    const renderCardItem = (link: DbLink) => (
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
                          id={link.id}
                          title={link.title}
                          subtitle={link.subtitle}
                          linkUrl={link.link_url}
                          color={link.color}
                          logoSrc={link.logo_url}
                          badgeText={link.badge_text}
                          expanded={link.expanded}
                          templateType={link.template_type}
                          realEstate={
                            link.real_estate
                              ? {
                                  propertyName: link.real_estate.property_name || link.title,
                                  location: link.real_estate.location || '',
                                  priceBracket: link.real_estate.price_bracket || '',
                                  propertyType: link.real_estate.property_type || '',
                                }
                              : undefined
                          }
                          coaching={
                            link.coaching
                              ? {
                                  courseName: link.coaching.course_name || link.title,
                                  examTrack: link.coaching.exam_track || '',
                                  batchTiming: link.coaching.batch_timing || '',
                                  feeStructure: link.coaching.fee_structure || '',
                                }
                              : undefined
                          }
                          businessPhone={profile.business_phone}
                          customWhatsappPhone={link.custom_whatsapp_phone}
                          interactive={true}
                          onMissingPhone={() => setMissingPhoneAlert(true)}
                          onClick={() => handleOpenLink(link)}
                          onLinkClick={(e) => {
                            e.stopPropagation();
                            handleOpenLink(link);
                          }}
                        />
                      </div>
                    );

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

            {/* Footer */}
            <footer className="pt-6 pb-1 text-center space-y-2 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/10 text-[10px] sm:text-[11px] font-bold text-[#1C1E22] shadow-2xs max-w-full truncate">
                <span className="shrink-0 font-extrabold text-[#5E4BF7]">LinkLyra</span>
                <span className="text-[#737882] font-normal">•</span>
                <span className="text-[#737882] font-medium truncate">@{profile.username}</span>
              </div>

              {copied && (
                <div className="animate-fadeIn text-xs font-semibold text-emerald-700 bg-emerald-50 py-0.5 px-3 rounded-full border border-emerald-200 inline-block">
                  Link copied to clipboard!
                </div>
              )}
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};
