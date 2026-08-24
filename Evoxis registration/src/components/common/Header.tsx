import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { audio } from '../../services/audioService';
import { Volume2, VolumeX, Shield, LogOut, MapPin, User, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, currentStation, soundEnabled, toggleSound, portalMode, setPortalMode, logout } = useAuth();

  const handleSoundToggle = () => {
    toggleSound();
    audio.soundEnabled = !soundEnabled;
    if (!soundEnabled) {
      audio.playSuccess();
    }
  };

  const toggleMode = () => {
    const nextMode = portalMode === 'PRODUCTION' ? 'TEST' : 'PRODUCTION';
    setPortalMode(nextMode);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
      case 'RECEPTION':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'EVENT_COORDINATOR':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'FOOD_COUNTER':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090D16]/90 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Branding */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center font-black text-white text-base shadow-neon-cyan">
              E
            </div>
            <div>
              <span className="font-bold text-base md:text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
                EvoXis'26
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                Ops Portal
              </span>
            </div>
          </div>
        </div>

        {/* Center: Station & Mode Indicator */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Station:</span>
            <span className="font-bold text-cyan-300 truncate max-w-[180px]">{currentStation}</span>
          </div>

          <button
            onClick={toggleMode}
            title="Click to toggle Portal Mode (Production vs Test Drill)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              portalMode === 'PRODUCTION'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-amber-950/70 border-amber-500/60 text-amber-300 hover:bg-amber-900/60 animate-pulse'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{portalMode === 'PRODUCTION' ? 'PRODUCTION MODE' : 'TEST DRILL MODE'}</span>
          </button>
        </div>

        {/* Right: User Role & Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            title={soundEnabled ? 'Sound On' : 'Sound Muted'}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* User & Role Badge */}
          {user && (
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getRoleBadge(
                  user.role
                )}`}
              >
                {user.role.replace('_', ' ')}
              </span>

              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-slate-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
