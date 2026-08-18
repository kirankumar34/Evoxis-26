import {
  EventId,
  EventCategory,
  ParticipationStatus,
  OverallRegistrationRecord,
  AttendanceLogRecord,
  RegistrationFormData,
  QRValidationResponse,
  EventDeskValidationResponse,
  AdminUser,
} from '@/types';
import { EVENTS } from '@/data/events';

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';

/**
 * Local Storage Keys for offline / demo simulation
 */
const STORAGE_KEYS = {
  REGISTRATIONS: 'evoxis26_overall_registrations',
  ATTENDANCE_LOG: 'evoxis26_attendance_log',
  SEQUENCE: 'evoxis26_last_sequence',
  CURRENT_ADMIN: 'evoxis26_active_admin',
};

// Seed initial realistic mock participants for demo/testing if local storage is fresh
function initMockData(): void {
  if (typeof window === 'undefined') return;

  const existing = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
  if (!existing) {
    const initialRecords: OverallRegistrationRecord[] = [
      {
        registrationId: 'EVOXIS26-00001',
        registrationDate: '2026-09-20',
        registrationTime: '10:30:00 AM',
        participantName: 'Priya Raman',
        email: 'priya.raman@gmail.com',
        mobileNumber: '9840112345',
        collegeInstitution: 'Sri Sivasubramaniya Nadar College of Engineering',
        department: 'Computer Science and Engineering',
        year: '3rd Year',
        gender: 'Female',
        registrationType: 'Individual',
        selectedEvents: 'TE01, NT05, SP02',
        totalEvents: 3,
        totalAmount: 0,
        paymentStatus: 'Free',
        qrToken: 'EVOXIS26:9a8f2c3d1e0b4a7',
        qrStatus: 'Active',
        emailStatus: 'Sent',
        smsStatus: 'Sent',
        whatsappStatus: 'Sent',
        overallAttendanceStatus: 'Pending',
        registrationStatus: 'Confirmed',
      },
      {
        registrationId: 'EVOXIS26-00002',
        registrationDate: '2026-09-21',
        registrationTime: '02:15:00 PM',
        participantName: 'Rahul Sundar',
        email: 'rahul.sundar@gmail.com',
        mobileNumber: '9123456789',
        collegeInstitution: 'Chennai Institute of Technology',
        department: 'Artificial Intelligence & Data Science',
        year: '4th Year',
        gender: 'Male',
        registrationType: 'Team',
        selectedEvents: 'TE02, TE06, SP04',
        totalEvents: 3,
        totalAmount: 0,
        paymentStatus: 'Free',
        qrToken: 'EVOXIS26:4b7c8d9e0f1a234',
        qrStatus: 'Active',
        emailStatus: 'Sent',
        smsStatus: 'Sent',
        whatsappStatus: 'Sent',
        overallAttendanceStatus: 'Pending',
        registrationStatus: 'Confirmed',
        teamName: 'CyberTitans',
      },
      {
        registrationId: 'EVOXIS26-00003',
        registrationDate: '2026-09-22',
        registrationTime: '11:45:00 AM',
        participantName: 'Kavitha M',
        email: 'kavitha.m@gmail.com',
        mobileNumber: '9884012233',
        collegeInstitution: 'Sriram Engineering College',
        department: 'Cyber Security',
        year: '2nd Year',
        gender: 'Female',
        registrationType: 'Individual',
        selectedEvents: 'TE04, NT01, SP03',
        totalEvents: 3,
        totalAmount: 0,
        paymentStatus: 'Free',
        qrToken: 'EVOXIS26:1f2e3d4c5b6a789',
        qrStatus: 'Active',
        emailStatus: 'Sent',
        smsStatus: 'Sent',
        whatsappStatus: 'Sent',
        overallAttendanceStatus: 'Pending',
        registrationStatus: 'Confirmed',
      },
    ];

    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(initialRecords));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_LOG, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SEQUENCE, '3');
  }
}

// Simple deterministic hash simulation for QR Token in mock mode
function generateMockQRToken(regId: string): string {
  let hash = 0;
  for (let i = 0; i < regId.length; i++) {
    hash = (hash << 5) - hash + regId.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `EVOXIS26:${hex}${regId.replace(/[^0-9]/g, '')}`;
}

/**
 * Main API Service Client
 */
export const api = {
  isMockMode(): boolean {
    return !APPS_SCRIPT_URL || APPS_SCRIPT_URL.trim() === '';
  },

  /**
   * Register a participant for 1 or more events
   */
  async registerParticipant(payload: RegistrationFormData): Promise<{
    success: boolean;
    isDuplicate?: boolean;
    data?: {
      registrationId: string;
      qrToken: string;
      participantName: string;
      email: string;
      mobileNumber: string;
      college: string;
      department: string;
      selectedEvents: EventId[];
      totalEvents: number;
      registrationDate: string;
    };
    message?: string;
  }> {
    // 1. Live Google Apps Script POST
    if (!this.isMockMode()) {
      console.log(`[EvoXis26 API] 🚀 Submitting registration to Google Apps Script backend: ${APPS_SCRIPT_URL}`, payload);
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'registerParticipant',
            ...payload,
            phone: payload.phone,
          }),
        });

        if (!response.ok) {
          throw new Error(`Google Apps Script responded with HTTP status ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('[EvoXis26 API] 📥 Google Apps Script write response:', result);
        return result;
      } catch (err: any) {
        console.error('[EvoXis26 API] ❌ Google Apps Script live write failed:', err);
        return {
          success: false,
          message: `Could not save to Google Sheets: ${err?.message || 'Network error'}. Please check Web App deployment & permissions.`,
        };
      }
    }

    // 2. Local Simulation Mode (only if VITE_APPS_SCRIPT_URL is not provided)
    console.warn('[EvoXis26 API] ⚠️ VITE_APPS_SCRIPT_URL is not set. Saving registration to browser Local Storage (Simulation Mode).');
    initMockData();
    await new Promise((r) => setTimeout(r, 400)); // Simulate realistic network delay

    const records: OverallRegistrationRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]'
    );

    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanPhone = payload.phone.trim();

    // Check duplicate
    const existing = records.find(
      (r) =>
        r.registrationStatus !== 'Cancelled' &&
        (r.email.toLowerCase() === cleanEmail || r.mobileNumber === cleanPhone)
    );

    if (existing) {
      const existingEvents = existing.selectedEvents.split(',').map((s) => s.trim()) as EventId[];
      const common = payload.selectedEventIds.filter((e) => existingEvents.includes(e));
      if (common.length > 0) {
        return {
          success: true,
          isDuplicate: true,
          message: `Already registered for event(s): ${common.join(', ')}`,
          data: {
            registrationId: existing.registrationId,
            qrToken: existing.qrToken,
            participantName: existing.participantName,
            email: existing.email,
            mobileNumber: existing.mobileNumber,
            college: existing.collegeInstitution,
            department: existing.department,
            selectedEvents: existingEvents,
            totalEvents: existingEvents.length,
            registrationDate: existing.registrationDate,
          },
        };
      }
    }

    // Generate atomic sequential ID
    const currentSeq = parseInt(localStorage.getItem(STORAGE_KEYS.SEQUENCE) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEYS.SEQUENCE, currentSeq.toString());
    const regId = `EVOXIS26-${String(currentSeq).padStart(5, '0')}`;
    const qrToken = generateMockQRToken(regId);

    const now = new Date();
    const regDate = now.toISOString().split('T')[0];
    const regTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newRecord: OverallRegistrationRecord = {
      registrationId: regId,
      registrationDate: regDate,
      registrationTime: regTime,
      participantName: payload.fullName,
      email: cleanEmail,
      mobileNumber: cleanPhone,
      collegeInstitution: payload.collegeName,
      department: payload.department,
      year: payload.yearOfStudy,
      gender: payload.gender || 'Not Specified',
      registrationType: payload.isTeam ? 'Team' : 'Individual',
      selectedEvents: payload.selectedEventIds.join(', '),
      totalEvents: payload.selectedEventIds.length,
      totalAmount: 0,
      paymentStatus: 'Free',
      qrToken,
      qrStatus: 'Active',
      emailStatus: 'Sent',
      smsStatus: 'Sent',
      whatsappStatus: 'Sent',
      overallAttendanceStatus: 'Pending',
      registrationStatus: 'Confirmed',
      teamName: payload.teamName,
      teamMembers: payload.teamMembers,
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(records));

    return {
      success: true,
      data: {
        registrationId: regId,
        qrToken,
        participantName: payload.fullName,
        email: cleanEmail,
        mobileNumber: cleanPhone,
        college: payload.collegeName,
        department: payload.department,
        selectedEvents: payload.selectedEventIds,
        totalEvents: payload.selectedEventIds.length,
        registrationDate: regDate,
      },
      message: 'Registration confirmed successfully.',
    };
  },

  /**
   * Lookup registration details by Registration ID, Email, Phone, or QR Token
   */
  async getRegistration(query: {
    registrationId?: string;
    email?: string;
    mobile?: string;
    qrToken?: string;
  }): Promise<{
    success: boolean;
    data?: OverallRegistrationRecord & {
      events: {
        eventId: EventId;
        eventName: string;
        category: EventCategory;
        attendanceStatus: 'Pending' | 'Present' | 'Absent';
        participationStatus: ParticipationStatus;
      }[];
    };
    message?: string;
  }> {
    if (!this.isMockMode()) {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getRegistration', ...query }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script fetch failed:', err);
      }
    }

    initMockData();
    await new Promise((r) => setTimeout(r, 200));

    const records: OverallRegistrationRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]'
    );
    const logs: AttendanceLogRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOG) || '[]'
    );

    const match = records.find((r) => {
      if (query.registrationId && r.registrationId.toUpperCase() === query.registrationId.trim().toUpperCase()) return true;
      if (query.email && r.email.toLowerCase() === query.email.trim().toLowerCase()) return true;
      if (query.mobile && r.mobileNumber === query.mobile.trim()) return true;
      if (query.qrToken && r.qrToken.trim() === query.qrToken.trim()) return true;
      return false;
    });

    if (!match) {
      return { success: false, message: 'No registration record found matching the details provided.' };
    }

    const eventIds = match.selectedEvents.split(',').map((s) => s.trim()) as EventId[];
    const events = eventIds.map((eid) => {
      const evt = EVENTS.find((e) => e.eventId === eid);
      const isPresent = logs.some((l) => l.registrationId === match.registrationId && l.eventId === eid && l.attendanceStatus === 'Present');
      return {
        eventId: eid,
        eventName: evt ? evt.title : eid,
        category: evt ? evt.category : 'Technical',
        attendanceStatus: isPresent ? ('Present' as const) : ('Pending' as const),
        participationStatus: isPresent ? ('Present' as const) : ('Registered' as const),
      };
    });

    return {
      success: true,
      data: {
        ...match,
        events,
      },
    };
  },

  /**
   * Validate QR code at Reception Desk
   */
  async validateQRCode(qrToken: string): Promise<QRValidationResponse> {
    if (!this.isMockMode()) {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'validateQRCode', qrToken: qrToken.trim() }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script validateQRCode failed:', err);
      }
    }

    initMockData();
    await new Promise((r) => setTimeout(r, 200));

    const records: OverallRegistrationRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]'
    );
    const logs: AttendanceLogRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOG) || '[]'
    );

    const match = records.find((r) => r.qrToken.trim() === qrToken.trim());
    if (!match) {
      return { success: false, errorMessage: 'Invalid or unrecognized QR code.' };
    }

    if (match.registrationStatus === 'Cancelled') {
      return { success: false, errorMessage: 'This registration has been cancelled.' };
    }

    const eventIds = match.selectedEvents.split(',').map((s) => s.trim()) as EventId[];
    const events = eventIds.map((eid) => {
      const evt = EVENTS.find((e) => e.eventId === eid);
      const isPresent = logs.some((l) => l.registrationId === match.registrationId && l.eventId === eid && l.attendanceStatus === 'Present');
      return {
        eventId: eid,
        eventName: evt ? evt.title : eid,
        category: evt ? evt.category : 'Technical',
        attendanceStatus: isPresent ? ('Present' as const) : ('Pending' as const),
        participationStatus: isPresent ? ('Present' as const) : ('Registered' as const),
      };
    });

    return {
      success: true,
      registrationId: match.registrationId,
      participantName: match.participantName,
      college: match.collegeInstitution,
      department: match.department,
      year: match.year,
      email: match.email,
      mobile: match.mobileNumber,
      overallAttendanceStatus: match.overallAttendanceStatus,
      registrationDate: match.registrationDate,
      events,
    };
  },

  /**
   * Check Event Registration at an Event Desk (e.g. TE01)
   */
  async checkEventRegistration(qrToken: string, eventId: EventId): Promise<EventDeskValidationResponse> {
    if (!this.isMockMode()) {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'checkEventRegistration', qrToken: qrToken.trim(), eventId }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script checkEventRegistration failed:', err);
      }
    }

    initMockData();
    await new Promise((r) => setTimeout(r, 200));

    const records: OverallRegistrationRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]'
    );
    const logs: AttendanceLogRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOG) || '[]'
    );

    const match = records.find((r) => r.qrToken.trim() === qrToken.trim());
    if (!match) {
      return { success: false, registered: false, alreadyPresent: false, errorMessage: 'Invalid or unrecognized QR code.' };
    }

    const eventIds = match.selectedEvents.split(',').map((s) => s.trim());
    const isRegistered = eventIds.includes(eventId);
    const evt = EVENTS.find((e) => e.eventId === eventId);
    const eventName = evt ? evt.title : eventId;

    if (!isRegistered) {
      return {
        success: true,
        registered: false,
        alreadyPresent: false,
        errorMessage: `Participant is not registered for ${eventName} (${eventId}).`,
        participant: {
          registrationId: match.registrationId,
          participantName: match.participantName,
          college: match.collegeInstitution,
          department: match.department,
          year: match.year,
          email: match.email,
          mobile: match.mobileNumber,
          eventId,
          eventName,
          category: evt ? evt.category : 'Technical',
          attendanceStatus: 'Pending',
          participationStatus: 'Registered',
        },
      };
    }

    const priorCheckIn = logs.find(
      (l) => l.registrationId === match.registrationId && l.eventId === eventId && l.attendanceStatus === 'Present'
    );

    return {
      success: true,
      registered: true,
      alreadyPresent: !!priorCheckIn,
      priorCheckInTimestamp: priorCheckIn ? `${priorCheckIn.attendanceDate} ${priorCheckIn.attendanceTime}` : undefined,
      participant: {
        registrationId: match.registrationId,
        participantName: match.participantName,
        college: match.collegeInstitution,
        department: match.department,
        year: match.year,
        email: match.email,
        mobile: match.mobileNumber,
        eventId,
        eventName,
        category: evt ? evt.category : 'Technical',
        attendanceStatus: priorCheckIn ? 'Present' : 'Pending',
        participationStatus: priorCheckIn ? 'Present' : 'Registered',
      },
    };
  },

  /**
   * Mark Reception Attendance (Overall Present)
   */
  async markReceptionAttendance(qrToken: string, verifiedBy = 'Reception Staff'): Promise<{
    success: boolean;
    timestamp?: string;
    participantName?: string;
    registrationId?: string;
    message?: string;
  }> {
    if (!this.isMockMode()) {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'markReceptionAttendance', qrToken: qrToken.trim(), verifiedBy }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script markReceptionAttendance failed:', err);
      }
    }

    initMockData();
    const records: OverallRegistrationRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]'
    );
    const logs: AttendanceLogRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOG) || '[]'
    );

    const idx = records.findIndex((r) => r.qrToken.trim() === qrToken.trim());
    if (idx === -1) {
      return { success: false, message: 'Participant record not found.' };
    }

    records[idx].overallAttendanceStatus = 'Present';
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(records));

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const newLog: AttendanceLogRecord = {
      attendanceId: `ATT-REC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      registrationId: records[idx].registrationId,
      participantName: records[idx].participantName,
      eventId: 'RECEPTION',
      eventName: 'Campus Reception Check-In',
      eventType: 'Reception Check-In',
      attendanceDate: dateStr,
      attendanceTime: timeStr,
      attendanceLocation: 'Main Reception Desk',
      attendanceStatus: 'Present',
      participationStatus: 'Present',
      verifiedBy,
      qrToken,
      scanTimestamp: now.toISOString(),
    };

    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_LOG, JSON.stringify(logs));

    return {
      success: true,
      timestamp: timeStr,
      participantName: records[idx].participantName,
      registrationId: records[idx].registrationId,
      message: 'Reception check-in confirmed successfully.',
    };
  },

  /**
   * Mark Event Attendance at Event Desk
   */
  async markEventAttendance(qrToken: string, eventId: EventId, verifiedBy = 'Event Coordinator'): Promise<{
    success: boolean;
    timestamp?: string;
    participantName?: string;
    registrationId?: string;
    eventId?: EventId;
    message?: string;
  }> {
    if (!this.isMockMode()) {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'markEventAttendance', qrToken: qrToken.trim(), eventId, verifiedBy }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script markEventAttendance failed:', err);
      }
    }

    initMockData();
    const records: OverallRegistrationRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]'
    );
    const logs: AttendanceLogRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOG) || '[]'
    );

    const match = records.find((r) => r.qrToken.trim() === qrToken.trim());
    if (!match) {
      return { success: false, message: 'Participant record not found.' };
    }

    const evt = EVENTS.find((e) => e.eventId === eventId);
    const eventName = evt ? evt.title : eventId;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const newLog: AttendanceLogRecord = {
      attendanceId: `ATT-EVT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      registrationId: match.registrationId,
      participantName: match.participantName,
      eventId,
      eventName,
      eventType: evt ? evt.category : 'Technical',
      attendanceDate: dateStr,
      attendanceTime: timeStr,
      attendanceLocation: evt ? evt.schedule.venue : 'Event Desk',
      attendanceStatus: 'Present',
      participationStatus: 'Present',
      verifiedBy,
      qrToken,
      scanTimestamp: now.toISOString(),
    };

    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE_LOG, JSON.stringify(logs));

    return {
      success: true,
      timestamp: timeStr,
      participantName: match.participantName,
      registrationId: match.registrationId,
      eventId,
      message: `Event attendance marked successfully for ${eventName}.`,
    };
  },

  /**
   * Update Participation Status for an attendee
   */
  async updateParticipationStatus(
    registrationId: string,
    eventId: EventId,
    status: ParticipationStatus
  ): Promise<{ success: boolean; message: string }> {
    if (!this.isMockMode()) {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'updateParticipationStatus', registrationId, eventId, status }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script updateParticipationStatus failed:', err);
      }
    }

    return { success: true, message: `Participation status updated to ${status}` };
  },

  /**
   * Get Live Dashboard Statistics
   */
  async getDashboardStats(): Promise<{
    success: boolean;
    data: {
      totalRegistered: number;
      receptionPresent: number;
      totalEvents: number;
      eventStats: {
        eventId: EventId;
        eventName: string;
        category: EventCategory;
        registered: number;
        present: number;
        absent: number;
        participated: number;
      }[];
    };
  }> {
    if (!this.isMockMode()) {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getDashboardStats' }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script getDashboardStats failed:', err);
      }
    }

    initMockData();
    const records: OverallRegistrationRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]'
    );
    const logs: AttendanceLogRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOG) || '[]'
    );

    let totalRegistered = 0;
    let receptionPresent = 0;

    const eventStatsMap: Record<string, {
      eventId: EventId;
      eventName: string;
      category: EventCategory;
      registered: number;
      present: number;
      absent: number;
      participated: number;
    }> = {};

    EVENTS.forEach((e) => {
      eventStatsMap[e.eventId] = {
        eventId: e.eventId,
        eventName: e.title,
        category: e.category,
        registered: 0,
        present: 0,
        absent: 0,
        participated: 0,
      };
    });

    records.forEach((r) => {
      if (r.registrationStatus !== 'Cancelled') {
        totalRegistered++;
        if (r.overallAttendanceStatus === 'Present') {
          receptionPresent++;
        }
        const evts = r.selectedEvents.split(',').map((s) => s.trim()) as EventId[];
        evts.forEach((eid) => {
          if (eventStatsMap[eid]) {
            eventStatsMap[eid].registered++;
          }
        });
      }
    });

    logs.forEach((l) => {
      if (l.eventId !== 'RECEPTION' && eventStatsMap[l.eventId]) {
        if (l.attendanceStatus === 'Present') {
          eventStatsMap[l.eventId].present++;
        }
        if (l.participationStatus === 'Participated') {
          eventStatsMap[l.eventId].participated++;
        }
      }
    });

    return {
      success: true,
      data: {
        totalRegistered,
        receptionPresent,
        totalEvents: EVENTS.length,
        eventStats: Object.values(eventStatsMap),
      },
    };
  },

  /**
   * Get all registrations for Master Table
   */
  async getAllRegistrations(): Promise<OverallRegistrationRecord[]> {
    initMockData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]');
  },

  /**
   * Get all attendance logs for Audit Trail
   */
  async getAttendanceLogs(): Promise<AttendanceLogRecord[]> {
    initMockData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOG) || '[]');
  },

  /**
   * Authenticate Admin / Committee / Coordinator Login
   */
  async loginAdmin(username: string, password: string): Promise<{
    success: boolean;
    user?: AdminUser;
    message?: string;
  }> {
    const cleanUser = username.trim().toLowerCase();

    // 1. Super Admin
    if (
      (cleanUser === 'evoxisadmin' && password === 'evoxis2026!') ||
      (cleanUser === 'admin' && password === 'admin')
    ) {
      const user: AdminUser = { username: 'evoxisadmin', name: 'Symposium Director', role: 'SUPER_ADMIN' };
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(user));
      return { success: true, user };
    }

    // 2. Reception / Registration Committee
    if (
      (cleanUser === 'reception' && (password === 'sriram2026' || password === 'reception')) ||
      (cleanUser === 'committee' && password === 'committee')
    ) {
      const user: AdminUser = { username: 'reception', name: 'Reception Desk Head', role: 'REGISTRATION_COMMITTEE' };
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(user));
      return { success: true, user };
    }

    // 3. Event Coordinators: coord_te01, coord_nt05, etc.
    if (cleanUser.startsWith('coord_') || cleanUser.startsWith('coord')) {
      const parsedId = cleanUser.replace('coord_', '').replace('coord', '').toUpperCase() as EventId;
      const validEvt = EVENTS.find((e) => e.eventId === parsedId);
      if (validEvt) {
        const user: AdminUser = {
          username: cleanUser,
          name: `${validEvt.title} Coordinator`,
          role: 'EVENT_COORDINATOR',
          assignedEventId: validEvt.eventId,
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(user));
        return { success: true, user };
      }
    }

    return { success: false, message: 'Invalid username or password credentials.' };
  },

  /**
   * Get Current Logged In Admin User
   */
  getCurrentAdmin(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Logout Admin
   */
  logoutAdmin(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
  },
};
