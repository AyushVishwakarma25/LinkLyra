import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { ProfileCardProps } from '../ProfileCard';
import { ProfileCardData } from '../../types';
import { getCardRadiusClass } from './CardStyles';

export interface WorkWithMeCardProps extends ProfileCardProps {
  cardData: ProfileCardData;
  handleOpenLead: (e: React.MouseEvent) => void;
}

export const WorkWithMeCard: React.FC<WorkWithMeCardProps> = ({
  id,
  title,
  subtitle,
  creatorWork,
  cardBgColor,
  cardTextColor,
  buttonStyle,
  interactive,
  onOpenBrandInquiryModal,
  cardData,
  handleOpenLead,
}) => {
  const radiusClass = getCardRadiusClass(buttonStyle);
  const status = creatorWork?.availabilityStatus || 'Available for UGC & Brand Deals';
  const deliverables = creatorWork?.deliverables || [
    'UGC Videos',
    'Reels',
    'Brand Ambassadorship',
    'Product Demos',
  ];
  const turnaround = creatorWork?.turnaroundTime || '3 - 5 Days Turnaround';

  return (
    <div
      id={id}
      onClick={(e) => {
        if (onOpenBrandInquiryModal) onOpenBrandInquiryModal(null, cardData);
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
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">{status}</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-stone-300">
          {turnaround}
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
        {title || 'Work With Me'}
      </h3>
      <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
        {subtitle || creatorWork?.pitchText || 'High-converting video creative tailored for your brand growth.'}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {deliverables.map((item, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-white/5 text-stone-200 border border-white/10"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
        <span>Inquire within 24hr response</span>
        <span className="font-bold text-white inline-flex items-center gap-1">
          Let's Collaborate <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
