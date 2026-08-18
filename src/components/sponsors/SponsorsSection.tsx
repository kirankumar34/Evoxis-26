import React from 'react';
import { motion } from 'framer-motion';
import { Handshake, Building2, Mail, ArrowUpRight } from 'lucide-react';

export const SponsorsSection: React.FC = () => {
  const sponsors = [
    { name: 'Cloudflare', tier: 'Infrastructure Partner', logo: 'Cloudflare Edge CDN', color: 'text-amber-400' },
    { name: 'Google Cloud', tier: 'Cloud Computing Partner', logo: 'Google Cloud Platform', color: 'text-blue-400' },
    { name: 'GitHub Education', tier: 'Developer Ecosystem', logo: 'GitHub Campus Hub', color: 'text-purple-400' },
    { name: 'Red Bull', tier: 'Energy & Gaming Partner', logo: 'Red Bull Wings', color: 'text-red-400' },
    { name: 'HackerEarth', tier: 'Coding Platform Partner', logo: 'HackerEarth Arena', color: 'text-emerald-400' },
    { name: 'Anna University Hub', tier: 'Academic Affiliate', logo: 'Affiliated to Anna University', color: 'text-cyan-400' },
  ];

  return (
    <section className="relative py-20 bg-[#080C15] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Handshake className="w-3.5 h-3.5" />
            <span>Ecosystem & Corporate Backing</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
            Our Proud <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Partners</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Empowered by visionary industry leaders and academic collaborators supporting technological innovation.
          </p>
        </div>

        {/* Sponsor Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {sponsors.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center hover:border-cyan-500/30 transition-all hover:scale-105 group"
            >
              <Building2 className={`w-6 h-6 ${s.color} mb-2 group-hover:scale-110 transition-transform`} />
              <span className="font-display font-bold text-sm text-white">{s.name}</span>
              <span className="text-[10px] font-mono text-slate-400 mt-1">{s.tier}</span>
            </motion.div>
          ))}
        </div>

        {/* Partnership Call to Action Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Interested in Sponsoring EvoXis'26?</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Showcase your brand before 1,500+ top engineering minds and future tech leaders.
            </p>
          </div>

          <a
            href="mailto:evoxis26@sriram.edu.in?subject=EvoXis26%20Sponsorship%20Inquiry"
            className="px-5 py-2.5 rounded-xl text-xs font-bold font-display text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-2 transition-colors shrink-0"
          >
            <Mail className="w-4 h-4" />
            <span>Sponsorship Deck & Inquiries</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
