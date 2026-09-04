import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Users,
  Vote,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Activity,
  Loader2,
} from 'lucide-react';
import { ProfileDropdown } from '../../components/common/ProfileDropdown';
import { fetchAdminMetrics, AdminMetrics } from '../../services/adminService';

interface AdminDashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export function AdminDashboardPage({ onNavigateTab }: AdminDashboardPageProps) {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics>({
    registeredVoters: 0,
    activeElections: 0,
    ledgerBlocks: 0,
    domainIntercepts: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await fetchAdminMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoadingMetrics(false);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Top Navbar */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-base font-black tracking-tight text-slate-900 leading-none">
              Secure<span className="text-indigo-600">Vote</span>
            </span>
            <span className="px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 text-[9px] font-extrabold uppercase tracking-wider border border-purple-100">
              SUPER ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ProfileDropdown />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Welcome Hero Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-[11px] font-semibold text-indigo-200">
              Institution Governance Control
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Campus Governance Center
            </h1>
            <p className="text-xs text-indigo-200/90 max-w-lg leading-relaxed">
              Overseeing student voter registries, cryptographic hash chains, role authorizations, and domain security across KPR Institute of Engineering and Technology.
            </p>
          </div>
        </div>

        {/* 4 Governance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Registered Voters</span>
            <div className="text-lg font-black text-slate-900">
              {loadingMetrics ? '...' : metrics.registeredVoters.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">● Live Database</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <Vote className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Active Elections</span>
            <div className="text-lg font-black text-slate-900">
              {loadingMetrics ? '...' : metrics.activeElections}
            </div>
            <span className="text-[10px] text-blue-600 font-bold">● Active Status</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Ledger Blocks</span>
            <div className="text-lg font-black text-slate-900">
              {loadingMetrics ? '...' : metrics.ledgerBlocks.toLocaleString()}
            </div>
            <span className="text-[10px] text-purple-600 font-bold">SHA-256 Chained</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Domain Intercepts</span>
            <div className="text-lg font-black text-slate-900">
              {loadingMetrics ? '...' : metrics.domainIntercepts}
            </div>
            <span className="text-[10px] text-rose-600 font-bold">Blocked External</span>
          </div>
        </div>

        {/* Quick Admin Navigation Modules */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Administrative Consoles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Console 1: Faculty & Staff Management */}
            <div
              onClick={() => onNavigateTab('admin_staff')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Faculty & Staff</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Enroll faculty, assign officer roles, and enable staff voter rights.
              </p>
            </div>

            {/* Console 2: Student Roster */}
            <div
              onClick={() => onNavigateTab('admin_students')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Student Registry (CSV)</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Manage student roll numbers, batch assignments, and bulk import rosters.
              </p>
            </div>

            {/* Console 3: Audit Logs & Hash Chain */}
            <div
              onClick={() => onNavigateTab('admin_audit')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Cryptographic Ledger</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Verify blockchain block integrity and explore immutable audit logs.
              </p>
            </div>

            {/* Console 4: Security & Domain Guard */}
            <div
              onClick={() => onNavigateTab('admin_security')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Security Events</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Monitor rejected non-college logins and security anomaly warnings.
              </p>
            </div>
          </div>
        </div>

        {/* System Health & Integrity Panel */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Campus Security Posture
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              All Systems Nominal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500">Domain Restriction</span>
              <span className="font-bold text-slate-800 font-mono">@kpriet.ac.in</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500">Hash Algorithm</span>
              <span className="font-bold text-slate-800 font-mono">SHA-256</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-slate-500">Anonymity Model</span>
              <span className="font-bold text-emerald-700">Strict Decoupling</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
