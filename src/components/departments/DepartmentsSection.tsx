import React from 'react';
import { motion } from 'framer-motion';
import { DEPARTMENTS } from '@/data/departments';
import { Briefcase, Terminal, Brain, Cpu, ShieldCheck, UserCheck, Compass } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Terminal,
  Brain,
  Cpu,
  ShieldCheck,
};

export const DepartmentsSection: React.FC = () => {
  return (
    <section id="departments" className="relative py-24 bg-gradient-to-b from-[#0A1128] via-[#040814] to-[#0A1128] border-t border-[#E6CA65]/20">
      {/* Background ambient sea charts */}
      <div className="absolute inset-0 bg-voyage-chart opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#00F2FE]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E6CA65]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#E6CA65]/10 border border-[#E6CA65]/35 text-[#FCE79C] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#E6CA65] animate-compass" />
            <span>Grand Fleet Coalition</span>
          </div>
          <h2 className="font-voyage font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            5 Co-Hosting <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">Departments</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            EvoXis'26 is steered by five premier technology divisions at Sriram Engineering College, uniting computing forces for the ultimate grand symposium voyage.
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
                className={`relative group rounded-2xl bg-gradient-to-b from-[#0F1A36]/90 via-[#0A1128]/95 to-[#070D1E] border border-[#E6CA65]/25 p-6 flex flex-col justify-between hover:border-[#E6CA65]/60 transition-all duration-300 shadow-xl wanted-card-border ${
                  idx === 0 ? 'lg:col-span-1' : ''
                }`}
              >
                {/* Top Corner Glow on hover */}
                <div
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"
                  style={{ backgroundColor: dept.accentColor }}
                />

                <div className="relative z-10">
                  {/* Header: Icon + ShortCode */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-md transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: `${dept.accentColor}18`,
                        borderColor: `${dept.accentColor}50`,
                        color: dept.accentColor,
                      }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#040814] border border-[#E6CA65]/35 text-[#FCE79C] shadow-sm">
                      {dept.shortCode}
                    </span>
                  </div>

                  {/* Department Full Name */}
                  <h3 className="font-voyage font-bold text-xl text-white group-hover:text-[#FCE79C] transition-colors">
                    {dept.fullName}
                  </h3>

                  {/* Tagline */}
                  <p className="mt-1 text-xs font-mono font-medium text-[#E6CA65]/90">
                    "{dept.tagline}"
                  </p>

                  {/* Description */}
                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {dept.description}
                  </p>
                </div>

                {/* Footer: HOD & Stats */}
                <div className="mt-6 pt-4 border-t border-[#E6CA65]/20 flex items-center justify-between text-xs relative z-10">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <UserCheck className="w-4 h-4 text-[#00F2FE]" />
                    <span className="font-medium text-slate-200">HOD: {dept.hodName}</span>
                  </div>

                  {dept.stats && dept.stats[0] && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#040814] text-[#FCE79C] font-mono text-[10px] border border-[#E6CA65]/20">
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
