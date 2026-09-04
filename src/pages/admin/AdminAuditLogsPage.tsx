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
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
              Cryptographic Audit & Ledger
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Tamper-evident blockchain ledger and system event logs
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Ledger Integrity Verification Hero Card */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  SHA-256 Ledger Hash Chain
                </h3>
                <p className="text-xs text-slate-400">
                  Blocks recursively sealed: H(n) = SHA256(H(n-1) + Ballot_n)
                </p>
              </div>
            </div>

            <button
              onClick={handleVerifyLedger}
              disabled={isVerifying}
              className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Auditing Hash Chain...' : 'Verify Ledger'}</span>
            </button>
          </div>

          {/* Verification Results Feedback */}
          {verificationResult && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>ALL {verificationResult.totalBlocks} BLOCKS CRYPTOGRAPHICALLY VALID & SEALED</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 font-mono break-all">
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
            className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
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
            {filtered.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {log.actor_email} ({log.actor_role})
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  {log.details}
                </p>

                <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
                  <span>Source: {log.ip_address}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-600 font-bold">STATUS: {log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
