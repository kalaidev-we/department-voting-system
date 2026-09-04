import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../lib/types';
import { fetchAuditLogs, verifyLedgerIntegrity } from '../../services/adminService';
import {
  ChevronLeft,
  Lock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Terminal,
  Activity,
} from 'lucide-react';

interface AdminAuditLogsPageProps {
  onBack: () => void;
}

export function AdminAuditLogsPage({ onBack }: AdminAuditLogsPageProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    totalBlocks: number;
    lastBlockHash: string;
    checkedAt: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const data = await fetchAuditLogs();
      setLogs(data);
    }
    load();
  }, []);

  const handleVerifyLedger = async () => {
    setIsVerifying(true);
    const result = await verifyLedgerIntegrity('el-001');
    setVerificationResult(result);
    setIsVerifying(false);
  };

  const filtered = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-bold text-slate-900 leading-none truncate">
              Cryptographic Audit & Ledger
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
              Tamper-evident blockchain ledger and system event logs
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-5 space-y-4">
        {/* Ledger Integrity Verification Hero Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 space-y-3.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  SHA-256 Ledger Hash Chain
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                  Blocks recursively sealed: H(n) = SHA256(H(n-1) + Ballot_n)
                </p>
              </div>
            </div>

            <button
              onClick={handleVerifyLedger}
              disabled={isVerifying}
              className="w-full sm:w-auto h-9 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Auditing Hash Chain...' : 'Verify Ledger'}</span>
            </button>
          </div>

          {/* Verification Results Feedback */}
          {verificationResult && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="truncate">ALL {verificationResult.totalBlocks} BLOCKS CRYPTOGRAPHICALLY VALID</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-300/80 font-mono break-all">
                Latest Root Hash: {verificationResult.lastBlockHash}
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by event action, email, or details..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

        {/* Audit Trail List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Audit Stream ({filtered.length})
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Immutable Log
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Terminal className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Audit Events Logged</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Audit events and administrative activity records will automatically stream into this table in real-time.
                </p>
              </div>
            ) : (
              filtered.map((log) => (
                <div key={log.id} className="p-3.5 sm:p-4 hover:bg-slate-50 transition-colors space-y-1.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px] sm:text-[11px] truncate max-w-[200px] sm:max-w-xs">
                        {log.actor_email} ({log.actor_role})
                      </span>
                    </div>

                    <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
                    {log.details}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Source: {log.ip_address}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-600 font-bold">STATUS: {log.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
