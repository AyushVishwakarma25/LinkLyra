import {
  OnboardingPrimaryRole,
  OnboardingGoal,
  OnboardingPrimaryCTA,
  GeneratedCardConfig,
  CanvasTheme,
  PageArchetype,
  CardColor,
  CardTemplateType,
} from '../types';

// -------------------------------------------------------------
// Vertical Engine Identifiers
// -------------------------------------------------------------

export type VerticalEngineType =
  | 'creator_engine'
  | 'real_estate_engine'
  | 'coaching_engine'
  | 'freelance_engine'
  | 'business_engine'
  | 'agency_engine'
  | 'consultant_engine'
  | 'general_engine';

// -------------------------------------------------------------
// Definition Interfaces for Extensibility
// -------------------------------------------------------------

export interface GoalDefinition {
  id: OnboardingGoal;
  label: string;
  description: string;
  badge?: string;
  iconName?: string;
}

export interface CTADefinition {
  id: OnboardingPrimaryCTA;
  label: string;
  subtext: string;
  iconName?: string;
}

export interface RecommendedCTAConfig {
  id: OnboardingPrimaryCTA;
  buttonLabel: string;
  actionType: 'whatsapp' | 'booking' | 'external_url' | 'inquiry_modal' | 'listing_gallery';
  badge?: string;
  priorityOrder: number;
}

export interface CardRecommendationRule {
  cardKey: string;
  title: string;
  subtitle: string;
  color: CardColor;
  templateType: CardTemplateType;
  badgeText?: string;
  linkUrl?: string;
  priorityWeight: number; // Lower number = placed higher in conversion funnel
  triggeredByGoals?: OnboardingGoal[];
  triggeredByCTAs?: OnboardingPrimaryCTA[];
  metaGenerator?: (ctx: {
    fullName: string;
    whatsapp?: string;
    roleData?: Record<string, unknown>;
  }) => Record<string, unknown>;
}

export interface VerticalDefinition {
  role: OnboardingPrimaryRole;
  displayName: string;
  tagline: string;
  verticalEngine: VerticalEngineType;
  suggestedPageArchetype: PageArchetype;
  suggestedTheme: CanvasTheme;
  recommendedCTA: RecommendedCTAConfig;
  goals: GoalDefinition[];
  ctas: CTADefinition[];
  cardRules: CardRecommendationRule[];
  defaultRoleData: Record<string, unknown>;
}

export interface RecommendationInput {
  role: OnboardingPrimaryRole;
  goals: OnboardingGoal[];
  primaryCTA: OnboardingPrimaryCTA;
  fullName?: string;
  whatsapp?: string;
  country?: string;
  roleData?: Record<string, unknown>;
}

export interface RecommendationResult {
  verticalEngine: VerticalEngineType;
  pageArchetype: PageArchetype;
  suggestedTheme: CanvasTheme;
  recommendedCTA: RecommendedCTAConfig;
  recommendedCards: GeneratedCardConfig[];
  cardOrder: string[];
  rationale: string[];
}

// -------------------------------------------------------------
// Centralized Vertical Registry (Easily Extensible)
// -------------------------------------------------------------

export const VERTICAL_REGISTRY: Record<OnboardingPrimaryRole, VerticalDefinition> = {
  // 1. CONTENT CREATOR / INFLUENCER
  creator: {
    role: 'creator',
    displayName: 'Content Creator & Influencer',
    tagline: 'Brand deals, rate cards, UGC portfolio & audience links',
    verticalEngine: 'creator_engine',
    suggestedPageArchetype: 'hire_me_creator',
    suggestedTheme: 'creator',
    recommendedCTA: {
      id: 'send_inquiry',
      buttonLabel: 'Partner / Work With Me',
      actionType: 'inquiry_modal',
      badge: 'Brand Deals',
      priorityOrder: 1,
    },
    goals: [
      { id: 'brand_collaborations', label: 'Brand Collaborations', description: 'Secure sponsorships and paid partnership deals' },
      { id: 'showcase_work', label: 'Showcase Work & UGC', description: 'Highlight top performing reels, TikToks & YouTube videos' },
      { id: 'media_kit', label: 'Verified Media Kit', description: 'Share live verified reach, audience demographics & CPM rates' },
      { id: 'ugc_clients', label: 'UGC Clients', description: 'Sell content packages directly to direct-to-consumer brands' },
      { id: 'affiliate_sales', label: 'Affiliate Sales', description: 'Drive trackable commissions to favorite gear & products' },
      { id: 'grow_audience', label: 'Grow Audience', description: 'Funnel cross-platform followers to YouTube, newsletter & socials' },
    ],
    ctas: [
      { id: 'send_inquiry', label: 'Brand Deal Inquiry', subtext: 'Direct sponsor proposal form with budget filter' },
      { id: 'whatsapp_chat', label: 'WhatsApp / Quick Chat', subtext: 'Immediate agency & sponsor messaging' },
      { id: 'view_portfolio', label: 'View UGC Portfolio', subtext: 'Showcase video hooks and conversion samples' },
      { id: 'download_epk_or_kit', label: 'Download Media Kit', subtext: 'One-click verified stats PDF & rates' },
    ],
    defaultRoleData: {
      primaryPlatform: 'instagram',
      niche: 'Lifestyle & Tech',
      followerCountEstimate: '50K+',
      collabRateStartingAt: '$500 / ₹40,000',
    },
    cardRules: [
      {
        cardKey: 'brand_inquiry_card',
        title: 'Work With Me & Sponsor Rates',
        subtitle: 'Official brand partnership inquiry & campaign booking',
        color: 'purple',
        templateType: 'brand_inquiry',
        badgeText: 'HIRE ME',
        priorityWeight: 10,
        triggeredByGoals: ['brand_collaborations', 'ugc_clients'],
        triggeredByCTAs: ['send_inquiry'],
        metaGenerator: (ctx) => ({
          brandInquiry: {
            title: `Work With ${ctx.fullName || 'Me'}`,
            deliverablesOffered: ['1x Instagram Reel / TikTok', '1x Dedicated Story Set', 'Usage Rights (30 Days)', 'Link in Bio Placement'],
            startingPrice: ctx.roleData?.collabRateStartingAt || '$750 / ₹55,000',
            estimatedTurnaround: '4 to 7 business days',
          },
        }),
      },
      {
        cardKey: 'creator_stats_card',
        title: 'Audience Demographics & Reach',
        subtitle: 'Verified 85%+ retention, 250K+ monthly organic impressions',
        color: 'dark',
        templateType: 'creator_stats',
        badgeText: 'VERIFIED STATS',
        priorityWeight: 20,
        triggeredByGoals: ['brand_collaborations', 'media_kit'],
        triggeredByCTAs: ['download_epk_or_kit'],
        metaGenerator: () => ({
          creatorStats: {
            totalReach: '250,000+',
            avgEngagementRate: '6.4%',
            primaryDemographic: '74% 18–34 Tech & Lifestyle',
            topCountries: ['United States', 'India', 'United Kingdom', 'Canada'],
          },
        }),
      },
      {
        cardKey: 'featured_work_card',
        title: 'Featured Campaigns & UGC Portfolio',
        subtitle: 'High-converting UGC reels and viral branded integrations',
        color: 'orange',
        templateType: 'featured_work',
        badgeText: 'PORTFOLIO',
        priorityWeight: 30,
        triggeredByGoals: ['showcase_work', 'ugc_clients'],
        triggeredByCTAs: ['view_portfolio'],
        metaGenerator: () => ({
          creatorWork: {
            samplesCount: 4,
            category: 'UGC & Video Production',
          },
        }),
      },
      {
        cardKey: 'creator_packages_card',
        title: 'Creator Packages & Rate Card',
        subtitle: 'Pre-packaged video deliverables, whitelisting & bundles',
        color: 'green',
        templateType: 'creator_packages',
        badgeText: 'PACKAGES',
        priorityWeight: 40,
        triggeredByGoals: ['ugc_clients', 'brand_collaborations'],
        metaGenerator: () => ({
          creatorPackages: {
            currency: 'USD',
            packages: [
              { name: 'Single UGC Video', price: '$450', turnaround: '3 Days', description: 'Full 9:16 script, filming & 2 revisions' },
              { name: 'Organic Reel + Story', price: '$850', turnaround: '5 Days', description: 'Posted to creator feed with tracking link' },
            ],
          },
        }),
      },
      {
        cardKey: 'affiliate_card',
        title: 'My Daily Gear & Recommended Tools',
        subtitle: 'Curated products with exclusive subscriber discount codes',
        color: 'yellow',
        templateType: 'recommendation',
        badgeText: 'GEAR & DISCOUNTS',
        priorityWeight: 50,
        triggeredByGoals: ['affiliate_sales', 'grow_audience'],
      },
    ],
  },

  // 2. REAL ESTATE AGENT / BROKER
  real_estate: {
    role: 'real_estate',
    displayName: 'Real Estate Agent & Broker',
    tagline: 'Property listings, home valuations & scheduled private showings',
    verticalEngine: 'real_estate_engine',
    suggestedPageArchetype: 'realtor_showcase',
    suggestedTheme: 'business',
    recommendedCTA: {
      id: 'schedule_showing',
      buttonLabel: 'Schedule Private Showing',
      actionType: 'booking',
      badge: 'VIP Tours',
      priorityOrder: 1,
    },
    goals: [
      { id: 'property_enquiries', label: 'Property Enquiries', description: 'Collect high-intent buyer inquiries for current listings' },
      { id: 'schedule_showing', label: 'Schedule Showings', description: 'Let pre-approved buyers book private walkthrough slots' },
      { id: 'seller_leads', label: 'Seller Leads & Valuations', description: 'Attract homeowners looking for competitive market analysis' },
      { id: 'showcase_listings', label: 'Showcase Listings', description: 'Display active MLS properties with pricing, photos & specs' },
      { id: 'whatsapp_leads', label: 'WhatsApp Instant Leads', description: 'Direct one-tap WhatsApp inquiries with property details' },
      { id: 'local_credibility', label: 'Local Credibility', description: 'Highlight past sales, 5-star client reviews & brokerage licensing' },
    ],
    ctas: [
      { id: 'schedule_showing', label: 'Book a Showing', subtext: 'Private viewing appointment selector' },
      { id: 'view_listings', label: 'Explore Active Listings', subtext: 'Full MLS catalog with price and status' },
      { id: 'whatsapp_chat', label: 'WhatsApp Property Desk', subtext: 'Instant messaging for serious buyers' },
      { id: 'send_inquiry', label: 'Request Home Valuation', subtext: 'Free CMA report for homeowners' },
    ],
    defaultRoleData: {
      brokerage: 'Premier Luxury Realty',
      licenseNumber: 'RERA / TREC Registered',
      primaryPropertyType: 'luxury',
      serviceAreas: ['Downtown', 'West Hills', 'Waterfront'],
    },
    cardRules: [
      {
        cardKey: 'featured_listing_card',
        title: 'Featured Exclusive Listing: 4-Bed Penthouse',
        subtitle: 'Panoramic skyline view • Private elevator • $1,250,000 / ₹3.2 Cr',
        color: 'dark',
        templateType: 'real_estate',
        badgeText: 'JUST LISTED',
        priorityWeight: 10,
        triggeredByGoals: ['showcase_listings', 'property_enquiries'],
        triggeredByCTAs: ['view_listings'],
        metaGenerator: () => ({
          realEstate: {
            propertyName: 'The Sovereign Sky Residence 14B',
            price: '$1,250,000',
            location: 'Downtown Core • Metro Walkable',
            propertyType: '4 Bed • 4.5 Bath • 3,200 sq ft',
            statusTag: 'just_listed',
            featuredAmenity: 'Private Terrace & 2 EV Parking Spots',
          },
        }),
      },
      {
        cardKey: 'schedule_showing_card',
        title: 'Book a Private Walkthrough',
        subtitle: 'Select an available private showing slot with instant confirmation',
        color: 'purple',
        templateType: 'showing_booking',
        badgeText: 'SCHEDULE TOUR',
        priorityWeight: 20,
        triggeredByGoals: ['schedule_showing', 'property_enquiries'],
        triggeredByCTAs: ['schedule_showing'],
        metaGenerator: () => ({
          showingBooking: {
            propertyTitle: 'Private Property Tour Request',
            availableDays: 'Mon – Sat',
            availableSlots: ['10:00 AM – 12:00 PM', '2:00 PM – 4:00 PM', '5:00 PM – 7:00 PM'],
            requirePreApproval: false,
          },
        }),
      },
      {
        cardKey: 'home_valuation_card',
        title: 'What Is Your Home Worth in Today’s Market?',
        subtitle: 'Receive a free, no-obligation comparative market valuation within 24h',
        color: 'green',
        templateType: 'home_valuation',
        badgeText: 'FREE VALUATION',
        priorityWeight: 30,
        triggeredByGoals: ['seller_leads', 'local_credibility'],
        metaGenerator: (ctx) => ({
          homeValuation: {
            headline: 'Free Home Value Analysis',
            subheadline: `Provided by ${ctx.fullName || 'Local Real Estate Specialist'}`,
            serviceAreas: ctx.roleData?.serviceAreas || ['Metro Area', 'Suburbs'],
          },
        }),
      },
      {
        cardKey: 'realtor_reviews_card',
        title: 'Client Testimonials & Closed Deals',
        subtitle: '★★★★★ 4.98 Rating over 40+ verified buyer & seller transactions',
        color: 'yellow',
        templateType: 'client_reviews',
        badgeText: '5-STAR RATED',
        priorityWeight: 40,
        triggeredByGoals: ['local_credibility', 'property_enquiries'],
        metaGenerator: () => ({
          clientReview: {
            rating: 5,
            reviewText: 'Found our dream home within 2 weeks and negotiated $40k under asking! Incredible professionalism.',
            clientName: 'David & Sarah M.',
            clientTitleOrProperty: 'Purchased Luxury Waterfront Villa',
            verifiedDeal: true,
          },
        }),
      },
    ],
  },

  // 3. COACH / EDUCATOR
  coach: {
    role: 'coach',
    displayName: 'Coach & Educator',
    tagline: '1-on-1 mentorship, cohort programs, course admissions & student leads',
    verticalEngine: 'coaching_engine',
    suggestedPageArchetype: 'coaching',
    suggestedTheme: 'warm',
    recommendedCTA: {
      id: 'book_call',
      buttonLabel: 'Book 1-on-1 Strategy Call',
      actionType: 'booking',
      badge: 'Free Session',
      priorityOrder: 1,
    },
    goals: [
      { id: 'student_enquiries', label: 'Student Enquiries', description: 'Collect inquiries from prospective students and mentees' },
      { id: 'promote_courses', label: 'Promote Courses', description: 'Drive enrollments for upcoming live cohorts & video courses' },
      { id: 'admissions', label: 'Cohort Admissions', description: 'Accept and screen applications for exclusive mastermind groups' },
      { id: 'consultations', label: 'Paid Consultations', description: 'Book 1-on-1 advisory sessions with integrated scheduling' },
      { id: 'whatsapp_leads', label: 'WhatsApp Admissions Desk', description: 'Quick WhatsApp answers for student doubts & payment queries' },
      { id: 'resources', label: 'Free Resources & Cheatsheets', description: 'Grow email list with high-value templates & roadmaps' },
    ],
    ctas: [
      { id: 'book_call', label: 'Book Discovery Call', subtext: '15-min consultation to evaluate coaching fit' },
      { id: 'join_cohort', label: 'Apply For Next Cohort', subtext: 'Screening application with limited batch seats' },
      { id: 'whatsapp_chat', label: 'WhatsApp Guidance Desk', subtext: 'Direct chat with admission mentors' },
      { id: 'buy_product', label: 'Enroll in Masterclass', subtext: 'Instant checkout for self-paced curriculum' },
    ],
    defaultRoleData: {
      fieldOrSubject: 'Career & Executive Coaching',
      courseFormat: 'cohort',
      instituteOrBrand: 'Mastery Academy',
    },
    cardRules: [
      {
        cardKey: 'coaching_cohort_card',
        title: 'Mastery Cohort & Intensive Program',
        subtitle: '6-week live transformational program • Limited to 25 seats',
        color: 'purple',
        templateType: 'coaching_institute',
        badgeText: 'ADMISSIONS OPEN',
        priorityWeight: 10,
        triggeredByGoals: ['promote_courses', 'admissions', 'student_enquiries'],
        triggeredByCTAs: ['join_cohort', 'buy_product'],
        metaGenerator: (ctx) => ({
          coaching: {
            instituteName: ctx.roleData?.instituteOrBrand || 'Elite Coaching Cohort',
            courseName: ctx.roleData?.fieldOrSubject || 'Accelerated Leadership Mastery',
            duration: '6 Weeks (Live Interactive)',
            batchDates: 'Starts 1st of next month',
            price: '$999 / ₹35,000',
            highlights: ['Weekly 1-on-1 feedback', 'Lifetime alumni network access', 'Customized action plan'],
          },
        }),
      },
      {
        cardKey: 'consultation_booking_card',
        title: 'Book a 1-on-1 Discovery Call',
        subtitle: '15-minute alignment session to diagnose challenges and goals',
        color: 'dark',
        templateType: 'work_with_me',
        badgeText: 'FREE SESSION',
        priorityWeight: 20,
        triggeredByGoals: ['consultations', 'student_enquiries'],
        triggeredByCTAs: ['book_call'],
      },
      {
        cardKey: 'free_resource_card',
        title: 'Download Free Roadmap & Cheatsheet',
        subtitle: 'Step-by-step action guide for ambitious practitioners',
        color: 'orange',
        templateType: 'product',
        badgeText: 'FREE DOWNLOAD',
        priorityWeight: 30,
        triggeredByGoals: ['resources', 'promote_courses'],
      },
      {
        cardKey: 'coach_reviews_card',
        title: 'Student Success Stories & Reviews',
        subtitle: 'See how our alumni transitioned into senior roles & scaled businesses',
        color: 'yellow',
        templateType: 'client_reviews',
        badgeText: 'ALUMNI REVIEWS',
        priorityWeight: 40,
        triggeredByGoals: ['student_enquiries', 'admissions'],
      },
    ],
  },

  // 4. FREELANCER
  freelancer: {
    role: 'freelancer',
    displayName: 'Freelancer & Specialist',
    tagline: 'Client pipeline, service packages, rate card & portfolio showcase',
    verticalEngine: 'freelance_engine',
    suggestedPageArchetype: 'hire_me_creator',
    suggestedTheme: 'minimal',
    recommendedCTA: {
      id: 'book_call',
      buttonLabel: 'Book Intro Call',
      actionType: 'booking',
      badge: 'Available Now',
      priorityOrder: 1,
    },
    goals: [
      { id: 'get_clients', label: 'Get High-Paying Clients', description: 'Fill your monthly client roster with qualified inbound projects' },
      { id: 'showcase_portfolio', label: 'Showcase Portfolio', description: 'Curate case studies with tangible ROI and client results' },
      { id: 'book_calls', label: 'Book Discovery Calls', description: 'Let prospective clients choose a time on your calendar' },
      { id: 'sell_services', label: 'Sell Productized Services', description: 'Clear fixed-scope packages with upfront transparent pricing' },
      { id: 'collect_enquiries', label: 'Collect Project Inquiries', description: 'Form with budget, timeline and project requirements' },
    ],
    ctas: [
      { id: 'book_call', label: 'Book Strategy / Intro Call', subtext: 'Direct Google Meet / Zoom appointment' },
      { id: 'send_inquiry', label: 'Submit Project RFP', subtext: 'Detailed requirements questionnaire' },
      { id: 'whatsapp_chat', label: 'WhatsApp Fast Response', subtext: 'Direct message for urgent client projects' },
      { id: 'view_portfolio', label: 'Explore Case Studies', subtext: 'Before/after metrics and client proofs' },
    ],
    defaultRoleData: {
      specialty: 'Full-Stack Software Engineering',
      hourlyOrStartingRate: '$85/hr or $2,500/project',
      experienceYears: '5+ years',
    },
    cardRules: [
      {
        cardKey: 'freelance_service_packages',
        title: 'Productized Services & Deliverables',
        subtitle: 'Fixed-price scopes with transparent deadlines and deliverables',
        color: 'purple',
        templateType: 'creator_packages',
        badgeText: 'FLAT PRICING',
        priorityWeight: 10,
        triggeredByGoals: ['sell_services', 'get_clients'],
        triggeredByCTAs: ['send_inquiry', 'book_call'],
      },
      {
        cardKey: 'freelance_portfolio_card',
        title: 'Selected Client Work & Case Studies',
        subtitle: 'Real-world business outcomes, conversions, and client reviews',
        color: 'dark',
        templateType: 'featured_work',
        badgeText: 'PROVEN RESULTS',
        priorityWeight: 20,
        triggeredByGoals: ['showcase_portfolio', 'get_clients'],
        triggeredByCTAs: ['view_portfolio'],
      },
      {
        cardKey: 'freelance_contact_card',
        title: 'Inquire About Your Project',
        subtitle: 'Share your timeline and project brief for an estimate within 24 hours',
        color: 'green',
        templateType: 'work_with_me',
        badgeText: 'ACCEPTING CLIENTS',
        priorityWeight: 30,
        triggeredByGoals: ['collect_enquiries', 'book_calls'],
      },
    ],
  },

  // 5. DESIGNER
  designer: {
    role: 'designer',
    displayName: 'UI/UX & Brand Designer',
    tagline: 'Visual portfolio, design sprints, brand kits & project requests',
    verticalEngine: 'freelance_engine',
    suggestedPageArchetype: 'hire_me_creator',
    suggestedTheme: 'glass',
    recommendedCTA: {
      id: 'view_portfolio',
      buttonLabel: 'View Design Portfolio',
      actionType: 'listing_gallery',
      badge: 'Figma & Web',
      priorityOrder: 1,
    },
    goals: [
      { id: 'get_clients', label: 'Design Sprints & Retainers', description: 'Lock in monthly design subscriptions or project contracts' },
      { id: 'showcase_portfolio', label: 'Interactive Design Showcase', description: 'Showcase web, mobile UI & brand identities in hi-res' },
      { id: 'book_calls', label: 'Project Scoping Call', description: 'Discuss brand goals and UI requirements over video' },
      { id: 'sell_services', label: 'Design Bundles & Sprints', description: 'Offer 1-week website sprints or complete design systems' },
      { id: 'collect_enquiries', label: 'Design Inquiries', description: 'Intake form capturing brand stage, style preferences & scope' },
    ],
    ctas: [
      { id: 'view_portfolio', label: 'Browse Figma & Live Sites', subtext: 'Visual showcase of recent client deliveries' },
      { id: 'book_call', label: 'Book a 15-Min Scoping Call', subtext: 'Clarify project timeline and budget' },
      { id: 'whatsapp_chat', label: 'WhatsApp Instant Chat', subtext: 'Direct message for fast questions' },
      { id: 'send_inquiry', label: 'Request Custom Quote', subtext: 'Detailed design brief submission' },
    ],
    defaultRoleData: {
      specialty: 'Product Design, UI/UX & Brand Systems',
      hourlyOrStartingRate: '$75/hr or $3,000/sprint',
    },
    cardRules: [
      {
        cardKey: 'designer_featured_work',
        title: 'Product & Brand Design Portfolio',
        subtitle: 'Mobile apps, SaaS dashboards, and high-conversion landing pages',
        color: 'dark',
        templateType: 'featured_work',
        badgeText: 'FIGMA & WEB',
        priorityWeight: 10,
        triggeredByGoals: ['showcase_portfolio', 'get_clients'],
        triggeredByCTAs: ['view_portfolio'],
      },
      {
        cardKey: 'designer_sprint_packages',
        title: 'Design Sprints & Subscriptions',
        subtitle: 'Unlimited design requests or fixed-fee 2-week MVP launches',
        color: 'purple',
        templateType: 'creator_packages',
        badgeText: 'SUBSCRIPTION',
        priorityWeight: 20,
        triggeredByGoals: ['sell_services', 'get_clients'],
      },
      {
        cardKey: 'designer_client_review',
        title: 'Founder & Product Lead Reviews',
        subtitle: '★★★★★ "Elevated our product aesthetic and boosted trial conversions by 40%"',
        color: 'yellow',
        templateType: 'client_reviews',
        badgeText: 'VERIFIED REVIEWS',
        priorityWeight: 30,
        triggeredByGoals: ['get_clients', 'collect_enquiries'],
      },
    ],
  },

  // 6. CONSULTANT
  consultant: {
    role: 'consultant',
    displayName: 'Consultant & Strategic Advisor',
    tagline: 'High-value advisory, case studies, executive audits & discovery calls',
    verticalEngine: 'consultant_engine',
    suggestedPageArchetype: 'standard',
    suggestedTheme: 'business',
    recommendedCTA: {
      id: 'book_call',
      buttonLabel: 'Schedule Executive Briefing',
      actionType: 'booking',
      badge: 'Confidential',
      priorityOrder: 1,
    },
    goals: [
      { id: 'book_discovery_calls', label: 'Book Discovery Calls', description: 'Pre-qualify executive leads and advisory consultations' },
      { id: 'client_advisory', label: 'Retainer Advisory', description: 'Position ongoing fractional leadership or board advisory' },
      { id: 'showcase_case_studies', label: 'Showcase Case Studies', description: 'Demonstrate revenue growth, operational efficiency & ROI' },
      { id: 'collect_inquiries', label: 'Inbound Inquiries', description: 'Structured corporate intake for enterprise projects' },
      { id: 'lead_qualification', label: 'Lead Qualification', description: 'Screen client revenue, timeline and project scope' },
    ],
    ctas: [
      { id: 'book_call', label: 'Schedule Discovery Call', subtext: 'Private calendar booking for decision makers' },
      { id: 'send_inquiry', label: 'Inquire for Advisory', subtext: 'Confidential strategic inquiry form' },
      { id: 'whatsapp_chat', label: 'WhatsApp Advisory Line', subtext: 'Direct communication channel' },
      { id: 'view_portfolio', label: 'Read Whitepapers & Insights', subtext: 'Frameworks and strategic playbooks' },
    ],
    defaultRoleData: {
      advisoryFocus: 'Go-to-Market Strategy & Fractional CMO',
      targetClientele: 'B2B SaaS & Mid-Market Enterprises',
    },
    cardRules: [
      {
        cardKey: 'consultant_advisory_card',
        title: 'Executive Advisory & Retainers',
        subtitle: 'Fractional leadership, GTM roadmaps & board advisory packages',
        color: 'dark',
        templateType: 'work_with_me',
        badgeText: 'STRATEGIC ADVISORY',
        priorityWeight: 10,
        triggeredByGoals: ['client_advisory', 'book_discovery_calls'],
        triggeredByCTAs: ['book_call'],
      },
      {
        cardKey: 'consultant_case_studies',
        title: 'Proven Case Studies & Business Impact',
        subtitle: '3.4x average ARR growth delivered across 15+ scale-up client engagements',
        color: 'purple',
        templateType: 'client_reviews',
        badgeText: 'PROVEN ROI',
        priorityWeight: 20,
        triggeredByGoals: ['showcase_case_studies', 'lead_qualification'],
      },
      {
        cardKey: 'consultant_inquiry_card',
        title: 'Request Strategic Audit / RFP',
        subtitle: 'Share your company growth bottlenecks for a comprehensive evaluation',
        color: 'green',
        templateType: 'brand_inquiry',
        badgeText: 'CORPORATE RFP',
        priorityWeight: 30,
        triggeredByGoals: ['collect_inquiries', 'lead_qualification'],
        triggeredByCTAs: ['send_inquiry'],
      },
    ],
  },

  // 7. BUSINESS
  business: {
    role: 'business',
    displayName: 'Business & Brand',
    tagline: 'Product catalog, WhatsApp sales, store visits & lead generation',
    verticalEngine: 'business_engine',
    suggestedPageArchetype: 'standard',
    suggestedTheme: 'business',
    recommendedCTA: {
      id: 'whatsapp_chat',
      buttonLabel: 'Chat & Order on WhatsApp',
      actionType: 'whatsapp',
      badge: 'Quick Reply',
      priorityOrder: 1,
    },
    goals: [
      { id: 'sell_products', label: 'Sell Products', description: 'Showcase bestsellers and direct traffic to your store' },
      { id: 'generate_leads', label: 'Generate Leads & Quotes', description: 'Collect customer contact details and custom quote requests' },
      { id: 'whatsapp_sales', label: 'WhatsApp Sales Channel', description: 'Enable direct 1-tap WhatsApp shopping and inquiries' },
      { id: 'website_visits', label: 'Drive Website Visits', description: 'Direct traffic to your primary website or mobile app' },
      { id: 'showcase_products', label: 'Showcase Product Catalog', description: 'Display cards with pricing, descriptions & images' },
    ],
    ctas: [
      { id: 'whatsapp_chat', label: 'Chat on WhatsApp', subtext: 'Fast product queries, pricing & order desk' },
      { id: 'buy_product', label: 'Shop Bestsellers', subtext: 'Direct links to store product checkout' },
      { id: 'send_inquiry', label: 'Request a Quote / Catalog', subtext: 'Bulk orders and B2B pricing requests' },
      { id: 'book_call', label: 'Schedule Consultation / Demo', subtext: 'Product walkthrough or showroom booking' },
    ],
    defaultRoleData: {
      businessName: 'Modern Commerce',
      industry: 'Direct-to-Consumer & Retail',
      storeType: 'ecommerce',
    },
    cardRules: [
      {
        cardKey: 'business_product_catalog',
        title: 'Featured Products & Bestsellers',
        subtitle: 'Curated seasonal collection with exclusive direct customer pricing',
        color: 'dark',
        templateType: 'product',
        badgeText: 'BESTSELLER',
        priorityWeight: 10,
        triggeredByGoals: ['sell_products', 'showcase_products'],
        triggeredByCTAs: ['buy_product'],
      },
      {
        cardKey: 'business_whatsapp_sales',
        title: 'Order & Inquire via WhatsApp',
        subtitle: 'Connect with our team for instant availability, sizing & order status',
        color: 'green',
        templateType: 'phone',
        badgeText: 'WHATSAPP DESK',
        priorityWeight: 20,
        triggeredByGoals: ['whatsapp_sales', 'generate_leads'],
        triggeredByCTAs: ['whatsapp_chat'],
      },
      {
        cardKey: 'business_customer_reviews',
        title: 'Customer Reviews & Verified Ratings',
        subtitle: '★★★★★ Over 1,500+ happy customers with verified 4.9 star rating',
        color: 'yellow',
        templateType: 'client_reviews',
        badgeText: 'VERIFIED BUYERS',
        priorityWeight: 30,
        triggeredByGoals: ['sell_products', 'generate_leads'],
      },
    ],
  },

  // 8. AGENCY
  agency: {
    role: 'agency',
    displayName: 'Agency & Creative Studio',
    tagline: 'Client retainers, team services, creative reel & inbound RFPs',
    verticalEngine: 'agency_engine',
    suggestedPageArchetype: 'standard',
    suggestedTheme: 'dark',
    recommendedCTA: {
      id: 'send_inquiry',
      buttonLabel: 'Submit Project RFP',
      actionType: 'inquiry_modal',
      badge: 'New Clients',
      priorityOrder: 1,
    },
    goals: [
      { id: 'retainer_clients', label: 'Retainer Clients', description: 'Acquire recurring monthly service contracts' },
      { id: 'portfolio_showcase', label: 'Portfolio Showcase', description: 'Showcase brand transformations, campaigns & results' },
      { id: 'schedule_audit', label: 'Schedule Free Audit', description: 'Offer a complimentary marketing or design audit' },
      { id: 'inbound_rfp', label: 'Inbound Project RFPs', description: 'Collect comprehensive project scopes and budget ranges' },
      { id: 'whatsapp_inquiries', label: 'WhatsApp Inquiries', description: 'Direct contact with client partners' },
    ],
    ctas: [
      { id: 'send_inquiry', label: 'Submit Project RFP', subtext: 'Comprehensive brief submission' },
      { id: 'book_call', label: 'Schedule Strategy Audit', subtext: '30-minute discovery consultation' },
      { id: 'view_portfolio', label: 'View Case Studies & Reel', subtext: 'Client brand transformations' },
      { id: 'whatsapp_chat', label: 'WhatsApp Partner Desk', subtext: 'Direct message for fast agency turnarounds' },
    ],
    defaultRoleData: {
      agencyName: 'Studio Apex',
      coreServices: ['Brand Strategy', 'Performance Marketing', 'Web Development'],
      teamSize: '5–15',
    },
    cardRules: [
      {
        cardKey: 'agency_case_studies',
        title: 'Agency Showreel & Client Campaigns',
        subtitle: 'Explore award-winning campaigns delivered for market leaders',
        color: 'dark',
        templateType: 'featured_work',
        badgeText: 'PORTFOLIO REEL',
        priorityWeight: 10,
        triggeredByGoals: ['portfolio_showcase', 'retainer_clients'],
        triggeredByCTAs: ['view_portfolio'],
      },
      {
        cardKey: 'agency_rfp_card',
        title: 'Request an Agency Proposal / RFP',
        subtitle: 'Tell us about your brand goals for a tailored proposal within 48h',
        color: 'purple',
        templateType: 'brand_inquiry',
        badgeText: 'INQUIRE NOW',
        priorityWeight: 20,
        triggeredByGoals: ['inbound_rfp', 'retainer_clients'],
        triggeredByCTAs: ['send_inquiry'],
      },
      {
        cardKey: 'agency_audit_card',
        title: 'Schedule a Growth & Brand Audit',
        subtitle: 'Free 30-minute strategic review with our creative directors',
        color: 'green',
        templateType: 'work_with_me',
        badgeText: 'COMPLIMENTARY',
        priorityWeight: 30,
        triggeredByGoals: ['schedule_audit', 'retainer_clients'],
        triggeredByCTAs: ['book_call'],
      },
    ],
  },

  // 9. OTHER / MULTI-PURPOSE
  other: {
    role: 'other',
    displayName: 'Multi-Hyphenate & Individual',
    tagline: 'Custom bio link, curated projects, social hub & messaging',
    verticalEngine: 'general_engine',
    suggestedPageArchetype: 'standard',
    suggestedTheme: 'warm',
    recommendedCTA: {
      id: 'whatsapp_chat',
      buttonLabel: 'Get In Touch',
      actionType: 'whatsapp',
      badge: 'Contact',
      priorityOrder: 1,
    },
    goals: [
      { id: 'share_links', label: 'Share All Important Links', description: 'One single hub for all your websites, socials & projects' },
      { id: 'grow_audience', label: 'Grow Your Audience', description: 'Attract subscribers and followers across social networks' },
      { id: 'contact_me', label: 'Direct Contact & Inquiries', description: 'Enable visitors to send you messages or emails easily' },
      { id: 'showcase_projects', label: 'Showcase Projects', description: 'Highlight personal creations, blogs & accomplishments' },
      { id: 'whatsapp_connect', label: 'WhatsApp Connect', description: 'Instant 1-tap messaging without saving phone numbers' },
    ],
    ctas: [
      { id: 'whatsapp_chat', label: 'WhatsApp Message', subtext: 'Direct private chat' },
      { id: 'send_inquiry', label: 'Send an Email / Message', subtext: 'Contact form' },
      { id: 'view_portfolio', label: 'View Latest Work', subtext: 'Project gallery' },
      { id: 'custom_link', label: 'Custom Destination', subtext: 'Your personal link' },
    ],
    defaultRoleData: {},
    cardRules: [
      {
        cardKey: 'other_contact_card',
        title: 'Connect & Inquire',
        subtitle: 'Have an inquiry or collaboration idea? Send a direct message',
        color: 'purple',
        templateType: 'standard',
        badgeText: 'CONNECT',
        priorityWeight: 10,
        triggeredByGoals: ['contact_me', 'whatsapp_connect'],
        triggeredByCTAs: ['whatsapp_chat', 'send_inquiry'],
      },
      {
        cardKey: 'other_projects_card',
        title: 'Explore My Projects & Writing',
        subtitle: 'Articles, open-source work and creative highlights',
        color: 'dark',
        templateType: 'standard',
        badgeText: 'PROJECTS',
        priorityWeight: 20,
        triggeredByGoals: ['showcase_projects', 'share_links'],
        triggeredByCTAs: ['view_portfolio'],
      },
      {
        cardKey: 'other_social_hub',
        title: 'Follow My Journey Across Socials',
        subtitle: 'Join the community on YouTube, Instagram, and Twitter / X',
        color: 'orange',
        templateType: 'standard',
        badgeText: 'COMMUNITY',
        priorityWeight: 30,
        triggeredByGoals: ['grow_audience', 'share_links'],
      },
    ],
  },
};

// -------------------------------------------------------------
// Helper Accessor Functions
// -------------------------------------------------------------

export function getAllRegisteredRoles(): OnboardingPrimaryRole[] {
  return Object.keys(VERTICAL_REGISTRY) as OnboardingPrimaryRole[];
}

export function getVerticalDefinition(role: OnboardingPrimaryRole): VerticalDefinition {
  return VERTICAL_REGISTRY[role] || VERTICAL_REGISTRY.other;
}

export function getAvailableGoalsForRole(role: OnboardingPrimaryRole): GoalDefinition[] {
  return getVerticalDefinition(role).goals;
}

export function getAvailableCTAsForRole(role: OnboardingPrimaryRole): CTADefinition[] {
  return getVerticalDefinition(role).ctas;
}

// Extensibility helper: Allows registering third-party or custom vertical plugins
export function registerVertical(vertical: VerticalDefinition): void {
  VERTICAL_REGISTRY[vertical.role] = vertical;
}

// -------------------------------------------------------------
// Recommendation Engine (role + goals + primaryCTA -> cards)
// -------------------------------------------------------------

export function generateOnboardingRecommendations(input: RecommendationInput): RecommendationResult {
  const vertical = getVerticalDefinition(input.role);
  const rationale: string[] = [];

  // 1. Resolve CTA recommendation
  const matchedCTA = vertical.ctas.find((c) => c.id === input.primaryCTA);
  const recommendedCTA: RecommendedCTAConfig = {
    id: input.primaryCTA,
    buttonLabel: matchedCTA ? matchedCTA.label : vertical.recommendedCTA.buttonLabel,
    actionType: input.primaryCTA === 'whatsapp_chat' ? 'whatsapp' : input.primaryCTA === 'book_call' ? 'booking' : 'inquiry_modal',
    badge: matchedCTA ? matchedCTA.subtext : vertical.recommendedCTA.badge,
    priorityOrder: 1,
  };
  rationale.push(`Selected primary CTA "${input.primaryCTA}" tailored for ${vertical.displayName}`);

  // 2. Score and pick cards from the rule catalog
  const selectedGoalsSet = new Set(input.goals);
  const selectedCards: Array<{
    rule: CardRecommendationRule;
    score: number;
    reason: string;
  }> = [];

  for (const rule of vertical.cardRules) {
    let matchesGoal = false;
    let matchesCTA = false;
    const reasons: string[] = [];

    if (rule.triggeredByGoals && rule.triggeredByGoals.some((g) => selectedGoalsSet.has(g))) {
      matchesGoal = true;
      const matchedList = rule.triggeredByGoals.filter((g) => selectedGoalsSet.has(g));
      reasons.push(`matches goal(s): ${matchedList.join(', ')}`);
    }

    if (rule.triggeredByCTAs && rule.triggeredByCTAs.includes(input.primaryCTA)) {
      matchesCTA = true;
      reasons.push(`matches primary CTA: ${input.primaryCTA}`);
    }

    // Include if it matches either a selected goal or CTA, or if no goals were selected yet
    if (matchesGoal || matchesCTA || input.goals.length === 0) {
      let score = rule.priorityWeight;
      if (matchesCTA) score -= 5; // Boost priority for CTA anchor
      if (matchesGoal) score -= 3; // Boost priority for goal match

      selectedCards.push({
        rule,
        score,
        reason: reasons.join(' and ') || 'default starter recommendation',
      });
    }
  }

  // Ensure at least 2 cards are always provided as fallback
  if (selectedCards.length < 2) {
    for (const rule of vertical.cardRules) {
      if (!selectedCards.some((sc) => sc.rule.cardKey === rule.cardKey)) {
        selectedCards.push({
          rule,
          score: rule.priorityWeight + 10,
          reason: 'included to ensure complete starter layout',
        });
        if (selectedCards.length >= 3) break;
      }
    }
  }

  // 3. Sort by computed score (ascending priorityWeight)
  selectedCards.sort((a, b) => a.score - b.score);

  // 4. Generate strongly typed GeneratedCardConfig instances
  const timestamp = Date.now();
  const generatedCards: GeneratedCardConfig[] = selectedCards.map((item, index) => {
    const { rule, reason } = item;
    rationale.push(`Card "${rule.title}": ${reason}`);

    const cardContext = {
      fullName: input.fullName || '',
      whatsapp: input.whatsapp || '',
      roleData: input.roleData || {},
    };

    const generatedMeta = rule.metaGenerator ? rule.metaGenerator(cardContext) : {};

    const cardConfig: GeneratedCardConfig = {
      id: `card_${timestamp}_${index}_${rule.cardKey}`,
      title: rule.title,
      subtitle: rule.subtitle,
      linkUrl: rule.linkUrl || (input.whatsapp ? `https://wa.me/${input.whatsapp.replace(/\D/g, '')}` : 'https://linklyra.com'),
      color: rule.color,
      templateType: rule.templateType,
      badgeText: rule.badgeText,
      position: index,
      isActive: true,
      isPremium: true,
      priorityWeight: item.score,
      sourceCTA: input.primaryCTA,
      sourceGoal: input.goals[0],
      customWhatsappPhone: input.whatsapp,
      ...generatedMeta,
    };

    return cardConfig;
  });

  const cardOrder = generatedCards.map((c) => c.id);

  return {
    verticalEngine: vertical.verticalEngine,
    pageArchetype: vertical.suggestedPageArchetype,
    suggestedTheme: vertical.suggestedTheme,
    recommendedCTA,
    recommendedCards: generatedCards,
    cardOrder,
    rationale,
  };
}
