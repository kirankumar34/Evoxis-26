import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    isDuplicate?: boolean;
  } | null;

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isDownloadingPass, setIsDownloadingPass] = useState(false);

  const registrationId = regState?.registrationId || 'EVOXIS26-00001';
  const qrToken = regState?.qrToken || `EVOXIS26:${registrationId}`;
  const participantName = regState?.participantName || 'Registered Participant';
  const college = regState?.college || 'Sriram Engineering College';
  const department = regState?.department || 'Department of Computing';
  const selectedEvents = regState?.selectedEvents || (['TE01', 'NT05', 'SP02'] as EventId[]);

  // Trigger celebration confetti
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F2FE', '#38BDF8', '#9333EA', '#A855F7', '#10B981'],
    });
  }, []);

  // Generate QR Code image
  useEffect(() => {
    if (qrToken) {
      generateQRCodeDataUrl(qrToken, { width: 320, margin: 2 }).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [qrToken]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(registrationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    await downloadQRCodePNG(qrToken, `EvoXis26-QR-${registrationId}.png`);
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
            You're All Set for <span className="text-cyan-400">EvoXis'26</span>!
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
                    Official Registration ID
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
                  <span className="text-xs text-slate-400 block mb-0.5">Event Date & Venue</span>
                  <span className="font-medium text-cyan-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Sept 26, 2026
                  </span>
                </div>
              </div>

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
                <strong className="text-cyan-300 block mb-0.5">Please keep this QR Code ready:</strong>
                Present this QR code on your mobile or as a printout at the <strong>Reception Desk</strong> upon arrival on campus. The same QR will be scanned at each of your event desks.
              </div>
            </div>
          </div>

          {/* Right Column: High-Res QR Card & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-cyber-card border border-cyan-500/30 shadow-glow-cyan/30 text-center">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-4">
                Official Check-In QR Pass
              </span>

              {/* QR Image Frame */}
              <div className="relative inline-block p-4 rounded-2xl bg-white shadow-2xl mx-auto mb-4">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="EvoXis'26 Check-in QR"
                    className="w-52 h-52 sm:w-60 sm:h-60 rounded-lg mx-auto"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center bg-slate-100 rounded-lg">
                    <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
                  </div>
                )}
              </div>

              <p className="text-[11px] font-mono text-slate-400 break-all px-2 mb-6">
                Token: <span className="text-slate-300">{qrToken}</span>
              </p>

              {/* Download Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleDownloadPass}
                  disabled={isDownloadingPass}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-glow-cyan transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingPass ? 'Generating High-Def Pass...' : 'Download Official Badge / Pass (PNG)'}</span>
                </button>

                <button
                  onClick={handleDownloadQR}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Download Standalone QR Code</span>
                </button>
              </div>
            </div>

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
    </div>
  );
};

export default RegistrationSuccessPage;
