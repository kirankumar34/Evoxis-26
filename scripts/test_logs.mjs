import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAttendanceLogs() {
  console.log("=== Testing attendance_logs for QR_ASSIGNMENT ===");
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('event_type', 'QR_ASSIGNMENT');
  
  if (error) console.error("Error:", error);
  else {
    console.log(`Found ${data.length} QR_ASSIGNMENT logs:`);
    console.log(JSON.stringify(data, null, 2));
  }
}

testAttendanceLogs();
