import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Video01Icon,
  GlobeIcon,
  Briefcase01Icon,
  SparklesIcon,
  ShoppingBag01Icon,
  StarIcon,
} from '@hugeicons/core-free-icons';

export interface TemplateCardsSectionProps {
  onOpenStudio: (claimedHandle?: string) => void;
  onOpenAuth: () => void;
  currentUser?: any;
}

interface PersonaTemplate {
  id: string;
  categoryTag: string;
  forWhom: string;
  name: string;
  role: string;
  handle: string;
  avatar: string;
  themeName: string;
  bgClass: string;
  borderClass: string;
  summary: string;
  features: string[];
  cards: {
    title: string;
    badge: string;
    bgClass: string;
    textClass: string;
    badgeBg: string;
    badgeText: string;
  }[];
}

const TEMPLATES: PersonaTemplate[] = [
  {
    id: 'tpl-creators',
    categoryTag: 'FOR VIDEO & 3D ARTISTS',
    forWhom: 'Filmmakers, motion designers & short-form video creators',
    name: 'Maya Lin',
    role: 'Visual Filmmaker & 3D Artist',
    handle: '@mayalin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    themeName: 'Warm Editorial',
    bgClass: 'bg-[#FAFAF7]',
    borderClass: 'border-[#E8E8E8]',
    summary: 'Sell digital LUTs, stream YouTube masterclasses inline, and book brand sponsors with verified audience reach.',
    features: ['Featured Vertical Reel', '$29 Digital Shop', 'YouTube 4K Embed', 'Direct Brand Rate Card'],
    cards: [
      {
        title: 'Featured Reel: Studio 2026',
        badge: 'REEL',
        bgClass: 'bg-[#584CE4]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
      {
        title: 'Cinematic LUTs & 3D Pack',
        badge: '$29 SHOP',
        bgClass: 'bg-[#D95338]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
      {
        title: 'Sponsor The Next Episode',
        badge: 'SPONSOR',
        bgClass: 'bg-[#1E232B]',
        textClass: 'text-white',
        badgeBg: 'bg-white/10',
        badgeText: 'text-stone-300',
      },
    ],
  },
  {
    id: 'tpl-business',
    categoryTag: 'FOR LOCAL BRANDS & CAFES',
    forWhom: 'Specialty coffee roasters, retail boutiques & slow bars',
    name: 'Komorebi Roasters',
    role: 'Specialty Micro-Roastery',
    handle: '@komorebiroasters',
    avatar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
    themeName: 'Clean Cream',
    bgClass: 'bg-[#FFFFFF]',
    borderClass: 'border-[#E8E8E8]',
    summary: 'Take takeaway roast orders, reserve tasting flight tables via 1-tap WhatsApp, and publish live roastery hours.',
    features: ['1-Tap WhatsApp Booking', 'Daily Roast Inventory', 'Live Opening Hours', '1-Tap Maps Navigation'],
    cards: [
      {
        title: 'Order Fresh Roast Online',
        badge: 'ORDER',
        bgClass: 'bg-[#D95338]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
      {
        title: 'WhatsApp Tasting Flight Table',
        badge: 'WHATSAPP',
        bgClass: 'bg-[#2E694D]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
      {
        title: 'Arts District Roastery Hours',
        badge: 'OPEN NOW',
        bgClass: 'bg-[#1E232B]',
        textClass: 'text-white',
        badgeBg: 'bg-white/10',
        badgeText: 'text-stone-300',
      },
    ],
  },
  {
    id: 'tpl-realestate',
    categoryTag: 'FOR BROKERS & ARCHITECTS',
    forWhom: 'Luxury estate brokers, architects & private advisors',
    name: 'David Sterling',
    role: 'Luxury Architectural Estates',
    handle: '@sterlingestates',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    themeName: 'Warm Clay',
    bgClass: 'bg-[#FAFAF7]',
    borderClass: 'border-[#E8E8E8]',
    summary: 'Showcase architectural sanctuaries, qualify high-net-worth buyers with private showings, and offer instant valuations.',
    features: ['Property Showcase', 'Private Showing Intake', 'Instant Home Valuation', 'Off-Market Disclosures'],
    cards: [
      {
        title: 'The Glass Pavilion ($2.85M)',
        badge: 'JUST LISTED',
        bgClass: 'bg-[#D95338]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
      {
        title: 'Request Private Showing',
        badge: 'SHOWING',
        bgClass: 'bg-[#1E232B]',
        textClass: 'text-white',
        badgeBg: 'bg-white/10',
        badgeText: 'text-stone-300',
      },
      {
        title: 'Instant Property Valuation',
        badge: 'VALUATION',
        bgClass: 'bg-[#584CE4]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
    ],
  },
  {
    id: 'tpl-music',
    categoryTag: 'FOR MUSICIANS & PRODUCERS',
    forWhom: 'Independent artists, bands, DJs & electronic producers',
    name: 'Aria Nova',
    role: 'Electronic Music Producer',
    handle: '@arianovamusic',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    themeName: 'Midnight Dark',
    bgClass: 'bg-[#181A1E]',
    borderClass: 'border-white/10',
    summary: 'Route fans to Spotify and Apple Music, announce summer festival dates, and accept promoter bookings directly.',
    features: ['Smart Streaming Hub', 'Latest Release Card', 'Live Tour Dates', 'Festival Booking Inquiries'],
    cards: [
      {
        title: 'Stream Single "Echoes in Motion"',
        badge: 'STREAM',
        bgClass: 'bg-[#584CE4]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
      {
        title: 'Live Tour Dates (Summer 2026)',
        badge: 'TICKETS',
        bgClass: 'bg-[#D95338]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
      {
        title: 'Gig & Festival Booking Inquiries',
        badge: 'BOOKING',
        bgClass: 'bg-[#2E694D]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
    ],
  },
  {
    id: 'tpl-podcast',
    categoryTag: 'FOR PODCASTERS & SHOWS',
    forWhom: 'Podcast hosts, broadcasters & editorial media shows',
    name: 'The Creative Depth',
    role: 'Weekly Tech & Culture Podcast',
    handle: '@creativedepth',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    themeName: 'Warm Sand',
    bgClass: 'bg-[#FAFAF7]',
    borderClass: 'border-[#E8E8E8]',
    summary: 'Feature the latest episode with inline playback, link all podcast directories, and receive direct sponsor applications.',
    features: ['Native Episode Player', 'All Listening Apps', 'Sponsor Rate Card', 'Episode Archive'],
    cards: [
      {
        title: 'Latest Episode: The Tactile Era',
        badge: 'LISTEN',
        bgClass: 'bg-[#1E232B]',
        textClass: 'text-white',
        badgeBg: 'bg-white/10',
        badgeText: 'text-stone-300',
      },
      {
        title: 'Listen on Apple & Spotify',
        badge: 'PLATFORMS',
        bgClass: 'bg-[#584CE4]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
      {
        title: 'Sponsor The Next Season',
        badge: 'SPONSOR',
        bgClass: 'bg-[#EAB308]',
        textClass: 'text-[#111111]',
        badgeBg: 'bg-black/10',
        badgeText: 'text-[#111111]',
      },
    ],
  },
  {
    id: 'tpl-coach',
    categoryTag: 'FOR COACHES & ADVISORS',
    forWhom: 'Executive advisors, wellness practitioners & writers',
    name: 'Elena Rostova',
    role: 'Brand Strategist & Executive Advisor',
    handle: '@elenarostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    themeName: 'Warm Studio',
    bgClass: 'bg-[#FFFFFF]',
    borderClass: 'border-[#E8E8E8]',
    summary: 'Book 1-on-1 strategy intensives via Calendly, share your Substack essays, and showcase curated reading lists.',
    features: ['1-on-1 Advisory Intake', 'Calendly Scheduling', 'Substack Essay Hub', 'Curated Library Notes'],
    cards: [
      {
        title: '1-on-1 Strategic Advisory Session',
        badge: 'CALENDLY',
        bgClass: 'bg-[#584CE4]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
      {
        title: 'Read Sunday Longform Essay',
        badge: 'SUBSTACK',
        bgClass: 'bg-[#1E232B]',
        textClass: 'text-white',
        badgeBg: 'bg-white/10',
        badgeText: 'text-stone-300',
      },
      {
        title: 'Curated Architecture Notes',
        badge: 'LIBRARY',
        bgClass: 'bg-[#78716C]',
        textClass: 'text-white',
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
      },
    ],
  },
];

export const TemplateCardsSection: React.FC<TemplateCardsSectionProps> = ({
  onOpenStudio,
  onOpenAuth,
  currentUser,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredTemplates = filter === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((tpl) => tpl.id.includes(filter));

  const handleUseTemplate = (handle: string) => {
    if (currentUser) {
      onOpenStudio(handle.replace('@', ''));
    } else {
      onOpenAuth();
    }
  };

  return (
    <section id="templates" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E8E8E8]">
      {/* ------------------------------------------------------------- */}
      {/* SECTION HEADER                                                */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-[#E8E8E8] shadow-2xs">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#666666] uppercase font-mono">
            START WITH A VIBE
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#111111] tracking-tight leading-[1.08]">
          Pick a look. Built for who you are.
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-[#555555] leading-relaxed">
          Six bespoke archetypes designed specifically for video creators, specialty businesses, luxury real estate, and indie brands.
        </p>

        {/* Filter Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'all', label: 'All Templates' },
            { id: 'creators', label: 'Creators' },
            { id: 'business', label: 'Businesses' },
            { id: 'realestate', label: 'Real Estate' },
            { id: 'music', label: 'Musicians' },
            { id: 'coach', label: 'Coaches' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === f.id
                  ? 'bg-[#111111] text-white shadow-xs scale-105'
                  : 'bg-white text-[#666666] border border-[#E8E8E8] hover:text-[#111111] hover:border-black/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6 OVERSIZED TEMPLATE CARDS ("FOR WHOM IT'S FOR")              */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className={`rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border ${tpl.borderClass} ${tpl.bgClass} flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-black/20 transition-all duration-300 group`}
          >
            <div className="space-y-4">
              {/* Top Badge: For Whom Category */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/5 text-[#111111] border border-black/5">
                  {tpl.categoryTag}
                </span>
                <span className="text-[11px] font-mono text-stone-400">
                  {tpl.themeName}
                </span>
              </div>

              {/* Creator Profile Header */}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-xs shrink-0 bg-stone-100">
                  <img
                    src={tpl.avatar}
                    alt={tpl.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-[#111111] text-base tracking-tight truncate">
                      {tpl.name}
                    </h3>
                    <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                      ✓
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] truncate font-medium">
                    {tpl.role}
                  </p>
                </div>
              </div>

              {/* For Whom One-Sentence Summary */}
              <p className="text-xs text-[#555555] leading-relaxed">
                {tpl.summary}
              </p>

              {/* Mini Card Stack Preview */}
              <div className="space-y-2 pt-2">
                {tpl.cards.map((card, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs ${card.bgClass} ${card.textClass}`}
                  >
                    <span className="text-xs font-bold tracking-tight truncate">
                      {card.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${card.badgeBg} ${card.badgeText}`}>
                        {card.badge}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-white text-[#111111] flex items-center justify-center text-[10px] shadow-2xs">
                        ↗
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feature Checklist */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {tpl.features.map((feat) => (
                  <span
                    key={feat}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/[0.04] text-[#444444]"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-6 mt-4 border-t border-black/5">
              <button
                type="button"
                onClick={() => handleUseTemplate(tpl.handle)}
                className="w-full py-3 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
              >
                <span>Use this template →</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
