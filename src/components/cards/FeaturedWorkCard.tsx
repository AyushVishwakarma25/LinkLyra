import React from 'react';
import { ProfileCardProps } from '../ProfileCard';
import { ProfileCardData } from '../../types';

export interface FeaturedWorkCardProps extends ProfileCardProps {
  cardData: ProfileCardData;
  handleOpenLead: (e: React.MouseEvent) => void;
}

export const FeaturedWorkCard: React.FC<FeaturedWorkCardProps> = ({
  id,
  title,
  subtitle,
  badgeText,
  featuredWork,
  interactive,
  handleOpenLead,
}) => {
  const metric = featuredWork?.resultsMetric || 'Verified Campaign Case Study';

  return (
    <div
      id={id}
      onClick={handleOpenLead}
      className={`w-full max-w-full overflow-hidden bg-[#191A1E] text-white rounded-2xl border border-white/10 p-4 sm:p-5 space-y-3 shadow-sm transition-all duration-200 select-none ${
        interactive ? 'cursor-pointer hover:border-white/20' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-stone-300 border border-white/10">
          {badgeText || 'Featured Work'}
        </span>
      </div>

      <div>
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">{subtitle}</p>
        )}
      </div>

      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
        <span className="text-stone-400 text-[11px] font-medium truncate">
          {metric}
        </span>
        <button
          type="button"
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#191A1E] text-xs font-bold transition-colors shrink-0 shadow-sm cursor-pointer"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};
