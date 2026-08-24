const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const ROOT_DIR = path.resolve(__dirname, '..');
const QR_BASE_DIR = path.join(ROOT_DIR, 'QR codes');
const TESTING_DIR = path.join(QR_BASE_DIR, 'testing');
const EVENT_DAY_DIR = path.join(QR_BASE_DIR, 'event_day');

// Ensure directories exist
if (!fs.existsSync(QR_BASE_DIR)) fs.mkdirSync(QR_BASE_DIR, { recursive: true });
if (!fs.existsSync(TESTING_DIR)) fs.mkdirSync(TESTING_DIR, { recursive: true });
if (!fs.existsSync(EVENT_DAY_DIR)) fs.mkdirSync(EVENT_DAY_DIR, { recursive: true });

async function generateInventory() {
  console.log('🚀 Starting EvoXis 26 Static QR Code Inventory Generation...\n');

  // =========================================================================
  // 1. Generate 100 TEST QR Codes (EVX26-TEST-000001 to EVX26-TEST-000100)
  // =========================================================================
  console.log('📦 1/2: Generating 100 TEST QR Codes in "QR codes/testing"...');
  const testQrs = [];
  const testCsvRows = ['QR Code,QR Type,Environment,Status,Created At'];

  for (let i = 1; i <= 100; i++) {
    const qrId = `EVX26-TEST-${String(i).padStart(6, '0')}`;
    const filePath = path.join(TESTING_DIR, `${qrId}.png`);

    // Generate high-resolution PNG (300x300, Error Correction M)
    await QRCode.toFile(filePath, qrId, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });

    const dataUri = await QRCode.toDataURL(qrId, {
      width: 180,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0F172A', light: '#FFFFFF' },
    });

    testQrs.push({ id: qrId, dataUri, index: i });
    testCsvRows.push(`${qrId},WRISTBAND,TEST,UNUSED,${new Date().toISOString()}`);

    if (i % 25 === 0 || i === 100) {
      console.log(`   ✓ Generated test QR ${i}/100`);
    }
  }

  // Write Test CSV Manifest
  fs.writeFileSync(path.join(TESTING_DIR, 'test_inventory.csv'), testCsvRows.join('\n'));

  // Generate Test Printable A4 HTML Sheet
  const testHtmlSheet = generatePrintableHtml({
    title: "EvoXis'26 — TEST QR INVENTORY (100 Codes)",
    subtitle: 'TESTING & PRE-PRODUCTION USE ONLY — NOT VALID FOR LIVE EVENT DAY',
    badgeText: 'EVOXIS 26 — TEST QR — NOT FOR LIVE EVENT',
    badgeClass: 'badge-test',
    qrs: testQrs,
    environment: 'TEST',
  });
  fs.writeFileSync(path.join(TESTING_DIR, 'test_qr_sheet.html'), testHtmlSheet);
  console.log('   ✅ Saved "QR codes/testing/test_qr_sheet.html" and "test_inventory.csv"\n');

  // =========================================================================
  // 2. Generate 1,000 PRODUCTION QR Codes (EVX26-WB-000001 to EVX26-WB-001000)
  // =========================================================================
  console.log('📦 2/2: Generating 1,000 PRODUCTION Event Day QR Codes in "QR codes/event_day"...');
  const prodQrs = [];
  const prodCsvRows = ['QR Code,QR Type,Environment,Status,Created At'];

  for (let i = 1; i <= 1000; i++) {
    const qrId = `EVX26-WB-${String(i).padStart(6, '0')}`;
    const filePath = path.join(EVENT_DAY_DIR, `${qrId}.png`);

    await QRCode.toFile(filePath, qrId, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const dataUri = await QRCode.toDataURL(qrId, {
      width: 180,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    prodQrs.push({ id: qrId, dataUri, index: i });
    prodCsvRows.push(`${qrId},WRISTBAND,PRODUCTION,UNUSED,${new Date().toISOString()}`);

    if (i % 200 === 0 || i === 1000) {
      console.log(`   ✓ Generated production QR ${i}/1000`);
    }
  }

  // Write Production CSV Manifest
  fs.writeFileSync(path.join(EVENT_DAY_DIR, 'production_inventory.csv'), prodCsvRows.join('\n'));

  // Generate Production Printable A4 HTML Sheet
  const prodHtmlSheet = generatePrintableHtml({
    title: "EvoXis'26 — Official Wristband / ID Card QR Inventory (1,000 Codes)",
    subtitle: 'Sriram Engineering College · Department of Computer Science & Business Systems',
    badgeText: 'EVOXIS 26 — PRODUCTION',
    badgeClass: 'badge-prod',
    qrs: prodQrs,
    environment: 'PRODUCTION',
  });
  fs.writeFileSync(path.join(EVENT_DAY_DIR, 'production_qr_sheet.html'), prodHtmlSheet);
  console.log('   ✅ Saved "QR codes/event_day/production_qr_sheet.html" and "production_inventory.csv"\n');

  console.log('🎉 TOTAL GENERATED: 1,100 QR Codes (1,000 Production in event_day + 100 Test in testing)!');
}

/**
 * Generate A4 Printable Sheet HTML (4 Columns x 5 Rows = 20 QR per page)
 */
function generatePrintableHtml({ title, subtitle, badgeText, badgeClass, qrs, environment }) {
  const itemsPerPage = 20; // 4x5 grid
  const pages = [];

  for (let i = 0; i < qrs.length; i += itemsPerPage) {
    const pageItems = qrs.slice(i, i + itemsPerPage);
    pages.push(pageItems);
  }

  const isTest = environment === 'TEST';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 6mm 8mm 6mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #0f172a;
      color: #0f172a;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-controls {
      position: fixed;
      top: 15px;
      right: 15px;
      z-index: 1000;
      background: #020617;
      border: 1px solid #334155;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .print-btn {
      background: #06b6d4;
      color: #090d16;
      border: none;
      font-weight: 800;
      font-family: monospace;
      padding: 9px 18px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      box-shadow: 0 0 15px rgba(6,182,212,0.4);
    }
    .print-btn:hover {
      background: #22d3ee;
    }
    .page-container {
      width: 210mm;
      min-height: 297mm;
      background: white;
      margin: 20px auto;
      padding: 10mm 8mm;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .page-header {
      border-bottom: 2px solid ${isTest ? '#f43f5e' : '#0f172a'};
      padding-bottom: 6px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .page-header h1 {
      font-size: 13px;
      font-weight: 800;
      color: ${isTest ? '#e11d48' : '#0f172a'};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .page-header p {
      font-size: 9.5px;
      color: #64748b;
    }
    .badge-test {
      background: #ffe4e6;
      color: #e11d48;
      border: 1px dashed #f43f5e;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 9px;
      font-weight: bold;
      font-family: monospace;
    }
    .badge-prod {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #10b981;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 9px;
      font-weight: bold;
      font-family: monospace;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 4mm 4mm;
      flex: 1;
    }
    .qr-card {
      border: 1px dashed ${isTest ? '#fda4af' : '#94a3b8'};
      border-radius: 8px;
      padding: 5px 3px 3px 3px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: ${isTest ? '#fff1f2' : '#ffffff'};
    }
    .qr-card img {
      width: 32mm;
      height: 32mm;
      display: block;
      margin: 0 auto 3px auto;
    }
    .qr-id {
      font-family: "JetBrains Mono", Courier, monospace;
      font-size: 10px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
      margin-bottom: 1px;
    }
    .qr-brand {
      font-size: 7.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: ${isTest ? '#e11d48' : '#475569'};
      letter-spacing: 0.8px;
    }
    .page-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 5px;
      margin-top: 6px;
      font-size: 8px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      font-family: monospace;
    }
    @media print {
      body {
        background: white;
      }
      .print-controls {
        display: none;
      }
      .page-container {
        margin: 0;
        box-shadow: none;
        padding: 6mm 5mm;
      }
    }
  </style>
</head>
<body>
  <div class="print-controls">
    <span style="color: white; font-size: 12px; font-family: monospace;">${qrs.length} QR Codes (${pages.length} Pages)</span>
    <button class="print-btn" onclick="window.print()">🖨️ PRINT ALL SHEETS (A4)</button>
  </div>

  ${pages
    .map(
      (page, pIndex) => `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>${title}</h1>
          <p>${subtitle}</p>
        </div>
        <span class="${badgeClass}">${badgeText}</span>
      </div>

      <div class="grid">
        ${page
          .map(
            (qr) => `
          <div class="qr-card">
            <img src="${qr.dataUri}" alt="${qr.id}" />
            <div class="qr-id">${qr.id}</div>
            <div class="qr-brand">${isTest ? 'TEST ONLY · NOT FOR LIVE EVENT' : 'EVOXIS 26 · PHYSICAL WRISTBAND'}</div>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="page-footer">
        <span>Page ${pIndex + 1} of ${pages.length}</span>
        <span>EvoXis'26 Operations Portal</span>
        <span>Items ${pIndex * itemsPerPage + 1} - ${Math.min((pIndex + 1) * itemsPerPage, qrs.length)} of ${qrs.length}</span>
      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;
}

generateInventory().catch(console.error);
