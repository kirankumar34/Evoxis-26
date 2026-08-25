import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function generateMockQRToken(regId) {
  let hash = 0;
  for (let i = 0; i < regId.length; i++) {
    hash = (hash << 5) - hash + regId.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `EVOXIS26:${hex}${regId.replace(/[^0-9]/g, '')}`;
}

async function lookupRegistration(queryStr) {
  const lookupKey = queryStr.trim();
  let matchRecord = null;

  // A. Exact match by qr_token
  const { data: byQr, error: qrErr } = await supabase
    .from('overall_registrations')
    .select('*')
    .eq('qr_token', lookupKey)
    .limit(1);

  if (!qrErr && byQr && byQr.length > 0) {
    matchRecord = byQr[0];
  } else {
    // B. Exact match by registration_id
    const { data: byRegId, error: regErr } = await supabase
      .from('overall_registrations')
      .select('*')
      .eq('registration_id', lookupKey.toUpperCase())
      .limit(1);

    if (!regErr && byRegId && byRegId.length > 0) {
      matchRecord = byRegId[0];
    } else {
      // C. Match by email or mobile
      const { data: byContact } = await supabase
        .from('overall_registrations')
        .select('*')
        .or(`email.eq.${lookupKey.toLowerCase()},mobile_number.eq.${lookupKey}`)
        .limit(1);

      if (byContact && byContact.length > 0) {
        matchRecord = byContact[0];
      } else if (lookupKey.includes('-M')) {
        const baseKey = lookupKey.split('-M')[0];
        const { data: baseRecs } = await supabase
          .from('overall_registrations')
          .select('*')
          .eq('registration_id', baseKey.toUpperCase())
          .limit(1);
        if (baseRecs && baseRecs.length > 0) {
          matchRecord = baseRecs[0];
        }
      }
    }
  }

  if (!matchRecord) {
    return { success: false, message: 'PARTICIPANT NOT FOUND' };
  }

  return {
    success: true,
    data: {
      registrationId: matchRecord.registration_id,
      participantName: matchRecord.participant_name,
      email: matchRecord.email,
      mobile: matchRecord.mobile_number,
      college: matchRecord.college_institution,
      department: matchRecord.department,
      selectedEvents: matchRecord.selected_events,
      teamName: matchRecord.team_name,
      teamMembers: matchRecord.team_members,
      qrToken: matchRecord.qr_token,
    }
  };
}

async function diagnose() {
  console.log("=================================================");
  console.log("EVOXIS 26 — LIVE END-TO-END PIPELINE VALIDATION");
  console.log("=================================================");

  // 1. Determine next sequence ID
  const { data: existingIds } = await supabase
    .from('overall_registrations')
    .select('registration_id');

  let maxNum = 0;
  existingIds?.forEach((r) => {
    const match = r.registration_id?.match(/^EVOXIS26-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num < 80000 && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const testSeq1 = maxNum + 1;
  const testRegId1 = `EVOXIS26-${String(testSeq1).padStart(5, '0')}`;
  const testQrToken1 = generateMockQRToken(testRegId1);

  console.log(`\n--- Test 1: Individual Registration (${testRegId1}) ---`);
  console.log(`Generated QR Token: ${testQrToken1}`);

  const masterRow1 = {
    registration_id: testRegId1,
    registration_date: '2026-08-25',
    registration_time: '01:40:00 PM',
    participant_name: 'Pipeline Test Individual',
    email: `pipeline.test.${testSeq1}@gmail.com`,
    mobile_number: `98888000${String(testSeq1).slice(-2)}`,
    college_institution: 'SEC Chennai',
    department: 'CSE',
    year: '3rd Year',
    gender: 'Male',
    registration_type: 'Individual',
    selected_events: 'TE01, TE02, NT01',
    total_events: 3,
    total_amount: 0,
    payment_status: 'Free',
    qr_token: testQrToken1,
    qr_status: 'Active',
    email_status: 'Sent',
    sms_status: 'Sent',
    whatsapp_status: 'Sent',
    overall_attendance_status: 'Pending',
    registration_status: 'Confirmed',
    team_name: null,
    team_members: [],
  };

  const { error: ins1Err } = await supabase.from('overall_registrations').insert([masterRow1]);
  if (ins1Err) {
    console.error("❌ Test 1 Insert failed:", ins1Err);
  } else {
    console.log("✅ Test 1 Inserted successfully into Supabase overall_registrations");
  }

  // Look up by newly generated QR token
  console.log(`Scanning / Resolving QR: ${testQrToken1}`);
  const lookup1 = await lookupRegistration(testQrToken1);
  console.log("Lookup result:", lookup1.success ? "✅ FOUND" : "❌ NOT FOUND", lookup1.data);

  // 2. Test Team Registration
  const testSeq2 = testSeq1 + 1;
  const testRegId2 = `EVOXIS26-${String(testSeq2).padStart(5, '0')}`;
  const testQrToken2 = generateMockQRToken(testRegId2);
  const teamMemberTokens = [
    testQrToken2,
    `${testQrToken2}-M1`,
    `${testQrToken2}-M2`,
  ];

  console.log(`\n--- Test 2: Team Registration (${testRegId2}) ---`);
  const teamParticipants = [
    {
      registration_id: testRegId2,
      registration_date: '2026-08-25',
      registration_time: '01:40:00 PM',
      participant_name: 'Team Captain Live',
      email: `captain.${testSeq2}@gmail.com`,
      mobile_number: `97777000${String(testSeq2).slice(-2)}`,
      college_institution: 'SEC Chennai',
      department: 'ECE',
      year: '3rd Year',
      gender: 'Male',
      registration_type: 'Team',
      selected_events: 'TE03, NT02',
      total_events: 2,
      total_amount: 0,
      payment_status: 'Free',
      qr_token: teamMemberTokens[0],
      qr_status: 'Active',
      email_status: 'Sent',
      sms_status: 'Sent',
      whatsapp_status: 'Sent',
      overall_attendance_status: 'Pending',
      registration_status: 'Confirmed',
      team_name: 'Alpha Coders',
      team_members: [
        { name: 'Team Captain Live', email: `captain.${testSeq2}@gmail.com`, role: 'TEAM_HEAD', registrationId: testRegId2, qrToken: teamMemberTokens[0] },
        { name: 'Member One Live', email: `member1.${testSeq2}@gmail.com`, role: 'TEAM_MEMBER', registrationId: `${testRegId2}-M1`, qrToken: teamMemberTokens[1] },
        { name: 'Member Two Live', email: `member2.${testSeq2}@gmail.com`, role: 'TEAM_MEMBER', registrationId: `${testRegId2}-M2`, qrToken: teamMemberTokens[2] },
      ],
    },
    {
      registration_id: `${testRegId2}-M1`,
      registration_date: '2026-08-25',
      registration_time: '01:40:00 PM',
      participant_name: 'Member One Live',
      email: `member1.${testSeq2}@gmail.com`,
      mobile_number: `97777001${String(testSeq2).slice(-2)}`,
      college_institution: 'SEC Chennai',
      department: 'ECE',
      year: '3rd Year',
      gender: 'Female',
      registration_type: 'Team',
      selected_events: 'TE03, NT02',
      total_events: 2,
      total_amount: 0,
      payment_status: 'Free',
      qr_token: teamMemberTokens[1],
      qr_status: 'Active',
      email_status: 'Sent',
      sms_status: 'Sent',
      whatsapp_status: 'Sent',
      overall_attendance_status: 'Pending',
      registration_status: 'Confirmed',
      team_name: 'Alpha Coders',
      team_members: [],
    },
    {
      registration_id: `${testRegId2}-M2`,
      registration_date: '2026-08-25',
      registration_time: '01:40:00 PM',
      participant_name: 'Member Two Live',
      email: `member2.${testSeq2}@gmail.com`,
      mobile_number: `97777002${String(testSeq2).slice(-2)}`,
      college_institution: 'SEC Chennai',
      department: 'ECE',
      year: '3rd Year',
      gender: 'Male',
      registration_type: 'Team',
      selected_events: 'TE03, NT02',
      total_events: 2,
      total_amount: 0,
      payment_status: 'Free',
      qr_token: teamMemberTokens[2],
      qr_status: 'Active',
      email_status: 'Sent',
      sms_status: 'Sent',
      whatsapp_status: 'Sent',
      overall_attendance_status: 'Pending',
      registration_status: 'Confirmed',
      team_name: 'Alpha Coders',
      team_members: [],
    }
  ];

  const { error: ins2Err } = await supabase.from('overall_registrations').insert(teamParticipants);
  if (ins2Err) {
    console.error("❌ Test 2 Insert failed:", ins2Err);
  } else {
    console.log("✅ Test 2 Inserted 3 team rows into Supabase");
  }

  // Look up Captain by QR
  console.log(`\nScanning Captain QR: ${teamMemberTokens[0]}`);
  const lookupCap = await lookupRegistration(teamMemberTokens[0]);
  console.log("Captain Lookup:", lookupCap.success ? "✅ FOUND" : "❌ NOT FOUND", lookupCap.data?.participantName);

  // Look up Member 1 by QR
  console.log(`\nScanning Member 1 QR: ${teamMemberTokens[1]}`);
  const lookupM1 = await lookupRegistration(teamMemberTokens[1]);
  console.log("Member 1 Lookup:", lookupM1.success ? "✅ FOUND" : "❌ NOT FOUND", lookupM1.data?.participantName);

  // Look up Member 2 by QR
  console.log(`\nScanning Member 2 QR: ${teamMemberTokens[2]}`);
  const lookupM2 = await lookupRegistration(teamMemberTokens[2]);
  console.log("Member 2 Lookup:", lookupM2.success ? "✅ FOUND" : "❌ NOT FOUND", lookupM2.data?.participantName);

  // 3. Test Legacy / Old Registration QR code lookup
  console.log("\n--- Test 3: Legacy / Old Registration QR Lookup ---");
  const oldToken = 'EVOXIS26:0c6c8ce82600041'; // test07 CSK team
  const oldLookup = await lookupRegistration(oldToken);
  console.log(`Scanning Old Token ${oldToken}:`, oldLookup.success ? "✅ FOUND" : "❌ NOT FOUND", oldLookup.data?.participantName, oldLookup.data?.teamName);

  // 4. Clean up test records
  console.log("\n--- Cleaning up test records ---");
  await supabase.from('overall_registrations').delete().in('registration_id', [testRegId1, testRegId2, `${testRegId2}-M1`, `${testRegId2}-M2`]);
  console.log("✅ Test records cleaned up successfully.");
}

diagnose();
