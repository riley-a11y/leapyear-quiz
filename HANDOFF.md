# LeapYear Personality Assessment — Session Handoff

## What This Is
A personality assessment site for LeapYear (12-month gap year program in Austin, TX). The assessment has 85 questions, produces a profile with primary + secondary archetype across 8 types, and measures growth mindset. Target audience: 17-18 year old high school graduates. It's a lead magnet.

---

## What's Been Built

### Landing Page (`direction-2-cartography/landing-page.html`)
- **Day-to-night scroll**: Sky gradient transitions through 12 color stops (green earth dawn → amber afternoon → purple dusk → navy night) driven by scroll progress
- **Orbital gallery**: 8 archetype cards orbit a central point using Math.cos/sin positioning with per-frame lerp interpolation (factor 0.08). Scroll-driven rotation. Inspired by [offmenu.design](https://www.offmenu.design/)
- **Fixed globe grid**: SVG latitude/longitude lines that rotate slowly with scroll (currently atlas-themed — needs re-theming)
- **Hero section**: Left-aligned text + right-side collage composition, earthy green tones, horizon glow, light rays, organic particles
- **Collage card placeholders**: Each archetype has a card with color blocks standing in for real mixed-media collage imagery
- **Narrative breath sections**: Text interludes between archetype groups
- **Stars layer**: 220 elements with twinkle animation in the night portion
- **Nav theming**: Automatically switches between day (green) and night (cream) styling based on scroll position
- **400vh scroll wrapper** for the orbit section with sticky container

### Results Page (`direction-2-cartography/results-page.html`)
- **Loading sequence** (~9 seconds): Canvas 2D particles drift → converge toward constellation vertices → lines draw progressively → vertex glows bloom → fade. Text phases: "Gathering your responses" → "Finding patterns" → "Something is taking shape" → "Your coordinates have been found"
- **Card reveal**: Dark archetype card enters with scale(.82) rotate(-3deg) → scale(1) rotate(0deg) via JS inline styles. Globe grid overlay, constellation drawn via Canvas 2D, amber glow
- **Dark-to-light transition**: 200px gradient from navy to cream between card zone and profile zone
- **Profile content** (light cream theme):
  - Core Type display (e.g., Organizer)
  - Secondary Type (e.g., Explorer)
  - Tension visualization ("Structure vs. Freedom" with animated visual)
  - Radar Chart — Canvas 2D, animated expansion with node glows
  - Score Bars — animated width + counting numbers
  - Shadow Cards — 4-card grid (e.g., Micromanager, Restless Architect, Efficiency Trap, Escape Artist)
  - Growth Mindset Gauge — sliding dot indicator
  - Commissioning CTA ("This is where it begins")
- **Nav theme switching**: Dark glass nav over card zone, warm cream nav over profile zone
- **Scroll-reveal**: IntersectionObserver with `.reveal-target` class

### Other Preserved Files
- `direction-1-field-guide/` — Earlier "Field Guide" direction (warm cream/parchment, serif/sans mixing). Preserved but not active.
- Root-level HTML files — Earlier iterations of Field Guide direction.
- `PROJECT-CONTEXT.md` — Master context document with assessment mechanics, archetypes, world-building narrative, language guidelines, emotional targets. **Essential reading for any new session.**

---

## What Works Well (Keep These Mechanics)

| Mechanic | Why It Works |
|---|---|
| Orbital gallery | Physically embodies "finding your place" — you scroll through possibilities until yours lights up |
| Day-to-night scroll | Creates a journey feeling; the palette shift is emotional, not just decorative |
| Loading sequence (creation narrative) | Particles converging into a constellation = identity being "found," not assigned |
| Dark-to-light transition | Card reveal in darkness → profile in light = the moment of discovery |
| Collage imagery style | Fragments of old things reassembled into something new = the New Renaissance made visual |
| Canvas 2D rendering | Bulletproof for constellation animations, radar charts. SVG was buggy. |
| JS inline style transitions | CSS class-based transitions were unreliable; JS manipulation is consistent |
| Radar chart with animated expansion | Beautiful way to show the full profile, not just primary type |
| Shadow cards | Adds depth — "here's your strength, and here's where it could go wrong" |

---

## The Thematic Pivot

### Moving Away From
- Atlas / cartography / "mapping" metaphor
- Globe grid as central visual element
- "Your coordinates have been found" language
- Wayfinding / navigation framing

### Moving Toward: The Awakening (Apple 1984 Arc)

The new thematic direction draws from Apple's 1984 ad: a generation has the opportunity to **come awake and come alive** in a way that could restore color and humanness to the world.

Core narrative beats:
1. **The world is gray** — conformity, screens, shallow identity, the "Enemy" (see PROJECT-CONTEXT.md)
2. **Something stirs** — a generation begins to wake up, to see differently
3. **Color breaks through** — identity is revealed, not as a label but as a calling
4. **The New Renaissance** — they bring their full identity to expression in partnership with God, joining his restoration of the world
5. **You are part of this** — the assessment isn't a personality quiz, it's a commissioning

This maps beautifully onto what's already built:
- Day-to-night scroll → could become **gray-to-color** (monochrome world awakening)
- Loading sequence (particles → constellation) → already feels like identity "emerging from formlessness"
- Dark-to-light transition → already embodies the awakening moment
- Collage imagery → fragments reassembled = renaissance, rebirth
- Orbital gallery → types aren't points on a map, they're **expressions of humanness coming alive**

### What Needs to Change
- **Globe grid SVG** → Replace with something that fits the awakening theme (could be abstract, organic, or removed entirely)
- **Cartographic language** → Replace "coordinates," "cartography," "atlas" with awakening/renaissance language
- **Hero section copy** → Reframe from "find where you belong on the map" to "something in you is ready to come alive"
- **Loading text phases** → Reframe from navigation metaphors to emergence/awakening metaphors
- **Card reveal framing** → Not "your coordinates have been found" but something about identity being revealed/awakened
- **CTA language** → The commissioning moment: "This is where it begins" already works, could be strengthened
- **Visual atmosphere** → Consider whether the dawn-to-night scroll should shift to emphasize color breaking through gray

### What Stays the Same
- All the animation mechanics (orbital gallery, loading particles, radar chart, score bars)
- The collage imagery approach and archetype color palette
- The dark-to-light transition structure
- The 8 archetypes and their descriptions/colors
- The assessment mechanics (85 questions, scoring, shadows, growth mindset)
- The overall page structure (hero → gallery → results)
- Canvas 2D rendering approach
- JS inline style transitions

---

## Technical Lessons Learned

1. **Use JS inline styles for all animated state transitions** — CSS class-based transitions were unreliable (computed opacity stuck at 0 even with correct classes). Set `el.style.transition` and target properties directly.

2. **Canvas 2D over SVG** for constellation animations and radar charts. SVG stroke-dasharray animations were buggy.

3. **`scroll-behavior: smooth` on `<html>` blocks `window.scrollTo()`** — Remove it or use `behavior: 'instant'` for programmatic scrolling.

4. **Logo CDN images may be blocked** — Use `onerror` handler with text fallback.

5. **z-index stacking** — Profile zone needs explicit z-index above card zone and dark-to-light transition.

6. **IntersectionObserver** with `.reveal-target` → `.visible` class for scroll-reveal animations.

---

## 8 Archetypes Quick Reference

| Archetype | Orientation | Color | Collage Imagery |
|---|---|---|---|
| Philosopher | Thinking | #3D4E8C | Classical sculpture, books, deep teal/indigo, stone, parchment |
| Analyst | Thinking | #5E8A72 | Diagrams, lenses, circuitry, steel sage, technical overlay |
| Builder | Doing | #C4724E | Raw materials, hands, construction, terracotta, concrete/wood grain |
| Organizer | Doing | #C49A3B | Architecture, grids, blueprints, warm amber, graph paper |
| Connector | Relating | #D4847A | Human forms, hands reaching, dusty rose, soft fabric/watercolor |
| Mobilizer | Relating | #B8453A | Crowds, fire, movement, crimson, grain/smoke |
| Creator | Experiencing | #7B5B8A | Paint, raw canvas, color, plum, brushstrokes/torn paper |
| Explorer | Experiencing | #2E8B8B | Landscapes, maps, horizon, orange/teal, topo lines/film grain |

---

## Key Files to Read First in New Session
1. `PROJECT-CONTEXT.md` — The world-building, archetypes, assessment mechanics, language guidelines
2. `direction-2-cartography/results-page.html` — The most polished page with all mechanics working
3. `direction-2-cartography/landing-page.html` — The orbital gallery and day-to-night scroll
4. This document

---

## Dev Server
```json
// .claude/launch.json
{
  "name": "results-page",
  "runtimeExecutable": "python3",
  "runtimeArgs": ["-m", "http.server", "8090", "-d", "direction-2-cartography"],
  "port": 8090
}
```

Run from project root: `python3 -m http.server 8090 -d direction-2-cartography`
