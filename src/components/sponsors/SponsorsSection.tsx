import React from 'react';
import { motion } from 'framer-motion';
import { LogoLoop, LogoItem } from '@/components/ui/LogoLoop';
import SponsorBgMobile from '@/assets/SponsorSectionBackground.png';
import SponsorBgDesktop from '@/assets/SponsorSectionBackground2.png';

const SPONSOR_1_LOGO_URL =
  'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_auto,g_north_west/f_auto/q_auto/Sponsor1.jpg';

const SPONSOR_2_ZENVY_URL =
  'https://res.cloudinary.com/zqpxemhd/image/upload/ar_1:1,c_crop,g_north_west,h_1000,w_1000,x_722,y_850/f_auto/q_auto/zenvyLogo.png';


export const SponsorsSection: React.FC = () => {
  // Pure sponsor & partner logo items for the infinite LogoLoop inside the circle
  const sponsorLogos: LogoItem[] = [

    {
      node: (
        <div className="w-[240px] h-[240px] sm:w-[245px] sm:h-[245px] md:w-[360px] md:h-[360px]  border-[10px] border-black rounded-full bg-black flex items-center justify-center md:-mt-5">
          <img
            src={SPONSOR_2_ZENVY_URL}
            alt="Zenvy - Official Sponsor"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      ),
      title: 'Zenvy',
    },

    {
      node: (
        <div className="w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] md:w-[430px] md:h-[430px] bg-white rounded-full flex items-center justify-center overflow-hidden sm:-mt-12 md:-mt-5">
          <img
            src={SPONSOR_1_LOGO_URL}
            alt="Sri Ayyappa Enterprises - Official Sponsor"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      ),
      title: 'Sri Ayyappa Enterprises',
    },
  ];

  return (
    <section
      id="sponsors"
      className="relative min-h-[920px] sm:min-h-[1000px] lg:min-h-[1080px] py-16 sm:py-20 border-t-4 border-black overflow-hidden flex flex-col justify-between"
      style={{
        backgroundColor: '#070D1E',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Responsive Anime Backgrounds ──────────────────────────────── */}
      {/* Desktop Background (Landscape widescreen) */}
      <img
        src={SponsorBgDesktop}
        alt="Sponsors Anime Background Desktop"
        className="hidden md:block absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      />
      {/* Mobile Background (Portrait vertical) */}
      <img
        src={SponsorBgMobile}
        alt="Sponsors Anime Background Mobile"
        className="block md:hidden absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      />

      {/* Atmospheric Lighting Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070D1E]/80 via-transparent to-[#070D1E]/90 pointer-events-none z-[1]" />

      {/* ── Section Header ──────────────────────────────────────────── */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">


        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl text-white uppercase leading-none tracking-tight mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          OUR OFFICIAL <span className="text-[#E2231A] drop-shadow-[0_0_25px_rgba(226,35,26,0.8)]">SPONSORS</span>
        </motion.h2>

      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 flex-1 flex flex-col justify-center item-center">


        {/* ── Centerpiece: The Glowing Medallion with LogoLoop Inside ──── */}
        <div className="relative -mt-20 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative flex items-center justify-center group"
          >
            {/* Pulsing Energy Rings */}
            <div className="absolute -inset-6 sm:-inset-10 rounded-full border-2 border-[#FFC928]/40 animate-spin-slow pointer-events-none" style={{ animationDuration: '28s' }} />
            <div className="absolute -inset-3 sm:-inset-6 rounded-full border border-[#E2231A]/50 border-dashed animate-reverse-spin pointer-events-none" style={{ animationDuration: '20s' }} />
            <div className="absolute inset-0 rounded-full bg-[#FFC928]/15 blur-2xl pointer-events-none" />

            {/* Circular Medallion matching reference artwork */}
            <div
              className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-[410px] md:h-[410px] rounded-full border-4 border-black flex flex-col items-center justify-center "
              style={{
                background: 'white',
              }}
            >
  

              {/* ── LogoLoop running horizontally INSIDE the circle ── */}
              <div className="relative z-10 w-full overflow-hidden rounded-full ">
                <LogoLoop
                  logos={sponsorLogos}
                  speed={100}
                  direction="left"
                  gap={10}
                  pauseOnHover={false}
                  scaleOnHover={false}
                  fadeOut={false}
                  ariaLabel="Official Sponsors"
                />
              </div>

            </div>
          </motion.div>
        </div>


      </div>
    </section>
  );
};

export default SponsorsSection;
