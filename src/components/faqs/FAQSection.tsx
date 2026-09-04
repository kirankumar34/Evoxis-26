import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQS } from '@/data/faqs';
import {
  ChevronDown,
  Phone,
  MessageSquare
} from 'lucide-react';
import faqBgImg from '@/assets/faqSectionBackground.png';

export const FAQSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQS[0].id);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const filteredFaqs = FAQS;

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

      <div className="relative flex flex-col  items-center justify-center gap-10  max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        <h2 className="text-5xl sm:text-5xl md:text-6xl text-white uppercase  tracking-wider text-center border-2 border-black p-2" style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.05em' }}>
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
        <div className="flex flex-col  gap-8 items-start">

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
                  className="bg-white border-2 border-black overflow-hidden transition-all duration-200"
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
                          boxShadow: '1.5px 1.5px 0px #ffffffff',
                        }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      {/* Question Text */}
                      <span
                        className="text-sm sm:text-base md:text-lg text-black  leading-wider uppercase"
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

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Mobile-Only Helpdesk Callout Card */}
            <div className=" mt-6 p-4 bg-[#12141D] border-3 border-black text-white shadow-[4px_4px_0px_0px_#E2231A]">
              <div className="flex items-center gap-2 mb-1.5">
                <Phone className="w-4 h-4 text-[#FFC928]" />
                <span
                  className="text-xs font-black uppercase text-[#FFC928]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}
                >
                  STILL HAVE INQUIRIES?
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mb-3">
                Call or WhatsApp our student helpdesk at Sriram Engineering College anytime.
              </p>
              <div className='flex flex-col gap-2'>
                <a
                  href="tel:+919840123456"
                  className="w-full py-2.5 px-3 bg-[#FFC928] text-black hover:bg-white transition-colors text-xs font-black flex items-center justify-center gap-2 border-2 border-black no-underline"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+91 9444750292</span>

                </a>
                <a href={`https://wa.me/9444750292?text=Hi%20${encodeURIComponent("EvoXis26")},%20I%20have%20a%20query%20about%20${encodeURIComponent("Symposium")}%20at%20EvoXis26.`} target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 bg-[#25D366] text-white hover:bg-green-600 transition-colors text-xs font-black flex items-center justify-center gap-2 border-2 border-black no-underline"
                      title="Chat on WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat On Whatsapp</span>
                      
                </a>
              </div>
    
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FAQSection;

