import { createClient } from 'file:///c:/Projects/Evoxis%2026/Evoxis%20registration/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDeletePermissions() {
  console.log("Testing insert and delete permissions with a test record...");
  const testId = "TEST-PERM-DEL-" + Date.now();

  const { data: insData, error: insErr } = await supabase
    .from('attendance_logs')
    .insert([
      {
        attendance_id: testId,
        registration_id: 'TEST-PERM',
        participant_name: 'Permission Test',
        event_id: 'TE01',
        event_name: 'Paper Presentation',
        event_type: 'Technical',
        attendance_date: '2026-08-26',
        attendance_time: '12:00:00 PM',
        attendance_location: 'Test Desk',
        attendance_status: 'Present',
        participation_status: 'Present',
        verified_by: 'Test Runner',
        qr_token: testId,
        scan_timestamp: new Date().toISOString()
      }
    ])
    .select();

  console.log("Insert result:", { insData, insErr });

  if (!insErr) {
    const { data: delData, error: delErr } = await supabase
      .from('attendance_logs')
      .delete()
      .eq('attendance_id', testId)
      .select();

    console.log("Delete result:", { delData, delErr });
  }
}

testDeletePermissions();
