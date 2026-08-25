import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, MapPin, ArrowRight, Award, Users, Cpu } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

interface HeroSectionProps {
  onOpenRegister: () => void;
  eventDate: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenRegister, eventDate }) => {
  const departments = ['CSBS', 'CSE', 'AI&DS', 'AIML', 'CYBER SECURITY'];

  return (
    <section className="relative min-h-[92vh] pt-32 pb-20 flex flex-col justify-center items-center overflow-hidden">
      {/* Background Cyber Glow & Grid Effects */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:40px_40px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[500px] bg-hero-glow blur-3xl pointer-events-none" />
      <div className="absolute top-12 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Organizer & Accreditation Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md shadow-glow-sm mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs sm:text-sm font-medium text-slate-300">
            <span className="text-cyan-400 font-bold">SRIRAM ENGINEERING COLLEGE</span> • National Level Symposium
          </span>
        </motion.div>

        {/* 5 Co-Hosting Departments Badge Strip */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6"
        >
          <span className="text-xs text-slate-400 font-mono mr-1">Jointly Hosted by:</span>
          {departments.map((dept) => (
            <span
              key={dept}
              className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider bg-slate-800/80 text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 transition-colors"
            >
              {dept}
            </span>
          ))}
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative inline-block"
        >
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-tight text-white uppercase">
            Evo<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-500">Xis</span>
            <span className="text-cyan-400 text-3xl sm:text-5xl md:text-6xl font-mono">'26</span>
          </h1>
        </motion.div>

        {/* Official Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 font-display text-lg sm:text-2xl md:text-3xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-slate-100 to-purple-300"
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
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="font-mono font-medium">September 26, 2026</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span>Sriram Engineering College, Tiruvallur</span>
          </div>
        </motion.div>

        {/* Live Countdown Timer Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 mb-10"
        >
          <div className="text-xs font-mono font-bold tracking-widest text-cyan-400/80 uppercase mb-3">
            Countdown to Grand Launch
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
            className="cyber-button w-full sm:w-auto min-h-[52px] px-8 py-4 rounded-2xl font-display font-black text-sm sm:text-base text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 shadow-glow-cyan flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span>REGISTER FOR EVENTS</span>
            <ArrowRight className="w-4 h-4 ml-0.5 flex-shrink-0" />
          </button>

          <a
            href="#events"
            className="w-full sm:w-auto min-h-[50px] px-7 py-3.5 rounded-2xl font-display font-bold text-sm sm:text-base text-slate-300 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-cyan-500/50 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Award className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Explore 16 Events</span>
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
            { label: 'Total Events', value: '16 Competitions', icon: Award, color: 'text-cyan-400' },
            { label: 'Cash & Trophies', value: '₹50,000+ Pool', icon: Sparkles, color: 'text-amber-400' },
            { label: 'Host Departments', value: '5 Core Computing', icon: Cpu, color: 'text-purple-400' },
            { label: 'Expected Footfall', value: '1,500+ Delegates', icon: Users, color: 'text-emerald-400' },
          ].map((stat, i) => {
            const IconComp = stat.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md flex flex-col items-center justify-center hover:border-cyan-500/30 transition-colors"
              >
                <IconComp className={`w-5 h-5 ${stat.color} mb-1.5`} />
                <span className="font-display font-black text-lg sm:text-xl text-white">{stat.value}</span>
                <span className="text-xs text-slate-400 font-mono mt-0.5">{stat.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
