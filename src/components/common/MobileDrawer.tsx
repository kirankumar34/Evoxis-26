import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Compass } from 'lucide-react';
import { sound } from '@/utils/audio';
import { REGISTRATION_FORM_URL } from '@/constants';

export interface NavLinkItem {
  name: string;
  href: string;
  badge?: string;
  isRoute?: boolean;
  isExternal?: boolean;
  icon?: string;
}

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLinkItem[];
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  navLinks,
}) => {

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden lg:hidden">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Slide-out Navigation Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[340px] sm:max-w-[400px] bg-[#070D1E]/98 border-l border-[#FFC928]/35 p-5 sm:p-7 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {/* Drawer Top Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: "'Anton', sans-serif",
                      fontSize: '1.35rem',
                      letterSpacing: '0.04em',
                      lineHeight: 1,
                    }}
                    className="bg-black px-2.5 py-1 border border-white/20 shadow-lg rounded-sm"
                  >
                    <span style={{ color: '#E2231A' }}>EVO</span>
                    <span style={{ color: '#F8F8F8' }}>XIS</span>
                  </span>
                  <span
                    style={{
                      fontFamily: "'Noto Sans JP', sans-serif",
                      fontSize: '0.8rem',
                      color: '#FFC928',
                      letterSpacing: '0.05em',
                    }}
                  >
                    海賊
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 pl-1 border-l border-white/20">
                    Grand Voyage
                  </span>
                </div>

                <button
                  onClick={() => { sound.playTick?.(); onClose(); }}
                  className="p-2 rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  aria-label="Close Navigation"
                >
                  <X className="w-5 h-5 text-[#FFC928]" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="mt-5 flex flex-col gap-1.5">
                {navLinks.map((link) => {
                  if (link.isExternal) {
                    return (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => { sound.playCannon?.(); onClose(); }}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-200 hover:text-[#FFC928] hover:bg-white/5 border border-transparent hover:border-[#FFC928]/30 transition-all font-medium group"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-base">{link.icon || '⚓'}</span>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.15rem', letterSpacing: '0.08em' }}>
                            {link.name}
                          </span>
                        </span>
                        {link.badge && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E2231A]/30 text-[#FFF3D6] border border-[#E2231A]/50">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    );
                  }

                  if (link.isRoute) {
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={() => { sound.playTick?.(); onClose(); }}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-200 hover:text-[#FFC928] hover:bg-white/5 border border-transparent hover:border-[#FFC928]/30 transition-all font-medium group"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-base">{link.icon || '⚓'}</span>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.15rem', letterSpacing: '0.08em' }}>
                            {link.name}
                          </span>
                        </span>
                        {link.badge && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E2231A]/30 text-[#FFF3D6] border border-[#E2231A]/50">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  }

                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => { sound.playTick?.(); onClose(); }}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-200 hover:text-[#FFC928] hover:bg-white/5 border border-transparent hover:border-[#FFC928]/30 transition-all font-medium group"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-base">{link.icon || '⚓'}</span>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.15rem', letterSpacing: '0.08em' }}>
                          {link.name}
                        </span>
                      </span>
                      {link.badge && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E2231A]/30 text-[#FFF3D6] border border-[#E2231A]/50">
                          {link.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>

              {/* Quick Portals Strip */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <p
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-[11px] font-semibold text-[#FFC928] mb-2.5 uppercase tracking-widest flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-[#FFC928] animate-compass" />
                  <span>VOYAGE SHORTCUTS</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/events"
                    onClick={() => { sound.playTick?.(); onClose(); }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/15 text-xs font-medium text-[#FFF3D6] text-center hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-1"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em', fontSize: '0.95rem' }}
                  >
                    <span>🏆 16 CHALLENGES</span>
                  </Link>
                  <Link
                    to="/my-registration"
                    onClick={() => { sound.playTick?.(); onClose(); }}
                    className="p-2.5 rounded-xl bg-[#FFC928]/10 border border-[#FFC928]/30 text-xs font-medium text-[#FFC928] text-center hover:bg-[#FFC928]/20 transition-colors flex flex-col items-center justify-center gap-1"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em', fontSize: '0.95rem' }}
                  >
                    <span>🎫 VOYAGE PASS</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Primary CTA */}
            <div className="pt-4 border-t border-white/10 mt-4">
              <a
                href={REGISTRATION_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  sound.playCannon?.();
                  onClose();
                }}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl text-[#0B0B0B] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xl font-black cursor-pointer text-decoration-none"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '1.15rem',
                  letterSpacing: '0.1em',
                  background: 'linear-gradient(135deg, #FFC928, #B56A12)',
                  boxShadow: '0 0 24px rgba(255,201,40,0.45)',
                  textDecoration: 'none',
                }}
              >
                <Sparkles className="w-4 h-4 text-[#0B0B0B]" />
                <span>SET SAIL / REGISTER</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
