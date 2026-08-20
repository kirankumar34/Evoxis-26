import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { EventItem, TeamMember } from '@/types';
import { EVENTS } from '@/data/events';
import { api } from '@/services/api';
import {
  X,
  Sparkles,
  Users,
  CheckCircle2,
  Plus,
  Trash2,
  Copy,
  QrCode,
  Send,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent: EventItem | null;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  initialEvent,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    department: '',
    yearOfStudy: '3rd Year',
    gender: 'Male',
    selectedEventId: initialEvent ? initialEvent.id : EVENTS[0].id,
    isTeam: false,
    teamName: '',
    teamMembers: [] as TeamMember[],
    transactionId: '',
    agreedToRules: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync initial event if passed
  useEffect(() => {
    if (initialEvent) {
      setFormData((prev) => ({
        ...prev,
        selectedEventId: initialEvent.id,
        isTeam: initialEvent.teamSize.max > 1,
      }));
    }
  }, [initialEvent]);

  const selectedEvent = EVENTS.find((e) => e.id === formData.selectedEventId) || EVENTS[0];

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
    const maxMembers = selectedEvent.teamSize.max - 1;
    if ((formData.teamMembers || []).length < maxMembers) {
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

  const handleTeamMemberChange = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...(prev.teamMembers || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, teamMembers: updated };
    });
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Valid Email Address is required.';
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errs.phone = '10-digit Mobile Number required.';
    }
    if (!formData.collegeName.trim()) errs.collegeName = 'College / Institution name required.';
    if (!formData.department.trim()) errs.department = 'Department name required.';

    if (formData.isTeam && selectedEvent.teamSize.max > 1) {
      if (!formData.teamName?.trim()) {
        errs.teamName = 'Team Name is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await api.registerParticipant({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        collegeName: formData.collegeName,
        department: formData.department,
        yearOfStudy: formData.yearOfStudy,
        gender: formData.gender,
        selectedEventIds: [selectedEvent.eventId],
        isTeam: formData.isTeam,
        teamName: formData.teamName,
        teamMembers: formData.teamMembers,
        agreedToRules: true,
      });

      if (result.success && result.data) {
        setRegistrationId(result.data.registrationId);
        setIsSuccess(true);

        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00F2FE', '#4FACFE', '#A855F7', '#EC4899', '#F59E0B'],
          });
        } catch {
          // ignore confetti errors
        }
      } else {
        setErrors({ form: result.message || 'Registration could not be completed.' });
      }
    } catch {
      setErrors({ form: 'Unable to connect to registration server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRegistrationPass = () => {
    const text = `EvoXis'26 Registration Pass\nID: ${registrationId}\nParticipant: ${formData.fullName}\nEvent: ${selectedEvent.title} (${selectedEvent.eventId})\nCollege: ${formData.collegeName}\nDate: September 26, 2026\nSriram Engineering College`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[92vh] bg-[#0A0F1D] border border-cyan-500/30 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#0F172A] via-[#111827] to-[#0A0E1A] border-b border-slate-800 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Registration Desk</span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
              Register for <span className="text-cyan-400">EvoXis'26</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join 1,500+ participants across 16 competitions at Sriram Engineering College.
            </p>
          </div>

          {/* Form Content / Success Screen */}
          <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(92vh-140px)]">
            {isSuccess ? (
              /* Success Confirmation Card */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-glow-cyan">
                  <CheckCircle2 className="w-10 h-10 text-cyan-400" />
                </div>

                <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                  Registration Confirmed!
                </h3>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  Your entry for <span className="text-cyan-400 font-bold">{selectedEvent.title}</span> ({selectedEvent.eventId}) has been successfully locked in.
                </p>

                {/* Digital Ticket Pass */}
                <div className="mt-6 p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <QrCode className="w-20 h-20 text-cyan-400" />
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase">Registration ID</span>
                      <p className="font-mono font-black text-xl text-white tracking-wider">
                        {registrationId}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Participant</span>
                      <p className="font-bold text-white mt-0.5">{formData.fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Event</span>
                      <p className="font-bold text-cyan-300 mt-0.5">{selectedEvent.title} ({selectedEvent.eventId})</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Institution</span>
                      <p className="font-bold text-white mt-0.5 truncate">{formData.collegeName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Venue & Date</span>
                      <p className="font-bold text-white mt-0.5">Sept 26 • Sriram Engg</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={copyRegistrationPass}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold font-display bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-cyan-400" />
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Pass Details'}</span>
                  </button>

                  <Link
                    to={`/my-registration?id=${registrationId}`}
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold font-display bg-gradient-to-r from-cyan-400 to-sky-400 text-black shadow-glow-cyan transition-transform hover:scale-105 inline-flex items-center gap-1.5"
                  >
                    <span>View QR Pass</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Input Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Selector Dropdown */}
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                    Select Event (16 Competitions) *
                  </label>
                  <select
                    name="selectedEventId"
                    value={formData.selectedEventId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                  >
                    <optgroup label="⚡ Technical Events (6)">
                      {EVENTS.filter((e) => e.category === 'Technical').map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.eventId} - {e.title} ({e.teamSize.description})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🎭 Non-Technical Events (6)">
                      {EVENTS.filter((e) => e.category === 'Non-Technical').map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.eventId} - {e.title} ({e.teamSize.description})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🏆 Special Events (4)">
                      {EVENTS.filter((e) => e.category === 'Special').map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.eventId} - {e.title} ({e.teamSize.description})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Participant Personal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Full Name (Leader) *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border ${
                        errors.fullName ? 'border-red-500' : 'border-slate-700'
                      } text-white text-sm focus:border-cyan-400 focus:outline-none`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="e.g. rahul@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border ${
                        errors.email ? 'border-red-500' : 'border-slate-700'
                      } text-white text-sm focus:border-cyan-400 focus:outline-none`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. 9840123456"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border ${
                        errors.phone ? 'border-red-500' : 'border-slate-700'
                      } text-white text-sm focus:border-cyan-400 focus:outline-none`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Year of Study *
                    </label>
                    <select
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="1st Year">1st Year (UG)</option>
                      <option value="2nd Year">2nd Year (UG)</option>
                      <option value="3rd Year">3rd Year (UG)</option>
                      <option value="4th Year">4th Year (UG)</option>
                      <option value="PG">Postgraduate (PG)</option>
                    </select>
                  </div>
                </div>

                {/* College & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      College / Institution Name *
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      placeholder="e.g. Sriram Engineering College"
                      value={formData.collegeName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border ${
                        errors.collegeName ? 'border-red-500' : 'border-slate-700'
                      } text-white text-sm focus:border-cyan-400 focus:outline-none`}
                    />
                    {errors.collegeName && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.collegeName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Branch / Department *
                    </label>
                    <input
                      type="text"
                      name="department"
                      placeholder="e.g. B.Tech AI & Data Science"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border ${
                        errors.department ? 'border-red-500' : 'border-slate-700'
                      } text-white text-sm focus:border-cyan-400 focus:outline-none`}
                    />
                    {errors.department && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.department}</p>
                    )}
                  </div>
                </div>

                {/* Team Members Section (if event allows teams) */}
                {selectedEvent.teamSize.max > 1 && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span>Team Registration ({selectedEvent.teamSize.description})</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Registering as a team? Add your teammates below.
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isTeam"
                          checked={formData.isTeam}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                      </label>
                    </div>

                    {formData.isTeam && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-xs font-mono text-slate-300 mb-1">
                            Team Name *
                          </label>
                          <input
                            type="text"
                            name="teamName"
                            placeholder="e.g. Cyber Knights"
                            value={formData.teamName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-xl bg-slate-800 border ${
                              errors.teamName ? 'border-red-500' : 'border-slate-700'
                            } text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none`}
                          />
                          {errors.teamName && (
                            <p className="text-[11px] text-red-400 mt-1">{errors.teamName}</p>
                          )}
                        </div>

                        {/* Teammates List */}
                        {(formData.teamMembers || []).map((member, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2 relative"
                          >
                            <input
                              type="text"
                              placeholder={`Member ${idx + 2} Name`}
                              value={member.name}
                              onChange={(e) =>
                                handleTeamMemberChange(idx, 'name', e.target.value)
                              }
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs border border-slate-700"
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={member.email}
                              onChange={(e) =>
                                handleTeamMemberChange(idx, 'email', e.target.value)
                              }
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs border border-slate-700"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="tel"
                                placeholder="Phone"
                                value={member.phone}
                                onChange={(e) =>
                                  handleTeamMemberChange(idx, 'phone', e.target.value)
                                }
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs border border-slate-700"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(idx)}
                                className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {(formData.teamMembers || []).length < selectedEvent.teamSize.max - 1 && (
                          <button
                            type="button"
                            onClick={handleAddTeamMember}
                            className="w-full py-2 rounded-xl text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Teammate ({(formData.teamMembers || []).length + 1}/{selectedEvent.teamSize.max})</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Rules Agreement */}
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    name="agreedToRules"
                    id="agreedToRules"
                    checked={formData.agreedToRules}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <label htmlFor="agreedToRules" className="text-xs text-slate-400 leading-normal">
                    I agree to bring my official College ID card and adhere to the discipline guidelines of Sriram Engineering College.
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cyber-button px-8 py-3 rounded-xl font-display font-bold text-sm text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 shadow-glow-cyan flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming Registration...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>CONFIRM REGISTRATION</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
