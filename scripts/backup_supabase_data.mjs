import fs from 'fs';
import path from 'path';
import { createClient } from 'file:///c:/Projects/Evoxis%2026/Evoxis%20registration/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = "https://rvpdwkqpgloyfahdjmvr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cGR3a3FwZ2xveWZhaGRqbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODAzNDQsImV4cCI6MjEwMjY1NjM0NH0.1fpH8-P3Rup8bnxWzWXknWeZdXfpttJHjako9VftV4k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BACKUP_DIR = "c:\\Projects\\Evoxis 26\\supabase\\backups\\backup_2026_08_26";

const TABLES = [
  'overall_registrations',
  'event_registrations',
  'attendance_logs',
  'notification_logs',
  'physical_qr_inventory',
  'event_master',
  'system_config',
];

function jsonToCsv(items) {
  if (!items || items.length === 0) return '';
  const header = Object.keys(items[0]);
  const csvRows = [
    header.join(','),
    ...items.map(row =>
      header.map(fieldName => {
        const val = row[fieldName];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];
  return csvRows.join('\n');
}

async function exportAll() {
  console.log(`Creating backup directory at: ${BACKUP_DIR}`);
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const manifest = {
    timestamp: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL,
    tables: {}
  };

  for (const table of TABLES) {
    console.log(`Exporting table: [${table}]...`);
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.error(`Error exporting ${table}:`, error.message);
        manifest.tables[table] = { status: 'ERROR', error: error.message };
      } else {
        const rows = data || [];
        const jsonPath = path.join(BACKUP_DIR, `${table}.json`);
        const csvPath = path.join(BACKUP_DIR, `${table}.csv`);

        fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2), 'utf-8');
        fs.writeFileSync(csvPath, jsonToCsv(rows), 'utf-8');

        manifest.tables[table] = {
          status: 'SUCCESS',
          rowCount: rows.length,
          jsonFile: `${table}.json`,
          csvFile: `${table}.csv`,
          sizeBytesJson: fs.statSync(jsonPath).size,
          sizeBytesCsv: fs.statSync(csvPath).size
        };

        console.log(`✅ Table [${table}]: Exported ${rows.length} rows (${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB JSON, ${(fs.statSync(csvPath).size / 1024).toFixed(1)} KB CSV)`);
      }
    } catch (e) {
      console.error(`Exception exporting ${table}:`, e);
      manifest.tables[table] = { status: 'EXCEPTION', error: e.message };
    }
  }

  const manifestPath = path.join(BACKUP_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\n✅ Backup completed and manifest saved at: ${manifestPath}`);
}

exportAll();
