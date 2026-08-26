import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQS } from '@/data/faqs';
import { ChevronDown, Compass } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQS[0].id);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faqs" className="relative py-24 bg-gradient-to-b from-[#0A1128] via-[#040814] to-[#0A1128] border-t border-[#E6CA65]/20">
      <div className="absolute inset-0 bg-voyage-chart opacity-20 pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#E6CA65]/10 border border-[#E6CA65]/35 text-[#FCE79C] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#E6CA65] animate-compass" />
            <span>Navigator's Guide & Inquiries</span>
          </div>
          <h2 className="font-voyage font-black text-3xl sm:text-4xl text-white tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">Questions</span>
          </h2>
          <p className="mt-3 text-slate-300 text-sm">
            Everything you need to know about joining the Grand Voyage at EvoXis'26 in Sriram Engineering College.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-gradient-to-b from-[#0F1A36]/90 to-[#0A1128] border border-[#E6CA65]/25 overflow-hidden transition-all hover:border-[#E6CA65]/50 shadow-md wanted-card-border"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-voyage font-bold text-base text-white focus:outline-none"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E6CA65] shadow-glow-gold/50" />
                    <span className="text-slate-100 group-hover:text-[#FCE79C]">{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#E6CA65] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#FCE79C]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-sm text-slate-300 leading-relaxed border-t border-[#E6CA65]/15 font-sans bg-[#040814]/60">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
