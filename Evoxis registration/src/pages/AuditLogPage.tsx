import React, { useState, useEffect } from 'react';
import { operationsApi } from '../services/operationsApi';
import { AuditLogEntry } from '../types';
import { ScrollText, Filter, Download, Search, RefreshCw, ShieldCheck } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [operationFilter, setOperationFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLogs = () => {
    const data = operationsApi.getAuditLogs();
    setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (operationFilter !== 'ALL' && log.operation !== operationFilter) return false;
    if (resultFilter !== 'ALL' && log.result !== resultFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (log.registrationId && log.registrationId.toLowerCase().includes(q)) ||
        (log.participantName && log.participantName.toLowerCase().includes(q)) ||
        (log.staffUser && log.staffUser.toLowerCase().includes(q)) ||
        (log.physicalQrId && log.physicalQrId.toLowerCase().includes(q)) ||
        (log.station && log.station.toLowerCase().includes(q)) ||
        (log.reason && log.reason.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const exportCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Timestamp', 'Operation', 'Result', 'Reg ID', 'Participant', 'Physical QR', 'Event ID', 'Station', 'Staff', 'Reason'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.operation,
      l.result,
      l.registrationId || '',
      l.participantName || '',
      l.physicalQrId || '',
      l.eventId || '',
      l.station || '',
      l.staffUser || '',
      l.reason || '',
    ]);

    const csvContent = [headers, ...rows].map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evoxis26_audit_log_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
            <ScrollText className="w-4 h-4" />
            <span>Operation Audit Trail</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            System Event & Scan Logs
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Complete tamper-evident log of every QR assignment, campus check-in, event desk scan, and food delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCsv}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-lg disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, staff, station..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Operation Filter */}
        <div>
          <select
            value={operationFilter}
            onChange={(e) => setOperationFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Operations</option>
            <option value="CAMPUS_CHECKIN">Campus Check-In</option>
            <option value="QR_ASSIGNMENT">QR Assignment</option>
            <option value="EVENT_CHECKIN">Event Check-In</option>
            <option value="FOOD_DELIVERY">Food Delivery</option>
            <option value="ADMIN_OVERRIDE">Admin Override</option>
          </select>
        </div>

        {/* Result Filter */}
        <div>
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Results</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="DUPLICATE">DUPLICATE</option>
            <option value="DENIED">DENIED</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Participant / Reg ID</th>
                <th className="py-3 px-4">Physical QR</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Station / Staff</th>
                <th className="py-3 px-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">{log.operation}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.result === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : log.result === 'DUPLICATE'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white block">{log.participantName || 'N/A'}</span>
                      <span className="text-[10px] text-cyan-300">{log.registrationId || ''}</span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{log.physicalQrId || '-'}</td>
                    <td className="py-3 px-4 text-amber-300">{log.eventId || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">
                      <div>{log.station}</div>
                      <div className="text-[10px] text-slate-500">{log.staffUser}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate">{log.reason || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    No audit logs matching current filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
