import React, { useState } from 'react';
import { EventItem } from '@/types';
import { EVENTS } from '@/data/events';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';
import { Search, Sparkles, Zap, Gamepad2, Trophy, Compass, Anchor } from 'lucide-react';

interface EventsSectionProps {
  onOpenRegisterForEvent: (event: EventItem) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({ onOpenRegisterForEvent }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);

  const categories = [
    { name: 'All', label: 'All 16 Challenges', count: 16, icon: Sparkles },
    { name: 'Technical', label: 'Grand Voyage Challenges', count: 6, icon: Zap },
    { name: 'Non-Technical', label: 'Crew Challenges', count: 6, icon: Gamepad2 },
    { name: 'Special', label: 'Grand Arena Events', count: 4, icon: Trophy },
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
    <section id="events" className="relative py-24 bg-gradient-to-b from-[#0A1128] via-[#040814] to-[#0A1128] border-t border-[#E6CA65]/20">
      {/* Background Ambience & Sea Map */}
      <div className="absolute inset-0 bg-voyage-chart opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#00F2FE]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#E11D48]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#E6CA65]/10 border border-[#E6CA65]/35 text-[#FCE79C] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-[#E6CA65] animate-compass" />
            <span>Treasure Map • 16 Grand Challenges</span>
            <Anchor className="w-3 h-3 text-[#00F2FE]" />
          </div>
          <h2 className="font-voyage font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">Voyage Challenges</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Choose your proving grounds across Technical Voyage Challenges, Crew Competitions, and High-Stakes Arena Events. Claim your glory and ₹50,000+ treasure bounties!
          </p>
        </div>

        {/* Filter Bar & Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#0A1128]/90 border border-[#E6CA65]/25 backdrop-blur-md shadow-lg">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-voyage font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#C8933C] text-[#040814] shadow-glow-gold'
                      : 'text-slate-300 hover:text-[#E6CA65] hover:bg-[#E6CA65]/10'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-[#040814]/40 text-[#040814]' : 'bg-[#0E1736] text-[#E6CA65]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E6CA65]" />
            <input
              type="text"
              placeholder="Search challenges, keywords, rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0A1128]/90 border border-[#E6CA65]/30 focus:border-[#E6CA65] focus:ring-1 focus:ring-[#E6CA65] focus:outline-none text-xs sm:text-sm text-white placeholder-slate-400 font-sans transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-[#E6CA65]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-[#0A1128]/60 rounded-3xl border border-[#E6CA65]/20 backdrop-blur-md">
            <p className="text-slate-300 font-mono text-sm">No voyage challenges found matching "{searchQuery}".</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2 rounded-xl text-xs font-voyage font-bold bg-[#E6CA65]/20 text-[#FCE79C] border border-[#E6CA65]/40 hover:bg-[#E6CA65]/30 transition-colors"
            >
              Reset Voyage Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Deep-Dive Event Modal */}
      <EventModal
        event={activeModalEvent}
        isOpen={Boolean(activeModalEvent)}
        onClose={() => setActiveModalEvent(null)}
        onRegister={(evt) => onOpenRegisterForEvent(evt)}
      />
    </section>
  );
};
