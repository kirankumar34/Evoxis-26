# EvoXis'26 — Human-Centered Production Readiness Test
### Testing through the eyes of the people who will actually use this on Sept 26

## Why This Framing

Automated phase-by-phase QA checklists are good at finding broken buttons. They're bad at finding the things that actually ruin an event day: a participant from another college stuck on a slow hostel wifi who can't tell if her registration went through, or a first-time volunteer at the gate who doesn't know what to do when the scanner says something unexpected.

This test suite is organized around **who is using the system and what they're trying to do**, not around technical layers. Every scenario is written as a real person's experience. Behind each one is a hidden verification step — what actually has to be true in the database for that person's experience to be genuinely correct, not just look correct on screen.

---

## Hard Rules (unchanged — carry these through every scenario)

- No new database, no new Supabase project, no new Google Sheet, no second Apps Script.
- Don't rebuild working features because a cleaner approach exists.
- A success message on screen is not proof of success — verify the actual database/sheet row every time.
- Don't hide or suppress console/network errors to make a test "pass."
- Don't modify or delete real registration data — use clearly-named test records.
- Every bug gets a root cause, not a cosmetic patch to the message shown on screen.

---

## The People

**Participants (registering from other colleges — outsiders to your campus, your network, your systems):**
- **Divya** — first-year, different college, has never used this site before, on a mid-range Android phone and mobile data, registering herself for one event.
- **Team Nexus** — a 4-member team from another college, one member (the team head) does the registration for everyone, on a laptop at their hostel.
- **Arjun** — registering late at night, spotty wifi, gets halfway through the form and the connection drops.
- **Priya** — already registered two weeks ago, comes back to find her QR pass again because she deleted the confirmation email.
- **Kevin** — accidentally submits the registration form twice because the page felt like it hadn't responded.

**Coordinators & Volunteers (your own college, running the desks on event day):**
- **Reception volunteer (first-year, first event ever run)** — handed a laptop and told "scan their QR, then scan the wristband." Has 10 seconds per participant with a line building up.
- **Event desk coordinator (TE03 — Mind Sparks)** — a tablet at a classroom door, needs to let in only participants registered for this specific event, fast, without arguing with anyone.
- **Senior volunteer / floor lead** — the person other volunteers call over when a scan does something weird, needs to be able to explain to a confused participant *why* something failed, not just that it did.
- **Faculty coordinator / super admin** — checking the dashboard from their phone between sessions to see how registration and check-in numbers are tracking.

---

## Part 1 — Participant Journeys (Registration Portal, from outside)

### Journey 1: Divya — first-time individual registration, on mobile data
Walk through the entire registration form exactly as she would: opening the site on a phone-sized viewport, filling name/email/mobile/college/department/year/gender, picking one event, submitting.

**What must be true, not just look true:**
- Her participant row exists in Supabase with every field she entered, correctly typed (mobile as text/number matching schema, not silently truncated).
- Her event registration links to the actual event she picked — not a default or the first item in a list.
- The Google Sheet gets a row that matches the Supabase row field-for-field, including whatever "how did you hear about us" question exists.
- She receives a QR, and the QR's payload — decoded, not just visually present — matches the token actually stored against her registration.
- Try this on an actual mobile viewport, not just resized desktop chrome: no cut-off buttons, no dropdown she can't open with a thumb, no horizontal scroll.

**Also test what happens when she gets it wrong:** empty required fields, a malformed email, a mobile number that's the wrong length, submitting without picking an event. Every case should give her a clear, specific reason — not a generic error, and definitely not a silent "success" with a broken record underneath.

### Journey 2: Team Nexus — 4-member team registration
The team head fills the form once, entering all 4 members. Confirm each member — head and all 3 others — becomes their own independent participant record, not one record with a "team size: 4" field. This matters enormously later: at the door, each of these 4 people is scanned individually, and if only the head got persisted properly, three real people get turned away.

**What must be true:**
- 4 distinct participant rows, 4 distinct QR tokens.
- Every member's registered-events list is correct and identical (they're on the same team registering for the same event) — no member silently missing an event the others have.
- The confirmation screen the team head sees actually lists all 4 names correctly, not just their own.
- All 4 rows land in the Google Sheet, not just the head's.

Also run this at a smaller (2-member) and larger (up to the actual per-event cap) team size, and deliberately try to submit one member short or one over the cap — confirm the real business rule (not a guess) is enforced with a clear message.

### Journey 3: Arjun — the connection drops mid-registration
Simulate a network interruption partway through submission (not before — after he's hit submit, before a response comes back). What does he see? What actually got written to the database?

**What must be true:** he should never end up in a state where a half-formed registration exists (a participant row with no event registration, or an event registration with no participant). If the request genuinely failed, he should be able to tell it failed and retry safely — retrying should not create a duplicate participant if the first attempt actually did succeed server-side but the response was lost client-side.

### Journey 4: Priya — retrieving a QR pass she already has
She's not registering again — she's coming back to find her existing pass. Test whatever lookup mechanism exists for this (email/mobile lookup, a saved link, etc. — use whatever the actual site provides). Confirm she gets back her real original QR token, not a newly generated one that would invalidate the physical wristband if she'd already been to Reception once before.

### Journey 5: Kevin — the accidental double-submit
Click submit twice in quick succession (or twice deliberately, simulating impatience with a slow response). Confirm the actual business rule around duplicate registrations (reject / merge / return existing — whichever the real system is designed to do) is what actually happens, not an accidental second participant with a second QR for the same person.

---

## Part 2 — Coordinator & Volunteer Journeys (Operations Portal, at the desks)

### Journey 6: The Reception volunteer — a normal check-in
Sit in their seat. A participant walks up with their QR pass on their phone screen. Scan it under realistic conditions — actual camera scanning of an actual phone screen, not typed-in text, including a dim-lit or glare-heavy scan attempt, since that's what the real gate will look like.

**What must be true, and what the volunteer needs to see clearly:**
- Participant identity, college, registration ID, team info (if any), and their full registered-events list — everything the volunteer needs to hand them the right wristband and answer "what am I even registered for?"
- No private information the volunteer doesn't need (no exposing things like raw payment status or internal IDs that would just confuse a first-time volunteer).
- Assign a physical wristband QR, confirm campus entry. Then — critically — walk away and come back, or refresh the page, and scan the same participant's registration QR again: it should say "already checked in" with the original time, not silently let the volunteer redo the whole flow.

### Journey 7: Same volunteer — the things that actually go wrong at a gate
A real reception desk will hit all of these in the first hour. Test each one as a real interruption to the volunteer's flow, not an isolated unit test:
- A QR that doesn't scan cleanly (blurry, low brightness) — does the manual search fallback (name/mobile/reg ID) actually work as a real backup, fast enough that the queue doesn't back up?
- A participant whose QR the scanner reads fine, but the app can't find a matching registration — does the volunteer get a message they can actually act on, or just "not found" with no next step?
- A wristband that's already bound to someone else (a genuine printing/labeling mix-up will happen) — is the volunteer stopped from silently overwriting the existing assignment?
- A participant who insists they registered but nothing comes up — is there a real, working way for the volunteer to search and confirm (not just take the participant's word for it)?

### Journey 8: The event desk coordinator — the actual gatekeeping decision
At the TE03 classroom door, tablet in hand. A wristband gets scanned.

**Three real scenarios this person will face in the first ten minutes, tested as three separate people:**
1. Someone genuinely registered for TE03 — scan, verified, let in, marked present. Confirm this actually writes to the attendance table, not just flips a UI badge.
2. Someone who registered for a *different* event and wandered to the wrong room — the coordinator needs to see, immediately and clearly, what this person *is* registered for, so they can point them the right way without an argument. This must never look identical to "this QR doesn't exist" — a found-but-ineligible participant and a genuinely unknown QR are different situations and need different messages.
3. Someone trying to walk in twice (forgot they already checked in, or testing the system) — "already marked present," original time shown, no second attendance row created.

Then: have this same participant go to a *second* event they're actually registered for (multi-event participant) and confirm event 1's attendance doesn't interfere with event 2's — these are independent facts about the same person.

### Journey 9: The senior volunteer — explaining a failure to a confused participant
This is really a UX/observability test framed as a human moment. When something fails, could the senior volunteer actually explain to the participant *why*, in plain language, based on what's on screen? Or would they be stuck saying "the system says no" with no more information than the participant has? Every error state should carry enough context (which event you're actually registered for, why the wristband failed, whether it's a network problem vs. a genuine ineligibility) that a moderately trained volunteer — not a developer — can resolve or explain it on the spot.

### Journey 10: Two volunteers, same participant, same moment
Realistic event-day chaos: two reception stations, and by coincidence both scan the same participant's wristband for campus check-in within the same second (or two event coordinators at overlapping desks scan the same person for the same event, or two staff try to bind the same wristband to two different participants at the same instant). Only one of these operations should ever "win"; the other should get a clean "already done" / "already assigned," never a duplicate row or a corrupted record. This has to be tested as genuinely concurrent requests, not two sequential clicks.

### Journey 11: The faculty coordinator checking the dashboard from their phone
Between sessions, on a phone, not a desk laptop. Can they actually read the numbers — registered vs. checked in, per-event attendance, any errors or duplicate-scan attempts — without the layout breaking? These numbers need to be real counts from real data at the moment of loading, not stale or cached in a way that misleads someone making a live decision (e.g., "should we open a second line at Reception right now").

---

## Part 3 — Things That Only Show Up When You Follow One Person All the Way Through

### The full journey: Divya, start to finish
Don't test registration and reception and event desk as separate exercises — run **one participant** through the entire real sequence and check the same person's record at every step:

1. Divya registers from her phone, off-campus, for two events.
2. Her Supabase row and Google Sheet row appear and match.
3. Her QR renders and downloads correctly.
4. Days later, on event day, a reception volunteer scans her actual QR (screen or print) — she's found, her two events show correctly.
5. Wristband assigned, campus entry confirmed, re-scanning her registration QR shows "already checked in."
6. She goes to event 1's desk — recognized, marked present.
7. She goes to event 2's desk — recognized independently, marked present, event 1's attendance untouched.
8. She (accidentally, or a friend testing) tries walking into an event she didn't register for — clearly told she's not registered there, shown her real list, not let in.
9. Someone tries scanning her wristband again at event 1 — "already present," no duplicate.
10. At the end, her Supabase record and Google Sheet row reflect all of the above accurately.

This single thread catches integration bugs that per-feature testing misses — a token format mismatch between registration and reception, a wristband binding that silently succeeds in the UI but not the database, an event check that reads the wrong participant ID.

### The full journey: Team Nexus, all 4 members, independently
Same idea, but for a team. Confirm all 4 members can independently go through reception → wristband → event attendance, with **none of them collapsing into the team head's identity** at any step. This is the single most common place team-based systems quietly break.

---

## Part 4 — Cross-Cutting Realities (test these across all the journeys above, don't treat as separate)

- **Old vs. new QR formats:** if any earlier-issued QR codes exist from before recent changes, confirm they still resolve correctly at Reception and Event Desk — don't break attendees who registered before a recent fix.
- **Refresh / back button / multiple tabs:** at every critical screen (registration confirmation, QR pass, reception scan result, event desk scan result), hitting refresh or opening a second tab shouldn't lose or duplicate anything, because this is exactly what a nervous participant or a rushed volunteer will do.
- **Authorization boundaries:** a food-counter-only account shouldn't be able to mark event attendance; an event coordinator shouldn't be able to edit someone else's registration; confirm this by trying the action, not by reading the UI and assuming it's hidden equally on the backend.
- **What happens when the network genuinely dies mid-scan:** the volunteer must see "not recorded, try again," never a false "success" — a false positive here means someone gets turned away later at an event they were actually marked present for, or vice versa.

---

## Bug Reporting Format (keep this discipline, but write the symptom as the human moment)

For every bug found:

| Field | Example |
|---|---|
| **Who hit this** | Reception volunteer, scanning a team member's wristband |
| **What they experienced** | Scanner showed "Participant Not Found" for a wristband that had just been successfully bound |
| **Root cause** | Event Desk queried `registration.qr_token` directly instead of joining through `physical_qr_assignments.participant_id` |
| **Severity** | P0 — blocks check-in entirely |
| **Fix** | [what was actually changed] |
| **Reverified as** | [which persona/journey above, re-run end to end] |

Severity guide: **P0** = blocks a real person from registering or entering an event · **P1** = wrong information shown or wrong data written, but a workaround exists · **P2** = a real feature broken but not blocking · **P3/P4** = cosmetic or minor friction. Fix all P0/P1/P2 before calling this production-ready.

---

## Final Sign-Off

Don't declare production-ready from a checklist of green ticks. Declare it because you can say, with a straight face, that Divya, Team Nexus, the reception volunteer, and the event desk coordinator all had the experience described above — verified against the real database, not the screen — on the actual system, on both a phone and a desk laptop, under a bad network as well as a good one, with two people scanning at once.

**Final report must include:**
1. Overall status — production ready / not ready, and why
2. Every journey above, pass/fail, with the human symptom described if it failed
3. Bug table (format above), all P0/P1/P2 resolved
4. Explicit confirmation: old QR compatibility intact, no new database/sheet/project created, RLS boundaries actually enforced (tested, not assumed), concurrency scenarios (Journey 10) passed
5. Anything still broken, stated plainly — not glossed over

If any P0 or P1 remains: **NOT PRODUCTION READY.** Say so directly.
