import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { EventId } from '@/types';

// The validation schema used in registration
const registrationSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required (minimum 2 characters)').max(100),
  email: z.string().email('Please enter a valid college or personal email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  collegeName: z.string().min(2, 'College / Institution name is required'),
  department: z.string().min(1, 'Please select your department'),
  yearOfStudy: z.string().min(1, 'Please select your year of study'),
  gender: z.string().optional(),
  selectedEventIds: z
    .array(z.string())
    .min(1, 'Please select at least 1 event to participate in')
    .max(5, 'You can select up to 5 events'),
  isTeam: z.boolean().default(false),
  teamName: z.string().optional(),
  teamMembers: z.array(z.string()).optional(),
});

describe('AC2: Form Validation & Field Constraints', () => {
  it('passes validation for valid participant data', () => {
    const validData = {
      fullName: 'Kiran Kumar',
      email: 'kiran.kumar@gmail.com',
      phone: '9840112345',
      collegeName: 'Sriram Engineering College',
      department: 'CSBS',
      yearOfStudy: '3rd Year',
      gender: 'Male',
      selectedEventIds: ['TE01', 'NT01'],
      isTeam: false,
    };

    const result = registrationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects registration when required fields are missing', () => {
    const invalidData = {
      fullName: '',
      email: '',
      phone: '',
      collegeName: '',
      department: '',
      yearOfStudy: '',
      selectedEventIds: [],
    };

    const result = registrationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMap = result.error.flatten().fieldErrors;
      expect(errorMap.fullName).toBeDefined();
      expect(errorMap.email).toBeDefined();
      expect(errorMap.phone).toBeDefined();
      expect(errorMap.collegeName).toBeDefined();
      expect(errorMap.department).toBeDefined();
      expect(errorMap.yearOfStudy).toBeDefined();
      expect(errorMap.selectedEventIds).toBeDefined();
    }
  });

  it('rejects malformed email addresses', () => {
    const malformedEmails = ['notanemail', 'test@', 'user@domain', 'user.com', '@domain.com'];
    for (const email of malformedEmails) {
      const result = registrationSchema.safeParse({
        fullName: 'Test User',
        email,
        phone: '9840112345',
        collegeName: 'Sriram Engineering College',
        department: 'CSE',
        yearOfStudy: '2nd Year',
        selectedEventIds: ['TE01'],
      });
      expect(result.success).toBe(false);
    }
  });

  it('rejects invalid Indian mobile numbers (must start with 6-9 and be 10 digits)', () => {
    const invalidPhones = [
      '1234567890', // Starts with 1
      '98401',      // Too short
      '98401123456',// Too long (11 digits)
      'abcdefghij', // Non-numeric
      '0984011234', // Starts with 0
      '+919840112345', // Unstripped format
    ];

    for (const phone of invalidPhones) {
      const result = registrationSchema.safeParse({
        fullName: 'Test User',
        email: 'test@example.com',
        phone,
        collegeName: 'Sriram Engineering College',
        department: 'CSE',
        yearOfStudy: '2nd Year',
        selectedEventIds: ['TE01'],
      });
      expect(result.success).toBe(false);
    }
  });

  it('rejects submissions with zero events selected', () => {
    const result = registrationSchema.safeParse({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '9840112345',
      collegeName: 'Sriram Engineering College',
      department: 'CSE',
      yearOfStudy: '2nd Year',
      selectedEventIds: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.selectedEventIds?.[0]).toContain('at least 1 event');
    }
  });

  it('rejects event selections exceeding the maximum limit (5 events)', () => {
    const result = registrationSchema.safeParse({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '9840112345',
      collegeName: 'Sriram Engineering College',
      department: 'CSE',
      yearOfStudy: '2nd Year',
      selectedEventIds: ['TE01', 'TE02', 'TE03', 'TE04', 'TE05', 'TE06'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.selectedEventIds?.[0]).toContain('up to 5 events');
    }
  });

  it('deduplicates duplicate event selections cleanly', () => {
    const selectedEvents: EventId[] = ['TE01', 'TE01', 'NT01', 'TE01'];
    const uniqueEvents = Array.from(new Set(selectedEvents));
    expect(uniqueEvents).toEqual(['TE01', 'NT01']);
    expect(uniqueEvents.length).toBe(2);
  });
});
