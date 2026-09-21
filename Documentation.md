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

### 2. Specialized Vertical Cards & Lead Engines

#### A. For Content Creators ("Hire Me" Engine)
1. **Creator Stats**: Highlight your community size (e.g. `82K Instagram`), engagement rate (`4.8%`), and monthly reach (`1.2M`).
2. **Collaboration Packages**: Add rate cards for `UGC Video (₹8,000)`, `Instagram Reel (₹15,000)`, and `Reel + Story (₹20,000)`.
3. **Featured Video Reels**: Showcase visual portfolio work with thumbnail previews and view counters.
4. **Brand Inquiry Modal**: Allows brand managers to submit campaign details, budget bracket, and timeline directly to your inbox and WhatsApp.
5. **Interactive Media Kit**: Let brands preview or download your verified media kit and audience demographics.
6. **Affiliate Recommendations**: Highlight products with affiliate discount coupons and direct buy links.

#### B. For Real Estate Agents
1. **Property Showcase Cards**: Display property photos, BHK configuration, location pill, and pricing tag.
2. **Schedule a Showing**: In-app modal enabling prospective buyers to choose a date, time slot, and pre-approval status.
3. **Free Home Valuation**: Modal capturing property address, square footage, and condition for homeowners seeking to sell.
4. **Client Reviews & Sold Badges**: Verified testimonials reinforcing local credibility.

#### C. For Coaches & Educators
1. **Batch Schedules**: Display course title, target exam track (JEE/NEET/UPSC), timings, and fee breakdown.
2. **1-Tap Admission Chat**: Pre-populated WhatsApp message citing exact batch and course details.

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
