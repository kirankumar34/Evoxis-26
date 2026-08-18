import React from 'react';
import { motion } from 'framer-motion';
import { GALLERY_ITEMS } from '@/data/gallery';
import { Image } from 'lucide-react';

export const GallerySection: React.FC = () => {
  return (
    <section id="gallery" className="relative py-24 bg-[#080C15]/70 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Image className="w-3.5 h-3.5" />
            <span>Legacy & Memories</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Symposium <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Highlights</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            Capturing the electric energy, intense hacking moments, grand stage performances, and prize ceremonies from previous national editions.
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
              className={`group relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br ${item.imageGradient} p-8 flex flex-col justify-end min-h-[260px] hover:border-cyan-500/40 transition-all duration-300 shadow-xl ${item.aspect}`}
            >
              {/* Decorative Tech Grid */}
              <div className="absolute inset-0 bg-cyber-grid bg-[size:24px_24px] opacity-20 pointer-events-none" />

              {/* Ambient Glowing Corner */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors pointer-events-none" />

              {/* Top Badge */}
              <div className="absolute top-6 left-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                  {item.category}
                </span>
              </div>

              {/* Bottom Details */}
              <div className="relative z-10">
                <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
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
