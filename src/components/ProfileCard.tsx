import React from 'react';
import {
  ArrowUpRight,
  MapPin,
  Building2,
  Tag,
  GraduationCap,
  Clock,
  CreditCard,
  MessageCircle,
} from 'lucide-react';
import { CardColor, CardTemplateType, RealEstateMetadata, CoachingMetadata, ProfileCardData } from '../types';
import { UI_KIT } from '../lib/ui-kit';
import { generateWhatsAppIntentUrl } from '../lib/whatsapp';

export interface ProfileCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  linkUrl: string;
  color: CardColor;
  logoSrc?: string;
  badgeText?: string;
  expanded?: boolean;
  templateType?: CardTemplateType;
  realEstate?: RealEstateMetadata;
  coaching?: CoachingMetadata;
  businessPhone?: string;
  customWhatsappPhone?: string;
  onClick?: () => void;
  onLinkClick?: (e: React.MouseEvent) => void;
  onMissingPhone?: () => void;
  interactive?: boolean;
}

export const COLOR_CONFIG = UI_KIT.cardPalettes;

export const ProfileCard: React.FC<ProfileCardProps> = ({
  id,
  title,
  subtitle,
  linkUrl,
  color,
  logoSrc,
  badgeText,
  expanded = false,
  templateType = 'standard',
  realEstate,
  coaching,
  businessPhone,
  customWhatsappPhone,
  onClick,
  onLinkClick,
  onMissingPhone,
  interactive = true,
}) => {
  const theme = UI_KIT.cardPalettes[color] || UI_KIT.cardPalettes.purple;

  // Construct card object for WhatsApp intent generation
  const cardData: ProfileCardData = {
    id: id || 'card',
    title,
    subtitle,
    linkUrl,
    color,
    logoSrc,
    badgeText,
    expanded,
    templateType: (templateType as CardTemplateType) || 'standard',
    realEstate,
    coaching,
    customWhatsappPhone,
  };

  const handleOpenLead = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (onLinkClick) {
      onLinkClick(e);
      return;
    }

    if (onClick) {
      onClick();
      return;
    }

    // Dynamic WhatsApp intent generation
    const intent = generateWhatsAppIntentUrl(cardData, businessPhone);

    if (!intent.hasPhone) {
      if (onMissingPhone) {
        onMissingPhone();
      } else {
        alert(
          'WhatsApp business phone is not configured yet. Please configure your WhatsApp number in profile settings to receive leads directly.'
        );
      }
      return;
    }

    if (intent.url) {
      window.open(intent.url, '_blank', 'noopener,noreferrer');
    }
  };

  const isRealEstate = templateType === 'real_estate' && realEstate;
  const isCoaching = templateType === 'coaching_institute' && coaching;

  // 1. Featured / Expanded Card
  if (expanded) {
    return (
      <div
        id={id}
        onClick={handleOpenLead}
        className={`w-full max-w-full overflow-hidden ${theme.bgClass} ${theme.textClass} rounded-[24px] p-4 sm:p-5 md:p-6 transition-all duration-200 select-none shadow-sm ${
          interactive ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]' : ''
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-2.5 mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-xs p-2 shrink-0">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt=""
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : isRealEstate ? (
                <Building2 className="w-5 h-5 text-[#191A1E]" />
              ) : isCoaching ? (
                <GraduationCap className="w-5 h-5 text-[#191A1E]" />
              ) : (
                <span className="text-[#191A1E] font-bold text-xs sm:text-sm">
                  {title ? title.charAt(0).toUpperCase() : 'L'}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight truncate block">
                {title}
              </span>
              {isRealEstate && realEstate.propertyName && realEstate.propertyName !== title && (
                <span className={`text-[11px] sm:text-xs block opacity-85 truncate font-medium`}>
                  {realEstate.propertyName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {badgeText && (
              <span
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase whitespace-nowrap ${theme.badgeBgClass}`}
              >
                {badgeText}
              </span>
            )}
            <div
              className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 shrink-0 ${theme.arrowBtnClass}`}
              title="Inquire via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#25D366]" fill="#25D366" />
              <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">Inquire</span>
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Real Estate Specific Metadata Badges */}
        {isRealEstate && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
            {realEstate.propertyType && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${theme.badgeBgClass} ${theme.badgeBorderClass}`}>
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{realEstate.propertyType}</span>
              </span>
            )}
            {realEstate.location && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${theme.badgeBgClass} ${theme.badgeBorderClass}`}>
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{realEstate.location}</span>
              </span>
            )}
            {realEstate.priceBracket && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-white text-[#191A1E] shadow-2xs">
                <Tag className="w-3 h-3 shrink-0 text-[#E75646]" />
                <span className="truncate">{realEstate.priceBracket}</span>
              </span>
            )}
          </div>
        )}

        {/* Coaching Institute Specific Metadata Badges */}
        {isCoaching && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
            {coaching.examTrack && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${theme.badgeBgClass} ${theme.badgeBorderClass}`}>
                <GraduationCap className="w-3 h-3 shrink-0" />
                <span className="truncate">{coaching.examTrack}</span>
              </span>
            )}
            {coaching.batchTiming && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${theme.badgeBgClass} ${theme.badgeBorderClass}`}>
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">{coaching.batchTiming}</span>
              </span>
            )}
            {coaching.feeStructure && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-white text-[#191A1E] shadow-2xs">
                <CreditCard className="w-3 h-3 shrink-0 text-[#5E4BF7]" />
                <span className="truncate">{coaching.feeStructure}</span>
              </span>
            )}
          </div>
        )}

        {subtitle && (
          <p className={`text-xs sm:text-sm md:text-base font-medium leading-snug break-words line-clamp-3 ${theme.subtextClass}`}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // 2. Standard Compact Card
  return (
    <div
      id={id}
      onClick={handleOpenLead}
      className={`w-full max-w-full overflow-hidden ${theme.bgClass} ${theme.textClass} rounded-[24px] px-3.5 py-3 sm:px-5 sm:py-4 transition-all duration-200 select-none flex items-center justify-between gap-2.5 sm:gap-3 shadow-xs ${
        interactive ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center shadow-xs p-2 shrink-0">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt=""
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : isRealEstate ? (
            <Building2 className="w-5 h-5 text-[#191A1E]" />
          ) : isCoaching ? (
            <GraduationCap className="w-5 h-5 text-[#191A1E]" />
          ) : (
            <span className="text-[#191A1E] font-bold text-xs sm:text-sm">
              {title ? title.charAt(0).toUpperCase() : 'L'}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm sm:text-base md:text-lg font-bold tracking-tight truncate leading-tight">
              {title}
            </h3>
            {/* Quick Price/Fee inline tag for compact cards */}
            {isRealEstate && realEstate.priceBracket && (
              <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 whitespace-nowrap">
                {realEstate.priceBracket}
              </span>
            )}
            {isCoaching && coaching.feeStructure && (
              <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 whitespace-nowrap">
                {coaching.feeStructure}
              </span>
            )}
          </div>

          {/* Location or Course Exam Track description */}
          {isRealEstate && (realEstate.location || realEstate.propertyType) ? (
            <div className={`flex items-center gap-2 text-[11px] sm:text-xs truncate ${theme.subtextClass} font-medium mt-0.5`}>
              {realEstate.propertyType && <span>{realEstate.propertyType}</span>}
              {realEstate.propertyType && realEstate.location && <span>•</span>}
              {realEstate.location && <span>{realEstate.location}</span>}
            </div>
          ) : isCoaching && (coaching.examTrack || coaching.batchTiming) ? (
            <div className={`flex items-center gap-2 text-[11px] sm:text-xs truncate ${theme.subtextClass} font-medium mt-0.5`}>
              {coaching.examTrack && <span>{coaching.examTrack}</span>}
              {coaching.examTrack && coaching.batchTiming && <span>•</span>}
              {coaching.batchTiming && <span>{coaching.batchTiming}</span>}
            </div>
          ) : subtitle ? (
            <p className={`text-[11px] sm:text-xs truncate ${theme.subtextClass} font-normal mt-0.5`}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {badgeText && (
          <span
            className={`hidden sm:inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase whitespace-nowrap ${theme.badgeBgClass}`}
          >
            {badgeText}
          </span>
        )}
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shrink-0 ${theme.arrowBtnClass}`}
          title="Direct WhatsApp Lead"
        >
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#25D366]" fill="#25D366" />
        </div>
      </div>
    </div>
  );
};
