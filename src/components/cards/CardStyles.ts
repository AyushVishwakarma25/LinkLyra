import { CardColor, CardStyleType } from '../../types';
import { UI_KIT } from '../../lib/ui-kit';

export const COLOR_CONFIG = UI_KIT.cardPalettes;

export const getCardRadiusClass = (curvature?: string): string => {
  if (curvature === 'square') return 'rounded-none';
  if (curvature === 'smooth') return 'rounded-xl';
  if (curvature === 'pill') return 'rounded-3xl';
  return 'rounded-2xl';
};

export const getButtonRadiusClass = (curvature?: string): string => {
  if (curvature === 'pill') return 'rounded-full';
  if (curvature === 'square') return 'rounded-none';
  if (curvature === 'smooth') return 'rounded-xl';
  return 'rounded-2xl';
};

export const getCardSurfaceClass = (
  style?: CardStyleType | string,
  fallbackTheme?: (typeof UI_KIT.cardPalettes)[CardColor],
  customBg?: string,
  customAccentColor?: string
): string => {
  if (customBg) {
    return 'border border-black/10 shadow-2xs';
  }
  if (style === 'outline') {
    return 'bg-white/90 dark:bg-[#191A1E]/80 border-2 border-black/20 dark:border-white/20 text-[#1C1E22] dark:text-white shadow-none';
  }
  if (style === 'glass') {
    return 'backdrop-blur-md bg-white/70 dark:bg-black/40 border border-white/50 dark:border-white/10 text-[#1C1E22] dark:text-white shadow-xs';
  }
  if (style === 'shadow') {
    return 'bg-white dark:bg-stone-900 border-2 border-[#1C1E22] dark:border-white text-[#1C1E22] dark:text-white shadow-[3.5px_3.5px_0px_0px_#1C1E22] dark:shadow-[3.5px_3.5px_0px_0px_#FFFFFF]';
  }
  if (style === 'soft') {
    return 'bg-black/5 dark:bg-white/10 border border-transparent text-[#1C1E22] dark:text-white shadow-none';
  }
  // Standard 'fill': if custom accent color is provided and theme is purple or default, omit bg-purple class
  if (customAccentColor && (!fallbackTheme || fallbackTheme.bgClass.includes('5E4BF7') || fallbackTheme.bgClass.includes('purple'))) {
    return 'text-white shadow-2xs border border-black/5';
  }
  return `${fallbackTheme?.bgClass || 'bg-[#5E4BF7]'} ${fallbackTheme?.textClass || 'text-white'} shadow-2xs`;
};
