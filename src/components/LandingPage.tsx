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
  Settings01Icon,
  Logout01Icon,
  UserIcon,
  Mic01Icon,
  ShoppingBag01Icon,
  ShieldIcon,
  File01Icon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import { ProfileCard } from './ProfileCard';
import { ProfileCardData, CanvasTheme, UserProfile } from '../types';
import { BRAND_LOGOS } from '../data';
import { User as FirebaseUser } from 'firebase/auth';
import { TileRevealTestimonials } from './TileRevealTestimonials';
import { PricingSection } from './PricingSection';
import { IPhoneMockup3D } from './IPhoneMockup3D';
import { CreatorScrollStack } from './CreatorScrollStack';
import { ScrollVelocity } from './ScrollVelocity';
import { AccountSubTab } from './AccountSettings';
import { SpecularButton } from './ui/SpecularButton';

export interface LandingPageProps {
  onOpenStudio: (claimedHandle?: string) => void;
  onOpenAuth: () => void;
  onOpenVisitorDemo: () => void;
  onOpenProModal?: (featureName?: string) => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  onOpenContact?: () => void;
  currentUser?: FirebaseUser | null;
  userProfile?: UserProfile | null;
  onSignOut?: () => void;
  onOpenAccountSettings?: (initialTab?: AccountSubTab) => void;
}

interface CreatorArchetype {
  id: string;
  name: string;
  category: 'creator' | 'designer' | 'comedian' | 'fashion' | 'realtor' | 'business';
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
    name: 'Tech & Design',
    category: 'designer',
    label: 'Tech Creator Profile',
    icon: Edit01Icon,
    creatorName: 'Ayush Vishwakarma',
    creatorRole: 'Tech Creator & Design Engineer',
    bio: 'Crafting tactile software, documenting creative engineering, and teaching 80K+ builders.',
    handle: '@ayushvishwakarma',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    socials: ['YouTube (84K)', 'Twitter/X', 'GitHub', 'LinkedIn'],
    theme: 'warm',
    cards: [
      {
        id: 'card-video',
        title: 'Building LinkLyra in 7 Days: Architecture & Tactile UI',
        subtitle: 'Full 14-min deep dive on YouTube into our modern creator stack',
        linkUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        color: 'purple',
        logoSrc: BRAND_LOGOS.youtube,
        badgeText: 'FEATURED VIDEO',
        expanded: true,
        templateType: 'video_spotlight',
        videoMedia: {
          videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          platform: 'youtube',
          videoId: 'dQw4w9WgXcQ',
          thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
          duration: '14:22',
          aspectRatio: '16:9',
        },
      },
      {
        id: 'card-tip',
        title: 'Support Independent Creator Software',
        subtitle: 'Send a direct 1-tap tip via UPI — 100% lands directly in my account',
        linkUrl: 'upi://pay?pa=ayush@upi&pn=Ayush%20Vishwakarma&cu=INR',
        color: 'green',
        badgeText: '0% FEE TIP',
        expanded: true,
        templateType: 'tip_support',
        tipSupport: {
          upiId: 'ayush@upi',
          creatorName: 'Ayush Vishwakarma',
          presetAmounts: [100, 250, 500, 1000],
          defaultAmount: 250,
          thankYouMessage: 'Thank you for supporting independent developer tools! 🙏',
        },
      },
      {
        id: 'card-portfolio',
        title: 'Tactile UI Engineering Portfolio',
        subtitle: 'Selected case studies in software architecture and visual design',
        linkUrl: 'https://behance.net',
        color: 'dark',
        badgeText: 'PORTFOLIO',
        expanded: false,
      },
      {
        id: 'card-work-with-me',
        title: 'Sponsor Video / Advisory Sprints',
        subtitle: 'Direct booking for brand integrations and design consulting',
        linkUrl: 'https://calendly.com',
        color: 'orange',
        badgeText: 'PARTNERSHIP',
        expanded: false,
      },
    ],
  },
  {
    id: 'creator',
    name: 'Filmmakers',
    category: 'creator',
    label: 'Filmmaker Profile',
    icon: Video01Icon,
    creatorName: 'Maya Lin',
    creatorRole: 'Visual Filmmaker & 3D Artist',
    bio: 'Visual essays on technology, cinematic spaces, and tactile computing.',
    handle: '@mayalin',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    socials: ['YouTube (220K)', 'Instagram', 'Discord'],
    theme: 'warm',
    cards: [
      {
        id: 'creator-reel',
        title: 'Featured Reel: Building My Studio 2026',
        subtitle: 'Complete breakdown of tactile lighting, custom audio, and minimal cable management',
        linkUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        color: 'purple',
        logoSrc: BRAND_LOGOS.youtube,
        badgeText: '4K CINEMATIC',
        expanded: true,
        templateType: 'video_spotlight',
        videoMedia: {
          videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          platform: 'youtube',
          videoId: 'dQw4w9WgXcQ',
          thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&auto=format&fit=crop&q=80',
          duration: '08:45',
          aspectRatio: '16:9',
        },
      },
      {
        id: 'creator-shop',
        title: 'Cinematic LUTs & 3D Asset Pack',
        subtitle: 'The exact color science profiles and Blender lighting setups used across my channel',
        linkUrl: 'https://gumroad.com',
        color: 'orange',
        badgeText: '₹1,999 SHOP',
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
    id: 'comedian',
    name: 'Comedians',
    category: 'comedian',
    label: 'Live Performer Profile',
    icon: Mic01Icon,
    creatorName: 'Kabir Sharma',
    creatorRole: 'Stand-Up Comedian & Storyteller',
    bio: 'Selling out rooms across India. New comedy hour "Overthinking & Chai" touring now! 🎙️',
    handle: '@kabirsharma',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    socials: ['YouTube (420K)', 'Instagram', 'BookMyShow'],
    theme: 'warm',
    cards: [
      {
        id: 'comedian-tour',
        title: 'Overthinking & Chai — India Tour 2026',
        subtitle: 'Grab tickets for upcoming live shows in your city',
        linkUrl: 'https://in.bookmyshow.com',
        color: 'orange',
        badgeText: 'TICKETS LIVE',
        expanded: true,
        templateType: 'live_tour',
        liveTour: {
          tourTitle: 'Overthinking & Chai Tour',
          dates: [
            {
              id: 'ev-1',
              date: 'Sat, Oct 12',
              city: 'Mumbai',
              venue: 'Bal Gandharva Hall',
              ticketUrl: 'https://in.bookmyshow.com',
            },
            {
              id: 'ev-2',
              date: 'Fri, Oct 18',
              city: 'Bengaluru',
              venue: 'Good Shepherd Auditorium',
              ticketUrl: 'https://in.bookmyshow.com',
            },
            {
              id: 'ev-3',
              date: 'Sat, Oct 26',
              city: 'Delhi NCR',
              venue: 'Kamani Auditorium',
              ticketUrl: 'https://in.bookmyshow.com',
            },
            {
              id: 'ev-4',
              date: 'Sat, Nov 02',
              city: 'Pune',
              venue: 'Nehru Memorial Hall',
              ticketUrl: 'https://in.bookmyshow.com',
              soldOut: true,
            },
          ],
        },
      },
      {
        id: 'comedian-video',
        title: 'Crowd Work: Why Engineers Love Bangalore',
        subtitle: 'Live from That Comedy Club (3.2M views on YouTube)',
        linkUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        color: 'purple',
        badgeText: 'VIRAL CLIP',
        expanded: true,
        templateType: 'video_spotlight',
        videoMedia: {
          videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          platform: 'youtube',
          videoId: 'dQw4w9WgXcQ',
          thumbnailUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=600&auto=format&fit=crop&q=80',
          duration: '11:40',
          aspectRatio: '16:9',
        },
      },
      {
        id: 'comedian-tip',
        title: 'Buy Kabir a Cutting Chai / Tip the Show',
        subtitle: 'Direct 1-tap UPI support with zero platform commission',
        linkUrl: 'upi://pay?pa=kabir@upi&pn=Kabir%20Sharma&cu=INR',
        color: 'green',
        badgeText: '0% FEE TIP',
        expanded: true,
        templateType: 'tip_support',
        tipSupport: {
          upiId: 'kabir@upi',
          creatorName: 'Kabir Sharma',
          presetAmounts: [100, 250, 500, 1000],
          defaultAmount: 250,
          thankYouMessage: 'Thank you for supporting live Indian comedy! See you at the show. 🙏',
        },
      },
      {
        id: 'comedian-booking',
        title: 'Book for College & Corporate Shows',
        subtitle: 'Direct WhatsApp chat with management for dates and pricing',
        linkUrl: 'https://wa.me/919876543210',
        color: 'dark',
        badgeText: 'BOOKINGS',
        expanded: false,
      },
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion & Style',
    category: 'fashion',
    label: 'Fashion Creator Profile',
    icon: ShoppingBag01Icon,
    creatorName: 'Tara Sen',
    creatorRole: 'Fashion Stylist & Aesthetic Curator',
    bio: 'Minimalist styling, everyday luxury lookbooks, and sustainable thrift edits. ✨',
    handle: '@tarasen',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    socials: ['Instagram (310K)', 'YouTube', 'Pinterest'],
    theme: 'cream',
    cards: [
      {
        id: 'fashion-reel',
        title: 'Monsoon Capsule Wardrobe: 10 Pieces, 30 Outfits',
        subtitle: 'Watch my viral styling breakdown on Instagram Reels',
        linkUrl: 'https://instagram.com/reel/C8qL9x_vT2Z/',
        color: 'purple',
        badgeText: 'VIRAL REEL',
        expanded: true,
        templateType: 'video_spotlight',
        videoMedia: {
          videoUrl: 'https://instagram.com/reel/C8qL9x_vT2Z/',
          platform: 'instagram',
          videoId: 'C8qL9x_vT2Z',
          thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
          aspectRatio: '9:16',
        },
      },
      {
        id: 'fashion-shop',
        title: 'Shop My Daily Outfits & Beauty Routine',
        subtitle: 'Direct links to linen shirts, vintage denim, and skin tints',
        linkUrl: 'https://amazon.in',
        color: 'orange',
        badgeText: 'LOOKBOOK',
        expanded: false,
      },
      {
        id: 'fashion-collab',
        title: 'Brand Partnerships & Sponsored Reels',
        subtitle: 'Download media kit with demographics (82% female, 18-34)',
        linkUrl: 'https://calendly.com',
        color: 'dark',
        badgeText: 'MEDIA KIT',
        expanded: false,
      },
      {
        id: 'fashion-consult',
        title: '1-on-1 Personal Styling Consultation',
        subtitle: 'Instant WhatsApp chat to book a private wardrobe audit',
        linkUrl: 'https://wa.me/919876543210',
        color: 'green',
        badgeText: 'WHATSAPP',
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
  onOpenTerms,
  onOpenPrivacy,
  onOpenContact,
  currentUser,
  userProfile,
  onSignOut,
  onOpenAccountSettings,
}) => {
  const [handleInput, setHandleInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clickedCardId, setClickedCardId] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Bottom-left toast notification for signed-in user (lasts for 5 seconds only)
  React.useEffect(() => {
    if (currentUser) {
      setShowAuthToast(true);
      const timer = setTimeout(() => {
        setShowAuthToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowAuthToast(false);
    }
  }, [currentUser]);

  const handleNavigateTerms = () => {
    if (onOpenTerms) {
      onOpenTerms();
    } else {
      window.location.href = '?view=terms';
    }
  };

  const handleNavigatePrivacy = () => {
    if (onOpenPrivacy) {
      onOpenPrivacy();
    } else {
      window.location.href = '?view=privacy';
    }
  };

  const handleNavigateContact = () => {
    if (onOpenContact) {
      onOpenContact();
    } else {
      window.location.href = '?view=contact';
    }
  };

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Free Forever') {
      if (currentUser) {
        onOpenStudio();
      } else {
        onOpenAuth();
      }
    } else {
      if (onOpenProModal) {
        onOpenProModal(planName);
      } else if (currentUser) {
        onOpenStudio();
      } else {
        onOpenAuth();
      }
    }
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                templateType={card.templateType}
                tipSupport={card.tipSupport}
                videoMedia={card.videoMedia}
                liveTour={card.liveTour}
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
      {/* Bottom-left toast notification for signed-in user (lasts for 5 seconds only) */}
      {showAuthToast && currentUser && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#18181B] text-white shadow-2xl border border-white/15 text-xs font-medium backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate max-w-[190px] sm:max-w-[260px]">
              Signed in as <strong className="text-white">{currentUser.email}</strong>
            </span>
            <span className="text-white/40">•</span>
            <button
              type="button"
              onClick={() => onOpenStudio()}
              className="text-[#F8BA38] font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>Launch Creator Studio</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowAuthToast(false)}
              className="ml-1 text-zinc-400 hover:text-white cursor-pointer leading-none text-base px-1"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        </aside>
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
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold text-zinc-300">
            <a href="#product" className="hover:text-white transition-colors cursor-pointer">
              Features
            </a>
            <a href="#templates" className="hover:text-white transition-colors cursor-pointer">
              Templates
            </a>
            <a href="#creators" className="hover:text-white transition-colors cursor-pointer">
              Creators
            </a>
            <a href="#pricing" className="hover:text-white transition-colors cursor-pointer">
              Pricing
            </a>
          </nav>

          {/* Right: Log in & CTA / Profile Dropdown */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2.5 pr-3.5 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700/90 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0 border border-white/20">
                    {userProfile?.avatarUrl ? (
                      <img src={userProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (userProfile?.name || currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <span className="max-w-[120px] truncate font-bold text-white">
                    {userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'Account'}
                  </span>
                  <span className={`text-[10px] text-zinc-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#18181B] border border-white/10 shadow-2xl text-white py-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                    {/* User Profile Header */}
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">
                        {userProfile?.name || currentUser.displayName || 'Creator Account'}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>

                    {/* Navigation Actions */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenStudio();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-amber-400" />
                          <span>Studio Dashboard</span>
                        </span>
                        <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-zinc-400">Ctrl+D</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onOpenAccountSettings) {
                            onOpenAccountSettings('profile');
                          } else {
                            onOpenStudio();
                          }
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <HugeiconsIcon icon={Settings01Icon} size={14} className="text-zinc-400" />
                        <span>User & Account Settings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenVisitorDemo();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <HugeiconsIcon icon={GlobeIcon} size={14} className="text-zinc-400" />
                        <span>View Public Profile</span>
                      </button>

                      <div className="my-1 border-t border-white/10" />

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNavigateTerms();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <HugeiconsIcon icon={File01Icon} size={14} className="text-zinc-400" />
                        <span>Terms of Service</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNavigatePrivacy();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <HugeiconsIcon icon={ShieldIcon} size={14} className="text-zinc-400" />
                        <span>Privacy Policy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleNavigateContact();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <HugeiconsIcon icon={Mail01Icon} size={14} className="text-zinc-400" />
                        <span>Contact &amp; Support</span>
                      </button>
                    </div>

                    {/* Sign out */}
                    {onSignOut && (
                      <div className="pt-1 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onSignOut();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <HugeiconsIcon icon={Logout01Icon} size={14} />
                          <span>Sign out</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <SpecularButton
                  size="sm"
                  radius={999}
                  tint="#ffffff"
                  tintOpacity={1}
                  textColor="#111111"
                  lineColor="#F8BA38"
                  baseColor="#E8E8E8"
                  intensity={1.2}
                  shineSize={12}
                  shineFade={35}
                  thickness={1.4}
                  speed={0.4}
                  followMouse
                  autoAnimate
                  onClick={onOpenAuth}
                  className="!font-bold text-xs shadow-xs"
                >
                  <span>Create your LinkLyra →</span>
                </SpecularButton>
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
                className="hover:text-white transition-colors py-1 cursor-pointer flex items-center justify-between"
              >
                <span>Features</span>
                <span className="text-[11px] text-zinc-400 font-mono">How it works</span>
              </a>
              <a
                href="#templates"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1 cursor-pointer flex items-center justify-between"
              >
                <span>Templates</span>
                <span className="text-[11px] text-zinc-400 font-mono">Presets</span>
              </a>
              <a
                href="#creators"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1 cursor-pointer flex items-center justify-between"
              >
                <span>Creators</span>
                <span className="text-[11px] text-zinc-400 font-mono">Niches</span>
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1 cursor-pointer flex items-center justify-between"
              >
                <span>Pricing</span>
                <span className="text-[11px] text-zinc-400 font-mono">0% Fee &amp; Pro</span>
              </a>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavigateTerms();
                  }}
                  className="hover:text-white transition-colors py-1 cursor-pointer"
                >
                  Terms
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavigatePrivacy();
                  }}
                  className="hover:text-white transition-colors py-1 cursor-pointer"
                >
                  Privacy
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavigateContact();
                  }}
                  className="hover:text-white transition-colors py-1 cursor-pointer"
                >
                  Contact
                </button>
              </div>
            </nav>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {currentUser ? (
                <>
                  <div className="px-1 py-1.5 mb-1 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">
                      {userProfile?.name || currentUser.displayName || 'Creator Account'}
                    </p>
                    <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>
                  <SpecularButton
                    size="md"
                    radius={999}
                    tint="#ffffff"
                    tintOpacity={1}
                    textColor="#111111"
                    lineColor="#F8BA38"
                    baseColor="#E8E8E8"
                    intensity={1.2}
                    shineSize={14}
                    thickness={1.4}
                    autoAnimate
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenStudio();
                    }}
                    className="w-full !font-bold text-xs shadow-xs"
                  >
                    <span>Launch Studio Dashboard →</span>
                  </SpecularButton>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenAccountSettings) {
                        onOpenAccountSettings('profile');
                      } else {
                        onOpenStudio();
                      }
                    }}
                    className="w-full py-2.5 rounded-full text-xs font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition-all text-center cursor-pointer flex items-center justify-center gap-2 border border-white/10"
                  >
                    <HugeiconsIcon icon={Settings01Icon} size={14} />
                    <span>User & Account Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenVisitorDemo();
                    }}
                    className="w-full py-2 text-xs font-medium text-zinc-300 hover:text-white text-center cursor-pointer flex items-center justify-center gap-2"
                  >
                    <HugeiconsIcon icon={GlobeIcon} size={14} />
                    <span>View Public Profile</span>
                  </button>

                  {onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 text-center cursor-pointer flex items-center justify-center gap-2 pt-1 border-t border-white/10"
                    >
                      <HugeiconsIcon icon={Logout01Icon} size={14} />
                      <span>Sign out</span>
                    </button>
                  )}
                </>
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
                  <SpecularButton
                    size="md"
                    radius={999}
                    tint="#ffffff"
                    tintOpacity={1}
                    textColor="#111111"
                    lineColor="#F8BA38"
                    baseColor="#E8E8E8"
                    intensity={1.2}
                    shineSize={14}
                    thickness={1.4}
                    autoAnimate
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full !font-bold text-xs shadow-xs"
                  >
                    <span>Create your LinkLyra →</span>
                  </SpecularButton>
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
              <SpecularButton
                size="lg"
                radius={999}
                tint="#111111"
                tintOpacity={1}
                textColor="#ffffff"
                lineColor="#F8BA38"
                baseColor="#27272a"
                intensity={1.4}
                shineSize={16}
                shineFade={45}
                thickness={1.5}
                speed={0.4}
                followMouse
                proximity={300}
                autoAnimate
                onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                className="w-full sm:w-auto !font-bold shadow-lg"
              >
                <span>Create your LinkLyra →</span>
              </SpecularButton>
              <SpecularButton
                size="lg"
                radius={999}
                tint="#ffffff"
                tintOpacity={1}
                textColor="#111111"
                lineColor="#6366F1"
                baseColor="#E8E8E8"
                intensity={1.0}
                shineSize={12}
                shineFade={35}
                thickness={1.2}
                speed={0.35}
                followMouse
                proximity={250}
                onClick={() => {
                  document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto !font-bold border border-[#E8E8E8] shadow-2xs hover:border-black/20"
              >
                <span>Explore creators</span>
              </SpecularButton>
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
                  <SpecularButton
                    type="submit"
                    size="sm"
                    radius={999}
                    tint="#111111"
                    tintOpacity={1}
                    textColor="#ffffff"
                    lineColor="#F8BA38"
                    baseColor="#27272a"
                    intensity={1.3}
                    shineSize={12}
                    shineFade={35}
                    thickness={1.2}
                    speed={0.4}
                    autoAnimate
                    className="!px-3.5 !py-1.5 !font-bold text-[11px] whitespace-nowrap shrink-0"
                  >
                    <span>Claim</span>
                  </SpecularButton>
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
      {/* SCROLL VELOCITY BANNER — Creator Roles & Key Platform Capabilities        */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#111111] text-white py-6 sm:py-8 border-y border-zinc-800 relative overflow-hidden my-4 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-transparent to-transparent pointer-events-none" />
        <ScrollVelocity
          texts={[
            'Comedians & Performers ✦ YouTubers & Filmmakers ✦ Fashion & Stylists ✦ Tech & Finance Creators ✦ Podcast Hosts ✦ Musicians & Bands ✦ Gaming & Streamers ✦ Fitness & Wellness ✦ Visual Artists ✦',
            '0% Fee Fan Tips ⚡ Video & Reel Previews ⚡ Live Tour Dates ⚡ Digital Asset Sales ⚡ Verified Rate Cards ⚡ Custom Bio Links ⚡ 1-Tap Bookings ⚡'
          ]}
          velocity={70}
          className="text-[#FAFAF7] font-black tracking-tight drop-shadow-md hover:text-[#F8BA38] transition-colors"
          numCopies={6}
        />
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
      {/* SECTION 3: LIVE PERFORMERS & COMEDIANS                                    */}
      {/* ========================================================================= */}
      <section id="creators" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#E8E8E8]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Real Profile (Kabir Sharma - Stand-up Comedian) */}
          <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center">
            {renderLiveProfile(ARCHETYPES[2])}
          </div>

          {/* Right: Tiny Label + One Sentence */}
          <div className="lg:col-span-6 order-1 lg:order-2 text-center lg:text-left space-y-4">
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#666666] uppercase font-mono">
              BUILT FOR STAND-UP & LIVE TOURS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight leading-[1.1]">
              Pack your live rooms and get tipped directly.
            </h2>
            <p className="text-sm sm:text-base text-[#666666] max-w-lg leading-relaxed">
              Publish upcoming tour dates with 1-tap ticket links, spotlight your latest viral specials, and collect instant fan tips via UPI with zero platform cuts.
            </p>
            <div className="pt-2">
              <SpecularButton
                size="md"
                radius={999}
                tint="#111111"
                tintOpacity={1}
                textColor="#ffffff"
                lineColor="#F8BA38"
                baseColor="#27272a"
                intensity={1.3}
                shineSize={14}
                shineFade={40}
                thickness={1.4}
                speed={0.35}
                followMouse
                proximity={250}
                autoAnimate
                onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                className="!font-bold shadow-md"
              >
                <span>Create your creator page →</span>
              </SpecularButton>
            </div>
          </div>
        </div>
      </section>



      {/* ========================================================================= */}
      {/* SECTION 6: SOCIAL PROOF / TESTIMONIALS                                   */}
      {/* ========================================================================= */}
      <TileRevealTestimonials onOpenStudio={onOpenStudio} />

      {/* ========================================================================= */}
      {/* SECTION 7: TRANSPARENT PRICING — Clean, Simple Creator Tiers              */}
      {/* ========================================================================= */}
      <PricingSection onSelectPlan={handleSelectPlan} />

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
              <SpecularButton
                size="lg"
                radius={999}
                tint="#ffffff"
                tintOpacity={1}
                textColor="#111111"
                lineColor="#F8BA38"
                baseColor="#ffffff"
                intensity={1.5}
                shineSize={18}
                shineFade={45}
                thickness={1.8}
                speed={0.4}
                followMouse
                proximity={350}
                autoAnimate
                onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                className="!px-8 !py-4 !font-black text-sm sm:text-base shadow-2xl hover:scale-105"
              >
                <span>Create your LinkLyra →</span>
              </SpecularButton>
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
            <div className="md:col-span-2 space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#111111] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  LL
                </div>
                <span className="font-black text-base tracking-tight text-[#111111]">
                  LINKLYRA
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#666666] font-normal leading-relaxed max-w-sm">
                The tactile, high-speed bio link crafted for content creators. Showcase videos, sell digital work, and receive 0% fee direct tips.
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-[#666666]">
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#111111] transition-colors"
                >
                  YouTube
                </a>
                <span className="text-[#CCCCCC]">·</span>
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
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#111111] transition-colors"
                >
                  X
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
              </div>
            </div>

            {/* Column 1: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#111111]">
                Product
              </h4>
              <ul className="space-y-2.5 text-xs text-[#666666]">
                <li>
                  <a href="#product" className="hover:text-[#111111] transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#templates" className="hover:text-[#111111] transition-colors">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-[#111111] transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => (currentUser ? onOpenStudio() : onOpenAuth())}
                    className="hover:text-[#111111] transition-colors cursor-pointer text-left"
                  >
                    Launch Studio
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenVisitorDemo}
                    className="hover:text-[#111111] transition-colors cursor-pointer text-left"
                  >
                    Live Creator Demo
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Creators */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#111111]">
                Creators
              </h4>
              <ul className="space-y-2.5 text-xs text-[#666666]">
                <li>
                  <a href="#creators" className="hover:text-[#111111] transition-colors">
                    Video &amp; Film
                  </a>
                </li>
                <li>
                  <a href="#creators" className="hover:text-[#111111] transition-colors">
                    Comedy &amp; Stand-up
                  </a>
                </li>
                <li>
                  <a href="#creators" className="hover:text-[#111111] transition-colors">
                    Fashion &amp; Style
                  </a>
                </li>
                <li>
                  <a href="#creators" className="hover:text-[#111111] transition-colors">
                    Music &amp; Audio
                  </a>
                </li>
                <li>
                  <a href="#creators" className="hover:text-[#111111] transition-colors">
                    Tech &amp; Podcasters
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Trust & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-[#111111]">
                Trust &amp; Legal
              </h4>
              <ul className="space-y-2.5 text-xs text-[#666666]">
                <li>
                  <button
                    type="button"
                    onClick={handleNavigateTerms}
                    className="hover:text-[#111111] transition-colors cursor-pointer text-left"
                  >
                    Terms and Conditions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleNavigatePrivacy}
                    className="hover:text-[#111111] transition-colors cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleNavigateContact}
                    className="hover:text-[#111111] transition-colors cursor-pointer text-left"
                  >
                    Contact &amp; Support
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleNavigateTerms}
                    className="hover:text-[#111111] transition-colors cursor-pointer text-left"
                  >
                    0% Commission Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleNavigatePrivacy}
                    className="hover:text-[#111111] transition-colors cursor-pointer text-left"
                  >
                    Data Protection &amp; Security
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#888888]">
            <p>© 2026 LinkLyra • A product of Zeper AI</p>
            <div className="flex items-center gap-4 text-[#666666]">
              <button
                type="button"
                onClick={handleNavigateTerms}
                className="hover:text-[#111111] transition-colors cursor-pointer"
              >
                Terms
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={handleNavigatePrivacy}
                className="hover:text-[#111111] transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={handleNavigateContact}
                className="hover:text-[#111111] transition-colors cursor-pointer"
              >
                Contact
              </button>
              <span>·</span>
              <span className="font-medium">
                Made for people with something to share.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
