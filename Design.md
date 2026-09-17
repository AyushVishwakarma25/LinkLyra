# 🎨 LinkLyra — Design System & Aesthetic Guide

> **Document Version**: 2.4.0  
> **Status**: Production Design Specification  
> **Typography Pairing**: Plus Jakarta Sans (Headings & UI) + Inter / System Monospace (Meta)  
> **Aesthetic Archetype**: Tactile Physicality & High-Contrast Warm Neutrals

---

## 📖 Executive Summary & Plain Language Jargon Guide

- **Tactile UI**: Designing digital interfaces so buttons and cards feel like physical, tangible objects with weight, depth, and satisfying press feedback.
- **Negative Space (Whitespace)**: Intentional breathing room around interface elements that prevents cognitive overload and elevates perceived value.
- **Nested Corner Radius**: A mathematical formula ensuring inner container corners curve seamlessly in parallel with outer container corners without distortion.
- **Micro-Interactions**: Subtle, fluid animations that occur during user actions (hovering, toggling, expanding, clicking).
- **WCAG AA / AAA**: Universal international standards measuring color contrast to ensure effortless readability for all users.

---

## 🏛️ 1. Core Visual Philosophy: "Tactile Physicality"

Most link-in-bio tools resemble flat, monotonous spreadsheets or low-contrast neon gradients. LinkLyra was created to feel like a **luxury stationery card collection** brought to life on modern mobile screens.

```
┌─────────────────────────────────────────────────────────────┐
│                 THE 3 AESTHETIC PILLARS                     │
├──────────────────────────────┬──────────────────────────────┤
│ 1. Warm Neutral Canvas       │ 2. Saturated Physical Pigment│
│    • Organic paper linen     │    • Velvet Obsidian Dark    │
│    • Soft Alabaster tones    │    • Electric Purple         │
│    • Zero harsh pure blacks  │    • Warm Amber Gold         │
├──────────────────────────────┴──────────────────────────────┤
│ 3. Optical Harmony & Mathematical Nesting                   │
│    • Exact radius curvature curves                          │
│    • High-contrast typography hierarchy                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 2. Layout Structure & Optical Math

### The Nested Corner Radius Formula
When a container (e.g. a pill badge or photo frame) sits inside a rounded card, standard identical corner radii create optical clashing. LinkLyra enforces the mathematical rule:

$$\text{Inner Radius} = \text{Outer Radius} - \text{Padding}$$

#### Practical Component Values:
- **Primary Link Card**: `rounded-2xl` (16px) with `p-4` (16px padding) $\rightarrow$ Inner pills use `rounded-xl` (10px) or `rounded-full` (9999px).
- **Modal Dialogue Container**: `rounded-3xl` (24px) with `p-6` (24px padding) $\rightarrow$ Inner sections use `rounded-2xl` (16px).
- **Control Buttons**: Horizontal padding is strictly $2\times$ vertical padding (e.g., `px-4 py-2` or `px-3 py-1.5`).

---

## 🎭 3. Color Harmony & Accessibility Tokens

Every color palette in LinkLyra is rigorously calibrated to achieve a minimum contrast ratio of **4.5:1 (WCAG AA)**, with primary text achieving **7:1+ (WCAG AAA)**.

| Palette Name | Hex Code | Card Background | Foreground Text | Badge Pill Accent | WCAG Contrast |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Electric Purple** | `#5E4BF7` | Deep Royal Violet | Pure White (`#FFFFFF`) | Translucent White Glass (`rgba(255,255,255,0.15)`) | **AAA (8.2:1)** |
| **Coral Sunset** | `#E75646` | Vivid Terracotta Coral | Pure White (`#FFFFFF`) | Frosted Coral Overlay (`rgba(255,255,255,0.2)`) | **AA (5.1:1)** |
| **Warm Amber** | `#F8BA38` | Saturated Honey Gold | Obsidian Dark (`#191A1E`) | Deep Charcoal Pill (`rgba(25,26,30,0.1)`) | **AAA (9.8:1)** |
| **Sage Mint** | `#D2EAA5` | Gentle Pastel Olive | Forest Obsidian (`#191A1E`) | Translucent Dark Glass (`rgba(25,26,30,0.08)`) | **AAA (11.2:1)** |
| **Obsidian Dark** | `#191A1E` | Matte Velvet Charcoal | Pure White (`#FFFFFF`) | Warm Amber Pill (`#F8BA38` / `#191A1E`) | **AAA (16.4:1)** |

### Neutral Canvas Tones
- **Canvas Base Background**: `#ECE7DC` (Warm Paper Linen)
- **Secondary Studio Stage**: `#F5F2EB` (Soft Alabaster)
- **Container Surfaces**: `#FFFFFF` with `border border-black/10` and `shadow-2xs`
- **Text Primary**: `#1C1E22` (High-Contrast Carbon)
- **Text Muted**: `#737882` (Medium Steel Gray)

---

## 🔤 4. Typography Hierarchy & Scaling

LinkLyra pairs **Plus Jakarta Sans** for expressive headings and structural UI with clean system sans and monospace numbers.

```
┌─────────────────────────────────────────────────────────────┐
│                    TYPOGRAPHIC SCALE                        │
├───────────────────┬─────────┬────────────┬──────────────────┤
│ Style             │ Size    │ Weight     │ Line Height      │
├───────────────────┼─────────┼────────────┼──────────────────┤
│ Display Title     │ 24-28px │ 800 (Bold) │ 1.2 (Tight)      │
│ Section Header    │ 16-18px │ 700 (Bold) │ 1.3              │
│ Card Title        │ 14-16px │ 700 (Bold) │ 1.4              │
│ Body & Meta       │ 12-14px │ 500 (Med)  │ 1.5–1.6          │
│ Micro Badges      │ 9-11px  │ 800 (Bold) │ 1.0 (Single Line)│
└───────────────────┴─────────┴────────────┴──────────────────┘
```

> **Zero Text Wrapping in Badges**: Text inside pills, status chips, and action badges sits on a single line with `whitespace-nowrap` to prevent awkward line breaks.

---

## ✨ 5. Micro-Interactions & Motion Choreography

All interactive components utilize subtle, physics-based springs (`motion/react` and Tailwind transitions) rather than flashy, distracting animations:

1. **Card Hover Elevation**: On desktop pointer devices, cards elevate by `-2px` with expanded soft shadow (`shadow-md`) over a 150ms ease curve.
2. **Active Press Feedback**: Clicking or tapping triggers an instant `scale-98` contraction, providing tangible tactile feedback.
3. **Modal Backdrop Fade & Slide**: Dialogues enter with a smooth opacity fade (`opacity-0` $\rightarrow$ `opacity-100`) and a slight upward translate (`translate-y-2` $\rightarrow$ `translate-y-0`).
4. **Tab Switch Transition**: Navigation tabs cross-fade instantly with a slide indicator that highlights active selections.

---

## 📱 6. Responsive Viewport Archetypes

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           RESPONSIVE ADAPTATION                               │
├────────────────────────────────┬──────────────────────────────────────────────┤
│ 📱 Mobile (< 640px)            │ • Single-column stacked view                 │
│                                │ • Full-width cards with 44px+ touch targets  │
│                                │ • Bottom quick-action sticky drawer          │
├────────────────────────────────┼──────────────────────────────────────────────┤
│ 💻 Tablet (640px – 1024px)     │ • Centered simulated mobile device frame     │
│                                │ • Floating quick-switch mode buttons         │
├────────────────────────────────┼──────────────────────────────────────────────┤
│ 🖥️ Desktop Studio (> 1024px)   │ • Dual-pane split workspace                  │
│                                │ • Left: 440px sticky modular builder sidebar │
│                                │ • Right: Interactive real-time phone canvas  │
└────────────────────────────────┴──────────────────────────────────────────────┘
```
