import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Train, Bus, Phone, Compass } from 'lucide-react';

export const VenueSection: React.FC = () => {
  const googleMapsUrl = "https://maps.google.com/?q=Sriram+Engineering+College+Perumalpattu";

  return (
    <section id="venue" className="relative py-24 bg-[#080C15]">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>Campus Location & Transit</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            How to Reach <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Sriram Campus</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            Conveniently situated in Perumalpattu on the Chennai-Tiruvallur highway with direct suburban rail connectivity and college bus shuttles.
          </p>
        </div>

        {/* 2-Column Grid: Map + Transit Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map Embed Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 rounded-3xl bg-slate-900/80 border border-slate-800 p-2 sm:p-3 overflow-hidden shadow-2xl flex flex-col justify-between"
          >
            <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-slate-800">
              <iframe
                title="Sriram Engineering College Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.5925429792014!2d79.9723947!3d13.1258169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1248169!3m3!1m2!1s0x3a528659160bb47b%3A0x6b777a83d4204c32!2sSriram%20Engineering%20College!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 grayscale invert contrast-125 opacity-85 hover:opacity-100 hover:grayscale-0 hover:invert-0 transition-all duration-500"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#080C15]/90 border border-cyan-500/30 backdrop-blur-md flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Sriram Engineering College</p>
                  <p className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-md">
                    Perumalpattu, Tiruvallur - 602024
                  </p>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold font-display bg-cyan-400 hover:bg-cyan-300 text-black flex items-center gap-1.5 transition-colors shrink-0 shadow-glow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </a>
              </div>
            </div>

            {/* Quick GPS Coordinates */}
            <div className="mt-3 px-3 py-2 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>GPS: 13.1258° N, 79.9724° E</span>
              <span className="text-cyan-400">Anna University Code: 1118</span>
            </div>
          </motion.div>

          {/* Transit Options Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col justify-between gap-4"
          >
            {/* By Suburban Train */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#0A0E1A] border border-slate-800 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">By Suburban Train</h3>
                  <p className="text-xs font-mono text-cyan-400">Chennai Central - Arakkonam EMU Line</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Alight at <strong className="text-white">Veppampattu Railway Station</strong> (Frequent EMU trains from Chennai Central, Moore Market Complex, and Avadi every 15 minutes). The college campus is just 1.5 km from the station.
              </p>
            </div>

            {/* Free Campus Shuttle */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0F172A] to-[#0A0E1A] border border-slate-800 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Free College Shuttle Buses</h3>
                  <p className="text-xs font-mono text-purple-400">From 08:00 AM to 10:00 AM</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Dedicated free college shuttle buses will ply continuously between Veppampattu Railway Station and the campus entrance to transport all participants.
              </p>
            </div>

            {/* Transport & Helpdesk Contacts */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Symposium Transport Helpline</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href="tel:+919840123456"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-between transition-colors"
                >
                  <span>Transport Lead</span>
                  <span className="font-mono text-cyan-400">Call</span>
                </a>
                <a
                  href="tel:+919840955443"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-between transition-colors"
                >
                  <span>Campus Helpdesk</span>
                  <span className="font-mono text-purple-400">Call</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
