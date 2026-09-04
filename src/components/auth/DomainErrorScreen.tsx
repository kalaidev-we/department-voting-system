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
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-3.5 sm:p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/70 border border-slate-200/80 text-center animate-fadeIn">
        {/* Shield Icon Badge */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 sm:mb-5 shadow-sm">
          <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
        </div>

        {/* Header */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          College account required
        </h2>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Please sign in using your official college Google account.
        </p>

        {/* Rejected Account Card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-left">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Attempted Account
          </span>
          <div className="text-xs font-mono font-medium text-slate-800 bg-white px-3 py-2 rounded-xl border border-slate-200 break-all">
            {rejectedEmail || 'unknown@domain.com'}
          </div>

          <div className="mt-3 flex items-center space-x-2 text-xs text-brand-700 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100">
            <GraduationCap className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              Authorized domain: <strong className="font-mono">{allowedDomain}</strong>
            </span>
          </div>
        </div>

        {/* Help Note */}
        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          SecureVote Campus requires an official institutional identity to guarantee one student, one vote integrity.
        </p>

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={onTryAnotherAccount}
            className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try another account</span>
          </button>

          <button
            onClick={onBackToLogin}
            className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
