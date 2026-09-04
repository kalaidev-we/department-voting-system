import React from 'react';
import { ShieldAlert, LogOut, ArrowRight, AlertCircle } from 'lucide-react';

interface UnauthorizedModalProps {
  isOpen: boolean;
  userEmail: string;
  onSignOut: () => void;
  onRetryWithCorrectEmail?: () => void;
}

export function UnauthorizedModal({
  isOpen,
  userEmail,
  onSignOut,
  onRetryWithCorrectEmail,
}: UnauthorizedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-red-100 transform transition-all animate-scaleUp text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Access Restricted
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          Only official college accounts are authorized.
        </p>

        {/* Highlighted Attempted Email */}
        <div className="mt-4 p-3 bg-red-50/60 rounded-xl border border-red-100 text-left">
          <div className="flex items-center space-x-1.5 text-red-700 text-xs font-semibold mb-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Unauthorized Domain</span>
          </div>
          <p className="text-xs font-mono text-slate-700 break-all bg-white/80 px-2 py-1 rounded border border-red-100/50">
            {userEmail || 'unknown@example.com'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Expected: <span className="font-semibold text-brand-600 font-mono">...@kpriet.ac.in</span>
          </p>
        </div>

        <div className="mt-4 text-left p-3 bg-slate-50 rounded-xl border border-slate-100 text-[12px] text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">What to do:</span> Please sign out and choose your official college Google account issued by KPRIET.
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-2">
          {onRetryWithCorrectEmail && (
            <button
              onClick={onRetryWithCorrectEmail}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all"
            >
              <span>Use College Account (@kpriet.ac.in)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onSignOut}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out & Return</span>
          </button>
        </div>
      </div>
    </div>
  );
}
