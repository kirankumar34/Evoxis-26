import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { operationsApi } from '../services/operationsApi';
import { ScanOperationResponse } from '../types';
import { CameraScanner } from '../components/common/CameraScanner';
import { StatusBanner } from '../components/common/StatusBanner';
import { audio } from '../services/audioService';
import {
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const FoodPage: React.FC = () => {
  const { user, hasRole, currentStation } = useAuth();

  const [scanResult, setScanResult] = useState<ScanOperationResponse | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [totalDelivered, setTotalDelivered] = useState(0);
  const [isAdminOverride, setIsAdminOverride] = useState(false);
  const [recentDeliveries, setRecentDeliveries] = useState<
    Array<{ name: string; regId: string; time: string }>
  >([]);

  const isSuperAdmin = hasRole(['SUPER_ADMIN']);

  const refreshStats = async () => {
    try {
      const stats = await operationsApi.getLiveStats();
      setTotalDelivered(stats.foodDelivered);
    } catch (e) {
      console.warn('Food stats refresh error:', e);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleScan = async (physicalQrId: string) => {
    setIsPaused(true);
    try {
      const response = await operationsApi.markFoodDelivered({
        physicalQrId,
        staffId: user?.name || 'Food Staff',
        station: currentStation || 'Food Counter',
        isAdminOverride: isSuperAdmin && isAdminOverride,
        overrideReason: isAdminOverride ? 'Coordinator manual food coupon reissue' : undefined,
      });

      setScanResult(response);

      if (response.state === 'SUCCESS') {
        audio.playSuccess();
        setTotalDelivered((prev) => prev + 1);
        if (response.participant) {
          setRecentDeliveries((prev) => [
            {
              name: response.participant!.participantName,
              regId: response.participant!.registrationId,
              time: new Date().toLocaleTimeString(),
            },
            ...prev.slice(0, 9),
          ]);
        }
      } else if (response.state === 'DUPLICATE_FOOD') {
        audio.playWarning();
      } else {
        audio.playError();
      }
    } catch (err: any) {
      setScanResult({
        state: 'OFFLINE_ERROR',
        verbatimMessage: 'Connection unavailable. Attendance was NOT recorded.',
        details: err?.message || 'Network failure',
      });
      audio.playError();
    } finally {
      setTimeout(() => {
        setIsPaused(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Food Counter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Food & Refreshment Distribution</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Lunch & Food Distribution Counter
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-mono mt-1">
            Single-meal delivery with instant duplicate scan prevention
          </p>
        </div>

        {/* Live Delivery Counter Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
            <UtensilsCrossed className="w-6 h-6 text-emerald-400" />
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold block">
                Total Meals Served:
              </span>
              <span className="text-2xl font-black text-white font-mono">{totalDelivered}</span>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="p-3 rounded-2xl bg-violet-950/30 border border-violet-500/30 flex items-center gap-2">
              <input
                type="checkbox"
                id="foodAdminOverride"
                checked={isAdminOverride}
                onChange={(e) => setIsAdminOverride(e.target.checked)}
                className="w-4 h-4 rounded text-violet-500 bg-slate-900 border-slate-700"
              />
              <label htmlFor="foodAdminOverride" className="text-xs font-mono text-violet-200 cursor-pointer">
                Reissue Override
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Verbatim Scan Status Banner */}
      <StatusBanner
        state={scanResult?.state || null}
        message={scanResult?.verbatimMessage || ''}
        details={scanResult?.details}
        originalTime={scanResult?.originalTime}
        originalStation={scanResult?.originalStation}
        onDismiss={() => setScanResult(null)}
      />

      {/* Main Scan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Scanner */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800">
            <CameraScanner
              onScan={handleScan}
              isPaused={isPaused}
              promptText="Scan participant wristband for meal token redemption"
            />
          </div>
        </div>

        {/* Right Column: Verification Preview & Session History */}
        <div className="lg:col-span-6 space-y-4">
          {scanResult?.participant ? (
            <div className="p-6 rounded-3xl glass-panel border border-emerald-500/40 space-y-3">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">
                Recipient Profile:
              </span>
              <h3 className="text-xl font-bold text-white">
                {scanResult.participant.participantName}
              </h3>
              <p className="text-xs font-mono text-slate-300">
                Reg ID: <strong className="text-cyan-300">{scanResult.participant.registrationId}</strong> · {scanResult.participant.college}
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Wristband ID:</span>
                <span className="text-emerald-400 font-bold">{scanResult.participant.physicalQrId || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl glass-panel border border-slate-800 text-center text-slate-500 text-xs font-mono space-y-2">
              <UtensilsCrossed className="w-8 h-8 mx-auto text-slate-600" />
              <p>Ready for food scans. Point scanner at attendee wristband.</p>
            </div>
          )}

          {/* Recent Deliveries */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Counter Session Deliveries</span>
            </h4>

            {recentDeliveries.length > 0 ? (
              <div className="divide-y divide-slate-800 text-xs font-mono max-h-[220px] overflow-y-auto">
                {recentDeliveries.map((d, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200">{d.name}</span>
                      <span className="text-[11px] text-slate-400 ml-2">[{d.regId}]</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">{d.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-600 py-3">No meal redemptions recorded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
