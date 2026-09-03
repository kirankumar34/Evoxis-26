import React from 'react';
import { motion } from 'framer-motion';
import { EventItem } from '@/types';
import PosterBg from '@/assets/Guideline_Section_Background.png';
import { sound } from '@/utils/audio';

interface EventCardProps {
  event: EventItem;
  onSelectEvent: (event: EventItem) => void;
  onRegisterEvent?: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelectEvent,
}) => {
  const handleClick = () => {
    sound.playTick?.();
    onSelectEvent(event);
  };

  // Format Bounty / Award amount cleanly
  const bountyMatch = event.prizes.Prize.match(/₹[\d,]+/);
  const isCash = Boolean(bountyMatch);
  const bountyText = isCash ? bountyMatch![0] : 'CERTIFICATE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      onClick={handleClick}
      className="group relative rounded-lg  p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300  overflow-hidden select-none "
      style={{
        backgroundImage: `url(${PosterBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 4 Corner Metal Screws / Rivets */}
      <div className="absolute top-2.5 left-2.5 w-4 h-4 rounded-full border border-black/60 flex items-center justify-center text-[10px] text-black/60 font-mono select-none">
        ⊕
      </div>
      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full border border-black/60 flex items-center justify-center text-[10px] text-black/60 font-mono select-none">
        ⊕
      </div>
      <div className="absolute bottom-2.5 left-2.5 w-4 h-4 rounded-full border border-black/60 flex items-center justify-center text-[10px] text-black/60 font-mono select-none">
        ⊕
      </div>
      <div className="absolute bottom-2.5 right-2.5 w-4 h-4 rounded-full border border-black/60 flex items-center justify-center text-[10px] text-black/60 font-mono select-none">
        ⊕
      </div>

      {/* ── WANTED HEADER ────────────────────────────────────────── */}
      <div className="text-center pt-2 pb-1 relative z-10">
        <h2
          style={{
            fontFamily: "'Anton', 'Impact', sans-serif",
            fontSize: 'clamp(2.4rem, 5vw, 3.2rem)',
            letterSpacing: '0.12em',
            lineHeight: 0.9,
            color: '#1a130e',
            textShadow: '1px 1px 0px rgba(0,0,0,0.3)',
          }}
          className="uppercase tracking-widest font-black"
        >
          WANTED
        </h2>
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.72rem',
            letterSpacing: '0.28em',
            color: '#4a3828',
            fontWeight: 700,
          }}
          className="uppercase mt-1.5 flex items-center justify-center gap-1.5"
        >
          <span>★</span>
          <span>DEAD • OR • ALIVE</span>
          <span>★</span>
        </p>
      </div>

      {/* ── CATEGORY BADGE ──────────────────────────────────────── */}
      <div className="flex justify-center my-2 relative z-10">
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.68rem',
            letterSpacing: '0.15em',
          }}
          className={`px-3 py-0.5 rounded-sm font-extrabold uppercase border border-black shadow-[2px_2px_0px_0px_#000] ${
            event.category === 'Technical'
              ? 'bg-[#FFC928] text-black'
              : event.category === 'Special Event'
              ? 'bg-[#F59E0B] text-black'
              : 'bg-[#E2231A] text-white'
          }`}
        >
          {event.category === 'Technical'
            ? 'TECHNICAL QUEST'
            : event.category === 'Special Event'
            ? 'SPECIAL EVENT'
            : 'NON-TECH ARENA'}
        </span>
      </div>

      {/* ── EVENT TITLE BOX WITH METAL RIVETS ───────────────────── */}
      <div className="relative my-2 p-3 bg-black/5 border-2 border-black/80 rounded-sm text-center z-10 shadow-inner group-hover:bg-[#E2231A]/10 transition-colors">
        <span className="absolute top-1 left-1 text-[8px] text-black/50">⊕</span>
        <span className="absolute top-1 right-1 text-[8px] text-black/50">⊕</span>
        <span className="absolute bottom-1 left-1 text-[8px] text-black/50">⊕</span>
        <span className="absolute bottom-1 right-1 text-[8px] text-black/50">⊕</span>

        <h3
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)',
            letterSpacing: '0.04em',
            lineHeight: 1.1,
            color: '#9A1410',
          }}
          className="uppercase font-bold tracking-tight line-clamp-2 px-2"
        >
          {event.title}
        </h3>
      </div>

      {/* ── SHORT DESCRIPTION ───────────────────────────────────── */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.78rem',
          color: '#3d3024',
          lineHeight: 1.45,
        }}
        className="text-center my-2 line-clamp-2 px-1 relative z-10 font-medium"
      >
        {event.shortDescription}
      </p>

      {/* ── BOUNTY PRIZE POOL ───────────────────────────────────── */}
      <div className="text-center my-3 relative z-10">
        <span
          style={{
            fontFamily: "'Anton', 'Impact', sans-serif",
            fontSize: isCash ? 'clamp(1.8rem, 4vw, 2.5rem)' : 'clamp(1.3rem, 3.2vw, 1.8rem)',
            letterSpacing: '0.06em',
            color: '#1a130e',
            lineHeight: 1,
          }}
          className="font-black tracking-tight block"
        >
          {bountyText}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            color: '#9A1410',
          }}
          className="block uppercase font-bold mt-0.5"
        >
          {isCash ? 'BOUNTY REWARD // PRIZE' : 'EXCELLENCE AWARD // CERTIFICATE ONLY'}
        </span>
      </div>

      {/* ── METADATA STRIP (TIME, VENUE, CREW) ──────────────────── */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.72rem',
          borderColor: 'rgba(0,0,0,0.25)',
        }}
        className="border-t pt-3 space-y-1.5 text-[#3d3024] relative z-10"
      >
        <div className="flex items-center justify-between">
          <span className="font-bold flex items-center gap-1 text-[#9A1410]">
            <span>🕒</span> TIME
          </span>
          <span className="font-semibold text-right text-black line-clamp-1">
            {event.schedule.timeSlot}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold flex items-center gap-1 text-[#9A1410]">
            <span>📍</span> VENUE
          </span>
          <span className="font-semibold text-right text-black line-clamp-1 max-w-[180px]">
            {event.schedule.venue}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold flex items-center gap-1 text-[#9A1410]">
            <span>👥</span> CREW
          </span>
          <span className="font-bold text-right text-[#1a130e]">
            {event.teamSize.description.replace('per Team', '')}
          </span>
        </div>
      </div>

      {/* Hover Clue Indicator */}
      <div className="mt-3 pt-2 text-center border-t border-black/15">
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '0.9rem',
            letterSpacing: '0.12em',
          }}
          className="text-[#9A1410] font-bold group-hover:text-black transition-colors flex items-center justify-center gap-1"
        >
          CLICK TO OPEN DOSSIER & RULES →
        </span>
      </div>
    </motion.div>
  );
};

export default EventCard;
