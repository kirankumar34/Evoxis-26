# EvoXis'26 — Operations Portal Spec
### Reception Desk · Event Desk · Food Counter · Super Admin

**Status:** Ready for autonomous coding agent
**Depends on:** EvoXis'26 participant registration site (unchanged, do not modify)
**Event date:** September 26, 2026

---

## 1. Purpose

Build a **second, separate application** — the operations portal — used on the event day by reception, event coordinators, food counters, and super admin. It does not register participants; it verifies, checks in, tracks event attendance, and distributes food for people who already registered on the existing site.

---

## 2. Hard Constraints (do not violate)

| # | Constraint |
|---|---|
| 1 | **Supabase is the primary database and single source of truth.** Reuse the existing project — do not create a new Supabase project. |
| 2 | Google Sheets (`EvoXis26_Master_Database`, ID `1HRFhwmf-YbSHm5CJ3bc6y6QbEzf0MpYoyXpu1DB1vfo`) is a **synced mirror**, kept updated via the existing Apps Script Web App. Do not create a second spreadsheet or a second Apps Script project — extend `Code.js` only if a required sync action doesn't exist yet. |
| 3 | No new participant/registration records are ever created by this app. It only reads existing registrations and writes *operational* state (check-in, attendance, food, QR assignment). |
| 4 | The existing registration website's code, schema, and workflow are untouched. |
| 5 | No Supabase service-role key in the frontend. All writes that enforce business rules (duplicate checks, event-eligibility checks) go through **Postgres RPC functions / Edge Functions**, not raw client-side `update()` calls. |
| 6 | Every state-changing operation (QR assignment, campus check-in, event attendance, food delivery) must be **atomic and idempotent** at the database layer — never enforced only in React state. |
| 7 | No payment processing, no certificate generation, no wristband manufacturing workflow. Scope is strictly check-in / attendance / food. |

---

## 3. System Architecture

```
┌─────────────────────────┐
│ Registration Website     │  (existing, untouched)
└────────────┬─────────────┘
             │ writes registrations
             ▼
     ┌───────────────────┐
     │   SUPABASE (PG)    │  ◄── single source of truth
     │  existing project  │
     └─────────┬──────────┘
      ┌─────────┼──────────────────┐
      ▼         ▼                  ▼
 Reception   Event Desk        Food Counter
   App          App                App
      │         │                  │
      └─────────┴─────────┬────────┘
                           ▼
              Existing Apps Script Web App
                           │
                           ▼
              EvoXis26_Master_Database (Sheets)
                        (mirror)
```

New apps talk to Supabase directly (via RPC functions for anything that must be atomic). Supabase → Sheets sync happens via the existing Apps Script endpoint, triggered either by a Postgres webhook/Edge Function on write, or by the frontend calling the existing sync action after a successful write — match whatever pattern the current registration site already uses for its own Sheets sync, and reuse that exact mechanism rather than inventing a second one.

**Before writing any code**, the agent must inspect the live Supabase schema (`information_schema.tables`, existing RLS policies, existing Apps Script `Code.js` actions) and confirm actual current state — do not assume table/column names from this document without verifying them against the live project first.

---

## 4. Data Model

Reuse existing tables (`participants`, `registrations`, `event_registrations`, `teams`/`team_members`, `event_master`) — do not duplicate them. Add the following if they don't already exist:

### `physical_qr_assignments`
```sql
create table if not exists physical_qr_assignments (
  id uuid primary key default gen_random_uuid(),
  physical_qr_id text not null unique,        -- e.g. WRIST-EVX-000125
  physical_qr_type text not null check (physical_qr_type in ('ID_CARD','WRISTBAND')),
  participant_id uuid not null references participants(id),
  registration_id text not null,
  assigned_at timestamptz not null default now(),
  assigned_by uuid not null references staff_users(id),
  active boolean not null default true,
  unique (participant_id, active) -- enforce one active QR per participant; see note below
);
```
> Postgres can't do a partial-unique-on-boolean directly in a plain `unique()` — use a **partial unique index** instead: `create unique index one_active_qr_per_participant on physical_qr_assignments (participant_id) where active;`

### `campus_attendance`
```sql
create table if not exists campus_attendance (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) unique, -- one row per participant, idempotency by upsert
  physical_qr_id text not null,
  checkin_time timestamptz not null default now(),
  checkin_by uuid not null references staff_users(id),
  station text
);
```

### `event_attendance`
```sql
create table if not exists event_attendance (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id),
  event_id text not null references event_master(event_id),
  checkin_time timestamptz not null default now(),
  checkin_by uuid not null references staff_users(id),
  station text,
  unique (participant_id, event_id) -- idempotency: duplicate scan = conflict, not new row
);
```

### `food_delivery`
```sql
create table if not exists food_delivery (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants(id) unique, -- adjust to (participant_id, meal_id) if multiple meals/day exist
  delivered_time timestamptz not null default now(),
  delivered_by uuid not null references staff_users(id),
  station text
);
```

### `operation_audit_log`
```sql
create table if not exists operation_audit_log (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz not null default now(),
  staff_user uuid references staff_users(id),
  station text,
  operation text not null,        -- QR_ASSIGNMENT | CAMPUS_CHECKIN | EVENT_CHECKIN | FOOD_DELIVERY
  participant_id uuid,
  registration_id text,
  physical_qr_id text,
  event_id text,
  result text not null,           -- SUCCESS | DUPLICATE | DENIED | ERROR
  reason text
);
```

**Idempotency pattern:** every state-changing RPC does `insert ... on conflict (...) do nothing returning *`, then checks whether a row was returned. If not, it means the record already existed — return the existing row's status ("already checked in" / "already delivered" / "already present") instead of raising an error. Log the attempt either way in `operation_audit_log` with `result = 'DUPLICATE'`.

---

## 5. Roles & Access Control

Roles: `SUPER_ADMIN`, `RECEPTION`, `EVENT_COORDINATOR`, `FOOD_COUNTER`.

- Store role on a `staff_users` table (or reuse existing auth if the registration site already has staff accounts — check before creating a new one).
- Enforce with **Supabase RLS policies** scoped by role, not just UI hiding. A `FOOD_COUNTER` account must be structurally unable to write to `event_attendance`, even via a crafted request.
- `EVENT_COORDINATOR` sessions carry an assigned `event_id` (or set of event_ids for multi-desk staff) — RLS/RPC checks that writes to `event_attendance` match the coordinator's assigned event(s).
- Only `SUPER_ADMIN` may call an override RPC (e.g. `admin_override_event_attendance`) that bypasses the eligibility check, and that override must still write to `operation_audit_log` with `reason = 'ADMIN_OVERRIDE'`.

| Role | Reads | Writes |
|---|---|---|
| SUPER_ADMIN | everything | everything, incl. overrides |
| RECEPTION | registration lookup, QR assignment status | `physical_qr_assignments`, `campus_attendance` |
| EVENT_COORDINATOR | participant eligibility for assigned event | `event_attendance` (assigned event only) |
| FOOD_COUNTER | food eligibility/status | `food_delivery` |

---

## 6. Core Workflows

### 6.1 Reception (`/reception`)
1. Scan **registration QR** (the one the participant already has from signup) → RPC `lookup_registration_by_qr(token)` → returns registration + team + registered events. Show only operationally relevant fields (name, photo, college, dept, year, mobile, email, reg type, team name/role, registered events, current campus status) — no internal IDs or raw tokens on screen.
2. Scan **physical QR** (wristband/ID card, distinct from the registration QR) → RPC `assign_physical_qr(participant_id, physical_qr_id, qr_type, staff_id)`.
   - Rejects if `physical_qr_id` already active on another participant → `"QR already assigned to another participant."`
   - Rejects if participant already has an active QR → `"Participant already has an assigned QR."` (only SUPER_ADMIN-authorized reception flow may deactivate-and-reassign).
3. "Confirm & Mark Present" → RPC `mark_campus_present(participant_id, physical_qr_id, staff_id, station)`, idempotent via the `campus_attendance` unique-per-participant pattern above.
4. Manual search fallback (name / registration ID / mobile / email) must route into the exact same verification screen and be subject to the same rules — it is not a bypass path.

### 6.2 Event Desk (`/events/:eventId/scan`)
1. Desk is bound to one `event_id` at load (from station config or coordinator's assignment — never trust an `event_id` sent loosely from the client for the write itself; the RPC should re-derive/validate it server-side against the coordinator's session).
2. Scan physical QR → RPC `mark_event_present(physical_qr_id, event_id, staff_id, station)`:
   - Look up participant via `physical_qr_assignments`.
   - Look up participant's registered events.
   - If `event_id` not in that set → **do not write** → return `NOT_REGISTERED` with the participant's actual registered event list, so the UI can show "You're not registered for this event — your events are: …".
   - If already present for this event → return `ALREADY_PRESENT` with original check-in time (from the `unique(participant_id, event_id)` conflict).
   - Otherwise insert and return `SUCCESS`.

### 6.3 Food Counter (`/food/scan`)
1. Scan physical QR → RPC `mark_food_delivered(physical_qr_id, staff_id, station)`:
   - Look up participant, confirm food eligibility (whatever field/logic the registration schema already encodes for this — verify it exists before assuming).
   - Idempotent insert on `food_delivery`; conflict → return `ALREADY_DELIVERED` with original time/station.

### 6.4 Teams
Team registration already stores members individually on the registration side. Every RPC above operates on `participant_id`, never on a team-level ID — each team member gets their own physical QR, campus check-in, event attendance, and food delivery, independent of teammates.

---

## 7. Scan-Result States (exact copy, use verbatim in UI)

| State | Message |
|---|---|
| Success | `✓ PRESENT` |
| Duplicate | `ALREADY PRESENT` / `FOOD ALREADY DELIVERED` |
| Invalid QR | `INVALID QR` |
| Wrong event | `NOT REGISTERED FOR THIS EVENT` (+ list of their actual events) |
| Unassigned QR | `QR NOT ASSIGNED` |
| Not found | `PARTICIPANT NOT FOUND` |
| QR conflict | `QR ASSIGNED TO ANOTHER PARTICIPANT` |
| Offline | `Connection unavailable. Attendance was NOT recorded.` (never show a false success) |

---

## 8. Dashboards (Super Admin)

- Overview: total registered, campus present/absent, QR assigned/unassigned, event registrations total, food delivered/pending, recent scans, recent errors, duplicate-scan attempts.
- Per-event: registered / present / absent, attendance %, current desk, recent scans.
- Food: eligible / delivered / pending, delivery %, recent deliveries, duplicate attempts.
- Reception: total registrations, checked-in, remaining, QR assigned/pending, recent check-ins.

All figures come from live Supabase queries (indexed on `physical_qr_id`, `event_id`, `registration_id`, `participant_id`) — do not load the full participant table client-side to compute these.

---

## 9. Routes

```
/login
/dashboard
/reception            /reception/scan        /reception/assign
/events               /events/:eventId       /events/:eventId/scan
/food                 /food/scan
/participants/:id
/audit
/settings
```

---

## 10. UI Requirements

- Mobile/tablet-first — this runs on Android phones, tablets, and desk laptops on event day.
- Large camera preview, large scan button, large status banner, minimal typing.
- Auto-return to scanning state after a successful operation.
- Station and (for event desks) current event always visible on screen.
- Do not reuse the registration site's forms/UI — this is a distinct, scan-first app.

---

## 11. Testing Requirements

Write and pass automated tests (plus one manual end-to-end pass against the live Supabase project before sign-off) for:

1. Valid registration QR scan → correct participant + events shown.
2. Assign unused physical QR → link created.
3. Campus check-in → `PRESENT`.
4. Duplicate campus check-in → `ALREADY PRESENT`, no new row.
5. Correct-event scan → attendance marked.
6. Wrong-event scan → denied, no row written, correct event list shown.
7. Duplicate event scan → `ALREADY PRESENT`, no new row.
8. Food scan → delivered.
9. Duplicate food scan → `ALREADY DELIVERED`, no new row.
10. Team of 4 → each member independently checks in / attends events / gets food.
11. Invalid/unregistered QR → `PARTICIPANT NOT FOUND`, no writes.
12. Assign already-assigned physical QR to a different participant → rejected, no overwrite.
13. **Concurrency test:** two simultaneous requests marking the same participant's food delivered → exactly one `SUCCESS`, one `ALREADY_DELIVERED`, one row in the table.

---

## 12. Definition of Done

- [ ] Registration website unmodified.
- [ ] Same Supabase project reused; no new project/database.
- [ ] Existing registrations readable and displayed correctly.
- [ ] Registration QR and physical QR are distinct and both scannable.
- [ ] Physical QR assignment stored, duplicate assignment blocked.
- [ ] Campus check-in works and is idempotent.
- [ ] Event desk enforces correct-event-only attendance, idempotent, override restricted to SUPER_ADMIN.
- [ ] Food delivery idempotent, backend-enforced.
- [ ] Teams handled per-individual, not per-team.
- [ ] All operations logged to `operation_audit_log`.
- [ ] Sheets sync uses the existing Apps Script endpoint — no second spreadsheet, no second Apps Script.
- [ ] RLS/role checks enforced server-side, not just hidden in UI.
- [ ] Concurrency/atomicity test passes against the live project.
- [ ] Dashboards query live, indexed data (no full-table client loads).

---

## 13. Final Report (required from the coding agent on completion)

1. App structure and routes created
2. Supabase tables reused vs. newly added (with the exact migration SQL run)
3. RLS policies added
4. Existing Apps Script actions reused; any new actions added to `Code.js`
5. QR assignment, campus attendance, event attendance, and food delivery models — as actually implemented
6. Idempotency/atomicity mechanism used for each write path
7. Role/permission model as implemented
8. Sheets sync mechanism and confirmation it mirrors the existing pattern
9. Test results, including the concurrency test
10. Any manual configuration steps required (staff accounts, station config, event_id list)

**Do not report this as complete until the real scanner workflow has been tested against the live EvoXis'26 Supabase project and Sheets mirror.**
