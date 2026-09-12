# 📚 LinkCards — Complete User & Developer Documentation

> **What is this document?**  
> The ultimate handbook for **LinkCards**. It teaches everyday creators how to set up their page and capture business leads, while also providing developers with all technical instructions, code architecture, and database details in plain, easy-to-read language.

---

## 📖 Plain Language Summary of Key Jargon

- **Authentication (Auth)**: The secure system that verifies who you are when logging in (via Google or password).
- **CRUD**: The four basic actions you can do with data: **C**reate, **R**ead, **U**pdate, and **D**elete cards.
- **Client-Side**: Everything that runs directly inside your web browser on your phone or laptop.
- **Database / Firestore**: The secure Google Cloud storage room where your profiles and link cards are saved.
- **URL Parameter / Slug**: The unique username part of a link (e.g., the `@alex` in `linkcards.app/@alex`).

---

## 🚀 Part 1: Step-by-Step Guide for Creators & Businesses

### Step 1: Create or Sign In to Your Account
1. Open the LinkCards application.
2. Click **Sign In** or **Get Started Free**.
3. Choose **Continue with Google** for 1-click instant login, or enter your name, desired username, email, and password.

---

### Step 2: Set Up Your Profile & WhatsApp Number
1. In the Studio workspace, click the **Profile** tab on the left sidebar.
2. Enter your **Display Name**, **Bio / City**, and upload your **Profile Photo**.
3. In the **WhatsApp Lead Routing Engine** box:
   - Enter your business WhatsApp phone number (e.g. `+91 98765 43210` or `9876543210`).
   - *Why this is important*: When prospective clients click your Real Estate or Coaching cards, they will be instantly routed to chat with you on WhatsApp with a pre-filled inquiry.

---

### Step 3: Add & Customize Your Link Cards
1. Click **+ Add New Card** in the top left.
2. Choose your **Card Template**:
   - 🌐 **Standard Link**: For websites, social channels, YouTube videos, or articles.
   - 🏢 **Real Estate Template**: Includes dedicated fields for Property Name, Location, Price (e.g. ₹75L - 1.2Cr), and Property Type (e.g. 3 BHK Villa).
   - 🎓 **Coaching Institute Template**: Includes fields for Course Name, Exam Track (e.g. JEE / NEET), Batch Timing, and Fee Structure.
3. Choose your favorite **Color Palette** (Purple, Coral, Amber, Sage, or Obsidian).
4. (Optional) Toggle **Feature / Expand Card** to give it prominent visual emphasis with a large photo and direct action button.
5. Click **Save Card**.

---

### Step 4: Share Your Public Page
1. Click **Share** at the top right of the screen.
2. Copy your public link (e.g., `linkcards.app/@yourname`).
3. Paste this link into your Instagram Bio, WhatsApp Business status, LinkedIn profile, or email signature.
4. Watch your **Click Analytics** increase in real-time as visitors engage with your cards!

---

## 💻 Part 2: Developer Architecture & Tech Stack

LinkCards is engineered as a modern, full-stack Single Page Application (SPA) with cloud database persistence.

### Core Technology Stack
- **Frontend Framework**: React 18 with TypeScript & Vite.
- **Styling**: Tailwind CSS with custom glassmorphic and tactile elevation utility tokens.
- **Icons**: `lucide-react` vector glyphs.
- **Authentication & Database**: Google Firebase Authentication & Google Cloud Firestore.
- **File & Asset Storage**: Firebase Cloud Storage with resilient base64 fallback.

---

### 📂 Directory & File Map

```
/
├── wireframe.md               # Visual wireframes & screen flow
├── UI_KIT.md                  # Master design tokens, colors & typography
├── PRD.md                     # Product requirements & business logic
├── Design.md                  # Aesthetic philosophy & layout rules
├── Documentation.md           # User & developer handbook (this file)
│
├── src/
│   ├── App.tsx                # Main app router & studio layout controller
│   ├── types.ts               # TypeScript data definitions
│   ├── data.ts                # Initial configuration models
│   │
│   ├── components/
│   │   ├── LandingPage.tsx    # High-converting marketing homepage
│   │   ├── BuilderSidebar.tsx # Left control panel (Card list, profile editor)
│   │   ├── CardEditorModal.tsx# Popup for creating & editing cards
│   │   ├── LivePreview.tsx    # Interactive phone stage with real-time test
│   │   ├── ProfileCard.tsx    # The core tactile card component
│   │   ├── SocialIconsRow.tsx # Frosted glass social icon pills
│   │   └── AuthModal.tsx      # Google & Email/Password login modal
│   │
│   ├── lib/
│   │   ├── firebase.ts        # Production Firestore & Auth service layer
│   │   ├── storage.ts         # Firebase storage photo upload engine
│   │   ├── ui-kit.ts          # Central source of truth for design tokens
│   │   └── whatsapp.ts        # WhatsApp lead routing & URL intent generator
│   │
│   └── app/
│       └── [username]/
│           └── page.tsx       # Fast public profile page for mobile visitors
│
├── firestore.rules            # Security rules ensuring user data privacy
└── firebase-blueprint.json    # Firestore schema & indexing blueprint
```

---

## 🔒 Part 3: Security & Data Privacy

- **Public Profiles**: Anyone can view a creator's public profile page (`/profiles/{userId}` and `/links/{linkId}`) without needing to log in.
- **Owner-Only Editing**: Firestore security rules verify that `request.auth.uid == userId` before allowing any create, edit, or delete operations.
- **Atomic Click Increment**: Visitors can increment the click count on cards atomically without having write access to change card titles, links, or colors.

---

## ❓ Part 4: Frequently Asked Questions (FAQ)

**Q1: What happens if a visitor clicks an inquiry card before I add my WhatsApp phone number?**  
*A: The app displays a gentle, friendly notice asking the creator to enter their number in the Profile settings, and gracefully opens the standard website link so the visitor is never stranded.*

**Q2: Can I reorder my cards?**  
*A: Yes! Simply use the up/down controls or drag handle in the Studio sidebar to adjust the priority order of your cards instantly.*

**Q3: Does LinkCards work on all mobile devices?**  
*A: Yes. LinkCards is designed with a strict mobile-first architecture, ensuring buttery-smooth scrolling and responsive layouts across iOS Safari, Android Chrome, and in-app Instagram/TikTok browsers.*
