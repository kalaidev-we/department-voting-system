import React, { useState, useEffect } from 'react';
import { StaffHeader } from '../../components/staff/StaffHeader';
import { StaffBottomNav } from '../../components/staff/StaffBottomNav';
import { ElectionCard } from '../../components/staff/ElectionCard';
import { ElectionCardSkeleton } from '../../components/common/SkeletonLoader';
import { fetchStaffElections } from '../../services/electionService';
import { hasStudentVoted, getStoredReceipt } from '../../services/votingService';
import { useAuth } from '../../context/AuthContext';
import { Election, ElectionStatus, VoteReceipt } from '../../lib/types';
import { Plus, Search, Filter, Vote, ShieldCheck } from 'lucide-react';

interface StaffElectionsPageProps {
  onNavigateTab: (tab: string) => void;
  onSelectElection?: (election: Election) => void;
  onCastStaffVote?: (electionId: string) => void;
  onViewStaffReceipt?: (receipt: VoteReceipt) => void;
}

export function StaffElectionsPage({
  onNavigateTab,
  onSelectElection,
  onCastStaffVote,
  onViewStaffReceipt,
}: StaffElectionsPageProps) {
  const { profile } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SCHEDULED' | 'CLOSED'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  const voterId = profile?.id || profile?.student_id || profile?.email || 'staff-voter-001';

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const list = await fetchStaffElections();
        setElections(list);

        const vMap: Record<string, boolean> = {};
        await Promise.all(
          list.map(async (el) => {
            vMap[el.id] = await hasStudentVoted(el.id, voterId);
          })
        );
        setVotedMap(vMap);
      } catch (err) {
        console.warn('Failed to load elections in StaffElectionsPage:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [voterId]);

  const filtered = elections.filter((e) => {
    const matchesFilter = filter === 'ALL' || e.status === filter;
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.election_type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeCount = elections.filter((e) => e.status === 'ACTIVE').length;
  const votedCount = elections.filter((e) => e.status === 'ACTIVE' && votedMap[e.id]).length;

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col pb-24 sm:pb-20 select-none">
      <StaffHeader onNavigate={onNavigateTab} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-5 sm:py-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manage & Vote in Elections
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervise active balloting, cast faculty votes, and inspect campus polls
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('create_election')}
            className="self-start sm:self-center h-9 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Election</span>
          </button>
        </div>

        {/* Faculty Voter Privilege Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/80 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Faculty Voting Rights in All Elections</span>
                <span className="px-1.5 py-0.2 rounded bg-brand-100 text-brand-700 text-[10px] font-bold">
                  Active
                </span>
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Staff members are eligible to cast an anonymous ballot in every campus & department election.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Faculty Ballots
            </span>
            <span className="text-xs font-black text-brand-700">
              {votedCount}/{activeCount} Active Cast
            </span>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search election by name..."
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(['ALL', 'ACTIVE', 'SCHEDULED', 'CLOSED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {tab === 'ALL' ? 'All Elections' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            <ElectionCardSkeleton />
            <ElectionCardSkeleton />
            <ElectionCardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No elections found matching current filters.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                hasVoted={Boolean(votedMap[election.id])}
                onVote={() => {
                  if (onCastStaffVote) onCastStaffVote(election.id);
                  else if (onSelectElection) onSelectElection(election);
                  else onNavigateTab('staff_vote');
                }}
                onViewReceipt={() => {
                  const r = getStoredReceipt(election.id, voterId);
                  if (r && onViewStaffReceipt) onViewStaffReceipt(r);
                }}
                onClick={() => {
                  if (election.status === 'ACTIVE' && !votedMap[election.id]) {
                    if (onCastStaffVote) onCastStaffVote(election.id);
                    else if (onSelectElection) onSelectElection(election);
                    else onNavigateTab('staff_vote');
                  } else if (votedMap[election.id]) {
                    const r = getStoredReceipt(election.id, voterId);
                    if (r && onViewStaffReceipt) onViewStaffReceipt(r);
                  } else if (onSelectElection) {
                    onSelectElection(election);
                  }
                }}
              />
            ))}
          </div>
        )}
      </main>

      <StaffBottomNav activeTab="elections" onTabChange={onNavigateTab} />
    </div>
  );
}
