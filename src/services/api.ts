import {
  EventId,
  EventCategory,
  ParticipationStatus,
  OverallRegistrationRecord,
  AttendanceLogRecord,
  RegistrationFormData,
  TeamMember,
  QRValidationResponse,
  EventDeskValidationResponse,
  AdminUser,
} from '@/types';
import { EVENTS } from '@/data/events';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const APPS_SCRIPT_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APPS_SCRIPT_URL) || '';

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

// Simple deterministic hash for QR Token
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
 * Main API Service Client Supporting Supabase + Google Apps Script + Local Storage
 */
export const api = {
  getBackendType(): 'SUPABASE' | 'GOOGLE_SHEETS' | 'LOCAL_MOCK' {
    if (isSupabaseConfigured()) return 'SUPABASE';
    if (APPS_SCRIPT_URL && APPS_SCRIPT_URL.trim() !== '') return 'GOOGLE_SHEETS';
    return 'LOCAL_MOCK';
  },

  isMockMode(): boolean {
    return this.getBackendType() === 'LOCAL_MOCK';
  },

  /**
   * Register a participant for 1 or more events (Individual or Team)
   * Implements dual-persistence architecture: Writes to Supabase & Google Apps Script (Sheets)
   */
  async registerParticipant(payload: RegistrationFormData): Promise<{
    success: boolean;
    isDuplicate?: boolean;
    databaseSuccess?: boolean;
    sheetsSyncSuccess?: boolean;
    emailSuccess?: boolean;
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
      referralSource?: string;
      referralSourceOther?: string;
      registrationDate: string;
      teamName?: string;
      teamMembers?: TeamMember[];
      participants?: Array<{
        name: string;
        email: string;
        phone: string;
        college: string;
        department: string;
        year: string;
        gender: string;
        role: 'TEAM_HEAD' | 'TEAM_MEMBER' | 'INDIVIDUAL';
      }>;
    };
    message?: string;
  }> {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanPhone = payload.phone.trim();
    const isTeam = Boolean(payload.isTeam || (payload.teamMembers && payload.teamMembers.length > 0) || payload.teamName);
    const safeTeamName = payload.teamName?.trim() || (isTeam ? `${payload.fullName}'s Team` : '');
    const referralSource = (payload.referralSource || 'Not Specified').trim();
    const referralSourceOther = payload.referralSourceOther?.trim() || null;

    // 1. Normalize Team Head and all Co-Members into a structured participant roster
    const teamHeadParticipant: {
      name: string;
      email: string;
      phone: string;
      college: string;
      department: string;
      year: string;
      gender: string;
      role: 'TEAM_HEAD' | 'INDIVIDUAL';
    } = {
      name: payload.fullName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      college: payload.collegeName.trim(),
      department: payload.department.trim(),
      year: payload.yearOfStudy || '3rd Year',
      gender: payload.gender || 'Not Specified',
      role: isTeam ? 'TEAM_HEAD' : 'INDIVIDUAL',
    };

    const normalizedTeamMembers: TeamMember[] = (payload.teamMembers || [])
      .filter((m) => m && m.name && m.name.trim() !== '')
      .map((m) => ({
        name: m.name.trim(),
        email: (m.email || '').trim().toLowerCase(),
        phone: (m.phone || '').trim(),
        college: (m.college || payload.collegeName).trim(),
        department: (m.department || payload.department).trim(),
        year: m.year || payload.yearOfStudy || '3rd Year',
        gender: m.gender || 'Not Specified',
        role: 'TEAM_MEMBER' as const,
      }));

    const allParticipants: Array<{
      name: string;
      email: string;
      phone: string;
      college: string;
      department: string;
      year: string;
      gender: string;
      role: 'TEAM_HEAD' | 'TEAM_MEMBER' | 'INDIVIDUAL';
    }> = [
      teamHeadParticipant,
      ...normalizedTeamMembers.map((m) => ({
        name: m.name,
        email: m.email,
        phone: m.phone,
        college: m.college || payload.collegeName.trim(),
        department: m.department,
        year: m.year || payload.yearOfStudy || '3rd Year',
        gender: m.gender || 'Not Specified',
        role: (m.role || 'TEAM_MEMBER') as 'TEAM_MEMBER',
      })),
    ];

    const now = new Date();
    const regDate = now.toISOString().split('T')[0];
    const regTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    let databaseSuccess = false;
    let sheetsSyncSuccess = false;
    let assignedRegId = '';
    let assignedQrToken = '';

    const backendType = this.getBackendType();
    const isLiveProduction = backendType !== 'LOCAL_MOCK';

    // =========================================================================
    // STEP A: SUPABASE DATABASE WRITE (when configured and live)
    // =========================================================================
    if (isLiveProduction && (backendType === 'SUPABASE' || isSupabaseConfigured())) {
      console.log('[EvoXis26 API] 🚀 Submitting registration to Supabase PostgreSQL Database:', payload);
      try {
        // 1. Duplicate check in Supabase
        const { data: existingRecords, error: checkErr } = await supabase
          .from('overall_registrations')
          .select('registration_id, email, mobile_number, qr_token, participant_name, college_institution, department, selected_events, registration_date, registration_status, team_name, team_members')
          .or(`email.eq.${cleanEmail},mobile_number.eq.${cleanPhone}`);

        if (!checkErr && existingRecords && existingRecords.length > 0) {
          const active = existingRecords.find((r) => r.registration_status !== 'Cancelled');
          if (active) {
            const existingEvents = active.selected_events.split(',').map((s: string) => s.trim()) as EventId[];
            const common = payload.selectedEventIds.filter((e) => existingEvents.includes(e));

            if (common.length > 0) {
              console.log('[EvoXis26 API] ⚠️ Duplicate registration detected in Supabase:', active.registration_id);
              return {
                success: true,
                isDuplicate: true,
                databaseSuccess: true,
                sheetsSyncSuccess: true,
                emailSuccess: true,
                message: `Already registered for event(s): ${common.join(', ')}`,
                data: {
                  registrationId: active.registration_id,
                  qrToken: active.qr_token,
                  participantName: active.participant_name,
                  email: active.email,
                  mobileNumber: active.mobile_number,
                  college: active.college_institution,
                  department: active.department,
                  selectedEvents: existingEvents,
                  totalEvents: existingEvents.length,
                  referralSource: referralSource,
                  referralSourceOther: referralSourceOther || undefined,
                  registrationDate: active.registration_date,
                  teamName: active.team_name || undefined,
                  teamMembers: active.team_members || [],
                },
              };
            }
          }
        }

        // 2. Determine Next Sequential Registration ID & QR Token
        let nextSeq = 1;
        const { data: existingIds } = await supabase
          .from('overall_registrations')
          .select('registration_id');

        if (existingIds && existingIds.length > 0) {
          let maxNum = 0;
          existingIds.forEach((r) => {
            const match = r.registration_id?.match(/^EVOXIS26-(\d+)/i);
            if (match) {
              const num = parseInt(match[1], 10);
              if (num < 80000 && num > maxNum) {
                maxNum = num;
              }
            }
          });
          nextSeq = maxNum + 1;
        }

        assignedRegId = `EVOXIS26-${String(nextSeq).padStart(5, '0')}`;
        assignedQrToken = generateMockQRToken(assignedRegId);

        // 3. Assemble Master Records for ALL Participants with unique ID & QR Token
        const participantsWithTokens = allParticipants.map((p, idx) => {
          const memberRegId = idx === 0 ? assignedRegId : `${assignedRegId}-M${idx}`;
          const memberQrToken = idx === 0 ? assignedQrToken : `${assignedQrToken}-M${idx}`;
          return {
            ...p,
            registrationId: memberRegId,
            qrToken: memberQrToken,
          };
        });

        const masterRows = participantsWithTokens.map((p) => {
          return {
            registration_id: p.registrationId,
            registration_date: regDate,
            registration_time: regTime,
            participant_name: p.name,
            email: p.email,
            mobile_number: p.phone,
            college_institution: p.college,
            department: p.department,
            year: p.year || payload.yearOfStudy || '3rd Year',
            gender: p.gender || 'Not Specified',
            registration_type: isTeam ? 'Team' : 'Individual',
            selected_events: payload.selectedEventIds.join(', '),
            total_events: payload.selectedEventIds.length,
            total_amount: 0,
            payment_status: 'Free',
            qr_token: p.qrToken,
            qr_status: 'Active',
            email_status: 'Sent',
            sms_status: 'Sent',
            whatsapp_status: 'Sent',
            overall_attendance_status: 'Pending',
            registration_status: 'Confirmed',
            team_name: safeTeamName || null,
            team_members: participantsWithTokens,
          };
        });

        const { error: insertMasterErr } = await supabase
          .from('overall_registrations')
          .insert(masterRows);

        if (insertMasterErr) {
          console.error('[EvoXis26 API] ❌ Supabase insert master error:', insertMasterErr);
          throw insertMasterErr;
        }

        // 4. Insert Individual Per-Event records for ALL Participants
        const eventRows: Array<{
          registration_id: string;
          participant_name: string;
          email: string;
          mobile: string;
          college: string;
          department: string;
          event_id: string;
          event_name: string;
          category: string;
          registration_date: string;
          qr_token: string;
          attendance_status: string;
          participation_status: string;
        }> = [];

        participantsWithTokens.forEach((p) => {
          payload.selectedEventIds.forEach((evtId) => {
            const meta = EVENTS.find((e) => e.eventId === evtId);
            eventRows.push({
              registration_id: p.registrationId,
              participant_name: p.name,
              email: p.email,
              mobile: p.phone,
              college: p.college,
              department: p.department,
              event_id: evtId,
              event_name: meta ? meta.title : evtId,
              category: meta ? meta.category : 'Technical',
              registration_date: regDate,
              qr_token: p.qrToken,
              attendance_status: 'Pending',
              participation_status: 'Registered',
            });
          });
        });

        const { error: insertEventsErr } = await supabase
          .from('event_registrations')
          .insert(eventRows);

        if (insertEventsErr) {
          console.warn('[EvoXis26 API] Supabase insert events warning:', insertEventsErr);
        }

        databaseSuccess = true;
        console.log(`[EvoXis26 API] ✅ Supabase persisted ${masterRows.length} participant record(s) and ${eventRows.length} event record(s) for ${assignedRegId}`);
      } catch (err: any) {
        console.error('[EvoXis26 API] ❌ Supabase live write failed:', err);
        return {
          success: false,
          databaseSuccess: false,
          sheetsSyncSuccess: false,
          message: `Registration could not be saved to database: ${err?.message || 'Database error'}. Please try again.`,
        };
      }
    }

    // =========================================================================
    // STEP B: GOOGLE APPS SCRIPT WEB APP (Google Sheets Dual-Sync)
    // =========================================================================
    if (isLiveProduction && APPS_SCRIPT_URL && APPS_SCRIPT_URL.trim() !== '') {
      console.log(`[EvoXis26 API] 🚀 Synchronizing registration with Google Apps Script: ${APPS_SCRIPT_URL}`);
      try {
        const gasPayload = {
          action: 'registerParticipant',
          registrationId: assignedRegId,
          qrToken: assignedQrToken,
          teamId: isTeam ? `TEAM-${assignedRegId}` : undefined,
          teamName: safeTeamName || undefined,
          isTeam,
          fullName: payload.fullName,
          email: cleanEmail,
          phone: cleanPhone,
          collegeName: payload.collegeName,
          department: payload.department,
          yearOfStudy: payload.yearOfStudy,
          gender: payload.gender,
          selectedEventIds: payload.selectedEventIds,
          referralSource: referralSource,
          referralSourceOther: referralSourceOther || undefined,
          teamMembers: normalizedTeamMembers,
          participants: allParticipants,
        };

        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(gasPayload),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('[EvoXis26 API] 📥 Google Apps Script synced registration:', result.success);
          if (result.success) {
            sheetsSyncSuccess = true;
          }
        }
      } catch (gasErr) {
        console.warn('[EvoXis26 API] ⚠️ Google Apps Script sync warning:', gasErr);
      }
    }

    // =========================================================================
    // STEP C: LOCAL MOCK / FALLBACK (ONLY when in pure LOCAL_MOCK mode)
    // =========================================================================
    if (this.getBackendType() === 'LOCAL_MOCK') {
      initMockData();
      const records: OverallRegistrationRecord[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]'
      );

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
            databaseSuccess: true,
            sheetsSyncSuccess: true,
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
              referralSource: existing.referralSource || referralSource,
              referralSourceOther: existing.referralSourceOther || undefined,
              registrationDate: existing.registrationDate,
              teamName: existing.teamName,
              teamMembers: existing.teamMembers,
            },
          };
        }
      }

      if (!assignedRegId) {
        const currentSeq = parseInt(localStorage.getItem(STORAGE_KEYS.SEQUENCE) || '0', 10) + 1;
        localStorage.setItem(STORAGE_KEYS.SEQUENCE, currentSeq.toString());
        assignedRegId = `EVOXIS26-${String(currentSeq).padStart(5, '0')}`;
        assignedQrToken = generateMockQRToken(assignedRegId);
      }

      const participantsWithTokens = allParticipants.map((p, idx) => {
        const memberRegId = idx === 0 ? assignedRegId : `${assignedRegId}-M${idx}`;
        const memberQrToken = idx === 0 ? assignedQrToken : generateMockQRToken(memberRegId);
        return {
          ...p,
          registrationId: memberRegId,
          qrToken: memberQrToken,
        };
      });

      const mockRecordsToInsert: OverallRegistrationRecord[] = participantsWithTokens.map((p) => {
        return {
          registrationId: p.registrationId,
          registrationDate: regDate,
          registrationTime: regTime,
          participantName: p.name,
          email: p.email,
          mobileNumber: p.phone,
          collegeInstitution: p.college,
          department: p.department,
          year: p.year || payload.yearOfStudy || '3rd Year',
          gender: p.gender || 'Not Specified',
          registrationType: isTeam ? 'Team' : 'Individual',
          selectedEvents: payload.selectedEventIds.join(', '),
          totalEvents: payload.selectedEventIds.length,
          totalAmount: 0,
          paymentStatus: 'Free',
          qrToken: p.qrToken,
          qrStatus: 'Active',
          referralSource: referralSource,
          referralSourceOther: referralSourceOther || undefined,
          emailStatus: 'Sent',
          smsStatus: 'Sent',
          whatsappStatus: 'Sent',
          overallAttendanceStatus: 'Pending',
          registrationStatus: 'Confirmed',
          teamName: safeTeamName || undefined,
          teamMembers: participantsWithTokens,
        };
      });

      records.unshift(...mockRecordsToInsert);
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(records));
      databaseSuccess = true;
      sheetsSyncSuccess = true;
    }

    if (!databaseSuccess && !sheetsSyncSuccess) {
      return {
        success: false,
        databaseSuccess: false,
        sheetsSyncSuccess: false,
        message: 'Registration server is temporarily unavailable. Please try again.',
      };
    }

    const finalParticipantsWithTokens = allParticipants.map((p, idx) => {
      const memberRegId = idx === 0 ? assignedRegId : `${assignedRegId}-M${idx}`;
      const memberQrToken = idx === 0 ? assignedQrToken : generateMockQRToken(memberRegId);
      return {
        ...p,
        registrationId: memberRegId,
        qrToken: memberQrToken,
      };
    });

    return {
      success: true,
      databaseSuccess,
      sheetsSyncSuccess,
      emailSuccess: true,
      data: {
        registrationId: assignedRegId,
        qrToken: assignedQrToken,
        participantName: payload.fullName.trim(),
        email: cleanEmail,
        mobileNumber: cleanPhone,
        college: payload.collegeName.trim(),
        department: payload.department.trim(),
        selectedEvents: payload.selectedEventIds,
        totalEvents: payload.selectedEventIds.length,
        referralSource: referralSource,
        referralSourceOther: referralSourceOther || undefined,
        registrationDate: regDate,
        teamName: safeTeamName || undefined,
        teamMembers: finalParticipantsWithTokens.slice(1),
        participants: finalParticipantsWithTokens,
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
    // 1. Supabase Lookup
    if (this.getBackendType() === 'SUPABASE') {
      try {
        let req = supabase.from('overall_registrations').select('*');
        if (query.registrationId) req = req.eq('registration_id', query.registrationId.trim().toUpperCase());
        else if (query.email) req = req.eq('email', query.email.trim().toLowerCase());
        else if (query.mobile) req = req.eq('mobile_number', query.mobile.trim());
        else if (query.qrToken) req = req.eq('qr_token', query.qrToken.trim());

        const { data: records, error } = await req;
        if (error) throw error;

        if (records && records.length > 0) {
          const match = records[0];
          // Get events attendance
          const { data: eventRecords } = await supabase
            .from('event_registrations')
            .select('*')
            .eq('registration_id', match.registration_id);

          const eventIds = match.selected_events.split(',').map((s: string) => s.trim()) as EventId[];
          const events = eventIds.map((eid) => {
            const evtMeta = EVENTS.find((e) => e.eventId === eid);
            const foundEvt = eventRecords?.find((er) => er.event_id === eid);
            return {
              eventId: eid,
              eventName: evtMeta ? evtMeta.title : eid,
              category: evtMeta ? evtMeta.category : 'Technical',
              attendanceStatus: (foundEvt?.attendance_status || 'Pending') as 'Pending' | 'Present' | 'Absent',
              participationStatus: (foundEvt?.participation_status || 'Registered') as ParticipationStatus,
            };
          });

          return {
            success: true,
            data: {
              registrationId: match.registration_id,
              registrationDate: match.registration_date,
              registrationTime: match.registration_time,
              participantName: match.participant_name,
              email: match.email,
              mobileNumber: match.mobile_number,
              collegeInstitution: match.college_institution,
              department: match.department,
              year: match.year,
              gender: match.gender,
              registrationType: match.registration_type,
              selectedEvents: match.selected_events,
              totalEvents: match.total_events,
              totalAmount: match.total_amount,
              paymentStatus: match.payment_status,
              qrToken: match.qr_token,
              qrStatus: match.qr_status,
              referralSource: match.referral_source || undefined,
              referralSourceOther: match.referral_source_other || undefined,
              emailStatus: match.email_status,
              smsStatus: match.sms_status,
              whatsappStatus: match.whatsapp_status,
              overallAttendanceStatus: match.overall_attendance_status,
              registrationStatus: match.registration_status,
              teamName: match.team_name || undefined,
              teamMembers: match.team_members || undefined,
              events,
            },
          };
        }
        return { success: false, message: 'No registration record found matching the details provided.' };
      } catch (err: any) {
        console.error('[EvoXis26 API] Supabase getRegistration error:', err);
      }
    }

    // 2. Google Apps Script
    if (this.getBackendType() === 'GOOGLE_SHEETS') {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'getRegistration', ...query }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script fetch failed:', err);
      }
    }

    // 3. Local Mock
    initMockData();
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
    // 1. Supabase Validation
    if (this.getBackendType() === 'SUPABASE') {
      try {
        const cleanToken = qrToken.trim();
        let { data: records, error } = await supabase
          .from('overall_registrations')
          .select('*')
          .eq('qr_token', cleanToken);

        if (!error && (!records || records.length === 0)) {
          const resId = await supabase
            .from('overall_registrations')
            .select('*')
            .eq('registration_id', cleanToken.toUpperCase());
          if (!resId.error && resId.data && resId.data.length > 0) {
            records = resId.data;
          }
        }

        if (error) throw error;
        if (records && records.length > 0) {
          const match = records[0];
          if (match.registration_status === 'Cancelled') {
            return { success: false, errorMessage: 'This registration has been cancelled.' };
          }

          const { data: eventRecords } = await supabase
            .from('event_registrations')
            .select('*')
            .eq('registration_id', match.registration_id);

          const eventIds = match.selected_events.split(',').map((s: string) => s.trim()) as EventId[];
          const events = eventIds.map((eid) => {
            const evt = EVENTS.find((e) => e.eventId === eid);
            const foundEvt = eventRecords?.find((er) => er.event_id === eid);
            return {
              eventId: eid,
              eventName: evt ? evt.title : eid,
              category: evt ? evt.category : 'Technical',
              attendanceStatus: (foundEvt?.attendance_status || 'Pending') as 'Pending' | 'Present' | 'Absent',
              participationStatus: (foundEvt?.participation_status || 'Registered') as ParticipationStatus,
            };
          });

          return {
            success: true,
            registrationId: match.registration_id,
            participantName: match.participant_name,
            college: match.college_institution,
            department: match.department,
            year: match.year,
            email: match.email,
            mobile: match.mobile_number,
            overallAttendanceStatus: match.overall_attendance_status,
            registrationDate: match.registration_date,
            events,
          };
        }
        return { success: false, errorMessage: 'Invalid or unrecognized QR code.' };
      } catch (err: any) {
        console.error('[EvoXis26 API] Supabase validateQRCode error:', err);
      }
    }

    // 2. Google Apps Script
    if (this.getBackendType() === 'GOOGLE_SHEETS') {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'validateQRCode', qrToken: qrToken.trim() }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script validateQRCode failed:', err);
      }
    }

    // 3. Local Mock
    initMockData();
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
    // 1. Supabase Check
    if (this.getBackendType() === 'SUPABASE') {
      try {
        const { data: records, error } = await supabase
          .from('overall_registrations')
          .select('*')
          .eq('qr_token', qrToken.trim());

        if (error) throw error;
        if (!records || records.length === 0) {
          return { success: false, registered: false, alreadyPresent: false, errorMessage: 'Invalid or unrecognized QR code.' };
        }

        const match = records[0];
        const eventIds = match.selected_events.split(',').map((s: string) => s.trim());
        const isRegistered = eventIds.includes(eventId);

        const { data: eventRecords } = await supabase
          .from('event_registrations')
          .select('*')
          .eq('registration_id', match.registration_id)
          .eq('event_id', eventId);

        const alreadyPresent = eventRecords && eventRecords.length > 0 && eventRecords[0].attendance_status === 'Present';
        const evt = EVENTS.find((e) => e.eventId === eventId);
        const eventName = evt ? evt.title : eventId;

        return {
          success: true,
          registered: isRegistered,
          alreadyPresent: Boolean(alreadyPresent),
          participant: {
            registrationId: match.registration_id,
            participantName: match.participant_name,
            college: match.college_institution,
            department: match.department,
            year: match.year,
            email: match.email,
            mobile: match.mobile_number,
            eventId,
            eventName,
            category: evt ? evt.category : 'Technical',
            attendanceStatus: alreadyPresent ? 'Present' : 'Pending',
            participationStatus: alreadyPresent ? 'Present' : 'Registered',
          },
        };
      } catch (err: any) {
        console.error('[EvoXis26 API] Supabase checkEventRegistration error:', err);
      }
    }

    // 2. Google Apps Script
    if (this.getBackendType() === 'GOOGLE_SHEETS') {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'checkEventRegistration', qrToken: qrToken.trim(), eventId }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script checkEventRegistration failed:', err);
      }
    }

    // 3. Local Mock
    initMockData();
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

    const alreadyPresent = logs.some(
      (l) => l.registrationId === match.registrationId && l.eventId === eventId && l.attendanceStatus === 'Present'
    );

    return {
      success: true,
      registered: isRegistered,
      alreadyPresent,
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
        attendanceStatus: alreadyPresent ? ('Present' as const) : ('Pending' as const),
        participationStatus: alreadyPresent ? ('Present' as const) : ('Registered' as const),
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
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    // 1. Supabase Check-in
    if (this.getBackendType() === 'SUPABASE') {
      try {
        const { data: records, error: fetchErr } = await supabase
          .from('overall_registrations')
          .select('*')
          .eq('qr_token', qrToken.trim());

        if (fetchErr || !records || records.length === 0) {
          return { success: false, message: 'Participant record not found in database.' };
        }

        const match = records[0];

        // Update overall attendance status to Present
        const { error: updateErr } = await supabase
          .from('overall_registrations')
          .update({ overall_attendance_status: 'Present' })
          .eq('registration_id', match.registration_id);

        if (updateErr) throw updateErr;

        // Append to attendance_logs (non-blocking)
        const logId = `ATT-REC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        Promise.resolve(
          supabase.from('attendance_logs').insert([
            {
              attendance_id: logId,
              registration_id: match.registration_id,
              participant_name: match.participant_name,
              event_id: 'RECEPTION',
              event_name: 'Campus Reception Check-In',
              event_type: 'Reception Check-In',
              attendance_date: dateStr,
              attendance_time: timeStr,
              attendance_location: 'Main Reception Desk',
              attendance_status: 'Present',
              participation_status: 'Present',
              verified_by: verifiedBy,
              qr_token: qrToken,
              scan_timestamp: now.toISOString(),
            },
          ])
        ).then((res: any) => {
          if (res?.error) console.warn('attendance_logs insert warning:', res.error.message);
        }).catch((err: unknown) => {
          console.warn('attendance_logs connection notice:', err);
        });

        return {
          success: true,
          timestamp: timeStr,
          participantName: match.participant_name,
          registrationId: match.registration_id,
          message: 'Reception check-in confirmed in production database.',
        };
      } catch (err: any) {
        console.error('[EvoXis26 API] Supabase markReceptionAttendance error:', err);
        return { success: false, message: 'Could not mark attendance in database.' };
      }
    }

    // 2. Google Apps Script
    if (this.getBackendType() === 'GOOGLE_SHEETS') {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'markReceptionAttendance', qrToken: qrToken.trim(), verifiedBy }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script markReceptionAttendance failed:', err);
      }
    }

    // 3. Local Mock
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
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const evt = EVENTS.find((e) => e.eventId === eventId);
    const eventName = evt ? evt.title : eventId;

    // 1. Supabase Event Attendance
    if (this.getBackendType() === 'SUPABASE') {
      try {
        const { data: records, error: fetchErr } = await supabase
          .from('overall_registrations')
          .select('*')
          .eq('qr_token', qrToken.trim());

        if (fetchErr || !records || records.length === 0) {
          return { success: false, message: 'Participant record not found in database.' };
        }

        const match = records[0];

        // Update event registration attendance
        await supabase
          .from('event_registrations')
          .update({ attendance_status: 'Present', participation_status: 'Present' })
          .eq('registration_id', match.registration_id)
          .eq('event_id', eventId);

        // Append to attendance_logs (non-blocking)
        const logId = `ATT-EVT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        Promise.resolve(
          supabase.from('attendance_logs').insert([
            {
              attendance_id: logId,
              registration_id: match.registration_id,
              participant_name: match.participant_name,
              event_id: eventId,
              event_name: eventName,
              event_type: evt ? evt.category : 'Technical',
              attendance_date: dateStr,
              attendance_time: timeStr,
              attendance_location: evt ? evt.schedule.venue : 'Event Desk',
              attendance_status: 'Present',
              participation_status: 'Present',
              verified_by: verifiedBy,
              qr_token: qrToken,
              scan_timestamp: now.toISOString(),
            },
          ])
        ).then((res: any) => {
          if (res?.error) console.warn('attendance_logs insert warning:', res.error.message);
        }).catch((err: unknown) => {
          console.warn('attendance_logs connection notice:', err);
        });

        return {
          success: true,
          timestamp: timeStr,
          participantName: match.participant_name,
          registrationId: match.registration_id,
          eventId,
          message: `Event attendance marked successfully for ${eventName}.`,
        };
      } catch (err: any) {
        console.error('[EvoXis26 API] Supabase markEventAttendance error:', err);
        return { success: false, message: 'Could not mark event attendance.' };
      }
    }

    // 2. Google Apps Script
    if (this.getBackendType() === 'GOOGLE_SHEETS') {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'markEventAttendance', qrToken: qrToken.trim(), eventId, verifiedBy }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script markEventAttendance failed:', err);
      }
    }

    // 3. Local Mock
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
  ): Promise<{ success: boolean; message?: string }> {
    if (this.getBackendType() === 'SUPABASE') {
      try {
        await supabase
          .from('event_registrations')
          .update({ participation_status: status })
          .eq('registration_id', registrationId)
          .eq('event_id', eventId);
        return { success: true };
      } catch (err) {
        console.error('Supabase updateParticipationStatus failed:', err);
      }
    }

    if (this.getBackendType() === 'GOOGLE_SHEETS') {
      try {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'updateParticipationStatus', registrationId, eventId, participationStatus: status }),
        });
        return await response.json();
      } catch (err) {
        console.error('Apps Script updateParticipationStatus failed:', err);
      }
    }

    const logs: AttendanceLogRecord[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOG) || '[]'
    );
    const idx = logs.findIndex((l) => l.registrationId === registrationId && l.eventId === eventId);
    if (idx !== -1) {
      logs[idx].participationStatus = status;
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE_LOG, JSON.stringify(logs));
    }
    return { success: true };
  },

  /**
   * Get all registrations for Master Table
   */
  async getAllRegistrations(): Promise<OverallRegistrationRecord[]> {
    if (this.getBackendType() === 'SUPABASE') {
      try {
        const { data, error } = await supabase
          .from('overall_registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          return data.map((r: any) => ({
            registrationId: r.registration_id,
            registrationDate: r.registration_date,
            registrationTime: r.registration_time,
            participantName: r.participant_name,
            email: r.email,
            mobileNumber: r.mobile_number,
            collegeInstitution: r.college_institution,
            department: r.department,
            year: r.year,
            gender: r.gender,
            registrationType: r.registration_type,
            selectedEvents: r.selected_events,
            totalEvents: r.total_events,
            totalAmount: r.total_amount,
            paymentStatus: r.payment_status,
            qrToken: r.qr_token,
            qrStatus: r.qr_status,
            emailStatus: r.email_status,
            smsStatus: r.sms_status,
            whatsappStatus: r.whatsapp_status,
            overallAttendanceStatus: r.overall_attendance_status,
            registrationStatus: r.registration_status,
          }));
        }
      } catch (err) {
        console.error('[EvoXis26 API] Supabase getAllRegistrations error:', err);
      }
    }

    if (this.getBackendType() === 'GOOGLE_SHEETS') {
      try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=getDashboardStats`);
        const result = await response.json();
        if (result.success && result.data && result.data.registrations) {
          return result.data.registrations;
        }
      } catch (err) {
        console.error('Apps Script getAllRegistrations failed:', err);
      }
    }

    initMockData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS) || '[]');
  },

  /**
   * Get attendance logs for audit table
   */
  async getAttendanceLogs(): Promise<AttendanceLogRecord[]> {
    if (this.getBackendType() === 'SUPABASE') {
      try {
        const { data, error } = await supabase
          .from('attendance_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          return data.map((l: any) => ({
            attendanceId: l.attendance_id,
            registrationId: l.registration_id,
            participantName: l.participant_name,
            eventId: l.event_id as EventId,
            eventName: l.event_name,
            eventType: l.event_type,
            attendanceDate: l.attendance_date,
            attendanceTime: l.attendance_time,
            attendanceLocation: l.attendance_location,
            attendanceStatus: l.attendance_status,
            participationStatus: l.participation_status,
            verifiedBy: l.verified_by,
            qrToken: l.qr_token,
            scanTimestamp: l.scan_timestamp,
          }));
        }
      } catch (err) {
        console.error('[EvoXis26 API] Supabase getAttendanceLogs error:', err);
      }
    }

    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOG) || '[]');
  },

  /**
   * Get Dashboard Statistics (KPIs + 16 Event progress bars)
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
    const regs = await this.getAllRegistrations();
    const logs = await this.getAttendanceLogs();

    const totalRegistered = regs.filter((r) => r.registrationStatus !== 'Cancelled').length;
    const receptionPresent = regs.filter((r) => r.overallAttendanceStatus === 'Present').length;

    const eventStats = EVENTS.map((evt) => {
      const registeredCount = regs.filter(
        (r) => r.registrationStatus !== 'Cancelled' && r.selectedEvents.includes(evt.eventId)
      ).length;

      const eventLogs = logs.filter((l) => l.eventId === evt.eventId);
      const presentCount = eventLogs.filter((l) => l.attendanceStatus === 'Present').length;
      const participatedCount = eventLogs.filter((l) => l.participationStatus === 'Participated').length;

      return {
        eventId: evt.eventId,
        eventName: evt.title,
        category: evt.category,
        registered: registeredCount,
        present: presentCount,
        absent: Math.max(0, registeredCount - presentCount),
        participated: participatedCount,
      };
    });

    return {
      success: true,
      data: {
        totalRegistered,
        receptionPresent,
        totalEvents: 16,
        eventStats,
      },
    };
  },

  /**
   * Committee & Admin Authentication
   */
  async loginAdmin(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Super Admin
    if (cleanUser === 'evoxisadmin' && cleanPass === 'evoxis2026!') {
      const user: AdminUser = {
        username: 'evoxisadmin',
        name: 'Symposium Super Admin',
        role: 'SUPER_ADMIN',
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(user));
      return { success: true, user };
    }

    // 2. Registration Committee (Reception Scanner)
    if (cleanUser === 'reception' && cleanPass === 'sriram2026') {
      const user: AdminUser = {
        username: 'reception',
        name: 'Registration Committee Desk',
        role: 'REGISTRATION_COMMITTEE',
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(user));
      return { success: true, user };
    }

    // 3. Event Coordinators: coord_te01 ... coord_sp04
    if (cleanUser.startsWith('coord_') && cleanPass === 'coord2026') {
      const eventIdUpper = cleanUser.replace('coord_', '').toUpperCase() as EventId;
      const eventMeta = EVENTS.find((e) => e.eventId === eventIdUpper);

      if (eventMeta) {
        const user: AdminUser = {
          username: cleanUser,
          name: `${eventMeta.title} Coordinator`,
          role: 'EVENT_COORDINATOR',
          assignedEventId: eventIdUpper,
        };
        localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(user));
        return { success: true, user };
      }
    }

    return { success: false, message: 'Invalid username or access credentials.' };
  },

  getCurrentAdmin(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  logoutAdmin(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
  },
};

export default api;
