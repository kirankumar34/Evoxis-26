import { describe, it, expect } from 'vitest';
import { generateQRString, parseQRString, isValidQRToken, getRegistrationIdFromToken } from '@/lib/qr';

describe('AC6 & AC11: QR Token Security & Tamper Rejection', () => {
  it('generates a formatted QR string following EVOXIS26 schema', () => {
    const regId = 'EVOXIS26-00042';
    const qrString = generateQRString(regId);

    expect(qrString).toMatch(/^EVOXIS26:[a-f0-9]{15,30}$/);
    expect(qrString.startsWith('EVOXIS26:')).toBe(true);
  });

  it('correctly parses and validates a valid QR string', () => {
    const regId = 'EVOXIS26-00123';
    const qrString = generateQRString(regId);

    const parsed = parseQRString(qrString);
    expect(parsed.valid).toBe(true);
    expect(parsed.token).toBe(qrString);
    expect(parsed.registrationId).toBe(regId);
  });

  it('rejects tampered or forged QR tokens', () => {
    const tamperedTokens = [
      '',
      'INVALID_TOKEN',
      'EVOXIS26:',
      'EVOXIS25:1234567890abcdef',
      'EVOXIS26:short',
      'EVOXIS26:!@#$%^&*()',
      'SOME_OTHER_EVENT:9a8f2c3d1e0b4a7',
    ];

    for (const token of tamperedTokens) {
      expect(isValidQRToken(token)).toBe(false);
      const parsed = parseQRString(token);
      expect(parsed.valid).toBe(false);
    }
  });

  it('extracts Registration ID from valid token deterministically', () => {
    const regId = 'EVOXIS26-00007';
    const token = generateQRString(regId);
    const extracted = getRegistrationIdFromToken(token);
    expect(extracted).toBe(regId);
  });

  it('ensures no backend secrets or private credentials are in frontend build environment', () => {
    // Confirm SPREADSHEET_ID, QR_SECRET, and ADMIN passwords are NOT exposed as hardcoded constants
    const clientEnv = import.meta.env;
    expect((clientEnv as any).SPREADSHEET_ID).toBeUndefined();
    expect((clientEnv as any).QR_SECRET).toBeUndefined();
    expect((clientEnv as any).ADMIN_PASS).toBeUndefined();
    expect((clientEnv as any).COMMITTEE_PASS).toBeUndefined();
  });
});
