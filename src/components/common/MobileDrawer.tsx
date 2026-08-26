import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Compass } from 'lucide-react';
import { useRegistrationModal } from '@/context/RegistrationModalContext';

interface NavLinkItem {
  name: string;
  href: string;
  badge?: string;
  isRoute?: boolean;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLinkItem[];
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  navLinks,
}) => {
  const { openRegisterModal } = useRegistrationModal();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#040814] border-l-2 border-[#E6CA65]/40 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[#E6CA65]/20">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E6CA65] via-[#C8933C] to-[#E11D48] p-[2px] shadow-glow-gold">
                    <div className="w-full h-full bg-[#070D1E] rounded-[6px] flex items-center justify-center font-voyage font-bold text-[#FCE79C] text-sm">
                      EX
                    </div>
                  </div>
                  <div>
                    <span className="font-voyage font-bold text-lg text-white">EvoXis'26</span>
                    <p className="text-[10px] text-[#E6CA65] font-mono">Grand Symposium Voyage</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-[#0A1128] text-slate-400 hover:text-white border border-[#E6CA65]/30"
                >
                  <X className="w-5 h-5 text-[#E6CA65]" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => {
                  if (link.isRoute) {
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        onClick={onClose}
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-200 hover:text-[#FCE79C] hover:bg-[#E6CA65]/15 border border-transparent hover:border-[#E6CA65]/30 transition-all font-medium font-sans"
                      >
                        <span className="flex items-center gap-2">
                          <Compass className="w-3.5 h-3.5 text-[#E6CA65]" />
                          <span>{link.name}</span>
                        </span>
                      </Link>
                    );
                  }
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-200 hover:text-[#FCE79C] hover:bg-[#E6CA65]/15 border border-transparent hover:border-[#E6CA65]/30 transition-all font-medium font-sans"
                    >
                      <span className="flex items-center gap-2">
                        <Compass className="w-3.5 h-3.5 text-[#E6CA65]" />
                        <span>{link.name}</span>
                      </span>
                      {link.badge && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#E6CA65]/20 text-[#FCE79C] border border-[#E6CA65]/40">
                          {link.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>

              {/* Quick Categories shortcut */}
              <div className="mt-6 pt-4 border-t border-[#E6CA65]/20">
                <p className="text-xs font-mono font-semibold text-[#FCE79C] mb-3 uppercase tracking-wider">
                  Voyage Portals
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/events"
                    onClick={onClose}
                    className="p-2.5 rounded-lg bg-[#E6CA65]/10 border border-[#E6CA65]/30 text-xs font-medium text-[#FCE79C] text-center hover:bg-[#E6CA65]/20 transition-colors font-voyage"
                  >
                    🏆 16 Challenges
                  </Link>
                  <Link
                    to="/my-registration"
                    onClick={onClose}
                    className="p-2.5 rounded-lg bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-xs font-medium text-[#00F2FE] text-center hover:bg-[#00F2FE]/20 transition-colors font-voyage"
                  >
                    🎫 Voyage Pass
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#E6CA65]/20">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openRegisterModal();
                }}
                className="cyber-button w-full min-h-[48px] py-3.5 px-4 rounded-xl font-voyage font-black text-sm text-[#040814] bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#00F2FE] shadow-glow-gold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Sparkles className="w-4 h-4 text-[#040814]" />
                <span>REGISTER FOR THE VOYAGE</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
