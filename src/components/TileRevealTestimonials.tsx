import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  StarIcon,
  TrendingUpIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
} from '@hugeicons/core-free-icons';
import { BRAND_LOGOS } from '../data';

export interface CreatorTestimonial {
  id: string;
  name: string;
  handle: string;
  role: string;
  avatar: string;
  category: 'creators' | 'business' | 'tech' | 'music';
  quote: string;
  metric: string;
  metricLabel: string;
  platform: string;
  platformIcon?: string;
  verifiedTitle?: string;
  coverImage?: string;
}

const DEFAULT_TESTIMONIALS: CreatorTestimonial[] = [
  {
    id: 'test-1',
    name: 'Elena Rostova',
    handle: '@elenacreates',
    role: 'Tech Filmmaker & 3D Artist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
    category: 'creators',
    quote: 'Replacing my generic link list with LinkLyra doubled my course sales on launch weekend. The tactile video card with real preview thumbnails gave my audience a reason to actually tap.',
    metric: '+118%',
    metricLabel: 'Course Click Rate',
    platform: 'YouTube Partner (340K subs)',
    platformIcon: BRAND_LOGOS.youtube,
    verifiedTitle: 'Verified Creator',
  },
  {
    id: 'test-2',
    name: 'Marcus Vance',
    handle: '@marcusvance',
    role: 'Managing Director, Studio Apex',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&auto=format&fit=crop&q=80',
    category: 'business',
    quote: 'The 1-click WhatsApp lead routing and schedule card generated 43 client inquiries in our first two weeks. Clients constantly comment on how bespoke and high-end our bio page looks.',
    metric: '43 Deals',
    metricLabel: 'Qualified Inbound Leads',
    platform: 'Consultancy & Agency',
    platformIcon: BRAND_LOGOS.calendly,
    verifiedTitle: 'Verified Business',
  },
  {
    id: 'test-3',
    name: 'Aria Thorne',
    handle: '@ariadesign',
    role: 'Staff Product Designer & Writer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    category: 'tech',
    quote: 'The typography and micro-interactions are leagues ahead of anything else. My audience actually stays on my bio page because the cards feel interactive and alive like a native app.',
    metric: '4.2 min',
    metricLabel: 'Avg Session Duration',
    platform: 'Substack & Figma Guild',
    platformIcon: BRAND_LOGOS.substack,
    verifiedTitle: 'Design Lead',
  },
  {
    id: 'test-4',
    name: 'Devon Patel',
    handle: '@devonbuilds',
    role: 'Indie Hacker & SaaS Founder',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80',
    category: 'tech',
    quote: 'Setup took 90 seconds. Clean code, zero bloat, instant cloud sync. My newsletter subscriber conversion rate jumped 84% the afternoon I swapped out my Twitter bio link.',
    metric: '+84%',
    metricLabel: 'Newsletter Subscriptions',
    platform: 'X / Twitter & GitHub',
    platformIcon: BRAND_LOGOS.x,
    verifiedTitle: 'Indie Founder',
  },
  {
    id: 'test-5',
    name: 'Chloe Lin',
    handle: '@chloewellness',
    role: 'Certified Movement & Breath Coach',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80',
    category: 'business',
    quote: 'My clients love booking appointments directly through the schedule card without redirect loops. The aesthetic perfectly matches my wellness brand with zero monthly fees on the starter plan.',
    metric: '3.4x',
    metricLabel: 'Booking Completion',
    platform: 'Instagram & TikTok',
    platformIcon: BRAND_LOGOS.instagram,
    verifiedTitle: 'Wellness Coach',
  },
  {
    id: 'test-6',
    name: 'Mateo Silva',
    handle: '@mateosounds',
    role: 'Electronic Producer & Touring DJ',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    category: 'music',
    quote: 'Having the Spotify player card and tour dates card right in my Instagram bio drove over 150,000 streams on my latest EP release. It is the cleanest bio tool out there.',
    metric: '150K+',
    metricLabel: 'Release Stream Plays',
    platform: 'Spotify Verified Artist',
    platformIcon: BRAND_LOGOS.spotify,
    verifiedTitle: 'Verified Artist',
  },
];

// Grid visual tiles representing vibrant creator content & profile tiles
const GRID_COLUMNS = [
  // Column 0 (Leftmost)
  [
    { id: 't-0-0', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', label: 'Elena R.', tag: 'Filmmaker' },
    { id: 't-0-1', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80', label: '3D Artwork', tag: 'Visuals' },
    { id: 't-0-2', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', label: 'Aria T.', tag: 'Design' },
  ],
  // Column 1
  [
    { id: 't-1-0', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80', label: 'Devon P.', tag: 'Founder' },
    { id: 't-1-1', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', label: 'Marcus V.', tag: 'Agency' },
    { id: 't-1-2', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80', label: 'Gallery Showcase', tag: 'Art' },
  ],
  // Column 2 (Center)
  [
    { id: 't-2-0', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80', label: 'Mateo S.', tag: 'Music' },
    { id: 't-2-1', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80', label: 'Chloe L.', tag: 'Coaching' },
    { id: 't-2-2', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80', label: 'Studio Flow', tag: 'Movement' },
  ],
  // Column 3
  [
    { id: 't-3-0', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80', label: 'DJ Sets', tag: 'Audio' },
    { id: 't-3-1', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', label: 'Code & SaaS', tag: 'Software' },
    { id: 't-3-2', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format&fit=crop&q=80', label: 'Client Growth', tag: 'Metrics' },
  ],
  // Column 4 (Rightmost)
  [
    { id: 't-4-0', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', label: 'Community', tag: 'Creator' },
    { id: 't-4-1', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', label: 'Newsletter', tag: 'Substack' },
    { id: 't-4-2', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80', label: 'Portfolio', tag: 'Showcase' },
  ],
];

interface TileRevealTestimonialsProps {
  onOpenStudio: () => void;
}

export const TileRevealTestimonials: React.FC<TileRevealTestimonialsProps> = ({
  onOpenStudio,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Track scroll progress within the sticky section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  // Tile column animation transforms
  // Phase 1 (0 to 0.35): Columns fly in from top and bottom offsets into neutral position (0px)
  // Phase 2 (0.45 to 0.85): Grid zooms past the edges (scale 1 -> 4.2), and columns spread outward
  const col0Y = useTransform(smoothProgress, [0, 0.3, 0.5, 0.85], [-260, 0, 0, -450]);
  const col1Y = useTransform(smoothProgress, [0, 0.32, 0.5, 0.85], [280, 0, 0, 480]);
  const col2Y = useTransform(smoothProgress, [0, 0.28, 0.5, 0.85], [-220, 0, 0, -520]);
  const col3Y = useTransform(smoothProgress, [0, 0.34, 0.5, 0.85], [260, 0, 0, 460]);
  const col4Y = useTransform(smoothProgress, [0, 0.36, 0.5, 0.85], [-280, 0, 0, -490]);

  const col0X = useTransform(smoothProgress, [0.45, 0.85], [0, -380]);
  const col1X = useTransform(smoothProgress, [0.45, 0.85], [0, -200]);
  const col2X = useTransform(smoothProgress, [0.45, 0.85], [0, 0]);
  const col3X = useTransform(smoothProgress, [0.45, 0.85], [0, 200]);
  const col4X = useTransform(smoothProgress, [0.45, 0.85], [0, 380]);

  // Overall grid scaling and tile opacity
  const gridScale = useTransform(smoothProgress, [0, 0.35, 0.5, 0.85], [0.92, 1, 1, 3.8]);
  const tilesOpacity = useTransform(smoothProgress, [0, 0.08, 0.6, 0.82], [0.3, 1, 1, 0]);

  // Intro overlay over tiles before zoom
  const introOverlayOpacity = useTransform(smoothProgress, [0.1, 0.35, 0.48], [0, 1, 0]);
  const introOverlayScale = useTransform(smoothProgress, [0.1, 0.35, 0.48], [0.9, 1, 1.1]);

  // Revealed content (Headline, Testimonials cards, and CTA) that appears once tiles zoom past edges
  const revealOpacity = useTransform(smoothProgress, [0.55, 0.72, 1], [0, 0.95, 1]);
  const revealScale = useTransform(smoothProgress, [0.55, 0.75, 1], [0.88, 1, 1]);
  const revealY = useTransform(smoothProgress, [0.55, 0.75, 1], [50, 0, 0]);

  const filteredTestimonials = selectedCategory === 'all'
    ? DEFAULT_TESTIMONIALS
    : DEFAULT_TESTIMONIALS.filter((t) => t.category === selectedCategory);

  const activeTestimonial = filteredTestimonials[activeTestimonialIndex % filteredTestimonials.length] || filteredTestimonials[0];

  const handlePrev = () => {
    setActiveTestimonialIndex((prev) => (prev > 0 ? prev - 1 : filteredTestimonials.length - 1));
  };

  const handleNext = () => {
    setActiveTestimonialIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  return (
    <div id="testimonials" ref={containerRef} className="relative h-[270vh] bg-[#ECE7DC]">
      {/* Sticky Screen Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Subtle radial canvas ambiance */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,rgba(236,231,220,0.95)_100%)] pointer-events-none" />

        {/* 1. TILE GRID (Flies in column by column on scroll, then zooms past edges) */}
        <motion.div
          style={{
            scale: gridScale,
            opacity: tilesOpacity,
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4 max-w-6xl w-full px-4 transform-gpu">
            {/* Column 0 */}
            <motion.div
              style={{ y: col0Y, x: col0X }}
              className="flex flex-col gap-3 sm:gap-4"
            >
              {GRID_COLUMNS[0].map((tile) => (
                <div
                  key={tile.id}
                  className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-md border border-black/10 bg-black/5"
                >
                  <img
                    src={tile.image}
                    alt={tile.label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                      {tile.tag}
                    </span>
                    <p className="text-xs font-bold mt-1 truncate">{tile.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Column 1 */}
            <motion.div
              style={{ y: col1Y, x: col1X }}
              className="flex flex-col gap-3 sm:gap-4"
            >
              {GRID_COLUMNS[1].map((tile) => (
                <div
                  key={tile.id}
                  className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-md border border-black/10 bg-black/5"
                >
                  <img
                    src={tile.image}
                    alt={tile.label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                      {tile.tag}
                    </span>
                    <p className="text-xs font-bold mt-1 truncate">{tile.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Column 2 (Center) */}
            <motion.div
              style={{ y: col2Y, x: col2X }}
              className="flex flex-col gap-3 sm:gap-4"
            >
              {GRID_COLUMNS[2].map((tile) => (
                <div
                  key={tile.id}
                  className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-md border border-black/10 bg-black/5"
                >
                  <img
                    src={tile.image}
                    alt={tile.label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                      {tile.tag}
                    </span>
                    <p className="text-xs font-bold mt-1 truncate">{tile.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Column 3 (Hidden on very small screens, visible on sm+) */}
            <motion.div
              style={{ y: col3Y, x: col3X }}
              className="hidden sm:flex flex-col gap-3 sm:gap-4"
            >
              {GRID_COLUMNS[3].map((tile) => (
                <div
                  key={tile.id}
                  className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-md border border-black/10 bg-black/5"
                >
                  <img
                    src={tile.image}
                    alt={tile.label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                      {tile.tag}
                    </span>
                    <p className="text-xs font-bold mt-1 truncate">{tile.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Column 4 (Hidden on small screens, visible on sm+) */}
            <motion.div
              style={{ y: col4Y, x: col4X }}
              className="hidden sm:flex flex-col gap-3 sm:gap-4"
            >
              {GRID_COLUMNS[4].map((tile) => (
                <div
                  key={tile.id}
                  className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-md border border-black/10 bg-black/5"
                >
                  <img
                    src={tile.image}
                    alt={tile.label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
                      {tile.tag}
                    </span>
                    <p className="text-xs font-bold mt-1 truncate">{tile.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* 2. MID-STAGE INTRO OVERLAY (appears while tiles are assembled) */}
        <motion.div
          style={{
            opacity: introOverlayOpacity,
            scale: introOverlayScale,
          }}
          className="absolute z-20 pointer-events-none text-center px-4 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-black/10 text-xs font-black text-[#1C1E22] shadow-lg mb-3">
            <span className="w-2 h-2 rounded-full bg-[#5E4BF7]" />
            <span>24,000+ CREATORS POWERED WORLDWIDE</span>
          </div>
          <h3 className="text-3xl sm:text-5xl font-black text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] tracking-tight">
            Designed for Creators.
            <br />
            Loved by Audiences.
          </h3>
          <p className="text-xs sm:text-sm font-bold text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mt-2">
            Keep scrolling to reveal creator stories ↓
          </p>
        </motion.div>

        {/* 3. REVEALED HEADLINE & CALL TO ACTION (Zoomed past edges) */}
        <motion.div
          style={{
            opacity: revealOpacity,
            scale: revealScale,
            y: revealY,
          }}
          className="relative z-30 max-w-5xl w-full mx-auto px-4 sm:px-6 flex flex-col items-center justify-center my-auto pointer-events-auto"
        >
          {/* Rating Proof Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-bold text-stone-900 mb-3 sm:mb-4 shadow-2xs">
            <div className="flex items-center gap-0.5 text-amber-500">
              <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-400" />
              <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-400" />
              <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-400" />
              <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-400" />
              <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-400" />
            </div>
            <span>Rated 4.9/5 from 2,400+ verified creators & founders</span>
          </div>

          {/* Revealed Headline */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1C1E22] tracking-tight text-center leading-tight">
            Why Creators Are Switching to LinkLyra
          </h2>
          <p className="mt-2 text-xs sm:text-base text-[#555962] text-center max-w-xl mx-auto">
            From YouTubers and writers to indie founders and coaches — transform passive bio clicks into engaged fans and buyers.
          </p>

          {/* Category Tabs */}
          <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'creators', label: 'Video & Media' },
              { id: 'business', label: 'Coaches & Services' },
              { id: 'tech', label: 'Founders & Devs' },
              { id: 'music', label: 'Music & Audio' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(tab.id);
                  setActiveTestimonialIndex(0);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#1C1E22] text-white shadow-xs scale-105'
                    : 'bg-white/80 text-[#737882] border border-black/10 hover:text-[#1C1E22] hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Testimonial Spotlight Card */}
          <div className="mt-5 w-full max-w-3xl">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-md border border-black/10 shadow-xl flex flex-col sm:flex-row items-center gap-6">
              {/* Creator Photo + Verified Tag */}
              <div className="relative shrink-0 text-center sm:text-left">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#5E4BF7] shadow-md mx-auto sm:mx-0">
                  <img
                    src={
                      activeTestimonial.avatar && activeTestimonial.avatar.trim() !== ''
                        ? activeTestimonial.avatar
                        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={activeTestimonial.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {activeTestimonial.platformIcon && activeTestimonial.platformIcon.trim() !== '' && (
                  <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-white shadow border border-black/10">
                    <img
                      src={activeTestimonial.platformIcon}
                      alt="Platform"
                      className="w-4 h-4 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Quote & Metrics Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <HugeiconsIcon key={i} icon={StarIcon} size={14} className="text-amber-400" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-900 text-xs font-black">
                    <HugeiconsIcon icon={TrendingUpIcon} size={14} className="text-emerald-600" />
                    <span>{activeTestimonial.metric}</span>
                    <span className="text-[10px] font-medium text-stone-500">({activeTestimonial.metricLabel})</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-[#1C1E22] leading-relaxed italic line-clamp-3 sm:line-clamp-none">
                  "{activeTestimonial.quote}"
                </p>

                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-xs sm:text-sm text-[#1C1E22]">
                        {activeTestimonial.name}
                      </h4>
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-[#5E4BF7]" />
                      <span className="text-[10px] font-bold text-[#8C919D] hidden sm:inline">
                        • {activeTestimonial.platform}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737882] font-mono">{activeTestimonial.handle} — {activeTestimonial.role}</p>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-[#1C1E22] transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
                      title="Previous review"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                    </button>
                    <span className="text-xs font-mono font-bold text-[#737882]">
                      {(activeTestimonialIndex % filteredTestimonials.length) + 1}/{filteredTestimonials.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-[#1C1E22] transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
                      title="Next review"
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onOpenStudio}
              className="px-6 py-3 rounded-full bg-[#1C1E22] hover:bg-black text-white text-xs sm:text-sm font-black shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Claim Your Free Bio Link</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
            <span className="text-[11px] text-[#737882] font-medium">
              Takes 60 seconds • Zero monthly fees
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
