import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const candidateTables = [
  'overall_registrations',
  'event_registrations',
  'attendance_logs',
  'participants',
  'registrations',
  'physical_qr_assignments',
  'physical_qr_inventory',
  'campus_attendance',
  'event_attendance',
  'food_delivery',
  'qr_inventory',
  'qr_assignments'
];

async function checkTables() {
  for (const t of candidateTables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table '${t}': NOT FOUND or ERROR -> ${error.message}`);
    } else {
      console.log(`Table '${t}': EXISTS (returned ${data ? data.length : 0} rows)`);
    }
  }
}

checkTables();
