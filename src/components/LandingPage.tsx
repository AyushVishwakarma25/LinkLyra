import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  Shield01Icon,
  Settings01Icon,
  CloudIcon,
  UserIcon,
  CrownIcon,
  Tick01Icon,
  Video01Icon,
  MusicNote01Icon,
  Briefcase01Icon,
  Edit01Icon,
  FlashIcon,
  HelpCircleIcon,
  Layers01Icon,
  GlobeIcon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { UI_KIT } from '../lib/ui-kit';
import { ProfileCard } from './ProfileCard';
import { ProfileCardData, CanvasTheme, UserProfile } from '../types';
import { BRAND_LOGOS } from '../data';
import { User as FirebaseUser } from 'firebase/auth';
import { TileRevealTestimonials } from './TileRevealTestimonials';

export interface LandingPageProps {
  onOpenStudio: (claimedHandle?: string) => void;
  onOpenAuth: () => void;
  onOpenVisitorDemo: () => void;
  onOpenProModal?: (featureName?: string) => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  onSignOut?: () => void;
}

interface CreatorArchetype {
  id: string;
  name: string;
  icon: any;
  creatorName: string;
  creatorRole: string;
  avatarUrl: string;
  theme: CanvasTheme;
  cards: ProfileCardData[];
}

const ARCHETYPES: CreatorArchetype[] = [
  {
    id: 'creator',
    name: 'YouTuber & Streamer',
    icon: Video01Icon,
    creatorName: 'Maya Chen',
    creatorRole: 'Tech Filmmaker & 3D Artist',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    theme: 'warm',
    cards: [
      {
        id: 'arch-1',
        title: 'New Video: Building My Dream Desk Setup 2026',
        subtitle: 'Complete breakdown of lighting, audio gear, and minimalist cable management',
        linkUrl: 'https://youtube.com',
        color: 'purple',
        logoSrc: BRAND_LOGOS.youtube,
        badgeText: 'WATCH NOW',
        expanded: true,
      },
      {
        id: 'arch-2',
        title: 'Cinematic LUTs & 3D Assets Pack',
        subtitle: 'Download the exact color profiles used in my YouTube videos',
        linkUrl: 'https://gumroad.com',
        color: 'orange',
        badgeText: '20% OFF',
        expanded: false,
      },
      {
        id: 'arch-3',
        title: 'Join The Creator Guild Discord',
        subtitle: '12,000+ editors, filmmakers, and builders sharing feedback',
        linkUrl: 'https://discord.com',
        color: 'yellow',
        logoSrc: BRAND_LOGOS.discord,
        badgeText: 'COMMUNITY',
        expanded: false,
      },
      {
        id: 'arch-4',
        title: 'Late Night Focus Beats',
        subtitle: 'Curated instrumental tracks for deep editing sessions',
        linkUrl: 'https://spotify.com',
        color: 'green',
        logoSrc: BRAND_LOGOS.spotify,
        badgeText: 'LISTEN',
        expanded: false,
      },
    ],
  },
  {
    id: 'founder',
    name: 'Founder & Writer',
    icon: Edit01Icon,
    creatorName: 'Marcus Vance',
    creatorRole: 'Bootstrapped SaaS Founder & Author',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    theme: 'clay',
    cards: [
      {
        id: 'arch-5',
        title: 'Zero to $50k MRR: The Full Breakdown',
        subtitle: 'Read our transparent essay on product pricing, churn, and distribution',
        linkUrl: 'https://substack.com',
        color: 'orange',
        logoSrc: BRAND_LOGOS.substack,
        badgeText: 'ESSAY',
        expanded: true,
      },
      {
        id: 'arch-6',
        title: 'Open Source Micro-SaaS Template on GitHub',
        subtitle: 'Next.js 15, Tailwind, Stripe, and Auth starter repo',
        linkUrl: 'https://github.com',
        color: 'dark',
        logoSrc: BRAND_LOGOS.github,
        badgeText: 'FREE CODE',
        expanded: false,
      },
      {
        id: 'arch-7',
        title: 'Follow My Daily Building Logs on X',
        subtitle: 'Real-time revenue metrics, UI iterations, and founder learnings',
        linkUrl: 'https://x.com',
        color: 'purple',
        badgeText: 'DAILY THREAD',
        expanded: false,
      },
    ],
  },
  {
    id: 'musician',
    name: 'Musician & Producer',
    icon: MusicNote01Icon,
    creatorName: 'Kora & The Sun',
    creatorRole: 'Indie Electronic Artist',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    theme: 'dark',
    cards: [
      {
        id: 'arch-8',
        title: 'New Single: "Neon Horizon" Out Everywhere',
        subtitle: 'Stream the official release on Spotify, Apple Music, and YouTube',
        linkUrl: 'https://spotify.com',
        color: 'green',
        logoSrc: BRAND_LOGOS.spotify,
        badgeText: 'STREAM',
        expanded: true,
      },
      {
        id: 'arch-9',
        title: 'Fall Tour 2026: Tickets & VIP Passes',
        subtitle: 'Los Angeles • Brooklyn • London • Berlin • Tokyo',
        linkUrl: 'https://ticketmaster.com',
        color: 'purple',
        badgeText: 'SELLING FAST',
        expanded: false,
      },
      {
        id: 'arch-10',
        title: 'Official Vinyl & Limited Merch',
        subtitle: '180g Heavyweight colored vinyl with holographic sleeve',
        linkUrl: 'https://store.com',
        color: 'yellow',
        badgeText: 'PRE-ORDER',
        expanded: false,
      },
    ],
  },
  {
    id: 'consultant',
    name: 'Coach & Consultant',
    icon: Briefcase01Icon,
    creatorName: 'Elena Rostova',
    creatorRole: 'Brand Strategist & Executive Coach',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    theme: 'cream',
    cards: [
      {
        id: 'arch-11',
        title: 'Book a 1-on-1 Strategy Intensive',
        subtitle: '60-minute roadmap session for high-growth tech & creator brands',
        linkUrl: 'https://calendly.com',
        color: 'purple',
        badgeText: 'BOOK CALL',
        expanded: true,
      },
      {
        id: 'arch-12',
        title: 'Direct WhatsApp Client Inquiry',
        subtitle: 'Instant chat with my executive team for custom advisory retainers',
        linkUrl: 'https://wa.me/919876543210',
        color: 'green',
        badgeText: 'WHATSAPP',
        expanded: false,
      },
      {
        id: 'arch-13',
        title: 'Q3 Brand Case Studies & Client ROI',
        subtitle: 'See how we helped 4 startups reposition for Series A fundraising',
        linkUrl: 'https://figma.com',
        color: 'orange',
        badgeText: 'PORTFOLIO',
        expanded: false,
      },
    ],
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudio,
  onOpenAuth,
  onOpenVisitorDemo,
  onOpenProModal,
  currentUser,
  userProfile,
  onSignOut,
}) => {
  const [handleInput, setHandleInput] = useState('');
  const [selectedArchetypeIndex, setSelectedArchetypeIndex] = useState(0);
  const [activeTheme, setActiveTheme] = useState<CanvasTheme>('warm');
  const [clickedCardId, setClickedCardId] = useState<string | null>(null);

  const activeArchetype = ARCHETYPES[selectedArchetypeIndex] || ARCHETYPES[0];

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handleInput.trim().replace(/^@/, '').toLowerCase();
    if (currentUser) {
      onOpenStudio(cleanHandle || undefined);
    } else {
      onOpenAuth();
    }
  };

  const handleSelectArchetype = (index: number) => {
    setSelectedArchetypeIndex(index);
    setActiveTheme(ARCHETYPES[index].theme);
  };

  const handleCardClick = (card: ProfileCardData) => {
    setClickedCardId(card.id);
    setTimeout(() => setClickedCardId(null), 1200);
  };

  const currentThemeConfig = UI_KIT.canvasThemes[activeTheme] || UI_KIT.canvasThemes.warm;

  return (
    <div className="min-h-screen bg-[#ECE7DC] text-[#1C1E22] flex flex-col font-sans selection:bg-[#5E4BF7] selection:text-white relative">
      {/* Logged in quick banner */}
      {currentUser && (
        <div className="bg-[#1C1E22] text-white px-4 py-2 text-center text-xs flex items-center justify-center gap-2 font-medium z-50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Signed in as <strong>{currentUser.email}</strong></span>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenStudio()}
            className="text-[#F8BA38] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Launch Creator Studio Dashboard</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>
      )}

      {/* 1. Header Navigation */}
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
                  Bio for Creators
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#737882]">
            <a
              href="#preview"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4"
            >
              Live Showcase
            </a>
            <a
              href="#themes"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4"
            >
              5 Free Themes
            </a>
            <a
              href="#pricing"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4 flex items-center gap-1"
            >
              <span>Pricing & Pro</span>
              <span className="px-1.5 py-0.2 rounded-md bg-[#5E4BF7]/10 text-[#5E4BF7] text-[10px] font-black">
                NEW
              </span>
            </a>
            <a
              href="#comparison"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4"
            >
              Why Switch
            </a>
            <a
              href="#testimonials"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4"
            >
              Reviews
            </a>
            <a
              href="#faq"
              className="hover:text-[#1C1E22] transition-colors hover:underline underline-offset-4"
            >
              FAQ
            </a>
          </nav>

          {/* Header CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenVisitorDemo}
              className="hidden sm:flex px-3 py-1.5 rounded-full text-xs font-bold text-[#737882] hover:text-[#1C1E22] hover:bg-black/5 transition-colors cursor-pointer"
            >
              Live Demo
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenStudio()}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  <span>Go to Dashboard</span>
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="px-2.5 py-1.5 rounded-full text-xs font-medium text-[#737882] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/80 hover:bg-white text-[#1C1E22] border border-black/10 transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <HugeiconsIcon icon={UserIcon} size={14} className="text-[#5E4BF7]" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-[#1C1E22] hover:bg-black text-white transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Create My Page</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2.5} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-12 pb-14 sm:pt-20 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#1C1E22] tracking-tight leading-[1.1] max-w-4xl mx-auto">
          One Link. Infinite Impact. <br />
          <span className="text-[#5E4BF7]">The bio page built to convert.</span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-[#555962] font-normal max-w-2xl mx-auto leading-relaxed">
          Stop losing audience engagement to a generic stack of gray buttons. Build high-converting,
          tactile card stacks for your videos, newsletters, bookings, and products in 60 seconds.
        </p>

        {/* Username Claim Bar / Logged in Dashboard CTA */}
        <div className="mt-8 sm:mt-10 max-w-md mx-auto">
          {currentUser ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => onOpenStudio()}
                className="w-full py-4 px-6 rounded-full bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white text-sm font-black shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to My Creator Studio Dashboard</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.5} />
              </button>
              <p className="text-xs text-[#737882]">
                Editing profile <strong>@{userProfile?.username || currentUser.email?.split('@')[0]}</strong>
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleClaimSubmit}
              className="flex flex-col sm:flex-row items-center gap-2 p-1.5 sm:p-2 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full border border-black/15 shadow-sm focus-within:ring-2 focus-within:ring-[#5E4BF7] transition-all"
            >
              <div className="flex items-center gap-1 pl-3.5 pr-2 py-1.5 w-full sm:w-auto text-xs sm:text-sm text-[#737882] font-mono shrink-0">
                <span className="font-bold text-[#1C1E22]">linklyra.com/</span>
                <span className="text-[#5E4BF7]">@</span>
              </div>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="yourhandle"
                className="w-full bg-transparent px-2 py-1.5 text-xs sm:text-sm font-bold text-[#1C1E22] focus:outline-none placeholder:text-[#9DA2AC]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl sm:rounded-full bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white text-xs font-bold whitespace-nowrap shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Claim Free Link</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2.5} />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 2.5 Social Proof: USED BY HUMANS AT (Continuous Auto-Slide Marquee) */}
      <section className="py-8 sm:py-12 border-y border-black/5 bg-white/40 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#8C919D] uppercase text-center">
            USED BY HUMANS AT
          </p>
        </div>

        {/* Continuous Auto-sliding Logo Marquee with pause on hover */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="animate-marquee flex items-center gap-10 sm:gap-16 select-none py-2 px-4">
            {[...Array(3)].flatMap((_, repIdx) => [
              {
                id: `google-${repIdx}`,
                name: 'Google',
                el: (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                    alt="Google"
                    className="h-5 sm:h-6 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                ),
              },
              {
                id: `wipro-${repIdx}`,
                name: 'Wipro',
                el: (
                  <div className="flex items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg"
                      alt="Wipro"
                      className="h-5 sm:h-6 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#1C1E22]">
                      wipro
                    </span>
                  </div>
                ),
              },
              {
                id: `tcs-${repIdx}`,
                name: 'TCS',
                el: (
                  <div className="flex items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg"
                      alt="TCS"
                      className="h-5 sm:h-6 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ),
              },
              {
                id: `zeemedia-${repIdx}`,
                name: 'Zee Media',
                el: (
                  <div className="flex items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d4/Zee_Entertainment_Enterprises_logo.svg"
                      alt="Zee Media"
                      className="h-5 sm:h-6 w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-base sm:text-lg font-black tracking-tight text-[#1C1E22]">
                      ZEE <span className="font-semibold text-xs text-stone-500 uppercase tracking-wider">MEDIA</span>
                    </span>
                  </div>
                ),
              },
              {
                id: `notion-${repIdx}`,
                name: 'Notion',
                el: (
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://cdn.simpleicons.org/notion/000000"
                      alt="Notion"
                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#1C1E22]">
                      Notion
                    </span>
                  </div>
                ),
              },
              {
                id: `slack-${repIdx}`,
                name: 'Slack',
                el: (
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"
                      alt="Slack"
                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#1C1E22]">
                      Slack
                    </span>
                  </div>
                ),
              },
              {
                id: `databricks-${repIdx}`,
                name: 'Databricks',
                el: (
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://cdn.simpleicons.org/databricks/FF3621"
                      alt="Databricks"
                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#1C1E22]">
                      Databricks
                    </span>
                  </div>
                ),
              },
              {
                id: `atlassian-${repIdx}`,
                name: 'Atlassian',
                el: (
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://cdn.simpleicons.org/atlassian/0052CC"
                      alt="Atlassian"
                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#1C1E22]">
                      Atlassian
                    </span>
                  </div>
                ),
              },
              {
                id: `spotify-${repIdx}`,
                name: 'Spotify',
                el: (
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://cdn.simpleicons.org/spotify/1DB954"
                      alt="Spotify"
                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-base sm:text-lg font-bold tracking-tight text-[#1C1E22]">
                      Spotify
                    </span>
                  </div>
                ),
              },
            ]).map((item) => (
              <div
                key={item.id}
                className="flex items-center shrink-0 transition-transform duration-200 hover:scale-105"
              >
                {item.el}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Interactive Live Showcase */}
      <section
        id="preview"
        className="py-12 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full"
      >
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-bold text-[#1C1E22] mb-3">
            <HugeiconsIcon icon={FlashIcon} size={14} className="text-amber-500" />
            <span>Interactive Live Showcase</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1C1E22] tracking-tight">
            See how LinkLyra turns clicks into conversions
          </h2>
          <p className="text-xs sm:text-sm text-[#737882] mt-2 max-w-lg mx-auto">
            Select a creator archetype below and interact with the live phone canvas.
          </p>

          {/* Archetype Selector Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {ARCHETYPES.map((arch, idx) => {
              const isSelected = selectedArchetypeIndex === idx;
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => handleSelectArchetype(idx)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C1E22] text-white shadow-sm scale-105'
                      : 'bg-white/80 text-[#1C1E22] border border-black/10 hover:bg-white'
                  }`}
                >
                  <HugeiconsIcon
                    icon={arch.icon}
                    size={16}
                    className={isSelected ? 'text-[#F8BA38]' : 'text-[#5E4BF7]'}
                  />
                  <span>{arch.name}</span>
                </button>
              );
            })}
          </div>

          {/* Theme Palette Switcher */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] font-bold text-[#737882] mr-1">Preview Theme:</span>
            {(Object.keys(UI_KIT.canvasThemes) as CanvasTheme[]).map((themeKey) => {
              const theme = UI_KIT.canvasThemes[themeKey];
              const isSelected = activeTheme === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setActiveTheme(themeKey)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-[#1C1E22] border-black shadow-2xs font-extrabold'
                      : 'bg-white/50 text-[#737882] border-black/10 hover:bg-white'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full border border-black/20"
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
                          : themeKey === 'minimal'
                          ? '#F8F9FA'
                          : '#F5F2EB',
                    }}
                  />
                  <span>{theme.name}</span>
                  {theme.isPro && (
                    <span className="px-1 py-0.1 rounded text-[8px] font-black bg-[#5E4BF7] text-white">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Phone Mockup */}
        <div className="max-w-md mx-auto">
          <div
            className={`w-full ${currentThemeConfig.bgClass} rounded-[36px] p-5 sm:p-7 shadow-2xl border border-black/10 transition-all duration-300 relative overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white shrink-0">
                <img
                  src={activeArchetype.avatarUrl}
                  alt={activeArchetype.creatorName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h3
                    className={`text-base font-bold leading-tight truncate ${
                      currentThemeConfig.isDark ? 'text-white' : 'text-[#1C1E22]'
                    }`}
                  >
                    {activeArchetype.creatorName}
                  </h3>
                  <span className="w-3.5 h-3.5 rounded-full bg-[#5E4BF7] text-white flex items-center justify-center text-[8px] shrink-0">
                    ✓
                  </span>
                </div>
                <p
                  className={`text-xs font-medium truncate mt-0.5 ${
                    currentThemeConfig.isDark ? 'text-white/70' : 'text-[#737882]'
                  }`}
                >
                  {activeArchetype.creatorRole}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/80 border border-black/10 flex items-center justify-center text-[#1C1E22] text-xs shadow-2xs">
                <HugeiconsIcon icon={Settings01Icon} size={14} />
              </div>
            </div>

            {/* Live Cards Stack */}
            <div className="space-y-3">
              {activeArchetype.cards.map((card) => (
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
                    onClick={() => handleCardClick(card)}
                  />
                  {clickedCardId === card.id && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-2xs rounded-[24px] flex items-center justify-center text-xs font-bold text-white animate-fadeIn pointer-events-none">
                      Opening Link Destination...
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Live Phone Footer */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-black/10 text-[11px] font-bold text-[#1C1E22] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#5E4BF7]" />
                <span>LinkLyra</span>
                <span className="text-[#737882] font-normal">•</span>
                <span className="text-[#737882]">@{activeArchetype.id}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1E22] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>Build My Profile Like This</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. 5 Free Themes Showcase */}
      <section id="themes" className="py-14 sm:py-20 bg-white/60 border-y border-black/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
              <HugeiconsIcon icon={Tick01Icon} size={14} className="text-emerald-600" />
              <span>100% Free Forever</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1C1E22] tracking-tight">
              5 Designer Themes Included for Free
            </h2>
            <p className="text-xs sm:text-sm text-[#737882] mt-2 max-w-lg mx-auto">
              No paywalls on clean aesthetics. Choose from 5 handcrafted canvas palettes out of the box with zero subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Free Theme 1 */}
            <div className="p-4 rounded-3xl bg-[#F5F2EB] border border-black/10 flex flex-col justify-between h-44 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px]">
                    FREE
                  </span>
                  <div className="w-4 h-4 rounded-full bg-[#5E4BF7]" />
                </div>
                <h3 className="font-bold text-sm text-[#1C1E22] mt-3">Warm Linen</h3>
                <p className="text-[11px] text-[#737882] mt-1 leading-tight">
                  Tactile warm paper feel with optical text hierarchy.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#737882]">#F5F2EB</span>
            </div>

            {/* Free Theme 2 */}
            <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-black/10 flex flex-col justify-between h-44 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px]">
                    FREE
                  </span>
                  <div className="w-4 h-4 rounded-full bg-[#E75646]" />
                </div>
                <h3 className="font-bold text-sm text-[#1C1E22] mt-3">Oat Cream</h3>
                <p className="text-[11px] text-[#737882] mt-1 leading-tight">
                  Soft neutral tones favored by writers and personal brands.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#737882]">#FAF8F5</span>
            </div>

            {/* Free Theme 3 */}
            <div className="p-4 rounded-3xl bg-[#FFFFFF] border border-black/10 flex flex-col justify-between h-44 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px]">
                    FREE
                  </span>
                  <div className="w-4 h-4 rounded-full bg-[#F8BA38]" />
                </div>
                <h3 className="font-bold text-sm text-[#1C1E22] mt-3">Studio White</h3>
                <p className="text-[11px] text-[#737882] mt-1 leading-tight">
                  Ultra-clean gallery contrast for photography & portfolios.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#737882]">#FFFFFF</span>
            </div>

            {/* Free Theme 4 */}
            <div className="p-4 rounded-3xl bg-[#191A1E] text-white border border-black/10 flex flex-col justify-between h-44 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[9px]">
                    FREE
                  </span>
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
                <h3 className="font-bold text-sm text-white mt-3">Midnight Dark</h3>
                <p className="text-[11px] text-white/70 mt-1 leading-tight">
                  High-contrast obsidian theme for developers & night owls.
                </p>
              </div>
              <span className="text-[10px] font-mono text-white/50">#191A1E</span>
            </div>

            {/* Free Theme 5 */}
            <div className="p-4 rounded-3xl bg-[#EFEBE4] border border-black/10 flex flex-col justify-between h-44 shadow-2xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px]">
                    FREE
                  </span>
                  <div className="w-4 h-4 rounded-full bg-[#D2EAA5]" />
                </div>
                <h3 className="font-bold text-sm text-[#1C1E22] mt-3">Clay Stone</h3>
                <p className="text-[11px] text-[#737882] mt-1 leading-tight">
                  Architectural earth tone with crisp modern card borders.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#737882]">#EFEBE4</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Transparent Pricing & Pro Monetization */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E4BF7]/10 text-[#5E4BF7] text-xs font-extrabold mb-3">
            <HugeiconsIcon icon={CrownIcon} size={14} />
            <span>Simple, Transparent Pricing for India & Global Creators</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#1C1E22] tracking-tight">
            Start Free. Upgrade as You Scale.
          </h2>
          <p className="text-xs sm:text-sm text-[#737882] mt-2 max-w-lg mx-auto">
            Everything you need to launch a high-converting bio link. Pay securely via UPI, Google Pay, PhonePe, or Cards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Free Tier Card */}
          <div className="p-6 sm:p-7 rounded-[32px] bg-white border border-black/10 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-[#1C1E22]">Starter Free</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-black/5 text-[#1C1E22] font-bold text-[11px]">
                  Free Forever
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-[#1C1E22]">₹0</span>
                <span className="text-xs text-[#737882] font-semibold">/ month</span>
              </div>
              <p className="text-xs text-[#737882] leading-relaxed">
                Perfect for students and casual creators launching their first bio page.
              </p>

              <div className="pt-4 border-t border-black/5 space-y-2 text-xs text-[#1C1E22] font-semibold">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-emerald-600 shrink-0" />
                  <span>Unlimited Link & Media Cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-emerald-600 shrink-0" />
                  <span>5 Clean Starter Themes</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-emerald-600 shrink-0" />
                  <span>WhatsApp & Email Lead Capture</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-emerald-600 shrink-0" />
                  <span>QR Code Sharing & Realtime Clicks</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-emerald-600 shrink-0" />
                  <span>Basic AI Bio Generator</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                className="w-full py-3 rounded-full bg-[#1C1E22] hover:bg-black text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Create Free Page
              </button>
            </div>
          </div>

          {/* Pro Tier Card */}
          <div className="p-6 sm:p-7 rounded-[32px] bg-[#1C1E22] text-white border-2 border-[#5E4BF7] shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Top right popular tag */}
            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F8BA38] text-[#191A1E] font-black text-[9px] tracking-wider uppercase shadow-xs">
                MOST POPULAR
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CrownIcon} size={20} className="text-[#F8BA38]" />
                <h3 className="text-lg font-black text-white">Creator Pro</h3>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-white">₹199</span>
                  <span className="text-xs text-white/70 font-semibold">/ month</span>
                </div>
                <p className="text-[11px] text-[#F8BA38] font-bold mt-0.5">
                  or ₹1,499 / year (~₹125/mo — Save 37%)
                </p>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                For YouTubers, Instagram creators, and freelancers who need pro branding.
              </p>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-white/95 font-semibold">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#F8BA38] shrink-0" />
                  <span><strong>All 12+ Pro Themes</strong> (Glass, Gold, Sunset)</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#F8BA38] shrink-0" />
                  <span><strong>Custom Domain</strong> (<code>links.yourname.com</code>)</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#F8BA38] shrink-0" />
                  <span><strong>100% White-Label</strong> (No branding)</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#F8BA38] shrink-0" />
                  <span><strong>Verified Gold Badge</strong> on profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#F8BA38] shrink-0" />
                  <span><strong>Unlimited AI Bio & Theme Generations</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#F8BA38] shrink-0" />
                  <span><strong>Advanced Geo Analytics</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => onOpenProModal ? onOpenProModal('Creator Pro Plan') : (currentUser ? onOpenStudio() : onOpenAuth())}
                className="w-full py-3 rounded-full bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white text-xs font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Upgrade to Pro (₹199)</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Business Tier Card */}
          <div className="p-6 sm:p-7 rounded-[32px] bg-white border border-black/10 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-[#1C1E22]">Agency & Business</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#5E4BF7]/10 text-[#5E4BF7] font-bold text-[11px]">
                  For Teams
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#1C1E22]">₹699</span>
                  <span className="text-xs text-[#737882] font-semibold">/ month</span>
                </div>
                <p className="text-[11px] text-[#5E4BF7] font-bold mt-0.5">
                  or ₹5,499 / year (~₹458/mo)
                </p>
              </div>
              <p className="text-xs text-[#737882] leading-relaxed">
                For coaching institutes, real estate agents, agencies, and e-commerce stores.
              </p>

              <div className="pt-4 border-t border-black/5 space-y-2 text-xs text-[#1C1E22] font-semibold">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#5E4BF7] shrink-0" />
                  <span><strong>Everything in Pro included (100% Unlocked)</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#5E4BF7] shrink-0" />
                  <span><strong>5 Multi-Profile Sub-accounts</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#5E4BF7] shrink-0" />
                  <span><strong>Unlimited Lead CRM Export to CSV & Sheets</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#5E4BF7] shrink-0" />
                  <span><strong>Meta & Google Ads Pixel Tracking</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#5E4BF7] shrink-0" />
                  <span><strong>Unlimited AI Assistant with Priority</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="text-[#5E4BF7] shrink-0" />
                  <span><strong>Dedicated WhatsApp Account Mgr</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => onOpenProModal ? onOpenProModal('Agency & Business Plan') : (currentUser ? onOpenStudio() : onOpenAuth())}
                className="w-full py-3 rounded-full bg-white hover:bg-black/5 text-[#1C1E22] border border-black/15 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                Get Business Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Honest Comparison: Linktree vs LinkLyra */}
      <section id="comparison" className="py-14 sm:py-20 bg-white/60 border-y border-black/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1E22] tracking-tight">
              Why Creators Are Leaving Linktree for LinkLyra
            </h2>
            <p className="text-xs sm:text-sm text-[#737882] mt-1.5">
              An honest side-by-side comparison of features, pricing, and visual impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* The Old Way */}
            <div className="p-6 rounded-3xl bg-stone-100 border border-stone-200 space-y-3 text-stone-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  The Old Way (Generic Linktree)
                </span>
                <HugeiconsIcon icon={CancelCircleIcon} size={18} className="text-red-500" />
              </div>
              <ul className="space-y-2.5 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Every link is an identical flat rectangle with zero context.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>$10 to $24/month just to change a basic background color.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Cluttered with ads and heavy third-party tracking scripts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>No direct WhatsApp lead routing or rich contextual badges.</span>
                </li>
              </ul>
            </div>

            {/* LinkLyra Way */}
            <div className="p-6 rounded-3xl bg-[#1C1E22] text-white border border-black/10 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  The LinkLyra Way
                </span>
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} className="text-emerald-400" />
              </div>
              <ul className="space-y-2.5 text-xs text-white/85">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Tactile cards with headlines, subtitles, and vibrant action badges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>5 Free Designer Themes included out of the box with zero subscriptions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>1-Click WhatsApp Lead Generator for coaching, consulting, & business.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Affordable Pro Tier ($5/mo) for Custom Domains and White-Labeling.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6.5. Tile Reveal Testimonials Animation Section (React Bits Pro Tile Reveal) */}
      <TileRevealTestimonials onOpenStudio={() => (currentUser ? onOpenStudio() : onOpenAuth())} />

      {/* 7. FAQ Section */}
      <section id="faq" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-xs font-bold text-[#1C1E22] mb-3">
            <HugeiconsIcon icon={HelpCircleIcon} size={14} />
            <span>Creator FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C1E22] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-white border border-black/10 space-y-1.5 shadow-2xs">
            <h3 className="font-bold text-sm text-[#1C1E22]">
              Is the Free Plan truly free forever?
            </h3>
            <p className="text-xs text-[#737882] leading-relaxed">
              Yes. The Starter plan includes 5 designer themes, unlimited link cards, click analytics, and your custom <code>linklyra.com/@username</code> handle with zero expiration and no credit card required.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/10 space-y-1.5 shadow-2xs">
            <h3 className="font-bold text-sm text-[#1C1E22]">
              What do I get with LinkLyra Pro?
            </h3>
            <p className="text-xs text-[#737882] leading-relaxed">
              LinkLyra Pro ($5/month billed yearly) gives you all 10+ Pro Themes (like Glassmorphism, Sunset Coral, and Champagne Gold), Custom Domain mapping (e.g. <code>links.yourname.com</code>), complete watermark removal, and deep referrer analytics.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/10 space-y-1.5 shadow-2xs">
            <h3 className="font-bold text-sm text-[#1C1E22]">
              Where can I share my LinkLyra profile?
            </h3>
            <p className="text-xs text-[#737882] leading-relaxed">
              Add your link directly into your Instagram, TikTok, YouTube channel description, X/Twitter bio, LinkedIn profile, Substack header, or WhatsApp business status.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/10 space-y-1.5 shadow-2xs">
            <h3 className="font-bold text-sm text-[#1C1E22]">
              How does the WhatsApp Lead generator work?
            </h3>
            <p className="text-xs text-[#737882] leading-relaxed">
              Enter your WhatsApp number in the Studio. When visitors tap your product, consultation, or service card, it automatically opens WhatsApp with a pre-filled message (e.g., "Hi, I am interested in [Item]...") directly to your phone.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-[36px] bg-[#1C1E22] text-white border border-black/15 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#5E4BF7]/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-[#E75646]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-white">
              <HugeiconsIcon icon={FlashIcon} size={14} className="text-[#F8BA38]" />
              <span>Ready in 60 seconds</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to give your audience something worth tapping?
            </h2>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Join thousands of creators, founders, writers, and artists who replaced boring link lists with LinkLyra.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#5E4BF7] hover:bg-[#4E3BE5] text-white text-xs sm:text-sm font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Claim Your Free Page</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.5} />
              </button>

              <button
                type="button"
                onClick={onOpenVisitorDemo}
                className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all cursor-pointer"
              >
                Explore Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className={`mt-auto w-full ${UI_KIT.glass.footer} py-8 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737882]">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#1C1E22] text-white flex items-center justify-center font-black text-[10px] shadow-xs">
              {UI_KIT.brand.shortName}
            </div>
            <div>
              <span className="font-extrabold text-[#1C1E22] mr-2">{UI_KIT.brand.name}</span>
              <span>© {new Date().getFullYear()} • The Modular Bio Page for Creators</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-5 font-bold">
            <button
              type="button"
              onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
              className="hover:text-[#1C1E22] transition-colors cursor-pointer"
            >
              Studio
            </button>
            <button
              type="button"
              onClick={onOpenVisitorDemo}
              className="hover:text-[#1C1E22] transition-colors cursor-pointer"
            >
              Live Demo
            </button>
            <button
              type="button"
              onClick={onOpenAuth}
              className="hover:text-[#1C1E22] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <a
              href="#pricing"
              className="hover:text-[#1C1E22] transition-colors"
            >
              Pro Pricing
            </a>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#737882]">
            <HugeiconsIcon icon={CloudIcon} size={14} className="text-emerald-600" />
            <span>High-Speed Cloud Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
