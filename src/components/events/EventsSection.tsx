import React, { useState } from 'react';
import { EventItem } from '@/types';
import { EVENTS } from '@/data/events';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';
import { Search } from 'lucide-react';
import { sound } from '@/utils/audio';

interface EventsSectionProps {
  onOpenRegisterForEvent: (event: EventItem) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({ onOpenRegisterForEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);

  const techCount = EVENTS.filter((e) => e.category === 'Technical').length;
  const nonTechCount = EVENTS.filter((e) => e.category === 'Non-Technical').length;
  const specialCount = EVENTS.filter((e) => e.category === 'Special Event').length;

  const categories = [
    { name: 'All', label: `ALL ISLANDS (${EVENTS.length})` },
    { name: 'Technical', label: `⚔️ TECHNICAL (${techCount})` },
    { name: 'Non-Technical', label: `🎭 NON-TECH (${nonTechCount})` },
    { name: 'Special Event', label: `🏆 SPECIAL (${specialCount})` },
  ];

  const filteredEvents = EVENTS.filter((event) => {
    const matchesCategory =
      selectedCategory === 'All' || event.category === selectedCategory;

    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="events" className="relative py-20 bg-[#F5EAD4] border-t-4 border-black text-black select-none">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* ── MANGA TOP HERO BANNER (MATCHING REFERENCE IMAGE 1) ────────── */}
        <div className="relative rounded-sm bg-[#E2231A] border-4 border-black p-6 sm:p-8 md:p-10 shadow-[8px_8px_0px_0px_#FFC928] overflow-hidden text-white mb-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* Left Vertical GRAND LINE Ribbon */}
            <div className="hidden md:flex flex-col items-center justify-center pr-6 border-r-2 border-white/30">
              <span
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontFamily: "'Anton', sans-serif",
                  fontSize: '1.8rem',
                  letterSpacing: '0.15em',
                  lineHeight: 1,
                }}
                className="text-white uppercase font-black"
              >
                GRAND LINE
              </span>
            </div>

            {/* Center Content Area */}
            <div className="flex-1 text-center md:text-left">
              {/* Mini Badge & Japanese Kanji */}
              <div className="flex flex-wrap items-center justify-center md:justify-between gap-2 mb-3">
                <span
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' }}
                  className="px-3 py-1 bg-black text-[#FFC928] font-bold rounded-sm border border-black uppercase shadow-[2px_2px_0px_0px_#000]"
                >
                  ⚓ WANTED // GRAND LINE ARCHIPELAGO
                </span>
                <span
                  style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: '1.4rem' }}
                  className="text-white font-black tracking-widest"
                >
                  海賊万博
                </span>
              </div>

              {/* Huge Main Header */}
              <h2
                style={{
                  fontFamily: "'Anton', sans-serif",
                  fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
                  letterSpacing: '0.04em',
                  lineHeight: 1.02,
                  textShadow: '2px 2px 0px rgba(0,0,0,0.5)',
                }}
                className="uppercase font-black text-white"
              >
                EXPLORE THE GRAND LINE EVENTS
              </h2>

              {/* Japanese Subtitle */}
              <p
                style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: '1.1rem' }}
                className="text-[#FFC928] font-bold mt-1 mb-2 tracking-wider"
              >
                指名手配 // 航海日誌
              </p>

              {/* Mission Paragraph */}
              <p
                style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}
                className="text-white/90 leading-relaxed max-w-2xl font-medium"
              >
                Each island harbors a unique tech quest, coding battle, or design crucible. Conquer the challenges — prove your crew's valor — claim the bounty vault.
              </p>
            </div>
          </div>
        </div>

        {/* ── CATEGORY FILTER TABS & SEARCH BAR ─────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Rectangular Comic Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    sound.playTick?.();
                    setSelectedCategory(cat.name);
                  }}
                  className={`px-4 py-2 rounded-sm text-xs sm:text-sm font-extrabold uppercase transition-all border-2 border-black cursor-pointer ${
                    isActive
                      ? 'bg-black text-[#FFC928] shadow-[4px_4px_0px_0px_#E2231A]'
                      : 'bg-white text-black hover:bg-black hover:text-white shadow-[3px_3px_0px_0px_#000]'
                  }`}
                  style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <input
              type="text"
              placeholder="Search 15 events, rules, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-sm bg-white border-2 border-black focus:border-[#E2231A] focus:outline-none text-xs sm:text-sm text-black placeholder-black/50 font-mono shadow-[3px_3px_0px_0px_#000]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-red-600 hover:text-black cursor-pointer"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* ── 15 WANTED POSTERS GRID ───────────────────────────────────── */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-sm border-2 border-black shadow-[6px_6px_0px_0px_#000] p-8">
            <p className="font-mono text-base font-bold text-black">No voyage challenges found matching "{searchQuery}".</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2 bg-[#E2231A] text-white font-mono font-bold text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-black hover:text-[#FFC928] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelectEvent={(evt) => setActiveModalEvent(evt)}
                onRegisterEvent={(evt) => onOpenRegisterForEvent(evt)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── EVENT DETAILS DOSSIER MODAL ──────────────────────────────── */}
      <EventModal
        event={activeModalEvent}
        isOpen={Boolean(activeModalEvent)}
        onClose={() => setActiveModalEvent(null)}
        onRegister={(evt) => onOpenRegisterForEvent(evt)}
      />
    </section>
  );
};

export default EventsSection;
