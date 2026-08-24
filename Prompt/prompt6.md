# EvoXis'26 Operations Portal — Bug Fix: Physical QR Not Resolving at Event Desk

## Bug Report

**Symptom:** Reception binds physical QR `EVX26-TEST-000051` to a participant. UI confirms success. Event Desk then scans the same `EVX26-TEST-000051` and returns `PARTICIPANT NOT FOUND` / `No active registration found for QR EVX26-TEST-000051`.

**Conclusion:** Either the bind write isn't persisting correctly, or Event Desk is resolving the QR against the wrong table/relationship. Both are plausible — diagnose against the live schema before fixing either.

**Constraint:** Same Supabase project as the rest of EvoXis'26. No new database, project, table duplication, or second Apps Script/Sheet. Registration website stays untouched.

---

## 1. Diagnose Before Coding

Inspect the live Supabase schema first — do not assume table/column names from this doc:
- participant / registration / event-registration tables
- physical QR table (if one exists) — name, columns, constraints
- attendance / event-attendance tables
- existing RPCs and their current implementation
- RLS policies on all of the above
- foreign keys and indexes

Then trace the exact code path for the Reception "CONFIRM & BIND" click, and the exact code path for the Event Desk scan handler. Identify where they diverge in what they query.

---

## 2. Correct Data Model

```
physical_qr_inventory.qr_code  ──►  physical_qr_inventory.participant_id  ──►  participant  ──►  registration  ──►  event_registrations
```

The physical QR is **not** the participant ID and **not** the registration QR token. Three distinct identifiers exist:
- `registration.qr_token` — generated at signup, scanned once at Reception step 1
- `physical_qr_inventory.qr_code` — e.g. `EVX26-TEST-000051`, assigned at Reception step 2
- `participant.id` / `registration.id` — the actual stable foreign keys everything else joins on

**Likely root cause to check first:** Event Desk querying `registration` directly by treating the physical QR as if it were `registration.qr_token`, instead of joining through `physical_qr_inventory.participant_id`. Confirm or rule this out by reading the actual Event Desk query.

---

## 3. Single Shared Resolver — Required Fix

Reception, Event Desk, and Food Counter must all call **one** backend function, not three separate lookups:

```ts
resolvePhysicalQR(qrCode: string) → {
  qrCode, qrType, environment, status,
  participantId, registrationId,
  participant, registration, registeredEvents
}
```

Resolution order, with a distinct return code at each failure point (never collapse these into a single "not found"):

| Step | Failure code |
|---|---|
| QR row exists in `physical_qr_inventory`? | `QR_NOT_FOUND` |
| QR `status = ASSIGNED`? | `QR_NOT_ASSIGNED` / `QR_REVOKED` |
| QR environment matches portal mode (TEST/PRODUCTION)? | `TEST_QR_IN_PRODUCTION_MODE` / `PRODUCTION_QR_IN_TEST_MODE` |
| `participant_id` present and participant exists? | `PARTICIPANT_NOT_FOUND` |
| Active registration exists? | `REGISTRATION_NOT_FOUND` |
| → return full resolved object | — |

Reception, Event Desk, and Food Counter each call this resolver and layer their own downstream logic (bind / event-eligibility check / food-eligibility check) on top of the result. No page re-implements QR lookup independently.

---

## 4. Reception Bind — Atomic Write + Verify

`CONFIRM & BIND` must run as one atomic operation:

1. Validate QR exists, correct environment, not already assigned.
2. Validate participant exists, has active registration, has no other active physical QR.
3. Write: `qr_code`, `status = ASSIGNED`, `participant_id`, `registration_id`, `qr_type`, `environment`, `assigned_at`, `assigned_by`.
4. **Immediately re-SELECT the row from Supabase** (not from local/React state) and confirm `status = ASSIGNED`, `participant_id IS NOT NULL`, `registration_id IS NOT NULL`.
5. Only show `"QR BOUND SUCCESSFULLY"` after step 4 passes. If verification fails, show `"QR assignment could not be verified. Please try again."` — never show success on the strength of the write call alone.

Use `participant_id`/`registration_id` as real foreign keys (`physical_qr_inventory.participant_id → participant.id`, etc.), not names/emails as pseudo-relationships.

---

## 5. Event Desk — Correct Lookup + Event Mismatch Handling

Event Desk scan flow: `resolvePhysicalQR(qrCode)` → check current `event_id` against `registeredEvents`.

- **Resolver succeeds but event not in registered list** → this is a **found participant**, not a missing one. Show:
  > PARTICIPANT FOUND — NOT REGISTERED FOR THIS EVENT
  > Registered events: [list]
  > Current event: TE03 — Mind Sparks
  > "You are not registered for this event. Please proceed to one of your registered event desks."

  Do not write an attendance record. Do not show `PARTICIPANT NOT FOUND` for this case — that message is reserved for an actual resolver failure at the participant/registration step.
- **Already present for this event** → `ALREADY MARKED PRESENT` with original check-in time, no new row (idempotent insert, e.g. `unique(participant_id, event_id)` conflict → return existing row).
- **Registered and not yet present** → mark attendance, atomic write.

---

## 6. Food Counter

Same resolver, same pattern: eligibility check → idempotent delivery write → `FOOD ALREADY DELIVERED` on repeat scan with no second transaction.

---

## 7. Team Members

Every team member has their own `participant_id`, their own physical QR, and their own independent bind/attendance/food state. The resolver must never collapse a member's QR to the team head's identity — confirm this explicitly in testing with a 3+ member team, each with a different QR (e.g. `EVX26-WB-000001/2/3`).

---

## 8. RLS

Reception and Event Desk roles need `READ` on physical QR assignments, participants, registrations, event registrations, plus `INSERT`/`UPDATE` on their respective attendance tables. If a lookup returns empty because of RLS, **fix the specific policy** — do not disable RLS globally, and never expose the service-role key client-side.

---

## 9. Scanner-Level Fixes (secondary, same pass)

- Only trigger a lookup when the QR library returns an actual `decodedText` — a camera showing a face is not a scan event.
- Debounce: a QR decoded repeatedly in rapid succession triggers exactly one resolve/write, then the scanner resets.
- Error states must be specific, not a blanket `PARTICIPANT NOT FOUND`: `INVALID_QR_FORMAT`, `QR_NOT_FOUND`, `QR_NOT_ASSIGNED`, `QR_REVOKED`, `PARTICIPANT_NOT_FOUND`, `REGISTRATION_NOT_FOUND`, `NOT_REGISTERED_FOR_EVENT`, `ALREADY_PRESENT`, `NETWORK_ERROR`, `DATABASE_ERROR`.

---

## 10. Debug Logging (temporary, strip before production)

Log at each resolver stage and each write: `QR_SCAN`, `QR_RESOLVE` (found/status/participant_id/registration_id), `EVENT_CHECK` (event_id/registered), `ATTENDANCE` (status). Remove or gate behind a debug flag before shipping.

---

## 11. Google Sheets

Out of scope for this fix beyond: once the Supabase-side resolution is correct, confirm the existing Apps Script sync still fires on bind/attendance/food writes. No new spreadsheet, no new Apps Script project.

---

## 12. Anti-Patterns — Do Not Use Any of These as "Fixes"

Hardcoding `EVX26-TEST-000051` or any participant name · storing the QR-to-participant link only in React state or localStorage · bypassing Supabase or RLS · a second database or participant table · Event Desk trusting a client-supplied `event_id` without server-side validation · silently changing the error message without fixing the underlying join.

---

## 13. End-to-End Test (must pass with the real QR before sign-off)

Using `EVX26-TEST-000051` against a real TEST participant:

1. Reception: scan registration QR → participant appears.
2. Bind `EVX26-TEST-000051` → `CONFIRM & BIND`.
3. Re-query Supabase directly → confirm persisted row (`status=ASSIGNED`, `participant_id`, `registration_id` populated).
4. Reload Reception, search the QR again → assignment still present.
5. Event Desk, TEST mode, select the participant's actual registered event.
6. Scan `EVX26-TEST-000051` → participant found (not `PARTICIPANT NOT FOUND`), eligibility confirmed, mark attendance.
7. Scan again → `ALREADY MARKED PRESENT`, no duplicate row.
8. Select an event the participant did **not** register for, scan again → participant found, event-mismatch message shown, no attendance written.
9. Food Counter: scan → deliver → scan again → `FOOD ALREADY DELIVERED`, no duplicate row.

---

## 14. Acceptance Criteria

Fixed only when: Reception bind persists and verifies against a live re-query; Event Desk resolves the same QR to the same participant via `resolvePhysicalQR`; wrong-event and duplicate-scan cases behave as specified above (never a false "not found"); Sheets sync remains intact; no second database/table/project was introduced.

---

## 15. Final Report Required

1. Root cause (which table/query was actually wrong)
2. Reception bind fix
3. Event Desk resolver fix
4. RLS/FK changes, if any
5. Scanner changes, if any
6. Full test-9-step result log using `EVX26-TEST-000051`
7. Explicit confirmation: no second database, table, or Apps Script project was created

Do not report this as done until the Reception → Bind → Event Desk → Attendance chain has been verified end-to-end with this exact QR against the live Supabase project.
