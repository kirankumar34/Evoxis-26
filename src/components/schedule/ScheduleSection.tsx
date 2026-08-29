import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  Clock,
  MapPin,
  Trophy,
  Compass,
  Anchor,
  Sparkles,
  Flame,
  Zap,
  Terminal,
  Code2,
  Award,
  Utensils,
  Palette,
  Swords,
  ShieldCheck,
  Star,
  Radio,
} from 'lucide-react';
import { sound } from '@/utils/audio';

/* ── One Piece & HeroSection Blue Palette ─────────────────────────────────── */
const C = {
  blue:      '#0077C8',
  deepBlue:  '#003B73',
  cyan:      '#38BDF8',
  sky:       '#0EA5E9',
  navy:      '#050C18',
  darkCard:  '#081426',
  ink:       '#0B0B0B',
  bone:      '#F8F8F8',
  cream:     '#FFF3D6',
  gold:      '#FFC928',
  deepGold:  '#B56A12',
  red:       '#E2231A',
  deepRed:   '#9A1410',
  seafoam:   '#7ED9D6',
};

/* ── 1-Day Comprehensive Voyage Schedule (September 26, 2026) ─────────────────── */
const TIMELINE_EVENTS = [
  {
    id: 1,
    time: '08:30 AM',
    endTime: '09:30 AM',
    phase: 'STAGE 01',
    title: 'Fleet Arrival & Registration Desk',
    jpTitle: '受付開始 // 乗船確認',
    venue: 'Main Entrance Harbor — Ground Floor',
    category: 'Logistics',
    IconComponent: Radio,
    tagIcon: Compass,
    iconColor: '#38BDF8',
    desc: 'Crew registration desk opens. Collect your official voyage lanyard, ID badge, and symposium docket.',
    bounty: 'ENTRY PASS',
    important: false,
  },
  {
    id: 2,
    time: '09:30 AM',
    endTime: '10:30 AM',
    phase: 'STAGE 02',
    title: 'EVOXIS 2K26 Grand Inauguration',
    jpTitle: '開会式 // 出航の号砲',
    venue: 'Main Central Auditorium',
    category: 'Ceremony',
    IconComponent: Anchor,
    tagIcon: Sparkles,
    iconColor: '#FFC928',
    desc: 'Traditional lamp lighting, Welcome Address, Chief Guest Keynote, and official unveiling of the Grand Line Challenges.',
    bounty: 'KEYNOTE',
    important: true,
  },
  {
    id: 3,
    time: '10:30 AM',
    endTime: '01:00 PM',
    phase: 'STAGE 03',
    title: 'Morning Trials: Code Buster & Paper Summit',
    jpTitle: '前哨戦 // 電脳決戦',
    venue: 'Ada Lovelace Lab 3 & Seminar Hall A',
    category: 'Technical',
    IconComponent: Terminal,
    tagIcon: Code2,
    iconColor: '#00F2FE',
    desc: 'Speed algorithmic battles in Lab 3 alongside state-of-the-art research paper presentations before academic judges.',
    bounty: '₹35,000 POOL',
    important: false,
  },
  {
    id: 4,
    time: '01:00 PM',
    endTime: '02:00 PM',
    phase: 'STAGE 04',
    title: 'Pirate Feast & Networking Lunch',
    jpTitle: '昼食 // 宴の時',
    venue: "Sanji's Mess Hall & Campus Food Court",
    category: 'Feast & Break',
    IconComponent: Utensils,
    tagIcon: Flame,
    iconColor: '#F97316',
    desc: 'Grand lunch feast for all registered fleet crews. Connect with peers, mentors, and industry delegates.',
    bounty: 'FEAST TIME',
    important: false,
  },
  {
    id: 5,
    time: '02:00 PM',
    endTime: '03:45 PM',
    phase: 'STAGE 05',
    title: 'Afternoon Quests: Web Shipyard & UI Forge',
    jpTitle: '設計決戦 // 造船所',
    venue: 'Turing Computing Hall & Design Studio 2',
    category: 'Build & Design',
    IconComponent: Palette,
    tagIcon: Zap,
    iconColor: '#EC4899',
    desc: 'Full-stack shipyard build duel and high-octane Figma UI/UX prototyping challenges under tight client briefs.',
    bounty: '₹27,000 POOL',
    important: false,
  },
  {
    id: 6,
    time: '03:45 PM',
    endTime: '05:00 PM',
    phase: 'STAGE 06',
    title: 'Grand Lore Quiz & Treasure Quest',
    jpTitle: '知略闘技 // 宝探し',
    venue: 'Central Amphitheatre & Campus Courtyard',
    category: 'Arena & Hunt',
    IconComponent: Swords,
    tagIcon: ShieldCheck,
    iconColor: '#A855F7',
    desc: 'Buzzer rapid-fire anime & tech trivia showdown plus the campus-wide Poneglyph cipher treasure hunt race.',
    bounty: '₹25,000 POOL',
    important: false,
  },
  {
    id: 7,
    time: '05:00 PM',
    endTime: '06:30 PM',
    phase: 'STAGE 07',
    title: 'Grand Valedictory & Bounty Ceremony',
    jpTitle: '表彰式 // 覇者の栄冠',
    venue: 'Main Central Auditorium',
    category: 'Grand Finale',
    IconComponent: Trophy,
    tagIcon: Award,
    iconColor: '#E2231A',
    desc: 'The Grand Finale! Winners felicitation, cash prize bounty distribution, memento presentations, and closing remarks.',
    bounty: '₹1,00,000+ GRAND PRIZE',
    important: true,
  },
];

/* ── Individual Timeline Milestone Card with Scroll Effects ───────────────── */
interface TimelineItemProps {
  item: typeof TIMELINE_EVENTS[number];
  index: number;
  isLeft: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ item, isLeft }) => {
  const IconComp = item.IconComponent;
  const TagIcon = item.tagIcon;

  return (
    <div className={`relative flex items-center justify-between md:justify-normal w-full mb-6 sm:mb-10 group ${
      isLeft ? 'md:flex-row-reverse' : 'md:flex-row'
    }`}>
      
      {/* ── CARD CONTENT (Responsive padding & sizing on mobile) ──────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
        className={`w-full md:w-[calc(50%-36px)] z-20 pl-9 sm:pl-11 md:pl-0 ${
          isLeft ? 'md:text-right md:pr-4' : 'md:text-left md:pl-4'
        }`}
      >
        <div
          className="relative p-3.5 sm:p-5 transition-transform duration-200 border-2 border-black hover:-translate-y-1 rounded-sm shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #0A192F 0%, #061224 60%, #040A14 100%)',
            boxShadow: item.important
              ? `5px 5px 0px ${C.cyan}`
              : `4px 4px 0px ${C.blue}`,
            border: item.important
              ? `2px solid ${C.cyan}`
              : `2px solid rgba(0, 119, 200, 0.4)`,
          }}
        >
          {/* Top Tag & Time Row */}
          <div className={`flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap ${isLeft ? 'md:justify-end' : 'md:justify-start'}`}>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-black font-black uppercase text-[10px] sm:text-[11px] tracking-wider border border-black rounded-xs"
              style={{
                background: item.important ? C.cyan : C.gold,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {TagIcon && <TagIcon className="w-3 h-3 text-black" />}
              {item.phase}
            </span>
            <span
              className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
              {item.time} – {item.endTime}
            </span>
          </div>

          {/* Title */}
          <h3
            className="text-lg sm:text-2xl md:text-3xl text-white uppercase tracking-tight leading-tight mb-1"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            {item.title}
          </h3>

          {/* Japanese Subtitle */}
          <div
            className="text-xs sm:text-sm font-bold text-cyan-300 mb-2"
            style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
          >
            {item.jpTitle}
          </div>

          {/* Venue */}
          <div className={`flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 mb-2.5 font-semibold ${
            isLeft ? 'md:justify-end' : 'md:justify-start'
          }`}>
            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
            <span>{item.venue}</span>
          </div>

          {/* Description */}
          <p className="text-slate-300 text-[11px] sm:text-xs md:text-sm leading-relaxed mb-3 font-normal">
            {item.desc}
          </p>

          {/* Footer Badge */}
          <div className={`flex items-center gap-2 pt-2.5 border-t border-cyan-500/20 ${
            isLeft ? 'md:justify-end' : 'md:justify-start'
          }`}>
            <span
              className="inline-flex items-center gap-1 text-[9px] sm:text-xs font-bold uppercase px-2 py-0.5 text-cyan-200 bg-cyan-950/60 border border-cyan-500/30 rounded-xs"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              {item.bounty}
            </span>
            {item.important && (
              <span
                className="text-[9px] sm:text-xs font-black uppercase px-2 py-0.5 bg-[#E2231A] text-white border border-black animate-pulse rounded-xs"
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em' }}
              >
                MUST ATTEND
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── CENTER TIMELINE NODE & ICON ──────────────────────────────── */}
      <div className="absolute left-3.5 sm:left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="relative flex items-center justify-center cursor-pointer"
          onClick={() => sound.playTick?.()}
        >
          {/* Blinking outer glowing halo ring */}
          <span className="absolute w-8 h-8 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full bg-cyan-400/20 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
          <span className="absolute w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-full bg-blue-600/30 blur-sm pointer-events-none" />

          {/* Main Node Circle with Colorful Lucide Icon */}
          <div
            className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-full border-2 border-black flex items-center justify-center text-xs sm:text-sm md:text-base shadow-[0_0_15px_rgba(56,189,248,0.6)] transition-transform duration-200 hover:scale-110"
            style={{
              background: item.important
                ? `linear-gradient(135deg, ${C.cyan} 0%, ${C.blue} 100%)`
                : `linear-gradient(135deg, ${C.blue} 0%, ${C.deepBlue} 100%)`,
              borderColor: item.important ? C.gold : C.cyan,
            }}
          >
            {IconComp ? (
              <IconComp
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 drop-shadow transition-transform group-hover:scale-110"
                style={{ color: item.iconColor || '#FFF' }}
              />
            ) : (
              <Compass className="w-3.5 h-3.5 text-white" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Spacer for 2-column alternating layout on desktop */}
      <div className="hidden md:block md:w-[calc(50%-36px)]" />

    </div>
  );
};

/* ── Main ScheduleSection / EventTimeline Component with Scroll-Driven Progress Bar ── */
export const ScheduleSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  // Scroll Progress calculations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 70%'],
  });

  // Smooth Spring physics on progress bar with faster, responsive curve
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 28,
    restDelta: 0.001,
  });

  // Pulsing glow height percentage
  const lightPosition = useTransform(scaleY, [0, 1], ['0%', '100%']);

  return (
    <section
      id="schedule"
      ref={containerRef}
      className="relative py-14 sm:py-20 md:py-24 overflow-hidden text-white select-none"
      style={{
        background: 'linear-gradient(180deg, #050C18 0%, #061426 50%, #030812 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── AMBIENT BACKGROUND GLOWS ──────────────────────────────────── */}
      <div
        className="absolute top-1/4 left-10 w-72 sm:w-[450px] h-72 sm:h-[450px] pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 119, 200, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-10 w-72 sm:w-[450px] h-72 sm:h-[450px] pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">

        {/* ── SECTION HEADER BANNER (HEROSECTION THEME) ───────────────── */}
        <div className="text-center mb-10 sm:mb-16">
          {/* Issue badge */}
          <div
            className="inline-flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 px-3 py-1 text-white border border-cyan-400/40 uppercase tracking-widest font-bold text-[10px] sm:text-xs shadow-[0_0_15px_rgba(0,119,200,0.4)]"
            style={{
              background: C.deepBlue,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '15s' }} />
            <span>1-DAY VOYAGE SCHEDULE // SEP 26, 2026</span>
          </div>

          {/* Heading */}
          <h2
            className="text-3xl sm:text-5xl md:text-6xl text-white uppercase tracking-tight leading-none mb-1.5 sm:mb-2"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            GRAND LINE <span style={{ color: C.cyan }}>VOYAGE TIMELINE</span>
          </h2>

          {/* Japanese Subtitle */}
          <div
            className="text-base sm:text-xl md:text-2xl font-bold tracking-wide text-cyan-300 mb-2 sm:mb-3"
            style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
          >
            航海日程 // 単日決戦
          </div>

          <p className="max-w-xl mx-auto text-slate-300 text-xs sm:text-sm leading-relaxed px-2">
            One epic day of technical battles, design duels, coding trials, and the grand bounty finale.
            Scroll down to track the voyage progress.
          </p>

          {/* Decorative rule */}
          <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6">
            <div style={{ height: '1px', width: '60px', background: `linear-gradient(to right, transparent, ${C.cyan})` }} />
            <Anchor className="w-4 h-4 text-cyan-400" />
            <div style={{ height: '1px', width: '60px', background: `linear-gradient(to left, transparent, ${C.cyan})` }} />
          </div>
        </div>

        {/* ── PROGRESSIVE TIMELINE CONTAINER ─────────────────────────── */}
        <div className="relative pt-2 pb-8 sm:pb-12">

          {/* Background Central Track Rail */}
          <div className="absolute left-3.5 sm:left-4 md:left-1/2 -translate-x-1/2 top-2 bottom-8 sm:bottom-12 w-1 md:w-1.5 bg-slate-900 border border-cyan-900/50 rounded-full" />

          {/* Progressive Foreground Glow Line (Driven by Scroll) */}
          <motion.div
            className="absolute left-3.5 sm:left-4 md:left-1/2 -translate-x-1/2 top-2 bottom-8 sm:bottom-12 w-1 md:w-1.5 origin-top rounded-full z-10 shadow-[0_0_15px_#38BDF8]"
            style={{
              scaleY,
              background: 'linear-gradient(to bottom, #38BDF8 0%, #0077C8 50%, #FFC928 100%)',
            }}
          />

          {/* Blinking Head Light Beacon */}
          <motion.div
            className="absolute left-3.5 sm:left-4 md:left-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-cyan-300 shadow-[0_0_18px_#38BDF8] z-20 pointer-events-none -mt-1.5 sm:-mt-2 animate-ping"
            style={{
              top: lightPosition,
              animationDuration: '1.4s',
            }}
          />

          {/* Milestone Cards List */}
          <div className="space-y-3 sm:space-y-4 relative z-20">
            {TIMELINE_EVENTS.map((event, idx) => (
              <TimelineItem
                key={event.id}
                item={event}
                index={idx}
                isLeft={idx % 2 === 0}
              />
            ))}
          </div>

        </div>

        {/* ── FOOTER CALLOUT ─────────────────────────────────────────── */}
        <div className="text-center pt-4 sm:pt-8">
          <div
            className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2.5 sm:px-6 sm:py-3 border-2 border-black text-black font-bold uppercase tracking-wider text-xs sm:text-sm shadow-[3px_3px_0px_#38BDF8] sm:shadow-[4px_4px_0px_#38BDF8] rounded-sm"
            style={{
              background: C.gold,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.05rem',
            }}
          >
            <Trophy className="w-4 h-4 shrink-0 text-[#E2231A]" />
            <span>CLAIM YOUR BOUNTY AT THE GRAND VALEDICTION (05:00 PM)</span>
            <Sparkles className="w-4 h-4 shrink-0 text-[#003B73]" />
          </div>
        </div>

      </div>
    </section>
  );
};

export default ScheduleSection;
