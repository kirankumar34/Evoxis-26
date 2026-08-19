# Story: Automated Test Suite for EvoXis'26 Registration & Attendance System

**Epic:** EvoXis'26 Registration & Attendance System
**Story ID:** EVOXIS26-QA-001
**Status:** Ready for Development
**Format:** BMAD Method (Story → Acceptance Criteria → Tasks/Subtasks → Dev Notes → Testing → Definition of Done)

---

## Story

As the **EvoXis'26 organizing committee**,
I want an **automated test suite covering the frontend, the Apps Script API, and the Google Sheets data layer**,
so that registration, QR, and attendance bugs are caught before the live event instead of discovered by 100+ participants on the day.

> **Scope discipline:** This story adds **tests only**. It does not change the website UI, the registration flow, the Apps Script backend logic, or the Sheets data model. Any bug the tests uncover gets filed as its own fix story — do not "fix while testing" inside this story unless the AI is explicitly told to.

---

## Context

- Architecture under test (unchanged): React + Vite frontend → Google Apps Script Web App (`gas/Code.js`) → Google Sheets (`EvoXis26_Master_Database`, owned by `evoxis26enquiry@gmail.com`).
- 16 real events across Technical / Non-Technical / Special categories (see `Event_Master`).
- Prior stories in this project: `EVOXIS26-DB-001` (connect the production database) — this story assumes that story is complete and the app is pointed at a real deployment, not Offline Simulation Mode.
- Target load: 100+ simultaneous users at peak (registration deadline, event-day check-in rush).

---

## Acceptance Criteria

1. **AC1** — A frontend E2E test suite exists (Playwright or Cypress — pick one and use it consistently) covering the full participant journey: browse events → select event(s) → fill registration form → submit → see success page → view/download QR.
2. **AC2** — Form validation is tested: required fields, malformed email, malformed mobile number, submitting with zero events selected, submitting the same event twice in one session.
3. **AC3** — An API-level test suite exists (e.g. a script or Postman/Newman collection) that calls the deployed Apps Script Web App directly for every action: `ping`, `registerParticipant`, `getRegistration`, `validateQRCode`, `checkEventRegistration`, `markReceptionAttendance`, `markEventAttendance`, `updateParticipationStatus`, `getEventParticipants`, `getDashboardStats`, `getEventMaster`, `validateAdmin` — asserting both success and expected-failure responses.
4. **AC4** — Duplicate-registration protection is covered by an automated test: same email/mobile + same event submitted twice must yield a single row and the same Registration ID both times.
5. **AC5** — A concurrency/load test exists that fires **at least 100 near-simultaneous** `registerParticipant` calls (mix of unique and duplicate participants) and asserts: no duplicate Registration IDs, no lost writes, no `LockService` deadlock/timeout errors, and a defined acceptable success rate/response time is documented and checked against.
6. **AC6** — QR round-trip is tested end-to-end: register → extract QR token from the response/email payload (not a hardcoded token) → call `validateQRCode` → confirm it resolves to the correct participant.
7. **AC7** — Event-attendance validation logic is tested for all three states: registered-and-not-yet-attended (allowed), not-registered-for-this-event (blocked with correct error), already-marked-present (blocked with correct error, previous timestamp shown).
8. **AC8** — Reception attendance and event attendance both produce a correctly-shaped `Attendance_Log` row — tested by reading the sheet back via a test-only Apps Script action or the Sheets API, not by eyeballing the spreadsheet.
9. **AC9** — Data-integrity check across sheets: for a set of test registrations, the Registration ID present in `Overall_Registration_Details` must match the ID in the relevant category sheet and the relevant `EVT_*` sheet — automated, not manual comparison.
10. **AC10** — Notification tests (Email/SMS/WhatsApp) are covered at the level that's actually testable without spamming real numbers/inboxes: assert `Notification_Log` gets a row with correct `Status` per channel, using test/sandbox credentials or provider mocks — never fire real SMS/WhatsApp sends in CI.
11. **AC11** — Security-relevant tests: confirm `SPREADSHEET_ID`/`QR_SECRET`/admin credentials never appear in any frontend bundle or network response body; confirm committee/admin routes reject unauthenticated requests; confirm a tampered/guessed QR token is rejected by `validateQRCode`.
12. **AC12** — Mobile-responsiveness and cross-browser checks for the registration form and both scanner interfaces (Reception Scanner, Event Scanner) on at least: Chrome desktop, Chrome Android emulation, Safari/iOS emulation.
13. **AC13** — All tests are runnable with a single documented command, produce a clear pass/fail report, and are safe to run repeatedly against a **test/staging spreadsheet** (never the live production `EvoXis26_Master_Database` during the actual symposium).
14. **AC14** — A short test plan document (`TEST_PLAN.md` or equivalent) explains what's covered, what's intentionally NOT automated (and why), and how to run each suite locally and in CI.

---

## Tasks / Subtasks

- [ ] **Task 1 — Test environment setup** *(AC13)*
  - [ ] Stand up (or confirm) a **separate test/staging Google Spreadsheet + Apps Script deployment**, isolated from the production `evoxis26enquiry@gmail.com` database.
  - [ ] Add test-only env vars (e.g. `VITE_APPS_SCRIPT_URL_TEST`, `TEST_SPREADSHEET_ID`) — never point automated tests at production during the live event window.
  - [ ] Seed `Event_Master` in the test spreadsheet with the same 16 real events so test data is representative.
- [ ] **Task 2 — Frontend E2E suite** *(AC1, AC2, AC12)*
  - [ ] Choose Playwright or Cypress; scaffold the project's test runner and CI config.
  - [ ] Write the happy-path registration journey test.
  - [ ] Write validation/edge-case tests (Section AC2).
  - [ ] Write responsive/cross-browser checks for registration form + both scanner pages.
- [ ] **Task 3 — API test suite** *(AC3, AC4, AC6, AC7, AC11)*
  - [ ] Build a reusable API test client (script or Postman/Newman collection) against the Apps Script Web App.
  - [ ] Cover every listed action with success + at least one failure case each.
  - [ ] Duplicate-registration test (AC4).
  - [ ] Full QR lifecycle test: register → get token → validate → check-in → re-check-in blocked (AC6, AC7).
  - [ ] Security tests: tampered token rejection, secret-leak checks, unauthenticated admin-route rejection (AC11).
- [ ] **Task 4 — Concurrency/load test** *(AC5)*
  - [ ] Pick a load-testing tool appropriate for hitting a Web App endpoint (e.g. k6, Artillery, or a custom async script) — document the choice and why.
  - [ ] Script a scenario: 100+ concurrent `registerParticipant` calls, ~80% unique participants / ~20% intentional duplicates.
  - [ ] Assert: zero duplicate Registration IDs, zero lost registrations, error rate and p95 response time stay under thresholds defined in `TEST_PLAN.md`.
  - [ ] Run against the **test/staging** deployment only.
- [ ] **Task 5 — Data-integrity checks** *(AC8, AC9)*
  - [ ] Write an automated check that reads back `Overall_Registration_Details`, the category sheet, and the matching `EVT_*` sheet for a batch of test registrations and asserts Registration ID consistency.
  - [ ] Write an automated check that `Attendance_Log` gains exactly one correctly-shaped row per attendance action performed in the test suite.
- [ ] **Task 6 — Notification verification (safe mode)** *(AC10)*
  - [ ] Use sandbox/test credentials for SMS and WhatsApp providers where available, or mock the provider calls at the Apps Script level for test runs.
  - [ ] Assert `Notification_Log` entries are created with the expected `Status` per channel — do not require a human to check a real inbox/phone as part of the automated suite.
- [ ] **Task 7 — Documentation & CI wiring** *(AC13, AC14)*
  - [ ] Write `TEST_PLAN.md`: scope, tools used, how to run each suite, what's out of scope and why, pass/fail thresholds for the load test.
  - [ ] Wire the frontend/API suites (not the load test, unless deliberately scheduled) into CI on pull requests.
  - [ ] Document how to safely point tests at staging vs. production, with a hard warning against running load tests against the live event database.

---

## Dev Notes

**Do not:**
- Run any automated test — especially the load test or duplicate-registration test — against the live production `EvoXis26_Master_Database`. Always use an isolated test/staging spreadsheet and deployment.
- Send real SMS/WhatsApp messages from automated test runs; use sandbox credentials or mock the send functions.
- Fix application bugs discovered mid-testing as part of this story unless explicitly asked — log them and hand off to a dedicated fix story (see the pattern used in `EVOXIS26-DB-001` and the earlier registration-not-saving fix).
- Treat "the UI looks fine" as a passing test — every assertion in this story must check actual Google Sheets state (via a test-only read action or the Sheets API), not just the frontend's optimistic response.

**Suggested tool defaults (adjust if the project already has a preference):**
- Frontend E2E: Playwright (good mobile-emulation and CI support).
- API tests: a lightweight Node/TypeScript script hitting the Apps Script Web App with `fetch`, or a Postman/Newman collection if the team prefers a GUI-authored suite.
- Load test: k6 (scriptable, good concurrency control, clear pass/fail thresholds) or Artillery as an alternative.

**Test data hygiene:** use a clearly tagged prefix for all test participants (e.g. `TEST_` in the name field, or a dedicated `@example.com`-style test email domain) so test rows are trivially identifiable and can be bulk-cleared from the test spreadsheet between runs.

---

## Testing

This story's own "testing" is the deliverable — see Tasks 2–6 above. Before marking done, run every suite once end-to-end against the test/staging deployment and confirm all Acceptance Criteria pass, with results captured in `TEST_PLAN.md` or a linked CI run.

---

## Definition of Done

- [ ] All Acceptance Criteria (AC1–AC14) implemented and passing against the test/staging environment.
- [ ] `TEST_PLAN.md` committed, accurately describing coverage and how to run everything.
- [ ] CI runs the frontend + API suites automatically on pull requests.
- [ ] Load test results (from Task 4) documented with actual numbers (success rate, p95 latency) against the defined thresholds.
- [ ] No test suite is capable of writing to the production spreadsheet by accident (config clearly separates test vs. production targets).
- [ ] Any bugs found during test-writing are filed as separate, clearly described follow-up items — not silently patched inside this story.
