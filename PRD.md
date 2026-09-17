# 📄 LinkLyra — Product Requirements Document (PRD)

> **Document Version**: 3.0.0  
> **Status**: Production Ready  
> **Target Platform**: Responsive Web (Desktop Studio + Mobile Showroom)  
> **Last Updated**: September 2026

---

## 📖 Executive Summary & Plain Language Jargon Guide

- **PRD (Product Requirements Document)**: The master architectural blueprint specifying what the application does, who it serves, its functional requirements, database schema, and operational standards.
- **Link-in-Bio Showroom**: An interactive, card-based mobile destination replacing flat text lists with tactile, high-converting multimedia cards.
- **"Hire Me" & High-Intent Modes**: Specialized vertical layouts converting simple link pages into lead machines for Content Creators, Real Estate Agents, and Coaches.
- **Account & Settings Hub**: A decoupled command center for public identity, security credentials, preferences, SEO/domains, and data exports.
- **Billing Dashboard**: A dedicated financial center managing Razorpay subscriptions, GST-compliant tax invoices, PDF receipts, and custom merchant keys.
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

### 3.1. Vertical Feature Set

#### A. Content Creators ("Hire Me" Engine)
1. **Creator Stats Card**: Highlight verified metrics (Follower count, Engagement rate %, Monthly impressions/reach).
2. **Featured Work Reels**: Interactive visual video/reel cards with play modal and metric badges.
3. **Collaboration Packages**: Clear rate cards (UGC Video, Instagram Reel, Reel + Story combo, Dedicated Review) with instant booking CTA.
4. **Brand Inquiry Modal**: Mini-form capturing Brand Name, Campaign Type, Budget Bracket (₹10K-₹50K+), Timeline, and Contact Email—saved to Firestore and routed to WhatsApp.
5. **Interactive Media Kit**: Downloadable/viewable creator portfolio modal with audience demographics.
6. **Affiliate Recommendations**: Product showcase cards with affiliate tag and discounted coupon badge.

#### B. Real Estate Agents
1. **Property Showcase Cards**: High-res property photo, BHK configuration, location tag, and pricing bracket.
2. **Schedule a Showing Modal**: Captures buyer name, phone, preferred date, time slot, and pre-approval status.
3. **Free Home Valuation Modal**: Captures property address, square footage, property type, and timeline for sellers.
4. **Client Reviews & Sold Badges**: Verified testimonials reinforcing realtor authority.

#### C. Coaching & Educators
1. **Course / Batch Cards**: Course title, target exam track (JEE / NEET / SAT), batch timings, and fee structure.
2. **1-Tap Admission Chat**: Pre-populated WhatsApp inquiry mentioning exact course and batch details.

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
   - **Custom Razorpay Gateway**: Creators can save their own Razorpay Key ID for collecting client tips and direct payments.

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

## 🛡️ 5. Non-Functional Requirements & Security

1. **Firestore Security Rules**: Strict RBAC ensuring creators can only write to their own profile, links, and leads.
2. **WhatsApp Safe Routing**: Fallback notifications when no phone number is provided to prevent dead-click UX.
3. **Performance**: Under 150KB initial JS bundle and sub-second page loads.
4. **Accessibility (WCAG AA)**: Clear color contrast ratios and keyboard-navigable modals.
