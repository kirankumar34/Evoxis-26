import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '@/services/api';
import { RegistrationFormData } from '@/types';

describe('AC3, AC4, AC6, AC7, AC8: Full API Client & Database Service Layer', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(api, 'getBackendType').mockReturnValue('LOCAL_MOCK');
  });

  it('1. registerParticipant creates a new registration with atomic ID and QR token', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Ananya Ramesh',
      email: 'ananya.ramesh@example.com',
      phone: '9840199999',
      collegeName: 'Sriram Engineering College',
      department: 'CSBS',
      yearOfStudy: '3rd Year',
      gender: 'Female',
      selectedEventIds: ['TE01', 'NT01'],
      isTeam: false,
    };

    const response = await api.registerParticipant(payload);
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.registrationId).toMatch(/^EVOXIS26-\d{5}$/);
    expect(response.data?.participantName).toBe('Ananya Ramesh');
    expect(response.data?.email).toBe('ananya.ramesh@example.com');
    expect(response.data?.selectedEvents).toEqual(['TE01', 'NT01']);
    expect(response.data?.totalEvents).toBe(2);
    expect(response.data?.qrToken).toMatch(/^EVOXIS26:[a-f0-9]+/);
  });

  it('2. AC4: Duplicate Registration Guard prevents duplicate submissions for the same event', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '9876543210',
      collegeName: 'MIT Chennai',
      department: 'CSE',
      yearOfStudy: '4th Year',
      selectedEventIds: ['TE01'],
      isTeam: false,
    };

    // First submission
    const firstRes = await api.registerParticipant(payload);
    expect(firstRes.success).toBe(true);
    const initialRegId = firstRes.data?.registrationId;

    // Second submission with exact same email and event
    const secondRes = await api.registerParticipant(payload);
    expect(secondRes.success).toBe(true);
    expect(secondRes.isDuplicate).toBe(true);
    expect(secondRes.message).toContain('Already registered for event(s): TE01');
    expect(secondRes.data?.registrationId).toBe(initialRegId);
  });

  it('3. getRegistration fetches participant details and event roster by ID and Email', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Karthik Raja',
      email: 'karthik.raja@example.com',
      phone: '9123450000',
      collegeName: 'SSN College',
      department: 'AI&DS',
      yearOfStudy: '2nd Year',
      selectedEventIds: ['TE02', 'SP04'],
      isTeam: false,
    };

    const reg = await api.registerParticipant(payload);
    const regId = reg.data!.registrationId;

    // Lookup by Registration ID
    const lookupById = await api.getRegistration({ registrationId: regId });
    expect(lookupById.success).toBe(true);
    expect(lookupById.data?.participantName).toBe('Karthik Raja');
    expect(lookupById.data?.events.length).toBe(2);

    // Lookup by Email
    const lookupByEmail = await api.getRegistration({ email: 'karthik.raja@example.com' });
    expect(lookupByEmail.success).toBe(true);
    expect(lookupByEmail.data?.registrationId).toBe(regId);
  });

  it('4. AC6: validateQRCode validates attendee at Reception Desk', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Divya S',
      email: 'divya.s@example.com',
      phone: '9940123456',
      collegeName: 'SVCE',
      department: 'Cyber Security',
      yearOfStudy: '3rd Year',
      selectedEventIds: ['TE06', 'NT03'],
      isTeam: false,
    };

    const reg = await api.registerParticipant(payload);
    const qrToken = reg.data!.qrToken;

    const validation = await api.validateQRCode(qrToken);
    expect(validation.success).toBe(true);
    expect(validation.participantName).toBe('Divya S');
    expect(validation.overallAttendanceStatus).toBe('Pending');
    expect(validation.events?.length).toBe(2);
  });

  it('5. AC7: checkEventRegistration validates event-desk attendance logic', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Vijay Kumar',
      email: 'vijay.k@example.com',
      phone: '9789012345',
      collegeName: 'REC',
      department: 'AIML',
      yearOfStudy: '4th Year',
      selectedEventIds: ['TE01'], // Registered for TE01 only
      isTeam: false,
    };

    const reg = await api.registerParticipant(payload);
    const qrToken = reg.data!.qrToken;

    // A. Check for registered event (TE01) -> Allowed
    const checkRegistered = await api.checkEventRegistration(qrToken, 'TE01');
    expect(checkRegistered.success).toBe(true);
    expect(checkRegistered.registered).toBe(true);
    expect(checkRegistered.alreadyPresent).toBe(false);

    // B. Check for non-registered event (SP01) -> Blocked/Not registered
    const checkUnregistered = await api.checkEventRegistration(qrToken, 'SP01');
    expect(checkUnregistered.success).toBe(true);
    expect(checkUnregistered.registered).toBe(false);
  });

  it('6. AC8: markReceptionAttendance updates status and generates attendance log', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Sneha P',
      email: 'sneha.p@example.com',
      phone: '9444012345',
      collegeName: 'Loyola ICAM',
      department: 'CSE',
      yearOfStudy: '3rd Year',
      selectedEventIds: ['TE03', 'NT05'],
      isTeam: false,
    };

    const reg = await api.registerParticipant(payload);
    const qrToken = reg.data!.qrToken;

    const checkIn = await api.markReceptionAttendance(qrToken, 'Staff Member 1');
    expect(checkIn.success).toBe(true);
    expect(checkIn.participantName).toBe('Sneha P');

    // Confirm overall attendance status is now Present
    const validated = await api.validateQRCode(qrToken);
    expect(validated.overallAttendanceStatus).toBe('Present');
  });

  it('7. AC8: markEventAttendance marks event desk check-in', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Mohamed Ali',
      email: 'mohamed.ali@example.com',
      phone: '9884112233',
      collegeName: 'Crescent Institute',
      department: 'CSE',
      yearOfStudy: '4th Year',
      selectedEventIds: ['TE05'],
      isTeam: false,
    };

    const reg = await api.registerParticipant(payload);
    const qrToken = reg.data!.qrToken;

    const evtCheckIn = await api.markEventAttendance(qrToken, 'TE05', 'TE05 Coordinator');
    expect(evtCheckIn.success).toBe(true);

    // Check again -> alreadyPresent should now be true
    const reCheck = await api.checkEventRegistration(qrToken, 'TE05');
    expect(reCheck.success).toBe(true);
    expect(reCheck.alreadyPresent).toBe(true);
  });

  it('8. updateParticipationStatus updates winner / runner / participated badges', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Pooja V',
      email: 'pooja.v@example.com',
      phone: '9790123456',
      collegeName: 'Sriram Engineering College',
      department: 'CSBS',
      yearOfStudy: '3rd Year',
      selectedEventIds: ['TE04'],
      isTeam: false,
    };

    const reg = await api.registerParticipant(payload);
    const regId = reg.data!.registrationId;

    const updateRes = await api.updateParticipationStatus(regId, 'TE04', 'Winner');
    expect(updateRes.success).toBe(true);
  });

  it('9. getDashboardStats aggregates registrations, attendance, and event statistics', async () => {
    const stats = await api.getDashboardStats();
    expect(stats.success).toBe(true);
    expect(stats.data.totalEvents).toBe(15);
    expect(stats.data.eventStats.length).toBe(15);
    expect(typeof stats.data.totalRegistered).toBe('number');
    expect(typeof stats.data.receptionPresent).toBe('number');
  });

  it('10. Committee authentication validates roles and credentials', async () => {
    // Super Admin login
    const adminLogin = await api.loginAdmin('evoxisadmin', 'evoxis2026!');
    expect(adminLogin.success).toBe(true);
    expect(adminLogin.user?.role).toBe('SUPER_ADMIN');

    // Reception desk login
    const receptionLogin = await api.loginAdmin('reception', 'sriram2026');
    expect(receptionLogin.success).toBe(true);
    expect(receptionLogin.user?.role).toBe('REGISTRATION_COMMITTEE');

    // Event Coordinator login
    const coordLogin = await api.loginAdmin('coord_te01', 'coord2026');
    expect(coordLogin.success).toBe(true);
    expect(coordLogin.user?.role).toBe('EVENT_COORDINATOR');
    expect(coordLogin.user?.assignedEventId).toBe('TE01');

    // Invalid login rejection
    const invalidLogin = await api.loginAdmin('admin', 'wrongpassword');
    expect(invalidLogin.success).toBe(false);
  });

  it('11. Team Registration persists complete team roster with all member details and roles', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Arun Kumar',
      email: 'arun.lead@example.com',
      phone: '9840111111',
      collegeName: 'Sriram Engineering College',
      department: 'CSBS',
      yearOfStudy: '3rd Year',
      gender: 'Male',
      selectedEventIds: ['TE02', 'SP01'],
      isTeam: true,
      teamName: 'Code Warriors',
      teamMembers: [
        {
          name: 'Kumar V',
          email: 'kumar.v@example.com',
          phone: '9840111112',
          college: 'Sriram Engineering College',
          department: 'CSBS',
          year: '3rd Year',
          gender: 'Male',
          role: 'TEAM_MEMBER',
        },
        {
          name: 'Ravi Shankar',
          email: 'ravi.s@example.com',
          phone: '9840111113',
          college: 'Sriram Engineering College',
          department: 'CSE',
          year: '3rd Year',
          gender: 'Male',
          role: 'TEAM_MEMBER',
        },
        {
          name: 'Suresh Raina',
          email: 'suresh.r@example.com',
          phone: '9840111114',
          college: 'Sriram Engineering College',
          department: 'ECE',
          year: '3rd Year',
          gender: 'Male',
          role: 'TEAM_MEMBER',
        },
      ],
      agreedToRules: true,
    };

    const response = await api.registerParticipant(payload);
    expect(response.success).toBe(true);
    expect(response.data?.teamName).toBe('Code Warriors');
    expect(response.data?.teamMembers?.length).toBe(3);
    expect(response.data?.participants?.length).toBe(4);

    // Verify Team Head
    const head = response.data?.participants?.[0];
    expect(head?.name).toBe('Arun Kumar');
    expect(head?.role).toBe('TEAM_HEAD');

    // Verify Team Members
    const member1 = response.data?.participants?.[1];
    expect(member1?.name).toBe('Kumar V');
    expect(member1?.email).toBe('kumar.v@example.com');
    expect(member1?.role).toBe('TEAM_MEMBER');

    // Verify retrieval includes team information
    const regId = response.data!.registrationId;
    const lookup = await api.getRegistration({ registrationId: regId });
    expect(lookup.success).toBe(true);
    expect(lookup.data?.teamName).toBe('Code Warriors');
    expect(lookup.data?.teamMembers?.length).toBe(4);

    // Verify each team member is individually queryable by email
    const memberLookupByEmail = await api.getRegistration({ email: 'kumar.v@example.com' });
    expect(memberLookupByEmail.success).toBe(true);
    expect(memberLookupByEmail.data?.participantName).toBe('Kumar V');
    expect(memberLookupByEmail.data?.events.length).toBe(2);

    // Verify query by member-specific registration ID
    const memberLookupById = await api.getRegistration({ registrationId: `${regId}-M1` });
    expect(memberLookupById.success).toBe(true);
    expect(memberLookupById.data?.participantName).toBe('Kumar V');
  });

  // =========================================================================
  // PROMPT 10 COMPLIANCE TESTS (TEST CASES 1 - 7)
  // =========================================================================

  it('12. Prompt 10 TEST 1 — Single Event (TE01) + Referral (Instagram Post)', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Test Participant 1',
      email: 'test1@example.com',
      phone: '9840100001',
      collegeName: 'Sriram Engineering College',
      department: 'CSBS',
      yearOfStudy: '3rd Year',
      gender: 'Male',
      selectedEventIds: ['TE01'],
      referralSource: 'Instagram Post',
      agreedToRules: true,
    };

    const res = await api.registerParticipant(payload);
    expect(res.success).toBe(true);
    expect(res.data?.selectedEvents).toEqual(['TE01']);
    expect(res.data?.totalEvents).toBe(1);
    expect(res.data?.referralSource).toBe('Instagram Post');

    const lookup = await api.getRegistration({ registrationId: res.data!.registrationId });
    expect(lookup.success).toBe(true);
    expect(lookup.data?.referralSource).toBe('Instagram Post');
    expect(lookup.data?.events.length).toBe(1);
    expect(lookup.data?.events[0].eventId).toBe('TE01');
  });

  it('13. Prompt 10 TEST 2 — Multiple Events (TE01, TE02, NT01) + Referral (College Friend)', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Kiran Kumar',
      email: 'kiran.multi@example.com',
      phone: '9840100002',
      collegeName: 'Sriram Engineering College',
      department: 'CSBS',
      yearOfStudy: '3rd Year',
      gender: 'Male',
      selectedEventIds: ['TE01', 'TE02', 'NT01'],
      referralSource: 'College Friend',
      agreedToRules: true,
    };

    const res = await api.registerParticipant(payload);
    expect(res.success).toBe(true);
    expect(res.data?.selectedEvents).toEqual(['TE01', 'TE02', 'NT01']);
    expect(res.data?.totalEvents).toBe(3);
    expect(res.data?.referralSource).toBe('College Friend');

    const lookup = await api.getRegistration({ registrationId: res.data!.registrationId });
    expect(lookup.success).toBe(true);
    expect(lookup.data?.referralSource).toBe('College Friend');
    expect(lookup.data?.events.length).toBe(3);
    expect(lookup.data?.events.map((e) => e.eventId)).toEqual(['TE01', 'TE02', 'NT01']);
  });

  it('14. Prompt 10 TEST 3 — Other Referral Source (Other + WhatsApp Group)', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Participant Other',
      email: 'other@example.com',
      phone: '9840100003',
      collegeName: 'Sriram Engineering College',
      department: 'IT',
      yearOfStudy: '2nd Year',
      gender: 'Female',
      selectedEventIds: ['TE01'],
      referralSource: 'Other',
      referralSourceOther: 'WhatsApp Group',
      agreedToRules: true,
    };

    const res = await api.registerParticipant(payload);
    expect(res.success).toBe(true);
    expect(res.data?.referralSource).toBe('Other');
    expect(res.data?.referralSourceOther).toBe('WhatsApp Group');

    const lookup = await api.getRegistration({ registrationId: res.data!.registrationId });
    expect(lookup.success).toBe(true);
    expect(lookup.data?.referralSource).toBe('Other');
    expect(lookup.data?.referralSourceOther).toBe('WhatsApp Group');
  });

  it('15. Prompt 10 TEST 6 — Team Registration with Multiple Events and Referral Source', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Dhoni M S',
      email: 'dhoni@csk.com',
      phone: '9840700007',
      collegeName: 'CSK Academy',
      department: 'Sports Analytics',
      yearOfStudy: '4th Year',
      gender: 'Male',
      selectedEventIds: ['TE01', 'TE02'],
      isTeam: true,
      teamName: 'Team CSK',
      teamMembers: [
        {
          name: 'Jadeja R',
          email: 'jadeja@csk.com',
          phone: '9840700008',
          college: 'CSK Academy',
          department: 'Sports Analytics',
          year: '4th Year',
          gender: 'Male',
          role: 'TEAM_MEMBER',
        },
      ],
      referralSource: 'College Staff',
      agreedToRules: true,
    };

    const res = await api.registerParticipant(payload);
    expect(res.success).toBe(true);
    expect(res.data?.teamName).toBe('Team CSK');
    expect(res.data?.referralSource).toBe('College Staff');
    expect(res.data?.participants?.length).toBe(2);
    expect(res.data?.selectedEvents).toEqual(['TE01', 'TE02']);
    expect(res.data?.totalEvents).toBe(2);

    // Team head & member both queryable
    const headLookup = await api.getRegistration({ email: 'dhoni@csk.com' });
    expect(headLookup.success).toBe(true);
    expect(headLookup.data?.events.length).toBe(2);

    const memberLookup = await api.getRegistration({ email: 'jadeja@csk.com' });
    expect(memberLookup.success).toBe(true);
    expect(memberLookup.data?.events.length).toBe(2);
  });

  it('16. Prompt 10 TEST 7 — Event Desk verifies each registered event independently', async () => {
    const payload: RegistrationFormData = {
      fullName: 'Multi Attendee',
      email: 'multi.desk@example.com',
      phone: '9840100099',
      collegeName: 'Sriram Engineering College',
      department: 'CSE',
      yearOfStudy: '3rd Year',
      selectedEventIds: ['TE01', 'TE02', 'NT01'],
      referralSource: 'Instagram Post',
      agreedToRules: true,
    };

    const res = await api.registerParticipant(payload);
    const qrToken = res.data!.qrToken;

    // At TE01 Desk -> ALLOW CHECK-IN
    const te01Check = await api.checkEventRegistration(qrToken, 'TE01');
    expect(te01Check.success).toBe(true);
    expect(te01Check.registered).toBe(true);
    const te01Mark = await api.markEventAttendance(qrToken, 'TE01', 'TE01 Coord');
    expect(te01Mark.success).toBe(true);

    // At TE02 Desk -> ALLOW CHECK-IN
    const te02Check = await api.checkEventRegistration(qrToken, 'TE02');
    expect(te02Check.success).toBe(true);
    expect(te02Check.registered).toBe(true);
    const te02Mark = await api.markEventAttendance(qrToken, 'TE02', 'TE02 Coord');
    expect(te02Mark.success).toBe(true);

    // At TE05 Desk -> NOT REGISTERED FOR THIS EVENT
    const te05Check = await api.checkEventRegistration(qrToken, 'TE05');
    expect(te05Check.success).toBe(true);
    expect(te05Check.registered).toBe(false);
  });
});
