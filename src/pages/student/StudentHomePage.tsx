import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchStaffElections } from '../../services/electionService';
import { hasStudentVoted, getStoredReceipt } from '../../services/votingService';
import { Election, VoteReceipt } from '../../lib/types';
import {
  Shield,
  ShieldCheck,
  Vote,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  ChevronRight,
  Award,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { ProfileDropdown } from '../../components/common/ProfileDropdown';

interface StudentHomePageProps {
  onEnterVotingBooth?: (electionId: string) => void;
  onApplyForCandidacy?: (electionId: string) => void;
  onViewReceipt?: (receipt: VoteReceipt) => void;
}

export function StudentHomePage({
  onEnterVotingBooth,
  onApplyForCandidacy,
  onViewReceipt,
}: StudentHomePageProps) {
  const { profile } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const list = await fetchStaffElections();
      setElections(list.filter((e) => e.status === 'ACTIVE' || e.status === 'SCHEDULED'));

      // Check voting eligibility status for each election
      const studentId = profile?.student_id || profile?.id || '26SCL03';
      const map: Record<string, boolean> = {};
      for (const el of list) {
        map[el.id] = await hasStudentVoted(el.id, studentId);
      }
      setVotedMap(map);
    }
    load();
  }, [profile]);

  const studentId = profile?.student_id || profile?.id || '26SCL03';
  const hasVotedAny = Object.values(votedMap).some((v) => v);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Top Navbar */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-base font-black tracking-tight text-slate-900 leading-none">
              Secure<span className="text-blue-600">Vote</span>
            </span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wider border border-emerald-100">
              STUDENT
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ProfileDropdown />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Student Profile Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start sm:items-center space-x-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-[11px] font-semibold text-emerald-200 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Verified College E-Voter</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                {profile?.full_name || 'KPRIET Student'}
              </h2>

              <p className="text-xs text-blue-100 font-mono mt-0.5">
                {profile?.student_id ? `${profile.student_id} • ` : ''}
                {profile?.department_name || 'Cybersecurity'} • {profile?.year || '2nd Year'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/10 rounded-xl p-2.5">
              <span className="text-blue-200 text-[11px] block">Voting Status</span>
              <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                {hasVotedAny ? 'Ballot Recorded' : 'Eligible to Vote'}
              </span>
            </div>

            <div className="bg-white/10 rounded-xl p-2.5">
              <span className="text-blue-200 text-[11px] block">College Node</span>
              <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                KPRIET Campus
              </span>
            </div>
          </div>
        </div>

        {/* Candidate Nomination Callout Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Interested in Contesting for Office?
              </h3>
              <p className="text-xs text-slate-500">
                Submit your candidate manifesto and campaign platform for faculty review.
              </p>
            </div>
          </div>

          <button
            onClick={() => onApplyForCandidacy && onApplyForCandidacy(elections[0]?.id || '')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            Apply as Candidate
          </button>
        </div>

        {/* Elections List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active Campus Ballots
          </h3>

          {elections.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Vote className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">No Active Ballots Currently</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  There are currently no active campus elections open for voting. When election officers publish an election, it will appear here.
                </p>
              </div>
            </div>
          ) : (
            elections.map((election) => {
              const isVoted = votedMap[election.id];
              const receipt = isVoted ? getStoredReceipt(election.id, studentId) : null;
              const diffMs = new Date(election.end_at).getTime() - Date.now();
              const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
              const days = Math.floor(hours / 24);
              const remHours = hours % 24;
              const timeLabel = diffMs <= 0 ? 'Voting Closed' : days > 0 ? `Ends in ${days}d ${remHours}h` : `Ends in ${hours}h`;

              return (
                <div
                  key={election.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 uppercase">
                      {election.election_type}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Voting Open
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      {election.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{election.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {timeLabel}
                    </span>

                    {isVoted ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => receipt && onViewReceipt && onViewReceipt(receipt)}
                          className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                        >
                          <FileCheck className="w-4 h-4 text-slate-500" />
                          <span>View Receipt</span>
                        </button>

                        <span className="h-10 px-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Ballot Cast</span>
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onEnterVotingBooth && onEnterVotingBooth(election.id)}
                        className="h-10 px-4 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                      >
                        <Vote className="w-4 h-4" />
                        <span>Enter Voting Booth</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
