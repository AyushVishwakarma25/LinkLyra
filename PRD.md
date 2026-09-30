# 📄 LinkLyra — Product Requirements Document (PRD)

> **Document Version**: 3.1.0  
> **Status**: Production Ready  
> **Target Platform**: Responsive Web (Desktop Studio + Mobile Showroom)  
> **Last Updated**: September 2026

---

## 📖 Executive Summary & Plain Language Jargon Guide

- **PRD (Product Requirements Document)**: The master architectural blueprint specifying what the application does, who it serves, its functional requirements, database schema, and operational standards.
- **Link-in-Bio Showroom**: An interactive, card-based mobile destination replacing flat text lists with tactile, high-converting multimedia cards.
- **"Hire Me" & High-Intent Modes**: Specialized vertical layouts converting simple link pages into lead machines for Content Creators, Real Estate Agents, and Coaches.
- **Account & Settings Hub**: A decoupled command center for public identity, security credentials, preferences, SEO/domains, and data exports.
- **Billing Dashboard**: A dedicated financial center managing Razorpay subscriptions, GST-compliant tax invoices, and PDF receipts.
- **Lead Capture & Routing Engine**: In-app inquiry modals (Brand Deals, Showing Requests, Home Valuations) with automatic Firestore logging and 1-tap WhatsApp dispatch.

---

## 🎯 1. Product Vision & Problem Statement

### The Problem
Traditional "link-in-bio" tools (Linktree, Beacons, Bio.fm) treat every creator identically with a plain vertical stack of rectangular text buttons:
1. **Content Creators**: Don't just need link clicks—they need brand deals, sponsorships, and proof of work. Brand managers bounce when forced to search through 10 generic links instead of seeing niche stats, engagement rates, rate cards, and a direct inquiry form.
2. **Real Estate Agents**: Listing links get lost among personal social buttons. Realtors need to generate qualified buyer showings and seller home valuation requests, with instant WhatsApp notifications and lead tracking.
3. **Coaches & Educators**: Require structured course batch schedules, exam tracks (JEE, NEET, UPSC), and transparent fee breakdowns with frictionless 1-tap admissions inquiries.
4. **Disjointed Settings & Billing**: Monolithic dashboards mix personal preferences with financial transactions, causing slow load times and confusing user flows.

### The Solution: LinkLyra Vertical Engine
**LinkLyra** transforms generic bio links into specialized conversion pages:
- **Creators ("Hire Me" Engine)**: Live audience reach stats, video reel showcases, rate cards (UGC, Reels, Story), Media Kit PDF previews, and instant Brand Inquiry forms.
- **Real Estate Engine**: Property cards with location and pricing tags, direct Showing Booking modal, and Seller Home Valuation forms.
- **Coaching Engine**: Course cards with batch timings, fee structures, and WhatsApp direct enrollment.
- **Decoupled Architecture**: Independent, optimized `<AccountSettings />` and `<BillingDashboard />` modules.

---

## 👥 2. Target User Personas & Use Cases

| Persona | Role / Industry | Primary Goal | LinkLyra Specialized Feature |
| :--- | :--- | :--- | :--- |
| **📸 Creator Maya** | Influencer / UGC Creator (82K Instagram) | Secure brand sponsorships & paid UGC campaigns | **Creator Stats**, **Featured Video Reels**, **Collaboration Rate Packages**, and **Brand Inquiry Modal** |
| **🏢 Realtor Rajesh** | Luxury Real Estate Broker | Capture qualified home buyer and seller leads | **Property Cards**, **Schedule Showing Modal**, and **Free Home Valuation Modal** |
| **🎓 Coach Anjali** | Founder of Competitive Academy | Fill upcoming batch seats and answer admission queries | **Coaching Program Cards** with exam tracks, timings, fee badges, and 1-tap WhatsApp enrollment |
| **💼 Consultant Leo** | Executive Design & Growth Consultant | Book paid discovery audits and white-label their bio page | **Pro Plan Custom Domain**, zero LinkLyra branding, and automated GST tax invoices |

---

## 🚀 3. Functional Requirements & Specifications

### 3.1. Creator-First Vertical Engine & Niche Templates

LinkLyra is purpose-built for **Content Creators** across specialized creator categories:
1. **🎬 Video Creators & YouTubers**: Auto-thumbnail extraction from YouTube (videos, shorts, live, embeds) and Instagram Reels, rendering high-res 16:9 and 9:16 spotlight cards with 1-tap playback.
2. **💰 Instant Tip & Support Jar**: Direct UPI payment card (`upi://pay?pa=...`) with customizable preset chips (₹100, ₹250, ₹500, ₹1000 or custom), creator thank-you note, and instant 1-tap mobile payment with 0% platform fee and zero KYC friction.
3. **🎤 Stand-Up Comedians & Entertainers**: Live Tour Dates card displaying upcoming city stops, venues, dates, and ticket booking links with instant "Sold Out" badges.
4. **👗 Fashion & Lifestyle Creators**: "Shop My Look" affiliate cards with discount coupon badges, 1-tap copy code, and direct brand collaboration packages.
5. **📈 Tech, SaaS & Finance Creators**: Verified reach and engagement statistics, media kit one-sheets, and 1-on-1 strategy booking cards.
6. **💪 Fitness & Wellness Coaches**: Workout program cards, diet consultations, and 1-tap WhatsApp intake.
7. **🎵 Musicians & Recording Artists**: Smart streaming hubs (Spotify, Apple Music, YouTube), in-card audio snippets, tour dates, and concert booking inquiries.
8. **🎙️ Podcasters & Audio Shows**: "Sponsor Me" killer card with verified monthly download statistics, latest episode embed, multi-platform streaming, and sponsor pitch deck.

### 3.2. Magic AI Bio Assistant
- **1-Click AI Bio Generator**: Accessible directly from the profile settings with tone options (High-Energy, Aesthetic, Brand-Ready, Witty) and category filtering.
- **Instant Preview & Application**: Generates 4 diverse, tailored bios with character count checks and 1-tap profile application.

### 3.3. Advanced Audience Analytics & Geography
- Real-time page views and link click tracking.
- Device distribution (Mobile, Desktop, Tablet).
- Top Audience Locations and Geography breakdown with regional percentages.
- Referrer traffic sources (Instagram, YouTube, Twitter/X, Direct).

---

### 3.2. Decoupled Account & Billing Architecture

1. **User Account Settings (`/src/components/AccountSettings.tsx`)**:
   - **Profile & Identity**: Name, `@username`, Headline, avatar upload to Cloud Storage, Business Phone.
   - **Security & Credentials**: Google OAuth badge, email verification, in-app password update, reset email.
   - **Preferences**: Notification toggles (Leads, Analytics, Invoices), currency (`INR ₹`, `USD $`), timezone.
   - **Privacy & SEO**: Googlebot indexing toggle, GDPR cookie banner, Pro white-label branding removal, custom domain setup.
   - **Data Portability**: Full JSON account archive download, CSV leads export, and account deletion.

2. **Dedicated Billing Dashboard (`/src/components/BillingDashboard.tsx`)**:
   - **Plan Management**: Active tier (`Free`, `Pro`, `Business`), renewal date, billing cycle.
   - **Pro Paywall Modal**: Razorpay checkout integration with instant UPI, NetBanking, and Card support.
   - **Invoices & Receipts**: Paginated history of tax invoices with status badges.
   - **PDF Receipt Generator**: Full-page interactive receipt modal with 1-click **Print / Save as PDF**.

---

## 🗄️ 4. Data Architecture & Firestore Schema

```
firestore-root/
│
├── users/{userId}                          # Core auth & plan record
│   ├── email: string
│   ├── plan: 'free' | 'pro' | 'business'
│   └── createdAt: timestamp
│
├── profiles/{userId}                       # Public creator profile
│   ├── username: string
│   ├── full_name: string
│   ├── bio: string
│   ├── avatar_url: string
│   ├── business_phone: string
│   ├── theme: string
│   └── account_settings: map
│
├── pages/{userId}/links/{linkId}           # Modular vertical cards
│   ├── title: string
│   ├── url: string
│   ├── linkType: CardTemplateType
│   ├── realEstate: map                     # Property name, location, price, type
│   ├── coaching: map                       # Course name, exam track, batch, fees
│   ├── creatorStats: map                   # Followers, engagement, monthly reach
│   ├── creatorPackages: array              # Rates, deliverables, pricing
│   ├── brandInquiry: map                   # Minimum budget, deliverables
│   ├── clickCount: number
│   └── position: number
│
├── pages/{userId}/leads/{leadId}           # Captured visitor inquiries
│   ├── leadType: 'brand' | 'showing' | 'valuation' | 'coaching'
│   ├── contactName: string
│   ├── email: string
│   ├── phone: string
│   ├── details: map
│   └── createdAt: timestamp
│
├── subscriptions/{userId}                  # Razorpay plan subscription state
│   ├── plan: 'free' | 'pro' | 'business'
│   ├── status: 'active' | 'canceled'
│   └── currentPeriodEnd: string
│
└── invoices/{userId}/items/{invId}         # Tax invoice receipts
    ├── invoiceNumber: string
    ├── amount: number
    ├── status: 'paid'
    └── paymentId: string
```

---

## 🔮 5. Planned Features (Roadmap)

The following items are defined in the product roadmap and scheduled for upcoming milestone releases:

1. **AI Bio Generation**:
   - Automated creator bio, headline, and collaboration pitch generator using AI.
2. **Custom Razorpay Gateway UI**:
   - Creator merchant configuration tab allowing users to connect their own Razorpay Key ID to collect client tips and direct sales.
3. **Email Lead Notifications**:
   - Real-time automated email alerts dispatched to creators whenever a prospective client submits a brand inquiry, booking, or valuation lead.
4. **Geolocation Analytics**:
   - Geographic analytics dashboard breaking down page views, visitor countries, regions, and cities with interactive heatmap visualization.

---

## 🛡️ 6. Non-Functional Requirements & Security

1. **Firestore Security Rules**: Strict RBAC ensuring creators can only write to their own profile, links, and leads.
2. **WhatsApp Safe Routing**: Fallback notifications when no phone number is provided to prevent dead-click UX.
3. **Performance**: Under 150KB initial JS bundle and sub-second page loads.
4. **Accessibility (WCAG AA)**: Clear color contrast ratios and keyboard-navigable modals.
5. **Modern Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS v4, HugeIcons.
