import React from 'react';
import { DEPARTMENTS } from '@/data/departments';
import { LogoLoop, LogoItem } from '@/components/ui/LogoLoop';

// Build logo items for the infinite loop matching the card design in the reference
const DEPT_LOGOS: LogoItem[] = DEPARTMENTS.map((dept) => ({
  node: (
    <div
      className="w-[300px] md:w-[350px] h-[400px] md:h-[450px] bg-white border-2 border-black flex flex-col items-center overflow-hidden select-none transition-transform duration-200"
      style={{ boxShadow: '4px 4px 0px #000' }}
    >
      {/* Accent Top Strip */}
      <div
        className="h-2.5 w-full flex-shrink-0"
        style={{ background: dept.accentColor || '#E2231A' }}
      />

      {/* Card Content */}
      <div className="p-3.5 sm:p-4 w-full h-[400px] md:h-full md:w-full flex flex-col items-center">
        {/* Inner Framed Logo Container */}
        <div className="w-full aspect-square rounded-2xl border border-black flex items-center justify-center p-4 bg-white overflow-hidden">
          <img
            src={dept.logoUrl}
            alt={`${dept.fullName} Logo`}
            className="w-full h-full object-contain filter contrast-105"
            draggable={false}
          />
        </div>

        {/* Department Name at Bottom */}
        <div className="pt-4 pb-2 w-full h-[100px] flex items-center justify-center min-h-[56px]">
          <span
            className="text-base sm:text-lg text-black uppercase  text-center leading-tight font-bold"
            style={{ fontFamily: "'arial', sans-serif" }}
          >
            {dept.fullName}
          </span>
        </div>
      </div>
    </div>
  ),
  title: dept.fullName,
}));

export const DepartmentsSection: React.FC = () => {
  return (
    <section
      id="departments"
      className="relative py-20  border-t-4 border-black"
      style={{ background: '#ffffffff', fontFamily: "'Inter', sans-serif" }}
    >

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* ── Section Header ─────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2
            className="text-5xl sm:text-7xl md:text-8xl text-black uppercase leading-none tracking-tight mb-3"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            HOSTING <span style={{ color: '#E2231A' }}>DEPARTMENTS</span>
          </h2>
           

          <p
            className="text-xs sm:text-sm text-black/50 leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            EVOXIS&apos;26 is steered by five premier technology divisions at Sriram Engineering College.
          </p>
        </div>
      </div>

      {/* ── Infinite Scrolling Department Logos ─────────────────────── */}
      <div className="relative  z-10 py-2">
        <LogoLoop
          logos={DEPT_LOGOS}
          speed={55}
          direction="left"
          gap={32}
          logoHeight={70}
          pauseOnHover={true}
          fadeOut={false}
          fadeOutColor="#F7ECD4"
          ariaLabel="Hosting departments"
        />
      </div>
    </section>
  );
};

export default DepartmentsSection;
