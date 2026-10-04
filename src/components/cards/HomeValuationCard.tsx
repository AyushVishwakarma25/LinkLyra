import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { CalculatorIcon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { ProfileCardProps } from '../ProfileCard';
import { getCardRadiusClass } from './CardStyles';

export interface HomeValuationCardProps extends ProfileCardProps {
  handleOpenLead: (e: React.MouseEvent) => void;
}

export const HomeValuationCard: React.FC<HomeValuationCardProps> = ({
  id,
  title,
  subtitle,
  cardBgColor,
  cardTextColor,
  buttonStyle,
  interactive,
  onOpenValuationModal,
  handleOpenLead,
}) => {
  const radiusClass = getCardRadiusClass(buttonStyle);

  return (
    <div
      id={id}
      onClick={(e) => {
        if (onOpenValuationModal) onOpenValuationModal();
        else handleOpenLead(e);
      }}
      style={{
        backgroundColor: cardBgColor || undefined,
        color: cardTextColor || undefined,
      }}
      className={`w-full max-w-full overflow-hidden ${
        cardBgColor ? 'border border-black/10' : 'bg-[#191A1E] text-white border border-white/10'
      } ${radiusClass} p-4 sm:p-5 shadow-sm transition-all duration-200 select-none ${
        interactive ? 'cursor-pointer hover:border-white/20' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-stone-300 border border-white/10">
          Free Market Analysis
        </span>
        <HugeIcon icon={CalculatorIcon} size={16} className="w-4 h-4 text-stone-300" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
        {title || "What's Your Home Worth?"}
      </h3>
      <p className="text-xs text-stone-400 mt-1 leading-relaxed">
        {subtitle || 'Get a complimentary, no-obligation Comparative Market Analysis (CMA) report.'}
      </p>

      <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
        <span>Instant MLS Neighborhood Comps</span>
        <span className="font-bold text-white inline-flex items-center gap-1">
          Get Free Report <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
