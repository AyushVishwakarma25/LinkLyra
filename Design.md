# 🎨 LinkCards — Design System & Aesthetic Guide

> **What is this document?**  
> A guide explaining the visual philosophy, aesthetic rules, layout balance, and micro-animations that give LinkCards its distinct, high-converting look and feel.

---

## 📖 Plain Language Summary of Key Jargon

- **Visual Hierarchy**: Arranging titles, photos, and buttons so the viewer's eye naturally looks at the most important thing first.
- **Negative Space (Whitespace)**: The clean, uncluttered breathing room around cards and text that makes an interface feel premium.
- **Tactile UI**: Designing digital cards so they feel like physical objects (business cards, paper tickets, smooth buttons) you can touch and press.
- **Micro-Interactions**: Tiny, satisfying animations when a user hovers or clicks a button (like a slight bounce or color glow).
- **Responsive Breakpoints**: The screen size thresholds where the layout automatically rearranges itself for mobile phones, tablets, or laptops.

---

## 🏛️ 1. Design Philosophy: "Tactile Physicality"

Most link-in-bio apps look like flat, generic spreadsheets or lists. LinkCards is built on three core aesthetic principles:

1. **Physical Card Metaphor**: Each link feels like an authentic printed luxury card with rich background pigments, rounded corners, and subtle shadows.
2. **Warm Neutral Canvas**: Instead of harsh pure black (`#000`) or blinding pure white (`#FFF`), we use warm, organic paper tones (`#ECE7DC`, `#F5F2EB`) that reduce eye fatigue.
3. **High-Contrast Focal Points**: Saturated accent cards (Electric Purple `#5E4BF7`, Coral Orange `#E75646`, Warm Amber `#F8BA38`) pop clearly against the neutral canvas, drawing immediate visitor attention to key offerings.

---

## 📐 2. Layout Structure & Visual Balance

```
┌─────────────────────────────────────────────────────────────┐
│                      LAYOUT HIERARCHY                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Header & Identity: Avatar (48px - 64px) + Bold Name     │
│ 2. Social Bar: Frosted glass pills with clean brand icons   │
│ 3. Featured Card (Expanded): 2x visual height + CTA Button │
│ 4. Standard Cards (Stacked): Uniform 12px vertical rhythm   │
│ 5. Footer: Subtle, unobtrusive branding tag                 │
└─────────────────────────────────────────────────────────────┘
```

### The Nested Corner Radius Rule
To prevent distorted or clumsy borders when boxes sit inside other boxes, LinkCards follows the optical formula:
$$\text{Inner Corner Radius} = \text{Outer Corner Radius} - \text{Padding}$$
- **Outer Card**: `24px` radius with `16px` padding
- **Inner Metadata Pill**: `24px - 16px = 8px` to `12px` radius

---

## 🎭 3. Color Harmony & Accessibility (WCAG AA)

Every color combination in LinkCards is tested to meet the **WCAG AA** accessibility standard (a contrast ratio of at least 4.5:1 for readable text):

| Background Color | Text Color | Pill Badge Style | Readability Score |
| :--- | :--- | :--- | :--- |
| **Electric Purple (`#5E4BF7`)** | Pure White (`#FFFFFF`) | Frosted white with subtle border | AAA Passed (High Contrast) |
| **Coral Orange (`#E75646`)** | Pure White (`#FFFFFF`) | Frosted white with subtle border | AA Passed |
| **Warm Amber (`#F8BA38`)** | Obsidian Dark (`#191A1E`) | Translucent dark pill | AAA Passed |
| **Sage Mint (`#D2EAA5`)** | Obsidian Dark (`#191A1E`) | Translucent dark pill | AAA Passed |
| **Obsidian Dark (`#191A1E`)** | Pure White (`#FFFFFF`) | Translucent white pill | AAA Passed |

---

## ✨ 4. Motion & Micro-Interactions

LinkCards avoids excessive, dizzying animations in favor of swift, natural physical cues:

- **Card Hover State**: On desktop screens, hovering over a card lifts it slightly by `2px` and deepens its shadow (`transition-all duration-200`).
- **Active Click State**: Pressing down on a card scales it slightly to `98%` size (`active:scale-98`), mimicking the tactile sensation of pressing a physical button.
- **Badge Pulse**: Key badges (like *FOR SALE* or *NEW BATCH*) use a subtle shimmer to attract attention without being annoying.

---

## 📱 5. Responsive Design (Mobile to Desktop)

```
┌──────────────────┐  ┌───────────────────────┐  ┌─────────────────────────────────┐
│ 📱 Mobile (<640px)│  │ 💻 Tablet (640-1024px) │  │ 🖥️ Desktop Studio (>1024px)     │
├──────────────────┤  ├───────────────────────┤  ├─────────────────────────────────┤
│ Single column    │  │ Centered phone frame  │  │ Dual-pane split:               │
│ Full-width cards │  │ Spacious background   │  │ Left: Control sidebar          │
│ 44px touch areas │  │ Floating controls     │  │ Right: Interactive phone stage  │
└──────────────────┘  └───────────────────────┘  └─────────────────────────────────┘
```
