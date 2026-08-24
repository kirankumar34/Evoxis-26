export type StaffRole = 'SUPER_ADMIN' | 'RECEPTION' | 'EVENT_COORDINATOR' | 'FOOD_COUNTER';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  assignedStation?: string;
  assignedEventIds?: string[];
  token?: string;
}

export type EventCategory = 'Technical' | 'Non-Technical' | 'Special';
export type EventType = 'Individual' | 'Team' | 'Both';

export interface EventMaster {
  eventId: string;
  title: string;
  category: EventCategory;
  type: EventType;
  teamSize?: string;
  venue?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: number;
}

export type ParticipantRole = 'TEAM_HEAD' | 'TEAM_MEMBER' | 'INDIVIDUAL';

export interface TeamMemberInfo {
  name: string;
  email: string;
  phone: string;
  college?: string;
  department?: string;
  year?: string;
  gender?: string;
  role: ParticipantRole;
}

export interface RegisteredEventInfo {
  eventId: string;
  eventName: string;
  category: EventCategory;
  attendanceStatus: 'Pending' | 'Present' | 'Absent';
  checkinTime?: string;
  station?: string;
}

export interface ParticipantProfile {
  id: string; // Internal UUID or participant ID
  registrationId: string;
  participantName: string;
  email: string;
  mobile: string;
  college: string;
  department: string;
  year: string;
  gender: string;
  registrationType: 'Individual' | 'Team';
  role: ParticipantRole;
  teamName?: string;
  teamMembers?: TeamMemberInfo[];
  selectedEvents: string[];
  registeredEvents: RegisteredEventInfo[];
  
  // Operational State
  digitalQrToken: string;
  physicalQrId?: string;
  physicalQrType?: 'ID_CARD' | 'WRISTBAND';
  physicalQrAssignedAt?: string;
  
  campusAttendanceStatus: 'Pending' | 'Present';
  campusCheckinTime?: string;
  campusCheckinBy?: string;
  campusStation?: string;

  foodDelivered: boolean;
  foodDeliveredTime?: string;
  foodDeliveredBy?: string;
  foodStation?: string;
}

export type ScanResultState =
  | 'SUCCESS'
  | 'DUPLICATE_CAMPUS'
  | 'DUPLICATE_EVENT'
  | 'DUPLICATE_FOOD'
  | 'INVALID_QR'
  | 'WRONG_EVENT'
  | 'UNASSIGNED_QR'
  | 'NOT_FOUND'
  | 'QR_CONFLICT'
  | 'OFFLINE_ERROR';

export interface ScanOperationResponse {
  state: ScanResultState;
  verbatimMessage: string;
  details?: string;
  participant?: ParticipantProfile;
  timestamp?: string;
  registeredEvents?: string[]; // for WRONG_EVENT scenario
  originalTime?: string;
  originalStation?: string;
}

export interface PhysicalQrAssignment {
  id: string;
  physicalQrId: string;
  physicalQrType: 'ID_CARD' | 'WRISTBAND';
  participantId: string;
  registrationId: string;
  assignedAt: string;
  assignedBy: string;
  active: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  staffUser: string;
  station: string;
  operation: 'QR_ASSIGNMENT' | 'CAMPUS_CHECKIN' | 'EVENT_CHECKIN' | 'FOOD_DELIVERY' | 'ADMIN_OVERRIDE';
  participantId?: string;
  registrationId?: string;
  participantName?: string;
  physicalQrId?: string;
  eventId?: string;
  eventName?: string;
  result: 'SUCCESS' | 'DUPLICATE' | 'DENIED' | 'ERROR';
  reason?: string;
}

export interface LiveDashboardMetrics {
  totalRegistered: number;
  campusPresent: number;
  campusAbsent: number;
  qrAssigned: number;
  qrUnassigned: number;
  foodDelivered: number;
  foodPending: number;
  eventRegistrationsTotal: number;
  eventAttendanceTotal: number;
  activeScanners: number;
  recentScans: AuditLogEntry[];
  recentErrors: AuditLogEntry[];
  duplicateAttemptsCount: number;
  perEventMetrics: Record<string, {
    registered: number;
    present: number;
    absent: number;
    attendancePct: number;
  }>;
}
