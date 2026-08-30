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
      <div className="min-h-screen pt-32 pb-20 px-4 text-center bg-gradient-to-b from-[#02050E] via-[#040814] to-[#0A1128] text-slate-100 flex flex-col items-center justify-center">
        <div className="p-8 rounded-3xl bg-[#0A1128]/90 border border-[#E6CA65]/30 max-w-md w-full space-y-4 wanted-card-border shadow-2xl">
          <HelpCircle className="w-12 h-12 text-[#E6CA65] mx-auto" />
          <h2 className="text-2xl font-voyage font-black text-white">Challenge Not Found</h2>
          <p className="text-sm text-slate-300 font-sans">
            No symposium challenge matches the identifier "{id}".
          </p>
          <Link
            to="/events"
            className="cyber-button inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-voyage font-bold text-sm text-[#040814] bg-gradient-to-r from-[#E6CA65] to-[#FCE79C] shadow-glow-gold"
          >
            <ArrowLeft className="w-4 h-4 text-[#040814]" />
            <span>Back to All Challenges</span>
          </Link>
        </div>
      </div>
    );
  }

  const categoryColor =
    event.category === 'Technical'
      ? 'from-[#E6CA65]/20 to-[#00F2FE]/20 border-[#E6CA65]/40 text-[#FCE79C]'
      : event.category === 'Special Event'
      ? 'from-[#F59E0B]/20 to-[#FDE047]/20 border-[#F59E0B]/40 text-[#FDE047]'
      : 'from-[#E11D48]/20 to-[#FDA4AF]/20 border-[#E11D48]/40 text-[#FDA4AF]';

  const categoryIcon =
    event.category === 'Technical' ? (
      <Zap className="w-4 h-4 text-[#E6CA65]" />
    ) : event.category === 'Special Event' ? (
      <Trophy className="w-4 h-4 text-[#F59E0B]" />
    ) : (
      <Gamepad2 className="w-4 h-4 text-[#E11D48]" />
    );

  const isCash = Boolean(event.prizes.first.match(/₹[\d,]+/));

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#02050E] via-[#040814] to-[#0A1128] text-slate-100 selection:bg-[#E6CA65] selection:text-[#040814]">
      {/* Background Sea Chart Layer */}
      <div className="fixed inset-0 bg-voyage-chart opacity-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 hover:text-[#FCE79C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalog</span>
          </button>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 sm:p-10 rounded-3xl bg-[#0A1128]/95 border-2 border-[#E6CA65]/35 shadow-2xl relative overflow-hidden mb-8 wanted-card-border"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#E6CA65]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-[#E6CA65]/20 text-[#FCE79C] border border-[#E6CA65]/40 shadow-sm">
                  {event.eventId}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-gradient-to-r ${categoryColor}`}
                >
                  {categoryIcon}
                  <span>{event.category}</span>
                </span>
                {event.coordinators && event.coordinators[0]?.department && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#040814] text-slate-300 border border-[#E6CA65]/25">
                    Fleet: {event.coordinators[0].department}
                  </span>
                )}
              </div>

              <h1 className="font-voyage font-black text-3xl sm:text-4xl lg:text-5xl text-white">
                {event.title}
              </h1>

              <p className="text-[#FCE79C] font-medium text-base sm:text-lg font-voyage">
                "{event.tagline}"
              </p>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed pt-2 font-sans">
                {event.fullDescription || event.shortDescription}
              </p>
            </div>

            {/* Quick Action Box */}
            <div className="p-6 rounded-2xl bg-[#040814]/90 border border-[#E6CA65]/30 text-center flex flex-col justify-center min-w-[240px] shrink-0 space-y-4 wanted-card-border shadow-xl">
              <div className="relative z-10">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Crew / Team Format
                </span>
                <span className="font-bold text-white text-sm flex items-center justify-center gap-1.5 font-sans">
                  <Users className="w-4 h-4 text-[#00F2FE]" />
                  {event.teamSize.description}
                </span>
              </div>

              <div className="relative z-10">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  {isCash ? 'Top Bounty Prize' : 'Winner Accolade'}
                </span>
                <span className="font-mono font-bold text-[#FCE79C] text-sm">
                  {event.prizes.first.split('+')[0]?.trim() || event.prizes.first}
                </span>
              </div>

              <button
                onClick={() => navigate(`/register?event=${event.eventId}`)}
                className="cyber-button w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-voyage font-bold text-sm text-[#040814] bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#00F2FE] shadow-glow-gold transition-all hover:scale-105 relative z-10"
              >
                <Sparkles className="w-4 h-4 text-[#040814]" />
                <span>Register for Challenge</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Two-Column Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Schedule, Rounds, Rules (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Event Schedule Info */}
            <div className="p-6 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/25 wanted-card-border shadow-xl">
              <h2 className="font-voyage font-bold text-base text-white mb-4 flex items-center gap-2 relative z-10">
                <Calendar className="w-4 h-4 text-[#E6CA65]" />
                <span>Schedule & Port Coordinates</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm relative z-10 font-sans">
                <div className="p-3.5 rounded-xl bg-[#040814]/80 border border-[#E6CA65]/20 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#00F2FE] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-xs font-mono">Timing</span>
                    <span className="font-semibold text-white font-mono">{event.schedule.timeSlot}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#040814]/80 border border-[#E6CA65]/20 flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-xs font-mono">Venue Port</span>
                    <span className="font-semibold text-white">{event.schedule.venue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rounds & Structure */}
            {event.rounds && event.rounds.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/25 wanted-card-border shadow-xl">
                <h2 className="font-voyage font-bold text-base text-white mb-4 flex items-center gap-2 relative z-10">
                  <FileText className="w-4 h-4 text-[#E6CA65]" />
                  <span>Voyage Rounds & Structure</span>
                </h2>

                <div className="space-y-4 relative z-10 font-sans">
                  {event.rounds.map((round) => (
                    <div
                      key={round.roundNumber}
                      className="p-4 rounded-xl bg-[#040814]/80 border border-[#E6CA65]/20 space-y-1.5 wanted-card-border"
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-xs font-mono font-bold text-[#FCE79C]">
                          Round {round.roundNumber}: {round.title}
                        </span>
                        <span className="text-[11px] font-mono text-[#00F2FE] px-2 py-0.5 rounded bg-[#00F2FE]/10 border border-[#00F2FE]/30">
                          {round.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed relative z-10">
                        {round.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules and Guidelines */}
            <div className="p-6 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/25 wanted-card-border shadow-xl">
              <h2 className="font-voyage font-bold text-base text-white mb-4 flex items-center gap-2 relative z-10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Captain's Code & Rules</span>
              </h2>

              <ul className="space-y-2.5 relative z-10 font-sans">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#E6CA65]/15 border border-[#E6CA65]/35 text-[#FCE79C] flex items-center justify-center shrink-0 font-mono text-xs mt-0.5">
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
            <div className="p-6 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/30 wanted-card-border shadow-xl">
              <h2 className="font-voyage font-bold text-base text-white mb-4 flex items-center gap-2 relative z-10">
                <Trophy className="w-4 h-4 text-[#E6CA65]" />
                <span>Bounties & Accolades</span>
              </h2>

              <div className="space-y-3 relative z-10 font-sans">
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#E6CA65]/15 to-transparent border border-[#E6CA65]/35 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FCE79C]">🥇 1st Place Bounty</span>
                  <span className="text-xs font-semibold text-white">{event.prizes.first}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-400/10 to-transparent border border-slate-600/30 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">🥈 2nd Place Bounty</span>
                  <span className="text-xs font-semibold text-white">{event.prizes.second}</span>
                </div>

                {event.prizes.third && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-700/10 to-transparent border border-amber-800/30 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-500">🥉 3rd Place Bounty</span>
                    <span className="text-xs font-semibold text-white">{event.prizes.third}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#040814]/80 border border-[#E6CA65]/20 text-center">
                  <span className="text-xs text-slate-300 font-mono">
                    📜 {event.prizes.allParticipants}
                  </span>
                </div>
              </div>
            </div>

            {/* Judging Criteria */}
            {event.judgingCriteria && event.judgingCriteria.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/25 wanted-card-border shadow-xl">
                <h2 className="font-voyage font-bold text-base text-white mb-3 flex items-center gap-2 relative z-10">
                  <Sparkles className="w-4 h-4 text-[#00F2FE]" />
                  <span>Evaluation Standards</span>
                </h2>
                <ul className="space-y-2 relative z-10 font-sans">
                  {event.judgingCriteria.map((crit, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Event Coordinators */}
            <div className="p-6 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/25 wanted-card-border shadow-xl">
              <h2 className="font-voyage font-bold text-base text-white mb-4 flex items-center gap-2 relative z-10">
                <Users className="w-4 h-4 text-[#E6CA65]" />
                <span>Voyage Navigators & Coordinators</span>
              </h2>

              <div className="space-y-3 relative z-10 font-sans">
                {event.coordinators.map((coord, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#040814]/80 border border-[#E6CA65]/20 flex items-start justify-between gap-3 wanted-card-border"
                  >
                    <div className="relative z-10">
                      <span className="font-bold text-sm text-white block font-voyage">{coord.name}</span>
                      <span className="text-[11px] font-mono text-[#FCE79C]">{coord.role}</span>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                      {coord.phone && (
                        <a
                          href={`tel:${coord.phone}`}
                          className="p-2 rounded-lg bg-[#0E1736] text-slate-300 hover:text-[#E6CA65] hover:bg-[#0A1128] transition-colors border border-[#E6CA65]/20"
                          title="Call Coordinator"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {coord.email && (
                        <a
                          href={`mailto:${coord.email}`}
                          className="p-2 rounded-lg bg-[#0E1736] text-slate-300 hover:text-[#00F2FE] hover:bg-[#0A1128] transition-colors border border-[#E6CA65]/20"
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
