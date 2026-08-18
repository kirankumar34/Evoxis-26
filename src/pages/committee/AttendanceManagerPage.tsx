import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Search,
  Download,
  ArrowLeft,
  RefreshCw,
  Check,
} from 'lucide-react';
import { api } from '@/services/api';
import { EVENTS } from '@/data/events';
import { EventId, ParticipationStatus, AttendanceLogRecord, OverallRegistrationRecord } from '@/types';

export const AttendanceManagerPage: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'roster' | 'audit_log'>('roster');

  const [registrations, setRegistrations] = useState<OverallRegistrationRecord[]>([]);
  const [logs, setLogs] = useState<AttendanceLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdateMsg, setStatusUpdateMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [regs, attLogs] = await Promise.all([
        api.getAllRegistrations(),
        api.getAttendanceLogs(),
      ]);
      setRegistrations(regs);
      setLogs(attLogs);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    regId: string,
    eventId: EventId,
    newStatus: ParticipationStatus
  ) => {
    await api.updateParticipationStatus(regId, eventId, newStatus);
    setStatusUpdateMsg(`Updated status for ${regId} to ${newStatus}`);
    setTimeout(() => setStatusUpdateMsg(null), 3000);
    loadData();
  };

  const exportAuditLogCSV = () => {
    if (logs.length === 0) return;

    const headers = [
      'Attendance ID',
      'Registration ID',
      'Participant Name',
      'Event ID',
      'Event Name',
      'Event Type',
      'Date',
      'Time',
      'Desk Location',
      'Attendance Status',
      'Verified By',
      'Scan Timestamp',
    ];

    const rows = logs.map((l) => [
      `"${l.attendanceId}"`,
      `"${l.registrationId}"`,
      `"${l.participantName}"`,
      `"${l.eventId}"`,
      `"${l.eventName}"`,
      `"${l.eventType}"`,
      `"${l.attendanceDate}"`,
      `"${l.attendanceTime}"`,
      `"${l.attendanceLocation}"`,
      `"${l.attendanceStatus}"`,
      `"${l.verifiedBy}"`,
      `"${l.scanTimestamp}"`,
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `EvoXis26_Attendance_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build flattened attendee roster items
  const rosterItems: {
    registrationId: string;
    participantName: string;
    college: string;
    department: string;
    eventId: EventId;
    eventName: string;
    attendanceStatus: 'Pending' | 'Present' | 'Absent';
    participationStatus: ParticipationStatus;
  }[] = [];

  registrations.forEach((r) => {
    if (r.registrationStatus !== 'Cancelled') {
      const eventIds = r.selectedEvents.split(',').map((s) => s.trim()) as EventId[];
      eventIds.forEach((eid) => {
        const fullEvt = EVENTS.find((e) => e.eventId === eid);
        const matchLog = logs.find((l) => l.registrationId === r.registrationId && l.eventId === eid);
        rosterItems.push({
          registrationId: r.registrationId,
          participantName: r.participantName,
          college: r.collegeInstitution,
          department: r.department,
          eventId: eid,
          eventName: fullEvt ? fullEvt.title : eid,
          attendanceStatus: matchLog ? 'Present' : 'Pending',
          participationStatus: matchLog ? (matchLog.participationStatus || 'Present') : 'Registered',
        });
      });
    }
  });

  const filteredRoster = rosterItems.filter((item) => {
    const matchesEvent = selectedEventId === 'All' || item.eventId === selectedEventId;
    const matchesSearch =
      item.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.registrationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.college.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  const filteredLogs = logs.filter((log) => {
    const matchesEvent = selectedEventId === 'All' || log.eventId === selectedEventId;
    const matchesSearch =
      log.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.registrationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.verifiedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-cyan-500/20 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/committee/dashboard"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-display font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Attendance & Participation Status Management
              </h1>
              <p className="text-xs text-slate-400">
                Audit trail, participation updates, and official certificate qualification rosters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={exportAuditLogCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-black bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-glow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Log</span>
            </button>
          </div>
        </div>

        {statusUpdateMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{statusUpdateMsg}</span>
          </div>
        )}

        {/* View Switcher Tabs & Filters */}
        <div className="p-4 rounded-2xl bg-cyber-card border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'roster'
                  ? 'bg-cyan-500 text-black font-bold shadow-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Event Attendee Roster ({filteredRoster.length})
            </button>
            <button
              onClick={() => setActiveTab('audit_log')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'audit_log'
                  ? 'bg-cyan-500 text-black font-bold shadow-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Scan Audit Log ({filteredLogs.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search participant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Event Filter */}
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Events & Desks</option>
              {EVENTS.map((e) => (
                <option key={e.eventId} value={e.eventId}>
                  {e.eventId} - {e.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab 1: Event Attendee Roster with Editable Participation Status */}
        {activeTab === 'roster' && (
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Reg ID</th>
                    <th className="px-4 py-3">Participant Name</th>
                    <th className="px-4 py-3">College</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Check-in State</th>
                    <th className="px-4 py-3">Participation Status (Section 15)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRoster.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                        {item.registrationId}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {item.participantName}
                      </td>
                      <td className="px-4 py-3 text-slate-300 truncate max-w-[180px]">
                        {item.college}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {item.eventId} • {item.eventName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            item.attendanceStatus === 'Present'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {item.attendanceStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.participationStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              item.registrationId,
                              item.eventId,
                              e.target.value as ParticipationStatus
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none ${
                            item.participationStatus === 'Participated'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : item.participationStatus === 'Present'
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : item.participationStatus === 'Absent'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : item.participationStatus === 'Disqualified'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="Registered">Registered</option>
                          <option value="Present">Present</option>
                          <option value="Participated">Participated</option>
                          <option value="Absent">Absent</option>
                          <option value="Disqualified">Disqualified</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Append-Only Scan Audit Log (Section 14) */}
        {activeTab === 'audit_log' && (
          <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-sans">
                  <tr>
                    <th className="px-4 py-3">Log ID</th>
                    <th className="px-4 py-3">Reg ID</th>
                    <th className="px-4 py-3">Participant</th>
                    <th className="px-4 py-3">Desk / Event</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Verified By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map((log) => (
                    <tr key={log.attendanceId} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 text-slate-400">{log.attendanceId}</td>
                      <td className="px-4 py-3 font-bold text-cyan-400">{log.registrationId}</td>
                      <td className="px-4 py-3 font-sans font-semibold text-white">{log.participantName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {log.eventId} • {log.eventName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-400">
                        {log.attendanceDate} {log.attendanceTime}
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-sans">{log.attendanceLocation}</td>
                      <td className="px-4 py-3 text-slate-400 font-sans">{log.verifiedBy}</td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-sans">
                        No scan check-in logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagerPage;
