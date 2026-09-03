import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import BgImg from '../../assets/HeroSection_Background.png';
import BgImg2 from '../../assets/HeroSection_Background1.png';
import { sound } from '../../utils/audio';

/* ─── colour tokens ──────────────────────────────────────────────────────── */
const C = {
  bone:      '#F8F8F8',
  cream:     '#FFF3D6',
  ink:       '#0B0B0B',
  red:       '#E2231A',
  deepRed:   '#9A1410',
  blue:      '#0077C8',
  deepBlue:  '#003B73',
  gold:      '#FFC928',
  deepGold:  '#B56A12',
  rope:      '#C68B3F',
  seafoam:   '#7ED9D6',
};

/* ─── background slides ─────────────────────────────────────────────────── */
const BG_SLIDES = [
  {
    id: 1,
    img: BgImg,
    line1: 'EVOXIS 2026 // SRIRAM ENGINEERING COLLEGE //',
    line2: 'CHAPTER 1 OF 2',
    issue: 'EVOXIS 2026 // SRIRAM ENGINEERING COLLEGE // CHAPTER 1 OF 2',
    chapter: 'CHAPTER 1',
    pageIndex: '01 / 02',
    tag: 'INNOVATION SAGA',
    bounty: '1000+ PARTICIPANTS',
    crew: 'SRIRAM ENGINEERING COLLEGE',
    sea: 'TECH & INNOVATION',
    quote:
      'Where ideas become innovation, talent meets opportunity, and the next generation begins to build the future.',
  },
  {
    id: 2,
    img: BgImg2,
    line1: 'EVOXIS 2026 // FUTURE AWAITS //',
    line2: 'CHAPTER 2 OF 2',
    issue: 'EVOXIS 2026 // FUTURE AWAITS // CHAPTER 2 OF 2',
    chapter: 'CHAPTER 2',
    pageIndex: '02 / 02',
    tag: 'TECH ERA',
    bounty: '15+ EVENTS',
    crew: 'STUDENT INNOVATORS',
    sea: 'ALL DEPARTMENTS',
    quote:
      'Connect. Compete. Create. EVOXIS brings together curious minds to challenge ideas and create what comes next.',
  },
];

/* ─── framer motion background slide variants ───────────────────────────── */
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    scale: 1.08,
    opacity: 0.2,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    scale: 1.04,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      x: { type: 'spring', stiffness: 180, damping: 26, mass: 1 },
      opacity: { duration: 0.7 },
      scale: { duration: 1.2, ease: 'easeOut' },
      filter: { duration: 0.6 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    scale: 1.0,
    opacity: 0,
    filter: 'blur(6px)',
    transition: {
      x: { type: 'spring', stiffness: 180, damping: 26, mass: 1 },
      opacity: { duration: 0.7 },
      filter: { duration: 0.5 },
    },
  }),
};

/* ─── Decorative Golden Ornaments ───────────────────────────────────────── */
const OrnateFlourishLeft: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    className={`${className} text-[#FFC928] drop-shadow-[0_0_8px_rgba(255,201,40,0.7)]`}
    viewBox="0 0 48 48"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M44 24 C32 22 24 16 18 6 C20 16 16 22 4 24 C16 26 20 32 18 42 C24 32 32 26 44 24 Z"
      opacity="0.95"
    />
    <circle cx="24" cy="24" r="2.5" fill="#FFF3D6" />
    <path
      d="M38 18 C30 18 26 12 24 6 C26 14 22 18 14 18 C22 20 24 24 24 30 C26 24 30 20 38 18 Z"
      opacity="0.45"
    />
  </svg>
);

const OrnateFlourishRight: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    className={`${className} text-[#FFC928] drop-shadow-[0_0_8px_rgba(255,201,40,0.7)] transform scale-x-[-1]`}
    viewBox="0 0 48 48"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M44 24 C32 22 24 16 18 6 C20 16 16 22 4 24 C16 26 20 32 18 42 C24 32 32 26 44 24 Z"
      opacity="0.95"
    />
    <circle cx="24" cy="24" r="2.5" fill="#FFF3D6" />
    <path
      d="M38 18 C30 18 26 12 24 6 C26 14 22 18 14 18 C22 20 24 24 24 30 C26 24 30 20 38 18 Z"
      opacity="0.45"
    />
  </svg>
);

export interface HeroSectionProps {
  onOpenRegister?: () => void;
  eventDate?: string;
}

/* ─── component ──────────────────────────────────────────────────────────── */
export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenRegister = () => {},
  eventDate,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  /* countdown calculation */
  const targetDate = eventDate
    ? new Date(eventDate).getTime()
    : new Date('2026-09-26T09:00:00+05:30').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });

  useEffect(() => {
    const tick = () => {
      const diff = targetDate - Date.now();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          mins: Math.floor((diff / 60000) % 60),
          secs: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          mins: 0,
          secs: 0,
        });
      }
    };

    tick();

    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, [targetDate]);

  /* slide switcher */
  const changeSlide = (newIndex: number, newDirection: number) => {
    sound.playTick?.();
    setDirection(newDirection);
    setSlideIndex(newIndex);
  };

  const nextSlide = () => {
    const nextIdx = (slideIndex + 1) % BG_SLIDES.length;
    changeSlide(nextIdx, 1);
  };

  const prevSlide = () => {
    const prevIdx =
      (slideIndex - 1 + BG_SLIDES.length) % BG_SLIDES.length;

    changeSlide(prevIdx, -1);
  };

  /* Auto-slide window interval */
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setDirection(1);
      setSlideIndex((prev) => (prev + 1) % BG_SLIDES.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [isAutoPlay]);

  /* parallax */
  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!containerRef.current) return;

    const r = containerRef.current.getBoundingClientRect();

    setMousePos({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  };

  const activeSlide = BG_SLIDES[slideIndex];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
      className="relative w-full max-w-full min-h-[100dvh] overflow-hidden text-white select-none flex flex-col justify-between"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── FRAMER MOTION SLIDING BACKGROUND WINDOW ──────────────────── */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <AnimatePresence
          initial={false}
          custom={direction}
          mode="popLayout"
        >
          <motion.div
            key={activeSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${activeSlide.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              backgroundRepeat: 'no-repeat',
              transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 8}px, 0)`,
              transition: 'transform 0.15s ease-out',
            }}
          />
        </AnimatePresence>
      </div>

      {/* dark aesthetic gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,11,11,0.85) 0%, rgba(11,11,11,0.48) 35%, rgba(11,11,11,0.68) 75%, rgba(4,8,20,0.96) 100%)',
          zIndex: 1,
        }}
      />

      {/* subtle scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
          zIndex: 2,
        }}
      />

      {/* ── LEFT VERTICAL LABEL (Desktop only) ─────────────────────────── */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3"
        style={{ zIndex: 20, padding: '0 10px' }}
      >
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.57rem',
            letterSpacing: '0.18em',
            color: C.bone,
            textTransform: 'uppercase',
            background: C.red,
            padding: '6px 5px',
          }}
        >
          EVOXIS 2026
        </div>

        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.55rem',
            letterSpacing: '0.12em',
            color: 'rgba(248,248,248,0.38)',
            textTransform: 'uppercase',
          }}
        >
          EVOXIS // SYMPOSIUM // 2026
        </div>

        <div
          className="w-px"
          style={{
            height: '55px',
            background: `linear-gradient(to bottom, transparent, ${C.gold}, transparent)`,
          }}
        />

        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.57rem',
            letterSpacing: '0.18em',
            color: C.bone,
            textTransform: 'uppercase',
            background: C.deepBlue,
            padding: '6px 5px',
          }}
        >
          {activeSlide.chapter}
        </div>
      </div>

      {/* ── TOP-RIGHT DATA CARD (Desktop only) ───────────────────────── */}
      <div
        className="absolute hidden 2xl:block"
        style={{
          top: '90px',
          right: '32px',
          zIndex: 40,
          width: '235px',
          background: 'rgba(248,248,248,0.96)',
          border: `2px solid ${C.gold}`,
          padding: '12px 14px',
          color: C.ink,
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.55rem',
              letterSpacing: '0.15em',
              color: C.deepRed,
              textTransform: 'uppercase',
            }}
          >
            EVENT FILE
          </span>

          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.55rem',
              letterSpacing: '0.1em',
              color: C.rope,
              textTransform: 'uppercase',
            }}
          >
            EVOXIS.00{slideIndex + 1}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: '2.4rem',
              lineHeight: 1,
              color: C.red,
            }}
          >
            EVOXIS
          </span>
        </div>

        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.55rem',
            letterSpacing: '0.18em',
            color: C.rope,
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          TECHNOLOGY SYMPOSIUM
        </div>

        <div
          style={{
            height: '1px',
            background: 'rgba(11,11,11,0.12)',
            marginBottom: '8px',
          }}
        />

        {[
          { label: 'EDITION', value: '2026' },
          { label: 'COLLEGE', value: 'SRIRAM ENG' },
          { label: 'DOMAIN', value: activeSlide.sea },
          { label: 'STATUS', value: '● OPEN', highlight: true },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className="flex items-center justify-between mb-1"
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.55rem',
                letterSpacing: '0.12em',
                color: 'rgba(11,11,11,0.45)',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>

            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.58rem',
                letterSpacing: '0.06em',
                color: highlight ? C.red : C.ink,
                fontWeight: 600,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* ── TOP SECTION: COLLEGE HEADER & ORNATE DIVIDER ─────────────── */}
      <div
        className="relative w-full max-w-4xl mx-auto pt-20 sm:pt-24 px-4 sm:px-6 flex flex-col items-center text-center"
        style={{ zIndex: 15 }}
      >
        {/* College Seal & Information Row */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
          {/* Sriram College Circular Crest */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 aspect-square overflow-hidden flex-shrink-0 relative flex items-center justify-start">
            <img
              src="https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_760,w_760,x_1020,y_949/f_auto/q_auto/ClgLogo.png"
              alt="Sriram Engineering College Crest"
              className="h-full w-auto max-w-none object-left object-contain"
            />
          </div>

          {/* College Name & Affiliation */}
          <div className="text-left flex flex-col justify-center">
            <h2
              style={{
                fontFamily: "'Anton', sans-serif",
                letterSpacing: '0.04em',
                lineHeight: 1.05,
              }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-normal uppercase tracking-wide drop-shadow-md"
            >
              SRIRAM ENGINEERING COLLEGE
            </h2>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
              className="text-[10px] sm:text-xs md:text-sm text-white/95 font-medium tracking-wide mt-0.5"
            >
              Approved by AICTE, New Delhi Affiliated to Anna University, Chennai
            </p>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
              }}
              className="text-[9px] sm:text-[11px] md:text-xs text-white/80 font-normal tracking-wide"
            >
              (A Unit of Sriram Educational Trust)
            </p>
          </div>
        </div>

        {/* Ornate Golden Diamond Divider */}
        <div className="w-full max-w-md sm:max-w-xl mx-auto flex items-center justify-center gap-2 sm:gap-3 my-1.5 sm:my-2">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#FFC928]/60 to-[#FFC928]" />
          <div className="flex items-center gap-1.5 text-[#FFC928] text-[9px] sm:text-[11px]">
            <span>◆</span>
            <span className="text-[13px] sm:text-[15px] text-[#FFC928] drop-shadow-[0_0_8px_rgba(255,201,40,0.9)]">
              ◆
            </span>
            <span>◆</span>
          </div>
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-[#FFC928]/60 to-[#FFC928]" />
        </div>

        {/* ── CENTERPIECE: SYMPOSIUM LOGO ORNATE BADGE ─────────────── */}
        <div className="relative flex items-center justify-center gap-2 sm:gap-4 my-2 sm:my-3">
          {/* Left Filigree Flourish */}
          <OrnateFlourishLeft className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14" />

          {/* Ornate Circular Emblem */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <img
              src="https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_1079,w_1079/f_auto/q_auto/SympoLogo.png" 
              alt="EVOXIS '26 Symposium Emblem"
              className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain filter drop-shadow-[0_0_25px_rgba(255,201,40,0.4)]"
            />
          </motion.div>

          {/* Right Filigree Flourish */}
          <OrnateFlourishRight className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14" />
        </div>
      </div>

      {/* ── MAIN CONTENT (Bottom half) ────────────────────────────────── */}
      <main
        className="relative flex flex-col justify-end px-5 sm:px-10 lg:px-20 xl:px-28 pb-14 sm:pb-16 pt-1"
        style={{ zIndex: 10 }}
      >
        {/* Issue / Chapter Badge */}
        <div
          className="mb-1.5 sm:mb-2.5 transition-all duration-300"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.18em',
            color: C.gold,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          <div>{activeSlide.line1}</div>
          <div>{activeSlide.line2}</div>
        </div>

        {/* EVOXIS THE SYMPOSIUM Massive Headline */}
        <h1
          className="max-w-[750px]"
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(3.8rem, 10vw, 8.5rem)',
            letterSpacing: '-0.01em',
            lineHeight: 0.88,
            textTransform: 'uppercase',
            marginBottom: '0.4rem',
          }}
        >
          <span style={{ color: C.bone, display: 'block' }}>
            EVOXIS
          </span>

          <span style={{ color: C.bone, display: 'block' }}>
            THE
          </span>

          <span
            style={{
              display: 'block',
              color: 'transparent',
              WebkitTextStroke: `2.5px ${C.red}`,
              textShadow: '0 0 20px rgba(226,35,26,0.4)',
            }}
          >
            SYMPOSIUM
          </span>
        </h1>

        {/* Symposium Tagline */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            letterSpacing: '0.08em',
            color: C.gold,
            fontWeight: 600,
          }}
        >
          <span>
            INNOVATE // COMPETE // CREATE
          </span>

          <span style={{ color: 'rgba(255,255,255,0.28)' }}>
            //
          </span>

          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.15em',
            }}
          >
            2026
          </span>
        </div>

        {/* Action Row: REGISTER NOW + Live Countdown Timer */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mb-3 sm:mb-4">
          <button
            type="button"
            onClick={() => {
              sound.playCannon?.();
              onOpenRegister();
            }}
            className="group flex items-center gap-2.5 transition-all duration-200 cursor-pointer active:scale-95"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.1rem',
              letterSpacing: '0.12em',
              color: C.bone,
              background: C.red,
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '6px',
              padding: '8px 22px',
              boxShadow: '0 4px 20px rgba(226,35,26,0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#b81c15';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.red;
            }}
          >
            REGISTER NOW

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: C.bone,
                color: C.ink,
                fontSize: '0.8rem',
                fontWeight: 900,
              }}
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </button>

          {/* Countdown live badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-black/75 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-mono shadow-lg">
            <span className="text-[#FFC928] font-semibold">
              ⏳ EVENT STARTS:
            </span>

            <span className="text-white font-bold tracking-wide">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m{' '}
              {timeLeft.secs}s
            </span>
          </div>
        </div>

        {/* MANIFESTO Card */}
        <div className="flex items-start gap-2.5 sm:gap-3 mb-2 max-w-[480px]">
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              color: C.ink,
              background: C.gold,
              padding: '2px 8px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              alignSelf: 'flex-start',
              marginTop: '2px',
              fontWeight: 'bold',
            }}
          >
            MANIFESTO
          </span>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.72rem',
              color: 'rgba(248,248,248,0.65)',
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            EVOXIS is a platform for ideas, innovation, technology,
            and competition — bringing together students to learn,
            connect, create, and shape the future.
          </p>
        </div>
      </main>

      {/* ── BOTTOM BAR: SLIDE PAGINATION & CONTROLS ───────────────────── */}
      <div
        className="relative flex items-center justify-between px-5 sm:px-10 lg:px-20 xl:px-28 py-3 bg-gradient-to-t from-black/80 to-transparent"
        style={{ zIndex: 30 }}
      >
        {/* Page counter & Slide Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              title="Previous Background"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/75 hover:bg-[#FFC928] hover:text-black border border-white/20 transition-all text-xs cursor-pointer active:scale-95"
            >
              ←
            </button>

            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                color: 'rgba(248,248,248,0.75)',
              }}
            >
              {activeSlide.pageIndex}
            </span>

            <button
              onClick={nextSlide}
              title="Next Background"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/75 hover:bg-[#FFC928] hover:text-black border border-white/20 transition-all text-xs cursor-pointer active:scale-95"
            >
              →
            </button>
          </div>

          {/* Dynamic Progress indicator */}
          <div
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={nextSlide}
            title="Click to toggle background"
          >
            {BG_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                style={{
                  width:
                    slideIndex === idx ? '24px' : '10px',
                  height: '4px',
                  background:
                    slideIndex === idx
                      ? C.red
                      : 'rgba(255,255,255,0.25)',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── FLOATING PARTICLES ────────────────────────────────────────── */}
      {[
        { top: '18%', left: '12%', size: 6, color: C.gold, delay: 0 },
        { top: '62%', left: '8%', size: 4, color: C.seafoam, delay: 1.2 },
        { top: '30%', right: '12%', size: 5, color: C.gold, delay: 2.4 },
        { top: '75%', right: '18%', size: 3, color: C.cream, delay: 0.8 },
        { top: '48%', left: '22%', size: 4, color: C.rope, delay: 3.1 },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            opacity: 0.55,
            filter: 'blur(1px)',
            animation: `floatParticle ${4 + i * 0.6}s ease-in-out ${p.delay}s infinite`,
            zIndex: 5,
          }}
        />
      ))}

      {/* ── RIGHT VERTICAL LABEL (Desktop only) ────────────────────────── */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-2"
        style={{ zIndex: 20, padding: '0 10px' }}
      >
        <div
          style={{
            writingMode: 'vertical-rl',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.55rem',
            letterSpacing: '0.18em',
            color: 'rgba(248,248,248,0.28)',
            textTransform: 'uppercase',
          }}
        >
          {activeSlide.issue}
        </div>

        <div
          className="w-px"
          style={{
            height: '40px',
            background: `linear-gradient(to bottom, transparent, ${C.rope}, transparent)`,
          }}
        />

        <div
          style={{
            writingMode: 'vertical-rl',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.55rem',
            letterSpacing: '0.18em',
            color: 'rgba(248,248,248,0.28)',
            textTransform: 'uppercase',
          }}
        >
          EVOXIS // SRIRAM ENGINEERING COLLEGE
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
