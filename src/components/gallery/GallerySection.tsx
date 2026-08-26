import React from 'react';
import { motion } from 'framer-motion';
import { GALLERY_ITEMS } from '@/data/gallery';
import { Compass } from 'lucide-react';

export const GallerySection: React.FC = () => {
  return (
    <section id="gallery" className="relative py-24 bg-[#02050E] border-t border-[#E6CA65]/20">
      {/* Background Sea Chart Layer */}
      <div className="absolute inset-0 bg-voyage-chart opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6CA65]/10 border border-[#E6CA65]/35 text-[#FCE79C] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#E6CA65]" />
            <span>Chronicles of Past Expeditions</span>
          </div>
          <h2 className="font-voyage font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Voyage <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">Highlights</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base font-sans">
            Capturing the electric energy, intense hacking moments, grand stage performances, and bounty ceremonies from previous national editions.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GALLERY_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group relative rounded-3xl overflow-hidden border border-[#E6CA65]/30 bg-gradient-to-br ${item.imageGradient} p-8 flex flex-col justify-end min-h-[260px] hover:border-[#E6CA65] transition-all duration-300 shadow-2xl wanted-card-border ${item.aspect}`}
            >
              {/* Decorative Nautical Grid */}
              <div className="absolute inset-0 bg-voyage-chart opacity-25 pointer-events-none" />

              {/* Ambient Glowing Corner */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E6CA65]/10 rounded-full blur-2xl group-hover:bg-[#E6CA65]/25 transition-colors pointer-events-none" />

              {/* Top Badge */}
              <div className="absolute top-6 left-6 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#040814]/90 backdrop-blur-md text-[#FCE79C] border border-[#E6CA65]/40 shadow-sm">
                  {item.category}
                </span>
              </div>

              {/* Bottom Details */}
              <div className="relative z-10">
                <h3 className="font-voyage font-bold text-lg sm:text-xl text-white group-hover:text-[#FCE79C] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
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
