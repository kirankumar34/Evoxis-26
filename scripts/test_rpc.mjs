import { createClient } from 'file:///c:/Projects/Evoxis%2026/Evoxis%20registration/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseRPC() {
  console.log("Checking if RPC exec_sql / execute_sql exists...");
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1;' });
    console.log("RPC exec_sql result:", { data, error });
  } catch (e) {
    console.log("RPC exec_sql exception:", e.message);
  }

  try {
    const { data, error } = await supabase.rpc('execute_sql', { query: 'SELECT 1;' });
    console.log("RPC execute_sql result:", { data, error });
  } catch (e) {
    console.log("RPC execute_sql exception:", e.message);
  }
}

testSupabaseRPC();
