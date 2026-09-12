import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Smartphone,
  ShieldCheck,
  Palette,
  SlidersHorizontal,
  Cloud,
  Layers,
  BarChart3,
  ExternalLink,
  Heart,
  User,
  Zap,
} from 'lucide-react';
import { UI_KIT } from '../lib/ui-kit';
import { ProfileCard } from './ProfileCard';
import { ProfileCardData, CanvasTheme } from '../types';
import { BRAND_LOGOS } from '../data';

export interface LandingPageProps {
  onOpenStudio: (claimedHandle?: string) => void;
  onOpenAuth: () => void;
  onOpenVisitorDemo: () => void;
}

const DEMO_INTERACTIVE_CARDS: ProfileCardData[] = [
  {
    id: 'demo-1',
    title: 'Watch New Video: Building in Public',
    subtitle: 'Behind the scenes of how we architected LinkCards with tactile UI',
    linkUrl: 'https://youtube.com',
    color: 'purple',
    logoSrc: BRAND_LOGOS.youtube,
    badgeText: 'WATCH',
    expanded: true,
  },
  {
    id: 'demo-2',
    title: 'Weekly Design Newsletter #42',
    subtitle: 'Micro-interactions, optical typography, and zero-slop UI',
    linkUrl: 'https://substack.com',
    color: 'orange',
    logoSrc: BRAND_LOGOS.substack,
    badgeText: 'HOT',
    expanded: false,
  },
  {
    id: 'demo-3',
    title: 'Design System & UI Kit on Figma',
    subtitle: 'Grab our open-source token library & card components',
    linkUrl: 'https://figma.com',
    color: 'yellow',
    logoSrc: BRAND_LOGOS.figma,
    badgeText: 'FREE',
    expanded: false,
  },
  {
    id: 'demo-4',
    title: 'Latest Ambient Lo-Fi Beats Playlist',
    subtitle: 'Curated tracks for deep focus and late-night coding',
    linkUrl: 'https://spotify.com',
    color: 'green',
    logoSrc: BRAND_LOGOS.spotify,
    badgeText: 'LISTEN',
    expanded: false,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudio,
  onOpenAuth,
  onOpenVisitorDemo,
}) => {
  const [handleInput, setHandleInput] = useState('');
  const [activeTheme, setActiveTheme] = useState<CanvasTheme>('warm');
  const [sandboxCards, setSandboxCards] = useState<ProfileCardData[]>(DEMO_INTERACTIVE_CARDS);
  const [clickedCardId, setClickedCardId] = useState<string | null>(null);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handleInput.trim().replace(/^@/, '').toLowerCase();
    onOpenStudio(cleanHandle || undefined);
  };

  const handleSandboxCardClick = (card: ProfileCardData) => {
    setClickedCardId(card.id);
    setTimeout(() => setClickedCardId(null), 1200);
  };

  const currentThemeConfig = UI_KIT.canvasThemes[activeTheme] || UI_KIT.canvasThemes.warm;

  return (
    <div className="min-h-screen bg-[#ECE7DC] text-[#1C1E22] flex flex-col font-sans selection:bg-[#5E4BF7] selection:text-white relative">
      {/* 1. Header: Transparent Glassmorphism Navigation */}
      <header
        className={`sticky top-0 z-50 w-full ${UI_KIT.glass.header} transition-colors duration-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#1C1E22] text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
                {UI_KIT.brand.shortName}
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#1C1E22] block leading-none">
                  {UI_KIT.brand.name}
                </span>
                <span className="text-[10px] font-semibold text-[#737882] tracking-wide uppercase mt-0.5 block">
                  Profile Canvas
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#737882]">
            <a
              href="#concept"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4"
            >
              Why Cards?
            </a>
            <a
              href="#sandbox"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4"
            >
              Live Sandbox
            </a>
            <a
              href="#features"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4"
            >
              Features
            </a>
            <a
              href="#comparison"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4"
            >
              Comparison
            </a>
            <a
              href="#faq"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4"
            >
              FAQ
            </a>
          </nav>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenVisitorDemo}
              className="hidden sm:flex px-3 py-1.5 rounded-full text-xs font-bold text-[#737882] hover:text-[#1C1E22] hover:bg-black/5 transition-colors"
            >
              Demo Profile
            </button>

            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/80 hover:bg-white text-[#1C1E22] border border-black/10 transition-all shadow-2xs active:scale-95"
            >
              <User className="w-3.5 h-3.5 inline mr-1 text-[#5E4BF7]" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenStudio()}
              className="px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-[#1C1E22] hover:bg-black text-white transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Conversational Pitch */}
      <section className="pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        {/* Subtle conversational badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-black/10 text-xs font-bold text-[#1C1E22] shadow-2xs mb-6 sm:mb-8 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-[#5E4BF7]" />
          <span>A love letter to human internet profiles</span>
          <span className="text-[#737882] font-normal">•</span>
          <span className="text-[#5E4BF7]">100% Free</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#1C1E22] tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Your internet presence shouldn't look like an Excel sheet from 2018.
        </h1>

        {/* Conversational body text */}
        <p className="mt-5 sm:mt-7 text-sm sm:text-base md:text-lg text-[#555962] font-normal max-w-2xl mx-auto leading-relaxed">
          Let’s be honest for a second: you spend weeks perfecting your YouTube videos, code
          repositories, newsletters, and creative work. Then you drop all that energy into five
          identical, lifeless gray buttons in your bio.
        </p>
        <p className="mt-3 text-sm sm:text-base font-semibold text-[#1C1E22] max-w-xl mx-auto">
          LinkCards gives you tactile color blocks, optical hierarchy, and the bespoke feel of an
          architect’s portfolio — ready in 90 seconds.
        </p>

        {/* Claim Your Username Input Bar */}
        <div className="mt-8 sm:mt-10 max-w-md mx-auto">
          <form
            onSubmit={handleClaimSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 p-1.5 sm:p-2 bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-full border border-black/15 shadow-sm focus-within:ring-2 focus-within:ring-[#5E4BF7] transition-all"
          >
            <div className="flex items-center gap-1 pl-3.5 pr-2 py-1.5 w-full sm:w-auto text-xs sm:text-sm text-[#737882] font-mono shrink-0">
              <span className="font-bold text-[#1C1E22]">linkcards.app/</span>
              <span className="text-[#5E4BF7]">@</span>
            </div>
            <input
              type="text"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              placeholder="yourname"
              className="w-full bg-transparent px-2 py-1.5 text-xs sm:text-sm font-bold text-[#1C1E22] focus:outline-none placeholder:text-[#9DA2AC]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl sm:rounded-full bg-[#1C1E22] hover:bg-black text-white text-xs font-bold whitespace-nowrap shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Claim Handle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Micro trust cues */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-[#737882]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Free forever
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-[#5E4BF7]" />
              Cloud Firestore sync
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              No credit card needed
            </span>
          </div>
        </div>
      </section>

      {/* 3. Live Interactive Sandbox / Mini Studio */}
      <section
        id="sandbox"
        className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full"
      >
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-bold text-[#1C1E22] mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive Playground</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1C1E22] tracking-tight">
            Try the cards right here. Click anything.
          </h2>
          <p className="text-xs sm:text-sm text-[#737882] mt-2 max-w-lg mx-auto">
            Switch canvas palettes below or tap a card to see how tactile micro-interactions work in
            real time.
          </p>

          {/* Canvas Theme Selector Controls */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {(Object.keys(UI_KIT.canvasThemes) as CanvasTheme[]).map((themeKey) => {
              const theme = UI_KIT.canvasThemes[themeKey];
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setActiveTheme(themeKey)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    activeTheme === themeKey
                      ? 'bg-[#1C1E22] text-white border-black shadow-xs scale-105'
                      : 'bg-white/80 text-[#1C1E22] border-black/10 hover:bg-white'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{
                      backgroundColor:
                        themeKey === 'dark'
                          ? '#191A1E'
                          : themeKey === 'clay'
                          ? '#EFEBE4'
                          : themeKey === 'cream'
                          ? '#FAF8F5'
                          : themeKey === 'light'
                          ? '#FFFFFF'
                          : '#F5F2EB',
                    }}
                  />
                  <span>{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The Sandbox Phone Mockup */}
        <div className="max-w-md mx-auto">
          <div
            className={`w-full ${currentThemeConfig.bgClass} rounded-[32px] p-5 sm:p-7 shadow-xl border border-black/10 transition-all duration-300 relative overflow-hidden`}
          >
            {/* Header in Sandbox */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className={`text-base font-bold leading-tight truncate ${
                    currentThemeConfig.isDark ? 'text-white' : 'text-[#1C1E22]'
                  }`}
                >
                  Alex Rivera
                </h3>
                <p
                  className={`text-xs font-medium truncate mt-0.5 ${
                    currentThemeConfig.isDark ? 'text-white/70' : 'text-[#737882]'
                  }`}
                >
                  Architectural UI Designer & Tech Creator
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/80 border border-black/10 flex items-center justify-center text-[#1C1E22] text-xs shadow-2xs">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Cards Stack */}
            <div className="space-y-3">
              {sandboxCards.map((card) => (
                <div key={card.id} className="relative">
                  <ProfileCard
                    title={card.title}
                    subtitle={card.subtitle}
                    linkUrl={card.linkUrl}
                    color={card.color}
                    logoSrc={card.logoSrc}
                    badgeText={card.badgeText}
                    expanded={card.expanded}
                    interactive={true}
                    onClick={() => handleSandboxCardClick(card)}
                  />
                  {clickedCardId === card.id && (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-2xs rounded-[24px] flex items-center justify-center text-xs font-bold text-white animate-fadeIn pointer-events-none">
                      Opening Link Preview...
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sandbox Footer */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/10 text-[11px] font-bold text-[#1C1E22] shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#5E4BF7]" />
                <span>LinkCards</span>
                <span className="text-[#737882] font-normal">•</span>
                <span className="text-[#737882]">@alexrivera</span>
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => onOpenStudio()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1E22] hover:bg-black text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <span>Open Studio & Customize This</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Conversational "Why We Built LinkCards" Section */}
      <section id="concept" className="py-14 sm:py-20 bg-white/60 border-y border-black/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-bold text-[#1C1E22]">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>A Personal Note</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[#1C1E22] tracking-tight">
              Why another link-in-bio tool? Because existing ones feel like spam directories.
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#494D55] leading-relaxed">
              <p>
                When you click someone's bio link today, 9 times out of 10 you get slapped with a
                generic stack of gray or pastel buttons that looks like it was made in 2017.
              </p>
              <p>
                Every button looks identical. You can’t tell if a link is an hour-long documentary, a
                quick tweet, a store discount, or a 3-minute read. Everything is flattened into the
                same tiny rectangle.
              </p>
              <p className="font-semibold text-[#1C1E22]">
                We built LinkCards with three non-negotiable principles:
              </p>
            </div>

            {/* 3 Core Principles Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-5 rounded-3xl bg-[#F5F2EB] border border-black/10 space-y-2.5">
                <div className="w-8 h-8 rounded-2xl bg-[#5E4BF7] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  01
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#1C1E22]">
                  Cards Beat Plain Lists
                </h3>
                <p className="text-xs text-[#737882] leading-normal">
                  Give featured projects big headlines and generous descriptions. Use badges like
                  WATCH, READ, or 50% OFF so visitors know what they are opening.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#F5F2EB] border border-black/10 space-y-2.5">
                <div className="w-8 h-8 rounded-2xl bg-[#E75646] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  02
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#1C1E22]">
                  Zero Paywalled Creativity
                </h3>
                <p className="text-xs text-[#737882] leading-normal">
                  Why should picking a sage green background or adding a custom icon cost $12/month?
                  LinkCards gives you full palette control for free.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#F5F2EB] border border-black/10 space-y-2.5">
                <div className="w-8 h-8 rounded-2xl bg-[#F8BA38] text-[#191A1E] flex items-center justify-center font-bold text-xs shadow-xs">
                  03
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#1C1E22]">
                  Real Cloud Sync
                </h3>
                <p className="text-xs text-[#737882] leading-normal">
                  Backed by Google Cloud Firestore, your profile updates across all devices in real
                  time without reloading.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Grid: The Universal UI Kit in Action */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-bold text-[#1C1E22] mb-3">
            <Layers className="w-3.5 h-3.5 text-[#5E4BF7]" />
            <span>Design Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#1C1E22] tracking-tight">
            Crafted for creators who care about typography and feel.
          </h2>
          <p className="text-xs sm:text-sm text-[#737882] mt-2 max-w-lg mx-auto">
            Everything in LinkCards is powered by a universal design system that ensures perfect
            contrast, clean paddings, and zero AI slop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="p-6 rounded-[28px] bg-white border border-black/10 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#5E4BF7] text-white flex items-center justify-center shadow-xs">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#1C1E22]">Tactile Color Palette</h3>
              <p className="text-xs text-[#737882] leading-relaxed">
                Choose from Electric Purple, Coral Orange, Warm Amber, Sage Mint, and Obsidian
                Charcoal. Each color is mathematically paired with optical text tones.
              </p>
            </div>
            <div className="pt-3 flex gap-1.5">
              <div className="w-6 h-6 rounded-full bg-[#5E4BF7]" />
              <div className="w-6 h-6 rounded-full bg-[#E75646]" />
              <div className="w-6 h-6 rounded-full bg-[#F8BA38]" />
              <div className="w-6 h-6 rounded-full bg-[#D2EAA5]" />
              <div className="w-6 h-6 rounded-full bg-[#1C1E22]" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-[28px] bg-white border border-black/10 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E75646] text-white flex items-center justify-center shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#1C1E22]">Mobile-First & Fluid</h3>
              <p className="text-xs text-[#737882] leading-relaxed">
                Looks like a bespoke iOS app on phones, and a clean architect's portfolio on desktop
                monitors. No awkward horizontal scrolling or truncated cards.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-[#5E4BF7] font-semibold">
              iPhone • Android • iPad • Desktop
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-[28px] bg-white border border-black/10 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F8BA38] text-[#191A1E] flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#1C1E22]">Custom Action Badges</h3>
              <p className="text-xs text-[#737882] leading-relaxed">
                Add vibrant pills to highlight key links (e.g., NEW, WATCH, LISTEN, HOT, FREE, SHOP).
                Guide your audience directly to what matters right now.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1">
              <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-bold">
                WATCH
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#5E4BF7] text-white text-[10px] font-bold">
                NEW
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                FREE
              </span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-[28px] bg-white border border-black/10 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#D2EAA5] text-[#191A1E] flex items-center justify-center shadow-xs">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#1C1E22]">Atomic Click Analytics</h3>
              <p className="text-xs text-[#737882] leading-relaxed">
                Track how many clicks each link receives in real time. Transparent, zero-cookie,
                privacy-friendly click metrics.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-emerald-700">
              ✓ 100% Privacy Friendly • No Tracking Cookies
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-[28px] bg-white border border-black/10 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#1C1E22] text-white flex items-center justify-center shadow-xs">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#1C1E22]">Google Cloud Persistence</h3>
              <p className="text-xs text-[#737882] leading-relaxed">
                Seamless cloud authentication and Firestore storage. Edit on your laptop, and the
                changes instantly show up on your phone.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-[#737882]">
              Powered by Cloud Firestore
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-[28px] bg-white border border-black/10 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#5E4BF7] text-white flex items-center justify-center shadow-xs">
                <ExternalLink className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#1C1E22]">Rich Brand Icons & Logos</h3>
              <p className="text-xs text-[#737882] leading-relaxed">
                Integrated icons for YouTube, Spotify, GitHub, Substack, Figma, Discord, Calendly,
                plus instant custom image uploads.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-semibold text-[#1C1E22]">
              50+ brand icons or upload your own PNG/SVG
            </div>
          </div>
        </div>
      </section>

      {/* 6. Honest Comparison: Linktree vs LinkCards */}
      <section id="comparison" className="py-14 sm:py-20 bg-white/60 border-y border-black/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1E22] tracking-tight">
              An honest side-by-side comparison
            </h2>
            <p className="text-xs sm:text-sm text-[#737882] mt-1.5">
              Why creative founders and builders are ditching plain link directories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* The Old Way */}
            <div className="p-6 rounded-3xl bg-[#EFEBE4] border border-black/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#737882]">
                  The Old Way (Generic Linktree)
                </span>
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
              <ul className="space-y-2.5 text-xs text-[#555962]">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Every link looks like an identical gray or white rectangle.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>$12/month just to change a background color or remove ads.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>No descriptions or context for what people are tapping on.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Rigid templates that scream "AI-generated template".</span>
                </li>
              </ul>
            </div>

            {/* LinkCards Way */}
            <div className="p-6 rounded-3xl bg-[#1C1E22] text-white border border-black/10 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  The LinkCards Way
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <ul className="space-y-2.5 text-xs text-white/85">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Tactile colored cards that feel like an architect's portfolio.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>100% Free: custom palettes, badges, icons, and analytics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Expanded cards with rich headlines and descriptions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Live real-time Firestore database with instant sync.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Conversational FAQ: Honest Answers */}
      <section id="faq" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-bold text-[#1C1E22] mb-3">
            <span>Conversational FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C1E22] tracking-tight">
            Frequently asked questions without the corporate fluff.
          </h2>
        </div>

        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-white border border-black/10 space-y-1.5 shadow-2xs">
            <h3 className="font-bold text-sm text-[#1C1E22]">
              Is LinkCards really 100% free or is there a hidden paywall?
            </h3>
            <p className="text-xs text-[#737882] leading-relaxed">
              It is completely free. You get full access to all card color palettes, badge highlights,
              cloud database persistence, custom brand icons, and click analytics without ever
              entering a credit card.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/10 space-y-1.5 shadow-2xs">
            <h3 className="font-bold text-sm text-[#1C1E22]">
              Where can I put my LinkCards profile?
            </h3>
            <p className="text-xs text-[#737882] leading-relaxed">
              Every profile gets a clean link like <code className="font-mono bg-black/5 px-1 py-0.5 rounded">linkcards.app/@yourname</code> that you can place in your Instagram,
              TikTok, X/Twitter, YouTube channel description, Substack footer, or email signature.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/10 space-y-1.5 shadow-2xs">
            <h3 className="font-bold text-sm text-[#1C1E22]">
              Do I need to create an account right away to start building?
            </h3>
            <p className="text-xs text-[#737882] leading-relaxed">
              No! You can open the Studio immediately and start adding links, changing colors, and
              previewing your layout. When you want to save it permanently to the cloud, you can
              sign in with one click.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/10 space-y-1.5 shadow-2xs">
            <h3 className="font-bold text-sm text-[#1C1E22]">
              Can I upload custom icons or images for my cards?
            </h3>
            <p className="text-xs text-[#737882] leading-relaxed">
              Yes. You can choose from our 50+ built-in presets (Spotify, YouTube, GitHub, Substack,
              Figma, etc.) or drag-and-drop any custom PNG/SVG from your computer.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Bottom Conversational CTA */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-[36px] bg-[#1C1E22] text-white border border-black/15 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#5E4BF7]/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-[#E75646]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-[#F8BA38]" />
              <span>Ready in 90 seconds</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to give your audience something worth tapping?
            </h2>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Join thousands of designers, developers, writers, and creators who replaced boring
              link lists with tactile card stacks.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onOpenStudio()}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white text-xs sm:text-sm font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch LinkCards Studio</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={onOpenVisitorDemo}
                className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all"
              >
                View Live Demo Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer: Transparent Glassmorphic Footer */}
      <footer className={`mt-auto w-full ${UI_KIT.glass.footer} py-8 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737882]">
          {/* Brand and Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#1C1E22] text-white flex items-center justify-center font-black text-[10px] shadow-xs">
              {UI_KIT.brand.shortName}
            </div>
            <div>
              <span className="font-extrabold text-[#1C1E22] mr-2">{UI_KIT.brand.name}</span>
              <span>© {new Date().getFullYear()} • Tactile Profile System</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-5 font-bold">
            <button
              type="button"
              onClick={() => onOpenStudio()}
              className="hover:text-[#1C1E22] transition-colors"
            >
              Studio
            </button>
            <button
              type="button"
              onClick={onOpenVisitorDemo}
              className="hover:text-[#1C1E22] transition-colors"
            >
              Demo Profile
            </button>
            <button
              type="button"
              onClick={onOpenAuth}
              className="hover:text-[#1C1E22] transition-colors"
            >
              Sign In
            </button>
            <a
              href="#sandbox"
              className="hover:text-[#1C1E22] transition-colors"
            >
              Sandbox
            </a>
          </div>

          {/* Cloud Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#737882]">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Cloud Firestore Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
