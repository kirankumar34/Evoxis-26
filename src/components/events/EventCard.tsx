import React from 'react';
import { motion } from 'framer-motion';
import { EventItem } from '@/types';
import {
  FileText,
  TrendingUp,
  Zap,
  Layout,
  Cpu,
  ShieldAlert,
  Music,
  Gamepad2,
  Trophy,
  Video,
  Flame,
  Sparkles,
  Activity,
  Award,
  Crown,
  Gamepad,
  Users,
  Clock,
  MapPin,
  ArrowUpRight,
  Coins,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  TrendingUp,
  Zap,
  Layout,
  Cpu,
  ShieldAlert,
  Music,
  Gamepad2,
  Trophy,
  Video,
  Flame,
  Sparkles,
  Activity,
  Award,
  Crown,
  Gamepad,
};

interface EventCardProps {
  event: EventItem;
  onSelectEvent: (event: EventItem) => void;
  onRegisterEvent: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelectEvent,
  onRegisterEvent,
}) => {
  const IconComp = ICON_MAP[event.iconName] || Trophy;

  const getCategoryStyles = () => {
    switch (event.category) {
      case 'Technical':
        return {
          badge: 'bg-[#00F2FE]/10 text-[#38BDF8] border-[#00F2FE]/40',
          categoryDisplay: 'Grand Voyage Challenge',
          accent: '#00F2FE',
          buttonGlow: 'hover:border-[#00F2FE]/50 hover:shadow-glow-cyan',
        };
      case 'Non-Technical':
        return {
          badge: 'bg-[#E11D48]/15 text-[#FDA4AF] border-[#E11D48]/40',
          categoryDisplay: 'Crew Challenge',
          accent: '#E11D48',
          buttonGlow: 'hover:border-[#E11D48]/50 hover:shadow-glow-crimson',
        };
      case 'Special':
        return {
          badge: 'bg-[#E6CA65]/15 text-[#FCE79C] border-[#E6CA65]/40',
          categoryDisplay: 'Grand Arena Event',
          accent: '#E6CA65',
          buttonGlow: 'hover:border-[#E6CA65]/50 hover:shadow-glow-gold',
        };
      default:
        return {
          badge: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
          categoryDisplay: event.category,
          accent: '#38BDF8',
          buttonGlow: '',
        };
    }
  };

  const style = getCategoryStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-2xl bg-gradient-to-b from-[#0F1A36]/95 via-[#0A1128]/95 to-[#070D1E] border border-[#E6CA65]/25 p-6 flex flex-col justify-between hover:border-[#E6CA65]/60 transition-all duration-300 shadow-xl overflow-hidden wanted-card-border"
    >
      {/* Background Subtle Gradient Corner & Nautical Map Mesh */}
      <div
        className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none"
        style={{ backgroundColor: style.accent }}
      />
      <div className="absolute inset-0 bg-voyage-chart opacity-15 pointer-events-none" />

      <div className="relative z-10">
        {/* Card Header: Event ID + Category Display + Featured Tag */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-black bg-[#E6CA65]/20 text-[#FCE79C] border border-[#E6CA65]/45 shadow-sm">
              {event.eventId}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${style.badge}`}>
              {style.categoryDisplay}
            </span>
          </div>

          {event.featuredTag && (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E11D48]/20 text-[#FDA4AF] border border-[#E11D48]/40 animate-pulse">
              ⚔️ {event.featuredTag}
            </span>
          )}
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3.5 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-md transition-transform group-hover:scale-110"
            style={{
              backgroundColor: `${style.accent}18`,
              borderColor: `${style.accent}50`,
              color: style.accent,
            }}
          >
            <IconComp className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-voyage font-bold text-xl text-white group-hover:text-[#FCE79C] transition-colors line-clamp-1">
              {event.title}
            </h3>
            <p className="text-xs text-[#E6CA65]/90 font-mono font-medium line-clamp-1">
              {event.tagline}
            </p>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed mb-4 font-sans">
          {event.shortDescription}
        </p>

        {/* Info Grid (Team, Venue, Time) */}
        <div className="space-y-1.5 py-3 px-3.5 rounded-xl bg-[#040814]/70 border border-[#E6CA65]/20 text-xs text-slate-300 mb-5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
            <span className="font-medium text-slate-200">{event.teamSize.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#E6CA65] shrink-0" />
            <span className="text-slate-300">{event.schedule.timeSlot}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
            <span className="text-slate-300 line-clamp-1">{event.schedule.venue}</span>
          </div>
        </div>
      </div>

      {/* Footer: Bounty Prize & Action Buttons */}
      <div className="relative z-10">
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#E6CA65]/20">
          <span className="text-xs text-[#E6CA65]/90 font-mono font-bold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-[#E6CA65]" />
            Bounty 1st Prize
          </span>
          <span className="text-xs font-bold text-[#FCE79C] font-mono truncate max-w-[170px]">
            {event.prizes.first.split('+')[0]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectEvent(event)}
            className="py-2.5 px-3 rounded-xl text-xs font-bold font-voyage text-slate-200 bg-[#0E1736] hover:bg-[#132247] border border-[#E6CA65]/35 hover:border-[#E6CA65] transition-all flex items-center justify-center gap-1 shadow-sm"
          >
            <span>Challenge Rules</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#E6CA65]" />
          </button>

          <button
            onClick={() => onRegisterEvent(event)}
            className="py-2.5 px-3 rounded-xl text-xs font-bold font-voyage text-[#040814] bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#00F2FE] hover:from-[#FFF5C0] hover:to-[#38BDF8] shadow-glow-gold/50 transition-all flex items-center justify-center gap-1 border border-[#FFF5C0]/60"
          >
            <span>Register</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
