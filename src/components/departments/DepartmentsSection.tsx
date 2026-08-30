import React from 'react';
import { motion } from 'framer-motion';
import { DEPARTMENTS } from '@/data/departments';
import { Briefcase, Terminal, Brain, Cpu, ShieldCheck, UserCheck, Anchor } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Terminal,
  Brain,
  Cpu,
  ShieldCheck,
};

/* ── Sketch-box accent colours per dept index ─────────────────────────── */
const DEPT_ACCENTS = [
  { bg: '#E2231A', shadow: '#000', label: 'text-white' },
  { bg: '#003B73', shadow: '#000', label: 'text-white' },
  { bg: '#FFC928', shadow: '#000', label: 'text-black' },
  { bg: '#0077C8', shadow: '#000', label: 'text-white' },
  { bg: '#9A1410', shadow: '#000', label: 'text-white' },
];

export const DepartmentsSection: React.FC = () => {
  return (
    <section
      id="departments"
      className="relative py-16 sm:py-24 border-t-4 border-black"
      style={{ background: '#F7ECD4', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Parchment noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23000000\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* ── Section Header ─────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-black text-[#FFC928] border-2 border-black uppercase tracking-widest font-bold text-[11px] shadow-[3px_3px_0px_0px_#E2231A]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>Grand Fleet Coalition</span>
          </div>

          <h2
            className="text-3xl sm:text-5xl md:text-6xl text-black uppercase leading-none tracking-tight mb-3"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            5 CO-HOSTING <span style={{ color: '#E2231A' }}>DEPARTMENTS</span>
          </h2>

          <p
            className="text-xs sm:text-sm text-black/70 leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            EvoXis'26 is steered by five premier technology divisions at Sriram Engineering College,
            uniting computing forces for the ultimate grand symposium voyage.
          </p>
        </div>

        {/* ── Departments Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {DEPARTMENTS.map((dept, idx) => {
            const IconComponent = ICON_MAP[dept.icon] || Cpu;
            const accent = DEPT_ACCENTS[idx % DEPT_ACCENTS.length];
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative group bg-white border-2 border-black hover:-translate-y-1 transition-transform duration-200 cursor-default"
                style={{ boxShadow: '5px 5px 0px #000' }}
              >
                {/* Accent top strip */}
                <div
                  className="h-1.5 w-full"
                  style={{ background: accent.bg }}
                />

                <div className="p-5 flex flex-col justify-between h-full">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 border-2 border-black flex items-center justify-center"
                      style={{ background: accent.bg, boxShadow: '2px 2px 0px #000' }}
                    >
                      <IconComponent className={`w-6 h-6 ${accent.label}`} />
                    </div>
                    <span
                      className="px-2.5 py-1 text-[10px] font-black uppercase border-2 border-black bg-[#FFC928] text-black"
                      style={{ fontFamily: "'JetBrains Mono', monospace", boxShadow: '2px 2px 0px #000' }}
                    >
                      {dept.shortCode}
                    </span>
                  </div>

                  {/* Dept Name */}
                  <h3
                    className="text-lg sm:text-xl text-black uppercase tracking-tight leading-tight mb-1"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    {dept.fullName}
                  </h3>

                  {/* Tagline */}
                  <p
                    className="text-[11px] text-[#9A1410] font-bold uppercase mb-3"
                    style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}
                  >
                    "{dept.tagline}"
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-black/75 leading-relaxed mb-4">
                    {dept.description}
                  </p>

                  {/* Footer */}
                  <div
                    className="pt-3 border-t-2 border-black/10 flex items-center justify-between text-[11px]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <div className="flex items-center gap-1.5 text-black/70 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-[#0077C8]" />
                      <span>HOD: {dept.hodName}</span>
                    </div>
                    {dept.stats && dept.stats[0] && (
                      <span
                        className="px-2 py-0.5 bg-black text-[#FFC928] font-bold border border-black text-[10px]"
                      >
                        {dept.stats[0].value}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
