import React, { useState, useEffect } from 'react';
import { StaffHeader } from '../../components/staff/StaffHeader';
import { StaffBottomNav } from '../../components/staff/StaffBottomNav';
import { CandidateApplication } from '../../lib/types';
import { fetchCandidateApplications, reviewApplication } from '../../services/candidateService';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Search,
  ShieldCheck,
  AlertCircle,
  FileText,
  Filter,
  X,
} from 'lucide-react';

interface StaffApplicationsPageProps {
  onNavigateTab: (tab: string) => void;
}

export function StaffApplicationsPage({ onNavigateTab }: StaffApplicationsPageProps) {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectModalApp, setRejectModalApp] = useState<CandidateApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    const list = await fetchCandidateApplications();
    setApplications(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (app: CandidateApplication) => {
    setIsProcessing(true);
    await reviewApplication(
      app.id,
      'APPROVED',
      'Credentials & student conduct verified by Faculty Election Officer.',
      'Dr. S. Kumar'
    );
    await loadData();
    setIsProcessing(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalApp || !rejectionReason.trim()) return;
    setIsProcessing(true);
    await reviewApplication(
      rejectModalApp.id,
      'REJECTED',
      rejectionReason.trim(),
      'Dr. S. Kumar'
    );
    setRejectModalApp(null);
    setRejectionReason('');
    await loadData();
    setIsProcessing(false);
  };

  const filtered = applications.filter((app) => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'UNDER_REVIEW' && (app.status === 'UNDER_REVIEW' || app.status === 'SUBMITTED')) ||
      app.status === filter;

    const matchesSearch =
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.election_title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col pb-20 select-none antialiased">
      <StaffHeader onNavigate={onNavigateTab} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Nomination Review
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and certify candidate eligibility for ballots
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {(['ALL', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f === 'ALL'
                ? 'All'
                : f === 'UNDER_REVIEW'
                ? 'Pending Review'
                : f === 'APPROVED'
                ? 'Approved'
                : 'Rejected'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applicant name, roll number, or election..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-400">
              No nomination applications found matching this criteria.
            </div>
          ) : (
            filtered.map((app) => (
              <div
                key={app.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {app.full_name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold font-mono">
                        {app.student_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {app.department} &bull; {app.year} &bull; CGPA: <span className="font-bold text-slate-800">{app.cgpa}</span>
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      app.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : app.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {app.status === 'APPROVED'
                      ? 'Approved'
                      : app.status === 'REJECTED'
                      ? 'Rejected'
                      : 'Pending Review'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <span className="font-bold text-slate-800 block">
                    Election: {app.election_title}
                  </span>
                  <p className="text-slate-600 italic">"{app.slogan}"</p>
                  <p className="text-slate-600 mt-1 text-[11px] line-clamp-2">
                    {app.manifesto}
                  </p>
                </div>

                {app.review_notes && (
                  <p className="text-[11px] text-slate-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                    <span className="font-bold text-blue-900">Faculty Notes:</span> {app.review_notes}
                  </p>
                )}

                {/* Actions for Pending Applications */}
                {(app.status === 'UNDER_REVIEW' || app.status === 'SUBMITTED') && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setRejectModalApp(app)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reject Nomination
                    </button>

                    <button
                      onClick={() => handleApprove(app)}
                      disabled={isProcessing}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Approve & Add to Ballot
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Reject Candidate Nomination
              </h3>
              <button
                onClick={() => setRejectModalApp(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Provide an audited academic or conduct reason for rejecting <span className="font-semibold text-slate-800">{rejectModalApp.full_name}</span> ({rejectModalApp.student_id}):
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. CGPA falls below department 7.50 requirement, or active disciplinary pending."
              rows={3}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => setRejectModalApp(null)}
                className="flex-1 h-9 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim() || isProcessing}
                className="flex-1 h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs disabled:opacity-50 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <StaffBottomNav activeTab="more" onTabChange={onNavigateTab} />
    </div>
  );
}
