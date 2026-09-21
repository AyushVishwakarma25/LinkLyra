# 🌟 LinkLyra

LinkLyra is a next-generation, high-converting Link-in-Bio showroom platform built with **React 19**, **TypeScript**, and **Vite**.

Unlike traditional flat link aggregators, LinkLyra transforms bio links into interactive, specialized vertical conversion engines for **Content Creators** ("Hire Me" UGC & brand deals), **Real Estate Agents** (property listings, showings, valuations), and **Coaches & Educators** (batch schedules, admission routing). It includes built-in **Firebase Authentication**, **Cloud Firestore**, and **Razorpay** billing integration.

---

## 🚀 Key Features

- **Specialized Vertical Engines**:
  - **Content Creators**: Highlight community stats (reach, engagement), collaboration packages (UGC, Reels, Story combos), interactive media kits, and brand inquiry forms.
  - **Real Estate Agents**: Property showcase cards, direct showing booking modal, and seller home valuation forms.
  - **Coaches & Educators**: Program batch cards with exam tracks, fee structures, and direct WhatsApp admission chats.
- **Modern Interactive Studio**: Real-time mobile device preview with tactile animations, themes, and card customization.
- **Account & Settings Hub**: Centralized management for creator identity, security credentials, SEO meta tags, and data backups (JSON archive & CSV lead exports).
- **Integrated Billing Dashboard**: Razorpay payment processing for Free and Pro subscriptions, live GST-compliant tax invoices, and printable PDF receipts.
- **Firebase Backend**: Real-time cloud persistence with Google Cloud Firestore and secure user authentication (Google One-Click & Email/Password).

---

## 🛠️ Prerequisites

- **Node.js**: Version `20.x` or higher (verified via `.nvmrc` and `package.json` engines)
- **npm**: Version `10.x` or higher (standard npm package manager)

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/AyushVishwakarma25/linklyra.git
cd linklyra
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Populate `.env` with your Razorpay credentials:
```env
# Public Key ID for Razorpay checkout (client-side)
VITE_RAZORPAY_KEY_ID="rzp_test_your_key_here"

# Optional backend secret (if running server-side webhook/order verification)
RAZORPAY_KEY_SECRET="your_key_secret_here"
```

### 4. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Scope | Description | Required |
| :--- | :--- | :--- | :--- |
| `VITE_RAZORPAY_KEY_ID` | Client (Vite) | Razorpay Public Key ID (e.g. `rzp_test_...` or `rzp_live_...`) | Yes (Production) |
| `RAZORPAY_KEY_SECRET` | Server/API | Razorpay Secret Key for backend order validation | Optional |

> **Note**: Production builds validate `VITE_RAZORPAY_KEY_ID` and will fail if the value is empty or contains `"placeholder"`.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on `http://0.0.0.0:3000` |
| `npm run prebuild` | Validates required build-time environment variables (`scripts/validate-build-env.js`) |
| `npm run build` | Runs prebuild checks and bundles the production app into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run clean` | Deletes the `dist/` build directory |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) across the project |

---

## 🔥 Firebase Configuration

LinkLyra connects to Firebase for user authentication, cloud data storage, and media uploads.

1. **Create Firebase Project**:
   - Navigate to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. **Enable Authentication**:
   - Go to **Build** > **Authentication** > **Sign-in method**.
   - Enable **Google** and **Email/Password**.
   - In **Settings** > **Authorized Domains**, add `localhost` and your production domain (e.g. `your-app.vercel.app`).
3. **Set Up Cloud Firestore**:
   - Go to **Build** > **Firestore Database** and create a database.
   - Deploy security rules allowing authenticated creators to manage their own user profiles, links, and collected leads.
4. **Set Up Firebase Storage**:
   - Go to **Build** > **Storage** to enable avatar and media uploads.

---

## 🐳 Docker Deployment

The repository includes a multi-stage `Dockerfile` running an optimized static Nginx server with SPA client-side routing.

### Build Docker Image
Pass your production Razorpay Key ID as a build argument:
```bash
docker build --build-arg VITE_RAZORPAY_KEY_ID="rzp_live_your_actual_key" -t linklyra:latest .
```

### Run Container
```bash
docker run -d -p 8080:8080 --name linklyra-app linklyra:latest
```
Access the application at [http://localhost:8080](http://localhost:8080).

---

## 🏗️ Architecture Overview

```
linklyra/
├── Dockerfile                    # Multi-stage production container definition
├── nginx.conf                    # SPA routing fallback configuration
├── scripts/
│   └── validate-build-env.js     # Build-time environment variable validator
├── src/
│   ├── App.tsx                   # Main state machine & view router
│   ├── index.css                 # Tailwind CSS v4 & custom design tokens
│   ├── types.ts                  # TypeScript interfaces for cards, leads, invoices
│   ├── vite-env.d.ts             # Vite environment typings
│   ├── components/
│   │   ├── AccountSettings.tsx   # User profile, security credentials, SEO & export
│   │   ├── AuthModal.tsx         # Google & Email/Password authentication
│   │   ├── BillingDashboard.tsx  # Razorpay subscription & PDF tax invoices
│   │   ├── BuilderSidebar.tsx    # Studio navigation & card creator triggers
│   │   ├── CardEditorModal.tsx   # Modular vertical card editor
│   │   ├── DesignSettingsPanel.tsx# HugeIcons theme & styling controller
│   │   ├── LandingPage.tsx       # Marketing homepage & showcase
│   │   ├── LivePreview.tsx       # Real-time simulated mobile showroom stage
│   │   ├── ProfileCard.tsx       # Dynamic card dispatcher & rendering
│   │   ├── ProUpgradeModal.tsx   # Razorpay checkout modal
│   │   └── cards/                # Creator, Real Estate & Coach specialized cards
│   └── lib/
│       ├── firebase.ts           # Firebase client initialization & fallback handling
│       └── razorpay.ts           # Razorpay SDK loader and payment trigger
└── package.json                  # Dependencies, scripts, and Node engine constraints
```

- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 with custom elevation and theme variables
- **Icons**: HugeIcons (`@hugeicons/react`, `@hugeicons/core-free-icons`)
- **Payment Gateway**: Razorpay Checkout SDK
- **Cloud Infrastructure**: Firebase Auth, Cloud Firestore, Cloud Storage
