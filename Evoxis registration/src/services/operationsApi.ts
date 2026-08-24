import { supabase, isSupabaseConfigured } from './supabase';
import {
  ParticipantProfile,
  ScanOperationResponse,
  RegisteredEventInfo,
  AuditLogEntry,
  LiveDashboardMetrics,
  StaffRole,
  TeamMemberInfo,
} from '../types';
import { OFFICIAL_EVENTS } from '../config/events';
import { syncToGoogleSheets } from './sheetsSync';

// Mock storage keys for robust offline testing & fail-safe operation
const STORAGE_KEYS = {
  ASSIGNMENTS: 'evoxis_op_qr_assignments',
  CAMPUS: 'evoxis_op_campus_attendance',
  EVENT_ATTENDANCE: 'evoxis_op_event_attendance',
  FOOD: 'evoxis_op_food_delivery',
  AUDIT: 'evoxis_op_audit_logs',
};

// Helper: in-memory / local storage fallback state for atomic client-side locks
const getLocalArray = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalArray = <T>(key: string, arr: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
};

export const operationsApi = {
  /**
   * Log an operational event to audit trail
   */
  async logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const log: AuditLogEntry = {
      id: 'AUD-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      ...entry,
    };

    // 1. Local mirror
    const localLogs = getLocalArray<AuditLogEntry>(STORAGE_KEYS.AUDIT);
    localLogs.unshift(log);
    saveLocalArray(STORAGE_KEYS.AUDIT, localLogs.slice(0, 500));

    // 2. Supabase write if table exists
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('attendance_logs').insert([
          {
            attendance_id: log.id,
            registration_id: log.registrationId || log.participantId || 'N/A',
            participant_name: log.participantName || log.staffUser,
            event_id: log.eventId || log.operation,
            event_name: log.eventName || log.operation,
            event_type: log.operation,
            attendance_date: log.timestamp.split('T')[0],
            attendance_time: new Date(log.timestamp).toLocaleTimeString('en-US'),
            attendance_location: log.station,
            attendance_status: log.result,
            participation_status: log.result === 'SUCCESS' ? 'Present' : 'Pending',
            verified_by: log.staffUser,
            qr_token: log.physicalQrId || 'N/A',
            scan_timestamp: log.timestamp,
          },
        ]);
      } catch {
        // Silently continue if attendance_logs table schema differs
      }
    }
  },

  /**
   * Lookup participant by Digital QR Token, Physical QR ID, Registration ID, Email, Phone, or Name
   */
  async lookupRegistration(query: {
    token?: string;
    queryStr?: string;
  }): Promise<{ success: boolean; data?: ParticipantProfile; message?: string }> {
    const rawQuery = (query.token || query.queryStr || '').trim();
    if (!rawQuery) {
      return { success: false, message: 'Scan token or query string is required' };
    }

    try {
      // 1. Check if token is an assigned Physical QR ID (e.g. WRIST-EVX-000125)
      const localAssignments = getLocalArray<{
        physicalQrId: string;
        participantId: string;
        registrationId: string;
        active: boolean;
        physicalQrType: 'ID_CARD' | 'WRISTBAND';
        assignedAt?: string;
      }>(STORAGE_KEYS.ASSIGNMENTS);

      const matchedPhysical = localAssignments.find(
        (a) => a.active && a.physicalQrId.toUpperCase() === rawQuery.toUpperCase()
      );

      const lookupKey = matchedPhysical ? matchedPhysical.registrationId : rawQuery;

      // 2. Query Supabase overall_registrations
      let matchRecord: any = null;

      if (isSupabaseConfigured()) {
        const { data: records, error } = await supabase
          .from('overall_registrations')
          .select('*')
          .or(
            `registration_id.eq.${lookupKey},email.eq.${lookupKey.toLowerCase()},mobile_number.eq.${lookupKey},qr_token.eq.${lookupKey},participant_name.ilike.%${lookupKey}%`
          )
          .limit(1);

        if (!error && records && records.length > 0) {
          matchRecord = records[0];
        }
      }

      // If not found in Supabase, check local mock registrations
      if (!matchRecord) {
        const mockRegs = getLocalArray<any>('evoxis26_overall_registrations');
        matchRecord = mockRegs.find(
          (r) =>
            (r.registrationId && r.registrationId.toUpperCase() === lookupKey.toUpperCase()) ||
            (r.registration_id && r.registration_id.toUpperCase() === lookupKey.toUpperCase()) ||
            (r.email && r.email.toLowerCase() === lookupKey.toLowerCase()) ||
            (r.mobileNumber && r.mobileNumber === lookupKey) ||
            (r.mobile_number && r.mobile_number === lookupKey) ||
            (r.qrToken && r.qrToken === lookupKey) ||
            (r.qr_token && r.qr_token === lookupKey) ||
            (r.participantName && r.participantName.toLowerCase().includes(lookupKey.toLowerCase())) ||
            (r.participant_name && r.participant_name.toLowerCase().includes(lookupKey.toLowerCase()))
        );
      }

      if (!matchRecord) {
        return { success: false, message: 'PARTICIPANT NOT FOUND' };
      }

      // Normalize fields
      const regId = matchRecord.registration_id || matchRecord.registrationId;
      const pName = matchRecord.participant_name || matchRecord.participantName;
      const email = matchRecord.email;
      const mobile = matchRecord.mobile_number || matchRecord.mobileNumber || '';
      const college = matchRecord.college_institution || matchRecord.collegeInstitution || matchRecord.college || '';
      const department = matchRecord.department || '';
      const year = matchRecord.year || '3rd Year';
      const gender = matchRecord.gender || 'Not Specified';
      const regType = (matchRecord.registration_type || matchRecord.registrationType || 'Individual') as 'Individual' | 'Team';
      const teamName = matchRecord.team_name || matchRecord.teamName || undefined;
      const teamMembersRaw = matchRecord.team_members || matchRecord.teamMembers || [];
      const digitalQr = matchRecord.qr_token || matchRecord.qrToken || `EVOXIS26:${regId}`;

      const selectedEvtStr = matchRecord.selected_events || matchRecord.selectedEvents || '';
      const selectedEventIds = selectedEvtStr
        .split(',')
        .map((s: string) => s.trim().toUpperCase())
        .filter((s: string) => s.length > 0);

      // Parse registered events
      const registeredEvents: RegisteredEventInfo[] = selectedEventIds.map((evtId: string) => {
        const meta = OFFICIAL_EVENTS.find((e) => e.eventId.toUpperCase() === evtId);
        return {
          eventId: evtId,
          eventName: meta ? meta.title : evtId,
          category: meta ? meta.category : 'Technical',
          attendanceStatus: 'Pending',
        };
      });

      // Retrieve live event attendance status from event_registrations or local state
      const localEventAtt = getLocalArray<{
        registrationId: string;
        eventId: string;
        attendanceStatus: 'Pending' | 'Present';
        checkinTime?: string;
      }>(STORAGE_KEYS.EVENT_ATTENDANCE);

      registeredEvents.forEach((re) => {
        const found = localEventAtt.find(
          (la) => la.registrationId === regId && la.eventId.toUpperCase() === re.eventId.toUpperCase()
        );
        if (found) {
          re.attendanceStatus = found.attendanceStatus;
          re.checkinTime = found.checkinTime;
        }
      });

      // Retrieve Campus Attendance Status
      const localCampus = getLocalArray<{
        registrationId: string;
        checkinTime: string;
        station: string;
        checkinBy: string;
      }>(STORAGE_KEYS.CAMPUS);
      const campusCheck = localCampus.find((c) => c.registrationId === regId);

      // Retrieve Food Status
      const localFood = getLocalArray<{
        registrationId: string;
        deliveredTime: string;
        station: string;
        deliveredBy: string;
      }>(STORAGE_KEYS.FOOD);
      const foodCheck = localFood.find((f) => f.registrationId === regId);

      // Retrieve Physical QR
      const physicalAssignment = localAssignments.find((a) => a.active && a.registrationId === regId);

      const teamMembers: TeamMemberInfo[] = Array.isArray(teamMembersRaw)
        ? teamMembersRaw.map((tm: any) => ({
            name: tm.name || tm.fullName || '',
            email: tm.email || '',
            phone: tm.phone || tm.mobile || '',
            college: tm.college || college,
            department: tm.department || department,
            year: tm.year || year,
            gender: tm.gender || 'Not Specified',
            role: tm.role || 'TEAM_MEMBER',
          }))
        : [];

      const profile: ParticipantProfile = {
        id: regId,
        registrationId: regId,
        participantName: pName,
        email,
        mobile,
        college,
        department,
        year,
        gender,
        registrationType: regType,
        role: matchRecord.role || (regType === 'Team' && !regId.includes('-M') ? 'TEAM_HEAD' : 'INDIVIDUAL'),
        teamName,
        teamMembers,
        selectedEvents: selectedEventIds,
        registeredEvents,
        digitalQrToken: digitalQr,
        physicalQrId: physicalAssignment?.physicalQrId,
        physicalQrType: physicalAssignment?.physicalQrType,
        physicalQrAssignedAt: physicalAssignment?.assignedAt,
        campusAttendanceStatus: campusCheck ? 'Present' : 'Pending',
        campusCheckinTime: campusCheck?.checkinTime,
        campusCheckinBy: campusCheck?.checkinBy,
        campusStation: campusCheck?.station,
        foodDelivered: !!foodCheck,
        foodDeliveredTime: foodCheck?.deliveredTime,
        foodDeliveredBy: foodCheck?.deliveredBy,
        foodStation: foodCheck?.station,
      };

      return { success: true, data: profile };
    } catch (err: any) {
      console.error('[OperationsApi] lookupRegistration error:', err);
      return { success: false, message: err.message || 'Lookup failed' };
    }
  },

  /**
   * Assign physical QR (wristband/ID card) to participant
   */
  async assignPhysicalQr(params: {
    participantId: string;
    registrationId: string;
    physicalQrId: string;
    physicalQrType: 'ID_CARD' | 'WRISTBAND';
    staffId: string;
    staffRole: StaffRole;
    station?: string;
  }): Promise<ScanOperationResponse> {
    const cleanQrId = params.physicalQrId.trim().toUpperCase();
    const station = params.station || 'Reception Desk';

    if (!cleanQrId) {
      return {
        state: 'INVALID_QR',
        verbatimMessage: 'INVALID QR',
        details: 'Physical QR code cannot be empty',
      };
    }

    const assignments = getLocalArray<any>(STORAGE_KEYS.ASSIGNMENTS);

    // Rule 1: Check if physical QR is already assigned to a DIFFERENT active participant
    const existingOther = assignments.find(
      (a) => a.active && a.physicalQrId.toUpperCase() === cleanQrId && a.registrationId !== params.registrationId
    );

    if (existingOther) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'QR_ASSIGNMENT',
        registrationId: params.registrationId,
        physicalQrId: cleanQrId,
        result: 'DENIED',
        reason: `QR already assigned to participant ${existingOther.registrationId}`,
      });

      return {
        state: 'QR_CONFLICT',
        verbatimMessage: 'QR ASSIGNED TO ANOTHER PARTICIPANT',
        details: `This physical QR is already active on registration ${existingOther.registrationId}`,
      };
    }

    // Rule 2: Check if participant already has an active physical QR
    const existingMine = assignments.find((a) => a.active && a.registrationId === params.registrationId);

    if (existingMine && existingMine.physicalQrId.toUpperCase() !== cleanQrId) {
      if (params.staffRole !== 'SUPER_ADMIN') {
        await this.logAudit({
          staffUser: params.staffId,
          station,
          operation: 'QR_ASSIGNMENT',
          registrationId: params.registrationId,
          physicalQrId: cleanQrId,
          result: 'DENIED',
          reason: `Participant already has active QR ${existingMine.physicalQrId}`,
        });

        return {
          state: 'QR_CONFLICT',
          verbatimMessage: 'QR ASSIGNED TO ANOTHER PARTICIPANT',
          details: `Participant already has active QR ${existingMine.physicalQrId}. Only Super Admin can reassign.`,
        };
      }
      // Super admin override: deactivate previous QR
      existingMine.active = false;
    }

    // Record new assignment
    const now = new Date().toISOString();
    const newAssignment = {
      id: 'PQR-' + Math.random().toString(36).substring(2, 9),
      physicalQrId: cleanQrId,
      physicalQrType: params.physicalQrType,
      participantId: params.participantId,
      registrationId: params.registrationId,
      assignedAt: now,
      assignedBy: params.staffId,
      active: true,
    };

    assignments.push(newAssignment);
    saveLocalArray(STORAGE_KEYS.ASSIGNMENTS, assignments);

    await this.logAudit({
      staffUser: params.staffId,
      station,
      operation: 'QR_ASSIGNMENT',
      registrationId: params.registrationId,
      physicalQrId: cleanQrId,
      result: 'SUCCESS',
      reason: `Bound ${params.physicalQrType} ${cleanQrId}`,
    });

    syncToGoogleSheets({
      action: 'assignPhysicalQr',
      registrationId: params.registrationId,
      physicalQrId: cleanQrId,
      station,
      verifiedBy: params.staffId,
    });

    return {
      state: 'SUCCESS',
      verbatimMessage: '✓ PRESENT',
      details: `Physical ${params.physicalQrType} (${cleanQrId}) successfully assigned`,
      timestamp: now,
    };
  },

  /**
   * Confirm & Mark Campus Present (Idempotent Campus Check-in)
   */
  async markCampusPresent(params: {
    participantId: string;
    registrationId: string;
    physicalQrId?: string;
    staffId: string;
    station?: string;
  }): Promise<ScanOperationResponse> {
    const station = params.station || 'Reception Desk';
    const campusLogs = getLocalArray<any>(STORAGE_KEYS.CAMPUS);

    // Check idempotency
    const existing = campusLogs.find((c) => c.registrationId === params.registrationId);
    if (existing) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'CAMPUS_CHECKIN',
        registrationId: params.registrationId,
        physicalQrId: params.physicalQrId,
        result: 'DUPLICATE',
        reason: 'Participant already checked in to campus',
      });

      return {
        state: 'DUPLICATE_CAMPUS',
        verbatimMessage: 'ALREADY PRESENT',
        originalTime: existing.checkinTime,
        originalStation: existing.station,
        details: `Checked in at ${new Date(existing.checkinTime).toLocaleTimeString()} (${existing.station})`,
      };
    }

    const now = new Date().toISOString();
    campusLogs.push({
      id: 'CMP-' + Math.random().toString(36).substring(2, 9),
      participantId: params.participantId,
      registrationId: params.registrationId,
      physicalQrId: params.physicalQrId || 'N/A',
      checkinTime: now,
      checkinBy: params.staffId,
      station,
    });
    saveLocalArray(STORAGE_KEYS.CAMPUS, campusLogs);

    // Update Supabase overall_registrations if live
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('overall_registrations')
          .update({ overall_attendance_status: 'Present' })
          .eq('registration_id', params.registrationId);
      } catch (e) {
        console.warn('Supabase campus attendance update notice:', e);
      }
    }

    await this.logAudit({
      staffUser: params.staffId,
      station,
      operation: 'CAMPUS_CHECKIN',
      registrationId: params.registrationId,
      physicalQrId: params.physicalQrId,
      result: 'SUCCESS',
      reason: 'Campus check-in confirmed',
    });

    syncToGoogleSheets({
      action: 'syncCampusCheckin',
      registrationId: params.registrationId,
      physicalQrId: params.physicalQrId,
      station,
      verifiedBy: params.staffId,
    });

    return {
      state: 'SUCCESS',
      verbatimMessage: '✓ PRESENT',
      timestamp: now,
      details: `Campus check-in recorded at ${station}`,
    };
  },

  /**
   * Mark Event Attendance at Event Desk (Enforces event registration eligibility & idempotency)
   */
  async markEventPresent(params: {
    physicalQrId: string;
    eventId: string;
    staffId: string;
    station?: string;
    isAdminOverride?: boolean;
    overrideReason?: string;
  }): Promise<ScanOperationResponse> {
    const cleanQr = params.physicalQrId.trim().toUpperCase();
    const eventId = params.eventId.trim().toUpperCase();
    const station = params.station || `Event Desk (${eventId})`;
    const eventMeta = OFFICIAL_EVENTS.find((e) => e.eventId.toUpperCase() === eventId);
    const eventTitle = eventMeta ? eventMeta.title : eventId;

    if (!cleanQr) {
      return {
        state: 'INVALID_QR',
        verbatimMessage: 'INVALID QR',
        details: 'QR code cannot be empty',
      };
    }

    // 1. Resolve participant from physical QR or registration token
    const lookup = await this.lookupRegistration({ token: cleanQr });
    if (!lookup.success || !lookup.data) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'EVENT_CHECKIN',
        eventId,
        eventName: eventTitle,
        physicalQrId: cleanQr,
        result: 'ERROR',
        reason: 'Participant not found for scanned QR',
      });

      return {
        state: 'NOT_FOUND',
        verbatimMessage: 'PARTICIPANT NOT FOUND',
        details: `No active registration found for QR ${cleanQr}`,
      };
    }

    const participant = lookup.data;

    // 2. Check if participant is registered for this event
    const isRegistered = participant.selectedEvents.some((e) => e.toUpperCase() === eventId);

    if (!isRegistered && !params.isAdminOverride) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'EVENT_CHECKIN',
        registrationId: participant.registrationId,
        participantName: participant.participantName,
        eventId,
        eventName: eventTitle,
        physicalQrId: cleanQr,
        result: 'DENIED',
        reason: `Not registered for ${eventId}. Registered events: ${participant.selectedEvents.join(', ')}`,
      });

      return {
        state: 'WRONG_EVENT',
        verbatimMessage: 'NOT REGISTERED FOR THIS EVENT',
        registeredEvents: participant.selectedEvents,
        details: `Participant ${participant.participantName} is registered for: ${participant.selectedEvents.join(', ')}`,
        participant,
      };
    }

    // 3. Check idempotency for this event
    const eventLogs = getLocalArray<any>(STORAGE_KEYS.EVENT_ATTENDANCE);
    const existing = eventLogs.find(
      (el) => el.registrationId === participant.registrationId && el.eventId.toUpperCase() === eventId
    );

    if (existing) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'EVENT_CHECKIN',
        registrationId: participant.registrationId,
        participantName: participant.participantName,
        eventId,
        eventName: eventTitle,
        physicalQrId: cleanQr,
        result: 'DUPLICATE',
        reason: 'Already present for this event',
      });

      return {
        state: 'DUPLICATE_EVENT',
        verbatimMessage: 'ALREADY PRESENT',
        originalTime: existing.checkinTime,
        originalStation: existing.station,
        details: `Already marked present at ${new Date(existing.checkinTime).toLocaleTimeString()} (${existing.station})`,
        participant,
      };
    }

    // 4. Record attendance
    const now = new Date().toISOString();
    eventLogs.push({
      id: 'EVT-ATT-' + Math.random().toString(36).substring(2, 9),
      participantId: participant.id,
      registrationId: participant.registrationId,
      participantName: participant.participantName,
      eventId,
      eventName: eventTitle,
      attendanceStatus: 'Present',
      checkinTime: now,
      checkinBy: params.staffId,
      station,
      isOverride: !!params.isAdminOverride,
      overrideReason: params.overrideReason,
    });
    saveLocalArray(STORAGE_KEYS.EVENT_ATTENDANCE, eventLogs);

    // Update Supabase event_registrations if live
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('event_registrations')
          .update({ attendance_status: 'Present', participation_status: 'Present' })
          .match({ registration_id: participant.registrationId, event_id: eventId });
      } catch (e) {
        console.warn('Supabase event attendance update notice:', e);
      }
    }

    await this.logAudit({
      staffUser: params.staffId,
      station,
      operation: 'EVENT_CHECKIN',
      registrationId: participant.registrationId,
      participantName: participant.participantName,
      eventId,
      eventName: eventTitle,
      physicalQrId: cleanQr,
      result: 'SUCCESS',
      reason: params.isAdminOverride ? `Admin Override: ${params.overrideReason}` : 'Event check-in verified',
    });

    syncToGoogleSheets({
      action: 'markAttendance',
      registrationId: participant.registrationId,
      participantName: participant.participantName,
      eventId,
      eventName: eventTitle,
      station,
      verifiedBy: params.staffId,
    });

    return {
      state: 'SUCCESS',
      verbatimMessage: '✓ PRESENT',
      timestamp: now,
      details: `${participant.participantName} verified for ${eventTitle}`,
      participant,
    };
  },

  /**
   * Mark Food Delivery at Food Counter (Atomic single-meal delivery with duplicate protection)
   */
  async markFoodDelivered(params: {
    physicalQrId: string;
    staffId: string;
    station?: string;
    isAdminOverride?: boolean;
    overrideReason?: string;
  }): Promise<ScanOperationResponse> {
    const cleanQr = params.physicalQrId.trim().toUpperCase();
    const station = params.station || 'Food Counter';

    if (!cleanQr) {
      return {
        state: 'INVALID_QR',
        verbatimMessage: 'INVALID QR',
        details: 'QR code cannot be empty',
      };
    }

    // 1. Resolve participant
    const lookup = await this.lookupRegistration({ token: cleanQr });
    if (!lookup.success || !lookup.data) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'FOOD_DELIVERY',
        physicalQrId: cleanQr,
        result: 'ERROR',
        reason: 'Participant not found for food scan',
      });

      return {
        state: 'NOT_FOUND',
        verbatimMessage: 'PARTICIPANT NOT FOUND',
        details: `No active participant linked to QR ${cleanQr}`,
      };
    }

    const participant = lookup.data;

    // 2. Check food duplicate idempotency
    const foodLogs = getLocalArray<any>(STORAGE_KEYS.FOOD);
    const existing = foodLogs.find((f) => f.registrationId === participant.registrationId);

    if (existing && !params.isAdminOverride) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'FOOD_DELIVERY',
        registrationId: participant.registrationId,
        participantName: participant.participantName,
        physicalQrId: cleanQr,
        result: 'DUPLICATE',
        reason: 'Meal already collected',
      });

      return {
        state: 'DUPLICATE_FOOD',
        verbatimMessage: 'FOOD ALREADY DELIVERED',
        originalTime: existing.deliveredTime,
        originalStation: existing.station,
        details: `Meal delivered at ${new Date(existing.deliveredTime).toLocaleTimeString()} (${existing.station})`,
        participant,
      };
    }

    // 3. Record meal delivery
    const now = new Date().toISOString();
    foodLogs.push({
      id: 'FOOD-' + Math.random().toString(36).substring(2, 9),
      participantId: participant.id,
      registrationId: participant.registrationId,
      participantName: participant.participantName,
      deliveredTime: now,
      deliveredBy: params.staffId,
      station,
      isOverride: !!params.isAdminOverride,
      overrideReason: params.overrideReason,
    });
    saveLocalArray(STORAGE_KEYS.FOOD, foodLogs);

    await this.logAudit({
      staffUser: params.staffId,
      station,
      operation: 'FOOD_DELIVERY',
      registrationId: participant.registrationId,
      participantName: participant.participantName,
      physicalQrId: cleanQr,
      result: 'SUCCESS',
      reason: params.isAdminOverride ? `Admin Override: ${params.overrideReason}` : 'Meal token redeemed',
    });

    syncToGoogleSheets({
      action: 'markFoodDelivered',
      registrationId: participant.registrationId,
      participantName: participant.participantName,
      station,
      verifiedBy: params.staffId,
    });

    return {
      state: 'SUCCESS',
      verbatimMessage: '✓ PRESENT',
      timestamp: now,
      details: `Meal redeemed for ${participant.participantName}`,
      participant,
    };
  },

  /**
   * Fetch Live Dashboard Metrics
   */
  async getLiveStats(): Promise<LiveDashboardMetrics> {
    let totalRegistered = 0;
    const perEventMetrics: Record<string, { registered: number; present: number; absent: number; attendancePct: number }> = {};

    OFFICIAL_EVENTS.forEach((e) => {
      perEventMetrics[e.eventId] = { registered: 0, present: 0, absent: 0, attendancePct: 0 };
    });

    if (isSupabaseConfigured()) {
      try {
        const { count } = await supabase.from('overall_registrations').select('*', { count: 'exact', head: true });
        totalRegistered = count || 0;

        const { data: evtRegs } = await supabase.from('event_registrations').select('event_id, attendance_status');
        if (evtRegs) {
          evtRegs.forEach((er) => {
            const eid = er.event_id?.toUpperCase();
            if (perEventMetrics[eid]) {
              perEventMetrics[eid].registered += 1;
              if (er.attendance_status === 'Present') {
                perEventMetrics[eid].present += 1;
              } else {
                perEventMetrics[eid].absent += 1;
              }
            }
          });
        }
      } catch (e) {
        console.warn('Supabase getLiveStats fallback notice:', e);
      }
    }

    if (totalRegistered === 0) {
      const mockRegs = getLocalArray<any>('evoxis26_overall_registrations');
      totalRegistered = mockRegs.length;
    }

    const campusLogs = getLocalArray<any>(STORAGE_KEYS.CAMPUS);
    const assignments = getLocalArray<any>(STORAGE_KEYS.ASSIGNMENTS);
    const foodLogs = getLocalArray<any>(STORAGE_KEYS.FOOD);
    const eventLogs = getLocalArray<any>(STORAGE_KEYS.EVENT_ATTENDANCE);
    const auditLogs = getLocalArray<AuditLogEntry>(STORAGE_KEYS.AUDIT);

    // Compute metrics
    const campusPresent = campusLogs.length;
    const campusAbsent = Math.max(0, totalRegistered - campusPresent);
    const qrAssigned = assignments.filter((a) => a.active).length;
    const qrUnassigned = Math.max(0, totalRegistered - qrAssigned);
    const foodDelivered = foodLogs.length;
    const foodPending = Math.max(0, totalRegistered - foodDelivered);

    eventLogs.forEach((el) => {
      const eid = el.eventId?.toUpperCase();
      if (perEventMetrics[eid]) {
        perEventMetrics[eid].present = Math.max(perEventMetrics[eid].present, 1);
      }
    });

    Object.keys(perEventMetrics).forEach((eid) => {
      const m = perEventMetrics[eid];
      m.attendancePct = m.registered > 0 ? Math.round((m.present / m.registered) * 100) : 0;
    });

    const recentErrors = auditLogs.filter((l) => l.result === 'DENIED' || l.result === 'ERROR');
    const duplicateAttemptsCount = auditLogs.filter((l) => l.result === 'DUPLICATE').length;

    return {
      totalRegistered,
      campusPresent,
      campusAbsent,
      qrAssigned,
      qrUnassigned,
      foodDelivered,
      foodPending,
      eventRegistrationsTotal: Object.values(perEventMetrics).reduce((a, b) => a + b.registered, 0),
      eventAttendanceTotal: eventLogs.length,
      activeScanners: 8,
      recentScans: auditLogs.slice(0, 20),
      recentErrors: recentErrors.slice(0, 10),
      duplicateAttemptsCount,
      perEventMetrics,
    };
  },

  /**
   * Search participants with filters
   */
  async searchParticipants(searchTerm: string, limit: number = 25): Promise<ParticipantProfile[]> {
    const q = searchTerm.trim().toLowerCase();
    const results: ParticipantProfile[] = [];

    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('overall_registrations').select('*').limit(limit);
        if (q) {
          query = query.or(
            `participant_name.ilike.%${q}%,email.ilike.%${q}%,mobile_number.ilike.%${q}%,registration_id.ilike.%${q}%,team_name.ilike.%${q}%`
          );
        }
        const { data } = await query;
        if (data) {
          for (const d of data) {
            const p = await this.lookupRegistration({ queryStr: d.registration_id });
            if (p.data) results.push(p.data);
          }
          return results;
        }
      } catch (e) {
        console.warn('Search participants Supabase fallback:', e);
      }
    }

    const mockRegs = getLocalArray<any>('evoxis26_overall_registrations');
    const filtered = mockRegs.filter((r) => {
      if (!q) return true;
      return (
        (r.participantName && r.participantName.toLowerCase().includes(q)) ||
        (r.participant_name && r.participant_name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.registrationId && r.registrationId.toLowerCase().includes(q)) ||
        (r.registration_id && r.registration_id.toLowerCase().includes(q))
      );
    });

    for (const r of filtered.slice(0, limit)) {
      const regId = r.registrationId || r.registration_id;
      const p = await this.lookupRegistration({ queryStr: regId });
      if (p.data) results.push(p.data);
    }

    return results;
  },

  /**
   * Get all Audit Logs with optional filter
   */
  getAuditLogs(filter?: { operation?: string; result?: string }): AuditLogEntry[] {
    const all = getLocalArray<AuditLogEntry>(STORAGE_KEYS.AUDIT);
    return all.filter((l) => {
      if (filter?.operation && l.operation !== filter.operation) return false;
      if (filter?.result && l.result !== filter.result) return false;
      return true;
    });
  },
};
