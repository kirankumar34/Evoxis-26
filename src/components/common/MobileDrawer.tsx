import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0A0E1A] border-l border-cyan-500/20 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 p-[2px]">
                    <div className="w-full h-full bg-[#080C15] rounded-[6px] flex items-center justify-center font-bold text-cyan-400 text-sm">
                      EX
                    </div>
                  </div>
                  <div>
                    <span className="font-display font-bold text-lg text-white">EvoXis'26</span>
                    <p className="text-[10px] text-cyan-400 font-mono">Sriram Engg College</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700"
                >
                  <X className="w-5 h-5" />
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
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-200 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all font-medium"
                      >
                        <span>{link.name}</span>
                      </Link>
                    );
                  }
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-200 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all font-medium"
                    >
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {link.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>

              {/* Quick Categories shortcut */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <p className="text-xs font-mono font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                  Quick Portals
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/events"
                    onClick={onClose}
                    className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-300 text-center hover:bg-cyan-500/20"
                  >
                    🏆 16 Events
                  </Link>
                  <Link
                    to="/my-registration"
                    onClick={onClose}
                    className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 text-center hover:bg-purple-500/20"
                  >
                    🎫 My Pass & QR
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openRegisterModal();
                }}
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl font-display font-black text-sm text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 shadow-glow-cyan flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Sparkles className="w-4 h-4" />
                <span>REGISTER FOR EVENTS</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
