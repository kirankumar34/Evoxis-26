# EvoXis'26 — Fix Prompt: Registrations Not Saving to Google Sheets

> Use this as a focused bug-fix prompt for your AI coding tool. Do **not** let it rewrite the website, the registration form, or the overall architecture. The scope is strictly: **find and fix why a successful-looking registration is not producing a row in Google Sheets.**

---

## Context

The EvoXis'26 website already has a working registration UI and a Google Apps Script + Google Sheets backend (see project architecture — unchanged). The reported bug:

> After a participant submits the registration form, no new row appears in the Google Sheet (`Overall_Registration_Details` and/or the category/event sheets). The form may appear to submit successfully on the frontend, but nothing is written to the spreadsheet.

## Instructions for the AI

You are a senior full-stack debugger. Do the following, **in order**, and do not skip straight to rewriting code:

1. Reproduce and isolate where the flow breaks — frontend, network, or Apps Script.
2. Check each of the specific failure points listed below.
3. Report exactly which one is the cause (there may be more than one).
4. Apply the **minimal fix** — do not restructure working functions, rename sheets, or change the data model.
5. Add basic logging so this class of failure is visible next time instead of failing silently.
6. Provide a short manual test checklist to confirm the fix.

---

## Most Likely Causes (check in this order)

### 1. Apps Script Web App deployment settings
- [ ] Deployment **"Execute as"** must be set to the account that owns the Spreadsheet (usually "Me").
- [ ] Deployment **"Who has access"** must be **"Anyone"** (or "Anyone with Google account" only if the frontend can authenticate — for a public registration form it should be "Anyone").
- [ ] Confirm you deployed a **new version** after the last code change — Apps Script Web Apps do **not** auto-update on an existing deployment URL when you edit code; you must redeploy or create a new deployment version.
- [ ] Confirm the frontend is calling the **current** deployment URL (`/exec`), not an old or `/dev` URL.

### 2. Frontend fetch request shape
- [ ] If using `fetch(url, { method: "POST", mode: "no-cors", ... })` — **`no-cors` mode silently discards the response and can silently fail to deliver the body correctly.** Remove `no-cors` and handle CORS properly on the Apps Script side (Section 4), or switch the request body to `Content-Type: text/plain` (a common workaround for Apps Script + `fetch`, since Apps Script `doPost` does not natively parse `application/json` the same way Express does).
- [ ] Confirm the request body is actually being serialized (`JSON.stringify(formData)`) and not sent as `[object Object]`.
- [ ] Log the raw response in the browser console/network tab — check whether the response is a redirect (Apps Script Web Apps respond with a 302 redirect to the actual execution URL; some fetch configurations don't follow this correctly).

### 3. `doPost(e)` on the Apps Script side
- [ ] Confirm `doPost(e)` actually parses `e.postData.contents` (not `e.parameter`, which is for form-encoded/query data) if the frontend sends JSON.
- [ ] Wrap the entire `doPost` body in `try/catch` and return a JSON error response instead of letting an uncaught exception return an empty/500 response.
- [ ] Confirm `SpreadsheetApp.openById(SPREADSHEET_ID)` is using the **correct, current** Spreadsheet ID (a common bug: pointing at a copy/test sheet instead of the live one).
- [ ] Confirm `sheet.appendRow([...])` is called on the correct sheet object (`ss.getSheetByName("Overall_Registration_Details")` — verify the sheet name string matches the actual tab name **exactly**, including case and spacing).
- [ ] Confirm `getSheetByName()` isn't returning `null` (i.e. the sheet name in code doesn't match the actual tab) — this would throw on `.appendRow` and get silently swallowed if there's a bare `try/catch` with no logging.

### 4. CORS / response handling
- [ ] Apps Script Web Apps have quirky CORS behavior. Confirm the response uses `ContentService.createTextOutput(...).setMimeType(ContentService.MimeType.JSON)`.
- [ ] If the browser console shows a CORS error, that means the request may never have reached `doPost` at all (preflight failure) — check whether the frontend is sending a `Content-Type: application/json` header, which triggers a CORS preflight `OPTIONS` request that Apps Script does **not** handle by default. Fix: send as `Content-Type: text/plain;charset=utf-8` to avoid the preflight, and parse `e.postData.contents` as JSON on the Apps Script side regardless.

### 5. LockService / duplicate-check logic swallowing the write
- [ ] If a `LockService.getScriptLock()` call times out or throws, confirm it's not silently caught and returning a "success" response to the frontend without ever writing the row.
- [ ] If duplicate-detection logic (email/mobile/event match) has a bug — e.g. comparing against blank/undefined values — it may be incorrectly treating every new registration as a duplicate and returning the "already registered" path without ever appending a new row. Log which branch (`new registration` vs `duplicate found`) is taken on every request.

### 6. Sheet-level issues
- [ ] Confirm the sheet is not protected/locked in a way that blocks Apps Script writes (Data → Protected sheets and ranges).
- [ ] Confirm you're not near Google Sheets' row/cell limits (unlikely at this scale, but worth a 5-second check).
- [ ] Confirm `appendRow` isn't being called on a filtered/hidden view in a way that appears not to update (rare, but check by scrolling to the actual last row rather than trusting what's visible).

---

## Required Fix Output

1. **Root cause** — state plainly which of the above (one or more) was the actual bug.
2. **Minimal diff** — show only the changed function(s)/lines, not a full-file rewrite.
3. **Logging added** — every `doPost` execution should log (via `Logger.log` / Stackdriver, viewable in Apps Script → Executions) at minimum:
   - Raw incoming payload
   - Which branch was taken (new registration / duplicate / error)
   - Whether the `appendRow` call succeeded
   - The full error object on any caught exception (not just a generic message)
4. **Test checklist** (manual):
   - [ ] Submit a brand-new registration with a fresh email/mobile → confirm a new row appears in `Overall_Registration_Details` within a few seconds.
   - [ ] Confirm matching rows appear in the correct category sheet (`Overall_Technical_Registration` / `Overall_NonTechnical_Registration` / `Special_Events_Registration`) and the relevant `EVT_<slug>` sheet.
   - [ ] Submit the same email/mobile + event again → confirm it's correctly detected as a duplicate and does **not** create a second row.
   - [ ] Check Apps Script → Executions log for the successful run and confirm no silent errors.
   - [ ] Open the Network tab during a real submission and confirm the response status and body match what the frontend expects.

---

## Explicit Constraints

- Do **not** change the registration form UI, the event list, the Sheets column structure, or the overall Apps Script + Sheets architecture.
- Do **not** introduce a new backend/database — the fix must stay within Google Apps Script + Google Sheets.
- Keep the fix scoped to the write path (frontend submit → Apps Script `doPost` → Sheets append). Do not touch QR generation, notifications, or attendance scanning code unless the same root cause is proven to affect them too.
