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
  }, [registrationId, qrToken]);

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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black">
      <div className="max-w-4xl mx-auto">
        {/* Celebration Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[2px] mx-auto mb-4 shadow-glow-cyan">
            <div className="w-full h-full bg-[#080C15] rounded-[14px] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Registration Confirmed
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-black text-white mb-2">
            Registration <span className="text-cyan-400">Successful</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Your official registration record has been committed to the master database. Keep your check-in QR pass handy.
          </p>
        </motion.div>

        {/* Master Pass Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details & Event Badges (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyan-500/20 shadow-glass space-y-6">
              {/* Registration ID Banner */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold tracking-wider block uppercase">
                    Registration ID
                  </span>
                  <span className="text-2xl font-mono font-black text-white tracking-tight">
                    {registrationId}
                  </span>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Participant Meta */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Participant Name</span>
                  <span className="font-bold text-white text-base">{participantName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">College / Institution</span>
                  <span className="font-semibold text-slate-200 line-clamp-1">{college}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Department</span>
                  <span className="font-medium text-slate-300">{department}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Event Date</span>
                  <span className="font-medium text-cyan-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> September 26, 2026
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">How you heard about us:</span>
                  <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                    {referralSource === 'Other' && referralSourceOther ? `Other: ${referralSourceOther}` : referralSource}
                  </span>
                </div>
              </div>

              {/* Team Roster Details (if team registration) */}
              {isTeam && (
                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      Team Roster: <span className="text-white normal-case font-sans font-bold ml-1">{teamName || `${participantName}'s Team`}</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
                      {fullRoster.length} Members
                    </span>
                  </div>
                  <div className="space-y-2">
                    {fullRoster.map((tm, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                          tm.role === 'TEAM_HEAD'
                            ? 'bg-slate-900/80 border-cyan-500/30'
                            : 'bg-slate-900/50 border-slate-800'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-white block">{tm.name}</span>
                          <span className="text-slate-400 text-[11px]">{tm.registrationId} • {tm.department}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          tm.role === 'TEAM_HEAD'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {tm.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registered Events List */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-3">
                  Registered Events ({selectedEvents.length})
                </h3>
                <div className="space-y-2.5">
                  {selectedEvents.map((eid) => {
                    const evt = EVENTS.find((e) => e.eventId === eid);
                    return (
                      <div
                        key={eid}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            {eid}
                          </span>
                          <div>
                            <span className="font-display font-bold text-sm text-white block">
                              {evt ? evt.title : eid}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {evt ? evt.schedule.venue : 'Sriram Campus'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-purple-300">
                          {evt ? evt.schedule.timeSlot.split(' - ')[0] : '10:00 AM'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Important Reception Notice */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-slate-200 text-xs leading-relaxed flex items-start gap-3">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-0.5" />
              <div>
                <p className="text-cyan-200 font-medium leading-relaxed">
                  "Please keep this QR code safe. The same QR will be used for reception and event verification."
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: High-Res QR Passes & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {isTeam ? (
              /* Team QR Passes Container */
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-cyber-card border border-cyan-500/30 shadow-glow-cyan/30 text-center space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest text-left">
                    Team Member QR Passes
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadAllMemberQRs}
                    disabled={isDownloadingAll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-display bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloadingAll ? 'Downloading All...' : 'DOWNLOAD ALL MEMBER QRs'}</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {fullRoster.map((m, idx) => {
                    const mUrl = qrUrlsMap[m.registrationId];
                    return (
                      <div
                        key={m.registrationId}
                        className="p-4 rounded-xl bg-slate-900 border border-cyan-500/20 text-center flex flex-col items-center"
                      >
                        <div className="w-full flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-xs truncate max-w-[140px]">
                            {idx + 1}. {m.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            m.role === 'TEAM_HEAD'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {m.role}
                          </span>
                        </div>

                        <div
                          className="p-2.5 bg-white rounded-xl shadow-lg my-2 cursor-pointer group relative inline-block"
                          onClick={() => setViewingQR({ id: m.registrationId, name: m.name, url: mUrl, token: m.qrToken })}
                        >
                          {mUrl ? (
                            <img
                              src={mUrl}
                              alt={`QR for ${m.name}`}
                              className="w-36 h-36 mx-auto transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-36 h-36 bg-slate-100 flex items-center justify-center">
                              <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[10px] font-mono font-bold text-white bg-black/70 px-2 py-1 rounded">
                              Enlarge
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold text-cyan-400 mb-3">
                          {m.registrationId}
                        </span>

                        <div className="grid grid-cols-2 gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => setViewingQR({ id: m.registrationId, name: m.name, url: mUrl, token: m.qrToken })}
                            className="py-2 px-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleQR(m.qrToken, m.registrationId, m.name)}
                            className="py-2 px-2.5 rounded-lg text-xs font-bold font-display bg-gradient-to-r from-cyan-400 to-sky-400 text-black shadow-glow-cyan flex items-center justify-center gap-1 transition-transform hover:scale-105"
                          >
                            <Download className="w-3.5 h-3.5" />
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
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 shadow-glow-cyan transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingPass ? 'Generating Pass...' : 'Download Registration Details'}</span>
                </button>
              </div>
            ) : (
              /* Individual QR Pass Container */
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-cyber-card border border-cyan-500/30 shadow-glow-cyan/30 text-center">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-4">
                  Official Check-In QR Pass
                </span>

                {/* QR Image Frame */}
                <div
                  className="relative inline-block p-4 rounded-2xl bg-white shadow-2xl mx-auto mb-4 cursor-pointer group"
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

                <p className="text-[11px] font-mono text-slate-400 break-all px-2 mb-6">
                  Token: <span className="text-slate-300">{qrToken}</span>
                </p>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setViewingQR({ id: registrationId, name: participantName, url: qrDataUrl, token: qrToken })}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/40 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>View QR</span>
                    </button>

                    <button
                      onClick={() => handleDownloadSingleQR(qrToken, registrationId, participantName)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/40 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download QR</span>
                    </button>
                  </div>

                  <button
                    onClick={handleDownloadPass}
                    disabled={isDownloadingPass}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-glow-cyan transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloadingPass ? 'Generating Details...' : 'Download Registration Details'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Link to My Registration Portal */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-400">
                Need to view your attendance status or re-download your badge on event day?
              </p>
              <Link
                to="/my-registration"
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Visit My Registration Portal</span>
                <ArrowRight className="w-3 h-3" />
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
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#0F172A] border border-cyan-500/30 rounded-3xl p-8 max-w-sm w-full text-center z-10 shadow-2xl"
            >
              <button
                onClick={() => setViewingQR(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display font-black text-xl text-white mb-1">
                Check-In QR Pass
              </h3>
              <p className="text-sm font-bold text-slate-200 mb-0.5">
                {viewingQR.name}
              </p>
              <p className="text-xs text-cyan-400 font-mono mb-4">
                {viewingQR.id}
              </p>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-inner mb-4">
                <img
                  src={viewingQR.url}
                  alt={`QR code for ${viewingQR.id}`}
                  className="w-64 h-64 mx-auto"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadSingleQR(viewingQR.token, viewingQR.id, viewingQR.name)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-black bg-cyan-400 hover:bg-cyan-300 shadow-glow-cyan"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={() => setViewingQR(null)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700"
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
