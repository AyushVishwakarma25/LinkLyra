import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  Sparkles,
  Palette,
  Layers,
  Type,
  Square,
  Image as ImageIcon,
  Check,
  Lock,
  Crown,
  ArrowLeft,
  Sliders,
  SlidersHorizontal,
  Flame,
  Star,
  Rocket,
  Coffee,
  Briefcase,
  Music,
  Radio,
  Eye,
  Upload,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import {
  UserProfile,
  CanvasTheme,
  CardStyleType,
  WallpaperMode,
  FooterSettings,
} from '../types';
import { UI_KIT } from '../lib/ui-kit';
import { uploadImageToStorage } from '../lib/storage';

export interface DesignSettingsPanelProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onManualSave?: () => Promise<void> | void;
  onOpenProModal?: (feature?: string) => void;
  onOpenOnboarding?: () => void;
}

export type DesignSubView =
  | 'menu'
  | 'templates'
  | 'theme'
  | 'wallpaper'
  | 'buttons'
  | 'text'
  | 'colors'
  | 'stickers'
  | 'footer';

// Preset font options with Space Mono leading
export const FONT_OPTIONS: Array<{
  id: string;
  name: string;
  preview: string;
  family: string;
  desc: string;
}> = [
  {
    id: 'Space Mono',
    name: 'Space Mono',
    preview: 'Aα Space 123',
    family: "'Space Mono', monospace",
    desc: 'Editorial retro-tech monospace',
  },
  {
    id: 'Plus Jakarta Sans',
    name: 'Plus Jakarta Sans',
    preview: 'Aα Modern',
    family: "'Plus Jakarta Sans', sans-serif",
    desc: 'Clean, modern geometrical grotesque',
  },
  {
    id: 'Inter',
    name: 'Inter',
    preview: 'Aα Neutral',
    family: "'Inter', sans-serif",
    desc: 'Hyper-legible interface typography',
  },
  {
    id: 'Playfair Display',
    name: 'Playfair Display',
    preview: 'Aα Editorial',
    family: "'Playfair Display', serif",
    desc: 'High-contrast luxury serif',
  },
  {
    id: 'Syne',
    name: 'Syne',
    preview: 'Aα Expressive',
    family: "'Syne', sans-serif",
    desc: 'Avant-garde bold display weight',
  },
];

// Curated themes
export const THEME_OPTIONS: Array<{
  id: CanvasTheme;
  name: string;
  hex: string;
  desc: string;
  isPro: boolean;
}> = [
  { id: 'warm', name: 'Warm Linen', hex: '#F5F2EB', desc: 'Tactile contrast & warm paper tone', isPro: false },
  { id: 'cream', name: 'Alabaster Cream', hex: '#FAF8F5', desc: 'Soft neutral for personal brands', isPro: false },
  { id: 'light', name: 'Studio White', hex: '#FFFFFF', desc: 'Minimalist clean gallery canvas', isPro: false },
  { id: 'clay', name: 'Warm Clay', hex: '#EFEBE4', desc: 'Muted architectural tone', isPro: false },
  { id: 'dark', name: 'Midnight Obsidian', hex: '#191A1E', desc: 'High-contrast midnight dark mode', isPro: false },
  { id: 'minimal', name: 'Minimal Smoke', hex: '#F3F4F6', desc: 'Neutral tech gray canvas', isPro: true },
  { id: 'glass', name: 'Frosted Glass', hex: '#E2E8F0', desc: 'Translucent glassmorphism', isPro: true },
  { id: 'creator', name: 'Electric Lilac', hex: '#FAF5FF', desc: 'Vibrant pop creator backdrop', isPro: true },
  { id: 'business', name: 'Navy Executive', hex: '#0F172A', desc: 'Authority navy executive palette', isPro: true },
  { id: 'portfolio', name: 'Emerald Forest', hex: '#064E3B', desc: 'Rich emerald green canvas', isPro: true },
];

// Card & Button Style options
export const CARD_STYLE_OPTIONS: Array<{
  id: CardStyleType;
  name: string;
  desc: string;
  previewClass: string;
}> = [
  {
    id: 'fill',
    name: 'Fill',
    desc: 'Solid colored surface with soft shadow',
    previewClass: 'bg-[#1C1E22] text-white',
  },
  {
    id: 'outline',
    name: 'Outline',
    desc: 'Clean 2px hairline border with transparent body',
    previewClass: 'bg-white text-[#1C1E22] border-2 border-black/20',
  },
  {
    id: 'glass',
    name: 'Glass',
    desc: 'Translucent frosted glass with blurred background',
    previewClass: 'bg-white/60 backdrop-blur-md text-[#1C1E22] border border-black/10',
  },
  {
    id: 'shadow',
    name: 'Hard Shadow',
    desc: 'Neo-brutalist pop offset shadow',
    previewClass: 'bg-white text-[#1C1E22] border-2 border-black shadow-[3px_3px_0px_#000]',
  },
  {
    id: 'soft',
    name: 'Soft',
    desc: 'Gentle pastel card tint with seamless edges',
    previewClass: 'bg-black/5 text-[#1C1E22]',
  },
];

// Button Curvature options
export const BUTTON_CURVATURE_OPTIONS: Array<{
  id: 'rounded' | 'pill' | 'square' | 'smooth';
  name: string;
  desc: string;
  radiusClass: string;
}> = [
  { id: 'rounded', name: 'Rounded', desc: 'Standard 16px radius', radiusClass: 'rounded-2xl' },
  { id: 'pill', name: 'Pill', desc: 'Full stadium pill curvature', radiusClass: 'rounded-full' },
  { id: 'smooth', name: 'Smooth', desc: 'Subtle 12px squircle', radiusClass: 'rounded-xl' },
  { id: 'square', name: 'Square', desc: 'Crisp geometric corners', radiusClass: 'rounded-none' },
];

// Wallpaper mode options
export const WALLPAPER_OPTIONS: Array<{
  id: WallpaperMode;
  name: string;
  desc: string;
  previewBg: string;
}> = [
  { id: 'image', name: 'Custom Photo', desc: 'Upload your own image or choose a photography preset', previewBg: 'linear-gradient(45deg, #1C1E22, #5E4BF7)' },
  { id: 'blur', name: 'Blur', desc: 'Ambient organic frosted blur with floating depth', previewBg: 'radial-gradient(circle at top left, #C4B5FD, #FDE68A, #F5F2EB)' },
  { id: 'solid', name: 'Solid', desc: 'Single refined high-contrast flat color', previewBg: '#F5F2EB' },
  { id: 'gradient', name: 'Gradient', desc: 'Modern subtle linear gradient flow', previewBg: 'linear-gradient(135deg, #FAF8F5 0%, #E8E2D5 100%)' },
  { id: 'mesh', name: 'Mesh Aurora', desc: 'Multi-point vibrant mesh gradient glow', previewBg: 'radial-gradient(at 0% 0%, #A78BFA 0px, transparent 50%), radial-gradient(at 100% 100%, #F472B6 0px, transparent 50%), #FAF8F5' },
  { id: 'pattern', name: 'Pattern', desc: 'Subtle architectural dot matrix grid', previewBg: 'radial-gradient(#1C1E22 1px, transparent 1px)' },
];

// Curated high-resolution photography wallpaper presets
export const WALLPAPER_PRESETS = [
  {
    name: 'Minimal Botanical',
    tag: 'Flora',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=160&auto=format&fit=crop&q=60',
  },
  {
    name: 'Neon Cyber',
    tag: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=160&auto=format&fit=crop&q=60',
  },
  {
    name: 'Deep Aurora',
    tag: 'Cosmic',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=160&auto=format&fit=crop&q=60',
  },
  {
    name: 'Golden Dunes',
    tag: 'Desert',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=160&auto=format&fit=crop&q=60',
  },
  {
    name: 'Warm Studio',
    tag: 'Loft',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=160&auto=format&fit=crop&q=60',
  },
  {
    name: 'Obsidian Abstract',
    tag: 'Luxury',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=60',
  },
];

// Preset Accent Colors
export const ACCENT_COLOR_PALETTES = [
  { hex: '#5E4BF7', name: 'LinkLyra Purple' },
  { hex: '#1C1E22', name: 'Obsidian Black' },
  { hex: '#7C3AED', name: 'Royal Violet' },
  { hex: '#10B981', name: 'Emerald Green' },
  { hex: '#0EA5E9', name: 'Sky Blue' },
  { hex: '#F43F5E', name: 'Rose Coral' },
  { hex: '#F59E0B', name: 'Amber Gold' },
  { hex: '#E75646', name: 'Sunset Terracotta' },
];

// Available Sticker Badges
export const STICKER_PRESETS = [
  { id: 'trending', label: '🔥 Trending Creator', icon: Flame },
  { id: 'verified', label: '✨ Verified Member', icon: Sparkles },
  { id: 'featured', label: '⭐ Top Pick', icon: Star },
  { id: 'new', label: '🚀 Just Dropped', icon: Rocket },
  { id: 'hire', label: '⚡ Available For Hire', icon: Briefcase },
  { id: 'coffee', label: '☕ Buy Me A Coffee', icon: Coffee },
  { id: 'music', label: '🎵 New Track Live', icon: Music },
  { id: 'podcast', label: '🎙️ Latest Episode', icon: Radio },
];

export const DesignSettingsPanel: React.FC<DesignSettingsPanelProps> = ({
  profile,
  onUpdateProfile,
  onManualSave,
  onOpenProModal,
  onOpenOnboarding,
}) => {
  const [subView, setSubView] = useState<DesignSubView>('menu');

  // Wallpaper upload state & ref
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingWallpaper, setIsUploadingWallpaper] = useState(false);
  const [wallpaperUploadError, setWallpaperUploadError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleWallpaperFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setWallpaperUploadError('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setWallpaperUploadError('Image exceeds 2MB. Please upload an image under 2MB for fast loading.');
      return;
    }

    setWallpaperUploadError(null);
    setIsUploadingWallpaper(true);

    try {
      const url = await uploadImageToStorage(file, 'wallpaper');
      applyChange({
        wallpaperMode: 'image',
        backgroundValue: url,
        backgroundType: 'image',
        wallpaperTint: profile.wallpaperTint ?? 25,
      });
    } catch (err: any) {
      console.warn('Direct storage upload error, using instant data URL fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          applyChange({
            wallpaperMode: 'image',
            backgroundValue: result,
            backgroundType: 'image',
            wallpaperTint: profile.wallpaperTint ?? 25,
          });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingWallpaper(false);
    }
  };

  const applyChange = (changes: Partial<UserProfile>) => {
    onUpdateProfile(changes);
  };

  // Human readable labels for the main menu rows
  const currentThemeObj = THEME_OPTIONS.find((t) => t.id === (profile.theme || 'warm'));
  const currentThemeLabel = currentThemeObj ? currentThemeObj.name : 'Custom';
  const currentWallpaperLabel =
    profile.wallpaperMode === 'blur' || !profile.wallpaperMode
      ? 'Blur'
      : profile.wallpaperMode === 'gradient'
      ? 'Gradient'
      : profile.wallpaperMode === 'mesh'
      ? 'Mesh'
      : profile.wallpaperMode === 'pattern'
      ? 'Pattern'
      : 'Solid';

  const currentButtonLabel =
    profile.cardStyle === 'fill' || !profile.cardStyle
      ? 'Fill'
      : profile.cardStyle === 'outline'
      ? 'Outline'
      : profile.cardStyle === 'glass'
      ? 'Glass'
      : profile.cardStyle === 'shadow'
      ? 'Hard Shadow'
      : 'Soft';

  const currentFontLabel = profile.fontFamily || 'Space Mono';

  // =========================================================================
  // SUBVIEW 1: THEMES
  // =========================================================================
  if (subView === 'theme') {
    return (
      <div className="space-y-4">
        {/* Back header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <button
            type="button"
            onClick={() => setSubView('menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1E22] hover:text-[#5E4BF7] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Design</span>
          </button>
          <span className="text-xs font-semibold text-[#737882]">Choose Theme</span>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#1C1E22]">Canvas Themes</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            Select a curated design system palette that configures wallpaper, card surfaces, and text harmony.
          </p>
        </div>

        <div className="space-y-2">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = (profile.theme || 'warm') === theme.id;
            const isProUser = profile.plan === 'pro' || profile.plan === 'business' || profile.plan === 'agency';
            const isLocked = theme.isPro && !isProUser;

            return (
              <div
                key={theme.id}
                onClick={() => {
                  if (isLocked && onOpenProModal) {
                    onOpenProModal(`Pro Theme: ${theme.name}`);
                  } else {
                    applyChange({ theme: theme.id });
                  }
                }}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white shadow-xs'
                    : 'border-black/10 bg-white hover:border-black/25'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-8 h-8 rounded-xl border border-black/15 shadow-2xs shrink-0"
                    style={{ backgroundColor: theme.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-[#1C1E22] truncate">{theme.name}</span>
                      {theme.isPro ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-[#7C3AED]/10 text-[#7C3AED] font-black text-[9px]">
                          <Crown className="w-2.5 h-2.5" />
                          <span>PRO</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                          FREE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#737882] truncate">{theme.desc}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isLocked ? (
                    <div className="p-1 rounded-lg bg-black/5 text-[#737882]">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  ) : isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUBVIEW 2: WALLPAPER
  // =========================================================================
  if (subView === 'wallpaper') {
    const isImageMode = profile.wallpaperMode === 'image' || Boolean(profile.backgroundValue);
    const currentTint = typeof profile.wallpaperTint === 'number' ? profile.wallpaperTint : 20;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <button
            type="button"
            onClick={() => setSubView('menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1E22] hover:text-[#5E4BF7] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Design</span>
          </button>
          <span className="text-xs font-semibold text-[#737882]">Wallpaper</span>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#1C1E22]">Background Wallpaper</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            Select a stylish backdrop pattern, frosted glass blur, or upload your own photo.
          </p>
        </div>

        {/* Wallpaper Modes Grid */}
        <div className="grid grid-cols-1 gap-2">
          {WALLPAPER_OPTIONS.map((wp) => {
            const isSelected = (profile.wallpaperMode || 'blur') === wp.id;
            return (
              <div
                key={wp.id}
                onClick={() => {
                  if (wp.id === 'image') {
                    applyChange({ wallpaperMode: 'image', backgroundType: 'image' });
                  } else {
                    applyChange({ wallpaperMode: wp.id });
                  }
                }}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white shadow-xs'
                    : 'border-black/10 bg-white hover:border-black/25'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl border border-black/10 shrink-0 shadow-2xs overflow-hidden flex items-center justify-center relative bg-stone-100">
                    {wp.id === 'image' && profile.backgroundValue ? (
                      <img
                        src={profile.backgroundValue}
                        alt="Wallpaper Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : wp.id === 'image' ? (
                      <div className="w-full h-full bg-gradient-to-tr from-[#1C1E22] to-[#5E4BF7] flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-white drop-shadow-xs" />
                      </div>
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ background: wp.previewBg }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#1C1E22] flex items-center gap-1.5">
                      <span>{wp.name}</span>
                      {wp.id === 'image' && (
                        <span className="px-1.5 py-0.2 rounded bg-[#5E4BF7]/10 text-[#5E4BF7] font-bold text-[9px]">
                          Upload
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#737882] leading-tight">{wp.desc}</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Wallpaper Upload Area */}
        {(profile.wallpaperMode === 'image' || isImageMode) && (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1C1E22] uppercase tracking-wider">
                  Custom Wallpaper Photo
                </h4>
                <p className="text-[11px] text-[#737882]">
                  Upload high-res portrait photography or branding graphics.
                </p>
              </div>
              {profile.backgroundValue && (
                <button
                  type="button"
                  onClick={() => {
                    applyChange({
                      wallpaperMode: 'blur',
                      backgroundValue: undefined,
                      backgroundType: undefined,
                    });
                  }}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={wallpaperInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleWallpaperFile(file);
                }
              }}
            />

            {/* Drag & Drop Upload Target */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  handleWallpaperFile(file);
                }
              }}
              onClick={() => wallpaperInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDraggingOver
                  ? 'border-[#5E4BF7] bg-[#5E4BF7]/5'
                  : 'border-black/15 bg-white hover:border-[#5E4BF7]/60 hover:bg-stone-50/80'
              }`}
            >
              {isUploadingWallpaper ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <RefreshCw className="w-6 h-6 text-[#5E4BF7] animate-spin" />
                  <span className="text-xs font-bold text-[#1C1E22]">Processing photo...</span>
                </div>
              ) : profile.backgroundValue ? (
                <div className="flex items-center gap-3 w-full text-left">
                  <img
                    src={profile.backgroundValue}
                    alt="Active Wallpaper"
                    referrerPolicy="no-referrer"
                    className="w-14 h-16 rounded-xl object-cover border border-black/10 shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#1C1E22]">Active Wallpaper</span>
                      <span className="text-[10px] font-bold text-[#1C1E22] bg-black/5 px-1.5 py-0.5 rounded border border-black/10">
                        Live in Preview
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737882] mt-0.5">
                      Click anywhere on this box to replace with a new image.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#5E4BF7]/10 flex items-center justify-center text-[#5E4BF7]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1C1E22]">
                      Click to upload wallpaper
                    </span>{' '}
                    <span className="text-xs text-[#737882]">or drag & drop</span>
                  </div>
                  <p className="text-[11px] text-[#737882]">
                    PNG, JPG, or WebP up to 2MB (compressed automatically)
                  </p>
                </>
              )}
            </div>

            {wallpaperUploadError && (
              <p className="text-xs font-medium text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                {wallpaperUploadError}
              </p>
            )}

            {/* Recommended Image Size Guidelines Callout */}
            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-black/10 space-y-1 text-[#1C1E22]">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#1C1E22]">
                <Sparkles className="w-3.5 h-3.5 text-[#1C1E22] shrink-0" />
                <span>Recommended Wallpaper Size</span>
              </div>
              <p className="text-[11px] text-[#737882] leading-relaxed">
                <strong className="text-[#1C1E22]">1080 × 1920 px (9:16 portrait)</strong> for standard mobile devices, or at least <strong className="text-[#1C1E22]">1200 px width</strong> for desktop viewports.
              </p>
              <p className="text-[10px] text-[#737882]">
                Pro tip: Use the Tint Overlay slider below to darken bright photos and keep cards readable.
              </p>
            </div>

            {/* Photography Wallpaper Presets */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-[#1C1E22] uppercase tracking-wider">
                Or Choose A Curated Photography Preset
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WALLPAPER_PRESETS.map((preset) => {
                  const isPresetActive = profile.backgroundValue === preset.url;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        applyChange({
                          wallpaperMode: 'image',
                          backgroundValue: preset.url,
                          backgroundType: 'image',
                          wallpaperTint: profile.wallpaperTint ?? 30,
                        })
                      }
                      className={`group relative rounded-xl overflow-hidden border text-left transition-all cursor-pointer aspect-3/4 flex flex-col justify-end p-2 ${
                        isPresetActive
                          ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/30 shadow-md'
                          : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      <img
                        src={preset.thumb}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="relative z-10">
                        <span className="text-[9px] font-bold text-white/75 uppercase tracking-wide block">
                          {preset.tag}
                        </span>
                        <span className="text-[11px] font-bold text-white leading-tight block truncate">
                          {preset.name}
                        </span>
                      </div>
                      {isPresetActive && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-xs z-10">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Real-time Wallpaper Dimming & Contrast Tint Slider */}
        <div className="p-4 bg-white rounded-2xl border border-black/10 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1C1E22] uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#5E4BF7]" />
                <span>Wallpaper Contrast Tint</span>
              </h4>
              <p className="text-[11px] text-[#737882]">
                Darkens backdrop overlay in real time for optimal card readability.
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-stone-100 text-[#1C1E22] border border-black/5">
              {currentTint}%
            </span>
          </div>

          {/* Quick Tint Presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: '0% None', val: 0 },
              { label: '20% Soft', val: 20 },
              { label: '40% Balanced', val: 40 },
              { label: '60% Deep', val: 60 },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => applyChange({ wallpaperTint: preset.val })}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  currentTint === preset.val
                    ? 'bg-[#1C1E22] text-white border-black shadow-xs'
                    : 'bg-stone-50 text-[#737882] border-black/10 hover:bg-stone-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Continuous Range Slider */}
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min="0"
              max="85"
              step="5"
              value={currentTint}
              onChange={(e) => applyChange({ wallpaperTint: Number(e.target.value) })}
              className="w-full accent-[#5E4BF7] h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#737882] px-0.5 font-medium">
              <span>0% (Transparent)</span>
              <span>40% (Recommended)</span>
              <span>85% (Max Dark)</span>
            </div>
          </div>
        </div>

        {/* Ambient Blur Mode Enhancer if Blur is selected */}
        {(profile.wallpaperMode === 'blur' || !profile.wallpaperMode) && (
          <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200/70 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-purple-950">
              <span>Frosted Blur Ambient Glass</span>
              <span className="text-purple-700 font-bold text-[11px]">Active</span>
            </div>
            <p className="text-[11px] text-purple-900/80 leading-relaxed">
              Renders floating organic ambient blurs with layered backdrop-filter for depth.
            </p>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // SUBVIEW 3: BUTTONS & CARDS
  // =========================================================================
  if (subView === 'buttons') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <button
            type="button"
            onClick={() => setSubView('menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1E22] hover:text-[#5E4BF7] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Design</span>
          </button>
          <span className="text-xs font-semibold text-[#737882]">Buttons & Cards</span>
        </div>

        {/* 1. Card Surface Fill Style */}
        <div className="space-y-2">
          <div>
            <h3 className="text-xs font-bold text-[#1C1E22] uppercase tracking-wider">Card Surface Style</h3>
            <p className="text-[11px] text-[#737882]">Select the overall physical treatment of cards</p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {CARD_STYLE_OPTIONS.map((style) => {
              const isSelected = (profile.cardStyle || 'fill') === style.id;
              return (
                <div
                  key={style.id}
                  onClick={() => applyChange({ cardStyle: style.id })}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white shadow-xs'
                      : 'border-black/10 bg-white hover:border-black/25'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 ${style.previewClass}`}
                    >
                      Aa
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#1C1E22]">{style.name}</div>
                      <div className="text-[11px] text-[#737882]">{style.desc}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Corner Curvature */}
        <div className="space-y-2 pt-3 border-t border-black/5">
          <div>
            <h3 className="text-xs font-bold text-[#1C1E22] uppercase tracking-wider">Corner Curvature</h3>
            <p className="text-[11px] text-[#737882]">Adjust button & card border radius</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {BUTTON_CURVATURE_OPTIONS.map((curve) => {
              const isSelected = (profile.buttonStyle || 'rounded') === curve.id;
              return (
                <button
                  key={curve.id}
                  type="button"
                  onClick={() => applyChange({ buttonStyle: curve.id })}
                  className={`p-3 border text-left transition-all ${curve.radiusClass} cursor-pointer ${
                    isSelected
                      ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white shadow-xs'
                      : 'border-black/10 bg-white/80 hover:bg-white text-[#737882]'
                  }`}
                >
                  <div className="text-xs font-bold text-[#1C1E22]">{curve.name}</div>
                  <div className="text-[10px] text-[#737882] mt-0.5">{curve.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUBVIEW 4: TEXT / TYPOGRAPHY
  // =========================================================================
  if (subView === 'text') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <button
            type="button"
            onClick={() => setSubView('menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1E22] hover:text-[#5E4BF7] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Design</span>
          </button>
          <span className="text-xs font-semibold text-[#737882]">Typography</span>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#1C1E22]">Display Font Pairing</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            Choose your signature font for titles, cards, and buttons.
          </p>
        </div>

        <div className="space-y-2">
          {FONT_OPTIONS.map((font) => {
            const isSelected = (profile.fontFamily || 'Space Mono') === font.id;
            return (
              <div
                key={font.id}
                onClick={() => applyChange({ fontFamily: font.id })}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white shadow-xs'
                    : 'border-black/10 bg-white hover:border-black/25'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-bold text-[#1C1E22]"
                    style={{ fontFamily: font.family }}
                  >
                    {font.name}
                  </div>
                  <div
                    className="text-xs text-[#737882] mt-0.5"
                    style={{ fontFamily: font.family }}
                  >
                    {font.preview} • {font.desc}
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUBVIEW 5: COLORS
  // =========================================================================
  if (subView === 'colors') {
    const currentTint = typeof profile.wallpaperTint === 'number' ? profile.wallpaperTint : 20;

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <button
            type="button"
            onClick={() => setSubView('menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1E22] hover:text-[#5E4BF7] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Design</span>
          </button>
          <span className="text-xs font-semibold text-[#737882]">Colors</span>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#1C1E22]">Color Accents & Tint</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            Customize action button accents, contrast tint, and card colors in real time.
          </p>
        </div>

        {/* Accent Color Swatches & Custom Picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#1C1E22] uppercase tracking-wider">
              Primary Accent Color
            </label>
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-black/10 bg-white"
              style={{ color: profile.buttonColor || '#5E4BF7' }}
            >
              {profile.buttonColor || '#5E4BF7'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {ACCENT_COLOR_PALETTES.map((palette) => {
              const isSelected = (profile.buttonColor || '#5E4BF7') === palette.hex;
              return (
                <button
                  key={palette.hex}
                  type="button"
                  onClick={() => applyChange({ buttonColor: palette.hex })}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white shadow-xs font-bold'
                      : 'border-black/10 bg-white hover:border-black/25'
                  }`}
                  title={palette.name}
                >
                  <div
                    className="w-7 h-7 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: palette.hex }}
                  />
                  <span className="text-[10px] font-semibold text-[#1C1E22] truncate w-full text-center">
                    {palette.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Hex Color Picker Input */}
          <div className="mt-2 p-2.5 bg-stone-50 rounded-xl border border-black/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={profile.buttonColor || '#5E4BF7'}
                onChange={(e) => applyChange({ buttonColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-black/10 cursor-pointer bg-transparent"
                title="Pick custom accent color"
              />
              <span className="text-xs font-semibold text-[#1C1E22]">Custom Accent Hex</span>
            </div>
            <input
              type="text"
              value={profile.buttonColor || '#5E4BF7'}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('#') || val.length <= 7) {
                  applyChange({ buttonColor: val });
                }
              }}
              placeholder="#5E4BF7"
              className="w-24 px-2 py-1 text-xs font-mono font-bold bg-white border border-black/15 rounded-lg text-center uppercase"
            />
          </div>
        </div>

        {/* Real-time Wallpaper Dimming & Contrast Tint */}
        <div className="space-y-2.5 pt-3 border-t border-black/5">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-[#1C1E22] uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#5E4BF7]" />
                <span>Wallpaper Contrast Tint</span>
              </label>
              <p className="text-[11px] text-[#737882]">
                Darken backdrop overlay to highlight cards with clear contrast
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-stone-100 text-[#1C1E22] border border-black/5">
              {currentTint}%
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: '0% None', val: 0 },
              { label: '20% Soft', val: 20 },
              { label: '40% Crisp', val: 40 },
              { label: '60% Deep', val: 60 },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => applyChange({ wallpaperTint: preset.val })}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  currentTint === preset.val
                    ? 'bg-[#1C1E22] text-white border-black shadow-xs'
                    : 'bg-white text-[#737882] border-black/10 hover:bg-stone-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="0"
            max="85"
            step="5"
            value={currentTint}
            onChange={(e) => applyChange({ wallpaperTint: Number(e.target.value) })}
            className="w-full accent-[#5E4BF7] h-2 bg-stone-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* Card Surface Tone */}
        <div className="space-y-2 pt-3 border-t border-black/5">
          <label className="text-xs font-bold text-[#1C1E22] uppercase tracking-wider">Card Surface Tone</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'auto', name: 'Auto Match', desc: 'Theme default' },
              { id: '#FFFFFF', name: 'Crisp White', desc: 'Light card' },
              { id: '#191A1E', name: 'Charcoal Noir', desc: 'Dark card' },
              { id: '#F5F2EB', name: 'Warm Canvas', desc: 'Earthy cream' },
              { id: '#F1F5F9', name: 'Soft Slate', desc: 'Cool gray' },
            ].map((tone) => {
              const isSelected = (profile.cardBgColor || 'auto') === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => applyChange({ cardBgColor: tone.id === 'auto' ? undefined : tone.id })}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white shadow-xs font-bold'
                      : 'border-black/10 bg-white hover:border-black/25 text-[#737882]'
                  }`}
                >
                  <div className="text-xs text-[#1C1E22] font-semibold">{tone.name}</div>
                  <div className="text-[10px] text-[#737882]">{tone.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Text Color */}
        <div className="space-y-2 pt-3 border-t border-black/5">
          <label className="text-xs font-bold text-[#1C1E22] uppercase tracking-wider">Card Text Tone</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'auto', name: 'Auto' },
              { id: '#1C1E22', name: 'High Contrast Dark' },
              { id: '#FFFFFF', name: 'Pure White' },
            ].map((opt) => {
              const isSelected = (profile.cardTextColor || 'auto') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => applyChange({ cardTextColor: opt.id === 'auto' ? undefined : opt.id })}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white shadow-xs font-bold'
                      : 'border-black/10 bg-white hover:border-black/25 text-[#737882]'
                  }`}
                >
                  <span className="text-xs text-[#1C1E22] font-semibold">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUBVIEW 6: STICKERS
  // =========================================================================
  if (subView === 'stickers') {
    const currentStickers = profile.stickers || [];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <button
            type="button"
            onClick={() => setSubView('menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1E22] hover:text-[#5E4BF7] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Design</span>
          </button>
          <span className="text-xs font-semibold text-[#737882]">Stickers</span>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#1C1E22]">Decorate Your Page</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            Add playful badges and status stickers to showcase milestones and highlights.
          </p>
        </div>

        <div className="space-y-2">
          {STICKER_PRESETS.map((sticker) => {
            const isAdded = currentStickers.includes(sticker.label);
            const IconComp = sticker.icon;

            const handleToggle = () => {
              if (isAdded) {
                applyChange({ stickers: currentStickers.filter((s) => s !== sticker.label) });
              } else {
                applyChange({ stickers: [...currentStickers, sticker.label] });
              }
            };

            return (
              <div
                key={sticker.id}
                onClick={handleToggle}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isAdded
                    ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 bg-white shadow-xs'
                    : 'border-black/10 bg-white hover:border-black/25'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#1C1E22]">{sticker.label}</span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isAdded ? 'bg-[#7C3AED] border-[#7C3AED] text-white' : 'border-black/20 bg-white'
                  }`}
                >
                  {isAdded && <Check className="w-3 h-3" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SUBVIEW 7: FOOTER
  // =========================================================================
  if (subView === 'footer') {
    const footer = profile.footerSettings || { showWatermark: true, showSocials: true };
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <button
            type="button"
            onClick={() => setSubView('menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1E22] hover:text-[#5E4BF7] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Design</span>
          </button>
          <span className="text-xs font-semibold text-[#737882]">Footer</span>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#1C1E22]">Footer Customization</h3>
          <p className="text-xs text-[#737882] mt-0.5">
            Configure bottom branding, watermark, and footer notes.
          </p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-black/10 space-y-3">
          {/* Watermark Toggle */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-[#1C1E22]">Show LinkLyra Watermark</div>
              <div className="text-[11px] text-[#737882]">"Powered by LinkLyra" in page footer</div>
            </div>
            <button
              type="button"
              onClick={() => {
                const isProUser = profile.plan === 'pro' || profile.plan === 'business';
                if (!isProUser && footer.showWatermark && onOpenProModal) {
                  onOpenProModal('Remove Watermark');
                  return;
                }
                applyChange({
                  footerSettings: { ...footer, showWatermark: !footer.showWatermark },
                });
              }}
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                footer.showWatermark ? 'bg-emerald-500' : 'bg-black/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                  footer.showWatermark ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Socials in Footer Toggle */}
          <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-[#1C1E22]">Footer Social Links</div>
              <div className="text-[11px] text-[#737882]">Display social icon links at bottom of page</div>
            </div>
            <button
              type="button"
              onClick={() => {
                applyChange({
                  footerSettings: { ...footer, showSocials: !footer.showSocials },
                });
              }}
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                footer.showSocials !== false ? 'bg-[#7C3AED]' : 'bg-black/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                  footer.showSocials !== false ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Custom Footer Copyright / Note */}
          <div className="pt-2 border-t border-black/5 space-y-1.5">
            <label className="text-xs font-bold text-[#1C1E22]">Custom Footer Note</label>
            <input
              type="text"
              value={footer.customFooterText || ''}
              onChange={(e) => {
                applyChange({
                  footerSettings: { ...footer, customFooterText: e.target.value },
                });
              }}
              placeholder={`© ${new Date().getFullYear()} ${profile.name || profile.username}. All rights reserved.`}
              className="w-full text-xs px-3 py-2 rounded-xl border border-black/10 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
            />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN VIEW: MATCHES THE USER'S ATTACHED SCREENSHOT EXACTLY!
  // =========================================================================
  return (
    <div className="space-y-4 max-w-full font-sans select-none">
      {/* Top Header: Clean Design Title */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1C1E22] tracking-tight">
          Design
        </h2>
      </div>

      {/* Row 0: STARTER TEMPLATES CARD */}
      <div
        onClick={() => onOpenOnboarding ? onOpenOnboarding() : setSubView('theme')}
        className="w-full bg-stone-50 hover:bg-stone-100/90 rounded-2xl border border-stone-200/90 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#1C1E22] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#1C1E22]">Templates</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-[#1C1E22] text-white">
                Presets
              </span>
            </div>
            <p className="text-[11px] text-[#737882] truncate mt-0.5">
              Musician, Creator, Developer & Brand layouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#1C1E22] font-semibold text-xs shrink-0">
          <span className="hidden sm:inline">Browse</span>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Row 1: THEME CARD */}
      <div
        onClick={() => setSubView('theme')}
        className="w-full bg-white rounded-2xl border border-black/10 hover:border-black/25 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group hover:shadow-xs active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Black rounded square icon with 'Aa' */}
          <div className="w-10 h-10 rounded-xl bg-[#1C1E22] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            Aa
          </div>
          <span className="text-sm font-bold text-[#1C1E22]">Theme</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#737882] shrink-0">
          <span className="text-xs font-medium">{currentThemeLabel}</span>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Section Subtitle: Customize */}
      <div className="pt-2 px-1">
        <h3 className="text-xs font-bold text-[#737882] tracking-normal">
          Customize
        </h3>
      </div>

      {/* Stacked Group of Settings: Wallpaper, Buttons, Text, Colors, Stickers, Footer */}
      <div className="space-y-2.5">
        {/* Row: WALLPAPER */}
        <div
          onClick={() => setSubView('wallpaper')}
          className="w-full bg-white rounded-2xl border border-black/10 hover:border-black/25 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group hover:shadow-xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Dark rounded square icon */}
            <div className="w-10 h-10 rounded-xl bg-[#1C1E22] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-5 h-5 rounded-md border border-white/30 bg-white/10" />
            </div>
            <span className="text-sm font-bold text-[#1C1E22]">Wallpaper</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#737882] shrink-0">
            <span className="text-xs font-medium">{currentWallpaperLabel}</span>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Row: BUTTONS */}
        <div
          onClick={() => setSubView('buttons')}
          className="w-full bg-white rounded-2xl border border-black/10 hover:border-black/25 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group hover:shadow-xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Dark rounded square icon */}
            <div className="w-10 h-10 rounded-xl bg-[#1C1E22] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-6 h-3.5 rounded-sm bg-white" />
            </div>
            <span className="text-sm font-bold text-[#1C1E22]">Buttons</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#737882] shrink-0">
            <span className="text-xs font-medium">{currentButtonLabel}</span>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Row: TEXT */}
        <div
          onClick={() => setSubView('text')}
          className="w-full bg-white rounded-2xl border border-black/10 hover:border-black/25 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group hover:shadow-xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Light circular/rounded icon with 'Aα' */}
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-black/10 text-[#1C1E22] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
              Aα
            </div>
            <span className="text-sm font-bold text-[#1C1E22]">Text</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#737882] shrink-0">
            <span className="text-xs font-medium">{currentFontLabel}</span>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Row: COLORS */}
        <div
          onClick={() => setSubView('colors')}
          className="w-full bg-white rounded-2xl border border-black/10 hover:border-black/25 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group hover:shadow-xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Split black/white rounded icon */}
            <div className="w-10 h-10 rounded-xl border border-black/15 overflow-hidden flex shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-1/2 h-full bg-[#1C1E22]" />
              <div className="w-1/2 h-full bg-white" />
            </div>
            <span className="text-sm font-bold text-[#1C1E22]">Colors</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {profile.buttonColor && (
              <div
                className="w-3.5 h-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: profile.buttonColor }}
              />
            )}
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Row: STICKERS */}
        <div
          onClick={() => setSubView('stickers')}
          className="w-full bg-white rounded-2xl border border-black/10 hover:border-black/25 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group hover:shadow-xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Sticker outline icon with folded corner */}
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-black/10 flex items-center justify-center text-[#1C1E22] shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-5 h-5 border-2 border-black rounded-tl-md rounded-tr-md rounded-bl-md relative">
                {/* Folded corner appearance */}
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-l border-b border-black bg-white" />
              </div>
            </div>
            <span className="text-sm font-bold text-[#1C1E22]">Stickers</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#737882] shrink-0">
            <span className="text-xs font-medium">Decorate your page</span>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Row: FOOTER */}
        <div
          onClick={() => setSubView('footer')}
          className="w-full bg-white rounded-2xl border border-black/10 hover:border-black/25 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer group hover:shadow-xs active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Asterisk / Starburst Icon */}
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-black/10 flex items-center justify-center text-[#1C1E22] shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-xl font-light leading-none">✳</span>
            </div>
            <span className="text-sm font-bold text-[#1C1E22]">Footer</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#737882] shrink-0">
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
