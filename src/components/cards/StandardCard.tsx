import React, { useState } from 'react';
import { HugeIcon } from '../HugeIcon';
import {
  ArrowUpRight01Icon,
  WhatsappIcon,
  Book02Icon,
  GalleryThumbnailsIcon,
  Clock01Icon,
  CreditCardIcon,
} from '@hugeicons/core-free-icons';
import { ProfileCardProps } from '../ProfileCard';
import { UI_KIT } from '../../lib/ui-kit';
import { getButtonRadiusClass, getCardSurfaceClass } from './CardStyles';

export interface StandardCardProps extends ProfileCardProps {
  handleOpenLead: (e: React.MouseEvent) => void;
  isWhatsAppLink: boolean;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  id,
  title,
  subtitle,
  color,
  logoSrc,
  badgeText,
  expanded = false,
  templateType = 'standard',
  cardStyle = 'fill',
  buttonStyle = 'rounded',
  cardBgColor,
  cardTextColor,
  customAccentColor,
  coaching,
  interactive = true,
  handleOpenLead,
  isWhatsAppLink,
}) => {
  const theme = UI_KIT.cardPalettes[color] || UI_KIT.cardPalettes.purple;
  const [logoError, setLogoError] = useState(false);
  const isCoaching = templateType === 'coaching_institute' && Boolean(coaching);
  const surfaceClass = getCardSurfaceClass(cardStyle, theme, cardBgColor, customAccentColor);

  // Expanded card view
  if (expanded) {
    return (
      <div
        id={id}
        onClick={handleOpenLead}
        style={{
          backgroundColor:
            cardBgColor ||
            (cardStyle === 'fill' && customAccentColor && (!color || color === 'purple')
              ? customAccentColor
              : undefined),
          color: cardTextColor || undefined,
        }}
        className={`w-full max-w-full overflow-hidden ${surfaceClass} ${getButtonRadiusClass(
          buttonStyle
        )} p-4 sm:p-5 transition-all duration-150 select-none shadow-2xs space-y-2.5 ${
          interactive ? 'cursor-pointer hover:opacity-95 active:scale-[0.99]' : ''
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
              {logoSrc && logoSrc.trim() !== '' && !logoError ? (
                <img
                  src={logoSrc}
                  alt=""
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              ) : isWhatsAppLink ? (
                <HugeIcon icon={WhatsappIcon} size={18} className="w-4 h-4 text-[#25D366]" />
              ) : isCoaching ? (
                <HugeIcon icon={Book02Icon} size={18} className="w-4 h-4 text-[#191A1E]" />
              ) : (
                <HugeIcon
                  icon={GalleryThumbnailsIcon}
                  size={16}
                  className={color === 'purple' ? 'text-[#584CE4]' : 'text-[#191A1E]'}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold tracking-tight truncate leading-tight">
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {badgeText && (
              <span
                className={`inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] font-bold tracking-wide uppercase whitespace-nowrap ${theme.badgeBgClass}`}
              >
                {badgeText}
              </span>
            )}
            <div
              style={{
                backgroundColor:
                  cardStyle === 'fill' ? undefined : customAccentColor || undefined,
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-colors shrink-0 shadow-2xs ${
                cardStyle === 'fill'
                  ? theme.arrowBtnClass
                  : customAccentColor
                  ? 'text-white'
                  : theme.arrowBtnClass
              }`}
              title={isWhatsAppLink ? 'WhatsApp' : 'Connect'}
            >
              <span>{isWhatsAppLink ? 'WhatsApp' : 'Connect'}</span>
              <HugeIcon
                icon={isWhatsAppLink ? WhatsappIcon : ArrowUpRight01Icon}
                size={14}
                className="w-3.5 h-3.5"
              />
            </div>
          </div>
        </div>

        {/* Coaching Institute Badges */}
        {isCoaching && coaching && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
            {coaching.examTrack && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${theme.badgeBgClass} ${theme.badgeBorderClass}`}
              >
                <HugeIcon icon={Book02Icon} size={12} className="w-3 h-3 shrink-0" />
                <span className="truncate">{coaching.examTrack}</span>
              </span>
            )}
            {coaching.batchTiming && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${theme.badgeBgClass} ${theme.badgeBorderClass}`}
              >
                <HugeIcon icon={Clock01Icon} size={12} className="w-3 h-3 shrink-0" />
                <span className="truncate">{coaching.batchTiming}</span>
              </span>
            )}
            {coaching.feeStructure && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-white text-[#191A1E] shadow-2xs">
                <HugeIcon icon={CreditCardIcon} size={12} className="w-3 h-3 shrink-0 text-[#5E4BF7]" />
                <span className="truncate">{coaching.feeStructure}</span>
              </span>
            )}
          </div>
        )}

        {subtitle && (
          <p
            className={`text-xs font-normal leading-relaxed ${
              cardStyle === 'outline' || cardStyle === 'glass' ? 'opacity-85' : theme.subtextClass
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // Standard Compact View
  return (
    <div
      id={id}
      onClick={handleOpenLead}
      style={{
        backgroundColor:
          cardBgColor ||
          (cardStyle === 'fill' && customAccentColor && (!color || color === 'purple')
            ? customAccentColor
            : undefined),
        color: cardTextColor || undefined,
      }}
      className={`w-full max-w-full overflow-hidden ${surfaceClass} ${getButtonRadiusClass(
        buttonStyle
      )} px-3.5 py-3 sm:px-4 sm:py-3.5 transition-all duration-150 select-none flex items-center justify-between gap-3 ${
        interactive ? 'cursor-pointer hover:opacity-95 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
          {logoSrc && logoSrc.trim() !== '' && !logoError ? (
            <img
              src={logoSrc}
              alt=""
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : isWhatsAppLink ? (
            <HugeIcon icon={WhatsappIcon} size={18} className="w-4 h-4 text-[#25D366]" />
          ) : (
            <HugeIcon
              icon={GalleryThumbnailsIcon}
              size={16}
              className={color === 'purple' ? 'text-[#584CE4]' : 'text-[#191A1E]'}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-xs sm:text-sm font-bold tracking-tight truncate leading-tight min-w-0 flex-1">
              {title}
            </h3>
          </div>

          {subtitle && (
            <p
              className={`text-[11px] truncate ${
                cardStyle === 'outline' || cardStyle === 'glass' ? 'opacity-70' : theme.subtextClass
              } font-normal mt-0.5`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {badgeText && (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase whitespace-nowrap ${theme.badgeBgClass}`}
          >
            {badgeText}
          </span>
        )}
        <div
          style={{
            backgroundColor:
              cardStyle === 'fill' ? undefined : customAccentColor || undefined,
          }}
          className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold transition-colors shrink-0 shadow-2xs ${
            cardStyle === 'fill'
              ? theme.arrowBtnClass
              : customAccentColor
              ? 'text-white'
              : theme.arrowBtnClass
          }`}
          title={isWhatsAppLink ? 'WhatsApp' : 'Connect'}
        >
          <span>{isWhatsAppLink ? 'WhatsApp' : 'Connect'}</span>
          <HugeIcon
            icon={isWhatsAppLink ? WhatsappIcon : ArrowUpRight01Icon}
            size={13}
            className="w-3 h-3"
          />
        </div>
      </div>
    </div>
  );
};
