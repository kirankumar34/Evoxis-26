import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sparkles, Calendar, MapPin, Award, Layers, QrCode, ShieldCheck } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '16 Events', href: isHomePage ? '#events' : '/#events', icon: Award, badge: '16' },
    { name: 'Departments', href: isHomePage ? '#departments' : '/#departments', icon: Layers },
    { name: 'Schedule', href: isHomePage ? '#schedule' : '/#schedule', icon: Calendar },
    { name: 'Venue', href: isHomePage ? '#venue' : '/#venue', icon: MapPin },
    { name: 'My Pass / QR', href: '/my-registration', icon: QrCode, isRoute: true },
    { name: 'Committee Portal', href: '/committee/login', icon: ShieldCheck, isRoute: true },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#080C15]/90 backdrop-blur-xl border-b border-cyan-500/20 py-3 shadow-glass'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand / Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-[2px] shadow-glow-cyan transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#080C15] rounded-[10px] flex items-center justify-center">
                <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-lg">
                  EX
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  EvoXis<span className="text-cyan-400">'26</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  NATIONAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Sriram Engineering College
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              if (link.isRoute) {
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg flex items-center gap-1.5 ${
                      location.pathname === link.href
                        ? 'text-cyan-400 bg-cyan-500/10'
                        : 'text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/5'
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
                  className="relative px-3 py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-500/5 flex items-center gap-1.5"
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {link.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* CTA & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="cyber-button relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 hover:from-cyan-300 hover:to-sky-300 shadow-glow-cyan transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Register Now</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/50 hover:border-cyan-500/50 transition-colors"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
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
