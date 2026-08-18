import React from 'react';
import { useCountdown } from '@/hooks/useCountdown';

interface CountdownTimerProps {
  targetDate: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  const units = [
    { label: 'DAYS', value: days, gradient: 'from-cyan-400 to-blue-500' },
    { label: 'HOURS', value: hours, gradient: 'from-blue-400 to-indigo-500' },
    { label: 'MINUTES', value: minutes, gradient: 'from-indigo-400 to-purple-500' },
    { label: 'SECONDS', value: seconds, gradient: 'from-purple-400 to-pink-500' },
  ];

  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-display font-bold text-lg">
        <span>⚡ Symposium Live Now! Registrations at Helpdesk</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-6">
      {units.map((unit, idx) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="relative group">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300 opacity-70" />
            
            {/* Box Container */}
            <div className="relative w-16 sm:w-20 md:w-24 h-20 sm:h-24 md:h-28 rounded-2xl bg-[#0D1322]/90 border border-cyan-500/20 backdrop-blur-xl flex flex-col items-center justify-center p-2 shadow-2xl">
              <span className={`font-mono font-black text-2xl sm:text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-b ${unit.gradient} tracking-tight`}>
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-[11px] font-mono font-bold tracking-widest text-slate-400 mt-1">
                {unit.label}
              </span>

              {/* Top LED indicator */}
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-pulse" />
            </div>
          </div>

          {/* Separator dots (except last) */}
          {idx < units.length - 1 && (
            <div className="hidden sm:block absolute font-mono font-bold text-cyan-500/40 text-2xl" style={{ left: `calc(${(idx + 1) * 25}% - 8px)` }}>
              :
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
