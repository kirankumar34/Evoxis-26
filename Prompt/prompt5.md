# EvoXis'26 — Participant-Only Registration Website
## Build Prompt for Coding Agents (Precision Spec — Execute Exactly As Written)

**Target audience for this file:** an autonomous or semi-autonomous coding agent (Claude Code, Cursor, etc.) operating directly on the existing EvoXis'26 repository.
**Goal of this file:** eliminate ambiguity. Every instruction below is either a hard constraint, an exact file/route target, or a testable condition. If something in the actual codebase doesn't match an assumption stated here, **stop and report the mismatch instead of guessing.**

---

## 0. HARD CONSTRAINTS (violating any of these = task failure, not a judgment call)

1. Do **not** rebuild, redesign, or rewrite the application. This is a surgical modification.
2. Do **not** introduce a new backend, new database, or new hosting architecture. The only backend is Google Apps Script. The only database is Google Sheets.
3. Do **not** replace `gas/Code.js` — modify it, don't recreate it.
4. Do **not** change the visual design, existing event cards, existing registration form UI, existing responsive layout, or existing event data.
5. Do **not** delete any Apps Script backend function that the future Committee/Admin website will need — only remove **frontend UI/routes**.
6. Do **not** implement the wristband QR system, food tokens, certificates, or the Committee/Admin website itself in this task. Design decisions must not block them later, but building them is explicitly out of scope.
7. Do **not** let a failed backend write show a success message to the user, ever.
8. Do **not** hardcode secrets, the Spreadsheet ID, or the QR secret into any frontend file.

---

## 1. EXISTING PRODUCTION FACTS (verify these against the real repo/account before proceeding — do not assume)

| Fact | Value |
|---|---|
| Spreadsheet name | `EvoXis26_Master_Database` |
| Spreadsheet ID | `1HRFhwmf-YbSHm5CJ3bc6y6QbEzf0MpYoyXpu1DB1vfo` |
| Owning Google account | `evoxis26enquiry@gmail.com` |
| Backend | Google Apps Script (`gas/Code.js`, `gas/appsscript.json`) |
| Frontend | React + Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Frontend → backend config | `VITE_APPS_SCRIPT_URL` (env var, read through the existing API/config layer — not hardcoded in components) |
| Event count | 16 events — Technical (`TE01`–`TE06`), Non-Technical (`NT01`–`NT06`), Special (`SP01`–`SP04`) |
| Event date | September 26, 2026 |
| Existing Apps Script functions to reuse | `doGet()`, `doPost()`, `handleRequest()`, `registerParticipant()`, `getRegistration()`, `generateRegistrationId()`, `generateQRToken()`, `getEventMaster()`, `validateQRCode()`, `checkEventRegistration()`, `markReceptionAttendance()`, `markEventAttendance()`, `updateParticipationStatus()`, `getEventParticipants()`, `getDashboardStats()`, `validateAdmin()` |

> If any function name above doesn't exist in the actual `gas/Code.js`, report the discrepancy — do not silently invent a replacement.

---

## 2. OBJECTIVE

Transform the current website (which contains both a participant flow and a Committee Portal) into a **participant-only registration website**. The Committee Portal will become a **separate website in a future task**, sharing the same Apps Script + Sheets backend.

**Resulting site scope — exactly these pages, nothing added, nothing else removed:**

```
/                     Home
/events               Events listing
/events/:id           Event details
/register             Registration form
/registration-success Registration success + QR
/qr  (or /my-registration)   Participant QR retrieval
```

---

## 3. REMOVE — exact target list

Remove from the frontend (routes, navigation entries, components, and any client-side auth/session logic that exists solely to support these):

- Committee Login page/route
- Admin Dashboard page/route
- Reception Scanner page/route
- Event Coordinator Dashboard page/route
- Committee Attendance Management page/route
- Any nav bar / footer / menu links pointing to the above
- Any role-based route guards that exist only to gate the above pages

**Do not remove:**
- Any Apps Script backend function listed in Section 1, even if it's currently only called by the pages being removed — the future admin site will call it.
- Any shared UI component (buttons, cards, layout, form primitives) that is also used by the participant-facing pages, even if it happens to also be used by a committee page. Check for shared usage before deleting a component file.

**Verification before deleting a file:** search the codebase for every import of a component/page before removing it. If a file is used only by a route being removed, delete it. If it's shared, keep it and only remove the route/page that referenced it.

---

## 4. REGISTRATION FLOW (must match exactly — this is the contract, not a suggestion)

```
Participant opens website
  → Selects event(s) from the 16-event list (data from getEventMaster(), not hardcoded)
  → Fills registration form
  → Frontend validates (required fields, email format, mobile format, ≥1 event selected)
  → Frontend POSTs to VITE_APPS_SCRIPT_URL → registerParticipant action
  → Apps Script: validate → LockService lock → duplicate check (email/mobile/eventId) →
    generateRegistrationId() → generateQRToken() →
    write Overall_Registration_Details →
    write category sheet(s) (Overall_Technical_Registration /
      Overall_NonTechnical_Registration / Special_Events_Registration) →
    write matching EVT_* sheet(s) →
    LockService release
  → Apps Script sends confirmation email ONLY after the Sheets write succeeded
  → Apps Script returns { success: true, registrationId, qrToken, ... }
  → Frontend shows Registration Successful page ONLY on success:true
  → If success:false or network failure → show:
    "Registration server is temporarily unavailable. Please try again."
    → NEVER show "Registration Successful" in this case.
```

### Registration ID
- Format: `EVOXIS26-00001`, `EVOXIS26-00002`, … (5-digit zero-padded sequence)
- Generated **server-side only**, via the existing `generateRegistrationId()`, protected by `LockService`.
- Never accept or trust a client-generated ID.

### QR token
- Format: `EVOXIS26:<secure-token>`
- Contains **only** an opaque secure token — never name, email, mobile, college, department, or any other PII.
- Generated via the existing `generateQRToken()`.
- Stored permanently in `Overall_Registration_Details` under `QR Token` so a future admin website can resolve it.

### Duplicate protection
- Match on: email + mobile + Event ID.
- If already registered for that event: return the existing registration, do not create a new row, do not generate a new QR, do not resend a confirmation email.
- Concurrency protected by `LockService` (100+ simultaneous users is the realistic load — this must actually hold up, not just work for a solo test).

---

## 5. REGISTRATION SUCCESS PAGE — exact content contract

```
## Registration Successful

Participant Name: <name>
Registration ID: <EVOXIS26-XXXXX>
Registered Events: <event names, resolved from Event IDs via getEventMaster()>
Event Date: September 26, 2026

[QR CODE IMAGE]

[View QR]  [Download QR]  [Download Registration Details]

"Please keep this QR code safe. The same QR will be used for reception
and event verification."
```

---

## 6. PARTICIPANT QR / MY-REGISTRATION PAGE

- Route: `/qr` or `/my-registration` (keep whichever already exists in the codebase; do not create a duplicate).
- Must **not** allow lookup by a bare Registration ID alone (guessable/enumerable).
- Required verification: Registration ID + email, **or** Registration ID + mobile, **or** a secure token link — use whichever mechanism already exists in the codebase; if none exists, implement Registration ID + email as the minimum.
- QR must be downloadable at a resolution usable for both mobile display and later printing.

---

## 7. ERROR HANDLING — every one of these must produce a distinct, user-visible message (never a silent failure and never a generic success)

| Condition | Required behavior |
|---|---|
| Network failure reaching Apps Script | "Registration server is temporarily unavailable. Please try again." |
| Apps Script returns `success:false` | Show the specific message from the response if present, else the generic message above |
| Duplicate registration detected | Show existing registration info, not an error — this is a valid, expected state |
| Invalid form input | Inline field-level validation messages, block submission |
| Selected event no longer open (`Registration Open = FALSE` in `Event_Master`) | "Registration for this event is currently closed." |
| Backend timeout | Same as network failure — never assume success on timeout |

---

## 8. ENVIRONMENT & SECURITY

- `.env`: `VITE_APPS_SCRIPT_URL` must point to the real, current Apps Script Web App deployment URL.
- `.env.example`: document `VITE_APP_TITLE`, `VITE_EVENT_DATE`, `VITE_APPS_SCRIPT_URL` with empty values, no secrets.
- Spreadsheet ID (`1HRFhwmf-YbSHm5CJ3bc6y6QbEzf0MpYoyXpu1DB1vfo`) and `QR_SECRET` live **only** in Apps Script Script Properties — confirm they do not appear anywhere in `src/`, `.env`, or any network response body sent to the browser.
- Local Storage may only hold transient UI state (e.g. form draft) — it must never be the thing that determines whether a registration "succeeded."

---

## 9. FUTURE-COMPATIBILITY REQUIREMENTS (design for these now, do not build them now)

- The QR token scheme, Registration ID scheme, and all Sheets column layouts must remain exactly as they are today, since a future separate Committee/Admin website will read this same data via the same Apps Script backend.
- Do not rename any existing sheet, column header, or Apps Script function signature listed in Section 1 unless fixing a proven bug — a rename would break the future admin site's integration before it's even built.

---

## 10. TESTING — run all of these against the real deployment before declaring done

1. **Registration** — submit a real test participant → row appears in `Overall_Registration_Details`.
2. **Technical event** — register for e.g. `TE01` → rows appear in `Overall_Technical_Registration` and `EVT_paper-presentation`, same Registration ID as #1.
3. **Non-technical event** — same check for e.g. `NT02` → `Overall_NonTechnical_Registration` + `EVT_indo-japanese-game`.
4. **QR** — confirm a QR is generated, scan it with a plain QR reader app, confirm the decoded content is only `EVOXIS26:<token>` — no PII visible.
5. **Duplicate** — submit the same participant/event again → no new row, no new Registration ID, no second email.
6. **Email** — confirm the confirmation email is sent only after step 1 actually succeeds (test by simulating a Sheets write failure if possible; at minimum verify the code path won't fire the email before the write completes).
7. **Committee routes removed** — confirm `/committee/*`, `/admin/*` (or whatever the actual removed paths were) return a 404 / redirect to home, not a broken page.
8. **Future admin compatibility** — confirm the QR Token value from step 1 is present and correct in `Overall_Registration_Details`, retrievable by a manual Apps Script call to `validateQRCode()`.

---

## 11. REQUIRED FINAL REPORT (produce this after implementation — do not skip)

```
FILES MODIFIED:
  - ...

COMPONENTS/ROUTES REMOVED:
  - ...

BACKEND FUNCTIONS REUSED (unmodified):
  - ...

BACKEND FUNCTIONS MODIFIED (and why):
  - ...

SHEETS USED:
  - ...

QR GENERATION FLOW:
  - ...

ENVIRONMENT VARIABLES REQUIRED:
  - ...

APPS SCRIPT DEPLOYMENT STATUS:
  - (already deployed / needs redeploy / new version required — state which)

TEST RESULTS (Section 10, item by item):
  1. ...
  2. ...
  ...

REMAINING MANUAL CONFIGURATION:
  - ...

DISCREPANCIES FOUND vs. THIS SPEC (Section 1 assumptions that didn't hold):
  - ...
```

Do not claim any item is done without having actually run the corresponding test in Section 10.
