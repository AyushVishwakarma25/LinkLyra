# 📚 LinkLyra — Complete User & Developer Documentation

> **Document Version**: 3.1.0  
> **Status**: Production Reference Manual  
> **Target Audience**: Creators, Business Owners, Agencies & Software Engineers  
> **Last Updated**: September 2026

---

## 📖 Executive Summary & Plain Language Jargon Guide

- **LinkLyra Studio**: The creator workspace where you build, customize, and preview your interactive link showroom in real-time.
- **"Hire Me" & Vertical Engines**: Conversion modes turning basic links into sales & lead machines for Content Creators, Real Estate Agents, and Coaches.
- **Account & Settings Hub**: The command center for editing creator identity, updating security credentials, setting notification preferences, and exporting data archives.
- **Billing Dashboard**: Dedicated financial hub managing Razorpay subscriptions, plan tiers (`Free`, `Pro`, `Business`), live GST tax invoices, and PDF receipts.
- **WhatsApp Lead Routing**: Automatically directing visitors from specific cards and inquiry modals to pre-filled WhatsApp Business chats.
- **Firestore Database**: Google Cloud's real-time, secure NoSQL database that safely persists profiles, cards, leads, and billing records.

---

## 🚀 Part 1: Creator & Business Owner User Guide

### 1. Account Setup & Studio Tour
1. **Launch the Application**: Click **Sign In** or **Get Started Free** on the homepage.
2. **Authentication Options**:
   - **Google One-Click Sign-In**: Instant setup using your Google Account.
   - **Email & Password**: Enter your email, desired username handle (e.g. `@alex`), and a secure password.
3. **Studio Navigation**:
   - **Top Navigation**: Switch between **Links**, **Profile**, **Theme**, **Stats**, and **Share**.
   - **Bottom Profile Bar**: Displays avatar, plan tier (`Free` / `Pro`), `@username`, and 1-click **Billing** and **Settings** buttons.
   - **Interactive Live Stage**: A simulated mobile device rendering your showroom with real-time updates.

---

### 2. Specialized Creator Cards & Monetization Engines

#### A. Automatic Video Media Spotlight (YouTube & Reels)
- **Instant Cover Detection**: Simply paste any YouTube link (`watch?v=...`, `youtu.be/...`, `/shorts/...`, or `/live/...`) or Instagram Reel URL.
- **Cinematic Display**: LinkLyra automatically pulls high-resolution video covers, video duration, and platform badges.
- **Custom Player Options**: Choose between 16:9 widescreen or 9:16 vertical reels with glowing play indicators.

#### B. Direct 1-Tap UPI Tip Jar (0% Platform Fee)
- **Instant Bank Deposit**: Enter your UPI ID (e.g. `creator@upi`). 100% of fan contributions land directly into your bank account with zero fees.
- **Preset Amount Chips**: Customize suggested chips (`₹100`, `₹250`, `₹500`, `₹1000`) or allow fans to enter any custom amount.
- **Deep Mobile Intent**: Automatically opens Google Pay, PhonePe, or Paytm on mobile devices, or provides 1-tap clipboard copying on desktop.
- **Custom Thank-You Note**: Display a personalized thank-you message to your supporters.

#### C. Live Tour Dates Card (Comedians & Performers)
- **Tour Announcements**: Showcase your upcoming tour or live performance schedule with dates, cities, and venues.
- **Ticket Links**: Direct fans to BookMyShow, Paytm Insider, or your own ticket portal.
- **Availability Badges**: Mark sold-out venues or highlight high-demand tour stops.

#### D. Creator Niches & Specialized Templates
1. **Stand-Up Comedians & Entertainers**: Showcase viral comedy clips, upcoming live tour stops, tip jar, and college/corporate WhatsApp booking.
2. **Fashion & Lifestyle Creators**: Drop affiliate lookbooks, beauty routines, media kit rate cards, and personal styling consultation chats.
3. **Tech, Finance & SaaS Creators**: Share free spreadsheets, tutorials, 1-tap brand sponsorship packages, and deep-dive video breakdowns.
4. **Musicians & Performing Artists**: Embed smart audio snippets, multi-platform streaming hubs (Spotify, Apple Music, YouTube), and merch drops.
5. **Podcasters**: Feature latest episode releases, multi-directory listen hubs, listener demographics, and sponsor inquiry kits.
6. **Fitness Coaches & Athletes**: Share workout programs, transformation showcases, and 1-on-1 coaching consultations.

#### E. Magic AI Profile Bio & Headline Assistant
- **1-Click Generation**: Transform simple notes into engaging, professional bios.
- **Tone Personalities**: Select from *High-Energy*, *Aesthetic & Minimal*, *Brand-Ready*, or *Witty & Relatable*.
- **Instant Apply**: Review suggestions and apply them directly to your live profile in 1 tap.

#### F. Audience Geography & Analytics
- **Top Locations Breakdown**: See where your audience is visiting from across the globe with country flags and percentage shares.
- **Real-Time Counters**: Track total link clicks, page views, and click-through rates.
- **Domain & Email Verification**: 1-click DNS record verification for custom domains and sample test email alerts.

---

### 3. Managing Plans, Invoices & Razorpay Billing
1. Click **Billing** in the bottom sidebar or open the **Billing Hub**.
2. **Upgrade to Pro**:
   - Select **Upgrade to Pro** to unlock custom domains, white-label branding removal, and priority lead routing.
   - Complete payment securely via the Razorpay checkout modal.
3. **View & Print Tax Invoices**:
   - All past subscription payments appear in the **Invoice History** table.
   - Click the **Receipt** button next to any transaction to open the interactive invoice viewer.
   - Click **Print / Save PDF** to generate an official receipt for your accounting or tax filing.

---

### 4. Security, Custom Domains & Data Portability
- **Password Updates & Resets**: Update your account password or trigger secure reset emails directly from **Settings** $\rightarrow$ **Security**.
- **White-Label Custom Domain**: Connect your own domain (e.g. `bio.yourbrand.com`) by adding a standard `CNAME` DNS record pointing to `cname.linklyra.app`.
- **Full Data Backup**: Click **Export JSON Archive** under **Settings** $\rightarrow$ **Data & Danger Zone** to download your complete profile, card listings, and settings in a single file.
- **CSV Leads Export**: Download all customer inquiries and lead contacts formatted for Microsoft Excel or Google Sheets.

---

## 💻 Part 2: Developer Architecture & Technical Reference

### Tech Stack Overview
- **Runtime & Bundler**: React 19 with TypeScript and Vite.
- **Styling Architecture**: Tailwind CSS with CSS variables and custom elevation tokens.
- **State Management**: React state with local storage hydration and optimistic cloud synchronization.
- **Database & Auth**: Google Cloud Firestore & Firebase Authentication.
- **Icons**: HugeIcons (`@hugeicons/react` and `@hugeicons/core-free-icons`).

---

### 📂 Modular Component Architecture

```
src/components/
├── AccountSettings.tsx    # User Identity, Credentials, SEO, Preferences & Danger Zone
├── BillingDashboard.tsx   # Dedicated Razorpay Billing, Invoices & PDF Receipts
├── BuilderSidebar.tsx     # Studio Sidebar with tab navigation and action triggers
├── CardEditorModal.tsx    # Vertical Card Creation & Customization Modal
├── DesignSettingsPanel.tsx# HugeIcons theme & styling controller
├── LivePreview.tsx        # Simulated interactive mobile showroom stage
├── ProfileCard.tsx        # Dynamic tactile card dispatcher & render engine
├── LandingPage.tsx        # Conversational marketing homepage
├── AuthModal.tsx          # Google OAuth & Email authentication modal
├── ProUpgradeModal.tsx    # Razorpay paywall & upgrade flow
└── SocialIconsRow.tsx     # Frosted glass social link pills
```

---

## 🔮 Planned Features (Roadmap)

The following capabilities are in the product roadmap and scheduled for upcoming releases:

1. **AI Bio Generation**: Automated creator bio and headline copywriting powered by AI.
2. **Custom Razorpay Gateway UI**: In-app UI tab allowing creators to connect their own custom merchant Razorpay key for client tips and direct payments.
3. **Email Lead Notifications**: Automatic email dispatch to the creator when a new lead/inquiry is submitted (currently stored in Firestore and dispatched via WhatsApp).
4. **Geolocation Analytics**: Geographic breakdown (country, city, region) of visitors and visual click origin maps.

---

## 🚀 Build & Verification Commands

```bash
# Install dependencies
npm install

# Start local development server on Port 3000
npm run dev

# Run TypeScript type check validation
npm run lint

# Compile production bundle to /dist (runs prebuild checks)
npm run build
```
