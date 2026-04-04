---
name: leapyear-brand
description: Apply LeapYear's visual brand identity to any artifact — web apps, HTML pages, presentations, documents, landing pages, or design assets. Contains the complete color palette, typography system, spacing rules, component patterns, and design principles extracted from startleapyear.com and the official brand assets. Use this skill whenever building or styling anything that should look like LeapYear — including the personality assessment, marketing pages, decks, or any student-facing content.
---

# LeapYear Visual Brand System

This skill defines the complete visual identity for LeapYear. Use it whenever creating any artifact that needs to look and feel like LeapYear — web apps, HTML pages, slide decks, documents, landing pages, or any design asset.

## Brand Overview

LeapYear is a 12-month gap year program in Austin, Texas for high school graduates. The brand targets 17–19 year olds and their parents. The visual identity is warm, grounded, and aspirational — not corporate, not clinical, not youth-ministry generic. It should feel like a thoughtful indie brand that takes young people seriously.

---

## Color Palette

### Primary Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Night** | `#071411` | Primary dark / text on light backgrounds / dark sections |
| **Alabaster** | `#F5F1EB` | Primary light / background / text on dark backgrounds |
| **Brunswick Green** | `#354A3D` | Secondary dark green / accents / section backgrounds |
| **Dark Green** | `#17322D` | Deep green / footer / hero overlays |
| **Flame** | `#DD5E32` | Primary accent / CTAs / buttons / highlights |
| **Sandy Brown** | `#F1AA5F` | Secondary warm accent / supporting highlights |

### Extended Neutrals

| Name | Hex | Usage |
|------|-----|-------|
| **Neutral 900** | `#1B1918` | Near-black text |
| **Neutral 800** | `#393634` | Heavy body text |
| **Neutral 700** | `#595755` | Standard body text |
| **Neutral 500** | `#82807E` | Muted text / captions |
| **Neutral 300** | `#C0BDBB` | Borders / dividers |
| **Neutral 200** | `#DDDBD9` | Light borders / subtle dividers |
| **Neutral 100** | `#F1EFEC` | Off-white backgrounds / cards |

### Semantic Color Usage

- **Dark theme sections:** Night (`#071411`) or Dark Green (`#17322D`) backgrounds with Alabaster (`#F5F1EB`) text
- **Light theme sections:** Alabaster (`#F5F1EB`) or white backgrounds with Night (`#071411`) text
- **Primary buttons:** Flame (`#DD5E32`) background with white text. Hover: `#DD5E32E6` (slightly transparent)
- **Secondary buttons:** Transparent with border, text color matches section theme
- **Links:** Flame (`#DD5E32`) on light backgrounds
- **Accent highlights:** Sandy Brown (`#F1AA5F`) for warm supporting elements

### Color Principles

- The palette is built around the contrast between deep greens (grounded, natural, trustworthy) and warm oranges (energetic, inviting, human)
- Alabaster is NOT pure white — it's a warm cream. Use `#F5F1EB` as the primary light color, never `#FFFFFF` as a background
- Night is NOT pure black — it's a deep forest-black. Use `#071411` for dark text and backgrounds
- Green sections should feel like depth and stillness. Orange accents should feel like warmth and action
- Never use bright/neon colors. The palette is intentionally muted and earthy

---

## Typography

### Font Families

| Role | Font | Fallback | Typekit ID |
|------|------|----------|------------|
| **Display / Headlines** | Neulis Neue | sans-serif | `neulis-neue` |
| **Body / Primary** | Area Normal | sans-serif | `area-normal` |

**Loading:** Both fonts are served via Adobe Fonts (Typekit). Kit ID: `gxr6ytx`

```html
<script src="https://use.typekit.net/gxr6ytx.js"></script>
<script>try{Typekit.load();}catch(e){}</script>
```

Or via CSS link:
```html
<link rel="stylesheet" href="https://use.typekit.net/gxr6ytx.css">
```

### Font Weights Available

**Neulis Neue:**
- 400 (Regular)
- 600 (Semi-Bold)
- 700 (Bold) — normal and italic

**Area Normal:**
- 400 (Regular) — normal and italic
- 600 (Semi-Bold) — normal and italic
- 700 (Bold) — normal and italic
- 800 (Extra-Bold) — normal and italic

### Typography Hierarchy

| Element | Font | Weight | Notes |
|---------|------|--------|-------|
| H1 / Hero headlines | Neulis Neue | 700 | Large, impactful. Use sparingly. |
| H2 / Section headlines | Neulis Neue | 600–700 | Clear section dividers |
| H3 / Sub-headlines | Neulis Neue | 600 | |
| H4–H6 / Labels | Area Normal | 700 | Often uppercase for labels |
| Body text | Area Normal | 400 | Standard reading text |
| Body emphasis | Area Normal | 600 | Semi-bold for inline emphasis |
| Buttons | Area Normal | 600–700 | Uppercase or sentence case depending on button type |
| Captions / Small text | Area Normal | 400 | Smaller size, muted color |
| Navigation | Area Normal | 600 | |

### Typography Principles

- Neulis Neue is the personality font — it has character and warmth. Use it for headlines and display text.
- Area Normal is the workhorse — clean, readable, modern. Use it for everything else.
- Never use more than 2 font weights in a single section. Keep it clean.
- Headlines should breathe. Use generous line-height (1.2–1.3) and letter-spacing.
- Body text should be comfortable to read on mobile. Minimum 16px, line-height 1.5–1.6.
- `text-wrap: balance` on headlines (the site uses this via a `.balance` utility class)

---

## Layout & Spacing

### Spacing Scale

The site uses a consistent spacing system. When building LeapYear artifacts, use these values:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight spacing (icon gaps) |
| sm | 8px | Small spacing |
| md | 16px | Standard spacing (button padding, card padding) |
| lg | 24px | Section internal padding |
| xl | 32px | Section gaps |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Hero padding, large sections |
| 4xl | 96px | Top-level section separators |

### Layout Principles

- **Mobile-first.** The primary audience (17–18 year olds) will engage on phones.
- **Max content width:** ~1200px centered with padding
- **Generous whitespace.** Let the content breathe. LeapYear is not a dense information site — it's a contemplative, aspirational experience.
- **Full-bleed sections** alternate between light and dark backgrounds to create visual rhythm
- **Cards and containers** use subtle rounded corners (8–12px)
- **Images** are full-width or large — never tiny thumbnails. Photography is real, warm, authentic.

---

## Component Patterns

### Buttons

**Primary Button (CTA):**
```css
background-color: #DD5E32;
color: #FFFFFF;
font-family: 'area-normal', sans-serif;
font-weight: 600;
padding: 12px 24px;
border-radius: 8px;
border: none;
transition: all 0.3s ease;
```
Hover: slightly transparent (`#DD5E32E6`) or darken

**Secondary Button:**
```css
background-color: transparent;
color: var(--theme-text);
border: 1px solid var(--theme-border);
font-family: 'area-normal', sans-serif;
font-weight: 600;
padding: 12px 24px;
border-radius: 8px;
transition: all 0.3s ease;
```

**Alt Button (on dark backgrounds):**
```css
background-color: transparent;
color: #F5F1EB;
border: 1px solid #F5F1EB;
```

### Navigation

- Fixed/sticky navbar that condenses on scroll
- Logo on left, navigation links right
- Hamburger menu on mobile with smooth transitions
- Navbar background: transparent on hero, then solid on scroll
- Logo max-width shrinks to 180px when scrolled

### Animations

- **Fade-in on scroll:** Elements fade in from 20px below, duration 0.3s (GSAP ScrollTrigger)
- **List stagger:** Child elements stagger in at 0.2s intervals
- **Page transitions:** 1600ms intro, 1000ms exit
- **Hover transitions:** 0.3s ease on all interactive elements
- **Accordion icons:** 90deg rotation on active state
- Keep animations subtle and purposeful — never flashy

### Cards / Content Blocks

- Subtle background differentiation (Neutral 100 `#F1EFEC` on Alabaster, or Alabaster on white)
- Rounded corners (8–12px)
- Generous internal padding (24–32px)
- No heavy drop shadows — keep it flat or use very subtle elevation

---

## Logo Assets

**Webflow CDN URLs (live, usable directly):**

| Variant | URL |
|---------|-----|
| Logo (dark) | `https://cdn.prod.website-files.com/67d4936e49a6f8c99c6f200f/67d49d06a4ad6f9d4ce0c917_logo-dark.svg` |
| Logomark (light, large) | `https://cdn.prod.website-files.com/67d4936e49a6f8c99c6f200f/67fd605599cf6d0125777357_logomark-large-light.svg` |
| Favicon | `https://cdn.prod.website-files.com/67d4936e49a6f8c99c6f200f/67d4bd9d4c6b42259b3b58c5_favicon.png` |
| Webclip | `https://cdn.prod.website-files.com/67d4936e49a6f8c99c6f200f/67d4bda23e67936251a4a5d8_leapyear-webclip.png` |

**Google Drive assets (higher resolution, multiple formats):**
- Logos (PNG): [Drive folder](https://drive.google.com/drive/folders/1NtFvMSjiJevzaUMJ1b8o-0co9OxqMyXa)
- Logos (SVG): [Drive folder](https://drive.google.com/drive/folders/1tqVsb72p35_LVrvL_lmP8_8MNmMBxCd8)
- Graphics and Symbols: [Drive folder](https://drive.google.com/drive/folders/1u4dhr_Gj2qNsDYJtcPEyTs2jgpOktRx5)
- Illustrations and Brand Art: [Drive folder](https://drive.google.com/drive/folders/1POb0240vwLBTthrAxR_uoQ6r-Wn1o1nW)

The logomark is a set of overlapping semicircular forms in Alabaster (`#F5F1EB`) with varying opacity layers (0.85–0.95), creating a subtle layered effect. It's minimal and geometric — no text, just the mark.

---

## Brand Personality (Visual)

When making design decisions not explicitly covered above, use these principles:

1. **Warm, not cold.** Cream over white. Deep green over gray. Orange over blue. Every color choice should feel human.
2. **Grounded, not flashy.** The brand is rooted and trustworthy. No gradients, no neon, no gimmicks. Solid colors, clean type, real photography.
3. **Aspirational, not preachy.** The design should make you want to lean in, not lecture you. Space and beauty over density and authority.
4. **Young but serious.** This is not a youth ministry flyer. It's not TikTok aesthetic. It's a brand that takes young people seriously — like a well-designed indie magazine or a thoughtful startup.
5. **Typography-forward.** The words matter most. Let them lead. Beautiful type at generous sizes with breathing room.
6. **Nature-rooted.** The green palette is intentional — growth, rootedness, the garden. The warmth of the oranges is sunshine and fire. The brand is organic, not industrial.

---

## Quick Reference: CSS Variables

For web builds, define these at the root:

```css
:root {
  /* Brand Colors */
  --ly-night: #071411;
  --ly-alabaster: #F5F1EB;
  --ly-brunswick-green: #354A3D;
  --ly-dark-green: #17322D;
  --ly-flame: #DD5E32;
  --ly-sandy-brown: #F1AA5F;

  /* Neutrals */
  --ly-neutral-900: #1B1918;
  --ly-neutral-800: #393634;
  --ly-neutral-700: #595755;
  --ly-neutral-500: #82807E;
  --ly-neutral-300: #C0BDBB;
  --ly-neutral-200: #DDDBD9;
  --ly-neutral-100: #F1EFEC;

  /* Typography */
  --ly-font-display: 'neulis-neue', sans-serif;
  --ly-font-body: 'area-normal', sans-serif;
  --ly-font-weight-normal: 400;
  --ly-font-weight-semi-bold: 600;
  --ly-font-weight-bold: 700;
  --ly-font-weight-extra-bold: 800;
}
```

---

## Application Checklist

When applying this brand to any artifact, verify:

- [ ] Using Neulis Neue for headlines, Area Normal for body text
- [ ] Primary background is Alabaster (`#F5F1EB`), NOT white
- [ ] Dark sections use Night (`#071411`) or Dark Green (`#17322D`)
- [ ] CTAs use Flame (`#DD5E32`)
- [ ] No pure black (`#000000`) or pure white (`#FFFFFF`) used as backgrounds
- [ ] Typography is generous — large sizes, comfortable line-height, breathing room
- [ ] Animations are subtle (0.3s ease transitions, gentle fade-ins)
- [ ] Mobile-first responsive design
- [ ] Overall feel is warm, grounded, and aspirational
