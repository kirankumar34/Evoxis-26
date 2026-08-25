import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Users,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  X,
} from 'lucide-react';
import { EVENTS } from '@/data/events';
import { EventId, EventCategory, RegistrationFormData, TeamMember } from '@/types';
import { api } from '@/services/api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedEvent = searchParams.get('event');

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

  // Keep formData.selectedEventIds in sync
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
      newErrors.events = 'Please select at least one event.';
    }

    if (formData.isTeam && !formData.teamName?.trim()) {
      newErrors.teamName = 'Team Name is required for team events.';
    }

    if (!formData.referralSource || formData.referralSource.trim() === '') {
      newErrors.referralSource = 'Please tell us how you heard about EvoXis 26.';
    } else if (formData.referralSource === 'Other' && (!formData.referralSourceOther || !formData.referralSourceOther.trim())) {
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
      const firstError = document.querySelector('.error-message') || document.querySelector('.text-red-400');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await api.registerParticipant(formData);

      if (result.success && result.data) {
        // Redirect directly to Registration Success Page
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
            referralSourceOther: (result.data as any).referralSourceOther || formData.referralSourceOther,
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
      const message = err instanceof Error ? err.message : 'Unable to connect to the registration server. Please try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = selectedCategory === 'All'
    ? EVENTS
    : EVENTS.filter((e) => e.category === selectedCategory);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-cyber-dark text-slate-100 selection:bg-cyber-cyan selection:text-black">
      <div className="max-w-5xl mx-auto">
        {/* Header Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Official Symposium Pass Registration
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mb-4">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400">EvoXis'26</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Select your events across 3 categories, fill in your details, and instantly generate your secure HMAC QR check-in pass.
          </p>
        </div>

        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <p className="text-sm font-medium">{serverError}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* STEP 1: EVENT SELECTION */}
          <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyan-500/20 shadow-glass">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-sm font-mono font-black">
                    1
                  </span>
                  <span>SELECT EVENTS (16 COMPETITIONS) *</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  You can register for multiple events across Technical, Non-Technical & Special tracks.
                </p>
              </div>

              {/* Category Filter Pills & Counter */}
              <div className="flex items-center gap-2 self-start flex-wrap">
                <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {selectedEventIds.length} Selected
                </span>
                <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
                  {(['All', 'Technical', 'Non-Technical', 'Special'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        selectedCategory === cat
                          ? 'bg-cyan-500 text-black font-bold shadow-glow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Events Chips Bar */}
            {selectedEventIds.length > 0 && (
              <div className="mb-6 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mr-1">
                  Selected ({selectedEventIds.length}):
                </span>
                {selectedEventIds.map((eid) => {
                  const found = EVENTS.find((e) => e.eventId === eid);
                  return (
                    <span
                      key={eid}
                      onClick={() => toggleEventSelection(eid)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-pointer hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-colors"
                      title="Click to remove"
                    >
                      <span>{eid}</span>
                      <span className="text-slate-300 font-normal">({found ? found.title : eid})</span>
                      <X className="w-3.5 h-3.5 ml-1" />
                    </span>
                  );
                })}
              </div>
            )}

            {errors.events && (
              <p className="error-message text-red-400 text-xs font-medium mb-4 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> {errors.events}
              </p>
            )}

            {/* Event Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((evt) => {
                const isSelected = selectedEventIds.includes(evt.eventId);
                return (
                  <div
                    key={evt.eventId}
                    onClick={() => toggleEventSelection(evt.eventId)}
                    className={`cursor-pointer relative p-4 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-glow-cyan/50 scale-[1.02]'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-cyan-500/30 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          {evt.eventId}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {evt.category}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-cyan-500 border-cyan-400 text-black'
                            : 'border-slate-700 bg-slate-800/50'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-sm text-white mb-1">{evt.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{evt.shortDescription}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-400" />
                        {evt.teamSize.description}
                      </span>
                      <span className="text-purple-300">{evt.schedule.timeSlot.split(' - ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Count Indicator */}
            <div className="mt-6 p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">
                Selected Events: <strong className="text-cyan-400 font-mono font-bold text-sm">{selectedEventIds.length}</strong> / 16
              </span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">Registration Fee: Free (₹0)</span>
            </div>
          </div>

          {/* STEP 2: PARTICIPANT DETAILS */}
          <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyan-500/20 shadow-glass">
            <div className="mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-sm font-mono font-black">
                  2
                </span>
                Participant Information
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your accurate contact and academic details for QR pass delivery and national certificate generation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name (As on ID Card) *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Priya Raman"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                />
                {errors.fullName && <p className="text-red-400 text-xs mt-1.5">{errors.fullName}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address (For QR Pass & Notifications) *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. priya.raman@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  WhatsApp / Mobile Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
              </div>

              {/* College Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  College / University Name *
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  placeholder="e.g. Sriram Engineering College"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                />
                {errors.collegeName && <p className="text-red-400 text-xs mt-1.5">{errors.collegeName}</p>}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Department / Branch *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Science & Business Systems"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                />
                {errors.department && <p className="text-red-400 text-xs mt-1.5">{errors.department}</p>}
              </div>

              {/* Year & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Year of Study
                  </label>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white focus:outline-none focus:border-cyan-400 text-sm"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white focus:outline-none focus:border-cyan-400 text-sm"
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
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-sm text-cyan-400 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Team Roster Details
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      You selected team-based events. Specify your team name and optional co-members.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTeamMember}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Member
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    placeholder="e.g. CyberTitans"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white focus:outline-none focus:border-cyan-400 text-sm"
                  />
                  {errors.teamName && <p className="text-red-400 text-xs mt-1.5">{errors.teamName}</p>}
                </div>

                {/* Team Members List */}
                <div className="space-y-4">
                  {(formData.teamMembers || []).map((member, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          Co-Member #{idx + 2} (TEAM_MEMBER)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(idx)}
                          className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Name *</label>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={member.name}
                            onChange={(e) => handleTeamMemberChange(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Email Address *</label>
                          <input
                            type="email"
                            placeholder="Email"
                            value={member.email}
                            onChange={(e) => handleTeamMemberChange(idx, 'email', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Mobile Number *</label>
                          <input
                            type="tel"
                            placeholder="10-digit mobile"
                            maxLength={10}
                            value={member.phone}
                            onChange={(e) => handleTeamMemberChange(idx, 'phone', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">College / Institution</label>
                          <input
                            type="text"
                            placeholder={formData.collegeName || "College Name"}
                            value={member.college || ''}
                            onChange={(e) => handleTeamMemberChange(idx, 'college', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Department</label>
                          <input
                            type="text"
                            placeholder={formData.department || "Department"}
                            value={member.department}
                            onChange={(e) => handleTeamMemberChange(idx, 'department', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Year of Study</label>
                          <select
                            value={member.year || formData.yearOfStudy || '3rd Year'}
                            onChange={(e) => handleTeamMemberChange(idx, 'year', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-400 focus:outline-none"
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

          {/* STEP 3: HOW DID YOU KNOW ABOUT THIS EVENT? */}
          <div className="p-6 sm:p-8 rounded-2xl bg-cyber-card border border-cyan-500/20 shadow-glass">
            <div className="mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-sm font-mono font-black">
                  3
                </span>
                How Did You Know About This Event? *
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Help us understand how you discovered EvoXis'26 national symposium.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Referral Source *
                </label>
                <select
                  name="referralSource"
                  value={formData.referralSource || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
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
                  <p className="error-message text-red-400 text-xs mt-1.5 flex items-center gap-1">
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
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Please Specify *
                  </label>
                  <input
                    type="text"
                    name="referralSourceOther"
                    value={formData.referralSourceOther || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. YouTube / WhatsApp Group / Friend referral"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                  />
                  {errors.referralSourceOther && (
                    <p className="error-message text-red-400 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.referralSourceOther}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* STEP 4: CODE OF CONDUCT & SUBMIT */}
          <div className="p-6 rounded-2xl bg-cyber-card border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                name="agreedToRules"
                checked={formData.agreedToRules}
                onChange={handleInputChange}
                className="mt-1 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                I agree to the <strong>EvoXis'26</strong> code of conduct, affirm that my details are accurate, and promise to bring my college ID card for reception desk verification.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-display font-black text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 hover:from-cyan-300 hover:to-sky-300 shadow-glow-cyan transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Official Pass...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Confirm Registration & Get QR</span>
                  <ArrowRight className="w-4 h-4" />
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
