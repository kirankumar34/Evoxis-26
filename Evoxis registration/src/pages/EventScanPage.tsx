import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { operationsApi } from '../services/operationsApi';
import {
  ScanResultState,
  ScanOperationResponse,
  ParticipantProfile,
  EventTeamContext,
  EventTeamMemberRosterItem,
} from '../types';
import { getEventById } from '../config/events';
import { CameraScanner } from '../components/common/CameraScanner';
import { StatusBanner } from '../components/common/StatusBanner';
import { audio } from '../services/audioService';
import {
  ArrowLeft,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  QrCode,
  ShieldCheck,
  UserCheck,
  User,
  Sparkles,
} from 'lucide-react';

type AttendanceWorkflowState =
  | 'IDLE'
  | 'NOT_REGISTERED'
  | 'ELIGIBLE'
  | 'ALREADY_PRESENT'
  | 'MARKED_SUCCESS';

export const EventScanPage: React.FC = () => {
  const { eventId = 'TE02' } = useParams<{ eventId: string }>();
  const { user, hasRole, currentStation, portalMode } = useAuth();

  const eventMeta = getEventById(eventId);
  const eventTitle = eventMeta ? eventMeta.title : eventId;
  const isTeamEvent = eventMeta?.type === 'Team';

  const [scannedPhysicalQr, setScannedPhysicalQr] = useState<string>('');
  const [resolvedParticipant, setResolvedParticipant] = useState<ParticipantProfile | null>(null);
  const [teamContext, setTeamContext] = useState<EventTeamContext | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [attendanceWorkflow, setAttendanceWorkflow] = useState<AttendanceWorkflowState>('IDLE');
  const [attendanceTimestamp, setAttendanceTimestamp] = useState<string>('');

  const [scanResult, setScanResult] = useState<ScanOperationResponse | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [manualQrInput, setManualQrInput] = useState('');

  const [isAdminOverride, setIsAdminOverride] = useState(false);
  const [overrideReason] = useState('On-spot coordinator approval');

  const [recentEventScans, setRecentEventScans] = useState<
    Array<{ name: string; regId: string; eventId: string; time: string; state: 'PRESENT' }>
  >([]);

  const isSuperAdmin = hasRole(['SUPER_ADMIN']);

  // Active target member derived from teamContext or resolvedParticipant
  const activeMember: EventTeamMemberRosterItem | null = useMemo(() => {
    if (isTeamEvent && teamContext && teamContext.members.length > 0) {
      const match = teamContext.members.find(
        (m) => m.participantId === (selectedMemberId || resolvedParticipant?.id)
      );
      if (match) return match;
    }
    if (resolvedParticipant) {
      return {
        participantId: resolvedParticipant.id,
        registrationId: resolvedParticipant.registrationId,
        name: resolvedParticipant.participantName,
        role: (resolvedParticipant.role === 'TEAM_HEAD' ? 'TEAM_HEAD' : 'TEAM_MEMBER') as any,
        isRegisteredForEvent: resolvedParticipant.selectedEvents.some(
          (e) => e.trim().toUpperCase() === eventId.trim().toUpperCase()
        ),
        attendanceStatus:
          attendanceWorkflow === 'ALREADY_PRESENT' || attendanceWorkflow === 'MARKED_SUCCESS'
            ? 'Present'
            : 'Not Present',
        physicalQrId: scannedPhysicalQr,
        checkinTime: attendanceTimestamp,
      };
    }
    return null;
  }, [isTeamEvent, teamContext, selectedMemberId, resolvedParticipant, attendanceWorkflow, scannedPhysicalQr, attendanceTimestamp, eventId]);

  /**
   * Step 1: Scan & Resolve Physical QR -> Validate Event Registration -> Check Attendance & Team Roster
   */
  const handleScan = async (rawQrCode: string) => {
    const cleanQr = rawQrCode.trim().toUpperCase();
    if (!cleanQr) return;

    setScannedPhysicalQr(cleanQr);
    setIsPaused(true);

    try {
      // 1. Resolve participant via single shared resolver
      const resolution = await operationsApi.resolvePhysicalQR(cleanQr, portalMode);

      if (!resolution.success || !resolution.participant) {
        setResolvedParticipant(null);
        setTeamContext(null);
        setSelectedMemberId(null);
        setAttendanceWorkflow('IDLE');
        const errCode = resolution.errorCode || 'QR_NOT_FOUND';

        let state: ScanResultState = 'NOT_FOUND';
        let msg = 'PARTICIPANT NOT FOUND';

        if (errCode === 'INVALID_QR_FORMAT') {
          state = 'INVALID_QR';
          msg = 'INVALID QR FORMAT';
        } else if (errCode === 'QR_NOT_FOUND') {
          state = 'QR_NOT_FOUND';
          msg = 'QR NOT FOUND IN INVENTORY';
        } else if (errCode === 'QR_NOT_ASSIGNED') {
          state = 'UNASSIGNED_QR';
          msg = 'QR NOT ASSIGNED — VISIT RECEPTION';
        } else if (errCode === 'QR_REVOKED') {
          state = 'QR_REVOKED';
          msg = 'QR REVOKED';
        } else if (errCode === 'TEST_QR_IN_PRODUCTION_MODE') {
          state = 'TEST_QR_IN_PROD';
          msg = 'TEST QR IN PRODUCTION MODE';
        } else if (errCode === 'PRODUCTION_QR_IN_TEST_MODE') {
          state = 'PROD_QR_IN_TEST';
          msg = 'PRODUCTION QR IN TEST MODE';
        }

        setScanResult({
          state,
          verbatimMessage: msg,
          details: resolution.errorMessage || `No active registration found for QR ${cleanQr}`,
        });
        audio.playError();
        return;
      }

      const participant = resolution.participant;
      setResolvedParticipant(participant);
      setSelectedMemberId(participant.id);

      // 2. Check if participant is registered for the current event
      const isRegistered = participant.selectedEvents.some(
        (e) => e.trim().toUpperCase() === eventId.trim().toUpperCase()
      );

      // Load Team Roster Context for Team Events
      if (isTeamEvent && (participant.teamName || participant.registrationType === 'Team')) {
        const teamRosterRes = await operationsApi.getEventTeamRoster({
          registrationId: participant.registrationId,
          eventId,
        });
        if (teamRosterRes.success && teamRosterRes.data) {
          setTeamContext(teamRosterRes.data);
        } else {
          setTeamContext(null);
        }
      } else {
        setTeamContext(null);
      }

      if (!isRegistered && !isAdminOverride) {
        setAttendanceWorkflow('NOT_REGISTERED');
        setScanResult({
          state: 'WRONG_EVENT',
          verbatimMessage: 'PARTICIPANT FOUND — NOT REGISTERED FOR THIS EVENT',
          registeredEvents: participant.selectedEvents,
          details: `This participant is not registered for ${eventId}. Registered events: ${participant.selectedEvents.join(', ')}`,
          participant,
        });
        audio.playWarning();
        return;
      }

      // 3. Check if participant is already marked present for this event
      const attendanceCheck = await operationsApi.checkEventAttendance({
        participantId: participant.id,
        eventId,
      });

      if (attendanceCheck.isPresent) {
        setAttendanceWorkflow('ALREADY_PRESENT');
        const formattedTime = attendanceCheck.checkinTime
          ? new Date(attendanceCheck.checkinTime).toLocaleTimeString()
          : '';
        setAttendanceTimestamp(formattedTime);

        setScanResult({
          state: 'DUPLICATE_EVENT',
          verbatimMessage: 'ALREADY PRESENT',
          originalTime: attendanceCheck.checkinTime,
          originalStation: attendanceCheck.station,
          details: `Participant already marked present for ${eventId} at ${formattedTime}`,
          participant,
        });
        audio.playWarning();
      } else {
        // 4. Eligible to mark as present
        setAttendanceWorkflow('ELIGIBLE');
        setScanResult(null);
        audio.playSuccess();
      }
    } catch (err: any) {
      setResolvedParticipant(null);
      setTeamContext(null);
      setSelectedMemberId(null);
      setAttendanceWorkflow('IDLE');
      setScanResult({
        state: 'OFFLINE_ERROR',
        verbatimMessage: 'Lookup failure. Please scan again.',
        details: err?.message || 'Error resolving QR code',
      });
      audio.playError();
    } finally {
      setTimeout(() => {
        setIsPaused(false);
      }, 1500);
    }
  };

  /**
   * Handle selecting a team member from the interactive roster
   */
  const handleSelectMember = (member: EventTeamMemberRosterItem) => {
    setSelectedMemberId(member.participantId);
    setScanResult(null);

    if (!member.isRegisteredForEvent && !isAdminOverride) {
      setAttendanceWorkflow('NOT_REGISTERED');
      setScanResult({
        state: 'WRONG_EVENT',
        verbatimMessage: 'PARTICIPANT FOUND — NOT REGISTERED FOR THIS EVENT',
        details: `${member.name} (${member.participantId}) is not registered for ${eventId}.`,
        participant: resolvedParticipant || undefined,
      });
    } else if (member.attendanceStatus === 'Present') {
      setAttendanceWorkflow('ALREADY_PRESENT');
      setAttendanceTimestamp(
        member.checkinTime ? new Date(member.checkinTime).toLocaleTimeString() : ''
      );
    } else {
      setAttendanceWorkflow('ELIGIBLE');
      setAttendanceTimestamp('');
    }
  };

  /**
   * Step 2: When coordinator clicks [ MARK AS PRESENT ] button
   */
  const handleMarkPresent = async () => {
    if (!resolvedParticipant) return;

    const targetId = selectedMemberId || resolvedParticipant.id;
    const targetName = activeMember?.name || resolvedParticipant.participantName;
    const targetQr = activeMember?.physicalQrId || (targetId === resolvedParticipant.id ? scannedPhysicalQr : undefined);

    setIsMarking(true);
    try {
      const response = await operationsApi.markEventPresent({
        physicalQrId: targetQr,
        participantId: targetId,
        eventId,
        staffId: user?.name || 'Event Coordinator',
        station: `${currentStation} (${eventId})`,
        portalMode,
        isAdminOverride: isSuperAdmin && isAdminOverride,
        overrideReason: isAdminOverride ? overrideReason : undefined,
      });

      setScanResult(response);

      if (response.state === 'SUCCESS') {
        const timeNow = response.timestamp
          ? new Date(response.timestamp).toLocaleTimeString()
          : new Date().toLocaleTimeString();

        setAttendanceWorkflow('MARKED_SUCCESS');
        setAttendanceTimestamp(timeNow);
        audio.playSuccess();

        // Update local teamContext directly for instantaneous UI feedback
        if (teamContext) {
          const updatedMembers = teamContext.members.map((m) =>
            m.participantId === targetId
              ? {
                  ...m,
                  attendanceStatus: 'Present' as const,
                  checkinTime: response.timestamp || new Date().toISOString(),
                }
              : m
          );
          const presentCount = updatedMembers.filter((m) => m.attendanceStatus === 'Present').length;
          setTeamContext({
            ...teamContext,
            members: updatedMembers,
            presentCount,
          });
        }

        // Background sync to ensure all data layers are hydrated
        if (response.teamEventContext) {
          setTeamContext(response.teamEventContext);
        } else if (isTeamEvent && resolvedParticipant.registrationId) {
          operationsApi
            .getEventTeamRoster({
              registrationId: resolvedParticipant.registrationId,
              eventId,
            })
            .then((freshTeam) => {
              if (freshTeam.success && freshTeam.data) {
                setTeamContext(freshTeam.data);
              }
            });
        }

        // Update Desk Check-in History (This Session) ONLY after successful mark
        setRecentEventScans((prev) => [
          {
            name: targetName,
            regId: targetId,
            eventId,
            time: timeNow,
            state: 'PRESENT',
          },
          ...prev.slice(0, 19),
        ]);
      } else if (response.state === 'DUPLICATE_EVENT') {
        setAttendanceWorkflow('ALREADY_PRESENT');
        setAttendanceTimestamp(
          response.originalTime ? new Date(response.originalTime).toLocaleTimeString() : ''
        );
        if (response.teamEventContext) {
          setTeamContext(response.teamEventContext);
        }
        audio.playWarning();
      } else {
        audio.playError();
      }
    } catch (err: any) {
      setScanResult({
        state: 'OFFLINE_ERROR',
        verbatimMessage: 'Attendance write failed. Please retry.',
        details: err?.message || 'Network write failure',
      });
      audio.playError();
    } finally {
      setIsMarking(false);
    }
  };

  const handleReset = () => {
    setScannedPhysicalQr('');
    setResolvedParticipant(null);
    setTeamContext(null);
    setSelectedMemberId(null);
    setAttendanceWorkflow('IDLE');
    setAttendanceTimestamp('');
    setScanResult(null);
    setManualQrInput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Event Desk Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/events"
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Event Desks</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {eventId.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>{eventTitle}</span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {eventMeta?.category || 'Technical'}
            </span>
          </h1>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {eventMeta?.venue || 'Campus Arena'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {eventMeta?.startTime} - {eventMeta?.endTime}
            </span>
          </div>
        </div>

        {/* Super Admin Override Mode */}
        {isSuperAdmin && (
          <div className="p-3 rounded-2xl bg-violet-950/30 border border-violet-500/30 flex items-center gap-3">
            <input
              type="checkbox"
              id="adminOverrideCheck"
              checked={isAdminOverride}
              onChange={(e) => setIsAdminOverride(e.target.checked)}
              className="w-4 h-4 rounded text-violet-500 focus:ring-violet-400 border-slate-700 bg-slate-900"
            />
            <label htmlFor="adminOverrideCheck" className="text-xs font-mono text-violet-200 cursor-pointer">
              <span className="font-bold block">Admin Override Mode</span>
              <span className="text-[10px] text-violet-400">Bypasses event registration eligibility</span>
            </label>
          </div>
        )}
      </div>

      {/* Verbatim Scan Status Banner */}
      <StatusBanner
        state={scanResult?.state || null}
        message={scanResult?.verbatimMessage || ''}
        details={scanResult?.details}
        registeredEvents={scanResult?.registeredEvents}
        originalTime={scanResult?.originalTime}
        originalStation={scanResult?.originalStation}
        onDismiss={() => setScanResult(null)}
      />

      {/* Scanner & Participant Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Camera Scanner & Manual Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <CameraScanner
              onScan={handleScan}
              isPaused={isPaused}
              promptText={`Scan participant wristband for ${eventTitle}`}
            />

            {/* Manual QR Fallback */}
            <div className="pt-3 border-t border-slate-800/80">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Manual Physical QR / Wristband Input</span>
              </label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualQrInput.trim()) {
                    handleScan(manualQrInput.trim());
                    setManualQrInput('');
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={manualQrInput}
                  onChange={(e) => setManualQrInput(e.target.value.toUpperCase())}
                  placeholder="e.g. EVX26-TEST-000051 or EVX26-WB-000001"
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors"
                >
                  Verify
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Participant Details, Mark Present Action, and Session History */}
        <div className="lg:col-span-6 space-y-4">
          {/* Participant Verification Card */}
          {resolvedParticipant ? (
            isTeamEvent && teamContext ? (
              /* A. TEAM EVENT ATTENDEE & ROSTER CARD */
              <div className="p-6 rounded-3xl glass-panel border border-cyan-500/40 space-y-5 shadow-2xl shadow-cyan-950/30 animate-in fade-in">
                {/* Top Header */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>VERIFIED TEAM ATTENDEE</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/30">
                      TEAM EVENT
                    </span>
                  </div>
                </div>

                {/* Team Details & Attendance Counter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      TEAM
                    </span>
                    <h3 className="text-xl font-black text-white tracking-tight truncate">
                      {teamContext.teamName}
                    </h3>
                    <p className="text-xs font-mono text-cyan-300 mt-0.5">
                      Team Reg ID: <strong className="text-white">{teamContext.registrationId}</strong>
                    </p>
                  </div>

                  <div className="sm:text-right flex flex-col justify-center">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      TEAM ATTENDANCE
                    </span>
                    <div className="flex items-center sm:justify-end gap-2 mt-0.5">
                      <span
                        className={`text-base font-black font-mono px-3 py-1 rounded-xl border ${
                          teamContext.presentCount === teamContext.totalMembers
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {teamContext.presentCount} / {teamContext.totalMembers} PRESENT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Members Registered for this Event */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>TEAM MEMBERS REGISTERED FOR THIS EVENT ({teamContext.members.length}):</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      Click any member to select
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {teamContext.members.map((member, idx) => {
                      const isSelected = member.participantId === (selectedMemberId || resolvedParticipant.id);
                      const isCurrentlyScanned = member.participantId === resolvedParticipant.id;
                      const isMemberPresent = member.attendanceStatus === 'Present';

                      return (
                        <div
                          key={member.participantId}
                          onClick={() => handleSelectMember(member)}
                          role="button"
                          tabIndex={0}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 text-left ${
                            isSelected
                              ? 'bg-gradient-to-r from-cyan-950/90 to-slate-900 border-cyan-400 shadow-xl shadow-cyan-950/60 ring-2 ring-cyan-500/50'
                              : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-600 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold ${
                              isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-white truncate">
                                  {member.name}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black uppercase tracking-wider shadow-sm shadow-cyan-500/50">
                                    ACTIVE TARGET
                                  </span>
                                )}
                                {isCurrentlyScanned && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40 uppercase tracking-wider">
                                    SCANNED QR
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                                <span>{member.participantId}</span>
                                <span>·</span>
                                <span
                                  className={
                                    member.role === 'TEAM_HEAD'
                                      ? 'text-amber-400 font-bold'
                                      : 'text-slate-400'
                                  }
                                >
                                  {member.role === 'TEAM_HEAD' ? 'Team Head' : 'Team Member'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isMemberPresent ? (
                              <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Present</span>
                              </span>
                            ) : (
                              <span className={`text-xs font-mono px-2.5 py-1 rounded-xl font-bold border flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-500'}`}></span>
                                <span>{isSelected ? 'Ready to Mark' : 'Not Present'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Currently Scanned Target Highlight & Action Area */}
                <div className="pt-3 border-t border-slate-800/90 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                        CONFIRMING ATTENDANCE FOR (SELECTED TARGET)
                      </span>
                      <p className="text-base font-bold text-white tracking-tight">
                        {activeMember?.name || resolvedParticipant.participantName}
                      </p>
                      <p className="text-xs font-mono text-cyan-300">
                        {activeMember?.participantId || resolvedParticipant.id} ({activeMember?.role?.replace('_', ' ') || resolvedParticipant.role?.replace('_', ' ') || 'TEAM MEMBER'})
                      </p>
                    </div>
                    {(activeMember?.physicalQrId || (selectedMemberId === resolvedParticipant.id && scannedPhysicalQr)) && (
                      <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-slate-900 text-cyan-300 border border-slate-700 font-bold self-start sm:self-auto">
                        QR: {activeMember?.physicalQrId || scannedPhysicalQr}
                      </span>
                    )}
                  </div>

                  {/* 1. NOT REGISTERED FOR THIS EVENT */}
                  {attendanceWorkflow === 'NOT_REGISTERED' && (
                    <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>NOT REGISTERED FOR THIS EVENT</span>
                      </div>
                      <p className="text-xs font-mono text-rose-300/80">
                        <strong>{activeMember?.name || resolvedParticipant.participantName}</strong> is not registered for {eventId}. Direct attendee to their registered desks.
                      </p>
                    </div>
                  )}

                  {/* 2. REGISTERED AND ELIGIBLE TO MARK PRESENT */}
                  {attendanceWorkflow === 'ELIGIBLE' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Eligible to mark attendance for <strong>{activeMember?.name || resolvedParticipant.participantName}</strong>
                        </span>
                      </div>

                      <button
                        id="btn-mark-as-present"
                        onClick={handleMarkPresent}
                        disabled={isMarking}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base md:text-lg shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isMarking ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>RECORDING ATTENDANCE...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-6 h-6" />
                            <span>MARK {activeMember?.name?.toUpperCase() || resolvedParticipant.participantName.toUpperCase()} AS PRESENT</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 3. ALREADY MARKED PRESENT */}
                  {attendanceWorkflow === 'ALREADY_PRESENT' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-1.5 font-mono text-xs">
                        <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>ALREADY MARKED PRESENT</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-amber-300/80 pt-1">
                          <div>Attendee: <strong className="text-white">{activeMember?.name || resolvedParticipant.participantName}</strong></div>
                          <div>Event: <strong className="text-white">{eventId}</strong></div>
                          {attendanceTimestamp && (
                            <div className="col-span-2">
                              Checked In At: <strong className="text-white">{attendanceTimestamp}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        disabled
                        className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>✓ {activeMember?.name || resolvedParticipant.participantName} IS ALREADY PRESENT</span>
                      </button>
                    </div>
                  )}

                  {/* 4. JUST SUCCESSFULLY MARKED PRESENT */}
                  {attendanceWorkflow === 'MARKED_SUCCESS' && (
                    <div className="space-y-3 animate-in zoom-in-95">
                      <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-400 text-emerald-200 space-y-2 font-mono text-xs shadow-lg shadow-emerald-950/50">
                        <div className="flex items-center gap-2 font-black text-sm text-emerald-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>✓ ATTENDANCE RECORDED</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-emerald-200/90 pt-1 border-t border-emerald-500/30">
                          <div>Participant: <strong className="text-white">{activeMember?.name || resolvedParticipant.participantName}</strong></div>
                          <div>Event: <strong className="text-white">{eventId}</strong></div>
                          <div>Registration ID: <strong className="text-white">{activeMember?.participantId || resolvedParticipant.id}</strong></div>
                          <div>Time: <strong className="text-white">{attendanceTimestamp || 'Just Now'}</strong></div>
                        </div>
                      </div>

                      <button
                        disabled
                        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>✓ {activeMember?.name || resolvedParticipant.participantName} MARKED PRESENT</span>
                      </button>
                    </div>
                  )}

                  {/* Scan Another / Clear Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleReset}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan Next Attendee</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* B. INDIVIDUAL EVENT ATTENDEE CARD */
              <div className="p-6 rounded-3xl glass-panel border border-cyan-500/30 space-y-4 shadow-xl shadow-cyan-950/20 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>VERIFIED ATTENDEE</span>
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    {resolvedParticipant.role || 'INDIVIDUAL'}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {resolvedParticipant.participantName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-300 mt-1">
                    <span>
                      Reg ID: <strong className="text-cyan-300">{resolvedParticipant.id || resolvedParticipant.registrationId}</strong>
                    </span>
                    <span>·</span>
                    <span>{resolvedParticipant.college}</span>
                    {resolvedParticipant.department && (
                      <>
                        <span>·</span>
                        <span className="text-slate-400">{resolvedParticipant.department}</span>
                      </>
                    )}
                  </div>

                  {resolvedParticipant.teamName && (
                    <p className="text-xs font-mono text-amber-300/90 mt-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Team: <strong>{resolvedParticipant.teamName}</strong></span>
                    </p>
                  )}
                </div>

                {/* Registered Events List */}
                <div className="pt-3 border-t border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Registered Events ({resolvedParticipant.selectedEvents.length}):</span>
                    {scannedPhysicalQr && (
                      <span className="text-[11px] text-cyan-400 font-bold">QR: {scannedPhysicalQr}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resolvedParticipant.selectedEvents.map((evtId) => {
                      const isCurrent = evtId.trim().toUpperCase() === eventId.trim().toUpperCase();
                      return (
                        <span
                          key={evtId}
                          className={`text-xs font-mono px-2.5 py-1 rounded-lg font-bold transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {evtId}
                          {isCurrent && ' (THIS EVENT)'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Event Registration Status Badges & Action Buttons */}
                <div className="pt-3 border-t border-slate-800/90 space-y-3">
                  {/* 1. NOT REGISTERED FOR THIS EVENT */}
                  {attendanceWorkflow === 'NOT_REGISTERED' && (
                    <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>NOT REGISTERED FOR THIS EVENT</span>
                      </div>
                      <p className="text-xs font-mono text-rose-300/80">
                        Participant is not registered for {eventId}. Direct attendee to their registered desks ({resolvedParticipant.selectedEvents.join(', ')}).
                      </p>
                    </div>
                  )}

                  {/* 2. REGISTERED AND ELIGIBLE TO MARK PRESENT */}
                  {attendanceWorkflow === 'ELIGIBLE' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold">REGISTERED FOR THIS EVENT</span>
                      </div>

                      <button
                        id="btn-mark-as-present"
                        onClick={handleMarkPresent}
                        disabled={isMarking}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base md:text-lg shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isMarking ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>RECORDING ATTENDANCE...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-6 h-6" />
                            <span>MARK AS PRESENT</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* 3. ALREADY MARKED PRESENT */}
                  {attendanceWorkflow === 'ALREADY_PRESENT' && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-1.5 font-mono text-xs">
                        <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>ALREADY MARKED PRESENT</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[11px] text-amber-300/80 pt-1">
                          <div>Event: <strong className="text-white">{eventId}</strong></div>
                          <div>Status: <strong className="text-emerald-400">PRESENT</strong></div>
                          {attendanceTimestamp && (
                            <div className="col-span-2">
                              Checked In: <strong className="text-white">{attendanceTimestamp}</strong>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        disabled
                        className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        <span>✓ PRESENT</span>
                      </button>
                    </div>
                  )}

                  {/* 4. JUST SUCCESSFULLY MARKED PRESENT */}
                  {attendanceWorkflow === 'MARKED_SUCCESS' && (
                    <div className="space-y-3 animate-in zoom-in-95">
                      <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-400 text-emerald-200 space-y-2 font-mono text-xs shadow-lg shadow-emerald-950/50">
                        <div className="flex items-center gap-2 font-black text-sm text-emerald-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>✓ PRESENT MARKED</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-emerald-200/90 pt-1 border-t border-emerald-500/30">
                          <div>Participant: <strong className="text-white">{resolvedParticipant.participantName}</strong></div>
                          <div>Event: <strong className="text-white">{eventId}</strong></div>
                          <div>Registration ID: <strong className="text-white">{resolvedParticipant.id}</strong></div>
                          <div>Time: <strong className="text-white">{attendanceTimestamp || 'Just Now'}</strong></div>
                        </div>
                      </div>

                      <button
                        disabled
                        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>✓ PRESENT</span>
                      </button>
                    </div>
                  )}

                  {/* Scan Another / Clear Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleReset}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan Next Attendee</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="p-8 rounded-3xl glass-panel border border-slate-800 text-center text-slate-500 text-xs font-mono space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-600" />
              <p>Ready to verify. Scan any attendee wristband or ID card.</p>
            </div>
          )}

          {/* Desk Check-in History (This Session) */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Desk Check-in History (This Session)</span>
            </h4>

            {recentEventScans.length > 0 ? (
              <div className="divide-y divide-slate-800 text-xs font-mono max-h-[220px] overflow-y-auto">
                {recentEventScans.map((s, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200">{s.name}</span>
                      <span className="text-[11px] text-slate-400 ml-2">[{s.regId}]</span>
                      <span className="text-[10px] text-amber-400 ml-2">({s.eventId})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        {s.state}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-slate-600 py-3">No scans recorded yet in this session</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

