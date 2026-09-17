import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { HugeIcon } from './HugeIcon';
import {
  MusicNote01Icon,
  Mic01Icon,
  Video01Icon,
  Building01Icon,
  Mortarboard01Icon,
  Briefcase01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  Tick01Icon,
  RadioIcon,
  Loading03Icon,
  AlertCircleIcon,
  UserCheck01Icon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { UserProfile, CanvasTheme, CardTemplateType, ProfileCardData, OnboardingPrimaryRole } from '../types';
import { profileService, DbLink } from '../lib/firebase';
import { completeUserOnboarding } from '../lib/onboardingService';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  currentProfile: UserProfile | null;
  onComplete: (updatedProfile: Partial<UserProfile>, newCards?: DbLink[]) => void;
}

interface PersonaOption {
  id: string;
  title: string;
  badge: string;
  icon: any;
  headlinePlaceholder: string;
  recommendedTheme: CanvasTheme;
  defaultCards: Array<{
    title: string;
    subtitle: string;
    templateType: CardTemplateType;
    badgeText?: string;
    color: any;
    linkUrl: string;
    meta?: any;
  }>;
}

const PERSONAS: PersonaOption[] = [
  {
    id: 'musician',
    title: 'Musician / Recording Artist',
    badge: 'NEW PREMIUM',
    icon: MusicNote01Icon,
    headlinePlaceholder: 'Singer, Songwriter & Producer • New Single "Neon Mirage" Out Now',
    recommendedTheme: 'dark',
    defaultCards: [
      {
        title: 'Neon Mirage (Official Single)',
        subtitle: 'Listen across Spotify, Apple Music, YouTube & Amazon',
        templateType: 'music_smart_card',
        badgeText: 'OUT NOW',
        color: 'purple',
        linkUrl: 'https://open.spotify.com',
        meta: {
          music: {
            releaseTitle: 'Neon Mirage',
            artistName: 'Lyra Sound',
            releaseType: 'Single',
            releaseDate: '2026',
            spotifyUrl: 'https://open.spotify.com',
            appleMusicUrl: 'https://music.apple.com',
            youtubeUrl: 'https://youtube.com',
            amazonMusicUrl: 'https://music.amazon.com',
            preferredPlatformDefault: 'spotify',
          },
        },
      },
      {
        title: 'Book Me for Live Shows & Festivals',
        subtitle: 'Available for club gigs, fests & private performances',
        templateType: 'music_book_me',
        badgeText: 'ACCEPTING DATES',
        color: 'amber',
        linkUrl: 'https://wa.me/',
        meta: {
          music: {
            bookingRate: '$1,000 - $3,000 / ₹50k - ₹1.5L',
            epkBio: 'Electrifying live performances blending indie electronics and soulful vocals.',
          },
        },
      },
      {
        title: 'The Mirage Fall Tour 2026',
        subtitle: '5 City tour stops with ticket booking links',
        templateType: 'music_upcoming_shows',
        badgeText: 'ON SALE',
        color: 'rose',
        linkUrl: 'https://tickets.example.com',
        meta: {
          music: {
            tourDates: [
              { date: 'Nov 12, 2026', city: 'Austin, TX', venue: 'Moody Amphitheater', ticketUrl: 'https://', soldOut: false },
              { date: 'Nov 18, 2026', city: 'Seattle, WA', venue: 'Neumos Club', ticketUrl: 'https://', soldOut: true },
              { date: 'Nov 24, 2026', city: 'Los Angeles, CA', venue: 'The Echo Lounge', ticketUrl: 'https://', soldOut: false },
            ],
          },
        },
      },
    ],
  },
  {
    id: 'podcaster',
    title: 'Podcaster / Audio Host',
    badge: 'NEW PREMIUM',
    icon: Mic01Icon,
    headlinePlaceholder: 'Host of The Founders Playbook • Deep dives into venture, tech & craft',
    recommendedTheme: 'business',
    defaultCards: [
      {
        title: 'Sponsor The Podcast (Media Kit & Audience Stats)',
        subtitle: '450K+ Monthly Downloads • 78% Tech Founders & Executives',
        templateType: 'podcast_sponsor_me',
        badgeText: 'KILLER CARD',
        color: 'indigo',
        linkUrl: 'https://',
        meta: {
          podcast: {
            monthlyDownloads: '450K+',
            audienceSize: '120K Weekly Active',
            listenerDemographics: '78% 22-38 Founders, Devs & Operators',
            pastSponsors: ['Notion', 'Linear', 'Vercel', 'Athletic Greens'],
            cpmRate: '$45 CPM / ₹35,000 per slot',
            sponsorPitch: 'Host-read mid-roll and pre-roll segments with verified click attribution.',
          },
        },
      },
      {
        title: 'Latest Episode: Scaling from 0 to $10M ARR',
        subtitle: 'EP 148 featuring guest interview & actionable teardowns',
        templateType: 'podcast_latest_episode',
        badgeText: 'NEW EPISODE',
        color: 'purple',
        linkUrl: 'https://open.spotify.com',
        meta: {
          podcast: {
            episodeTitle: 'EP 148: The Bootstrapped Playbook',
            episodeNumber: 'EP 148',
            duration: '52 min',
            releaseDate: 'This Tuesday',
            spotifyPodcastsUrl: 'https://open.spotify.com',
            applePodcastsUrl: 'https://podcasts.apple.com',
            youtubeChannelUrl: 'https://youtube.com',
          },
        },
      },
      {
        title: 'Listen on Your Favorite Podcast App',
        subtitle: 'Stream on Apple Podcasts, Spotify, YouTube & Overcast',
        templateType: 'podcast_listen_on',
        badgeText: 'FREE STREAM',
        color: 'blue',
        linkUrl: 'https://',
        meta: {
          podcast: {
            applePodcastsUrl: 'https://podcasts.apple.com',
            spotifyPodcastsUrl: 'https://open.spotify.com',
            youtubeChannelUrl: 'https://youtube.com',
          },
        },
      },
    ],
  },
  {
    id: 'creator',
    title: 'Content Creator / Influencer',
    badge: 'POPULAR',
    icon: Video01Icon,
    headlinePlaceholder: 'Visual Storyteller & Tech Reviewer • 350K+ Community on IG & YouTube',
    recommendedTheme: 'creator',
    defaultCards: [
      {
        title: 'Collaborate & Brand Partnerships',
        subtitle: 'Dedicated Reels, UGC packages & YouTube integrations',
        templateType: 'brand_inquiry',
        badgeText: 'HIRE ME',
        color: 'purple',
        linkUrl: 'https://',
      },
      {
        title: 'Audience & Engagement Statistics',
        subtitle: 'Live verified view counts and demographics',
        templateType: 'creator_stats',
        badgeText: 'VERIFIED',
        color: 'emerald',
        linkUrl: 'https://',
      },
    ],
  },
  {
    id: 'realtor',
    title: 'Real Estate Professional',
    badge: 'PRO',
    icon: Building01Icon,
    headlinePlaceholder: 'Luxury Real Estate Advisor • Guiding families & investors to dream properties',
    recommendedTheme: 'warm',
    defaultCards: [
      {
        title: 'Schedule a Private Property Showing',
        subtitle: 'Select available dates & get VIP walkthrough access',
        templateType: 'showing_booking',
        badgeText: 'BOOK SHOWING',
        color: 'amber',
        linkUrl: 'https://',
      },
      {
        title: 'Free Instant Home Valuation',
        subtitle: 'Find out what your home is worth in today’s market',
        templateType: 'home_valuation',
        badgeText: 'FREE REPORT',
        color: 'rose',
        linkUrl: 'https://',
      },
    ],
  },
  {
    id: 'coach',
    title: 'Coach & Academy Educator',
    badge: 'PRO',
    icon: Mortarboard01Icon,
    headlinePlaceholder: 'Executive Career & Life Coach • Mentoring high-performing leaders',
    recommendedTheme: 'cream',
    defaultCards: [
      {
        title: 'Join The 6-Week Accelerator Batch',
        subtitle: 'Curriculum, live cohort sessions & enrollment details',
        templateType: 'coaching_institute',
        badgeText: 'ENROLLING',
        color: 'emerald',
        linkUrl: 'https://',
      },
      {
        title: 'Book a 1-on-1 Strategy Consultation',
        subtitle: 'Personalized 45-minute tactical roadmap session',
        templateType: 'standard',
        badgeText: 'CALENDAR',
        color: 'purple',
        linkUrl: 'https://calendly.com',
      },
    ],
  },
  {
    id: 'personal',
    title: 'Personal Brand & Portfolio',
    badge: 'VERSATILE',
    icon: Briefcase01Icon,
    headlinePlaceholder: 'Senior Product Designer & Creative Technologist',
    recommendedTheme: 'minimal',
    defaultCards: [
      {
        title: 'View Selected Portfolio & Case Studies',
        subtitle: 'Highlights of recent design and product work',
        templateType: 'featured_work',
        badgeText: 'PORTFOLIO',
        color: 'purple',
        linkUrl: 'https://',
      },
      {
        title: 'Download Resumé / CV (PDF)',
        subtitle: 'Experience, references and client testimonials',
        templateType: 'media_kit',
        badgeText: 'RESUMÉ',
        color: 'blue',
        linkUrl: 'https://',
      },
    ],
  },
];

const THEME_OPTIONS: Array<{ id: CanvasTheme; name: string; previewClass: string }> = [
  { id: 'warm', name: 'Warm Neutral', previewClass: 'bg-stone-100 border-stone-300' },
  { id: 'creator', name: 'Creator Violet', previewClass: 'bg-purple-100 border-purple-300' },
  { id: 'dark', name: 'Midnight Dark', previewClass: 'bg-stone-900 border-stone-700 text-white' },
  { id: 'business', name: 'Executive Blue', previewClass: 'bg-slate-100 border-slate-300' },
  { id: 'clay', name: 'Clay Rose', previewClass: 'bg-rose-50 border-rose-200' },
  { id: 'minimal', name: 'Minimal Ivory', previewClass: 'bg-[#faf9f6] border-stone-200' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  user,
  currentProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('musician');
  const [username, setUsername] = useState<string>(
    currentProfile?.username || user?.email?.split('@')[0] || 'creator'
  );
  const [displayName, setDisplayName] = useState<string>(
    currentProfile?.name || user?.displayName || 'My Name'
  );
  const [headline, setHeadline] = useState<string>(
    currentProfile?.headline || PERSONAS[0].headlinePlaceholder
  );
  const [selectedTheme, setSelectedTheme] = useState<CanvasTheme>('dark');
  const [installStarterCards, setInstallStarterCards] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    const emailPrefix = user?.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '') : '';
    const initialUsername = currentProfile?.username || emailPrefix || 'creator';
    const initialDisplayName = currentProfile?.name || user?.displayName || emailPrefix || 'My Name';
    const initialHeadline = currentProfile?.headline || PERSONAS[0].headlinePlaceholder;
    setUsername(initialUsername);
    setDisplayName(initialDisplayName);
    setHeadline(initialHeadline);
    setSelectedTheme(currentProfile?.theme || 'warm');
    setSelectedPersonaId('musician');
    setInstallStarterCards(true);
    setSaveError(null);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, user?.uid, currentProfile?.username]);

  if (!isOpen) return null;

  const activePersona = PERSONAS.find((p) => p.id === selectedPersonaId) || PERSONAS[0];

  const handleSelectPersona = (p: PersonaOption) => {
    setSelectedPersonaId(p.id);
    setSelectedTheme(p.recommendedTheme);
    setSaveError(null);
    if (!headline || headline === activePersona.headlinePlaceholder) {
      setHeadline(p.headlinePlaceholder);
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const cleanUsername = (username || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const profileUpdates: Partial<UserProfile> = {
        username: cleanUsername,
        name: displayName.trim(),
        headline: headline.trim(),
        theme: selectedTheme,
        hasCompletedOnboarding: true,
        pageArchetype:
          selectedPersonaId === 'musician'
            ? 'musician'
            : selectedPersonaId === 'podcaster'
            ? 'podcaster'
            : selectedPersonaId === 'creator'
            ? 'hire_me_creator'
            : selectedPersonaId === 'realtor'
            ? 'realtor_showcase'
            : 'standard',
      };

      // 1. Update Profile & Onboarding in Firebase
      if (user?.uid) {
        // Map persona to primary role
        const roleMap: Record<string, OnboardingPrimaryRole> = {
          musician: 'creator',
          podcaster: 'creator',
          creator: 'creator',
          realtor: 'real_estate',
          coach: 'coach',
          personal: 'freelancer',
        };
        const primaryRole: OnboardingPrimaryRole = roleMap[selectedPersonaId] || 'other';

        // Persist strongly typed onboarding profile idempotently
        await completeUserOnboarding(
          user.uid,
          {
            fullName: displayName.trim(),
            username: cleanUsername,
            bio: headline.trim(),
            primaryRole,
            goals: ['grow_audience'],
            primaryCTA: 'whatsapp_chat',
            roleData: {
              persona: selectedPersonaId,
            },
          },
          { createCards: false } // We manage starter cards below
        );

        await profileService.updateProfile(user.uid, {
          username: cleanUsername,
          full_name: displayName.trim(),
          bio: headline.trim(),
          theme: selectedTheme,
          has_completed_onboarding: true,
          page_archetype: profileUpdates.pageArchetype,
        });

        // 2. Optionally insert starter cards for chosen vertical if requested
        const createdCards: DbLink[] = [];
        if (installStarterCards && activePersona.defaultCards.length > 0) {
          for (let i = 0; i < activePersona.defaultCards.length; i++) {
            const card = activePersona.defaultCards[i];
            const newLink = await profileService.addLink(user.uid, {
              title: card.title,
              subtitle: card.subtitle,
              link_url: card.linkUrl,
              color: card.color,
              badge_text: card.badgeText,
              template_type: card.templateType,
              display_order: i,
              is_active: true,
              is_premium: true,
              ...(card.meta?.music ? { music: card.meta.music } : {}),
              ...(card.meta?.podcast ? { podcast: card.meta.podcast } : {}),
            });
            createdCards.push(newLink);
          }
        }

        // Fire celebration confetti!
        try {
          confetti({
            particleCount: 110,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
          });
        } catch (_) {}

        setIsSaving(false);
        onComplete(profileUpdates, createdCards.length > 0 ? createdCards : undefined);
        onClose();
      } else {
        // Fallback for non-authenticated / local testing session
        const localCreatedCards: any[] = [];
        if (installStarterCards && activePersona.defaultCards.length > 0) {
          for (let i = 0; i < activePersona.defaultCards.length; i++) {
            const card = activePersona.defaultCards[i];
            localCreatedCards.push({
              id: `onboarding_card_${Date.now()}_${i}`,
              title: card.title,
              subtitle: card.subtitle,
              linkUrl: card.linkUrl,
              color: card.color,
              badgeText: card.badgeText,
              templateType: card.templateType,
              isActive: true,
              isPremium: true,
              ...(card.meta?.music ? { music: card.meta.music } : {}),
              ...(card.meta?.podcast ? { podcast: card.meta.podcast } : {}),
            });
          }
        }

        try {
          confetti({
            particleCount: 110,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
          });
        } catch (_) {}

        setIsSaving(false);
        onComplete(profileUpdates, localCreatedCards.length > 0 ? localCreatedCards : undefined);
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
      // Do not falsely mark onboarding as completed when Firestore or network fails
      setSaveError(
        err?.message ||
          'Unable to save your setup due to a network or database issue. Please try again.'
      );
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar Header with Back to Studio / Cancel Button */}
        <div className="px-5 sm:px-6 py-4 bg-stone-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <HugeIcon icon={StarIcon} size={16} className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-white tracking-tight truncate">
                Starter Templates & Setup
              </h2>
              <p className="text-[11px] text-stone-300 truncate">
                Step {step} of 3: {step === 1 ? 'Choose Creator Identity' : step === 2 ? 'Profile & Handle' : 'Theme & Launch'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-amber-400'
                      : s < step
                      ? 'w-3 bg-white/60'
                      : 'w-3 bg-white/20'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cancel and return to studio"
            >
              <HugeIcon icon={Cancel01Icon} size={14} />
              <span className="hidden sm:inline">Back to Studio</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {saveError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <HugeIcon icon={AlertCircleIcon} size={16} className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Setup Could Not Be Saved</p>
                <p className="text-rose-700 mt-0.5">{saveError}</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  What kind of page are you creating today?
                </h3>
                <p className="text-xs text-stone-500">
                  We'll pre-configure your cards, layout presets, and media players.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {PERSONAS.map((p) => {
                  const iconObj = p.icon;
                  const isSelected = selectedPersonaId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 bg-stone-50/80 shadow-xs ring-2 ring-stone-900/10'
                          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        <HugeIcon icon={iconObj} size={16} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 pr-6">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-stone-900 leading-tight">
                            {p.title}
                          </h4>
                        </div>
                        <span
                          className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            p.badge.includes('NEW')
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {p.badge}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center">
                          <HugeIcon icon={Tick01Icon} size={10} className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <HugeIcon icon={RadioIcon} size={14} className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-stone-600">
                  <span className="font-bold text-stone-900">
                    Selected Archetype: {activePersona.title}.
                  </span>{' '}
                  Includes {activePersona.defaultCards.length} curated premium interactive cards ready to customize.
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  Claim your unique LinkLyra URL & Profile
                </h3>
                <p className="text-xs text-stone-500">
                  Your visitors will view your page at linklyra.app/
                  <strong>{username || 'yourname'}</strong>
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Your Username Handle *
                  </label>
                  <div className="flex rounded-xl shadow-2xs border border-stone-200 overflow-hidden focus-within:ring-2 focus-within:ring-stone-900">
                    <span className="bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-500 border-r border-stone-200 select-none flex items-center">
                      linklyra.app/
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="alexmusic"
                      className="w-full px-3 py-2 text-xs font-semibold text-stone-900 bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">
                    Headline / Bio Snippet
                  </label>
                  <textarea
                    rows={2}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Describe your craft, release or business..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 resize-none font-medium"
                  />
                </div>

                {/* Starter Cards Option */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="starterCards"
                    checked={installStarterCards}
                    onChange={(e) => setInstallStarterCards(e.target.checked)}
                    className="mt-0.5 rounded-sm text-stone-900 focus:ring-stone-900 w-4 h-4"
                  />
                  <label htmlFor="starterCards" className="text-xs cursor-pointer">
                    <span className="font-bold text-stone-900 block">
                      Auto-generate starter cards for {activePersona.title}
                    </span>
                    <span className="text-stone-500 text-[11px] block mt-0.5">
                      Adds sample cards like "{activePersona.defaultCards[0]?.title}" so you can preview right away.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900">
                  Pick your initial canvas aesthetic
                </h3>
                <p className="text-xs text-stone-500">
                  You can change fonts, custom hex colors, and card styles at any time in the builder.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {THEME_OPTIONS.map((t) => {
                  const isSelected = selectedTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTheme(t.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 ring-2 ring-stone-900/10 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold text-stone-900 leading-tight">
                          {t.name}
                        </span>
                        {isSelected && (
                          <div className="w-3.5 h-3.5 rounded-full bg-stone-900 text-white flex items-center justify-center">
                            <HugeIcon icon={Tick01Icon} size={8} className="w-2 h-2" />
                          </div>
                        )}
                      </div>
                      <div className={`w-full h-5 rounded-lg border ${t.previewClass}`} />
                    </button>
                  );
                })}
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <HugeIcon icon={UserCheck01Icon} size={16} className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">
                    Ready to build your live creator page!
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    We’ll launch your interactive canvas with live mobile preview and real-time editing.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-5 sm:px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          {step > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HugeIcon icon={ArrowLeft01Icon} size={14} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-stone-500 hover:text-stone-800 px-2.5 py-2 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HugeIcon icon={ArrowLeft01Icon} size={14} />
              <span>Back to Studio</span>
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <span>Continue</span>
              <HugeIcon icon={ArrowRight01Icon} size={14} className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold flex items-center gap-2 shadow-xs transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <HugeIcon icon={Loading03Icon} size={14} className="w-3.5 h-3.5 animate-spin" />
                  <span>Launching Canvas...</span>
                </>
              ) : (
                <>
                  <span>Launch My LinkLyra Page</span>
                  <HugeIcon icon={ArrowRight01Icon} size={14} className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
