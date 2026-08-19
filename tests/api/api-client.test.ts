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
    expect(stats.data.totalEvents).toBe(16);
    expect(stats.data.eventStats.length).toBe(16);
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
});
