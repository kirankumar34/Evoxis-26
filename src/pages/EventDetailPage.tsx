import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  CheckCircle2,
  Phone,
  Mail,
  Sparkles,
  Zap,
  Gamepad2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { EVENTS } from '@/data/events';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const event = EVENTS.find(
    (e) =>
      e.id.toLowerCase() === (id || '').toLowerCase() ||
      e.eventId.toLowerCase() === (id || '').toLowerCase() ||
      e.sheetSlug.toLowerCase() === (id || '').toLowerCase()
  );

  if (!event) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center bg-cyber-dark text-slate-100 flex flex-col items-center justify-center">
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 max-w-md w-full space-y-4">
          <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-2xl font-display font-black text-white">Event Not Found</h2>
          <p className="text-sm text-slate-400">
            No symposium event matches the identifier "{id}".
          </p>
          <Link
            to="/events"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 to-sky-400 shadow-glow-cyan"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>
        </div>
      </div>
    );
  }

  const categoryColor =
    event.category === 'Technical'
      ? 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400'
      : event.category === 'Non-Technical'
      ? 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400'
      : 'from-amber-500/20 to-rose-500/20 border-amber-500/30 text-amber-400';

  const categoryIcon =
    event.category === 'Technical' ? (
      <Zap className="w-4 h-4" />
    ) : event.category === 'Non-Technical' ? (
      <Gamepad2 className="w-4 h-4" />
    ) : (
      <Trophy className="w-4 h-4" />
    );

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </button>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 sm:p-10 rounded-3xl bg-cyber-card border border-cyan-500/20 shadow-glass relative overflow-hidden mb-8"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {event.eventId}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-gradient-to-r ${categoryColor}`}
                >
                  {categoryIcon}
                  <span>{event.category}</span>
                </span>
                {event.coordinators && event.coordinators[0]?.department && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    Dept: {event.coordinators[0].department}
                  </span>
                )}
              </div>

              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white">
                {event.title}
              </h1>

              <p className="text-cyan-300 font-medium text-base sm:text-lg">
                "{event.tagline}"
              </p>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed pt-2">
                {event.fullDescription || event.shortDescription}
              </p>
            </div>

            {/* Quick Action Box */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-center flex flex-col justify-center min-w-[240px] shrink-0 space-y-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Team Format
                </span>
                <span className="font-bold text-white text-sm flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  {event.teamSize.description}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Top Cash Prize
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {event.prizes.first.split('+')[0] || event.prizes.first}
                </span>
              </div>

              <button
                onClick={() => navigate(`/register?event=${event.eventId}`)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-glow-cyan transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Register for Event</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Two-Column Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Schedule, Rounds, Rules (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Event Schedule Info */}
            <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800">
              <h2 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Schedule & Venue</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-xs">Timing</span>
                    <span className="font-semibold text-white font-mono">{event.schedule.timeSlot}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-xs">Venue</span>
                    <span className="font-semibold text-white">{event.schedule.venue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rounds & Structure */}
            {event.rounds && event.rounds.length > 0 && (
              <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800">
                <h2 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Competition Rounds</span>
                </h2>

                <div className="space-y-4">
                  {event.rounds.map((round) => (
                    <div
                      key={round.roundNumber}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          Round {round.roundNumber}: {round.title}
                        </span>
                        <span className="text-[11px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                          {round.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {round.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules and Guidelines */}
            <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800">
              <h2 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Rules & Regulations</span>
              </h2>

              <ul className="space-y-2.5">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 font-mono text-xs mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Prizes, Judging, Coordinators (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Prizes Breakdown */}
            <div className="p-6 rounded-2xl bg-cyber-card border border-amber-500/20">
              <h2 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Prizes & Accolades</span>
              </h2>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300">🥇 1st Place</span>
                  <span className="text-xs font-semibold text-white">{event.prizes.first}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-400/10 to-transparent border border-slate-600/30 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">🥈 2nd Place</span>
                  <span className="text-xs font-semibold text-white">{event.prizes.second}</span>
                </div>

                {event.prizes.third && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-700/10 to-transparent border border-amber-800/30 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-500">🥉 3rd Place</span>
                    <span className="text-xs font-semibold text-white">{event.prizes.third}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400">
                    📜 {event.prizes.allParticipants}
                  </span>
                </div>
              </div>
            </div>

            {/* Judging Criteria */}
            {event.judgingCriteria && event.judgingCriteria.length > 0 && (
              <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800">
                <h2 className="font-display font-bold text-base text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Judging Criteria</span>
                </h2>
                <ul className="space-y-2">
                  {event.judgingCriteria.map((crit, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Event Coordinators */}
            <div className="p-6 rounded-2xl bg-cyber-card border border-slate-800">
              <h2 className="font-display font-bold text-base text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Event Coordinators</span>
              </h2>

              <div className="space-y-3">
                {event.coordinators.map((coord, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-sm text-white block">{coord.name}</span>
                      <span className="text-[11px] font-mono text-cyan-400">{coord.role}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {coord.phone && (
                        <a
                          href={`tel:${coord.phone}`}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                          title="Call Coordinator"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {coord.email && (
                        <a
                          href={`mailto:${coord.email}`}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-purple-400 hover:bg-slate-700 transition-colors"
                          title="Email Coordinator"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
