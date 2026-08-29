import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, ArrowUpRight, Anchor } from 'lucide-react';

export const SponsorsSection: React.FC = () => {
  const sponsors = [
    { name: 'Cloudflare', tier: 'Infrastructure Partner', color: '#F97316' },
    { name: 'Google Cloud', tier: 'Cloud Computing Partner', color: '#0077C8' },
    { name: 'GitHub Education', tier: 'Developer Ecosystem', color: '#6D28D9' },
    { name: 'Red Bull', tier: 'Energy & Gaming Partner', color: '#E2231A' },
    { name: 'HackerEarth', tier: 'Coding Platform Partner', color: '#059669' },
    { name: 'Anna University', tier: 'Academic Affiliate', color: '#003B73' },
  ];

  const tierColors = [
    '#E2231A', '#003B73', '#FFC928', '#0077C8', '#059669', '#003B73',
  ];

  return (
    <section
      className="relative py-16 sm:py-20 border-t-4 border-black"
      style={{ background: '#F2DFC0', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Parchment dots */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23000000\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-black text-[#FFC928] border-2 border-black uppercase tracking-widest font-bold text-[11px] shadow-[3px_3px_0px_0px_#E2231A]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>Grand Fleet Patrons &amp; Guild Backing</span>
          </div>

          <h2
            className="text-3xl sm:text-5xl md:text-6xl text-black uppercase leading-none tracking-tight mb-3"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            OUR VOYAGE <span style={{ color: '#E2231A' }}>PATRONS</span>
          </h2>

          <p
            className="text-xs sm:text-sm text-black/70 leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Empowered by visionary industry leaders and academic collaborators supporting technological discovery.
          </p>
        </div>

        {/* ── Sponsor Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {sponsors.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="bg-white border-2 border-black flex flex-col items-center justify-center text-center p-4 hover:-translate-y-1 transition-transform duration-150 cursor-default"
              style={{ boxShadow: `4px 4px 0px ${tierColors[i] || '#000'}` }}
            >
              {/* Colour top strip */}
              <div className="w-full h-1 mb-3 -mt-1" style={{ background: tierColors[i] || '#000' }} />
              <Building2
                className="w-7 h-7 mb-2"
                style={{ color: tierColors[i] || '#000' }}
              />
              <span
                className="text-sm text-black font-black uppercase leading-tight mb-1"
                style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.03em' }}
              >
                {s.name}
              </span>
              <span
                className="text-[9px] text-black/60 font-bold uppercase leading-snug"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {s.tier}
              </span>
            </motion.div>
          ))}
        </div>

        {/* ── Partnership CTA ────────────────────────────────────────── */}
        <div
          className="bg-[#E2231A] border-2 border-black p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ boxShadow: '6px 6px 0px #000' }}
        >
          <div>
            <h3
              className="text-xl sm:text-2xl text-white uppercase tracking-tight mb-1"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              Interested in Sponsoring EvoXis'26?
            </h3>
            <p
              className="text-xs text-white/80 font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Showcase your brand before 1,500+ top engineering minds and tech adventurers.
            </p>
          </div>

          <a
            href="mailto:evoxis26@sriram.edu.in?subject=EvoXis26%20Sponsorship%20Inquiry"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FFC928] text-black border-2 border-black font-black uppercase text-sm hover:bg-white transition-colors shrink-0"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.1rem',
              letterSpacing: '0.06em',
              boxShadow: '3px 3px 0px #000',
            }}
          >
            <Mail className="w-4 h-4" />
            Sponsorship Deck &amp; Inquiries
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};
