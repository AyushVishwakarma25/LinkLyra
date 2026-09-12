import { CardColor, CanvasTheme } from '../types';

/**
 * Universal UI Kit for LinkCards
 * Central source of truth for design tokens, palettes, typography, glassmorphism, and component styling.
 */

export const UI_KIT = {
  // Brand identity
  brand: {
    name: 'LinkCards',
    tagline: 'Tactile, card-first link profiles for modern creators',
    shortName: 'LC',
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

  // Glassmorphism effect styles
  glass: {
    header: 'bg-[#ECE7DC]/75 backdrop-blur-md border-b border-black/10 shadow-2xs',
    headerDark: 'bg-[#191A1E]/80 backdrop-blur-md border-b border-white/10 shadow-md',
    headerWhite: 'bg-white/80 backdrop-blur-md border-b border-black/10 shadow-2xs',
    card: 'bg-white/70 backdrop-blur-md border border-black/10 shadow-xs',
    cardHover: 'hover:bg-white/90 hover:border-black/20 hover:shadow-md transition-all duration-200',
    modal: 'bg-[#F5F2EB]/95 backdrop-blur-xl border border-black/10 shadow-2xl',
    pill: 'bg-white/80 backdrop-blur-sm border border-black/10 text-[#1C1E22] shadow-2xs',
    footer: 'bg-[#E5DFD3]/60 backdrop-blur-md border-t border-black/10',
  },

  // Card color design tokens
  cardPalettes: {
    purple: {
      id: 'purple' as CardColor,
      name: 'Electric Purple',
      hex: '#5E4BF7',
      bgClass: 'bg-[#5E4BF7]',
      textClass: 'text-white',
      subtextClass: 'text-white/85',
      arrowBtnClass: 'bg-white text-[#1C1E22] hover:bg-white/95 shadow-sm',
      arrowIconClass: 'text-[#1C1E22]',
      badgeBgClass: 'bg-white/20 text-white',
      badgeBorderClass: 'border border-white/30',
      borderClass: 'border-[#5E4BF7]',
    },
    orange: {
      id: 'orange' as CardColor,
      name: 'Coral Orange',
      hex: '#E75646',
      bgClass: 'bg-[#E75646]',
      textClass: 'text-white',
      subtextClass: 'text-white/85',
      arrowBtnClass: 'bg-white text-[#1C1E22] hover:bg-white/95 shadow-sm',
      arrowIconClass: 'text-[#1C1E22]',
      badgeBgClass: 'bg-white/20 text-white',
      badgeBorderClass: 'border border-white/30',
      borderClass: 'border-[#E75646]',
    },
    yellow: {
      id: 'yellow' as CardColor,
      name: 'Warm Amber',
      hex: '#F8BA38',
      bgClass: 'bg-[#F8BA38]',
      textClass: 'text-[#191A1E]',
      subtextClass: 'text-[#191A1E]/80',
      arrowBtnClass: 'bg-white text-[#191A1E] hover:bg-white/95 shadow-sm',
      arrowIconClass: 'text-[#191A1E]',
      badgeBgClass: 'bg-black/10 text-[#191A1E]',
      badgeBorderClass: 'border border-black/15',
      borderClass: 'border-[#F8BA38]',
    },
    green: {
      id: 'green' as CardColor,
      name: 'Sage Mint',
      hex: '#D2EAA5',
      bgClass: 'bg-[#D2EAA5]',
      textClass: 'text-[#191A1E]',
      subtextClass: 'text-[#191A1E]/85',
      arrowBtnClass: 'bg-white text-[#191A1E] hover:bg-white/95 shadow-sm',
      arrowIconClass: 'text-[#191A1E]',
      badgeBgClass: 'bg-black/10 text-[#191A1E]',
      badgeBorderClass: 'border border-black/15',
      borderClass: 'border-[#D2EAA5]',
    },
    dark: {
      id: 'dark' as CardColor,
      name: 'Obsidian Charcoal',
      hex: '#1C1E22',
      bgClass: 'bg-[#1C1E22]',
      textClass: 'text-white',
      subtextClass: 'text-white/80',
      arrowBtnClass: 'bg-white text-[#1C1E22] hover:bg-white/95 shadow-sm',
      arrowIconClass: 'text-[#1C1E22]',
      badgeBgClass: 'bg-white/15 text-white',
      badgeBorderClass: 'border border-white/25',
      borderClass: 'border-[#1C1E22]',
    },
  },

  // Canvas Theme background mapping
  canvasThemes: {
    warm: {
      id: 'warm' as CanvasTheme,
      name: 'Warm Linen',
      bgClass: 'bg-[#F5F2EB]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
    },
    cream: {
      id: 'cream' as CanvasTheme,
      name: 'Oat Cream',
      bgClass: 'bg-[#FAF8F5]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
    },
    light: {
      id: 'light' as CanvasTheme,
      name: 'Pure White',
      bgClass: 'bg-[#FFFFFF]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
    },
    dark: {
      id: 'dark' as CanvasTheme,
      name: 'Midnight Obsidian',
      bgClass: 'bg-[#191A1E]',
      textClass: 'text-white',
      isDark: true,
    },
    clay: {
      id: 'clay' as CanvasTheme,
      name: 'Clay Stone',
      bgClass: 'bg-[#EFEBE4]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
    },
    minimal: {
      id: 'minimal' as CanvasTheme,
      name: 'Minimal Clean',
      bgClass: 'bg-[#F8F9FA]',
      textClass: 'text-[#111111]',
      isDark: false,
    },
    glass: {
      id: 'glass' as CanvasTheme,
      name: 'Glass Frost',
      bgClass: 'bg-gradient-to-b from-[#EAE6DF] to-[#DFD8CD]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
    },
    creator: {
      id: 'creator' as CanvasTheme,
      name: 'Creator Burst',
      bgClass: 'bg-[#FFF8F6]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
    },
    business: {
      id: 'business' as CanvasTheme,
      name: 'Emerald Business',
      bgClass: 'bg-[#F2FBF6]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
    },
    portfolio: {
      id: 'portfolio' as CanvasTheme,
      name: 'Portfolio Gold',
      bgClass: 'bg-[#FFFDF5]',
      textClass: 'text-[#1C1E22]',
      isDark: false,
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

  // Layout Radii Standards
  radii: {
    card: 'rounded-[24px]',
    canvas: 'rounded-[28px] sm:rounded-[36px]',
    modal: 'rounded-[28px] sm:rounded-[32px]',
    pill: 'rounded-full',
    input: 'rounded-xl',
  },
};

export type CardPalette = typeof UI_KIT.cardPalettes[CardColor];
export type CanvasThemeConfig = typeof UI_KIT.canvasThemes[CanvasTheme];
