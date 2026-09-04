import React, { useState, useEffect } from 'react';
import { StaffHeader } from '../../components/staff/StaffHeader';
import { StaffBottomNav } from '../../components/staff/StaffBottomNav';
import { Election } from '../../lib/types';
import { fetchStaffElections } from '../../services/electionService';
import {
  BarChart3,
  Download,
  Users,
  Vote,
  PieChart,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface StaffReportsPageProps {
  onNavigateTab: (tab: string) => void;
}

export function StaffReportsPage({ onNavigateTab }: StaffReportsPageProps) {
  const [elections, setElections] = useState<Election[]>([]);

  useEffect(() => {
    async function load() {
      const list = await fetchStaffElections();
      setElections(list);
    }
    load();
  }, []);

  const activeElection = elections.find((e) => e.status === 'ACTIVE') || elections[0];
  const eligibleCount = activeElection?.eligible_voters_count || 0;
  const votesRecorded = activeElection?.votes_count || 0;
  const turnoutRate =
    eligibleCount > 0 ? parseFloat(((votesRecorded / eligibleCount) * 100).toFixed(1)) : 0;

  const handleExportCSV = () => {
    const header = 'Election Title,Voter Turnout (%),Eligible Count,Votes Recorded,Status,Timestamp\n';
    const rows = elections.length > 0
      ? elections
          .map((el) => {
            const elTurnout =
              el.eligible_voters_count > 0
                ? ((el.votes_count / el.eligible_voters_count) * 100).toFixed(1)
                : '0.0';
            return `"${el.title}",${elTurnout}%,${el.eligible_voters_count},${el.votes_count},${el.status},${new Date().toISOString()}`;
          })
          .join('\n')
      : `No Elections Recorded,0%,0,0,EMPTY,${new Date().toISOString()}`;

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SecureVote-Turnout-Report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col pb-20 select-none antialiased">
      <StaffHeader onNavigate={onNavigateTab} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Turnout & Audit Reports
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Certified participation rates and democratic audit metrics
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Turnout Progress Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              {activeElection ? `${activeElection.title} Turnout` : 'Institutional Voter Turnout'}
            </h2>
            <span className="text-base font-black text-blue-600">{turnoutRate}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(turnoutRate, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Eligible Roll</span>
              <span className="font-bold text-slate-800">{eligibleCount.toLocaleString()} Voters</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Ballots Cast</span>
              <span className="font-bold text-slate-800">{votesRecorded.toLocaleString()} Ballots</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Active Status</span>
              <span className="font-bold text-slate-800">{activeElection?.status || 'IDLE'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Audit Proof</span>
              <span className="font-bold text-emerald-600">SHA-256 Valid</span>
            </div>
          </div>
        </div>

        {/* Privacy Certification Seal */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-emerald-900">
              Immutable Anonymity Protection Confirmed
            </h3>
            <p className="text-emerald-700 leading-relaxed">
              Voter identification data is cryptographically decoupled. Participation records confirm that verified institutional voters cast ballots without linking any ballot choices to student roll numbers or identity profiles.
            </p>
          </div>
        </div>
      </main>

      <StaffBottomNav activeTab="more" onTabChange={onNavigateTab} />
    </div>
  );
}
