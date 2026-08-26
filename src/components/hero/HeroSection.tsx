import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, MapPin, ArrowRight, Award, Users, Cpu, Compass, Anchor, Navigation } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface HeroSectionProps {
  onOpenRegister: () => void;
  eventDate: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenRegister, eventDate }) => {
  const departments = ['CSBS', 'CSE', 'AI&DS', 'AIML', 'CYBER SECURITY'];

  return (
    <section className="relative min-h-[94vh] pt-32 pb-20 flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-[#02050E] via-[#040814] to-[#0A1128]">
      {/* Background Sea-Chart & Ocean Glow Effects */}
      <div className="absolute inset-0 bg-voyage-chart bg-[size:48px_48px] opacity-35 pointer-events-none" />
      
      {/* Deep Ocean Ambient Light & Celestial Navigation Beams */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[550px] bg-hero-glow blur-3xl pointer-events-none" />
      <div className="absolute top-16 left-8 w-80 h-80 bg-[#00F2FE]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-8 w-96 h-96 bg-[#E11D48]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[#E6CA65]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Nautical Lines & Compass Watermark */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A1128] to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Organizer & Accreditation Voyage Crest */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#0A1128]/90 border border-[#E6CA65]/35 backdrop-blur-md shadow-glow-gold/20 mb-6"
        >
          <Compass className="w-4 h-4 text-[#E6CA65] animate-compass" />
          <span className="text-xs sm:text-sm font-medium text-slate-200 tracking-wide">
            <span className="text-[#E6CA65] font-voyage font-bold">SRIRAM ENGINEERING COLLEGE</span> • Grand Symposium Voyage
          </span>
          <Anchor className="w-3.5 h-3.5 text-[#00F2FE] ml-0.5" />
        </motion.div>

        {/* 5 Co-Hosting Fleets Badge Strip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6"
        >
          <span className="text-xs text-[#E6CA65]/80 font-mono mr-1">Co-Hosted by Fleets:</span>
          {departments.map((dept) => (
            <span
              key={dept}
              className="px-3 py-0.5 rounded-lg text-[11px] font-mono font-bold tracking-wider bg-[#0E1736]/90 text-[#FCE79C] border border-[#E6CA65]/25 hover:border-[#E6CA65] hover:bg-[#E6CA65]/10 transition-all shadow-sm"
            >
              {dept}
            </span>
          ))}
        </motion.div>

        {/* Main Title: EvoXis'26 — Grand Voyage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative inline-block"
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-voyage tracking-widest text-[#E6CA65]/70 uppercase">
            <span>⚔️</span>
            <span>The Grand Odyssey</span>
            <span>⚔️</span>
          </div>
          <h1 className="font-voyage font-black text-5xl sm:text-7xl md:text-8xl tracking-wider text-white uppercase drop-shadow-2xl">
            Evo<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">Xis</span>
            <span className="text-[#E6CA65] text-3xl sm:text-5xl md:text-6xl font-mono ml-1">'26</span>
          </h1>
        </motion.div>

        {/* Official Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 font-display text-lg sm:text-2xl md:text-3xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5C0] via-slate-100 to-[#38BDF8]"
        >
          "Evolving Intelligence • Infinite Possibilities"
        </motion.p>

        {/* Event Date & Location Sub-header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base text-slate-300"
        >
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#0A1128]/80 border border-[#E6CA65]/25 shadow-sm">
            <Calendar className="w-4 h-4 text-[#E6CA65]" />
            <span className="font-mono font-semibold text-slate-200">September 26, 2026</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#0A1128]/80 border border-[#00F2FE]/25 shadow-sm">
            <MapPin className="w-4 h-4 text-[#00F2FE]" />
            <span className="font-medium text-slate-200">Sriram Engineering College, Tiruvallur</span>
          </div>
        </motion.div>

        {/* Live Countdown Timer Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 mb-10"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#E6CA65] uppercase mb-3 bg-[#E6CA65]/10 px-3 py-1 rounded-full border border-[#E6CA65]/25">
            <Navigation className="w-3.5 h-3.5 text-[#E6CA65]" />
            <span>Time Until Fleet Departure</span>
          </div>
          <CountdownTimer targetDate={eventDate} />
        </motion.div>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-lg mx-auto w-full px-2"
        >
          <button
            type="button"
            onClick={onOpenRegister}
            className="cyber-button w-full sm:w-auto min-h-[54px] px-8 py-4 rounded-2xl font-voyage font-black text-sm sm:text-base text-[#040814] bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#00F2FE] hover:from-[#FFF5C0] hover:to-[#38BDF8] shadow-glow-gold flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-[0.98] border border-[#FFF5C0]/70"
          >
            <Sparkles className="w-5 h-5 flex-shrink-0 text-[#040814]" />
            <span className="tracking-wider">REGISTER FOR THE VOYAGE</span>
            <ArrowRight className="w-4 h-4 ml-0.5 flex-shrink-0 text-[#040814]" />
          </button>

          <a
            href="#events"
            className="w-full sm:w-auto min-h-[52px] px-7 py-3.5 rounded-2xl font-voyage font-bold text-sm sm:text-base text-slate-200 bg-[#0E1736]/90 hover:bg-[#132247] border border-[#E6CA65]/35 hover:border-[#E6CA65] flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md"
          >
            <Award className="w-4 h-4 text-[#E6CA65] flex-shrink-0" />
            <span>Explore 16 Challenges</span>
          </a>
        </motion.div>

        {/* Key Highlights Quick Stats Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: 'Total Challenges', value: '16 Competitions', icon: Award, color: 'text-[#00F2FE]' },
            { label: 'Treasure Chest', value: '₹50,000+ Pool', icon: Sparkles, color: 'text-[#E6CA65]' },
            { label: 'Host Fleets', value: '5 Core Computing', icon: Cpu, color: 'text-[#E11D48]' },
            { label: 'Voyage Crew', value: '1,500+ Delegates', icon: Users, color: 'text-[#10B981]' },
          ].map((stat, i) => {
            const IconComp = stat.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#0A1128]/70 border border-[#E6CA65]/20 backdrop-blur-md flex flex-col items-center justify-center hover:border-[#E6CA65]/50 transition-colors shadow-lg group"
              >
                <IconComp className={`w-5 h-5 ${stat.color} mb-1.5 transition-transform group-hover:scale-110`} />
                <span className="font-display font-black text-lg sm:text-xl text-white">{stat.value}</span>
                <span className="text-xs text-slate-300/80 font-mono mt-0.5">{stat.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
