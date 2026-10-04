import React from 'react';
import { ProfileCardProps } from '../ProfileCard';
import { ProfileCardData } from '../../types';
import { getCardRadiusClass } from './CardStyles';

export interface CollaborationPackagesCardProps extends ProfileCardProps {
  cardData: ProfileCardData;
  handleOpenLead: (e: React.MouseEvent) => void;
}

export const CollaborationPackagesCard: React.FC<CollaborationPackagesCardProps> = ({
  id,
  title,
  subtitle,
  creatorPackages,
  cardBgColor,
  cardTextColor,
  buttonStyle,
  customAccentColor,
  onOpenBrandInquiryModal,
  cardData,
  handleOpenLead,
}) => {
  const radiusClass = getCardRadiusClass(buttonStyle);
  const packages = creatorPackages?.packages || [
    {
      id: '1',
      name: 'UGC Video',
      deliverables: '1x 45s High-Converting UGC Reel + Raw Hooks',
      price: '₹8,000 ($100)',
      turnaround: '3 Days',
    },
    {
      id: '2',
      name: 'Dedicated Instagram Reel',
      deliverables: '1x Sponsored Reel + Grid Post + Link in Bio',
      price: '₹15,000 ($180)',
      turnaround: '4 Days',
      isPopular: true,
    },
    {
      id: '3',
      name: 'Reel + Story Bundle',
      deliverables: '1x Dedicated Reel + 3x Stories with Link Sticker',
      price: '₹20,000 ($240)',
      turnaround: '5 Days',
    },
  ];

  return (
    <div
      id={id}
      style={{
        backgroundColor: cardBgColor || undefined,
        color: cardTextColor || undefined,
      }}
      className={`w-full max-w-full overflow-hidden ${
        cardBgColor ? 'border border-black/10' : 'bg-white text-stone-900 border border-stone-200/90'
      } ${radiusClass} p-4 sm:p-5 shadow-sm space-y-3`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900">
            {title || '💰 Collaboration Packages'}
          </h3>
          <p className="text-xs text-stone-500">
            {subtitle || 'Transparent creator rates & instant booking'}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
          Rates
        </span>
      </div>

      <div className="space-y-2.5 pt-1">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`p-3 rounded-2xl border transition-all ${
              pkg.isPopular
                ? 'border-purple-500/60 bg-purple-50/40 shadow-2xs'
                : 'border-stone-200/80 bg-stone-50/40 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm text-stone-900">{pkg.name}</span>
                  {pkg.isPopular && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-purple-600 text-white">
                      POPULAR
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">{pkg.deliverables}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-extrabold text-sm sm:text-base text-purple-950 block">{pkg.price}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenBrandInquiryModal) onOpenBrandInquiryModal(pkg, cardData);
                    else handleOpenLead(e);
                  }}
                  style={{
                    backgroundColor: customAccentColor || undefined,
                  }}
                  className="mt-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:opacity-90 text-white text-[11px] font-semibold transition-all active:scale-95 shadow-2xs cursor-pointer"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
