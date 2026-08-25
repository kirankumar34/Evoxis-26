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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold uppercase mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Participant Self-Service Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white mb-3">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Registration Pass & Status</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Search with your Registration ID and Email/Phone to retrieve your check-in QR pass and view real-time event attendance.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyan-500/20 shadow-glass mb-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
          >
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Registration ID (e.g. EVOXIS26-00001)
              </label>
              <input
                type="text"
                placeholder="EVOXIS26-XXXXX"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email or Mobile Number
              </label>
              <input
                type="text"
                placeholder="participant@college.edu or 9876543210"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-glow-cyan flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
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
              className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5"
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
              <div className="p-6 rounded-2xl bg-cyber-card border border-cyan-500/30 shadow-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 p-[2px]">
                    <div className="w-full h-full bg-cyber-dark rounded-[10px] flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-mono font-black text-white">{activeMember?.registrationId || registrationData.registrationId}</span>
                      <button
                        onClick={handleCopyId}
                        className="text-xs text-cyan-400 hover:text-cyan-300 p-1"
                        title="Copy ID"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">
                      Registered on {registrationData.registrationDate}
                    </p>
                  </div>
                </div>

                {/* Overall Attendance Tag */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Reception Check-in:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      registrationData.overallAttendanceStatus === 'Present'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-sm'
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
                  <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-5">
                    <h3 className="font-display font-bold text-base text-white border-b border-slate-800 pb-3">
                      Participant Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-1">Active Attendee</span>
                        <span className="font-bold text-white text-sm">{activeMember?.name || registrationData.participantName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">College</span>
                        <span className="font-semibold text-slate-200">{activeMember?.college || registrationData.collegeInstitution}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Department / Year</span>
                        <span className="text-slate-300">{activeMember?.department || registrationData.department} ({registrationData.year})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Contact</span>
                        <span className="text-slate-300 font-mono">{registrationData.mobileNumber}</span>
                      </div>
                    </div>

                    {/* Team Roster details if team registration */}
                    {registrationData.teamName && (
                      <div className="pt-3 border-t border-slate-800/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                            Team: <span className="text-white font-sans font-bold ml-1">{registrationData.teamName}</span>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            {fullRoster.length} Members (Click to Switch QR)
                          </span>
                        </div>

                        <div className="space-y-1.5 mt-2">
                          {fullRoster.map((tm, idx) => (
                            <button
                              key={tm.registrationId}
                              type="button"
                              onClick={() => setSelectedMemberIndex(idx)}
                              className={`w-full px-3 py-2 rounded-lg border flex items-center justify-between text-xs transition-colors text-left ${
                                selectedMemberIndex === idx
                                  ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-glow-cyan/20'
                                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-cyan-400 font-bold">{idx + 1}.</span>
                                <span className="font-semibold">{tm.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">({tm.registrationId})</span>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                tm.role === 'TEAM_HEAD'
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'bg-purple-500/20 text-purple-300'
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
                  <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-4">
                    <h3 className="font-display font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                      <span>Registered Events ({registrationData.events.length})</span>
                      <span className="text-xs font-mono text-purple-400 font-normal">Live Desk Status</span>
                    </h3>

                    <div className="space-y-3">
                      {registrationData.events.map((evt) => {
                        const fullEvt = EVENTS.find((e) => e.eventId === evt.eventId);
                        return (
                          <div
                            key={evt.eventId}
                            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                  {evt.eventId}
                                </span>
                                <span className="font-display font-bold text-sm text-white">
                                  {evt.eventName}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">
                                {fullEvt ? fullEvt.schedule.venue : 'Sriram Campus'} • {fullEvt ? fullEvt.schedule.timeSlot : 'TBD'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border ${
                                  evt.attendanceStatus === 'Present'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
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
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-cyber-card border border-cyan-500/30 text-center">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-2">
                      Official Check-In QR Pass
                    </span>
                    <p className="text-xs text-slate-300 font-bold mb-4">
                      {activeMember?.name || registrationData.participantName}
                    </p>

                    <div className="p-3 bg-white rounded-2xl inline-block shadow-xl mb-4">
                      {qrDataUrl && (
                        <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg mx-auto" />
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-slate-400 break-all px-2 mb-6">
                      Token: <span className="text-slate-300">{activeMember?.qrToken || registrationData.qrToken}</span>
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={handleDownloadPass}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold text-xs text-black bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 transition-all shadow-glow-cyan"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Badge / Pass (PNG)</span>
                      </button>

                      <button
                        onClick={handleDownloadQR}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                      >
                        <QrCode className="w-4 h-4 text-cyan-400" />
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
