import React, { useState } from 'react';
import { HugeIcon } from '../HugeIcon';
import { ArrowUpRight01Icon, Tick01Icon, Copy01Icon } from '@hugeicons/core-free-icons';
import { ProfileCardProps } from '../ProfileCard';
import { ProfileCardData } from '../../types';
import { getCardRadiusClass } from './CardStyles';

export interface AffiliateCardProps extends ProfileCardProps {
  cardData: ProfileCardData;
  handleOpenLead: (e: React.MouseEvent) => void;
}

export const AffiliateCard: React.FC<AffiliateCardProps> = ({
  id,
  title,
  subtitle,
  recommendation,
  logoSrc,
  cardBgColor,
  cardTextColor,
  buttonStyle,
  customAccentColor,
  handleOpenLead,
}) => {
  const radiusClass = getCardRadiusClass(buttonStyle);
  const [copiedCode, setCopiedCode] = useState(false);

  const product = recommendation?.productName || title;
  const brand = recommendation?.brandName || subtitle || 'Recommended Gear';
  const price = recommendation?.price || '$149';
  const code = recommendation?.discountCode || '';
  const discountText = recommendation?.discountText || 'Special Discount';
  const rawImg = recommendation?.productImageUrl || logoSrc || '';
  const img =
    rawImg && rawImg.trim() !== ''
      ? rawImg
      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      id={id}
      style={{
        backgroundColor: cardBgColor || undefined,
        color: cardTextColor || undefined,
      }}
      className={`w-full max-w-full overflow-hidden ${
        cardBgColor ? 'border border-black/10' : 'bg-white text-stone-900 border border-stone-200/90'
      } ${radiusClass} p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img
          src={img}
          alt={product}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-stone-100 shrink-0 border border-stone-100"
        />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block">
            {brand}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{product}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-extrabold text-xs sm:text-sm text-stone-900">{price}</span>
            {discountText && (
              <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60">
                {discountText}
              </span>
            )}
            {code && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 transition-colors cursor-pointer"
                title="Copy discount code"
              >
                {copiedCode ? (
                  <HugeIcon icon={Tick01Icon} size={12} className="w-3 h-3 text-emerald-600" />
                ) : (
                  <HugeIcon icon={Copy01Icon} size={12} className="w-3 h-3" />
                )}
                <span>{copiedCode ? 'COPIED!' : code}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleOpenLead}
        style={{
          backgroundColor: customAccentColor || undefined,
        }}
        className="px-3.5 py-2 rounded-xl bg-stone-900 hover:opacity-90 text-white text-xs font-bold transition-all shrink-0 active:scale-95 inline-flex items-center gap-1 cursor-pointer"
      >
        <span>Get Deal</span>
        <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
