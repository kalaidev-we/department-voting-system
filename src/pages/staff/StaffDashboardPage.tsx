import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchStaffElections, computeSummaryStats } from '../../services/electionService';
import { hasStudentVoted, getStoredReceipt } from '../../services/votingService';
import { Election, DashboardSummaryStats, VoteReceipt } from '../../lib/types';
import { StaffHeader } from '../../components/staff/StaffHeader';
import { SummaryCards } from '../../components/staff/SummaryCards';
import { QuickActions } from '../../components/staff/QuickActions';
import { ElectionCard } from '../../components/staff/ElectionCard';
import { StaffBottomNav } from '../../components/staff/StaffBottomNav';
import { SummaryCardsSkeleton, ElectionCardSkeleton } from '../../components/common/SkeletonLoader';
import { Vote, Filter, Plus, ChevronRight, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';

interface StaffDashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onSelectElection?: (election: Election) => void;
  onCastStaffVote?: (electionId: string) => void;
  onViewStaffReceipt?: (receipt: VoteReceipt) => void;
}

export function StaffDashboardPage({
  onNavigateTab,
  onSelectElection,
  onCastStaffVote,
  onViewStaffReceipt,
}: StaffDashboardPageProps) {
  const { profile } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [stats, setStats] = useState<DashboardSummaryStats>({
    eligibleVoters: 0,
    votesCast: 0,
    participationRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  const voterId = profile?.id || profile?.student_id || profile?.email || 'staff-voter-001';

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const list = await fetchStaffElections();
        setElections(list);
        const computed = computeSummaryStats(list);
        setStats(computed);

        // Check if staff has voted in every election
        const vMap: Record<string, boolean> = {};
        await Promise.all(
          list.map(async (el) => {
            vMap[el.id] = await hasStudentVoted(el.id, voterId);
          })
        );
        setVotedMap(vMap);
      } catch (e) {
        console.warn('Error loading dashboard data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, [voterId]);

  const activeElections = elections.filter((e) => e.status === 'ACTIVE');
  const votedActiveCount = activeElections.filter((e) => votedMap[e.id]).length;
  const totalActive = activeElections.length;
  const unvotedActive = activeElections.filter((e) => !votedMap[e.id]);
  const hasVotedAllActive = totalActive > 0 && votedActiveCount === totalActive;
  const hasVotedAnyActive = votedActiveCount > 0;

  const staffName = profile?.full_name || 'Dr. S. Kumar';
  const staffDepartment = profile?.department_name || 'Cybersecurity Department';

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col pb-24 sm:pb-20 select-none antialiased">
      {/* Top Staff Header */}
      <StaffHeader onNavigate={onNavigateTab} />

      {/* Main Content Container (Mobile-First + Max Width Centered on Desktop) */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-5 sm:py-7 space-y-6">
        {/* Welcome Greeting Section */}
        <section className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {staffName}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 flex flex-wrap items-center gap-1.5">
            <span>{staffDepartment}</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-brand-600 font-bold">Faculty Member & Voter</span>
          </p>
        </section>

        {/* SUMMARY: 3 Compact Cards */}
        <section>
          {isLoading ? (
            <SummaryCardsSkeleton />
          ) : (
            <SummaryCards stats={stats} isLoading={isLoading} />
          )}
        </section>

        {/* Staff Voter Participation Banner across all elections */}
        <section className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                hasVotedAllActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : hasVotedAnyActive
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Staff Voting Access (All Elections)
                </h3>
                {totalActive > 0 && (
                  <span
                    className={`px-2 py-0.2 rounded-md text-[10px] font-bold border ${
                      hasVotedAllActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {votedActiveCount}/{totalActive} Voted
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalActive === 0
                  ? 'No active campus elections running at the moment.'
                  : hasVotedAllActive
                  ? 'All active ballots have been cast and recorded in the cryptographic ledger.'
                  : `You hold full faculty voter eligibility for all ${totalActive} active elections.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
            {unvotedActive.length > 0 && (
              <button
                onClick={() => {
                  const targetId = unvotedActive[0].id;
                  if (onCastStaffVote) onCastStaffVote(targetId);
                  else onNavigateTab('staff_vote');
                }}
                className="w-full sm:w-auto h-10 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm shadow-brand-500/20 transition-colors cursor-pointer"
              >
                <Vote className="w-4 h-4" />
                <span>
                  {unvotedActive.length === 1
                    ? 'Cast Ballot'
                    : `Vote in ${unvotedActive[0].title.slice(0, 18)}...`}
                </span>
              </button>
            )}

            {hasVotedAnyActive && (
              <button
                onClick={() => {
                  const votedElection = elections.find((e) => votedMap[e.id]);
                  const receipt = votedElection ? getStoredReceipt(votedElection.id, voterId) : null;
                  if (receipt && onViewStaffReceipt) onViewStaffReceipt(receipt);
                  else onNavigateTab('staff_vote');
                }}
                className="w-full sm:w-auto h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-slate-600" />
                <span>Latest Receipt</span>
              </button>
            )}
          </div>
        </section>

        {/* QUICK ACTIONS: 4-Column Grid */}
        <section>
          <QuickActions
            onCreateElection={() => onNavigateTab('create_election')}
            onManageCandidates={() => onNavigateTab('candidates')}
            onViewAnalytics={() => onNavigateTab('analytics')}
            onCastStaffVote={() => {
              if (unvotedActive.length > 0 && onCastStaffVote) {
                onCastStaffVote(unvotedActive[0].id);
              } else {
                onNavigateTab('staff_vote');
              }
            }}
            hasVoted={hasVotedAllActive}
          />
        </section>

        {/* MY ELECTIONS Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Campus Elections & Faculty Ballots
            </h3>

            <button
              onClick={() => onNavigateTab('elections')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-0.5 cursor-pointer"
            >
              <span>View All ({elections.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Election Cards List */}
          {isLoading ? (
            <div className="space-y-3">
              <ElectionCardSkeleton />
              <ElectionCardSkeleton />
            </div>
          ) : elections.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center mx-auto">
                <Vote className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">No elections yet</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  No active or scheduled elections found.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('create_election')}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Create Election
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {elections.map((election) => (
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
        </section>
      </main>

      {/* Fixed Bottom Navigation Bar for Mobile */}
      <StaffBottomNav activeTab="home" onTabChange={onNavigateTab} />
    </div>
  );
}
