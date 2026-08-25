import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, Keyboard, RefreshCw, Sparkles } from 'lucide-react';

interface CameraScannerProps {
  onScan: (decodedText: string) => void;
  isPaused?: boolean;
  promptText?: string;
  fps?: number;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onScan,
  isPaused = false,
  promptText = 'Point camera at QR code or wristband',
  fps = 10,
}) => {
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'MANUAL'>('CAMERA');
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'evoxis-qr-reader-surface';
  const lastScannedTimeRef = useRef<number>(0);

  // Keep fresh reference to onScan callback to eliminate stale closure bugs
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // Hardware barcode scanner listener (Keyboard wedge)
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a standard input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.trim().length >= 3) {
          e.preventDefault();
          onScanRef.current(buffer.trim());
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Enumerate cameras & start scanner
  useEffect(() => {
    let mounted = true;

    const initScanner = async () => {
      if (activeTab !== 'CAMERA') return;

      try {
        const devices = await Html5Qrcode.getCameras();
        if (!mounted) return;

        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/environment camera if available
          const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          const chosenId = backCam ? backCam.id : devices[0].id;
          setSelectedCameraId(chosenId);
          startCamera(chosenId);
        } else {
          setCameraError('No cameras found on this device');
        }
      } catch (err: any) {
        console.warn('Camera enumeration error:', err);
        if (mounted) {
          setCameraError(err?.message || 'Camera access permission denied or unavailable');
        }
      }
    };

    initScanner();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [activeTab]);

  const startCamera = async (cameraId: string) => {
    setCameraError(null);
    try {
      await stopCamera();

      // Ensure container element exists in DOM
      const containerEl = document.getElementById(readerElementId);
      if (!containerEl) return;

      const html5Qr = new Html5Qrcode(readerElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
        ],
        verbose: false,
      });
      scannerRef.current = html5Qr;

      await html5Qr.start(
        cameraId,
        {
          fps,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          const now = Date.now();
          // Debounce same QR scan by 1.5s
          if (now - lastScannedTimeRef.current > 1500) {
            lastScannedTimeRef.current = now;
            onScanRef.current(decodedText.trim());
          }
        },
        () => {
          // Ignore parse errors on empty frames
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(err?.message || 'Failed to start camera');
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setIsScanning(false);

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (e) {
        // Silently ignore if already stopped
      }

      try {
        const el = document.getElementById(readerElementId);
        if (el && el.childElementCount > 0) {
          await scanner.clear();
        }
      } catch (e) {
        // Suppress DOM removal NotFoundError if React already detached DOM node
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Scanner Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-4">
        <button
          type="button"
          onClick={() => {
            setActiveTab('CAMERA');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'CAMERA'
              ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>CAMERA SCANNER</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab('MANUAL');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'MANUAL'
              ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>MANUAL / HARDWARE</span>
        </button>
      </div>

      {activeTab === 'CAMERA' ? (
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Camera Viewfinder Container */}
          <div className="relative w-full aspect-square max-w-[340px] rounded-3xl overflow-hidden border-2 border-cyan-500/40 bg-black/80 shadow-2xl flex items-center justify-center">
            <div id={readerElementId} className="w-full h-full" />

            {/* Target Reticle Overlay */}
            {isScanning && !isPaused && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
                <div className="w-48 h-48 border-2 border-cyan-400 rounded-2xl relative">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-cyan-300" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-cyan-300" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-cyan-300" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-cyan-300" />

                  {/* Animated glowing scanning laser line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#06B6D4] animate-scanline" />
                </div>
              </div>
            )}

            {/* Error or Fallback Message */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                <CameraOff className="w-10 h-10 text-rose-400 mb-3" />
                <p className="text-sm font-semibold text-rose-300 mb-2">Camera Unavailable</p>
                <p className="text-xs text-slate-400 mb-4">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('MANUAL')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 border border-slate-700 font-bold"
                >
                  Switch to Manual Search
                </button>
              </div>
            )}
          </div>

          {/* Camera Controls & Switcher */}
          {cameras.length > 1 && (
            <div className="mt-3 flex items-center gap-2">
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  startCamera(e.target.value);
                }}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Camera ${c.id.substring(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="mt-3 text-xs text-center font-mono text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{promptText}</span>
          </p>
        </div>
      ) : (
        /* Manual & Hardware Scanner Mode */
        <div className="w-full max-w-md p-6 rounded-2xl glass-panel border border-slate-800">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-slate-300 mb-1.5">
                Scan / Enter QR Token, Reg ID, Mobile, or Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="e.g. EVOXIS26-00025, WRIST-EVX-001, or phone"
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider shadow-neon-cyan transition-all"
              >
                Submit / Verify
              </button>
              <button
                type="button"
                onClick={() => setManualInput('')}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <p className="text-cyan-400 font-semibold">⚡ Hardware USB / Bluetooth Scanner Mode:</p>
              <p>Plug in your handheld barcode scanner. It automatically fires input on scan without clicking.</p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
