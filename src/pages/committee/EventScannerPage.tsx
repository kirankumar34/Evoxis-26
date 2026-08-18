import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import {
  Layers,
  Camera,
  CheckCircle2,
  ArrowLeft,
  Volume2,
  VolumeX,
  RefreshCw,
  UserCheck,
  Lock,
  Check,
  Loader2,
  XCircle,
  Clock,
} from 'lucide-react';
import { api } from '@/services/api';
import { sound } from '@/lib/sound';
import { EVENTS } from '@/data/events';
import { EventId, EventDeskValidationResponse, AdminUser } from '@/types';

export const EventScannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventParam = searchParams.get('event') as EventId | null;

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<EventId>(eventParam || 'TE01');
  const [isEventLocked, setIsEventLocked] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [deskResult, setDeskResult] = useState<EventDeskValidationResponse | null>(null);
  const [confirmationSuccess, setConfirmationSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'event-desk-qr-reader';

  // Check coordinator role and lock event if applicable
  useEffect(() => {
    const admin = api.getCurrentAdmin();
    setCurrentUser(admin);

    if (admin && admin.role === 'EVENT_COORDINATOR' && admin.assignedEventId) {
      setSelectedEventId(admin.assignedEventId);
      setIsEventLocked(true);
    } else if (eventParam) {
      setSelectedEventId(eventParam);
    }
  }, [eventParam]);

  useEffect(() => {
    startCameraScanner();

    return () => {
      stopCameraScanner();
    };
  }, [selectedEventId]);

  const startCameraScanner = async () => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        () => {}
      );
    } catch {
      setShowManualInput(true);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (isLoading || isConfirming) return;
    handleTokenLookup(decodedText);
  };

  const handleTokenLookup = async (token: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) return;

    setIsLoading(true);
    setConfirmationSuccess(null);
    setErrorMessage(null);

    try {
      const res = await api.checkEventRegistration(cleanToken, selectedEventId);
      setDeskResult(res);

      if (res.success) {
        if (!res.registered) {
          if (soundEnabled) sound.playError();
        } else if (res.alreadyPresent) {
          if (soundEnabled) sound.playWarning();
        } else {
          if (soundEnabled) sound.playSuccess();
        }
      } else {
        if (soundEnabled) sound.playError();
        setErrorMessage(res.errorMessage || 'Invalid or unrecognized QR code.');
      }
    } catch {
      if (soundEnabled) sound.playError();
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEventAttendance = async () => {
    if (!deskResult || !deskResult.participant) return;

    setIsConfirming(true);
    try {
      const verifiedBy = currentUser ? `${currentUser.name} (${currentUser.username})` : 'Event Coordinator';
      const res = await api.markEventAttendance(
        `EVOXIS26:${deskResult.participant.registrationId}`,
        selectedEventId,
        verifiedBy
      );

      if (res.success) {
        if (soundEnabled) sound.playSuccess();
        setConfirmationSuccess(`Attendance confirmed for ${deskResult.participant.eventName} at ${res.timestamp || 'now'}.`);
        setDeskResult((prev) =>
          prev
            ? {
                ...prev,
                alreadyPresent: true,
                participant: prev.participant
                  ? { ...prev.participant, attendanceStatus: 'Present', participationStatus: 'Present' }
                  : undefined,
              }
            : null
        );
      } else {
        setErrorMessage(res.message || 'Could not mark event attendance.');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResetScanner = () => {
    setDeskResult(null);
    setConfirmationSuccess(null);
    setErrorMessage(null);
    setManualToken('');
  };

  const currentEventMeta = EVENTS.find((e) => e.eventId === selectedEventId) || EVENTS[0];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header & Desk Mode Dropdown */}
        <div className="p-4 rounded-2xl bg-cyber-card border border-purple-500/20 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/committee/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500/40 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-display font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Event Desk Attendance Scanner
              </h1>
              <p className="text-xs text-slate-400">
                Desk Mode: <strong className="text-purple-300">{currentEventMeta.title} ({currentEventMeta.eventId})</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Event Selector Dropdown */}
            {isEventLocked ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>{selectedEventId} (Locked)</span>
              </div>
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value as EventId);
                  handleResetScanner();
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-purple-400 font-sans"
              >
                <optgroup label="Technical (TE01 - TE06)">
                  {EVENTS.filter((e) => e.category === 'Technical').map((e) => (
                    <option key={e.eventId} value={e.eventId}>
                      {e.eventId} - {e.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Non-Technical (NT01 - NT06)">
                  {EVENTS.filter((e) => e.category === 'Non-Technical').map((e) => (
                    <option key={e.eventId} value={e.eventId}>
                      {e.eventId} - {e.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Special (SP01 - SP04)">
                  {EVENTS.filter((e) => e.category === 'Special').map((e) => (
                    <option key={e.eventId} value={e.eventId}>
                      {e.eventId} - {e.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            )}

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                soundEnabled
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scanner & Verification Output Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Camera Viewport (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="p-4 rounded-2xl bg-cyber-card border border-purple-500/30 shadow-glow-purple/20 overflow-hidden relative">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Event Desk Camera
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {currentEventMeta.schedule.venue}
                </span>
              </div>

              <div
                id={scannerContainerId}
                className="w-full rounded-xl overflow-hidden bg-black aspect-square border border-slate-800"
              />

              {/* Manual Input Fallback */}
              {showManualInput && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleTokenLookup(manualToken);
                  }}
                  className="mt-4 pt-4 border-t border-slate-800 flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Enter QR Token"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 flex-shrink-0"
                  >
                    Check
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Validation & Actions (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            {isLoading && (
              <div className="p-12 rounded-2xl bg-cyber-card border border-purple-500/20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                <p className="text-sm font-display font-semibold text-slate-300">
                  Checking Event Eligibility for {selectedEventId}...
                </p>
              </div>
            )}

            {/* Validation Outcome States (Section 13) */}
            {deskResult && deskResult.success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-cyber-card border border-purple-500/30 shadow-glass space-y-5"
              >
                {/* State 1: NOT REGISTERED (RED) */}
                {!deskResult.registered && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 space-y-2">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <span>NOT REGISTERED FOR THIS EVENT</span>
                    </div>
                    <p className="text-xs text-red-200/90 leading-relaxed">
                      Participant <strong>{deskResult.participant?.participantName}</strong> ({deskResult.participant?.registrationId}) did NOT register for {currentEventMeta.title} ({selectedEventId}). Entry is blocked.
                    </p>
                  </div>
                )}

                {/* State 2: ALREADY PRESENT (YELLOW) */}
                {deskResult.registered && deskResult.alreadyPresent && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Clock className="w-5 h-5 flex-shrink-0" />
                      <span>ALREADY MARKED PRESENT</span>
                    </div>
                    <p className="text-xs text-amber-200/90">
                      Attendance was previously recorded {deskResult.priorCheckInTimestamp ? `at ${deskResult.priorCheckInTimestamp}` : 'earlier today'}.
                    </p>
                  </div>
                )}

                {/* State 3: VALID & READY (GREEN) */}
                {deskResult.registered && !deskResult.alreadyPresent && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>REGISTERED — READY FOR CONFIRMATION</span>
                    </div>
                    <p className="text-xs text-emerald-200/90">
                      Participant is verified and eligible for {currentEventMeta.title}.
                    </p>
                  </div>
                )}

                {/* Participant Details Card */}
                {deskResult.participant && (
                  <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Registration ID:</span>
                      <strong className="font-mono text-cyan-400">{deskResult.participant.registrationId}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Participant Name:</span>
                      <strong className="text-white">{deskResult.participant.participantName}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">College:</span>
                      <span className="text-slate-300 font-medium truncate max-w-[200px]">
                        {deskResult.participant.college}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Department:</span>
                      <span className="text-slate-300">{deskResult.participant.department}</span>
                    </div>
                  </div>
                )}

                {confirmationSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{confirmationSuccess}</span>
                  </div>
                )}

                {/* Confirm Button */}
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={handleConfirmEventAttendance}
                    disabled={
                      isConfirming ||
                      !deskResult.registered ||
                      deskResult.alreadyPresent
                    }
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display font-black text-xs text-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 hover:from-purple-300 hover:to-pink-300 shadow-glow-purple transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Recording Attendance...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>
                          {deskResult.alreadyPresent
                            ? 'ALREADY MARKED PRESENT'
                            : !deskResult.registered
                            ? 'ATTENDANCE BLOCKED'
                            : 'CONFIRM & MARK EVENT PRESENT'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResetScanner}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500/40 text-slate-300 hover:text-white transition-colors"
                    title="Scan Next Pass"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {!deskResult && !isLoading && !errorMessage && (
              <div className="p-12 rounded-2xl bg-cyber-card border border-slate-800 text-center space-y-2">
                <Layers className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                <h3 className="font-display font-bold text-sm text-slate-300">Desk Ready</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Scan attendees arriving at the {currentEventMeta.title} desk to confirm event-specific check-in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventScannerPage;
