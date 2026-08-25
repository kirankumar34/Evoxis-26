import QRCode from 'qrcode';

/**
 * Generate standard QR token string following EVOXIS26 schema
 */
export function generateQRString(registrationId: string): string {
  let hash = 0;
  for (let i = 0; i < registrationId.length; i++) {
    hash = (hash << 5) - hash + registrationId.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const numericPart = registrationId.includes('-')
    ? registrationId.split('-')[1]
    : registrationId.replace(/[^0-9]/g, '');
  return `EVOXIS26:${hex}:${numericPart}`;
}

/**
 * Generate dedicated Team Pass QR token string
 */
export function generateTeamPassToken(registrationId: string): string {
  const numericPart = registrationId.includes('-')
    ? registrationId.split('-')[1]
    : registrationId.replace(/[^0-9]/g, '');
  return `EVOXIS26:TEAM:${numericPart || registrationId}`;
}

/**
 * Validate if a given string follows the EVOXIS26 token format
 */
export function isValidQRToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const clean = token.trim();
  return (
    /^EVOXIS26:TEAM:[0-9A-Za-z_-]+$/i.test(clean) ||
    /^TEAM:[0-9A-Za-z_-]+$/i.test(clean) ||
    /^EVOXIS26:[a-f0-9]{6,16}:[0-9]{1,10}(-[0-9A-Za-z]+)?$/i.test(clean) ||
    /^EVOXIS26:[a-f0-9]{6,16}:[0-9A-Za-z_-]+$/i.test(clean) ||
    /^EVOXIS26:[a-f0-9]{8,35}(-[0-9A-Za-z]+)?$/i.test(clean) ||
    /^EVOXIS26:[a-f0-9]{8}\d{5,8}(-M\d+|\d)?$/i.test(clean) ||
    /^EVOXIS26:PAX:[0-9A-Za-z_-]+:[a-f0-9]+$/i.test(clean) ||
    /^EVOXIS26-[0-9A-Za-z_-]+$/i.test(clean) ||
    /^EVX26-[0-9A-Za-z_-]+$/i.test(clean)
  );
}

/**
 * Parse QR string and extract metadata
 */
export function parseQRString(qrString: string): { valid: boolean; token: string; registrationId?: string; isTeamPass?: boolean } {
  if (!isValidQRToken(qrString)) {
    return { valid: false, token: qrString };
  }
  const token = (qrString || '').trim();

  if (token.toUpperCase().startsWith('EVOXIS26:TEAM:') || token.toUpperCase().startsWith('TEAM:')) {
    const rawId = token.replace(/^EVOXIS26:TEAM:/i, '').replace(/^TEAM:/i, '').trim();
    const padded = /^\d{1,5}$/.test(rawId) ? rawId.padStart(5, '0') : rawId;
    return {
      valid: true,
      token,
      isTeamPass: true,
      registrationId: padded.startsWith('EVOXIS') ? padded : `EVOXIS26-${padded}`,
    };
  }

  if (token.includes(':')) {
    const afterPrefix = token.replace(/^EVOXIS26:/i, '');

    // Pattern 1: Hex hash followed by colon: EVOXIS26:<hex>:<regId>
    if (afterPrefix.includes(':')) {
      const parts = afterPrefix.split(':');
      const rest = parts.slice(1).join(':');
      if (rest.startsWith('EVOXIS26')) return { valid: true, token, isTeamPass: false, registrationId: rest };
      if (/^\d{1,5}$/.test(rest)) return { valid: true, token, isTeamPass: false, registrationId: `EVOXIS26-${rest.padStart(5, '0')}` };
      if (/^\d{1,5}-M\d+$/i.test(rest)) {
        const [seq, m] = rest.split('-');
        return { valid: true, token, isTeamPass: false, registrationId: `EVOXIS26-${seq.padStart(5, '0')}-${m.toUpperCase()}` };
      }
      return { valid: true, token, isTeamPass: false, registrationId: `EVOXIS26-${rest}` };
    }

    // Pattern 2: Hex hash (8 chars) concatenated with 26XXXXX or 26XXXXX-M...: EVOXIS26:31fd673726001742 or EVOXIS26:0c6c91092600174-M2
    const hex8Match = afterPrefix.match(/^([a-f0-9]{8})26(\d{5})(-M\d+|\d)?$/i);
    if (hex8Match) {
      const seq = hex8Match[2]; // e.g. '00174'
      const memberSuffix = hex8Match[3]; // e.g. '2' or '-M2'
      if (memberSuffix) {
        const mNum = memberSuffix.replace(/[^0-9]/g, '');
        return { valid: true, token, isTeamPass: false, registrationId: `EVOXIS26-${seq}-M${mNum}` };
      }
      return { valid: true, token, isTeamPass: false, registrationId: `EVOXIS26-${seq}` };
    }

    // Pattern 3: Hex hash concatenated with XXXXX: EVOXIS26:<8hex><5digits>
    const hexConcatMatch = afterPrefix.match(/^([a-f0-9]{8})(\d{5})(-M\d+)?$/i);
    if (hexConcatMatch) {
      const seq = hexConcatMatch[2];
      const m = hexConcatMatch[3] ? hexConcatMatch[3].toUpperCase() : '';
      return { valid: true, token, isTeamPass: false, registrationId: `EVOXIS26-${seq}${m}` };
    }

    // Pattern 4: Strip hex if present and extract EVOXIS26-XXXXX
    const matchReg = afterPrefix.match(/EVOXIS26-(\d{5})(-M\d+)?/i);
    if (matchReg) {
      return { valid: true, token, isTeamPass: false, registrationId: matchReg[0].toUpperCase() };
    }
  }

  return { valid: true, token, isTeamPass: false, registrationId: token };
}

/**
 * Extract Registration ID from a valid QR token
 */
export function getRegistrationIdFromToken(token: string): string | undefined {
  const parsed = parseQRString(token);
  return parsed.registrationId;
}

/**
 * Generate a high-resolution base64 data URL for a given QR Token.
 */
export async function generateQRCodeDataUrl(
  text: string,
  options: { width?: number; margin?: number; color?: { dark: string; light: string } } = {}
): Promise<string> {
  const { width = 400, margin = 2, color = { dark: '#080C15', light: '#FFFFFF' } } = options;
  return QRCode.toDataURL(text, {
    width,
    margin,
    color,
    errorCorrectionLevel: 'H',
  });
}

/**
 * Download the raw or branded QR Code as a high-resolution PNG image.
 */
export async function downloadQRCodePNG(
  qrToken: string,
  filename = 'EvoXis26-QR-Code.png',
  label?: string
): Promise<void> {
  const qrDataUrl = await generateQRCodeDataUrl(qrToken, { width: 600, margin: 2 });

  if (!label) {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Render on canvas with label & branding
  const canvas = document.createElement('canvas');
  canvas.width = 680;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Draw background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 680, 800);

  // Top header banner
  ctx.fillStyle = '#080C15';
  ctx.fillRect(0, 0, 680, 80);
  ctx.fillStyle = '#00F2FE';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText("EvoXis'26 Official Check-In Pass", 340, 50);

  // QR Image
  const img = new Image();
  img.src = qrDataUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  ctx.drawImage(img, 65, 105, 550, 550);

  // Label text below QR
  ctx.fillStyle = '#080C15';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, 340, 705);

  ctx.fillStyle = '#64748B';
  ctx.font = '15px sans-serif';
  ctx.fillText('Sriram Engineering College • September 26, 2026', 340, 745);

  const pngUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = pngUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate a customized, high-definition digital attendee pass card with cyber styling and download it as PNG.
 */
export async function downloadAttendeePass(params: {
  registrationId: string;
  participantName: string;
  collegeName: string;
  department: string;
  eventsList: string[];
  qrToken: string;
}): Promise<void> {
  const { registrationId, participantName, collegeName, department, eventsList, qrToken } = params;

  // Create high-res canvas (800x1200 @ 2x pixel ratio for retina sharpness)
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 800, 1200);
  bgGrad.addColorStop(0, '#080C15');
  bgGrad.addColorStop(0.5, '#0D1322');
  bgGrad.addColorStop(1, '#080C15');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 800, 1200);

  // 2. Cyan & Purple Glow Accents
  const cyanGlow = ctx.createRadialGradient(200, 100, 10, 200, 100, 300);
  cyanGlow.addColorStop(0, 'rgba(0, 242, 254, 0.25)');
  cyanGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = cyanGlow;
  ctx.fillRect(0, 0, 800, 400);

  const purpleGlow = ctx.createRadialGradient(650, 1100, 10, 650, 1100, 350);
  purpleGlow.addColorStop(0, 'rgba(147, 51, 234, 0.2)');
  purpleGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = purpleGlow;
  ctx.fillRect(0, 800, 800, 400);

  // 3. Cyber Borders
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, 740, 1140);

  ctx.strokeStyle = 'rgba(147, 51, 234, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, 720, 1120);

  // 4. Header Badge
  ctx.fillStyle = '#00F2FE';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NATIONAL LEVEL TECHNICAL SYMPOSIUM', 400, 80);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 48px sans-serif';
  ctx.fillText('EVOXIS\'26', 400, 135);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 18px sans-serif';
  ctx.fillText('Sriram Engineering College • September 26, 2026', 400, 170);

  // Divider line
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 200);
  ctx.lineTo(720, 200);
  ctx.stroke();

  // 5. Participant Info Card Box
  ctx.fillStyle = 'rgba(18, 27, 48, 0.85)';
  ctx.fillRect(60, 230, 680, 230);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
  ctx.strokeRect(60, 230, 680, 230);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#00F2FE';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('OFFICIAL REGISTRATION ID', 90, 265);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(registrationId, 90, 305);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('PARTICIPANT NAME', 90, 350);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(participantName, 90, 380);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('COLLEGE / INSTITUTION', 420, 350);

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 18px sans-serif';
  // Truncate long college name
  const dispCollege = collegeName.length > 25 ? collegeName.substring(0, 24) + '...' : collegeName;
  ctx.fillText(dispCollege, 420, 380);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('DEPARTMENT / YEAR', 90, 420);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '16px sans-serif';
  ctx.fillText(department, 90, 445);

  // 6. Registered Events Tags Box
  ctx.fillStyle = 'rgba(18, 27, 48, 0.6)';
  ctx.fillRect(60, 480, 680, 160);
  ctx.strokeStyle = 'rgba(147, 51, 234, 0.2)';
  ctx.strokeRect(60, 480, 680, 160);

  ctx.fillStyle = '#A855F7';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('REGISTERED EVENTS (' + eventsList.length + ')', 90, 515);

  let eventY = 550;
  eventsList.forEach((evt, idx) => {
    if (idx < 4) {
      ctx.fillStyle = '#00F2FE';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('• ' + evt, 90, eventY);
      eventY += 28;
    }
  });

  // 7. QR Code Area
  const qrDataUrl = await generateQRCodeDataUrl(qrToken, { width: 340, margin: 2 });
  const qrImg = new Image();
  await new Promise<void>((resolve) => {
    qrImg.onload = () => resolve();
    qrImg.src = qrDataUrl;
  });

  // White rounded background container for QR
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(240, 670, 320, 320);

  ctx.drawImage(qrImg, 250, 680, 300, 300);

  // 8. Footer Instructions
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00F2FE';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SCAN THIS QR CODE AT RECEPTION & EVENT DESKS', 400, 1030);

  ctx.fillStyle = '#64748B';
  ctx.font = '13px monospace';
  ctx.fillText('Token: ' + qrToken, 400, 1060);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '13px sans-serif';
  ctx.fillText('Carry college ID card • Valid for all 16 symposium event entries', 400, 1100);

  // Download
  const passUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = passUrl;
  link.download = `EvoXis26-Pass-${registrationId}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
