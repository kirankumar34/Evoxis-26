export type EventCategory = 'Technical' | 'Non-Technical' | 'Special Event';

export type EventId =
  | 'TE01' | 'TE02' | 'TE03' | 'TE04' | 'TE05' | 'TE06'
  | 'NT01' | 'NT02' | 'NT03' | 'NT04' | 'NT05' | 'NT06' | 'NT07' | 'NT08' | 'NT09'
  | 'SP01' | 'SP02' | 'SP03' | 'SP04'
  | string;

export type ParticipationStatus =
  | 'Registered'
  | 'Present'
  | 'Participated'
  | 'Absent'
  | 'Disqualified'
  | 'Cancelled';

export type OverallAttendanceStatus = 'Pending' | 'Present' | 'Absent';

export interface CoordinatorContact {
  name: string;
  role: string;
  department: string;
  phone: string;
  whatsapp?: string;
  email?: string;
}

export interface EventRound {
  roundNumber: number;
  title: string;
  description: string;
  duration?: string;
}

export interface EventItem {
  id: string;
  eventId: EventId;
  sheetSlug: string;
  title: string;
  category: EventCategory;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  teamSize: {
    min: number;
    max: number;
    description: string;
  };
  rounds: EventRound[];
  rules: string[];
  judgingCriteria: string[];
  prizes: {
    Prize: string;
    allParticipants?: string;
  };
  coordinators: CoordinatorContact[];
  schedule: {
    date: string;
    timeSlot: string;
    venue: string;
  };
  featuredTag?: string;
  iconName: string;
  accentColor?: string;
}

export interface DepartmentInfo {
  id: string;
  shortCode: string;
  fullName: string;
  logoUrl: string;
  accentColor: string;
  hodName?: string;
  tagline?: string;
  description?: string;
  icon?: string;
  stats?: { label: string; value: string }[];
}

export interface ScheduleItem {
  id: string;
  timeSlot: string;
  title: string;
  category: 'Ceremony' | 'Technical' | 'Non-Technical' | 'Special' | 'Break';
  venue: string;
  description: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Registration' | 'Events' | 'Hospitality';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  imageGradient: string;
  aspect: string;
}

export interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college?: string;
  department: string;
  year?: string;
  gender?: string;
  role?: 'TEAM_HEAD' | 'TEAM_MEMBER' | 'INDIVIDUAL';
  registrationId?: string;
  qrToken?: string;
}

export const REFERRAL_SOURCES = [
  'School Friend',
  'College Friend',
  'College Staff',
  'Instagram Post',
  'By College',
  'Other Social Media Platform',
  'Other',
] as const;

export type ReferralSourceOption = (typeof REFERRAL_SOURCES)[number];

export interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  collegeName: string;
  department: string;
  yearOfStudy: string;
  gender?: string;
  selectedEventIds: EventId[];
  isTeam?: boolean;
  teamName?: string;
  teamMembers?: TeamMember[];
  referralSource?: string;
  referralSourceOther?: string;
  /** UPI transaction/reference ID entered by participant after payment */
  upiTransactionId?: string;
  /** Public URL of the screenshot uploaded to Supabase Storage */
  paymentScreenshotUrl?: string;
  agreedToRules: boolean;
}

// -------------------------------------------------------------
// Google Sheets Database Models (Section 2 - 7 of prompt2.md)
// -------------------------------------------------------------

export interface OverallRegistrationRecord {
  registrationId: string; // e.g. "EVOXIS26-00025"
  registrationDate: string;
  registrationTime: string;
  participantName: string;
  email: string;
  mobileNumber: string;
  collegeInstitution: string;
  department: string;
  year: string;
  gender: string;
  registrationType: 'Individual' | 'Team' | 'Mixed';
  selectedEvents: string; // Comma-separated Event IDs: "TE01, NT05, SP02"
  totalEvents: number;
  totalAmount: number;
  paymentStatus: 'Free' | 'Paid' | 'Pending';
  qrToken: string; // HMAC token e.g. "EVOXIS26:a8f9..."
  qrStatus: 'Active' | 'Revoked';
  referralSource?: string;
  referralSourceOther?: string;
  emailStatus: 'Sent' | 'Failed' | 'Pending';
  smsStatus: 'Sent' | 'Failed' | 'Pending' | 'Disabled';
  whatsappStatus: 'Sent' | 'Failed' | 'Pending' | 'Disabled';
  overallAttendanceStatus: OverallAttendanceStatus;
  registrationStatus: 'Confirmed' | 'Cancelled';
  teamName?: string;
  teamMembers?: TeamMember[];
  /** UPI transaction/reference ID provided by participant */
  upiTransactionId?: string;
  /** Supabase Storage public URL of the payment screenshot */
  paymentScreenshotUrl?: string;
}

export interface CategoryRegistrationRecord {
  registrationId: string;
  participantName: string;
  email: string;
  mobile: string;
  college: string;
  department: string;
  eventId: EventId;
  eventName: string;
  registrationDate: string;
  qrToken: string;
  attendanceStatus: 'Pending' | 'Present' | 'Absent';
  participationStatus: ParticipationStatus;
  teamName?: string;
}

export interface AttendanceLogRecord {
  attendanceId: string;
  registrationId: string;
  participantName: string;
  eventId: string; // e.g. "RECEPTION", "TE01", "SP02"
  eventName: string;
  eventType: string; // "Reception Check-In" | "Technical" | "Non-Technical" | "Special"
  attendanceDate: string;
  attendanceTime: string;
  attendanceLocation: string; // e.g. "Main Reception Desk", "Lab 3 Desk"
  attendanceStatus: 'Present' | 'Absent';
  participationStatus: ParticipationStatus;
  verifiedBy: string;
  qrToken: string;
  scanTimestamp: string;
}

export interface NotificationLogRecord {
  notificationId: string;
  registrationId: string;
  participant: string;
  eventId: string;
  notificationType: 'Registration Confirmation' | 'Event Reminder' | 'Broadcast';
  channel: 'Email' | 'SMS' | 'WhatsApp';
  recipient: string;
  messageType: 'Transactional' | 'Template';
  sentDate: string;
  sentTime: string;
  status: 'Delivered' | 'Sent' | 'Failed';
  providerResponse: string;
  errorMessage?: string;
  retryCount: number;
}

export interface EventMasterRecord {
  eventId: EventId;
  eventName: string;
  category: EventCategory;
  type: 'Individual' | 'Team' | 'Individual/Team';
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: string | number;
  regOpen: boolean;
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  reminderEnabled: boolean;
}

export interface SystemConfig {
  LAST_REGISTRATION_SEQUENCE: number;
  EVENT_DATE_START: string;
  EVENT_DATE_END: string;
  REMINDER_SEND_TIME: string;
  ORGANIZER_CONTACT_EMAIL: string;
  ORGANIZER_CONTACT_PHONE: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'REGISTRATION_COMMITTEE' | 'EVENT_COORDINATOR';

export interface AdminUser {
  username: string;
  name: string;
  role: AdminRole;
  assignedEventId?: EventId; // Scoped event desk for EVENT_COORDINATOR
}

export interface QRValidationResponse {
  success: boolean;
  registrationId?: string;
  participantName?: string;
  college?: string;
  department?: string;
  year?: string;
  email?: string;
  mobile?: string;
  overallAttendanceStatus?: OverallAttendanceStatus;
  registrationDate?: string;
  events?: {
    eventId: EventId;
    eventName: string;
    category: EventCategory;
    attendanceStatus: 'Pending' | 'Present' | 'Absent';
    participationStatus: ParticipationStatus;
  }[];
  errorMessage?: string;
}

export interface EventDeskValidationResponse {
  success: boolean;
  registered: boolean;
  alreadyPresent: boolean;
  priorCheckInTimestamp?: string;
  participant?: {
    registrationId: string;
    participantName: string;
    college: string;
    department: string;
    year: string;
    email: string;
    mobile: string;
    eventId: EventId;
    eventName: string;
    category: EventCategory;
    attendanceStatus: 'Pending' | 'Present' | 'Absent';
    participationStatus: ParticipationStatus;
  };
  errorMessage?: string;
}

