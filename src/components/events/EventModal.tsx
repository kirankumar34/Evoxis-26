import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventItem } from '@/types';
import { X, ArrowLeft, Phone, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';
import { sound } from '@/utils/audio';

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

  const handleRegisterClick = () => {
    sound.playCannon?.();
    onClose();
    onRegister(event);
  };

  const handleBackClick = () => {
    sound.playTick?.();
    onClose();
  };

  // Format Bounty / Award amount
  const bountyMatch = event.prizes.Prize.match(/₹[\d,]+/);
  const isCash = Boolean(bountyMatch);
  const bountyText = isCash ? bountyMatch![0] : 'CERTIFICATE';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackClick}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window: Manga Dossier */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-3xl max-h-[92vh] bg-[#F7ECD4] text-black border-4 border-black rounded-lg shadow-[10px_10px_0px_0px_#000000] z-10 flex flex-col overflow-hidden select-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* ── TOP ACTION BAR ────────────────────────────────────────── */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 bg-[#F2DFC0] border-b-2 border-black flex-shrink-0">
            {/* Back Button */}
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-[#FFC928] border-2 border-black hover:bg-[#E2231A] hover:text-white transition-all shadow-[2px_2px_0px_0px_#000] cursor-pointer"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1rem', letterSpacing: '0.08em' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO CREW</span>
            </button>

            {/* File ID Badge & Close */}
            <div className="flex items-center gap-2">
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}
                className="hidden sm:inline-block px-3 py-1 bg-[#003B73] text-white font-bold rounded-sm border border-black uppercase"
              >
                FILE_NO.{event.eventId}_{event.sheetSlug.toUpperCase()}
              </span>

              <button
                onClick={handleBackClick}
                className="p-1.5 rounded-md bg-black/10 hover:bg-black/20 text-black border border-black transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── SCROLLABLE DOSSIER BODY ───────────────────────────────── */}
          <div className="p-4 sm:p-7 space-y-6 overflow-y-auto max-h-[calc(92vh-140px)] bg-[#F7ECD4]">
            {/* 1. Manga Top Hero Red Box Banner */}
            <div className="relative rounded-sm bg-[#E2231A] border-4 border-black p-5 sm:p-6 shadow-[5px_5px_0px_0px_#FFC928] overflow-hidden text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      fontFamily: "'Anton', sans-serif",
                      fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                      lineHeight: 1,
                      letterSpacing: '0.04em',
                    }}
                    className="uppercase font-black"
                  >
                    {event.category === 'Technical' ? '大航海開発' : event.category === 'Special Event' ? '特別競技' : '海賊競技'}
                  </span>
                  <span
                    style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: '1.1rem' }}
                    className="text-[#FFC928] font-bold"
                  >
                    // {event.category.toUpperCase()}
                  </span>
                </div>

                <span
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}
                  className="px-3.5 py-1 rounded-sm bg-white text-black font-extrabold border-2 border-black uppercase"
                >
                  // {isCash ? `PRIZE: ${bountyText}` : 'AWARD: CERTIFICATE ONLY'}
                </span>
              </div>
            </div>

            {/* 2. Subtitle & Large Title Header */}
            <div>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                }}
                className="text-[#9A1410] font-bold uppercase mb-1"
              >
                {event.category.toUpperCase()} // GRAND LINE EXPEDITION
              </p>

              <h1
                style={{
                  fontFamily: "'Anton', sans-serif",
                  fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                  letterSpacing: '0.04em',
                  lineHeight: 1.05,
                }}
                className="text-black uppercase font-black"
              >
                {event.title}
              </h1>

              <p
                style={{
                  fontFamily: "'Noto Sans JP', sans-serif",
                  fontSize: '1rem',
                  color: '#9A1410',
                  fontWeight: 700,
                }}
                className="mt-1"
              >
                {event.tagline}
              </p>
            </div>

            {/* 3. DATA FILE BIO // STATS BOX */}
            <div className="rounded-sm bg-white border-2 border-black p-4 sm:p-6 shadow-[5px_5px_0px_0px_#000] space-y-5">
              {/* Header Tab */}
              <div className="flex items-center gap-2 pb-3 border-b-2 border-black/15">
                <span
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}
                  className="px-2.5 py-0.5 bg-[#FFC928] text-black font-extrabold border border-black uppercase shadow-[1px_1px_0px_0px_#000]"
                >
                  DATA FILE
                </span>
                <span
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}
                  className="text-black/60 font-bold uppercase tracking-wider"
                >
                  BIO // STATS & SPECS
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-black/85 leading-relaxed font-sans font-medium">
                {event.fullDescription}
              </p>

              {/* Specs Grid */}
              <div
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-black/15"
              >
                <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-black/15">
                  <span className="font-bold text-black/60 uppercase">TIME:</span>
                  <span className="font-bold text-black">{event.schedule.timeSlot}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-black/15">
                  <span className="font-bold text-black/60 uppercase">VENUE:</span>
                  <span className="font-bold text-black text-right">{event.schedule.venue}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-black/15">
                  <span className="font-bold text-black/60 uppercase">CREW SIZE:</span>
                  <span className="font-bold text-black">{event.teamSize.description}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-sm bg-[#FFC928]/20 border border-black/30">
                  <span className="font-extrabold text-[#9A1410] uppercase">PRIZE:</span>
                  <span className="font-black text-black">{event.prizes.Prize}</span>
                </div>
              </div>

              {/* 4. Trial Rounds Breakdown */}
              {event.rounds && event.rounds.length > 0 && (
                <div className="pt-4 border-t-2 border-black/15">
                  <h4
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
                    className="font-extrabold text-[#9A1410] uppercase tracking-wider mb-3 flex items-center gap-1.5"
                  >
                    <span>⚔️</span>
                    <span>TRIAL ROUNDS & TIMELINES</span>
                  </h4>

                  <div className="space-y-3">
                    {event.rounds.map((rnd) => (
                      <div
                        key={rnd.roundNumber}
                        className="p-3.5 rounded-sm bg-amber-50/70 border border-black/30 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}
                            className="px-2 py-0.5 rounded-xs bg-[#E2231A] text-white font-bold"
                          >
                            ROUND {rnd.roundNumber}: {rnd.title}
                          </span>
                          {rnd.duration && (
                            <span
                              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}
                              className="font-bold text-black/70"
                            >
                              ⏱ {rnd.duration}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-black/80 font-sans mt-1.5 leading-relaxed font-medium">
                          {rnd.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Rules & Protocols */}
              <div className="pt-4 border-t-2 border-black/15">
                <h4
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
                  className="font-extrabold text-[#9A1410] uppercase tracking-wider mb-3 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E2231A]" />
                  <span>VOYAGE RULES & PROTOCOLS</span>
                </h4>

                <ul className="space-y-2 text-xs text-black/90 font-medium">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#E2231A] mt-1 flex-shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 6. Judging Criteria */}
              {event.judgingCriteria && event.judgingCriteria.length > 0 && (
                <div className="pt-4 border-t-2 border-black/15">
                  <h4
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
                    className="font-extrabold text-[#9A1410] uppercase tracking-wider mb-2 flex items-center gap-1.5"
                  >
                    <span>⚖️</span>
                    <span>JUDGING CRITERIA</span>
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {event.judgingCriteria.map((item, idx) => (
                      <span
                        key={idx}
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}
                        className="px-2.5 py-1 rounded-sm bg-black/5 text-black border border-black/25 font-bold"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Coordinators Directory */}
              {event.coordinators && event.coordinators.length > 0 && (
                <div className="pt-4 border-t-2 border-black/15">
                  <h4
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
                    className="font-extrabold text-[#9A1410] uppercase tracking-wider mb-3 flex items-center gap-1.5"
                  >
                    <span>📞</span>
                    <span>ISLAND FLEET COORDINATORS</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.coordinators.map((c, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-sm bg-[#FDFBF7] border border-black/20 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-black/60">
                            <span className="font-bold text-[#9A1410] uppercase">{c.role}</span>
                            <span>{c.department}</span>
                          </div>
                          <p className="font-bold text-sm text-black mt-0.5">{c.name}</p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center gap-2">
                          <a
                            href={`tel:${c.phone.replace(/\s+/g, '')}`}
                            className="flex-1 py-1 px-2.5 rounded-sm bg-black text-[#FFC928] hover:bg-[#E2231A] hover:text-white transition-colors text-[11px] font-mono font-bold flex items-center justify-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{c.phone}</span>
                          </a>

                          {c.whatsapp && (
                            <a
                              href={`https://wa.me/${c.whatsapp}?text=Hi%20${encodeURIComponent(c.name)},%20I%20have%20a%20query%20about%20${encodeURIComponent(event.title)}%20at%20EvoXis26.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 px-2 rounded-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-[11px] font-mono font-bold flex items-center justify-center"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 8. Bottom Quote & Primary Register Action */}
            <div className="rounded-sm bg-[#E2231A] border-4 border-black p-5 text-center text-white shadow-[6px_6px_0px_0px_#000]">
              <span
                style={{
                  fontFamily: "'Anton', sans-serif",
                  fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                  letterSpacing: '0.04em',
                }}
                className="block uppercase font-black mb-1"
              >
                "I'M GONNA BE KING OF THE PIRATES!"
              </span>
              <p
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}
                className="text-[#FFC928] font-bold uppercase mb-4 tracking-widest"
              >
                — {event.title.toUpperCase()} // STRAW HAT FLEET
              </p>

              <button
                type="button"
                onClick={handleRegisterClick}
                className="w-full py-3.5 px-6 rounded-sm bg-[#FFC928] text-black border-2 border-black font-black uppercase text-base tracking-widest hover:bg-white active:scale-[0.98] transition-all shadow-[4px_4px_0px_0px_#000] cursor-pointer flex items-center justify-center gap-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.25rem' }}
              >
                <Sparkles className="w-5 h-5 text-black" />
                <span>BOARD THIS ISLAND (REGISTER) →</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventModal;
