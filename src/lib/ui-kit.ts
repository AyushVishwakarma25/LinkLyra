import { CardColor, CanvasTheme } from '../types';

/**
 * Universal UI Kit for LinkCards
 * Central source of truth for design tokens, palettes, typography, glassmorphism, and component styling.
 */

export const UI_KIT = {
  // Brand identity
  brand: {
    name: 'LinkLyra',
    tagline: 'The modular, high-converting bio page for modern creators',
    shortName: 'LL',
    version: '2.0',
  },

  // Base canvas colors & neutrals
  colors: {
    canvas: '#ECE7DC',
    canvasWarm: '#F5F2EB',
    canvasCream: '#FAF8F5',
    canvasLight: '#FFFFFF',
    canvasDark: '#191A1E',
    canvasClay: '#EFEBE4',
    
    // Core text tones
    textDark: '#1C1E22',
    textMuted: '#737882',
    textLight: '#FFFFFF',
    textLightMuted: 'rgba(255, 255, 255, 0.75)',

    // Accent colors
    accentPurple: '#5E4BF7',
    accentCoral: '#E75646',
    accentYellow: '#F8BA38',
    accentSage: '#D2EAA5',
    accentEmerald: '#10B981',
  },

  // Clean architectural styling without heavy glassmorphism or AI blobs
  glass: {
    header: 'bg-[#ECE7DC] border-b border-black/10',
    headerDark: 'bg-[#191A1E] border-b border-white/10',
    headerWhite: 'bg-white border-b border-black/10',
    card: 'bg-white border border-black/10 shadow-2xs',
    cardHover: 'hover:border-black/20 hover:shadow-xs transition-all duration-150',
    modal: 'bg-[#F4F0E8] border border-black/10 shadow-xl',
    pill: 'bg-white border border-black/10 text-[#1C1E22]',
    footer: 'bg-transparent border-t border-black/5',
  },

  // Card color design tokens - Clean, non-gradient editorial palettes
  cardPalettes: {
    purple: {
      id: 'purple' as CardColor,
      name: 'Royal Indigo',
      hex: '#584CE4',
      bgClass: 'bg-[#584CE4]',
      textClass: 'text-white',
      subtextClass: 'text-white/85',
      arrowBtnClass: 'bg-white text-[#584CE4] hover:bg-stone-100',
      arrowIconClass: 'text-[#584CE4]',
      badgeBgClass: 'bg-white/20 text-white',
      badgeBorderClass: 'border border-white/25',
      borderClass: 'border-[#584CE4]',
    },
    orange: {
      id: 'orange' as CardColor,
      name: 'Editorial Rust',
      hex: '#D95338',
      bgClass: 'bg-[#D95338]',
      textClass: 'text-white',
      subtextClass: 'text-white/85',
      arrowBtnClass: 'bg-white text-[#D95338] hover:bg-stone-100',
      arrowIconClass: 'text-[#D95338]',
      badgeBgClass: 'bg-white/20 text-white',
      badgeBorderClass: 'border border-white/25',
      borderClass: 'border-[#D95338]',
    },
    yellow: {
      id: 'yellow' as CardColor,
      name: 'Warm Ochre',
      hex: '#EAB308',
      bgClass: 'bg-[#EAB308]',
      textClass: 'text-[#191A1E]',
      subtextClass: 'text-[#191A1E]/80',
      arrowBtnClass: 'bg-white text-[#191A1E] hover:bg-stone-100',
      arrowIconClass: 'text-[#191A1E]',
      badgeBgClass: 'bg-black/10 text-[#191A1E]',
      badgeBorderClass: 'border border-black/15',
      borderClass: 'border-[#EAB308]',
    },
    green: {
      id: 'green' as CardColor,
      name: 'Tactile Olive',
      hex: '#2E694D',
      bgClass: 'bg-[#2E694D]',
      textClass: 'text-white',
      subtextClass: 'text-white/85',
      arrowBtnClass: 'bg-white text-[#2E694D] hover:bg-stone-100',
      arrowIconClass: 'text-[#2E694D]',
      badgeBgClass: 'bg-white/20 text-white',
      badgeBorderClass: 'border border-white/25',
      borderClass: 'border-[#2E694D]',
    },
    dark: {
      id: 'dark' as CardColor,
      name: 'Matte Charcoal',
      hex: '#202428',
      bgClass: 'bg-[#202428] border border-white/10',
      textClass: 'text-white',
      subtextClass: 'text-stone-300',
      arrowBtnClass: 'bg-white text-[#1C1E22] hover:bg-stone-100',
      arrowIconClass: 'text-[#1C1E22]',
      badgeBgClass: 'bg-white/10 text-stone-200',
      badgeBorderClass: 'border border-white/15',
      borderClass: 'border-white/10',
    },
    stone: {
      id: 'stone' as CardColor,
      name: 'Modern Stone',
      hex: '#78716C',
      bgClass: 'bg-[#78716C]',
      textClass: 'text-white',
      subtextClass: 'text-white/85',
      arrowBtnClass: 'bg-white text-[#78716C] hover:bg-stone-100',
      arrowIconClass: 'text-[#78716C]',
      badgeBgClass: 'bg-white/20 text-white',
      badgeBorderClass: 'border border-white/25',
      borderClass: 'border-[#78716C]',
    },
    rose: {
      id: 'rose' as CardColor,
      name: 'Rose Blush',
      hex: '#E11D48',
      bgClass: 'bg-[#E11D48]',
      textClass: 'text-white',
      subtextClass: 'text-white/85',
      arrowBtnClass: 'bg-white text-[#E11D48] hover:bg-stone-100',
      arrowIconClass: 'text-[#E11D48]',
      badgeBgClass: 'bg-white/20 text-white',
      badgeBorderClass: 'border border-white/25',
      borderClass: 'border-[#E11D48]',
    },
    amber: {
      id: 'amber' as CardColor,
      name: 'Amber Glow',
      hex: '#D97706',
      bgClass: 'bg-[#D97706]',
      textClass: 'text-white',
      subtextClass: 'text-white/85',
      arrowBtnClass: 'bg-white text-[#D97706] hover:bg-stone-100',
      arrowIconClass: 'text-[#D97706]',
      badgeBgClass: 'bg-white/20 text-white',
      badgeBorderClass: 'border border-white/25',
      borderClass: 'border-[#D97706]',
    },
    blue: {
      id: 'blue' as CardColor,
      name: 'Ocean Cobalt',
      hex: '#2563EB',
      bgClass: 'bg-[#2563EB]',
      textClass: 'text-white',
      subtextClass: 'text-white/85',
      arrowBtnClass: 'bg-white text-[#2563EB] hover:bg-stone-100',
      arrowIconClass: 'text-[#2563EB]',
      badgeBgClass: 'bg-white/20 text-white',
      badgeBorderClass: 'border border-white/25',
      borderClass: 'border-[#2563EB]',
    },
  },

  // Canvas Theme background mapping (5 Free Starter Themes, 5 Pro Creator Themes)
  canvasThemes: {
    warm: {
      id: 'warm' as CanvasTheme,
      name: 'Warm Linen',
      bgClass: 'bg-[#F5F2EB]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
      isPro: false,
    },
    cream: {
      id: 'cream' as CanvasTheme,
      name: 'Oat Cream',
      bgClass: 'bg-[#FAF8F5]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
      isPro: false,
    },
    light: {
      id: 'light' as CanvasTheme,
      name: 'Pure White',
      bgClass: 'bg-[#FFFFFF]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
      isPro: false,
    },
    dark: {
      id: 'dark' as CanvasTheme,
      name: 'Midnight Obsidian',
      bgClass: 'bg-[#191A1E]',
      textClass: 'text-white',
      isDark: true,
      isPro: false,
    },
    clay: {
      id: 'clay' as CanvasTheme,
      name: 'Clay Stone',
      bgClass: 'bg-[#EFEBE4]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
      isPro: false,
    },
    minimal: {
      id: 'minimal' as CanvasTheme,
      name: 'Minimal Clean',
      bgClass: 'bg-[#F8F9FA]',
      textClass: 'text-[#111111]',
      isDark: false,
      isPro: true,
    },
    glass: {
      id: 'glass' as CanvasTheme,
      name: 'Glass Frost',
      bgClass: 'bg-gradient-to-b from-[#EAE6DF] to-[#DFD8CD]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
      isPro: true,
    },
    creator: {
      id: 'creator' as CanvasTheme,
      name: 'Sunset Coral',
      bgClass: 'bg-[#FFF8F6]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
      isPro: true,
    },
    business: {
      id: 'business' as CanvasTheme,
      name: 'Emerald Business',
      bgClass: 'bg-[#F2FBF6]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
      isPro: true,
    },
    portfolio: {
      id: 'portfolio' as CanvasTheme,
      name: 'Champagne Gold',
      bgClass: 'bg-[#FFFDF5]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
      isPro: true,
    },
  },

  // Reusable button classes
  buttons: {
    primary:
      'bg-[#1C1E22] hover:bg-black text-white px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5',
    purple:
      'bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1.5',
    secondary:
      'bg-white hover:bg-black/5 text-[#1C1E22] border border-black/10 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5',
    ghost:
      'hover:bg-black/5 text-[#737882] hover:text-[#1C1E22] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1',
    pill:
      'bg-white/80 hover:bg-white text-[#1C1E22] border border-black/10 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5',
  },

  // Layout Radii Standards - Restrained, clean, editorial
  radii: {
    card: 'rounded-2xl',
    canvas: 'rounded-2xl sm:rounded-3xl',
    modal: 'rounded-2xl',
    pill: 'rounded-full',
    input: 'rounded-xl',
  },
};

export type CardPalette = typeof UI_KIT.cardPalettes[CardColor];
export type CanvasThemeConfig = typeof UI_KIT.canvasThemes[CanvasTheme];
