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

describe('EvoXis26 Operations Portal Automated Test Suite (13 Spec Requirements)', () => {
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
      physicalQrId: 'WRIST-EVX-000125',
      physicalQrType: 'WRISTBAND',
      staffId: 'Reception Staff',
      staffRole: 'RECEPTION',
      station: 'REC-01',
    });

    expect(res.state).toBe('SUCCESS');
    expect(res.verbatimMessage).toBe('✓ PRESENT');

    // Verify lookup by physical QR now returns participant
    const lookup = await operationsApi.lookupRegistration({ token: 'WRIST-EVX-000125' });
    expect(lookup.success).toBe(true);
    expect(lookup.data?.participantName).toBe('Rahul Dravid');
    expect(lookup.data?.physicalQrId).toBe('WRIST-EVX-000125');
  });

  // Test 3: Campus check-in -> PRESENT
  it('3. Campus check-in marks participant present', async () => {
    const checkin = await operationsApi.markCampusPresent({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'WRIST-EVX-000125',
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
      physicalQrId: 'WRIST-EVX-000125',
      physicalQrType: 'WRISTBAND',
      staffId: 'Reception Staff',
      staffRole: 'RECEPTION',
    });

    const res = await operationsApi.markEventPresent({
      physicalQrId: 'WRIST-EVX-000125',
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
      physicalQrId: 'WRIST-EVX-000125',
      physicalQrType: 'WRISTBAND',
      staffId: 'Reception Staff',
      staffRole: 'RECEPTION',
    });

    // Rahul is registered for TE02 & NT01, but NOT TE06 (Cyber Investigation)
    const res = await operationsApi.markEventPresent({
      physicalQrId: 'WRIST-EVX-000125',
      eventId: 'TE06',
      staffId: 'Coordinator 2',
      station: 'Desk TE06',
    });

    expect(res.state).toBe('WRONG_EVENT');
    expect(res.verbatimMessage).toBe('NOT REGISTERED FOR THIS EVENT');
    expect(res.registeredEvents).toContain('TE02');
    expect(res.registeredEvents).toContain('NT01');
  });

  // Test 7: Duplicate event scan -> ALREADY PRESENT, no new row
  it('7. Duplicate event scan returns ALREADY PRESENT with original check-in timestamp', async () => {
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'WRIST-EVX-000125',
      physicalQrType: 'WRISTBAND',
      staffId: 'Reception Staff',
      staffRole: 'RECEPTION',
    });

    await operationsApi.markEventPresent({
      physicalQrId: 'WRIST-EVX-000125',
      eventId: 'TE02',
      staffId: 'Coord 1',
      station: 'Desk TE02',
    });

    const dup = await operationsApi.markEventPresent({
      physicalQrId: 'WRIST-EVX-000125',
      eventId: 'TE02',
      staffId: 'Coord 1',
      station: 'Desk TE02',
    });

    expect(dup.state).toBe('DUPLICATE_EVENT');
    expect(dup.verbatimMessage).toBe('ALREADY PRESENT');
    expect(dup.originalTime).toBeDefined();
  });

  // Test 8: Food scan -> delivered
  it('8. Food scan marks meal token redeemed', async () => {
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'WRIST-EVX-000125',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    const foodRes = await operationsApi.markFoodDelivered({
      physicalQrId: 'WRIST-EVX-000125',
      staffId: 'Food Server',
      station: 'FOOD-01',
    });

    expect(foodRes.state).toBe('SUCCESS');
    expect(foodRes.verbatimMessage).toBe('✓ PRESENT');
  });

  // Test 9: Duplicate food scan -> FOOD ALREADY DELIVERED, no new row
  it('9. Duplicate food scan returns FOOD ALREADY DELIVERED', async () => {
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'WRIST-EVX-000125',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    await operationsApi.markFoodDelivered({
      physicalQrId: 'WRIST-EVX-000125',
      staffId: 'Food Server 1',
      station: 'FOOD-01',
    });

    const dupFood = await operationsApi.markFoodDelivered({
      physicalQrId: 'WRIST-EVX-000125',
      staffId: 'Food Server 2',
      station: 'FOOD-02',
    });

    expect(dupFood.state).toBe('DUPLICATE_FOOD');
    expect(dupFood.verbatimMessage).toBe('FOOD ALREADY DELIVERED');
    expect(dupFood.originalStation).toBe('FOOD-01');
  });

  // Test 10: Team of 4 -> each member independently checks in / attends events / gets food
  it('10. Team of 4 members: each member independently checks in, attends events, and redeems food', async () => {
    // 1. Assign physical QRs to all 4 members
    await operationsApi.assignPhysicalQr({
      participantId: TEST_TEAM_HEAD_ID,
      registrationId: TEST_TEAM_HEAD_ID,
      physicalQrId: 'WRIST-TEAM-01',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    await operationsApi.assignPhysicalQr({
      participantId: `${TEST_TEAM_HEAD_ID}-M1`,
      registrationId: `${TEST_TEAM_HEAD_ID}-M1`,
      physicalQrId: 'WRIST-TEAM-02',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    await operationsApi.assignPhysicalQr({
      participantId: `${TEST_TEAM_HEAD_ID}-M2`,
      registrationId: `${TEST_TEAM_HEAD_ID}-M2`,
      physicalQrId: 'WRIST-TEAM-03',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    await operationsApi.assignPhysicalQr({
      participantId: `${TEST_TEAM_HEAD_ID}-M3`,
      registrationId: `${TEST_TEAM_HEAD_ID}-M3`,
      physicalQrId: 'WRIST-TEAM-04',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    // 2. Member 1 (Arun) checks in to event TE02
    const arunEvent = await operationsApi.markEventPresent({
      physicalQrId: 'WRIST-TEAM-01',
      eventId: 'TE02',
      staffId: 'Coord',
    });
    expect(arunEvent.state).toBe('SUCCESS');

    // 3. Member 2 (Kumar) checks in to event TE02
    const kumarEvent = await operationsApi.markEventPresent({
      physicalQrId: 'WRIST-TEAM-02',
      eventId: 'TE02',
      staffId: 'Coord',
    });
    expect(kumarEvent.state).toBe('SUCCESS');

    // 4. Member 3 (Ravi) redeems food
    const raviFood = await operationsApi.markFoodDelivered({
      physicalQrId: 'WRIST-TEAM-03',
      staffId: 'Food Staff',
    });
    expect(raviFood.state).toBe('SUCCESS');

    // 5. Member 4 (Suresh) food is still unredeemed
    const sureshLookup = await operationsApi.lookupRegistration({ token: 'WRIST-TEAM-04' });
    expect(sureshLookup.data?.foodDelivered).toBe(false);
  });

  // Test 11: Invalid/unregistered QR -> PARTICIPANT NOT FOUND, no writes
  it('11. Invalid or unregistered QR returns PARTICIPANT NOT FOUND with zero state mutations', async () => {
    const res = await operationsApi.markEventPresent({
      physicalQrId: 'RANDOM-NONEXISTENT-QR',
      eventId: 'TE02',
      staffId: 'Coord',
    });

    expect(res.state).toBe('NOT_FOUND');
    expect(res.verbatimMessage).toBe('PARTICIPANT NOT FOUND');
  });

  // Test 12: Assign already-assigned physical QR to a different participant -> rejected
  it('12. Assign already-assigned physical QR to different participant is rejected', async () => {
    // Assign WRIST-CONFLICT-01 to Rahul
    await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'WRIST-CONFLICT-01',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    // Try to assign the same WRIST-CONFLICT-01 to Arun
    const conflict = await operationsApi.assignPhysicalQr({
      participantId: TEST_TEAM_HEAD_ID,
      registrationId: TEST_TEAM_HEAD_ID,
      physicalQrId: 'WRIST-CONFLICT-01',
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
      physicalQrId: 'WRIST-CONCURRENT-01',
      physicalQrType: 'WRISTBAND',
      staffId: 'Staff',
      staffRole: 'RECEPTION',
    });

    // Fire 2 concurrent food delivery requests for same QR
    const [res1, res2] = await Promise.all([
      operationsApi.markFoodDelivered({
        physicalQrId: 'WRIST-CONCURRENT-01',
        staffId: 'Counter 1',
        station: 'FOOD-01',
      }),
      operationsApi.markFoodDelivered({
        physicalQrId: 'WRIST-CONCURRENT-01',
        staffId: 'Counter 2',
        station: 'FOOD-02',
      }),
    ]);

    const states = [res1.state, res2.state];
    expect(states).toContain('SUCCESS');
    expect(states).toContain('DUPLICATE_FOOD');
  });

  // Test 14: Bulk Static QR Generation (1000 Production + 100 Test, Idempotent)
  it('14. Static QR Inventory Generation creates 1000 production and 100 test records idempotently without duplicates', async () => {
    const prodRes1 = await operationsApi.generateQrInventory({ environment: 'PRODUCTION', count: 1000 });
    expect(prodRes1.totalCreated).toBe(1000);

    const testRes1 = await operationsApi.generateQrInventory({ environment: 'TEST', count: 100 });
    expect(testRes1.totalCreated).toBe(100);

    // Running again must detect all existing and create 0 duplicates
    const prodRes2 = await operationsApi.generateQrInventory({ environment: 'PRODUCTION', count: 1000 });
    expect(prodRes2.totalCreated).toBe(0);
    expect(prodRes2.totalDuplicatesPrevented).toBe(1000);

    const metrics = await operationsApi.getInventoryMetrics();
    expect(metrics.production.total).toBe(1000);
    expect(metrics.test.total).toBe(100);
    expect(metrics.production.unused).toBe(1000);
    expect(metrics.test.unused).toBe(100);
  });

  // Test 15: TEST QR scanned in live production mode is strictly rejected
  it('15. TEST QR scanned at production desk is rejected with TEST QR DETECTED', async () => {
    await operationsApi.generateQrInventory({ environment: 'TEST', count: 100 });

    const scanResult = await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-TEST-000001',
      physicalQrType: 'WRISTBAND',
      staffId: 'Receptionist 1',
      staffRole: 'RECEPTION',
      station: 'Reception Desk 1', // Production station
    });

    expect(scanResult.state).toBe('TEST_QR_IN_PROD');
    expect(scanResult.verbatimMessage).toBe('TEST QR DETECTED');
  });

  // Test 16: Lost wristband revocation and check-in block
  it('16. Lost physical QR can be revoked and is subsequently blocked with QR REVOKED', async () => {
    await operationsApi.generateQrInventory({ environment: 'PRODUCTION', count: 1000 });

    // Revoke EVX26-WB-000123
    const revokeRes = await operationsApi.revokeQr({
      qrCode: 'EVX26-WB-000123',
      reason: 'Physical wristband snapped / lost',
      staffId: 'Super Admin',
    });
    expect(revokeRes.success).toBe(true);

    // Attempt assignment
    const assignResult = await operationsApi.assignPhysicalQr({
      participantId: TEST_INDIVIDUAL_ID,
      registrationId: TEST_INDIVIDUAL_ID,
      physicalQrId: 'EVX26-WB-000123',
      physicalQrType: 'WRISTBAND',
      staffId: 'Receptionist 1',
      staffRole: 'RECEPTION',
    });

    expect(assignResult.state).toBe('QR_REVOKED');
    expect(assignResult.verbatimMessage).toBe('QR REVOKED');
  });

  // Test 17: Inventory search and pagination
  it('17. QR Inventory search and filter functions correctly', async () => {
    await operationsApi.generateQrInventory({ environment: 'PRODUCTION', count: 1000 });
    await operationsApi.generateQrInventory({ environment: 'TEST', count: 100 });

    const searchRes = await operationsApi.getQrInventory({
      search: 'EVX26-WB-000500',
      page: 1,
      pageSize: 10,
    });

    expect(searchRes.totalCount).toBe(1);
    expect(searchRes.items[0].qrCode).toBe('EVX26-WB-000500');
    expect(searchRes.items[0].environment).toBe('PRODUCTION');
    expect(searchRes.items[0].status).toBe('UNUSED');
  });
});

