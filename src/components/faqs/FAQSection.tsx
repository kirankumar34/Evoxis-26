import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQS } from '@/data/faqs';
import {
  ChevronDown,
  Anchor,
  Phone,
  Utensils,
  Bus,
  CheckCircle2,
} from 'lucide-react';
import faqBgImg from '@/assets/faqSectionBackground.png';
import luffyImg from '@/assets/faqSectionForeGround1.png';
import sanjiImg from '@/assets/faqSectionForeGround2.png';
import zoroImg from '@/assets/faqSectionForeGround3.png';

// Character dialogue tips for manga panels
const CREW_TIPS = [
  {
    name: 'CAPTAIN LUFFY',
    role: 'Straw Hat Captain',
    img: luffyImg,
    tag: 'AWAKENED INTEL',
    color: '#E2231A',
    badgeBg: '#FFC928',
    quote: '"All college students from any stream can join the voyage! No fees, just pure ambition!!"',
    icon: '👒',
  },
  {
    name: 'RORONOA ZORO',
    role: 'Master Swordsman',
    img: zoroImg,
    tag: 'EVENT RULES',
    color: '#003B73',
    badgeBg: '#7ED9D6',
    quote: '"Bring your official college ID card and don\'t lose your way. Win the trials and take the trophy!"',
    icon: '⚔️',
  },
  {
    name: 'VINSMOKE SANJI',
    role: 'Grand Chef & Hospitality',
    img: sanjiImg,
    tag: 'FOOD & TRANSIT',
    color: '#9A1410',
    badgeBg: '#FFF3D6',
    quote: '"Hot lunch, morning snacks, and free bus transport from Veppampattu & Avadi are on the house!"',
    icon: '🍳',
  },
];

export const FAQSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQS[0].id);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeCrewIdx, setActiveCrewIdx] = useState<number>(0);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const filteredFaqs = activeCategory === 'All'
    ? FAQS
    : FAQS.filter((f) => f.category === activeCategory || (activeCategory === 'General' && !f.category));

  return (
    <section
      id="faqs"
      className="relative py-16 sm:py-24 border-t-4 border-b-4 border-black overflow-hidden select-none bg-[#F7ECD4]"
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Background Manga Canvas Map ───────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-45 sm:opacity-55 mix-blend-multiply"
        style={{
          backgroundImage: `url(${faqBgImg})`,
        }}
      />

      {/* Speedlines & Screentone Halftone Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: '12px 12px',
        }}
      />

      {/* Subtle Manga Speedlines Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            85deg,
            #000 0px,
            #000 1px,
            transparent 1px,
            transparent 18px
          )`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* ── MANGA CHAPTER HEADER PANEL ──────────────────────────────── */}
        <div className="relative mb-10 sm:mb-14">
          <div
            className="bg-[#12141D] border-3 sm:border-4 border-black p-5 sm:p-8 text-white shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#E2231A] relative overflow-hidden"
          >
            {/* Top Comic Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 bg-[#FFC928] text-black text-[11px] font-black uppercase border border-black shadow-[2px_2px_0px_0px_#000]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ★ CHAPTER: FAQ ARC ★
                </span>
                <span
                  className="hidden sm:inline-block px-2.5 py-0.5 bg-[#E2231A] text-white text-[11px] font-black uppercase border border-white shadow-[2px_2px_0px_0px_#000]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ドン!! DON!!
                </span>
              </div>
              <div
                className="text-[11px] font-bold text-[#FFC928] flex items-center gap-1.5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Anchor className="w-3.5 h-3.5" />
                <span>NAVIGATOR&apos;S LOG // SRIRAM ENGINEERING COLLEGE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Title & Intro */}
              <div className="lg:col-span-8 space-y-2">
                <h2
                  className="text-3xl sm:text-5xl md:text-6xl text-white uppercase leading-none tracking-tight font-black"
                  style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.02em' }}
                >
                  FREQUENTLY ASKED{' '}
                  <span
                    className="text-[#FFC928] inline-block"
                    style={{
                      WebkitTextStroke: '1px #000',
                      textShadow: '3px 3px 0px #E2231A',
                    }}
                  >
                    QUESTIONS
                  </span>
                </h2>

                <p
                  className="text-xs sm:text-sm text-slate-300 font-bold max-w-2xl leading-relaxed pt-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Everything you need to know about joining the Grand Voyage at EvoXis&apos;26 — eligibility, team formation, free hospitality, bus routes &amp; certifications.
                </p>

                {/* Comic Category Pill Filters */}
                <div className="flex flex-wrap items-center gap-2 pt-3">
                  {[
                    { id: 'All', label: 'All Queries' },
                    { id: 'General', label: '⚓ General & Rules' },
                    { id: 'Registration', label: '⚔️ Multi-Events' },
                    { id: 'Hospitality', label: '🍱 Food & Transport' },
                    { id: 'Events', label: '🏆 Certificates' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 text-xs font-black uppercase transition-all border cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-[#FFC928] text-black border-black shadow-[3px_3px_0px_0px_#E2231A] -translate-y-0.5'
                          : 'bg-[#090A0F] text-slate-300 border-slate-700 hover:text-white hover:border-[#FFC928]'
                      }`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Luffy Feature Hero Burst (Desktop & Tablet) */}
              <div className="lg:col-span-4 hidden lg:flex justify-end relative">
                <div className="relative w-48 h-48 xl:w-56 xl:h-56">
                  {/* Comic Action SFX Badge */}
                  <div
                    className="absolute -top-3 -left-4 z-20 bg-[#E2231A] text-white text-[11px] font-black px-2.5 py-1 border-2 border-black shadow-[3px_3px_0px_0px_#000] rotate-[-8deg]"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    GEAR 5 FAQ! ⚡
                  </div>

                  {/* Character Illustration */}
                  <img
                    src={luffyImg}
                    alt="Gear 5 Luffy Laughing"
                    className="w-full h-full object-contain filter drop-shadow-[4px_6px_0px_rgba(0,0,0,0.8)] transform hover:scale-105 transition-transform duration-300 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE CREW INTEL TAB BAR (PRIORITY FOR MOBILE UX) ──────── */}
        <div className="lg:hidden mb-6">
          <div className="bg-[#12141D] border-2 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[10px] uppercase font-black text-[#FFC928] flex items-center gap-1.5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span>💬</span>
                <span>CREW NAVIGATOR INTEL:</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 font-mono">TAP TO SWITCH CREW</span>
            </div>

            {/* Character Selector Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {CREW_TIPS.map((crew, idx) => (
                <button
                  key={crew.name}
                  type="button"
                  onClick={() => setActiveCrewIdx(idx)}
                  className={`p-2 border-2 transition-all flex flex-col items-center justify-center gap-1 rounded-sm cursor-pointer ${
                    activeCrewIdx === idx
                      ? 'bg-[#FFC928] border-black text-black shadow-[2px_2px_0px_0px_#E2231A] scale-[1.02]'
                      : 'bg-[#090A0F] border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-black bg-white flex items-center justify-center">
                    <img src={crew.img} alt={crew.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <span className="text-[10px] font-black uppercase font-mono truncate w-full text-center">
                    {crew.name.split(' ')[1] || crew.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Character Dialogue Box */}
            <div className="mt-3 p-3 bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] relative">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{CREW_TIPS[activeCrewIdx].icon}</span>
                <span
                  className="text-[11px] font-black uppercase text-[#E2231A]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {CREW_TIPS[activeCrewIdx].name} ({CREW_TIPS[activeCrewIdx].role}):
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-snug italic font-sans">
                {CREW_TIPS[activeCrewIdx].quote}
              </p>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID: MANGA PANELS + ACCORDION ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT SIDEBAR: MANGA CREW DOSSIER PANELS (DESKTOP) ────────── */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 sticky top-24">
            {/* Panel 1: Zoro's Rules & Guidelines */}
            <div className="bg-[#12141D] border-3 border-black p-5 text-white shadow-[6px_6px_0px_0px_#000] relative overflow-hidden group">
              <div className="flex items-center justify-between border-b-2 border-slate-700 pb-2 mb-3">
                <span
                  className="px-2 py-0.5 bg-[#7ED9D6] text-black text-[10px] font-black uppercase border border-black"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ⚔️ RORONOA ZORO
                </span>
                <span className="text-[10px] font-black text-[#FFC928] font-mono">PANEL 01</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 h-32 flex-shrink-0 border-2 border-black bg-white overflow-hidden shadow-[3px_3px_0px_0px_#000]">
                  <img
                    src={zoroImg}
                    alt="Roronoa Zoro"
                    className="w-full h-full object-cover object-top filter contrast-125 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono block">
                    &bull; ID &amp; DISCIPLINE
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-snug italic">
                    &ldquo;Bring your official college ID card. Follow reporting times and honor the duel rules.&rdquo;
                  </p>
                  <div className="pt-1">
                    <span className="inline-block px-2 py-0.5 text-[9px] bg-black text-[#FFC928] border border-[#FFC928]/40 font-mono font-bold">
                      ✓ Zero Reg Fee (₹0)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 2: Sanji's Hospitality & Bus Routes */}
            <div className="bg-[#12141D] border-3 border-black p-5 text-white shadow-[6px_6px_0px_0px_#000] relative overflow-hidden group">
              <div className="flex items-center justify-between border-b-2 border-slate-700 pb-2 mb-3">
                <span
                  className="px-2 py-0.5 bg-[#FFC928] text-black text-[10px] font-black uppercase border border-black"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  🍳 VINSMOKE SANJI
                </span>
                <span className="text-[10px] font-black text-[#E2231A] font-mono">PANEL 02</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 h-32 flex-shrink-0 border-2 border-black bg-[#FFF3D6] overflow-hidden shadow-[3px_3px_0px_0px_#000]">
                  <img
                    src={sanjiImg}
                    alt="Sanji in Suit"
                    className="w-full h-full object-cover object-top filter contrast-125 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#FFC928] font-bold uppercase font-mono block">
                    &bull; FEAST &amp; CONVOY
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-snug italic">
                    &ldquo;Complimentary lunch &amp; evening snacks for all registered participants. Free campus buses from Veppampattu station!&rdquo;
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono font-bold text-slate-300">
                    <span className="flex items-center gap-1"><Utensils className="w-3 h-3 text-[#FFC928]" /> Food</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1"><Bus className="w-3 h-3 text-[#38BDF8]" /> Bus</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Helpdesk Box */}
            <div className="p-4 bg-[#FFFEF0] border-3 border-black shadow-[4px_4px_0px_0px_#000] text-black">
              <div className="flex items-center gap-2 mb-1.5">
                <Phone className="w-4 h-4 text-[#E2231A]" />
                <span className="text-xs font-black uppercase" style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.04em' }}>
                  HAVE MORE QUESTIONS?
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium mb-3">
                Reach out directly to our student organizers &amp; staff coordinators anytime.
              </p>
              <a
                href="tel:+919840123456"
                className="w-full py-2 px-3 bg-black text-[#FFC928] hover:bg-[#E2231A] hover:text-white transition-colors text-xs font-black flex items-center justify-center gap-2 border-2 border-black no-underline"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+91 98401 23456 (Helpdesk)</span>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: ACCORDION QUESTION LIST (MOBILE-FIRST) ─────── */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, delay: idx * 0.04 }}
                  className="bg-white border-3 border-black overflow-hidden transition-all duration-200"
                  style={{
                    boxShadow: isOpen
                      ? '5px 5px 0px 0px #E2231A, 9px 9px 0px 0px #000'
                      : '4px 4px 0px 0px #000',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className={`w-full min-h-[52px] sm:min-h-[58px] p-3.5 sm:p-5 text-left flex items-center justify-between gap-3 sm:gap-4 transition-colors focus:outline-none cursor-pointer ${
                      isOpen ? 'bg-[#FFFEF0]' : 'hover:bg-[#FFFBEA]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 sm:gap-3.5 flex-1 pr-1">
                      {/* Comic Index Number Badge */}
                      <span
                        className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-black flex items-center justify-center text-[10px] sm:text-xs font-black flex-shrink-0"
                        style={{
                          background: isOpen ? '#E2231A' : '#FFC928',
                          color: isOpen ? '#FFFFFF' : '#000000',
                          fontFamily: "'JetBrains Mono', monospace",
                          boxShadow: '1.5px 1.5px 0px #000',
                        }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Question Text */}
                      <span
                        className="text-sm sm:text-base md:text-lg text-black font-black leading-tight uppercase"
                        style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.02em' }}
                      >
                        {faq.question}
                      </span>
                    </span>

                    {/* Expand Arrow Indicator */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 border-2 border-black flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'bg-[#E2231A] text-white rotate-180' : 'bg-black text-[#FFC928]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 stroke-[3]" />
                    </div>
                  </button>

                  {/* Accordion Answer Details */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: 'easeInOut' }}
                      >
                        <div
                          className="px-4 sm:px-6 pb-5 pt-2 text-xs sm:text-sm text-slate-800 leading-relaxed border-t-2 border-black/10 bg-[#FFFDF5]"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          <div className="flex items-start gap-2 pt-1">
                            <span className="text-[#E2231A] font-black text-sm flex-shrink-0 font-mono">
                              ▶
                            </span>
                            <p className="font-medium text-slate-900 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>

                          {/* Extra contextual badge per category */}
                          <div className="mt-3 pt-2.5 border-t border-black/10 flex flex-wrap items-center justify-between gap-2">
                            <span
                              className="text-[10px] font-black uppercase text-slate-600 font-mono flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Official EvoXis&apos;26 Guideline</span>
                            </span>

                            {faq.category && (
                              <span
                                className="px-2 py-0.5 text-[9px] font-black uppercase bg-[#003B73] text-white border border-black font-mono"
                              >
                                {faq.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Mobile-Only Helpdesk Callout Card */}
            <div className="lg:hidden mt-6 p-4 bg-[#12141D] border-3 border-black text-white shadow-[4px_4px_0px_0px_#E2231A]">
              <div className="flex items-center gap-2 mb-1.5">
                <Phone className="w-4 h-4 text-[#FFC928]" />
                <span
                  className="text-xs font-black uppercase text-[#FFC928]"
                  style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.04em' }}
                >
                  STILL HAVE INQUIRIES?
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mb-3">
                Call or WhatsApp our student helpdesk at Sriram Engineering College anytime.
              </p>
              <a
                href="tel:+919840123456"
                className="w-full py-2.5 px-3 bg-[#FFC928] text-black hover:bg-white transition-colors text-xs font-black flex items-center justify-center gap-2 border-2 border-black no-underline"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+91 98401 23456 (Helpdesk Hotline)</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FAQSection;

