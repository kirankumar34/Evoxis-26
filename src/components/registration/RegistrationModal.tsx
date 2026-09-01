import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { EventItem, TeamMember, EventId, REFERRAL_SOURCES } from '@/types';
import { EVENTS } from '@/data/events';
import { api } from '@/services/api';
import { generateQRCodeDataUrl, downloadQRCodePNG } from '@/lib/qr';
import {
  X,
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
  ImagePlus,
  UploadCloud,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Payment Config ─────────────────────────────────────────────────────────
const UPI_ID = 'evoxis26@ibl'; // Replace with actual UPI ID
const UPI_NAME = "EvoXis'26 Symposium";
const UPI_AMOUNT = ''; // leave empty so participant sets own amount

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
    upiTransactionId: '',
    agreedToRules: true,
  });

  // ── Payment screenshot states ───────────────────────────────────────────
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Handle screenshot file selection and immediate upload to Supabase Storage
  const handleScreenshotSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type & size (max 5 MB)
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are accepted (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Screenshot must be under 5 MB.');
      return;
    }

    setUploadError(null);
    setScreenshotFile(file);
    setUploadedUrl(null);

    // Generate local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage (use a temp ID pre-registration)
    setIsUploading(true);
    const tempId = `TEMP-${Date.now()}`;
    try {
      const url = await api.uploadPaymentScreenshot(file, tempId);
      if (url) {
        setUploadedUrl(url);
      } else {
        // Supabase not configured or bucket missing — still allow offline continue
        setUploadError('Screenshot saved locally. Will sync after registration.');
      }
    } finally {
      setIsUploading(false);
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
      // If screenshot was selected but not yet uploaded, try uploading now
      let finalScreenshotUrl = uploadedUrl;
      if (screenshotFile && !uploadedUrl) {
        const tempId = `TEMP-${Date.now()}`;
        finalScreenshotUrl = await api.uploadPaymentScreenshot(screenshotFile, tempId);
      }

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
        upiTransactionId: formData.upiTransactionId.trim() || undefined,
        paymentScreenshotUrl: finalScreenshotUrl || undefined,
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

  // ── Manga theme inline style helpers ──────────────────────────────────────
  const MANGA_PANEL: React.CSSProperties = {
    border: '3px solid #0a0a0a',
    boxShadow: '4px 4px 0 #0a0a0a',
  };

  const MANGA_INPUT: React.CSSProperties = {
    border: '2px solid #0a0a0a',
    boxShadow: '2px 2px 0 #0a0a0a',
    background: '#fff',
    color: '#0a0a0a',
    fontWeight: 700,
  };

  const MANGA_INPUT_ERR: React.CSSProperties = {
    border: '2px solid #E2231A',
    boxShadow: '2px 2px 0 #E2231A',
    background: '#fff',
    color: '#0a0a0a',
    fontWeight: 700,
  };

  const COMIC_FONT: React.CSSProperties = {
    fontFamily: "'Anton', 'Impact', 'Arial Black', sans-serif",
    letterSpacing: '0.08em',
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        {/* Backdrop — ink splash */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
          style={{ background: 'rgba(0,0,0,0.88)' }}
        />

        {/* Modal — Manga panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative w-full max-w-2xl max-h-[95vh] z-10 flex flex-col overflow-hidden"
          style={{
            background: '#FFFEF0',
            border: '4px solid #0a0a0a',
            boxShadow: '8px 8px 0 #0a0a0a, 14px 14px 0 #E2231A',
          }}
        >
          {/* Speed-line BG overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                88deg,
                transparent,
                transparent 18px,
                rgba(0,0,0,0.025) 18px,
                rgba(0,0,0,0.025) 19px
              )`,
            }}
          />

          {/* ── HEADER PANEL ─────────────────────────────────────────── */}
          <div
            className="relative p-4 sm:p-6 border-b-4 border-black flex-shrink-0"
            style={{
              background: '#0a0a0a',
              backgroundImage: `radial-gradient(circle at 10% 50%, rgba(226,35,26,0.18) 0%, transparent 60%)`,
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              style={{ ...COMIC_FONT }}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center font-black text-xl text-white border-2 border-white hover:border-red-500 hover:text-red-500 transition-colors"
            >
              ✕
            </button>

            {/* Chapter badge */}
            <div
              className="inline-block px-3 py-0.5 text-black text-[10px] uppercase mb-2"
              style={{ background: '#FFC928', border: '2px solid #0a0a0a', ...COMIC_FONT }}
            >
              ★ CHAPTER: ENTRY ARC ★
            </div>

            <h2
              className="text-3xl sm:text-4xl text-white uppercase leading-tight"
              style={{
                ...COMIC_FONT,
                WebkitTextStroke: '2px #E2231A',
              }}
            >
              REGISTER FOR{' '}
              <span style={{ color: '#FFC928', WebkitTextStroke: '2px #0a0a0a' }}>
                EVOXIS'26
              </span>
            </h2>

            <p className="text-gray-400 text-[11px] mt-1.5 uppercase tracking-widest font-bold">
              ◆ 1,500+ PARTICIPANTS · 16 COMPETITIONS · SEPT 26, 2026 ◆
            </p>
          </div>

          {/* ── SCROLLABLE BODY ───────────────────────────────────────── */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6"
            style={{ background: '#FFFEF0' }}
          >
            {isSuccess ? (
              /* ═══════════════════ SUCCESS SCREEN ═══════════════════ */
              <div className="text-center">
                {/* "CONFIRMED!!" headline */}
                <div className="mb-4">
                  <p
                    className="text-5xl uppercase leading-none"
                    style={{
                      ...COMIC_FONT,
                      color: '#E2231A',
                      WebkitTextStroke: '3px #0a0a0a',
                      textShadow: '5px 5px 0 #0a0a0a',
                    }}
                  >
                    !!CONFIRMED!!
                  </p>
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mt-2" />
                </div>

                <span
                  className="inline-block px-4 py-1.5 text-black text-xs uppercase mb-5"
                  style={{ background: '#FFC928', border: '2px solid #0a0a0a', ...COMIC_FONT, boxShadow: '3px 3px 0 #0a0a0a' }}
                >
                  {confirmedEvents.length} EVENT(S) LOCKED IN!!
                </span>

                {/* Registration Pass */}
                <div className="text-left mb-4" style={MANGA_PANEL}>
                  {/* Pass header */}
                  <div className="px-4 py-2 border-b-3 border-black" style={{ background: '#E2231A', borderBottom: '3px solid #0a0a0a' }}>
                    <span className="text-white text-xs uppercase" style={COMIC_FONT}>★ REGISTRATION PASS ★</span>
                  </div>
                  <div className="p-4" style={{ background: '#FFFEF0' }}>
                    {/* Reg ID row */}
                    <div className="flex items-start justify-between border-b-2 border-black pb-3 mb-3">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block" style={COMIC_FONT}>REGISTRATION ID</span>
                        <p className="text-xl font-black text-black mt-0.5" style={COMIC_FONT}>{registrationId}</p>
                      </div>
                      <span className="px-2 py-1 text-xs text-white border-2 border-black" style={{ background: '#22c55e', ...COMIC_FONT }}>CONFIRMED</span>
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      {[
                        { label: 'PARTICIPANT', val: formData.fullName },
                        { label: 'INSTITUTION', val: formData.collegeName },
                        { label: 'DEPARTMENT', val: formData.department },
                        { label: 'VENUE & DATE', val: 'Sept 26 • Sriram Engg' },
                      ].map(({ label, val }) => (
                        <div key={label} className="border-l-4 border-black pl-2">
                          <span className="text-[9px] text-gray-500 block uppercase" style={COMIC_FONT}>{label}</span>
                          <p className="font-black text-black truncate">{val}</p>
                        </div>
                      ))}
                    </div>

                    {registeredData?.teamName && (
                      <div className="px-3 py-2 mb-3 border-2 border-black text-xs" style={{ background: '#FFC928', ...COMIC_FONT }}>
                        TEAM: {registeredData.teamName} ·{' '}
                        {registeredData.participants?.length || (1 + (registeredData.teamMembers?.length || 0))} MEMBERS
                      </div>
                    )}

                    {/* Events list */}
                    <div className="border-t-2 border-black pt-3">
                      <span className="text-[10px] block mb-2 uppercase" style={{ color: '#E2231A', ...COMIC_FONT }}>
                        ◆ REGISTERED EVENTS ({confirmedEvents.length}) ◆
                      </span>
                      <div className="space-y-1">
                        {confirmedEvents.map((eid) => {
                          const found = EVENTS.find((e) => e.eventId === eid);
                          return (
                            <div key={eid} className="flex items-center gap-2 text-xs text-black">
                              <span className="w-2 h-2 bg-black flex-shrink-0 inline-block" />
                              <span className="font-black" style={{ color: '#E2231A' }}>{eid}</span>
                              <span className="font-bold">— {found ? found.title : eid}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Section */}
                <div className="mb-4" style={MANGA_PANEL}>
                  <div className="px-4 py-2 border-b-3 border-black flex items-center justify-between" style={{ background: '#0a0a0a', borderBottom: '3px solid #0a0a0a' }}>
                    <span className="text-white text-xs uppercase" style={COMIC_FONT}>
                      ◆ {registeredData?.teamName ? 'TEAM QR PASSES' : 'CHECK-IN QR PASS'} ◆
                    </span>
                    {registeredData?.teamName && (
                      <button
                        type="button"
                        onClick={handleDownloadAllQRs}
                        disabled={isDownloadingAll || isGeneratingQR}
                        className="text-[10px] border-2 border-white text-white px-2 py-1 hover:bg-white hover:text-black transition-colors"
                        style={COMIC_FONT}
                      >
                        {isDownloadingAll ? 'DOWNLOADING…' : '↓ ALL QRs'}
                      </button>
                    )}
                  </div>

                  <div className="p-4" style={{ background: '#FFFEF0' }}>
                    {isGeneratingQR ? (
                      <div className="py-10 flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E2231A' }} />
                        <span className="text-xs uppercase font-black" style={{ ...COMIC_FONT, color: '#0a0a0a' }}>GENERATING QR…</span>
                      </div>
                    ) : qrError ? (
                      <div className="p-4 border-2 text-center" style={{ borderColor: '#E2231A' }}>
                        <p className="text-xs font-black mb-2" style={{ color: '#E2231A' }}>{qrError}</p>
                        <button
                          onClick={() => registeredData && generateAllQRs(registeredData)}
                          className="px-4 py-2 text-xs text-white border-2 border-black"
                          style={{ background: '#E2231A', ...COMIC_FONT }}
                        >
                          RETRY QR
                        </button>
                      </div>
                    ) : registeredData?.teamName ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(registeredData.participants || [{
                          name: registeredData.participantName, role: 'TEAM_HEAD' as const,
                          registrationId: registeredData.registrationId, qrToken: registeredData.qrToken,
                          email: registeredData.email, phone: registeredData.mobileNumber,
                          college: registeredData.college, department: registeredData.department,
                          year: '3rd Year', gender: 'Not Specified',
                        }]).map((member, idx) => {
                          const memRegId = member.registrationId || (idx === 0 ? registrationId : `${registrationId}-M${idx}`);
                          const memQrToken = member.qrToken || (idx === 0 ? registeredData.qrToken : `${registeredData.qrToken}-M${idx}`);
                          const memUrl = qrDataUrls[memRegId];
                          return (
                            <div key={memRegId} className="p-3 border-2 border-black text-center" style={{ boxShadow: '3px 3px 0 #E2231A' }}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-black text-xs text-black truncate max-w-[100px]">{idx + 1}. {member.name}</span>
                                <span className="px-1.5 py-0.5 text-[9px] text-white border border-black" style={{ background: idx === 0 ? '#E2231A' : '#0a0a0a', ...COMIC_FONT }}>
                                  {idx === 0 ? 'LEADER' : 'MEMBER'}
                                </span>
                              </div>
                              <div className="p-2 bg-white border-2 border-black inline-block my-2">
                                {memUrl ? (
                                  <img src={memUrl} alt={`QR for ${member.name}`} className="w-28 h-28" />
                                ) : (
                                  <div className="w-28 h-28 bg-gray-100 flex items-center justify-center">
                                    <QrCode className="w-8 h-8 text-gray-400 animate-pulse" />
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] font-black mb-2" style={{ color: '#E2231A', ...COMIC_FONT }}>{memRegId}</p>
                              <button
                                type="button"
                                onClick={() => handleDownloadSingleQR(memQrToken, memRegId, `${member.name} (${memRegId})`)}
                                className="w-full py-1.5 text-xs text-white border-2 border-black flex items-center justify-center gap-1.5"
                                style={{ background: '#0a0a0a', ...COMIC_FONT }}
                              >
                                <Download className="w-3.5 h-3.5" /> DOWNLOAD QR
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-4 text-center">
                        <div className="p-3 bg-white border-2 border-black inline-block" style={{ boxShadow: '4px 4px 0 #0a0a0a' }}>
                          {qrDataUrls[registrationId] ? (
                            <img src={qrDataUrls[registrationId]} alt={`QR for ${registrationId}`} className="w-48 h-48 sm:w-52 sm:h-52" />
                          ) : (
                            <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center bg-gray-100">
                              <QrCode className="w-12 h-12 text-gray-400 animate-pulse" />
                            </div>
                          )}
                          <p className="text-xs font-black text-black mt-2" style={COMIC_FONT}>{registrationId}</p>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleQR(registeredData?.qrToken || registrationId, registrationId, `${formData.fullName} (${registrationId})`)}
                            className="px-6 py-2.5 text-sm text-white border-2 border-black flex items-center gap-2 mx-auto"
                            style={{ background: '#E2231A', ...COMIC_FONT, boxShadow: '3px 3px 0 #0a0a0a' }}
                          >
                            <Download className="w-4 h-4" /> DOWNLOAD QR PASS
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={copyRegistrationPass}
                    className="px-5 py-2.5 text-xs text-black border-2 border-black flex items-center gap-2"
                    style={{ background: '#FFC928', ...COMIC_FONT, boxShadow: '3px 3px 0 #0a0a0a' }}
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'COPIED!!' : 'COPY PASS DETAILS'}
                  </button>

                  <Link
                    to={`/my-registration?id=${registrationId}&token=${encodeURIComponent(registeredData?.qrToken || '')}`}
                    onClick={onClose}
                    className="px-6 py-2.5 text-xs text-white border-2 border-black flex items-center gap-1.5"
                    style={{ background: '#E2231A', ...COMIC_FONT, boxShadow: '3px 3px 0 #0a0a0a' }}
                  >
                    <Eye className="w-3.5 h-3.5" /> VIEW QR PASS <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* ═══════════════════ INPUT FORM ════════════════════════ */
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* EVENT SELECTION */}
                <div ref={dropdownRef} className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-3.5 h-3.5 bg-black flex-shrink-0 inline-block" />
                    <label className="text-[11px] uppercase text-black" style={COMIC_FONT}>
                      SELECT EVENTS (16 COMPETITIONS) *
                    </label>
                    <span className="ml-auto text-[11px]" style={{ color: '#E2231A', ...COMIC_FONT }}>
                      {formData.selectedEventIds.length > 0 ? `${formData.selectedEventIds.length} CHOSEN` : '0 CHOSEN'}
                    </span>
                  </div>

                  {/* Trigger */}
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="cursor-pointer w-full min-h-[48px] px-3 py-2 bg-white flex items-center justify-between gap-2 transition-all"
                    style={errors.selectedEvents ? MANGA_INPUT_ERR : { ...MANGA_INPUT, border: isDropdownOpen ? '2px solid #E2231A' : '2px solid #0a0a0a', boxShadow: isDropdownOpen ? '3px 3px 0 #E2231A' : '3px 3px 0 #0a0a0a' }}
                  >
                    {formData.selectedEventIds.length === 0 ? (
                      <span className="text-gray-400 text-xs font-bold">Click to select competitions…</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-0.5">
                        {formData.selectedEventIds.map((eid) => {
                          const evt = EVENTS.find((e) => e.eventId === eid);
                          return (
                            <span
                              key={eid}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white border border-black"
                              style={{ background: '#E2231A', ...COMIC_FONT }}
                              onClick={(e) => { e.stopPropagation(); toggleEventSelection(eid); }}
                            >
                              {eid}
                              <span className="text-white/70 font-normal hidden sm:inline">— {evt?.title.split(' ')[0]}</span>
                              <X className="w-3 h-3 ml-0.5" />
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-black flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {errors.selectedEvents && <p className="text-[11px] font-black mt-1" style={{ color: '#E2231A' }}>{errors.selectedEvents}</p>}

                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border-2 border-black z-30 max-h-72 overflow-y-auto space-y-4"
                      style={{ boxShadow: '4px 4px 0 #0a0a0a' }}
                    >
                      {[
                        { cat: 'Technical', color: '#E2231A', icon: '⚡', label: 'TECHNICAL EVENTS' },
                        { cat: 'Non-Technical', color: '#0a0a0a', icon: '🎭', label: 'NON-TECHNICAL EVENTS' },
                        { cat: 'Special Event', color: '#b45309', icon: '🏆', label: 'SPECIAL EVENTS' },
                      ].map(({ cat, color, icon, label }) => (
                        <div key={cat}>
                          <div className="text-[10px] uppercase mb-1.5 px-1 flex items-center gap-2" style={{ color, ...COMIC_FONT }}>
                            <span className="h-0.5 w-4 inline-block" style={{ background: color }} />
                            {icon} {label}
                          </div>
                          <div className="space-y-0.5">
                            {EVENTS.filter((e) => e.category === cat).map((e) => {
                              const isChecked = formData.selectedEventIds.includes(e.eventId);
                              return (
                                <div
                                  key={e.eventId}
                                  onClick={() => toggleEventSelection(e.eventId)}
                                  className="flex items-center justify-between px-2 py-1.5 cursor-pointer border text-xs transition-colors"
                                  style={{ border: isChecked ? `2px solid ${color}` : '2px solid transparent', background: isChecked ? `${color}18` : 'transparent' }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-black flex items-center justify-center" style={{ background: isChecked ? color : 'white' }}>
                                      {isChecked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                    </div>
                                    <span className="font-black" style={{ color }}>{e.eventId}</span>
                                    <span className="font-bold text-black">— {e.title}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-gray-500">{e.teamSize.description}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t-2 border-black flex items-center justify-between">
                        <span className="text-[10px] text-gray-500" style={COMIC_FONT}>
                          {formData.selectedEventIds.length}/{EVENTS.length} SELECTED
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(false)}
                          className="px-4 py-1.5 text-xs text-white border-2 border-black"
                          style={{ background: '#0a0a0a', ...COMIC_FONT }}
                        >
                          ✓ DONE
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* PARTICIPANT INTEL section */}
                <div>
                  <div className="py-1 px-3 mb-3 border-l-4 border-black" style={{ background: '#FFC928' }}>
                    <span className="text-[11px] uppercase text-black" style={COMIC_FONT}>◆ PARTICIPANT INTEL ◆</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>FULL NAME (LEADER) *</label>
                      <input type="text" name="fullName" placeholder="e.g. Rahul Sharma"
                        value={formData.fullName} onChange={handleInputChange}
                        className="w-full px-3 py-2.5 text-sm focus:outline-none"
                        style={errors.fullName ? MANGA_INPUT_ERR : MANGA_INPUT} />
                      {errors.fullName && <p className="text-[11px] font-black mt-1" style={{ color: '#E2231A' }}>{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>EMAIL ADDRESS *</label>
                      <input type="email" name="email" placeholder="e.g. rahul@gmail.com"
                        value={formData.email} onChange={handleInputChange}
                        className="w-full px-3 py-2.5 text-sm focus:outline-none"
                        style={errors.email ? MANGA_INPUT_ERR : MANGA_INPUT} />
                      {errors.email && <p className="text-[11px] font-black mt-1" style={{ color: '#E2231A' }}>{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>MOBILE NUMBER *</label>
                      <input type="tel" name="phone" placeholder="e.g. 9840123456"
                        value={formData.phone} onChange={handleInputChange}
                        className="w-full px-3 py-2.5 text-sm focus:outline-none"
                        style={errors.phone ? MANGA_INPUT_ERR : MANGA_INPUT} />
                      {errors.phone && <p className="text-[11px] font-black mt-1" style={{ color: '#E2231A' }}>{errors.phone}</p>}
                    </div>

                    {/* Year */}
                    <div>
                      <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>YEAR OF STUDY *</label>
                      <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleInputChange}
                        className="w-full px-3 py-2.5 text-sm focus:outline-none appearance-none cursor-pointer"
                        style={MANGA_INPUT}>
                        {['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG'].map((y) => (
                          <option key={y} value={y}>{y} {y !== 'PG' ? '(UG)' : '(Postgraduate)'}</option>
                        ))}
                      </select>
                    </div>

                    {/* College */}
                    <div>
                      <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>COLLEGE / INSTITUTION *</label>
                      <input type="text" name="collegeName" placeholder="e.g. Sriram Engineering College"
                        value={formData.collegeName} onChange={handleInputChange}
                        className="w-full px-3 py-2.5 text-sm focus:outline-none"
                        style={errors.collegeName ? MANGA_INPUT_ERR : MANGA_INPUT} />
                      {errors.collegeName && <p className="text-[11px] font-black mt-1" style={{ color: '#E2231A' }}>{errors.collegeName}</p>}
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>BRANCH / DEPARTMENT *</label>
                      <input type="text" name="department" placeholder="e.g. B.Tech AI & Data Science"
                        value={formData.department} onChange={handleInputChange}
                        className="w-full px-3 py-2.5 text-sm focus:outline-none"
                        style={errors.department ? MANGA_INPUT_ERR : MANGA_INPUT} />
                      {errors.department && <p className="text-[11px] font-black mt-1" style={{ color: '#E2231A' }}>{errors.department}</p>}
                    </div>
                  </div>
                </div>

                {/* TEAM SECTION */}
                {allowsTeams && (
                  <div style={MANGA_PANEL}>
                    <div className="px-4 py-2 border-b-2 border-black flex items-center justify-between" style={{ background: '#0a0a0a', borderBottom: '3px solid #0a0a0a' }}>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white" />
                        <h4 className="text-white text-xs uppercase" style={COMIC_FONT}>
                          TEAM REGISTRATION (UP TO {maxTeamSize} MEMBERS)
                        </h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isTeam" checked={formData.isTeam} onChange={handleInputChange} className="sr-only peer" />
                        <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600" />
                      </label>
                    </div>

                    {formData.isTeam && (
                      <div className="p-4 space-y-3" style={{ background: '#FFFEF0' }}>
                        <div>
                          <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>TEAM NAME *</label>
                          <input type="text" name="teamName" placeholder="e.g. Cyber Knights"
                            value={formData.teamName} onChange={handleInputChange}
                            className="w-full px-3 py-2 text-xs focus:outline-none"
                            style={errors.teamName ? MANGA_INPUT_ERR : MANGA_INPUT} />
                          {errors.teamName && <p className="text-[11px] font-black mt-1" style={{ color: '#E2231A' }}>{errors.teamName}</p>}
                        </div>

                        {(formData.teamMembers || []).map((member, idx) => (
                          <div key={idx} className="p-2 border-2 border-black grid grid-cols-1 sm:grid-cols-3 gap-2 relative" style={{ background: '#fff' }}>
                            <span className="absolute -top-2 -left-2 w-5 h-5 text-white text-[9px] flex items-center justify-center border border-black" style={{ background: '#E2231A', ...COMIC_FONT }}>{idx + 2}</span>
                            <input type="text" placeholder={`Member ${idx + 2} Name`} value={member.name}
                              onChange={(e) => handleTeamMemberChange(idx, 'name', e.target.value)}
                              className="px-2 py-1.5 text-black text-xs font-bold focus:outline-none border border-black bg-white" />
                            <input type="email" placeholder="Email" value={member.email}
                              onChange={(e) => handleTeamMemberChange(idx, 'email', e.target.value)}
                              className="px-2 py-1.5 text-black text-xs font-bold focus:outline-none border border-black bg-white" />
                            <div className="flex items-center gap-2">
                              <input type="tel" placeholder="Phone" value={member.phone}
                                onChange={(e) => handleTeamMemberChange(idx, 'phone', e.target.value)}
                                className="w-full px-2 py-1.5 text-black text-xs font-bold focus:outline-none border border-black bg-white" />
                              <button type="button" onClick={() => handleRemoveTeamMember(idx)}
                                className="p-1.5 border-2 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex-shrink-0"
                                style={{ borderColor: '#E2231A' }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {(formData.teamMembers || []).length < maxTeamSize - 1 && (
                          <button type="button" onClick={handleAddTeamMember}
                            className="w-full py-2 text-xs text-black border-2 border-dashed border-black flex items-center justify-center gap-1.5 hover:bg-black hover:text-white transition-colors"
                            style={COMIC_FONT}>
                            <Plus className="w-3.5 h-3.5" />
                            ADD TEAMMATE ({(formData.teamMembers || []).length + 1}/{maxTeamSize})
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* REFERRAL SOURCE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>HOW'D YOU HEAR ABOUT THIS? *</label>
                    <select name="referralSource" value={formData.referralSource} onChange={handleInputChange}
                      className="w-full px-3 py-2.5 text-sm focus:outline-none appearance-none cursor-pointer"
                      style={errors.referralSource ? MANGA_INPUT_ERR : MANGA_INPUT}>
                      {REFERRAL_SOURCES.map((source) => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>

                  {formData.referralSource === 'Other' && (
                    <div>
                      <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>PLEASE SPECIFY *</label>
                      <input type="text" name="referralSourceOther" placeholder="e.g. WhatsApp Group"
                        value={formData.referralSourceOther} onChange={handleInputChange}
                        className="w-full px-3 py-2.5 text-sm focus:outline-none"
                        style={errors.referralSourceOther ? MANGA_INPUT_ERR : MANGA_INPUT} />
                    </div>
                  )}
                </div>

                {/* ══ PAYMENT SECTION ══════════════════════════════════════ */}
                <div style={MANGA_PANEL}>
                  <div className="px-4 py-2 border-b-3 border-black" style={{ background: '#0a0a0a', borderBottom: '3px solid #0a0a0a' }}>
                    <span className="text-white text-xs uppercase" style={COMIC_FONT}>💳 UPI PAYMENT (OPTIONAL)</span>
                  </div>
                  <div className="p-4 space-y-4" style={{ background: '#FFFEF0' }}>

                    {/* Info Banner */}
                    <div className="p-2.5 border-2 border-black text-xs flex items-start gap-2" style={{ background: '#FFC928' }}>
                      <Smartphone className="w-4 h-4 flex-shrink-0 mt-0.5 text-black" />
                      <span style={COMIC_FONT} className="text-black leading-relaxed">
                        REGISTRATION IS FREE! For paid events or merch, scan the QR below, then enter your UTR / transaction ID and upload the screenshot.
                      </span>
                    </div>

                    {/* UPI QR Code */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        <div className="p-2 bg-white border-2 border-black inline-block" style={{ boxShadow: '3px 3px 0 #0a0a0a' }}>
                          {/* UPI QR: encoded as a standard UPI deep-link */}
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${UPI_AMOUNT}&cu=INR`)}`}
                            alt="UPI Payment QR Code"
                            className="w-36 h-36 sm:w-40 sm:h-40"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://chart.googleapis.com/chart?chs=160x160&cht=qr&chl=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR`)}`; }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-black" style={COMIC_FONT}>UPI ID</p>
                          <p className="text-xs font-bold text-red-700 select-all" style={{ fontFamily: 'monospace' }}>{UPI_ID}</p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        {/* Transaction ID */}
                        <div>
                          <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>
                            UTR / TRANSACTION ID (After payment)
                          </label>
                          <input
                            type="text"
                            name="upiTransactionId"
                            placeholder="e.g. 426891234567"
                            value={formData.upiTransactionId}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 text-sm focus:outline-none"
                            style={MANGA_INPUT}
                          />
                          <p className="text-[10px] text-gray-500 mt-0.5" style={COMIC_FONT}>
                            12-digit reference from your UPI app
                          </p>
                        </div>

                        {/* Screenshot Upload */}
                        <div>
                          <label className="block text-[10px] uppercase text-black mb-1" style={COMIC_FONT}>
                            PAYMENT SCREENSHOT
                          </label>
                          <input
                            ref={screenshotInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleScreenshotSelect}
                          />

                          {screenshotPreview ? (
                            <div className="relative border-2 border-black" style={{ boxShadow: '2px 2px 0 #0a0a0a' }}>
                              <img src={screenshotPreview} alt="Payment screenshot" className="w-full h-28 object-cover" />
                              {isUploading && (
                                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#E2231A' }} />
                                  <span className="text-[10px] font-black" style={COMIC_FONT}>UPLOADING…</span>
                                </div>
                              )}
                              {uploadedUrl && !isUploading && (
                                <div className="absolute top-1 right-1 bg-green-600 text-white p-1 rounded">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => screenshotInputRef.current?.click()}
                                className="w-full py-1.5 text-[10px] text-white border-t-2 border-black flex items-center justify-center gap-1"
                                style={{ background: '#0a0a0a', ...COMIC_FONT }}
                              >
                                <ImagePlus className="w-3 h-3" /> CHANGE SCREENSHOT
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => screenshotInputRef.current?.click()}
                              className="w-full h-20 border-2 border-dashed border-black flex flex-col items-center justify-center gap-1.5 hover:bg-black/5 transition-colors"
                              style={{ background: '#fff', ...COMIC_FONT }}
                            >
                              <UploadCloud className="w-6 h-6 text-black" />
                              <span className="text-[10px] font-black text-black">CLICK TO UPLOAD SCREENSHOT</span>
                              <span className="text-[9px] text-gray-500">JPG / PNG / WEBP · Max 5 MB</span>
                            </button>
                          )}

                          {uploadError && (
                            <p className="text-[10px] font-black mt-1" style={{ color: '#E2231A' }}>{uploadError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RULES AGREEMENT */}
                <div className="flex items-start gap-2.5 p-3 border-2 border-black" style={{ background: '#FFC928' }}>
                  <input type="checkbox" name="agreedToRules" id="agreedToRules"
                    checked={formData.agreedToRules} onChange={handleInputChange}
                    className="mt-0.5 w-4 h-4 border-2 border-black accent-black" />
                  <label htmlFor="agreedToRules" className="text-xs text-black leading-normal" style={COMIC_FONT}>
                    I AGREE TO BRING MY OFFICIAL COLLEGE ID CARD AND FOLLOW ALL DISCIPLINE GUIDELINES OF SRIRAM ENGINEERING COLLEGE!
                  </label>
                </div>

                {/* Server error */}
                {errors.form && (
                  <div className="p-3 border-2 border-red-600 flex items-center gap-2" style={{ background: '#fff0f0' }}>
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-xs font-black text-red-600">{errors.form}</span>
                  </div>
                )}

                {/* SUBMIT */}
                <div className="pt-4 border-t-4 border-black flex items-center justify-end gap-3">
                  <button type="button" onClick={onClose}
                    className="px-5 py-2.5 text-xs text-black border-2 border-black hover:bg-black hover:text-white transition-colors"
                    style={COMIC_FONT}>
                    CANCEL
                  </button>

                  <button type="submit" disabled={isSubmitting}
                    className="px-6 py-3 text-sm text-white border-2 border-black flex items-center gap-2 disabled:opacity-50"
                    style={{ background: '#E2231A', ...COMIC_FONT, boxShadow: '4px 4px 0 #0a0a0a' }}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        CONFIRMING…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        CONFIRM REGISTRATION ({formData.selectedEventIds.length} EVENTS)!!
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
