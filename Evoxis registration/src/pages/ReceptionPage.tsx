import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { operationsApi } from '../services/operationsApi';
import { ParticipantProfile, TeamPassProfile, ScanResultState } from '../types';
import { CameraScanner } from '../components/common/CameraScanner';
import { ParticipantCard } from '../components/reception/ParticipantCard';
import { TeamWristbandAssignment } from '../components/reception/TeamWristbandAssignment';
import { QrAssignmentModal } from '../components/reception/QrAssignmentModal';
import { StatusBanner } from '../components/common/StatusBanner';
import { audio } from '../services/audioService';
import { QrCode, Search, UserCheck, ShieldCheck, Users } from 'lucide-react';

export const ReceptionPage: React.FC = () => {
  const { user, currentStation, portalMode } = useAuth();

  const [activeTab, setActiveTab] = useState<'SCAN' | 'SEARCH'>('SCAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ParticipantProfile[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantProfile | null>(null);
  const [selectedTeamPass, setSelectedTeamPass] = useState<TeamPassProfile | null>(null);

  const [scanState, setScanState] = useState<ScanResultState | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string>('');
  const [bannerDetails, setBannerDetails] = useState<string | undefined>(undefined);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Scan handler for registration QR or physical QR
  const handleScan = async (token: string) => {
    setIsProcessing(true);
    setScanState(null);

    try {
      const res = await operationsApi.lookupRegistration({ token });
      if (res.success && res.data) {
        if (res.isTeamPass && res.data.teamPassProfile) {
          // A. TEAM PASS WORKFLOW
          setSelectedTeamPass(res.data.teamPassProfile);
          setSelectedParticipant(null);
          setScanState('SUCCESS');
          setBannerMessage('✓ TEAM PASS VERIFIED');
          setBannerDetails(
            `Found Team "${res.data.teamPassProfile.teamName}" (${res.data.teamPassProfile.totalMembers} Members, ${res.data.teamPassProfile.assignedCount} Assigned)`
          );
          audio.playSuccess();
        } else {
          // B. INDIVIDUAL PARTICIPANT PASS WORKFLOW
          setSelectedTeamPass(null);
          setSelectedParticipant(res.data);
          setScanState('SUCCESS');
          setBannerMessage('✓ PARTICIPANT VERIFIED');
          setBannerDetails(`Found ${res.data.participantName} (${res.data.id || res.data.registrationId})`);
          audio.playSuccess();
        }
      } else {
        setSelectedParticipant(null);
        setSelectedTeamPass(null);
        setScanState('NOT_FOUND');
        setBannerMessage('PARTICIPANT NOT FOUND');
        setBannerDetails(`No active registration matches QR: ${token}`);
        audio.playError();
      }
    } catch (err: any) {
      setScanState('OFFLINE_ERROR');
      setBannerMessage('Connection unavailable. Attendance was NOT recorded.');
      setBannerDetails(err?.message || 'Network lookup failure');
      audio.playError();
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsProcessing(true);
    try {
      const results = await operationsApi.searchParticipants(searchQuery.trim());
      setSearchResults(results);
      if (results.length === 1) {
        const match = results[0];
        setSelectedTeamPass(null);
        setSelectedParticipant(match);
      } else if (results.length === 0) {
        setSelectedParticipant(null);
        setSelectedTeamPass(null);
        setScanState('NOT_FOUND');
        setBannerMessage('PARTICIPANT NOT FOUND');
        setBannerDetails(`No registrations match "${searchQuery}"`);
        audio.playError();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch an individual team participant to Team Pass mode
  const handleSwitchToTeamPass = async (regId: string) => {
    setIsProcessing(true);
    try {
      const teamRes = await operationsApi.getTeamPassProfile(regId);
      if (teamRes.success && teamRes.data) {
        setSelectedParticipant(null);
        setSelectedTeamPass(teamRes.data);
        setScanState('SUCCESS');
        setBannerMessage('✓ TEAM PASS MODE ACTIVATED');
        setBannerDetails(`Loaded Team "${teamRes.data.teamName}" (${teamRes.data.totalMembers} Members)`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Assign Physical QR Handler for Individual Participant
  const handleAssignPhysicalQr = async (
    physicalQrId: string,
    physicalQrType: 'ID_CARD' | 'WRISTBAND'
  ) => {
    if (!selectedParticipant || !user) return;
    setIsProcessing(true);

    try {
      const result = await operationsApi.assignPhysicalQr({
        participantId: selectedParticipant.id,
        registrationId: selectedParticipant.registrationId,
        physicalQrId,
        physicalQrType,
        staffId: user.name || user.id,
        staffRole: user.role,
        station: currentStation,
        portalMode,
      });

      setScanState(result.state);
      setBannerMessage(result.verbatimMessage);
      setBannerDetails(result.details);

      if (result.state === 'SUCCESS') {
        audio.playSuccess();
        // Refresh participant
        const updated = await operationsApi.lookupRegistration({
          queryStr: selectedParticipant.id,
        });
        if (updated.data) setSelectedParticipant(updated.data);
        setIsAssignModalOpen(false);
      } else {
        audio.playError();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm & Mark Campus Present for Individual Participant
  const handleMarkCampusPresent = async () => {
    if (!selectedParticipant || !user) return;
    setIsProcessing(true);

    try {
      const result = await operationsApi.markCampusPresent({
        participantId: selectedParticipant.id,
        registrationId: selectedParticipant.registrationId,
        physicalQrId: selectedParticipant.physicalQrId,
        staffId: user.name || user.id,
        station: currentStation,
      });

      setScanState(result.state);
      setBannerMessage(result.verbatimMessage);
      setBannerDetails(result.details);

      if (result.state === 'SUCCESS') {
        audio.playSuccess();
      } else if (result.state === 'DUPLICATE_CAMPUS') {
        audio.playWarning();
      }

      // Refresh participant profile
      const updated = await operationsApi.lookupRegistration({
        queryStr: selectedParticipant.id,
      });
      if (updated.data) setSelectedParticipant(updated.data);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <QrCode className="w-4 h-4" />
            <span>Reception Desk Check-In</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Participant Verification & Wristband Binding
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('SCAN');
              setSelectedParticipant(null);
              setSelectedTeamPass(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'SCAN'
                ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Camera Scanner
          </button>
          <button
            onClick={() => {
              setActiveTab('SEARCH');
              setSelectedParticipant(null);
              setSelectedTeamPass(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === 'SEARCH'
                ? 'bg-cyan-500 text-slate-950 shadow-neon-cyan'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Manual Search
          </button>
        </div>
      </div>

      {/* Verbatim Status Banner */}
      <StatusBanner
        state={scanState}
        message={bannerMessage}
        details={bannerDetails}
        onDismiss={() => setScanState(null)}
      />

      {/* Main Work Area */}
      {selectedTeamPass ? (
        /* Render Full Team Wristband Assignment Mode */
        <div className="space-y-4">
          <TeamWristbandAssignment
            teamPass={selectedTeamPass}
            staffId={user?.name || user?.id || 'Staff'}
            staffRole={user?.role || 'RECEPTION'}
            station={currentStation}
            portalMode={portalMode}
            onClose={() => setSelectedTeamPass(null)}
            onUpdateTeam={(updated) => setSelectedTeamPass(updated)}
          />
        </div>
      ) : (
        /* Regular Split View: Scanner/Search on Left, Profile on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Scanner or Search (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {activeTab === 'SCAN' ? (
              <div className="p-6 rounded-3xl glass-panel border border-slate-800">
                <CameraScanner
                  onScan={handleScan}
                  promptText="Scan Team Pass or Individual Registration QR"
                />
              </div>
            ) : (
              <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
                <form onSubmit={handleSearch} className="space-y-3">
                  <label className="block text-xs font-mono uppercase font-bold text-slate-300">
                    Search by Name, Reg ID, Mobile, or Team Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Arun, EVOXIS26-00025, or 98401..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold shadow-neon-cyan"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Search Results List */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pt-2">
                    <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                      Found {searchResults.length} Match(es):
                    </span>
                    {searchResults.map((p) => {
                      const isTeam = p.registrationType === 'Team' || Boolean(p.teamName);
                      return (
                        <div
                          key={p.id || p.registrationId}
                          className={`w-full p-3 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between gap-2 ${
                            selectedParticipant?.registrationId === p.registrationId
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              setSelectedTeamPass(null);
                              setSelectedParticipant(p);
                            }}
                          >
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{p.participantName}</span>
                              {isTeam && (
                                <span className="text-[10px] text-cyan-400 font-normal">
                                  ({p.teamName || 'Team'})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {p.id || p.registrationId} · {p.college}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isTeam && (
                              <button
                                type="button"
                                onClick={() => handleSwitchToTeamPass(p.registrationId)}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold hover:bg-cyan-500/30"
                              >
                                Team Pass
                              </button>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {p.role}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Participant Verification Profile Card (7 cols) */}
          <div className="lg:col-span-7">
            {selectedParticipant ? (
              <ParticipantCard
                participant={selectedParticipant}
                onAssignQr={() => setIsAssignModalOpen(true)}
                onMarkPresent={handleMarkCampusPresent}
                onOpenTeamPass={() => handleSwitchToTeamPass(selectedParticipant.registrationId)}
                isMarkingPresent={isProcessing}
              />
            ) : (
              <div className="p-12 rounded-3xl glass-panel border border-slate-800/80 flex flex-col items-center justify-center text-center text-slate-500 space-y-3 min-h-[320px]">
                <UserCheck className="w-12 h-12 text-slate-700" />
                <p className="text-sm font-mono">Scan a digital registration pass or team pass</p>
                <span className="text-xs text-slate-600 font-mono">
                  Physical wristbands will be assigned individually or in sequential team queues.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Individual QR Assignment Modal */}
      {selectedParticipant && (
        <QrAssignmentModal
          isOpen={isAssignModalOpen}
          participant={selectedParticipant}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAssignPhysicalQr}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
};

