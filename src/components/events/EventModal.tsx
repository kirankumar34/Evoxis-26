import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventItem } from '@/types';
import {
  X,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Compass,
  Coins,
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

        {/* Modal Window: Captain's Log Challenge Scroll */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#0A1128] border border-[#E6CA65]/35 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden text-slate-100 wanted-card-border"
        >
          {/* Header Strip */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-r from-[#0E1736] via-[#0A1128] to-[#070D1E] border-b border-[#E6CA65]/25">
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#040814]/80 text-slate-400 hover:text-[#E6CA65] hover:bg-[#0E1736] transition-colors border border-[#E6CA65]/30 shadow-sm"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E6CA65]/15 text-[#FCE79C] border border-[#E6CA65]/35 flex items-center gap-1">
                <Compass className="w-3 h-3 text-[#E6CA65]" />
                {event.category} Challenge
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#040814] text-slate-300 border border-[#E6CA65]/20">
                {event.teamSize.description}
              </span>
            </div>

            {/* Title & Tagline */}
            <h2 className="font-voyage font-black text-2xl sm:text-4xl text-white tracking-tight">
              {event.title}
            </h2>
            <p className="mt-1 text-sm sm:text-base font-mono font-medium text-[#E6CA65]">
              "{event.tagline}"
            </p>

            {/* Quick Logistics Strip */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#040814]/80 border border-[#E6CA65]/20">
                <Clock className="w-4 h-4 text-[#00F2FE]" />
                <span>{event.schedule.timeSlot}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#040814]/80 border border-[#E6CA65]/20">
                <MapPin className="w-4 h-4 text-[#E11D48]" />
                <span>{event.schedule.venue}</span>
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 sm:p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Overview */}
            <div>
              <h4 className="font-voyage font-bold text-base text-[#FCE79C] uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E6CA65]" />
                <span>Voyage Mission Brief</span>
              </h4>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                {event.fullDescription}
              </p>
            </div>

            {/* Rounds Breakdown */}
            {event.rounds && event.rounds.length > 0 && (
              <div>
                <h4 className="font-voyage font-bold text-base text-[#FCE79C] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00F2FE]" />
                  <span>Trial Rounds</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.rounds.map((round) => (
                    <div
                      key={round.roundNumber}
                      className="p-4 rounded-2xl bg-[#040814]/80 border border-[#E6CA65]/20 flex flex-col justify-between shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#E6CA65]/15 text-[#FCE79C] border border-[#E6CA65]/35">
                            ROUND {round.roundNumber}
                          </span>
                          {round.duration && (
                            <span className="text-[11px] font-mono text-slate-400">
                              ⏱ {round.duration}
                            </span>
                          )}
                        </div>
                        <h5 className="font-voyage font-bold text-sm text-white mb-1.5">
                          {round.title}
                        </h5>
                        <p className="text-xs text-slate-300/80 leading-relaxed font-sans">
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
              <h4 className="font-voyage font-bold text-base text-[#FCE79C] uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#E6CA65]" />
                <span>Captain's Code & Regulations</span>
              </h4>
              <ul className="space-y-2.5">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#E6CA65] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prizes & Recognition */}
            <div>
              <h4 className="font-voyage font-bold text-base text-[#FCE79C] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#E6CA65]" />
                <span>Treasure Bounties & Rewards</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E6CA65]/15 to-[#B8860B]/10 border border-[#E6CA65]/40 shadow-sm">
                  <span className="text-xs font-mono font-bold text-[#FCE79C] uppercase">🥇 1st Place Bounty</span>
                  <p className="text-sm font-bold text-white mt-1">{event.prizes.first}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0E1736] to-[#040814] border border-[#E6CA65]/25">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">🥈 2nd Place Bounty</span>
                  <p className="text-sm font-bold text-white mt-1">{event.prizes.second}</p>
                </div>

                {event.prizes.third && (
                  <div className="p-4 rounded-2xl bg-[#040814]/80 border border-[#E6CA65]/20 col-span-1 sm:col-span-2">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">🥉 3rd Place Bounty</span>
                    <p className="text-sm font-bold text-slate-200 mt-1">{event.prizes.third}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Coordinators Contact Cards */}
            <div>
              <h4 className="font-voyage font-bold text-base text-[#FCE79C] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00F2FE]" />
                <span>Voyage Quartermasters (Direct Contact)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.coordinators.map((coord, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#040814]/90 border border-[#E6CA65]/20 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-[#E6CA65]">{coord.role}</span>
                        <span className="text-[10px] font-mono text-slate-400">{coord.department}</span>
                      </div>
                      <h5 className="font-voyage font-bold text-sm text-white">{coord.name}</h5>
                    </div>

                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-[#E6CA65]/15">
                      <a
                        href={`tel:${coord.phone.replace(/\s+/g, '')}`}
                        className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#0E1736] hover:bg-[#132247] text-[#FCE79C] border border-[#E6CA65]/30 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#E6CA65]" />
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
          <div className="p-4 sm:p-6 bg-[#040814] border-t border-[#E6CA65]/25 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl font-voyage font-medium text-sm text-slate-300 bg-[#0A1128] hover:bg-[#0E1736] border border-[#E6CA65]/30 transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onRegister(event);
              }}
              className="cyber-button px-8 py-3 rounded-xl font-voyage font-black text-sm text-[#040814] bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#00F2FE] hover:from-[#FFF5C0] hover:to-[#38BDF8] shadow-glow-gold flex items-center gap-2 transition-all hover:scale-105 border border-[#FFF5C0]/60"
            >
              <span>Register for this Challenge</span>
              <ArrowRight className="w-4 h-4 text-[#040814]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
