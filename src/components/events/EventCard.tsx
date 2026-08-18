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
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          accent: '#00F2FE',
          buttonGlow: 'hover:border-cyan-500/50 hover:shadow-glow-cyan',
        };
      case 'Non-Technical':
        return {
          badge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          accent: '#A855F7',
          buttonGlow: 'hover:border-purple-500/50 hover:shadow-glow-purple',
        };
      case 'Special':
        return {
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          accent: '#F59E0B',
          buttonGlow: 'hover:border-amber-500/50',
        };
      default:
        return {
          badge: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
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
      className="group relative rounded-2xl bg-gradient-to-b from-[#0F172A]/90 to-[#0A0E1A] border border-slate-800 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 shadow-xl overflow-hidden"
    >
      {/* Background Subtle Gradient Corner */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none"
        style={{ backgroundColor: style.accent }}
      />

      <div>
        {/* Card Header: Event ID + Category + Featured Tag */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {event.eventId}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${style.badge}`}>
              {event.category}
            </span>
          </div>

          {event.featuredTag && (
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
              ★ {event.featuredTag}
            </span>
          )}
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3.5 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110"
            style={{
              backgroundColor: `${style.accent}15`,
              borderColor: `${style.accent}40`,
              color: style.accent,
            }}
          >
            <IconComp className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-display font-bold text-xl text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
              {event.title}
            </h3>
            <p className="text-xs text-cyan-400/90 font-mono font-medium line-clamp-1">
              {event.tagline}
            </p>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {event.shortDescription}
        </p>

        {/* Info Grid (Team, Venue, Time) */}
        <div className="space-y-1.5 py-3 px-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-medium text-slate-200">{event.teamSize.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-slate-400">{event.schedule.timeSlot}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400 line-clamp-1">{event.schedule.venue}</span>
          </div>
        </div>
      </div>

      {/* Footer: Prize & Action Buttons */}
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <span className="text-xs text-slate-400 font-mono">1st Prize</span>
          <span className="text-xs font-bold text-amber-400 font-mono truncate max-w-[170px]">
            {event.prizes.first.split('+')[0]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelectEvent(event)}
            className="py-2.5 px-3 rounded-xl text-xs font-bold font-display text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-1"
          >
            <span>View Rules</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            onClick={() => onRegisterEvent(event)}
            className="py-2.5 px-3 rounded-xl text-xs font-bold font-display text-black bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-glow-sm transition-all flex items-center justify-center gap-1"
          >
            <span>Register</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
