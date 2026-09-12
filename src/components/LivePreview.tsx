import React, { useState } from 'react';
import { Search, SlidersHorizontal, Share2, Check, Sparkles, Smartphone, Monitor, AlertCircle, MessageCircle, X } from 'lucide-react';
import { UserProfile, ProfileCardData } from '../types';
import { ProfileCard } from './ProfileCard';
import { SocialIconsRow } from './SocialIconsRow';
import { UI_KIT } from '../lib/ui-kit';
import { generateWhatsAppIntentUrl } from '../lib/whatsapp';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<'mobile' | 'full'>('mobile');
  const [missingPhoneNotice, setMissingPhoneNotice] = useState(false);

  const availableColors = ['all', 'purple', 'orange', 'yellow', 'green', 'dark'];

  const activeCards = profile.cards.filter((c) => c.isActive !== false);

  const filteredCards = activeCards.filter((card) => {
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.badgeText?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor = colorFilter === 'all' || card.color === colorFilter;
    return matchesSearch && matchesColor;
  });

  const handleShare = () => {
    const url = `${window.location.origin}?user=${profile.username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCardInteraction = (card: ProfileCardData) => {
    // If it's an industry card or WhatsApp lead card
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

    if (onCardClick) {
      onCardClick(card);
      return;
    }

    if (card.linkUrl && card.linkUrl !== '#') {
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

  return (
    <div className="flex flex-col h-full w-full items-center justify-start p-2.5 sm:p-5 select-none overflow-y-auto">
      {/* Device Viewport Selector Toggle */}
      <div className="mb-3 sm:mb-4 flex items-center gap-1 bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-black/10 shadow-2xs shrink-0">
        <button
          type="button"
          onClick={() => setPreviewWidth('mobile')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            previewWidth === 'mobile'
              ? 'bg-[#1C1E22] text-white shadow-xs'
              : 'text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile (420px)</span>
        </button>
        <button
          type="button"
          onClick={() => setPreviewWidth('full')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            previewWidth === 'full'
              ? 'bg-[#1C1E22] text-white shadow-xs'
              : 'text-[#737882] hover:text-[#1C1E22]'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Fluid Web</span>
        </button>
      </div>

      {/* The Clean Preview Canvas */}
      <div
        className={`w-full max-w-full transition-all duration-300 ${
          previewWidth === 'mobile' ? 'max-w-[420px]' : 'max-w-2xl'
        } ${bgClass} rounded-[28px] sm:rounded-[32px] p-4 sm:p-7 shadow-md border border-black/10 flex flex-col justify-between min-h-[580px] overflow-hidden`}
      >
        <div className="space-y-4 max-w-full">
          {/* Header Row: Avatar, Name, Handle, Quick Filter/Share */}
          <div className="flex items-center justify-between gap-2.5 min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white shrink-0">
                <img
                  src={profile.avatarUrl}
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
                  className={`text-sm sm:text-base md:text-lg font-bold leading-tight truncate ${
                    isDarkTheme ? 'text-white' : 'text-[#1C1E22]'
                  }`}
                >
                  {profile.name}
                </h2>
                <p
                  className={`text-[11px] sm:text-xs font-medium truncate mt-0.5 ${
                    isDarkTheme ? 'text-white/70' : 'text-[#737882]'
                  }`}
                >
                  {profile.headline}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Search links"
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-black/10 flex items-center justify-center transition-all shadow-2xs ${
                  showSearch
                    ? 'bg-[#1C1E22] text-white'
                    : 'bg-white text-[#1C1E22] hover:bg-black/5'
                }`}
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </button>

              {/* Color filter */}
              <button
                type="button"
                onClick={() => {
                  const nextIdx =
                    (availableColors.indexOf(colorFilter) + 1) % availableColors.length;
                  setColorFilter(availableColors[nextIdx]);
                }}
                className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-full border border-black/10 flex items-center gap-1 sm:gap-1.5 text-xs font-semibold hover:bg-black/5 active:scale-95 transition-all shadow-2xs ${
                  colorFilter !== 'all'
                    ? 'bg-[#1C1E22] text-white border-transparent'
                    : 'bg-white text-[#1C1E22]'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="capitalize hidden sm:inline text-[11px]">
                  {colorFilter === 'all' ? 'Filter' : colorFilter}
                </span>
              </button>

              {/* Share button */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share profile"
                title="Copy profile link"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#1C1E22] hover:bg-black/5 active:scale-95 transition-all shadow-2xs"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                )}
              </button>
            </div>
          </div>

          {/* Social Icons Bar */}
          {profile.socials && Object.values(profile.socials).some(Boolean) && (
            <div className="pt-0.5">
              <SocialIconsRow socials={profile.socials} isDark={isDarkTheme} />
            </div>
          )}

          {/* Collapsible Search Bar */}
          {showSearch && (
            <div className="animate-fadeIn">
              <input
                type="text"
                placeholder="Search links, tags, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-white px-3.5 py-2 rounded-2xl border border-black/10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5E4BF7] shadow-xs"
              />
            </div>
          )}

          {/* Links Stack */}
          <div className="space-y-3 pt-1 max-w-full">
            {filteredCards.length === 0 ? (
              <div className="text-center py-10 bg-white/60 rounded-3xl border border-dashed border-black/15 p-5">
                <p
                  className={`text-xs sm:text-sm font-bold ${
                    isDarkTheme ? 'text-white' : 'text-[#1C1E22]'
                  }`}
                >
                  No links to display
                </p>
                <p className="text-[11px] sm:text-xs text-[#737882] mt-1 max-w-xs mx-auto">
                  {searchQuery || colorFilter !== 'all'
                    ? 'No links match your search or filter.'
                    : 'Add links from the editor to see them appear live.'}
                </p>
                {(searchQuery || colorFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setColorFilter('all');
                    }}
                    className="mt-3 px-3 py-1 rounded-full bg-black/10 text-xs font-semibold text-[#1C1E22]"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            ) : (
              (() => {
                const sections = profile.sections || [];
                const hasSections = sections.length > 0;

                if (!hasSections || searchQuery || colorFilter !== 'all') {
                  return filteredCards.map((card) => (
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
                        realEstate={card.realEstate}
                        coaching={card.coaching}
                        businessPhone={profile.businessPhone}
                        customWhatsappPhone={card.customWhatsappPhone}
                        interactive={isInteractive}
                        onMissingPhone={() => setMissingPhoneNotice(true)}
                        onClick={() => handleCardInteraction(card)}
                        onLinkClick={(e) => {
                          e.stopPropagation();
                          handleCardInteraction(card);
                        }}
                      />
                    </div>
                  ));
                }

                // Render by sections
                const unsectionedCards = filteredCards.filter((c) => !c.sectionId);
                const sectionedCardsMap = sections.map((sec) => ({
                  section: sec,
                  cards: filteredCards.filter((c) => c.sectionId === sec.id),
                }));

                return (
                  <div className="space-y-4">
                    {/* Unsectioned Cards First */}
                    {unsectionedCards.map((card) => (
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
                          realEstate={card.realEstate}
                          coaching={card.coaching}
                          businessPhone={profile.businessPhone}
                          customWhatsappPhone={card.customWhatsappPhone}
                          interactive={isInteractive}
                          onMissingPhone={() => setMissingPhoneNotice(true)}
                          onClick={() => handleCardInteraction(card)}
                          onLinkClick={(e) => {
                            e.stopPropagation();
                            handleCardInteraction(card);
                          }}
                        />
                      </div>
                    ))}

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
                              {cards.map((card) => (
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
                                    realEstate={card.realEstate}
                                    coaching={card.coaching}
                                    businessPhone={profile.businessPhone}
                                    customWhatsappPhone={card.customWhatsappPhone}
                                    interactive={isInteractive}
                                    onMissingPhone={() => setMissingPhoneNotice(true)}
                                    onClick={() => handleCardInteraction(card)}
                                    onLinkClick={(e) => {
                                      e.stopPropagation();
                                      handleCardInteraction(card);
                                    }}
                                  />
                                </div>
                              ))}
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
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-bold block">WhatsApp Phone Missing</span>
              <span className="text-[11px] text-amber-800">
                To route leads directly to WhatsApp, add your business WhatsApp phone number in the <strong>Profile</strong> tab in the sidebar editor.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMissingPhoneNotice(false)}
              className="p-1 text-amber-700 hover:text-amber-950 rounded-lg shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Clean Footer */}
        <div className="pt-6 pb-1 text-center shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/10 text-[10px] sm:text-[11px] font-bold text-[#1C1E22] shadow-2xs max-w-full truncate">
            <Sparkles className="w-3 h-3 text-[#5E4BF7] shrink-0" />
            <span className="shrink-0">LinkCards</span>
            <span className="text-[#737882] font-normal">•</span>
            <span className="text-[#737882] font-medium truncate">@{profile.username}</span>
          </div>
          {copied && (
            <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 py-0.5 px-3 rounded-full border border-emerald-200 inline-block animate-fadeIn">
              Profile link copied!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
