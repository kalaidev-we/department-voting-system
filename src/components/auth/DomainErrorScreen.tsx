import React from 'react';
import { ShieldAlert, LogOut, RefreshCw, GraduationCap } from 'lucide-react';
import { getAllowedDomain } from '../../lib/domainValidator';

interface DomainErrorScreenProps {
  rejectedEmail: string;
  onTryAnotherAccount: () => void;
  onBackToLogin: () => void;
}

export function DomainErrorScreen({
  rejectedEmail,
  onTryAnotherAccount,
  onBackToLogin,
}: DomainErrorScreenProps) {
  const allowedDomain = getAllowedDomain();

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3.5 sm:p-6 select-none transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/70 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800 text-center animate-fadeIn">
        {/* Shield Icon Badge */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 sm:mb-5 shadow-sm">
          <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
        </div>

        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          College account required
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          Please sign in using your official college Google account.
        </p>

        {/* Rejected Account Card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-left">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
            Attempted Account
          </span>
          <div className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 break-all">
            {rejectedEmail || 'unknown@domain.com'}
          </div>

          <div className="mt-3 flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/50 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Authorized domain: <strong className="font-mono">{allowedDomain}</strong>
            </span>
          </div>
        </div>

        {/* Help Note */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 leading-relaxed">
          SecureVote Campus requires an official institutional identity to guarantee one student, one vote integrity.
        </p>

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={onTryAnotherAccount}
            className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try another account</span>
          </button>

          <button
            onClick={onBackToLogin}
            className="w-full h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
