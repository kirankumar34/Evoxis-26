import React from 'react';
import { ParticipantProfile } from '../../types';
import {
  User,
  Building2,
  GraduationCap,
  Phone,
  Mail,
  Users,
  CalendarCheck,
  CheckCircle2,
  Clock,
  QrCode,
  ShieldAlert,
} from 'lucide-react';

interface ParticipantCardProps {
  participant: ParticipantProfile;
  onAssignQr?: () => void;
  onMarkPresent?: () => void;
  onOpenTeamPass?: () => void;
  isMarkingPresent?: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onAssignQr,
  onMarkPresent,
  onOpenTeamPass,
  isMarkingPresent = false,
}) => {
  const isCampusPresent = participant.campusAttendanceStatus === 'Present';
  const isTeam = participant.registrationType === 'Team' || Boolean(participant.teamName);

  return (
    <div className="w-full rounded-2xl glass-panel border border-slate-800 p-5 md:p-6 space-y-6 animate-in fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              INDIVIDUAL PASS
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {participant.participantName}
            </h3>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                participant.role === 'TEAM_HEAD'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : participant.role === 'TEAM_MEMBER'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}
            >
              {participant.role.replace('_', ' ')}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
            <span>REG ID: <strong className="text-slate-200">{participant.id || participant.registrationId}</strong></span>
            {isTeam && participant.teamName && (
              <span>TEAM: <strong className="text-cyan-300">{participant.teamName}</strong></span>
            )}
          </div>
        </div>

        {/* Live Operational Status Badges & Team Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {isTeam && onOpenTeamPass && (
            <button
              type="button"
              onClick={onOpenTeamPass}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all shadow-neon-cyan"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Switch to Team Pass</span>
            </button>
          )}

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
              isCampusPresent
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-neon-emerald'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isCampusPresent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            <span>CAMPUS: {participant.campusAttendanceStatus.toUpperCase()}</span>
          </span>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-slate-500 flex items-center gap-1 font-mono uppercase">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" /> College
          </span>
          <p className="font-semibold text-slate-200 truncate">{participant.college || 'N/A'}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-slate-500 flex items-center gap-1 font-mono uppercase">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> Dept & Year
          </span>
          <p className="font-semibold text-slate-200 truncate">
            {participant.department || 'General'} · {participant.year || '3rd Year'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-slate-500 flex items-center gap-1 font-mono uppercase">
            <Phone className="w-3.5 h-3.5 text-cyan-400" /> Mobile
          </span>
          <p className="font-semibold text-slate-200 font-mono">{participant.mobile || 'N/A'}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <span className="text-slate-500 flex items-center gap-1 font-mono uppercase">
            <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email
          </span>
          <p className="font-semibold text-slate-200 truncate font-mono">{participant.email || 'N/A'}</p>
        </div>
      </div>

      {/* Registered Events */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            Registered Events ({participant.registeredEvents.length})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {participant.registeredEvents.map((evt) => {
            const isPresent = evt.attendanceStatus === 'Present';
            return (
              <div
                key={evt.eventId}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isPresent
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 block">
                    {evt.eventId} · {evt.category}
                  </span>
                  <span className="text-xs font-semibold truncate block">{evt.eventName}</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isPresent
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {evt.attendanceStatus.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Roster (if team) */}
      {isTeam && participant.teamMembers && participant.teamMembers.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" />
            Team Roster ({participant.teamMembers.length} Members)
          </span>

          <div className="divide-y divide-slate-800">
            {participant.teamMembers.map((member, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-200">{member.name}</span>
                  <span className="text-[11px] font-mono text-slate-400 ml-2">
                    {member.department} · {member.phone}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    member.role === 'TEAM_HEAD'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {member.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Physical QR Assignment Status & Actions */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400">PHYSICAL QR / WRISTBAND:</div>
            <div className="font-mono font-bold text-sm text-white">
              {participant.physicalQrId ? (
                <span className="text-emerald-400">
                  {participant.physicalQrId} ({participant.physicalQrType})
                </span>
              ) : (
                <span className="text-amber-400">NOT ASSIGNED YET</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onAssignQr && (
            <button
              onClick={onAssignQr}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-mono text-xs font-bold transition-all"
            >
              {participant.physicalQrId ? 'Reassign QR' : 'Assign Wristband / QR'}
            </button>
          )}

          {onMarkPresent && !isCampusPresent && (
            <button
              onClick={onMarkPresent}
              disabled={isMarkingPresent}
              className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-neon-emerald transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isMarkingPresent ? (
                <span>Confirming...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Mark Present</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
