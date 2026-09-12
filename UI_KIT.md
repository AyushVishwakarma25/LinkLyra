# 🎨 LinkCards — Universal UI Kit Guide

> **What is this document?**  
> A simple design cookbook that lists every color, button, font, corner curve, and card style used across the entire LinkCards platform. It ensures every screen looks consistent, professional, and visually pleasing.

---

## 📖 Plain Language Summary of Key Jargon

- **UI Kit**: A master set of pre-designed buttons, colors, and layout boxes used repeatedly so everything looks harmonious.
- **Design Tokens**: Named color and sizing codes (e.g. `#5E4BF7` named `accentPurple`) so the entire app uses the exact same shade everywhere.
- **Glassmorphism**: A modern visual effect that looks like translucent frosted glass with a soft blur behind it.
- **Border Radius**: How rounded the corners of a box or button are (from sharp 0px to pill-shaped 9999px).
- **Contrast Ratio**: How easily text stands out against its background so it is readable and accessible for everyone.

---

## 🎨 1. Core Color Palette

### 🪵 Canvas Backgrounds (Warm & Natural)
| Token Name | Hex Code | Visual Preview & Description |
| :--- | :--- | :--- |
| `canvas` | `#ECE7DC` | Primary warm paper beige used on default profile cards |
| `canvasWarm` | `#F5F2EB` | Soft morning cream used on studio builder backgrounds |
| `canvasCream` | `#FAF8F5` | Ultra-clean soft off-white for crisp readability |
| `canvasLight` | `#FFFFFF` | Pure crisp white for inputs and cards |
| `canvasDark` | `#191A1E` | Obsidian dark tone for premium night-mode profiles |
| `canvasClay` | `#EFEBE4` | Earthy stone gray-beige for subtle container borders |

---

### 🌈 Vibrant Card Colors (High-Energy Contrast)
Every card in LinkCards can be styled with one of five distinct high-contrast palettes:

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 🟣 Electric     │ │ 🟠 Coral        │ │ 🟡 Warm         │
│    Purple       │ │    Orange       │ │    Amber        │
│   #5E4BF7       │ │   #E75646       │ │   #F8BA38       │
│ White Text/Pills│ │ White Text/Pills│ │ Dark Text/Pills │
└─────────────────┘ └─────────────────┘ └─────────────────┘
┌─────────────────┐ ┌─────────────────┐
│ 🟢 Sage         │ │ ⚫ Obsidian     │
│    Mint         │ │    Dark         │
│   #D2EAA5       │ │   #191A1E       │
│ Dark Text/Pills │ │ White Text/Pills│
└─────────────────┘ └─────────────────┘
```

| Color ID | Hex Code | Purpose | Text Color | Action Button |
| :--- | :--- | :--- | :--- | :--- |
| `purple` | `#5E4BF7` | Highlight properties, primary services | Pure White | White pill with dark arrow |
| `orange` | `#E75646` | Urgent offers, real estate sales | Pure White | White pill with dark arrow |
| `yellow` | `#F8BA38` | Video channels, announcements | Dark Charcoal | White pill with dark arrow |
| `green` | `#D2EAA5` | New batches, eco & wellness | Dark Charcoal | White pill with dark arrow |
| `dark` | `#191A1E` | Portfolios, professional links | Pure White | White pill with dark arrow |

---

## ✍️ 2. Typography (Fonts & Text Sizes)

LinkCards uses high-legibility geometric sans-serif typography with strict mathematical hierarchy:

| Style | Size | Weight | Used For |
| :--- | :--- | :--- | :--- |
| **Hero Title** | `32px` - `48px` | `800` (Extra Bold) | Homepage headlines |
| **Profile Name** | `20px` - `24px` | `800` (Extra Bold) | Creator name on phone canvas |
| **Section Heading**| `16px` - `18px` | `700` (Bold) | Sidebar category headers |
| **Card Title** | `15px` - `16px` | `700` (Bold) | Main title on each link card |
| **Card Subtitle** | `13px` - `14px` | `500` (Medium) | Descriptions, prices, locations |
| **Metadata Tag** | `10px` - `11px` | `700` (Bold) | Badges like "FOR SALE" or "NEW" |

---

## 🔘 3. Buttons & Interactive Controls

### Primary Action Button (Call-To-Action)
- **Background**: `#1C1E22` (Deep Charcoal Black)
- **Text Color**: `#FFFFFF` (White)
- **Padding**: `12px` vertical × `24px` horizontal (2:1 padding ratio)
- **Border Radius**: `16px` (Modern soft rounded rectangle)
- **Hover State**: Scales up slightly with a gentle shadow (`shadow-md`)

### Glass Pill Button (Frosted Floating Style)
- **Background**: `rgba(255, 255, 255, 0.8)` with `backdrop-blur-md`
- **Border**: `1px solid rgba(0, 0, 0, 0.08)`
- **Text Color**: `#1C1E22`
- **Used For**: Social icons, filter chips, sharing buttons

### WhatsApp Action Button
- **Background**: `#25D366` (Official WhatsApp Green)
- **Text Color**: `#FFFFFF`
- **Icon**: Lucide `MessageCircle` / WhatsApp Glyph
- **Hover State**: Deepens to `#128C7E` on hover

---

## 🎴 4. The Card Components

Every LinkCard is built with deliberate physical tactile depth:

```
┌────────────────────────────────────────────────────────────┐
│ 🏷️ [BADGE] (e.g. FOR SALE / JEE CRASH COURSE)             │
│                                                            │
│ 🏡 Prestige Palm Residences                 ┌──────────┐   │
│    Spacious 3 & 4 BHK Luxury Homes          │  [Photo] │   │
│                                             └──────────┘   │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 📍 Whitefield • ₹75L - 1.2Cr • 3 BHK Luxury Villa      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [ 💬 Chat on WhatsApp ───────────────► ( ↗ ) ]            │
└────────────────────────────────────────────────────────────┘
```

- **Outer Radius**: `24px` on phone view, `16px` inside sidebar lists
- **Inner Metadata Pill Radius**: `12px` (adheres strictly to `Outer Radius - Padding` rule)
- **Shadow**: `0 4px 20px -2px rgba(0, 0, 0, 0.06)` for gentle physical elevation
- **Click Animation**: Subtle physical press (`active:scale-[0.98]`)

---

## 📐 5. Spacing & Grid System

- **Base Unit**: `4px` grid (all margins and paddings are multiples of 4: `8px`, `12px`, `16px`, `24px`, `32px`).
- **Container Margins**: `16px` minimum padding on mobile phones; `24px` - `32px` on desktop dashboards.
- **Card Gaps**: `12px` - `14px` between stacked cards to prevent visual clutter.
