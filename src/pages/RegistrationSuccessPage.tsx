import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Sparkles,
  Download,
  QrCode,
  Calendar,
  ArrowRight,
  Copy,
  Check,
  Search,
  Eye,
  X,
} from 'lucide-react';
import { generateQRCodeDataUrl, downloadQRCodePNG, downloadAttendeePass } from '@/lib/qr';
import { EVENTS } from '@/data/events';
import { EventId } from '@/types';

export const RegistrationSuccessPage: React.FC = () => {
  const location = useLocation();

  // State from router or fallback
  const regState = location.state as {
    registrationId?: string;
    qrToken?: string;
    participantName?: string;
    email?: string;
    mobileNumber?: string;
    college?: string;
    department?: string;
    selectedEvents?: EventId[];
    totalEvents?: number;
    referralSource?: string;
    referralSourceOther?: string;
    isDuplicate?: boolean;
    teamName?: string;
    teamMembers?: Array<{
      name: string;
      email?: string;
      phone?: string;
      department?: string;
      college?: string;
      year?: string;
      gender?: string;
      role?: string;
    }>;
    participants?: Array<{
      name: string;
      email?: string;
      phone?: string;
      department?: string;
      college?: string;
      year?: string;
      gender?: string;
      role?: string;
    }>;
  } | null;

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrUrlsMap, setQrUrlsMap] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [isDownloadingPass, setIsDownloadingPass] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [viewingQR, setViewingQR] = useState<{ id: string; name: string; url: string; token: string } | null>(null);

  const registrationId = regState?.registrationId || 'EVOXIS26-00001';
  const qrToken = regState?.qrToken || `EVOXIS26:${registrationId}`;
  const participantName = regState?.participantName || 'Registered Participant';
  const college = regState?.college || 'Sriram Engineering College';
  const department = regState?.department || 'Department of Computing';
  const selectedEvents = regState?.selectedEvents || (['TE01', 'NT05', 'SP02'] as EventId[]);
  const referralSource = regState?.referralSource || 'Instagram Post';
  const referralSourceOther = regState?.referralSourceOther;
  const teamName = regState?.teamName;
  const teamMembers = regState?.teamMembers || [];
  const isTeam = Boolean(teamName || teamMembers.length > 0 || (regState?.participants && regState.participants.length > 1));

  // Build full structured roster
  const fullRoster = regState?.participants && regState.participants.length > 0
    ? regState.participants.map((p, idx) => ({
        name: p.name,
        role: p.role || (idx === 0 ? ('TEAM_HEAD' as const) : ('TEAM_MEMBER' as const)),
        registrationId: (p as any).registrationId || (idx === 0 ? registrationId : `${registrationId}-M${idx}`),
        qrToken: (p as any).qrToken || (idx === 0 ? qrToken : `${qrToken}-M${idx}`),
        department: p.department || department,
        college: p.college || college,
      }))
    : [
        {
          name: participantName,
          role: isTeam ? ('TEAM_HEAD' as const) : ('INDIVIDUAL' as const),
          registrationId,
          qrToken,
          department,
          college,
        },
        ...teamMembers.map((tm, idx) => ({
          name: tm.name,
          role: 'TEAM_MEMBER' as const,
          registrationId: (tm as any).registrationId || `${registrationId}-M${idx + 1}`,
          qrToken: (tm as any).qrToken || `${qrToken}-M${idx + 1}`,
          department: tm.department || department,
          college: tm.college || college,
        })),
      ];

  // Trigger celebration confetti
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F2FE', '#38BDF8', '#9333EA', '#A855F7', '#10B981'],
    });
  }, []);

  // Generate QR Code images for all participants
  useEffect(() => {
    const generateAllRosterQRs = async () => {
      const urls: Record<string, string> = {};
      if (isTeam) {
        const teamToken = `EVOXIS26:TEAM:${registrationId.replace(/[^0-9]/g, '')}`;
        const teamUrl = await generateQRCodeDataUrl(teamToken, { width: 400, margin: 2 });
        urls[`TEAM-${registrationId}`] = teamUrl;
      }
      for (const m of fullRoster) {
        const url = await generateQRCodeDataUrl(m.qrToken, { width: 400, margin: 2 });
        urls[m.registrationId] = url;
      }
      setQrUrlsMap(urls);
      if (urls[registrationId]) {
        setQrDataUrl(urls[registrationId]);
      }
    };
    generateAllRosterQRs();
  }, [registrationId, qrToken, isTeam]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(registrationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleQR = async (token: string, regId: string, name: string) => {
    await downloadQRCodePNG(token, `${regId}-QR.png`, `${name} (${regId})`);
  };

  const handleDownloadAllMemberQRs = async () => {
    setIsDownloadingAll(true);
    try {
      for (let i = 0; i < fullRoster.length; i++) {
        const m = fullRoster[i];
        await downloadQRCodePNG(m.qrToken, `${m.registrationId}-QR.png`, `${m.name} (${m.registrationId})`);
        await new Promise((r) => setTimeout(r, 250));
      }
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleDownloadPass = async () => {
    setIsDownloadingPass(true);
    try {
      const eventNames = selectedEvents.map((eid) => {
        const found = EVENTS.find((e) => e.eventId === eid);
        return found ? `${found.title} (${eid})` : eid;
      });

      await downloadAttendeePass({
        registrationId,
        participantName,
        collegeName: college,
        department,
        eventsList: eventNames,
        qrToken,
      });
    } finally {
      setIsDownloadingPass(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#02050E] via-[#040814] to-[#0A1128] text-slate-100 selection:bg-[#E6CA65] selection:text-[#040814]">
      <div className="max-w-5xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E6CA65] via-[#C8933C] to-[#E11D48] p-[2px] shadow-glow-gold mb-4">
            <div className="w-full h-full bg-[#070D1E] rounded-[14px] flex items-center justify-center text-[#E6CA65]">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6CA65]/10 border border-[#E6CA65]/35 text-[#FCE79C] text-xs font-mono font-bold uppercase mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#E6CA65]" /> Grand Voyage Manifest Logged
          </div>

          <h1 className="text-3xl sm:text-4xl font-voyage font-black text-white mb-2">
            Voyage Enlistment <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">Confirmed</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto font-sans leading-relaxed">
            Your official voyage record has been logged in the master fleet manifest. Keep your secure HMAC QR pass ready for port check-in.
          </p>
        </motion.div>

        {/* Master Pass Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details & Event Badges (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/30 shadow-2xl wanted-card-border backdrop-blur-md space-y-6">
              {/* Registration ID Banner */}
              <div className="p-4 rounded-xl bg-[#040814]/90 border border-[#E6CA65]/35 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-[11px] font-mono text-[#E6CA65] font-bold tracking-wider block uppercase">
                    VOYAGE PASS ID
                  </span>
                  <span className="text-2xl font-mono font-black text-white tracking-tight">
                    {registrationId}
                  </span>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-2.5 rounded-xl bg-[#E6CA65]/15 hover:bg-[#E6CA65]/25 border border-[#E6CA65]/35 text-[#FCE79C] transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Participant Meta */}
              <div className="grid grid-cols-2 gap-4 text-sm font-sans">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5 font-mono uppercase">Captain / Participant</span>
                  <span className="font-bold text-white text-base font-voyage">{participantName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5 font-mono uppercase">College / Fleet</span>
                  <span className="font-semibold text-slate-200 line-clamp-1">{college}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5 font-mono uppercase">Department</span>
                  <span className="font-medium text-slate-300">{department}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5 font-mono uppercase">Voyage Date</span>
                  <span className="font-medium text-[#FCE79C] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#E6CA65]" /> September 26, 2026
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-[#E6CA65]/15 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Discovery Source:</span>
                  <span className="text-xs font-mono font-bold text-[#FCE79C] px-2.5 py-1 rounded-lg bg-[#E6CA65]/15 border border-[#E6CA65]/30">
                    {referralSource === 'Other' && referralSourceOther ? `Other: ${referralSourceOther}` : referralSource}
                  </span>
                </div>
              </div>

              {/* Team Roster Details (if team registration) */}
              {isTeam && (
                <div className="pt-4 border-t border-[#E6CA65]/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono font-bold text-[#FCE79C] uppercase tracking-wider">
                      Crew Manifest: <span className="text-white normal-case font-voyage font-bold ml-1">{teamName || `${participantName}'s Crew`}</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#E6CA65]/15 border border-[#E6CA65]/35 text-[#FCE79C] text-[11px] font-mono">
                      {fullRoster.length} Crew Members
                    </span>
                  </div>
                  <div className="space-y-2">
                    {fullRoster.map((tm, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs wanted-card-border ${
                          tm.role === 'TEAM_HEAD'
                            ? 'bg-[#0E1736] border-[#E6CA65]/40'
                            : 'bg-[#040814]/80 border-[#E6CA65]/20'
                        }`}
                      >
                        <div className="relative z-10">
                          <span className="font-bold text-white block">{tm.name}</span>
                          <span className="text-slate-400 text-[11px] font-mono">{tm.registrationId} • {tm.department}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold relative z-10 ${
                          tm.role === 'TEAM_HEAD'
                            ? 'bg-[#E6CA65]/25 text-[#FCE79C] border border-[#E6CA65]/40'
                            : 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/30'
                        }`}>
                          {tm.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registered Events List */}
              <div className="pt-4 border-t border-[#E6CA65]/20">
                <h3 className="text-xs font-mono font-bold text-[#FCE79C] uppercase tracking-wider mb-3">
                  Enlisted Challenges ({selectedEvents.length})
                </h3>
                <div className="space-y-2.5">
                  {selectedEvents.map((eid) => {
                    const evt = EVENTS.find((e) => e.eventId === eid);
                    return (
                      <div
                        key={eid}
                        className="p-3 rounded-xl bg-[#040814]/80 border border-[#E6CA65]/20 flex items-center justify-between wanted-card-border"
                      >
                        <div className="flex items-center gap-3 relative z-10">
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#E6CA65]/20 text-[#FCE79C] border border-[#E6CA65]/40">
                            {eid}
                          </span>
                          <div>
                            <span className="font-voyage font-bold text-sm text-white block">
                              {evt ? evt.title : eid}
                            </span>
                            <span className="text-[11px] text-slate-400 font-sans">
                              {evt ? evt.schedule.venue : 'Sriram Campus'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#FCE79C] relative z-10">
                          {evt ? evt.schedule.timeSlot.split(' - ')[0] : '10:00 AM'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Important Reception Notice */}
            <div className="p-4 rounded-xl bg-[#E6CA65]/10 border border-[#E6CA65]/35 text-slate-200 text-xs leading-relaxed flex items-start gap-3 shadow-sm">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-[#E6CA65] mt-0.5" />
              <div>
                <p className="text-[#FCE79C] font-medium leading-relaxed font-sans">
                  "Please keep this QR code safe. The same QR will be used for reception and challenge desk verification."
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: High-Res QR Passes & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {isTeam ? (
              /* Team QR Passes Container */
              <div className="space-y-4">
                {/* Master Team Pass */}
                <div className="p-6 rounded-2xl bg-[#0A1128]/95 border-2 border-[#E6CA65]/50 shadow-glow-gold text-center space-y-4 wanted-card-border">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E6CA65]/20 text-[#FCE79C] border border-[#E6CA65]/40 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-[#E6CA65]" />
                      MASTER CREW PASS
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {fullRoster.length} Members
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-lg font-voyage font-bold text-white tracking-tight">
                      {teamName || 'Crew Pass'}
                    </h4>
                    <p className="text-xs text-slate-300 font-sans mt-0.5">
                      Use at Reception Desk to assign wristbands for the entire crew
                    </p>
                  </div>

                  {/* Master Team QR Code Frame */}
                  <div
                    className="p-3 bg-white rounded-2xl shadow-2xl inline-block cursor-pointer group relative z-10 border-2 border-[#E6CA65]/40"
                    onClick={() => {
                      const tToken = `EVOXIS26:TEAM:${registrationId.replace(/[^0-9]/g, '')}`;
                      setViewingQR({
                        id: registrationId,
                        name: `${teamName || 'Team'} (Master Crew Pass)`,
                        url: qrUrlsMap[`TEAM-${registrationId}`] || qrDataUrl,
                        token: tToken,
                      });
                    }}
                  >
                    {qrUrlsMap[`TEAM-${registrationId}`] || qrDataUrl ? (
                      <img
                        src={qrUrlsMap[`TEAM-${registrationId}`] || qrDataUrl}
                        alt="Master Team Pass QR"
                        className="w-44 h-44 mx-auto transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-44 h-44 bg-slate-100 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-slate-400 animate-pulse" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs font-mono font-bold text-white bg-black/80 px-3 py-1.5 rounded-lg">
                        Click to Enlarge
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-mono font-bold text-[#FCE79C] relative z-10">
                    TOKEN: EVOXIS26:TEAM:{registrationId.replace(/[^0-9]/g, '')}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 relative z-10">
                    <button
                      type="button"
                      onClick={() => {
                        const tToken = `EVOXIS26:TEAM:${registrationId.replace(/[^0-9]/g, '')}`;
                        setViewingQR({
                          id: registrationId,
                          name: `${teamName || 'Team'} (Master Crew Pass)`,
                          url: qrUrlsMap[`TEAM-${registrationId}`] || qrDataUrl,
                          token: tToken,
                        });
                      }}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold font-mono bg-[#040814] hover:bg-[#0E1736] text-slate-200 border border-[#E6CA65]/30 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-[#00F2FE]" />
                      <span>View Pass</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tToken = `EVOXIS26:TEAM:${registrationId.replace(/[^0-9]/g, '')}`;
                        handleDownloadSingleQR(tToken, `${registrationId}-TEAM-PASS`, `${teamName || 'Team'} Master Pass`);
                      }}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold font-voyage bg-gradient-to-r from-[#E6CA65] to-[#FCE79C] text-[#040814] shadow-glow-gold flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-[#040814]" />
                      <span>Download Team QR</span>
                    </button>
                  </div>
                </div>

                {/* Individual Member Passes Container */}
                <div className="p-6 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/30 shadow-2xl text-center space-y-4 wanted-card-border">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-mono font-bold text-[#FCE79C] uppercase tracking-widest text-left">
                      Crew Member Passes
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadAllMemberQRs}
                      disabled={isDownloadingAll}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-voyage bg-[#E6CA65]/20 text-[#FCE79C] border border-[#E6CA65]/40 hover:bg-[#E6CA65]/30 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingAll ? 'Downloading...' : 'DOWNLOAD ALL'}</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 relative z-10">
                    {fullRoster.map((m, idx) => {
                      const mUrl = qrUrlsMap[m.registrationId];
                      return (
                        <div
                          key={m.registrationId}
                          className="p-4 rounded-xl bg-[#040814]/90 border border-[#E6CA65]/25 text-center flex flex-col items-center wanted-card-border"
                        >
                          <div className="w-full flex items-center justify-between mb-2 relative z-10">
                            <span className="font-bold text-white text-xs truncate max-w-[140px] font-voyage">
                              {idx + 1}. {m.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              m.role === 'TEAM_HEAD'
                                ? 'bg-[#E6CA65]/20 text-[#FCE79C]'
                                : 'bg-[#00F2FE]/20 text-[#00F2FE]'
                            }`}>
                              {m.role}
                            </span>
                          </div>

                          <div
                            className="p-2.5 bg-white rounded-xl shadow-lg my-2 cursor-pointer group relative inline-block border border-[#E6CA65]/30 z-10"
                            onClick={() => setViewingQR({ id: m.registrationId, name: m.name, url: mUrl, token: m.qrToken })}
                          >
                            {mUrl ? (
                              <img
                                src={mUrl}
                                alt={`QR for ${m.name}`}
                                className="w-32 h-32 mx-auto transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-32 h-32 bg-slate-100 flex items-center justify-center">
                                <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-[10px] font-mono font-bold text-white bg-black/70 px-2 py-1 rounded">
                                Enlarge
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-mono font-bold text-[#FCE79C] mb-2 relative z-10">
                            {m.registrationId}
                          </span>

                          <div className="grid grid-cols-2 gap-2 w-full relative z-10">
                            <button
                              type="button"
                              onClick={() => setViewingQR({ id: m.registrationId, name: m.name, url: mUrl, token: m.qrToken })}
                              className="py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-[#040814] hover:bg-[#0E1736] text-slate-300 border border-[#E6CA65]/20 flex items-center justify-center gap-1 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#00F2FE]" />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleQR(m.qrToken, m.registrationId, m.name)}
                              className="py-1.5 px-2.5 rounded-lg text-xs font-bold font-voyage bg-gradient-to-r from-[#E6CA65] to-[#FCE79C] text-[#040814] shadow-glow-gold flex items-center justify-center gap-1 transition-transform hover:scale-105"
                            >
                              <Download className="w-3.5 h-3.5 text-[#040814]" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleDownloadPass}
                    disabled={isDownloadingPass}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-voyage font-bold text-sm text-[#040814] bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#00F2FE] shadow-glow-gold transition-all hover:scale-[1.02] active:scale-[0.98] relative z-10"
                  >
                    <Download className="w-4 h-4 text-[#040814]" />
                    <span>{isDownloadingPass ? 'Generating Pass...' : 'Download Voyage Manifest Details'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Individual QR Pass Container */
              <div className="p-6 rounded-2xl bg-[#0A1128]/95 border-2 border-[#E6CA65]/40 shadow-glow-gold text-center wanted-card-border">
                <span className="text-xs font-mono font-bold text-[#FCE79C] uppercase tracking-widest block mb-4 relative z-10">
                  Official Voyage Check-In Pass
                </span>

                {/* QR Image Frame */}
                <div
                  className="relative inline-block p-4 rounded-2xl bg-white shadow-2xl mx-auto mb-4 cursor-pointer group z-10 border-2 border-[#E6CA65]/40"
                  onClick={() => setViewingQR({ id: registrationId, name: participantName, url: qrDataUrl, token: qrToken })}
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="EvoXis'26 Check-in QR"
                      className="w-52 h-52 sm:w-60 sm:h-60 rounded-lg mx-auto transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-52 h-52 flex items-center justify-center bg-slate-100 rounded-lg">
                      <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-xs font-mono font-bold text-white bg-black/70 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> Click to Enlarge
                    </span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-slate-300 break-all px-2 mb-6 relative z-10">
                  Token: <span className="text-[#FCE79C]">{qrToken}</span>
                </p>

                <div className="space-y-2.5 relative z-10">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setViewingQR({ id: registrationId, name: participantName, url: qrDataUrl, token: qrToken })}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#040814] hover:bg-[#0E1736] border border-[#E6CA65]/30 transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#00F2FE]" />
                      <span>View QR</span>
                    </button>

                    <button
                      onClick={() => handleDownloadSingleQR(qrToken, registrationId, participantName)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#040814] hover:bg-[#0E1736] border border-[#E6CA65]/30 transition-colors shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#E6CA65]" />
                      <span>Download QR</span>
                    </button>
                  </div>

                  <button
                    onClick={handleDownloadPass}
                    disabled={isDownloadingPass}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-voyage font-bold text-sm text-[#040814] bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#00F2FE] shadow-glow-gold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4 text-[#040814]" />
                    <span>{isDownloadingPass ? 'Generating Details...' : 'Download Voyage Pass Details'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Link to My Registration Portal */}
            <div className="p-5 rounded-2xl bg-[#040814]/90 border border-[#E6CA65]/25 text-center space-y-3 wanted-card-border shadow-md">
              <p className="text-xs text-slate-300 font-sans relative z-10">
                Need to view your challenge attendance status or re-download your pass on voyage day?
              </p>
              <Link
                to="/my-registration"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#FCE79C] hover:text-[#FFF5C0] hover:underline font-voyage relative z-10"
              >
                <Search className="w-3.5 h-3.5 text-[#E6CA65]" />
                <span>Visit Voyage Pass Retrieval Portal</span>
                <ArrowRight className="w-3 h-3 text-[#E6CA65]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen View QR Modal */}
      <AnimatePresence>
        {viewingQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingQR(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#0A1128] border-2 border-[#E6CA65]/40 rounded-3xl p-8 max-w-sm w-full text-center z-10 shadow-2xl wanted-card-border"
            >
              <button
                onClick={() => setViewingQR(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-[#040814] text-slate-400 hover:text-white border border-[#E6CA65]/20"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-voyage font-black text-xl text-white mb-1">
                Voyage Check-In Pass
              </h3>
              <p className="text-sm font-bold text-slate-200 mb-0.5">
                {viewingQR.name}
              </p>
              <p className="text-xs text-[#FCE79C] font-mono mb-4">
                {viewingQR.id}
              </p>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mb-4 border border-[#E6CA65]/40">
                <img
                  src={viewingQR.url}
                  alt={`QR code for ${viewingQR.id}`}
                  className="w-64 h-64 mx-auto"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadSingleQR(viewingQR.token, viewingQR.id, viewingQR.name)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-voyage font-bold text-xs text-[#040814] bg-gradient-to-r from-[#E6CA65] to-[#FCE79C] shadow-glow-gold"
                >
                  <Download className="w-3.5 h-3.5 text-[#040814]" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={() => setViewingQR(null)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-[#040814] hover:bg-[#0E1736] border border-[#E6CA65]/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationSuccessPage;
