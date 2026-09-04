import React from 'react';
import { DashboardSummaryStats } from '../../lib/types';
import { Users, CheckCircle2, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  stats: DashboardSummaryStats;
  isLoading?: boolean;
}

export function SummaryCards({ stats, isLoading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4 select-none">
      {/* Card 1: Eligible Voters */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all">
        <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
          <Users className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span className="text-[11px] font-semibold tracking-tight text-slate-500 truncate">
            Eligible Voters
          </span>
        </div>

        <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
          {isLoading ? (
            <div className="h-6 w-16 bg-slate-200 animate-pulse rounded-md" />
          ) : (
            stats.eligibleVoters.toLocaleString()
          )}
        </div>

        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
          Active roster
        </div>
      </div>

      {/* Card 2: Votes Cast */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all">
        <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[11px] font-semibold tracking-tight text-slate-500 truncate">
            Votes Cast
          </span>
        </div>

        <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
          {isLoading ? (
            <div className="h-6 w-16 bg-slate-200 animate-pulse rounded-md" />
          ) : (
            stats.votesCast.toLocaleString()
          )}
        </div>

        <div className="text-[10px] text-emerald-600 font-medium mt-0.5 truncate">
          Verified ballots
        </div>
      </div>

      {/* Card 3: Participation */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all">
        <div className="flex items-center space-x-1.5 text-slate-500 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="text-[11px] font-semibold tracking-tight text-slate-500 truncate">
            Participation
          </span>
        </div>

        <div className="text-lg sm:text-2xl font-black text-brand-600 tracking-tight leading-tight">
          {isLoading ? (
            <div className="h-6 w-16 bg-slate-200 animate-pulse rounded-md" />
          ) : (
            `${stats.participationRate}%`
          )}
        </div>

        <div className="text-[10px] text-indigo-500 font-medium mt-0.5 truncate">
          Turnout rate
        </div>
      </div>
    </div>
  );
}
