import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { StarIcon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
import { ProfileCardProps } from '../ProfileCard';
import { ProfileCardData } from '../../types';
import { getCardRadiusClass } from './CardStyles';

export interface CreatorStatsCardProps extends ProfileCardProps {
  cardData: ProfileCardData;
  handleOpenLead: (e: React.MouseEvent) => void;
}

export const CreatorStatsCard: React.FC<CreatorStatsCardProps> = ({
  id,
  title,
  creatorStats,
  cardBgColor,
  cardTextColor,
  buttonStyle,
  interactive,
  onOpenMediaKitModal,
  handleOpenLead,
}) => {
  const radiusClass = getCardRadiusClass(buttonStyle);
  const ig = creatorStats?.instagramFollowers || '82K';
  const eng = creatorStats?.engagementRate || '4.8%';
  const reach = creatorStats?.monthlyReach || '1.2M';
  const niche = creatorStats?.primaryNiche || 'Tech & Lifestyle';

  return (
    <div
      id={id}
      onClick={(e) => {
        if (onOpenMediaKitModal) onOpenMediaKitModal();
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
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-white/10 text-white">
            <HugeIcon icon={StarIcon} size={16} className="w-4 h-4 text-stone-200" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
              {title || 'Creator Metrics & Reach'}
            </h3>
            <p className="text-[11px] text-stone-400">{niche} • Verified Audience</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-stone-300 border border-white/10">
          Media Kit
        </span>
      </div>

      {/* 3-Metric Stats Bento Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 py-1 text-center">
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-base sm:text-lg font-bold text-white block">{ig}</span>
          <span className="text-[10px] sm:text-xs text-stone-400 font-medium">Followers</span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-base sm:text-lg font-bold text-white block">{eng}</span>
          <span className="text-[10px] sm:text-xs text-stone-400 font-medium">Engagement</span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-base sm:text-lg font-bold text-white block">{reach}</span>
          <span className="text-[10px] sm:text-xs text-stone-400 font-medium">Reach</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
        <span>{creatorStats?.primaryDemographics || '74% Age 18-34 • High Purchasing Power'}</span>
        <span className="font-semibold text-white inline-flex items-center gap-1">
          View Kit <HugeIcon icon={ArrowUpRight01Icon} size={14} className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
