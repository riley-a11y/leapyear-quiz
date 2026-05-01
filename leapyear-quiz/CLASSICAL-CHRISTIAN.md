# Classical Christian Webinar Landing Page

**Status: Live and shippable.** Page is functional with placeholder content. Fill in the data below before sending the link to parents.

---

## URLs

| URL | Status | Use |
|---|---|---|
| `https://leapyear-quiz.vercel.app/webinar` | ✅ **Live now** | The shareable URL today. |
| `https://webinar.startleapyear.com/` | ⏳ Cert provisioning | Clean URL once Vercel issues the SSL cert (likely overnight, can take longer). |

Both URLs serve the same page. Once `webinar.startleapyear.com` works, swap any forwarded links and call that the canonical URL.

---

## What's built

A multi-section parent webinar landing page targeting parents of classically-educated high school seniors (Classical Conversations homeschool families, Veritas / Regents / Hill Country Christian / Valor / Austin Classical School, etc.).

### Page sections (top to bottom)

1. **Nav** — LeapYear logo + Register button.
2. **Hero (split)** — Tagline · "For Parents of Classically Educated Seniors" (one Flame highlight on "Classically Educated") · subhead · Brunswick Green primary CTA · text-link to startleapyear.com. Right column: lazy-loaded video placeholder.
3. **What you'll walk away with** — Dark Night-themed section with three feature buckets (01 / 02 / 03 in Sandy Brown taglines).
4. **Who it's for** — Cream-themed prose, two paragraphs, with `highlight-sand` on the phrase "formation matters more than credentials."
5. **About your host** — Photo placeholder + Riley Simpson bio. "Stanford, Purdue, and Texas A&M" highlighted in Sandy Brown.
6. **Big quote** — Dominic Johnson testimonial, on a Night card with deep rounded corners. Body-medium-sized quote, not a giant pull-quote.
7. **Pick a date** — Three standalone date cards on cream, each with day eyebrow + date + time + Flame "Register →" Zoom button. Sub-CTA below for booking a 1:1 call instead.
8. **Final CTA** — Centered close: "Ready to explore what's next for your senior?" + supporting line + Brunswick Green primary CTA.
9. **Footer** — Minimal Night-themed copyright line.

### Conversion flow

Each "Register →" button on the date cards links to a Zoom registration URL (anonymous click, no upfront email capture on this page). Zoom captures the registration; we attribute via the dedicated **Lead Source** in Airtable for any cross-channel touches the parent has.

---

## Placeholders to fill in

These need real values before the link is shared with parents. All are inside `classical-christian.html`.

| Placeholder | What it is | Notes |
|---|---|---|
| `[VIDEO_URL]` | YouTube/Vimeo URL for the 3-min hero video | Edit the `data-video-url="..."` attribute on the hero media block |
| `[DAY_1]` `[DAY_2]` `[DAY_3]` | Day of week | e.g. "Tuesday" |
| `[DATE_1]` `[DATE_2]` `[DATE_3]` | Full date | e.g. "May 13, 2026" |
| `[TIME_1]` `[TIME_2]` `[TIME_3]` | Time + timezone | e.g. "7:00 PM CT" |
| `[ZOOM_URL_1..3]` | Zoom registration URLs | Paste the URL from each Zoom session's registration link |
| `[CAL_LINK_PLACEHOLDER]` | Riley's booking link | Whatever URL you use for 1:1 calls |
| `.cc-portrait` block | Riley's photo | Currently a Brunswick→Night gradient placeholder. Replace the `.cc-portrait` div with `<img src="<photo-url>" alt="Riley Simpson">` |

**To swap them in:** open a fresh Claude Code session, point it at `leapyear-quiz/classical-christian.html`, paste the values, and have it run find-replace + commit + push. ~5 minutes.

---

## Files in this project

```
leapyear-quiz/
├── classical-christian.html              # the live page
├── classical-christian.v1-approved.html  # snapshot of the version Riley approved during initial build (revert here if needed)
├── api/
│   └── classical-christian.js            # serverless endpoint, dormant — wired to Airtable for any future form-based capture
├── css/
│   └── webflow/                          # Webflow design system export (used by the page)
│       ├── normalize.css
│       ├── webflow.css
│       └── staging-startleapyear.webflow.css
└── vercel.json                           # routing — has both /webinar path rewrite + webinar.startleapyear.com host rewrite
```

To revert the live page to the approved snapshot:

```bash
cp leapyear-quiz/classical-christian.v1-approved.html leapyear-quiz/classical-christian.html
git add leapyear-quiz/classical-christian.html
git commit -m "Revert to approved v1 snapshot"
git push origin main
```

---

## Airtable

- **Base**: `app4NpJ7gQZvHpwGe`
- **Lead Source record**: `rec6xfROJTbVTbNFk` ("Classical Christian Webinar")
  - Type: Event
  - Status: Live

The API endpoint at `/api/classical-christian` exists but is dormant — the live page doesn't call it (parents go directly to Zoom for registration). It's pre-wired with the Lead Source ID, so if you later want to add a "not ready, keep me posted" form to the page, the backend is ready.

---

## What to expect tomorrow morning

1. Visit `https://webinar.startleapyear.com/`. If it loads, the cert provisioned overnight — the clean URL is now live in addition to the `leapyear-quiz.vercel.app` fallback. Swap to the clean URL in any forwarded emails.
2. If it still fails: open a Vercel support ticket. Tell them: "Cert provisioning stuck on `webinar.startleapyear.com`. DNS valid (CNAME → `<hash>.vercel-dns-017.com`), CAA empty, removed and re-added the domain. Please force re-provision." They have an internal button.

The `leapyear-quiz.vercel.app/webinar` URL works regardless and never expires — it's a permanent fallback.

---

## Iteration

The skill that built this page lives at `~/.claude/skills/leapyear-landing-page/`. Future webinars or campaign pages should start from that skill — it has the patterns, brand toolkit, and routing recipes documented.
