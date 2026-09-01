
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
    issue: 'EVOXIS 2026 // FUTURE AWAITS // CHAPTER 2 OF 2',
    chapter: 'CHAPTER 2',
    pageIndex: '02 / 02',
    tag: 'TECH ERA',
    bounty: '25+ EVENTS',
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
    scale: 1.05,
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
    : new Date('2026-08-27T09:00').getTime();

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
      className="relative w-full max-w-full h-[100dvh] min-h-[640px] max-h-[1080px] overflow-hidden text-white select-none flex flex-col justify-between"
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
            'linear-gradient(105deg, rgba(11,11,11,0.85) 0%, rgba(11,11,11,0.56) 48%, rgba(11,11,11,0.32) 100%)',
          zIndex: 1,
        }}
      />

      {/* bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(4,8,20,0.98) 0%, rgba(4,8,20,0.5) 60%, transparent 100%)',
          zIndex: 2,
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

      {/* ── LEFT VERTICAL LABEL ───────────────────────────────────────── */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3"
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
            fontSize: '0.55rem',
            letterSpacing: '0.12em',
            color: 'rgba(248,248,248,0.38)',
            textTransform: 'uppercase',
          }}
        >
          {activeSlide.tag}
        </div>

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

      {/* ── TOP-RIGHT DATA CARD ───────────────────────────────────────── */}
      <div
        className="absolute hidden lg:block"
        style={{
          top: '72px',
          right: '32px',
          zIndex: 40,
          width: '245px',
          background: 'rgba(248,248,248,0.97)',
          border: `2px solid ${C.gold}`,
          padding: '14px 16px',
          color: C.ink,
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.58rem',
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
              fontSize: '0.58rem',
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
              fontSize: '2.8rem',
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
            fontSize: '0.58rem',
            letterSpacing: '0.18em',
            color: C.rope,
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          TECHNOLOGY SYMPOSIUM
        </div>

        <div
          style={{
            height: '1px',
            background: 'rgba(11,11,11,0.12)',
            marginBottom: '10px',
          }}
        />

        {[
          { label: 'EDITION', value: '2026' },
          { label: 'COLLEGE', value: 'SRIRAM ENGINEERING' },
          { label: 'DOMAIN', value: activeSlide.sea },
          { label: 'STATUS', value: '● OPEN', highlight: true },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className="flex items-center justify-between mb-1.5"
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.57rem',
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
                fontSize: '0.6rem',
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

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <main
        className="relative flex flex-col justify-end pb-24 min-h-screen px-8 sm:px-12 lg:px-20 xl:px-28 pt-28"
        style={{ zIndex: 10 }}
      >
        {/* ISSUE badge */}
        <div
          className="mb-4 mt-auto transition-all duration-300"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            color: C.gold,
            textTransform: 'uppercase',
          }}
        >
          {activeSlide.issue}
        </div>

        {/* EOXIS SYMPOSIUM */}
        <h1
          className="max-w-[720px]"
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(3.8rem, 10vw, 8.5rem)',
            letterSpacing: '-0.01em',
            lineHeight: 0.92,
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
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
              WebkitTextStroke: `3px ${C.red}`,
            }}
          >
            SYMPOSIUM
          </span>
        </h1>

        {/* Symposium subtitle */}
        <div
          className="flex items-center gap-3 mb-4"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.9rem',
            letterSpacing: '0.06em',
            color: C.gold,
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
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.15em',
            }}
          >
            2026
          </span>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mb-3 sm:mb-4">
          <button
            type="button"
            onClick={() => {
              sound.playCannon?.();
              onOpenRegister();
            }}
            className="group flex items-center gap-2.5 transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '0.95rem',
              letterSpacing: '0.12em',
              color: C.bone,
              background: C.red,
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              padding: '9px 20px',
              boxShadow: '0 4px 14px rgba(226,35,26,0.4)',
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
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: C.bone,
                color: C.ink,
                fontSize: '0.75rem',
                fontWeight: 900,
              }}
            >
              →
            </span>
          </button>

          {/* Countdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/70 border border-white/15 text-[11px] font-mono">
            <span className="text-[#FFC928]">
              ⏳ EVENT STARTS:
            </span>

            <span className="text-white font-bold">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m{' '}
              {timeLeft.secs}s
            </span>
          </div>
        </div>

        {/* MANIFESTO */}
        <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-4 max-w-[440px]">
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '0.62rem',
              letterSpacing: '0.15em',
              color: C.ink,
              background: C.gold,
              padding: '2px 7px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              alignSelf: 'flex-start',
              marginTop: '2px',
            }}
          >
            MANIFESTO
          </span>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.7rem',
              color: 'rgba(248,248,248,0.5)',
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

      {/* ── BOTTOM BAR ────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 sm:px-12 lg:px-20 xl:px-28 py-3"
        style={{ zIndex: 30 }}
      >
        {/* Page counter & Slide Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevSlide}
              title="Previous Background"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/70 hover:bg-amber-400 hover:text-black border border-white/20 transition-all text-xs cursor-pointer"
            >
              ←
            </button>

            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                letterSpacing: '0.15em',
                color: 'rgba(248,248,248,0.7)',
              }}
            >
              {activeSlide.pageIndex}
            </span>

            <button
              onClick={nextSlide}
              title="Next Background"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/70 hover:bg-amber-400 hover:text-black border border-white/20 transition-all text-xs cursor-pointer"
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
                      : 'rgba(255,255,255,0.2)',
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

      {/* ── RIGHT VERTICAL LABEL ──────────────────────────────────────── */}
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
