# LeapYear Assessment — V3 Architecture + Quiz Update Spec

**Context:** The MVP is working. Two real users (Charles and Molly) have gone through it and given feedback. The assessment is currently a single 135KB HTML file. This spec covers: migrating to a multi-file architecture, fixing quiz UX issues from user feedback, and building the data pipeline for email delivery of results.

**Deploy target:** Vercel (not Netlify)
**Data store:** Airtable
**Domain:** personality.startleapyear.com

Read `PROJECT-CONTEXT.md`, `HANDOFF.md`, and `assessment-app/leapyear-brand-skill/SKILL.md` for full context on the assessment, archetypes, and brand system.

---

## Part 1: Architecture Migration

### Current State
Everything lives in `assessment.html` — a single 2,100-line file containing all CSS, HTML, JS, items data, scoring algorithm, output content, and 5 screen states. This makes iteration slow and error-prone.

### Target Structure

```
leapyear-quiz/
├── index.html                  ← Landing page (hero + orbital gallery)
├── quiz.html                   ← The 85-question assessment
├── reveal.html                 ← Loading animation + core type reveal + "check inbox" CTA
├── results.html                ← Full results page (loaded via token from email link)
├── css/
│   ├── base.css                ← CSS variables, fonts, resets, grain texture, nav
│   ├── landing.css             ← Hero, orbital gallery, day-to-night scroll
│   ├── quiz.css                ← Assessment screen, progress bar, transitions
│   ├── reveal.css              ← Loading roulette, type reveal, CTA
│   └── results.css             ← Results page (will be redesigned separately)
├── js/
│   ├── scoring.js              ← Scoring algorithm (export scoreAssessment)
│   ├── items.js                ← 85 items array + scale definitions (export ITEMS, SCALES)
│   ├── content.js              ← Output content JSON (export OUTPUT_CONTENT)
│   ├── quiz.js                 ← Quiz logic: question rendering, transitions, progress, navigation
│   ├── reveal.js               ← Loading animation, roulette, type reveal
│   └── results.js              ← Results page rendering + Airtable fetch
├── assets/
│   └── icons/                  ← 8 archetype SVGs (already exist in project root)
├── api/
│   ├── submit.js               ← Vercel Serverless Function: receive quiz results, write to Airtable, return token
│   └── results.js              ← Vercel Serverless Function: fetch results from Airtable by token
├── vercel.json                 ← Vercel config + redirects
└── package.json                ← Minimal — just for Vercel Functions if needed
```

### Page Flow

```
index.html → quiz.html → [email capture modal] → reveal.html → "Check your inbox"
                                                                        ↓
                                            Student clicks email link → results.html?token=abc123
```

### Data Flow

1. Student completes quiz on `quiz.html`. Responses stored in JS memory.
2. Email capture modal appears. Student enters name + email.
3. On submit:
   a. Score assessment client-side (instant — no server needed for scoring)
   b. POST to `/api/submit` with: name, email, primary, secondary, allScores (all 8), isBalanced, isRenaissance, growthMindsetTier, tensionTemplate, shadows array, socialFlavor, timestamp
   c. Server generates a short unique token (nanoid, 10 chars)
   d. Server writes full result record to Airtable
   e. Server sends email via Airtable automation (or Resend/SendGrid — TBD) with link: `personality.startleapyear.com/results?token=abc123`
   f. Server returns token + primary type to client
4. Client receives response → navigates to `reveal.html?type=mobilizer&token=abc123`
5. Reveal page plays the loading roulette → shows "You are a Mobilizer" → shows "Check your inbox for your full results" + "Book a Call" CTA
6. When student clicks email link → `results.html?token=abc123` → page calls `/api/results?token=abc123` → gets full data → renders personalized results

### Airtable Schema

Table: **Quiz Results**

| Field | Type | Notes |
|-------|------|-------|
| token | Single line text | Primary lookup key (indexed). 10-char nanoid. |
| name | Single line text | Student's first name |
| email | Email | Student's email |
| primary | Single line text | e.g., "mobilizer" |
| secondary | Single line text | e.g., "explorer" |
| isBalanced | Checkbox | |
| isRenaissance | Checkbox | |
| growthMindsetTier | Single select | high / low / mixed |
| tensionTemplate | Single line text | e.g., "community_vs_independence" |
| shadows | Long text | JSON array of shadow keys |
| socialFlavor | Single select | social / independent / balanced |
| philosopher | Number | Score 0-100 |
| analyst | Number | Score 0-100 |
| builder | Number | Score 0-100 |
| organizer | Number | Score 0-100 |
| connector | Number | Score 0-100 |
| mobilizer | Number | Score 0-100 |
| creator | Number | Score 0-100 |
| explorer | Number | Score 0-100 |
| timestamp | Date | When they took it |

### Vercel Config

```json
// vercel.json
{
  "rewrites": [
    { "source": "/results/:token", "destination": "/results.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
```

This lets you use clean URLs: `personality.startleapyear.com/results/abc123` which results.html reads via `window.location.pathname.split('/').pop()`.

### Vercel Serverless Functions

**`/api/submit.js`**
- Receives POST with all quiz result data
- Generates nanoid token
- Writes to Airtable via REST API
- Returns `{ token, primary }`
- Environment variables needed: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_NAME`

**`/api/results.js`**
- Receives GET with `?token=abc123`
- Looks up record in Airtable by token field
- Returns the full result object (same shape the client-side scoring produces)
- Returns 404 if token not found

---

## Part 2: Quiz UX Updates (from user feedback)

### Update 1: Group Items by Scale + Transition Screens

**Problem:** Both users were confused when the response scale switched mid-quiz without warning. Molly accidentally answered incorrectly. Charles had to "rearm himself."

**Fix:** Reorder items so all items of the same scale are grouped together. Add a transition screen between each group.

**New item order (by group):**

| Group | Items | Count | Scale Stem |
|-------|-------|-------|------------|
| 1. CEI | B1, B4, B5, B2, B7, B3, B6, B8, B9, B10 | 10 | "How accurately does this reflect you?" |
| 2. ORVIS | A1, A16, A11, A21, A6, A26, A2, A17, A12, A22, A7, A31, A27, A3, A18, A13, A23, A32, A8, A28, A4, A19, A14, A24, A33, A9, A29, A5, A20, A15, A25, A10, A30 | 33 | "How much would you enjoy this?" |
| 3. NCS | C1, C2, C3, C4, C5, C6 | 6 | "How accurately does this reflect you?" |
| 4. IPIP | D9, D19, D1, D11, D13, D15, D21, D5, D2, D23, D6, D25, D17, D3, D7, D27, D4, D10, D8, D12, D14, D16, D18, D20, D22, D24, D26, D28 | 28 | "How well does this describe you?" |
| 5. Dweck | E1, E2, E3, E4, E5, E6, E7, E8 | 8 | "How much do you agree?" |

Within each group, keep the existing item order (which was already optimized to avoid clustering same-subscale items).

**Transition screen design:**
- Full-screen, centered, minimal
- Large text showing the new question stem (e.g., "How much would you enjoy this?")
- Subtitle: "Next: X questions" (e.g., "Next: 33 questions")
- A brief pause (1-2 seconds auto-advance, or a "Continue" button)
- The stem then animates to the header position as the first question fades in
- Progress bar continues through transitions (they're not extra steps, just visual breaks)
- Use a subtle background color shift between sections to reinforce the change

**Before the Dweck section**, add context text on the transition screen:
> "These last questions might feel similar to each other — that's intentional. We're measuring something specific about how you think about growth and change. Answer each one honestly, even if they feel repetitive."

### Update 2: Fix Information Hierarchy

**Problem:** The question stem reads as the primary heading, and the actual item text reads as subordinate.

**Fix:** This is largely solved by the transition screens (Issue 1). Once the stem is established in a transition screen and persists as a small, quiet header, the item text becomes the clear focal point. Specifically:

- **Stem** (e.g., "How much would you enjoy this?"): Small (14px), uppercase, letter-spaced, color: `var(--t3)`, fixed position at top of question area. Think of it as a persistent label, not a heading.
- **Item text** (e.g., "Making important things happen"): Large (clamp 1.25rem, 4vw, 1.75rem), font-weight 600, color: `var(--ink)`, center-stage.
- **Response options**: Below item text, clearly tappable buttons.

### Update 3: ORVIS Item Phrasing → Gerund Form

**Problem:** ORVIS items are fragments ("Make important things happen") which feel incomplete after the full-sentence CEI items.

**Fix:** Rewrite all ORVIS items as gerund phrases. These read naturally under "How much would you enjoy...?"

| ID | Current | Updated |
|----|---------|---------|
| A1 | Make important things happen | Making important things happen |
| A2 | Lead other people | Leading other people |
| A3 | Persuade others to change their views | Persuading others to change their views |
| A4 | Debate topics in a public meeting | Debating topics in a public meeting |
| A5 | Make decisions that affect a lot of people | Making decisions that affect a lot of people |
| A6 | Establish time schedules | Establishing time schedules |
| A7 | Keep detailed records | Keeping detailed records |
| A8 | Plan budgets | Planning budgets |
| A9 | Develop a filing system | Developing a filing system |
| A10 | Manage a database | Managing a database |
| A11 | Help others learn new ideas | Helping others learn new ideas |
| A12 | Counsel someone who needs help | Counseling someone who needs help |
| A13 | Provide comfort and support to others | Providing comfort and support to others |
| A14 | Help people make important decisions | Helping people make important decisions |
| A15 | Participate in charity events | Participating in charity events |
| A16 | Create works of art | Creating works of art |
| A17 | Write short stories or novels | Writing short stories or novels |
| A18 | Write songs | Writing songs |
| A19 | Paint or draw | Painting or drawing |
| A20 | Design web pages or digital experiences | Designing web pages or digital experiences |
| A21 | Solve complex puzzles | Solving complex puzzles |
| A22 | Explain scientific concepts to others | Explaining scientific concepts to others |
| A23 | Design an experiment to test a hypothesis | Designing an experiment to test a hypothesis |
| A24 | Develop a computer program | Developing a computer program |
| A25 | Carry out research to answer a big question | Carrying out research to answer a big question |
| A26 | Read many books | Reading many books |
| A27 | Keep a diary or journal | Keeping a diary or journal |
| A28 | Speak fluently on any subject | Being articulate and well-spoken on many topics |
| A29 | Know many languages | Learning and knowing many languages |
| A30 | Edit a newspaper or publication | Editing a newspaper or publication |
| A31 | Construct new buildings | Constructing new buildings |
| A32 | Do woodworking | Doing woodworking |
| A33 | Work with tools and machinery | Working with tools and machinery |

**Note:** A28 was also reworded for clarity (both users found "speak fluently on any subject" confusing). A29 got a slight expansion for the same reason.

### Update 4: IPIP Items → Add "I" Prefix

**Problem:** Items like "Like order" and "Take charge" feel like fragments.

**Fix:** Add "I" prefix to all IPIP items that don't already start with a pronoun.

| ID | Current | Updated |
|----|---------|---------|
| D1 | Work hard | I work hard |
| D2 | Go straight for the goal | I go straight for the goal |
| D3 | Plunge into tasks with all my heart | I plunge into tasks with all my heart |
| D4 | Am not highly motivated to succeed | I am not highly motivated to succeed |
| D5 | Complete tasks successfully | I complete tasks successfully |
| D6 | Know how to get things done | I know how to get things done |
| D7 | Come up with good solutions | I come up with good solutions |
| D8 | Have little to contribute | I have little to contribute |
| D9 | Have a vivid imagination | I have a vivid imagination |
| D10 | Do not have a good imagination | I do not have a good imagination |
| D11 | Enjoy thinking about things | I enjoy thinking about things |
| D12 | Avoid philosophical discussions | I avoid philosophical discussions |
| D13 | See beauty in things that others might not notice | I see beauty in things that others might not notice |
| D14 | Do not like art | I do not like art |
| D15 | Like order | I like order |
| D16 | Am not bothered by disorder | I am not bothered by disorder |
| D17 | Get chores done right away | I get chores done right away |
| D18 | Waste my time | I waste my time |
| D19 | Take charge | I take charge |
| D20 | Keep in the background | I keep in the background |
| D21 | Love large parties | I love large parties |
| D22 | Prefer to be alone | I prefer to be alone |
| D23 | Am easy to satisfy | I am easy to satisfy |
| D24 | Have a sharp tongue | I have a sharp tongue |
| D25 | Become overwhelmed by events | I become overwhelmed by events |
| D26 | Remain calm under pressure | I remain calm under pressure |
| D27 | Am afraid to draw attention to myself | I am afraid to draw attention to myself |
| D28 | Am not embarrassed easily | I am not embarrassed easily |

### Update 5: Bold Negation in Reverse-Scored Items

**Problem:** Users miss the "not" in reverse-scored items and answer the opposite of what they mean.

**Fix:** When rendering items that contain negation words, wrap the negation in `<strong>` or `<em>` with a distinct style. The items to flag:

- C3: "Thinking is **not** my idea of fun"
- C4: "I would rather do something that requires little thought than something that is sure to challenge my thinking abilities" (this one isn't a simple negation — skip bold treatment, it's clear enough)
- D4: "I am **not** highly motivated to succeed"
- D8: "I have **little** to contribute"
- D10: "I do **not** have a good imagination"
- D14: "I do **not** like art"
- D16: "I am **not** bothered by disorder"
- D18: "I **waste** my time" (not a negation but easily misread — bold "waste")
- D28: "I am **not** embarrassed easily"

Implementation: In the items data, add a `boldWords` array for items that need emphasis. The rendering function wraps those words in `<strong class="neg-emphasis">` with a style like `font-weight: 700; text-decoration: underline; text-decoration-color: var(--flame); text-underline-offset: 3px;`

### Update 6: Fix Mobile Hover State Persistence

**Problem:** On mobile, after tapping a response option, the hover/active state persists on that button position when the next question appears, biasing the answer.

**Fix:** Two-part solution:

1. **CSS:** Add `@media (hover: none) { .option-btn:hover { background: initial; color: initial; } }` to suppress hover styles on touch devices entirely.
2. **JS:** When advancing to the next question, explicitly reset all option button states: remove any `.active`, `.selected`, or `:focus` states. Call `document.activeElement.blur()` after recording the answer.

### Update 7: NCS Item C2 Rewrite

**Problem:** "I like to have the responsibility of handling a situation that requires a lot of thinking" is clumsy.

**Fix:** "I like being responsible for situations that require serious thinking"

(C6 was flagged but Riley did not approve changing it — keep as-is.)

### Update 8: Content Fix — "12 months" → "9 months"

In `output-content.json`, update the `leapYearBridge` text:
- Change "A 12-month gap year experience" → "A 9-month gap year experience"

---

## Part 3: Migration Plan (order of operations)

### Phase 1: Set up the repo + Vercel
1. Initialize git repo from the existing project folder
2. Create the target file structure (empty files)
3. Connect to Vercel
4. Deploy the landing page to verify the pipeline works
5. Point `personality.startleapyear.com` to Vercel

### Phase 2: Split the monolith
1. Extract CSS into separate files (base.css, landing.css, quiz.css, reveal.css, results.css)
2. Extract JS modules (scoring.js, items.js, content.js, quiz.js, reveal.js, results.js)
3. Create the 4 HTML pages, each importing only what it needs
4. Verify each page works independently
5. Deploy and test the full flow

### Phase 3: Quiz UX updates
1. Reorder items by scale group (update items.js)
2. Update item text (gerund ORVIS, "I" prefix IPIP, bold negation, A28 rewrite, C2 rewrite)
3. Build transition screen component
4. Fix information hierarchy (stem small, item big)
5. Fix mobile hover state bug
6. Add Dweck context intro
7. Test full quiz flow on mobile

### Phase 4: Data pipeline
1. Set up Airtable base + table with the schema above
2. Build `/api/submit.js` Vercel Function (write to Airtable, return token)
3. Build `/api/results.js` Vercel Function (read from Airtable by token)
4. Wire up email capture → API submit → reveal page handoff
5. Wire up results page → API fetch → render
6. Set up email delivery (Airtable automation or Resend)
7. Test full end-to-end flow

### Phase 5: Results page redesign
- Separate effort — Riley is working with Gemini on the visual redesign
- When the redesigned results.html is ready, drop it into the repo
- It will call `/api/results.js` to fetch data, then render with the new design

---

## Files to Preserve

The following files from the current project should be kept as reference but are NOT part of the new architecture:

- `assessment.html` — The working MVP monolith (keep as backup)
- `direction-1-field-guide/` — Earlier design direction
- `direction-2-cartography/` — Earlier design direction
- `direction-3-awakening/` — Earlier design direction
- `card-explorations.html`, `card-v2.html`, `card-v3-illustrations.html` — Design explorations
- `results-page-for-redesign.html` — Gemini redesign reference
- `landing-page-*.html`, `results-page-*.html` — Earlier iterations

These can live in an `_archive/` folder in the repo.
