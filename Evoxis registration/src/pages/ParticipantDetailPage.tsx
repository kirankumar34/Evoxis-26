import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { operationsApi } from '../services/operationsApi';
import { ParticipantProfile } from '../types';
import { ParticipantCard } from '../components/reception/ParticipantCard';
import { QrAssignmentModal } from '../components/reception/QrAssignmentModal';
import { ArrowLeft, User, RefreshCw } from 'lucide-react';

export const ParticipantDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [participant, setParticipant] = useState<ParticipantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchParticipant = async () => {
    setIsLoading(true);
    try {
      const res = await operationsApi.lookupRegistration({ queryStr: id });
      if (res.success && res.data) {
        setParticipant(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipant();
  }, [id]);

  const handleAssignQr = async (
    physicalQrId: string,
    physicalQrType: 'ID_CARD' | 'WRISTBAND'
  ) => {
    if (!participant) return;
    await operationsApi.assignPhysicalQr({
      participantId: participant.id,
      registrationId: participant.registrationId,
      physicalQrId,
      physicalQrType,
      staffId: 'Admin Staff',
      staffRole: 'SUPER_ADMIN',
      station: 'Admin Panel',
    });
    fetchParticipant();
    setIsAssignModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={fetchParticipant}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {participant ? (
        <ParticipantCard
          participant={participant}
          onAssignQr={() => setIsAssignModalOpen(true)}
        />
      ) : (
        <div className="p-12 text-center text-slate-500 font-mono text-sm rounded-3xl glass-panel border border-slate-800">
          Participant not found for ID: {id}
        </div>
      )}

      {participant && (
        <QrAssignmentModal
          isOpen={isAssignModalOpen}
          participant={participant}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAssignQr}
        />
      )}
    </div>
  );
};
