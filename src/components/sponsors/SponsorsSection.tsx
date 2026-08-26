import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, ArrowUpRight, Anchor } from 'lucide-react';

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
    <section className="relative py-20 bg-[#030611] border-t border-[#E6CA65]/20">
      {/* Background Sea Chart Grid */}
      <div className="absolute inset-0 bg-voyage-chart opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6CA65]/10 border border-[#E6CA65]/35 text-[#FCE79C] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Anchor className="w-3.5 h-3.5 text-[#E6CA65]" />
            <span>Grand Fleet Patrons & Guild Backing</span>
          </div>
          <h2 className="font-voyage font-black text-3xl sm:text-4xl text-white tracking-tight">
            Our Voyage <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">Patrons</span>
          </h2>
          <p className="mt-3 text-slate-300 text-sm font-sans">
            Empowered by visionary industry leaders and academic collaborators supporting technological discovery.
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
              className="p-5 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/25 flex flex-col items-center justify-center text-center hover:border-[#E6CA65] transition-all hover:scale-105 group wanted-card-border shadow-md"
            >
              <Building2 className={`w-6 h-6 ${s.color} mb-2 group-hover:scale-110 transition-transform relative z-10`} />
              <span className="font-voyage font-bold text-sm text-white relative z-10">{s.name}</span>
              <span className="text-[10px] font-mono text-[#FCE79C] mt-1 relative z-10">{s.tier}</span>
            </motion.div>
          ))}
        </div>

        {/* Partnership Call to Action Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-[#0A1128]/95 border-2 border-[#E6CA65]/35 flex flex-col sm:flex-row items-center justify-between gap-4 wanted-card-border shadow-2xl">
          <div className="relative z-10">
            <h3 className="font-voyage font-bold text-lg text-white">Interested in Sponsoring the EvoXis'26 Voyage?</h3>
            <p className="text-xs sm:text-sm text-slate-300 font-sans">
              Showcase your brand before 1,500+ top engineering minds and tech adventurers.
            </p>
          </div>

          <a
            href="mailto:evoxis26@sriram.edu.in?subject=EvoXis26%20Sponsorship%20Inquiry"
            className="px-5 py-2.5 rounded-xl text-xs font-bold font-voyage text-[#040814] bg-gradient-to-r from-[#E6CA65] to-[#FCE79C] hover:from-[#FFF5C0] shadow-glow-gold flex items-center gap-2 transition-all shrink-0 relative z-10"
          >
            <Mail className="w-4 h-4 text-[#040814]" />
            <span>Sponsorship Deck & Inquiries</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#040814]" />
          </a>
        </div>
      </div>
    </section>
  );
};
