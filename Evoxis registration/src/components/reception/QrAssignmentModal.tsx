import React, { useState } from 'react';
import { ParticipantProfile } from '../../types';
import { CameraScanner } from '../common/CameraScanner';
import { QrCode, X, Check, ShieldAlert } from 'lucide-react';

interface QrAssignmentModalProps {
  isOpen: boolean;
  participant: ParticipantProfile;
  onClose: () => void;
  onAssign: (physicalQrId: string, physicalQrType: 'ID_CARD' | 'WRISTBAND') => Promise<void>;
  isLoading?: boolean;
}

export const QrAssignmentModal: React.FC<QrAssignmentModalProps> = ({
  isOpen,
  participant,
  onClose,
  onAssign,
  isLoading = false,
}) => {
  const [qrType, setQrType] = useState<'WRISTBAND' | 'ID_CARD'>('WRISTBAND');
  const [scannedQr, setScannedQr] = useState<string>('');

  if (!isOpen) return null;

  const handleScan = (token: string) => {
    setScannedQr(token.trim().toUpperCase());
  };

  const handleConfirm = async () => {
    if (scannedQr.trim()) {
      await onAssign(scannedQr.trim().toUpperCase(), qrType);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-slate-700 bg-slate-950 p-6 md:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <QrCode className="w-4 h-4" />
            <span>Assign Physical Identifier</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Bind Wristband / ID Card
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Participant: <strong className="text-slate-200">{participant.participantName}</strong> ({participant.registrationId})
          </p>
        </div>

        {/* Identifier Type Selector */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQrType('WRISTBAND')}
            className={`flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold border transition-all ${
              qrType === 'WRISTBAND'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-neon-cyan'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            WRISTBAND
          </button>
          <button
            type="button"
            onClick={() => setQrType('ID_CARD')}
            className={`flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold border transition-all ${
              qrType === 'ID_CARD'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-neon-cyan'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ID CARD / BADGE
          </button>
        </div>

        {/* QR Scanner / Manual Input */}
        <div className="border border-slate-800/80 rounded-2xl p-4 bg-slate-900/40">
          <CameraScanner
            onScan={handleScan}
            promptText="Scan physical wristband QR or barcode"
          />
        </div>

        {/* Scanned QR Confirmation Display */}
        {scannedQr && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
              Scanned Identifier:
            </span>
            <p className="text-lg font-mono font-bold text-emerald-200 break-all">
              {scannedQr}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!scannedQr.trim() || isLoading}
            className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isLoading ? (
              <span>Binding...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm & Bind</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
