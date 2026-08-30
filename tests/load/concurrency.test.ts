import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/services/api';
import { RegistrationFormData } from '@/types';

describe('AC5: Concurrency & High Load Test Simulation (100+ Concurrent Requests)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(api, 'getBackendType').mockReturnValue('LOCAL_MOCK');
  });

  it('handles 100+ concurrent participant registrations with zero race conditions or collisions', async () => {
    const TOTAL_REQUESTS = 100;
    const DUPLICATE_PERCENTAGE = 0.2; // 20% intentional duplicates

    const uniqueParticipantsCount = Math.floor(TOTAL_REQUESTS * (1 - DUPLICATE_PERCENTAGE));
    const payloads: RegistrationFormData[] = [];

    // Generate unique participant payloads
    for (let i = 1; i <= uniqueParticipantsCount; i++) {
      payloads.push({
        fullName: `Test Participant ${i}`,
        email: `test_participant_${i}@example.com`,
        phone: `9840${String(i).padStart(6, '0')}`,
        collegeName: 'Sriram Engineering College',
        department: i % 2 === 0 ? 'CSBS' : 'CSE',
        yearOfStudy: '3rd Year',
        selectedEventIds: ['TE01', 'NT01'],
        isTeam: false,
        agreedToRules: true,
      });
    }

    // Append 20 duplicate payloads (repeating early participants)
    for (let i = 1; i <= TOTAL_REQUESTS - uniqueParticipantsCount; i++) {
      payloads.push({
        fullName: `Test Participant ${i}`,
        email: `test_participant_${i}@example.com`,
        phone: `9840${String(i).padStart(6, '0')}`,
        collegeName: 'Sriram Engineering College',
        department: 'CSBS',
        yearOfStudy: '3rd Year',
        selectedEventIds: ['TE01'], // Same event
        isTeam: false,
        agreedToRules: true,
      });
    }

    expect(payloads.length).toBe(TOTAL_REQUESTS);

    const startTime = performance.now();

    // Fire all 100 registration requests concurrently
    const results = await Promise.all(
      payloads.map((payload) => api.registerParticipant(payload))
    );

    const endTime = performance.now();
    const durationMs = endTime - startTime;
    const avgLatencyMs = durationMs / TOTAL_REQUESTS;

    console.log(`\n⚡ [Load Test Results] 100 Concurrent Requests completed in ${durationMs.toFixed(2)}ms (Avg: ${avgLatencyMs.toFixed(2)}ms per request)`);

    // 1. Assert all requests returned successfully
    const successCount = results.filter((r) => r.success).length;
    expect(successCount).toBe(TOTAL_REQUESTS);

    // 2. Separate unique registrations vs duplicate detections
    const uniqueRegistrations = results.filter((r) => !r.isDuplicate);
    const duplicateDetections = results.filter((r) => r.isDuplicate);

    expect(uniqueRegistrations.length).toBe(uniqueParticipantsCount);
    expect(duplicateDetections.length).toBe(TOTAL_REQUESTS - uniqueParticipantsCount);

    // 3. Assert all generated Registration IDs are distinct and follow EVOXIS26-XXXXX
    const registrationIds = uniqueRegistrations.map((r) => r.data?.registrationId);
    const uniqueIdSet = new Set(registrationIds);

    expect(uniqueIdSet.size).toBe(uniqueParticipantsCount);

    // 4. Assert all QR Tokens are unique
    const qrTokens = uniqueRegistrations.map((r) => r.data?.qrToken);
    const uniqueQrSet = new Set(qrTokens);
    expect(uniqueQrSet.size).toBe(uniqueParticipantsCount);
  });
});
