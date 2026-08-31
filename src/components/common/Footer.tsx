import React from 'react';
import { MapPin, Mail, Phone, Heart, Instagram, Linkedin, Youtube, Compass, Anchor } from 'lucide-react';
import { REGISTRATION_FORM_URL } from '@/constants';

export const Footer: React.FC = () => {
  return (
    <footer
      className="relative border-t-4 border-black text-black text-sm"
      style={{ background: '#0B0B0B', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Manga crosshatch overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }}
      />

      {/* Red accent strip */}
      <div className="w-full h-1 bg-[#E2231A]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">

          {/* Col 1–2: Branding */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 border-2 border-[#FFC928] bg-[#E2231A] flex items-center justify-center"
                style={{ boxShadow: '3px 3px 0px #FFC928' }}
              >
                <span
                  className="text-white font-black text-lg"
                  style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.04em' }}
                >
                  EX
                </span>
              </div>
              <div>
                <span
                  className="text-2xl text-white flex items-center gap-1"
                  style={{ fontFamily: "'Anton', sans-serif" }}
                >
                  EVOXIS<span style={{ color: '#FFC928' }}>'26</span>
                </span>
                <span
                  className="text-[10px] text-[#FFC928] tracking-widest uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  The Grand Symposium Voyage
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm">
              "Evolving Intelligence • Infinite Possibilities" — The flagship national technical
              and cultural symposium of Sriram Engineering College.
            </p>

            <div
              className="text-xs text-white/50 space-y-0.5"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <p className="text-[#FFC928] font-bold">Sriram Engineering College</p>
              <p>Approved by AICTE, New Delhi &amp; Affiliated to Anna University</p>
              <p>Perumalpattu, Tiruvallur — 602 024, Tamil Nadu</p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              {[
                { href: 'https://instagram.com', Icon: Instagram, label: 'Instagram' },
                { href: 'https://linkedin.com', Icon: Linkedin, label: 'LinkedIn' },
                { href: 'https://youtube.com', Icon: Youtube, label: 'YouTube' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 border-2 border-[#FFC928]/40 bg-white/5 hover:bg-[#FFC928] hover:border-[#FFC928] hover:text-black text-white/70 flex items-center justify-center transition-all"
                  aria-label={label}
                  style={{ boxShadow: '2px 2px 0px rgba(255,201,40,0.3)' }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Host Departments */}
          <div>
            <h4
              className="text-[11px] text-[#FFC928] uppercase font-bold mb-4 flex items-center gap-1.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}
            >
              <Anchor className="w-3.5 h-3.5" />
              Host Fleets
            </h4>
            <ul className="space-y-2 text-xs text-white/55">
              {[
                'Computer Science & Engineering (CSE)',
                'AI & Data Science (AI&DS)',
                'AI & Machine Learning (AIML)',
                'Department of Cyber Security',
                'Comp. Science & Business Systems (CSBS)',
              ].map((dept) => (
                <li key={dept}>
                  <a href="#departments" className="hover:text-[#FFC928] transition-colors">
                    {dept}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Navigation */}
          <div>
            <h4
              className="text-[11px] text-[#38BDF8] uppercase font-bold mb-4 flex items-center gap-1.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}
            >
              <Compass className="w-3.5 h-3.5" />
              Voyage Portals
            </h4>
            <ul className="space-y-2 text-xs text-white/55">
              {[
                { href: REGISTRATION_FORM_URL, label: '⚔️ Multi-Challenge Registration (Google Form)', accent: true, external: true },
                { href: '/events', label: '🏆 16 Grand Challenges', accent: true },
                { href: '/my-registration', label: '🎫 Voyage Pass & Check-In QR', accent: false },
                { href: '/#schedule', label: '📅 Voyage Itinerary', accent: false },
                { href: '/#venue', label: '📍 Flagship Port & Transit', accent: false },
              ].map(({ href, label, accent, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className={`transition-colors ${accent ? 'text-[#FFC928] hover:text-white' : 'hover:text-[#FFC928]'}`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Helpdesk */}
          <div>
            <h4
              className="text-[11px] text-[#E2231A] uppercase font-bold mb-4 flex items-center gap-1.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}
            >
              <Compass className="w-3.5 h-3.5" />
              Quartermaster Desk
            </h4>
            <div className="space-y-2.5 text-xs text-white/55">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FFC928] shrink-0" />
                <a href="tel:+919840123456" className="hover:text-[#FFC928] transition-colors">
                  +91 98401 23456
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                <a href="mailto:evoxis26@sriram.edu.in" className="hover:text-[#38BDF8] transition-colors">
                  evoxis26@sriram.edu.in
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#E2231A] shrink-0 mt-0.5" />
                <span>Veppampattu R.S., Tiruvallur Dt.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom strip */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© 2026 EvoXis'26 • Sriram Engineering College. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Navigated with</span>
            <Heart className="w-3.5 h-3.5 text-[#E2231A] fill-[#E2231A]" />
            <span>by EvoXis Student Tech Council</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
