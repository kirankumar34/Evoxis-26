import React, { useState, useEffect } from 'react';
import { operationsApi } from '../services/operationsApi';
import { PhysicalQrInventoryItem, InventoryMetrics, QrEnvironment } from '../types';
import {
  QrCode,
  Sparkles,
  Download,
  Printer,
  ShieldAlert,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  XCircle,
} from 'lucide-react';

export const QrGeneratorPage: React.FC = () => {
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    production: { total: 0, unused: 0, assigned: 0, revoked: 0 },
    test: { total: 0, unused: 0, assigned: 0, revoked: 0 },
  });

  const [inventory, setInventory] = useState<PhysicalQrInventoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Generation Modal & Progress state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [generatingEnv, setGeneratingEnv] = useState<QrEnvironment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null);

  // Revocation Modal state
  const [selectedForRevoke, setSelectedForRevoke] = useState<PhysicalQrInventoryItem | null>(null);
  const [revokeReason, setRevokeReason] = useState('Damaged / Lost wristband');
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchMetricsAndInventory = async () => {
    const m = await operationsApi.getInventoryMetrics();
    setMetrics(m);

    const inv = await operationsApi.getQrInventory({
      environment: envFilter,
      status: statusFilter,
      search: searchQuery,
      page: currentPage,
      pageSize: 20,
    });

    setInventory(inv.items);
    setTotalCount(inv.totalCount);
    setTotalPages(inv.totalPages);
  };

  useEffect(() => {
    fetchMetricsAndInventory();
  }, [envFilter, statusFilter, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMetricsAndInventory();
  };

  const handleOpenGenerationConfirm = (env: QrEnvironment) => {
    setGeneratingEnv(env);
    setIsConfirmModalOpen(true);
    setGenerationFeedback(null);
  };

  const handleExecuteGeneration = async () => {
    if (!generatingEnv) return;
    setIsGenerating(true);
    const targetCount = generatingEnv === 'PRODUCTION' ? 1000 : 100;
    setProgress({ current: 0, total: targetCount });

    try {
      const res = await operationsApi.generateQrInventory({
        environment: generatingEnv,
        count: targetCount,
        onProgress: (current, total) => setProgress({ current, total }),
      });

      setGenerationFeedback(
        `✓ ${generatingEnv} QR Generation complete: ${res.totalCreated} created, ${res.totalDuplicatesPrevented} duplicates prevented.`
      );
      await fetchMetricsAndInventory();
    } catch (err: any) {
      setGenerationFeedback(`Error: ${err.message || 'Generation failed'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!selectedForRevoke) return;
    setIsRevoking(true);
    try {
      await operationsApi.revokeQr({
        qrCode: selectedForRevoke.qrCode,
        reason: revokeReason,
        staffId: 'Admin Staff',
      });
      setSelectedForRevoke(null);
      await fetchMetricsAndInventory();
    } finally {
      setIsRevoking(false);
    }
  };

  const handleExportCsv = (env: 'PRODUCTION' | 'TEST' | 'ALL') => {
    let rows: PhysicalQrInventoryItem[] = [];
    if (env === 'ALL') rows = inventory;
    else rows = inventory.filter((i) => i.environment === env);

    const headers = ['QR Code', 'Type', 'Environment', 'Status', 'Participant Name', 'Registration ID', 'Assigned At', 'Created At'];
    const csvData = rows.map((r) => [
      r.qrCode,
      r.qrType,
      r.environment,
      r.status,
      r.participantName || '',
      r.registrationId || '',
      r.assignedAt || '',
      r.createdAt,
    ]);

    const csvContent = [headers, ...csvData].map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evoxis26_qr_inventory_${env.toLowerCase()}_${Date.now()}.csv`;
    link.click();
  };

  const openPrintSheet = (type: 'PRODUCTION' | 'TEST') => {
    const fileName = type === 'PRODUCTION' ? 'production_qr_sheet.html' : 'test_qr_sheet.html';
    const folder = type === 'PRODUCTION' ? 'event_day' : 'testing';
    window.open(`/QR codes/${folder}/${fileName}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <QrCode className="w-4 h-4" />
            <span>Physical ID & Wristband Inventory</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Static QR Code Inventory Generator
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Pre-generate, audit, print, and manage 1,000 Production + 100 Test wristband QR codes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenGenerationConfirm('PRODUCTION')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold shadow-neon-cyan transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Production (1,000)</span>
          </button>

          <button
            onClick={() => handleOpenGenerationConfirm('TEST')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-mono font-bold transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Generate Test (100)</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Production Card */}
        <div className="p-6 rounded-3xl glass-panel border border-cyan-500/30 bg-slate-900/60 relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Production QR Inventory (Live Event Day)</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              EVX26-WB-000001 → 001000
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Total</div>
              <div className="text-xl font-black text-white">{metrics.production.total}</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-emerald-400 uppercase">Unused</div>
              <div className="text-xl font-black text-emerald-300">{metrics.production.unused}</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase">Assigned</div>
              <div className="text-xl font-black text-cyan-300">{metrics.production.assigned}</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-rose-400 uppercase">Revoked</div>
              <div className="text-xl font-black text-rose-400">{metrics.production.revoked}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => openPrintSheet('PRODUCTION')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-cyan-300 font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Sheets (50 Pages)</span>
            </button>
            <button
              onClick={() => handleExportCsv('PRODUCTION')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-400 hover:text-white"
              title="Download Production CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Test Card */}
        <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 bg-slate-900/60 relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Test QR Inventory (Pre-Production Testing)</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              EVX26-TEST-000001 → 000100
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Total</div>
              <div className="text-xl font-black text-white">{metrics.test.total}</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-emerald-400 uppercase">Unused</div>
              <div className="text-xl font-black text-emerald-300">{metrics.test.unused}</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase">Assigned</div>
              <div className="text-xl font-black text-cyan-300">{metrics.test.assigned}</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-rose-400 uppercase">Revoked</div>
              <div className="text-xl font-black text-rose-400">{metrics.test.revoked}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => openPrintSheet('TEST')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400 text-xs font-mono text-amber-300 font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Test Sheets (5 Pages)</span>
            </button>
            <button
              onClick={() => handleExportCsv('TEST')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-400 hover:text-white"
              title="Download Test CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Generation Confirmation / Progress Modal */}
      {isConfirmModalOpen && generatingEnv && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl glass-panel border border-slate-700 bg-slate-950 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
              <QrCode className="w-4 h-4" />
              <span>Confirm Static QR Generation</span>
            </div>

            <h3 className="text-lg font-bold text-white">
              Generate {generatingEnv === 'PRODUCTION' ? '1,000 Production' : '100 Test'} QR Codes?
            </h3>

            <p className="text-xs text-slate-400 font-mono">
              {generatingEnv === 'PRODUCTION'
                ? 'These static QR codes (EVX26-WB-000001 to EVX26-WB-001000) will be initialized with UNUSED status in the Supabase database. They encode zero personal data and will be bound to participants upon Reception check-in.'
                : 'These test QR codes (EVX26-TEST-000001 to EVX26-TEST-000100) are reserved strictly for pre-production workstation testing. They are automatically rejected during live production operations.'}
            </p>

            {isGenerating && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono text-cyan-300">
                  <span>Generating records...</span>
                  <span>
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {generationFeedback && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
                {generationFeedback}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleExecuteGeneration}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono shadow-neon-cyan disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Confirm Generation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revocation Modal */}
      {selectedForRevoke && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl glass-panel border border-rose-500/40 bg-slate-950 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase">
              <XCircle className="w-4 h-4" />
              <span>Revoke Physical QR Pass</span>
            </div>

            <h3 className="text-lg font-bold text-white">
              Revoke {selectedForRevoke.qrCode}?
            </h3>

            <p className="text-xs text-slate-400 font-mono">
              Revoking this physical wristband permanently blocks it from future check-in, event scanning, and food redemption.
            </p>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Revocation Reason</label>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                placeholder="e.g. Lost wristband, participant replacement"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedForRevoke(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRevoking}
                onClick={handleRevokeConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono shadow-lg disabled:opacity-50"
              >
                {isRevoking ? 'Revoking...' : 'Confirm Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <form onSubmit={handleSearchSubmit} className="sm:col-span-2 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by QR Code, Participant Name, Reg ID..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </form>

        <div>
          <select
            value={envFilter}
            onChange={(e) => {
              setEnvFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Environments</option>
            <option value="PRODUCTION">PRODUCTION</option>
            <option value="TEST">TEST</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNUSED">UNUSED</option>
            <option value="ASSIGNED">ASSIGNED / ACTIVE</option>
            <option value="REVOKED">REVOKED</option>
          </select>
        </div>
      </div>

      {/* Inventory Data Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">QR Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Participant / Reg ID</th>
                <th className="py-3 px-4">Assigned At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white tracking-wider">
                      {item.qrCode}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.qrType}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.environment === 'PRODUCTION'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {item.environment}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.status === 'UNUSED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : item.status === 'ASSIGNED' || item.status === 'ACTIVE'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.participantName ? (
                        <div>
                          <span className="text-white font-semibold block">{item.participantName}</span>
                          <span className="text-[10px] text-cyan-400">{item.registrationId}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {item.assignedAt ? new Date(item.assignedAt).toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.status !== 'REVOKED' ? (
                        <button
                          onClick={() => setSelectedForRevoke(item)}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/50 text-[10px] font-bold transition-all"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-bold">REVOKED</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No QR inventory codes found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div>
            Showing {inventory.length} of {totalCount} codes
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
