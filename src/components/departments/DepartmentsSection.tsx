import React from 'react';
import { motion } from 'framer-motion';
import { DEPARTMENTS } from '@/data/departments';
import { Briefcase, Terminal, Brain, Cpu, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Terminal,
  Brain,
  Cpu,
  ShieldCheck,
};

export const DepartmentsSection: React.FC = () => {
  return (
    <section id="departments" className="relative py-24 bg-[#080C15]/70 border-t border-slate-800/80">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synergy of Computing Disciplines</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            5 Co-Hosting <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Departments</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            EvoXis'26 is united by the collaborative excellence of five premier technology and computing branches at Sriram Engineering College, forging an unforgettable interdisciplinary symposium.
          </p>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept, idx) => {
            const IconComponent = ICON_MAP[dept.icon] || Cpu;
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative group rounded-2xl bg-gradient-to-b from-[#0F172A]/80 to-[#0A0E1A]/90 border border-slate-800 p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300 shadow-xl ${
                  idx === 0 ? 'lg:col-span-1' : ''
                }`}
              >
                {/* Top Corner Glow on hover */}
                <div
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none"
                  style={{ backgroundColor: dept.accentColor }}
                />

                <div>
                  {/* Header: Icon + ShortCode */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-md transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${dept.accentColor}15`,
                        borderColor: `${dept.accentColor}40`,
                        color: dept.accentColor,
                      }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 border border-slate-700/80 text-slate-300">
                      {dept.shortCode}
                    </span>
                  </div>

                  {/* Department Full Name */}
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-cyan-300 transition-colors">
                    {dept.fullName}
                  </h3>

                  {/* Tagline */}
                  <p className="mt-1 text-xs font-mono font-medium text-cyan-400/90">
                    "{dept.tagline}"
                  </p>

                  {/* Description */}
                  <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                {/* Footer: HOD & Stats */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium text-slate-300">HOD: {dept.hodName}</span>
                  </div>

                  {dept.stats && dept.stats[0] && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono text-[10px]">
                      {dept.stats[0].value}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
