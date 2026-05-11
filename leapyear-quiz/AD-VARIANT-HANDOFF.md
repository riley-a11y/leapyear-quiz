# Ad-Variant Landing Page — Handoff

> **For the next Claude session.** Read this top-to-bottom plus [classical-christian.html](classical-christian.html) before you change anything. The existing page is in good shape and the new variant should reuse 85%+ of its patterns.

---

## What this is

Riley wants a **second landing page** to run paid ads against — same product (the LeapYear parent webinar), but a separate page so ad performance is measurable and the message can be tuned for paid traffic. The existing `classical-christian.html` page is the "organic / direct share" version targeting parents of classical Christian seniors. The new variant will broaden the audience and live as a sibling page on the same Vercel project.

---

## Decisions already made

| Decision | Value |
|---|---|
| **Audience** | Christian parents of high school **seniors AND juniors** (broader than the existing page's senior-only framing) |
| **Webinar dates** | Some ads will point to the existing 3 dates (May 16 / May 18 / May 20); some will point to new future dates Riley hasn't picked yet — the variant should make swapping date cards trivial |
| **Attribution** | **New, separate Airtable Lead Source** so paid traffic is measurable distinct from the existing "Classical Christian Webinar" source |
| **Structure** | New page file (not a replacement). Both pages coexist on main. |
| **Branding** | Reuse the existing design system 1:1 — same brand corner treatment, color tokens, typography classes, testimonial carousel, hero video pattern, sticky mobile CTA |

---

## Decisions still open (ask Riley)

1. **URL.** Three reasonable options:
   - **Path on existing host**: `webinar.startleapyear.com/parents` or `webinar.startleapyear.com/discover`
   - **Different path on leapyear-quiz.vercel.app**: `leapyear-quiz.vercel.app/parents`
   - **New subdomain**: `parents.startleapyear.com`

   Path-on-existing-host is the lowest-friction. Use that unless Riley says otherwise. Note: `webinar.startleapyear.com/` currently redirects to `/webinar` (see `vercel.json`) — you can add a new path freely.

2. **New webinar dates.** Riley hasn't picked them. Build the page with date placeholders ready to swap, just like the v1 originally did (`[DAY_X]` / `[DATE_X]` / `[TIME_X]` / `[ZOOM_URL_X]`).

3. **Headline / hero copy.** v1's headline is "Help your senior launch with clarity, confidence, and conviction." The variant should probably broaden to mention juniors too — Riley to provide copy or you ask for direction.

4. **Testimonials.** Same three for now? Or curate a different mix? v1 uses Dominic, Will Walker (parent), and an anonymous "Founding Cohort Member."

---

## Branching + file strategy

**Recommended:**

```bash
# From repo root
git checkout main
git pull origin main
# No new branch needed — the variant lives as a new file on main
```

Create the new page as a sibling:

```
leapyear-quiz/
├── classical-christian.html         # existing — DO NOT TOUCH
├── ads-webinar.html                 # new variant — your work
├── api/
│   ├── classical-christian.js       # existing endpoint (dormant)
│   └── ads-webinar.js               # new endpoint if needed (pre-wire to new Lead Source)
├── assets/                          # shared
├── vercel.json                      # add new rewrite for the new path
└── AD-VARIANT-HANDOFF.md            # this file
```

**Why no separate branch:** the variant is additive, not a fork. Both pages need to ship to production simultaneously. Branching would just add merge overhead. Vercel's preview deployments on PRs are the safety net if Riley wants to QA before sharing.

---

## Vercel routing

Add one rewrite to [vercel.json](vercel.json) when the URL is decided. For `/parents` on the existing host:

```json
{ "source": "/parents", "destination": "/ads-webinar.html" }
```

The existing host-root redirect (`webinar.startleapyear.com/` → `/webinar`) doesn't conflict — different source path.

If Riley picks a subdomain instead, follow the same pattern as the existing `webinar.startleapyear.com` host rewrite at the top of `vercel.json` (which uses a `has: host` matcher with a catch-all source).

---

## Airtable Lead Source — separate attribution

**Base**: `app4NpJ7gQZvHpwGe` (same as everything else)

**Existing source**: `rec6xfROJTbVTbNFk` — "Classical Christian Webinar" (Type: Event, Status: Live)

**Create a new source** in the Lead Sources table:
- Name: **"Parent Webinar — Paid Ads"** (or whatever fits Riley's CRM conventions — check his recent Lead Source names first)
- Type: **Campaign** (probably the right type for paid traffic — confirm in the table's existing options)
- Status: **Live**
- Owner / other fields: match the existing Classical Christian Webinar record

Use the Airtable MCP (`mcp__49e02266-*`) to:
1. `list_tables_for_base` on the LeapYear base to find the Lead Sources table ID
2. `get_table_schema` on that table to see required fields + select-option values
3. `create_records_for_table` to add the new source
4. Save the new record ID — wire it into the API endpoint

When you create the new endpoint at `api/ads-webinar.js`, mirror the existing `api/classical-christian.js` but swap in the new Lead Source ID.

**For now:** the front-end can ship without a backend form (the existing classical-christian page does — registration happens on Zoom directly). The endpoint is optional, only needed if Riley adds a "send me the replay" capture form or similar later.

---

## Patterns to reuse verbatim

These took real iteration to land — don't rebuild them, just lift them.

| Pattern | Where to copy from |
|---|---|
| **Hero video** (poster → click → lazy-load video) | `<div class="cc-hero-media">` block + the lazy-load JS block |
| **Brand corner treatment** (TL + BR rounded, opposites sharp) | `.cc-hero-media` CSS — applied to hero frame and testimonial cards |
| **Testimonial carousel** (horizontal scroll-snap + alternating corner cards + click-through dots + IntersectionObserver-driven active dot) | `.cc-testimonials-track` and below + the carousel JS |
| **Date cards** | `.cc-dates-grid` + `.cc-date-card` |
| **Sticky mobile CTA** | `.cc-sticky-cta` + its JS |
| **Color tokens** | `:root { --cc-night, --cc-alabaster, --cc-cream, --cc-brunswick, --cc-flame, --cc-sand }` |
| **Typography classes** | Webflow `text-h1`, `text-h2`, `text-lg`, `text-reg`, `highlight-flame`, `highlight-sand` from `css/webflow/staging-startleapyear.webflow.css` |
| **Social preview / OG meta** | The `<head>` block — only swap `og:title`, `og:description`, and `og:image` per variant |
| **The 308 redirect pattern** | `redirects: [...]` block in vercel.json — only needed if subdomain root needs to forward |

---

## What's likely to differ

Don't blindly copy these — re-think them for the ad audience:

1. **Headline** — broader to include juniors. Tighter to perform as ad-traffic hook (paid visitors have less patience than direct visitors).
2. **Hero subhead** — same.
3. **Eyebrow tag** — currently "A LIVE WEBINAR FOR CHRISTIAN PARENTS" — fine, probably keep.
4. **"Who it's for" section** — broaden the audience description (juniors + seniors, not just seniors).
5. **Testimonials selection** — same three for v1; reconsider once Riley has more parent quotes.
6. **Page tab title** — `<title>LeapYear — Parent Webinar</title>` is already generic enough to reuse, or pick a variant title.
7. **Social card image** — the existing `assets/social-preview.png` is fine if the messaging matches. New card if the headline diverges meaningfully.
8. **CTA copy** — currently "Save my seat." For paid traffic, sometimes "Reserve your spot" or "Pick a session" converts differently. Worth A/B testing later.
9. **Tracking** — add `data-cta` attributes (already a pattern on v1) so any analytics layer can distinguish which CTA fired. Consider adding a query-string-driven `utm_*` capture if Riley runs cross-platform ads — pass the UTM into the Airtable record on form submission.

---

## What's identical to v1 (do not touch)

- All `css/webflow/*` files — shared Webflow design system. If you change them, you change v1 too.
- `assets/riley-headshot.jpg`, `assets/tami-headshot.png`, all `assets/testimonial-*.png` — shared. Drop new variant-specific images alongside them with distinct names if needed (e.g., `assets/ads-hero-poster.jpg`).
- `vercel.json` rewrites and headers for the existing routes — only add to the array, don't reorder or modify existing entries.

---

## Suggested first session message

When Riley opens the new session, he should paste:

> "Read `leapyear-quiz/AD-VARIANT-HANDOFF.md` and skim `leapyear-quiz/classical-christian.html` to understand the existing page. Then help me build the ad-targeted variant. Start by asking me the open decisions (URL, dates, headline direction) before writing any code."

---

## Production state right now (as of handoff)

- **Live URL (v1)**: https://webinar.startleapyear.com/webinar
- **Latest deploy**: production, READY
- **Repo**: `riley-a11y/leapyear-quiz` on GitHub, main branch
- **Working tree**: clean, all changes committed and pushed
- **Pending v1 polish (optional, doesn't block ad variant)**:
  - Mobile poster cache flush (Riley still verifying)
  - Possible FAQ section
  - Possible "what happens after you register" reassurance block
  - Possible trust strip between hero and takeaways

The ad variant can be built without finishing any of those.
