import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectColumns() {
  console.log("=== overall_registrations columns ===");
  const { data: oRows } = await supabase.from('overall_registrations').select('*').limit(1);
  if (oRows && oRows[0]) {
    console.log(Object.keys(oRows[0]));
  }

  console.log("\n=== event_registrations columns ===");
  const { data: eRows } = await supabase.from('event_registrations').select('*').limit(1);
  if (eRows && eRows[0]) {
    console.log(Object.keys(eRows[0]));
  }

  console.log("\n=== attendance_logs columns ===");
  const { data: aRows } = await supabase.from('attendance_logs').select('*').limit(1);
  if (aRows && aRows[0]) {
    console.log(Object.keys(aRows[0]));
  }
}

inspectColumns();
