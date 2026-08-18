import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  QrCode,
  Search,
  Download,
  Layers,
  Award,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/services/api';
import { EVENTS } from '@/data/events';
import { EventId, EventCategory, OverallRegistrationRecord, AdminUser } from '@/types';

export const CommitteeDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [stats, setStats] = useState<{
    totalRegistered: number;
    receptionPresent: number;
    totalEvents: number;
    eventStats: {
      eventId: EventId;
      eventName: string;
      category: EventCategory;
      registered: number;
      present: number;
      absent: number;
      participated: number;
    }[];
  } | null>(null);

  const [registrations, setRegistrations] = useState<OverallRegistrationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('All');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<EventCategory | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = api.getCurrentAdmin();
    if (!user) {
      navigate('/committee/login');
      return;
    }
    setCurrentUser(user);
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await api.getDashboardStats();
      if (statsRes.success) {
        setStats(statsRes.data);
      }
      const regs = await api.getAllRegistrations();
      setRegistrations(regs);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    api.logoutAdmin();
    navigate('/committee/login');
  };

  const exportCSV = () => {
    if (registrations.length === 0) return;

    const headers = [
      'Registration ID',
      'Participant Name',
      'Email',
      'Mobile',
      'College',
      'Department',
      'Year',
      'Registration Type',
      'Selected Events',
      'Reception Attendance Status',
      'Registration Date',
    ];

    const rows = registrations.map((r) => [
      `"${r.registrationId}"`,
      `"${r.participantName}"`,
      `"${r.email}"`,
      `"${r.mobileNumber}"`,
      `"${r.collegeInstitution}"`,
      `"${r.department}"`,
      `"${r.year}"`,
      `"${r.registrationType}"`,
      `"${r.selectedEvents}"`,
      `"${r.overallAttendanceStatus}"`,
      `"${r.registrationDate}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EvoXis26_Master_Registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered registrations for table
  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.registrationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.collegeInstitution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mobileNumber.includes(searchQuery);

    const matchesEvent =
      selectedEventFilter === 'All' ||
      r.selectedEvents.includes(selectedEventFilter);

    return matchesSearch && matchesEvent;
  });

  const filteredEventStats = (stats?.eventStats || []).filter((e) => {
    if (selectedCategoryTab === 'All') return true;
    return e.category === selectedCategoryTab;
  });

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top App Bar with Role & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-cyber-card border border-cyan-500/20 shadow-glass">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-black text-white">Registration Committee Command Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {currentUser?.role || 'COMMITTEE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as: <strong className="text-slate-200">{currentUser?.name}</strong> • Real-time synchronization active
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={loadDashboardData}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <Link
              to="/committee/reception-scanner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold text-xs text-black bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 shadow-glow-cyan transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Reception Scanner</span>
            </Link>

            <Link
              to="/committee/event-scanner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-glow-purple"
            >
              <Layers className="w-4 h-4" />
              <span>Event Desk Mode</span>
            </Link>

            <Link
              to="/committee/attendance"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Attendance Roster</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-cyber-card border border-cyan-500/20">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Total Master Registrations
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-display font-black text-white">
                {stats?.totalRegistered || 0}
              </span>
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-[11px] text-cyan-300 font-mono mt-2 block">
              Across all 16 official events
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-cyber-card border border-emerald-500/20">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Reception Checked-In
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-display font-black text-emerald-400">
                {stats?.receptionPresent || 0}
              </span>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-[11px] text-emerald-300 font-mono mt-2 block">
              {stats?.totalRegistered
                ? `${Math.round(((stats.receptionPresent || 0) / stats.totalRegistered) * 100)}% campus turnout`
                : '0% campus turnout'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-cyber-card border border-purple-500/20">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Symposium Catalog
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-display font-black text-purple-400">16</span>
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-[11px] text-purple-300 font-mono mt-2 block">
              6 Tech • 6 Non-Tech • 4 Special
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-cyber-card border border-amber-500/20">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Backend Status
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-display font-bold text-amber-400">
                {api.isMockMode() ? 'Local Storage Engine' : 'Google Sheets Web App'}
              </span>
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-2 block">
              {api.isMockMode() ? 'Autonomous Offline Simulation' : 'Connected to Apps Script'}
            </span>
          </div>
        </div>

        {/* SECTION 2: 16 EVENT SUMMARY CARDS (DYNAMIC FROM EVENT MASTER) */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                16 Events Live Check-in Overview
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time headcounts pulled dynamically per event desk.
              </p>
            </div>

            {/* Category Tab Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
              {(['All', 'Technical', 'Non-Technical', 'Special'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryTab(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategoryTab === cat
                      ? 'bg-cyan-500 text-black font-bold shadow-glow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredEventStats.map((evt) => {
              const turnoutPct = evt.registered > 0 ? Math.round((evt.present / evt.registered) * 100) : 0;
              return (
                <div
                  key={evt.eventId}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {evt.eventId}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-emerald-400">
                        {turnoutPct}% Present
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-sm text-white mb-2 line-clamp-1">
                      {evt.eventName}
                    </h3>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${turnoutPct}%` }}
                      />
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-1 text-center py-2 bg-slate-950/60 rounded-lg border border-slate-800/60 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">REG</span>
                        <strong className="text-white font-mono">{evt.registered}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">PRESENT</span>
                        <strong className="text-emerald-400 font-mono">{evt.present}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">DONE</span>
                        <strong className="text-purple-400 font-mono">{evt.participated}</strong>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/committee/event-scanner?event=${evt.eventId}`}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    <span>Launch Desk Scanner</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: MASTER PARTICIPANT DIRECTORY TABLE */}
        <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Master Participant Records
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {filteredRegistrations.length} of {registrations.length} total participants
              </p>
            </div>

            {/* Table Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, ID, college..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Event Filter Dropdown */}
              <select
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="All">All 16 Events</option>
                {EVENTS.map((e) => (
                  <option key={e.eventId} value={e.eventId}>
                    {e.eventId} - {e.title}
                  </option>
                ))}
              </select>

              {/* Export CSV */}
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-400 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Reg ID</th>
                  <th className="px-4 py-3">Participant Name</th>
                  <th className="px-4 py-3">College & Dept</th>
                  <th className="px-4 py-3">Mobile / Contact</th>
                  <th className="px-4 py-3">Events Registered</th>
                  <th className="px-4 py-3">Reception Check-in</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.registrationId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                      {reg.registrationId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {reg.participantName}
                      <span className="block text-[10px] text-slate-400 font-normal">{reg.email}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <span className="line-clamp-1">{reg.collegeInstitution}</span>
                      <span className="block text-[10px] text-slate-500">{reg.department} ({reg.year})</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {reg.mobileNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {reg.selectedEvents.split(',').map((eid) => (
                          <span
                            key={eid.trim()}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          >
                            {eid.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          reg.overallAttendanceStatus === 'Present'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {reg.overallAttendanceStatus === 'Present' ? 'PRESENT' : 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/my-registration?id=${reg.registrationId}`}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 inline-flex"
                        title="View Pass & QR"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeDashboardPage;
