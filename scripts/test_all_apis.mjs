import { createClient } from 'file:///c:/Projects/Evoxis%2026/Evoxis%20registration/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxATuX68Uzi7ozu1OSHQtyKM8m78K66IZ7l42aobpKrTrc7qWegj6vIoM1NGlLajX7F/exec";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const results = [];

function record(suite, testName, passed, details = '') {
  results.push({ suite, testName, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${suite}] ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function runAllApiTests() {
  console.log("================================================================================");
  console.log("🧪 EVOXIS'26 — COMPREHENSIVE END-TO-END API & KEY VERIFICATION SUITE");
  console.log("================================================================================\n");

  const ts = Date.now();

  // ---------------------------------------------------------------------------
  // SUITE 1: SUPABASE POSTGRESQL & KEYS
  // ---------------------------------------------------------------------------
  console.log("--- 1. SUPABASE DATABASE & KEYS ---");
  try {
    // 1.1 Test Supabase Connection & event_master Read
    const { data: events, error: evErr } = await supabase.from('event_master').select('*').limit(5);
    record('Supabase', 'Connection & Event Master Read', !evErr && events?.length > 0, `${events?.length || 0} events retrieved`);

    // 1.2 Test system_config Read
    const { data: configs, error: cfgErr } = await supabase.from('system_config').select('*').limit(5);
    record('Supabase', 'System Config Read', !cfgErr, `${configs?.length || 0} config items`);

    // 1.3 Test overall_registrations Read
    const { count: regCount, error: regErr } = await supabase.from('overall_registrations').select('*', { count: 'exact', head: true });
    record('Supabase', 'overall_registrations Read Access', !regErr, `Total rows: ${regCount}`);

    // 1.4 Test event_registrations Read
    const { count: evRegCount, error: evRegErr } = await supabase.from('event_registrations').select('*', { count: 'exact', head: true });
    record('Supabase', 'event_registrations Read Access', !evRegErr, `Total rows: ${evRegCount}`);

    // 1.5 Test attendance_logs Read
    const { count: attCount, error: attErr } = await supabase.from('attendance_logs').select('*', { count: 'exact', head: true });
    record('Supabase', 'attendance_logs Read Access', !attErr, `Total rows: ${attCount}`);

    // 1.6 Test Supabase Insert (Registration & Event Registration)
    const testRegId = `EVOXIS26-TEST-${ts.toString().slice(-4)}`;
    const testToken = `EVOXIS26:TEST:${ts}`;
    const { error: insErr } = await supabase.from('overall_registrations').insert([{
      registration_id: testRegId,
      full_name: 'API Test Participant',
      email: `apitest.${ts}@citchennai.edu.in`,
      mobile_number: '9840199999',
      college_institution: 'CIT Chennai',
      department: 'CSE',
      year: '3rd Year',
      gender: 'Male',
      registration_type: 'Individual',
      selected_events: JSON.stringify(['TE01']),
      total_events: 1,
      payment_status: 'FREE',
      overall_attendance_status: 'Pending',
      qr_token: testToken,
      qr_status: 'ACTIVE',
      registration_date: new Date().toISOString().split('T')[0],
      registration_time: new Date().toLocaleTimeString(),
      referral_source: 'API Test'
    }]);
    record('Supabase', 'overall_registrations Insert (RLS Write)', !insErr, insErr ? insErr.message : `Inserted ${testRegId}`);

    // 1.7 Test Attendance Log Insert
    const testAttId = `ATT-TEST-${ts}`;
    const { error: attInsErr } = await supabase.from('attendance_logs').insert([{
      attendance_id: testAttId,
      registration_id: testRegId,
      participant_name: 'API Test Participant',
      event_id: 'TE01',
      event_name: 'Paper Presentation',
      event_category: 'Technical',
      scan_timestamp: new Date().toISOString(),
      scan_type: 'EVENT_ENTRY',
      attendance_status: 'Present',
      verified_by: 'Staff API Tester',
      scanner_station: 'TEST-STATION-1'
    }]);
    record('Supabase', 'attendance_logs Insert (Attendance Marking)', !attInsErr, attInsErr ? attInsErr.message : `Marked attendance for TE01`);

  } catch (err) {
    record('Supabase', 'Supabase Suite Exception', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // SUITE 2: GOOGLE APPS SCRIPT WEB APP & MIRROR SYNC
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. GOOGLE APPS SCRIPT WEB APP API ---");
  try {
    // 2.1 Ping
    const pingRes = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'ping' })
    });
    const pingData = await pingRes.json();
    record('AppsScript', 'Ping Health Check', pingData.success === true, `Response: ${pingData.message}`);

    // 2.2 registerParticipant API
    const regPayload = {
      action: 'registerParticipant',
      fullName: 'AppsScript Test User',
      email: `gas.test.${ts}@mitindia.edu`,
      phone: '9840288888',
      collegeName: 'MIT India',
      department: 'IT',
      yearOfStudy: '2nd Year',
      gender: 'Female',
      selectedEventIds: ['TE02', 'NT01'],
      referralSource: 'API Test',
      isTeam: false,
      agreedToRules: true
    };
    const regRes = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(regPayload)
    });
    const regJson = await regRes.json();
    record('AppsScript', 'registerParticipant API', regJson.success === true, `Assigned ID: ${regJson.data?.registrationId || 'N/A'}`);

    const gasRegId = regJson.data?.registrationId;
    const gasToken = regJson.data?.qrToken;

    // 2.3 getRegistration API
    if (gasRegId) {
      const getRes = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getRegistration', registrationId: gasRegId })
      });
      const getJson = await getRes.json();
      record('AppsScript', 'getRegistration API (Lookup)', getJson.success === true, `Found: ${getJson.data?.participantName}`);
    }

    // 2.4 validateQRCode API
    if (gasToken) {
      const valRes = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'validateQRCode', qrToken: gasToken })
      });
      const valJson = await valRes.json();
      record('AppsScript', 'validateQRCode API (Security Check)', valJson.success === true, `Status: ${valJson.data?.qrStatus || 'VALID'}`);
    }

    // 2.5 markReceptionAttendance / syncCampusCheckin
    if (gasRegId) {
      const recRes = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'markReceptionAttendance',
          registrationId: gasRegId,
          verifiedBy: 'Reception Desk API Test',
          station: 'RECEPTION-1'
        })
      });
      const recJson = await recRes.json();
      record('AppsScript', 'markReceptionAttendance API', recJson.success === true, `Campus check-in status: ${recJson.message || 'Success'}`);
    }

    // 2.6 markEventAttendance API
    if (gasRegId) {
      const evtRes = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'markEventAttendance',
          registrationId: gasRegId,
          eventId: 'TE02',
          eventName: 'Business Battle',
          verifiedBy: 'Event Desk TE02 Tester',
          station: 'DESK-TE02'
        })
      });
      const evtJson = await evtRes.json();
      record('AppsScript', 'markEventAttendance API', evtJson.success === true, `Event attendance status: ${evtJson.message || 'Success'}`);
    }

    // 2.7 assignPhysicalQr API (Wristband Binding)
    if (gasRegId) {
      const wbCode = `WB-TEST-${ts.toString().slice(-4)}`;
      const wbRes = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'assignPhysicalQr',
          physicalQrId: wbCode,
          registrationId: gasRegId,
          qrType: 'WRISTBAND',
          assignedBy: 'Desk Lead'
        })
      });
      const wbJson = await wbRes.json();
      record('AppsScript', 'assignPhysicalQr API (Wristband Binding)', wbJson.success === true, `Assigned ${wbCode}`);
    }

    // 2.8 markFoodDelivered API
    if (gasRegId) {
      const foodRes = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'markFoodDelivered',
          registrationId: gasRegId,
          mealType: 'LUNCH',
          deliveredBy: 'Catering Incharge'
        })
      });
      const foodJson = await foodRes.json();
      record('AppsScript', 'markFoodDelivered API (Meal Distribution)', foodJson.success === true, `Delivery: ${foodJson.message || 'Delivered'}`);
    }

  } catch (err) {
    record('AppsScript', 'Apps Script Suite Exception', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("📊 API & KEY VERIFICATION SUMMARY");
  console.log("================================================================================");
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`Total Endpoints & Keys Tested: ${total}`);
  console.log(`Passed:                       ${passed}`);
  console.log(`Failed:                       ${failed}`);
  console.log(`Success Rate:                 ${((passed / total) * 100).toFixed(1)}%`);
  console.log("================================================================================\n");
}

runAllApiTests();
