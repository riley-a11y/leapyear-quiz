# LeapYear Application Form — PRD

> **For:** New session / new project repo. This is a self-contained brief.
> **Author context:** Riley Simpson, founder of LeapYear (9-month gap year program in Austin). Currently using JotForm for the program application; wants to replace it.
> **Reference project:** `riley-a11y/leapyear-quiz` (the LeapYear personality assessment). The application form should mirror its architecture, but as a long multi-page form rather than a Likert quiz.

---

## 1. Problem & Goal

**Problem.** The LeapYear application currently lives in JotForm. Two pain points:
1. **Editing is painful.** Question changes, branching, and styling are slow and clunky in JotForm's UI.
2. **No partial saves.** When a student submits the first page (contact capture to "start" the application), JotForm does **not** persist that data unless the entire form is finished. We lose leads who start but don't finish, and we have no way to follow up.

**Goal.** Build a custom application form, hosted on the LeapYear domain, that:
- **Saves every page** as the student fills it out (incl. the contact-capture first page — that should write to Airtable immediately so the student exists as a lead even if they bounce).
- Lets Riley edit questions/sections by editing a single JS file (no CMS, no admin UI — just code).
- Uses the **same Airtable + Vercel + Resend stack** as the personality quiz, so everything lives in one operational surface.
- Eventually replaces all JotForm lead-capture forms on the site (start with the application; pattern is reusable).

---

## 2. Reference Architecture (from `leapyear-quiz`)

The personality quiz already solves most of what we need. Mirror these patterns exactly where possible.

**Stack**
- **Hosting/deploy:** Vercel (static frontend + `/api/*` serverless functions). Repo is on GitHub; Vercel auto-deploys on push.
- **Data:** Airtable (People table + a domain-specific results table, linked via Person record).
- **Email:** Resend (transactional, from `rileysimpson@startleapyear.com`).
- **Frontend:** Vanilla HTML/CSS/JS, no framework, no build step. Multi-file split (`css/base.css` + per-page CSS, `js/` per-page modules).
- **Routing:** `vercel.json` rewrites pretty URLs (e.g. `/results/:token` → `results.html`).

**Patterns worth copying directly**
- **Save-as-you-go via sessionStorage.** The quiz writes `{ currentIndex, responses, shownTransitions, timestamp }` to `sessionStorage['ly_quiz_progress']` on every answer; reloads restore exact state; 2-hour TTL; cleared on submit. (`leapyear-quiz/js/quiz.js`)
- **Token-based results access.** Submit returns a 12-char nanoid token; email contains a link `/results/{token}`; results page calls `/api/results?token=…` to fetch. No login required.
- **Upsert by email in Airtable.** `/api/submit` looks up the People table by email (case-insensitive), updates if found / creates if new, attaches a `leadSource` linked record for attribution. We replicate this verbatim for the application.
- **Field IDs, not field names.** Airtable fields are referenced by their fld… IDs in the API code so renaming columns in Airtable doesn't break prod. Keep doing this.
- **Graceful degradation.** Submit always writes a local backup to `localStorage` before POSTing — if the API fails, the user still sees results.
- **Env vars:** `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, table IDs, `RESEND_API_KEY`, plus a per-form `LEAD_SOURCE_ID`. Set in Vercel project settings.

**What's different about the application vs. the quiz**
- Long-form free-text and structured answers, not Likert scales.
- Multiple pages/sections, not one-question-at-a-time.
- **Must save partial state to Airtable**, not just sessionStorage. JotForm's flaw is that "started but didn't finish" applicants disappear; we need them in Airtable from page 1.

---

## 3. Scope

### In scope (v1)
- One new Vercel project (or new pages within the existing repo — see §9) for the LeapYear program application.
- Multi-page application form, content sourced from the existing JotForm (Riley will export/share the question list).
- Server-persisted partial saves (Airtable upsert on every page advance).
- Resume-from-link flow (student gets a link to come back where they left off).
- Confirmation email on full submission via Resend.
- Airtable `Applications` table linked to the existing `People` table.

### Out of scope (v1)
- Admin UI for editing questions (questions live in a JS file).
- Payment / deposit collection.
- File uploads (transcripts, etc.) — defer to v2 unless trivial via Airtable attachments.
- Replacing the other site lead-capture forms (will reuse the pattern after v1 ships).

---

## 4. User Flow

```
Marketing site → /apply
   └─ Page 1: Contact capture (name, email, phone, grad year, parent info)
        └─ On "Continue" → POST /api/application/start
              · Upserts Person in Airtable (case-insensitive email match)
              · Creates Application row, status="in_progress", token=nanoid(12)
              · Sets sessionStorage with applicationId + token
              · Sends "pick up where you left off" email with /apply/resume/:token link
        └─ Page 2..N: Application questions, grouped by section
              · Save-as-you-go: every field change writes to sessionStorage
              · On "Continue" (page advance) → POST /api/application/save
                  · Patches the Application row in Airtable
                  · Updates lastSavedAt
        └─ Final page: Review + Submit
              · POST /api/application/submit
                  · Sets status="submitted", submittedAt=now
                  · Sends Riley a notification email (Resend)
                  · Sends applicant a confirmation email (Resend) with link to view their submission
              · Redirects to /apply/done
```

**Resume flow.** `/apply/resume/:token` → `/api/application/load?token=…` returns the saved record, hydrates the form, jumps to last completed page.

**Edge cases**
- Applicant returns from a different device/browser → resume link in email solves this.
- Applicant submits page 1 twice with same email → upsert (don't duplicate Person; reuse existing in-progress Application if `status=in_progress`).
- Submit retry / network failure → keep `localStorage` backup like the quiz does.
- Token expiry: don't auto-expire the application token. Leave it valid until submitted (then read-only).

---

## 5. Data Model (Airtable)

### People table (existing, reuse)
No schema changes. Application links to a Person record by ID. On `/api/application/start`, do the same case-insensitive email lookup the quiz already does.

### Applications table (new)
| Field | Type | Notes |
|---|---|---|
| Token | Single-line text | nanoid(12), primary lookup key |
| Person | Linked record → People | Single record |
| Status | Single select | `in_progress`, `submitted`, `withdrawn` |
| Lead Source | Linked record → Lead Sources | Same pattern as quiz; new "Application" lead source ID |
| Started At | Created time | |
| Last Saved At | Date/time | Updated on every `/save` call |
| Submitted At | Date/time | Set by `/submit` |
| Last Page Index | Number | For resume |
| Responses (JSON) | Long text | Full response object as JSON string — single source of truth, easy to evolve question set without schema churn |
| (Plus flat columns for high-value fields) | — | First name, last name, grad year, phone, parent email, etc. — denormalized so Riley can sort/filter in Airtable without parsing JSON |

**Why JSON + flat columns?** Reading the quiz code, every Airtable field has a hardcoded fld… ID. If we put every application question in its own column, every question edit becomes an Airtable schema change + code change. Storing the full response set as JSON keeps the form editable from one JS file; the flat columns exist purely for Riley's Airtable views.

---

## 6. API Surface

All under `/api/application/*`. Mirror the structure of `leapyear-quiz/api/submit.js` (Airtable REST, no SDK, manual fetch + field IDs).

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/application/start` | POST | Page-1 submit. Upsert Person, create Application row, return `{ token, applicationId }`, send resume-link email. |
| `/api/application/save` | POST | Body: `{ token, pageIndex, responses }`. Patch Application row, update `Last Saved At`. Return `{ ok: true }`. |
| `/api/application/load` | GET | Query: `?token=…`. Return saved Application + last page index for resume. |
| `/api/application/submit` | POST | Body: `{ token }`. Mark `submitted`, send notification + confirmation emails. |

All endpoints: `Cache-Control: no-store` (matches `vercel.json` pattern).

---

## 7. Frontend Structure

Mirror the quiz's file layout. Single-page-app feel via screen switching, no router.

```
apply.html              # shell — section/page containers, all hidden except active
css/
  base.css              # reuse from main site if shared, otherwise duplicate
  apply.css             # form styling, page transitions
js/
  apply-questions.js    # SOURCE OF TRUTH for the question set — edit this file to change the form
  apply.js              # page navigation, save-as-you-go, sessionStorage, API calls
  apply-validate.js     # field-level validation
```

**`apply-questions.js` shape** (designed for easy editing):
```js
export const PAGES = [
  {
    id: 'contact',
    title: 'Tell us who you are',
    fields: [
      { id: 'firstName', label: 'First name', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'gradYear', label: 'High school graduation year', type: 'number', required: true },
      // ...
    ],
  },
  {
    id: 'about-you',
    title: 'About you',
    fields: [
      { id: 'whyLeapYear', label: 'Why are you considering a gap year?', type: 'textarea', maxLength: 1000 },
      // ...
    ],
  },
  // ...
];
```

Field types to support v1: `text`, `email`, `tel`, `number`, `textarea`, `select`, `radio`, `checkbox`, `date`. (No file uploads in v1.)

**Save-as-you-go behavior** (lifted from `js/quiz.js`):
- Every field change → debounced (500ms) write to `sessionStorage['ly_app_progress']`.
- Every "Continue" click → POST `/api/application/save` (await before advancing).
- On page load with `?token=…` → fetch `/api/application/load`, hydrate, jump to saved page.
- On page load without token but with sessionStorage → restore in-memory, but server is still source of truth once they hit Continue.

---

## 8. Email Templates (Resend)

Reuse the quiz's dark/branded template style (`api/submit.js` has the HTML).

1. **"Pick up where you left off"** — sent from `/api/application/start`. Subject: *"You started your LeapYear application — here's your link to continue"*. Body: friendly note + resume link `/apply/resume/{token}`.
2. **Applicant confirmation** — sent from `/api/application/submit`. Subject: *"We got your application, {firstName}"*. Body: "We'll be in touch within X days," plus link to view their submitted answers.
3. **Riley notification** — sent from `/api/application/submit` to `rileysimpson@startleapyear.com`. Subject: *"New application: {firstName} {lastName}"*. Body: summary fields + link to the Airtable record.

---

## 9. Repo / Deploy Decision

Two options — Riley to choose:

**A. New repo, new Vercel project.** Cleaner separation. `apply.startleapyear.com` subdomain. Recommended if the application is a long-lived standalone product.

**B. Add to existing `leapyear-quiz` repo.** New `/apply` routes + new `/api/application/*` functions in the same Vercel project. Reuses env vars, lead-source patterns, and CSS base. Recommended if Riley wants a single place to manage all lead-capture forms.

**Recommendation: B.** The `leapyear-quiz` repo is already operating as the de facto "lead capture surface" — it has `/faithdriven`, `/brentwood`, plus the quiz itself. Adding `/apply` keeps env vars, Airtable wiring, and email templates in one place. Rename the repo to something like `leapyear-web` later if it grows.

---

## 10. Open Questions for Riley

1. **Question list.** Can you export the current JotForm questions (or just paste them)? Most efficient: a doc with each section + each question + field type + whether required.
2. **Branching.** Does the current application have any conditional logic (e.g. "if student selects X, show question Y")? If yes, list the rules.
3. **File uploads.** Do you collect transcripts, recommendations, or other files? If yes, deferring to v2 is fine — confirm.
4. **Notifications.** Where should Riley's "new application" notification go? Just email, or also Slack / something else?
5. **Domain.** `apply.startleapyear.com`? `startleapyear.com/apply`? Affects deploy decision in §9.
6. **Lead source.** Create a new Airtable Lead Source record "Application" and grab its ID for the `APPLICATION_LEAD_SOURCE_ID` env var.
7. **Other JotForms to migrate.** List them so we can plan the v2 pattern (likely: shared `<form-page>` component + per-form `questions.js`).

---

## 11. Build Plan (suggested)

1. **Scaffold.** Add `apply.html`, `js/apply.js`, `js/apply-questions.js`, `css/apply.css` to existing repo. Stub out 2 pages.
2. **Airtable.** Create `Applications` table with the schema in §5. Note field IDs.
3. **API: start + save + load.** Build the three endpoints, mirroring `api/submit.js` structure (manual Airtable REST, field IDs).
4. **Frontend: navigation + save-as-you-go.** Get the page transitions, sessionStorage persistence, and `/save` calls working with stub questions.
5. **Resume flow.** `/apply/resume/:token` rewrite in `vercel.json` + load endpoint wiring.
6. **Real questions.** Drop the actual JotForm question set into `apply-questions.js`.
7. **Submit + emails.** `/submit` endpoint, three Resend templates.
8. **QA.** Test partial save (close tab on page 1, confirm Airtable row exists), resume-from-email, full submit, duplicate-email handling.
9. **DNS + cutover.** Point domain, redirect old JotForm URL, monitor.

---

## 12. Success Criteria

- A student who fills out page 1 and closes the tab appears in Airtable as an `in_progress` Application within 5 seconds.
- That student can click the resume-link email on any device and continue from the page they left.
- Riley can change a question by editing `apply-questions.js`, committing, and pushing — no Airtable schema change needed.
- Full submissions trigger both applicant confirmation and Riley notification emails.
- Zero JotForm dependency.
