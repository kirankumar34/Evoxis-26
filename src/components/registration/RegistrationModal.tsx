import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { EventItem, TeamMember, EventId, REFERRAL_SOURCES } from '@/types';
import { EVENTS } from '@/data/events';
import { api } from '@/services/api';
import { generateQRCodeDataUrl, downloadQRCodePNG } from '@/lib/qr';
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
  ChevronDown,
  Check,
  Download,
  Eye,
  AlertCircle,
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
    selectedEventIds: (initialEvent ? [initialEvent.eventId] : [EVENTS[0].eventId]) as EventId[],
    referralSource: 'Instagram Post',
    referralSourceOther: '',
    isTeam: false,
    teamName: '',
    teamMembers: [] as TeamMember[],
    transactionId: '',
    agreedToRules: true,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [confirmedEvents, setConfirmedEvents] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // QR Generation & Team Roster States
  const [registeredData, setRegisteredData] = useState<{
    registrationId: string;
    qrToken: string;
    participantName: string;
    email: string;
    mobileNumber: string;
    college: string;
    department: string;
    selectedEvents: EventId[];
    teamName?: string;
    teamMembers?: TeamMember[];
    participants?: Array<{
      name: string;
      email: string;
      phone: string;
      college: string;
      department: string;
      year: string;
      gender: string;
      role: 'TEAM_HEAD' | 'TEAM_MEMBER' | 'INDIVIDUAL';
      registrationId?: string;
      qrToken?: string;
    }>;
  } | null>(null);

  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  // Sync initial event if passed
  useEffect(() => {
    if (initialEvent) {
      setFormData((prev) => ({
        ...prev,
        selectedEventIds: [initialEvent.eventId],
        isTeam: initialEvent.teamSize.max > 1,
      }));
    }
  }, [initialEvent]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const selectedEvents = EVENTS.filter((e) => formData.selectedEventIds.includes(e.eventId));
  const allowsTeams = selectedEvents.some((e) => e.teamSize.max > 1);
  const maxTeamSize = selectedEvents.length > 0
    ? Math.max(...selectedEvents.map((e) => e.teamSize.max))
    : 1;

  const toggleEventSelection = (eventId: EventId) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.selectedEventIds.includes(eventId);
      let updated: EventId[];
      if (isAlreadySelected) {
        updated = prev.selectedEventIds.filter((id) => id !== eventId);
      } else {
        updated = [...prev.selectedEventIds, eventId];
      }

      return {
        ...prev,
        selectedEventIds: updated,
      };
    });

    if (errors.selectedEvents) {
      setErrors((prev) => ({ ...prev, selectedEvents: '' }));
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
    if (formData.teamMembers.length + 1 >= maxTeamSize) return;
    setFormData((prev) => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        {
          name: '',
          email: '',
          phone: '',
          college: prev.collegeName,
          department: prev.department,
          year: prev.yearOfStudy,
          gender: 'Not Specified',
          role: 'TEAM_MEMBER',
        },
      ],
    }));
  };

  const handleRemoveTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const handleTeamMemberChange = (
    index: number,
    field: keyof TeamMember,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.teamMembers];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, teamMembers: updated };
    });
  };

  const generateAllQRs = async (data: {
    registrationId: string;
    qrToken: string;
    participantName: string;
    teamName?: string;
    participants?: Array<{
      name: string;
      registrationId?: string;
      qrToken?: string;
    }>;
  }) => {
    setIsGeneratingQR(true);
    setQrError(null);
    try {
      const urls: Record<string, string> = {};
      const roster = data.participants && data.participants.length > 0
        ? data.participants
        : [{
            name: data.participantName,
            registrationId: data.registrationId,
            qrToken: data.qrToken,
          }];

      for (const p of roster) {
        const regId = p.registrationId || data.registrationId;
        const token = p.qrToken || data.qrToken;
        const url = await generateQRCodeDataUrl(token, { width: 360, margin: 2 });
        urls[regId] = url;
      }
      setQrDataUrls(urls);
    } catch (err) {
      console.error('[EvoXis26] QR generation failed:', err);
      setQrError('QR generation failed. Please retry.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleDownloadSingleQR = async (token: string, regId: string, label: string) => {
    await downloadQRCodePNG(token, `${regId}-QR.png`, label);
  };

  const handleDownloadAllQRs = async () => {
    if (!registeredData) return;
    setIsDownloadingAll(true);
    try {
      const roster = registeredData.participants && registeredData.participants.length > 0
        ? registeredData.participants
        : [{
            name: registeredData.participantName,
            registrationId: registeredData.registrationId,
            qrToken: registeredData.qrToken,
          }];

      for (let i = 0; i < roster.length; i++) {
        const p = roster[i];
        const regId = p.registrationId || registeredData.registrationId;
        const token = p.qrToken || registeredData.qrToken;
        const label = `${p.name} (${regId})`;
        await downloadQRCodePNG(token, `${regId}-QR.png`, label);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid college or personal email is required';
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      errs.phone = 'Valid 10-digit mobile number is required';
    }
    if (!formData.collegeName.trim()) errs.collegeName = 'College / Institution name is required';
    if (!formData.department.trim()) errs.department = 'Department name is required';
    if (!formData.selectedEventIds || formData.selectedEventIds.length === 0) {
      errs.selectedEvents = 'Please select at least one event.';
    }

    if (formData.isTeam) {
      if (!formData.teamName.trim()) errs.teamName = 'Team name is required for team entry';
      formData.teamMembers.forEach((member, i) => {
        if (!member.name.trim()) errs[`member_${i}_name`] = `Member ${i + 2} name required`;
        if (member.email && !/\S+@\S+\.\S+/.test(member.email)) {
          errs[`member_${i}_email`] = `Member ${i + 2} email is invalid`;
        }
      });
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await api.registerParticipant({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        collegeName: formData.collegeName,
        department: formData.department,
        yearOfStudy: formData.yearOfStudy,
        gender: formData.gender,
        selectedEventIds: formData.selectedEventIds,
        referralSource: formData.referralSource,
        referralSourceOther: formData.referralSourceOther,
        isTeam: formData.isTeam,
        teamName: formData.teamName,
        teamMembers: formData.teamMembers,
        agreedToRules: true,
      });

      if (result.success && result.data) {
        setRegistrationId(result.data.registrationId);
        setConfirmedEvents(result.data.selectedEvents || formData.selectedEventIds);
        setRegisteredData(result.data);
        setIsSuccess(true);
        generateAllQRs(result.data);

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
    const eventListStr = selectedEvents.map((e) => `${e.eventId} — ${e.title}`).join(', ');
    const text = `EvoXis'26 Registration Pass\nID: ${registrationId}\nParticipant: ${formData.fullName}\nEvents: ${eventListStr}\nCollege: ${formData.collegeName}\nDate: September 26, 2026\nSriram Engineering College`;
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
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-glow-cyan">
                  <CheckCircle2 className="w-10 h-10 text-cyan-400" />
                </div>

                <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                  Registration Confirmed!
                </h3>
                <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                  Your entry for <span className="text-cyan-400 font-bold">{confirmedEvents.length} event(s)</span> has been successfully locked in.
                </p>

                {/* Digital Ticket Pass */}
                <div className="mt-6 p-6 rounded-2xl bg-slate-900 border border-cyan-500/30 text-left relative overflow-hidden">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                    <div>
                      <span className="text-slate-400">Participant</span>
                      <p className="font-bold text-white mt-0.5">{formData.fullName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Institution</span>
                      <p className="font-bold text-white mt-0.5 truncate">{formData.collegeName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Department</span>
                      <p className="font-bold text-white mt-0.5">{formData.department}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Venue & Date</span>
                      <p className="font-bold text-white mt-0.5">Sept 26 • Sriram Engg</p>
                    </div>
                  </div>

                  {registeredData?.teamName && (
                    <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs mb-4 flex items-center justify-between">
                      <span className="text-slate-300">Team: <strong className="text-white">{registeredData.teamName}</strong></span>
                      <span className="text-[11px] font-mono text-cyan-400 font-bold">
                        {registeredData.participants?.length || (1 + (registeredData.teamMembers?.length || 0))} Members
                      </span>
                    </div>
                  )}

                  <div className="border-t border-slate-800/80 pt-3">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-2 font-bold">
                      Registered Events ({confirmedEvents.length}):
                    </span>
                    <div className="space-y-1.5">
                      {confirmedEvents.map((eid) => {
                        const found = EVENTS.find((e) => e.eventId === eid);
                        return (
                          <div key={eid} className="flex items-center gap-2 text-xs text-slate-200">
                            <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span className="font-mono font-bold text-cyan-300">{eid}</span>
                            <span>— {found ? found.title : eid}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* OFFICIAL CHECK-IN QR PASS SECTION */}
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0B132B] border border-cyan-500/30 text-center">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-left">
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                        {registeredData?.teamName ? 'TEAM QR PASSES' : 'YOUR OFFICIAL CHECK-IN QR PASS'}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {registeredData?.teamName
                          ? 'Each team member has a unique check-in QR code.'
                          : 'Show this QR pass at the reception desk on event day.'}
                      </p>
                    </div>

                    {registeredData?.teamName && (
                      <button
                        type="button"
                        onClick={handleDownloadAllQRs}
                        disabled={isDownloadingAll || isGeneratingQR}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-display bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloadingAll ? 'Downloading All...' : 'DOWNLOAD ALL MEMBER QRs'}</span>
                      </button>
                    )}
                  </div>

                  {isGeneratingQR ? (
                    <div className="w-full py-12 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                      <span className="text-xs font-mono text-slate-400">Generating HD Check-In QR Pass...</span>
                    </div>
                  ) : qrError ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>{qrError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => registeredData && generateAllQRs(registeredData)}
                        className="px-4 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold"
                      >
                        RETRY QR
                      </button>
                    </div>
                  ) : registeredData?.teamName ? (
                    /* Team Roster with individual QRs */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(registeredData.participants || [
                          {
                            name: registeredData.participantName,
                            role: 'TEAM_HEAD' as const,
                            registrationId: registeredData.registrationId,
                            qrToken: registeredData.qrToken,
                            email: registeredData.email,
                            phone: registeredData.mobileNumber,
                            college: registeredData.college,
                            department: registeredData.department,
                            year: '3rd Year',
                            gender: 'Not Specified',
                          },
                        ]).map((member, idx) => {
                          const memRegId = member.registrationId || (idx === 0 ? registrationId : `${registrationId}-M${idx}`);
                          const memQrToken = member.qrToken || (idx === 0 ? registeredData.qrToken : `${registeredData.qrToken}-M${idx}`);
                          const memUrl = qrDataUrls[memRegId];

                          return (
                            <div
                              key={memRegId}
                              className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-center flex flex-col items-center justify-between"
                            >
                              <div className="w-full flex items-center justify-between mb-2">
                                <span className="font-bold text-white text-xs truncate max-w-[120px]">
                                  {idx + 1}. {member.name}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  idx === 0
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                }`}>
                                  {idx === 0 ? 'TEAM_HEAD' : 'MEMBER'}
                                </span>
                              </div>

                              <div className="p-2.5 bg-white rounded-xl shadow-lg my-2">
                                {memUrl ? (
                                  <img
                                    src={memUrl}
                                    alt={`QR for ${member.name}`}
                                    className="w-32 h-32 mx-auto"
                                  />
                                ) : (
                                  <div className="w-32 h-32 bg-slate-100 flex items-center justify-center">
                                    <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
                                  </div>
                                )}
                              </div>

                              <span className="text-[10px] font-mono font-bold text-cyan-400 mb-3">
                                {memRegId}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleDownloadSingleQR(memQrToken, memRegId, `${member.name} (${memRegId})`)}
                                className="w-full py-2 px-3 rounded-lg text-xs font-bold font-display bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5 text-cyan-400" />
                                <span>DOWNLOAD QR</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Individual Participant QR */
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl mx-auto border border-cyan-500/20">
                        {qrDataUrls[registrationId] ? (
                          <img
                            src={qrDataUrls[registrationId]}
                            alt={`QR Code for ${registrationId}`}
                            className="w-48 h-48 sm:w-56 sm:h-56 mx-auto"
                          />
                        ) : (
                          <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-slate-100 rounded-lg">
                            <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
                          </div>
                        )}
                        <p className="text-xs font-mono font-black text-slate-900 mt-2">
                          {registrationId}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDownloadSingleQR(registeredData?.qrToken || registrationId, registrationId, `${formData.fullName} (${registrationId})`)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold font-display bg-gradient-to-r from-cyan-400 to-sky-400 text-black shadow-glow-cyan flex items-center gap-2 transition-transform hover:scale-105 active:scale-[0.98]"
                        >
                          <Download className="w-4 h-4" />
                          <span>DOWNLOAD QR</span>
                        </button>
                      </div>
                    </div>
                  )}
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
                    to={`/my-registration?id=${registrationId}&token=${encodeURIComponent(registeredData?.qrToken || '')}`}
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold font-display bg-gradient-to-r from-cyan-400 to-purple-400 text-black shadow-glow-cyan transition-transform hover:scale-105 inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View QR Pass</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Input Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Multi-Event Selector Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
                    <span>Select Events (16 Competitions) *</span>
                    <span className="text-[11px] text-cyan-400 font-mono font-bold">
                      {formData.selectedEventIds.length === 0
                        ? '(0 Selected)'
                        : `(${formData.selectedEventIds.length} Selected)`}
                    </span>
                  </label>

                  {/* Trigger Box */}
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`cursor-pointer w-full min-h-[48px] px-3.5 py-2 rounded-xl bg-slate-900 border ${
                      errors.selectedEvents
                        ? 'border-red-500'
                        : isDropdownOpen
                        ? 'border-cyan-400 ring-1 ring-cyan-400/50'
                        : 'border-slate-700 hover:border-slate-600'
                    } flex items-center justify-between gap-2 transition-colors`}
                  >
                    {formData.selectedEventIds.length === 0 ? (
                      <span className="text-slate-400 text-xs sm:text-sm font-sans">
                        Select one or more competitions...
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-0.5">
                        {formData.selectedEventIds.map((eid) => {
                          const evt = EVENTS.find((e) => e.eventId === eid);
                          return (
                            <span
                              key={eid}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEventSelection(eid);
                              }}
                            >
                              <span>{eid}</span>
                              <span className="text-slate-400 font-normal text-[11px] hidden sm:inline">
                                — {evt?.title.split(' ')[0]}
                              </span>
                              <X className="w-3 h-3 text-cyan-400/80 hover:text-cyan-200 ml-0.5" />
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${
                        isDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                      }`}
                    />
                  </div>

                  {errors.selectedEvents && (
                    <p className="text-[11px] text-red-400 mt-1">{errors.selectedEvents}</p>
                  )}

                  {/* Dropdown Panel with Checkboxes */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-2xl bg-[#0F172A] border border-cyan-500/40 shadow-2xl z-30 max-h-72 overflow-y-auto space-y-4">
                      {/* TECHNICAL EVENTS */}
                      <div>
                        <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
                          <span>⚡ Technical Events (6)</span>
                          <span className="text-[10px] text-slate-500">Track 1</span>
                        </div>
                        <div className="space-y-1">
                          {EVENTS.filter((e) => e.category === 'Technical').map((e) => {
                            const isChecked = formData.selectedEventIds.includes(e.eventId);
                            return (
                              <div
                                key={e.eventId}
                                onClick={() => toggleEventSelection(e.eventId)}
                                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-colors ${
                                  isChecked
                                    ? 'bg-cyan-500/15 text-white border border-cyan-500/40'
                                    : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                      isChecked
                                        ? 'bg-cyan-500 border-cyan-400 text-black'
                                        : 'border-slate-600 bg-slate-800'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className="font-mono font-bold text-cyan-400">{e.eventId}</span>
                                  <span className="font-medium">— {e.title}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {e.teamSize.description}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* NON-TECHNICAL EVENTS */}
                      <div>
                        <div className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
                          <span>🎭 Non-Technical Events (6)</span>
                          <span className="text-[10px] text-slate-500">Track 2</span>
                        </div>
                        <div className="space-y-1">
                          {EVENTS.filter((e) => e.category === 'Non-Technical').map((e) => {
                            const isChecked = formData.selectedEventIds.includes(e.eventId);
                            return (
                              <div
                                key={e.eventId}
                                onClick={() => toggleEventSelection(e.eventId)}
                                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-colors ${
                                  isChecked
                                    ? 'bg-purple-500/15 text-white border border-purple-500/40'
                                    : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                      isChecked
                                        ? 'bg-purple-500 border-purple-400 text-black'
                                        : 'border-slate-600 bg-slate-800'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className="font-mono font-bold text-purple-400">{e.eventId}</span>
                                  <span className="font-medium">— {e.title}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {e.teamSize.description}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* SPECIAL EVENTS */}
                      <div>
                        <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
                          <span>🏆 Special Events ({EVENTS.filter((e) => e.category === 'Special Event').length})</span>
                          <span className="text-[10px] text-slate-500">Track 3</span>
                        </div>
                        <div className="space-y-1">
                          {EVENTS.filter((e) => e.category === 'Special Event').map((e) => {
                            const isChecked = formData.selectedEventIds.includes(e.eventId);
                            return (
                              <div
                                key={e.eventId}
                                onClick={() => toggleEventSelection(e.eventId)}
                                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs transition-colors ${
                                  isChecked
                                    ? 'bg-amber-500/15 text-white border border-amber-500/40'
                                    : 'hover:bg-slate-800 text-slate-300 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                      isChecked
                                        ? 'bg-amber-500 border-amber-400 text-black'
                                        : 'border-slate-600 bg-slate-800'
                                    }`}
                                  >
                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className="font-mono font-bold text-amber-400">{e.eventId}</span>
                                  <span className="font-medium">— {e.title}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {e.teamSize.description}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Done Button */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">
                          {formData.selectedEventIds.length} of {EVENTS.length} selected
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(false)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-glow-sm"
                        >
                          Done Selecting
                        </button>
                      </div>
                    </div>
                  )}
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

                {/* Team Members Section (if any selected event allows teams) */}
                {allowsTeams && (
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span>Team Registration (Up to {maxTeamSize} Members)</span>
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

                        {(formData.teamMembers || []).length < maxTeamSize - 1 && (
                          <button
                            type="button"
                            onClick={handleAddTeamMember}
                            className="w-full py-2 rounded-xl text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Teammate ({(formData.teamMembers || []).length + 1}/{maxTeamSize})</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Referral Source */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      How Did You Know About This Event? *
                    </label>
                    <select
                      name="referralSource"
                      value={formData.referralSource}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border ${
                        errors.referralSource ? 'border-red-500' : 'border-slate-700'
                      } text-white text-sm focus:border-cyan-400 focus:outline-none`}
                    >
                      {REFERRAL_SOURCES.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                    {errors.referralSource && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.referralSource}</p>
                    )}
                  </div>

                  {formData.referralSource === 'Other' && (
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">
                        Please Specify *
                      </label>
                      <input
                        type="text"
                        name="referralSourceOther"
                        placeholder="e.g. WhatsApp Group, LinkedIn"
                        value={formData.referralSourceOther}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border ${
                          errors.referralSourceOther ? 'border-red-500' : 'border-slate-700'
                        } text-white text-sm focus:border-cyan-400 focus:outline-none`}
                      />
                      {errors.referralSourceOther && (
                        <p className="text-[11px] text-red-400 mt-1">{errors.referralSourceOther}</p>
                      )}
                    </div>
                  )}
                </div>

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
                        <span>CONFIRM REGISTRATION ({formData.selectedEventIds.length} EVENTS)</span>
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

