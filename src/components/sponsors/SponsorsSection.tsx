import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowUpRight, Anchor, Sparkles, ShieldCheck, Award } from 'lucide-react';
import { LogoLoop, LogoItem } from '@/components/ui/LogoLoop';

const SPONSOR_LOGO_URL =
  'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_auto,g_north_west/f_auto/q_auto/Sponsor1.jpg';

export const SponsorsSection: React.FC = () => {
  // Primary Sponsor Logos for the Infinite Loop Marquee
  const sponsorLogos: LogoItem[] = [
    {
      src: SPONSOR_LOGO_URL,
      alt: 'Official Title Sponsor',
      title: 'Official Partner',
    },
    {
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      alt: 'Innovate Labs Partner',
      title: 'Innovation Partner',
    },
    {
      src: SPONSOR_LOGO_URL,
      alt: 'Grand Sponsor Partner',
      title: 'Grand Partner',
    },
    {
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      alt: 'Tech Guild Partner',
      title: 'Tech Partner',
    },
    {
      src: SPONSOR_LOGO_URL,
      alt: 'Official Symposium Sponsor',
      title: 'Symposium Partner',
    },
  ];

  return (
    <section
      id="sponsors"
      className="relative py-20 sm:py-24 border-t border-white/10 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #0c1630 0%, #040814 100%)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Subtle scanline and grid background overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative Golden Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFC928]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#E2231A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── Section Header ────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1 mb-4 bg-black/80 text-[#FFC928] border border-[#FFC928]/40 rounded-full uppercase tracking-widest font-bold text-xs shadow-[0_0_15px_rgba(255,201,40,0.2)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Anchor className="w-3.5 h-3.5 text-[#FFC928]" />
            <span>GRAND ALLIANCE &amp; PATRONS</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl text-white uppercase leading-none tracking-tight mb-4"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            OUR OFFICIAL <span className="text-[#E2231A] drop-shadow-[0_0_20px_rgba(226,35,26,0.6)]">SPONSORS</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Powering future innovators, engineers, and creators. Backed by visionary industry leaders championing tech excellence.
          </motion.p>
        </div>

        {/* ── Featured Official Sponsor Spotlight ───────────────────────── */}
        <div className="max-w-4xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl bg-gradient-to-b from-[#0e1b38]/90 via-[#070d1e]/90 to-[#040814]/90 border-2 border-[#FFC928]/40 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(255,201,40,0.15)] flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 group overflow-hidden"
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFC928] to-transparent opacity-80" />

            {/* Left Sponsor Badge / Logo Frame */}
            <div className="flex-shrink-0 relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-[#FFC928]/60 bg-black/60 p-2 shadow-[0_0_25px_rgba(255,201,40,0.3)] group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <img
                  src={SPONSOR_LOGO_URL}
                  alt="Official Sponsor"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#E2231A] text-white text-[10px] font-mono font-black uppercase tracking-wider rounded-full shadow-md whitespace-nowrap">
                ★ TITLE PARTNER
              </div>
            </div>

            {/* Middle Details */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 text-[#FFC928] text-xs font-mono font-bold tracking-widest uppercase mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OFFICIAL SYMPOSIUM SPONSOR</span>
              </div>
              <h3
                className="text-2xl sm:text-3xl font-bold text-white uppercase mb-2"
                style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.04em' }}
              >
                PROUD INDUSTRY PATRON
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Empowering the next generation of engineers with real-world exposure, mentorship, and premier symposium opportunities.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Partner
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FFC928]/10 border border-[#FFC928]/25 text-xs font-mono text-[#FFC928]">
                  <Award className="w-3.5 h-3.5" />
                  Grand Fleet Supporter
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Infinite Scrolling LogoLoop Marquee ───────────────────────── */}
        <div className="relative my-10 py-6 bg-black/40 border-y border-white/10 backdrop-blur-md">
          <div className="text-center mb-4">
            <span
              className="text-[11px] font-mono tracking-[0.2em] text-[#FFC928]/80 uppercase font-semibold"
            >
              // STRATEGIC PARTNERS &amp; CONTRIBUTORS //
            </span>
          </div>

          <LogoLoop
            logos={sponsorLogos}
            speed={80}
            direction="left"
            logoHeight={65}
            gap={60}
            pauseOnHover={true}
            scaleOnHover={true}
            fadeOut={true}
            fadeOutColor="#040814"
            className="w-full py-3"
            renderItem={(item, key) => (
              <div
                key={key}
                className="h-20 px-6 py-2 rounded-xl bg-white/[0.04] border border-white/15 hover:border-[#FFC928]/60 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-lg group/card"
              >
                {'src' in item && (
                  <img
                    src={item.src}
                    alt={item.alt || 'Sponsor'}
                    className="max-h-14 max-w-[140px] object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] group-hover/card:brightness-110 transition-all"
                  />
                )}
              </div>
            )}
          />
        </div>

        {/* ── Partnership & Sponsorship Call to Action ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 rounded-2xl bg-gradient-to-r from-[#E2231A]/90 via-[#9A1410]/95 to-[#E2231A]/90 border border-white/20 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_35px_rgba(226,35,26,0.35)] relative overflow-hidden"
        >
          {/* Subtle manga dots pattern inside banner */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          <div className="relative z-10 text-center md:text-left">
            <span className="inline-block text-[11px] font-mono tracking-widest text-[#FFC928] uppercase font-bold mb-1">
              JOIN THE GRAND VOYAGE
            </span>
            <h3
              className="text-2xl sm:text-3xl text-white uppercase tracking-tight mb-1"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              Interested in Sponsoring EvoXis'26?
            </h3>
            <p
              className="text-xs sm:text-sm text-white/90 max-w-xl"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Showcase your organization before 1,000+ top engineering minds, competitive coders, and future tech leaders.
            </p>
          </div>

          <a
            href="mailto:evoxis26@sriram.edu.in?subject=EvoXis26%20Sponsorship%20Inquiry"
            className="relative z-10 flex items-center gap-2.5 px-6 py-3.5 bg-[#FFC928] hover:bg-white text-black font-black uppercase text-sm rounded-xl transition-all duration-200 shrink-0 shadow-xl active:scale-95 group cursor-pointer"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.15rem',
              letterSpacing: '0.06em',
            }}
          >
            <Mail className="w-4 h-4 text-black" />
            <span>Sponsorship Deck &amp; Inquiries</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default SponsorsSection;
