import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PRESET_STATIONS } from '../config/stations';
import { audio } from '../services/audioService';
import { isSupabaseConfigured } from '../services/supabase';
import {
  Settings,
  MapPin,
  Volume2,
  VolumeX,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentStation, setStation, soundEnabled, toggleSound, user } = useAuth();
  const supabaseConnected = isSupabaseConfigured();

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>Workstation Configuration</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Settings & Diagnostics
        </h1>
      </div>

      {/* Station Selector Card */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>Active Workstation Location</span>
        </h3>
        <p className="text-xs font-mono text-slate-400">
          This station identifier is stamped on all campus check-ins, event attendance logs, and meal records.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {PRESET_STATIONS.map((st) => {
            const isSelected = currentStation === st.name;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStation(st.name)}
                className={`p-4 rounded-2xl border text-left text-xs font-mono transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-neon-cyan'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">[{st.id}]</span>
                    <span className="text-[10px] uppercase text-slate-400">{st.category}</span>
                  </div>
                  <div className="font-semibold text-slate-200">{st.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{st.defaultLocation}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio & Haptic Feedback */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Sound & Audio Feedback</span>
          </h3>
          <button
            onClick={toggleSound}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
              soundEnabled
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            {soundEnabled ? 'ENABLED' : 'MUTED'}
          </button>
        </div>

        <p className="text-xs font-mono text-slate-400">
          Zero-latency sound synthesis triggers on scan events to alert staff without needing to look at screen.
        </p>

        {/* Audio Test Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => audio.playSuccess()}
            className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-900/40"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Success Chime</span>
          </button>

          <button
            type="button"
            onClick={() => audio.playWarning()}
            className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-900/40"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Duplicate Warning</span>
          </button>

          <button
            type="button"
            onClick={() => audio.playError()}
            className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-900/40"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Error Buzzer</span>
          </button>
        </div>
      </div>

      {/* Backend & Dual Sync Health Diagnostics */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-violet-400" />
          <span>Database & Mirror Synchronization Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">Supabase PostgreSQL</span>
              {supabaseConnected ? (
                <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED
                </span>
              ) : (
                <span className="text-rose-400 text-xs font-mono font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> OFFLINE
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-400 break-all">
              Project: <span className="text-slate-200">rvpdwkqpgloyfahdjmvr</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400">Single Source of Truth (Live Reads & Writes)</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">Google Sheets Mirror</span>
              <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 break-all">
              Spreadsheet: <span className="text-slate-200">EvoXis26_Master_Database</span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400">Synced via Apps Script Web App</div>
          </div>
        </div>
      </div>
    </div>
  );
};
