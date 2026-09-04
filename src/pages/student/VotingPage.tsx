import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Candidate, VoteReceipt, Election } from '../../lib/types';
import { fetchCandidates, submitVote, hasStudentVoted } from '../../services/votingService';
import { fetchElectionById } from '../../services/electionService';
import {
  ChevronLeft,
  Shield,
  Trophy,
  Users,
  Calendar,
  FileText,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface VotingPageProps {
  electionId?: string;
  onBack: () => void;
  onVoteSuccess: (receipt: VoteReceipt) => void;
}

export function VotingPage({ electionId = 'el-001', onBack, onVoteSuccess }: VotingPageProps) {
  const { profile } = useAuth();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'candidates' | 'about' | 'rules'>('candidates');
  const [manifestoModalCandidate, setManifestoModalCandidate] = useState<Candidate | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  useEffect(() => {
    async function load() {
      if (electionId) {
        const el = await fetchElectionById(electionId);
        setElection(el);
      }
      const list = await fetchCandidates(electionId);
      setCandidates(list);
      if (list.length > 0) {
        setSelectedCandidateId(list[0].id);
      }

      const voted = await hasStudentVoted(electionId, profile?.id || profile?.student_id || '26SCL03');
      setAlreadyVoted(voted);
    }
    load();
  }, [electionId, profile]);

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);

  const handleOpenConfirm = () => {
    if (!selectedCandidate) {
      setErrorMessage('Please select a candidate before proceeding.');
      return;
    }
    setErrorMessage(null);
    setIsConfirmModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!selectedCandidate) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await submitVote({
      electionId,
      candidateId: selectedCandidate.id,
      studentId: profile?.id || profile?.student_id || '26SCL03',
      electionTitle: election?.title || 'Campus Election',
      candidateName: selectedCandidate.name,
    });

    setIsSubmitting(false);

    if (result.success && result.receipt) {
      setIsConfirmModalOpen(false);
      onVoteSuccess(result.receipt);
    } else {
      setErrorMessage(result.error || 'Failed to submit vote. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col select-none antialiased">
      {/* 1. Header Bar */}
      <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Go Back"
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center SecureVote Campus Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div className="text-left leading-none">
            <div className="text-base font-black tracking-tight text-slate-900">
              Secure<span className="text-blue-600">Vote</span>
            </div>
            <div className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">
              CAMPUS
            </div>
          </div>
        </div>

        <button
          onClick={() => {}}
          aria-label="More Options"
          className="w-10 h-10 -mr-2 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-6 h-6 text-slate-700" />
        </button>
      </header>

      {/* Main Content Container (Mobile First & Desktop Centered) */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-4 space-y-5">
        {/* 2. Hero Election Card (Matching Media Reference) */}
        {(() => {
          const diffMs = election?.end_at ? new Date(election.end_at).getTime() - Date.now() : 0;
          const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
          const days = Math.floor(hours / 24);
          const remHours = hours % 24;
          const timeLabel = !election?.end_at ? 'Open' : diffMs <= 0 ? 'Voting Closed' : days > 0 ? `${days}d ${remHours}h` : `${hours}h`;

          return (
            <div className="bg-[#f4f7fb] rounded-3xl p-5 border border-slate-100 relative space-y-4">
              <div className="flex items-start justify-between">
                {/* Trophy Icon */}
                <div className="w-12 h-12 rounded-2xl bg-blue-100/90 text-blue-600 flex items-center justify-center shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>

                {/* Top Right Badges */}
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-medium">
                    {election?.election_type || 'Department Election'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Voting Open
                  </span>
                </div>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {election?.title || 'Campus Election'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {election?.description || 'Choose one candidate to represent our institution.'}
                </p>
              </div>

              {/* Metric Row: 3 White Pill Boxes */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                {/* Box 1: Eligible Voters */}
                <div className="bg-white rounded-2xl p-2 sm:p-3 border border-slate-100 flex flex-col justify-center items-start shadow-2xs">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                    {election?.eligible_voters_count ? election.eligible_voters_count.toLocaleString() : '0'}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate w-full">Eligible</span>
                </div>

                {/* Box 2: Countdown Timer */}
                <div className="bg-white rounded-2xl p-2 sm:p-3 border border-slate-100 flex flex-col justify-center items-start shadow-2xs">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Ends in</span>
                  <span className="text-xs sm:text-xs font-extrabold text-blue-600 leading-tight truncate w-full">{timeLabel}</span>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 truncate w-full">
                    {election?.end_at ? new Date(election.end_at).toLocaleDateString() : 'Active'}
                  </span>
                </div>

                {/* Box 3: Candidates Count */}
                <div className="bg-white rounded-2xl p-2 sm:p-3 border border-slate-100 flex flex-col justify-center items-start shadow-2xs">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">{candidates.length}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate w-full">Candidates</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3. Segmented Tab Navigation */}
        <div className="flex items-center border-b border-slate-200">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center transition-all relative cursor-pointer ${
              activeTab === 'candidates'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Candidates
            {activeTab === 'candidates' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center transition-all relative cursor-pointer ${
              activeTab === 'about'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            About Election
            {activeTab === 'about' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold text-center transition-all relative cursor-pointer ${
              activeTab === 'rules'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Rules & Guidelines
            {activeTab === 'rules' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab 1: Candidates Tab Content */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Select a Candidate
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tap on a candidate to view details and select your vote.
              </p>
            </div>

            {/* Candidate List Cards */}
            {candidates.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Candidates Nominated Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are currently no verified candidates registered for this ballot. Nominees will appear once approved by the election committee.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.map((candidate) => {
                  const isSelected = selectedCandidateId === candidate.id;
                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/25 ring-1 ring-blue-500/20'
                          : 'border-slate-200/80 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {/* Photo Avatar: Resolved from candidate photo or real profile avatar */}
                        {(() => {
                          const isUnsplash = candidate.photo_url?.includes('unsplash');
                          const resolvedPhoto =
                            (!isUnsplash && candidate.photo_url) ||
                            ((candidate.student_id?.toUpperCase() === profile?.student_id?.toUpperCase() ||
                              candidate.email?.toLowerCase() === profile?.email?.toLowerCase() ||
                              candidate.name?.toLowerCase() === profile?.full_name?.toLowerCase())
                              ? profile?.avatar_url
                              : null);

                          return resolvedPhoto ? (
                            <img
                              src={resolvedPhoto}
                              alt={candidate.name}
                              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 ring-2 ring-slate-100"
                            />
                          ) : (
                            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shrink-0 ring-2 ring-slate-100">
                              {candidate.name.charAt(0)}
                            </div>
                          );
                        })()}

                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                            {candidate.name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs mt-0.5">
                            "{candidate.slogan || 'Candidate for ' + (election?.title || 'Office')}"
                          </p>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setManifestoModalCandidate(candidate);
                            }}
                            className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                          >
                            View Manifesto
                          </button>
                        </div>
                      </div>

                      {/* Radio Button */}
                      <div className="shrink-0 pr-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-blue-600 bg-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Already Voted Notice */}
            {alreadyVoted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Your ballot has already been recorded</span>
                </div>
                <p className="text-xs text-emerald-600">
                  You cannot submit another vote in this election.
                </p>
              </div>
            ) : candidates.length > 0 && (
              <div className="space-y-3 pt-2">
                {/* Confirm Vote Button */}
                <button
                  onClick={handleOpenConfirm}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 text-sm transition-all cursor-pointer"
                >
                  <span>Confirm Vote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Security Disclaimer */}
                <div className="bg-[#f5f8fb] rounded-xl py-2.5 px-4 text-center text-xs text-slate-500 font-medium flex items-center justify-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>You can only vote once. Please review your choice carefully.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: About Election Content */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Election Purpose</h3>
              <p className="leading-relaxed">
                {election?.description ||
                  `Official campus democratic election for ${election?.title || 'office'}. Registered voters may cast one verified, anonymous ballot.`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Election Timeline</h3>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Election Type:</span>
                  <span className="font-semibold text-slate-800">{election?.election_type || 'Department Election'}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Academic Year:</span>
                  <span className="font-semibold text-slate-800">{election?.academic_year || '2026-2027'}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Voting Starts:</span>
                  <span className="font-semibold text-blue-600">
                    {election?.start_at ? new Date(election.start_at).toLocaleString() : 'Active Now'}
                  </span>
                </li>
                <li className="flex justify-between py-1">
                  <span className="text-slate-500">Voting Concludes:</span>
                  <span className="font-semibold text-slate-800">
                    {election?.end_at ? new Date(election.end_at).toLocaleString() : 'Open'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Rules & Guidelines Content */}
        {activeTab === 'rules' && (
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Voter Conduct & Security Rules</h3>
              <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed text-slate-600">
                <li>Every student holding an active <code>@kpriet.ac.in</code> account has exactly one ballot.</li>
                <li>Your voting choice is strictly decoupled from your student roll number and stored in an anonymous cryptographically hashed ledger.</li>
                <li>Sharing your Google OAuth login credentials or voting on behalf of another peer is a severe violation of college academic integrity.</li>
                <li>Once submitted, a vote cannot be modified, re-cast, or revoked under any circumstances.</li>
              </ol>
            </div>
          </div>
        )}
      </main>

      {/* 4. Candidate Manifesto Modal */}
      {manifestoModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {(() => {
                  const isUnsplash = manifestoModalCandidate.photo_url?.includes('unsplash');
                  const p =
                    (!isUnsplash && manifestoModalCandidate.photo_url) ||
                    ((manifestoModalCandidate.student_id?.toUpperCase() === profile?.student_id?.toUpperCase() ||
                      manifestoModalCandidate.email?.toLowerCase() === profile?.email?.toLowerCase() ||
                      manifestoModalCandidate.name?.toLowerCase() === profile?.full_name?.toLowerCase())
                      ? profile?.avatar_url
                      : null);

                  return p ? (
                    <img
                      src={p}
                      alt={manifestoModalCandidate.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg ring-2 ring-blue-100">
                      {manifestoModalCandidate.name.charAt(0)}
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {manifestoModalCandidate.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {manifestoModalCandidate.department} &bull; {manifestoModalCandidate.student_id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setManifestoModalCandidate(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs italic font-medium">
              "{manifestoModalCandidate.slogan}"
            </div>

            {manifestoModalCandidate.bio && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  About Candidate
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {manifestoModalCandidate.bio}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Manifesto Statement
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {manifestoModalCandidate.manifesto}
              </p>
            </div>

            {manifestoModalCandidate.key_promises && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Key Priorities
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {manifestoModalCandidate.key_promises.map((promise, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{promise}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedCandidateId(manifestoModalCandidate.id);
                  setManifestoModalCandidate(null);
                }}
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Select this Candidate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Confirm Vote Dialog Modal */}
      {isConfirmModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-center max-h-[90vh] overflow-y-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Confirm Your Ballot
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You are casting your official vote for:
              </p>
            </div>

            {/* Selected Candidate Summary Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center space-x-3 text-left">
              {(() => {
                const isUnsplash = selectedCandidate.photo_url?.includes('unsplash');
                const p =
                  (!isUnsplash && selectedCandidate.photo_url) ||
                  ((selectedCandidate.student_id?.toUpperCase() === profile?.student_id?.toUpperCase() ||
                    selectedCandidate.email?.toLowerCase() === profile?.email?.toLowerCase() ||
                    selectedCandidate.name?.toLowerCase() === profile?.full_name?.toLowerCase())
                    ? profile?.avatar_url
                    : null);

                return p ? (
                  <img
                    src={p}
                    alt={selectedCandidate.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shrink-0 ring-2 ring-blue-500/30">
                    {selectedCandidate.name.charAt(0)}
                  </div>
                );
              })()}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {selectedCandidate.name}
                </h4>
                <p className="text-xs text-blue-600 font-semibold truncate">
                  {election?.title || 'Campus Election'}
                </p>
              </div>
            </div>

            {/* Cryptographic Anonymity Notice */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 text-left leading-relaxed">
              <span className="font-bold block">Permanent & Sealed:</span>
              Your vote will be cryptographically decoupled from your student roll number and sealed in the blockchain ledger. This operation cannot be changed.
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sealing Ballot in Ledger...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Official Ballot</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Change Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
