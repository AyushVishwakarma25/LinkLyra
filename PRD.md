# 📄 LinkCards — Product Requirements Document (PRD)

> **What is this document?**  
> The master guide that explains **why** LinkCards was created, **who** it is built for, **what** features it contains, and **how** it operates. Written in plain English so team members, stakeholders, and clients can easily understand the product.

---

## 📖 Plain Language Summary of Key Jargon

- **PRD (Product Requirements Document)**: A blueprint document describing what a software product does and how it should behave.
- **Persona**: A realistic example profile of the typical person using the app (e.g. a realtor or coaching teacher).
- **CTA (Call to Action)**: A prominent button that asks the user to take an immediate action (e.g., "Inquire on WhatsApp" or "Sign Up Free").
- **Lead Capture**: The process of collecting contact inquiries from potential buyers or students.
- **MVP (Minimum Viable Product)**: The core version of a product containing all essential features needed to deliver maximum value.
- **Latency / Speed**: How quickly a page opens when someone clicks a link.

---

## 🎯 1. Product Vision & Problem Statement

### The Problem
Traditional "link-in-bio" tools (like Linktree or standard bio link apps) present a plain, lifeless vertical list of text buttons. 
- **Low Engagement**: Flat text links don't show photos, prices, or key selling points.
- **Lost Local Leads**: Local businesses (real estate brokers, tutors, coaching centers, consultants) lose 80%+ of prospective clients because users don't want to fill out long web forms.
- **Zero Industry Context**: Generic buttons cannot display property configurations (e.g. 3 BHK, ₹75L) or coaching course schedules (e.g. JEE Batch, Morning).

### The Solution: LinkCards
**LinkCards** turns the bio link into an interactive, high-converting, card-based mobile showroom with instant 1-tap WhatsApp lead generation.

```
┌─────────────────────────────────────────────────────────────┐
│                    OLD WAY vs. LINKCARDS                    │
├──────────────────────────────┬──────────────────────────────┤
│ ❌ Generic Bio Links         │  LinkCards                  │
├──────────────────────────────┼──────────────────────────────┤
│ • Flat, boring text buttons  │ • Tactile, vivid card blocks │
│ • Long web forms with dropoff│ • Instant pre-filled WhatsApp│
│ • No photos, badges, prices  │ • Badges, photos, price tags │
│ • No industry-specific data  │ • Real Estate & Coaching kit │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 👥 2. Target User Personas

| Persona | Who They Are | What They Need Most | How LinkCards Helps |
| :--- | :--- | :--- | :--- |
| **🏢 Realtor Rajesh** | Independent real estate agent in metro cities | Show luxury villa listings with prices and get WhatsApp buyer chats | Real Estate card template with price bracket, location pill & 1-tap WhatsApp lead chat |
| **🎓 Teacher Anjali** | Founder of a competitive coaching academy | Announce new batch timings and enroll students quickly | Coaching Institute template with exam tracks, fee structure, and direct enrollment chat |
| **📸 Creator Maya** | YouTuber and Instagram content creator | Showcase video channels, affiliate products, and brand portfolio | High-energy cards with custom badges, video embeds, and social bar |
| **💼 Freelancer Leo** | UI/UX Designer and consultant | Share portfolio case studies and book client consultations | Clean portfolio cards with live click counter to track engagement |

---

## 🚀 3. Core Feature Requirements

### Feature 1: Tactile Card Builder
- **Description**: Visual drag-and-drop builder enabling creators to create, reorder, edit, and style link cards.
- **Color Palettes**: 5 high-contrast palettes (Electric Purple, Coral Orange, Warm Amber, Sage Mint, Obsidian Dark).
- **Expandable / Featured Cards**: Ability to mark high-priority cards as "expanded" (larger photo, prominent description, and primary CTA button).

### Feature 2: Industry-Specific Business Templates
- **Real Estate Template**:
  - Property Name (e.g. *Prestige Palm Residences*)
  - Location (e.g. *Whitefield, Bengaluru*)
  - Price Bracket (e.g. *₹75L - 1.2Cr*)
  - Property Type (e.g. *3 BHK Apartment / Villa*)
- **Coaching Institute Template**:
  - Course Name (e.g. *NEET Super 30 Intensive*)
  - Exam Track (e.g. *Medical / JEE / UPSC*)
  - Batch Timing (e.g. *Morning 7:00 AM - 10:00 AM*)
  - Fee Structure (e.g. *₹15,000 / term*)

### Feature 3: Dynamic WhatsApp Lead Routing Engine
- **Description**: Whenever a visitor clicks an industry card, LinkCards automatically constructs an intelligent WhatsApp chat link (`https://wa.me/...`).
- **Pre-filled Message Format**:
  > *"Hi, I am interested in [Card Title] ([Location / Price / Timing]). Please share more details."*
- **Fail-safe Alert**: If a creator hasn't configured a WhatsApp phone number yet, the app alerts them cleanly without crashing or blocking standard web links.

### Feature 4: Cloud Authentication & Multi-Account Support
- **Google One-Click Sign-In**: Instant registration with Google accounts.
- **Email & Password Authentication**: Complete sign-up, sign-in, and username reservation engine.
- **Protected Data**: User cards and personal settings are strictly protected so only the account owner can edit them.

### Feature 5: Public Sharing (`/[username]`) & Live Real-Time Analytics
- **Public Profile URLs**: Shareable links like `linkcards.app/@alex` accessible by anyone without login.
- **Atomic Click Counter**: Every card click increments an analytics counter in real-time.
- **Live Search & Filter**: Visitors can search or filter cards by category or color tag on the public page.

---

## 🗄️ 4. Data Storage & Structure (In Plain English)

The app stores data in three organized collections:

1. **Profiles (`/profiles/{userId}`)**:
   - `username`: Unique handle (e.g. `alex`).
   - `full_name`: Creator's display name.
   - `bio`: Short headline or location.
   - `avatar_url`: Link to profile picture.
   - `business_phone`: Phone number used for WhatsApp lead routing.
   - `theme`: Chosen visual theme (`warm`, `cream`, `clay`, `dark`).

2. **Usernames Registry (`/usernames/{username}`)**:
   - Ensures no two users can claim the same profile URL.

3. **Link Cards (`/links/{linkId}`)**:
   - `profile_id`: ID of the owner.
   - `title`: Main card text.
   - `subtitle`: Secondary info.
   - `link_url`: Target website or action.
   - `color`: Card color identifier.
   - `clicks`: Number of times visitors clicked this card.
   - `template_type`: `standard`, `real_estate`, or `coaching_institute`.
   - `real_estate` / `coaching`: Specialized metadata blocks.

---

## 🔒 5. Quality & Security Standards

- **Mobile First**: 90%+ of visitors arrive via mobile phones; cards and buttons must feel responsive and effortless on touchscreens (minimum touch target size of 44px).
- **Fast Load Times**: Pages must load under 1.5 seconds even on mobile 4G networks.
- **Zero Data Loss**: Changes in the builder auto-sync to the cloud immediately with real-time feedback indicator.
