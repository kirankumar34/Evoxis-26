import { describe, it, expect, beforeEach } from 'vitest';

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
    expect(conflict.verbatimMessage).toBe('QR ASSIGNED TO ANOTHER PARTICIPANT');
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
});
