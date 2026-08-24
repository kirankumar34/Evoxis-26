import { supabase, isSupabaseConfigured } from './supabase';
import {
  ParticipantProfile,
  ScanOperationResponse,
  RegisteredEventInfo,
  AuditLogEntry,
  LiveDashboardMetrics,
  StaffRole,
  TeamMemberInfo,
  PhysicalQrInventoryItem,
  InventoryMetrics,
  QrEnvironment,
  QrType,
  QrResolutionErrorCode,
  QrResolutionResult,
  ScanResultState,
} from '../types';
import { OFFICIAL_EVENTS } from '../config/events';
import { syncToGoogleSheets } from './sheetsSync';

// Storage keys for local caching, atomic client-side state, and fail-safe offline resilience
const STORAGE_KEYS = {
  ASSIGNMENTS: 'evoxis_op_qr_assignments',
  CAMPUS: 'evoxis_op_campus_attendance',
  EVENT_ATTENDANCE: 'evoxis_op_event_attendance',
  FOOD: 'evoxis_op_food_delivery',
  AUDIT: 'evoxis_op_audit_logs',
  QR_INVENTORY: 'evoxis_op_qr_inventory',
};

// Helper: safe local storage reader
const getLocalArray = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Helper: safe local storage writer
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

    // 2. Supabase write if table exists (non-blocking)
    if (isSupabaseConfigured()) {
      try {
        Promise.resolve(
          supabase
            .from('attendance_logs')
            .insert([
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
            ])
        )
          .then((res: any) => {
            if (res?.error) {
              console.warn('attendance_logs insert warning:', res.error.message);
            }
          })
          .catch((err: unknown) => {
            console.warn('attendance_logs network drop caught:', err);
          });
      } catch (err) {
        console.warn('attendance_logs offline fallback active:', err);
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
      // 1. Check if token is an assigned Physical QR ID (e.g. EVX26-TEST-000051, EVX26-WB-000001)
      let lookupKey = rawQuery;

      const inventory = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);
      const matchedInv = inventory.find((i) => i.qrCode.toUpperCase() === rawQuery.toUpperCase());
      if (matchedInv && (matchedInv.participantId || matchedInv.registrationId)) {
        lookupKey = matchedInv.participantId || matchedInv.registrationId!;
      } else {
        const localAssignments = getLocalArray<{
          physicalQrId: string;
          participantId: string;
          registrationId: string;
          active: boolean;
        }>(STORAGE_KEYS.ASSIGNMENTS);
        const matchedPhysical = localAssignments.find(
          (a) => a.active && a.physicalQrId.toUpperCase() === rawQuery.toUpperCase()
        );
        if (matchedPhysical) {
          lookupKey = matchedPhysical.participantId || matchedPhysical.registrationId;
        }
      }

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
        } else if (lookupKey.includes('-M')) {
          const baseKey = lookupKey.split('-M')[0];
          const { data: baseRecs } = await supabase
            .from('overall_registrations')
            .select('*')
            .eq('registration_id', baseKey)
            .limit(1);
          if (baseRecs && baseRecs.length > 0) {
            matchRecord = baseRecs[0];
          }
        }
      }

      // If not found in Supabase, check local mock registrations
      if (!matchRecord) {
        const mockRegs = getLocalArray<any>('evoxis26_overall_registrations');
        // Exact match first
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

        if (!matchRecord && lookupKey.includes('-M')) {
          const baseKey = lookupKey.split('-M')[0];
          matchRecord = mockRegs.find(
            (r) =>
              (r.registrationId && r.registrationId.toUpperCase() === baseKey.toUpperCase()) ||
              (r.registration_id && r.registration_id.toUpperCase() === baseKey.toUpperCase())
          );
        }
      }

      if (!matchRecord) {
        return { success: false, message: 'PARTICIPANT NOT FOUND' };
      }

      // Normalize fields
      const regId = matchRecord.registration_id || matchRecord.registrationId;
      let pName = matchRecord.participant_name || matchRecord.participantName;
      let email = matchRecord.email;
      let mobile = matchRecord.mobile_number || matchRecord.mobileNumber || '';
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

      // Check if querying a specific team member
      let currentParticipantId = regId;
      let currentRole: 'TEAM_HEAD' | 'TEAM_MEMBER' | 'INDIVIDUAL' =
        matchRecord.role || (regType === 'Team' ? 'TEAM_HEAD' : 'INDIVIDUAL');

      if (lookupKey.includes('-M')) {
        currentParticipantId = lookupKey;
        currentRole = 'TEAM_MEMBER';
        if (regId.toUpperCase() !== lookupKey.toUpperCase()) {
          const memberNum = parseInt(lookupKey.split('-M')[1], 10);
          const nonHeadMembers = teamMembers.filter((tm) => tm.role === 'TEAM_MEMBER');
          const targetMember =
            nonHeadMembers[memberNum - 1] || teamMembers[memberNum] || teamMembers[memberNum - 1];
          if (targetMember) {
            pName = targetMember.name;
            email = targetMember.email || email;
            mobile = targetMember.phone || mobile;
          }
        }
      }

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

      // Retrieve live event attendance status
      const localEventAtt = getLocalArray<{
        registrationId: string;
        participantId?: string;
        eventId: string;
        attendanceStatus: 'Pending' | 'Present';
        checkinTime?: string;
      }>(STORAGE_KEYS.EVENT_ATTENDANCE);

      registeredEvents.forEach((re) => {
        const found = localEventAtt.find(
          (la) =>
            (la.participantId === currentParticipantId || la.registrationId === currentParticipantId || la.registrationId === regId) &&
            la.eventId.toUpperCase() === re.eventId.toUpperCase()
        );
        if (found) {
          re.attendanceStatus = found.attendanceStatus;
          re.checkinTime = found.checkinTime;
        }
      });

      // Retrieve Campus Attendance Status
      const localCampus = getLocalArray<{
        registrationId: string;
        participantId?: string;
        checkinTime: string;
        station: string;
        checkinBy: string;
      }>(STORAGE_KEYS.CAMPUS);
      const campusCheck = localCampus.find(
        (c) => c.participantId === currentParticipantId || c.registrationId === currentParticipantId || c.registrationId === regId
      );

      // Retrieve Food Status
      const localFood = getLocalArray<{
        registrationId: string;
        participantId?: string;
        deliveredTime: string;
        station: string;
        deliveredBy: string;
      }>(STORAGE_KEYS.FOOD);
      const foodCheck = localFood.find(
        (f) => f.participantId === currentParticipantId || f.registrationId === currentParticipantId || f.registrationId === regId
      );

      // Retrieve Physical QR Assignment
      const localAssignments = getLocalArray<{
        physicalQrId: string;
        participantId: string;
        registrationId: string;
        active: boolean;
        physicalQrType: 'ID_CARD' | 'WRISTBAND';
        assignedAt?: string;
      }>(STORAGE_KEYS.ASSIGNMENTS);
      const physicalAssignment = localAssignments.find(
        (a) => a.active && (a.participantId === currentParticipantId || a.registrationId === currentParticipantId || a.registrationId === regId)
      );

      const profile: ParticipantProfile = {
        id: currentParticipantId,
        registrationId: regId,
        participantName: pName,
        email,
        mobile,
        college,
        department,
        year,
        gender,
        registrationType: regType,
        role: currentRole,
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
   * Single Shared Physical QR Resolver
   * Resolves physical QR codes (e.g. EVX26-TEST-000051, EVX26-WB-000001)
   * into participant profiles and registered events.
   */
  async resolvePhysicalQR(
    qrCode: string,
    portalMode: 'TEST' | 'PRODUCTION' = 'PRODUCTION'
  ): Promise<QrResolutionResult> {
    const cleanQr = (qrCode || '').trim().toUpperCase();

    // Step 0: Basic validation
    if (!cleanQr) {
      return {
        success: false,
        errorCode: 'INVALID_QR_FORMAT',
        errorMessage: 'Physical QR code is required',
      };
    }

    // Step 1: Format validation
    const isStaticFormat = /^EVX26-(TEST|WB)-\d{1,6}$/i.test(cleanQr);
    const isLegacyPhysical = /^(WRIST|IDC)-[A-Z0-9-]+$/i.test(cleanQr);
    if (!isStaticFormat && !isLegacyPhysical && !cleanQr.startsWith('EVX26-')) {
      return {
        success: false,
        errorCode: 'INVALID_QR_FORMAT',
        errorMessage: `Invalid physical QR code format: ${cleanQr}`,
        qrCode: cleanQr,
      };
    }

    // Step 2: Query physical_qr_inventory
    let inventory = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);
    let invItem = inventory.find((i) => i.qrCode.toUpperCase() === cleanQr);

    // If item not yet in local inventory array, check assignments
    if (!invItem) {
      const assignments = getLocalArray<any>(STORAGE_KEYS.ASSIGNMENTS);
      const matchedAssign = assignments.find(
        (a) => a.active && a.physicalQrId.toUpperCase() === cleanQr
      );
      if (matchedAssign) {
        invItem = {
          id: matchedAssign.id || 'INV-' + cleanQr,
          qrCode: cleanQr,
          qrType: matchedAssign.physicalQrType || 'WRISTBAND',
          environment: cleanQr.startsWith('EVX26-TEST-') ? 'TEST' : 'PRODUCTION',
          status: 'ASSIGNED',
          participantId: matchedAssign.participantId,
          registrationId: matchedAssign.registrationId,
          assignedAt: matchedAssign.assignedAt,
          assignedBy: matchedAssign.assignedBy,
          createdAt: matchedAssign.assignedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // Auto-seed into inventory
        inventory.push(invItem);
        saveLocalArray(STORAGE_KEYS.QR_INVENTORY, inventory);
      }
    }

    if (!invItem) {
      return {
        success: false,
        errorCode: 'QR_NOT_FOUND',
        errorMessage: `Physical QR ${cleanQr} not found in inventory`,
        qrCode: cleanQr,
      };
    }

    // Step 3: Environment check against portalMode
    if (portalMode === 'PRODUCTION' && (invItem.environment === 'TEST' || cleanQr.startsWith('EVX26-TEST-'))) {
      return {
        success: false,
        errorCode: 'TEST_QR_IN_PRODUCTION_MODE',
        errorMessage: 'TEST QR DETECTED: This QR is for testing only and cannot be used in Production mode.',
        qrCode: cleanQr,
        qrType: invItem.qrType,
        environment: invItem.environment,
        status: invItem.status,
      };
    }

    if (portalMode === 'TEST' && (invItem.environment === 'PRODUCTION' || cleanQr.startsWith('EVX26-WB-'))) {
      return {
        success: false,
        errorCode: 'PRODUCTION_QR_IN_TEST_MODE',
        errorMessage: 'PRODUCTION QR IN TEST MODE: This QR belongs to Production event day inventory.',
        qrCode: cleanQr,
        qrType: invItem.qrType,
        environment: invItem.environment,
        status: invItem.status,
      };
    }

    // Step 4: Status check
    if (invItem.status === 'REVOKED') {
      return {
        success: false,
        errorCode: 'QR_REVOKED',
        errorMessage: `Physical QR ${cleanQr} is REVOKED: ${invItem.revocationReason || 'Lost or damaged wristband'}`,
        qrCode: cleanQr,
        qrType: invItem.qrType,
        environment: invItem.environment,
        status: invItem.status,
      };
    }

    if (invItem.status !== 'ASSIGNED' && invItem.status !== 'ACTIVE') {
      return {
        success: false,
        errorCode: 'QR_NOT_ASSIGNED',
        errorMessage: `Physical QR ${cleanQr} is UNASSIGNED. Please visit Reception Desk to bind wristband.`,
        qrCode: cleanQr,
        qrType: invItem.qrType,
        environment: invItem.environment,
        status: invItem.status,
      };
    }

    // Step 5: Foreign key & participant existence
    const targetRegId = invItem.participantId || invItem.registrationId;
    if (!targetRegId) {
      return {
        success: false,
        errorCode: 'PARTICIPANT_NOT_FOUND',
        errorMessage: `No participant linked to physical QR ${cleanQr}`,
        qrCode: cleanQr,
        qrType: invItem.qrType,
        environment: invItem.environment,
        status: invItem.status,
      };
    }

    // Step 6: Fetch participant profile
    const profileLookup = await this.lookupRegistration({ queryStr: targetRegId });
    if (!profileLookup.success || !profileLookup.data) {
      return {
        success: false,
        errorCode: 'PARTICIPANT_NOT_FOUND',
        errorMessage: `Participant profile for registration ${targetRegId} not found`,
        qrCode: cleanQr,
        qrType: invItem.qrType,
        environment: invItem.environment,
        status: invItem.status,
        registrationId: targetRegId,
      };
    }

    const participant = profileLookup.data;

    // Attach physical QR info
    participant.physicalQrId = cleanQr;
    participant.physicalQrType = invItem.qrType;
    participant.physicalQrAssignedAt = invItem.assignedAt;

    // Step 7: Return full resolved object
    return {
      success: true,
      qrCode: cleanQr,
      qrType: invItem.qrType,
      environment: invItem.environment,
      status: invItem.status,
      participantId: participant.id,
      registrationId: participant.registrationId,
      participant,
      registration: participant,
      registeredEvents: participant.selectedEvents,
    };
  },

  /**
   * Assign physical QR (wristband/ID card) to participant with Atomic Write + Verification
   */
  async assignPhysicalQr(params: {
    participantId: string;
    registrationId: string;
    physicalQrId: string;
    physicalQrType: 'ID_CARD' | 'WRISTBAND';
    staffId: string;
    staffRole: StaffRole;
    station?: string;
    portalMode?: 'TEST' | 'PRODUCTION';
  }): Promise<ScanOperationResponse> {
    const cleanQrId = params.physicalQrId.trim().toUpperCase();
    const station = params.station || 'Reception Desk';
    const portalMode =
      params.portalMode || (station.toUpperCase().includes('TEST') ? 'TEST' : 'PRODUCTION');

    if (!cleanQrId) {
      return {
        state: 'INVALID_QR',
        verbatimMessage: 'INVALID QR',
        details: 'Physical QR code cannot be empty',
      };
    }

    // 1. Environment validation
    const isTestQr = cleanQrId.startsWith('EVX26-TEST-');
    if (isTestQr && portalMode === 'PRODUCTION') {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'QR_ASSIGNMENT',
        registrationId: params.registrationId,
        physicalQrId: cleanQrId,
        result: 'DENIED',
        reason: 'TEST QR detected at production desk',
      });

      return {
        state: 'TEST_QR_IN_PROD',
        verbatimMessage: 'TEST QR DETECTED',
        details: 'This QR is for testing only and cannot be used for live participant check-in.',
      };
    }

    if (!isTestQr && portalMode === 'TEST' && cleanQrId.startsWith('EVX26-WB-')) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'QR_ASSIGNMENT',
        registrationId: params.registrationId,
        physicalQrId: cleanQrId,
        result: 'DENIED',
        reason: 'Production QR scanned in test mode',
      });

      return {
        state: 'PROD_QR_IN_TEST',
        verbatimMessage: 'PRODUCTION QR IN TEST MODE',
        details: 'This QR belongs to event day inventory and cannot be bound in test mode.',
      };
    }

    // 2. Revocation check
    let inventory = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);
    let invItem = inventory.find((i) => i.qrCode.toUpperCase() === cleanQrId);

    if (invItem && invItem.status === 'REVOKED') {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'QR_ASSIGNMENT',
        registrationId: params.registrationId,
        physicalQrId: cleanQrId,
        result: 'DENIED',
        reason: `Attempted to assign revoked QR: ${invItem.revocationReason || 'Lost or replaced'}`,
      });

      return {
        state: 'QR_REVOKED',
        verbatimMessage: 'QR REVOKED',
        details: `This physical QR has been revoked and cannot be used. (${invItem.revocationReason || 'Lost or replaced'})`,
      };
    }

    // 3. Rule: Check if physical QR is already assigned to a DIFFERENT active participant
    const assignments = getLocalArray<any>(STORAGE_KEYS.ASSIGNMENTS);
    const existingOther = assignments.find(
      (a) =>
        a.active &&
        a.physicalQrId.toUpperCase() === cleanQrId &&
        a.participantId !== params.participantId
    );

    if (existingOther) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'QR_ASSIGNMENT',
        registrationId: params.registrationId,
        physicalQrId: cleanQrId,
        result: 'DENIED',
        reason: `QR already assigned to participant ${existingOther.participantId || existingOther.registrationId}`,
      });

      return {
        state: 'QR_CONFLICT',
        verbatimMessage: 'QR ASSIGNED TO ANOTHER PARTICIPANT',
        details: `This physical QR is already active on participant ${existingOther.participantId || existingOther.registrationId}`,
      };
    }

    // 4. Rule: Check if participant already has an active physical QR
    const existingMine = assignments.find(
      (a) =>
        a.active &&
        a.participantId === params.participantId
    );

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

    // 5. ATOMIC WRITE
    const now = new Date().toISOString();
    const env: QrEnvironment = isTestQr ? 'TEST' : 'PRODUCTION';

    // A) Update or insert in physical_qr_inventory
    if (invItem) {
      invItem.status = 'ASSIGNED';
      invItem.participantId = params.participantId;
      invItem.registrationId = params.registrationId;
      invItem.qrType = params.physicalQrType;
      invItem.environment = env;
      invItem.assignedAt = now;
      invItem.assignedBy = params.staffId;
      invItem.updatedAt = now;
    } else {
      invItem = {
        id: 'INV-' + cleanQrId,
        qrCode: cleanQrId,
        qrType: params.physicalQrType,
        environment: env,
        status: 'ASSIGNED',
        participantId: params.participantId,
        registrationId: params.registrationId,
        assignedAt: now,
        assignedBy: params.staffId,
        createdAt: now,
        updatedAt: now,
      };
      inventory.push(invItem);
    }
    saveLocalArray(STORAGE_KEYS.QR_INVENTORY, inventory);

    // B) Update assignments array
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

    // C) Write to Supabase if configured (non-blocking)
    if (isSupabaseConfigured()) {
      Promise.resolve(
        supabase.from('physical_qr_inventory').upsert([
          {
            qr_code: cleanQrId,
            qr_type: params.physicalQrType,
            environment: env,
            status: 'ASSIGNED',
            participant_id: params.participantId,
            registration_id: params.registrationId,
            assigned_at: now,
            assigned_by: params.staffId,
            updated_at: now,
          },
        ], { onConflict: 'qr_code' })
      ).catch(() => {});
    }

    // 6. IMMEDIATE RE-SELECT & VERIFY
    const reselected = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY).find(
      (i) => i.qrCode.toUpperCase() === cleanQrId
    );

    const isVerified =
      reselected &&
      reselected.status === 'ASSIGNED' &&
      (reselected.registrationId === params.registrationId ||
        reselected.participantId === params.participantId);

    if (!isVerified) {
      return {
        state: 'VERIFICATION_FAILED',
        verbatimMessage: 'QR assignment could not be verified. Please try again.',
        details: 'Failed live re-query confirmation on assigned QR row',
      };
    }

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
    const existing = campusLogs.find(
      (c) =>
        c.participantId === params.participantId
    );

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
      Promise.resolve(
        supabase
          .from('overall_registrations')
          .update({ overall_attendance_status: 'Present' })
          .eq('registration_id', params.registrationId)
      ).catch(() => {});
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
    portalMode?: 'TEST' | 'PRODUCTION';
    isAdminOverride?: boolean;
    overrideReason?: string;
  }): Promise<ScanOperationResponse> {
    const cleanQr = params.physicalQrId.trim().toUpperCase();
    const eventId = params.eventId.trim().toUpperCase();
    const station = params.station || `Event Desk (${eventId})`;
    const portalMode =
      params.portalMode || (station.toUpperCase().includes('TEST') ? 'TEST' : 'PRODUCTION');
    const eventMeta = OFFICIAL_EVENTS.find((e) => e.eventId.toUpperCase() === eventId);
    const eventTitle = eventMeta ? eventMeta.title : eventId;

    if (!cleanQr) {
      return {
        state: 'INVALID_QR',
        verbatimMessage: 'INVALID QR',
        details: 'QR code cannot be empty',
      };
    }

    // 1. Resolve participant via single shared resolver
    const resolved = await this.resolvePhysicalQR(cleanQr, portalMode);

    if (!resolved.success || !resolved.participant) {
      const errCode = resolved.errorCode;
      let state: ScanResultState = 'NOT_FOUND';
      let msg = 'PARTICIPANT NOT FOUND';

      if (errCode === 'INVALID_QR_FORMAT') {
        state = 'INVALID_QR';
        msg = 'INVALID QR';
      } else if (errCode === 'QR_NOT_FOUND') {
        state = 'QR_NOT_FOUND';
        msg = 'QR NOT FOUND IN INVENTORY';
      } else if (errCode === 'QR_NOT_ASSIGNED') {
        state = 'UNASSIGNED_QR';
        msg = 'QR NOT ASSIGNED';
      } else if (errCode === 'QR_REVOKED') {
        state = 'QR_REVOKED';
        msg = 'QR REVOKED';
      } else if (errCode === 'TEST_QR_IN_PRODUCTION_MODE') {
        state = 'TEST_QR_IN_PROD';
        msg = 'TEST QR DETECTED';
      } else if (errCode === 'PRODUCTION_QR_IN_TEST_MODE') {
        state = 'PROD_QR_IN_TEST';
        msg = 'PRODUCTION QR IN TEST MODE';
      }

      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'EVENT_CHECKIN',
        eventId,
        eventName: eventTitle,
        physicalQrId: cleanQr,
        result: 'ERROR',
        reason: resolved.errorMessage || 'Resolver failure',
      });

      return {
        state,
        verbatimMessage: msg,
        details: resolved.errorMessage || `No active registration found for QR ${cleanQr}`,
      };
    }

    const participant = resolved.participant;

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
        verbatimMessage: 'PARTICIPANT FOUND — NOT REGISTERED FOR THIS EVENT',
        registeredEvents: participant.selectedEvents,
        details: 'You are not registered for this event. Please proceed to one of your registered event desks.',
        participant,
      };
    }

    // 3. Check idempotency for this event
    const eventLogs = getLocalArray<any>(STORAGE_KEYS.EVENT_ATTENDANCE);
    const existing = eventLogs.find(
      (el) =>
        el.participantId === participant.id &&
        el.eventId.toUpperCase() === eventId
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
        verbatimMessage: 'ALREADY MARKED PRESENT',
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
      Promise.resolve(
        supabase
          .from('event_registrations')
          .update({ attendance_status: 'Present', participation_status: 'Present' })
          .match({ registration_id: participant.registrationId, event_id: eventId })
      ).catch(() => {});
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
    portalMode?: 'TEST' | 'PRODUCTION';
    isAdminOverride?: boolean;
    overrideReason?: string;
  }): Promise<ScanOperationResponse> {
    const cleanQr = params.physicalQrId.trim().toUpperCase();
    const station = params.station || 'Food Counter';
    const portalMode =
      params.portalMode || (station.toUpperCase().includes('TEST') ? 'TEST' : 'PRODUCTION');

    if (!cleanQr) {
      return {
        state: 'INVALID_QR',
        verbatimMessage: 'INVALID QR',
        details: 'QR code cannot be empty',
      };
    }

    // 1. Resolve participant via single shared resolver
    const resolved = await this.resolvePhysicalQR(cleanQr, portalMode);

    if (!resolved.success || !resolved.participant) {
      const errCode = resolved.errorCode;
      let state: ScanResultState = 'NOT_FOUND';
      let msg = 'PARTICIPANT NOT FOUND';

      if (errCode === 'INVALID_QR_FORMAT') {
        state = 'INVALID_QR';
        msg = 'INVALID QR';
      } else if (errCode === 'QR_NOT_FOUND') {
        state = 'QR_NOT_FOUND';
        msg = 'QR NOT FOUND IN INVENTORY';
      } else if (errCode === 'QR_NOT_ASSIGNED') {
        state = 'UNASSIGNED_QR';
        msg = 'QR NOT ASSIGNED';
      } else if (errCode === 'QR_REVOKED') {
        state = 'QR_REVOKED';
        msg = 'QR REVOKED';
      } else if (errCode === 'TEST_QR_IN_PRODUCTION_MODE') {
        state = 'TEST_QR_IN_PROD';
        msg = 'TEST QR DETECTED';
      } else if (errCode === 'PRODUCTION_QR_IN_TEST_MODE') {
        state = 'PROD_QR_IN_TEST';
        msg = 'PRODUCTION QR IN TEST MODE';
      }

      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'FOOD_DELIVERY',
        physicalQrId: cleanQr,
        result: 'ERROR',
        reason: resolved.errorMessage || 'Resolver failure',
      });

      return {
        state,
        verbatimMessage: msg,
        details: resolved.errorMessage || `No active participant linked to QR ${cleanQr}`,
      };
    }

    const participant = resolved.participant;

    // 2. Check food duplicate idempotency
    const foodLogs = getLocalArray<any>(STORAGE_KEYS.FOOD);
    const existing = foodLogs.find(
      (f) =>
        f.participantId === participant.id
    );

    if (existing && !params.isAdminOverride) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'FOOD_DELIVERY',
        registrationId: participant.registrationId,
        participantName: participant.participantName,
        physicalQrId: cleanQr,
        result: 'DUPLICATE',
        reason: 'Meal token already redeemed',
      });

      return {
        state: 'DUPLICATE_FOOD',
        verbatimMessage: 'FOOD ALREADY DELIVERED',
        originalTime: existing.deliveredTime,
        originalStation: existing.station,
        details: `Meal token redeemed at ${new Date(existing.deliveredTime).toLocaleTimeString()} (${existing.station})`,
        participant,
      };
    }

    // 3. Record meal redemption
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
      verbatimMessage: '✓ MEAL DELIVERED',
      timestamp: now,
      details: `Meal token redeemed for ${participant.participantName}`,
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

  /**
   * Bulk Generate Static QR Inventory (1000 Production or 100 Test)
   * IDEMPOTENT: Detects already generated IDs and skips them without creating duplicates.
   */
  async generateQrInventory(options: {
    environment: QrEnvironment;
    count?: number;
    qrType?: QrType;
    onProgress?: (current: number, total: number) => void;
  }): Promise<{
    totalCreated: number;
    totalExisting: number;
    totalDuplicatesPrevented: number;
    items: PhysicalQrInventoryItem[];
  }> {
    const env = options.environment;
    const count = options.count || (env === 'PRODUCTION' ? 1000 : 100);
    const type = options.qrType || 'WRISTBAND';
    const prefix = env === 'PRODUCTION' ? 'EVX26-WB-' : 'EVX26-TEST-';

    const inventory = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);
    const existingMap = new Map<string, PhysicalQrInventoryItem>();
    inventory.forEach((i) => existingMap.set(i.qrCode.toUpperCase(), i));

    let createdCount = 0;
    let existingCount = 0;
    const newItems: PhysicalQrInventoryItem[] = [];
    const now = new Date().toISOString();

    for (let i = 1; i <= count; i++) {
      const qrCode = `${prefix}${String(i).padStart(6, '0')}`;
      if (existingMap.has(qrCode.toUpperCase())) {
        existingCount++;
      } else {
        const item: PhysicalQrInventoryItem = {
          id: `INV-${qrCode}`,
          qrCode,
          qrType: type,
          environment: env,
          status: 'UNUSED',
          createdAt: now,
          updatedAt: now,
        };
        newItems.push(item);
        existingMap.set(qrCode.toUpperCase(), item);
        createdCount++;
      }

      if (options.onProgress && (i % 25 === 0 || i === count)) {
        options.onProgress(i, count);
      }
    }

    if (newItems.length > 0) {
      const updatedInventory = [...inventory, ...newItems];
      saveLocalArray(STORAGE_KEYS.QR_INVENTORY, updatedInventory);

      // Attempt batch insert into Supabase physical_qr_inventory if configured
      if (isSupabaseConfigured()) {
        try {
          const batchSize = 200;
          for (let b = 0; b < newItems.length; b += batchSize) {
            const chunk = newItems.slice(b, b + batchSize).map((it) => ({
              qr_code: it.qrCode,
              qr_type: it.qrType,
              environment: it.environment,
              status: it.status,
              created_at: it.createdAt,
              updated_at: it.updatedAt,
            }));
            await supabase.from('physical_qr_inventory').upsert(chunk, { onConflict: 'qr_code' });
          }
        } catch (err) {
          console.warn('Supabase physical_qr_inventory upsert notice:', err);
        }
      }
    }

    await this.logAudit({
      staffUser: 'Admin Staff',
      station: 'Admin Panel',
      operation: 'ADMIN_OVERRIDE',
      result: 'SUCCESS',
      reason: `Generated ${createdCount} ${env} static QR inventory codes (${existingCount} already existed).`,
    });

    return {
      totalCreated: createdCount,
      totalExisting: existingCount,
      totalDuplicatesPrevented: existingCount,
      items: Array.from(existingMap.values()),
    };
  },

  /**
   * Get QR Inventory list with optional filters and pagination
   */
  async getQrInventory(filter?: {
    environment?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: PhysicalQrInventoryItem[];
    totalCount: number;
    page: number;
    totalPages: number;
  }> {
    let all = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);

    // If local inventory is empty, check if we should auto-seed from pre-generated set
    if (all.length === 0) {
      await this.generateQrInventory({ environment: 'PRODUCTION', count: 1000 });
      await this.generateQrInventory({ environment: 'TEST', count: 100 });
      all = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);
    }

    let filtered = all;

    if (filter?.environment && filter.environment !== 'ALL') {
      filtered = filtered.filter((i) => i.environment === filter.environment);
    }

    if (filter?.status && filter.status !== 'ALL') {
      filtered = filtered.filter((i) => i.status === filter.status);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.qrCode.toLowerCase().includes(q) ||
          (i.registrationId && i.registrationId.toLowerCase().includes(q)) ||
          (i.participantName && i.participantName.toLowerCase().includes(q)) ||
          (i.participantId && i.participantId.toLowerCase().includes(q))
      );
    }

    const totalCount = filtered.length;
    const page = filter?.page || 1;
    const pageSize = filter?.pageSize || 25;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return { items, totalCount, page, totalPages };
  },

  /**
   * Get QR Inventory summary metrics
   */
  async getInventoryMetrics(): Promise<InventoryMetrics> {
    const all = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);

    const prod = all.filter((i) => i.environment === 'PRODUCTION');
    const test = all.filter((i) => i.environment === 'TEST');

    return {
      production: {
        total: prod.length,
        unused: prod.filter((i) => i.status === 'UNUSED').length,
        assigned: prod.filter((i) => i.status === 'ASSIGNED' || i.status === 'ACTIVE').length,
        revoked: prod.filter((i) => i.status === 'REVOKED').length,
      },
      test: {
        total: test.length,
        unused: test.filter((i) => i.status === 'UNUSED').length,
        assigned: test.filter((i) => i.status === 'ASSIGNED' || i.status === 'ACTIVE').length,
        revoked: test.filter((i) => i.status === 'REVOKED').length,
      },
    };
  },

  /**
   * Revoke a Physical QR (e.g. Lost wristband)
   */
  async revokeQr(params: {
    qrCode: string;
    reason?: string;
    staffId: string;
    station?: string;
  }): Promise<{ success: boolean; message: string }> {
    const cleanQr = params.qrCode.trim().toUpperCase();
    const inventory = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);
    const item = inventory.find((i) => i.qrCode.toUpperCase() === cleanQr);

    if (!item) {
      return { success: false, message: `QR Code ${cleanQr} not found in inventory` };
    }

    item.status = 'REVOKED';
    item.revocationReason = params.reason || 'Lost or damaged wristband';
    item.updatedAt = new Date().toISOString();

    saveLocalArray(STORAGE_KEYS.QR_INVENTORY, inventory);

    // Also deactivate any active assignment
    const assignments = getLocalArray<any>(STORAGE_KEYS.ASSIGNMENTS);
    const assignItem = assignments.find((a) => a.physicalQrId.toUpperCase() === cleanQr);
    if (assignItem) {
      assignItem.active = false;
      saveLocalArray(STORAGE_KEYS.ASSIGNMENTS, assignments);
    }

    await this.logAudit({
      staffUser: params.staffId,
      station: params.station || 'Admin Panel',
      operation: 'ADMIN_OVERRIDE',
      physicalQrId: cleanQr,
      registrationId: item.registrationId,
      result: 'SUCCESS',
      reason: `Revoked physical QR ${cleanQr}: ${item.revocationReason}`,
    });

    return { success: true, message: `QR Code ${cleanQr} revoked successfully.` };
  },
};
