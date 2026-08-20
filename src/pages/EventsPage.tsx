import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Award,
  Zap,
  Gamepad2,
  Trophy,
  Search,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { EVENTS } from '@/data/events';
import { EventItem } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { EventModal } from '@/components/events/EventModal';

export const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);

  const categories = [
    { name: 'All', label: 'All 16 Events', count: 16, icon: Sparkles },
    { name: 'Technical', label: 'Technical', count: 6, icon: Zap },
    { name: 'Non-Technical', label: 'Non-Technical', count: 6, icon: Gamepad2 },
    { name: 'Special', label: 'Special Events', count: 4, icon: Trophy },
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

  const handleRegisterEvent = (event: EventItem) => {
    navigate(`/register?event=${event.eventId}`);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black">
      {/* Background Ambience */}
      <div className="fixed top-1/4 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-4"
          >
            <Award className="w-3.5 h-3.5" />
            <span>National Level Symposium • 16 Competitions</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight"
          >
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">Symposium Events</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed"
          >
            Choose from 16 exciting technical, non-technical, and special sports events. Register for multiple events with a single pass!
          </motion.p>
        </div>

        {/* Filter Bar & Search Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-display font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-glow-cyan'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-black/30 text-black' : 'bg-slate-800 text-slate-400'
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID (e.g. TE01)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white placeholder-slate-500 font-sans transition-colors"
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
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800">
            <Filter className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 font-mono text-sm">No events found matching "{searchQuery}".</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30"
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
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-purple-950/40 border border-cyan-500/20 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
              Ready to Compete in <span className="text-cyan-400">EvoXis'26</span>?
            </h3>
            <p className="text-sm text-slate-400">
              Select up to 5 events across Technical, Non-Technical, and Special categories in a single form.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 hover:from-cyan-300 hover:to-sky-300 shadow-glow-cyan transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Go to Registration Form</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
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
