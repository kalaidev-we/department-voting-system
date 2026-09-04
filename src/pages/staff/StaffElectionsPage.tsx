import React, { useState, useEffect } from 'react';
import { StaffHeader } from '../../components/staff/StaffHeader';
import { StaffBottomNav } from '../../components/staff/StaffBottomNav';
import { ElectionCard } from '../../components/staff/ElectionCard';
import { ElectionCardSkeleton } from '../../components/common/SkeletonLoader';
import { fetchStaffElections } from '../../services/electionService';
import { Election, ElectionStatus } from '../../lib/types';
import { Plus, Search, Filter } from 'lucide-react';

interface StaffElectionsPageProps {
  onNavigateTab: (tab: string) => void;
  onSelectElection?: (election: Election) => void;
}

export function StaffElectionsPage({
  onNavigateTab,
  onSelectElection,
}: StaffElectionsPageProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SCHEDULED' | 'CLOSED'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const list = await fetchStaffElections();
      setElections(list);
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = elections.filter((e) => {
    const matchesFilter = filter === 'ALL' || e.status === filter;
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.election_type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col pb-20 select-none">
      <StaffHeader onNavigate={onNavigateTab} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Manage Elections
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervise active balloting and scheduled department polls
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('create_election')}
            className="h-9 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Election</span>
          </button>
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
                onClick={() => onSelectElection && onSelectElection(election)}
              />
            ))}
          </div>
        )}
      </main>

      <StaffBottomNav activeTab="elections" onTabChange={onNavigateTab} />
    </div>
  );
}
