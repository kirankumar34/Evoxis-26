import React from 'react';
import { motion } from 'framer-motion';
import { GALLERY_ITEMS } from '@/data/gallery';
import { Compass } from 'lucide-react';

export const GallerySection: React.FC = () => {
  return (
    <section
      id="gallery"
      className="relative py-16 sm:py-24 border-t-4 border-black"
      style={{ background: '#F7ECD4', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Parchment dots */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23000000\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-black text-[#FFC928] border-2 border-black uppercase tracking-widest font-bold text-[11px] shadow-[3px_3px_0px_0px_#E2231A]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Chronicles of Past Expeditions</span>
          </div>

          <h2
            className="text-3xl sm:text-5xl md:text-6xl text-black uppercase leading-none tracking-tight mb-3"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            VOYAGE <span style={{ color: '#E2231A' }}>HIGHLIGHTS</span>
          </h2>

          <p
            className="text-xs sm:text-sm text-black/70 leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Capturing the electric energy, intense hacking moments, grand stage performances,
            and bounty ceremonies from previous national editions.
          </p>
        </div>

        {/* ── Gallery Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {GALLERY_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`group relative bg-white border-2 border-black overflow-hidden flex flex-col justify-end min-h-[240px] sm:min-h-[280px] hover:-translate-y-1 transition-transform duration-200 ${item.aspect ?? ''}`}
              style={{ boxShadow: '5px 5px 0px #000' }}
            >
              {/* Gradient fill (acts as "image" since no real photos) */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.imageGradient}`}
              />

              {/* Manga crosshatch overlay */}
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }}
              />

              {/* Top badge */}
              <div className="absolute top-4 left-4 z-10">
                <span
                  className="px-2.5 py-1 border-2 border-black bg-[#FFC928] text-black text-[10px] font-black uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace", boxShadow: '2px 2px 0px #000' }}
                >
                  {item.category}
                </span>
              </div>

              {/* Bottom content */}
              <div className="relative z-10 p-4 bg-white border-t-2 border-black">
                <h3
                  className="text-lg sm:text-xl text-black uppercase tracking-tight leading-tight"
                  style={{ fontFamily: "'Anton', sans-serif" }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-1 text-xs text-black/65 leading-relaxed"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {item.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
