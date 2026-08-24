import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StaffRole } from '../types';
import { PRESET_STATIONS } from '../config/stations';
import { OFFICIAL_EVENTS } from '../config/events';
import {
  Shield,
  QrCode,
  CalendarCheck,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  MapPin,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<StaffRole>('RECEPTION');
  const [station, setStation] = useState<string>('REC-01');
  const [selectedEventId, setSelectedEventId] = useState<string>('TE02');
  const [staffName, setStaffName] = useState<string>('');

  const rolesList = [
    {
      role: 'RECEPTION' as StaffRole,
      title: 'Reception Desk',
      desc: 'Verify signup QR, assign wristbands, mark campus present',
      icon: QrCode,
      color: 'border-cyan-500/50 text-cyan-400 bg-cyan-950/20',
      activeBg: 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-neon-cyan',
      defaultRoute: '/reception',
    },
    {
      role: 'EVENT_COORDINATOR' as StaffRole,
      title: 'Event Desk',
      desc: '15 Events: Verify eligibility, mark attendance per event',
      icon: CalendarCheck,
      color: 'border-amber-500/50 text-amber-400 bg-amber-950/20',
      activeBg: 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-neon-amber',
      defaultRoute: '/events',
    },
    {
      role: 'FOOD_COUNTER' as StaffRole,
      title: 'Food Counter',
      desc: 'Single-meal distribution, duplicate scan prevention',
      icon: UtensilsCrossed,
      color: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20',
      activeBg: 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-neon-emerald',
      defaultRoute: '/food',
    },
    {
      role: 'SUPER_ADMIN' as StaffRole,
      title: 'Super Admin',
      desc: 'Full visibility, live dashboard, overrides, audit trail',
      icon: Shield,
      color: 'border-violet-500/50 text-violet-400 bg-violet-950/20',
      activeBg: 'bg-violet-500/20 border-violet-400 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,0.3)]',
      defaultRoute: '/dashboard',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stationObj = PRESET_STATIONS.find((s) => s.id === station);
    const stationName = stationObj ? stationObj.name : station;

    login(selectedRole, stationName, selectedEventId, staffName.trim() || undefined);

    const activeRoleConfig = rolesList.find((r) => r.role === selectedRole);
    const destination =
      selectedRole === 'EVENT_COORDINATOR'
        ? `/events/${selectedEventId}/scan`
        : activeRoleConfig?.defaultRoute || '/reception';

    navigate(destination);
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SRIRAM ENGINEERING COLLEGE · SEPT 26, 2026</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            EvoXis<span className="text-cyan-400">'26</span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Operations Portal
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto">
            Reception Desk · 15 Event Stations · Food Counter · Super Admin Hub
          </p>
        </div>

        {/* Role Selector Grid */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-3 tracking-wider">
              1. Select Your Operational Workstation Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rolesList.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setSelectedRole(item.role)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected ? item.activeBg : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-5 h-5" />
                        <span className="font-bold text-sm text-white">{item.title}</span>
                      </div>
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Station & Event Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Station Location</span>
              </label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              >
                {PRESET_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedRole === 'EVENT_COORDINATOR' && (
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assigned Event Desk</span>
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs font-mono text-amber-200 focus:outline-none focus:border-amber-400"
                >
                  {OFFICIAL_EVENTS.map((evt) => (
                    <option key={evt.eventId} value={evt.eventId}>
                      [{evt.eventId}] {evt.title} ({evt.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                Staff Name (Optional)
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. Arun (Vol / Coord)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Launch Workstation Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black font-mono text-sm uppercase tracking-wider shadow-neon-cyan transition-all flex items-center justify-center gap-2 group"
          >
            <span>Launch Workstation</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>
      </div>
    </div>
  );
};
