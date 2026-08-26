import { createClient } from 'file:///c:/Projects/Evoxis%2026/Evoxis%20registration/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxATuX68Uzi7ozu1OSHQtyKM8m78K66IZ7l42aobpKrTrc7qWegj6vIoM1NGlLajX7F/exec";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanAllSupabaseData() {
  console.log("================================================================================");
  console.log("🧹 STEP 1: PURGING ALL DATA ROWS IN SUPABASE");
  console.log("================================================================================\n");

  // 1. Delete all rows from event_registrations
  try {
    const { data: eventRegs } = await supabase.from('event_registrations').select('id');
    if (eventRegs && eventRegs.length > 0) {
      console.log(`Deleting ${eventRegs.length} rows from event_registrations...`);
      for (let i = 0; i < eventRegs.length; i += 100) {
        const chunk = eventRegs.slice(i, i + 100).map(r => r.id);
        const { error } = await supabase.from('event_registrations').delete().in('id', chunk);
        if (error) console.error("Error deleting event_registrations chunk:", error);
      }
    }
  } catch (e) {
    console.error("event_registrations delete err:", e.message);
  }

  // 2. Delete all rows from attendance_logs
  try {
    const { data: attLogs } = await supabase.from('attendance_logs').select('attendance_id');
    if (attLogs && attLogs.length > 0) {
      console.log(`Deleting ${attLogs.length} rows from attendance_logs...`);
      for (let i = 0; i < attLogs.length; i += 100) {
        const chunk = attLogs.slice(i, i + 100).map(r => r.attendance_id);
        const { error } = await supabase.from('attendance_logs').delete().in('attendance_id', chunk);
        if (error) console.error("Error deleting attendance_logs chunk:", error);
      }
    }
  } catch (e) {
    console.error("attendance_logs delete err:", e.message);
  }

  // 3. Delete all rows from overall_registrations
  try {
    const { data: regs } = await supabase.from('overall_registrations').select('registration_id');
    if (regs && regs.length > 0) {
      console.log(`Deleting ${regs.length} rows from overall_registrations...`);
      for (let i = 0; i < regs.length; i += 100) {
        const chunk = regs.slice(i, i + 100).map(r => r.registration_id);
        const { error } = await supabase.from('overall_registrations').delete().in('registration_id', chunk);
        if (error) console.error("Error deleting overall_registrations chunk:", error);
      }
    }
  } catch (e) {
    console.error("overall_registrations delete err:", e.message);
  }

  // 4. Delete all rows from physical_qr_inventory if exists
  try {
    const { data: qrs } = await supabase.from('physical_qr_inventory').select('qr_id');
    if (qrs && qrs.length > 0) {
      console.log(`Deleting ${qrs.length} rows from physical_qr_inventory...`);
      for (let i = 0; i < qrs.length; i += 100) {
        const chunk = qrs.slice(i, i + 100).map(r => r.qr_id);
        await supabase.from('physical_qr_inventory').delete().in('qr_id', chunk);
      }
    }
  } catch (e) {
    // Ignore
  }

  // Verify counts
  const { count: c1 } = await supabase.from('overall_registrations').select('*', { count: 'exact', head: true });
  const { count: c2 } = await supabase.from('event_registrations').select('*', { count: 'exact', head: true });
  const { count: c3 } = await supabase.from('attendance_logs').select('*', { count: 'exact', head: true });

  console.log(`\nSupabase verification:`);
  console.log(`- overall_registrations count: ${c1 ?? 0}`);
  console.log(`- event_registrations count:   ${c2 ?? 0}`);
  console.log(`- attendance_logs count:       ${c3 ?? 0}`);
}

async function testAppsScriptApi() {
  console.log("\n================================================================================");
  console.log("🌐 STEP 2: TESTING GOOGLE APPS SCRIPT WEB APP API");
  console.log("================================================================================\n");

  console.log("1. Pinging Apps Script Web App...");
  try {
    const pingRes = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'ping' })
    });
    const pingJson = await pingRes.json();
    console.log("✅ Ping Result:", pingJson);
  } catch (err) {
    console.error("❌ Ping Failed:", err.message);
  }

  console.log("\n2. Testing setupSheets action...");
  try {
    const setupRes = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'setupSheets' })
    });
    const setupJson = await setupRes.json();
    console.log("✅ setupSheets Result:", setupJson);
  } catch (err) {
    console.error("❌ setupSheets Failed:", err.message);
  }
}

async function run() {
  await cleanAllSupabaseData();
  await testAppsScriptApi();
}

run();
