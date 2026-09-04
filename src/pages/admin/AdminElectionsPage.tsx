import React, { useState, useEffect } from 'react';
import { Election, ElectionStatus } from '../../lib/types';
import {
  fetchStaffElections,
  updateElectionStatus,
  deleteElection,
} from '../../services/electionService';
import {
  ChevronLeft,
  Vote,
  Search,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Trash2,
  Activity,
  Clock,
  Archive,
  RefreshCw,
} from 'lucide-react';

interface AdminElectionsPageProps {
  onBack: () => void;
  onCreateElection: () => void;
  onEditElection: (election: Election) => void;
}

export function AdminElectionsPage({
  onBack,
  onCreateElection,
  onEditElection,
}: AdminElectionsPageProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SCHEDULED' | 'CLOSED' | 'DRAFT'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteConfirmElection, setDeleteConfirmElection] = useState<Election | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const list = await fetchStaffElections();
    setElections(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = async (electionId: string, newStatus: ElectionStatus) => {
    setActionLoadingId(electionId);
    const res = await updateElectionStatus(electionId, newStatus);
    setActionLoadingId(null);
    if (res.success) {
      showToast(`Election status successfully updated to ${newStatus}`);
      setElections((prev) =>
        prev.map((e) => (e.id === electionId ? { ...e, status: newStatus } : e))
      );
    } else {
      alert(`Failed to update status: ${res.error || 'Unknown error'}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmElection) return;
    setActionLoadingId(deleteConfirmElection.id);
    const res = await deleteElection(deleteConfirmElection.id);
    setActionLoadingId(null);
    const deletedTitle = deleteConfirmElection.title;
    setDeleteConfirmElection(null);

    if (res.success) {
      showToast(`Election "${deletedTitle}" and all related data purged.`);
      setElections((prev) => prev.filter((e) => e.id !== deleteConfirmElection.id));
    } else {
      alert(`Failed to delete election: ${res.error || 'Unknown error'}`);
    }
  };

  const filtered = elections.filter((e) => {
    const matchesFilter = filter === 'ALL' || e.status === filter;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.election_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.department_name && e.department_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const activeCount = elections.filter((e) => e.status === 'ACTIVE').length;
  const scheduledCount = elections.filter((e) => e.status === 'SCHEDULED').length;
  const closedCount = elections.filter((e) => e.status === 'CLOSED').length;

  const getStatusBadge = (status: ElectionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            SCHEDULED
          </span>
        );
      case 'CLOSED':
      case 'RESULTS_VERIFIED':
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            {status}
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
                Elections Governance & CRUD
              </h1>
              <span className="px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 text-[9px] font-extrabold uppercase tracking-wider border border-purple-100">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Create, edit, change status, and purge institutional voting ballots
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            title="Refresh list"
            className="w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onCreateElection}
            className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Election</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 4 Metric Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Total Elections</span>
            <div className="text-lg font-black text-slate-900">{elections.length}</div>
            <span className="text-[10px] text-indigo-600 font-bold">In Database</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Active Now</span>
            <div className="text-lg font-black text-emerald-600">{activeCount}</div>
            <span className="text-[10px] text-emerald-600 font-bold">Accepting Votes</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Scheduled</span>
            <div className="text-lg font-black text-blue-600">{scheduledCount}</div>
            <span className="text-[10px] text-blue-600 font-bold">Upcoming</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Concluded</span>
            <div className="text-lg font-black text-slate-700">{closedCount}</div>
            <span className="text-[10px] text-slate-500 font-bold">Closed Polls</span>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search elections by title, type, or department..."
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>

          <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(['ALL', 'ACTIVE', 'SCHEDULED', 'CLOSED', 'DRAFT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {tab === 'ALL' ? 'All Polls' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Elections List */}
        {isLoading ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
            <Activity className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading election database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 sm:p-12 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Vote className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">No Elections Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are no elections in the database matching your filter criteria. Create your
                first election to activate campus voting.
              </p>
            </div>
            <button
              onClick={onCreateElection}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Election</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((election) => (
              <div
                key={election.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs space-y-4 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {election.title}
                      </h3>
                      {getStatusBadge(election.status)}
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                        {election.election_type}
                      </span>
                    </div>
                    {election.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {election.description}
                      </p>
                    )}
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center space-x-1.5 self-end sm:self-start">
                    <button
                      onClick={() => onEditElection(election)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                      title="Edit election parameters"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmElection(election)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer border border-rose-100"
                      title="Delete election permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Details Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Department / Scope</span>
                    <span className="font-semibold text-slate-700">
                      {election.department_name || 'All Departments'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Academic Year</span>
                    <span className="font-semibold text-slate-700">
                      {election.academic_year || '2026-2027'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Turnout / Registered</span>
                    <span className="font-semibold text-slate-700">
                      {election.votes_count} / {election.eligible_voters_count || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Start Date</span>
                    <span className="font-semibold text-slate-700 font-mono text-[11px]">
                      {new Date(election.start_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Quick Status Selector Control */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100/80 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Status Transition:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['DRAFT', 'SCHEDULED', 'ACTIVE', 'CLOSED', 'RESULTS_VERIFIED'] as ElectionStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          disabled={actionLoadingId === election.id || election.status === st}
                          onClick={() => handleStatusChange(election.id, st)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            election.status === st
                              ? 'bg-slate-800 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed'
                          }`}
                        >
                          {st === election.status ? `✓ ${st}` : st}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmElection && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Purge Election: {deleteConfirmElection.title}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This action is <strong>irreversible</strong>. Deleting this election will purge all
                registered candidates, student applications, anonymous votes, and cryptographic
                ledger blocks linked to this election ID.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmElection(null)}
                className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoadingId === deleteConfirmElection.id}
                onClick={handleDeleteConfirm}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {actionLoadingId === deleteConfirmElection.id ? 'Purging...' : 'Confirm Purge'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
