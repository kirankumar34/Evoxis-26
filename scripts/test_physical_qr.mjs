import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testQueryByPhysicalQr() {
  console.log("=== 1. Checking if attendance_logs can resolve physical QR ===");
  const { data: att, error: attErr } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('qr_token', 'EVX26-TEST-000051')
    .order('scan_timestamp', { ascending: false });

  console.log("Attendance logs for EVX26-TEST-000051:", att);

  console.log("\n=== 2. Checking if overall_registrations can be queried by attendance_logs registration_id ===");
  if (att && att.length > 0) {
    const regId = att[0].registration_id;
    console.log("Looking up registration_id:", regId);
    const { data: reg, error: regErr } = await supabase
      .from('overall_registrations')
      .select('*')
      .eq('registration_id', regId);
    console.log("Found registration:", reg);
  }
}

testQueryByPhysicalQr();
