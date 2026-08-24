import React from 'react';
import { ScanResultState } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, Info, ShieldAlert, WifiOff } from 'lucide-react';

interface StatusBannerProps {
  state: ScanResultState | null;
  message: string;
  details?: string;
  registeredEvents?: string[];
  originalTime?: string;
  originalStation?: string;
  onDismiss?: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  state,
  message,
  details,
  registeredEvents,
  originalTime,
  originalStation,
  onDismiss,
}) => {
  if (!state) return null;

  const isSuccess = state === 'SUCCESS';
  const isDuplicate = state === 'DUPLICATE_CAMPUS' || state === 'DUPLICATE_EVENT' || state === 'DUPLICATE_FOOD';
  const isWrongEvent = state === 'WRONG_EVENT';
  const isOffline = state === 'OFFLINE_ERROR';
  const isConflict =
    state === 'QR_CONFLICT' ||
    state === 'UNASSIGNED_QR' ||
    state === 'QR_REVOKED' ||
    state === 'QR_NOT_FOUND' ||
    state === 'VERIFICATION_FAILED';
  const isTestInProd = state === 'TEST_QR_IN_PROD';
  const isProdInTest = state === 'PROD_QR_IN_TEST';
  const isError = state === 'INVALID_QR' || state === 'NOT_FOUND' || isOffline;

  // Background and border styles
  let containerStyles = 'border-slate-700 bg-slate-900/90 text-slate-100';
  let icon = <Info className="w-8 h-8 text-cyan-400 shrink-0" />;

  if (isSuccess) {
    containerStyles = 'glass-panel-glow-emerald border-emerald-500/50 bg-emerald-950/80 text-emerald-100';
    icon = <CheckCircle2 className="w-9 h-9 text-emerald-400 shrink-0 animate-pulse" />;
  } else if (isDuplicate) {
    containerStyles = 'glass-panel-glow-amber border-amber-500/50 bg-amber-950/85 text-amber-100';
    icon = <AlertTriangle className="w-9 h-9 text-amber-400 shrink-0" />;
  } else if (isTestInProd || isProdInTest) {
    containerStyles = 'border-amber-500/80 bg-amber-950/90 text-amber-100 shadow-lg shadow-amber-950/60';
    icon = <ShieldAlert className="w-9 h-9 text-amber-400 shrink-0 animate-bounce" />;
  } else if (isWrongEvent) {
    containerStyles = 'border-purple-500/60 bg-purple-950/90 text-purple-100 shadow-lg shadow-purple-950/50';
    icon = <ShieldAlert className="w-9 h-9 text-purple-400 shrink-0" />;
  } else if (isConflict) {
    containerStyles = 'glass-panel-glow-rose border-rose-500/50 bg-rose-950/90 text-rose-100';
    icon = <XCircle className="w-9 h-9 text-rose-400 shrink-0" />;
  } else if (isOffline) {
    containerStyles = 'border-red-600/60 bg-red-950/90 text-red-100';
    icon = <WifiOff className="w-9 h-9 text-red-400 shrink-0" />;
  } else if (isError) {
    containerStyles = 'glass-panel-glow-rose border-rose-500/60 bg-rose-950/90 text-rose-100';
    icon = <XCircle className="w-9 h-9 text-rose-400 shrink-0" />;
  }

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95 ${containerStyles}`}
      role="alert"
    >
      <div className="flex items-start gap-4">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl md:text-2xl font-bold font-mono tracking-wide uppercase">
              {message}
            </h2>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs px-2.5 py-1 rounded bg-black/40 hover:bg-black/60 text-slate-300 font-mono transition-colors"
              >
                DISMISS
              </button>
            )}
          </div>

          {details && (
            <p className="mt-1.5 text-sm md:text-base font-medium opacity-90">
              {details}
            </p>
          )}

          {isWrongEvent && registeredEvents && registeredEvents.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-purple-900/40 border border-purple-500/30">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 block mb-1">
                Participant is registered for these events:
              </span>
              <div className="flex flex-wrap gap-2">
                {registeredEvents.map((evt) => (
                  <span
                    key={evt}
                    className="px-2.5 py-1 text-xs font-mono font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30 rounded-lg"
                  >
                    {evt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isDuplicate && (originalTime || originalStation) && (
            <div className="mt-2 text-xs font-mono text-amber-300/90">
              Recorded: {originalTime ? new Date(originalTime).toLocaleTimeString() : 'Earlier'}
              {originalStation ? ` at [${originalStation}]` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
