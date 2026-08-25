import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { operationsApi } from '../services/operationsApi';
import { LiveDashboardMetrics } from '../types';
import { OFFICIAL_EVENTS } from '../config/events';
import {
  Users,
  CheckCircle2,
  QrCode,
  CalendarCheck,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  Shield,
  Activity,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await operationsApi.getLiveStats();
      setMetrics(data);
    } catch (e) {
      console.warn('Dashboard stats fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const campusPct =
    metrics && metrics.totalRegistered > 0
      ? Math.round((metrics.campusPresent / metrics.totalRegistered) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Top Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4 text-violet-400" />
            <span>Super Admin Command Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Live Operations Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Campus Attendance */}
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase font-bold text-cyan-400">Campus Check-Ins</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-white font-mono">
              {metrics?.campusPresent || 0}
            </span>
            <span className="text-xs font-mono text-slate-400">
              / {metrics?.totalRegistered || 0} ({campusPct}%)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${campusPct}%` }}
            />
          </div>
        </div>

        {/* Physical QR Assignments */}
        <div className="p-5 rounded-2xl glass-panel border border-violet-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase font-bold text-violet-400">Wristbands Assigned</span>
            <QrCode className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-white font-mono">
              {metrics?.qrAssigned || 0}
            </span>
            <span className="text-xs font-mono text-slate-400">
              / {metrics?.totalRegistered || 0}
            </span>
          </div>
          <div className="mt-3 text-xs font-mono text-slate-400">
            Unassigned: <strong className="text-amber-400">{metrics?.qrUnassigned || 0}</strong>
          </div>
        </div>

        {/* Duplicate Scans Guarded */}
        <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase font-bold text-amber-400">Duplicate Attempts Blocked</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-amber-300 font-mono">
              {metrics?.duplicateAttemptsCount || 0}
            </span>
            <span className="text-xs font-mono text-slate-400">Attempts</span>
          </div>
          <div className="mt-3 text-xs font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Idempotency Guard Active</span>
          </div>
        </div>
      </div>

      {/* 15 Events Attendance Overview */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-400" />
              <span>Event Desks Attendance (15 Events)</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">Live check-in progress across all technical, non-technical & special events</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Open Event Desks</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OFFICIAL_EVENTS.map((evt) => {
            const stat = metrics?.perEventMetrics[evt.eventId] || {
              registered: 0,
              present: 0,
              absent: 0,
              attendancePct: 0,
            };

            return (
              <Link
                key={evt.eventId}
                to={`/events/${evt.eventId}/scan`}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all block group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {evt.eventId}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">
                    {evt.category}
                  </span>
                </div>
                <div className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                  {evt.title}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    Present: <strong className="text-emerald-400">{stat.present}</strong>
                  </span>
                  <span className="text-slate-400">
                    Registered: <strong className="text-slate-200">{stat.registered}</strong>
                  </span>
                  <span className="text-cyan-400 font-bold">{stat.attendancePct}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Live Recent Scans Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Recent Activity Feed</span>
            </h3>
            <Link to="/audit" className="text-xs font-mono text-cyan-400 hover:text-cyan-300">
              View All Logs
            </Link>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {metrics?.recentScans && metrics.recentScans.length > 0 ? (
              metrics.recentScans.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{log.operation}</span>
                      {log.registrationId && (
                        <span className="text-cyan-300">[{log.registrationId}]</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Station: {log.station} · By: {log.staffUser}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        log.result === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : log.result === 'DUPLICATE'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {log.result}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-mono text-slate-500 text-center py-8">No recent scans recorded yet</p>
            )}
          </div>
        </div>

        {/* Security & Error Logs */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Denied / Duplicate / Error Logs</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Real-time alerts</span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {metrics?.recentErrors && metrics.recentErrors.length > 0 ? (
              metrics.recentErrors.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start justify-between text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-rose-300">{log.operation}</span>
                    <p className="text-[11px] text-slate-300 mt-0.5">{log.reason || 'Denied'}</p>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Station: {log.station} · {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {log.result}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs font-mono flex flex-col items-center justify-center gap-1.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>Zero system errors in recent window</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
