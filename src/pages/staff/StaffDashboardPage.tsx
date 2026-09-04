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
  onViewStaffReceipt?: (receipt: VoteReceipt) => void;
}

export function StaffDashboardPage({
  onNavigateTab,
  onSelectElection,
  onViewStaffReceipt,
}: StaffDashboardPageProps) {
  const { profile } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [stats, setStats] = useState<DashboardSummaryStats>({
    eligibleVoters: 1248,
    votesCast: 932,
    participationRate: 74.7,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasVotedAsStaff, setHasVotedAsStaff] = useState(false);

  const voterId = profile?.id || 'staff-kumar-001';

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

        // Check if staff has voted in the active election
        const voted = await hasStudentVoted('el-001', voterId);
        setHasVotedAsStaff(voted);
      } catch (e) {
        console.warn('Error loading dashboard data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, [voterId]);

  const staffName = profile?.full_name || 'Dr. S. Kumar';
  const staffDepartment = profile?.department_name || 'Cybersecurity Department';

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col pb-20 select-none antialiased">
      {/* Top Staff Header */}
      <StaffHeader onNavigate={onNavigateTab} />

      {/* Main Content Container (Mobile-First + Max Width Centered on Desktop) */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
        {/* Welcome Greeting Section */}
        <section className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {staffName}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-1.5">
            <span>{staffDepartment}</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-brand-600 font-bold">Staff Admin & Voter</span>
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

        {/* Staff Voter Participation Banner */}
        <section className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              hasVotedAsStaff ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Staff Voter Participation
                </h3>
                {hasVotedAsStaff && (
                  <span className="px-2 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Ballot Cast
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasVotedAsStaff
                  ? 'Your faculty ballot has been cryptographically recorded in the anonymous ledger.'
                  : 'As an authorized faculty member, you hold full voter eligibility for active ballots.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
            {hasVotedAsStaff ? (
              <button
                onClick={() => {
                  const receipt = getStoredReceipt('el-001', voterId);
                  if (receipt && onViewStaffReceipt) onViewStaffReceipt(receipt);
                  else onNavigateTab('staff_vote');
                }}
                className="h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-slate-600" />
                <span>View Receipt</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('staff_vote')}
                className="h-10 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-brand-500/20 transition-colors cursor-pointer"
              >
                <Vote className="w-4 h-4" />
                <span>Cast Staff Ballot</span>
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
            onCastStaffVote={() => onNavigateTab('staff_vote')}
            hasVoted={hasVotedAsStaff}
          />
        </section>

        {/* MY ELECTIONS Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Elections
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
                  You don't have any elections assigned to you.
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
                  onClick={() => onSelectElection && onSelectElection(election)}
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
