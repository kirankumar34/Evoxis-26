import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

export interface FlowingMenuItem {
  link: string;
  text: string;
  image: string;
}

export interface FlowingMenuProps {
  items?: FlowingMenuItem[] | FlowingMenuItem;
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
}

interface ItemProps {
  link: string;
  text: string;
  image: string;
  speed?: number;
  textColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
  isFirst?: boolean;
}

/* ========================================================
   DESKTOP MENU ITEM (Hover-based Directional Reveal)
   ======================================================== */
const DesktopMenuItem: React.FC<ItemProps> = ({
  link,
  text,
  image,
  textColor,
  marqueeBgColor,
  marqueeTextColor,

}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number) => {
    const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
    const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const handleMouseEnter = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current || !revealRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap.killTweensOf(revealRef.current);
    gsap.timeline({ defaults: { duration: 0.5, ease: 'power3.out' } })
      .set(revealRef.current, { y: edge === 'top' ? '-100%' : '100%' }, 0)
      .to(revealRef.current, { y: '0%' }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current || !revealRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap.killTweensOf(revealRef.current);
    gsap.to(revealRef.current, {
      y: edge === 'top' ? '-100%' : '100%',
      duration: 0.5,
      ease: 'power3.inOut',
    });
  };

  return (
    <div
      className="flex-1 relative overflow-hidden text-center select-none"
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Default Label */}
      <a
        className="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-bold  text-7xl md:text-5xl tracking-wider transition-colors duration-300"
        href={link}
        style={{ color: textColor, fontFamily: "'Bebas Neue', sans-serif" }}
      >
        {text}
      </a>

      {/* Slide-in Marquee Reveal Layer */}
      <div
        ref={revealRef}
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div className="h-full flex items-center w-max animate-marquee-loop">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center flex-shrink-0 px-6 gap-6"
              style={{ color: marqueeTextColor }}
            >
              <span
                className="whitespace-nowrap uppercase font-black text-2xl md:text-4xl leading-tighter tracking-tight"
                style={{ fontFamily: "'jetbrains mono', monospace" }}
              >
                {text}
              </span>
              <div
                className="w-[190px] h-[90px] rounded-full bg-contain bg-no-repeat bg-center  flex-shrink-0 "
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ========================================================
   MOBILE MENU ITEM (Scroll Reveal & Tap to Toggle)
   ======================================================== */
const MobileMenuItem: React.FC<ItemProps> = ({
  text,
  image,
  textColor,
  marqueeBgColor,
  marqueeTextColor,

}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let isCurrentlyVisible = false;

    const handleScroll = () => {
      if (!itemRef.current || !revealRef.current) return;
      const rect = itemRef.current.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;

      const focalZone = window.innerHeight * 0.9;
      const isInFocus =
        Math.abs(itemCenter - viewportCenter) < focalZone &&
        rect.bottom > 100 &&
        rect.top < window.innerHeight - 100;

      if (isInFocus && !isCurrentlyVisible) {
        isCurrentlyVisible = true;
        setIsActive(true);
        gsap.killTweensOf(revealRef.current);
        gsap.to(revealRef.current, {
          y: '0%',
          duration: 0.45,
          ease: 'power2.out',
        });
      } else if (!isInFocus && isCurrentlyVisible) {
        isCurrentlyVisible = false;
        setIsActive(false);
        gsap.killTweensOf(revealRef.current);
        gsap.to(revealRef.current, {
          y: itemCenter < viewportCenter ? '-100%' : '100%',
          duration: 0.45,
          ease: 'power2.inOut',
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    const timer = setTimeout(handleScroll, 200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleTap = () => {
    if (!revealRef.current) return;
    const nextState = !isActive;
    setIsActive(nextState);
    gsap.killTweensOf(revealRef.current);
    gsap.to(revealRef.current, {
      y: nextState ? '0%' : '100%',
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  return (
    <div
      className="flex-1 relative overflow-hidden text-center min-h-[50px] flex items-center justify-center select-none"
      ref={itemRef}
      onClick={handleTap}
      
    >
      <span
        className="flex items-center justify-center h-full cursor-pointer uppercase font-extrabold text-3xl sm:text-2xl tracking-wider px-6"
        style={{ color: textColor, fontFamily: "'Bebas Neue', sans-serif" }}
      >
        {text}
      </span>

      <div
        ref={revealRef}
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div className="h-full flex items-center w-max animate-marquee-loop">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center flex-shrink-0 px-4 gap-4"
              style={{ color: marqueeTextColor }}
            >
              <span
                className="whitespace-nowrap uppercase  text-2xl sm:text-2xl leading-tighter tracking-tight"
                style={{ fontFamily: "'jetbrains mono', monospace" }}
              >
                {text}
              </span>
              <div
                className="w-[190px] h-[90px] rounded-full bg-contain bg-no-repeat bg-center  flex-shrink-0"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FlowingMenu: React.FC<FlowingMenuProps> = ({
  items = [],
  speed = 15,
  textColor = '#FFC928',
  bgColor = '#070D1E',
  marqueeBgColor = '#E2231A',
  marqueeTextColor = '#FFFFFF',
  borderColor = 'rgba(255, 255, 255, 0.15)',
}) => {
  const formattedItems: FlowingMenuItem[] = Array.isArray(items)
    ? items
    : items
    ? [items]
    : [];

  return (
    <div className="w-full h-16 sm:h-20 overflow-hidden select-none" style={{ backgroundColor: bgColor }}>
      {/* Desktop Menu */}
      <nav className="hidden lg:flex flex-col h-full m-0 p-0">
        {formattedItems.map((item, idx) => (
          <DesktopMenuItem
            key={`desktop-${idx}`}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
          />
        ))}
      </nav>

      {/* Mobile Menu */}
      <nav className="flex lg:hidden flex-col h-full m-0 p-0 justify-around">
        {formattedItems.map((item, idx) => (
          <MobileMenuItem
            key={`mobile-${idx}`}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
          />
        ))}
      </nav>
    </div>
  );
};

export default FlowingMenu;
