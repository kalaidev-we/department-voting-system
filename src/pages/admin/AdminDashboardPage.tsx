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
  Briefcase,
  Award,
  BarChart3,
  FileSpreadsheet,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { ProfileDropdown } from '../../components/common/ProfileDropdown';
import { fetchAdminMetrics, AdminMetrics } from '../../services/adminService';
import { fetchStaffElections } from '../../services/electionService';
import { hasStudentVoted } from '../../services/votingService';
import { Election } from '../../lib/types';

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
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [hasVotedAsAdmin, setHasVotedAsAdmin] = useState(false);

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

    async function loadVoteStatus() {
      try {
        const elections = await fetchStaffElections();
        const active = elections.find((e) => e.status === 'ACTIVE') || elections[0];
        if (active) {
          setActiveElection(active);
          if (profile?.id) {
            const voted = await hasStudentVoted(active.id, profile.id);
            setHasVotedAsAdmin(voted);
          }
        }
      } catch (err) {
        console.warn('Error loading active election for voting check:', err);
      }
    }

    loadMetrics();
    loadVoteStatus();
  }, [profile?.id]);

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

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigateTab('admin_staff_console')}
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200/60"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>Staff Operations Console</span>
          </button>
          <ProfileDropdown />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Welcome Hero Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-[11px] font-semibold text-indigo-200">
                Institution Governance & Operational Control
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Campus Governance Center
              </h1>
              <p className="text-xs text-indigo-200/90 max-w-lg leading-relaxed">
                Overseeing elections, candidate approvals, audit ledgers, faculty roles, and security
                operations across KPR Institute of Engineering and Technology.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('admin_staff_console')}
              className="self-start sm:self-center px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 backdrop-blur-xs"
            >
              <Briefcase className="w-4 h-4" />
              <span>Staff Operations View →</span>
            </button>
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

          <div
            onClick={() => onNavigateTab('admin_elections')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Vote className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 font-medium">Active Elections</span>
            <div className="text-lg font-black text-slate-900">
              {loadingMetrics ? '...' : metrics.activeElections}
            </div>
            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
              <span>Manage Polls</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </span>
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

        {/* Super Admin Voter Participation Card (Staff & Elector Capability) */}
        {activeElection && (
          <section className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  hasVotedAsAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                <Vote className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Institutional Voter Participation
                  </h3>
                  {hasVotedAsAdmin ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Ballot Cast
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                      Eligible to Vote
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {hasVotedAsAdmin
                    ? `Your ballot for "${activeElection.title}" is cryptographically secured.`
                    : `You have official voter rights for "${activeElection.title}". Cast your ballot now.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab(hasVotedAsAdmin ? 'admin_receipt' : 'admin_vote')}
              className={`h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-xs ${
                hasVotedAsAdmin
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <span>{hasVotedAsAdmin ? 'View Digital Receipt' : 'Proceed to Voting Booth'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </section>
        )}

        {/* Section 1: Election & Candidate Operations (All Staff Capabilities) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Election Operations (Staff & Admin Capabilities)
            </h2>
            <span className="text-[11px] font-bold text-indigo-600">Full Execution Access</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Elections (CRUD) */}
            <div
              onClick={() => onNavigateTab('admin_elections')}
              className="p-4 rounded-2xl bg-white border border-indigo-200/80 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer space-y-2 group bg-gradient-to-br from-white to-indigo-50/20"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Vote className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Elections & Ballots (CRUD)</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Create new polls, edit parameters, toggle status, and purge campus elections.
              </p>
            </div>

            {/* 2. Candidates Management */}
            <div
              onClick={() => onNavigateTab('admin_candidates')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Candidates & Nominees</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                View enrolled candidates across elections and add candidates directly.
              </p>
            </div>

            {/* 3. Candidate Applications Review */}
            <div
              onClick={() => onNavigateTab('admin_applications')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Nomination Applications</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Review student candidate applications, verify manifestos, and approve/reject.
              </p>
            </div>

            {/* 4. Live Results & Analytics */}
            <div
              onClick={() => onNavigateTab('admin_analytics')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Live Analytics & Tallies</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Real-time vote counts, turnout trends, winner predictions, and blockchain proof.
              </p>
            </div>

            {/* 5. Official Reports & CSV Export */}
            <div
              onClick={() => onNavigateTab('admin_reports')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Reports & CSV Exports</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Generate official audit statements, export turnout datasets, and certified reports.
              </p>
            </div>

            {/* 6. Dedicated Staff Operations Dashboard */}
            <div
              onClick={() => onNavigateTab('admin_staff_console')}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Faculty Operations Mode</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 leading-snug">
                Switch into the staff member dashboard interface with summary stats and quick actions.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Institutional Governance & Security */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Campus Governance & Infrastructure
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Faculty & Staff Administration */}
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

            {/* Student Registry (CSV) */}
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

            {/* Cryptographic Ledger */}
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

            {/* Security Events */}
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
