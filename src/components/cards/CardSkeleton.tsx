import React from 'react';
import { getCardRadiusClass } from './CardStyles';

export interface CardSkeletonProps {
  buttonStyle?: 'rounded' | 'square' | 'pill' | 'glass' | 'smooth';
  heightClass?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  buttonStyle = 'rounded',
  heightClass = 'h-16',
}) => {
  const radius = getCardRadiusClass(buttonStyle);

  return (
    <div
      className={`w-full ${heightClass} ${radius} bg-black/5 dark:bg-white/10 animate-pulse border border-black/5 flex items-center justify-between p-3.5 sm:p-4`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 w-3/4">
        <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/20 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-black/10 dark:bg-white/20 rounded-md w-2/3" />
          <div className="h-2.5 bg-black/5 dark:bg-white/10 rounded-md w-1/2" />
        </div>
      </div>
      <div className="w-16 h-7 rounded-full bg-black/10 dark:bg-white/20 shrink-0" />
    </div>
  );
};
