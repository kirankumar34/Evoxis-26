import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SCHEDULE } from '@/data/schedule';
import { Calendar, Clock, MapPin } from 'lucide-react';

export const ScheduleSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Ceremony' | 'Technical' | 'Non-Technical' | 'Special'>('All');

  const filteredSchedule = SCHEDULE.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.category === activeFilter;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Ceremony':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Technical':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Non-Technical':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Special':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Break':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <section id="schedule" className="relative py-24 bg-[#080C15]/80 border-t border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>Master Symposium Timeline</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Schedule</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            Saturday, September 26, 2026 • Synchronized schedule across campus auditoriums, labs, and athletic turfs.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {(['All', 'Ceremony', 'Technical', 'Non-Technical', 'Special'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-display font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-glow-cyan'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter === 'All' ? 'Full Day Schedule' : `${filter} Track`}
            </button>
          ))}
        </div>

        {/* Timeline Flow */}
        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-32 space-y-8">
          {filteredSchedule.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="relative pl-6 sm:pl-8 group"
            >
              {/* Timeline Glowing Node */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#080C15] border-2 border-cyan-400 group-hover:bg-cyan-400 transition-colors shadow-glow-sm" />

              {/* Time Badge (Absolute left on Desktop) */}
              <div className="sm:absolute sm:-left-32 sm:top-0 sm:text-right sm:w-28 mb-2 sm:mb-0">
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  <Clock className="w-3 h-3" />
                  <span>{item.timeSlot.split(' - ')[0]}</span>
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md group-hover:border-cyan-500/30 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${getCategoryBadge(item.category)}`}>
                    {item.category}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>{item.venue}</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
