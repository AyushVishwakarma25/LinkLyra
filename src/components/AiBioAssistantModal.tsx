import React, { useState } from 'react';
import { DialogOverlay } from './DialogOverlay';
import { HugeIcon } from './HugeIcon';
import {
  Cancel01Icon,
  Tick01Icon,
  Copy01Icon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import { useToast } from '../context/ToastContext';

export interface AiBioAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBio: (bio: string) => void;
  currentHeadline?: string;
  creatorName?: string;
}

type NicheType =
  | 'video'
  | 'comedian'
  | 'fashion'
  | 'tech_finance'
  | 'fitness'
  | 'musician'
  | 'podcast';

type VibeType = 'high_energy' | 'aesthetic' | 'brand_ready' | 'humorous';

interface NicheOption {
  id: NicheType;
  label: string;
  emoji: string;
}

const NICHES: NicheOption[] = [
  { id: 'video', label: 'Video & YouTube', emoji: '🎬' },
  { id: 'comedian', label: 'Stand-Up & Comedy', emoji: '🎤' },
  { id: 'fashion', label: 'Fashion & Lifestyle', emoji: '👗' },
  { id: 'tech_finance', label: 'Tech & Finance', emoji: '📈' },
  { id: 'fitness', label: 'Fitness & Wellness', emoji: '💪' },
  { id: 'musician', label: 'Musician & Artist', emoji: '🎵' },
  { id: 'podcast', label: 'Podcaster & Shows', emoji: '🎙️' },
];

const VIBES: Array<{ id: VibeType; label: string; desc: string; icon: string }> = [
  { id: 'high_energy', label: 'High-Energy', desc: 'Bold, hype & action-driven', icon: '🔥' },
  { id: 'aesthetic', label: 'Aesthetic', desc: 'Minimal, curated & effortless', icon: '✨' },
  { id: 'brand_ready', label: 'Brand-Ready', desc: 'Sponsorship-focused & credible', icon: '💼' },
  { id: 'humorous', label: 'Witty & Fun', desc: 'Playful, memorable & punchy', icon: '⚡' },
];

// Curated dynamic generator templates tailored for each niche & vibe
function generateBios(
  niche: NicheType,
  vibe: VibeType,
  keywords: string,
  name: string
): string[] {
  const cleanKw = keywords.trim();
  const kwList = cleanKw
    ? cleanKw.split(/[,+•|]/).map((s) => s.trim()).filter(Boolean)
    : [];
  const primaryKw = kwList[0] || '';
  const secondaryKw = kwList[1] || '';

  const results: Record<NicheType, Record<VibeType, string[]>> = {
    comedian: {
      high_energy: [
        `🎤 Live on tour • Making 1M+ laugh weekly • Tickets & tour dates below 👇`,
        `Telling jokes on internet & stage • ${primaryKw || 'Catch the live show'} • New tour dates dropped! 🎟️`,
        `Stand-up comedian • Viral sketches & crowdwork • Book for private events & shows ✨`,
        `Laughs guaranteed or your 5 seconds back • ${secondaryKw || 'Touring India 2026'} • Tap to watch 🎬`,
      ],
      aesthetic: [
        `stand-up comedian • writing observations • live dates below`,
        `jokes, stories & tours • ${primaryKw || 'mumbai / delhi'} • link in bio`,
        `on stage most weekends • booking & tickets below`,
        `crowdwork & comedy specials • watch the latest tape`,
      ],
      brand_ready: [
        `Stand-Up Comedian & Content Partner • 450K+ Monthly Reach • Brand PR & Enquiries 📩`,
        `Touring Stand-Up Artist • Host & Keynote Speaker • Corporate Bookings & Shows 🎟️`,
        `Comedian & Digital Entertainer • Seen on YouTube & Comicstaan • Enquiries below`,
        `Verified Creator & Touring Artist • ${primaryKw || 'High-Converting Integrations'} • Management contact 👇`,
      ],
      humorous: [
        `Telling jokes so I never have to use corporate buzzwords again 🎤`,
        `Professional overthinker • Part-time comedian • Full-time chai consumer ☕`,
        `My parents still think I'm looking for a job • Catch my live show before they do 🎟️`,
        `Proof that talking to yourself in public can become a career ✨`,
      ],
    },
    video: {
      high_energy: [
        `🎬 Creating cinematic videos for 200k+ curious minds • New upload every Friday!`,
        `Visual storyteller & creator • ${primaryKw || 'Tech & Everyday Gears'} • Tap to watch latest drop 👇`,
        `High-energy videos that teach & entertain • Sponsored partnerships & UGC below 🚀`,
        `Making the internet more exciting one video at a time • Hit subscribe & connect ✨`,
      ],
      aesthetic: [
        `cinematic visuals & quiet moments • new video out now`,
        `storyteller • ${primaryKw || 'visual diary'} • links & gear below`,
        `making videos about design, life & tech • tap to explore`,
        `visual creator • thoughtful stories • work with me`,
      ],
      brand_ready: [
        `Digital Video Creator & Producer • 850K+ Monthly Impressions • Media Kit & Collabs 💼`,
        `UGC Video Specialist & Brand Partner • 4.8% Engagement Rate • Inquire for Campaigns 📩`,
        `Creator & Studio Director • Verified Multi-Platform Audience • Rates & Booking 👇`,
        `Strategic Video Content Partner • High ROI Brand Campaigns • Available for Q3 🚀`,
      ],
      humorous: [
        `Spending 40 hours editing a 40-second video so you can scroll past it in 2s 🎬`,
        `Camera gear addict disguised as a productive creator 📸`,
        `I test gadgets so your wallet doesn't have to suffer 💸`,
        `Welcome to my digital playground • Grab a snack and watch the latest 👇`,
      ],
    },
    fashion: {
      high_energy: [
        `👗 Curating outfits that turn heads • Daily fits, lookbooks & exclusive discount codes!`,
        `Fashion & Lifestyle Creator • Shop my exact closet & daily styling picks below ✨`,
        `Elevating everyday looks • Brand partnerships & PR inquiries open 👇`,
        `Style inspiration for every season • Links to everything I wear! 🛍️`,
      ],
      aesthetic: [
        `curating timeless fits • everyday palette • links to shop`,
        `style & aesthetic moments • ${primaryKw || 'clean lines'} • pr below`,
        `neutral tones & wardrobe staples • tap to shop my look`,
        `effortless style • capsule closet • exclusive codes inside`,
      ],
      brand_ready: [
        `Fashion & Lifestyle Creator • High-Converting Fashion Links • Inquiries & PR 📩`,
        `Style Ambassador & Content Partner • 350K+ Community • Brand Deck & Rates Below`,
        `Curated Fashion & Beauty • Verified Brand Partnerships • Management Contact 💼`,
        `Creator & Wardrobe Stylist • Exclusive Community Discount Codes & Links ✨`,
      ],
      humorous: [
        `Wearing 3 outfits a day just to take photos and put sweatpants back on 💅`,
        `My clothes are curated, my life is chaotic • Shop the look below 🛍️`,
        `Another day, another package arriving for 'essential content purposes' 📦`,
        `Dress like you own the building • Or at least like you don't owe rent ✨`,
      ],
    },
    tech_finance: {
      high_energy: [
        `📈 Demystifying tech, AI & wealth building • 300K+ community • Free resources below!`,
        `Tech builder & angel investor • Actionable guides for smart founders & creators 🚀`,
        `Decoding the future of SaaS, productivity & capital • Tap for media kit & tools 👇`,
        `Building in public & reviewing top tech • Sponsor the weekly breakdown! ✨`,
      ],
      aesthetic: [
        `tech, systems & wealth • simple frameworks for high performers`,
        `exploring software, craft & ideas • tools I use daily below`,
        `digital builder • curating high-leverage workflows • links & deck`,
        `clarity over complexity in tech & business • explore resources`,
      ],
      brand_ready: [
        `Tech & Finance Creator • 450K+ Decision-Maker Audience • Inquire for Q3 Sponsorships 💼`,
        `SaaS Reviewer & Growth Strategist • High-Converting Brand Integrations • Media Kit 👇`,
        `Partnering with forward-thinking tech brands • Verified Demographics & Rates 📩`,
        `Founder & Tech Analyst • 12.4% Avg CTR on Brand Deals • Contact for Sponsorships 🚀`,
      ],
      humorous: [
        `Translating startup jargon into human English since 2022 ☕`,
        `I test 50 apps a month so you can just use Google Docs in peace 💻`,
        `Not financial advice, but clicking my links is empirically proven to inspire 📈`,
        `Automating 90% of my tasks so I can spend more time tweeting about automation 🤖`,
      ],
    },
    fitness: {
      high_energy: [
        `💪 Helping 1,000+ people get strong & energetic • 1-on-1 coaching intake open!`,
        `Trainer & Wellness Coach • Daily workout routines & nutrition guides below 🥗`,
        `Transform your mindset & physique • Grab your free 7-day workout plan! 🔥`,
        `No fluff, just science-backed results • Join the private fitness collective 👇`,
      ],
      aesthetic: [
        `movement, balance & intentional health • coaching below`,
        `sustainable wellness • daily habits • workout guides`,
        `mindful fitness & clean nutrition • tap for 1-on-1 intake`,
        `strength from the inside out • resources & programs`,
      ],
      brand_ready: [
        `Certified Fitness Coach & Wellness Partner • Supplement & Gear Ambassador 📩`,
        `Performance Coach • 280K+ Health-Conscious Audience • Sponsor Inquiries Below 💼`,
        `Elite Trainer & Athlete • Brand Partnerships & Supplement Discount Codes 👇`,
        `High-Energy Health Content • Verified 5.2% Engagement • Media Kit Inside ⚡`,
      ],
      humorous: [
        `Lifting heavy things and putting them back down so I can eat more pasta 🍝`,
        `My sweat is 70% espresso and 30% determination • Workouts below 🏋️‍♂️`,
        `Gym advice that actually makes sense • Zero broccoli-only diets promised 🥦`,
        `Here to hold you accountable so your gym membership isn't a charity donation 😂`,
      ],
    },
    musician: {
      high_energy: [
        `🎵 New Single 'Neon Mirage' Out Now! Stream on Spotify & Apple Music 👇`,
        `Independent artist & producer • Tour dates, merch & upcoming festival sets! ⚡`,
        `Making sounds that hit different • Available for headline gigs & sync licensing 🎧`,
        `Listen to my latest track in 1 tap • Official merch store open below! 💿`,
      ],
      aesthetic: [
        `sounds from the night • new single streaming everywhere`,
        `recording artist • frequencies & melodies • listen now`,
        `indie music & live sets • tour dates & streaming hub below`,
        `music made in bedrooms for big speakers • press kit & links`,
      ],
      brand_ready: [
        `Recording Artist & Music Producer • Available for Live Bookings & Sync Licensing 💼`,
        `Independent Musician • 500K+ Spotify Streams • Electronic Press Kit (EPK) Below 📩`,
        `Concert Performer & Sonic Creator • Festival & College Booking Contact 👇`,
        `Verified Music Artist • Brand Endorsements & Gear Partnerships 🎧`,
      ],
      humorous: [
        `Turning heartbreak and caffeine into 3-minute streaming revenue ☕`,
        `I make songs so you can stare dramatically out of car windows 🌧️`,
        `Buy my vinyl before my landlord asks for rent again 💿`,
        `Professional reverb enthusiast • Stream the latest track below 🎵`,
      ],
    },
    podcast: {
      high_energy: [
        `🎙️ Top 10 Tech & Founder Podcast • 450K+ Monthly Downloads • Listen to EP 148!`,
        `Unfiltered deep dives with the world's best creators & builders • Stream now 👇`,
        `Your weekly dose of insight & backstage stories • Available on Spotify & Apple 🎧`,
        `High-impact podcast conversations • Sponsor the show & reach decision makers! 🚀`,
      ],
      aesthetic: [
        `conversations with thoughtful minds • new episode weekly`,
        `audio stories & deep dives • stream on your favorite app`,
        `the podcast • episodes, transcripts & show notes below`,
        `unhurried conversations • tap to listen`,
      ],
      brand_ready: [
        `Top Ranked Business Podcast • 450K+ Monthly Downloads • Inquire for Host-Read Ads 💼`,
        `Host & Executive Producer • Verified Tech & Executive Listeners • Media Kit Below 📩`,
        `Weekly Podcast Showcase • Q3/Q4 Sponsorship Inventory Open • Rates & Stats Inside 📊`,
        `Award-Winning Audio Show • High-Converting Brand Integrations • Sponsor Deck 👇`,
      ],
      humorous: [
        `Two microphones and an excuse to talk for 2 hours with interesting people 🎙️`,
        `Yes, another podcast. But this one is actually worth listening to, promise ✨`,
        `We ask the questions you whisper to your friends at 2 AM 🌙`,
        `Listen at 1.5x speed so we sound twice as smart 🎧`,
      ],
    },
  };

  const pool = results[niche]?.[vibe] || results.video.high_energy;
  return pool;
}

export const AiBioAssistantModal: React.FC<AiBioAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectBio,
  currentHeadline = '',
  creatorName = 'Creator',
}) => {
  const toast = useToast();
  const [selectedNiche, setSelectedNiche] = useState<NicheType>('video');
  const [selectedVibe, setSelectedVibe] = useState<VibeType>('high_energy');
  const [keywords, setKeywords] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate initial suggestions
  const [generatedOptions, setGeneratedOptions] = useState<string[]>(() =>
    generateBios(selectedNiche, selectedVibe, keywords, creatorName)
  );

  const handleRegenerate = () => {
    const fresh = generateBios(selectedNiche, selectedVibe, keywords, creatorName);
    setGeneratedOptions(fresh);
    toast.info('Generated fresh bio variations!');
  };

  const handleCopyBio = (text: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Bio copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApplyBio = (text: string) => {
    onSelectBio(text);
    toast.success('✨ Bio applied to your LinkLyra profile!');
    onClose();
  };

  return (
    <DialogOverlay
      isOpen={isOpen}
      onClose={onClose}
      className="p-3 sm:p-5 flex items-end sm:items-center justify-center max-w-full"
    >
      <div
        className="bg-stone-50 w-full max-w-xl rounded-t-[32px] sm:rounded-[32px] border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-white shrink-0">
          <div className="w-12 h-1 bg-stone-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#1C1E22] text-amber-400 flex items-center justify-center shadow-xs">
              <HugeIcon icon={StarIcon} size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 leading-tight">
                ✨ Magic AI Bio Writer
              </h2>
              <p className="text-xs text-stone-500">
                Craft catchy, high-converting bios tailored for your audience
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <HugeIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. Niche Selector */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1.5">
              1. Select Content Category
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {NICHES.map((n) => {
                const isSelected = selectedNiche === n.id;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setSelectedNiche(n.id);
                      setGeneratedOptions(generateBios(n.id, selectedVibe, keywords, creatorName));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1C1E22] text-white shadow-xs scale-100'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <span>{n.emoji}</span>
                    <span>{n.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tone / Vibe */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1.5">
              2. Choose Tone & Vibe
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VIBES.map((v) => {
                const isSelected = selectedVibe === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVibe(v.id);
                      setGeneratedOptions(generateBios(selectedNiche, v.id, keywords, creatorName));
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/20'
                        : 'bg-white hover:bg-stone-100/80 border-stone-200'
                    }`}
                  >
                    <span className="text-base shrink-0">{v.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 leading-snug">{v.label}</p>
                      <p className="text-[10px] text-stone-500 line-clamp-1">{v.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Optional Keywords */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-800">
                3. Optional Details / Focus Topics
              </label>
              <span className="text-[10px] text-stone-400">Optional</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. Mumbai, 200k YouTube, tours, funny sketches"
                className="flex-1 px-3.5 py-2 bg-white rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleRegenerate}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Regenerate
              </button>
            </div>
          </div>

          {/* 4. Generated Suggestions List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800">
                ✨ Ready-to-Use Bio Suggestions
              </label>
              <span className="text-[10px] text-stone-500">Tap to apply directly</span>
            </div>

            <div className="space-y-2.5">
              {generatedOptions.map((bio, index) => {
                const isCopied = copiedIndex === index;
                const charCount = bio.length;
                return (
                  <div
                    key={index}
                    className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:border-purple-300 transition-all group flex flex-col justify-between gap-3"
                  >
                    <p className="text-xs sm:text-sm font-medium text-stone-800 leading-relaxed">
                      {bio}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                      <span className="text-[10px] font-mono text-stone-400">
                        {charCount} characters
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleCopyBio(bio, index, e)}
                          className="px-2.5 py-1 rounded-lg hover:bg-stone-100 text-stone-600 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy to clipboard"
                        >
                          <HugeIcon icon={isCopied ? Tick01Icon : Copy01Icon} size={13} className={isCopied ? 'text-emerald-600' : ''} />
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyBio(bio)}
                          className="px-3 py-1 rounded-lg bg-[#1C1E22] hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-2xs cursor-pointer"
                        >
                          <HugeIcon icon={Tick01Icon} size={13} className="text-emerald-400" />
                          <span>Apply to Profile</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-white flex items-center justify-between shrink-0">
          <p className="text-[11px] text-stone-400">
            Current bio: <span className="text-stone-600 font-medium truncate max-w-[200px] inline-block align-bottom">{currentHeadline || 'None yet'}</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </DialogOverlay>
  );
};
