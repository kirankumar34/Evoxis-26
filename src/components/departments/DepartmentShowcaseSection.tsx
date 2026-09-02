import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfiniteMenu, { MenuItem } from '@/components/ui/InfiniteMenu';
import { OFFICE_BEARERS, OfficeBearer } from '@/data/officeBearers';
import {
  Crown,
  Award,
} from 'lucide-react';

export interface DisplayOfficeBearer extends OfficeBearer {
  currentImage: string;
}

export const DepartmentShowcaseSection: React.FC = () => {
  // The active item received directly from InfiniteMenu (always matches the front disc)
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  // Controls which avatar pool slot is shown for each bearer
  const [randomSeed, setRandomSeed] = useState<number>(0);
  const [isAutoShuffle] = useState<boolean>(false);
  const autoShuffleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auto-shuffle timer: every 4.5 s rotate through avatar pool ──────────
  const triggerRandomChange = useCallback(() => {
    setRandomSeed((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!isAutoShuffle) {
      if (autoShuffleTimerRef.current) clearInterval(autoShuffleTimerRef.current);
      return;
    }
    autoShuffleTimerRef.current = setInterval(() => {
      triggerRandomChange();
    }, 4500);
    return () => {
      if (autoShuffleTimerRef.current) clearInterval(autoShuffleTimerRef.current);
    };
  }, [isAutoShuffle, triggerRandomChange]);

  const allBearers: DisplayOfficeBearer[] = useMemo(() => {
    return OFFICE_BEARERS.map((bearer, idx) => {
      const poolIndex = (randomSeed + idx) % bearer.avatarPool.length;
      return {
        ...bearer,
        currentImage: bearer.avatarPool[poolIndex] || '',
      };
    });
  }, [randomSeed]);

  // ── Items passed to InfiniteMenu — image changes with randomSeed ─────────
  const infiniteMenuItems: MenuItem[] = useMemo(() => {
    return allBearers.map((b) => ({
      image: b.currentImage,
      link: '#',
      title: b.name,
      description: `${b.position} • ${b.deptShort}`,
      _bearerId: b.id,
    }));
  }, [allBearers]);

  // ── When InfiniteMenu reports the front disc, update card ────────────────
  const handleActiveItemChange = useCallback((item: MenuItem) => {
    setActiveItem(item);
  }, []);

  // ── Look up full bearer data from the active item's _bearerId ────────────
  const activeBearer: DisplayOfficeBearer | null = useMemo(() => {
    if (!activeItem) return allBearers[0] || null;
    const bearerId = activeItem._bearerId as string | undefined;
    if (bearerId) {
      return allBearers.find((b) => b.id === bearerId) || allBearers[0] || null;
    }
    return allBearers.find((b) => b.name === activeItem.title) || allBearers[0] || null;
  }, [activeItem, allBearers]);

  return (
    <section
      id="grand-fleet-council"
      className="relative py-16 sm:py-24 border-t-4 border-black overflow-hidden"
      style={{
        background: '#070D1E',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Background Anime Grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#FFC928 1.5px, transparent 1.5px), radial-gradient(#E2231A 1.5px, #070D1E 1.5px)',
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 15px 15px',
        }}
      />
      <div className="absolute -top-12 -right-12 text-[140px] font-black text-white/[0.02] select-none pointer-events-none font-mono">
        EVOXIS26
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* ── Section Header ─────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">

          <h2
            className="text-3xl sm:text-5xl md:text-6xl text-white uppercase leading-none tracking-tight mb-3"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            DEPARTMENT <span style={{ color: '#E2231A' }}>ASSOCIATE SHOWCASE</span>
          </h2>

          <p
            className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            A continuously rotating 3D matrix featuring the associate office bearers of CSE, AI&DS, AIML, Cyber Security, and CSBS.
          </p>
        </div>


        {/* ── Cinematic Full-Stage Automatic 3D Rotating Sphere ──────── */}
        <div className="relative w-full h-[620px] sm:h-[620px] md:h-[680px] rounded-none border-4 border-black bg-[#040814] shadow-[10px_10px_0px_#000] overflow-hidden">
        

          {/* 3D Infinite WebGL Sphere */}
          {infiniteMenuItems.length > 0 && (
            <div className="w-full h-full">
              <InfiniteMenu
                items={infiniteMenuItems}
                scale={0.96}
                backgroundColor="#040814"
                onActiveItemChange={handleActiveItemChange}
                showDefaultOverlay={false}
              />
            </div>
          )}

          {/* ── Active Bearer Card — synced to the front-facing disc ── */}
          <div className="absolute bottom-5 inset-x-4 sm:left-6 sm:right-auto sm:max-w-md z-30 pointer-events-none">
            <AnimatePresence mode="wait">
              {activeBearer && (
                <motion.div
                  key={`${activeBearer.id}-${randomSeed}`}
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="bg-[#FFF8EC] border-4 border-black p-4 sm:p-5 shadow-[6px_6px_0px_#E2231A] pointer-events-auto"
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between border-b-2 border-black pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 text-[10px] font-black uppercase text-white border border-black shadow-[2px_2px_0px_#000]"
                        style={{ background: activeBearer.accentColor }}
                      >
                        {activeBearer.deptShort}
                      </span>
                      <span className="text-[11px] font-bold text-black uppercase font-mono tracking-wider">
                        {activeBearer.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#E2231A]">
                      <Crown className="w-4 h-4 fill-current" />
                      <span className="text-xs font-black font-mono">LEAD BEARER</span>
                    </div>
                  </div>

                  {/* Bearer Info */}
                  <div className="flex items-center gap-3.5">
                    {/* Avatar: from the sphere's exact front disc image */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 border-3 border-black bg-black overflow-hidden shadow-[3px_3px_0px_#000]">
                      <img
                        src={activeItem?.image || activeBearer.currentImage}
                        alt={activeBearer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-mono text-[#E2231A] font-black uppercase tracking-wider mb-0.5">
                        {activeBearer.position}
                      </div>
                      <h3
                        className="text-xl sm:text-2xl text-black  uppercase tracking-wider truncate"
                        style={{ fontFamily: "'Anton', sans-serif" }}
                      >
                        {activeBearer.name}
                      </h3>
                      <p className="text-xs text-black/75 font-semibold truncate">
                        {activeBearer.deptName}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-[#003B73] font-bold">
                        <Award className="w-3.5 h-3.5 text-[#E2231A]" />
                        <span>Sriram Engineering College</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DepartmentShowcaseSection;
