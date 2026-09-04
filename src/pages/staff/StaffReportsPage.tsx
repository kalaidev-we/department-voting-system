import React from 'react';
import { StaffHeader } from '../../components/staff/StaffHeader';
import { StaffBottomNav } from '../../components/staff/StaffBottomNav';
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
  const handleExportCSV = () => {
    const csv = `Election Title,Voter Turnout (%),Eligible Count,Votes Recorded,Anonymity Status,Timestamp
Cybersecurity Association President,74.7%,1248,932,DECOUPLED & VERIFIED,${new Date().toISOString()}
Student Council General Secretary,0.0%,4250,0,SCHEDULED,${new Date().toISOString()}
Class Representative 2025 Section A,94.1%,68,64,CLOSED & SEALED,${new Date().toISOString()}`;

    const blob = new Blob([csv], { type: 'text/csv' });
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
              Department Turnout Rate (Active Election)
            </h2>
            <span className="text-base font-black text-blue-600">74.7%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full w-[74.7%]" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">1st Year</span>
              <span className="font-bold text-slate-800">81.4% Turnout</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">2nd Year</span>
              <span className="font-bold text-slate-800">76.2% Turnout</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">3rd Year</span>
              <span className="font-bold text-slate-800">71.0% Turnout</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 text-[10px] block">4th Year</span>
              <span className="font-bold text-slate-800">70.2% Turnout</span>
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
              Voter identification data has been stripped. Participation records verify that 932 unique students voted without linking any ballot choices to names or student roll numbers.
            </p>
          </div>
        </div>
      </main>

      <StaffBottomNav activeTab="more" onTabChange={onNavigateTab} />
    </div>
  );
}
