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

  return (
    <div className="min-h-screen bg-[#ECE7DC] flex flex-col antialiased text-[#1C1E22] overflow-x-hidden">
      {/* Top Floating Banner */}
      {onBackToEditor && (
        <div className="w-full bg-[#1C1E22] text-white px-3 sm:px-4 py-2 flex items-center justify-between text-xs shadow-md z-30 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
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
            className={`w-full max-w-xl ${bgClass} rounded-[28px] sm:rounded-[36px] p-4 sm:p-7 md:p-8 shadow-md border border-black/10 flex flex-col justify-between min-h-[580px] overflow-hidden`}
          >
            <div className="space-y-4 max-w-full">
              {/* Creator Profile Header */}
              <div className="flex items-center justify-between gap-2.5 min-w-0">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
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
                      className={`text-base sm:text-lg md:text-xl font-bold leading-tight truncate ${
                        isDarkTheme ? 'text-white' : 'text-[#1C1E22]'
                      }`}
                    >
                      {profile.full_name}
                    </h1>
                    <p
                      className={`text-xs sm:text-sm font-medium truncate mt-0.5 ${
                        isDarkTheme ? 'text-white/75' : 'text-[#737882]'
                      }`}
                    >
                      {profile.bio}
                    </p>
                  </div>
                </div>

                {/* Actions: Search, Filter, Share */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {/* Search toggle */}
                  <button
                    type="button"
                    onClick={() => setShowSearch(!showSearch)}
                    aria-label="Search"
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-black/10 flex items-center justify-center transition-all shadow-2xs cursor-pointer ${
                      showSearch
                        ? 'bg-[#1C1E22] text-white'
                        : 'bg-white text-[#1C1E22] hover:bg-black/5'
                    }`}
                  >
                    <HugeIcon icon={Search01Icon} size={15} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  {/* Color filters */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx =
                        (availableColors.indexOf(colorFilter) + 1) % availableColors.length;
                      setColorFilter(availableColors[nextIdx]);
                    }}
                    aria-label="Filter links"
                    className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-full border border-black/10 flex items-center gap-1 text-xs font-semibold hover:bg-black/5 active:scale-95 transition-all shadow-2xs cursor-pointer ${
                      colorFilter !== 'all'
                        ? 'bg-[#1C1E22] text-white border-transparent'
                        : 'bg-white text-[#1C1E22]'
                    }`}
                  >
                    <HugeIcon icon={PreferenceHorizontalIcon} size={13} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="capitalize hidden sm:inline text-[11px]">
                      {colorFilter === 'all' ? 'Filter' : colorFilter}
                    </span>
                  </button>

                  {/* Share button */}
                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share profile link"
                    title="Copy profile link"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#1C1E22] hover:bg-black/5 active:scale-95 transition-all shadow-2xs cursor-pointer"
                  >
                    {copied ? (
                      <HugeIcon icon={Tick01Icon} size={14} className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <HugeIcon icon={Share01Icon} size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </button>
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
