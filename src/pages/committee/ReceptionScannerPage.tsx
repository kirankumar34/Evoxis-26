import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import {
  QrCode,
  Camera,
  AlertCircle,
  ArrowLeft,
  Volume2,
  VolumeX,
  RefreshCw,
  UserCheck,
  Check,
  Loader2,
  Keyboard,
} from 'lucide-react';
import { api } from '@/services/api';
import { sound } from '@/lib/sound';
import { QRValidationResponse } from '@/types';

export const ReceptionScannerPage: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [scanResult, setScanResult] = useState<QRValidationResponse | null>(null);
  const [confirmationSuccess, setConfirmationSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'reception-qr-reader';

  // Initialize camera scanner
  useEffect(() => {
    startCameraScanner();

    return () => {
      stopCameraScanner();
    };
  }, []);

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
        () => {
          // Frame scan error ignore
        }
      );
      setErrorMessage(null);
    } catch {
      // If camera access is blocked or unavailable, prompt manual entry
      setErrorMessage('Camera access is not available or blocked. You can enter the QR token manually below.');
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
    // Prevent duplicate rapid scans of same payload
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
      const res = await api.validateQRCode(cleanToken);
      setScanResult(res);

      if (res.success) {
        if (res.overallAttendanceStatus === 'Present') {
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

  const handleConfirmAttendance = async () => {
    if (!scanResult || !scanResult.registrationId) return;

    setIsConfirming(true);
    try {
      const admin = api.getCurrentAdmin();
      const verifiedBy = admin ? `${admin.name} (${admin.username})` : 'Reception Desk Staff';

      const res = await api.markReceptionAttendance(
        scanResult.registrationId ? `EVOXIS26:${scanResult.registrationId}` : '',
        verifiedBy
      );

      if (res.success) {
        if (soundEnabled) sound.playSuccess();
        setConfirmationSuccess(`Checked in at ${res.timestamp || 'now'}. Overall attendance marked PRESENT.`);
        setScanResult((prev) =>
          prev ? { ...prev, overallAttendanceStatus: 'Present' } : null
        );
      } else {
        setErrorMessage(res.message || 'Could not mark attendance.');
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleResetScanner = () => {
    setScanResult(null);
    setConfirmationSuccess(null);
    setErrorMessage(null);
    setManualToken('');
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-cyber-card border border-cyan-500/20 shadow-glass">
          <div className="flex items-center gap-3">
            <Link
              to="/committee/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-display font-black text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-400" />
                Reception Desk Check-In Scanner
              </h1>
              <p className="text-xs text-slate-400">
                Scan participant QR code to verify details and manually confirm campus entry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                soundEnabled
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
              title="Toggle Audio Feedback"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowManualInput(!showManualInput)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              title="Toggle Manual Token Input"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scanner & Manual Input Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Camera Viewport (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="p-4 rounded-2xl bg-cyber-card border border-cyan-500/30 shadow-glow-cyan/20 overflow-hidden relative">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Live Camera Stream
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>

              {/* QR Reader DOM Element */}
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
                    placeholder="Paste QR Token (EVOXIS26:...)"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-bold text-xs text-black bg-cyan-400 hover:bg-cyan-300 flex-shrink-0"
                  >
                    Lookup
                  </button>
                </form>
              )}
            </div>

            {/* Quick Helper */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 text-center">
              💡 Point camera directly at the QR pass. Audio chime confirms instant detection.
            </div>
          </div>

          {/* Verification Results Panel (6 cols) */}
          <div className="md:col-span-6 space-y-4">
            {isLoading && (
              <div className="p-12 rounded-2xl bg-cyber-card border border-cyan-500/20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-sm font-display font-semibold text-slate-300">
                  Verifying Token Against Master Database...
                </p>
              </div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-300 space-y-2"
              >
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  <span>Invalid or Unrecognized QR Code</span>
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed">{errorMessage}</p>
                <button
                  onClick={handleResetScanner}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-500/30"
                >
                  Scan Next Pass
                </button>
              </motion.div>
            )}

            {/* Scan Success Card */}
            {scanResult && scanResult.success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-cyber-card border border-cyan-500/30 shadow-glass space-y-5"
              >
                {/* Status Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">
                      Verified Registration Record
                    </span>
                    <span className="text-xl font-mono font-black text-white">
                      {scanResult.registrationId}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                      scanResult.overallAttendanceStatus === 'Present'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-sm'
                    }`}
                  >
                    {scanResult.overallAttendanceStatus === 'Present'
                      ? 'ALREADY CHECKED IN'
                      : 'READY FOR CHECK-IN'}
                  </span>
                </div>

                {/* Participant Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Participant Name:</span>
                    <strong className="text-white text-sm">{scanResult.participantName}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">College / Institution:</span>
                    <span className="text-slate-200 font-semibold text-right max-w-[200px] truncate">
                      {scanResult.college}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Department & Year:</span>
                    <span className="text-slate-300 font-medium">
                      {scanResult.department} ({scanResult.year})
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Contact Number:</span>
                    <span className="text-slate-300 font-mono">{scanResult.mobile}</span>
                  </div>
                </div>

                {/* Registered Events Chips */}
                <div>
                  <span className="text-[11px] font-mono text-purple-400 uppercase font-bold tracking-wider block mb-2">
                    Registered Events ({scanResult.events?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.events?.map((e) => (
                      <span
                        key={e.eventId}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-cyan-300"
                      >
                        {e.eventId} • {e.eventName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Confirmation Feedback */}
                {confirmationSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{confirmationSuccess}</span>
                  </div>
                )}

                {/* Manual Confirmation Button (Section 11) */}
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={handleConfirmAttendance}
                    disabled={isConfirming || scanResult.overallAttendanceStatus === 'Present'}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-display font-black text-xs text-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-teal-300 shadow-glow-cyan transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                          {scanResult.overallAttendanceStatus === 'Present'
                            ? 'ALREADY MARKED PRESENT'
                            : 'CONFIRM & MARK PRESENT'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResetScanner}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-colors"
                    title="Scan Next Pass"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {!scanResult && !isLoading && !errorMessage && (
              <div className="p-12 rounded-2xl bg-cyber-card border border-slate-800 text-center space-y-2">
                <QrCode className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                <h3 className="font-display font-bold text-sm text-slate-300">Scanner Ready</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Aim the camera at an attendee's QR code to pull up their registration profile and confirm attendance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionScannerPage;
