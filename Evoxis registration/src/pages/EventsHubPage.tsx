import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OFFICIAL_EVENTS } from '../config/events';
import { operationsApi } from '../services/operationsApi';
import { LiveDashboardMetrics } from '../types';
import { CalendarCheck, QrCode, ArrowRight, Sparkles, Trophy, Users } from 'lucide-react';

export const EventsHubPage: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveDashboardMetrics | null>(null);

  useEffect(() => {
    operationsApi.getLiveStats().then(setMetrics);
  }, []);

  const technicalEvents = OFFICIAL_EVENTS.filter((e) => e.category === 'Technical');
  const nonTechEvents = OFFICIAL_EVENTS.filter((e) => e.category === 'Non-Technical');
  const specialEvents = OFFICIAL_EVENTS.filter((e) => e.category === 'Special');

  const renderEventGrid = (events: typeof OFFICIAL_EVENTS, categoryBadge: string, badgeColor: string) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${badgeColor}`}>
          {categoryBadge} ({events.length})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {events.map((evt) => {
          const stat = metrics?.perEventMetrics[evt.eventId] || {
            registered: 0,
            present: 0,
            absent: 0,
            attendancePct: 0,
          };

          return (
            <div
              key={evt.eventId}
              className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {evt.eventId}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{evt.type}</span>
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Venue: <strong className="text-slate-300">{evt.venue || 'TBA'}</strong>
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Time: <strong className="text-slate-300">{evt.startTime} - {evt.endTime}</strong>
                </p>
              </div>

              {/* Attendance Stats & Launch Scanner Button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="text-xs font-mono">
                  <span className="text-slate-400 block">Attendance:</span>
                  <span className="text-emerald-400 font-bold">
                    {stat.present} / {stat.registered} ({stat.attendancePct}%)
                  </span>
                </div>

                <Link
                  to={`/events/${evt.eventId}/scan`}
                  className="py-2 px-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Launch Scanner</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          <CalendarCheck className="w-4 h-4" />
          <span>Event Desks Hub</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Select Event Workstation (15 Events)
        </h1>
        <p className="text-xs md:text-sm text-slate-400 font-mono mt-1">
          Launch scanner for your assigned event. Scanners enforce server-side event eligibility and prevent duplicate check-ins.
        </p>
      </div>

      {/* Technical Events */}
      {renderEventGrid(
        technicalEvents,
        'TECHNICAL EVENTS',
        'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
      )}

      {/* Non-Technical Events */}
      {renderEventGrid(
        nonTechEvents,
        'NON-TECHNICAL EVENTS',
        'bg-amber-500/10 text-amber-300 border-amber-500/30'
      )}

      {/* Special Events */}
      {renderEventGrid(
        specialEvents,
        'SPECIAL WORKSHOPS & CHALLENGES',
        'bg-violet-500/10 text-violet-300 border-violet-500/30'
      )}
    </div>
  );
};
