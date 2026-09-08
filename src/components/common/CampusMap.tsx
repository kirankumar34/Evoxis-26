import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Compass,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Clock,
  Footprints,
  Sparkles,
  CheckCircle2,
  Utensils,
  Award,
  Code2,
  ExternalLink,
  X,
  Layers,
  Info
} from 'lucide-react';
import { CAMPUS_BLOCKS, VenueCategory } from '@/data/map';

export default function CampusMap() {
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(6); // Default to Seminar Hall (user's red box)
  const [hoveredBlockId, setHoveredBlockId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<VenueCategory>('All');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'blueprint' | 'satellite' | 'both'>('blueprint');

  const categories: { label: string; value: VenueCategory; icon: React.ReactNode }[] = [
    { label: 'All Venues', value: 'All', icon: <Layers className="w-3.5 h-3.5" /> },
    { label: 'Technical', value: 'Technical', icon: <Code2 className="w-3.5 h-3.5" /> },
    { label: 'Ceremonies', value: 'Ceremony', icon: <Award className="w-3.5 h-3.5" /> },
    { label: 'Non-Technical', value: 'Non-Technical', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { label: 'Food & Amenities', value: 'Amenities', icon: <Utensils className="w-3.5 h-3.5" /> },
  ];

  // Filter blocks by category and search query
  const filteredBlocks = useMemo(() => {
    return CAMPUS_BLOCKS.filter((block) => {
      const matchesCategory =
        activeCategory === 'All' || block.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        block.name.toLowerCase().includes(q) ||
        block.shortName.toLowerCase().includes(q) ||
        block.description.toLowerCase().includes(q) ||
        block.events.some((ev) => ev.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const selectedBlock = useMemo(() => {
    return CAMPUS_BLOCKS.find((b) => b.id === selectedBlockId) || null;
  }, [selectedBlockId]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.0, Math.max(1.0, parseFloat((prev + delta).toFixed(1)))));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Technical':
        return 'bg-[#0077C8]/20 text-[#0077C8] border-[#0077C8]';
      case 'Ceremony':
        return 'bg-[#FFC928]/20 text-yellow-800 border-[#FFC928] dark:text-[#FFC928]';
      case 'Non-Technical':
        return 'bg-emerald-500/20 text-emerald-700 border-emerald-500 dark:text-emerald-400';
      case 'Amenities':
        return 'bg-orange-500/20 text-orange-700 border-orange-500 dark:text-orange-400';
      default:
        return 'bg-purple-500/20 text-purple-700 border-purple-500 dark:text-purple-400';
    }
  };

  const googleMapsDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Sriram+Engineering+College+Perumalpattu";

  return (
    <section
      id="campus-map"
      className="relative w-full py-16 px-4 md:px-8 border-t-4 border-black"
      style={{
        background: '#F9F6F0',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Decorative Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, #F9F6F0 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto z-10">

        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 mb-3 bg-black text-[#FFC928] border-2 border-black uppercase tracking-widest font-mono text-xs font-bold shadow-[3px_3px_0px_0px_#E2231A]"
          >
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Interactive Navigation Chart</span>
          </div>

          <h2
            className="text-3xl sm:text-5xl md:text-6xl text-black uppercase leading-tight tracking-tight mb-3"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            CAMPUS VENUE <span style={{ color: '#E2231A' }}>SPATIAL MAP</span>
          </h2>

          <p className="text-sm sm:text-base text-black/75 max-w-2xl mx-auto leading-relaxed">
            Satellite layout of Sriram Engineering College. Tap on any highlighted academic block,
            seminar hall, or arena to reveal active symposium events, facilities, and walking paths.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-black/70">
            <span className="px-2.5 py-1 bg-white border border-black shadow-[2px_2px_0px_#000]">
              📍 Sriram Engineering College, Perumalpattu
            </span>
            <span className="px-2.5 py-1 bg-white border border-black shadow-[2px_2px_0px_#000]">
              🧭 13.1248° N, 79.9724° E
            </span>
          </div>
        </div>

        {/* ── View Mode Switcher & Navigation Action ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black/10">
          <div className="inline-flex p-1 bg-black/10 border-2 border-black rounded-lg gap-1">
            <button
              onClick={() => setViewMode('blueprint')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all font-mono ${
                viewMode === 'blueprint'
                  ? 'bg-black text-[#FFC928] shadow-[2px_2px_0px_#000]'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Campus Aerial Map
            </button>
            <button
              onClick={() => setViewMode('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all font-mono ${
                viewMode === 'satellite'
                  ? 'bg-black text-[#FFC928] shadow-[2px_2px_0px_#000]'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Google Satellite
            </button>
            <button
              onClick={() => setViewMode('both')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all font-mono ${
                viewMode === 'both'
                  ? 'bg-black text-[#FFC928] shadow-[2px_2px_0px_#000]'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Split Dual View
            </button>
          </div>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#E2231A] text-white border-2 border-black text-xs font-black uppercase tracking-wider hover:bg-black transition-colors shadow-[3px_3px_0px_#000] font-mono"
          >
            <Navigation className="w-3.5 h-3.5" />
            Navigate via Google Maps
          </a>
        </div>

        {/* ── Filter Tabs & Search Bar ── */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 whitespace-nowrap transition-all uppercase font-mono ${
                  activeCategory === cat.value
                    ? 'bg-black text-[#FFC928] border-black shadow-[3px_3px_0px_#E2231A]'
                    : 'bg-white text-black/80 border-black/30 hover:border-black shadow-[2px_2px_0px_rgba(0,0,0,0.1)]'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50" />
            <input
              type="text"
              placeholder="Search event, block, or venue (e.g., Coding, Seminar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border-2 border-black text-xs font-mono placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#FFC928] shadow-[3px_3px_0px_#000]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Main Map Display Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Map Column */}
          <div
            className={`transition-all duration-300 ${
              viewMode === 'both' ? 'lg:col-span-8' : selectedBlock ? 'lg:col-span-7' : 'lg:col-span-12'
            }`}
          >
            {/* View Mode 1: Blueprint / Aerial Map */}
            {(viewMode === 'blueprint' || viewMode === 'both') && (
              <div
                className="relative w-full bg-[#111] border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden rounded-sm"
              >
                {/* Floating Map Controls */}
                <div className="absolute top-4 left-4 z-30 flex flex-col gap-1.5 bg-black/80 p-1.5 border-2 border-white/20 backdrop-blur-md rounded shadow-lg">
                  <button
                    onClick={() => handleZoom(0.2)}
                    title="Zoom In"
                    className="p-1.5 text-white hover:text-[#FFC928] hover:bg-white/10 rounded transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleZoom(-0.2)}
                    title="Zoom Out"
                    className="p-1.5 text-white hover:text-[#FFC928] hover:bg-white/10 rounded transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={resetZoom}
                    title="Reset View"
                    className="p-1.5 text-white hover:text-[#FFC928] hover:bg-white/10 rounded transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Compass Rose Indicator */}
                <div className="absolute top-4 right-4 z-30 flex flex-col items-center justify-center w-11 h-11 bg-black/85 border-2 border-white rounded-full shadow-2xl backdrop-blur-sm pointer-events-none">
                  <div className="relative flex flex-col items-center">
                    <span className="text-[10px] font-black text-[#E2231A] leading-none mb-0.5">N</span>
                    <Compass className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Status Bar */}
                <div className="absolute bottom-3 left-3 z-30 bg-black/80 px-2.5 py-1 border border-white/20 backdrop-blur-sm rounded text-[11px] text-white/80 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Interactive Campus Satellite</span>
                  <span className="text-white/40">|</span>
                  <span className="text-[#FFC928]">Zoom: {Math.round(zoomLevel * 100)}%</span>
                </div>

                {/* Map Viewport */}
                <div className="w-full overflow-hidden">
                  <div
                    className="relative aspect-[457/610] w-full bg-cover bg-center transition-transform duration-300 select-none"
                    style={{
                      backgroundImage: "url('/campus-map.png')",
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                    }}
                  >
                    {/* Darkened subtle tint for high contrast on glowing borders */}
                    <div className="absolute inset-0 bg-black/15 pointer-events-none" />

                    {/* Campus Building Hotspots */}
                    {CAMPUS_BLOCKS.map((block) => {
                      const isSelected = selectedBlockId === block.id;
                      const isHovered = hoveredBlockId === block.id;
                      const isMatched = filteredBlocks.some((b) => b.id === block.id);
                      const isHighlighted = block.color === '#EF4444'; // Red block

                      return (
                        <div
                          key={block.id}
                          onClick={() => setSelectedBlockId(block.id)}
                          onMouseEnter={() => setHoveredBlockId(block.id)}
                          onMouseLeave={() => setHoveredBlockId(null)}
                          className={`
                            group
                            absolute
                            ${block.className}
                            cursor-pointer
                            transition-all
                            duration-200
                            ${!isMatched && (searchQuery || activeCategory !== 'All') ? 'opacity-25' : 'opacity-100'}
                          `}
                          style={{
                            zIndex: isSelected ? 25 : isHovered ? 20 : 10,
                          }}
                        >
                          {/* Hotspot Box Outline with Glowing Border */}
                          <div
                            className={`
                              absolute
                              inset-0
                              border-[3px]
                              transition-all
                              duration-300
                              ${
                                isSelected
                                  ? 'border-[#FFC928] bg-[#FFC928]/25 shadow-[0_0_20px_#FFC928] scale-[1.04]'
                                  : isHovered
                                  ? 'border-white bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-[1.02]'
                                  : isHighlighted
                                  ? 'border-[#EF4444] bg-[#EF4444]/15 shadow-[0_0_10px_#EF4444]'
                                  : 'border-white/90 bg-black/10 shadow-[0_0_0_1px_rgba(0,0,0,0.6)]'
                              }
                            `}
                          />

                          {/* Pulsing Pin Marker */}
                          <div className="absolute top-1 left-1 flex items-center gap-1 z-20 pointer-events-none">
                            <div
                              className="relative flex items-center justify-center w-5 h-5 rounded-full border border-black text-[10px] font-black text-black shadow-md font-mono"
                              style={{
                                backgroundColor: isSelected ? '#FFC928' : isHighlighted ? '#EF4444' : block.color || '#FFF',
                                color: isHighlighted ? '#FFF' : '#000',
                              }}
                            >
                              {block.id}
                              {(isSelected || isHighlighted) && (
                                <span
                                  className="absolute -inset-1 rounded-full animate-ping opacity-75"
                                  style={{
                                    backgroundColor: isSelected ? '#FFC928' : '#EF4444',
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          {/* Hover / Active Badge */}
                          <div
                            className={`
                              absolute
                              left-1/2
                              top-1/2
                              z-20
                              -translate-x-1/2
                              -translate-y-1/2
                              whitespace-nowrap
                              px-2
                              py-0.5
                              rounded
                              border
                              border-white/40
                              text-[10px]
                              md:text-xs
                              font-bold
                              shadow-lg
                              pointer-events-none
                              transition-all
                              duration-200
                              ${
                                isSelected
                                  ? 'bg-black text-[#FFC928] border-[#FFC928] opacity-100 scale-105'
                                  : isHovered
                                  ? 'bg-black/90 text-white opacity-100 scale-100'
                                  : 'bg-black/75 text-white/90 opacity-0 group-hover:opacity-100'
                              }
                            `}
                          >
                            {block.shortName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* View Mode 2: Live Google Satellite Map */}
            {viewMode === 'satellite' && (
              <div className="relative w-full aspect-[457/450] sm:aspect-[457/380] bg-white border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
                <iframe
                  title="Sriram Engineering College Satellite Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.5925429792014!2d79.9723947!3d13.1258169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1248169!3m3!1m2!1s0x3a528659160bb47b%3A0x6b777a83d4204c32!2sSriram%20Engineering%20College!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>

          {/* Details Sidebar / Spotlight Card */}
          <div
            className={`transition-all duration-300 ${
              viewMode === 'both' ? 'lg:col-span-4' : 'lg:col-span-5'
            }`}
          >
            <AnimatePresence mode="wait">
              {selectedBlock ? (
                <motion.div
                  key={selectedBlock.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] p-5 sm:p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b-2 border-black/10">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border rounded font-mono ${getCategoryBadgeClass(
                            selectedBlock.category
                          )}`}
                        >
                          {selectedBlock.category}
                        </span>
                        <span className="text-xs font-mono text-black/60 flex items-center gap-1">
                          <Footprints className="w-3 h-3 text-[#E2231A]" />
                          {selectedBlock.walkFromGate}
                        </span>
                      </div>
                      <h3
                        className="text-xl sm:text-2xl font-black text-black leading-tight"
                        style={{ fontFamily: "'Anton', sans-serif" }}
                      >
                        {selectedBlock.name}
                      </h3>
                    </div>

                    <div
                      className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center font-black text-sm shrink-0 shadow-[2px_2px_0px_#000] font-mono"
                      style={{
                        backgroundColor: selectedBlock.color || '#FFC928',
                        color: selectedBlock.color === '#EF4444' ? '#FFF' : '#000',
                      }}
                    >
                      {selectedBlock.id}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs sm:text-sm text-black/75 leading-relaxed">
                    {selectedBlock.description}
                  </p>

                  {/* Events Section */}
                  <div className="mt-5">
                    <h4 className="text-xs font-black uppercase text-black font-mono tracking-wider flex items-center gap-1.5 mb-2.5">
                      <Clock className="w-3.5 h-3.5 text-[#0077C8]" />
                      Scheduled Symposium Events &amp; Activities:
                    </h4>
                    <div className="space-y-2">
                      {selectedBlock.events.map((event, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2.5 bg-black/[0.03] border border-black/15 rounded text-xs text-black font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                          <span>{event}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mt-5">
                    <h4 className="text-xs font-black uppercase text-black font-mono tracking-wider flex items-center gap-1.5 mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FFC928]" />
                      Venue Amenities &amp; Facilities:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBlock.amenities.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white border border-black/30 rounded text-[11px] font-mono text-black/80 shadow-[1px_1px_0px_rgba(0,0,0,0.1)]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t-2 border-black/10 flex flex-col sm:flex-row items-stretch gap-2.5">
                    <a
                      href={googleMapsDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#0077C8] text-white border-2 border-black text-xs font-black uppercase tracking-wider hover:bg-black transition-colors shadow-[3px_3px_0px_#000] font-mono"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Get Live Directions
                    </a>
                    <button
                      onClick={() => setSelectedBlockId(null)}
                      className="flex items-center justify-center gap-1 py-2.5 px-3 bg-white hover:bg-black/5 text-black border-2 border-black text-xs font-bold uppercase transition-colors shadow-[2px_2px_0px_#000] font-mono"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white border-4 border-black border-dashed p-8 text-center text-black/60 shadow-[6px_6px_0px_rgba(0,0,0,0.1)]">
                  <Info className="w-8 h-8 mx-auto mb-2 text-[#0077C8]" />
                  <p className="font-bold text-sm text-black">Tap Any Building On The Map</p>
                  <p className="text-xs mt-1">
                    Select any highlighted block or building above to inspect symposium events, lab
                    activities, and walking directions.
                  </p>
                </div>
              )}
            </AnimatePresence>

            {/* Quick Wayfinding Tips */}
            <div className="mt-4 bg-[#FFC928]/15 border-2 border-black p-3.5 shadow-[3px_3px_0px_#000]">
              <p className="text-xs font-bold text-black flex items-center gap-1.5 mb-1 font-mono">
                <Footprints className="w-3.5 h-3.5 text-[#E2231A]" />
                CAMPUS WAYFINDING GUIDE
              </p>
              <p className="text-[11px] text-black/75 leading-relaxed">
                Start at <strong>Main Gate (Block 9)</strong> for Registration and Kit collection.
                The <strong>Main Auditorium (Block 1)</strong> is just 1 minute ahead. Keynote talks
                and special events take place in the <strong>Seminar Hall (Block 6)</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* ── Quick Venue Directory Cards ── */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              ALL CAMPUS VENUES &amp; BLOCKS ({filteredBlocks.length})
            </h3>
            <span className="text-xs font-mono text-black/60">
              Click any block to spotlight on map
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredBlocks.map((block) => {
              const isSelected = selectedBlockId === block.id;

              return (
                <div
                  key={block.id}
                  onClick={() => {
                    setSelectedBlockId(block.id);
                    // Smooth scroll towards the map container on mobile
                    const mapEl = document.getElementById('campus-map');
                    if (mapEl && window.innerWidth < 1024) {
                      mapEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`
                    p-3.5
                    border-2
                    border-black
                    cursor-pointer
                    transition-all
                    duration-150
                    flex
                    flex-col
                    justify-between
                    ${
                      isSelected
                        ? 'bg-[#FFC928]/25 border-black shadow-[4px_4px_0px_#000] scale-[1.01]'
                        : 'bg-white hover:bg-black/[0.02] shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:-translate-y-0.5'
                    }
                  `}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded font-mono ${getCategoryBadgeClass(
                          block.category
                        )}`}
                      >
                        {block.category}
                      </span>
                      <span className="text-[10px] font-mono text-black/60 flex items-center gap-1">
                        <Footprints className="w-2.5 h-2.5 text-[#E2231A]" />
                        {block.walkFromGate}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-black leading-tight">
                      {block.id}. {block.name}
                    </h4>

                    <p className="text-[11px] text-black/70 mt-1 line-clamp-2 leading-snug">
                      {block.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-black/60 font-semibold truncate max-w-[180px]">
                      • {block.events[0]}
                    </span>
                    <span className="text-[#0077C8] font-bold shrink-0">Select →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}