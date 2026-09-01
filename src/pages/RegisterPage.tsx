import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Users,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  X,
  Flame,
  Zap,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { EVENTS } from '@/data/events';
import { REGISTRATION_FORM_URL } from '@/constants';
import { EventId, EventCategory, RegistrationFormData, TeamMember } from '@/types';
import { api } from '@/services/api';
import mangaPanelImg from '@/assets/MangaPanel.jpg';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedEvent = searchParams.get('event');

  // Automatically forward users to the official Google Form
  useEffect(() => {
    window.location.href = REGISTRATION_FORM_URL;
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
  const [selectedEventIds, setSelectedEventIds] = useState<EventId[]>([]);

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    department: '',
    yearOfStudy: '3rd Year',
    gender: 'Male',
    selectedEventIds: [],
    isTeam: false,
    teamName: '',
    teamMembers: [],
    referralSource: '',
    referralSourceOther: '',
    agreedToRules: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync pre-selected event from URL parameter
  useEffect(() => {
    if (preselectedEvent) {
      const match = EVENTS.find(
        (e) => e.id === preselectedEvent || e.eventId === preselectedEvent.toUpperCase()
      );
      if (match && !selectedEventIds.includes(match.eventId)) {
        setSelectedEventIds([match.eventId]);
      }
    }
  }, [preselectedEvent]);

  // Keep formData.selectedEventIds in sync and update isTeam status
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      selectedEventIds,
      isTeam: hasTeamEvents(selectedEventIds),
    }));
  }, [selectedEventIds]);

  const hasTeamEvents = (eventIds: EventId[]): boolean => {
    return eventIds.some((id) => {
      const evt = EVENTS.find((e) => e.eventId === id);
      return evt ? evt.teamSize.max > 1 : false;
    });
  };

  const toggleEventSelection = (eventId: EventId) => {
    setSelectedEventIds((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });

    if (errors.events) {
      setErrors((prev) => ({ ...prev, events: '' }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTeamMember = () => {
    if ((formData.teamMembers || []).length < 5) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [
          ...(prev.teamMembers || []),
          {
            name: '',
            email: '',
            phone: '',
            college: prev.collegeName || '',
            department: prev.department || '',
            year: prev.yearOfStudy || '3rd Year',
            gender: 'Male',
            role: 'TEAM_MEMBER',
          },
        ],
      }));
    }
  };

  const handleRemoveTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: (prev.teamMembers || []).filter((_, i) => i !== index),
    }));
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    setFormData((prev) => {
      const updated = [...(prev.teamMembers || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, teamMembers: updated };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile Number is required.';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit mobile number.';
    }

    if (!formData.collegeName.trim()) newErrors.collegeName = 'College/Institution Name is required.';
    if (!formData.department.trim()) newErrors.department = 'Department is required.';

    if (selectedEventIds.length === 0) {
      newErrors.events = 'Please select at least one event challenge.';
    }

    if (formData.isTeam && !formData.teamName?.trim()) {
      newErrors.teamName = 'Crew / Team Name is required for team challenges.';
    }

    if (!formData.referralSource || formData.referralSource.trim() === '') {
      newErrors.referralSource = 'Please tell us how you heard about EvoXis 26.';
    } else if (
      formData.referralSource === 'Other' &&
      (!formData.referralSourceOther || !formData.referralSourceOther.trim())
    ) {
      newErrors.referralSourceOther = 'Please specify how you heard about EvoXis 26.';
    }

    if (!formData.agreedToRules) {
      newErrors.agreedToRules = 'You must agree to the symposium code of conduct.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      const firstError =
        document.querySelector('.error-message') || document.querySelector('.error-text');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await api.registerParticipant(formData);

      if (result.success && result.data) {
        navigate('/registration-success', {
          state: {
            registrationId: result.data.registrationId,
            qrToken: result.data.qrToken,
            participantName: result.data.participantName,
            email: result.data.email,
            mobileNumber: result.data.mobileNumber,
            college: result.data.college,
            department: result.data.department,
            selectedEvents: result.data.selectedEvents,
            totalEvents: result.data.totalEvents,
            referralSource: (result.data as any).referralSource || formData.referralSource,
            referralSourceOther:
              (result.data as any).referralSourceOther || formData.referralSourceOther,
            isDuplicate: result.isDuplicate,
            teamName: result.data.teamName,
            teamMembers: result.data.teamMembers,
            participants: result.data.participants,
          },
        });
      } else {
        setServerError(result.message || 'Registration could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to connect to the registration server. Please try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents =
    selectedCategory === 'All'
      ? EVENTS
      : EVENTS.filter((e) => e.category === selectedCategory);

  const techCount = EVENTS.filter((e) => e.category === 'Technical').length;
  const nonTechCount = EVENTS.filter((e) => e.category === 'Non-Technical').length;
  const specialCount = EVENTS.filter((e) => e.category === 'Special Event').length;

  return (
    <div
      className="min-h-screen pt-24 pb-28 px-3 sm:px-6 lg:px-8 relative select-none bg-[#090A0F] text-slate-100 selection:bg-[#FFC928] selection:text-black overflow-hidden"
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Manga Screentone & Speedlines Texture Overlay (Dark Ink Tone) ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.14]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #FFF 0px,
            #FFF 1px,
            transparent 1px,
            transparent 12px
          )`,
        }}
      />

      {/* Decorative Shonen Ambient Energy Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#E2231A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-[#FFC928]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* ── Top Manga Issue Ribbon Header ────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-2 border-[#FFC928] bg-[#0E1017] px-4 py-2 text-xs uppercase text-[#FFC928] shadow-[4px_4px_0px_0px_#E2231A]">
          <div className="flex items-center gap-2 font-black" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="bg-[#E2231A] text-white px-2.5 py-0.5 text-[11px] font-black tracking-normal border border-white shadow-[2px_2px_0px_0px_#000]">
              SHONEN EVOXIS
            </span>
            <span className="hidden sm:inline text-white">CH. 2026: THE GRAND AWAKENING</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <span className="text-[#FFC928]">⚡ 100% FREE ENTRY (₹0)</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-white">16 BATTLE ARENAS</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="text-[#22c55e]">STATUS: OPEN</span>
          </div>
        </div>

        {/* ── MANGA HERO COVER / SPLASH PANEL (DARK INK EDITION) ───────── */}
        <div className="mb-10 p-6 sm:p-8 bg-[#12141D] border-3 border-[#FFC928] text-white shadow-[6px_6px_0px_0px_#E2231A] relative overflow-hidden">
          {/* Manga Corner Stamp */}
          <div
            className="absolute top-0 right-0 bg-[#FFC928] text-black text-[11px] font-black px-4 py-1.5 border-b-2 border-l-2 border-black uppercase tracking-wider shadow-sm"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ★ SPECIAL REGISTRATION ISSUE ★
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-3">
            {/* Left Column: Manga Typography & Dialogue Bubble */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 bg-[#E2231A] text-white text-xs font-black tracking-widest uppercase border border-white shadow-[3px_3px_0px_0px_#000]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ドン!! DON!!
                </span>
                <span
                  className="text-xs font-black text-[#FFC928] uppercase tracking-wider"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  GRAND VOYAGE ENLISTMENT
                </span>
              </div>

              <div>
                <h1
                  className="text-4xl sm:text-6xl uppercase font-black text-white leading-none tracking-tight drop-shadow-[2px_2px_0px_#E2231A]"
                  style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.03em' }}
                >
                  AWAKEN FOR <br />
                  <span className="text-[#FFC928] drop-shadow-[2px_2px_0px_#000]">
                    EVOXIS '26
                  </span>
                </h1>
                <p
                  className="text-slate-300 text-xs sm:text-sm font-bold uppercase mt-1.5 tracking-widest"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  指名手配 // GEAR 5 REGISTRATION PORTAL
                </p>
              </div>

              {/* Manga Dialogue Speech Bubble (Dark Comic Style) */}
              <div className="relative bg-[#090A10] text-slate-100 p-4 border-2 border-[#FFC928] shadow-[4px_4px_0px_0px_#000] mt-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">👒</span>
                  <span
                    className="font-black text-xs uppercase tracking-wider text-[#FFC928]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Captain Luffy (Gear 5):
                  </span>
                </div>
                <p className="font-medium text-slate-200 text-xs sm:text-sm leading-snug italic">
                  &ldquo;A-HA-HA-HA-HA! The battle reaches its finale! Select your challenges across the 3 realms, enlist your crew, and let's finish this!!&rdquo;
                </p>
                <div
                  className="mt-2 text-[11px] font-black text-slate-300 flex items-center gap-2 border-t border-slate-800 pt-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <span className="text-[#E2231A]">⚡ KA-BOOM!!</span>
                  <span>Instant HMAC QR Voyage Pass generated upon confirmation.</span>
                </div>
              </div>

              {/* Info Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <div className="px-3 py-1.5 bg-[#090A0F] text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <Flame className="w-3.5 h-3.5 text-[#E2231A]" />
                  <span>16 Arena Challenges</span>
                </div>
                <div className="px-3 py-1.5 bg-[#090A0F] text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Solo & Crew Formats</span>
                </div>
                <div className="px-3 py-1.5 bg-[#090A0F] text-[#22c55e] border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>₹0 Registration Fee</span>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Framed Manga Panel */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group">
                {/* Sound effect comic badge */}
                <div
                  className="absolute -top-4 -right-3 z-20 bg-[#E2231A] text-white text-xs font-black px-3 py-1 border-2 border-white shadow-[4px_4px_0px_0px_#000] transform rotate-6"
                  style={{ fontFamily: "'Anton', sans-serif" }}
                >
                  KA-BOOM!! 💥
                </div>

                <div
                  className="absolute -bottom-3 -left-3 z-20 bg-[#FFC928] text-black text-[11px] font-black px-3 py-1 border-2 border-black shadow-[3px_3px_0px_0px_#000] transform -rotate-3"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  CH. 1044 / GEAR 5
                </div>

                {/* Framed Manga Art */}
                <div className="w-72 sm:w-80 overflow-hidden border-3 border-[#FFC928] bg-black shadow-[6px_6px_0px_0px_#000] transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="relative aspect-[3/4] bg-black">
                    <img
                      src={mangaPanelImg}
                      alt="One Piece Gear 5 Manga Panel"
                      className="w-full h-full object-cover object-top filter contrast-125 brightness-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-3 right-3 text-center">
                      <p
                        className="text-xs font-black text-[#FFC928] uppercase tracking-wider drop-shadow-md"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        &quot;NOW, LET'S FINISH THIS!!&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Server Error Comic Alert ─────────────────────────────────── */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-[#18090C] border-2 border-[#E2231A] text-red-200 shadow-[4px_4px_0px_0px_#E2231A] flex items-center gap-3"
          >
            <ShieldAlert className="w-7 h-7 flex-shrink-0 text-[#E2231A]" />
            <div>
              <span
                className="font-black text-[#E2231A] block text-xs uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [ TRANSMISSION ERROR // 通信エラー ]
              </span>
              <p className="text-sm font-bold">{serverError}</p>
            </div>
          </motion.div>
        )}

        {/* ── REGISTRATION FORM WITH DARK MANGA PANELS ─────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ============================================================ */}
          {/* PANEL 01: BATTLE CHALLENGES (第1コマ // BAAAM!! ドォン)     */}
          {/* ============================================================ */}
          <div className="bg-[#12141D] border-3 border-slate-700 p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] relative">
            {/* Panel Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-700">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-2.5 py-0.5 bg-[#FFC928] text-black text-xs font-black uppercase border border-black"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    PANEL 01 // 第1コマ
                  </span>
                  <span
                    className="text-xs font-black text-[#E2231A]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    [ BAAAM!! ドォン ]
                  </span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl text-white uppercase leading-tight font-black"
                  style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.03em' }}
                >
                  CHOOSE YOUR BATTLE CHALLENGES (16 EVENTS) *
                </h2>
                <p
                  className="text-xs text-slate-400 font-bold mt-0.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Select your competitions across Grand Line, Crew & Arena tracks. You can select multiple events!
                </p>
              </div>

              {/* Category Filter Comic Tabs & Counter */}
              <div className="flex items-center gap-2 self-start flex-wrap">
                <span
                  className="px-3 py-1.5 text-xs font-black bg-[#FFC928] text-black border border-black shadow-[2px_2px_0px_0px_#000]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {selectedEventIds.length} Selected
                </span>
                <div className="flex items-center gap-1 p-1 bg-[#090A0F] border border-slate-700 shadow-[2px_2px_0px_0px_#000]">
                  {(
                    [
                      { id: 'All', label: 'All (16)' },
                      { id: 'Technical', label: `⚔️ Tech (${techCount})` },
                      { id: 'Non-Technical', label: `🎭 Non-Tech (${nonTechCount})` },
                      { id: 'Special Event', label: `🏆 Special (${specialCount})` },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-3 py-1.5 text-xs font-extrabold transition-all border cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-[#E2231A] text-white border-white shadow-[2px_2px_0px_0px_#000]'
                          : 'bg-[#12141D] text-slate-300 border-transparent hover:text-white hover:border-slate-600'
                      }`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Events Chips Bar */}
            {selectedEventIds.length > 0 && (
              <div className="mb-6 p-4 bg-[#090A0F] border-2 border-[#FFC928]/60 flex flex-wrap items-center gap-2 shadow-inner">
                <span
                  className="text-xs font-black uppercase tracking-wider mr-1 text-[#FFC928] flex items-center gap-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <span>⚔️ Selected ({selectedEventIds.length}):</span>
                </span>
                {selectedEventIds.map((eid) => {
                  const found = EVENTS.find((e) => e.eventId === eid);
                  return (
                    <span
                      key={eid}
                      onClick={() => toggleEventSelection(eid)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#161926] text-slate-100 border border-[#FFC928]/80 cursor-pointer hover:bg-[#E2231A] hover:text-white hover:border-[#E2231A] transition-all shadow-[2px_2px_0px_0px_#000]"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      title="Click to remove from roster"
                    >
                      <span className="font-black text-[#FFC928]">{eid}</span>
                      <span className="font-medium truncate max-w-[150px] text-slate-200">
                        ({found ? found.title : eid})
                      </span>
                      <X className="w-3.5 h-3.5 ml-0.5 text-red-400" />
                    </span>
                  );
                })}
              </div>
            )}

            {errors.events && (
              <p
                className="error-message error-text text-red-400 text-xs font-black mb-4 flex items-center gap-1.5 p-3 bg-red-950/40 border border-red-500/50"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <AlertCircle className="w-4 h-4 text-red-400" /> {errors.events}
              </p>
            )}

            {/* Event Grid in Dark Manga Clash Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((evt) => {
                const isSelected = selectedEventIds.includes(evt.eventId);
                return (
                  <div
                    key={evt.eventId}
                    onClick={() => toggleEventSelection(evt.eventId)}
                    className={`cursor-pointer relative p-5 transition-all flex flex-col justify-between border-2 ${
                      isSelected
                        ? 'bg-[#181C2B] border-[#FFC928] shadow-[4px_4px_0px_0px_#E2231A] -translate-y-0.5'
                        : 'bg-[#0B0C12] border-slate-800 hover:border-slate-600 hover:bg-[#10121B] shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="px-2 py-0.5 text-[10px] font-black bg-[#FFC928] text-black border border-black"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {evt.eventId}
                          </span>
                          <span
                            className="text-[10px] font-black text-slate-400 uppercase tracking-wider"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {evt.category}
                          </span>
                        </div>

                        {/* Checkbox Stamp */}
                        <div
                          className={`w-6 h-6 border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#E2231A] border-white text-white shadow-[2px_2px_0px_0px_#000]'
                              : 'bg-[#12141D] border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-lg uppercase font-black text-white mb-1.5 leading-snug"
                        style={{ fontFamily: "'Anton', sans-serif" }}
                      >
                        {evt.title}
                      </h3>

                      {/* Tagline / Short description */}
                      <p className="text-xs text-slate-300 line-clamp-2 mb-4 font-normal leading-relaxed">
                        {evt.shortDescription}
                      </p>
                    </div>

                    {/* Card Footer Info */}
                    <div
                      className="flex items-center justify-between text-[11px] text-slate-300 font-bold pt-3 border-t border-slate-800"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      <span className="flex items-center gap-1 text-[#38BDF8]">
                        <Users className="w-3.5 h-3.5" />
                        {evt.teamSize.description}
                      </span>
                      <span className="text-[#FFC928]">
                        {evt.schedule.timeSlot.split(' - ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Count Indicator Footer */}
            <div className="mt-6 p-4 bg-[#090A0F] border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner">
              <span
                className="text-xs font-bold text-slate-300"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Registered Challenges:{' '}
                <strong className="text-[#FFC928] font-black text-sm">
                  {selectedEventIds.length}
                </strong>{' '}
                / 16 Challenges
              </span>
              <span
                className="text-xs font-black uppercase text-emerald-400 bg-emerald-950/50 px-3 py-1 border border-emerald-500/40"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ★ Free Entry Pass: ₹0 (No Fee) ★
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* PANEL 02: CAPTAIN & CREW MANIFEST (第2コマ // DON!! ドン!!) */}
          {/* ============================================================ */}
          <div className="bg-[#12141D] border-3 border-slate-700 p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] relative">
            {/* Panel Header */}
            <div className="mb-6 pb-4 border-b-2 border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2.5 py-0.5 bg-[#FFC928] text-black text-xs font-black uppercase border border-black"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  PANEL 02 // 第2コマ
                </span>
                <span
                  className="text-xs font-black text-[#E2231A]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  [ DON!! ドン!! ]
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl text-white uppercase leading-tight font-black"
                style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.03em' }}
              >
                CAPTAIN / PARTICIPANT MANIFEST DETAILS *
              </h2>
              <p
                className="text-xs text-slate-400 font-bold mt-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Fill in your official identification credentials for HMAC QR Pass generation & certificate issuance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label
                  className="block text-xs font-black text-[#FFC928] uppercase tracking-wider mb-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Full Name (As on College ID) *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Monkey D. Luffy / Priya Raman"
                  className="w-full px-4 py-3 bg-[#090A0F] border-2 border-slate-700 text-white placeholder-slate-600 font-bold focus:outline-none focus:border-[#FFC928] text-sm shadow-inner"
                />
                {errors.fullName && (
                  <p className="error-text text-red-400 text-xs font-bold mt-1.5 flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label
                  className="block text-xs font-black text-[#FFC928] uppercase tracking-wider mb-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Email Address (For Voyage Pass) *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. priya.raman@gmail.com"
                  className="w-full px-4 py-3 bg-[#090A0F] border-2 border-slate-700 text-white placeholder-slate-600 font-bold focus:outline-none focus:border-[#FFC928] text-sm shadow-inner"
                />
                {errors.email && (
                  <p className="error-text text-red-400 text-xs font-bold mt-1.5 flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label
                  className="block text-xs font-black text-[#FFC928] uppercase tracking-wider mb-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  WhatsApp / Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  maxLength={10}
                  className="w-full px-4 py-3 bg-[#090A0F] border-2 border-slate-700 text-white placeholder-slate-600 font-bold focus:outline-none focus:border-[#FFC928] text-sm shadow-inner"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
                {errors.phone && (
                  <p className="error-text text-red-400 text-xs font-bold mt-1.5 flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* College Name */}
              <div>
                <label
                  className="block text-xs font-black text-[#FFC928] uppercase tracking-wider mb-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  College / Institution Name *
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  placeholder="e.g. Sriram Engineering College"
                  className="w-full px-4 py-3 bg-[#090A0F] border-2 border-slate-700 text-white placeholder-slate-600 font-bold focus:outline-none focus:border-[#FFC928] text-sm shadow-inner"
                />
                {errors.collegeName && (
                  <p className="error-text text-red-400 text-xs font-bold mt-1.5 flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.collegeName}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label
                  className="block text-xs font-black text-[#FFC928] uppercase tracking-wider mb-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Department / Branch *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Science & Business Systems (CSBS)"
                  className="w-full px-4 py-3 bg-[#090A0F] border-2 border-slate-700 text-white placeholder-slate-600 font-bold focus:outline-none focus:border-[#FFC928] text-sm shadow-inner"
                />
                {errors.department && (
                  <p className="error-text text-red-400 text-xs font-bold mt-1.5 flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.department}
                  </p>
                )}
              </div>

              {/* Year & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-black text-[#FFC928] uppercase tracking-wider mb-1.5"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Year of Study
                  </label>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#090A0F] border-2 border-slate-700 text-white font-bold focus:outline-none focus:border-[#FFC928] text-sm shadow-inner"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-black text-[#FFC928] uppercase tracking-wider mb-1.5"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#090A0F] border-2 border-slate-700 text-white font-bold focus:outline-none focus:border-[#FFC928] text-sm shadow-inner"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TEAM SECTION (Shown if any selected event is team-based) */}
            {formData.isTeam && (
              <div className="mt-8 pt-6 border-t-2 border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3
                      className="text-xl text-white font-black uppercase flex items-center gap-2"
                      style={{ fontFamily: "'Anton', sans-serif" }}
                    >
                      <Users className="w-5 h-5 text-[#E2231A]" /> CREW MANIFEST & ROSTER (海賊団)
                    </h3>
                    <p
                      className="text-xs text-slate-400 font-bold mt-0.5"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      You selected team challenges! Specify your crew name and add your co-members.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTeamMember}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFC928] text-black text-xs font-black hover:bg-white transition-all border border-black shadow-[2px_2px_0px_0px_#000] self-start cursor-pointer"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add Crew Member
                  </button>
                </div>

                <div className="mb-5">
                  <label
                    className="block text-xs font-black text-[#FFC928] uppercase tracking-wider mb-1.5"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Crew / Team Name *
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    placeholder="e.g. Strawhat Voyagers / Cyber Pirates"
                    className="w-full px-4 py-3 bg-[#090A0F] border-2 border-slate-700 text-white placeholder-slate-600 font-bold focus:outline-none focus:border-[#FFC928] text-sm shadow-inner"
                  />
                  {errors.teamName && (
                    <p className="error-text text-red-400 text-xs font-bold mt-1.5 flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.teamName}
                    </p>
                  )}
                </div>

                {/* Team Members List */}
                <div className="space-y-4">
                  {(formData.teamMembers || []).map((member, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-[#090A0F] border-2 border-slate-700 space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span
                          className="text-xs font-black text-white flex items-center gap-1.5"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <span className="bg-[#FFC928] text-black px-2 py-0.5 border border-black">
                            ★ CREW MEMBER #{idx + 2}
                          </span>
                          <span className="text-slate-400 font-normal">
                            ({member.name || 'Unassigned'})
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(idx)}
                          className="inline-flex items-center gap-1 text-xs text-red-300 px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/50 transition-colors font-bold shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-black text-slate-300 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            Full Name *
                          </label>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={member.name}
                            onChange={(e) => handleTeamMemberChange(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-[#12141D] border border-slate-700 text-xs text-white font-bold focus:border-[#FFC928] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-300 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            Email Address *
                          </label>
                          <input
                            type="email"
                            placeholder="Email"
                            value={member.email}
                            onChange={(e) => handleTeamMemberChange(idx, 'email', e.target.value)}
                            className="w-full px-3 py-2 bg-[#12141D] border border-slate-700 text-xs text-white font-bold focus:border-[#FFC928] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-300 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            placeholder="10-digit mobile"
                            maxLength={10}
                            value={member.phone}
                            onChange={(e) => handleTeamMemberChange(idx, 'phone', e.target.value)}
                            className="w-full px-3 py-2 bg-[#12141D] border border-slate-700 text-xs text-white font-bold focus:border-[#FFC928] focus:outline-none"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-black text-slate-300 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            College / Institution
                          </label>
                          <input
                            type="text"
                            placeholder={formData.collegeName || 'College Name'}
                            value={member.college || ''}
                            onChange={(e) =>
                              handleTeamMemberChange(idx, 'college', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#12141D] border border-slate-700 text-xs text-white font-bold focus:border-[#FFC928] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-300 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            Department
                          </label>
                          <input
                            type="text"
                            placeholder={formData.department || 'Department'}
                            value={member.department}
                            onChange={(e) =>
                              handleTeamMemberChange(idx, 'department', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#12141D] border border-slate-700 text-xs text-white font-bold focus:border-[#FFC928] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-300 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            Year of Study
                          </label>
                          <select
                            value={member.year || formData.yearOfStudy || '3rd Year'}
                            onChange={(e) => handleTeamMemberChange(idx, 'year', e.target.value)}
                            className="w-full px-3 py-2 bg-[#12141D] border border-slate-700 text-xs text-white font-bold focus:border-[#FFC928] focus:outline-none"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* PANEL 03: DISCOVERY INTEL (第3コマ // GOGOGO... ゴゴゴ)     */}
          {/* ============================================================ */}
          <div className="bg-[#12141D] border-3 border-slate-700 p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] relative">
            <div className="mb-6 pb-4 border-b-2 border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2.5 py-0.5 bg-[#FFC928] text-black text-xs font-black uppercase border border-black"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  PANEL 03 // 第3コマ
                </span>
                <span
                  className="text-xs font-black text-[#E2231A]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  [ GOGOGO... ゴゴゴ ]
                </span>
              </div>
              <h2
                className="text-2xl sm:text-3xl text-white uppercase leading-tight font-black"
                style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.03em' }}
              >
                HOW DID YOU DISCOVER THE GRAND VOYAGE? *
              </h2>
              <p
                className="text-xs text-slate-400 font-bold mt-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Tell us where you caught wind of the EvoXis '26 symposium.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <label
                  className="block text-xs font-black text-[#FFC928] uppercase tracking-wider mb-1.5"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Referral Channel *
                </label>
                <select
                  name="referralSource"
                  value={formData.referralSource || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#090A0F] border-2 border-slate-700 text-white font-bold focus:outline-none focus:border-[#FFC928] text-sm shadow-inner"
                >
                  <option value="">Select an option ▼</option>
                  <option value="School Friend">School Friend</option>
                  <option value="College Friend">College Friend</option>
                  <option value="College Staff">College Staff</option>
                  <option value="Instagram Post">Instagram Post</option>
                  <option value="By College">By College</option>
                  <option value="Other Social Media Platform">Other Social Media Platform</option>
                  <option value="Other">Other</option>
                </select>
                {errors.referralSource && (
                  <p className="error-message error-text text-red-400 text-xs font-bold mt-1.5 flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.referralSource}
                  </p>
                )}
              </div>

              {formData.referralSource === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-2"
                >
                  <label
                    className="block text-xs font-black text-[#FFC928] uppercase tracking-wider mb-1.5"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Please Specify *
                  </label>
                  <input
                    type="text"
                    name="referralSourceOther"
                    value={formData.referralSourceOther || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. YouTube / WhatsApp Group / Posters"
                    className="w-full px-4 py-3 bg-[#090A0F] border-2 border-slate-700 text-white placeholder-slate-600 font-bold focus:outline-none focus:border-[#FFC928] text-sm shadow-inner"
                  />
                  {errors.referralSourceOther && (
                    <p className="error-message error-text text-red-400 text-xs font-bold mt-1.5 flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.referralSourceOther}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* FINAL PANEL: AWAKEN & CONFIRM (第4コマ // 決着!! FINISH THIS)*/}
          {/* ============================================================ */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#18090C] via-[#12141D] to-[#0A0B10] border-3 border-[#E2231A] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-[6px_6px_0px_0px_#FFC928] relative overflow-hidden text-white">
            {/* Action Label */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span
                  className="bg-[#E2231A] text-white px-2.5 py-0.5 text-xs font-black uppercase border border-white shadow-[2px_2px_0px_0px_#000]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  FINAL CLASH // 決着
                </span>
                <span
                  className="text-xs font-black text-[#FFC928] uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  &quot;NOW, LET'S FINISH THIS!!&quot;
                </span>
              </div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="agreedToRules"
                  checked={formData.agreedToRules}
                  onChange={handleInputChange}
                  className="mt-1 w-5 h-5 rounded-none bg-[#090A0F] border-2 border-slate-600 text-[#E2231A] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-200 font-bold leading-relaxed">
                  I pledge adherence to the <strong className="text-[#FFC928] underline">EvoXis '26 Pirate Code & Conduct</strong>, affirm my credentials are accurate, and promise to bring my college ID card on event day.
                </span>
              </label>
              {errors.agreedToRules && (
                <p className="error-text text-red-400 text-xs font-black flex items-center gap-1 bg-black/40 p-2 border border-red-500/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.agreedToRules}
                </p>
              )}
            </div>

            {/* Shonen Manga Action CTA Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full lg:w-auto flex-shrink-0 inline-flex items-center justify-center gap-3 px-8 py-5 font-black text-base sm:text-lg text-black bg-[#FFC928] hover:bg-white hover:text-black active:translate-y-1 transition-all shadow-[4px_4px_0px_0px_#E2231A] border-3 border-black disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              style={{ fontFamily: "'Anton', sans-serif", letterSpacing: '0.04em' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-black" />
                  <span>AWAKENING GEAR 5 VOYAGE PASS...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-black fill-black" />
                  <span>⚡ AWAKEN & CONFIRM REGISTRATION (ドン!!)</span>
                  <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
