import React from 'react';
import { PlusCircle, Users, BarChart3, ChevronRight, Vote, Award } from 'lucide-react';

interface QuickActionsProps {
  onCreateElection: () => void;
  onManageCandidates: () => void;
  onViewAnalytics: () => void;
  onCastStaffVote: () => void;
  hasVoted?: boolean;
}

export function QuickActions({
  onCreateElection,
  onManageCandidates,
  onViewAnalytics,
  onCastStaffVote,
  hasVoted = false,
}: QuickActionsProps) {
  return (
    <div className="space-y-2 select-none">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Quick Actions & Governance
      </h3>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Action 1: Create Election */}
        <button
          onClick={onCreateElection}
          className="p-3 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white font-semibold text-xs shadow-sm shadow-brand-500/20 flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2">
            <PlusCircle className="w-4.5 h-4.5" />
          </div>
          <div className="text-left">
            <span className="font-bold block">New Election</span>
            <span className="text-[10px] text-blue-100">Schedule ballot</span>
          </div>
        </button>

        {/* Action 2: Manage Candidates */}
        <button
          onClick={onManageCandidates}
          className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 font-semibold text-xs shadow-xs flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div className="text-left">
            <span className="font-bold block">Candidates</span>
            <span className="text-[10px] text-slate-400">Add & directory</span>
          </div>
        </button>

        {/* Action 3: View Full Result Analytics */}
        <button
          onClick={onViewAnalytics}
          className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 font-semibold text-xs shadow-xs flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <BarChart3 className="w-4.5 h-4.5" />
          </div>
          <div className="text-left">
            <span className="font-bold block">Full Analytics</span>
            <span className="text-[10px] text-slate-400">Results & turnout</span>
          </div>
        </button>

        {/* Action 4: Staff Voter Ballot */}
        <button
          onClick={onCastStaffVote}
          className={`p-3 rounded-2xl border text-xs shadow-xs flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer ${
            hasVoted
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
              : 'bg-white hover:bg-blue-50/50 border-blue-200 text-blue-800'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
              hasVoted ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'
            }`}
          >
            <Vote className="w-4.5 h-4.5" />
          </div>
          <div className="text-left">
            <span className="font-bold block">
              {hasVoted ? 'Staff Vote Cast' : 'Vote as Staff'}
            </span>
            <span className="text-[10px] opacity-80">
              {hasVoted ? 'View receipt' : 'Active election'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
