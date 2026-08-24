import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testTeamCSK() {
  console.log("=== Testing Team CSK individual member resolution ===");
  const members = [
    { id: 'EVOXIS26-00041', qr: 'EVX26-TEST-000051', expectedName: 'test07' },
    { id: 'EVOXIS26-00041-M1', qr: 'EVX26-TEST-000052', expectedName: 'test03' },
    { id: 'EVOXIS26-00041-M2', qr: 'EVX26-TEST-000053', expectedName: 'test31' },
    { id: 'EVOXIS26-00041-M3', qr: 'EVX26-TEST-000054', expectedName: 'test09' },
  ];

  // 1. Write assignments to attendance_logs
  for (const m of members) {
    const now = new Date().toISOString();
    const { error: insErr } = await supabase.from('attendance_logs').insert([
      {
        attendance_id: 'AUD-TEST-BIND-' + Math.random().toString(36).substring(2, 9),
        registration_id: m.id,
        participant_name: m.expectedName,
        event_id: 'QR_ASSIGNMENT',
        event_name: 'QR_ASSIGNMENT',
        event_type: 'QR_ASSIGNMENT',
        attendance_date: now.split('T')[0],
        attendance_time: new Date(now).toLocaleTimeString('en-US'),
        attendance_location: 'Reception Desk (TEST)',
        attendance_status: 'SUCCESS',
        participation_status: 'Present',
        verified_by: 'Super Admin Test',
        qr_token: m.qr,
        scan_timestamp: now,
      }
    ]);
    if (insErr) console.error("Insert error for", m.id, insErr);
    else console.log(`✓ Bound ${m.qr} to ${m.id} (${m.expectedName}) in Supabase`);
  }

  // 2. Resolve each QR independently
  console.log("\n=== Resolving Each Member via Live Supabase DB ===");
  for (const m of members) {
    const { data: logs, error: lErr } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('event_type', 'QR_ASSIGNMENT')
      .eq('qr_token', m.qr)
      .eq('attendance_status', 'SUCCESS')
      .order('scan_timestamp', { ascending: false })
      .limit(1);

    if (!logs || logs.length === 0) {
      console.error(`❌ QR ${m.qr} not found in attendance_logs!`);
      continue;
    }

    const boundRegId = logs[0].registration_id;
    const { data: pRows } = await supabase
      .from('overall_registrations')
      .select('*')
      .eq('registration_id', boundRegId)
      .limit(1);

    if (!pRows || pRows.length === 0) {
      console.error(`❌ Participant ${boundRegId} not found in overall_registrations!`);
      continue;
    }

    const p = pRows[0];
    console.log(`✓ Resolved ${m.qr} -> RegID: ${p.registration_id}, Name: ${p.participant_name}, Events: ${p.selected_events}, Role: ${p.role || (boundRegId.includes('-M') ? 'TEAM_MEMBER' : 'TEAM_HEAD')}`);
  }
}

testTeamCSK();
