import React from 'react';
import { motion } from 'framer-motion';
import { DEPARTMENTS } from '@/data/departments';

export const DepartmentsSection: React.FC = () => {
  return (
    <section
      id="departments"
      className="relative py-16 sm:py-24 border-t-4 border-black"
      style={{ background: '#F7ECD4', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Parchment noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23000000\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* ── Section Header ─────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">

          <h2
            className="text-3xl sm:text-5xl md:text-6xl text-black uppercase leading-none tracking-tight mb-3"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            HOSTING <span style={{ color: '#E2231A' }}>DEPARTMENTS</span>
          </h2>

          <p
            className="text-xs sm:text-sm text-black/70 leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            EVOXIS&apos;26 is steered by five premier technology divisions at Sriram Engineering College.
          </p>
        </div>

        {/* ── Departments Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-5 sm:gap-6">
          {DEPARTMENTS.map((dept, idx) => {
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="relative group bg-white border-2 border-black hover:-translate-y-1.5 transition-all duration-200 flex flex-col items-center text-center overflow-hidden"
                style={{
                  boxShadow: '4px 4px 0px #000',
                }}
              >
                {/* Accent Top Strip */}
                <div
                  className="h-2 w-full flex-shrink-0"
                  style={{ background: dept.accentColor || '#E2231A' }}
                />

                <div className="p-6 flex flex-col items-center justify-between flex-1 w-full gap-4">
                  {/* Department Logo Container */}
                  <div
                    className="  rounded-xl border border-black flex items-center justify-center overflow-hidden  "
                  >
                    <img
                      src={dept.logoUrl}  
                      alt={`${dept.fullName} Logo`}
                      className="w-full h-full object-contain filter contrast-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Department Name */}
                  <div className="flex-1 flex items-center justify-center">
                    <h3
                      className="text-base sm:text-lg text-black uppercase tracking-wider"
                      style={{ fontFamily: "'Anton', sans-serif" }}
                    >
                      {dept.fullName}
                    </h3>
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

export default DepartmentsSection;

