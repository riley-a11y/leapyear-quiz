# LeapYear Assessment — Build Spec

## What You're Building

A web application for the LeapYear personality assessment. A student visits the page, answers 85 questions, and receives a personalized archetype result. All scoring runs client-side. This is the MVP — it should look and feel polished while being fast to ship.

**Goal:** Testable MVP by tomorrow morning. This should be both well-built and well-designed — clean code, thoughtful UI, beautiful results page.

**Deployment:** This will be deployed via Netlify (or similar static hosting). Use whatever architecture makes sense — a single HTML file, a lightweight framework, a small set of static files — whatever produces the best result. No backend or database needed for V1.

---

## Project Structure

```
leapyear-assessment/
├── BUILD-SPEC.md                    ← You are here
├── leapyear-brand-skill/
│   └── SKILL.md                     ← Complete visual brand system (colors, fonts, spacing, components)
├── src/
│   ├── scoring-algorithm.js         ← Complete scoring engine (tested, ready to import)
│   └── output-content.json          ← All output content (narratives, tensions, shadows, closings)
└── docs/
    ├── item-presentation-order.md   ← Exact 85-item sequence with response scales
    ├── assessment-items-v2.md       ← Full item inventory, scoring keys, formulas (reference)
    └── pairing-names-draft.md       ← On hold — not used in MVP
```

Read `leapyear-brand-skill/SKILL.md` and all files in `src/` and `docs/` before starting.

---

## Three Screens

### Screen 1: Landing / Intro
- Display the intro text from `output-content.json` → `introText`
- "Let's find out" button starts the assessment
- Clean, mobile-first design
- No LeapYear logo needed yet — just clean typography

### Screen 2: Assessment (85 questions)
- Show one question at a time (or a small group — your call, but one-at-a-time is cleaner for mobile)
- Progress bar showing position out of 85
- Each question displays:
  - The item text
  - The appropriate response scale buttons (see response scale details below)
- When student selects an answer, auto-advance to next question
- Allow going back to previous questions
- Store responses in memory (object keyed by item ID)

### Screen 3: Results
- Assembled from the scoring output + content modules
- Structure (in order):
  1. **Identity Statement:** "You are a [Primary] — [Secondary]" (e.g., "You are a Philosopher — Explorer")
  2. **Primary Narrative:** from `primaryNarratives[primary].narrative`
  3. **Your [Secondary] Side:** header + content from `secondaryDescriptions[secondary]`
  4. **Your Tension:** from `tensionTemplates[modifiers.tensionTemplate].content`
  5. **Your Shadow:** 2-4 sentences from `shadowModifiers`, selected by `modifiers.shadows` array
  6. **The Invitation:** from `growthMindsetClosings[modifiers.growthMindsetTier]`
  7. **LeapYear Bridge:** from `leapYearBridge`
- Include a simple bar chart or visual showing all 8 archetype scores
- If `isBalanced` is true, add a note: "Your top two types are closely matched — you carry both equally."
- If `isRenaissance` is true, add: "You resist easy categorization, which is actually a strength."

---

## Response Scales (Critical Detail)

The assessment uses **4 different response scales**. The UI must display the correct scale labels based on which item is being shown. The presentation order file has a column indicating which scale each item uses.

| Scale | Stem Question | Options | Items |
|-------|--------------|---------|-------|
| CEI | "How accurately does this reflect you?" | 1: Very Slightly or Not at All, 2: A Little, 3: Moderately, 4: Quite a Bit, 5: Extremely | B1–B10 |
| ORVIS | "How much would you enjoy this?" | 1: Very Much Dislike, 2: Dislike, 3: Neutral, 4: Enjoy, 5: Very Much Enjoy | A1–A33 |
| IPIP | "How well does this describe you?" | 1: Very Inaccurate, 2: Moderately Inaccurate, 3: Neither, 4: Moderately Accurate, 5: Very Accurate | D1–D28 |
| Dweck | "How much do you agree?" | 1: Strongly Agree, 2: Agree, 3: Mostly Agree, 4: Mostly Disagree, 5: Disagree, 6: Strongly Disagree | E1–E8 |

**Important:** The Dweck scale has **6 options** while all others have 5. The UI must handle this transition (happens at position 78 in the sequence).

---

## Scoring Integration

The scoring algorithm is in `src/scoring-algorithm.js`. To use it:

```javascript
// Build the responses object from the UI state
// Keys are item IDs (e.g., 'A1', 'B2', 'D15', 'E3')
// Values are the numeric response (1-5 or 1-6 for Dweck)
const responses = {
  A1: 4,
  A2: 3,
  // ... all 85 items
};

// Score it
const result = scoreAssessment(responses);

// result contains:
// result.primary        → 'philosopher' (lowercase)
// result.secondary      → 'explorer'
// result.primaryScore   → 78.3
// result.secondaryScore → 71.1
// result.isBalanced     → false
// result.isRenaissance  → false
// result.allScores      → [{archetype: 'philosopher', score: 78.3}, ...]
// result.modifiers.growthMindsetTier → 'high' | 'low' | 'mixed'
// result.modifiers.tensionTemplate   → 'depth_vs_breadth'
// result.modifiers.shadows           → ['vulnerability_high', 'cooperation_low']
// result.modifiers.socialFlavor      → 'social' | 'independent' | 'balanced'
```

The scoring file exports via `module.exports` but also works as a plain script. Adapt the import approach to whatever architecture you choose.

---

## Item Data for the UI

Here's how to structure the items array for the assessment screen. This data comes from the presentation order file:

```javascript
const ITEMS = [
  { position: 1, id: 'B1', text: 'I actively seek as much information as I can in new situations', scale: 'CEI' },
  { position: 2, id: 'B4', text: 'Everywhere I go, I am out looking for new things or experiences', scale: 'CEI' },
  // ... all 85 items in presentation order
];

const SCALES = {
  CEI: {
    stem: 'How accurately does this reflect you?',
    options: [
      { value: 1, label: 'Very Slightly or Not at All' },
      { value: 2, label: 'A Little' },
      { value: 3, label: 'Moderately' },
      { value: 4, label: 'Quite a Bit' },
      { value: 5, label: 'Extremely' }
    ]
  },
  ORVIS: {
    stem: 'How much would you enjoy this?',
    options: [
      { value: 1, label: 'Very Much Dislike' },
      { value: 2, label: 'Dislike' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Enjoy' },
      { value: 5, label: 'Very Much Enjoy' }
    ]
  },
  IPIP: {
    stem: 'How well does this describe you?',
    options: [
      { value: 1, label: 'Very Inaccurate' },
      { value: 2, label: 'Moderately Inaccurate' },
      { value: 3, label: 'Neither' },
      { value: 4, label: 'Moderately Accurate' },
      { value: 5, label: 'Very Accurate' }
    ]
  },
  DWECK: {
    stem: 'How much do you agree?',
    options: [
      { value: 1, label: 'Strongly Agree' },
      { value: 2, label: 'Agree' },
      { value: 3, label: 'Mostly Agree' },
      { value: 4, label: 'Mostly Disagree' },
      { value: 5, label: 'Disagree' },
      { value: 6, label: 'Strongly Disagree' }
    ]
  }
};
```

---

## Visual Brand

**IMPORTANT:** This project has a complete brand skill file at `leapyear-brand-skill/SKILL.md` (in the parent directory). Read it before writing any CSS or making design decisions. It contains the authoritative color palette, typography, spacing, component patterns, and design principles.

### Key Brand Essentials (quick reference — the skill file has full details)

**Fonts (Adobe Typekit, kit ID `gxr6ytx`):**
```html
<link rel="stylesheet" href="https://use.typekit.net/gxr6ytx.css">
```
- Headlines: `'neulis-neue', sans-serif` (weight 600–700)
- Body/UI: `'area-normal', sans-serif` (weight 400–600)

**Colors:**
- Primary background: Alabaster `#F5F1EB` (NOT white — never use `#FFFFFF` as a background)
- Primary text / dark sections: Night `#071411` (NOT black — never use `#000000`)
- CTA buttons: Flame `#DD5E32` with white text
- Dark section backgrounds: Dark Green `#17322D` or Night `#071411` with Alabaster text
- Accent green: Brunswick Green `#354A3D`
- Warm accent: Sandy Brown `#F1AA5F`

**Design Principles:**
- Mobile-first. The primary audience (17–18 year olds) will take this on phones.
- Warm, not cold. Cream over white. Deep green over gray. Orange over blue.
- Typography-forward. Generous sizes, comfortable line-height, breathing room.
- The results page should feel like someone is talking to you — flowing prose, not a dashboard. A score visualization is a secondary element; the narrative is primary.
- No emojis. No stock imagery. No neon colors. The palette is intentionally muted and earthy.
- Buttons: 8px border-radius, 12px 24px padding, `area-normal` semi-bold.
- Cards/containers: subtle rounded corners (8–12px), generous padding (24–32px).
- Animations: subtle fade-ins (0.3s ease), gentle transitions between questions.
- Progress bar should feel encouraging, not clinical.
- The whole experience should feel considered and intentional — like a product a student would want to share.

---

## What NOT to Build

- No email capture (V2)
- No user accounts or authentication
- No analytics (V2)
- No pairing names — just "Philosopher — Explorer" format
- No admin panel or weight-editing UI
- No share functionality beyond basic (V2)

---

## Testing Checklist

After building, verify:

1. [ ] All 85 questions display in the correct order
2. [ ] Response scales switch correctly between instruments (especially the 5→6 option switch at position 78)
3. [ ] Progress bar updates accurately
4. [ ] Can go back to previous questions without losing answers
5. [ ] Scoring produces results (no NaN, no crashes)
6. [ ] Results page displays all sections: identity, primary narrative, secondary description, tension, shadow, closing, bridge
7. [ ] Shadow modifiers are populated (2-4 sentences based on scoring)
8. [ ] Growth mindset closing matches the tier (high/low/mixed)
9. [ ] Mobile layout works (test at 375px width)
10. [ ] Balanced/Renaissance flags display when appropriate
11. [ ] Deployable to Netlify (or similar static host)

---

## Quick Calibration Test

After the build works, run this mental test: if you answer all questions with a strong Philosopher profile (high NCS-6, high Erudition, high Imagination, high Intellect, low everything else), does the result say Philosopher? If yes, the integration is working.
