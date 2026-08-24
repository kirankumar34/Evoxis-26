import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { operationsApi } from '../services/operationsApi';
import { ScanResultState, ScanOperationResponse } from '../types';
import { getEventById } from '../config/events';
import { CameraScanner } from '../components/common/CameraScanner';
import { StatusBanner } from '../components/common/StatusBanner';
import { audio } from '../services/audioService';
import {
  CalendarCheck,
  ArrowLeft,
  ShieldCheck,
  Users,
  Clock,
  MapPin,
  Sparkles,
  AlertOctagon,
} from 'lucide-react';

export const EventScanPage: React.FC = () => {
  const { eventId = 'TE02' } = useParams<{ eventId: string }>();
  const { user, hasRole, currentStation, portalMode } = useAuth();

  const eventMeta = getEventById(eventId);
  const eventTitle = eventMeta ? eventMeta.title : eventId;

  const [scanResult, setScanResult] = useState<ScanOperationResponse | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isAdminOverride, setIsAdminOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('On-spot coordinator approval');
  const [recentEventScans, setRecentEventScans] = useState<
    Array<{ name: string; regId: string; time: string; state: ScanResultState }>
  >([]);

  const isSuperAdmin = hasRole(['SUPER_ADMIN']);

  const handleScan = async (physicalQrId: string) => {
    setIsPaused(true);
    try {
      const response = await operationsApi.markEventPresent({
        physicalQrId,
        eventId,
        staffId: user?.name || 'Event Coordinator',
        station: `${currentStation} (${eventId})`,
        portalMode,
        isAdminOverride: isSuperAdmin && isAdminOverride,
        overrideReason: isAdminOverride ? overrideReason : undefined,
      });

      setScanResult(response);

      if (response.state === 'SUCCESS') {
        audio.playSuccess();
        if (response.participant) {
          setRecentEventScans((prev) => [
            {
              name: response.participant!.participantName,
              regId: response.participant!.registrationId,
              time: new Date().toLocaleTimeString(),
              state: 'SUCCESS',
            },
            ...prev.slice(0, 9),
          ]);
        }
      } else if (response.state === 'DUPLICATE_EVENT') {
        audio.playWarning();
      } else {
        audio.playError();
      }
    } catch (err: any) {
      setScanResult({
        state: 'OFFLINE_ERROR',
        verbatimMessage: 'Connection unavailable. Attendance was NOT recorded.',
        details: err?.message || 'Network lookup failure',
      });
      audio.playError();
    } finally {
      // Auto-resume scanner after 2.5 seconds
      setTimeout(() => {
        setIsPaused(false);
      }, 2500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Event Desk Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/events"
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Event Desks</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {eventId.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>{eventTitle}</span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {eventMeta?.category || 'Technical'}
            </span>
          </h1>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {eventMeta?.venue || 'Campus Arena'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {eventMeta?.startTime} - {eventMeta?.endTime}
            </span>
          </div>
        </div>

        {/* Super Admin Override Mode */}
        {isSuperAdmin && (
          <div className="p-3 rounded-2xl bg-violet-950/30 border border-violet-500/30 flex items-center gap-3">
            <input
              type="checkbox"
              id="adminOverrideCheck"
              checked={isAdminOverride}
              onChange={(e) => setIsAdminOverride(e.target.checked)}
              className="w-4 h-4 rounded text-violet-500 focus:ring-violet-400 border-slate-700 bg-slate-900"
            />
            <label htmlFor="adminOverrideCheck" className="text-xs font-mono text-violet-200 cursor-pointer">
              <span className="font-bold block">Admin Override Mode</span>
              <span className="text-[10px] text-violet-400">Bypasses event registration eligibility</span>
            </label>
          </div>
        )}
      </div>

      {/* Verbatim Scan Status Banner */}
      <StatusBanner
        state={scanResult?.state || null}
        message={scanResult?.verbatimMessage || ''}
        details={scanResult?.details}
        registeredEvents={scanResult?.registeredEvents}
        originalTime={scanResult?.originalTime}
        originalStation={scanResult?.originalStation}
        onDismiss={() => setScanResult(null)}
      />

      {/* Scanner & Recent Verification Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Scanner */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800">
            <CameraScanner
              onScan={handleScan}
              isPaused={isPaused}
              promptText={`Scan participant wristband for ${eventTitle}`}
            />
          </div>
        </div>

        {/* Right Column: Participant Details & Recent Scans */}
        <div className="lg:col-span-6 space-y-4">
          {/* Participant Verification Preview */}
          {scanResult?.participant ? (
            <div className="p-6 rounded-3xl glass-panel border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                  Verified Attendee:
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {scanResult.participant.role}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                {scanResult.participant.participantName}
              </h3>
              <p className="text-xs font-mono text-slate-300">
                Reg ID: <strong className="text-cyan-300">{scanResult.participant.registrationId}</strong> · {scanResult.participant.college}
              </p>

              {scanResult.participant.teamName && (
                <p className="text-xs font-mono text-slate-300">
                  Team: <strong className="text-cyan-300">{scanResult.participant.teamName}</strong>
                </p>
              )}

              <div className="pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
                Registered Events ({scanResult.participant.selectedEvents.length}):{' '}
                <span className="text-slate-200">{scanResult.participant.selectedEvents.join(', ')}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl glass-panel border border-slate-800 text-center text-slate-500 text-xs font-mono space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-600" />
              <p>Ready to verify. Scan any attendee wristband or ID card.</p>
            </div>
          )}

          {/* Recent Event Desk Scans */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Desk Check-in History (This Session)</span>
            </h4>

            {recentEventScans.length > 0 ? (
              <div className="divide-y divide-slate-800 text-xs font-mono max-h-[220px] overflow-y-auto">
                {recentEventScans.map((s, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200">{s.name}</span>
                      <span className="text-[11px] text-slate-400 ml-2">[{s.regId}]</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">{s.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-600 py-3">No scans recorded yet in this session</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
