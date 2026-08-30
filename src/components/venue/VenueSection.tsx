import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Train, Bus, Phone, Compass } from 'lucide-react';

export const VenueSection: React.FC = () => {
  const googleMapsUrl = "https://maps.google.com/?q=Sriram+Engineering+College+Perumalpattu";

  return (
    <section
      id="venue"
      className="relative py-16 sm:py-24 border-t-4 border-black"
      style={{ background: '#F2DFC0', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Parchment dots */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23000000\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-black text-[#FFC928] border-2 border-black uppercase tracking-widest font-bold text-[11px] shadow-[3px_3px_0px_0px_#E2231A]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Voyage Coordinates &amp; Port of Call</span>
          </div>

          <h2
            className="text-3xl sm:text-5xl md:text-6xl text-black uppercase leading-none tracking-tight mb-3"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            HOW TO REACH <span style={{ color: '#E2231A' }}>SRIRAM CAMPUS</span>
          </h2>

          <p
            className="text-xs sm:text-sm text-black/70 leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Situated in Perumalpattu on the Chennai–Tiruvallur route with direct suburban rail
            connectivity and dedicated fleet shuttle buses.
          </p>
        </div>

        {/* ── 2-Col Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">

          {/* Map Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-white border-2 border-black p-2 sm:p-3 flex flex-col"
            style={{ boxShadow: '6px 6px 0px #000' }}
          >
            <div className="relative w-full h-64 sm:h-96 overflow-hidden border-2 border-black">
              <iframe
                title="Sriram Engineering College Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.5925429792014!2d79.9723947!3d13.1258169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1248169!3m3!1m2!1s0x3a528659160bb47b%3A0x6b777a83d4204c32!2sSriram%20Engineering%20College!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Overlay card */}
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-white border-2 border-black flex items-center justify-between"
                style={{ boxShadow: '3px 3px 0px #000' }}>
                <div>
                  <p
                    className="text-xs font-black text-black uppercase"
                    style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.04em' }}
                  >
                    Sriram Engineering College
                  </p>
                  <p className="text-[11px] text-black/60 font-mono truncate max-w-[200px] sm:max-w-sm">
                    Perumalpattu, Tiruvallur — 602024
                  </p>
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E2231A] text-white border-2 border-black text-xs font-black uppercase hover:bg-black transition-colors"
                  style={{ fontFamily: "'JetBrains Mono', monospace", boxShadow: '2px 2px 0px #000' }}
                >
                  <Navigation className="w-3 h-3" />
                  Navigate
                </a>
              </div>
            </div>

            {/* GPS line */}
            <div
              className="mt-3 px-2 py-1.5 flex items-center justify-between text-[11px] font-mono text-black/70 border-t-2 border-black/10"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span className="flex items-center gap-1.5 text-[#0077C8] font-bold">
                <Compass className="w-3 h-3" />
                GPS: 13.1258° N, 79.9724° E
              </span>
              <span className="font-bold text-[#9A1410]">Anna Univ. Code: 1126</span>
            </div>
          </motion.div>

          {/* Transit Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col gap-4 sm:gap-5"
          >

            {/* Suburban Train card */}
            <div
              className="bg-white border-2 border-black p-4 sm:p-5 hover:-translate-y-0.5 transition-transform duration-150"
              style={{ boxShadow: '4px 4px 0px #003B73' }}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 border-2 border-black bg-[#003B73] flex items-center justify-center"
                  style={{ boxShadow: '2px 2px 0px #000' }}>
                  <Train className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3
                    className="text-base text-black uppercase tracking-tight"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    By Suburban Rail Line
                  </h3>
                  <p
                    className="text-[11px] text-[#003B73] font-bold"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Chennai Central — Arakkonam EMU Line
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-black/75 leading-relaxed">
                Alight at <strong className="text-[#E2231A]">Veppampattu Railway Station</strong> (Frequent
                EMU trains from Chennai Central, Moore Market Complex, and Avadi every 15 mins).
                Campus is just 1.5 km from the station.
              </p>
            </div>

            {/* Shuttle Bus card */}
            <div
              className="bg-white border-2 border-black p-4 sm:p-5 hover:-translate-y-0.5 transition-transform duration-150"
              style={{ boxShadow: '4px 4px 0px #FFC928' }}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 border-2 border-black bg-[#FFC928] flex items-center justify-center"
                  style={{ boxShadow: '2px 2px 0px #000' }}>
                  <Bus className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3
                    className="text-base text-black uppercase tracking-tight"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    Free Fleet Shuttle Buses
                  </h3>
                  <p
                    className="text-[11px] text-[#9A1410] font-bold"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    From 08:00 AM to 10:00 AM
                  </p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-black/75 leading-relaxed">
                Free college fleet shuttles will run continuously between Veppampattu Railway Station
                and the symposium registration gates to welcome all crew &amp; delegates.
              </p>
            </div>

            {/* Helpline card */}
            <div
              className="bg-[#E2231A] border-2 border-black p-4 sm:p-5"
              style={{ boxShadow: '4px 4px 0px #000' }}
            >
              <h4
                className="text-[11px] font-bold uppercase text-white mb-3 flex items-center gap-2"
                style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em' }}
              >
                <Phone className="w-3.5 h-3.5 text-[#FFC928]" />
                Symposium Port &amp; Transit Helpline
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href="tel:+919840123456"
                  className="p-2.5 bg-black text-[#FFC928] border border-black/30 flex items-center justify-between font-mono font-bold hover:bg-[#111] transition-colors"
                >
                  <span>Transit Lead</span>
                  <span className="text-[#FFC928]">Call →</span>
                </a>
                <a
                  href="tel:+919840955443"
                  className="p-2.5 bg-black text-white border border-black/30 flex items-center justify-between font-mono font-bold hover:bg-[#111] transition-colors"
                >
                  <span>Command Desk</span>
                  <span className="text-[#38BDF8]">Call →</span>
                </a>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};
