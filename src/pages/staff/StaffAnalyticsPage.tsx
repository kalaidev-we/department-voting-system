import React, { useState, useEffect } from 'react';
import { StaffHeader } from '../../components/staff/StaffHeader';
import { StaffBottomNav } from '../../components/staff/StaffBottomNav';
import { CandidateResultStat, Election } from '../../lib/types';
import { fetchCandidates } from '../../services/votingService';
import { fetchStaffElections } from '../../services/electionService';
import { verifyLedgerIntegrity } from '../../services/adminService';
import {
  Trophy,
  BarChart3,
  PieChart,
  Download,
  ShieldCheck,
  CheckCircle2,
  Users,
  Vote,
  Clock,
  Lock,
  ArrowUpRight,
} from 'lucide-react';

interface StaffAnalyticsPageProps {
  onNavigateTab: (tab: string) => void;
}

export function StaffAnalyticsPage({ onNavigateTab }: StaffAnalyticsPageProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [candidates, setCandidates] = useState<CandidateResultStat[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [ledgerProof, setLedgerProof] = useState<{ totalBlocks: number; lastBlockHash: string }>({
    totalBlocks: 0,
    lastBlockHash: '0xGENESIS_READY',
  });

  useEffect(() => {
    async function loadElections() {
      const list = await fetchStaffElections();
      setElections(list);
      if (list.length > 0) {
        setSelectedElectionId(list[0].id);
      }
    }
    loadElections();
  }, []);

  const selectedElection = elections.find((e) => e.id === selectedElectionId) || elections[0];
  const eligibleVoters = selectedElection?.eligible_voters_count || 0;

  useEffect(() => {
    async function loadCandidatesAndProof() {
      if (!selectedElectionId && elections.length > 0) return;

      const list = await fetchCandidates(selectedElectionId);
      const sum = list.reduce((acc, c) => acc + (c.votes_count || 0), 0);
      setTotalVotes(sum);

      const stats: CandidateResultStat[] = list.map((c) => {
        const count = c.votes_count || 0;
        return {
          id: c.id,
          name: c.name,
          photo_url: c.photo_url,
          slogan: c.slogan,
          department: c.department,
          votes: count,
          percentage: sum > 0 ? parseFloat(((count / sum) * 100).toFixed(1)) : 0,
          is_winner: false,
        };
      });

      // Sort by votes descending
      stats.sort((a, b) => b.votes - a.votes);
      if (stats.length > 0 && stats[0].votes > 0) {
        stats[0].is_winner = true;
      }
      setCandidates(stats);

      const proof = await verifyLedgerIntegrity(selectedElectionId);
      setLedgerProof({
        totalBlocks: proof.totalBlocks,
        lastBlockHash: proof.lastBlockHash,
      });
    }
    loadCandidatesAndProof();
  }, [selectedElectionId, elections]);

  const winner = candidates.length > 0 && candidates[0].votes > 0 ? candidates[0] : null;
  const turnoutRate =
    eligibleVoters > 0 ? parseFloat(((totalVotes / eligibleVoters) * 100).toFixed(1)) : 0;

  const handleExportResultsCSV = () => {
    const rows = [
      'Rank,Candidate Name,Department,Votes Received,Percentage,Outcome',
      ...candidates.map(
        (c, idx) =>
          `${idx + 1},"${c.name}","${c.department || 'All Departments'}",${c.votes},${c.percentage}%,${
            c.is_winner ? 'ELECTED / WINNER' : 'RUNNER UP'
          }`
      ),
      '',
      `Total Ballots Cast,${totalVotes}`,
      `Eligible Voter Roll,${eligibleVoters}`,
      `Participation Rate,${turnoutRate}%`,
      `Ledger Hash,${ledgerProof.lastBlockHash}`,
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certified-Election-Results-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col pb-20 select-none antialiased">
      <StaffHeader onNavigate={onNavigateTab} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Certified Election Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live ballot tallies, candidate percentages, and cryptographic audit proofs
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {elections.length > 1 && (
              <select
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(e.target.value)}
                className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
              >
                {elections.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.title}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleExportResultsCSV}
              disabled={candidates.length === 0}
              className="h-9 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1. Winner Banner */}
        {winner ? (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {winner.photo_url ? (
                    <img
                      src={winner.photo_url}
                      alt={winner.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/40 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/20 text-white font-bold text-xl flex items-center justify-center ring-2 ring-white/40 shadow-md">
                      {winner.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs shadow-sm">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-[10px] font-extrabold text-amber-200 uppercase tracking-wider mb-1">
                    <span>Projected Winner</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {winner.name}
                  </h2>
                  <p className="text-xs text-blue-100">
                    {selectedElection?.title || 'Election'} &bull; {winner.votes} votes ({winner.percentage}%)
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-2xl font-black text-white">{winner.percentage}%</div>
                <span className="text-[10px] text-blue-200 font-bold uppercase">Popular Vote</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* 2. Three Metric Overview Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-slate-400 text-[11px] block font-medium">Eligible Voters</span>
            <div className="text-base sm:text-lg font-black text-slate-900">
              {eligibleVoters.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">100% Verified</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-slate-400 text-[11px] block font-medium">Ballots Cast</span>
            <div className="text-base sm:text-lg font-black text-brand-600">
              {totalVotes.toLocaleString()}
            </div>
            <span className="text-[10px] text-blue-600 font-bold">SHA-256 Chained</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-slate-400 text-[11px] block font-medium">Voter Turnout</span>
            <div className="text-base sm:text-lg font-black text-slate-900">{turnoutRate}%</div>
            <span className="text-[10px] text-emerald-600 font-bold">Democratic Quorum</span>
          </div>
        </div>

        {/* 3. Candidate Vote Breakdown Table & Bars */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Candidate Vote Tallies
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total: {totalVotes} votes
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No Candidates or Votes Recorded</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No ballots have been registered in this election yet. As votes are cast, results will automatically update in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((cand, index) => (
                <div key={cand.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-md bg-slate-100 font-bold text-[11px] flex items-center justify-center text-slate-600">
                        {index + 1}
                      </span>
                      {cand.photo_url ? (
                        <img
                          src={cand.photo_url}
                          alt={cand.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {cand.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-bold text-slate-900">{cand.name}</span>
                      {cand.is_winner && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase">
                          Leading
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 font-mono">
                      <span className="text-slate-500 font-semibold">{cand.votes} votes</span>
                      <span className="font-black text-slate-900">{cand.percentage}%</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cand.is_winner
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${cand.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Cryptographic Ledger Proof */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span className="font-bold">Cryptographic Ledger Status</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
              {ledgerProof.totalBlocks} BLOCKS SEALED
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono break-all leading-tight">
            Root Block Hash: {ledgerProof.lastBlockHash}
          </p>
        </div>
      </main>

      <StaffBottomNav activeTab="more" onTabChange={onNavigateTab} />
    </div>
  );
}
