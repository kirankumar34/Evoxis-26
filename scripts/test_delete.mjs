import { createClient } from 'file:///c:/Projects/Evoxis%2026/Evoxis%20registration/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDelete() {
  const { data: testRows } = await supabase.from('overall_registrations').select('registration_id').limit(1);
  console.log("Sample row:", testRows);
  if (testRows && testRows.length > 0) {
    const regId = testRows[0].registration_id;
    const res = await supabase.from('overall_registrations').delete().eq('registration_id', regId).select();
    console.log("Delete result for single row:", res);
  }
}

testDelete();
