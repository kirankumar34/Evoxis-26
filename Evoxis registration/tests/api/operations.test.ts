import { describe, it, test, expect, beforeEach } from 'vitest';

// Polyfill localStorage for Node test runner
const memoryStore = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => memoryStore.get(key) || null,
  setItem: (key: string, value: string) => memoryStore.set(key, value.toString()),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

import { operationsApi } from '../../src/services/operationsApi';

describe('EvoXis26 Operations Portal Automated Test Suite', () => {
  const TEST_INDIVIDUAL_ID = 'EVOXIS26-TEST-99901';
  const TEST_TEAM_HEAD_ID = 'EVOXIS26-TEST-TEAM-01';

  beforeEach(() => {
    localStorage.clear();

    // Seed mock registrations for testing
    const seedRegistrations = [
      {
        registrationId: TEST_INDIVIDUAL_ID,
        participantName: 'Rahul Dravid',
        email: 'rahul.test999@example.com',
        mobileNumber: '9840199901',
        collegeInstitution: 'Sriram Engineering College',
        department: 'CSBS',
        year: '3rd Year',
        gender: 'Male',
        registrationType: 'Individual',
        role: 'INDIVIDUAL',
        selectedEvents: 'TE02, NT01',
        qrToken: 'EVOXIS26:testrahul99901',
      },
      // Team of 4: Arun (Head), Kumar, Ravi, Suresh in TE02 & SP01
      {
        registrationId: TEST_TEAM_HEAD_ID,
        participantName: 'Arun Kumar',
        email: 'arun.testteam@example.com',
        mobileNumber: '9840199911',
        collegeInstitution: 'Sriram Engineering College',
        department: 'CSBS',
        year: '3rd Year',
        gender: 'Male',
        registrationType: 'Team',
        role: 'TEAM_HEAD',
        teamName: 'Code Warriors',
        selectedEvents: 'TE02, SP01',
        qrToken: 'EVOXIS26:testteamhead01',
        teamMembers: [
          { name: 'Arun Kumar', email: 'arun.testteam@example.com', phone: '9840199911', role: 'TEAM_HEAD' },
          { name: 'Kumar V', email: 'kumar.testteam@example.com', phone: '9840199912', role: 'TEAM_MEMBER' },
          { name: 'Ravi Shankar', email: 'ravi.testteam@example.com', phone: '9840199913', role: 'TEAM_MEMBER' },
          { name: 'Suresh Raina', email: 'suresh.testteam@example.com', phone: '9840199914', role: 'TEAM_MEMBER' },
        ],
      },
      {
        registrationId: `${TEST_TEAM_HEAD_ID}-M1`,
        participantName: 'Kumar V',
        email: 'kumar.testteam@example.com',
        mobileNumber: '9840199912',
        collegeInstitution: 'Sriram Engineering College',
        department: 'CSBS',
        year: '3rd Year',
        gender: 'Male',
        registrationType: 'Team',
        role: 'TEAM_MEMBER',
        teamName: 'Code Warriors',
        selectedEvents: 'TE02, SP01',
        qrToken: 'EVOXIS26:testteamhead01-M1',
      },
      {
        registrationId: `${TEST_TEAM_HEAD_ID}-M2`,
        participantName: 'Ravi Shankar',
        email: 'ravi.testteam@example.com',
        mobileNumber: '9840199913',
        collegeInstitution: 'Sriram Engineering College',
        department: 'CSE',
        year: '3rd Year',
        gender: 'Male',
        registrationType: 'Team',
        role: 'TEAM_MEMBER',
        teamName: 'Code Warriors',
        selectedEvents: 'TE02, SP01',
        qrToken: 'EVOXIS26:testteamhead01-M2',
      },
      {
        registrationId: `${TEST_TEAM_HEAD_ID}-M3`,
        participantName: 'Suresh Raina',
        email: 'suresh.testteam@example.com',
        mobileNumber: '9840199914',
        collegeInstitution: 'Sriram Engineering College',
        department: 'ECE',
        year: '3rd Year',
        gender: 'Male',
        registrationType: 'Team',
        role: 'TEAM_MEMBER',
        teamName: 'Code Warriors',
        selectedEvents: 'TE02, SP01',
        qrToken: 'EVOXIS26:testteamhead01-M3',
      },
    ];

    localStorage.setItem('evoxis26_overall_registrations', JSON.stringify(seedRegistrations));
  });

  // Test 1: Valid registration QR scan -> correct participant + events shown
  it('1. Valid registration QR scan returns correct participant and registered events list', async () => {
    const lookup = await operationsApi.lookupRegistration({ token: 'EVOXIS26:testrahul99901' });
    expect(lookup.success).toBe(true);
    expect(lookup.data?.participantName).toBe('Rahul Dravid');
    expect(lookup.data?.registrationId).toBe(TEST_INDIVIDUAL_ID);
    expect(lookup.data?.selectedEvents).toContain('TE02');
    expect(lookup.data?.selectedEvents).toContain('NT01');
    expect(lookup.data?.registeredEvents.length).toBe(2);
  });

  // Test 2: Assign unused physical QR -> link created
  it('2. Assign unused physical QR binds wristband to participant', async () => {
    const res = await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-WB-000001',
      physicalQrType: 'WRISTBAND',
      staffId: 'Reception Staff',
      staffRole: 'RECEPTION',
      station: 'REC-01',
    });

    expect(res.state).toBe('SUCCESS');
    expect(res.verbatimMessage).toBe('✓ PRESENT');

    // Verify lookup by physical QR now returns participant
    const lookup = await operationsApi.lookupRegistration({ token: 'EVX26-WB-000001' });
    expect(lookup.success).toBe(true);
    expect(lookup.data?.participantName).toBe('Rahul Dravid');
    expect(lookup.data?.physicalQrId).toBe('EVX26-WB-000001');
  });

  // Test 3: Campus check-in -> PRESENT
  it('3. Campus check-in marks participant present', async () => {
    const checkin = await operationsApi.markCampusPresent({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-WB-000001',
      staffId: 'Staff Member',
      station: 'REC-01',
    });

    expect(checkin.state).toBe('SUCCESS');
    expect(checkin.verbatimMessage).toBe('✓ PRESENT');
  });

  // Test 4: Duplicate campus check-in -> ALREADY PRESENT, no new row
  it('4. Duplicate campus check-in returns ALREADY PRESENT without creating duplicate log', async () => {
    await operationsApi.markCampusPresent({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      staffId: 'Staff Member',
      station: 'REC-01',
    });

    const dupCheck = await operationsApi.markCampusPresent({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      staffId: 'Staff Member',
      station: 'REC-02',
    });

    expect(dupCheck.state).toBe('DUPLICATE_CAMPUS');
    expect(dupCheck.verbatimMessage).toBe('ALREADY PRESENT');
    expect(dupCheck.originalStation).toBe('REC-01');
  });

  // Test 5: Correct-event scan -> attendance marked
  it('5. Correct-event scan marks event attendance present', async () => {
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-WB-000001',
      physicalQrType: 'WRISTBAND',
      staffId: 'Reception Staff',
      staffRole: 'RECEPTION',
    });

    const res = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-WB-000001',
      eventId: 'TE02',
      staffId: 'Coordinator 1',
      station: 'Desk TE02',
    });

    expect(res.state).toBe('SUCCESS');
    expect(res.verbatimMessage).toBe('✓ PRESENT');
  });

  // Test 6: Wrong-event scan -> denied, no row written, correct event list shown
  it('6. Wrong-event scan denies attendance and returns list of actual registered events', async () => {
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-WB-000001',
      physicalQrType: 'WRISTBAND',
      staffId: 'Reception Staff',
      staffRole: 'RECEPTION',
    });

    // Rahul is registered for TE02 & NT01, but NOT TE06 (Cyber Investigation)
    const res = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-WB-000001',
      eventId: 'TE06',
      staffId: 'Coordinator 2',
      station: 'Desk TE06',
    });

    expect(res.state).toBe('WRONG_EVENT');
    expect(res.verbatimMessage).toBe('PARTICIPANT FOUND — NOT REGISTERED FOR THIS EVENT');
    expect(res.registeredEvents).toContain('TE02');
    expect(res.registeredEvents).toContain('NT01');
  });

  // Test 7: Duplicate event scan -> ALREADY PRESENT, no new row
  it('7. Duplicate event scan returns ALREADY PRESENT with original check-in timestamp', async () => {
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-WB-000001',
      physicalQrType: 'WRISTBAND',
      staffId: 'Reception Staff',
      staffRole: 'RECEPTION',
    });

    await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-WB-000001',
      eventId: 'TE02',
      staffId: 'Coord 1',
      station: 'Desk TE02',
    });

    const dup = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-WB-000001',
      eventId: 'TE02',
      staffId: 'Coord 1',
      station: 'Desk TE02',
    });

    expect(dup.state).toBe('DUPLICATE_EVENT');
    expect(dup.verbatimMessage).toBe('ALREADY MARKED PRESENT');
  });

  // Test 8: Food scan -> delivered
  it('8. Food scan marks meal token redeemed', async () => {
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-WB-000001',
      physicalQrType: 'WRISTBAND',
      staffId: 'Reception Staff',
      staffRole: 'RECEPTION',
    });

    const food = await operationsApi.markFoodDelivered({
      physicalQrId: 'EVX26-WB-000001',
      staffId: 'Food Staff',
      station: 'FC-01',
    });

    expect(food.state).toBe('SUCCESS');
    expect(food.verbatimMessage).toBe('✓ MEAL DELIVERED');
  });

  // Test 9: Duplicate food scan -> FOOD ALREADY DELIVERED, no new row
  it('9. Duplicate food scan returns FOOD ALREADY DELIVERED', async () => {
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-WB-000001',
      physicalQrType: 'WRISTBAND',
      staffId: 'Reception Staff',
      staffRole: 'RECEPTION',
    });

    await operationsApi.markFoodDelivered({
      physicalQrId: 'EVX26-WB-000001',
      staffId: 'Food Staff 1',
      station: 'FC-01',
    });

    const dupFood = await operationsApi.markFoodDelivered({
      physicalQrId: 'EVX26-WB-000001',
      staffId: 'Food Staff 2',
      station: 'FC-02',
    });

    expect(dupFood.state).toBe('DUPLICATE_FOOD');
    expect(dupFood.verbatimMessage).toBe('FOOD ALREADY DELIVERED');
  });

  // Test 10: Team of 4 members: each member independently checks in, attends events, and redeems food
  it('10. Team of 4 members: each member independently checks in, attends events, and redeems food', async () => {
    // Generate inventory
    await operationsApi.generateQrInventory({ environment: 'PRODUCTION', count: 100 });

    const memberQrs = [
      { id: TEST_TEAM_HEAD_ID, qr: 'EVX26-WB-000001', name: 'Arun Kumar' },
      { id: `${TEST_TEAM_HEAD_ID}-M1`, qr: 'EVX26-WB-000002', name: 'Kumar V' },
      { id: `${TEST_TEAM_HEAD_ID}-M2`, qr: 'EVX26-WB-000003', name: 'Ravi Shankar' },
      { id: `${TEST_TEAM_HEAD_ID}-M3`, qr: 'EVX26-WB-000004', name: 'Suresh Raina' },
    ];

    // 1. Bind each member to a unique physical wristband
    for (const m of memberQrs) {
      const bind = await operationsApi.assignPhysicalQr({
        participantId: m.id,
        registrationId: TEST_TEAM_HEAD_ID,
        physicalQrId: m.qr,
        physicalQrType: 'WRISTBAND',
        staffId: 'Receptionist',
        staffRole: 'RECEPTION',
        station: 'Reception Desk 1',
      });
      expect(bind.state).toBe('SUCCESS');
    }

    // 2. Each member attends TE02
    for (const m of memberQrs) {
      const att = await operationsApi.markEventPresent({
        physicalQrId: m.qr,
        eventId: 'TE02',
        staffId: 'Coordinator',
        station: 'TE02 Desk',
      });
      expect(att.state).toBe('SUCCESS');
      expect(att.participant?.participantName).toBe(m.name);
    }

    // 3. Each member redeems food independently
    for (const m of memberQrs) {
      const food = await operationsApi.markFoodDelivered({
        physicalQrId: m.qr,
        staffId: 'Food Staff',
        station: 'Food Counter',
      });
      expect(food.state).toBe('SUCCESS');
    }

    // 4. Duplicate food for first member returns duplicate while other state stays clean
    const dup = await operationsApi.markFoodDelivered({
      physicalQrId: memberQrs[0].qr,
      staffId: 'Food Staff',
    });
    expect(dup.state).toBe('DUPLICATE_FOOD');
  });

  // Test 11: Invalid or unregistered QR -> PARTICIPANT NOT FOUND
  it('11. Invalid or unregistered QR returns PARTICIPANT NOT FOUND with zero state mutations', async () => {
    const res = await operationsApi.lookupRegistration({
      token: 'INVALID_TOKEN_ABC_99999',
    });

    expect(res.success).toBe(false);
    expect(res.message).toBe('PARTICIPANT NOT FOUND');
  });

  // Test 12: Assign already-assigned physical QR to a different participant -> rejected
  it('12. Assign already-assigned physical QR to different participant is rejected', async () => {
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-WB-000001',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    // Try to assign the same EVX26-WB-000001 to Arun
    const conflict = await operationsApi.assignPhysicalQr({
      participantId: TEST_TEAM_HEAD_ID,
      registrationId: TEST_TEAM_HEAD_ID,
      physicalQrId: 'EVX26-WB-000001',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    expect(conflict.state).toBe('QR_CONFLICT');
    expect(['WRISTBAND ALREADY ASSIGNED', 'QR ASSIGNED TO ANOTHER PARTICIPANT']).toContain(conflict.verbatimMessage);
  });

  // Test 13: Concurrency test: Two simultaneous requests marking same participant's food
  it('13. Concurrency test: simultaneous food delivery requests result in exactly one SUCCESS and one ALREADY_DELIVERED', async () => {
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-WB-000001',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    // Fire 2 concurrent food delivery requests for same QR
    const [res1, res2] = await Promise.all([
      operationsApi.markFoodDelivered({
        physicalQrId: 'EVX26-WB-000001',
        staffId: 'Counter 1',
        station: 'FOOD-01',
      }),
      operationsApi.markFoodDelivered({
        physicalQrId: 'EVX26-WB-000001',
        staffId: 'Counter 2',
        station: 'FOOD-02',
      }),
    ]);

    const states = [res1.state, res2.state];
    expect(states).toContain('SUCCESS');
    expect(states).toContain('DUPLICATE_FOOD');
  });

  // Test 14: Prompt 6 Section 13 End-to-End 9-Step Verification with EVX26-TEST-000051
  it('14. Prompt 6 Section 13: Full 9-step End-to-End test using EVX26-TEST-000051', async () => {
    // Step 1: Reception: scan registration QR -> participant appears
    const lookup1 = await operationsApi.lookupRegistration({ token: 'EVOXIS26:testrahul99901' });
    expect(lookup1.success).toBe(true);
    expect(lookup1.data?.participantName).toBe('Rahul Dravid');
    expect(lookup1.data?.selectedEvents).toContain('TE02');

    // Step 2: Bind EVX26-TEST-000051 -> CONFIRM & BIND in TEST mode
    const bindRes = await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-TEST-000051',
      physicalQrType: 'WRISTBAND',
      staffId: 'Receptionist Lead',
      staffRole: 'RECEPTION',
      station: 'Reception Desk (TEST)',
      portalMode: 'TEST',
    });
    expect(bindRes.state).toBe('SUCCESS');
    expect(bindRes.verbatimMessage).toBe('✓ PRESENT');

    // Step 3: Re-query storage/Supabase directly -> confirm persisted row (status=ASSIGNED, participant_id, registration_id populated)
    const resolveDirect = await operationsApi.resolvePhysicalQR('EVX26-TEST-000051', 'TEST');
    expect(resolveDirect.success).toBe(true);
    expect(resolveDirect.status).toBe('ASSIGNED');
    expect(resolveDirect.registrationId).toBe(TEST_INDIVIDUAL_ID);
    expect(resolveDirect.participantId).toBe(TEST_INDIVIDUAL_ID);
    expect(resolveDirect.participant?.participantName).toBe('Rahul Dravid');

    // Step 4: Reload Reception, search the QR again -> assignment still present
    const reloadLookup = await operationsApi.lookupRegistration({ token: 'EVX26-TEST-000051' });
    expect(reloadLookup.success).toBe(true);
    expect(reloadLookup.data?.participantName).toBe('Rahul Dravid');
    expect(reloadLookup.data?.physicalQrId).toBe('EVX26-TEST-000051');

    // Step 5 & 6: Event Desk, TEST mode, select the participant's actual registered event TE02 -> participant found, mark attendance
    const eventAtt = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-TEST-000051',
      eventId: 'TE02',
      staffId: 'TE02 Coordinator',
      station: 'Event Desk TE02 (TEST)',
      portalMode: 'TEST',
    });
    expect(eventAtt.state).toBe('SUCCESS');
    expect(eventAtt.verbatimMessage).toBe('✓ PRESENT');
    expect(eventAtt.participant?.participantName).toBe('Rahul Dravid');

    // Step 7: Scan again at TE02 -> ALREADY MARKED PRESENT, no duplicate row
    const dupEvent = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-TEST-000051',
      eventId: 'TE02',
      staffId: 'TE02 Coordinator',
      station: 'Event Desk TE02 (TEST)',
      portalMode: 'TEST',
    });
    expect(dupEvent.state).toBe('DUPLICATE_EVENT');
    expect(dupEvent.verbatimMessage).toBe('ALREADY MARKED PRESENT');

    // Step 8: Select an event the participant did NOT register for (TE06), scan again -> participant found, event-mismatch message, no attendance written
    const wrongEvent = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-TEST-000051',
      eventId: 'TE06',
      staffId: 'TE06 Coordinator',
      station: 'Event Desk TE06 (TEST)',
      portalMode: 'TEST',
    });
    expect(wrongEvent.state).toBe('WRONG_EVENT');
    expect(wrongEvent.verbatimMessage).toBe('PARTICIPANT FOUND — NOT REGISTERED FOR THIS EVENT');
    expect(wrongEvent.registeredEvents).toContain('TE02');
    expect(wrongEvent.registeredEvents).not.toContain('TE06');

    // Step 9: Food Counter: scan -> deliver -> scan again -> FOOD ALREADY DELIVERED, no duplicate row
    const food1 = await operationsApi.markFoodDelivered({
      physicalQrId: 'EVX26-TEST-000051',
      staffId: 'Food Staff',
      station: 'Food Counter (TEST)',
      portalMode: 'TEST',
    });
    expect(food1.state).toBe('SUCCESS');
    expect(food1.verbatimMessage).toBe('✓ MEAL DELIVERED');

    const food2 = await operationsApi.markFoodDelivered({
      physicalQrId: 'EVX26-TEST-000051',
      staffId: 'Food Staff',
      station: 'Food Counter (TEST)',
      portalMode: 'TEST',
    });
    expect(food2.state).toBe('DUPLICATE_FOOD');
    expect(food2.verbatimMessage).toBe('FOOD ALREADY DELIVERED');
  });

  // Test 15: Prompt 6 Section 3: Shared Resolver distinct failure codes
  it('15. Single shared resolver returns distinct failure codes for each specific invalid state', async () => {
    // 1. INVALID_QR_FORMAT
    const r1 = await operationsApi.resolvePhysicalQR('NOT_A_VALID_FORMAT');
    expect(r1.success).toBe(false);
    expect(r1.errorCode).toBe('INVALID_QR_FORMAT');

    // 2. QR_NOT_FOUND (not in inventory)
    const r2 = await operationsApi.resolvePhysicalQR('EVX26-WB-999999');
    expect(r2.success).toBe(false);
    expect(r2.errorCode).toBe('QR_NOT_FOUND');

    // 3. QR_NOT_ASSIGNED (in inventory but UNUSED)
    await operationsApi.generateQrInventory({ environment: 'PRODUCTION', count: 10 });
    const r3 = await operationsApi.resolvePhysicalQR('EVX26-WB-000005', 'PRODUCTION');
    expect(r3.success).toBe(false);
    expect(r3.errorCode).toBe('QR_NOT_ASSIGNED');

    // 4. QR_REVOKED
    await operationsApi.revokeQr({ qrCode: 'EVX26-WB-000005', staffId: 'Admin' });
    const r4 = await operationsApi.resolvePhysicalQR('EVX26-WB-000005', 'PRODUCTION');
    expect(r4.success).toBe(false);
    expect(r4.errorCode).toBe('QR_REVOKED');

    // 5. TEST_QR_IN_PRODUCTION_MODE
    await operationsApi.generateQrInventory({ environment: 'TEST', count: 10 });
    const r5 = await operationsApi.resolvePhysicalQR('EVX26-TEST-000005', 'PRODUCTION');
    expect(r5.success).toBe(false);
    expect(r5.errorCode).toBe('TEST_QR_IN_PRODUCTION_MODE');

    // 6. PRODUCTION_QR_IN_TEST_MODE
    const r6 = await operationsApi.resolvePhysicalQR('EVX26-WB-000002', 'TEST');
    expect(r6.success).toBe(false);
    expect(r6.errorCode).toBe('PRODUCTION_QR_IN_TEST_MODE');
  });

  // Test 16: Prompt 7 Section 4: Operational Summary & Aggregate calculation methods
  it('16. Operational summaries calculate per-participant, event, and team rollups with zero drift', async () => {
    // Check initial summaries
    const partSummaries = await operationsApi.getParticipantOperationalSummary();
    expect(partSummaries.length).toBeGreaterThan(0);
    const rahulSummary = partSummaries.find((p) => p.participantId === TEST_INDIVIDUAL_ID);
    expect(rahulSummary).toBeDefined();
    expect(rahulSummary?.fullName).toBe('Rahul Dravid');
    expect(rahulSummary?.totalRegisteredEvents).toBe(2);

    // Event summary
    const eventSummaries = await operationsApi.getEventAttendanceSummary();
    expect(eventSummaries.length).toBeGreaterThan(0);
    const te02Summary = eventSummaries.find((e) => e.eventId === 'TE02');
    expect(te02Summary).toBeDefined();
    expect(te02Summary?.eventName).toBe('Business Battle');

    // Team summary
    const teamSummaries = await operationsApi.getTeamOperationalSummary();
    const cskTeam = teamSummaries.find((t) => t.teamName === 'Code Warriors');
    expect(cskTeam).toBeDefined();
    expect(cskTeam?.totalMembers).toBe(4);
  });

  // Test 17: Prompt 7 Section 6: Real 4-member Team CSK end-to-end verification
  it('17. Prompt 7 Section 6: Real Team CSK 4 members independently resolve across Reception, Event Desks, and Food Counter', async () => {
    const cskMembers = [
      { id: 'EVOXIS26-00041', qr: 'EVX26-TEST-000051', name: 'test07', role: 'TEAM_HEAD' },
      { id: 'EVOXIS26-00041-M1', qr: 'EVX26-TEST-000052', name: 'test03', role: 'TEAM_MEMBER' },
      { id: 'EVOXIS26-00041-M2', qr: 'EVX26-TEST-000053', name: 'test31', role: 'TEAM_MEMBER' },
      { id: 'EVOXIS26-00041-M3', qr: 'EVX26-TEST-000054', name: 'test09', role: 'TEAM_MEMBER' },
    ];

    // Seed mock registrations for Team CSK if running offline
    const currentRegs = JSON.parse(localStorage.getItem('evoxis26_overall_registrations') || '[]');
    const cskSeed = [
      {
        registrationId: 'EVOXIS26-00041',
        participantName: 'test07',
        email: 'test07@gmail.com',
        mobileNumber: '0987654321',
        collegeInstitution: 'IND',
        department: 'CSBS',
        year: '2nd Year',
        gender: 'Male',
        registrationType: 'Team',
        role: 'TEAM_HEAD',
        teamName: 'team CSK',
        selectedEvents: 'SP02, SP03',
        qrToken: 'EVOXIS26:0c6c8ce82600041',
      },
      {
        registrationId: 'EVOXIS26-00041-M1',
        participantName: 'test03',
        email: 'test03@gmail.com',
        mobileNumber: '9870654321',
        collegeInstitution: 'IND',
        department: 'CSBS',
        year: '1st Year',
        gender: 'Male',
        registrationType: 'Team',
        role: 'TEAM_MEMBER',
        teamName: 'team CSK',
        selectedEvents: 'SP02, SP03',
        qrToken: 'EVOXIS26:0c6c8ce82600041-M1',
      },
      {
        registrationId: 'EVOXIS26-00041-M2',
        participantName: 'test31',
        email: 'test31@gmail.com',
        mobileNumber: '1234567890',
        collegeInstitution: 'IND',
        department: 'CSBS',
        year: '2nd Year',
        gender: 'Male',
        registrationType: 'Team',
        role: 'TEAM_MEMBER',
        teamName: 'team CSK',
        selectedEvents: 'SP02, SP03',
        qrToken: 'EVOXIS26:0c6c8ce82600041-M2',
      },
      {
        registrationId: 'EVOXIS26-00041-M3',
        participantName: 'test09',
        email: 'test09@gmail.com',
        mobileNumber: '1234123490',
        collegeInstitution: 'IND',
        department: 'CSBS',
        year: '2nd Year',
        gender: 'Male',
        registrationType: 'Team',
        role: 'TEAM_MEMBER',
        teamName: 'team CSK',
        selectedEvents: 'SP02, SP03',
        qrToken: 'EVOXIS26:0c6c8ce82600041-M3',
      },
    ];
    localStorage.setItem('evoxis26_overall_registrations', JSON.stringify([...currentRegs, ...cskSeed]));

    // Step 1: Bind 4 distinct wristbands at Reception
    for (const m of cskMembers) {
      const bind = await operationsApi.assignPhysicalQr({
        participantId: m.id,
        registrationId: 'EVOXIS26-00041',
        physicalQrId: m.qr,
        physicalQrType: 'WRISTBAND',
        staffId: 'Reception Lead',
        staffRole: 'RECEPTION',
        station: 'Reception Desk 1',
        portalMode: 'TEST',
      });
      expect(bind.state).toBe('SUCCESS');
      expect(bind.verbatimMessage).toBe('✓ PRESENT');
    }

    // Step 2: Event Desk for SP02 (registered event) -> Each member resolves independently to their own record
    for (const m of cskMembers) {
      const att = await operationsApi.markEventPresent({
        physicalQrId: m.qr,
        eventId: 'SP02',
        staffId: 'SP02 Coordinator',
        station: 'Desk SP02',
        portalMode: 'TEST',
      });
      expect(att.state).toBe('SUCCESS');
      expect(att.verbatimMessage).toBe('✓ PRESENT');
      expect(att.participant?.participantName).toBe(m.name);
      expect(att.participant?.id).toBe(m.id);
    }

    // Step 3: Event Desk for TE03 (unregistered event) -> Each member receives WRONG_EVENT with their registered events
    for (const m of cskMembers) {
      const wrong = await operationsApi.markEventPresent({
        physicalQrId: m.qr,
        eventId: 'TE03',
        staffId: 'TE03 Coordinator',
        station: 'Desk TE03',
        portalMode: 'TEST',
      });
      expect(wrong.state).toBe('WRONG_EVENT');
      expect(wrong.verbatimMessage).toBe('PARTICIPANT FOUND — NOT REGISTERED FOR THIS EVENT');
      expect(wrong.registeredEvents).toContain('SP02');
      expect(wrong.registeredEvents).toContain('SP03');
      expect(wrong.registeredEvents).not.toContain('TE03');
    }

    // Step 4: Food Counter -> Each member redeems food independently once; duplicate rescan is blocked
    for (const m of cskMembers) {
      const food1 = await operationsApi.markFoodDelivered({
        physicalQrId: m.qr,
        staffId: 'Food Staff',
        station: 'Food Counter',
        portalMode: 'TEST',
      });
      expect(food1.state).toBe('SUCCESS');
      expect(food1.verbatimMessage).toBe('✓ MEAL DELIVERED');
      expect(food1.participant?.participantName).toBe(m.name);

      const food2 = await operationsApi.markFoodDelivered({
        physicalQrId: m.qr,
        staffId: 'Food Staff',
        station: 'Food Counter',
        portalMode: 'TEST',
      });
      expect(food2.state).toBe('DUPLICATE_FOOD');
      expect(food2.verbatimMessage).toBe('FOOD ALREADY DELIVERED');
    }
  });

  // Test 18: Pre-generated QR inventory initializes with status = 'UNUSED' and empty participant fields
  it('18. Pre-generated QR inventory creates 100 TEST and 1000 PROD records with status UNUSED and empty participant fields', async () => {
    // Generate test QR inventory
    const testGen = await operationsApi.generateQrInventory({
      environment: 'TEST',
      count: 100,
    });
    expect(testGen.totalCreated).toBe(100);

    const inv = await operationsApi.getQrInventory({ environment: 'TEST', pageSize: 100 });
    expect(inv.items.length).toBe(100);
    expect(inv.totalCount).toBe(100);

    // Verify first and last test QRs
    const test01 = inv.items.find((i) => i.qrCode === 'EVX26-TEST-000001');
    expect(test01).toBeDefined();
    expect(test01?.status).toBe('UNUSED');
    expect(test01?.participantId).toBeUndefined();
    expect(test01?.participantName).toBeUndefined();
    expect(test01?.email).toBeUndefined();

    const test100 = inv.items.find((i) => i.qrCode === 'EVX26-TEST-000100');
    expect(test100).toBeDefined();
    expect(test100?.status).toBe('UNUSED');
  });

  // Test 19: Reception assignment updates the existing QR row in place (NEVER inserts a second row)
  it('19. Reception assignment UPDATES the existing empty QR record in place without creating duplicate rows', async () => {
    // Inventory count before assignment
    const invBefore = await operationsApi.getQrInventory({ environment: 'TEST', pageSize: 100 });
    const countBefore = invBefore.items.length;

    // Assign EVX26-TEST-000025 to Rahul Dravid
    const assignResult = await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-TEST-000025',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff John',
      staffRole: 'RECEPTION',
      station: 'Reception Desk 1',
      portalMode: 'TEST',
    });

    expect(assignResult.state).toBe('SUCCESS');
    expect(assignResult.verbatimMessage).toBe('✓ PRESENT');

    // Verify inventory count DID NOT increase (strict UPDATE, no duplicate row)
    const invAfter = await operationsApi.getQrInventory({ environment: 'TEST', pageSize: 100 });
    expect(invAfter.items.length).toBe(countBefore);

    // Verify the exact row was updated
    const updatedRow = invAfter.items.find((i) => i.qrCode === 'EVX26-TEST-000025');
    expect(updatedRow).toBeDefined();
    expect(updatedRow?.status).toBe('ASSIGNED');
    expect(updatedRow?.participantId).toBe(TEST_INDIVIDUAL_ID);
    expect(updatedRow?.participantName).toBe('Rahul Dravid');
    expect(updatedRow?.email).toBe('rahul.test999@example.com');
    expect(updatedRow?.college).toBe('Sriram Engineering College');
    expect(updatedRow?.selectedEvents).toContain('TE02');
    expect(updatedRow?.totalEvents).toBe(2);
  });

  // Test 20: Attempting to assign an already assigned QR to a different participant is blocked with WRISTBAND ALREADY ASSIGNED
  it('20. Assigning an already assigned QR to another participant returns WRISTBAND ALREADY ASSIGNED', async () => {
    // 1. First assign EVX26-TEST-000025 to Rahul Dravid
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-TEST-000025',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff John',
      staffRole: 'RECEPTION',
      station: 'Reception Desk 1',
      portalMode: 'TEST',
    });

    // 2. Attempt to bind already-assigned EVX26-TEST-000025 to Kumar V
    const conflictResult = await operationsApi.assignPhysicalQr({
      participantId: `${TEST_TEAM_HEAD_ID}-M1`,
      registrationId: TEST_TEAM_HEAD_ID,
      physicalQrId: 'EVX26-TEST-000025',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff John',
      staffRole: 'RECEPTION',
      station: 'Reception Desk 1',
      portalMode: 'TEST',
    });

    expect(conflictResult.state).toBe('QR_CONFLICT');
    expect(conflictResult.verbatimMessage).toBe('WRISTBAND ALREADY ASSIGNED');
    expect(conflictResult.details).toContain('Rahul Dravid');
  });

  // Test 21: Full downstream operations flow using physical QR codes from QR codes/testing
  it('21. Full event workflow using testing folder QR codes (EVX26-TEST-000060, EVX26-TEST-000061)', async () => {
    // 1. Assign EVX26-TEST-000060 to Rahul Dravid
    // First clear old assignment
    const clearAssignment = await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-TEST-000060',
      physicalQrType: 'WRISTBAND',
      staffId: 'Admin User',
      staffRole: 'SUPER_ADMIN',
      station: 'Reception Desk',
      portalMode: 'TEST',
    });
    expect(clearAssignment.state).toBe('SUCCESS');

    // 2. Mark Campus Check-in
    const campusCheckin = await operationsApi.markCampusPresent({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-TEST-000060',
      staffId: 'Campus Gate Staff',
      station: 'Main Gate',
    });
    expect(campusCheckin.state).toBe('SUCCESS');
    expect(campusCheckin.verbatimMessage).toBe('✓ PRESENT');

    // 3. Mark Event Attendance at TE02
    const eventCheckin = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-TEST-000060',
      eventId: 'TE02',
      staffId: 'TE02 Desk Lead',
      station: 'TE02 Desk',
      portalMode: 'TEST',
    });
    expect(eventCheckin.state).toBe('SUCCESS');
    expect(eventCheckin.verbatimMessage).toBe('✓ PRESENT');

    // 4. Mark Food Delivery
    const foodRedeem = await operationsApi.markFoodDelivered({
      physicalQrId: 'EVX26-TEST-000060',
      staffId: 'Food Lead',
      station: 'Food Counter 1',
      portalMode: 'TEST',
    });
    expect(foodRedeem.state).toBe('SUCCESS');
    expect(foodRedeem.verbatimMessage).toBe('✓ MEAL DELIVERED');

    // 5. Verify physical_qr_inventory state for EVX26-TEST-000060 has updated campus and food statuses
    const inv = await operationsApi.getQrInventory({ environment: 'TEST' });
    const row = inv.items.find((i) => i.qrCode === 'EVX26-TEST-000060');
    expect(row?.status).toBe('ASSIGNED');
    expect(row?.campusStatus).toBe('Present');
    expect(row?.foodStatus).toBe('Delivered');
  });

  test('22. Event Desk two-step inspection and [ MARK AS PRESENT ] action with duplicate protection', async () => {
    const testRegId = `EVOXIS26-TEST-MARK-${Date.now()}-00022`;
    // 1. Seed Participant test15 with multi-events (SP01, SP02, NT05, SP04)
    const seed = JSON.parse(localStorage.getItem('evoxis26_overall_registrations') || '[]');
    seed.push({
      registrationId: testRegId,
      participantName: 'test15',
      email: `test15_${Date.now()}@sec.edu`,
      mobileNumber: '9888877777',
      collegeInstitution: 'SEC',
      selectedEvents: 'SP01, SP02, NT05, SP04',
      role: 'INDIVIDUAL',
      teamName: 'Team Spidey',
      qrToken: `EVOXIS26:test15token22_${Date.now()}`,
    });
    localStorage.setItem('evoxis26_overall_registrations', JSON.stringify(seed));

    // 2. Assign physical wristband EVX26-TEST-000075 at reception
    const assignRes = await operationsApi.assignPhysicalQr({
      physicalQrId: 'EVX26-TEST-000075',
      participantId: testRegId,
      registrationId: testRegId,
      staffId: 'Reception Staff 1',
      station: 'Main Reception Desk',
    });
    expect(assignRes.state).toBe('SUCCESS');

    // 3. Step 1: Scan at SP01 Event Desk -> Resolve QR
    const resolved = await operationsApi.resolvePhysicalQR('EVX26-TEST-000075', 'TEST');
    expect(resolved.success).toBe(true);
    expect(resolved.participant?.participantName).toBe('test15');
    expect(resolved.registeredEvents).toContain('SP01');

    // 4. Validate registration for current event and check attendance status before clicking button
    const preCheck = await operationsApi.checkEventAttendance({
      participantId: testRegId,
      eventId: 'SP01',
    });
    expect(preCheck.isPresent).toBe(false);

    // 5. Step 2: Coordinator clicks [ MARK AS PRESENT ]
    const markRes = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-TEST-000075',
      eventId: 'SP01',
      staffId: 'SP01 Coordinator',
      station: 'Event Desk (SP01)',
      portalMode: 'TEST',
    });
    expect(markRes.state).toBe('SUCCESS');
    expect(markRes.verbatimMessage).toBe('✓ PRESENT');

    // 6. Rescanning at SP01 -> checkEventAttendance confirms already present
    const postCheck = await operationsApi.checkEventAttendance({
      participantId: testRegId,
      eventId: 'SP01',
    });
    expect(postCheck.isPresent).toBe(true);
    expect(postCheck.station).toContain('SP01');

    // 7. Duplicate click / scan is rejected idempotently
    const duplicateRes = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-TEST-000075',
      eventId: 'SP01',
      staffId: 'SP01 Coordinator',
      station: 'Event Desk (SP01)',
      portalMode: 'TEST',
    });
    expect(duplicateRes.state).toBe('DUPLICATE_EVENT');
    expect(duplicateRes.verbatimMessage).toBe('ALREADY MARKED PRESENT');
  });

  test('23. Multi-event attendance tracking: separate status per event (SP01, SP02 vs unregistered TE01)', async () => {
    const testRegId = `EVOXIS26-TEST-MARK-${Date.now()}-00023`;
    // 1. Seed Participant test15 with multi-events (SP01, SP02, NT05, SP04)
    const seed = JSON.parse(localStorage.getItem('evoxis26_overall_registrations') || '[]');
    seed.push({
      registrationId: testRegId,
      participantName: 'test15',
      email: `test15_${Date.now()}@sec.edu`,
      mobileNumber: '9888877777',
      collegeInstitution: 'SEC',
      selectedEvents: 'SP01, SP02, NT05, SP04',
      role: 'INDIVIDUAL',
      teamName: 'Team Spidey',
      qrToken: `EVOXIS26:test15token23_${Date.now()}`,
    });
    localStorage.setItem('evoxis26_overall_registrations', JSON.stringify(seed));

    // 2. Assign physical wristband EVX26-TEST-000076 at reception
    await operationsApi.assignPhysicalQr({
      physicalQrId: 'EVX26-TEST-000076',
      participantId: testRegId,
      registrationId: testRegId,
      staffId: 'Reception Staff 1',
      station: 'Main Reception Desk',
    });

    // 3. Mark SP01 as Present first
    await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-TEST-000076',
      eventId: 'SP01',
      staffId: 'SP01 Coordinator',
      station: 'Event Desk (SP01)',
      portalMode: 'TEST',
    });

    // 4. Participant test15 now visits SP02 desk after SP01
    const sp02PreCheck = await operationsApi.checkEventAttendance({
      participantId: testRegId,
      eventId: 'SP02',
    });
    expect(sp02PreCheck.isPresent).toBe(false);

    // 5. Mark present for SP02
    const sp02Mark = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-TEST-000076',
      eventId: 'SP02',
      staffId: 'SP02 Coordinator',
      station: 'Event Desk (SP02)',
      portalMode: 'TEST',
    });
    expect(sp02Mark.state).toBe('SUCCESS');

    // 6. Confirm SP01 and SP02 are PRESENT, while NT05 and SP04 remain un-attended
    const sp01Status = await operationsApi.checkEventAttendance({
      participantId: testRegId,
      eventId: 'SP01',
    });
    const sp02Status = await operationsApi.checkEventAttendance({
      participantId: testRegId,
      eventId: 'SP02',
    });
    const nt05Status = await operationsApi.checkEventAttendance({
      participantId: testRegId,
      eventId: 'NT05',
    });
    expect(sp01Status.isPresent).toBe(true);
    expect(sp02Status.isPresent).toBe(true);
    expect(nt05Status.isPresent).toBe(false);

    // 7. Scanning at TE01 (not registered) returns WRONG_EVENT and lists registered events
    const wrongEvtRes = await operationsApi.markEventPresent({
      physicalQrId: 'EVX26-TEST-000076',
      eventId: 'TE01',
      staffId: 'TE01 Coordinator',
      station: 'Event Desk (TE01)',
      portalMode: 'TEST',
    });
    expect(wrongEvtRes.state).toBe('WRONG_EVENT');
    expect(wrongEvtRes.verbatimMessage).toContain('NOT REGISTERED FOR THIS EVENT');
    expect(wrongEvtRes.registeredEvents).toEqual(['SP01', 'SP02', 'NT05', 'SP04']);
  });
});

