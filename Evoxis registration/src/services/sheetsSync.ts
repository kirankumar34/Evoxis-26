/**
 * Google Sheets Mirror Synchronization Service
 * Dispatches operational check-ins to Google Apps Script Web App
 */

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxATuX68Uzi7ozu1OSHQtyKM8m78K66IZ7l42aobpKrTrc7qWegj6vIoM1NGlLajX7F/exec';

export interface SheetsSyncPayload {
  action: 'markAttendance' | 'assignPhysicalQr' | 'syncCampusCheckin' | 'generateQrInventory';
  registrationId?: string;
  participantId?: string;
  participantName?: string;
  email?: string;
  mobile?: string;
  college?: string;
  department?: string;
  year?: string;
  gender?: string;
  registrationType?: string;
  selectedEvents?: string[] | string;
  participant?: any;
  eventId?: string;
  eventName?: string;
  physicalQrId?: string;
  environment?: string;
  count?: number;
  qrType?: string;
  station?: string;
  timestamp?: string;
  verifiedBy?: string;
  campusStatus?: string;
  foodStatus?: string;
}

export const syncToGoogleSheets = async (payload: SheetsSyncPayload): Promise<boolean> => {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.trim() === '') {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        ...payload,
        timestamp: payload.timestamp || new Date().toISOString(),
      }),
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      return json.success === true;
    }
    return false;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[SheetsSync] Google Sheets mirror sync notice:', err);
    return false;
  }
};
