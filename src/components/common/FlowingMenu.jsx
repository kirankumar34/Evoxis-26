import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#fff',
  bgColor = '#120F17',
  marqueeBgColor = '#fff',
  marqueeTextColor = '#120F17',
  borderColor = '#ffffff33'
}) {
  return (
    <div className="w-full h-full overflow-hidden" style={{ backgroundColor: bgColor }}>
      {/* Desktop Menu (Visible on lg screens) */}
      <nav className="hidden lg:flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
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

      {/* Mobile Menu (Visible on mobile & tablet screens) */}
      <nav className="flex lg:hidden flex-col h-full m-0 p-0 justify-around">
        {items.map((item, idx) => (
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
}

/* ========================================================
   DESKTOP MENU ITEM (Hover-based Directional Reveal)
   ======================================================== */
function DesktopMenuItem({ link, text, image, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor, isFirst }) {
  const itemRef = useRef(null);
  const revealRef = useRef(null);

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
    const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const handleMouseEnter = ev => {
    if (!itemRef.current || !revealRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap.killTweensOf(revealRef.current);
    gsap.timeline({ defaults: { duration: 0.5, ease: 'power3.out' } })
      .set(revealRef.current, { y: edge === 'top' ? '-100%' : '100%' }, 0)
      .to(revealRef.current, { y: '0%' }, 0);
  };

  const handleMouseLeave = ev => {
    if (!itemRef.current || !revealRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);

    gsap.killTweensOf(revealRef.current);
    gsap.to(revealRef.current, {
      y: edge === 'top' ? '-100%' : '100%',
      duration: 0.5,
      ease: 'power3.inOut'
    });
  };

  return (
    <div
      className="flex-1 relative overflow-hidden text-center select-none"
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ borderTop: isFirst ? 'none' : `1px solid ${borderColor}` }}
    >
      {/* Default Label */}
      <a
        className="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-extrabold text-[3.5vw] tracking-wider transition-colors duration-300"
        href={link}
        style={{ color: textColor }}
      >
        {text}
      </a>

      {/* Slide-in Marquee Reveal Layer (Isolated from horizontal scrolling) */}
      <div
        ref={revealRef}
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
        style={{ backgroundColor: marqueeBgColor }}
      >
        {/* Continuous Horizontal Infinite Marquee Track */}
        <div className="h-full flex items-center w-max animate-marquee-loop">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center flex-shrink-0 px-6 gap-6"
              style={{ color: marqueeTextColor }}
            >
              <span className="whitespace-nowrap uppercase font-black text-[3.5vw] leading-none tracking-tight">
                {text}
              </span>
              <div
                className="w-[180px] h-[55px] rounded-full bg-cover bg-center shadow-md flex-shrink-0 border-2 border-black/20"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   MOBILE MENU ITEM (Scroll Reveal & Tap to Toggle)
   ======================================================== */
function MobileMenuItem({ link, text, image, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor, isFirst }) {
  const itemRef = useRef(null);
  const revealRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let isCurrentlyVisible = false;

    const handleScroll = () => {
      if (!itemRef.current || !revealRef.current) return;
      const rect = itemRef.current.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;

      // When this item is in the focal middle 40% of the mobile viewport
      const focalZone = window.innerHeight * 0.90;
      const isInFocus = Math.abs(itemCenter - viewportCenter) < focalZone && rect.bottom > 100 && rect.top < window.innerHeight - 100;

      if (isInFocus && !isCurrentlyVisible) {
        isCurrentlyVisible = true;
        setIsActive(true);
        gsap.killTweensOf(revealRef.current);
        gsap.to(revealRef.current, {
          y: '0%',
          duration: 0.45,
          ease: 'power2.out'
        });
      } else if (!isInFocus && isCurrentlyVisible) {
        isCurrentlyVisible = false;
        setIsActive(false);
        gsap.killTweensOf(revealRef.current);
        gsap.to(revealRef.current, {
          y: itemCenter < viewportCenter ? '-100%' : '100%',
          duration: 0.45,
          ease: 'power2.inOut'
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
      ease: 'power2.out'
    });
  };

  return (
    <div
      className="flex-1 relative overflow-hidden text-center min-h-[90px] flex items-center justify-center select-none"
      ref={itemRef}
      onClick={handleTap}
      style={{ borderTop: isFirst ? 'none' : `1px solid ${borderColor}` }}
    >
      {/* Default Label */}
      <span
        className="flex items-center justify-center h-full cursor-pointer uppercase font-extrabold text-2xl sm:text-3xl tracking-wider px-4"
        style={{ color: textColor }}
      >
        {text}
      </span>

      {/* Marquee Reveal Layer (Isolated from horizontal scrolling) */}
      <div
        ref={revealRef}
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
        style={{ backgroundColor: marqueeBgColor }}
      >
        {/* Continuous Horizontal Infinite Marquee Track */}
        <div className="h-full flex items-center w-max animate-marquee-loop">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center flex-shrink-0 px-4 gap-4"
              style={{ color: marqueeTextColor }}
            >
              <span className="whitespace-nowrap uppercase font-black text-2xl sm:text-3xl leading-none tracking-tight">
                {text}
              </span>
              <div
                className="w-[120px] h-[42px] rounded-full bg-cover bg-center shadow-md flex-shrink-0 border-2 border-black/20"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
