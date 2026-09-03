import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Gamepad2,
  Trophy,
  Search,
  ArrowRight,
  Filter,
  Compass,
} from 'lucide-react';
import { EVENTS } from '@/data/events';
import { REGISTRATION_FORM_URL } from '@/constants';
import { EventItem } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { EventModal } from '@/components/events/EventModal';

export const EventsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);

  const technicalCount = EVENTS.filter((e) => e.category === 'Technical').length;
  const nonTechCount = EVENTS.filter((e) => e.category === 'Non-Technical').length;
  const specialCount = EVENTS.filter((e) => e.category === 'Special Event').length;

  const categories = [
    { name: 'All', label: `All Challenges (${EVENTS.length})`, count: EVENTS.length, icon: Sparkles },
    { name: 'Technical', label: `Grand Voyage (Technical)`, count: technicalCount, icon: Zap },
    { name: 'Non-Technical', label: `Crew Challenges (Non-Tech)`, count: nonTechCount, icon: Gamepad2 },
    { name: 'Special Event', label: `Grand Arena (Special)`, count: specialCount, icon: Trophy },
  ];

  const filteredEvents = EVENTS.filter((event) => {
    const matchesCategory =
      selectedCategory === 'All' || event.category === selectedCategory;

    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.eventId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleRegisterEvent = (_event?: EventItem) => {
    window.open(REGISTRATION_FORM_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#02050E] via-[#040814] to-[#0A1128] text-slate-100 selection:bg-[#E6CA65] selection:text-[#040814]">
      {/* Background Sea Chart Layer */}
      <div className="fixed inset-0 bg-voyage-chart opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6CA65]/10 border border-[#E6CA65]/35 text-[#FCE79C] text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-[#E6CA65]" />
            <span>National Level Symposium • 15 Grand Challenges</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-voyage font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight"
          >
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">Voyage Challenges</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed font-sans"
          >
            Choose from 15 exciting Grand Voyage, Crew, and Grand Arena challenges. Register for multiple events with a single pass!
          </motion.p>
        </div>

        {/* Filter Bar & Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#0A1128]/95 border border-[#E6CA65]/25 backdrop-blur-md wanted-card-border shadow-xl">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-voyage font-bold transition-all flex items-center gap-2 relative z-10 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E6CA65] to-[#FCE79C] text-[#040814] shadow-glow-gold'
                      : 'text-slate-300 hover:text-white hover:bg-[#0E1736]'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-[#040814]/40 text-[#040814] font-bold' : 'bg-[#040814] text-[#FCE79C]'
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
              placeholder="Search by challenge, ID (e.g. TE01)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-[#0A1128]/95 border border-[#E6CA65]/30 focus:border-[#E6CA65] focus:outline-none text-xs sm:text-sm text-white placeholder-slate-400 font-sans transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-[#0A1128]/60 rounded-3xl border border-[#E6CA65]/20 wanted-card-border">
            <Filter className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 font-mono text-sm">No challenges found matching "{searchQuery}".</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#E6CA65]/20 text-[#FCE79C] border border-[#E6CA65]/40 hover:bg-[#E6CA65]/30"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelectEvent={(evt) => setActiveModalEvent(evt)}
                onRegisterEvent={(evt) => handleRegisterEvent(evt)}
              />
            ))}
          </div>
        )}

        {/* Bottom Banner to Register */}
        <div className="mt-16 p-8 rounded-3xl bg-[#0A1128]/95 border-2 border-[#E6CA65]/35 text-center relative overflow-hidden wanted-card-border shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-voyage font-black text-white">
              Ready to Compete in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCE79C] via-[#E6CA65] to-[#00F2FE]">EvoXis'26</span>?
            </h3>
            <p className="text-sm text-slate-300 font-sans">
              Select multiple challenges across Grand Voyage, Crew, and Grand Arena categories in a single form.
            </p>
            <a
              href={REGISTRATION_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-button inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-voyage font-bold text-sm text-[#040814] bg-gradient-to-r from-[#E6CA65] via-[#FCE79C] to-[#00F2FE] shadow-glow-gold transition-all hover:scale-105 no-underline cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#040814]" />
              <span>Go to Registration Form</span>
              <ArrowRight className="w-4 h-4 text-[#040814]" />
            </a>
          </div>
        </div>
      </div>

      {/* Deep-Dive Event Modal */}
      <EventModal
        event={activeModalEvent}
        isOpen={Boolean(activeModalEvent)}
        onClose={() => setActiveModalEvent(null)}
        onRegister={(evt) => handleRegisterEvent(evt)}
      />
    </div>
  );
};

export default EventsPage;
