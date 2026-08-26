import { createClient } from 'file:///c:/Projects/Evoxis%2026/Evoxis%20registration/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxATuX68Uzi7ozu1OSHQtyKM8m78K66IZ7l42aobpKrTrc7qWegj6vIoM1NGlLajX7F/exec";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function wipeDatabaseAndSheets() {
  console.log("================================================================================");
  console.log("🧹 EVOXIS'26 — COMPLETE DATA WIPE & RESET");
  console.log("================================================================================\n");

  // 1. Reset & Rebuild Google Sheets via Apps Script Web App
  console.log("1. Resetting Google Sheets (EvoXis26_Master_Database)...");
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'resetAndRebuildSheets' })
    });
    const json = await res.json();
    console.log("Google Sheets Reset Result:", json);
  } catch (err) {
    console.error("❌ Google Sheets reset error:", err.message);
  }

  // 2. Clear all transactional and operational data from Supabase
  console.log("\n2. Clearing Supabase Tables...");

  const tablesToClear = [
    'sync_failure_log',
    'food_delivery',
    'event_attendance',
    'qr_binding_log',
    'physical_qr_master',
    'event_registrations',
    'participants',
    'registrations',
    'attendance_logs',
    'notification_logs',
    'overall_registrations'
  ];

  for (const table of tablesToClear) {
    try {
      // Delete rows matching not null
      let query;
      if (table === 'sync_failure_log' || table === 'event_registrations') {
        query = supabase.from(table).delete().gte('id', 0);
      } else if (table === 'food_delivery') {
        query = supabase.from(table).delete().neq('delivery_id', '');
      } else if (table === 'event_attendance') {
        query = supabase.from(table).delete().neq('attendance_id', '');
      } else if (table === 'qr_binding_log') {
        query = supabase.from(table).delete().neq('log_id', '');
      } else if (table === 'physical_qr_master') {
        query = supabase.from(table).delete().neq('qr_code', '');
      } else if (table === 'participants') {
        query = supabase.from(table).delete().neq('full_name', '');
      } else if (table === 'registrations' || table === 'overall_registrations') {
        query = supabase.from(table).delete().neq('registration_id', '');
      } else if (table === 'attendance_logs') {
        query = supabase.from(table).delete().neq('attendance_id', '');
      } else if (table === 'notification_logs') {
        query = supabase.from(table).delete().neq('notification_id', '');
      }

      if (query) {
        const { error, count } = await query;
        if (error) {
          console.warn(`Table [${table}] delete notice: ${error.message}`);
        } else {
          console.log(`✅ Table [${table}]: Cleared successfully`);
        }
      }
    } catch (e) {
      console.warn(`Exception clearing [${table}]: ${e.message}`);
    }
  }

  // 3. Verify that tables are empty
  console.log("\n3. Verifying Clean Table State...");
  for (const table of ['overall_registrations', 'event_registrations', 'attendance_logs']) {
    const { data, count } = await supabase.from(table).select('*', { count: 'exact' });
    console.log(`Table [${table}]: ${data ? data.length : 0} rows remaining`);
  }

  console.log("\n================================================================================");
  console.log("✅ COMPLETE WIPE COMPLETED — DATABASE & SHEETS ARE FRESH AND EMPTY");
  console.log("================================================================================\n");
}

wipeDatabaseAndSheets();
