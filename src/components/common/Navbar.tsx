import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sparkles, Calendar, MapPin, Award, Layers, QrCode, Compass } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';
import { useRegistrationModal } from '@/context/RegistrationModalContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { openRegisterModal } = useRegistrationModal();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '16 Challenges', href: isHomePage ? '#events' : '/events', icon: Award, badge: '16', isRoute: !isHomePage },
    { name: 'Departments', href: isHomePage ? '#departments' : '/#departments', icon: Layers },
    { name: 'Voyage Schedule', href: isHomePage ? '#schedule' : '/#schedule', icon: Calendar },
    { name: 'Venue', href: isHomePage ? '#venue' : '/#venue', icon: MapPin },
    { name: 'Voyage Pass / QR', href: '/my-registration', icon: QrCode, isRoute: true },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#040814]/92 backdrop-blur-xl border-b border-[#E6CA65]/25 py-2.5 shadow-glass'
            : 'bg-gradient-to-b from-[#040814]/90 via-[#040814]/40 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand / Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#E6CA65] via-[#C8933C] to-[#E11D48] p-[2px] shadow-glow-gold transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#070D1E] rounded-[9px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E6CA65]/10 to-transparent pointer-events-none" />
                <span className="font-voyage font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE] text-lg tracking-wider">
                  EX
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-voyage font-black text-xl tracking-wide text-white group-hover:text-[#E6CA65] transition-colors flex items-center gap-1.5">
                  EvoXis<span className="text-[#E6CA65] font-sans">'26</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E6CA65]/15 text-[#FCE79C] border border-[#E6CA65]/35 flex items-center gap-1">
                  <Compass className="w-2.5 h-2.5 text-[#E6CA65] animate-compass" />
                  GRAND VOYAGE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Sriram Engineering College
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 mr-4">
            {navLinks.map((link) => {
              if (link.isRoute) {
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`relative px-3.5 py-2 text-sm font-semibold transition-all rounded-xl flex items-center gap-1.5 ${
                      location.pathname === link.href
                        ? 'text-[#FCE79C] bg-[#E6CA65]/15 border border-[#E6CA65]/30 shadow-glow-gold/40'
                        : 'text-slate-300 hover:text-[#E6CA65] hover:bg-[#E6CA65]/10'
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                );
              }
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative px-3.5 py-2 text-sm font-semibold text-slate-300 hover:text-[#E6CA65] transition-all rounded-xl hover:bg-[#E6CA65]/10 flex items-center gap-1.5"
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#E11D48]/20 text-[#FDA4AF] border border-[#E11D48]/40">
                      {link.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center">
            {/* Desktop Only: Single Primary CTA */}
            <div className="hidden lg:block">
              <button
                type="button"
                onClick={() => openRegisterModal()}
                className="cyber-button relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-voyage font-black text-xs xl:text-sm text-[#040814] bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#00F2FE] hover:from-[#FFF5C0] hover:to-[#38BDF8] shadow-glow-gold transition-all hover:scale-[1.03] active:scale-[0.98] border border-[#FFF5C0]/60"
              >
                <Sparkles className="w-4 h-4 text-[#040814]" />
                <span className="tracking-wider">REGISTER FOR THE VOYAGE</span>
              </button>
            </div>

            {/* Mobile Header: Uncluttered Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-slate-300 hover:text-white bg-[#0A1128]/80 border border-[#E6CA65]/30 hover:border-[#E6CA65] transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6 text-[#E6CA65]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
      />
    </>
  );
};

export default Navbar;
