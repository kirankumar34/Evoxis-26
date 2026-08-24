# EvoXis'26 Operations Portal — Fix Individual QR Resolution (Events + Food) & Strengthen Data Model

## Bug Confirmed (screen-recorded)

Reception binds wristband `EVX26-TEST-000051` to participant `test07` (team `team CSK`, `TEAM_HEAD`, registered for `SP02`, `SP03`). Bind succeeds — Reception shows the roster of all 4 team members and their registered events correctly.

Event Desk (`/events/TE03/scan`) scans the same `EVX26-TEST-000051` and returns:
> `PARTICIPANT NOT FOUND — No active registration found for QR EVX26-TEST-000051`

This is not a "wrong event" case — the participant isn't being found *at all*. Same class of failure is expected at Food Counter and has not been ruled out.

**This is the same underlying defect as the previous QR-binding bug fix, still unresolved.** Treat this as verification that the earlier fix either wasn't applied, wasn't applied to the individual-participant path, or fixed Reception's write without fixing Event/Food's read.

---

## 1. Scope of This Fix

Two things must both be true when done:

1. **Resolution works per individual participant** — including every member of a team, not just the team head. `test03`, `test31`, `test09` each need their own wristband bound and independently resolvable, exactly like `test07`.
2. **Resolution works identically for Event Desk and Food Counter** — both must find the participant, distinguish "not found" from "found but not eligible," and never silently fail.

Do not create a new database, new Supabase project, new participant/registration table, new Google Sheet, or second Apps Script. Extend the existing schema and existing Apps Script `Code.js` only where genuinely missing.

---

## 2. Diagnose Against the Live Schema First

Before writing any fix:

1. Query the live Supabase schema for the physical-QR table, participant table, registration table, event-registration table, team/team-member table, and any existing attendance/food tables.
2. Pull the actual row written by Reception's bind for `EVX26-TEST-000051` and confirm what `participant_id` it's pointing at — verify it's `test07`'s real participant UUID, not the team's ID, not null, not a string mismatch (e.g. UUID vs text type mismatch between tables is a common silent-failure cause).
3. Read the exact query Event Desk's scan handler runs and compare its join path against what Reception's bind actually wrote. The mismatch is almost certainly in one of these spots:
   - Event Desk querying `registration.qr_token` instead of joining through the physical-QR table's `participant_id`.
   - A type mismatch (UUID vs text) on the join key that causes a silent empty result rather than an error.
   - Event Desk filtering by team-level ID when the bind was written against an individual `participant_id`.
   - RLS policy on the physical-QR or participant table blocking Event Desk's role from reading the row Reception just wrote.
4. Confirm or rule out each of these explicitly — report which one it actually was.

---

## 3. Required Fix — One Shared Resolver

If not already in place, implement (or repair) a single backend function used by **Reception, Event Desk, and Food Counter alike**:

```ts
resolvePhysicalQR(qrCode: string) → {
  qrCode, qrType, status,
  participantId, registrationId, teamId,
  participant, registration, registeredEvents,
  campusStatus, foodStatus
}
```

Distinct failure codes at each stage — never collapse to a generic "not found":

| Stage | Code |
|---|---|
| QR row exists? | `QR_NOT_FOUND` |
| QR bound to a participant? | `QR_NOT_ASSIGNED` |
| `participant_id` resolves to a real participant row? | `PARTICIPANT_NOT_FOUND` |
| Registration active? | `REGISTRATION_NOT_FOUND` |
| → resolved successfully | — |

Event Desk consumes this, then separately checks `event_id ∈ registeredEvents` (eligibility — different from existence). Food Counter consumes the same resolver, then checks food eligibility. Neither desk implements its own QR lookup query.

**Individual-participant guarantee:** the resolver must always key off `participant_id`, never `team_id`. Test explicitly with all 4 members of `team CSK`, each with their own wristband, confirming each resolves to their own individual record, own event list, and own food status — not the team head's.

---

## 4. Database Enhancements — Accuracy & Easy Calculation

Beyond fixing the join, strengthen the schema so dashboards and reports don't require ad-hoc joins/recomputation every time. Reuse existing tables; add the following where missing.

### 4.1 Make identifiers unambiguous
- `physical_qr_assignments.participant_id` and `.registration_id` must be the same UUID/type as `participant.id` / `registration.id` — audit for type mismatches (text vs uuid) across every table involved in the join chain, since that's the most likely silent-failure cause.
- Add explicit foreign keys (not just conventionally-named columns) so type mismatches fail loudly at write time instead of silently at read time.

### 4.2 Add a per-participant operational summary
A denormalized view (not a duplicated source of truth — a `VIEW`, not a table) so the dashboard and any report can pull one row per participant instead of re-deriving counts each time:

```sql
create or replace view participant_operational_summary as
select
  p.id as participant_id,
  p.registration_id,
  p.team_id,
  p.full_name,
  pq.qr_code as physical_qr_id,
  pq.status as qr_status,
  ca.checkin_time as campus_checkin_time,
  (ca.checkin_time is not null) as campus_present,
  count(distinct er.event_id) as total_registered_events,
  count(distinct ea.event_id) as total_events_attended,
  fd.delivered_time as food_delivered_time,
  (fd.delivered_time is not null) as food_delivered
from participant p
left join physical_qr_assignments pq on pq.participant_id = p.id and pq.active
left join campus_attendance ca on ca.participant_id = p.id
left join event_registrations er on er.participant_id = p.id
left join event_attendance ea on ea.participant_id = p.id
left join food_delivery fd on fd.participant_id = p.id
group by p.id, p.registration_id, p.team_id, p.full_name,
         pq.qr_code, pq.status, ca.checkin_time, fd.delivered_time;
```

Adjust column/table names to match the live schema found in step 2 — this is the shape, not a literal drop-in. The point: `total_registered_events` vs `total_events_attended` gives Super Admin instant attendance-rate math (`attended / registered`) without recomputing joins per dashboard load.

### 4.3 Add event-level and team-level rollups similarly
- `event_attendance_summary` (per `event_id`: registered count, present count, attendance %) — feeds the Event Dashboard directly.
- `team_operational_summary` (per `team_id`: member count, members checked in, members with QR assigned, members fed) — since teams are a first-class concept in this data (per the roster UI), a team-level view avoids re-aggregating member rows manually every time someone asks "is the whole team checked in."

### 4.4 Index what gets looked up on every scan
Confirm (add if missing) indexes on: `physical_qr_assignments.qr_code` (unique), `physical_qr_assignments.participant_id`, `event_attendance(participant_id, event_id)`, `food_delivery.participant_id`, `event_registrations.participant_id`. Every scan does one of these lookups — unindexed columns here are the difference between a snappy scan and a queue at the door.

### 4.5 Keep numbers trustworthy
- `total_registered_events` and `total_events_attended` must come from `count(distinct ...)` against real rows, not a stored counter that can drift.
- Every write path (bind, campus check-in, event attendance, food delivery) stays idempotent per the existing unique-constraint pattern, so the summary views are never inflated by duplicate scans.

---

## 5. Google Sheets

No new spreadsheet, no new Apps Script project. Once the resolver is fixed, confirm the existing Apps Script sync still fires correctly for individual participants (not just team heads) on bind/campus/event/food writes.

---

## 6. Test Plan

Using the real team from the recording (`team CSK`: `test07` head, `test03`, `test31`, `test09` members), each with their own wristband:

1. Bind a distinct wristband to each of the 4 members at Reception. Verify each bind persists with the correct individual `participant_id` (re-query Supabase, don't trust UI state).
2. Event Desk, `TE03` (or whichever event each is actually registered for): scan each member's wristband independently. Each must resolve to **that individual's** record and registered-events list — not the team head's, not "not found."
3. Scan a member's wristband at an event they did *not* register for → `PARTICIPANT FOUND — NOT REGISTERED FOR THIS EVENT`, showing their real registered events. Never `PARTICIPANT NOT FOUND` for a bound QR.
4. Food Counter: scan each of the 4 members' wristbands independently → each resolves individually, food marked delivered once, blocked on rescan.
5. Query `participant_operational_summary` after the above and confirm `total_registered_events`, `total_events_attended`, and `food_delivered` are correct per individual — not aggregated to the team head.
6. Concurrency check: two simultaneous food-delivery scans on the same participant → exactly one success, one `FOOD ALREADY DELIVERED`.

---

## 7. Acceptance Criteria

- [ ] Root cause of the "found at Reception, not found at Event/Food" mismatch identified and documented (type mismatch / wrong join key / RLS / team-vs-individual keying — state which).
- [ ] Single shared `resolvePhysicalQR` used by Reception, Event Desk, and Food Counter.
- [ ] Every member of a team resolves independently at every desk — verified with all 4 members of `team CSK`.
- [ ] `PARTICIPANT NOT FOUND` only ever shown for a QR that genuinely isn't bound to anyone — never for a bound QR being checked against the wrong event.
- [ ] `participant_operational_summary` (or schema-appropriate equivalent) exists, is indexed correctly, and reflects true counts.
- [ ] No new database, table duplication, spreadsheet, or Apps Script project.
- [ ] Sheets sync still works for individual (non-head) team members.

---

## 8. Final Report Required

1. Root cause (exact table/column/type/RLS issue)
2. Fix applied to the resolver and to Reception's bind write, if changed
3. Schema changes: new views/indexes/FKs added, with the migration SQL actually run
4. Test results for all 4 team members independently, across event + food
5. Confirmation `participant_operational_summary` numbers match manual counts
6. Confirmation no second database/table/spreadsheet was created

Do not report this as fixed until all 4 team members have been independently verified end-to-end (bind → event scan → food scan) against the live Supabase project.
