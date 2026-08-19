# Story: Connect EvoXis'26 Production Database (Google Sheets via Apps Script)

**Epic:** EvoXis'26 Registration & Attendance System
**Story ID:** EVOXIS26-DB-001
**Status:** Ready for Development
**Format:** BMAD Method (Story → Acceptance Criteria → Tasks/Subtasks → Dev Notes → Testing)

---

## Story

As the **EvoXis'26 organizing committee**,
I want the existing website's registration, QR, and attendance system **connected to a real, persistent Google Sheets database**,
so that participant registrations stop falling back to browser Local Storage / Offline Simulation Mode and are permanently recorded in `EvoXis26_Master_Database`.

> **Scope discipline:** This story is a **connection and verification task only**. The website UI, the registration system's logic, and the existing Google Apps Script backend (`gas/Code.js`) already work and must be **reused, not rewritten**. No new backend, no new database technology, no new features.

---

## Context

- The existing project already contains a working `gas/Code.js` Apps Script backend, an `appsscript.json`, and full API coverage (`ping`, `registerParticipant`, `getRegistration`, `validateQRCode`, `checkEventRegistration`, `markReceptionAttendance`, `markEventAttendance`, `updateParticipationStatus`, `getEventParticipants`, `getDashboardStats`, `getEventMaster`, `validateAdmin`).
- The current `.env` has `VITE_APPS_SCRIPT_URL=""`, which causes the frontend to silently run in **Offline / Local Simulation Mode**, storing registrations in Local Storage instead of Google Sheets.
- The Google account that must own the spreadsheet and Apps Script deployment is **`evoxis26enquiry@gmail.com`** — never hardcode this email into application logic; it is only an operational/ownership detail for setup.
- Google Sheets must become the sole persistent source of truth. React state, Local Storage, sessionStorage, and IndexedDB are not permanent stores.

---

## Acceptance Criteria

1. **AC1** — A Google Spreadsheet named `EvoXis26_Master_Database` exists, owned by `evoxis26enquiry@gmail.com`, created/verified via the existing `setupEvoXis26Sheets()` function (not manually recreated by hand).
2. **AC2** — The spreadsheet contains exactly the sheets the existing code already expects: `Overall_Registration_Details`, `Overall_Technical_Registration`, `Overall_NonTechnical_Registration`, `Special_Events_Registration`, all 16 `EVT_*` sheets, `Attendance_Log`, `Notification_Log`, `Event_Master`, `Configuration`.
3. **AC3** — Apps Script Script Properties contain `SPREADSHEET_ID` and `QR_SECRET` — neither value appears anywhere in frontend source or in `.env`.
4. **AC4** — The Apps Script project is deployed as a Web App (`Execute as: Me`, `Who has access: Anyone`), producing a real `https://script.google.com/macros/s/.../exec` URL.
5. **AC5** — `.env` has `VITE_APPS_SCRIPT_URL` set to that real deployment URL; `.env.example` documents the required variables without secrets.
6. **AC6** — When `VITE_APPS_SCRIPT_URL` is set, the frontend uses it as the **primary** registration path. Local Storage is never used as the source of truth for a successful registration while the Apps Script URL is configured.
7. **AC7** — If the Apps Script request fails, the frontend shows an explicit error ("Registration server is temporarily unavailable. Please try again.") — it never reports "Registration Successful" for a write that didn't actually reach Google Sheets.
8. **AC8** — A real end-to-end test registration (event `TE01`) produces matching Registration IDs across `Overall_Registration_Details`, `Overall_Technical_Registration`, and `EVT_paper-presentation`.
9. **AC9** — QR lookup via Reception Scanner retrieves the participant from Google Sheets (via Apps Script), not Local Storage.
10. **AC10** — Reception check-in ("Confirm & Mark Present") updates `Overall Attendance Status` and appends a row to `Attendance_Log`.
11. **AC11** — Event-level attendance at the `TE01` desk correctly validates registration, updates `EVT_paper-presentation`, and appends to `Attendance_Log`.
12. **AC12** — Registering the same participant/event twice does not create duplicate rows or duplicate Registration IDs (existing `LockService` logic preserved, not replaced).
13. **AC13** — Offline Simulation Mode may remain available for local development but is never silently substituted for the production path once `VITE_APPS_SCRIPT_URL` is configured.

---

## Tasks / Subtasks

- [ ] **Task 1 — Spreadsheet setup** *(AC1, AC2)*
  - [ ] Run `setupEvoXis26Sheets()` from `gas/Code.js` under the `evoxis26enquiry@gmail.com` account.
  - [ ] Verify all expected tabs and header rows were created — do not hand-create sheets.
- [ ] **Task 2 — Script Properties configuration** *(AC3)*
  - [ ] In Apps Script → Project Settings → Script Properties, set `SPREADSHEET_ID` to the real spreadsheet's ID.
  - [ ] Set (or confirm) `QR_SECRET` as a secure random value.
  - [ ] Confirm neither value exists anywhere in `src/` or `.env`.
- [ ] **Task 3 — Deploy the Web App** *(AC4)*
  - [ ] Deploy → New deployment → Web app, `Execute as: Me`, `Who has access: Anyone`.
  - [ ] Record the resulting `/exec` URL.
- [ ] **Task 4 — Wire the frontend to the real URL** *(AC5, AC6, AC7)*
  - [ ] Update `.env` with the real `VITE_APPS_SCRIPT_URL`; keep `VITE_APP_TITLE`, `VITE_EVENT_DATE`, and other existing variables untouched.
  - [ ] Add/update `.env.example` (empty `VITE_APPS_SCRIPT_URL=`, no secrets).
  - [ ] In the existing API/config layer (do not scatter `import.meta.env` reads across components), confirm the app reads `VITE_APPS_SCRIPT_URL` and treats a non-empty value as "production mode."
  - [ ] Confirm the failure path shows the error message from AC7 instead of a false success.
- [ ] **Task 5 — End-to-end verification** *(AC8–AC12)*
  - [ ] Submit one real test registration for `TE01` with a disposable test name/email/phone.
  - [ ] Confirm rows in `Overall_Registration_Details`, `Overall_Technical_Registration`, `EVT_paper-presentation` share the same Registration ID.
  - [ ] Scan the generated QR at Reception Scanner → confirm data comes from Sheets.
  - [ ] Click **Confirm & Mark Present** at reception → verify `Attendance_Log` + `Overall Attendance Status`.
  - [ ] Scan the same QR at the `TE01` event desk → confirm attendance + participation status update in `EVT_paper-presentation` and `Attendance_Log`.
  - [ ] Re-submit the same participant/event → confirm duplicate protection holds (no second row, no new Registration ID).
- [ ] **Task 6 — Report back** *(Definition of Done)*
  - [ ] List every file modified.
  - [ ] Summarize what changed in each.
  - [ ] Document the Google Sheet + Apps Script setup steps actually performed.
  - [ ] State exactly where the Apps Script Web App URL was placed.
  - [ ] Describe how to verify registrations are persisting (repeatable steps for the committee).
  - [ ] Flag any remaining manual Google-account configuration the organizer still needs to do (e.g. granting access, confirming ownership under `evoxis26enquiry@gmail.com`).

---

## Dev Notes

**Do not:**
- Rewrite `gas/Code.js` from scratch — fix only what's broken in the connection path.
- Replace Google Sheets/Apps Script with Firebase, Supabase, MySQL, MongoDB, or a Node/Express backend.
- Hardcode `evoxis26enquiry@gmail.com`, `SPREADSHEET_ID`, or `QR_SECRET` into frontend code.
- Implement wristband QR, food tokens, certificate downloads, payment, or a redesigned reception scanner in this story — those are separate future stories.
- Let a failed Apps Script call be masked as a successful registration.

**Production data flow (unchanged architecture, just being connected):**

```
Participant fills form
  → Frontend validates input
  → Frontend calls VITE_APPS_SCRIPT_URL (registerParticipant)
  → Apps Script validates + acquires LockService lock
  → Apps Script checks for duplicates
  → Apps Script generates Registration ID (EVOXIS26-00001, …)
  → Apps Script generates QR token
  → Apps Script writes to Overall_Registration_Details
  → Apps Script writes to the category sheet (Technical / Non-Technical / Special)
  → Apps Script writes to the matching EVT_* sheet
  → Apps Script returns success JSON
  → Frontend shows "Registration Successful" only now
```

**Ownership note:** `evoxis26enquiry@gmail.com` is the Google account that should own the spreadsheet and the Apps Script deployment — this is an operational/account-setup detail, not something to encode into the application's logic or config files.

---

## Testing

Run the full checklist under **Task 5** above against the live deployment before marking this story done. Do not report the connection as working without having actually performed a real registration → Sheets → QR → attendance round trip.

---

## Definition of Done

- [ ] All Acceptance Criteria (AC1–AC13) verified, not assumed.
- [ ] Task 6 report delivered (files changed, setup steps, URL location, verification steps, remaining manual steps).
- [ ] No secrets present in frontend code, `.env`, or version control.
- [ ] Existing UI, registration form, event list, and Apps Script API surface remain unchanged in behavior.
