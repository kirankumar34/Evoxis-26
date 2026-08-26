# EvoXis'26 — Full Data Reset & Rebuild on Corrected Schema, With Real-Time Sync

## Story

Wipe all existing data in the Supabase database and the `EvoXis26_Master_Database` Google Sheet, rebuild both on the corrected schema (`EvoXis26_Reference_Schema.xlsx`), and add real-time Supabase → Sheets sync so both websites always reflect the same live state — with **zero visible change** to the registration website's content, layout, or user-facing behavior.

---

## ⚠️ Non-Negotiable Safety Gate — Read Before Touching Anything

This task deletes data. Before any `DROP`, `TRUNCATE`, or `DELETE` runs:

1. **Determine what's actually in the database right now.** Query row counts on every table. If every row traces back to test/sample data (patterns like `test07`, `EVX26-TEST-*`, `Kiran Kumar`/`Avengers`, or similar obviously-fabricated records), proceed. **If any row looks like a real person's real registration (a name/email/mobile that isn't a known test pattern), STOP and get explicit human confirmation before deleting anything.** Do not guess — ask.
2. **Take a full backup regardless of step 1's answer.** Export every Supabase table to CSV/SQL dump, and duplicate the entire Google Sheet (File → Make a copy, timestamped) before any deletion. This is mandatory even if you've confirmed it's all test data — the backup is what makes this operation reversible if the migration itself goes wrong.
3. **Do not proceed to rebuild until the backup is verified readable** — actually open the exported files and confirm they contain what you expect, don't just trust that the export command exited 0.

If you cannot complete steps 1–3, do not proceed with deletion. Report back instead of guessing.

---

## Hard Constraints

- Same Supabase project, same Google Sheet (`EvoXis26_Master_Database`, ID `1HRFhwmf-YbSHm5CJ3bc6y6QbEzf0MpYoyXpu1DB1vfo`), same Apps Script Web App. No new project, no new spreadsheet, no new script deployment.
- **Registration website: zero content/UI change.** Same form fields, same copy, same layout, same routes, same visual design. The only change permitted anywhere in that codebase is *how and when* data gets written and synced — never *what the user sees or fills in*.
- Operations Portal continues working against the same tables — update its queries only where the schema rename/restructure requires it (e.g. `wristband_qr_master` → `physical_qr_master`), nothing else.
- No data loss **going forward**: once rebuilt, every registration, event signup, wristband bind, attendance, and food delivery must persist correctly and sync in real time. (Data loss *of the old test data being deleted* is the explicit point of this task — don't confuse the two.)

---

## Target Schema

Use `EvoXis26_Reference_Schema.xlsx` (already produced) as the canonical structure. Key corrections it encodes, which this rebuild must implement — not just replicate the old broken shape with new data in it:

| Table | What must be true this time |
|---|---|
| `participants` | **One row per individual human** — every team member, not just the team head. This was the root cause of the "PARTICIPANT NOT FOUND" bugs; do not reintroduce it. |
| `registrations` | Transaction-level only (payment, type, timestamps). No duplicated personal fields — those live once, on `participants`. |
| `qr_token` | Lives once, on `participants`. Not duplicated onto `registrations` or `team_members`. |
| `event_registrations` | One row per participant per event — every team member gets their own row for every event the team registered for. |
| `technical_registration` / `nontechnical_registration` / `special_events_registration` | Treated as **derived mirrors** of `event_registrations`, generated at sync time — never separately hand-written by application code. |
| `physical_qr_master` (renamed from `wristband_qr_master`) | Generalized `qr_type` (`WRISTBAND` / `ID_CARD`), same binding rules as before (unique per code, one active per participant). |
| `qr_binding_log` (renamed from `wristband_binding_log`) | Same structure, generalized naming. |
| `event_attendance` | **Merged replacement** for the old `attendance_logs` + `event_participation_log` — one table, one write per scan, no duplicate logging of the same fact. |
| `food_delivery` | **New table** — did not exist before. One row per participant, idempotent delivery marking. |

Before writing migration DDL, re-verify actual current column types in the live Supabase project (UUID vs text on every join key especially — this was flagged as a likely silent-failure source in prior debugging) rather than assuming the reference file's types are exactly what's live today.

---

## Tasks

### Phase 1 — Backup (see safety gate above — do this first, unconditionally)
- [ ] Export every existing Supabase table to CSV and/or a full `pg_dump`.
- [ ] Duplicate the Google Sheet with a timestamped name (e.g. `EvoXis26_Master_Database_BACKUP_2026-08-26`).
- [ ] Verify both backups by actually opening them.

### Phase 2 — Rebuild Supabase Schema
- [ ] Drop and recreate tables per the target schema above (or `ALTER` in place where a straight rename/column-add suffices — prefer `ALTER` over `DROP`+`CREATE` wherever it avoids unnecessary risk).
- [ ] Add foreign keys on every join relationship (not just conventionally-named columns) so type mismatches fail loudly at write time.
- [ ] Add unique constraints: `physical_qr_master.qr_code` unique; one active physical QR per `participant_id` (partial unique index on `active`); `event_attendance(participant_id, event_id)` unique; `food_delivery.participant_id` unique (or `(participant_id, meal_id)` if multiple meals/day are needed).
- [ ] Add indexes on every column looked up during a scan: `physical_qr_master.qr_code`, `physical_qr_master.participant_id`, `event_attendance(participant_id, event_id)`, `food_delivery.participant_id`, `event_registrations.participant_id`.
- [ ] Re-apply RLS policies per role (`RECEPTION`, `EVENT_COORDINATOR`, `FOOD_COUNTER`, `SUPER_ADMIN`) — do not leave tables open by default after a rebuild.
- [ ] Run the integrity-check queries from `Data_Integrity_Checks` (translate the spreadsheet's formulas into SQL — e.g. the orphan-row checks) against the empty/rebuilt schema to confirm structure before any data goes in.

### Phase 3 — Rebuild Google Sheets
- [ ] Clear all data rows in every tab (`Overall_Registration_Details`, `Overall_Technical_Registration`, `Overall_NonTechnical_Registration`, `Special_Events_Registration`, `Attendance_Log`, and any others in current use) — keep the spreadsheet itself, keep tab names unless the schema rename requires updating them to match (e.g. a wristband-related tab).
- [ ] Rebuild header rows to match the corrected schema's columns exactly, in the same column order the Apps Script expects (verify order in `Code.js`, don't assume).
- [ ] Format the mobile-number column as **Plain Text** before any data is written into it, in every tab that carries it — this was flagged as a silent leading-zero/scientific-notation risk.

### Phase 4 — Update Apps Script (`Code.js`)
- [ ] Update field mappings for any renamed/restructured columns (`wristband_qr_master` → `physical_qr_master`, the merged `event_attendance` table, the new `food_delivery` table).
- [ ] Ensure the three category-specific sheets (`technical_registration` etc.) are written **per participant**, not just per team head — this was the actual bug; the Apps Script write logic must loop over every participant in a team's event registration, not just the submitting user.
- [ ] Do not add a second Apps Script project or a second Web App deployment — extend the existing one.

### Phase 5 — Registration Website: Backend-Only Changes
This is the phase with the tightest constraint. Confirm before and after that the rendered UI is pixel-identical — same fields, same copy, same flow.
- [ ] Update the write path so that submitting a team registration creates **one `participants` row per member** (not just the submitter) and **one `event_registrations` row per member per event** — this is a backend data-modeling fix, not a UI change; the form itself already presumably collects all member details, it's the write logic that was previously collapsing them.
- [ ] Move `qr_token` generation/storage to be per-participant, stored once on `participants` (remove any duplicate write to `registrations.qr_token` or a team-members-level token field if those still exist in code after the schema rebuild).
- [ ] Confirm the confirmation screen and downloadable QR pass still render exactly as before for the submitting user — only the underlying persistence changed.

### Phase 6 — Real-Time Sync (Supabase → Sheets)
The core new requirement: Sheets should reflect a write within seconds, not on a delay or only when someone happens to trigger a manual sync.
- [ ] Implement via a Postgres trigger + Supabase Edge Function (or equivalent) that fires on `INSERT`/`UPDATE` to the relevant tables and calls the existing Apps Script Web App endpoint immediately — do not poll on an interval as the primary mechanism; polling is a fallback, not the design.
- [ ] Make the sync call **idempotent and retried with backoff** on failure — a transient Apps Script/network failure must not silently drop the row. Log failed sync attempts to a durable table (e.g. `sync_failure_log`) rather than losing them, and either auto-retry or surface them to Super Admin for manual replay.
- [ ] Sync direction is one-way (Supabase → Sheets) unless an existing workflow already requires the reverse — do not introduce bidirectional sync unless it's confirmed to already exist, since that adds conflict-resolution complexity this task doesn't need.
- [ ] Confirm the sync mechanism covers every write type: new registration, new participant (including individual team members), event registration, wristband bind, campus check-in, event attendance, food delivery.

### Phase 7 — Verification
- [ ] Re-run the `Data_Integrity_Checks` logic (SQL equivalents) against the rebuilt, now-populated schema after test data is re-entered.
- [ ] Run the full team-registration flow (2+ members) end to end: registration → every member gets their own participant/QR → reception binds each member's wristband independently → event desk resolves each member independently → food counter resolves each member independently → confirm every one of these writes appears in the Google Sheet within a few seconds, not after a manual trigger.
- [ ] Kill the network to the Apps Script endpoint mid-test and confirm a write still succeeds in Supabase, gets queued/logged, and syncs once connectivity returns — this proves "no data loss," not just "sync works when everything is healthy."
- [ ] Visually diff the registration website before and after — confirm literally nothing changed on screen.

---

## Definition of Done

- [ ] Full backup taken and verified before any deletion occurred.
- [ ] Old data cleared from both Supabase and Google Sheets.
- [ ] Schema rebuilt matching `EvoXis26_Reference_Schema.xlsx`, with live-schema type verification done first (not assumed).
- [ ] Registration website UI/content/copy/layout unchanged — confirmed by direct before/after comparison.
- [ ] Every team member (not just the head) independently persists, resolves, and is scannable at every desk.
- [ ] Real-time sync verified working within seconds of a write, for every write type, including a simulated network-failure recovery test.
- [ ] RLS policies re-applied and tested per role, not left open.
- [ ] No second Supabase project, no second Google Sheet, no second Apps Script deployment.
- [ ] Integrity checks pass clean against the rebuilt, populated schema.

---

## Final Report Required

1. Confirmation of what was actually in the database pre-migration (test data vs. real data), and how that was determined
2. Backup location(s) and verification method
3. Exact DDL run to rebuild Supabase (migrations, not prose)
4. Exact Google Sheets tabs cleared/rebuilt, and header mapping used
5. Apps Script changes made, with before/after diff summary
6. Registration website changes — confirm explicitly these were backend-only, with the before/after UI comparison result
7. Real-time sync mechanism implemented (trigger/Edge Function design), including the failure-recovery test result
8. Full team-registration end-to-end test result, covering every member independently
9. Confirmation: no new database/project/spreadsheet/script created
10. Any remaining manual step required (e.g. re-entering real registrant data from backup, if any existed)

Do not report this complete until the real-time sync has been verified under a simulated failure, and the team-registration end-to-end flow has been confirmed correct for every member — not just the team head — on the live rebuilt system.
