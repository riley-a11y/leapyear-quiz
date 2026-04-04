# LeapYear Assessment — V2 Ship Checklist

**Deadline: 6 PM today (March 30, 2026)**
**Goal: Live at quiz.startleapyear.com, ready for founding cohort + hot prospects to take it.**

Read `BUILD-SPEC.md` for the full original spec. This document covers what's changed and what needs to ship now.

---

## Priority 1: Bug Fixes (must ship)

### Tension Template Map Keys
Three keys in `TENSION_MAP` in `scoring-algorithm.js` were in the wrong alphabetical order. The `getTensionTemplate()` function sorts orientations alphabetically before lookup, but three map keys weren't alphabetized — so they silently fell through to the `action_vs_reflection` fallback.

**Already fixed in `src/scoring-algorithm.js`.** The corrected keys are:
```javascript
const TENSION_MAP = {
  'doing+thinking': 'action_vs_reflection',
  'doing+relating': 'output_vs_people',
  'doing+experiencing': 'structure_vs_freedom',
  'relating+thinking': 'ideas_vs_relationships',     // was 'thinking+relating'
  'experiencing+thinking': 'depth_vs_breadth',        // was 'thinking+experiencing'
  'experiencing+relating': 'community_vs_independence', // was 'relating+experiencing'
  'thinking+thinking': 'theory_vs_systems',
  'doing+doing': 'vision_vs_execution',
  'relating+relating': 'depth_vs_breadth_relational',
  'experiencing+experiencing': 'inner_vs_outer'
};
```

**Action:** Pull the updated `src/scoring-algorithm.js` and redeploy. If you copied the scoring logic into the app, update it there too.

---

## Priority 2: Updated Content (must ship)

The `src/output-content.json` file has been updated with several changes. **Pull the full updated file.** Key changes:

1. **New `sectionIntros` object** — short intro paragraphs for each results section (pairing, coreType, secondaryType, tension, shadow, mindset, balanced, renaissance). Render each as an intro paragraph above its section.

2. **New `leapYearCTA` object** — replaces the old vague "we'd love to talk" with a clear coaching call CTA:
   ```json
   "leapYearCTA": {
     "headline": "Talk Through Your Results",
     "body": "Everyone who takes this assessment gets a free coaching call. We'll walk through your profile together, dig into what it means for you specifically, and talk about what we've learned about what your type needs in the early years of adulthood.",
     "buttonText": "Book Your Free Call",
     "buttonUrl": "CALENDLY_URL_HERE"
   }
   ```
   Render this as the final CTA block on the results page. Use the Flame button style. Riley will provide the actual Calendly URL — leave the placeholder for now.

3. **Mobilizer narrative** — changed "unsexy middle" to "unglamorous middle"

4. **Growth mindset closings rewritten** — all three (high, low, mixed) are tighter and less AI-sounding. The `sectionIntros.mindset` intro explains what growth mindset is before the closing text.

5. **Renaissance and Balanced section intros** — `sectionIntros.balanced` and `sectionIntros.renaissance` replace the one-liner flags. Render these as a callout/highlight block near the top of results when `isBalanced` or `isRenaissance` is true.

---

## Priority 3: Email Capture Gate (must ship)

**After the student completes all 85 questions and before they see results**, show an email capture screen:

- Heading: "Your results are ready."
- Body: "Enter your name and email to see your profile."
- Fields: First Name, Email (both required)
- Button: "See My Results" (Flame style)
- On submit: store the data (see below), then show results.

**Data storage for V1:** This can be simple. Options in order of preference:
1. POST to a serverless function (Netlify Function) that writes to Airtable, Google Sheets, or similar
2. POST to a webhook (Zapier, Make, etc.)
3. `mailto:` fallback or local storage if we're truly out of time

The key requirement is: **Riley needs to be able to see who took the quiz and what their results were before he gets on a coaching call with them.** So the submission should include: name, email, primary type, secondary type, all 8 archetype scores.

---

## Priority 4: Hosting & Subdomain (must ship)

- Deploy to **Netlify** (NOT Webflow — speed is the priority)
- Target subdomain: **quiz.startleapyear.com** — Riley will add a CNAME record pointing to the Netlify URL
- If DNS isn't set up yet, deploy to Netlify's default URL and Riley can point the subdomain later today
- Must be a live URL Charles can visit and take the quiz himself by 6 PM
- Use `netlify deploy --prod` or connect a GitHub repo — whatever's fastest

---

## Priority 5: Results Page Polish (nice to have today)

### Calendly Integration
Use the **popup widget** approach for the CTA button — it's cleaner than an inline embed and keeps the results page flowing:

```html
<!-- Add to <head> -->
<link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">
<script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async></script>
```

The CTA button (from `leapYearCTA.buttonText`) should trigger Calendly's popup on click:
```javascript
Calendly.initPopupWidget({
  url: 'https://calendly.com/riley-startleapyear/leapyear-student-interview-clone?hide_gdpr_banner=1&primary_color=dd5e32'
});
```

Style the CTA section as a full-width block with Dark Green (`#17322D`) or Night (`#071411`) background, Alabaster text, and a Flame (`#DD5E32`) button. Clear visual break from the narrative content above.

### Other Polish
- The **archetype scores bar chart** should be clean but secondary to the narrative
- Section intros should be styled slightly differently from the narrative text — lighter weight or smaller size, so they read as context-setting rather than part of the profile itself

---

## Priority 6: Landing Page (nice to have today)

Claude Code is already working on a new landing page. Key copy direction from Riley's conversation with Charles:

The landing page should frame the assessment as an invitation. Something like:
> So much of what we're about is helping you answer some really big questions. Taking the first step can be as simple as understanding yourself better. This assessment — built from our work with people at your stage of life — uncovers some of the core drivers behind how you show up in the world and how you make decisions. That knowledge is going to be really helpful as you're in this season of constantly discerning the right next step.

Keep it warm, brief, and direct. "Let's find out" button.

---

## NOT building today

- Individual result pages per pairing (56 pages at `/mobilizer-explorer` etc.) — that's V3. For today, results render client-side after the quiz.
- Email delivery of results with link — V3. For today, they see results immediately after email capture.
- Calendly embed on results page — V3 if URL isn't ready. Link to Calendly is fine.
- Application form rebuild — separate project entirely.

---

## Files Updated (pull these fresh)

| File | What changed |
|------|-------------|
| `src/scoring-algorithm.js` | TENSION_MAP keys fixed (3 keys reordered) |
| `src/output-content.json` | sectionIntros added, leapYearCTA added, growthMindsetClosings rewritten, Mobilizer "unsexy" fixed, leapYearBridge updated |
| `BUILD-SPEC.md` | Brand skill reference added, design direction updated with specific colors/fonts |
| `leapyear-brand-skill/SKILL.md` | New file — complete visual brand system |
