# LeapYear Personality Assessment — Session Context

> **IMPORTANT:** When you ship a change (new feature, bug fix, redesign, etc.), update this file before ending the session. Move completed work from "What's Next" to "What's Been Shipped," add new open items if they emerged, and update the architecture section if files were added/removed/renamed. This is the single source of truth for session-to-session continuity.

## What This Is
A personality assessment (lead magnet) for LeapYear, a 9-month gap year program in Austin, TX. 85 questions, 8 archetypes, ~13 min. Target: 17-18 year old high school grads. Lives at `personality.startleapyear.com`.

## Essential Docs (read before making changes)
- `PROJECT-CONTEXT.md` — Archetypes, world-building, language guidelines, emotional targets
- `V3-ARCHITECTURE-SPEC.md` — Full architecture spec, quiz UX updates, data pipeline design

## Current Architecture (`leapyear-quiz/`)
```
leapyear-quiz/
├── index.html          Landing page (hero + orbital gallery, day-to-night scroll)
├── faithdriven.html    Faith Driven Conference lead capture (campaign page)
├── quiz.html           85-question assessment
├── reveal.html         Loading animation + archetype reveal + "check inbox" CTA
├── results.html        Full results page (fetched via token from email)
├── css/                base.css, landing.css, quiz.css, reveal.css, results.css
├── js/
│   ├── items.js        85 items + scale definitions
│   ├── scoring.js      Scoring algorithm
│   ├── content.js      Output content (archetype descriptions, shadows, tensions)
│   ├── quiz.js         Quiz logic, transitions, progress, navigation
│   ├── reveal.js       Loading roulette, type reveal
│   └── results.js      Results page rendering + Airtable fetch
├── api/
│   ├── submit.js       Vercel Serverless: receive results, write Airtable, send email (Resend), return token
│   ├── results.js      Vercel Serverless: fetch results from Airtable by token
│   └── faithdriven.js  Vercel Serverless: capture email with Faith Driven attribution
├── vercel.json
└── package.json
```

### Page Flow
```
index.html → quiz.html → [email capture modal] → reveal.html → "Check your inbox"
                                                                      ↓
                                          Email link → results.html?token=abc123

faithdriven.html → [email capture] → index.html → quiz.html → ... (same flow)
```

### Deploy: Vercel | Data: Airtable | Email: Resend | Domain: personality.startleapyear.com

## What's Been Shipped (Phases 1-4 complete)
- V3 multi-file architecture (split from monolith)
- Quiz UX: grouped by scale, transition screens, gerund ORVIS, "I" prefix IPIP, bold negation, cover screen, progress persistence
- Airtable data pipeline + Resend email delivery
- Email capture → API submit → reveal → email with results link
- Results page with card dashboard, modal overlays, radar chart, score bars, shadow cards
- Mobile fixes: scroll jank, hover state, resize-triggered reloads
- Landing page copy updates

## What's Next / Open Work

### Results Page Redesign (Phase 5)
The results page works but needs a visual upgrade. The card dashboard + modal overlay system is functional. Open questions:
- Whether to keep the current modal-based layout or move to a long-scroll format
- Better archetype illustrations (current SVG icons are placeholder-quality)
- The "Strengths & Shadows" section could be more visually compelling

### Reveal Page Polish
A dispatch task exists (`.dispatch/tasks/reveal-redesign/plan.md`) for cinematic upgrades:
- Canvas 2D particle system during spin
- Dramatic lighting crescendo
- Screen flash on winner lock
- Staggered word-by-word text reveal
- Post-reveal ambient particles

### Landing Page
- Copy is updated but could use visual refinement
- The orbital gallery mechanic works well
- Collage card images are still placeholder color blocks — need real mixed-media imagery

### Content Gaps
- Only the Organizer/Explorer archetype pairing has full written copy
- Other pairings need: tension descriptions, shadow card text, commissioning language
- See `results-copy.md` and `landing-page-copy.md` for draft copy

### Archetype Illustrations
- Each archetype needs a distinct visual identity beyond the current SVG icons
- Collage art direction is defined (see HANDOFF.md archetype imagery table) but not executed
- This likely needs external design assets, not code-generated SVGs

## Technical Notes
- **Use JS inline styles for animations** — CSS class transitions are unreliable in this setup
- **Canvas 2D > SVG** for constellation/radar chart animations
- **`scroll-behavior: smooth` on `<html>` blocks `window.scrollTo()`** — use `behavior: 'instant'`
- Quiz progress persists to localStorage (resume if page reloads)
- Environment vars needed: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME`, `RESEND_API_KEY`

## The 8 Archetypes

| Archetype | Orientation | Color | Hex |
|-----------|-------------|-------|-----|
| Philosopher | Thinking | Deep Indigo | #3D4E8C |
| Analyst | Thinking | Steel Sage | #5E8A72 |
| Builder | Doing | Terracotta | #C4724E |
| Organizer | Doing | Warm Amber | #C49A3B |
| Connector | Relating | Dusty Rose | #D4847A |
| Mobilizer | Relating | Crimson Earth | #B8453A |
| Creator | Experiencing | Plum | #7B5B8A |
| Explorer | Experiencing | Mediterranean Teal | #2E8B8B |

## Design Principles
- Mobile-first (audience is on phones)
- The card is the product — it's the shareable/screenshot moment
- Less copy, more visual. Show don't tell.
- Warm, never cold. Grounded, never flashy.
- Tone: like someone who knows you talking to you. Empathy before challenge.
- Gen Z quality bar — not basic, not corporate, not "AI-looking"
- Thematic direction: "The Awakening" (gray world → color breaks through → identity revealed)
