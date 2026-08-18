import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Check,
} from 'lucide-react';
import { EVENTS } from '@/data/events';

export const AdminEventsPage: React.FC = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggleReg = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
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
                <Layers className="w-5 h-5 text-cyan-400" />
                Event Master Database Config (Section 2.2)
              </h1>
              <p className="text-xs text-slate-400">
                Single source of truth for all 16 symposium events, venues, capacities, and notifications.
              </p>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Event Master synced with Google Sheets!</span>
            </div>
          )}
        </div>

        {/* 16 Event Master Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {EVENTS.map((evt) => (
            <div
              key={evt.eventId}
              className="p-5 rounded-2xl bg-cyber-card border border-slate-800 hover:border-cyan-500/30 transition-colors space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {evt.eventId}
                </span>
                <span className="text-xs font-medium text-purple-300">
                  {evt.category}
                </span>
              </div>

              <div>
                <h2 className="font-display font-bold text-base text-white">{evt.title}</h2>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.shortDescription}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800 pt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{evt.schedule.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>{evt.schedule.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{evt.teamSize.description}</span>
                </div>
              </div>

              {/* Notification Toggles Status */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">Notifications:</span>
                <div className="flex items-center gap-2 text-slate-400">
                  <span title="Email Enabled" className="text-cyan-400"><Mail className="w-3.5 h-3.5" /></span>
                  <span title="SMS Enabled" className="text-emerald-400"><Smartphone className="w-3.5 h-3.5" /></span>
                  <span title="WhatsApp Enabled" className="text-purple-400"><MessageSquare className="w-3.5 h-3.5" /></span>
                  <span title="Reminders Active" className="text-amber-400"><Bell className="w-3.5 h-3.5" /></span>
                </div>
              </div>

              {/* Toggle Reg Button */}
              <button
                onClick={handleToggleReg}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition-colors"
              >
                Registration Status: <strong className="text-emerald-400">OPEN (TRUE)</strong>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminEventsPage;
