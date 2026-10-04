import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { Location01Icon, Calendar03Icon, WhatsappIcon } from '@hugeicons/core-free-icons';
import { ProfileCardProps } from '../ProfileCard';
import { ProfileCardData } from '../../types';
import { getCardRadiusClass } from './CardStyles';

export interface SpecializedCardInnerProps extends ProfileCardProps {
  cardData: ProfileCardData;
  handleOpenLead: (e: React.MouseEvent) => void;
}

export const RealEstateCard: React.FC<SpecializedCardInnerProps> = ({
  id,
  title,
  subtitle,
  realEstate,
  logoSrc,
  cardBgColor,
  cardTextColor,
  buttonStyle,
  interactive,
  onLinkClick,
  onClick,
  onOpenShowingModal,
  cardData,
  handleOpenLead,
}) => {
  const radiusClass = getCardRadiusClass(buttonStyle);
  const propertyPrice = realEstate?.price || realEstate?.priceBracket || '$749,000';
  const propertyLoc = realEstate?.location || 'Austin, TX';
  const propertyTypeStr = realEstate?.propertyType || '3 Bed • 2 Bath • 1,850 sq ft';
  const statusTag = realEstate?.statusTag || 'just_listed';
  const firstImage = (realEstate?.images && realEstate.images[0]) || logoSrc || '';
  const imgSrc =
    firstImage && firstImage.trim() !== ''
      ? firstImage
      : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80';

  return (
    <div
      id={id}
      style={{
        backgroundColor: cardBgColor || undefined,
        color: cardTextColor || undefined,
      }}
      className={`w-full max-w-full overflow-hidden ${
        cardBgColor ? 'border border-black/10' : 'bg-white text-stone-900 border border-stone-200/90'
      } ${radiusClass} shadow-sm transition-all duration-200 select-none ${
        interactive ? 'hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      {/* Photo Banner with Badges */}
      <div className="relative w-full h-44 sm:h-52 bg-stone-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Top Status & Price Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md border border-white/20">
            {statusTag === 'open_house'
              ? '📍 Open House'
              : statusTag === 'price_drop'
              ? '🏷️ Price Drop'
              : '🔥 Just Listed'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold bg-emerald-600 text-white shadow-md">
            {propertyPrice}
          </span>
        </div>

        {/* Bottom Title on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-base sm:text-lg font-bold tracking-tight line-clamp-1">{title}</h3>
          <p className="text-xs text-stone-200 flex items-center gap-1 mt-0.5">
            <HugeIcon icon={Location01Icon} size={14} className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {propertyLoc}
          </p>
        </div>
      </div>

      {/* Specs & Action Row */}
      <div className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between text-xs sm:text-sm text-stone-600 font-medium pb-2 border-b border-stone-100">
          <span>{propertyTypeStr}</span>
          {realEstate?.featuredAmenity && (
            <span className="text-stone-500 text-[11px] truncate max-w-[140px]">
              {realEstate.featuredAmenity}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{subtitle}</p>
        )}

        {/* Action CTAs */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onLinkClick) onLinkClick(e);
              else if (onClick) onClick();
              if (onOpenShowingModal) {
                onOpenShowingModal(cardData);
              } else {
                handleOpenLead(e);
              }
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <HugeIcon icon={Calendar03Icon} size={14} className="w-3.5 h-3.5" />
            Book Showing
          </button>

          <button
            type="button"
            onClick={handleOpenLead}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <HugeIcon icon={WhatsappIcon} size={15} className="w-4 h-4 text-[#25D366]" />
            WhatsApp Agent
          </button>
        </div>
      </div>
    </div>
  );
};
