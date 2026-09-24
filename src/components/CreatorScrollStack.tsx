import React, { useState, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Video01Icon,
  ShoppingBag01Icon,
  YoutubeIcon,
  SparklesIcon,
  PlayIcon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  CheckmarkCircle01Icon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { IPhoneMockup3D } from './IPhoneMockup3D';
import { BRAND_LOGOS } from '../data';

export interface CreatorScrollStackProps {
  onOpenStudio: () => void;
  onOpenAuth: () => void;
  currentUser?: any;
}

interface CreatorFeatureStep {
  id: string;
  tabLabel: string;
  icon: any;
  headline: string;
  description: string;
  badge: string;
  accentColor: string;
  cardTitle: string;
  cardSubtitle: string;
  cardBadge: string;
  actionText: string;
  visualType: 'reel' | 'product' | 'youtube' | 'sponsor';
}

const FEATURE_STEPS: CreatorFeatureStep[] = [
  {
    id: 'step-reel',
    tabLabel: 'Drop Featured Reels',
    icon: Video01Icon,
    headline: 'Drop Featured Reels & Short-Form Video',
    description:
      'Pin your highest-performing vertical reels, TikToks, and project breakdowns with 1-tap playback and instant viewer engagement right on your page.',
    badge: 'VERTICAL VIDEO',
    accentColor: '#584CE4',
    cardTitle: 'Featured Reel: Building My Studio 2026',
    cardSubtitle: 'Complete breakdown of tactile lighting, custom acoustic panels, and minimal desk setup',
    cardBadge: 'FEATURED REEL',
    actionText: 'Watch Reel ↗',
    visualType: 'reel',
  },
  {
    id: 'step-product',
    tabLabel: 'Sell Digital Asset Kits',
    icon: ShoppingBag01Icon,
    headline: 'Sell Digital Asset Kits & Presets',
    description:
      'Monetize your workflow directly. Sell Lightroom LUTs, Blender 3D project assets, Figma kits, and sound packs with seamless zero-redirect checkout.',
    badge: 'DIGITAL COMMERCE',
    accentColor: '#D95338',
    cardTitle: 'Cinematic LUTs & 3D Blender Kit',
    cardSubtitle: 'The exact color science profiles, studio lighting files, and shader graphs from my videos',
    cardBadge: '$29 SHOP',
    actionText: 'Instant Download ↗',
    visualType: 'product',
  },
  {
    id: 'step-youtube',
    tabLabel: 'Embed YouTube Videos',
    icon: YoutubeIcon,
    headline: 'Embed YouTube Videos Inline',
    description:
      'Never kick fans off to a third-party app. Embed full 4K documentaries, tutorials, and deep-dives with responsive native player controls.',
    badge: 'NATIVE EMBED',
    accentColor: '#E11D48',
    cardTitle: 'Sound Design & Spatial Audio in 3D Motion',
    cardSubtitle: 'Full 18-minute masterclass on spatial audio mixing, Foley capture, and frame matching',
    cardBadge: 'YOUTUBE 4K',
    actionText: 'Watch Inline ↗',
    visualType: 'youtube',
  },
  {
    id: 'step-sponsor',
    tabLabel: 'Direct Brand Sponsorships',
    icon: SparklesIcon,
    headline: 'Receive Direct Brand Sponsorships',
    description:
      'Display verified audience metrics, engagement rates, and tech demographics so premium sponsors can book pre-roll sponsorships and rate cards in 1 tap.',
    badge: 'SPONSOR INQUIRIES',
    accentColor: '#202428',
    cardTitle: 'Sponsor The Next Episode',
    cardSubtitle: 'Pre-roll and dedicated brand partnerships reaching 140K+ verified creative tech builders',
    cardBadge: 'RATE CARD',
    actionText: 'Request Kit ↗',
    visualType: 'sponsor',
  },
];

export const CreatorScrollStack: React.FC<CreatorScrollStackProps> = ({
  onOpenStudio,
  onOpenAuth,
  currentUser,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserInteracting = useRef(false);

  // Sync scroll position with active step within container
  useEffect(() => {
    const handleScroll = () => {
      if (isUserInteracting.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      // Calculate how far into the container we've scrolled
      const scrollableDistance = containerHeight - windowHeight;
      if (scrollableDistance <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
      const stepIndex = Math.min(
        FEATURE_STEPS.length - 1,
        Math.floor(progress * FEATURE_STEPS.length)
      );
      setActiveStep(stepIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleManualStepSelect = (index: number) => {
    isUserInteracting.current = true;
    setActiveStep(index);
    setTimeout(() => {
      isUserInteracting.current = false;
    }, 1000);
  };

  const currentFeature = FEATURE_STEPS[activeStep];

  return (
    <div
      ref={containerRef}
      id="creators"
      className="relative min-h-[160vh] sm:min-h-[220vh] border-t border-[#E8E8E8] bg-[#FAFAF7]"
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-16 min-h-[calc(100vh-4rem)] flex items-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">
          {/* ------------------------------------------------------------- */}
          {/* LEFT COLUMN: Feature Narrative & Progressive Step Triggers   */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Section Eyebrow */}
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-[#E8E8E8] shadow-2xs">
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#666666] uppercase font-mono">
                BUILT FOR CREATORS
              </span>
            </div>

            {/* Main Section H2 */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#111111] tracking-tight leading-[1.08]">
              Turn followers into your next click.
            </h2>

            {/* Subtitle explicitly mentioning the 4 capabilities */}
            <p className="text-sm sm:text-base text-[#555555] max-w-xl leading-relaxed">
              Drop featured reels, sell digital asset kits, embed YouTube videos, and receive direct brand sponsorships without kicking fans off your page.
            </p>

            {/* Interactive Progressive Step Switchers */}
            <div className="space-y-3 pt-2">
              {FEATURE_STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                const IconComponent = step.icon;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleManualStepSelect(idx)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-3.5 select-none ${
                      isActive
                        ? 'bg-white border-[#111111] shadow-sm scale-[1.01]'
                        : 'bg-stone-50/70 border-[#E8E8E8] hover:bg-white/80 hover:border-black/20 text-[#666666]'
                    }`}
                  >
                    {/* Icon container */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#111111] text-white shadow-2xs'
                          : 'bg-white border border-[#E8E8E8] text-[#666666]'
                      }`}
                    >
                      <HugeiconsIcon icon={IconComponent} size={18} />
                    </div>

                    {/* Step details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold tracking-tight ${
                            isActive ? 'text-[#111111]' : 'text-[#444444]'
                          }`}
                        >
                          {step.tabLabel}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-stone-100 text-[#111111] border border-black/10'
                              : 'text-stone-400'
                          }`}
                        >
                          0{idx + 1}
                        </span>
                      </div>

                      {isActive && (
                        <p className="text-xs text-[#666666] mt-1 leading-relaxed animate-fadeIn">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                className="px-7 py-3.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Build a creator page →</span>
              </button>
              <span className="text-xs text-[#888888] font-mono">
                Step {activeStep + 1} of {FEATURE_STEPS.length}
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT COLUMN: 3D iPhone Mockup with Card Stacking Scroll     */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <IPhoneMockup3D tiltAngle="left">
              <div className="p-4 sm:p-5 text-left select-none space-y-3.5 bg-white min-h-[640px]">
                {/* Top Bar: [ LIVE PROFILE ] + username badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/5 text-[#111111] border border-black/5">
                    LIVE PROFILE
                  </span>
                  <span className="text-[11px] font-mono text-[#888888] truncate max-w-[170px]">
                    linklyra.com/@mayalin
                  </span>
                </div>

                {/* Profile Header: Maya Lin */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80"
                      alt="Maya Lin"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black text-[#111111] tracking-tight truncate">
                        Maya Lin
                      </h3>
                      <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-2xs">
                        ✓
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#666666] truncate mt-0.5">
                      Visual Filmmaker & 3D Artist
                    </p>
                  </div>
                </div>

                {/* One-sentence bio */}
                <p className="text-xs text-[#555555] leading-relaxed">
                  Visual essays on cinema tech, Blender lighting systems, and tactile computing.
                </p>

                {/* Social Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {['YouTube', 'Instagram', 'TikTok'].map((soc) => (
                    <span
                      key={soc}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FAFAF7] border border-[#E8E8E8] text-[#111111] shadow-2xs"
                    >
                      {soc}
                    </span>
                  ))}
                </div>

                {/* --------------------------------------------------------- */}
                {/* PROGRESSIVE CARD STACK (Changes dynamically with scroll)  */}
                {/* --------------------------------------------------------- */}
                <div className="pt-1 space-y-2.5 relative min-h-[380px]">
                  {/* CARD 1: DROP FEATURED REEL */}
                  <div
                    className={`rounded-[20px] p-3.5 sm:p-4 text-white transition-all duration-500 ease-out select-none shadow-sm ${
                      activeStep === 0
                        ? 'bg-[#584CE4] ring-2 ring-[#584CE4]/40 scale-[1.02] shadow-md z-30'
                        : 'bg-[#584CE4]/80 opacity-70 hover:opacity-100 z-10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                          <HugeiconsIcon icon={Video01Icon} size={16} className="text-[#584CE4]" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold tracking-tight truncate leading-tight">
                          Featured Reel: Studio 2026
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-white/20 text-white">
                          REEL
                        </span>
                        <div className="px-2.5 py-1 rounded-full bg-white text-[#111111] text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                          <span>Watch</span>
                          <HugeiconsIcon icon={ArrowUpRight01Icon} size={11} />
                        </div>
                      </div>
                    </div>

                    {/* Active Expanded Video Reel Player Preview */}
                    {activeStep === 0 && (
                      <div className="mt-3 pt-2 border-t border-white/20 space-y-2 animate-fadeIn">
                        <div className="relative rounded-xl overflow-hidden h-24 bg-black/40 border border-white/15 flex items-center justify-center">
                          <img
                            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80"
                            alt="Reel preview"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#111111] shadow-lg relative z-10">
                            <HugeiconsIcon icon={PlayIcon} size={16} className="ml-0.5" />
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white font-mono z-10">
                            <span className="bg-black/60 px-1.5 py-0.5 rounded-xs">0:48</span>
                            <span className="font-bold text-white/90">142K Views</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-white/90 leading-tight">
                          Complete breakdown of tactile lighting, custom audio, and minimal cable management.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CARD 2: DIGITAL ASSET KITS */}
                  <div
                    className={`rounded-[20px] p-3.5 sm:p-4 text-white transition-all duration-500 ease-out select-none shadow-sm ${
                      activeStep === 1
                        ? 'bg-[#D95338] ring-2 ring-[#D95338]/40 scale-[1.02] shadow-md z-30'
                        : 'bg-[#D95338]/80 opacity-70 hover:opacity-100 z-10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                          <HugeiconsIcon icon={ShoppingBag01Icon} size={16} className="text-[#D95338]" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold tracking-tight truncate leading-tight">
                          Cinematic LUTs & 3D Pack
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-white/20 text-white">
                          $29 SHOP
                        </span>
                        <div className="px-2.5 py-1 rounded-full bg-white text-[#111111] text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                          <span>Get Pack</span>
                          <HugeiconsIcon icon={ArrowUpRight01Icon} size={11} />
                        </div>
                      </div>
                    </div>

                    {/* Active Expanded Product Preview */}
                    {activeStep === 1 && (
                      <div className="mt-3 pt-2 border-t border-white/20 space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/10 text-xs">
                          <span className="text-white/90 font-medium">Blender 4.2 + DaVinci Pro</span>
                          <span className="font-mono font-bold bg-white text-[#D95338] px-2 py-0.5 rounded-md shadow-2xs">
                            $29.00
                          </span>
                        </div>
                        <p className="text-[11px] text-white/90 leading-tight">
                          The exact color science profiles, blender lighting setups, and tactile LUTs used across my channel.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CARD 3: EMBED YOUTUBE VIDEOS */}
                  <div
                    className={`rounded-[20px] p-3.5 sm:p-4 text-white transition-all duration-500 ease-out select-none shadow-sm ${
                      activeStep === 2
                        ? 'bg-[#B91C1C] ring-2 ring-[#B91C1C]/40 scale-[1.02] shadow-md z-30'
                        : 'bg-[#B91C1C]/80 opacity-70 hover:opacity-100 z-10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                          <HugeiconsIcon icon={YoutubeIcon} size={16} className="text-[#B91C1C]" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold tracking-tight truncate leading-tight">
                          Sound Design in 3D Motion
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-white/20 text-white">
                          YOUTUBE
                        </span>
                        <div className="px-2.5 py-1 rounded-full bg-white text-[#111111] text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                          <span>Play</span>
                          <HugeiconsIcon icon={ArrowUpRight01Icon} size={11} />
                        </div>
                      </div>
                    </div>

                    {/* Active Expanded YouTube Masterclass Preview */}
                    {activeStep === 2 && (
                      <div className="mt-3 pt-2 border-t border-white/20 space-y-2 animate-fadeIn">
                        <div className="relative rounded-xl overflow-hidden h-24 bg-black/50 border border-white/15 flex items-center justify-center">
                          <img
                            src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80"
                            alt="YouTube Masterclass"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                          />
                          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl relative z-10">
                            <HugeiconsIcon icon={PlayIcon} size={18} className="ml-0.5" />
                          </div>
                          <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/80 px-1.5 py-0.5 rounded-xs text-white z-10">
                            18:24 • 4K
                          </span>
                        </div>
                        <p className="text-[11px] text-white/90 leading-tight">
                          Inline native player streaming directly from YouTube without sending viewers away.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CARD 4: DIRECT BRAND SPONSORSHIPS */}
                  <div
                    className={`rounded-[20px] p-3.5 sm:p-4 text-white transition-all duration-500 ease-out select-none shadow-sm ${
                      activeStep === 3
                        ? 'bg-[#1E232B] ring-2 ring-white/30 scale-[1.02] shadow-md z-30'
                        : 'bg-[#1E232B]/80 opacity-70 hover:opacity-100 z-10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                          <HugeiconsIcon icon={SparklesIcon} size={16} className="text-[#1E232B]" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold tracking-tight truncate leading-tight">
                          Sponsor The Next Episode
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-white/20 text-white">
                          SPONSOR
                        </span>
                        <div className="px-2.5 py-1 rounded-full bg-white text-[#111111] text-[11px] font-bold flex items-center gap-1 shadow-2xs">
                          <span>Inquire</span>
                          <HugeiconsIcon icon={ArrowUpRight01Icon} size={11} />
                        </div>
                      </div>
                    </div>

                    {/* Active Expanded Sponsorship Analytics Grid */}
                    {activeStep === 3 && (
                      <div className="mt-3 pt-2 border-t border-white/10 space-y-2 animate-fadeIn">
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-sm font-bold text-white block">140K+</span>
                            <span className="text-[9px] text-stone-400">Subscribers</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-sm font-bold text-white block">8.4%</span>
                            <span className="text-[9px] text-stone-400">Engagement</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-sm font-bold text-white block">74%</span>
                            <span className="text-[9px] text-stone-400">Tech/Design</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-300 leading-tight">
                          Receive direct inbound sponsor inquiries and brand briefs right inside your LinkLyra inbox.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Badge */}
                <div className="text-center pt-2 pb-1 border-t border-[#E8E8E8]">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-[#E8E8E8] text-[10px] font-extrabold uppercase tracking-wider text-[#111111] shadow-2xs">
                    BUILT WITH LINKLYRA
                  </span>
                </div>
              </div>
            </IPhoneMockup3D>
          </div>
        </div>
      </div>
    </div>
  );
};
