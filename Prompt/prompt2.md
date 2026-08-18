# EVOXIS'26 — REGISTRATION, NOTIFICATION, QR & ATTENDANCE SYSTEM
### (Enhanced Specification — Architecture Unchanged)

> This document is the original EvoXis'26 registration/QR/attendance system prompt with concrete, project-specific detail filled in — the real 16-event list, sheet header rows, ID schemes, config keys, and API contracts. **No architectural decision from the original spec has been changed**: Google Apps Script + Google Sheets remain the backend/database, the existing React/Vite frontend is preserved and extended, and the registration → QR → attendance flow is identical to the original design.

You are working on an existing EvoXis'26 event/symposium website.

The website UI and existing event pages are already developed. DO NOT unnecessarily redesign or rewrite the existing website.

Your task is to upgrade the existing website into a complete registration, notification, QR-code and event-attendance management system using Google Sheets as the central data store.

The system must be production-ready, reliable, secure, mobile-responsive and capable of handling 100+ simultaneous users.

---

## 1. CORE ARCHITECTURE

**Frontend:**
- Existing EvoXis'26 website — React + Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React icons
- Hosted on Cloudflare Pages (CDN-first, static build)
- Preserve the existing technology stack wherever possible — do not migrate the project unnecessarily

**Backend/API:**
- Google Apps Script Web App as the primary backend/API layer
- Google Apps Script handles registration processing, unique registration IDs, QR generation data, notifications, attendance updates and sheet operations
- Deployed as a Web App (`doGet` / `doPost`) with a stable deployment URL that the frontend calls via `fetch`

**Database:**
- Google Sheets (single spreadsheet, multiple tabs — see Section 2)

**Notifications:** Email, SMS, WhatsApp
**QR:** One secure, unique QR per successful registration (token only — no PII encoded)

> Assumption: the Apps Script Web App URL will be stored as an environment variable at build time (e.g. `VITE_APPS_SCRIPT_URL`) rather than hardcoded in the frontend source, so it can be rotated without a redeploy of secrets.

---

## 2. GOOGLE SHEETS STRUCTURE

**Spreadsheet name:** `EvoXis26_Master_Database`

| # | Sheet (tab) name | Purpose |
|---|---|---|
| 1 | `Overall_Registration_Details` | Master record — one row per participant |
| 2 | `Overall_Technical_Registration` | One row per (participant × technical event) |
| 3 | `Overall_NonTechnical_Registration` | One row per (participant × non-technical event) |
| 4 | `Special_Events_Registration` | One row per (participant × special event) |
| 5 | `EVT_<slug>` (×16) | One sheet per individual event — auto-created/maintained from `Event_Master` |
| 6 | `Attendance_Log` | Append-only log of every attendance action |
| 7 | `Notification_Log` | Append-only log of every notification attempt |
| 8 | `Event_Master` | Configuration source of truth for all 16 events |
| 9 | `Configuration` | System-wide key/value config (non-secret) |

The system automatically organizes registration information into the appropriate sheets based on the `Event_Master` category field — no event-specific code branching in Apps Script.

### 2.1 Event ID scheme (feeds Event_Master and QR validation)

Prefix by category, 2-digit sequence:

| Category | Prefix | Range |
|---|---|---|
| Technical | `TE` | `TE01`–`TE06` |
| Non-Technical | `NT` | `NT01`–`NT06` |
| Special | `SP` | `SP01`–`SP04` |

### 2.2 Event_Master — pre-filled with the actual EvoXis'26 event list

> Assumption: Date, Time, Venue, and Max Participants are placeholders — the committee fills these in via the sheet, not via code, per Section 29.

| Event ID | Event Name | Category | Type | Venue | Date | Start Time | End Time | Max Participants | Reg Open |
|---|---|---|---|---|---|---|---|---|---|
| TE01 | Paper Presentation | Technical | Individual/Team | TBD | TBD | TBD | TBD | TBD | TRUE |
| TE02 | Business Battle | Technical | Team | TBD | TBD | TBD | TBD | TBD | TRUE |
| TE03 | Mind Sparks | Technical | Individual | TBD | TBD | TBD | TBD | TBD | TRUE |
| TE04 | EditoMania | Technical | Individual | TBD | TBD | TBD | TBD | TBD | TRUE |
| TE05 | Lego Build with AI | Technical | Team | TBD | TBD | TBD | TBD | TBD | TRUE |
| TE06 | Cyber Investigation | Technical | Team | TBD | TBD | TBD | TBD | TBD | TRUE |
| NT01 | Start Music | Non-Technical | Individual | TBD | TBD | TBD | TBD | TBD | TRUE |
| NT02 | Indo Japanese Game | Non-Technical | Team | TBD | TBD | TBD | TBD | TBD | TRUE |
| NT03 | IPL Auction | Non-Technical | Team | TBD | TBD | TBD | TBD | TBD | TRUE |
| NT04 | Reel Rush | Non-Technical | Individual/Team | TBD | TBD | TBD | TBD | TBD | TRUE |
| NT05 | Squid Game | Non-Technical | Individual | TBD | TBD | TBD | TBD | TBD | TRUE |
| NT06 | Clash of Talent | Non-Technical | Individual | TBD | TBD | TBD | TBD | TBD | TRUE |
| SP01 | Box Cricket | Special | Team | TBD | TBD | TBD | TBD | TBD | TRUE |
| SP02 | Football | Special | Team | TBD | TBD | TBD | TBD | TBD | TRUE |
| SP03 | Fashion Walk | Special | Individual/Team | TBD | TBD | TBD | TBD | TBD | TRUE |
| SP04 | E-Sports | Special | Individual/Team | TBD | TBD | TBD | TBD | TBD | TRUE |

Additional `Event_Master` columns (per original spec, unchanged): `WhatsApp Notification Enabled`, `SMS Notification Enabled`, `Email Notification Enabled`, `Reminder Enabled`.

The backend dynamically creates/reads participant lists based on Event ID — no hardcoded per-event logic anywhere in Apps Script.

---

## 3. OVERALL REGISTRATION DETAILS — exact header row

`Overall_Registration_Details` columns, left to right:

```
Registration ID | Registration Date | Registration Time | Participant Name | Email |
Mobile Number | College/Institution | Department | Year | Gender (if collected) |
Registration Type | Selected Events (comma-separated Event IDs) | Total Events |
Total Amount (if applicable) | Payment Status (if applicable) | QR Token | QR Status |
Email Status | SMS Status | WhatsApp Status | Overall Attendance Status | Registration Status
```

**Registration ID format:** `EVOXIS26-00001`, `EVOXIS26-00002`, … — zero-padded 5-digit sequence, generated server-side only (never trust a client-supplied ID). Sequence is maintained atomically via `LockService` reading the last-used number from `Configuration`.

---

## 4. TECHNICAL REGISTRATION — exact header row

`Overall_Technical_Registration` columns:

```
Registration ID | Participant Name | Email | Mobile | College | Department |
Event ID | Event Name | Registration Date | QR Token | Attendance Status | Participation Status
```

A participant registering for multiple technical events (e.g. `TE01` and `TE05`) gets **two rows** here — one per event — never an overwrite. Same pattern applies identically to Non-Technical (Section 5) and Special (Section 6).

---

## 5. NON-TECHNICAL REGISTRATION — exact header row

`Overall_NonTechnical_Registration` columns:

```
Registration ID | Participant Name | Email | Mobile | College | Department |
Event ID | Event Name | Registration Date | QR Token | Attendance Status | Participation Status
```

---

## 6. SPECIAL EVENTS — exact header row

`Special_Events_Registration` columns (identical shape, kept as its own sheet per the original architecture so Box Cricket / Football / Fashion Walk / E-Sports can carry special fields like team roster size or jersey number if the committee adds them later without touching Technical/Non-Technical sheets):

```
Registration ID | Participant Name | Email | Mobile | College | Department |
Event ID | Event Name | Registration Date | QR Token | Attendance Status | Participation Status
```

The event type is driven entirely by the `Category` column in `Event_Master` — never hardcoded.

---

## 7. INDIVIDUAL EVENT PARTICIPANT LISTS

One sheet per event, auto-named `EVT_<slug>` from `Event_Master`:

| Event ID | Sheet name |
|---|---|
| TE01 | `EVT_paper-presentation` |
| TE02 | `EVT_business-battle` |
| TE03 | `EVT_mind-sparks` |
| TE04 | `EVT_editomania` |
| TE05 | `EVT_lego-build-with-ai` |
| TE06 | `EVT_cyber-investigation` |
| NT01 | `EVT_start-music` |
| NT02 | `EVT_indo-japanese-game` |
| NT03 | `EVT_ipl-auction` |
| NT04 | `EVT_reel-rush` |
| NT05 | `EVT_squid-game` |
| NT06 | `EVT_clash-of-talent` |
| SP01 | `EVT_box-cricket` |
| SP02 | `EVT_football` |
| SP03 | `EVT_fashion-walk` |
| SP04 | `EVT_e-sports` |

Columns match Section 4/5/6 (minus the redundant category-sheet duplication). The backend creates each `EVT_*` sheet on first registration for that event if it doesn't already exist — driven purely by `Event_Master`, no per-event code.

---

## 8. DUPLICATE REGISTRATION PROTECTION

Unchanged from the original spec. Duplicate-detection keys: **Registration ID, Email, Mobile Number, Event ID**.

Before creating a registration:
1. Check whether the participant (by email or mobile) is already registered for the selected Event ID.
2. If already registered, return the existing registration record — do not create a new row, do not resend confirmations, do not regenerate a QR.
3. Wrap the check-then-write in `LockService.getScriptLock()` to close the race-condition window when two submissions land within the same second (a realistic risk at 100+ concurrent users hitting "Register" around a deadline).

---

## 9. REGISTRATION FLOW

```
Participant
  → Select Event(s)
  → Fill Registration Form
  → Client-side validation (required fields, email/mobile format)
  → Submit (POST to Apps Script Web App)
  → Apps Script: validateRegistration()
  → Apps Script: LockService acquire
  → Apps Script: duplicate check (Section 8)
  → Apps Script: generateRegistrationId()
  → Write row(s) to Overall_Registration_Details + category sheet + EVT_<slug>
  → Apps Script: LockService release
  → Apps Script: createQRToken() + QR payload
  → Apps Script: sendRegistrationEmail() / sendSMS() / sendWhatsApp() (async where the provider allows)
  → Apps Script: logNotification() for each channel
  → Response JSON returned to frontend
  → Frontend shows "Registration Successful" ONLY after a success response
  → Participant views/downloads QR
```

The participant must **not** see "Registration Successful" until the Apps Script response confirms the Sheets write succeeded.

---

## 10. QR CODE SYSTEM

QR payload format: `EVOXIS26:<secure-token>`

**Token generation:** HMAC-SHA256 of the Registration ID using a server-side secret stored in Apps Script Script Properties (`QR_SECRET`), base64url-encoded, truncated to a fixed length. This means:
- The QR itself carries no participant PII (name, mobile, email, college) — only a token.
- The token cannot be forged without `QR_SECRET`, which never leaves the Apps Script backend.
- `validateQRCode()` recomputes the HMAC from the Registration ID looked up via the token and compares — rejecting tampered or guessed tokens.

The `QR Token` column in `Overall_Registration_Details` (and every category sheet) stores this same token so any sheet can be used to resolve a scan.

---

## 11. QR CODE AT RECEPTION DESK

Unchanged from original spec — `Reception Scanner` interface at `/committee/reception-scanner`:

1. Camera permission → scan → `validateQRCode()` lookup.
2. Display: Participant Name, Registration ID, College, Department, Registered Events (resolved from Event IDs → `Event_Master` names), Overall Registration Status.
3. Staff manually clicks **CONFIRM & MARK PRESENT** — scanning alone never auto-marks attendance.
4. On confirm: update `Overall Attendance Status` in `Overall_Registration_Details`, append a row to `Attendance_Log` with a `Reception` desk identifier.

---

## 12. EVENT-SPECIFIC QR ATTENDANCE

Unchanged — the same QR/token works at every one of the 16 event desks. Worked example using the real events:

```
Participant registered for: TE01 (Paper Presentation), NT05 (Squid Game), SP02 (Football)

At the Paper Presentation desk (Event Desk Mode = TE01):
  Scan QR → checkEventRegistration(token, "TE01") → registered=true
  → "Registered for Paper Presentation" → staff confirms → markEventAttendance()

Later at the Football desk (Event Desk Mode = SP02):
  Scan same QR → checkEventRegistration(token, "SP02") → registered=true
  → staff confirms → markEventAttendance()

If scanned at the Squid Game desk for an event the participant did NOT register for
(e.g. NT02 - Indo Japanese Game):
  checkEventRegistration(token, "NT02") → registered=false
  → "NOT REGISTERED FOR THIS EVENT" — attendance is blocked
```

---

## 13. EVENT ATTENDANCE VALIDATION

Unchanged — validation order performed by `checkEventRegistration()` / `markEventAttendance()`:

1. QR token exists.
2. Registration exists.
3. Registration is valid (not cancelled).
4. Participant is registered for the currently-selected Event ID (desk mode).
5. Participant not already marked present for that specific Event ID.

States surfaced to the scanner UI: `NOT REGISTERED FOR THIS EVENT` / `ALREADY MARKED PRESENT` (with prior timestamp) / `REGISTERED — READY FOR CONFIRMATION` (enables the confirm button).

---

## 14. ATTENDANCE LOG — exact header row

`Attendance_Log` columns:

```
Attendance ID | Registration ID | Participant Name | Event ID | Event Name | Event Type |
Attendance Date | Attendance Time | Attendance Location/Desk | Attendance Status |
Participation Status | Verified By | QR Token | Scan Timestamp
```

Append-only — historical records are never overwritten, including for the reception-level "overall" check-in (`Event ID` = `RECEPTION` for that special case).

---

## 15. PARTICIPATION STATUS

Configurable status values (stored per Event ID row, editable by coordinators via dashboard or directly in the `EVT_<slug>` sheet): `Registered`, `Present`, `Participated`, `Absent`, `Disqualified`, `Cancelled`.

---

## 16–20. NOTIFICATIONS (EMAIL / SMS / WHATSAPP / REMINDER / LOG)

Architecture unchanged. Concrete additions:

**Email** — embed the QR as an inline image (Apps Script `MailApp`/`GmailApp` with `inlineImages`), subject line pattern: `EvoXis'26 Registration Confirmed — <Registration ID>`.

**SMS** — transactional provider (e.g. an India-compliant DLT-registered SMS gateway); credentials stored only in Apps Script `PropertiesService`, never in frontend code.

**WhatsApp** — official WhatsApp Business API (Cloud API) provider only; approved template message, variables: `{{participant_name}}`, `{{registration_id}}`, `{{event_list}}`, `{{event_date}}`.

**Reminder** — a time-driven Apps Script trigger (daily, e.g. 8:00 AM) running `processScheduledReminders()`, which for every row where `Event Date - today == 1 day` and `Reminder Sent != TRUE` sends the reminder and flips a `Reminder Sent` flag to prevent duplicates.

`Notification_Log` exact header row:

```
Notification ID | Registration ID | Participant | Event ID | Notification Type | Channel |
Recipient | Message Type | Sent Date | Sent Time | Status | Provider Response | Error Message | Retry Count
```

---

## 21. REGISTRATION COMMITTEE DASHBOARD

`/committee/dashboard` — unchanged scope, with the event filter dropdown populated dynamically from `Event_Master` (all 16 real events, grouped by category: Technical / Non-Technical / Special) rather than a hardcoded list:

```
Select Event:
[ Technical ▾ ] → Paper Presentation, Business Battle, Mind Sparks, EditoMania,
                   Lego Build with AI, Cyber Investigation
[ Non-Technical ▾ ] → Start Music, Indo Japanese Game, IPL Auction, Reel Rush,
                        Squid Game, Clash of Talent
[ Special ▾ ] → Box Cricket, Football, Fashion Walk, E-Sports
```

Per-event summary card: Total Registered / Present / Absent / Participated, pulled live from the relevant `EVT_<slug>` sheet.

---

## 22–23. QR SCANNER INTERFACE & EVENT DESK MODE

Unchanged. Desk-mode dropdown is populated from the same 16-event `Event_Master` list as Section 21. Color coding: **GREEN** valid, **RED** invalid/not registered, **YELLOW** already checked in.

---

## 24. SECURITY

Unchanged, restated as a checklist:

- [ ] Spreadsheet ID, `QR_SECRET`, SMS/WhatsApp/Email credentials live only in Apps Script `PropertiesService` — never in frontend bundle or committed to GitHub.
- [ ] Registration and attendance writes are always server-validated against Sheets data — the frontend never determines success/failure on its own.
- [ ] Admin/committee routes (`/committee/*`, `/admin/*`) require authentication and are excluded from public navigation and sitemap.
- [ ] Rate limiting on the registration endpoint (e.g. simple per-IP/time-window counter in `PropertiesService` or `CacheService`) to blunt accidental multi-submit storms at 100+ concurrent users.
- [ ] CORS restricted to the production domain in the Apps Script Web App response headers.

---

## 25. GOOGLE SHEETS DATA DESIGN

Unchanged relational model, illustrated with a real participant:

```
EVOXIS26-00025
  Participant: Priya R.
  Registered Events: TE01 (Paper Presentation), NT05 (Squid Game), SP02 (Football)
  Attendance:
    TE01 → Present
    NT05 → Present
    SP02 → Absent
```

---

## 26. ERROR HANDLING

Unchanged UX-level states; message copy tailored to this project:

- Registration: `"Submitting registration..."` → `"Registration confirmed — EVOXIS26-00025"` / `"Registration could not be completed. Please try again."`
- Scanning: `"Checking registration..."` → `"Registration verified."` / `"Invalid or unrecognized QR code."` / `"Not registered for <Event Name>."` / `"Attendance already recorded at <time>."` / `"Unable to connect to the registration server. Please try again."`

---

## 27. PERFORMANCE

Unchanged targets (100+ simultaneous users) with concrete tactics:

- Static frontend served from Cloudflare Pages CDN — no per-visitor server compute for browsing.
- `Event_Master` fetched once per session and cached client-side (e.g. in memory / `sessionStorage` reference, not `localStorage` as source of truth) to avoid a Sheets read on every page view.
- Batch reads (`getDataRange().getValues()` once per request) rather than cell-by-cell Sheets API calls inside Apps Script.
- `LockService` scoped tightly (only around the ID-generation + duplicate-check + write) so it isn't a bottleneck under load.

---

## 28. GOOGLE APPS SCRIPT IMPLEMENTATION — function contracts

Same function set as the original spec, with request/response shape now specified:

```js
// doPost(e) routes on e.parameter.action

registerParticipant(payload)
// payload: { name, email, mobile, college, department, year, gender?, eventIds: ["TE01","NT05"] }
// → { success: true, registrationId: "EVOXIS26-00025", qrToken: "..." }

getRegistration({ registrationId, email })
// → { success: true, registration: {...}, events: [{eventId, eventName, attendanceStatus}, ...] }

validateQRCode({ qrToken })
// → { success: true, registrationId, participantName, college, department, events: [...] }

checkEventRegistration({ qrToken, eventId })
// → { success: true, registered: true|false, alreadyPresent: true|false, participant: {...} }

markReceptionAttendance({ qrToken, verifiedBy })
// → { success: true, timestamp }

markEventAttendance({ qrToken, eventId, verifiedBy })
// → { success: true, timestamp }

getEventParticipants({ eventId })
// → { success: true, participants: [...] }   // committee dashboard use

sendRegistrationEmail / sendSMS / sendWhatsApp / sendEventReminder(registrationId)
// → internal, logged to Notification_Log

processScheduledReminders()
// → time-driven trigger entry point, no external caller

generateRegistrationId()
// → internal, LockService-protected

validateAdmin({ username, passwordHash })
// → { success: true, role: "SUPER_ADMIN" | "REGISTRATION_COMMITTEE" | "EVENT_COORDINATOR" }
```

Standard success/error envelope for every endpoint:

```json
{ "success": true, "data": { } }
{ "success": false, "errorCode": "NOT_REGISTERED_FOR_EVENT", "message": "Participant is not registered for this event." }
```

---

## 29. CONFIGURATION — concrete key list

`Configuration` sheet (non-secret, committee-editable) key/value pairs:

```
LAST_REGISTRATION_SEQUENCE
EVENT_DATE_START
EVENT_DATE_END
REMINDER_SEND_TIME
ORGANIZER_CONTACT_EMAIL
ORGANIZER_CONTACT_PHONE
```

Apps Script `PropertiesService` (secret, never in Sheets or frontend):

```
QR_SECRET
SMS_API_KEY / SMS_SENDER_ID
WHATSAPP_API_TOKEN / WHATSAPP_PHONE_NUMBER_ID
EMAIL_FROM_ADDRESS
ADMIN_PASSWORD_HASHES
SPREADSHEET_ID
```

`Event_Master` remains the single source of truth for the 16 events (name, category, date, time, venue, capacity, notification toggles) — the committee edits the sheet, no code changes required.

---

## 30. ADMIN ACCESS

Unchanged three-tier model: `SUPER ADMIN`, `REGISTRATION COMMITTEE`, `EVENT COORDINATOR`, with permissions exactly as originally specified. Event Coordinator accounts should be scoped to a specific Event ID (one of the 16) so a coordinator only sees/scans their own event's desk.

---

## 31. DATA CONSISTENCY

Unchanged. Google Sheets remains the sole source of truth for both registration and attendance; the frontend never determines success/failure on its own and never uses `localStorage` as a database.

---

## 32. EXISTING WEBSITE PRESERVATION

Unchanged — inspect the existing EvoXis'26 project first, integrate the Apps Script backend into the existing event cards/forms, preserve the current visual identity and routing.

---

## 33. REQUIRED FRONTEND PAGES

Unchanged route list:

```
/register
/registration-success
/my-registration
/qr
/committee/login
/committee/dashboard
/committee/reception-scanner
/committee/event-scanner
/committee/attendance
/admin/events
```

---

## 34. REGISTRATION SUCCESS PAGE

Unchanged, example populated with real events:

```
🎉 Registration Successful
Registration ID: EVOXIS26-00025
Participant: Priya R.
Events: Paper Presentation, Squid Game, Football
Date: <from Event_Master>

[View QR]  [Download QR]  [Download Registration Details]

"Please keep this QR code ready at the reception desk."
```

---

## 35. MY REGISTRATION

Unchanged — verification via email + Registration ID, or mobile + OTP, or a secure token link. Never expose full registration data via a guessable Registration ID alone.

---

## 36. TESTING REQUIREMENTS

Unchanged 26-point checklist from the original spec — additionally run it once per category (Technical / Non-Technical / Special) and once for a participant registered across all three categories at once, since that's the real-world case for EvoXis'26.

---

## 37. IMPORTANT IMPLEMENTATION RULE

Unchanged — this must be a functional end-to-end system, not a frontend mockup. Every step in the flow (registration → Sheets → ID → QR → notifications → reminder → reception scan → event scan → participation status → reporting) must actually work against the live `EvoXis26_Master_Database` spreadsheet.

---

## 38. DELIVERABLES

Unchanged deliverables list, plus: the pre-filled `Event_Master` table from Section 2.2 should ship as the initial sheet content so the committee only needs to fill in Date/Time/Venue/Capacity rather than build the sheet from scratch.

Clearly identify for the organizer:
- Which `Event_Master` fields must be filled in before launch (Date, Time, Venue, Max Participants).
- Which API keys/credentials are required (SMS provider, WhatsApp Business API, email sending) and that these may require a paid plan — state this plainly rather than assuming a free tier.
- Which Apps Script Web App URL must be added to the frontend build config.
- Which Spreadsheet ID must be connected.

---

## FINAL GOAL

Unchanged from the original spec:

```
REGISTER → RECEIVE CONFIRMATION → RECEIVE QR → RECEIVE EMAIL/SMS/WHATSAPP
→ RECEIVE EVENT REMINDER → ARRIVE AT COLLEGE → SCAN QR AT RECEPTION
→ MANUAL VERIFICATION → MARK OVERALL PRESENT → GO TO EVENT → SCAN SAME QR
→ VERIFY EVENT REGISTRATION → MARK EVENT PRESENT → MARK PARTICIPATION
```

Google Sheets remains the central data source; all registration and attendance actions across all 16 EvoXis'26 events are recorded there.
