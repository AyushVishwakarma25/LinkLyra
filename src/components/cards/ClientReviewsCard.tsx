import React from 'react';
import { HugeIcon } from '../HugeIcon';
import { StarIcon } from '@hugeicons/core-free-icons';
import { ProfileCardProps } from '../ProfileCard';
import { getCardRadiusClass } from './CardStyles';

export const ClientReviewsCard: React.FC<ProfileCardProps> = ({
  id,
  title,
  subtitle,
  clientReview,
  cardBgColor,
  cardTextColor,
  buttonStyle,
}) => {
  const radiusClass = getCardRadiusClass(buttonStyle);
  const rating = clientReview?.rating || 5;
  const reviewText =
    clientReview?.reviewText ||
    subtitle ||
    'They helped us find our dream home in Austin $50k under budget. Highly recommended!';
  const clientName = clientReview?.clientName || title || 'Sarah & Michael M.';
  const propertyInfo = clientReview?.clientTitleOrProperty || 'Buyer • 1204 Pine Street';

  return (
    <div
      id={id}
      style={{
        backgroundColor: cardBgColor || undefined,
        color: cardTextColor || undefined,
      }}
      className={`w-full max-w-full overflow-hidden ${
        cardBgColor ? 'border border-black/10' : 'bg-stone-50 text-stone-900 border border-stone-200/80'
      } ${radiusClass} p-4 sm:p-5 shadow-2xs space-y-2.5`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: rating }).map((_, i) => (
            <HugeIcon key={i} icon={StarIcon} size={16} className="w-4 h-4 text-amber-500" />
          ))}
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
          Verified Client
        </span>
      </div>

      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
        "{reviewText}"
      </p>

      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-stone-900 block">{clientName}</span>
          <span className="text-[11px] text-stone-500">{propertyInfo}</span>
        </div>
      </div>
    </div>
  );
};
