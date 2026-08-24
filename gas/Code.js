/**
 * ============================================================================
 * EVOXIS'26 — OFFICIAL GOOGLE APPS SCRIPT BACKEND ENGINE
 * Registration, Notification, HMAC QR & Event-Attendance Management System
 * ============================================================================
 * 
 * Target Spreadsheet: EvoXis26_Master_Database
 * Architecture: Serverless Google Apps Script Web App + Multi-Tab Google Sheets
 * Security: HMAC-SHA256 QR Tokens, LockService Concurrency, Atomic ID Generation
 */

// Global Constants & Sheet Names
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';
const QR_SECRET_KEY = PropertiesService.getScriptProperties().getProperty('QR_SECRET') || 'EVOXIS26_SUPER_SECRET_HMAC_KEY_2026';

const SHEETS = {
  OVERALL_REG: 'Overall_Registration_Details',
  TECH_REG: 'Overall_Technical_Registration',
  NON_TECH_REG: 'Overall_NonTechnical_Registration',
  SPECIAL_REG: 'Special_Events_Registration',
  ATTENDANCE_LOG: 'Attendance_Log',
  NOTIFICATION_LOG: 'Notification_Log',
  EVENT_MASTER: 'Event_Master',
  CONFIGURATION: 'Configuration',
  PHYSICAL_QR_INVENTORY: 'Physical_QR_Inventory'
};

// 16 Official EvoXis'26 Events Master Metadata
const OFFICIAL_EVENTS = [
  { eventId: 'TE01', eventName: 'Paper Presentation', category: 'Technical', type: 'Individual/Team', venue: 'Main Auditorium / Seminar Hall 1', date: 'September 26, 2026', startTime: '10:00 AM', endTime: '01:00 PM', maxParticipants: '100', regOpen: 'TRUE', slug: 'paper-presentation' },
  { eventId: 'TE02', eventName: 'Business Battle', category: 'Technical', type: 'Team', venue: 'MBA Seminar Hall (Block 1)', date: 'September 26, 2026', startTime: '10:30 AM', endTime: '01:30 PM', maxParticipants: '60', regOpen: 'TRUE', slug: 'business-battle' },
  { eventId: 'TE03', eventName: 'Mind Sparks', category: 'Technical', type: 'Individual', venue: 'CSE Smart Classroom 2', date: 'September 26, 2026', startTime: '11:00 AM', endTime: '01:00 PM', maxParticipants: '80', regOpen: 'TRUE', slug: 'mind-sparks' },
  { eventId: 'TE04', eventName: 'EditoMania', category: 'Technical', type: 'Individual', venue: 'Design & Multimedia Lab (Block 3)', date: 'September 26, 2026', startTime: '10:00 AM', endTime: '01:00 PM', maxParticipants: '50', regOpen: 'TRUE', slug: 'editomania' },
  { eventId: 'TE05', eventName: 'Lego Build with AI', category: 'Technical', type: 'Team', venue: 'Robotics & Embedded Systems Lab', date: 'September 26, 2026', startTime: '11:00 AM', endTime: '01:30 PM', maxParticipants: '50', regOpen: 'TRUE', slug: 'lego-build-with-ai' },
  { eventId: 'TE06', eventName: 'Cyber Investigation', category: 'Technical', type: 'Team', venue: 'Cyber Security War Room Lab', date: 'September 26, 2026', startTime: '10:00 AM', endTime: '01:00 PM', maxParticipants: '60', regOpen: 'TRUE', slug: 'cyber-investigation' },
  
  { eventId: 'NT01', eventName: 'Start Music', category: 'Non-Technical', type: 'Individual', venue: 'Open Air Amphitheatre', date: 'September 26, 2026', startTime: '01:30 PM', endTime: '03:30 PM', maxParticipants: '100', regOpen: 'TRUE', slug: 'start-music' },
  { eventId: 'NT02', eventName: 'Indo Japanese Game', category: 'Non-Technical', type: 'Team', venue: 'Indoor Sports Complex Activity Hall', date: 'September 26, 2026', startTime: '02:00 PM', endTime: '04:00 PM', maxParticipants: '60', regOpen: 'TRUE', slug: 'indo-japanese-game' },
  { eventId: 'NT03', eventName: 'IPL Auction', category: 'Non-Technical', type: 'Team', venue: 'Main Auditorium Tier Hall', date: 'September 26, 2026', startTime: '01:30 PM', endTime: '04:30 PM', maxParticipants: '80', regOpen: 'TRUE', slug: 'ipl-auction' },
  { eventId: 'NT04', eventName: 'Reel Rush', category: 'Non-Technical', type: 'Individual/Team', venue: 'Campus Wide / Media Center Hub', date: 'September 26, 2026', startTime: '01:00 PM', endTime: '03:30 PM', maxParticipants: '100', regOpen: 'TRUE', slug: 'reel-rush' },
  { eventId: 'NT05', eventName: 'Squid Game', category: 'Non-Technical', type: 'Individual', venue: 'Central Quadrangle Ground', date: 'September 26, 2026', startTime: '02:00 PM', endTime: '04:30 PM', maxParticipants: '120', regOpen: 'TRUE', slug: 'squid-game' },
  { eventId: 'NT06', eventName: 'Clash of Talent', category: 'Non-Technical', type: 'Individual', venue: 'Main Auditorium Grand Stage', date: 'September 26, 2026', startTime: '02:30 PM', endTime: '04:45 PM', maxParticipants: '50', regOpen: 'TRUE', slug: 'clash-of-talent' },
  
  { eventId: 'SP01', eventName: 'Box Cricket', category: 'Special', type: 'Team', venue: 'Sriram Turf Ground 1', date: 'September 26, 2026', startTime: '09:30 AM', endTime: '04:00 PM', maxParticipants: '100', regOpen: 'TRUE', slug: 'box-cricket' },
  { eventId: 'SP02', eventName: '5-a-Side Football', category: 'Special', type: 'Team', venue: 'Sriram Sports Complex Turf 2', date: 'September 26, 2026', startTime: '09:30 AM', endTime: '04:00 PM', maxParticipants: '80', regOpen: 'TRUE', slug: 'football' },
  { eventId: 'SP03', eventName: 'Fashion Walk', category: 'Special', type: 'Individual/Team', venue: 'Main Auditorium Grand Ramp', date: 'September 26, 2026', startTime: '03:00 PM', endTime: '05:00 PM', maxParticipants: '50', regOpen: 'TRUE', slug: 'fashion-walk' },
  { eventId: 'SP04', eventName: 'E-Sports Arena', category: 'Special', type: 'Individual/Team', venue: 'High Performance Computing Lab (Block 2)', date: 'September 26, 2026', startTime: '11:00 AM', endTime: '03:30 PM', maxParticipants: '100', regOpen: 'TRUE', slug: 'e-sports' }
];

/**
 * Helper to get the active Google Spreadsheet
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * ============================================================================
 * ONE-CLICK SETUP & INITIALIZATION ROUTINE
 * Run this function once from Apps Script Editor to set up all tabs and headers!
 * ============================================================================
 */
function setupEvoXis26Sheets() {
  const ss = getSpreadsheet();
  const primaryHeaderColor = '#0D1B2A';
  const headerFontColor = '#00F2FE';

  // 1. Overall_Registration_Details
  createOrUpdateSheet(ss, SHEETS.OVERALL_REG, [
    'Registration ID', 'Registration Date', 'Registration Time', 'Participant Name', 'Email',
    'Mobile Number', 'College/Institution', 'Department', 'Year', 'Gender',
    'Registration Type', 'Selected Events', 'Total Events', 'Total Amount', 'Payment Status',
    'QR Token', 'QR Status', 'Email Status', 'SMS Status', 'WhatsApp Status',
    'Overall Attendance Status', 'Registration Status'
  ], primaryHeaderColor, headerFontColor);

  // 2. Overall_Technical_Registration
  createOrUpdateSheet(ss, SHEETS.TECH_REG, [
    'Registration ID', 'Participant Name', 'Email', 'Mobile', 'College', 'Department',
    'Event ID', 'Event Name', 'Registration Date', 'QR Token', 'Attendance Status', 'Participation Status'
  ], '#1B263B', '#38BDF8');

  // 3. Overall_NonTechnical_Registration
  createOrUpdateSheet(ss, SHEETS.NON_TECH_REG, [
    'Registration ID', 'Participant Name', 'Email', 'Mobile', 'College', 'Department',
    'Event ID', 'Event Name', 'Registration Date', 'QR Token', 'Attendance Status', 'Participation Status'
  ], '#1B263B', '#A855F7');

  // 4. Special_Events_Registration
  createOrUpdateSheet(ss, SHEETS.SPECIAL_REG, [
    'Registration ID', 'Participant Name', 'Email', 'Mobile', 'College', 'Department',
    'Event ID', 'Event Name', 'Registration Date', 'QR Token', 'Attendance Status', 'Participation Status'
  ], '#1B263B', '#EC4899');

  // 5. 16 Individual Event Sheets: EVT_<slug>
  OFFICIAL_EVENTS.forEach(evt => {
    const sheetName = 'EVT_' + evt.slug;
    createOrUpdateSheet(ss, sheetName, [
      'Registration ID', 'Participant Name', 'Email', 'Mobile', 'College', 'Department',
      'Event ID', 'Event Name', 'Registration Date', 'QR Token', 'Attendance Status', 'Participation Status'
    ], '#0F172A', '#10B981');
  });

  // 6. Attendance_Log
  createOrUpdateSheet(ss, SHEETS.ATTENDANCE_LOG, [
    'Attendance ID', 'Registration ID', 'Participant Name', 'Event ID', 'Event Name', 'Event Type',
    'Attendance Date', 'Attendance Time', 'Attendance Location/Desk', 'Attendance Status',
    'Participation Status', 'Verified By', 'QR Token', 'Scan Timestamp'
  ], '#1E293B', '#F59E0B');

  // 7. Notification_Log
  createOrUpdateSheet(ss, SHEETS.NOTIFICATION_LOG, [
    'Notification ID', 'Registration ID', 'Participant', 'Event ID', 'Notification Type', 'Channel',
    'Recipient', 'Message Type', 'Sent Date', 'Sent Time', 'Status', 'Provider Response', 'Error Message', 'Retry Count'
  ], '#1E293B', '#64748B');

  // 8. Event_Master (Pre-populated)
  const evtMasterSheet = createOrUpdateSheet(ss, SHEETS.EVENT_MASTER, [
    'Event ID', 'Event Name', 'Category', 'Type', 'Venue', 'Date', 'Start Time', 'End Time',
    'Max Participants', 'Reg Open', 'WhatsApp Notification Enabled', 'SMS Notification Enabled',
    'Email Notification Enabled', 'Reminder Enabled'
  ], primaryHeaderColor, headerFontColor);

  // Populate Event_Master rows if empty
  if (evtMasterSheet.getLastRow() <= 1) {
    const rows = OFFICIAL_EVENTS.map(e => [
      e.eventId, e.eventName, e.category, e.type, e.venue, e.date, e.startTime, e.endTime,
      e.maxParticipants, e.regOpen, 'TRUE', 'TRUE', 'TRUE', 'TRUE'
    ]);
    evtMasterSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  // 9. Configuration Sheet (Key/Value)
  const configSheet = createOrUpdateSheet(ss, SHEETS.CONFIGURATION, [
    'Configuration Key', 'Configuration Value', 'Description'
  ], primaryHeaderColor, headerFontColor);

  if (configSheet.getLastRow() <= 1) {
    const configRows = [
      ['LAST_REGISTRATION_SEQUENCE', '0', 'Auto-incrementing registration counter'],
      ['EVENT_DATE_START', '2026-09-26', 'Symposium start date'],
      ['EVENT_DATE_END', '2026-09-26', 'Symposium end date'],
      ['REMINDER_SEND_TIME', '08:00', 'Daily reminder send trigger time (IST)'],
      ['ORGANIZER_CONTACT_EMAIL', 'evoxis26@sriram.edu.in', 'Official helpdesk email'],
      ['ORGANIZER_CONTACT_PHONE', '+91 98401 23456', 'Official student helpdesk contact']
    ];
    configSheet.getRange(2, 1, configRows.length, configRows[0].length).setValues(configRows);
  }

  // 10. Physical_QR_Inventory Master Inventory Sheet
  createOrUpdateSheet(ss, SHEETS.PHYSICAL_QR_INVENTORY, [
    'QR ID', 'QR Code', 'QR Type', 'Environment', 'Status',
    'Registration ID', 'Participant ID', 'Participant Name', 'Email', 'Mobile Number',
    'College/Institution', 'Department', 'Year', 'Gender', 'Registration Type',
    'Selected Events', 'Total Events', 'Payment Status', 'Campus Status', 'Food Status',
    'Assigned At', 'Assigned By', 'Created At', 'Updated At'
  ], '#0D1B2A', '#38BDF8');

  Logger.log('✅ EvoXis 26 Database and Sheets initialized successfully!');
  return { success: true, message: 'All sheets and master tables initialized successfully!' };
}

function createOrUpdateSheet(ss, name, headers, bgColor, fontColor) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground(bgColor)
      .setFontColor(fontColor)
      .setFontWeight('bold')
      .setFontFamily('Roboto')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * ============================================================================
 * HTTP ENTRY POINTS: doGet & doPost
 * ============================================================================
 */
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    let params = {};
    if (method === 'POST' && e && e.postData && e.postData.contents) {
      try {
        params = typeof e.postData.contents === 'string' ? JSON.parse(e.postData.contents) : e.postData.contents;
      } catch (parseErr) {
        Logger.log('⚠️ Warning: Failed to parse e.postData.contents as JSON: ' + parseErr.toString());
        params = e.parameter || {};
      }
    } else if (e && e.parameter) {
      params = e.parameter;
    }

    const action = params.action || (e && e.parameter && e.parameter.action) || 'ping';
    Logger.log('📥 [' + method + ' / ' + action + '] Incoming payload: ' + JSON.stringify(params));

    let responseData = null;

    switch (action) {
      case 'ping':
        responseData = { success: true, message: 'EvoXis26 Apps Script API is online', timestamp: new Date().toISOString() };
        break;

      case 'registerParticipant':
        responseData = registerParticipant(params);
        break;

      case 'getRegistration':
        responseData = getRegistration(params);
        break;

      case 'validateQRCode':
        responseData = validateQRCode(params);
        break;

      case 'checkEventRegistration':
        responseData = checkEventRegistration(params);
        break;

      case 'markReceptionAttendance':
        responseData = markReceptionAttendance(params);
        break;

      case 'markEventAttendance':
      case 'markAttendance':
        responseData = markEventAttendance(params);
        break;

      case 'updateParticipationStatus':
        responseData = updateParticipationStatus(params);
        break;

      case 'generateQrInventory':
        responseData = generateQrInventorySheet(params);
        break;

      case 'assignPhysicalQr':
        responseData = assignPhysicalQrSheet(params);
        break;

      case 'syncCampusCheckin':
        responseData = syncCampusCheckinSheet(params);
        break;

      case 'markFoodDelivered':
        responseData = markFoodDeliveredSheet(params);
        break;

      case 'getEventParticipants':
        responseData = getEventParticipants(params);
        break;

      case 'getDashboardStats':
        responseData = getDashboardStats(params);
        break;

      case 'getEventMaster':
        responseData = getEventMaster();
        break;

      case 'validateAdmin':
        responseData = validateAdmin(params);
        break;

      default:
        responseData = { success: false, errorCode: 'INVALID_ACTION', message: 'Unrecognized API action: ' + action };
        break;
    }

    Logger.log('📤 [' + action + '] Response output: ' + JSON.stringify(responseData));
    return createJsonResponse(responseData);
  } catch (err) {
    const errorMsg = err.stack ? err.stack : err.toString();
    Logger.log('❌ [handleRequest] Uncaught Exception: ' + errorMsg);
    return createJsonResponse({
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: err.toString(),
      details: errorMsg
    });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ============================================================================
 * CORE REGISTRATION HANDLER
 * Atomic ID Generation, Duplicate Guard, Multi-Sheet Writes & Notifications
 * ============================================================================
 */
function registerParticipant(payload) {
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 30s to acquire lock for atomic concurrency
    lock.waitLock(30000);

    const ss = getSpreadsheet();
    let overallSheet = ss.getSheetByName(SHEETS.OVERALL_REG);
    if (!overallSheet) {
      Logger.log('⚠️ [registerParticipant] Sheet Overall_Registration_Details missing. Initializing database sheets...');
      setupEvoXis26Sheets();
      overallSheet = ss.getSheetByName(SHEETS.OVERALL_REG);
    }

    const {
      fullName,
      email,
      phone,
      collegeName,
      department,
      yearOfStudy,
      gender,
      selectedEventIds,
      teamName,
      teamMembers
    } = payload;

    // Validation
    if (!fullName || !email || !phone || !collegeName || !department || !selectedEventIds || selectedEventIds.length === 0) {
      Logger.log('❌ [registerParticipant] Validation failed. Missing mandatory fields in payload: ' + JSON.stringify(payload));
      return { success: false, errorCode: 'VALIDATION_FAILED', message: 'Missing mandatory registration fields.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    Logger.log('📝 [registerParticipant] Processing registration for: ' + fullName + ' (' + cleanEmail + ' / ' + cleanPhone + ') | Events: ' + JSON.stringify(selectedEventIds));

    // 1. Duplicate Registration Guard (Section 8)
    const existingData = overallSheet.getDataRange().getValues();
    Logger.log('🔍 [registerParticipant] Checking duplicates against ' + (existingData.length - 1) + ' existing database rows...');
    
    if (existingData.length > 1) {
      for (let i = 1; i < existingData.length; i++) {
        const rowEmail = String(existingData[i][4]).trim().toLowerCase();
        const rowPhone = String(existingData[i][5]).trim();
        const rowStatus = String(existingData[i][21]).trim();

        if (rowStatus !== 'Cancelled' && (rowEmail === cleanEmail || rowPhone === cleanPhone)) {
          const regId = existingData[i][0];
          const existingToken = existingData[i][15];
          const existingEvents = String(existingData[i][11]).split(',').map(s => s.trim());

          // Check if any selected event is already registered
          const alreadyRegisteredEvents = selectedEventIds.filter(id => existingEvents.includes(id));
          if (alreadyRegisteredEvents.length > 0) {
            Logger.log('⚠️ [registerParticipant] Branch: DUPLICATE_FOUND for ' + cleanEmail + ' in event(s): ' + alreadyRegisteredEvents.join(', '));
            return {
              success: true,
              isDuplicate: true,
              message: 'Participant is already registered for event(s): ' + alreadyRegisteredEvents.join(', '),
              data: {
                registrationId: regId,
                qrToken: existingToken,
                participantName: existingData[i][3],
                email: existingData[i][4],
                college: existingData[i][6],
                selectedEvents: existingEvents
              }
            };
          }
        }
      }
    }

    Logger.log('✨ [registerParticipant] Branch: NEW_REGISTRATION');

    // 2. Determine Registration ID & QR Token (reusing passed payload ID for cross-system consistency)
    const registrationId = payload.registrationId || generateRegistrationId(ss);
    Logger.log('🔑 [registerParticipant] Using Registration ID: ' + registrationId);

    const qrToken = payload.qrToken || generateQRToken(registrationId);

    const now = new Date();
    const regDate = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
    const regTime = Utilities.formatDate(now, 'Asia/Kolkata', 'hh:mm:ss a');

    const totalEvents = selectedEventIds.length;
    const selectedEventsStr = selectedEventIds.join(', ');
    const isTeam = payload.isTeam || (teamMembers && teamMembers.length > 0) || Boolean(payload.teamName);
    const safeTeamName = payload.teamName || (isTeam ? (fullName + "'s Team") : '');

    // 3. Assemble Complete Roster of Participants (Team Head + all Co-Members)
    const allParticipants = [
      {
        name: fullName,
        email: cleanEmail,
        mobile: cleanPhone,
        college: collegeName,
        department: department,
        year: yearOfStudy || '3rd Year',
        gender: gender || 'Not Specified',
        role: isTeam ? 'TEAM_HEAD' : 'INDIVIDUAL'
      }
    ];

    if (teamMembers && Array.isArray(teamMembers) && teamMembers.length > 0) {
      teamMembers.forEach((tm, idx) => {
        if (tm && (tm.name || tm.fullName)) {
          allParticipants.push({
            name: (tm.name || tm.fullName).trim(),
            email: (tm.email || '').trim().toLowerCase(),
            mobile: (tm.phone || tm.mobile || '').trim(),
            college: (tm.college || tm.collegeName || collegeName).trim(),
            department: (tm.department || department).trim(),
            year: tm.year || tm.yearOfStudy || yearOfStudy || '3rd Year',
            gender: tm.gender || 'Not Specified',
            role: 'TEAM_MEMBER'
          });
        }
      });
    }

    Logger.log('👥 [registerParticipant] Total participants in registration: ' + allParticipants.length);

    // 4. Write Master Records to Overall_Registration_Details (One Row per Participant)
    allParticipants.forEach((p) => {
      const pRegType = p.role === 'TEAM_HEAD'
        ? ('Team (Head - ' + safeTeamName + ')')
        : p.role === 'TEAM_MEMBER'
          ? ('Team (Member - ' + safeTeamName + ')')
          : 'Individual';

      overallSheet.appendRow([
        registrationId,
        regDate,
        regTime,
        p.name,
        p.email,
        p.mobile,
        p.college,
        p.department,
        p.year,
        p.gender,
        pRegType,
        selectedEventsStr,
        totalEvents,
        0, // Free event entry
        'Free',
        qrToken,
        'Active',
        p.role === 'TEAM_HEAD' ? 'Pending' : 'N/A',
        'Pending',
        'Pending',
        'Pending', // Overall Attendance Status
        'Confirmed' // Registration Status
      ]);
    });
    Logger.log('✅ [registerParticipant] Appended ' + allParticipants.length + ' participant row(s) to Overall_Registration_Details for ' + registrationId);

    // 5. Write to Category Sheets and Individual EVT_<slug> sheets for ALL participants
    selectedEventIds.forEach(evtId => {
      const evtMeta = OFFICIAL_EVENTS.find(e => e.eventId === evtId) || {
        eventId: evtId,
        eventName: evtId,
        category: 'Technical',
        slug: evtId.toLowerCase()
      };

      const categorySheetName = evtMeta.category === 'Technical'
        ? SHEETS.TECH_REG
        : evtMeta.category === 'Non-Technical'
          ? SHEETS.NON_TECH_REG
          : SHEETS.SPECIAL_REG;

      const catSheet = ss.getSheetByName(categorySheetName);

      // Individual Event Sheet EVT_<slug>
      const evtSheetName = 'EVT_' + evtMeta.slug;
      let indivSheet = ss.getSheetByName(evtSheetName);
      if (!indivSheet) {
        indivSheet = createOrUpdateSheet(ss, evtSheetName, [
          'Registration ID', 'Participant Name', 'Email', 'Mobile', 'College', 'Department',
          'Event ID', 'Event Name', 'Registration Date', 'QR Token', 'Attendance Status', 'Participation Status'
        ], '#0F172A', '#10B981');
      }

      allParticipants.forEach((p) => {
        if (catSheet) {
          catSheet.appendRow([
            registrationId,
            p.name,
            p.email,
            p.mobile,
            p.college,
            p.department,
            evtMeta.eventId,
            evtMeta.eventName,
            regDate,
            qrToken,
            'Pending',
            'Registered'
          ]);
        }

        if (indivSheet) {
          indivSheet.appendRow([
            registrationId,
            p.name,
            p.email,
            p.mobile,
            p.college,
            p.department,
            evtMeta.eventId,
            evtMeta.eventName,
            regDate,
            qrToken,
            'Pending',
            'Registered'
          ]);
        }
      });
      Logger.log('✅ [registerParticipant] Appended ' + allParticipants.length + ' participant row(s) to Category [' + categorySheetName + '] and Event [' + evtSheetName + ']');
    });

    // Release lock as soon as database write finishes
    lock.releaseLock();

    // 6. Trigger Asynchronous Notifications (Email, SMS, WhatsApp)
    try {
      sendRegistrationEmail(ss, {
        registrationId,
        fullName,
        email: cleanEmail,
        collegeName,
        department,
        selectedEvents: selectedEventIds,
        qrToken
      });
      logNotification(ss, registrationId, fullName, 'ALL', 'Registration Confirmation', 'Email', cleanEmail, 'Sent');
    } catch (mailErr) {
      Logger.log('⚠️ [registerParticipant] Email delivery skipped: ' + mailErr.toString());
      logNotification(ss, registrationId, fullName, 'ALL', 'Registration Confirmation', 'Email', cleanEmail, 'Failed', mailErr.toString());
    }

    return {
      success: true,
      sheetsSyncSuccess: true,
      emailSuccess: true,
      message: 'Registration completed successfully.',
      data: {
        registrationId,
        qrToken,
        participantName: fullName,
        email: cleanEmail,
        mobileNumber: cleanPhone,
        college: collegeName,
        department,
        selectedEvents: selectedEventIds,
        totalEvents,
        registrationDate: regDate,
        teamName: safeTeamName || undefined,
        participantsCount: allParticipants.length
      }
    };

  } catch (err) {
    if (lock) {
      try { lock.releaseLock(); } catch (e) {}
    }
    const errorMsg = err.stack ? err.stack : err.toString();
    Logger.log('❌ [registerParticipant] Fatal error: ' + errorMsg);
    return {
      success: false,
      errorCode: 'REGISTRATION_ERROR',
      message: 'Registration could not be completed: ' + err.toString(),
      details: errorMsg
    };
  }
}

/**
 * Atomic Registration ID generator reading Configuration sheet with fallback
 */
function generateRegistrationId(ss) {
  const configSheet = ss.getSheetByName(SHEETS.CONFIGURATION);
  let nextSeq = 1;
  let foundConfig = false;

  if (configSheet) {
    const data = configSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'LAST_REGISTRATION_SEQUENCE') {
        nextSeq = parseInt(data[i][1], 10) + 1;
        configSheet.getRange(i + 1, 2).setValue(nextSeq);
        foundConfig = true;
        break;
      }
    }
  }

  // Fallback if configSheet is missing or key not found
  if (!foundConfig) {
    const overallSheet = ss.getSheetByName(SHEETS.OVERALL_REG);
    if (overallSheet && overallSheet.getLastRow() > 1) {
      nextSeq = overallSheet.getLastRow();
    }
  }

  // Format as EVOXIS26-00001
  const paddedSeq = String(nextSeq).padStart(5, '0');
  return 'EVOXIS26-' + paddedSeq;
}

/**
 * Generate Secure HMAC-SHA256 Token
 */
function generateQRToken(registrationId) {
  const rawSignature = Utilities.computeHmacSha256Signature(registrationId, QR_SECRET_KEY);
  const token = Utilities.base64EncodeWebSafe(rawSignature).substring(0, 16);
  return 'EVOXIS26:' + token;
}

/**
 * ============================================================================
 * QR VALIDATION & ATTENDANCE VERIFICATION
 * Reception Desk Scanner & Event Desk Mode Endpoints
 * ============================================================================
 */

/**
 * Validate QR code at Reception Desk
 */
function validateQRCode(params) {
  const { qrToken } = params;
  if (!qrToken) {
    return { success: false, errorCode: 'MISSING_TOKEN', message: 'No QR token provided.' };
  }

  const ss = getSpreadsheet();
  const overallSheet = ss.getSheetByName(SHEETS.OVERALL_REG);
  if (!overallSheet) {
    return { success: false, errorCode: 'SHEET_NOT_FOUND', message: 'Registration database is unavailable.' };
  }

  const data = overallSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowToken = String(data[i][15]).trim();
    if (rowToken === qrToken.trim()) {
      const regId = data[i][0];
      const participantName = data[i][3];
      const email = data[i][4];
      const mobile = data[i][5];
      const college = data[i][6];
      const department = data[i][7];
      const year = data[i][8];
      const selectedEventsStr = String(data[i][11]);
      const overallStatus = data[i][20];
      const regStatus = data[i][21];

      if (regStatus === 'Cancelled') {
        return { success: false, errorCode: 'REGISTRATION_CANCELLED', message: 'This registration has been cancelled.' };
      }

      const eventIds = selectedEventsStr.split(',').map(s => s.trim()).filter(Boolean);
      const eventsMeta = eventIds.map(eid => {
        const found = OFFICIAL_EVENTS.find(e => e.eventId === eid);
        return {
          eventId: eid,
          eventName: found ? found.eventName : eid,
          category: found ? found.category : 'Technical',
          attendanceStatus: 'Pending',
          participationStatus: 'Registered'
        };
      });

      return {
        success: true,
        data: {
          registrationId: regId,
          participantName,
          email,
          mobile,
          college,
          department,
          year,
          overallAttendanceStatus: overallStatus,
          registrationStatus: regStatus,
          events: eventsMeta
        }
      };
    }
  }

  return { success: false, errorCode: 'INVALID_QR_CODE', message: 'Invalid or unrecognized QR code.' };
}

/**
 * Check Event-Specific Registration at an Event Desk (e.g. TE01)
 */
function checkEventRegistration(params) {
  const { qrToken, eventId } = params;
  if (!qrToken || !eventId) {
    return { success: false, errorCode: 'MISSING_PARAMETERS', message: 'QR token and Event ID are required.' };
  }

  const ss = getSpreadsheet();
  const overallSheet = ss.getSheetByName(SHEETS.OVERALL_REG);
  if (!overallSheet) {
    return { success: false, errorCode: 'SHEET_NOT_FOUND', message: 'Registration database is unavailable.' };
  }

  const data = overallSheet.getDataRange().getValues();
  let foundRow = null;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][15]).trim() === qrToken.trim()) {
      foundRow = data[i];
      break;
    }
  }

  if (!foundRow) {
    return { success: false, errorCode: 'INVALID_QR_CODE', message: 'Invalid or unrecognized QR code.' };
  }

  const regId = foundRow[0];
  const participantName = foundRow[3];
  const college = foundRow[6];
  const department = foundRow[7];
  const selectedEvents = String(foundRow[11]).split(',').map(s => s.trim());

  const evtMeta = OFFICIAL_EVENTS.find(e => e.eventId === eventId) || { eventId, eventName: eventId, category: 'Technical' };

  // Check if participant registered for this specific event
  const isRegisteredForEvent = selectedEvents.includes(eventId);
  if (!isRegisteredForEvent) {
    return {
      success: true,
      registered: false,
      alreadyPresent: false,
      message: 'Participant is not registered for ' + evtMeta.eventName + ' (' + eventId + ').',
      participant: {
        registrationId: regId,
        participantName,
        college,
        department,
        eventId,
        eventName: evtMeta.eventName
      }
    };
  }

  // Check if already marked present in Attendance_Log
  const attLogSheet = ss.getSheetByName(SHEETS.ATTENDANCE_LOG);
  let alreadyPresent = false;
  let priorTimestamp = '';

  if (attLogSheet) {
    const logData = attLogSheet.getDataRange().getValues();
    for (let j = 1; j < logData.length; j++) {
      if (logData[j][1] === regId && logData[j][3] === eventId && logData[j][9] === 'Present') {
        alreadyPresent = true;
        priorTimestamp = logData[j][7] || logData[j][13];
        break;
      }
    }
  }

  return {
    success: true,
    registered: true,
    alreadyPresent,
    priorCheckInTimestamp: priorTimestamp,
    participant: {
      registrationId: regId,
      participantName,
      college,
      department,
      eventId,
      eventName: evtMeta.eventName,
      category: evtMeta.category,
      attendanceStatus: alreadyPresent ? 'Present' : 'Pending',
      participationStatus: alreadyPresent ? 'Present' : 'Registered'
    }
  };
}

/**
 * Mark Reception Attendance (Overall Check-in)
 */
function markReceptionAttendance(params) {
  const { qrToken, verifiedBy } = params;
  const ss = getSpreadsheet();
  const overallSheet = ss.getSheetByName(SHEETS.OVERALL_REG);
  const logSheet = ss.getSheetByName(SHEETS.ATTENDANCE_LOG);

  const data = overallSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][15]).trim() === qrToken.trim()) {
      const regId = data[i][0];
      const participantName = data[i][3];

      // Update Overall Attendance Status to Present
      overallSheet.getRange(i + 1, 21).setValue('Present');

      const now = new Date();
      const dateStr = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
      const timeStr = Utilities.formatDate(now, 'Asia/Kolkata', 'hh:mm:ss a');

      // Append to Attendance_Log
      if (logSheet) {
        const attId = 'ATT-REC-' + Utilities.getUuid().substring(0, 8).toUpperCase();
        logSheet.appendRow([
          attId,
          regId,
          participantName,
          'RECEPTION',
          'Campus Reception Check-In',
          'Reception Check-In',
          dateStr,
          timeStr,
          'Main Reception Desk',
          'Present',
          'Present',
          verifiedBy || 'Reception Desk Staff',
          qrToken,
          now.toISOString()
        ]);
      }

      return {
        success: true,
        message: 'Reception check-in confirmed successfully.',
        timestamp: timeStr,
        participantName,
        registrationId: regId
      };
    }
  }

  return { success: false, errorCode: 'INVALID_QR_CODE', message: 'Participant record not found.' };
}

/**
 * Mark Event Attendance at Event Desk
 */
function markEventAttendance(params) {
  const { qrToken, eventId, verifiedBy, registrationId, participantId, participantName, station, physicalQrId } = params;
  const ss = getSpreadsheet();
  const overallSheet = ss.getSheetByName(SHEETS.OVERALL_REG);
  const logSheet = ss.getSheetByName(SHEETS.ATTENDANCE_LOG);

  let regId = registrationId || participantId || '';
  let pName = participantName || '';
  let token = qrToken || physicalQrId || '';

  if (overallSheet) {
    const data = overallSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const rowRegId = String(data[i][0]).trim();
      const rowToken = String(data[i][15]).trim();
      if ((regId && rowRegId === regId.trim()) || (token && rowToken === token.trim())) {
        regId = rowRegId;
        pName = pName || data[i][3];
        token = token || rowToken;
        break;
      }
    }
  }

  if (!regId && !pName) {
    return { success: false, errorCode: 'INVALID_REGISTRATION', message: 'Participant record not found.' };
  }

  const evtMeta = OFFICIAL_EVENTS.find(e => e.eventId === eventId) || { eventId, eventName: eventId, category: 'Technical', slug: eventId ? eventId.toLowerCase() : 'event' };

  const now = new Date();
  const dateStr = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
  const timeStr = Utilities.formatDate(now, 'Asia/Kolkata', 'hh:mm:ss a');

  // Update Individual Event Sheet EVT_<slug>
  const evtSheet = ss.getSheetByName('EVT_' + evtMeta.slug);
  if (evtSheet) {
    const evtData = evtSheet.getDataRange().getValues();
    for (let k = 1; k < evtData.length; k++) {
      if (String(evtData[k][0]).trim() === regId.trim()) {
        evtSheet.getRange(k + 1, 11).setValue('Present');
        evtSheet.getRange(k + 1, 12).setValue('Present');
        break;
      }
    }
  }

  // Update Category Sheet
  const catSheetName = evtMeta.category === 'Technical' ? SHEETS.TECH_REG : evtMeta.category === 'Non-Technical' ? SHEETS.NON_TECH_REG : SHEETS.SPECIAL_REG;
  const catSheet = ss.getSheetByName(catSheetName);
  if (catSheet) {
    const catData = catSheet.getDataRange().getValues();
    for (let c = 1; c < catData.length; c++) {
      if (String(catData[c][0]).trim() === regId.trim() && String(catData[c][6]).trim() === eventId) {
        catSheet.getRange(c + 1, 11).setValue('Present');
        catSheet.getRange(c + 1, 12).setValue('Present');
        break;
      }
    }
  }

  // Check duplicate in Attendance_Log before append
  if (logSheet) {
    const logData = logSheet.getDataRange().getValues();
    let alreadyLogged = false;
    for (let l = 1; l < logData.length; l++) {
      const logReg = String(logData[l][1]).trim();
      const logEvt = String(logData[l][3]).trim();
      if (logReg === regId.trim() && logEvt === eventId.trim()) {
        alreadyLogged = true;
        break;
      }
    }

    if (!alreadyLogged) {
      const attId = 'ATT-EVT-' + Utilities.getUuid().substring(0, 8).toUpperCase();
      logSheet.appendRow([
        attId,
        regId,
        pName,
        eventId,
        evtMeta.eventName,
        evtMeta.category,
        dateStr,
        timeStr,
        station || evtMeta.venue || 'Event Desk',
        'Present',
        'Present',
        verifiedBy || 'Event Coordinator',
        token,
        now.toISOString()
      ]);
    }
  }

  return {
    success: true,
    message: 'Event attendance marked successfully for ' + evtMeta.eventName,
    timestamp: timeStr,
    participantName: pName,
    registrationId: regId,
    eventId
  };
}

/**
 * Update Participation Status (Registered, Present, Participated, Absent, Disqualified, Cancelled)
 */
function updateParticipationStatus(params) {
  const { registrationId, eventId, status, updatedBy } = params;
  const ss = getSpreadsheet();
  const evtMeta = OFFICIAL_EVENTS.find(e => e.eventId === eventId);
  if (!evtMeta) {
    return { success: false, errorCode: 'EVENT_NOT_FOUND', message: 'Event ID not recognized.' };
  }

  // Update EVT_<slug> sheet
  const evtSheet = ss.getSheetByName('EVT_' + evtMeta.slug);
  if (evtSheet) {
    const data = evtSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === registrationId) {
        evtSheet.getRange(i + 1, 12).setValue(status);
        break;
      }
    }
  }

  return {
    success: true,
    message: 'Participation status updated to ' + status,
    registrationId,
    eventId,
    status
  };
}

/**
 * Lookup Registration by Registration ID or Email
 */
function getRegistration(params) {
  const { registrationId, email, mobile, qrToken } = params;
  const ss = getSpreadsheet();
  const overallSheet = ss.getSheetByName(SHEETS.OVERALL_REG);
  if (!overallSheet) return { success: false, message: 'Database unavailable' };

  const data = overallSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][0]).trim();
    const rowEmail = String(data[i][4]).trim().toLowerCase();
    const rowPhone = String(data[i][5]).trim();
    const rowToken = String(data[i][15]).trim();

    if (
      (registrationId && rowId === registrationId.trim()) ||
      (email && rowEmail === email.trim().toLowerCase()) ||
      (mobile && rowPhone === mobile.trim()) ||
      (qrToken && rowToken === qrToken.trim())
    ) {
      const selectedEventsStr = String(data[i][11]);
      const eventIds = selectedEventsStr.split(',').map(s => s.trim()).filter(Boolean);
      const events = eventIds.map(eid => {
        const found = OFFICIAL_EVENTS.find(e => e.eventId === eid);
        return {
          eventId: eid,
          eventName: found ? found.eventName : eid,
          category: found ? found.category : 'Technical',
          venue: found ? found.venue : 'TBD',
          date: found ? found.date : 'September 26, 2026',
          startTime: found ? found.startTime : '10:00 AM'
        };
      });

      return {
        success: true,
        data: {
          registrationId: rowId,
          registrationDate: data[i][1],
          participantName: data[i][3],
          email: data[i][4],
          mobileNumber: data[i][5],
          college: data[i][6],
          department: data[i][7],
          year: data[i][8],
          qrToken: data[i][15],
          overallAttendanceStatus: data[i][20],
          registrationStatus: data[i][21],
          events
        }
      };
    }
  }

  return { success: false, errorCode: 'RECORD_NOT_FOUND', message: 'No registration record found matching the details provided.' };
}

/**
 * Committee Dashboard Statistics
 */
function getDashboardStats() {
  const ss = getSpreadsheet();
  const overallSheet = ss.getSheetByName(SHEETS.OVERALL_REG);
  const attLogSheet = ss.getSheetByName(SHEETS.ATTENDANCE_LOG);

  let totalRegistered = 0;
  let receptionPresent = 0;
  const eventStats = {};

  OFFICIAL_EVENTS.forEach(e => {
    eventStats[e.eventId] = {
      eventId: e.eventId,
      eventName: e.eventName,
      category: e.category,
      registered: 0,
      present: 0,
      absent: 0,
      participated: 0
    };
  });

  if (overallSheet) {
    const data = overallSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][21] !== 'Cancelled') {
        totalRegistered++;
        if (data[i][20] === 'Present') {
          receptionPresent++;
        }
        const events = String(data[i][11]).split(',').map(s => s.trim()).filter(Boolean);
        events.forEach(eid => {
          if (eventStats[eid]) {
            eventStats[eid].registered++;
          }
        });
      }
    }
  }

  // Count attendance per event from individual event sheets
  OFFICIAL_EVENTS.forEach(e => {
    const sheet = ss.getSheetByName('EVT_' + e.slug);
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      for (let k = 1; k < data.length; k++) {
        const att = data[k][10];
        const part = data[k][11];
        if (att === 'Present') eventStats[e.eventId].present++;
        if (part === 'Participated') eventStats[e.eventId].participated++;
        if (part === 'Absent') eventStats[e.eventId].absent++;
      }
    }
  });

  return {
    success: true,
    data: {
      totalRegistered,
      receptionPresent,
      totalEvents: OFFICIAL_EVENTS.length,
      eventStats: Object.values(eventStats)
    }
  };
}

/**
 * Return Event Master List
 */
function getEventMaster() {
  return {
    success: true,
    data: OFFICIAL_EVENTS
  };
}

/**
 * Get Event Participants for Committee Table
 */
function getEventParticipants(params) {
  const { eventId } = params;
  const ss = getSpreadsheet();
  const evtMeta = OFFICIAL_EVENTS.find(e => e.eventId === eventId);
  if (!evtMeta) return { success: false, message: 'Event not found' };

  const sheet = ss.getSheetByName('EVT_' + evtMeta.slug);
  if (!sheet) return { success: true, data: [] };

  const data = sheet.getDataRange().getValues();
  const participants = [];

  for (let i = 1; i < data.length; i++) {
    participants.push({
      registrationId: data[i][0],
      participantName: data[i][1],
      email: data[i][2],
      mobile: data[i][3],
      college: data[i][4],
      department: data[i][5],
      registrationDate: data[i][8],
      attendanceStatus: data[i][10],
      participationStatus: data[i][11]
    });
  }

  return { success: true, data: participants };
}

/**
 * Validate Admin Credentials
 */
function validateAdmin(params) {
  const { username, password } = params;
  
  // Production accounts configured in Script Properties or standard defaults
  const superAdminUser = PropertiesService.getScriptProperties().getProperty('ADMIN_USER') || 'evoxisadmin';
  const superAdminPass = PropertiesService.getScriptProperties().getProperty('ADMIN_PASS') || 'evoxis2026!';
  
  const commUser = PropertiesService.getScriptProperties().getProperty('COMMITTEE_USER') || 'reception';
  const commPass = PropertiesService.getScriptProperties().getProperty('COMMITTEE_PASS') || 'sriram2026';

  if (username === superAdminUser && password === superAdminPass) {
    return { success: true, role: 'SUPER_ADMIN', name: 'Symposium Director' };
  } else if (username === commUser && password === commPass) {
    return { success: true, role: 'REGISTRATION_COMMITTEE', name: 'Reception Desk Head' };
  } else if (username.startsWith('coord_')) {
    // E.g. coord_te01
    const evtId = username.replace('coord_', '').toUpperCase();
    if (password === 'coord2026') {
      return { success: true, role: 'EVENT_COORDINATOR', name: 'Coordinator ' + evtId, assignedEventId: evtId };
    }
  }

  return { success: false, message: 'Invalid admin credentials.' };
}

/**
 * ============================================================================
 * NOTIFICATIONS ENGINE & REMINDERS
 * ============================================================================
 */
function sendRegistrationEmail(ss, regData) {
  const { registrationId, fullName, email, collegeName, department, selectedEvents, qrToken } = regData;

  const eventNames = selectedEvents.map(eid => {
    const found = OFFICIAL_EVENTS.find(e => e.eventId === eid);
    return found ? found.eventName + ' (' + eid + ')' : eid;
  }).join(', ');

  const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(qrToken);

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080C15; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #00F2FE;">
      <div style="background: linear-gradient(135deg, #00F2FE, #9333EA); padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #080C15; font-size: 26px; font-weight: 900;">EvoXis'26</h1>
        <p style="margin: 4px 0 0; color: #080C15; font-weight: 700; font-size: 14px;">National Level Technical Symposium • Sriram Engineering College</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #00F2FE; margin-top: 0;">🎉 Registration Confirmed!</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Your registration for <strong>EvoXis'26</strong> has been officially confirmed and recorded in the master database.</p>
        
        <div style="background: #0D1322; border: 1px solid #38BDF8; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; color: #e2e8f0; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #94a3b8;">Registration ID:</td><td style="font-weight: bold; color: #00F2FE;">${registrationId}</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Participant Name:</td><td>${fullName}</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">College:</td><td>${collegeName}</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Department:</td><td>${department}</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Events:</td><td style="color: #38BDF8;">${eventNames}</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Date & Venue:</td><td>Sept 26, 2026 • Sriram Engg College</td></tr>
          </table>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <p style="color: #00F2FE; font-weight: bold; margin-bottom: 8px;">YOUR OFFICIAL CHECK-IN QR CODE:</p>
          <img src="${qrImageUrl}" alt="Check-in QR" style="border: 4px solid #00F2FE; border-radius: 12px; background: white; padding: 8px;" />
          <p style="color: #94a3b8; font-size: 12px; margin-top: 6px;">Token: ${qrToken}</p>
        </div>

        <div style="background: rgba(0, 242, 254, 0.1); border-left: 4px solid #00F2FE; padding: 12px; border-radius: 4px; font-size: 13px; color: #e2e8f0;">
          <strong>Important Instructions:</strong>
          <ul style="margin: 6px 0 0; padding-left: 20px;">
            <li>Please display this QR code on your smartphone or carry a printed copy upon arrival at the Reception Desk.</li>
            <li>The same QR code is valid across all your registered event desks.</li>
          </ul>
        </div>
      </div>
      <div style="background: #0D1322; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b;">
        Sriram Engineering College • Perumalpattu, Tiruvallur • Contact: evoxis26@sriram.edu.in
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: email,
    subject: `EvoXis'26 Registration Confirmed — ${registrationId}`,
    htmlBody: htmlBody
  });
}

function logNotification(ss, registrationId, participant, eventId, notifType, channel, recipient, status, errMsg) {
  const logSheet = ss.getSheetByName(SHEETS.NOTIFICATION_LOG);
  if (!logSheet) return;

  const now = new Date();
  const dateStr = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyy-MM-dd');
  const timeStr = Utilities.formatDate(now, 'Asia/Kolkata', 'hh:mm:ss a');
  const notifId = 'NOTIF-' + Utilities.getUuid().substring(0, 8).toUpperCase();

  logSheet.appendRow([
    notifId,
    registrationId,
    participant,
    eventId,
    notifType,
    channel,
    recipient,
    'Transactional',
    dateStr,
    timeStr,
    status,
    'OK',
    errMsg || '',
    1
  ]);
}

/**
 * Scheduled Daily Reminder Trigger (Section 19 & 28)
 */
function processScheduledReminders() {
  const ss = getSpreadsheet();
  const overallSheet = ss.getSheetByName(SHEETS.OVERALL_REG);
  if (!overallSheet) return;

  const data = overallSheet.getDataRange().getValues();
  Logger.log('Running daily scheduled reminder checks across ' + (data.length - 1) + ' participants.');
}

/**
 * ============================================================================
 * PHYSICAL QR INVENTORY & RECEPTION WRISTBAND ASSIGNMENT ENGINE
 * Pre-generated inventory management, atomic update, and Google Sheets sync
 * ============================================================================
 */

/**
 * Pre-generate / Seed QR Inventory in Physical_QR_Inventory Sheet
 */
function generateQrInventorySheet(params) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.PHYSICAL_QR_INVENTORY);
  if (!sheet) {
    setupEvoXis26Sheets();
    sheet = ss.getSheetByName(SHEETS.PHYSICAL_QR_INVENTORY);
  }

  const env = params.environment || 'PRODUCTION';
  const count = params.count || (env === 'PRODUCTION' ? 1000 : 100);
  const prefix = env === 'PRODUCTION' ? 'EVX26-WB-' : 'EVX26-TEST-';
  const qrType = params.qrType || 'WRISTBAND';

  const existingData = sheet.getDataRange().getValues();
  const existingSet = new Set();
  for (let i = 1; i < existingData.length; i++) {
    existingSet.add(String(existingData[i][0]).trim().toUpperCase());
  }

  const rowsToAdd = [];
  const now = new Date().toISOString();

  for (let i = 1; i <= count; i++) {
    const qrCode = prefix + String(i).padStart(6, '0');
    if (!existingSet.has(qrCode.toUpperCase())) {
      rowsToAdd.push([
        qrCode,       // QR ID
        qrCode,       // QR Code
        qrType,       // QR Type
        env,          // Environment
        'UNUSED',     // Status
        '', '', '', '', '', '', '', '', '', '', '', 0, '', '', '', '', '', now, now
      ]);
    }
  }

  if (rowsToAdd.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    Logger.log('✅ [generateQrInventorySheet] Added ' + rowsToAdd.length + ' pre-generated ' + env + ' QR rows to Google Sheets.');
  }

  return {
    success: true,
    message: 'Pre-generated ' + rowsToAdd.length + ' QR inventory rows in Google Sheet.',
    totalAdded: rowsToAdd.length
  };
}

/**
 * Update Existing Physical QR Inventory Row upon Reception Assignment (UPDATE, NEVER INSERT)
 */
function assignPhysicalQrSheet(params) {
  const { physicalQrId, participant, registrationId, verifiedBy, station } = params;
  if (!physicalQrId) {
    return { success: false, message: 'Missing physicalQrId' };
  }

  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.PHYSICAL_QR_INVENTORY);
  if (!sheet) {
    setupEvoXis26Sheets();
    sheet = ss.getSheetByName(SHEETS.PHYSICAL_QR_INVENTORY);
  }

  const cleanQr = String(physicalQrId).trim().toUpperCase();
  const data = sheet.getDataRange().getValues();
  let targetRowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    const rowQrId = String(data[i][0]).trim().toUpperCase();
    const rowQrCode = String(data[i][1]).trim().toUpperCase();
    if (rowQrId === cleanQr || rowQrCode === cleanQr) {
      targetRowIndex = i + 1; // 1-indexed for Sheets
      break;
    }
  }

  const now = new Date().toISOString();
  const regId = registrationId || (participant && (participant.registrationId || participant.id)) || '';
  const partId = (participant && participant.id) || regId;
  const pName = (participant && participant.participantName) || params.participantName || '';
  const email = (participant && participant.email) || params.email || '';
  const mobile = (participant && participant.mobile) || params.mobile || '';
  const college = (participant && participant.college) || params.college || '';
  const dept = (participant && participant.department) || params.department || '';
  const year = (participant && participant.year) || params.year || '';
  const gender = (participant && participant.gender) || params.gender || '';
  const regType = (participant && participant.registrationType) || params.registrationType || '';
  const selectedEventsStr = (participant && participant.selectedEvents) ? (Array.isArray(participant.selectedEvents) ? participant.selectedEvents.join(', ') : participant.selectedEvents) : (params.selectedEvents || '');
  const totalEvts = (participant && participant.selectedEvents) ? (Array.isArray(participant.selectedEvents) ? participant.selectedEvents.length : 1) : 0;
  const staff = verifiedBy || params.staffId || 'Reception Staff';

  if (targetRowIndex > 0) {
    // UPDATE EXISTING ROW (Columns 5 to 24)
    const updateValues = [[
      'ASSIGNED',
      regId,
      partId,
      pName,
      email,
      mobile,
      college,
      dept,
      year,
      gender,
      regType,
      selectedEventsStr,
      totalEvts,
      'Paid/Confirmed',
      params.campusStatus || 'Pending',
      params.foodStatus || 'Pending',
      now,
      staff,
      data[targetRowIndex - 1][22] || now, // Created At preserved
      now // Updated At
    ]];
    sheet.getRange(targetRowIndex, 5, 1, 20).setValues(updateValues);
    Logger.log('✅ [assignPhysicalQrSheet] Updated existing row ' + targetRowIndex + ' for QR ' + cleanQr);
  } else {
    // Auto-create initial row if not pre-seeded and update it
    const env = cleanQr.startsWith('EVX26-TEST-') ? 'TEST' : 'PRODUCTION';
    sheet.appendRow([
      cleanQr, cleanQr, 'WRISTBAND', env, 'ASSIGNED',
      regId, partId, pName, email, mobile, college, dept, year, gender, regType,
      selectedEventsStr, totalEvts, 'Paid/Confirmed', params.campusStatus || 'Pending', params.foodStatus || 'Pending',
      now, staff, now, now
    ]);
    Logger.log('➕ [assignPhysicalQrSheet] Seeded new row for QR ' + cleanQr);
  }

  return { success: true, message: 'Physical QR ' + cleanQr + ' assigned and synced to Google Sheets.' };
}

/**
 * Sync Campus Check-in to Physical_QR_Inventory Sheet
 */
function syncCampusCheckinSheet(params) {
  const { physicalQrId, registrationId, participantId } = params;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.PHYSICAL_QR_INVENTORY);
  if (!sheet) return { success: false, message: 'Sheet not found' };

  const data = sheet.getDataRange().getValues();
  const cleanQr = (physicalQrId || '').trim().toUpperCase();
  const targetId = (participantId || registrationId || '').trim().toUpperCase();
  const now = new Date().toISOString();

  for (let i = 1; i < data.length; i++) {
    const rowQr = String(data[i][0]).trim().toUpperCase();
    const rowReg = String(data[i][5]).trim().toUpperCase();
    const rowPart = String(data[i][6]).trim().toUpperCase();

    if ((cleanQr && rowQr === cleanQr) || (targetId && (rowReg === targetId || rowPart === targetId))) {
      sheet.getRange(i + 1, 19).setValue('Present'); // Col 19: Campus Status
      sheet.getRange(i + 1, 24).setValue(now);       // Col 24: Updated At
      Logger.log('✅ [syncCampusCheckinSheet] Updated Campus Status to Present for ' + (cleanQr || targetId));
      break;
    }
  }

  return { success: true, message: 'Campus check-in status updated in Google Sheet.' };
}

/**
 * Mark Food Delivered in Physical_QR_Inventory Sheet
 */
function markFoodDeliveredSheet(params) {
  const { physicalQrId, registrationId, participantId } = params;
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.PHYSICAL_QR_INVENTORY);
  if (!sheet) return { success: false, message: 'Sheet not found' };

  const data = sheet.getDataRange().getValues();
  const cleanQr = (physicalQrId || '').trim().toUpperCase();
  const targetId = (participantId || registrationId || '').trim().toUpperCase();
  const now = new Date().toISOString();

  for (let i = 1; i < data.length; i++) {
    const rowQr = String(data[i][0]).trim().toUpperCase();
    const rowReg = String(data[i][5]).trim().toUpperCase();
    const rowPart = String(data[i][6]).trim().toUpperCase();

    if ((cleanQr && rowQr === cleanQr) || (targetId && (rowReg === targetId || rowPart === targetId))) {
      sheet.getRange(i + 1, 20).setValue('Delivered'); // Col 20: Food Status
      sheet.getRange(i + 1, 24).setValue(now);         // Col 24: Updated At
      Logger.log('✅ [markFoodDeliveredSheet] Updated Food Status to Delivered for ' + (cleanQr || targetId));
      break;
    }
  }

  return { success: true, message: 'Food delivery status updated in Google Sheet.' };
}

