/**
 * Google Sheets Mirror Synchronization Service
 * Dispatches operational check-ins to Google Apps Script Web App
 */

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxATuX68Uzi7ozu1OSHQtyKM8m78K66IZ7l42aobpKrTrc7qWegj6vIoM1NGlLajX7F/exec';

export interface SheetsSyncPayload {
  action: 'markAttendance' | 'markFoodDelivered' | 'assignPhysicalQr' | 'syncCampusCheckin';
  registrationId: string;
  participantName?: string;
  eventId?: string;
  eventName?: string;
  physicalQrId?: string;
  station?: string;
  timestamp?: string;
  verifiedBy?: string;
}

export const syncToGoogleSheets = async (payload: SheetsSyncPayload): Promise<boolean> => {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.trim() === '') {
    return false;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        ...payload,
        timestamp: payload.timestamp || new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const json = await response.json();
      return json.success === true;
    }
    return false;
  } catch (err) {
    console.warn('[SheetsSync] Google Sheets mirror sync notice:', err);
    return false;
  }
};
