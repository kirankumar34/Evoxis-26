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
  ParticipantOperationalSummary,
  EventAttendanceSummary,
  TeamOperationalSummary,
  TeamPassProfile,
  TeamMemberRosterItem,
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

// Helper: QR token validator
export function isValidQRToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const clean = token.trim();
  return (
    /^EVOXIS26:TEAM:[0-9A-Za-z_-]+$/i.test(clean) ||
    /^TEAM:[0-9A-Za-z_-]+$/i.test(clean) ||
    /^EVOXIS26:[a-f0-9]{6,16}:[0-9]{1,10}(-[0-9A-Za-z]+)?$/i.test(clean) ||
    /^EVOXIS26:[a-f0-9]{6,16}:[0-9A-Za-z_-]+$/i.test(clean) ||
    /^EVOXIS26:[a-f0-9]{6,35}(-[0-9A-Za-z]+)?$/i.test(clean) ||
    /^EVOXIS26:PAX:[0-9A-Za-z_-]+:[a-f0-9]+$/i.test(clean) ||
    /^EVOXIS26-[0-9A-Za-z_-]+$/i.test(clean)
  );
}

// Helper: QR string parser
export function parseQRString(qrString: string): {
  valid: boolean;
  token: string;
  registrationId?: string;
  isTeamPass?: boolean;
} {
  const token = (qrString || '').trim();
  if (token.toUpperCase().startsWith('EVOXIS26:TEAM:') || token.toUpperCase().startsWith('TEAM:')) {
    const rawId = token.replace(/^EVOXIS26:TEAM:/i, '').replace(/^TEAM:/i, '').trim();
    const padded = /^\d{1,5}$/.test(rawId) ? rawId.padStart(5, '0') : rawId;
    return {
      valid: true,
      token,
      isTeamPass: true,
      registrationId: padded.startsWith('EVOXIS') ? padded : `EVOXIS26-${padded}`,
    };
  }

  if (token.includes(':')) {
    const parts = token.split(':');
    const numeric = parts.length >= 3 ? parts[2] : parts[1].replace(/[^0-9]/g, '');
    const padded = numeric && !numeric.includes('M') ? numeric.padStart(5, '0') : numeric;
    return {
      valid: true,
      token,
      isTeamPass: false,
      registrationId: padded ? (padded.startsWith('EVOXIS') ? padded : `EVOXIS26-${padded}`) : undefined,
    };
  }

  return { valid: true, token, isTeamPass: false, registrationId: token };
}

export const operationsApi = {
  /**
   * Log an operational event to audit trail and Supabase attendance_logs
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
  async lookupRegistration(params: {
    token?: string;
    queryStr?: string;
    isTeamPass?: boolean;
  }): Promise<{
    success: boolean;
    data?: ParticipantProfile;
    isTeamPass?: boolean;
    type?: 'TEAM_PASS' | 'INDIVIDUAL_PASS';
    message?: string;
  }> {
    try {
      const rawQuery = (params.token || params.queryStr || '').trim();
      if (!rawQuery) {
        return { success: false, message: 'Scan or search query is required' };
      }

      let lookupKey = rawQuery;

      // 1. Detect if this is an explicit Team Pass lookup
      const isTeamPassLookup = Boolean(
        params.isTeamPass ||
        /^EVOXIS26:TEAM:/i.test(lookupKey) ||
        /^TEAM:/i.test(lookupKey) ||
        /:TEAM:/i.test(lookupKey)
      );

      // Clean up token if it's a Team Pass
      if (isTeamPassLookup) {
        lookupKey = lookupKey
          .replace(/^EVOXIS26:TEAM:/i, '')
          .replace(/^TEAM:/i, '')
          .trim();
        // If it's a numeric suffix, format as EVOXIS26-XXXXX
        if (/^\d{1,6}$/.test(lookupKey)) {
          lookupKey = `EVOXIS26-${lookupKey.padStart(5, '0')}`;
        }
      } else {
        // Parse standard QR token if passed
        if (lookupKey.startsWith('EVOXIS26:') && lookupKey.includes(':')) {
          const parsed = parseQRString(lookupKey);
          if (parsed.registrationId) {
            lookupKey = parsed.registrationId;
          }
        }

        // If not found directly, check physical QR assignments
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
        } else {
          const inventory = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);
          const matchedInv = inventory.find((i) => i.qrCode.toUpperCase() === rawQuery.toUpperCase());
          if (matchedInv && (matchedInv.participantId || matchedInv.registrationId)) {
            lookupKey = matchedInv.participantId || matchedInv.registrationId!;
          } else if (isSupabaseConfigured()) {
            try {
              const { data: logRecords } = await supabase
                .from('attendance_logs')
                .select('*')
                .eq('event_type', 'QR_ASSIGNMENT')
                .eq('qr_token', rawQuery.toUpperCase())
                .eq('attendance_status', 'SUCCESS')
                .order('scan_timestamp', { ascending: false })
                .limit(1);

              if (logRecords && logRecords.length > 0 && logRecords[0].registration_id) {
                lookupKey = logRecords[0].registration_id;
              }
            } catch (e) {
              console.warn('Supabase attendance_logs lookup notice:', e);
            }
          }
        }
      }

      // 2. Query Supabase overall_registrations
      let matchRecord: any = null;

      if (isSupabaseConfigured()) {
        try {
          // A. Exact match by qr_token (using both rawQuery and lookupKey)
          const { data: byQr, error: qrErr } = await supabase
            .from('overall_registrations')
            .select('*')
            .or(`qr_token.eq.${rawQuery.trim()},qr_token.eq.${lookupKey.trim()}`)
            .limit(1);

          if (!qrErr && byQr && byQr.length > 0) {
            matchRecord = byQr[0];
          } else {
            // B. Exact match by registration_id (try exact, EVOXIS26-, EVOXIS26-TEST-)
            const candidateIds = [
              lookupKey.trim().toUpperCase(),
              rawQuery.trim().toUpperCase(),
              `EVOXIS26-${lookupKey.trim().toUpperCase()}`,
              `EVOXIS26-TEST-${lookupKey.trim().toUpperCase()}`,
            ];
            
            for (const cand of candidateIds) {
              if (cand) {
                const { data: byRegId } = await supabase
                  .from('overall_registrations')
                  .select('*')
                  .eq('registration_id', cand)
                  .limit(1);
                if (byRegId && byRegId.length > 0) {
                  matchRecord = byRegId[0];
                  break;
                }
              }
            }

            if (!matchRecord) {
              // C. Match by email or mobile
              const cleanContact = lookupKey.trim();
              const { data: byContact } = await supabase
                .from('overall_registrations')
                .select('*')
                .or(`email.eq.${cleanContact.toLowerCase()},mobile_number.eq.${cleanContact}`)
                .limit(1);

              if (byContact && byContact.length > 0) {
                matchRecord = byContact[0];
              } else if (cleanContact.length >= 3 && !cleanContact.startsWith('EVX') && !cleanContact.startsWith('EVO') && !cleanContact.includes(':')) {
                // D. Match by team name or participant name
                const { data: byTeam } = await supabase
                  .from('overall_registrations')
                  .select('*')
                  .ilike('team_name', `%${cleanContact}%`)
                  .limit(1);
                if (byTeam && byTeam.length > 0) {
                  matchRecord = byTeam[0];
                } else {
                  const { data: byName } = await supabase
                    .from('overall_registrations')
                    .select('*')
                    .ilike('participant_name', `%${cleanContact}%`)
                    .limit(1);
                  if (byName && byName.length > 0) {
                    matchRecord = byName[0];
                  }
                }
              }

              // E. Fallback for team member suffixes (e.g. EVOXIS26-00046-M1)
              if (!matchRecord && /-M\d+$/i.test(lookupKey)) {
                const baseKey = lookupKey.replace(/-M\d+$/i, '').toUpperCase();
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
          }
        } catch (dbErr) {
          console.warn('[OperationsAPI] Supabase lookupRegistration error:', dbErr);
        }
      }

      // If not found in Supabase, check local mock registrations
      if (!matchRecord) {
        const mockRegs = getLocalArray<any>('evoxis26_overall_registrations');
        const cleanUpper = lookupKey.toUpperCase();
        const rawUpper = rawQuery.toUpperCase();

        // Exact match first
        matchRecord = mockRegs.find(
          (r) =>
            (r.qrToken && (r.qrToken === rawQuery || r.qrToken === lookupKey)) ||
            (r.qr_token && (r.qr_token === rawQuery || r.qr_token === lookupKey)) ||
            (r.registrationId && (r.registrationId.toUpperCase() === cleanUpper || r.registrationId.toUpperCase() === rawUpper || r.registrationId.toUpperCase() === `EVOXIS26-${cleanUpper}` || r.registrationId.toUpperCase() === `EVOXIS26-TEST-${cleanUpper}`)) ||
            (r.registration_id && (r.registration_id.toUpperCase() === cleanUpper || r.registration_id.toUpperCase() === rawUpper || r.registration_id.toUpperCase() === `EVOXIS26-${cleanUpper}` || r.registration_id.toUpperCase() === `EVOXIS26-TEST-${cleanUpper}`)) ||
            (r.email && r.email.toLowerCase() === lookupKey.toLowerCase()) ||
            (r.mobileNumber && r.mobileNumber === lookupKey) ||
            (r.mobile_number && r.mobile_number === lookupKey) ||
            (r.teamName && r.teamName.toLowerCase().includes(lookupKey.toLowerCase())) ||
            (r.team_name && r.team_name.toLowerCase().includes(lookupKey.toLowerCase())) ||
            (r.participantName && r.participantName.toLowerCase().includes(lookupKey.toLowerCase())) ||
            (r.participant_name && r.participant_name.toLowerCase().includes(lookupKey.toLowerCase()))
        );

        if (!matchRecord && /-M\d+$/i.test(lookupKey)) {
          const baseKey = lookupKey.replace(/-M\d+$/i, '').toUpperCase();
          matchRecord = mockRegs.find(
            (r) =>
              (r.registrationId && (r.registrationId.toUpperCase() === baseKey || r.registrationId.toUpperCase() === `EVOXIS26-${baseKey}` || r.registrationId.toUpperCase() === `EVOXIS26-TEST-${baseKey}`)) ||
              (r.registration_id && (r.registration_id.toUpperCase() === baseKey || r.registration_id.toUpperCase() === `EVOXIS26-${baseKey}` || r.registration_id.toUpperCase() === `EVOXIS26-TEST-${baseKey}`))
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
        ? teamMembersRaw.map((tm: any, idx: number) => ({
            name: tm.name || tm.fullName || '',
            email: tm.email || '',
            phone: tm.phone || tm.mobile || '',
            college: tm.college || college,
            department: tm.department || department,
            year: tm.year || year,
            gender: tm.gender || 'Not Specified',
            role: tm.role || (idx === 0 ? 'TEAM_HEAD' : 'TEAM_MEMBER'),
            registrationId: tm.registrationId || (idx === 0 ? regId : `${regId}-M${idx}`),
            qrToken: tm.qrToken || (idx === 0 ? digitalQr : `${digitalQr}-M${idx}`),
          }))
        : [];

      // Check if querying a specific team member
      let currentParticipantId = regId;
      let currentRole: 'TEAM_HEAD' | 'TEAM_MEMBER' | 'INDIVIDUAL' =
        matchRecord.role || (regType === 'Team' ? 'TEAM_HEAD' : 'INDIVIDUAL');

      if (!isTeamPassLookup && /-M\d+$/i.test(lookupKey)) {
        currentParticipantId = lookupKey;
        currentRole = 'TEAM_MEMBER';
        if (regId.toUpperCase() !== lookupKey.toUpperCase()) {
          const matchNum = lookupKey.match(/-M(\d+)$/i);
          const memberNum = matchNum ? parseInt(matchNum[1], 10) : 1;
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
            la.participantId === currentParticipantId &&
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
        (c) => c.participantId === currentParticipantId
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
        (f) => f.participantId === currentParticipantId
      );

      // Retrieve Physical QR Assignments for participant & team
      const localAssignments = getLocalArray<{
        physicalQrId: string;
        participantId: string;
        registrationId: string;
        active: boolean;
        physicalQrType: 'ID_CARD' | 'WRISTBAND';
        assignedAt?: string;
      }>(STORAGE_KEYS.ASSIGNMENTS);

      const physicalAssignment = localAssignments.find(
        (a) => a.active && a.participantId === currentParticipantId
      );

      // Build Team Pass Profile if this is a Team Pass or Team Registration requested as Team Pass
      let teamPassProfile: TeamPassProfile | undefined = undefined;
      if (isTeamPassLookup || regType === 'Team') {
        const rosterItems: TeamMemberRosterItem[] = [];

        // 1. Team Head
        const headAssignment = localAssignments.find(
          (a) => a.active && (a.participantId === regId || a.participantId === pName)
        );
        const headCampus = localCampus.find((c) => c.participantId === regId);
        rosterItems.push({
          participantId: regId,
          registrationId: regId,
          name: pName,
          email,
          phone: mobile,
          college,
          department,
          year,
          gender,
          role: 'TEAM_HEAD',
          qrToken: digitalQr,
          physicalQrId: headAssignment?.physicalQrId,
          physicalQrType: headAssignment?.physicalQrType || 'WRISTBAND',
          assignedAt: headAssignment?.assignedAt,
          campusAttendanceStatus: headCampus ? 'Present' : 'Pending',
          campusCheckinTime: headCampus?.checkinTime,
        });

        // 2. Team Members
        const nonHeadMembers = teamMembers.filter((tm) => tm.role !== 'TEAM_HEAD');
        nonHeadMembers.forEach((tm, idx) => {
          const mPartId = tm.registrationId || `${regId}-M${idx + 1}`;
          const mAssign = localAssignments.find(
            (a) => a.active && (a.participantId === mPartId || (a.registrationId === regId && a.participantId === tm.name))
          );
          const mCampus = localCampus.find((c) => c.participantId === mPartId);
          rosterItems.push({
            participantId: mPartId,
            registrationId: regId,
            name: tm.name,
            email: tm.email,
            phone: tm.phone,
            college: tm.college || college,
            department: tm.department || department,
            year: tm.year || year,
            gender: tm.gender || 'Not Specified',
            role: 'TEAM_MEMBER',
            qrToken: tm.qrToken || `${digitalQr}-M${idx + 1}`,
            physicalQrId: mAssign?.physicalQrId,
            physicalQrType: mAssign?.physicalQrType || 'WRISTBAND',
            assignedAt: mAssign?.assignedAt,
            campusAttendanceStatus: mCampus ? 'Present' : 'Pending',
            campusCheckinTime: mCampus?.checkinTime,
          });
        });

        const assignedCount = rosterItems.filter((m) => Boolean(m.physicalQrId)).length;
        teamPassProfile = {
          teamId: `TEAM-${regId.replace(/[^0-9]/g, '')}`,
          teamName: teamName || `${pName}'s Team`,
          registrationId: regId,
          teamPassToken: `EVOXIS26:TEAM:${regId.replace(/[^0-9]/g, '')}`,
          college,
          department,
          year,
          selectedEvents: selectedEventIds,
          registeredEvents,
          members: rosterItems,
          totalMembers: rosterItems.length,
          assignedCount,
          isComplete: rosterItems.length > 0 && assignedCount === rosterItems.length,
        };
      }

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
        isTeamPass: isTeamPassLookup,
        teamPassProfile: isTeamPassLookup ? teamPassProfile : undefined,
      };

      if (isTeamPassLookup && teamPassProfile) {
        return {
          success: true,
          isTeamPass: true,
          type: 'TEAM_PASS',
          data: profile,
        };
      }

      return {
        success: true,
        isTeamPass: false,
        type: 'INDIVIDUAL_PASS',
        data: profile,
      };
    } catch (err: any) {
      console.error('[OperationsApi] lookupRegistration error:', err);
      return { success: false, message: err.message || 'Lookup failed' };
    }
  },

  /**
   * Get fresh TeamPassProfile for a given team registration
   */
  async getTeamPassProfile(registrationId: string): Promise<{
    success: boolean;
    data?: TeamPassProfile;
    message?: string;
  }> {
    const res = await this.lookupRegistration({
      queryStr: registrationId,
      isTeamPass: true,
    });
    if (res.success && res.data?.teamPassProfile) {
      return { success: true, data: res.data.teamPassProfile };
    }
    return { success: false, message: res.message || 'Team pass not found' };
  },

  /**
   * Mark campus present for all members of a team
   */
  async markCampusPresentForTeam(params: {
    registrationId: string;
    staffId: string;
    station?: string;
  }): Promise<{
    success: boolean;
    message: string;
    checkedInCount: number;
  }> {
    const teamRes = await this.getTeamPassProfile(params.registrationId);
    if (!teamRes.success || !teamRes.data) {
      return { success: false, message: teamRes.message || 'Team not found', checkedInCount: 0 };
    }

    const station = params.station || 'Reception Desk';
    let checkedInCount = 0;

    for (const member of teamRes.data.members) {
      const res = await this.markCampusPresent({
        participantId: member.participantId,
        registrationId: params.registrationId,
        staffId: params.staffId,
        station,
      });
      if (res.state === 'SUCCESS') {
        checkedInCount++;
      }
    }

    return {
      success: true,
      message: `Marked ${checkedInCount} members campus present`,
      checkedInCount,
    };
  },

  /**
   * Single Shared Physical QR Resolver
   * Resolves physical QR codes (e.g. EVX26-TEST-000051, EVX26-WB-000001)
   * into participant profiles and registered events for Reception, Event Desks, and Food Counters alike.
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
    const isDirectReg = cleanQr.startsWith('EVOXIS26');

    if (!isStaticFormat && !isLegacyPhysical && !isDirectReg && !cleanQr.startsWith('EVX26-')) {
      return {
        success: false,
        errorCode: 'INVALID_QR_FORMAT',
        errorMessage: `Invalid physical QR code format: ${cleanQr}`,
        qrCode: cleanQr,
      };
    }

    // Step 2: Resolve Target Participant ID from local assignments first, then Supabase attendance_logs
    let targetParticipantId: string | null = null;
    let assignedAt: string | undefined;
    let qrType: QrType = 'WRISTBAND';

    const assignments = getLocalArray<any>(STORAGE_KEYS.ASSIGNMENTS);
    const matchAssign = assignments.find((a) => a.active && a.physicalQrId.toUpperCase() === cleanQr);
    if (matchAssign) {
      targetParticipantId = matchAssign.participantId || matchAssign.registrationId;
      assignedAt = matchAssign.assignedAt;
      qrType = matchAssign.physicalQrType || 'WRISTBAND';
    } else {
      const inventory = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);
      const matchInv = inventory.find(
        (i) => i.qrCode.toUpperCase() === cleanQr && (i.status === 'ASSIGNED' || i.status === 'ACTIVE')
      );
      if (matchInv) {
        targetParticipantId = matchInv.participantId || matchInv.registrationId || null;
        assignedAt = matchInv.assignedAt;
        qrType = matchInv.qrType || 'WRISTBAND';
      } else if (isSupabaseConfigured()) {
        try {
          const { data: logs } = await supabase
            .from('attendance_logs')
            .select('*')
            .eq('event_type', 'QR_ASSIGNMENT')
            .eq('qr_token', cleanQr)
            .eq('attendance_status', 'SUCCESS')
            .order('scan_timestamp', { ascending: false })
            .limit(1);

          if (logs && logs.length > 0 && logs[0].registration_id) {
            targetParticipantId = logs[0].registration_id;
            assignedAt = logs[0].scan_timestamp;
          }
        } catch (e) {
          console.warn('Supabase attendance_logs resolve notice:', e);
        }
      }
    }

    // If cleanQr is a direct registration ID or digital QR token
    if (!targetParticipantId && (cleanQr.startsWith('EVOXIS26') || cleanQr.includes(':'))) {
      targetParticipantId = cleanQr;
    }

    // Step 3: Check Revocation
    const inventory = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);
    const invItem = inventory.find((i) => i.qrCode.toUpperCase() === cleanQr);

    if (invItem && invItem.status === 'REVOKED') {
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

    // Step 4: Environment check against portalMode
    if (portalMode === 'PRODUCTION' && (cleanQr.startsWith('EVX26-TEST-') || invItem?.environment === 'TEST')) {
      return {
        success: false,
        errorCode: 'TEST_QR_IN_PRODUCTION_MODE',
        errorMessage: 'TEST QR DETECTED: This QR is for testing only and cannot be used in Production mode.',
        qrCode: cleanQr,
        qrType: invItem?.qrType || qrType,
        environment: 'TEST',
        status: invItem?.status || 'UNUSED',
      };
    }

    if (portalMode === 'TEST' && (cleanQr.startsWith('EVX26-WB-') || invItem?.environment === 'PRODUCTION')) {
      return {
        success: false,
        errorCode: 'PRODUCTION_QR_IN_TEST_MODE',
        errorMessage: 'PRODUCTION QR IN TEST MODE: This QR belongs to Production event day inventory.',
        qrCode: cleanQr,
        qrType: invItem?.qrType || qrType,
        environment: 'PRODUCTION',
        status: invItem?.status || 'UNUSED',
      };
    }

    // Step 5: If not assigned to any participant
    if (!targetParticipantId) {
      if (!invItem && !cleanQr.startsWith('EVOXIS26')) {
        return {
          success: false,
          errorCode: 'QR_NOT_FOUND',
          errorMessage: `Physical QR ${cleanQr} not found in inventory`,
          qrCode: cleanQr,
        };
      }

      return {
        success: false,
        errorCode: 'QR_NOT_ASSIGNED',
        errorMessage: `Physical QR ${cleanQr} is UNASSIGNED. Please visit Reception Desk to bind wristband.`,
        qrCode: cleanQr,
        qrType: invItem?.qrType || qrType,
        environment: invItem?.environment || (cleanQr.startsWith('EVX26-TEST-') ? 'TEST' : 'PRODUCTION'),
        status: 'UNUSED',
      };
    }

    // Step 6: Fetch participant profile
    const profileLookup = await this.lookupRegistration({ queryStr: targetParticipantId });
    if (!profileLookup.success || !profileLookup.data) {
      return {
        success: false,
        errorCode: 'PARTICIPANT_NOT_FOUND',
        errorMessage: `Participant profile for registration ${targetParticipantId} not found`,
        qrCode: cleanQr,
        qrType,
        environment: cleanQr.startsWith('EVX26-TEST-') ? 'TEST' : 'PRODUCTION',
        status: 'ASSIGNED',
        registrationId: targetParticipantId,
      };
    }

    const participant = profileLookup.data;

    // Attach physical QR info
    participant.physicalQrId = cleanQr;
    participant.physicalQrType = qrType;
    participant.physicalQrAssignedAt = assignedAt;

    // Step 7: Return full resolved object
    return {
      success: true,
      qrCode: cleanQr,
      qrType,
      environment: cleanQr.startsWith('EVX26-TEST-') ? 'TEST' : 'PRODUCTION',
      status: 'ASSIGNED',
      participantId: participant.id,
      registrationId: participant.registrationId,
      teamId: participant.teamName,
      participant,
      registration: participant,
      registeredEvents: participant.selectedEvents,
      campusStatus: participant.campusAttendanceStatus,
      foodStatus: participant.foodDelivered ? 'DELIVERED' : 'PENDING',
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

    const isTestQr = cleanQrId.startsWith('EVX26-TEST-');

    // 1. Revocation check
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

    // 2. Rule: Check if physical QR is already assigned to a DIFFERENT active participant
    const assignments = getLocalArray<any>(STORAGE_KEYS.ASSIGNMENTS);
    const existingOther = assignments.find(
      (a) =>
        a.active &&
        a.physicalQrId.toUpperCase() === cleanQrId &&
        a.participantId !== params.participantId
    );

    if (existingOther || (invItem && (invItem.status === 'ASSIGNED' || invItem.status === 'ACTIVE') && invItem.participantId && invItem.participantId !== params.participantId)) {
      const assignedPartId = (invItem && invItem.participantId) || (existingOther && existingOther.participantId) || '';
      const assignedName = (invItem && invItem.participantName) || assignedPartId;
      const assignedTime = (invItem && invItem.assignedAt) || (existingOther && existingOther.assignedAt) || '';

      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'QR_ASSIGNMENT',
        registrationId: params.registrationId,
        physicalQrId: cleanQrId,
        result: 'DENIED',
        reason: `WRISTBAND ALREADY ASSIGNED to participant ${assignedName} (${assignedPartId})`,
      });

      return {
        state: 'QR_CONFLICT',
        verbatimMessage: 'WRISTBAND ALREADY ASSIGNED',
        details: `This physical wristband (${cleanQrId}) is already assigned to participant ${assignedName} (${assignedPartId})${assignedTime ? ` at ${new Date(assignedTime).toLocaleTimeString()}` : ''}. Reassignment requires authorized admin override.`,
      };
    }

    // 3. Rule: Check if participant already has an active physical QR
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
          verbatimMessage: 'PARTICIPANT ALREADY HAS ACTIVE WRISTBAND',
          details: `Participant already has active QR ${existingMine.physicalQrId}. Only Super Admin can reassign.`,
        };
      }
      existingMine.active = false;
    }

    // 4. Fetch Participant Details
    const profileLookup = await this.lookupRegistration({ queryStr: params.participantId });
    const participant = profileLookup.data;

    // 5. ATOMIC WRITE (UPDATE EXISTING ROW IN PLACE)
    const now = new Date().toISOString();
    const env: QrEnvironment = isTestQr ? 'TEST' : 'PRODUCTION';

    // A) Update or insert in physical_qr_inventory
    if (invItem) {
      invItem.status = 'ASSIGNED';
      invItem.qrId = cleanQrId;
      invItem.qrCode = cleanQrId;
      invItem.qrType = params.physicalQrType;
      invItem.environment = env;
      invItem.participantId = params.participantId;
      invItem.registrationId = params.registrationId;
      invItem.participantName = participant?.participantName || '';
      invItem.email = participant?.email || '';
      invItem.mobileNumber = participant?.mobile || '';
      invItem.college = participant?.college || '';
      invItem.department = participant?.department || '';
      invItem.year = participant?.year || '';
      invItem.gender = participant?.gender || '';
      invItem.registrationType = participant?.registrationType || '';
      invItem.selectedEvents = participant?.selectedEvents || [];
      invItem.totalEvents = participant?.selectedEvents ? participant.selectedEvents.length : 0;
      invItem.paymentStatus = 'Paid/Confirmed';
      invItem.campusStatus = invItem.campusStatus || 'Pending';
      invItem.foodStatus = invItem.foodStatus || 'Pending';
      invItem.assignedAt = now;
      invItem.assignedBy = params.staffId;
      invItem.updatedAt = now;
    } else {
      invItem = {
        id: 'INV-' + cleanQrId,
        qrId: cleanQrId,
        qrCode: cleanQrId,
        qrType: params.physicalQrType,
        environment: env,
        status: 'ASSIGNED',
        participantId: params.participantId,
        registrationId: params.registrationId,
        participantName: participant?.participantName || '',
        email: participant?.email || '',
        mobileNumber: participant?.mobile || '',
        college: participant?.college || '',
        department: participant?.department || '',
        year: participant?.year || '',
        gender: participant?.gender || '',
        registrationType: participant?.registrationType || '',
        selectedEvents: participant?.selectedEvents || [],
        totalEvents: participant?.selectedEvents ? participant.selectedEvents.length : 0,
        paymentStatus: 'Paid/Confirmed',
        campusStatus: 'Pending',
        foodStatus: 'Pending',
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

    // C) Write to Supabase attendance_logs synchronously
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('attendance_logs').insert([
          {
            attendance_id: 'AUD-ASSIGN-' + Math.random().toString(36).substring(2, 9),
            registration_id: params.participantId,
            participant_name: participant?.participantName || params.staffId,
            event_id: 'QR_ASSIGNMENT',
            event_name: 'QR_ASSIGNMENT',
            event_type: 'QR_ASSIGNMENT',
            attendance_date: now.split('T')[0],
            attendance_time: new Date(now).toLocaleTimeString('en-US'),
            attendance_location: station,
            attendance_status: 'SUCCESS',
            participation_status: 'Present',
            verified_by: params.staffId,
            qr_token: cleanQrId,
            scan_timestamp: now,
          },
        ]);
      } catch (err) {
        console.warn('Supabase assignPhysicalQr write notice:', err);
      }
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
      participantId: params.participantId,
      physicalQrId: cleanQrId,
      result: 'SUCCESS',
      reason: `Bound ${params.physicalQrType} ${cleanQrId}`,
    });

    syncToGoogleSheets({
      action: 'assignPhysicalQr',
      registrationId: params.registrationId,
      participantId: params.participantId,
      participantName: participant?.participantName,
      email: participant?.email,
      mobile: participant?.mobile,
      college: participant?.college,
      department: participant?.department,
      year: participant?.year,
      gender: participant?.gender,
      registrationType: participant?.registrationType,
      selectedEvents: participant?.selectedEvents,
      physicalQrId: cleanQrId,
      station,
      verifiedBy: params.staffId,
      campusStatus: invItem.campusStatus,
      foodStatus: invItem.foodStatus,
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
      (c) => c.participantId === params.participantId
    );

    if (existing) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'CAMPUS_CHECKIN',
        registrationId: params.registrationId,
        participantId: params.participantId,
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

    // Update physical_qr_inventory campusStatus
    const inventory = getLocalArray<PhysicalQrInventoryItem>(STORAGE_KEYS.QR_INVENTORY);
    const invMatch = inventory.find(
      (i) =>
        i.participantId === params.participantId ||
        i.registrationId === params.registrationId ||
        (params.physicalQrId && i.qrCode.toUpperCase() === params.physicalQrId.toUpperCase())
    );
    if (invMatch) {
      invMatch.campusStatus = 'Present';
      invMatch.updatedAt = now;
      saveLocalArray(STORAGE_KEYS.QR_INVENTORY, inventory);
    }

    // Update Supabase overall_registrations if live
    if (isSupabaseConfigured()) {
      Promise.resolve(
        supabase
          .from('overall_registrations')
          .update({ overall_attendance_status: 'Present' })
          .eq('registration_id', params.participantId)
      ).catch(() => {});
    }

    await this.logAudit({
      staffUser: params.staffId,
      station,
      operation: 'CAMPUS_CHECKIN',
      registrationId: params.registrationId,
      participantId: params.participantId,
      physicalQrId: params.physicalQrId,
      result: 'SUCCESS',
      reason: 'Campus check-in confirmed',
    });

    syncToGoogleSheets({
      action: 'syncCampusCheckin',
      registrationId: params.participantId,
      physicalQrId: params.physicalQrId,
      station,
      verifiedBy: params.staffId,
      campusStatus: 'Present',
    });

    return {
      state: 'SUCCESS',
      verbatimMessage: '✓ PRESENT',
      timestamp: now,
      details: `Campus check-in recorded at ${station}`,
    };
  },

  /**
   * Check if participant is already marked present for a specific event
   */
  async checkEventAttendance(params: {
    participantId: string;
    eventId: string;
  }): Promise<{
    isPresent: boolean;
    checkinTime?: string;
    station?: string;
    checkedInBy?: string;
  }> {
    const cleanEventId = params.eventId.trim().toUpperCase();
    const eventLogs = getLocalArray<any>(STORAGE_KEYS.EVENT_ATTENDANCE);
    const existingLocal = eventLogs.find(
      (el) =>
        (el.participantId === params.participantId || el.registrationId === params.participantId) &&
        el.eventId.toUpperCase() === cleanEventId
    );

    if (existingLocal) {
      return {
        isPresent: true,
        checkinTime: existingLocal.checkinTime,
        station: existingLocal.station,
        checkedInBy: existingLocal.checkinBy,
      };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: logs } = await supabase
          .from('attendance_logs')
          .select('*')
          .match({ registration_id: params.participantId, event_id: cleanEventId, attendance_status: 'SUCCESS' })
          .limit(1);

        if (logs && logs.length > 0) {
          return {
            isPresent: true,
            checkinTime: logs[0].scan_timestamp || `${logs[0].attendance_date} ${logs[0].attendance_time}`,
            station: logs[0].attendance_location,
            checkedInBy: logs[0].verified_by,
          };
        }
      } catch (err) {
        console.warn('Supabase checkEventAttendance lookup notice:', err);
      }
    }

    return { isPresent: false };
  },

  /**
   * Mark Event Attendance at Event Desk (Enforces event registration eligibility & idempotency)
   */
  async markEventPresent(params: {
    eventId: string;
    physicalQrId: string;
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

    if (!cleanQr) {
      return {
        state: 'INVALID_QR',
        verbatimMessage: 'INVALID QR',
        details: 'QR code cannot be empty',
      };
    }

    // Lookup event title
    const eventMeta = OFFICIAL_EVENTS.find((e) => e.eventId.toUpperCase() === eventId);
    const eventTitle = eventMeta?.title || eventId;

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
        participantId: participant.id,
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
        (el.participantId === participant.id || el.registrationId === participant.registrationId) &&
        el.eventId.toUpperCase() === eventId
    );

    if (existing) {
      await this.logAudit({
        staffUser: params.staffId,
        station,
        operation: 'EVENT_CHECKIN',
        registrationId: participant.registrationId,
        participantId: participant.id,
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

    // Update Supabase event_registrations and attendance_logs if live
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('attendance_logs').insert([
          {
            attendance_id: 'AUD-EVT-' + Math.random().toString(36).substring(2, 9),
            registration_id: participant.id,
            participant_name: participant.participantName,
            event_id: eventId,
            event_name: eventTitle,
            event_type: 'EVENT_CHECKIN',
            attendance_date: now.split('T')[0],
            attendance_time: new Date(now).toLocaleTimeString('en-US'),
            attendance_location: station,
            attendance_status: 'SUCCESS',
            participation_status: 'Present',
            verified_by: params.staffId,
            qr_token: cleanQr,
            scan_timestamp: now,
          },
        ]);
        await supabase
          .from('event_registrations')
          .update({ attendance_status: 'Present', participation_status: 'Present' })
          .match({ registration_id: participant.registrationId, event_id: eventId });
      } catch (err) {
        console.warn('Supabase event check-in write notice:', err);
      }
    }

    await this.logAudit({
      staffUser: params.staffId,
      station,
      operation: 'EVENT_CHECKIN',
      registrationId: participant.registrationId,
      participantId: participant.id,
      participantName: participant.participantName,
      eventId,
      eventName: eventTitle,
      physicalQrId: cleanQr,
      result: 'SUCCESS',
      reason: params.isAdminOverride ? `Admin Override: ${params.overrideReason}` : 'Event check-in verified',
    });

    syncToGoogleSheets({
      action: 'markAttendance',
      registrationId: participant.id,
      participantId: participant.id,
      participantName: participant.participantName,
      physicalQrId: cleanQr,
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
      participantName: participant.participantName,
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
   * Fetch Per-Participant Operational Summary (Instant calculation without ad-hoc loops)
   */
  async getParticipantOperationalSummary(options?: {
    teamName?: string;
    limit?: number;
  }): Promise<ParticipantOperationalSummary[]> {
    const limit = options?.limit || 50;
    const summaries: ParticipantOperationalSummary[] = [];

    // Check if view exists in Supabase
    if (isSupabaseConfigured()) {
      try {
        let q = supabase.from('participant_operational_summary').select('*').limit(limit);
        if (options?.teamName) {
          q = q.ilike('team_name', `%${options.teamName}%`);
        }
        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            participantId: d.participant_id,
            registrationId: d.registration_id,
            teamId: d.team_name,
            fullName: d.full_name,
            email: d.email,
            mobileNumber: d.mobile_number,
            college: d.college,
            department: d.department,
            physicalQrId: d.physical_qr_id,
            qrStatus: d.qr_status || (d.physical_qr_id ? 'ASSIGNED' : 'UNASSIGNED'),
            campusCheckinTime: d.campus_checkin_time,
            campusPresent: !!d.campus_present,
            totalRegisteredEvents: d.total_registered_events || 0,
            totalEventsAttended: d.total_events_attended || 0,
            foodDeliveredTime: d.food_delivered_time,
            foodDelivered: !!d.food_delivered,
          }));
        }
      } catch (err) {
        console.warn('View participant_operational_summary notice:', err);
      }
    }

    // Dynamic derivation from overall_registrations + attendance_logs
    const participants = await this.searchParticipants('', limit);
    for (const p of participants) {
      if (options?.teamName && p.teamName?.toLowerCase() !== options.teamName.toLowerCase()) {
        continue;
      }
      summaries.push({
        participantId: p.id,
        registrationId: p.registrationId,
        teamId: p.teamName,
        fullName: p.participantName,
        email: p.email,
        mobileNumber: p.mobile,
        college: p.college,
        department: p.department,
        physicalQrId: p.physicalQrId,
        qrStatus: p.physicalQrId ? 'ASSIGNED' : 'UNASSIGNED',
        campusCheckinTime: p.campusCheckinTime,
        campusPresent: p.campusAttendanceStatus === 'Present',
        totalRegisteredEvents: p.selectedEvents.length,
        totalEventsAttended: p.registeredEvents.filter((re) => re.attendanceStatus === 'Present').length,
        foodDeliveredTime: p.foodDeliveredTime,
        foodDelivered: p.foodDelivered,
      });
    }

    return summaries;
  },

  /**
   * Fetch Event Attendance Summary (Live rollups per event)
   */
  async getEventAttendanceSummary(): Promise<EventAttendanceSummary[]> {
    const stats = await this.getLiveStats();
    return OFFICIAL_EVENTS.map((e) => {
      const m = stats.perEventMetrics[e.eventId.toUpperCase()] || {
        registered: 0,
        present: 0,
        absent: 0,
        attendancePct: 0,
      };
      return {
        eventId: e.eventId,
        eventName: e.title,
        category: e.category,
        totalRegistered: m.registered,
        totalPresent: m.present,
        totalAbsent: m.absent,
        attendancePercentage: m.attendancePct,
      };
    });
  },

  /**
   * Fetch Team Operational Summary (Readiness & check-in metrics grouped by team)
   */
  async getTeamOperationalSummary(): Promise<TeamOperationalSummary[]> {
    const participants = await this.searchParticipants('', 30);
    const teamMap = new Map<string, ParticipantProfile[]>();

    participants.forEach((p) => {
      if (p.teamName) {
        const list = teamMap.get(p.teamName) || [];
        list.push(p);
        teamMap.set(p.teamName, list);
      }
    });

    const results: TeamOperationalSummary[] = [];
    teamMap.forEach((members, teamName) => {
      results.push({
        teamName,
        totalMembers: members.length,
        membersCampusCheckedIn: members.filter((m) => m.campusAttendanceStatus === 'Present').length,
        membersQrAssigned: members.filter((m) => !!m.physicalQrId).length,
        membersFoodDelivered: members.filter((m) => m.foodDelivered).length,
      });
    });

    return results;
  },

  /**
   * Search participants with filters (Parallelized lookup)
   */
  async searchParticipants(searchTerm: string, limit: number = 25): Promise<ParticipantProfile[]> {
    const q = searchTerm.trim().toLowerCase();
    const results: ParticipantProfile[] = [];
    const seenIds = new Set<string>();

    // 1. Check local mock registrations first
    const mockRegs = getLocalArray<any>('evoxis26_overall_registrations');
    const matchedMockIds: string[] = [];
    for (const r of mockRegs) {
      const regId = r.registrationId || r.registration_id;
      const pName = r.participantName || r.participant_name || '';
      const email = r.email || '';
      const tName = r.teamName || r.team_name || '';
      if (
        !q ||
        pName.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        regId.toLowerCase().includes(q) ||
        tName.toLowerCase().includes(q)
      ) {
        if (!seenIds.has(regId)) {
          seenIds.add(regId);
          matchedMockIds.push(regId);
        }
      }
    }

    if (matchedMockIds.length > 0) {
      const mockProfiles = await Promise.all(
        matchedMockIds.slice(0, limit).map((id) => this.lookupRegistration({ queryStr: id }))
      );
      mockProfiles.forEach((p) => {
        if (p.data) results.push(p.data);
      });
    }

    // 2. Query Supabase overall_registrations if needed
    if (isSupabaseConfigured() && results.length < limit) {
      try {
        let query = supabase.from('overall_registrations').select('*').limit(limit - results.length);
        if (q) {
          query = query.or(
            `participant_name.ilike.%${q}%,email.ilike.%${q}%,mobile_number.ilike.%${q}%,registration_id.ilike.%${q}%,team_name.ilike.%${q}%`
          );
        }
        const { data } = await query;
        if (data) {
          const newIds = data.map((d: any) => d.registration_id).filter((id: string) => !seenIds.has(id));
          newIds.forEach((id: string) => seenIds.add(id));
          const dbProfiles = await Promise.all(
            newIds.map((id: string) => this.lookupRegistration({ queryStr: id }))
          );
          dbProfiles.forEach((p) => {
            if (p.data) results.push(p.data);
          });
        }
      } catch (e) {
        console.warn('Search participants Supabase fallback:', e);
      }
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
          qrId: qrCode,
          qrCode,
          qrType: type,
          environment: env,
          status: 'UNUSED',
          registrationId: undefined,
          participantId: undefined,
          participantName: undefined,
          email: undefined,
          mobileNumber: undefined,
          college: undefined,
          department: undefined,
          year: undefined,
          gender: undefined,
          registrationType: undefined,
          selectedEvents: undefined,
          totalEvents: 0,
          paymentStatus: undefined,
          campusStatus: undefined,
          foodStatus: undefined,
          assignedAt: undefined,
          assignedBy: undefined,
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
              qr_id: it.qrCode,
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

      // Sync pre-generation to Google Sheets
      syncToGoogleSheets({
        action: 'generateQrInventory',
        environment: env,
        count,
        qrType: type,
      });
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
