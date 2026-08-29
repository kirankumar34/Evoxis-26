import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQS } from '@/data/faqs';
import { ChevronDown, Anchor } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQS[0].id);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section
      id="faqs"
      className="relative py-16 sm:py-24 border-t-4 border-black"
      style={{ background: '#F7ECD4', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Parchment dots */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23000000\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-black text-[#FFC928] border-2 border-black uppercase tracking-widest font-bold text-[11px] shadow-[3px_3px_0px_0px_#E2231A]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>Navigator's Guide &amp; Inquiries</span>
          </div>

          <h2
            className="text-3xl sm:text-5xl md:text-6xl text-black uppercase leading-none tracking-tight mb-3"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            FREQUENTLY ASKED <span style={{ color: '#E2231A' }}>QUESTIONS</span>
          </h2>

          <p
            className="text-xs sm:text-sm text-black/70 leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Everything you need to know about joining the Grand Voyage at EvoXis'26 in Sriram Engineering College.
          </p>
        </div>

        {/* ── Accordion List ─────────────────────────────────────────── */}
        <div className="space-y-3 sm:space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white border-2 border-black overflow-hidden"
                style={{
                  boxShadow: isOpen ? '5px 5px 0px #E2231A' : '4px 4px 0px #000',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-[#F7ECD4] transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 border-2 border-black flex items-center justify-center text-[9px] font-black flex-shrink-0"
                      style={{
                        background: isOpen ? '#E2231A' : '#FFC928',
                        color: isOpen ? '#fff' : '#000',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="text-sm sm:text-base text-black font-bold"
                      style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.03em' }}
                    >
                      {faq.question}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#E2231A] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div
                        className="px-5 pb-5 pt-1 text-sm text-black/80 leading-relaxed border-t-2 border-black/10 bg-[#FFF8EC]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
