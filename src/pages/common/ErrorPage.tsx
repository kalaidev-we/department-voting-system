import React, { useState } from 'react';
import { AlertOctagon, RotateCcw, Home, LifeBuoy, ChevronDown, ChevronUp, Shield } from 'lucide-react';

interface ErrorPageProps {
  error?: Error | string | null;
  errorInfo?: string | null;
  onResetError?: () => void;
  onBackToHome?: () => void;
}

export function ErrorPage({
  error,
  errorInfo,
  onResetError,
  onBackToHome,
}: ErrorPageProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.message || 'An unexpected operational exception occurred while rendering this page.';

  const handleReload = () => {
    if (onResetError) {
      onResetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between select-none antialiased">
      {/* Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <span className="text-sm sm:text-base font-black tracking-tight text-slate-900">
            Secure<span className="text-brand-600">Vote</span>
          </span>
        </div>

        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold font-mono">
          <AlertOctagon className="w-3 h-3 text-rose-600" />
          <span>ERROR 500</span>
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg text-center space-y-6 animate-fadeIn">
          {/* Custom Server/System Error Vector Illustration */}
          <div className="w-64 h-48 sm:w-80 sm:h-56 mx-auto relative flex items-center justify-center">
            <svg
              viewBox="0 0 320 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-sm"
            >
              {/* Soft ground shadow */}
              <ellipse cx="160" cy="185" rx="120" ry="22" fill="#FFE4E6" opacity="0.6" />

              {/* Server Terminal Block */}
              <g transform="translate(90, 40)">
                {/* Server Cabinet Base */}
                <rect x="10" y="10" width="120" height="120" rx="20" fill="#1E1B4B" />
                <rect x="14" y="14" width="112" height="112" rx="16" fill="#312E81" />

                {/* Server Unit 1 */}
                <rect x="24" y="26" width="92" height="22" rx="6" fill="#1E1B4B" />
                <circle cx="34" cy="37" r="3" fill="#10B981" />
                <circle cx="44" cy="37" r="3" fill="#38BDF8" />
                <line x1="56" y1="37" x2="104" y2="37" stroke="#4338CA" strokeWidth="2.5" strokeLinecap="round" />

                {/* Server Unit 2 (Error Blade) */}
                <rect x="24" y="56" width="92" height="26" rx="6" fill="#4C0519" stroke="#E11D48" strokeWidth="1.5" />
                <circle cx="34" cy="69" r="3.5" fill="#EF4444" />
                <line x1="46" y1="69" x2="88" y2="69" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
                <text x="96" y="73" fontFamily="monospace" fontSize="11" fontWeight="bold" fill="#F43F5E">!</text>

                {/* Server Unit 3 */}
                <rect x="24" y="90" width="92" height="22" rx="6" fill="#1E1B4B" />
                <circle cx="34" cy="101" r="3" fill="#10B981" />
                <line x1="46" y1="101" x2="104" y2="101" stroke="#4338CA" strokeWidth="2.5" strokeLinecap="round" />
              </g>

              {/* Floating Shield Warning Badge */}
              <g transform="translate(195, 25)">
                <circle cx="28" cy="28" r="24" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="3" />
                <polygon points="28,14 42,40 14,40" fill="#FFE4E6" stroke="#E11D48" strokeWidth="2" strokeLinejoin="round" />
                <text x="26" y="36" fontFamily="sans-serif" fontSize="16" fontWeight="900" fill="#BE123C">!</text>
              </g>

              {/* Floating gears/circuit spark dots */}
              <circle cx="70" cy="50" r="4" fill="#F43F5E" opacity="0.6" />
              <circle cx="60" cy="130" r="6" fill="#818CF8" opacity="0.5" />
              <circle cx="250" cy="145" r="5" fill="#FDA4AF" opacity="0.7" />
              <path d="M 65 80 L 80 80 L 80 95" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider">
              System Exception Encountered
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Something Went Wrong
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              An unexpected software or cryptographic ledger exception interrupted your operation.
              All confirmed ballots and records remain secure and uncorrupted.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleReload}
              className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>Return to Dashboard</span>
              </button>
            )}
          </div>

          {/* Technical Details Accordion */}
          <div className="pt-2 max-w-md mx-auto text-left">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-1 mx-auto cursor-pointer transition-colors"
            >
              <span>{showTechnicalDetails ? 'Hide technical diagnosis' : 'View technical error diagnosis'}</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showTechnicalDetails && (
              <div className="mt-3 p-3.5 bg-slate-900 rounded-2xl text-slate-300 font-mono text-[11px] space-y-2 border border-slate-800 animate-fadeIn overflow-hidden">
                <div className="flex items-center justify-between text-rose-400 font-bold border-b border-slate-800 pb-1.5">
                  <span>Stack Trace / Exception</span>
                  <span className="text-[10px]">SecureVote Node</span>
                </div>
                <p className="text-rose-300 break-words">{errorMessage}</p>
                {errorInfo && (
                  <pre className="text-slate-500 text-[10px] whitespace-pre-wrap overflow-x-auto max-h-32 pt-1 border-t border-slate-800/80">
                    {errorInfo}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-400 border-t border-slate-100">
        SecureVote Campus &bull; Incident auto-logged to Super Admin Security Stream
      </footer>
    </div>
  );
}
