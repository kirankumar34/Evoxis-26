# EvoXis'26 — Google Apps Script Backend Deployment Guide

This guide explains how to deploy the Google Apps Script backend and link it to the Google Sheets database (`EvoXis26_Master_Database`) and frontend.

---

## 1. Create the Google Spreadsheet
1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name it: `EvoXis26_Master_Database`.
3. Copy the Spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`YOUR_SPREADSHEET_ID`**`/edit`

---

## 2. Setup Google Apps Script Project
1. In your spreadsheet, click **Extensions** > **Apps Script**.
2. Rename the Apps Script project to `EvoXis26_Backend_Engine`.
3. Replace the content of `Code.gs` with the entire contents of [`gas/Code.js`](file:///c:/Projects/Evoxis%2026/gas/Code.js).
4. (Optional) In **Project Settings** (⚙️ icon on the left), check **"Show appsscript.json manifest file in editor"**, and paste [`gas/appsscript.json`](file:///c:/Projects/Evoxis%2026/gas/appsscript.json).

---

## 3. Configure Script Properties (Secrets)
In Apps Script Editor > **Project Settings** > **Script Properties**, add:

| Property | Value | Description |
|---|---|---|
| `SPREADSHEET_ID` | `YOUR_SPREADSHEET_ID` | The ID of your `EvoXis26_Master_Database` sheet |
| `QR_SECRET` | `EVOXIS26_SUPER_SECRET_HMAC_KEY_2026` | Secret key used to sign and verify QR tokens |
| `ADMIN_USER` | `evoxisadmin` | Super Admin login username |
| `ADMIN_PASS` | `evoxis2026!` | Super Admin login password |
| `COMMITTEE_USER` | `reception` | Registration Committee login username |
| `COMMITTEE_PASS` | `sriram2026` | Registration Committee login password |

---

## 4. Run One-Click Database Initialization
1. In the Apps Script editor toolbar, select the function `setupEvoXis26Sheets` from the function dropdown.
2. Click **Run**.
3. Review and grant permissions (Google Spreadsheet & Mail permissions).
4. Once completed, verify that your Google Sheet now has all **9 core tabs + 16 `EVT_*` event tabs** pre-configured with styled headers and the full `Event_Master` list!

---

## 5. Deploy as Web App
1. Click **Deploy** > **New deployment** (top right).
2. Select type: **Web App**.
3. Fill in configuration:
   - **Description**: `EvoXis26 Production API v1.0`
   - **Execute as**: `Me (your google account)`
   - **Who has access**: `Anyone`
4. Click **Deploy**.
5. Copy the generated **Web app URL** (e.g. `https://script.google.com/macros/s/.../exec`).

---

## 6. Connect Backend to Frontend
In your project `.env` or production deployment environment variables (e.g. Cloudflare Pages):

```env
VITE_APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycb.../exec"
```

If `VITE_APPS_SCRIPT_URL` is empty, the frontend runs in an **Offline / Local Simulation Mode** utilizing browser storage, allowing complete UI, QR scanning, and attendance testing without needing an internet connection.
