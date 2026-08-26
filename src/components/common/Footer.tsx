import React from 'react';
import { MapPin, Mail, Phone, Heart, Instagram, Linkedin, Youtube, Compass, Anchor } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#02050E] border-t border-[#E6CA65]/25 text-slate-300 text-sm">
      {/* Background Sea Chart Layer */}
      <div className="absolute inset-0 bg-voyage-chart opacity-15 pointer-events-none" />

      {/* Top Banner Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Branding */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E6CA65] via-[#C8933C] to-[#E11D48] p-[2px] shadow-glow-gold">
                <div className="w-full h-full bg-[#070D1E] rounded-[9px] flex items-center justify-center font-voyage font-black text-[#FCE79C] text-lg">
                  EX
                </div>
              </div>
              <div>
                <span className="font-voyage font-black text-2xl text-white flex items-center gap-1">
                  EvoXis<span className="text-[#E6CA65] font-sans">'26</span>
                </span>
                <span className="text-[10px] font-mono text-[#E6CA65] tracking-widest uppercase">The Grand Symposium Voyage</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm font-sans">
              "Evolving Intelligence • Infinite Possibilities" — The flagship national technical and cultural symposium of Sriram Engineering College.
            </p>

            <div className="pt-2 text-xs text-slate-300/80 space-y-1 font-sans">
              <p className="text-[#FCE79C] font-semibold font-voyage">Sriram Engineering College</p>
              <p>Approved by AICTE, New Delhi & Affiliated to Anna University</p>
              <p>Perumalpattu, Tiruvallur - 602 024, Tamil Nadu</p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0A1128] border border-[#E6CA65]/30 hover:border-[#E6CA65] hover:text-[#E6CA65] flex items-center justify-center transition-colors shadow-sm"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0A1128] border border-[#E6CA65]/30 hover:border-[#00F2FE] hover:text-[#00F2FE] flex items-center justify-center transition-colors shadow-sm"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0A1128] border border-[#E6CA65]/30 hover:border-[#E11D48] hover:text-[#E11D48] flex items-center justify-center transition-colors shadow-sm"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: 5 Co-Hosting Departments */}
          <div>
            <h4 className="font-voyage font-bold text-sm text-[#FCE79C] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-[#E6CA65]" />
              <span>Host Fleets</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#departments" className="hover:text-[#E6CA65] transition-colors">
                  Comp. Science & Business Systems (CSBS)
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-[#E6CA65] transition-colors">
                  Computer Science & Engineering (CSE)
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-[#E6CA65] transition-colors">
                  AI & Data Science (AI&DS)
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-[#E6CA65] transition-colors">
                  AI & Machine Learning (AIML)
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-[#E6CA65] transition-colors">
                  Department of Cyber Security
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Navigation */}
          <div>
            <h4 className="font-voyage font-bold text-sm text-[#00F2FE] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>Voyage Portals</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/register" className="hover:text-[#FCE79C] text-[#E6CA65] font-semibold transition-colors">
                  ⚔️ Multi-Challenge Registration
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-[#FCE79C] text-[#E6CA65] font-semibold transition-colors">
                  🏆 16 Grand Challenges
                </a>
              </li>
              <li>
                <a href="/my-registration" className="hover:text-[#00F2FE] transition-colors">
                  🎫 Voyage Pass & Check-In QR
                </a>
              </li>
              <li>
                <a href="/#schedule" className="hover:text-white transition-colors">
                  📅 Voyage Itinerary
                </a>
              </li>
              <li>
                <a href="/#venue" className="hover:text-white transition-colors">
                  📍 Flagship Port & Transit
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Helpdesk & Emergency */}
          <div>
            <h4 className="font-voyage font-bold text-sm text-[#FDA4AF] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#E11D48]" />
              <span>Quartermaster Desk</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E6CA65] shrink-0" />
                <a href="tel:+919840123456" className="hover:text-[#FCE79C]">
                  +91 98401 23456
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
                <a href="mailto:evoxis26@sriram.edu.in" className="hover:text-[#38BDF8]">
                  evoxis26@sriram.edu.in
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#E11D48] shrink-0 mt-0.5" />
                <span>Veppampattu R.S., Tiruvallur Dt.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits Strip */}
        <div className="mt-12 pt-8 border-t border-[#E6CA65]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 EvoXis'26 • Sriram Engineering College. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-300">
            <span>Navigated with</span>
            <Heart className="w-3.5 h-3.5 text-[#E11D48] fill-[#E11D48]" />
            <span>by EvoXis Student Tech Council</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
