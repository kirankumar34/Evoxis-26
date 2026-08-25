import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TeamPassProfile,
  TeamMemberRosterItem,
  StaffRole,
} from '../../types';
import { CameraScanner } from '../common/CameraScanner';
import { operationsApi } from '../../services/operationsApi';
import {
  Users,
  CheckCircle2,
  Clock,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserCheck,
  CalendarCheck,
  Building2,
  GraduationCap,
  X,
  RefreshCw,
} from 'lucide-react';

interface TeamWristbandAssignmentProps {
  teamPass: TeamPassProfile;
  staffId: string;
  staffRole: StaffRole;
  station?: string;
  portalMode?: 'TEST' | 'PRODUCTION';
  onClose: () => void;
  onUpdateTeam?: (updatedTeam: TeamPassProfile) => void;
}

export const TeamWristbandAssignment: React.FC<TeamWristbandAssignmentProps> = ({
  teamPass,
  staffId,
  staffRole,
  station = 'Reception Desk',
  portalMode = 'PRODUCTION',
  onClose,
  onUpdateTeam,
}) => {
  const [currentTeam, setCurrentTeam] = useState<TeamPassProfile>(teamPass);
  const [activeMemberId, setActiveMemberId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isMarkingAllCampus, setIsMarkingAllCampus] = useState(false);
  const [allCampusMarked, setAllCampusMarked] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setCurrentTeam(teamPass);
  }, [teamPass]);

  // Determine the active member to scan for:
  // Defaults to the first unassigned member in persisted roster order
  useEffect(() => {
    if (!activeMemberId || !currentTeam.members.some((m) => m.participantId === activeMemberId)) {
      const firstUnassigned = currentTeam.members.find((m) => !m.physicalQrId);
      if (firstUnassigned) {
        setActiveMemberId(firstUnassigned.participantId);
      } else if (currentTeam.members.length > 0) {
        setActiveMemberId(currentTeam.members[0].participantId);
      }
    }
  }, [currentTeam, activeMemberId]);

  const activeMember = useMemo(() => {
    return (
      currentTeam.members.find((m) => m.participantId === activeMemberId) ||
      currentTeam.members[0]
    );
  }, [currentTeam, activeMemberId]);

  const activeMemberRef = useRef(activeMember);
  activeMemberRef.current = activeMember;
  const currentTeamRef = useRef(currentTeam);
  currentTeamRef.current = currentTeam;

  const assignedCount = currentTeam.members.filter((m) => Boolean(m.physicalQrId)).length;
  const totalMembers = currentTeam.members.length;
  const isAllAssigned = totalMembers > 0 && assignedCount === totalMembers;
  const progressPercent = totalMembers > 0 ? Math.round((assignedCount / totalMembers) * 100) : 0;

  // Refresh latest team state from database / storage
  const handleRefreshTeam = async () => {
    const team = currentTeamRef.current || currentTeam;
    const fresh = await operationsApi.getTeamPassProfile(team.registrationId);
    if (fresh.success && fresh.data) {
      setCurrentTeam(fresh.data);
      if (onUpdateTeam) onUpdateTeam(fresh.data);
    }
  };

  // Perform physical wristband binding for active member
  const handleAssignWristband = async (rawQr: string) => {
    const cleanQr = rawQr.trim().toUpperCase();
    if (!cleanQr) return;

    const targetMember = activeMemberRef.current || activeMember;
    const team = currentTeamRef.current || currentTeam;

    if (!targetMember) {
      setErrorMessage('Please select a team member first');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsAssigning(true);

    try {
      const res = await operationsApi.assignPhysicalQr({
        participantId: targetMember.participantId,
        registrationId: team.registrationId,
        physicalQrId: cleanQr,
        physicalQrType: 'WRISTBAND',
        staffId,
        staffRole,
        station,
        portalMode,
      });

      if (res.state === 'SUCCESS') {
        setSuccessMessage(`Wristband ${cleanQr} assigned to ${targetMember.name}`);
        setManualInput('');

        // Refresh team profile immediately
        const fresh = await operationsApi.getTeamPassProfile(team.registrationId);
        if (fresh.success && fresh.data) {
          setCurrentTeam(fresh.data);
          if (onUpdateTeam) onUpdateTeam(fresh.data);

          // Auto-advance to next unassigned member
          const nextUnassigned = fresh.data.members.find(
            (m: TeamMemberRosterItem) => !m.physicalQrId && m.participantId !== targetMember.participantId
          );
          if (nextUnassigned) {
            setActiveMemberId(nextUnassigned.participantId);
          }
        }
      } else {
        setErrorMessage(
          `${res.verbatimMessage || 'Assignment Failed'}: ${res.details || 'Could not bind wristband'}`
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during assignment');
    } finally {
      setIsAssigning(false);
    }
  };

  // Mark all team members present on campus
  const handleMarkAllCampusPresent = async () => {
    setIsMarkingAllCampus(true);
    setErrorMessage(null);
    try {
      const res = await operationsApi.markCampusPresentForTeam({
        registrationId: currentTeam.registrationId,
        staffId,
        station,
      });
      if (res.success) {
        setAllCampusMarked(true);
        setSuccessMessage(`All ${res.checkedInCount} team members marked Present on Campus!`);
        await handleRefreshTeam();
      } else {
        setErrorMessage(res.message || 'Could not mark all members campus present');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Campus check-in failed');
    } finally {
      setIsMarkingAllCampus(false);
    }
  };

  return (
    <div className="w-full rounded-2xl glass-panel border border-slate-800 bg-slate-950/90 p-5 md:p-7 space-y-6 animate-in fade-in shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-neon-cyan">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              TEAM PASS VERIFIED
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {currentTeam.teamName}
            </h2>
          </div>

          <div className="mt-1.5 flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
            <span>REG ID: <strong className="text-slate-200">{currentTeam.registrationId}</strong></span>
            <span>•</span>
            <span>TOKEN: <strong className="text-cyan-300">{currentTeam.teamPassToken}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {currentTeam.college || 'Sriram Engineering College'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshTeam}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh team state"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Close team pass"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress & Registered Events Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              Wristband Progress
            </span>
            <span className={`font-bold ${isAllAssigned ? 'text-emerald-400' : 'text-amber-400'}`}>
              {assignedCount} / {totalMembers} Assigned ({progressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAllAssigned
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-neon-emerald'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] font-mono text-slate-400">
            {isAllAssigned
              ? '✓ All team members have physical wristbands assigned'
              : `Scan wristband for ${activeMember?.name || 'next member'}`}
          </p>
        </div>

        {/* Registered Events Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2 lg:col-span-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              Registered Events ({currentTeam.selectedEvents.length})
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {currentTeam.selectedEvents.map((evtId) => {
              const evtInfo = currentTeam.registeredEvents.find((e) => e.eventId === evtId);
              return (
                <div
                  key={evtId}
                  className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono flex items-center gap-2"
                >
                  <span className="font-bold text-amber-400">{evtId}</span>
                  <span className="text-slate-300 font-sans">{evtInfo?.eventName || evtId}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Assignment Section: Team Roster Queue (Left) & Scanner (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Team Member Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Team Roster Queue ({totalMembers} Members)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Click any member to assign out of order
            </span>
          </div>

          <div className="space-y-2.5">
            {currentTeam.members.map((member, idx) => {
              const isAssigned = Boolean(member.physicalQrId);
              const isActive = member.participantId === activeMemberId;
              const isHead = member.role === 'TEAM_HEAD' || idx === 0;

              return (
                <div
                  key={member.participantId || idx}
                  onClick={() => {
                    setActiveMemberId(member.participantId);
                    setErrorMessage(null);
                  }}
                  className={`p-3.5 md:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-cyan-950/30 border-cyan-500/80 shadow-neon-cyan ring-1 ring-cyan-500/50'
                      : isAssigned
                      ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Member Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                        isAssigned
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white truncate">{member.name}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            isHead
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}
                        >
                          {isHead ? 'TEAM HEAD' : 'TEAM MEMBER'}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{member.participantId}</span>
                        {member.phone && <span>• {member.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Wristband Status Pill */}
                  <div className="flex-shrink-0 text-right">
                    {isAssigned ? (
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{member.physicalQrId}</span>
                      </div>
                    ) : isActive ? (
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/40 animate-pulse">
                        <span>SCAN NOW</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Waiting</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Member Wristband Assignment Scanner (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
            {/* Active Target Banner */}
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-1 text-center">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                CURRENT TARGET FOR WRISTBAND
              </span>
              <p className="text-lg font-bold text-white tracking-tight truncate">
                {activeMember ? activeMember.name : 'Select a member'}
              </p>
              <p className="text-xs font-mono text-cyan-300">
                {activeMember?.participantId} ({activeMember?.role?.replace('_', ' ') || 'TEAM MEMBER'})
              </p>
            </div>

            {/* Error / Success Feedback Banners */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-start gap-2.5 text-rose-200 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-bold">ASSIGNMENT REJECTED</strong>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-2.5 text-emerald-200 text-xs animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="font-semibold">{successMessage}</p>
              </div>
            )}

            {/* Wristband Scanner */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 p-2">
              <CameraScanner
                onScan={handleAssignWristband}
                promptText={`Scan wristband QR for ${activeMember?.name || 'active member'}`}
              />
            </div>

            {/* Manual Barcode / QR Input Fallback */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualInput.trim()) {
                  handleAssignWristband(manualInput.trim());
                }
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                placeholder="Or type wristband QR (e.g. EVX26-WB-000101)"
                disabled={isAssigning}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!manualInput.trim() || isAssigning}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase transition-all shadow-neon-cyan disabled:opacity-40"
              >
                {isAssigning ? 'Binding...' : 'Bind'}
              </button>
            </form>
          </div>

          {/* Completion Card (When all members assigned) */}
          {isAllAssigned && (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-4 text-center animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-neon-emerald">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">
                  TEAM WRISTBAND ASSIGNMENT COMPLETE ({totalMembers}/{totalMembers})
                </h4>
                <p className="text-xs text-emerald-300/80 font-mono mt-1">
                  All {totalMembers} team members are verified with active wristbands.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleMarkAllCampusPresent}
                  disabled={isMarkingAllCampus || allCampusMarked}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-neon-emerald transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{allCampusMarked ? '✓ Campus Checked In' : isMarkingAllCampus ? 'Checking In...' : 'Mark Team Campus Present'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
