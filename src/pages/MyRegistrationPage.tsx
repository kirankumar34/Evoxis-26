import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  QrCode,
  Download,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/services/api';
import { generateQRCodeDataUrl, downloadQRCodePNG, downloadAttendeePass } from '@/lib/qr';
import { EVENTS } from '@/data/events';
import { OverallRegistrationRecord, EventId, EventCategory, ParticipationStatus } from '@/types';

export const MyRegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const regIdParam = searchParams.get('id');

  const [registrationId, setRegistrationId] = useState(regIdParam || '');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [registrationData, setRegistrationData] = useState<(OverallRegistrationRecord & {
    events: {
      eventId: EventId;
      eventName: string;
      category: EventCategory;
      attendanceStatus: 'Pending' | 'Present' | 'Absent';
      participationStatus: ParticipationStatus;
    }[];
  }) | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState<number>(0);

  // Auto-search if token is in URL query
  useEffect(() => {
    if (tokenParam) {
      handleLookup({ qrToken: tokenParam });
    }
  }, [tokenParam]);

  // Compute active roster
  const fullRoster = registrationData
    ? [
        ...(registrationData.teamName
          ? [
              {
                name: `${registrationData.teamName} (Master Team Pass)`,
                role: 'TEAM_HEAD' as const,
                registrationId: registrationData.registrationId,
                qrToken: `EVOXIS26:TEAM:${registrationData.registrationId.replace(/[^0-9]/g, '')}`,
                department: registrationData.department,
                college: registrationData.collegeInstitution,
                isMasterTeamPass: true,
              },
            ]
          : []),
        {
          name: registrationData.participantName,
          role: registrationData.teamName ? ('TEAM_HEAD' as const) : ('INDIVIDUAL' as const),
          registrationId: registrationData.registrationId,
          qrToken: registrationData.qrToken,
          department: registrationData.department,
          college: registrationData.collegeInstitution,
        },
        ...(registrationData.teamMembers || []).map((tm: any, idx: number) => ({
          name: tm.name || tm.fullName || `Member ${idx + 2}`,
          role: (tm.role || 'TEAM_MEMBER') as 'TEAM_MEMBER',
          registrationId: tm.registrationId || `${registrationData.registrationId}-M${idx + 1}`,
          qrToken: tm.qrToken || `${registrationData.qrToken}-M${idx + 1}`,
          department: tm.department || registrationData.department,
          college: tm.college || registrationData.collegeInstitution,
        })),
      ]
    : [];

  const activeMember = fullRoster[selectedMemberIndex] || fullRoster[0];

  // Generate QR for active member
  useEffect(() => {
    if (activeMember?.qrToken) {
      generateQRCodeDataUrl(activeMember.qrToken, { width: 320, margin: 2 }).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [activeMember?.qrToken]);

  const handleLookup = async (queryOverride?: { registrationId?: string; email?: string; mobile?: string; qrToken?: string }) => {
    setError(null);
    setSelectedMemberIndex(0);

    const query = queryOverride || {
      registrationId: registrationId.trim() || undefined,
      email: emailOrPhone.includes('@') ? emailOrPhone.trim().toLowerCase() : undefined,
      mobile: !emailOrPhone.includes('@') && emailOrPhone.trim() ? emailOrPhone.trim() : undefined,
    };

    // Security Guard: Prevent bare Registration ID enumeration
    if (!query.qrToken) {
      if (query.registrationId && !query.email && !query.mobile) {
        setError('For security, please enter your registered Email or Mobile number along with your Registration ID.');
        return;
      }
      if (!query.registrationId && !query.email && !query.mobile) {
        setError('Please enter your Registration ID along with your registered Email or Mobile number.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await api.getRegistration(query);

      if (result.success && result.data) {
        setRegistrationData(result.data);
      } else {
        setRegistrationData(null);
        setError(result.message || 'No registration record found matching the details provided.');
      }
    } catch {
      setError('Unable to fetch registration record. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = () => {
    if (activeMember) {
      navigator.clipboard.writeText(activeMember.registrationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = async () => {
    if (activeMember) {
      await downloadQRCodePNG(activeMember.qrToken, `${activeMember.registrationId}-QR.png`, `${activeMember.name} (${activeMember.registrationId})`);
    }
  };

  const handleDownloadPass = async () => {
    if (registrationData && activeMember) {
      const eventNames = registrationData.events.map((e) => `${e.eventName} (${e.eventId})`);
      await downloadAttendeePass({
        registrationId: activeMember.registrationId,
        participantName: activeMember.name,
        collegeName: activeMember.college || registrationData.collegeInstitution,
        department: activeMember.department || registrationData.department,
        eventsList: eventNames,
        qrToken: activeMember.qrToken,
      });
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#02050E] via-[#040814] to-[#0A1128] text-slate-100 selection:bg-[#E6CA65] selection:text-[#040814]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6CA65]/10 border border-[#E6CA65]/35 text-[#FCE79C] text-xs font-mono font-bold uppercase mb-4 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E6CA65]" /> Voyage Pass Retrieval Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-voyage font-black text-white mb-3">
            Retrieve Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">Voyage Pass & Status</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-lg mx-auto font-sans leading-relaxed">
            Search with your Voyage Pass ID and registered Email or Mobile to retrieve your check-in QR pass and view live challenge clearance status.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/30 shadow-2xl wanted-card-border mb-10 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end relative z-10"
          >
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-[#FCE79C] uppercase tracking-wider mb-2 font-mono">
                Voyage Pass ID (e.g. EVOXIS26-00001)
              </label>
              <input
                type="text"
                placeholder="EVOXIS26-XXXXX"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#040814]/90 border border-[#E6CA65]/30 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-[#E6CA65] focus:ring-1 focus:ring-[#E6CA65]"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-[#FCE79C] uppercase tracking-wider mb-2 font-mono">
                Email or Mobile Number
              </label>
              <input
                type="text"
                placeholder="participant@college.edu or 9876543210"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#040814]/90 border border-[#E6CA65]/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#E6CA65] focus:ring-1 focus:ring-[#E6CA65]"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="cyber-button w-full py-3 px-4 rounded-xl font-voyage font-bold text-sm text-[#040814] bg-gradient-to-r from-[#E6CA65] to-[#FCE79C] hover:from-[#FFF5C0] shadow-glow-gold flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 border border-[#FFF5C0]/50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#040814]" />
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#040814]" />
                    <span>Search Pass</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 relative z-10"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        {/* Search Results Display */}
        <AnimatePresence>
          {registrationData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-8"
            >
              {/* Top Banner Status */}
              <div className="p-6 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/35 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 wanted-card-border">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E6CA65] via-[#C8933C] to-[#E11D48] p-[2px] shadow-glow-gold">
                    <div className="w-full h-full bg-[#070D1E] rounded-[10px] flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-[#FCE79C]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-mono font-black text-white">{activeMember?.registrationId || registrationData.registrationId}</span>
                      <button
                        onClick={handleCopyId}
                        className="text-xs text-[#E6CA65] hover:text-[#FCE79C] p-1"
                        title="Copy ID"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-sans">
                      Manifest logged on {registrationData.registrationDate}
                    </p>
                  </div>
                </div>

                {/* Overall Attendance Tag */}
                <div className="flex items-center gap-2 relative z-10">
                  <span className="text-xs text-slate-300 font-sans">Port Reception Check-in:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      registrationData.overallAttendanceStatus === 'Present'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {registrationData.overallAttendanceStatus === 'Present' ? 'CHECKED IN (PRESENT)' : 'PENDING ARRIVAL'}
                  </span>
                </div>
              </div>

              {/* Master Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left: Participant & Per-Event Attendance (7 cols) */}
                <div className="md:col-span-7 space-y-6">
                  <div className="p-6 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/25 space-y-5 wanted-card-border">
                    <h3 className="font-voyage font-bold text-base text-white border-b border-[#E6CA65]/20 pb-3 relative z-10">
                      Manifest Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-sans relative z-10">
                      <div>
                        <span className="text-slate-400 block mb-1 font-mono uppercase">Active Attendee</span>
                        <span className="font-bold text-white text-sm font-voyage">{activeMember?.name || registrationData.participantName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1 font-mono uppercase">College / Fleet</span>
                        <span className="font-semibold text-slate-200">{activeMember?.college || registrationData.collegeInstitution}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1 font-mono uppercase">Department / Year</span>
                        <span className="text-slate-300">{activeMember?.department || registrationData.department} ({registrationData.year})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1 font-mono uppercase">Contact</span>
                        <span className="text-slate-300 font-mono">{registrationData.mobileNumber}</span>
                      </div>
                    </div>

                    {/* Team Roster details if team registration */}
                    {registrationData.teamName && (
                      <div className="pt-3 border-t border-[#E6CA65]/15 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-[#FCE79C] uppercase">
                            Crew: <span className="text-white font-voyage font-bold ml-1">{registrationData.teamName}</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E6CA65]/15 text-[#FCE79C] border border-[#E6CA65]/35">
                            {fullRoster.length} Members (Click to Switch QR)
                          </span>
                        </div>

                        <div className="space-y-1.5 mt-2">
                          {fullRoster.map((tm, idx) => (
                            <button
                              key={tm.registrationId}
                              type="button"
                              onClick={() => setSelectedMemberIndex(idx)}
                              className={`w-full px-3 py-2 rounded-lg border flex items-center justify-between text-xs transition-all text-left wanted-card-border ${
                                selectedMemberIndex === idx
                                  ? 'bg-[#E6CA65]/20 border-[#E6CA65] text-white shadow-glow-gold/20'
                                  : 'bg-[#040814]/80 border-[#E6CA65]/20 hover:bg-[#0E1736] text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 relative z-10">
                                <span className="font-mono text-[10px] text-[#FCE79C] font-bold">{idx + 1}.</span>
                                <span className="font-semibold">{tm.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">({tm.registrationId})</span>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold relative z-10 ${
                                tm.role === 'TEAM_HEAD'
                                  ? 'bg-[#E6CA65]/20 text-[#FCE79C]'
                                  : 'bg-[#00F2FE]/20 text-[#00F2FE]'
                              }`}>
                                {tm.role}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Registered Events with Live Attendance Status */}
                  <div className="p-6 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/25 space-y-4 wanted-card-border">
                    <h3 className="font-voyage font-bold text-base text-white border-b border-[#E6CA65]/20 pb-3 flex items-center justify-between relative z-10">
                      <span>Enlisted Challenges ({registrationData.events.length})</span>
                      <span className="text-xs font-mono text-[#FCE79C] font-normal">Live Desk Status</span>
                    </h3>

                    <div className="space-y-3 relative z-10">
                      {registrationData.events.map((evt) => {
                        const fullEvt = EVENTS.find((e) => e.eventId === evt.eventId);
                        return (
                          <div
                            key={evt.eventId}
                            className="p-4 rounded-xl bg-[#040814]/80 border border-[#E6CA65]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 wanted-card-border"
                          >
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E6CA65]/20 text-[#FCE79C] border border-[#E6CA65]/40">
                                  {evt.eventId}
                                </span>
                                <span className="font-voyage font-bold text-sm text-white">
                                  {evt.eventName}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-sans">
                                {fullEvt ? fullEvt.schedule.venue : 'Sriram Campus'} • {fullEvt ? fullEvt.schedule.timeSlot : 'TBD'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 relative z-10">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border ${
                                  evt.attendanceStatus === 'Present'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-[#040814] text-slate-400 border-slate-700'
                                }`}
                              >
                                {evt.attendanceStatus === 'Present' ? 'Marked Present' : 'Desk Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: QR Pass Card & Downloads (5 cols) */}
                <div className="md:col-span-5 space-y-6">
                  <div className="p-6 rounded-2xl bg-[#0A1128]/95 border-2 border-[#E6CA65]/40 shadow-glow-gold text-center wanted-card-border">
                    <span className="text-xs font-mono font-bold text-[#FCE79C] uppercase tracking-widest block mb-2 relative z-10">
                      Official Check-In Voyage Pass
                    </span>
                    <p className="text-xs text-slate-200 font-bold mb-4 font-voyage relative z-10">
                      {activeMember?.name || registrationData.participantName}
                    </p>

                    <div className="p-3 bg-white rounded-2xl inline-block shadow-xl mb-4 border-2 border-[#E6CA65]/40 relative z-10">
                      {qrDataUrl && (
                        <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg mx-auto" />
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-slate-300 break-all px-2 mb-6 relative z-10">
                      Token: <span className="text-[#FCE79C]">{activeMember?.qrToken || registrationData.qrToken}</span>
                    </p>

                    <div className="space-y-3 relative z-10">
                      <button
                        onClick={handleDownloadPass}
                        className="cyber-button w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-voyage font-bold text-xs text-[#040814] bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#00F2FE] shadow-glow-gold"
                      >
                        <Download className="w-4 h-4 text-[#040814]" />
                        <span>Download Badge / Pass (PNG)</span>
                      </button>

                      <button
                        onClick={handleDownloadQR}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-200 bg-[#040814] hover:bg-[#0E1736] border border-[#E6CA65]/30 transition-colors shadow-sm"
                      >
                        <QrCode className="w-4 h-4 text-[#E6CA65]" />
                        <span>Download Standalone QR</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyRegistrationPage;
