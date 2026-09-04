import React, { useState, useEffect } from 'react';
import { StaffHeader } from '../../components/staff/StaffHeader';
import { StaffBottomNav } from '../../components/staff/StaffBottomNav';
import { Candidate } from '../../lib/types';
import { fetchCandidates } from '../../services/votingService';
import { Users, Plus, Award, Search, ShieldCheck } from 'lucide-react';

interface StaffCandidatesPageProps {
  onNavigateTab: (tab: string) => void;
}

export function StaffCandidatesPage({ onNavigateTab }: StaffCandidatesPageProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const data = await fetchCandidates('el-001');
      setCandidates(data);
    }
    load();
  }, []);

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slogan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col pb-20 select-none antialiased">
      <StaffHeader onNavigate={onNavigateTab} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Candidate Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Active candidates running for campus & department elections
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('add_candidate')}
            className="h-9 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Candidate</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate by name, roll ID, or slogan..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Candidates List */}
        <div className="space-y-3">
          {filtered.map((candidate) => (
            <div
              key={candidate.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  {candidate.photo_url ? (
                    <img
                      src={candidate.photo_url}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-2xl object-cover shrink-0 ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-brand-700 flex items-center justify-center font-bold text-sm border border-blue-200/60 shadow-2xs">
                      {candidate.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">{candidate.name}</h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {candidate.student_id} &bull; {candidate.department}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {candidate.symbol}
                </span>
              </div>

              {candidate.slogan && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                  "{candidate.slogan}"
                </p>
              )}

              {candidate.manifesto && (
                <p className="text-xs text-slate-500 line-clamp-2">
                  {candidate.manifesto}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Recorded Tally</span>
                <span className="font-black text-brand-600">
                  {candidate.votes_count.toLocaleString()} votes
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <StaffBottomNav activeTab="candidates" onTabChange={onNavigateTab} />
    </div>
  );
}
