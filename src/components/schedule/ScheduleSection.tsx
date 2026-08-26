import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SCHEDULE } from '@/data/schedule';
import { Clock, MapPin, Compass } from 'lucide-react';

export const ScheduleSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Ceremony' | 'Technical' | 'Non-Technical' | 'Special'>('All');

  const filteredSchedule = SCHEDULE.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.category === activeFilter;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Ceremony':
        return 'bg-[#E6CA65]/15 text-[#FCE79C] border-[#E6CA65]/40';
      case 'Technical':
        return 'bg-[#00F2FE]/15 text-[#38BDF8] border-[#00F2FE]/40';
      case 'Non-Technical':
        return 'bg-[#E11D48]/15 text-[#FDA4AF] border-[#E11D48]/40';
      case 'Special':
        return 'bg-[#E6CA65]/20 text-[#FCE79C] border-[#E6CA65]/50';
      case 'Break':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-[#0E1736] text-slate-300 border-[#E6CA65]/20';
    }
  };

  return (
    <section id="schedule" className="relative py-24 bg-gradient-to-b from-[#0A1128] via-[#040814] to-[#0A1128] border-t border-[#E6CA65]/20">
      <div className="absolute inset-0 bg-voyage-chart opacity-20 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#E6CA65]/10 border border-[#E6CA65]/35 text-[#FCE79C] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#E6CA65] animate-compass" />
            <span>Grand Voyage Timeline</span>
          </div>
          <h2 className="font-voyage font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Voyage <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">Schedule</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Saturday, September 26, 2026 • Synchronized itinerary across campus deck auditoriums, technology bays, and competition arenas.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {(['All', 'Ceremony', 'Technical', 'Non-Technical', 'Special'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-voyage font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#C8933C] text-[#040814] shadow-glow-gold'
                  : 'bg-[#0A1128]/90 text-slate-300 hover:text-[#E6CA65] border border-[#E6CA65]/25 hover:bg-[#E6CA65]/10'
              }`}
            >
              {filter === 'All' ? 'Full Voyage Itinerary' : `${filter} Challenges`}
            </button>
          ))}
        </div>

        {/* Timeline Flow */}
        <div className="relative border-l-2 border-[#E6CA65]/30 ml-4 sm:ml-32 space-y-8">
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
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#040814] border-2 border-[#E6CA65] group-hover:bg-[#E6CA65] transition-colors shadow-glow-gold/40" />

              {/* Time Badge (Absolute left on Desktop) */}
              <div className="sm:absolute sm:-left-32 sm:top-0 sm:text-right sm:w-28 mb-2 sm:mb-0">
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#FCE79C] bg-[#E6CA65]/15 px-2.5 py-0.5 rounded-md border border-[#E6CA65]/30 shadow-sm">
                  <Clock className="w-3 h-3 text-[#E6CA65]" />
                  <span>{item.timeSlot.split(' - ')[0]}</span>
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0F1A36]/90 to-[#070D1E]/95 border border-[#E6CA65]/25 backdrop-blur-md group-hover:border-[#E6CA65]/50 transition-colors wanted-card-border shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${getCategoryBadge(item.category)}`}>
                    {item.category}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span>{item.venue}</span>
                  </div>
                </div>

                <h3 className="font-voyage font-bold text-lg text-white group-hover:text-[#FCE79C] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
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
