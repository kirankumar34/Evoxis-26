import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnose() {
  console.log("=== 1. Checking overall_registrations count ===");
  const { count, data: regs, error: regErr } = await supabase.from('overall_registrations').select('*', { count: 'exact' });
  if (regErr) console.error("overall_registrations error:", regErr);
  else {
    console.log(`Found ${count} overall_registrations rows:`);
    regs.forEach(r => console.log(`- ID: ${r.registration_id}, Name: ${r.participant_name}, Team: ${r.team_name}, Role: ${r.role}, Events: ${r.selected_events}, QR: ${r.qr_token}`));
  }

  console.log("\n=== 2. Checking for team CSK or test07 in overall_registrations ===");
  const { data: cskRegs, error: cskErr } = await supabase
    .from('overall_registrations')
    .select('*')
    .or('team_name.ilike.%CSK%,participant_name.ilike.%test07%,participant_name.ilike.%test03%,participant_name.ilike.%test31%,participant_name.ilike.%test09%');
  if (cskErr) console.error("csk error:", cskErr);
  else {
    console.log(`CSK records count: ${cskRegs?.length}`);
    console.log(JSON.stringify(cskRegs, null, 2));
  }

  console.log("\n=== 3. Checking physical_qr_inventory ===");
  const { data: inv, error: invErr } = await supabase.from('physical_qr_inventory').select('*').limit(20);
  if (invErr) console.error("physical_qr_inventory error:", invErr);
  else {
    console.log(`Found ${inv?.length} physical_qr_inventory rows:`);
    inv?.forEach(i => console.log(`- QR: ${i.qr_code}, Status: ${i.status}, RegID: ${i.registration_id}, PartID: ${i.participant_id}, AssignedAt: ${i.assigned_at}`));
  }

  console.log("\n=== 4. Checking EVX26-TEST-000051 in physical_qr_inventory ===");
  const { data: q51, error: q51Err } = await supabase.from('physical_qr_inventory').select('*').eq('qr_code', 'EVX26-TEST-000051');
  if (q51Err) console.error("q51 error:", q51Err);
  else {
    console.log("EVX26-TEST-000051 row:", JSON.stringify(q51, null, 2));
  }

  console.log("\n=== 5. Checking event_registrations ===");
  const { data: evts, error: evtsErr } = await supabase.from('event_registrations').select('*').limit(20);
  if (evtsErr) console.error("event_registrations error:", evtsErr);
  else {
    console.log(`Found ${evts?.length} event_registrations rows:`);
    evts?.slice(0, 10).forEach(e => console.log(`- RegID: ${e.registration_id}, Name: ${e.participant_name}, Event: ${e.event_id}, AttStatus: ${e.attendance_status}`));
  }
}

diagnose();
