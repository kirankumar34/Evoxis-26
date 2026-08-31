import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { MobileDrawer } from './MobileDrawer';
import { sound } from '@/utils/audio';
import { REGISTRATION_FORM_URL } from '@/constants';

/* ─── colour tokens ──────────────────────────────────────────────────────── */
const C = {
  bone:      '#F8F8F8',
  cream:     '#FFF3D6',
  ink:       '#0B0B0B',
  red:       '#E2231A',
  deepRed:   '#9A1410',
  blue:      '#0077C8',
  deepBlue:  '#003B73',
  gold:      '#FFC928',
  deepGold:  '#B56A12',
  rope:      '#C68B3F',
  seafoam:   '#7ED9D6',
};

interface NavItem {
  name: string;
  href: string;
  isRoute?: boolean;
  isExternal?: boolean;
  badge?: string;
  icon?: string;
}

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: NavItem[] = [
    { name: 'Home', href: isHomePage ? '#home' : '/', isRoute: !isHomePage, icon: '🏠' },
    { name: 'Departments', href: isHomePage ? '#departments' : '/#departments', icon: '🛡️' },
    { name: 'Events', href: isHomePage ? '#events' : '/events', isRoute: !isHomePage, badge: '15', icon: '🏆' },
    { name: 'Register', href: REGISTRATION_FORM_URL, isExternal: true, icon: '⚔️' },
    { name: 'Schedule', href: isHomePage ? '#schedule' : '/#schedule', icon: '⏳' },
    { name: 'Venue', href: isHomePage ? '#venue' : '/#venue', icon: '📍' },
    // { name: 'Pass', href: '/my-registration', isRoute: true, icon: '🎫' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0B0B0B]/92 backdrop-blur-xl border-b border-white/10 py-2 sm:py-3 shadow-2xl'
            : 'bg-gradient-to-b from-[#0B0B0B]/90 via-[#0B0B0B]/40 to-transparent py-2.5 sm:py-4'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand / Manga Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <span
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: '1.35rem',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
              className="bg-black px-2.5 py-1 border border-white/15 shadow-xl rounded-sm transition-transform group-hover:scale-105"
            >
              <span style={{ color: C.red }}>EVO</span>
              <span style={{ color: C.bone }}>XIS</span>
            </span>
            <span
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: '0.75rem',
                color: C.gold,
                marginLeft: '3px',
                letterSpacing: '0.05em',
              }}
            >
              海賊
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-white/50 pl-2 border-l border-white/20">
              Symposium'26
            </span>
          </Link>

          {/* Desktop & Laptop Navigation Links (Normal horizontal pill bar for laptop view) */}
          <nav
            className="hidden lg:flex items-center gap-1 rounded-full px-2 py-1.5"
            style={{
              background: 'rgba(11,11,11,0.72)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(14px)',
            }}
          >
            {navLinks.map((lnk) => {
              const isCurrent = (lnk.name === 'Home' && location.pathname === '/') || location.pathname === lnk.href;
              
              if (lnk.isExternal) {
                return (
                  <a
                    key={lnk.name}
                    href={lnk.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playCannon?.()}
                    className="px-4 py-1.5 rounded-full text-sm transition-all duration-200 flex items-center gap-1.5"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      color: C.bone,
                      background: 'transparent',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = C.gold;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = C.bone;
                    }}
                  >
                    <span>{lnk.name}</span>
                    {lnk.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#E2231A]/30 text-[#FFF3D6] border border-[#E2231A]/50">
                        {lnk.badge}
                      </span>
                    )}
                  </a>
                );
              }

              if (lnk.isRoute) {
                return (
                  <Link
                    key={lnk.name}
                    to={lnk.href}
                    onClick={() => sound.playTick?.()}
                    className="px-4 py-1.5 rounded-full text-sm transition-all duration-200 flex items-center gap-1.5"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: isCurrent ? 600 : 400,
                      color: isCurrent ? C.ink : C.bone,
                      background: isCurrent ? C.bone : 'transparent',
                      letterSpacing: '0.01em',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) e.currentTarget.style.color = C.gold;
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) e.currentTarget.style.color = C.bone;
                    }}
                  >
                    <span>{lnk.name}</span>
                    {lnk.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#E2231A]/30 text-[#FFF3D6] border border-[#E2231A]/50">
                        {lnk.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <a
                  key={lnk.name}
                  href={lnk.href}
                  onClick={() => sound.playTick?.()}
                  className="px-4 py-1.5 rounded-full text-sm transition-all duration-200 flex items-center gap-1.5"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent ? C.ink : C.bone,
                    background: isCurrent ? C.bone : 'transparent',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.color = C.gold;
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.color = C.bone;
                  }}
                >
                  <span>{lnk.name}</span>
                  {lnk.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#E2231A]/30 text-[#FFF3D6] border border-[#E2231A]/50">
                      {lnk.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Voyage Pass Shortcut (visible on tablet / desktop) */}
            {/* <Link
              to="/my-registration"
              onClick={() => sound.playTick?.()}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '0.08em',
                fontSize: '0.9rem',
                color: C.bone,
                background: 'rgba(11,11,11,0.65)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '9999px',
                padding: '6px 16px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              className="hidden sm:inline-flex lg:hidden xl:inline-flex items-center gap-1.5"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(11,11,11,0.65)'; }}
            >
              <span>🎫</span>
              <span>Pass</span>
            </Link> */}

            {/* Set Sail Register CTA */}
            <a
              href={REGISTRATION_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playCannon?.()}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '0.08em',
                fontSize: '0.95rem',
                color: C.ink,
                background: `linear-gradient(135deg, ${C.gold}, ${C.deepGold})`,
                border: 'none',
                borderRadius: '9999px',
                padding: '7px 20px',
                cursor: 'pointer',
                boxShadow: '0 0 18px rgba(255,201,40,0.45)',
                transition: 'all 0.2s',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255,201,40,0.7)'; 
                e.currentTarget.style.transform = 'translateY(-1px)'; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.boxShadow = '0 0 18px rgba(255,201,40,0.45)'; 
                e.currentTarget.style.transform = ''; 
              }}
            >
              Set Sail
            </a>

            {/* Mobile & Tablet Only: Side Opening Menu Trigger */}
            <button
              onClick={() => { sound.playTick?.(); setDrawerOpen(true); }}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 border border-white/20 hover:border-[#FFC928] text-white transition-all shadow-md group cursor-pointer"
              aria-label="Open Navigation Menu"
              title="Open Navigation Menu"
            >
              <span className="hidden sm:inline font-mono text-xs text-[#FFC928] tracking-widest uppercase font-bold group-hover:text-white transition-colors">
                MENU
              </span>
              <Menu className="w-5 h-5 text-[#FFC928] group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Side Navigation Drawer for Mobile & Tablet */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navLinks={navLinks}
      />
    </>
  );
};

export default Navbar;
