import { describe, it, expect } from 'vitest';
import { api } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { generateQRCodeDataUrl } from '@/lib/qr';

describe("EvoXis'26 — Comprehensive API Keys & Live Backend Verification", () => {
  const ts = Date.now();

  describe("1. Supabase Connection & API Key Verification", () => {
    it("successfully connects to Supabase and queries event_master metadata", async () => {
      const { data, error } = await supabase.from('event_master').select('*').limit(16);
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    it("successfully queries system_config parameters", async () => {
      const { data, error } = await supabase.from('system_config').select('*');
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it("verifies read access on overall_registrations and event_registrations", async () => {
      const { count: c1, error: e1 } = await supabase.from('overall_registrations').select('*', { count: 'exact', head: true });
      const { count: c2, error: e2 } = await supabase.from('event_registrations').select('*', { count: 'exact', head: true });
      expect(e1).toBeNull();
      expect(e2).toBeNull();
      expect(typeof c1).toBe('number');
      expect(typeof c2).toBe('number');
    });
  });

  describe("2. Google Apps Script Web App API & Mirror Sync", () => {
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxATuX68Uzi7ozu1OSHQtyKM8m78K66IZ7l42aobpKrTrc7qWegj6vIoM1NGlLajX7F/exec';

    it("pings Google Apps Script Web App successfully", async () => {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'ping' }),
      });
      const json = await res.json();
      expect(res.ok).toBe(true);
      expect(json.success).toBe(true);
      expect(json.message).toContain('online');
    }, 20000);

    it("registers an attendee through Google Apps Script endpoint", async () => {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'registerParticipant',
          fullName: 'GAS Key Tester',
          email: `gas.keytest.${ts}@srmist.edu.in`,
          phone: `98401${String(ts).slice(-5)}`,
          collegeName: 'SRM University',
          department: 'AI & Data Science',
          yearOfStudy: '2nd Year',
          gender: 'Female',
          selectedEventIds: ['TE01', 'NT02'],
          referralSource: 'API Key Test',
          isTeam: false,
          agreedToRules: true,
        }),
      });
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data?.registrationId).toMatch(/^EVOXIS26-\d{5}$/);
      expect(json.data?.qrToken).toBeDefined();
    }, 20000);
  });

  describe("3. Registration Website End-to-End Client Service (api.ts)", () => {
    let createdRegId = '';
    let createdQrToken = '';

    it("executes full registration flow (Individual)", async () => {
      const res = await api.registerParticipant({
        fullName: 'Keerthana Sundar',
        email: `keerthana.${ts}@citchennai.edu.in`,
        phone: `98402${String(ts).slice(-5)}`,
        collegeName: 'Chennai Institute of Technology',
        department: 'Artificial Intelligence and Data Science',
        yearOfStudy: '3rd Year',
        gender: 'Female',
        selectedEventIds: ['TE01', 'NT05'],
        referralSource: 'Department Notice Board',
        isTeam: false,
        agreedToRules: true,
      });

      expect(res.success).toBe(true);
      expect(res.data?.registrationId).toMatch(/^EVOXIS26-\d{5}$/);
      expect(res.data?.qrToken).toMatch(/^EVOXIS26:[a-f0-9]+/);
      createdRegId = res.data!.registrationId;
      createdQrToken = res.data!.qrToken;

      // Verify QR Code renders decoded payload
      const qrDataUrl = await generateQRCodeDataUrl(createdQrToken);
      expect(qrDataUrl).toMatch(/^data:image\/png;base64,/);
    }, 30000);

    it("retrieves registration by Registration ID and Email", async () => {
      expect(createdRegId).toBeTruthy();
      const lookup = await api.getRegistration({
        registrationId: createdRegId,
        email: `keerthana.${ts}@citchennai.edu.in`,
      });

      expect(lookup.success).toBe(true);
      expect(lookup.data?.participantName).toBe('Keerthana Sundar');
      expect(lookup.data?.selectedEvents).toContain('TE01');
    });

    it("retrieves registration by QR Token", async () => {
      expect(createdQrToken).toBeTruthy();
      const lookup = await api.getRegistration({ qrToken: createdQrToken });

      expect(lookup.success).toBe(true);
      expect(lookup.data?.registrationId).toBe(createdRegId);
      expect(lookup.data?.participantName).toBe('Keerthana Sundar');
    });

    it("executes team registration flow (3 Members)", async () => {
      const teamRes = await api.registerParticipant({
        fullName: 'Team Leader Rahul',
        email: `rahul.leader.${ts}@mitindia.edu`,
        phone: `98403${String(ts).slice(-5)}`,
        collegeName: 'MIT India',
        department: 'Computer Science',
        yearOfStudy: '4th Year',
        gender: 'Male',
        selectedEventIds: ['TE02', 'SP01'],
        isTeam: true,
        teamName: 'Titan Squad',
        teamMembers: [
          { name: 'Member Varun', email: `varun.${ts}@mitindia.edu`, phone: `98404${String(ts).slice(-5)}`, college: 'MIT', department: 'CS' },
          { name: 'Member Shruti', email: `shruti.${ts}@mitindia.edu`, phone: `98405${String(ts).slice(-5)}`, college: 'MIT', department: 'CS' },
        ],
        agreedToRules: true,
      });

      expect(teamRes.success).toBe(true);
      expect(teamRes.data?.teamName).toBe('Titan Squad');
      expect(teamRes.data?.participants?.length).toBe(3);
    }, 30000);
  });
});
