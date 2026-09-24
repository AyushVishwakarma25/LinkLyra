import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Video01Icon,
  Briefcase01Icon,
  Edit01Icon,
  GlobeIcon,
  CheckmarkCircle01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { ProfileCard } from './ProfileCard';
import { ProfileCardData, CanvasTheme, UserProfile } from '../types';
import { BRAND_LOGOS } from '../data';
import { User as FirebaseUser } from 'firebase/auth';
import { TileRevealTestimonials } from './TileRevealTestimonials';
import { IPhoneMockup3D } from './IPhoneMockup3D';
import { CreatorScrollStack } from './CreatorScrollStack';
import { TemplateCardsSection } from './TemplateCardsSection';

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
  category: 'creator' | 'designer' | 'realtor' | 'business';
  label: string;
  icon: any;
  creatorName: string;
  creatorRole: string;
  bio: string;
  handle: string;
  avatarUrl: string;
  socials: string[];
  theme: CanvasTheme;
  cards: ProfileCardData[];
}

const ARCHETYPES: CreatorArchetype[] = [
  {
    id: 'designer',
    name: 'Designer / Founder',
    category: 'designer',
    label: 'Founder Profile',
    icon: Edit01Icon,
    creatorName: 'Ayush Vishwakarma',
    creatorRole: 'Designer / Founder',
    bio: 'Crafting tactile software, high-craft brand systems, and living digital identities.',
    handle: '@ayushvishwakarma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    socials: ['Instagram', 'Twitter/X', 'GitHub', 'LinkedIn'],
    theme: 'warm',
    cards: [
      {
        id: 'card-instagram',
        title: 'Instagram',
        subtitle: 'Behind the scenes, design systems, and daily stories',
        linkUrl: 'https://instagram.com',
        color: 'purple',
        logoSrc: BRAND_LOGOS.instagram,
        badgeText: 'SOCIAL',
        expanded: false,
      },
      {
        id: 'card-portfolio',
        title: 'My Portfolio',
        subtitle: 'Selected case studies in software architecture and visual design',
        linkUrl: 'https://behance.net',
        color: 'dark',
        badgeText: 'PORTFOLIO',
        expanded: true,
      },
      {
        id: 'card-work-with-me',
        title: 'Work With Me',
        subtitle: 'Consulting, design sprints, and brand partnerships',
        linkUrl: 'https://calendly.com',
        color: 'orange',
        badgeText: 'CONTACT',
        expanded: false,
      },
      {
        id: 'card-latest-project',
        title: 'Latest Project',
        subtitle: 'Tactile software components & minimal design foundations',
        linkUrl: 'https://github.com',
        color: 'green',
        badgeText: 'FEATURED',
        expanded: false,
      },
    ],
  },
  {
    id: 'creator',
    name: 'Creators',
    category: 'creator',
    label: 'Creator Profile',
    icon: Video01Icon,
    creatorName: 'Maya Lin',
    creatorRole: 'Visual Filmmaker & 3D Artist',
    bio: 'Visual essays on technology, cinematic spaces, and tactile computing.',
    handle: '@mayalin',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    socials: ['YouTube', 'Instagram', 'TikTok'],
    theme: 'warm',
    cards: [
      {
        id: 'creator-reel',
        title: 'Featured Reel: Building My Studio 2026',
        subtitle: 'Complete breakdown of tactile lighting, custom audio, and minimal cable management',
        linkUrl: 'https://youtube.com',
        color: 'purple',
        logoSrc: BRAND_LOGOS.youtube,
        badgeText: 'FEATURED REEL',
        expanded: true,
      },
      {
        id: 'creator-shop',
        title: 'Cinematic LUTs & 3D Asset Pack',
        subtitle: 'The exact color science profiles and Blender lighting setups used across my channel',
        linkUrl: 'https://gumroad.com',
        color: 'orange',
        badgeText: '$29 SHOP',
        expanded: false,
      },
      {
        id: 'creator-sponsor',
        title: 'Sponsor The Next Episode',
        subtitle: 'Pre-roll and dedicated brand partnerships reaching 140K+ creative builders',
        linkUrl: 'https://calendly.com',
        color: 'dark',
        badgeText: 'SPONSOR',
        expanded: false,
      },
      {
        id: 'creator-community',
        title: 'The Creator Guild Community',
        subtitle: '14,000+ video editors, motion designers, and builders sharing weekly critiques',
        linkUrl: 'https://discord.com',
        color: 'yellow',
        logoSrc: BRAND_LOGOS.discord,
        badgeText: 'COMMUNITY',
        expanded: false,
      },
    ],
  },
  {
    id: 'business',
    name: 'Businesses',
    category: 'business',
    label: 'Business Profile',
    icon: GlobeIcon,
    creatorName: 'Komorebi Roasters',
    creatorRole: 'Specialty Micro-Roastery & Slow Bar',
    bio: 'Direct-trade single-origin coffees, Japanese pour-overs, and daily sourdough bakery.',
    handle: '@komorebiroasters',
    avatarUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
    socials: ['Daily 7:30 AM–8 PM', 'Arts District', 'WhatsApp'],
    theme: 'cream',
    cards: [
      {
        id: 'business-order',
        title: "Order Today's Fresh Roast Online",
        subtitle: 'Single-origin Ethiopian Yirgacheffe & Colombian Geisha roasted in-house daily',
        linkUrl: 'https://komorebi.coffee',
        color: 'orange',
        badgeText: 'ORDER ONLINE',
        expanded: true,
      },
      {
        id: 'business-whatsapp',
        title: 'WhatsApp Tasting Table Booking',
        subtitle: '1-tap instant reservation for pour-over flights and origin cupping sessions',
        linkUrl: 'https://wa.me/14155552671',
        color: 'green',
        badgeText: '1-TAP WHATSAPP',
        expanded: false,
      },
      {
        id: 'business-menu',
        title: 'Seasonal Slow Bar & Bakery Menu',
        subtitle: 'Ceremonial grade matcha, nitro cold brews, and freshly baked cardamom buns',
        linkUrl: 'https://komorebi.coffee/menu',
        color: 'yellow',
        badgeText: 'MENU',
        expanded: false,
      },
      {
        id: 'business-location',
        title: 'Roastery Hours & Arts District Location',
        subtitle: 'Open daily 7:30 AM–8 PM at 410 S Santa Fe Ave, Arts District',
        linkUrl: 'https://maps.google.com',
        color: 'dark',
        badgeText: 'VISIT US',
        expanded: false,
      },
    ],
  },
  {
    id: 'realtor',
    name: 'Professionals',
    category: 'realtor',
    label: 'Professional Profile',
    icon: Briefcase01Icon,
    creatorName: 'David Sterling',
    creatorRole: 'Luxury Architectural Estates',
    bio: 'Specializing in mid-century modern and trophy residential sanctuaries across coastal California.',
    handle: '@sterlingestates',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    socials: ['WhatsApp', 'LinkedIn', 'Direct Call'],
    theme: 'clay',
    cards: [
      {
        id: 'realtor-property',
        title: 'The Glass Pavilion — Oceanfront Penthouse',
        subtitle: '6,400 sq.ft private rooftop terrace, infinity plunge pool, and panoramic sunset views ($2,850,000)',
        linkUrl: 'https://sterlingestates.com',
        color: 'orange',
        badgeText: 'JUST LISTED',
        expanded: true,
      },
      {
        id: 'realtor-showing',
        title: 'Request Private Showing',
        subtitle: 'Book a confidential walkthrough with David Sterling and our private estate team',
        linkUrl: 'https://calendly.com',
        color: 'dark',
        badgeText: 'SHOWINGS',
        expanded: false,
      },
      {
        id: 'realtor-valuation',
        title: 'Instant Home Valuation',
        subtitle: 'Receive a detailed comparative market analysis and private valuation for your property',
        linkUrl: 'https://sterlingestates.com/valuation',
        color: 'purple',
        badgeText: 'VALUATION',
        expanded: false,
      },
      {
        id: 'realtor-listings',
        title: '14 Off-Market Architectural Listings',
        subtitle: 'Download confidential portfolio with floor plans, high-res renders, and pricing disclosures',
        linkUrl: 'https://sterlingestates.com/listings',
        color: 'green',
        badgeText: 'PORTFOLIO',
        expanded: false,
      },
    ],
  },
];



export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudio,
  onOpenAuth,
  currentUser,
}) => {
  const [handleInput, setHandleInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clickedCardId, setClickedCardId] = useState<string | null>(null);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = handleInput.trim().replace(/^@/, '').toLowerCase();
    if (currentUser) {
      onOpenStudio(cleanHandle || undefined);
    } else {
      onOpenAuth();
    }
  };

  const handleCardClick = (card: ProfileCardData) => {
    setClickedCardId(card.id);
    setTimeout(() => setClickedCardId(null), 1200);
  };

  /**
   * Dedicated Live Profile Card Stack component inside 3D iPhone Mockup
   * Persistent visual language of actual profiles across every section:
   * [ LIVE PROFILE ] -> Name/Role -> Socials -> Real ProfileCards -> BUILT WITH LINKLYRA
   */
  const renderLiveProfile = (
    archetype: CreatorArchetype,
    tiltAngle: 'right' | 'left' | 'straight' = 'right'
  ) => (
    <IPhoneMockup3D tiltAngle={tiltAngle}>
      <div className="p-4 sm:p-5 text-left select-none space-y-3.5 bg-white">
        {/* Top Bar: [ LIVE PROFILE ] + username badge */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/5 text-[#111111] border border-black/5">
            LIVE PROFILE
          </span>
          <span className="text-[11px] font-mono text-[#888888] truncate max-w-[170px]">
            linklyra.com/{archetype.handle}
          </span>
        </div>

        {/* Profile Header: Avatar + Name + Verified Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white shrink-0">
            <img
              src={archetype.avatarUrl}
              alt={archetype.creatorName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-black text-[#111111] tracking-tight truncate">
                {archetype.creatorName}
              </h3>
              <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-2xs">
                ✓
              </span>
            </div>
            <p className="text-xs font-semibold text-[#666666] truncate mt-0.5">
              {archetype.creatorRole}
            </p>
          </div>
        </div>

        {/* One-sentence bio */}
        <p className="text-xs text-[#555555] leading-relaxed">
          {archetype.bio}
        </p>

        {/* Social Pills */}
        <div className="flex flex-wrap gap-1.5">
          {archetype.socials.map((soc) => (
            <span
              key={soc}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FAFAF7] border border-[#E8E8E8] text-[#111111] shadow-2xs"
            >
              {soc}
            </span>
          ))}
        </div>

        {/* Real LinkLyra ProfileCards Stack */}
        <div className="space-y-2.5">
          {archetype.cards.map((card) => (
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
                <div className="absolute inset-0 bg-black/30 backdrop-blur-2xs rounded-[24px] flex items-center justify-center text-xs font-bold text-white animate-fadeIn pointer-events-none z-20">
                  Opening Destination...
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="pt-1 border-t border-[#E8E8E8]" />

        {/* BUILT WITH LINKLYRA Badge */}
        <div className="text-center pb-1">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-[#E8E8E8] text-[10px] font-extrabold uppercase tracking-wider text-[#111111] shadow-2xs">
            BUILT WITH LINKLYRA
          </span>
        </div>
      </div>
    </IPhoneMockup3D>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111] flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white relative">
      {/* Top Banner if signed in */}
      {currentUser && (
        <div className="bg-[#111111] text-white px-4 py-2 text-center text-xs flex items-center justify-center gap-2 font-medium z-50">
          <span>Signed in as <strong>{currentUser.email}</strong></span>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenStudio()}
            className="text-[#F8BA38] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Launch Creator Studio</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>
      )}

      {/* Header — Brand Foundation + Minimal Nav */}
      <div className="sticky top-3 sm:top-5 z-50 w-full px-3 sm:px-6 max-w-5xl mx-auto">
        <header className="bg-[#18181B] text-white rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border border-white/10 shadow-xl flex items-center justify-between backdrop-blur-md transition-all">
          {/* Left: LinkLyra logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-left cursor-pointer group"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#111111] flex items-center justify-center font-black text-xs tracking-tight shadow-xs group-hover:scale-105 transition-transform">
              LL
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-white font-sans">
              LINKLYRA
            </span>
          </button>

          {/* Center: Primary navigation */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-300">
            <a href="#product" className="hover:text-white transition-colors cursor-pointer">
              Product
            </a>
            <a href="#templates" className="hover:text-white transition-colors cursor-pointer">
              Templates
            </a>
            <a href="#creators" className="hover:text-white transition-colors cursor-pointer">
              Creators
            </a>
            <a href="#businesses" className="hover:text-white transition-colors cursor-pointer">
              Businesses
            </a>
          </nav>

          {/* Right: Log in & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <button
                type="button"
                onClick={() => onOpenStudio()}
                className="px-4 py-2 rounded-full text-xs font-bold bg-white text-[#111111] hover:bg-zinc-100 transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-white text-[#111111] hover:bg-zinc-100 transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Create your LinkLyra →</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-1 hover:text-zinc-300 cursor-pointer flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <span className="text-xl font-bold leading-none select-none">≡</span>
          </button>
        </header>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-[#18181B] text-white rounded-[24px] p-5 border border-white/10 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <nav className="flex flex-col gap-3 text-sm font-medium text-zinc-200">
              <a
                href="#product"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1 cursor-pointer"
              >
                Product
              </a>
              <a
                href="#templates"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1 cursor-pointer"
              >
                Templates
              </a>
              <a
                href="#creators"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1 cursor-pointer"
              >
                Creators
              </a>
              <a
                href="#businesses"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1 cursor-pointer"
              >
                Businesses
              </a>
            </nav>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenStudio();
                  }}
                  className="w-full py-3 rounded-full text-xs font-bold bg-white text-[#111111] hover:bg-zinc-100 transition-all text-center cursor-pointer"
                >
                  Go to Studio Dashboard →
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="text-left text-xs font-medium text-zinc-300 hover:text-white transition-colors py-1 cursor-pointer"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-3 rounded-full text-xs font-bold bg-white text-[#111111] hover:bg-zinc-100 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Create your LinkLyra →</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO — Real Profile (Ayush Vishwakarma) -> Label -> One sentence */}
      {/* ========================================================================= */}
      <section className="pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Copy & Claim Action */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-5">
            {/* Small eyebrow */}
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-[#E8E8E8] shadow-2xs">
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#666666] uppercase font-mono">
                YOUR DIGITAL HOME
              </span>
            </div>

            {/* H1 */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#111111] tracking-tight leading-[1.05]">
              One link.<br />
              A whole you.
            </h1>

            {/* Subtext (One sentence) */}
            <p className="text-base sm:text-lg text-[#555555] max-w-xl font-normal leading-relaxed">
              Create a profile that looks like a high-end personal site, works for your business, and gives people somewhere to go.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create your LinkLyra →</span>
              </button>
              <a
                href="#templates"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-stone-50 text-[#111111] text-xs sm:text-sm font-bold border border-[#E8E8E8] shadow-2xs hover:border-black/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                <span>Explore templates</span>
              </a>
            </div>

            {/* Handle claim bar */}
            {!currentUser && (
              <div className="pt-2 max-w-sm mx-auto lg:mx-0">
                <form
                  onSubmit={handleClaimSubmit}
                  className="flex items-center gap-1.5 p-1.5 bg-white rounded-full border border-[#E8E8E8] shadow-2xs focus-within:border-black/40 transition-all"
                >
                  <div className="flex items-center gap-1 pl-3 text-xs text-[#777777] font-mono shrink-0">
                    <span className="font-semibold text-[#111111]">linklyra.com/</span>
                    <span className="text-[#4F46E5] font-bold">@</span>
                  </div>
                  <input
                    type="text"
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    placeholder="ayushvishwakarma"
                    className="w-full bg-transparent px-1.5 py-1 text-xs font-semibold text-[#111111] focus:outline-none placeholder:text-[#999999]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-full bg-[#111111] hover:bg-black text-white text-[11px] font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    Claim
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right: Starring Live Profile (Ayush Vishwakarma) */}
          <div className="lg:col-span-6 flex justify-center">
            {renderLiveProfile(ARCHETYPES[0])}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: CREATORS — Progressive Card Stacking Scroll Effect (Mockup)     */}
      {/* ========================================================================= */}
      <CreatorScrollStack
        onOpenStudio={() => onOpenStudio()}
        onOpenAuth={onOpenAuth}
        currentUser={currentUser}
      />

      {/* ========================================================================= */}
      {/* SECTION 3: TEMPLATES — "For Whom It's For" (6 Archetype Cards)             */}
      {/* ========================================================================= */}
      <TemplateCardsSection
        onOpenStudio={(handle) => onOpenStudio(handle)}
        onOpenAuth={onOpenAuth}
        currentUser={currentUser}
      />

      {/* ========================================================================= */}
      {/* SECTION 4: PROFESSIONALS — Real Profile (David Sterling) -> Label -> Copy */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E8E8E8]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Real Profile (David Sterling) */}
          <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center">
            {renderLiveProfile(ARCHETYPES[3])}
          </div>

          {/* Right: Tiny Label + One Sentence */}
          <div className="lg:col-span-6 order-1 lg:order-2 text-center lg:text-left space-y-4">
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#666666] uppercase font-mono">
              BUILT FOR HIGH-TICKET CLIENTS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight leading-[1.1]">
              Show your work before you start the conversation.
            </h2>
            <p className="text-sm sm:text-base text-[#666666] max-w-lg leading-relaxed">
              Showcase trophy estates, book confidential private showings, calculate valuations, and share private off-market disclosures seamlessly.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <span>Build your page →</span>
              </button>
            </div>
          </div>
        </div>
      </section>



      {/* ========================================================================= */}
      {/* SECTION 6: SOCIAL PROOF / TESTIMONIALS                                   */}
      {/* ========================================================================= */}
      <TileRevealTestimonials onOpenStudio={onOpenStudio} />

      {/* ========================================================================= */}
      {/* SECTION 7: FINAL CTA                                                     */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="p-8 sm:p-14 lg:p-16 rounded-[36px] bg-[#111111] text-white border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#F8BA38] uppercase font-mono">
              YOUR WORLD AWAITS
            </span>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]">
              Your link.<br />
              Your world.
            </h2>
            <p className="mt-4 text-base sm:text-xl text-zinc-300 font-normal">
              Build your LinkLyra profile in minutes. Free to start, forever tactile.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                className="px-8 py-4 rounded-full bg-white hover:bg-zinc-100 text-[#111111] text-sm sm:text-base font-bold shadow-xl active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Create your LinkLyra →</span>
              </button>
            </div>
            <p className="pt-2 text-xs text-zinc-400 font-medium tracking-wide">
              No credit card required · Free forever tier
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER                                                                    */}
      {/* ========================================================================= */}
      <footer className="mt-auto w-full border-t border-[#E8E8E8] bg-[#FAFAF7] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-[#E8E8E8] text-left">
            {/* Brand Block */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#111111] text-white flex items-center justify-center font-black text-xs">
                  LL
                </div>
                <span className="font-black text-base tracking-tight text-[#111111]">
                  LINKLYRA
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#666666] font-normal leading-relaxed">
                Your digital home, in one link.
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-[#666666]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#111111] transition-colors"
                >
                  Instagram
                </a>
                <span className="text-[#CCCCCC]">·</span>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#111111] transition-colors"
                >
                  LinkedIn
                </a>
                <span className="text-[#CCCCCC]">·</span>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#111111] transition-colors"
                >
                  X
                </a>
              </div>
            </div>

            {/* Column 1: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#111111]">
                Product
              </h4>
              <ul className="space-y-2 text-xs text-[#666666]">
                <li>
                  <button
                    type="button"
                    onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                    className="hover:text-[#111111] transition-colors cursor-pointer"
                  >
                    Create your page
                  </button>
                </li>
                <li>
                  <a href="#templates" className="hover:text-[#111111] transition-colors">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#product" className="hover:text-[#111111] transition-colors">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Explore */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#111111]">
                Explore
              </h4>
              <ul className="space-y-2 text-xs text-[#666666]">
                <li>
                  <a href="#creators" className="hover:text-[#111111] transition-colors">
                    Creators
                  </a>
                </li>
                <li>
                  <a href="#businesses" className="hover:text-[#111111] transition-colors">
                    Businesses
                  </a>
                </li>
                <li>
                  <a href="#creators" className="hover:text-[#111111] transition-colors">
                    Professionals
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#111111]">
                Company
              </h4>
              <ul className="space-y-2 text-xs text-[#666666]">
                <li>
                  <a href="#privacy" className="hover:text-[#111111] transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="hover:text-[#111111] transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#888888]">
            <p>© 2026 LinkLyra</p>
            <p className="font-medium text-[#666666]">
              Made for people with something to share.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
