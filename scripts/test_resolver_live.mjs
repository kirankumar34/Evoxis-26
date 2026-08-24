import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testResolver() {
  console.log("=== Testing Resolver using attendance_logs + overall_registrations ===");
  
  // Let's test finding a QR
  const qrToTest = 'EVX26-TEST-000051';
  
  // 1. Query attendance_logs for assignment
  const { data: logs, error: lErr } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('event_type', 'QR_ASSIGNMENT')
    .eq('qr_token', qrToTest)
    .eq('attendance_status', 'SUCCESS')
    .order('scan_timestamp', { ascending: false })
    .limit(1);

  console.log("Found assignment log:", logs);

  if (logs && logs.length > 0) {
    const regId = logs[0].registration_id;
    console.log("Found bound registration_id:", regId);

    // 2. Fetch participant
    const { data: part, error: pErr } = await supabase
      .from('overall_registrations')
      .select('*')
      .eq('registration_id', regId)
      .limit(1);

    console.log("Resolved participant profile:", part);
  }
}

testResolver();
