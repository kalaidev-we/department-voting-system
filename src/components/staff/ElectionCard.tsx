import React from 'react';
import { Election, ElectionStatus } from '../../lib/types';
import { Clock, Users, CheckCircle2, ChevronRight, Vote, FileCheck } from 'lucide-react';

interface ElectionCardProps {
  election: Election;
  onClick?: () => void;
  hasVoted?: boolean;
  onVote?: () => void;
  onViewReceipt?: () => void;
}

const STATUS_CONFIG: Record<
  ElectionStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  ACTIVE: {
    label: 'Active',
    bg: 'bg-emerald-50 border-emerald-200/80',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500 animate-pulse',
  },
  SCHEDULED: {
    label: 'Scheduled',
    bg: 'bg-blue-50 border-blue-200/80',
    text: 'text-brand-700',
    dot: 'bg-brand-500',
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
  DRAFT: {
    label: 'Draft',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  RESULTS_VERIFIED: {
    label: 'Verified',
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  PUBLISHED: {
    label: 'Published',
    bg: 'bg-teal-50 border-teal-200',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
  },
  ARCHIVED: {
    label: 'Archived',
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
  },
};

export function ElectionCard({
  election,
  onClick,
  hasVoted = false,
  onVote,
  onViewReceipt,
}: ElectionCardProps) {
  const statusCfg = STATUS_CONFIG[election.status] || STATUS_CONFIG.ACTIVE;

  // Calculate dynamic time remaining or status
  const calculateRemainingTime = () => {
    if (election.status === 'ACTIVE') {
      const diffMs = new Date(election.end_at).getTime() - Date.now();
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `Ends in ${hours}h ${mins}m`;
      }
      return 'Ending shortly';
    }
    if (election.status === 'SCHEDULED') {
      return 'Starts tomorrow';
    }
    if (election.status === 'CLOSED') {
      return 'Voting ended';
    }
    return election.academic_year || '2026-2027';
  };

  return (
    <div
      onClick={onClick}
      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all active:scale-[0.99] cursor-pointer select-none space-y-3"
    >
      {/* Top row: Type & Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-brand-700 tracking-wide uppercase">
            {election.election_type}
          </span>
          <span className="px-2 py-0.2 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
            Faculty Eligible
          </span>
        </div>

        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.bg} ${statusCfg.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          <span>{statusCfg.label}</span>
        </span>
      </div>

      {/* Main Title */}
      <div>
        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug tracking-tight">
          {election.title}
        </h4>
        {election.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {election.description}
          </p>
        )}
      </div>

      {/* Metrics Row: Eligible vs Votes Cast & Voting Action */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">
            {election.eligible_voters_count.toLocaleString()}{' '}
            <span className="text-slate-400 font-normal">Eligible</span>
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="font-semibold text-emerald-600">
            {election.votes_count.toLocaleString()}{' '}
            <span className="text-slate-400 font-normal">Votes</span>
          </span>
          <span className="text-slate-300">&bull;</span>
          <div className="flex items-center space-x-1 text-slate-500 font-medium text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{calculateRemainingTime()}</span>
          </div>
        </div>

        {/* Action Button: Cast Staff Ballot or View Receipt */}
        <div
          className="flex items-center space-x-2 self-start sm:self-auto shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {hasVoted ? (
            <div className="flex items-center space-x-1.5">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ballot Cast</span>
              </span>
              {onViewReceipt && (
                <button
                  type="button"
                  onClick={onViewReceipt}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="View Sealed Receipt"
                >
                  <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Receipt</span>
                </button>
              )}
            </div>
          ) : election.status === 'ACTIVE' ? (
            <button
              type="button"
              onClick={onVote || onClick}
              className="h-8 sm:h-9 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-brand-500/20 transition-all cursor-pointer"
            >
              <Vote className="w-4 h-4" />
              <span>Cast Staff Ballot</span>
              <ChevronRight className="w-3.5 h-3.5 text-blue-200" />
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400">
              {election.status === 'CLOSED' ? 'Voting Concluded' : 'Scheduled'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
