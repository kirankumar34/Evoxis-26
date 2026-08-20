import React from 'react';
import { MapPin, Mail, Phone, Heart, Instagram, Linkedin, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#050810] border-t border-slate-800 text-slate-400 text-sm">
      {/* Top Banner Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Branding */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 p-[2px] shadow-glow-cyan">
                <div className="w-full h-full bg-[#080C15] rounded-[10px] flex items-center justify-center font-display font-black text-cyan-400 text-lg">
                  EX
                </div>
              </div>
              <span className="font-display font-black text-2xl text-white">
                EvoXis<span className="text-cyan-400">'26</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              "Evolving Intelligence • Infinite Possibilities" — The flagship national technical and cultural symposium of Sriram Engineering College.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1 font-sans">
              <p className="text-slate-300 font-semibold">Sriram Engineering College</p>
              <p>Approved by AICTE, New Delhi & Affiliated to Anna University</p>
              <p>Perumalpattu, Tiruvallur - 602 024, Tamil Nadu</p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/50 hover:text-pink-400 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:text-blue-400 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:text-red-400 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: 5 Co-Hosting Departments */}
          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4 text-cyan-400">
              Host Departments
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#departments" className="hover:text-cyan-400 transition-colors">
                  Comp. Science & Business Systems (CSBS)
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-cyan-400 transition-colors">
                  Computer Science & Engineering (CSE)
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-cyan-400 transition-colors">
                  AI & Data Science (AI&DS)
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-cyan-400 transition-colors">
                  AI & Machine Learning (AIML)
                </a>
              </li>
              <li>
                <a href="#departments" className="hover:text-cyan-400 transition-colors">
                  Department of Cyber Security
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Navigation */}
          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4 text-purple-400">
              Portals & Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/register" className="hover:text-cyan-400 text-cyan-300 font-semibold transition-colors">
                  ⚡ Multi-Event Registration
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-cyan-400 text-cyan-300 font-semibold transition-colors">
                  🏆 16 Symposium Events
                </a>
              </li>
              <li>
                <a href="/my-registration" className="hover:text-cyan-400 transition-colors">
                  🎫 My Pass & Check-In QR
                </a>
              </li>
              <li>
                <a href="/#schedule" className="hover:text-white transition-colors">
                  📅 Symposium Schedule
                </a>
              </li>
              <li>
                <a href="/#venue" className="hover:text-white transition-colors">
                  📍 Campus Venue & Transit
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Helpdesk & Emergency */}
          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4 text-amber-400">
              Contact Desk
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <a href="tel:+919840123456" className="hover:text-white">
                  +91 98401 23456
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <a href="mailto:evoxis26@sriram.edu.in" className="hover:text-white">
                  evoxis26@sriram.edu.in
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Veppampattu R.S., Tiruvallur Dt.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits Strip */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 EvoXis'26 • Sriram Engineering College. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Engineered with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>by EvoXis Student Tech Council</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
