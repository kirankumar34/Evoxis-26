import { api } from 'file:///c:/Projects/Evoxis%2026/src/services/api.ts';
import { operationsApi } from 'file:///c:/Projects/Evoxis%2026/Evoxis%20registration/src/services/operationsApi.ts';
import { syncToGoogleSheets } from 'file:///c:/Projects/Evoxis%2026/Evoxis%20registration/src/services/sheetsSync.ts';
import { supabase } from 'file:///c:/Projects/Evoxis%2026/src/lib/supabase.ts';

const testResults = [];

function assertTest(suite, testName, condition, details = '') {
  testResults.push({ suite, testName, passed: Boolean(condition), details });
  const icon = condition ? '✅' : '❌';
  console.log(`${icon} [${suite}] ${testName} ${details ? '— ' + details : ''}`);
}

async function runEndToEndTests() {
  console.log("================================================================================");
  console.log("🚀 EVOXIS'26 — FULL CLIENT SERVICE & LIVE KEY INTEGRATION TEST");
  console.log("================================================================================\n");

  const ts = Date.now();

  // ---------------------------------------------------------------------------
  // 1. REGISTRATION WEBSITE API SERVICE (src/services/api.ts)
  // ---------------------------------------------------------------------------
  console.log("--- 1. REGISTRATION WEBSITE API (Evoxis 26) ---");

  // 1.1 Individual Registration
  const individualPayload = {
    fullName: 'Ananya Sharma',
    email: `ananya.sharma.${ts}@srmist.edu.in`,
    phone: `98401${String(ts).slice(-5)}`,
    collegeName: 'SRM Institute of Science and Technology',
    department: 'Computer Science and Engineering',
    yearOfStudy: '3rd Year',
    gender: 'Female',
    selectedEventIds: ['TE01', 'NT05'],
    referralSource: 'Instagram Post',
    isTeam: false,
    agreedToRules: true,
  };

  const indRes = await api.registerParticipant(individualPayload);
  assertTest(
    'Registration API',
    'Individual Registration Flow',
    indRes.success === true && indRes.data?.registrationId,
    `ID: ${indRes.data?.registrationId} | Token: ${indRes.data?.qrToken?.slice(0, 20)}...`
  );

  const indRegId = indRes.data?.registrationId;
  const indQrToken = indRes.data?.qrToken;

  // 1.2 Team Registration (4 Members)
  const teamPayload = {
    fullName: 'Karthik Raja',
    email: `karthik.raja.${ts}@mitindia.edu`,
    phone: `98402${String(ts).slice(-5)}`,
    collegeName: 'Madras Institute of Technology',
    department: 'Information Technology',
    yearOfStudy: '4th Year',
    gender: 'Male',
    selectedEventIds: ['TE02', 'SP01'],
    referralSource: 'Friend Referral',
    isTeam: true,
    teamName: 'CyberKnights',
    teamMembers: [
      { name: 'Siddharth V', email: `siddharth.${ts}@mitindia.edu`, phone: `98403${String(ts).slice(-5)}`, college: 'MIT', department: 'IT' },
      { name: 'Pooja M', email: `pooja.${ts}@mitindia.edu`, phone: `98404${String(ts).slice(-5)}`, college: 'MIT', department: 'IT' },
      { name: 'Gautam R', email: `gautam.${ts}@mitindia.edu`, phone: `98405${String(ts).slice(-5)}`, college: 'MIT', department: 'IT' },
    ],
    agreedToRules: true,
  };

  const teamRes = await api.registerParticipant(teamPayload);
  assertTest(
    'Registration API',
    'Team Registration Flow (4 Members)',
    teamRes.success === true && teamRes.data?.participants?.length === 4,
    `Team: ${teamRes.data?.teamName} (${teamRes.data?.participants?.length} members)`
  );

  const teamHeadToken = teamRes.data?.participants?.[0]?.qrToken || teamRes.data?.qrToken;
  const teamMemberToken = teamRes.data?.participants?.[1]?.qrToken;

  // 1.3 Registration Lookup by ID & Email
  if (indRegId) {
    const lookupRes = await api.getRegistration({ registrationId: indRegId, email: individualPayload.email });
    assertTest(
      'Registration API',
      'Lookup by Registration ID & Email',
      lookupRes.success === true && lookupRes.data?.participantName === 'Ananya Sharma',
      `Found: ${lookupRes.data?.participantName} (${lookupRes.data?.collegeInstitution})`
    );
  }

  // 1.4 Registration Lookup by QR Token
  if (indQrToken) {
    const tokenLookup = await api.getRegistration({ qrToken: indQrToken });
    assertTest(
      'Registration API',
      'Lookup by QR Security Token',
      tokenLookup.success === true && tokenLookup.data?.registrationId === indRegId,
      `Matched Registration ID: ${tokenLookup.data?.registrationId}`
    );
  }

  // ---------------------------------------------------------------------------
  // 2. OPERATIONS DESK PORTAL API (Evoxis registration/src/services/operationsApi.ts)
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. OPERATIONS DESK PORTAL API (Evoxis registration) ---");

  // 2.1 QR Token Resolution at Reception Desk
  if (indQrToken) {
    const resResult = await operationsApi.resolvePhysicalQR(indQrToken);
    assertTest(
      'Operations API',
      'Resolve Individual QR at Reception',
      resResult.success === true && resResult.participant?.name === 'Ananya Sharma',
      `Resolved: ${resResult.participant?.name}`
    );
  }

  // 2.2 Wristband Binding at Reception Desk
  const testWristband = `WB-LIVE-${ts.toString().slice(-4)}`;
  if (indRegId) {
    const assignRes = await operationsApi.assignPhysicalQr(
      testWristband,
      indRegId,
      'WRISTBAND',
      'Staff Reception Lead',
      'RECEPTION-STATION-A'
    );
    assertTest(
      'Operations API',
      'Assign Physical Wristband',
      assignRes.success === true,
      `Bound ${testWristband} to ${indRegId}`
    );

    // Resolve by newly bound Wristband Code
    const wbResolve = await operationsApi.resolvePhysicalQR(testWristband);
    assertTest(
      'Operations API',
      'Resolve via Physical Wristband Code',
      wbResolve.success === true && wbResolve.participant?.registrationId === indRegId,
      `Resolved ${testWristband} -> ${wbResolve.participant?.name}`
    );
  }

  // 2.3 Mark Campus Check-in (Reception Desk)
  if (indRegId) {
    const campusRes = await operationsApi.markCampusAttendance(
      indRegId,
      'Present',
      'Staff Reception Lead',
      'RECEPTION-MAIN'
    );
    assertTest(
      'Operations API',
      'Mark Campus Check-in Status',
      campusRes.success === true,
      `Status: ${campusRes.campusStatus}`
    );
  }

  // 2.4 Event Desk QR Resolution (TE01 - Paper Presentation)
  if (indQrToken) {
    const eventRes = await operationsApi.resolvePhysicalQR(indQrToken, 'TE01');
    assertTest(
      'Operations API',
      'Event Desk Eligibility Check (TE01)',
      eventRes.success === true && eventRes.participant?.registeredEvents?.some(e => e.eventId === 'TE01'),
      `Eligible for: ${eventRes.participant?.registeredEvents?.map(e => e.eventId).join(', ')}`
    );
  }

  // 2.5 Mark Event Present (TE01)
  if (indRegId) {
    const markEvtRes = await operationsApi.markEventPresent(
      indRegId,
      'TE01',
      'Staff Judge',
      'DESK-TE01'
    );
    assertTest(
      'Operations API',
      'Mark Event Desk Attendance (TE01)',
      markEvtRes.success === true,
      `Event status: ${markEvtRes.attendanceStatus}`
    );
  }

  // 2.6 Team Desk Roster Resolution (TE02 - Business Battle)
  if (teamHeadToken) {
    const teamEventContext = await operationsApi.getEventTeamRoster(teamHeadToken, 'TE02');
    assertTest(
      'Operations API',
      'Event Team Roster Context (TE02)',
      teamEventContext.isTeam === true && teamEventContext.members?.length === 4,
      `Team ${teamEventContext.teamName} with ${teamEventContext.members?.length} members`
    );
  }

  // 2.7 Food Distribution Desk
  if (indRegId) {
    const foodRes = await operationsApi.markFoodDelivered(
      indRegId,
      'Staff Caterer',
      'CANTEEN-COUNTER-1',
      'LUNCH'
    );
    assertTest(
      'Operations API',
      'Food / Meal Delivery Tracking',
      foodRes.success === true,
      `Delivery status: ${foodRes.foodStatus}`
    );
  }

  // 2.8 Live Dashboard Metrics
  const metrics = await operationsApi.getLiveMetrics();
  assertTest(
    'Operations API',
    'Live Operations Dashboard Metrics',
    metrics && typeof metrics.totalRegistrations === 'number',
    `Total: ${metrics.totalRegistrations} | Checked-in: ${metrics.campusCheckedIn} | Meals: ${metrics.foodDelivered}`
  );

  // ---------------------------------------------------------------------------
  // 3. GOOGLE APPS SCRIPT REALTIME SYNC (sheetsSync.ts)
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. GOOGLE SHEETS REALTIME SYNC ---");
  const directSyncRes = await syncToGoogleSheets({
    action: 'markEventAttendance',
    registrationId: indRegId,
    eventId: 'TE01',
    eventName: 'Paper Presentation',
    verifiedBy: 'End-to-End Automated Tester',
    station: 'DESK-TE01'
  });
  assertTest(
    'Google Sheets Sync',
    'Direct Dispatch to Google Apps Script Web App',
    directSyncRes === true,
    `Dispatched event attendance sync for ${indRegId}`
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("📊 COMPLETE API & KEY VERIFICATION REPORT");
  console.log("================================================================================");
  const total = testResults.length;
  const passed = testResults.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`Total Live Operations Tested: ${total}`);
  console.log(`Passed:                       ${passed}`);
  console.log(`Failed:                       ${failed}`);
  console.log(`Success Rate:                 ${((passed / total) * 100).toFixed(1)}%`);
  console.log("================================================================================\n");

  if (failed === 0) {
    console.log("🎉 ALL API KEYS, BACKEND ENDPOINTS, AND CLIENT WORKFLOWS ARE 100% OPERATIONAL!");
  }
}

runEndToEndTests().catch(err => {
  console.error("Test runner exception:", err);
});
