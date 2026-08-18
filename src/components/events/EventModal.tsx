import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventItem } from '@/types';
import {
  X,
  Clock,
  MapPin,
  Trophy,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface EventModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (event: EventItem) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegister,
}) => {
  if (!event || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#0A0F1D] border border-cyan-500/30 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header Strip */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-r from-[#0F172A] via-[#111827] to-[#0A0E1A] border-b border-slate-800">
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {event.category} Event
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {event.teamSize.description}
              </span>
            </div>

            {/* Title & Tagline */}
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
              {event.title}
            </h2>
            <p className="mt-1 text-sm sm:text-base font-mono font-medium text-cyan-400">
              "{event.tagline}"
            </p>

            {/* Quick Logistics Strip */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{event.schedule.timeSlot}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>{event.schedule.venue}</span>
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 sm:p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Overview */}
            <div>
              <h4 className="font-display font-bold text-base text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Event Overview</span>
              </h4>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {event.fullDescription}
              </p>
            </div>

            {/* Rounds Breakdown */}
            {event.rounds && event.rounds.length > 0 && (
              <div>
                <h4 className="font-display font-bold text-base text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Competition Rounds</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.rounds.map((round) => (
                    <div
                      key={round.roundNumber}
                      className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            ROUND {round.roundNumber}
                          </span>
                          {round.duration && (
                            <span className="text-[11px] font-mono text-slate-400">
                              ⏱ {round.duration}
                            </span>
                          )}
                        </div>
                        <h5 className="font-display font-bold text-sm text-white mb-1.5">
                          {round.title}
                        </h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {round.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules & Guidelines */}
            <div>
              <h4 className="font-display font-bold text-base text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Rules & Regulations</span>
              </h4>
              <ul className="space-y-2.5">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prizes & Recognition */}
            <div>
              <h4 className="font-display font-bold text-base text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Prizes & Cash Awards</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-950/20 border border-amber-500/30">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase">🥇 1st Place</span>
                  <p className="text-sm font-bold text-white mt-1">{event.prizes.first}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-900 border border-slate-700">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">🥈 2nd Place</span>
                  <p className="text-sm font-bold text-white mt-1">{event.prizes.second}</p>
                </div>

                {event.prizes.third && (
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 col-span-1 sm:col-span-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">🥉 3rd Place</span>
                    <p className="text-sm font-bold text-slate-200 mt-1">{event.prizes.third}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Coordinators Contact Cards */}
            <div>
              <h4 className="font-display font-bold text-base text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span>Event Coordinators (Direct Contact)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.coordinators.map((coord, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-cyan-400">{coord.role}</span>
                        <span className="text-[10px] font-mono text-slate-400">{coord.department}</span>
                      </div>
                      <h5 className="font-display font-bold text-sm text-white">{coord.name}</h5>
                    </div>

                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-800">
                      <a
                        href={`tel:${coord.phone.replace(/\s+/g, '')}`}
                        className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Call</span>
                      </a>

                      {coord.whatsapp && (
                        <a
                          href={`https://wa.me/${coord.whatsapp}?text=Hi%20${encodeURIComponent(coord.name)},%20I%20have%20a%20query%20about%20${encodeURIComponent(event.title)}%20at%20EvoXis26.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-4 sm:p-6 bg-[#080C15] border-t border-slate-800 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl font-display font-medium text-sm text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onRegister(event);
              }}
              className="cyber-button px-8 py-3 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 shadow-glow-cyan flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Register for this Event</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
