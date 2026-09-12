# 📐 LinkCards — Wireframe & Layout Guide

> **What is this document?**  
> A simple, visual blueprint that shows how the screens, buttons, and sections of **LinkCards** are laid out. It is written in plain English with ASCII diagrams so anyone can understand how the product looks and works.

---

## 📖 Plain Language Summary of Key Jargon

Before we look at the screens, here are the few technical words you will see:
- **Wireframe**: A simple skeleton drawing of an app screen before adding final colors or photos.
- **Hero Section**: The very top part of a landing page designed to grab attention immediately.
- **Viewport**: The visible screen area (mobile phone screen vs. desktop laptop screen).
- **Sticky / Glassmorphism**: Elements like top navigation bars that stay pinned at the top with a subtle frosted-glass blur effect.
- **Modal / Popup**: A small focused box that pops open on top of the page (like when editing a card or logging in).
- **Drawer / Sidebar**: A panel on the left side of the screen where you customize settings.

---

## 🗺️ App Flow Map (User Journey)

```
[ Visitor arrives at Homepage ]
             │
             ├──► [ Explores Live Demo / Features / Pricing ]
             │
             └──► [ Clicks "Get Started Free" / "Sign In" ]
                            │
                            ▼
                   [ Auth Popup Modal ]
               (Google One-Click or Email)
                            │
                            ▼
                   [ Studio Dashboard ]
           ┌────────────────┼────────────────┐
           │                                 │
 [ Left Control Panel ]            [ Right Live Phone Canvas ]
  - Add / Edit Cards                - Real-time interactive preview
  - Pick Themes & Colors            - Click-to-test links & WhatsApp
  - Setup WhatsApp Leads            - Responsive toggle (Mobile / Desktop)
  - Profile Bio & Avatar
           │
           ▼
 [ Publishes Public URL: linkcards.app/@username ]
           │
           ▼
 [ Mobile Visitors Click Cards ➔ Routed to Links or Pre-Filled WhatsApp Chat ]
```

---

## 🖥️ Screen 1: The Landing Page (`/`)

The homepage welcomes visitors, showcases the tactile aesthetic, and invites creators and businesses to build their page.

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Logo: LC LinkCards]      [Features]  [Templates]  [Showcase]  [Sign In] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                Tactile, Card-First Link Profiles                      │
│             for Modern Creators & Growing Businesses                   │
│                                                                        │
│         Replace boring link lists with interactive, branded cards.      │
│            Built-in WhatsApp lead capture for real estate & coaching.   │
│                                                                        │
│             [ Create Your Free Page → ]    [ View Live Demo ]          │
│                                                                        │
│      ┌──────────────────────────────────────────────────────────┐      │
│      │                  Interactive 3D Preview                  │      │
│      │        ┌────────────────────────────────────────┐        │      │
│      │        │  [Avatar] Sarah Jenkins                │        │      │
│      │        │  @sarah • Bengaluru, India             │        │      │
│      │        │  [ 🟣 3 BHK Luxury Villa ]            │        │      │
│      │        │  [ 🟠 JEE / NEET Intensive Batch ]     │        │      │
│      │        │  [ 🟡 YouTube Channel (100k Subs) ]    │        │      │
│      │        └────────────────────────────────────────┘        │      │
│      └──────────────────────────────────────────────────────────┘      │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  ⚡ Feature Highlights (3 Core Pillars)                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │ 🎨 Tactile Cards │  │ 💬 WhatsApp Lead │  │ 📊 Live Insights │     │
│  │ Vivid colors,    │  │ Auto pre-filled  │  │ Real-time click  │     │
│  │ bold typography  │  │ chat routing     │  │ analytics engine │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
├────────────────────────────────────────────────────────────────────────┤
│  💼 Industry Templates: Real Estate | Coaching | Creators | Agencies   │
├────────────────────────────────────────────────────────────────────────┤
│  Footer: © 2026 LinkCards • Terms • Privacy • Powered by Firebase      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Screen 2: Studio Builder Workspace

The creator's control room. The left pane lets you customize everything; the right pane shows a live phone preview that updates in real time.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [← Exit]  LinkCards Studio    [Status: Saved ✓]     [@alex] [Live URL ↗] [Share]│
├────────────────────────────────┬─────────────────────────────────────────────┤
│  LEFT: Control Tabs            │  RIGHT: Live Mobile Stage                   │
│  [Links] [Profile] [Design]    │                                             │
│ ────────────────────────────── │                 [📱 Mobile | 🖥️ Full]        │
│                                │                                             │
│  [ + Add New Card ]            │          ┌───────────────────────┐          │
│                                │          │  ( ● Camera Notch )   │          │
│  Your Active Cards (Drag ≡):   │          │                       │          │
│                                │          │    [Avatar Image]     │          │
│  ┌──────────────────────────┐  │          │    Alex Rivera        │          │
│  │ ≡ [🟣] Prestige Palm     │  │          │    @alex • Architect  │          │
│  │   ₹75L - 1.2Cr • 3 BHK   │  │          │    [🌐] [📷] [🐦]     │          │
│  │   [Edit ✏️] [Delete 🗑️]   │  │          │                       │          │
│  └──────────────────────────┘  │          │ ┌───────────────────┐ │          │
│  ┌──────────────────────────┐  │          │ │ 🟣 Prestige Palm  │ │          │
│  │ ≡ [🟠] JEE Crash Course  │  │          │ │ 3 BHK Villa • ₹1Cr│ │          │
│  │   Morning Batch • ₹15k   │  │          │ │ [💬 Inquire WA ↗] │ │          │
│  │   [Edit ✏️] [Delete 🗑️]   │  │          │ └───────────────────┘ │          │
│  └──────────────────────────┘  │          │ ┌───────────────────┐ │          │
│  ┌──────────────────────────┐  │          │ │ 🟡 My Portfolio   │ │          │
│  │ ≡ [🟡] Design Portfolio  │  │          │ │ Featured projects │ │          │
│  │   alexrivera.design      │  │          │ └───────────────────┘ │          │
│  │   [Edit ✏️] [Delete 🗑️]   │  │          │                       │          │
│  └──────────────────────────┘  │          │ Made with LinkCards   │          │
│                                │          └───────────────────────┘          │
│  💬 WhatsApp Business Phone:   │                                             │
│  [ +91 98765 43210        ]    │                                             │
└────────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 🪟 Screen 3: Card Editor Modal (Popup)

When you click **Add New Card** or **Edit**, this focused popup appears.

```
┌─────────────────────────────────────────────────────────────┐
│ ✏️ Edit Card                                           [ ✕ ] │
├─────────────────────────────────────────────────────────────┤
│ 1. Select Card Template Type:                               │
│    (●) Standard Link   (○) Real Estate   (○) Coaching Class │
│                                                             │
│ 2. Card Title & Headline:                                   │
│    [ e.g. Prestige Palm Luxury Residences                 ] │
│                                                             │
│ 3. Specialized Business Fields (for Real Estate):           │
│    Property Type: [ 3 BHK Villa / Apartment               ] │
│    Price Bracket: [ ₹75L - 1.2Cr                          ] │
│    Location:      [ Whitefield, Bengaluru                 ] │
│                                                             │
│ 4. Card Color Theme:                                        │
│    [🟣 Purple] [🟠 Coral] [🟡 Amber] [🟢 Sage] [⚫ Dark]    │
│                                                             │
│ 5. Visuals & Badge:                                         │
│    Badge Text:  [ FOR SALE   ]   Logo/Photo: [ Upload ⬆️ ]   │
│                                                             │
│ 6. WhatsApp Routing Preview:                                │
│    "Hi, I am interested in Prestige Palm Luxury Residences  │
│    (3 BHK Villa / Apartment - ₹75L - 1.2Cr). Please share..."│
├─────────────────────────────────────────────────────────────┤
│ [ Delete Card 🗑️ ]             [ Cancel ]   [ Save Card 💾 ] │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Screen 4: Public Visitor Profile (`/[username]`)

What fans, clients, and prospective leads see on their phones when visiting `linkcards.app/@username`.

```
┌────────────────────────────────────────┐
│  [Share Button ↗]          [Search 🔍] │
│                                        │
│              [ Avatar ]                │
│             Alex Rivera                │
│     Architect & Property Consultant    │
│          Bengaluru, Karnataka          │
│                                        │
│         [ 🌐 ]  [ 📷 ]  [ 💼 ]         │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🏷️ FOR SALE                      │  │
│  │ Prestige Palm Residences         │  │
│  │ 3 BHK Luxury Villa • ₹75L - 1.2Cr│  │
│  │ Whitefield, Bengaluru            │  │
│  │ [ 💬 WhatsApp Instant Inquiry → ]│  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🏷️ NEW BATCH                     │  │
│  │ Architecture Masterclass 2026    │  │
│  │ Weekend Batch • Limited Seats    │  │
│  │ [ 💬 Book Seat on WhatsApp → ]   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 🌐 Design Portfolio & Case Studies│  │
│  │ View 24+ completed projects     │  │
│  │ [ Open Website ↗ ]               │  │
│  └──────────────────────────────────┘  │
│                                        │
│       ⚡ Made with LinkCards           │
└────────────────────────────────────────┘
```

---

## 🔒 Screen 5: Authentication Modal

```
┌──────────────────────────────────────────────┐
│  👋 Welcome to LinkCards              [ ✕ ]  │
│  Save your page, track clicks & customize.   │
├──────────────────────────────────────────────┤
│  [ 🔴 Continue with Google (One-Click)     ] │
│                                              │
│  ─────────────── or with email ──────────────│
│                                              │
│  Full Name: [ John Doe                     ] │
│  Username:  [ @johndoe                     ] │
│  Email:     [ john@example.com             ] │
│  Password:  [ ••••••••••••••               ] │
│                                              │
│  [ Create Free Account → ]                   │
│                                              │
│  Already have an account? [ Sign In ]        │
└──────────────────────────────────────────────┘
```
