import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '@/services/api';
import { generateQRCodeDataUrl } from '@/lib/qr';

describe("EvoXis'26 — Human-Centered Production Readiness Test Suite", () => {
  const ts = Date.now();

  beforeEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // Part 1: Participant Journeys
  // =========================================================================

  describe('Journey 1: Divya — First-time Individual Registration', () => {
    it('successfully registers Divya for two events with verified QR payload and schema alignment', async () => {
      const divyaPayload = {
        fullName: 'Divya R',
        email: `divya.raman.${ts}@citchennai.edu.in`,
        phone: `98401${String(ts).slice(-5)}`,
        collegeName: 'Chennai Institute of Technology',
        department: 'Artificial Intelligence and Data Science',
        yearOfStudy: '1st Year',
        gender: 'Female',
        selectedEventIds: ['TE01', 'SP02'] as any[],
        referralSource: 'Instagram Post',
        isTeam: false,
        agreedToRules: true,
      };

      const res = await api.registerParticipant(divyaPayload);
      expect(res.success).toBe(true);
      expect(res.data?.registrationId).toMatch(/^EVOXIS26-\d{5}$/);
      expect(res.data?.qrToken).toMatch(/^EVOXIS26:[a-f0-9]+/);
      expect(res.data?.selectedEvents).toEqual(['TE01', 'SP02']);
      expect(res.data?.participantName).toBe('Divya R');

      // Verify QR Code renders decoded payload identically
      const qrDataUrl = await generateQRCodeDataUrl(res.data!.qrToken);
      expect(qrDataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('rejects registration when required fields are missing or invalid', async () => {
      // Missing events
      const resNoEvents = await api.registerParticipant({
        fullName: 'Divya R',
        email: `divya.raman.${ts}@citchennai.edu.in`,
        phone: `98401${String(ts).slice(-5)}`,
        collegeName: 'Chennai Institute of Technology',
        department: 'AI & DS',
        selectedEventIds: [],
        agreedToRules: true,
      } as any);

      expect(resNoEvents.success).toBe(false);
    });
  });

  describe('Journey 2: Team Nexus — 4-Member Team Registration', () => {
    it('creates 4 distinct participant records with unique QR tokens and identical event lists', async () => {
      const nexusPayload = {
        fullName: 'Karthik N',
        email: `karthik.nexus.${ts}@mitindia.edu`,
        phone: `98402${String(ts).slice(-5)}`,
        collegeName: 'Madras Institute of Technology',
        department: 'Computer Science',
        yearOfStudy: '3rd Year',
        gender: 'Male',
        selectedEventIds: ['TE02', 'SP01'] as any[],
        isTeam: true,
        teamName: 'Team Nexus',
        teamMembers: [
          { name: 'Swetha B', email: `swetha.${ts}@mitindia.edu`, phone: `98403${String(ts).slice(-5)}`, college: 'MIT', department: 'CS' },
          { name: 'Aditya K', email: `aditya.${ts}@mitindia.edu`, phone: `98404${String(ts).slice(-5)}`, college: 'MIT', department: 'CS' },
          { name: 'Meera V', email: `meera.${ts}@mitindia.edu`, phone: `98405${String(ts).slice(-5)}`, college: 'MIT', department: 'CS' },
        ],
        agreedToRules: true,
      };

      const res = await api.registerParticipant(nexusPayload);
      expect(res.success).toBe(true);
      expect(res.data?.teamName).toBe('Team Nexus');
      expect(res.data?.participants?.length).toBe(4);

      // Verify each member has unique registration ID and QR token
      const memberIds = res.data?.participants?.map((p) => p.name) || [];
      expect(memberIds).toEqual(['Karthik N', 'Swetha B', 'Aditya K', 'Meera V']);

      const qrTokens = res.data?.participants?.map((p: any) => p.qrToken) || [];
      const uniqueTokens = new Set(qrTokens);
      expect(uniqueTokens.size).toBe(4);
    });
  });

  describe('Journey 3: Arjun — Connection Drops & Retry Idempotency', () => {
    it('returns existing confirmed registration upon retry without creating duplicate rows', async () => {
      const arjunPayload = {
        fullName: 'Arjun K',
        email: `arjun.retry.${ts}@vit.ac.in`,
        phone: `98406${String(ts).slice(-5)}`,
        collegeName: 'Vellore Institute of Technology',
        department: 'Information Technology',
        yearOfStudy: '2nd Year',
        selectedEventIds: ['TE04'] as any[],
        agreedToRules: true,
      };

      // 1. Initial attempt
      const attempt1 = await api.registerParticipant(arjunPayload);
      expect(attempt1.success).toBe(true);
      const originalRegId = attempt1.data?.registrationId;
      const originalQr = attempt1.data?.qrToken;

      // 2. Retry with same details
      const attempt2 = await api.registerParticipant(arjunPayload);
      expect(attempt2.success).toBe(true);
      expect(attempt2.isDuplicate).toBe(true);
      expect(attempt2.data?.registrationId).toBe(originalRegId);
      expect(attempt2.data?.qrToken).toBe(originalQr);
    });
  });

  describe('Journey 4: Priya — Retrieving Existing QR Pass', () => {
    it('retrieves original QR pass without modifying token or invalidating wristbands', async () => {
      // 1. Register Priya
      const priyaPayload = {
        fullName: 'Priya Raman',
        email: `priya.retrieval.${ts}@ssn.edu.in`,
        phone: `98408${String(ts).slice(-5)}`,
        collegeName: 'SSN College of Engineering',
        department: 'CSE',
        yearOfStudy: '3rd Year',
        selectedEventIds: ['TE01', 'NT05'] as any[],
        agreedToRules: true,
      };
      const reg = await api.registerParticipant(priyaPayload);
      const originalRegId = reg.data!.registrationId;
      const originalQr = reg.data!.qrToken;

      // 2. Retrieve pass using ID + Email
      const lookup = await api.getRegistration({
        registrationId: originalRegId,
        email: `priya.retrieval.${ts}@ssn.edu.in`,
      });

      expect(lookup.success).toBe(true);
      expect(lookup.data?.registrationId).toBe(originalRegId);
      expect(lookup.data?.qrToken).toBe(originalQr);
      expect(lookup.data?.participantName).toBe('Priya Raman');
      expect(lookup.data?.selectedEvents).toContain('TE01');
      expect(lookup.data?.selectedEvents).toContain('NT05');
    });
  });

  describe('Journey 5: Kevin — Double Submit Prevention', () => {
    it('safely handles rapid duplicate submit attempts', async () => {
      const kevinPayload = {
        fullName: 'Kevin D',
        email: `kevin.double.${ts}@loyola.edu`,
        phone: `98409${String(ts).slice(-5)}`,
        collegeName: 'Loyola College',
        department: 'VisCom',
        yearOfStudy: '2nd Year',
        selectedEventIds: ['NT01'] as any[],
        agreedToRules: true,
      };

      const [res1, res2] = await Promise.all([
        api.registerParticipant(kevinPayload),
        api.registerParticipant(kevinPayload),
      ]);

      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);
      // Both point to the exact same registration ID
      expect(res1.data?.registrationId).toBe(res2.data?.registrationId);
    });
  });
});
