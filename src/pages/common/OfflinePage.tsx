import React, { useState } from 'react';
import { WifiOff, RefreshCw, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';

interface OfflinePageProps {
  onRetryConnection?: () => void;
  onBackToHome?: () => void;
}

export function OfflinePage({ onRetryConnection, onBackToHome }: OfflinePageProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleRetry = async () => {
    setIsChecking(true);
    // Ping an endpoint or check navigator.onLine
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const online = navigator.onLine;
    setIsOnline(online);
    setIsChecking(false);
    if (online && onRetryConnection) {
      onRetryConnection();
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-between select-none antialiased">
      {/* Minimal Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <span className="text-sm sm:text-base font-black tracking-tight text-slate-900">
            Secure<span className="text-brand-600">Vote</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>OFFLINE MODE</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg text-center space-y-6 animate-fadeIn">
          {/* Custom Offline / Disconnected Vector Illustration */}
          <div className="w-64 h-48 sm:w-80 sm:h-56 mx-auto relative flex items-center justify-center">
            <svg
              viewBox="0 0 320 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-sm"
            >
              {/* Soft ground shadow */}
              <ellipse cx="160" cy="180" rx="120" ry="24" fill="#FEF3C7" opacity="0.6" />

              {/* Floating Cloud */}
              <g transform="translate(60, 20)">
                <path
                  d="M 60 70 A 30 30 0 0 1 120 70 A 25 25 0 0 1 155 95 A 15 15 0 0 1 150 115 L 45 115 A 25 25 0 0 1 45 65 A 30 30 0 0 1 60 70 Z"
                  fill="#F1F5F9"
                  stroke="#CBD5E1"
                  strokeWidth="2.5"
                />

                {/* Cloud shadow inside */}
                <path
                  d="M 50 115 L 145 115 A 15 15 0 0 0 145 105 L 50 105 Z"
                  fill="#E2E8F0"
                  opacity="0.5"
                />
              </g>

              {/* Glowing Shield in Standby */}
              <g transform="translate(125, 60)">
                <path
                  d="M 35 10 L 65 22 C 65 52 45 78 35 88 C 25 78 5 52 5 22 Z"
                  fill="#F8FAFC"
                  stroke="#94A3B8"
                  strokeWidth="3"
                />
                <path
                  d="M 35 18 L 57 28 C 57 50 42 70 35 78 C 28 70 13 50 13 28 Z"
                  fill="#FEF3C7"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />

                {/* Broken Wifi Symbol in Center of Shield */}
                <path
                  d="M 23 42 A 18 18 0 0 1 47 42"
                  stroke="#D97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 28 50 A 10 10 0 0 1 42 50"
                  stroke="#D97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="35" cy="58" r="3" fill="#B45309" />

                {/* Red Disconnect Slash */}
                <line
                  x1="18"
                  y1="68"
                  x2="52"
                  y2="32"
                  stroke="#EF4444"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>

              {/* Signal Antenna Poles with Disconnected Rays */}
              <g transform="translate(235, 100)">
                <line x1="10" y1="50" x2="10" y2="10" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
                <circle cx="10" cy="8" r="5" fill="#EF4444" />
                {/* Broken radio wave arcs */}
                <path d="M 20 2 A 16 16 0 0 1 20 16" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
                <path d="M 26 -4 A 24 24 0 0 1 26 22" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
              </g>

              {/* Floating exclamation badge */}
              <g transform="translate(70, 110)">
                <circle cx="16" cy="16" r="14" fill="#FEF2F2" stroke="#F87171" strokeWidth="2" />
                <text x="13" y="21" fontFamily="sans-serif" fontSize="15" fontWeight="bold" fill="#DC2626">!</text>
              </g>
            </svg>
          </div>

          {/* Heading and Explanatory Text */}
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
              Network Disconnected
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              You Are Currently Offline
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              SecureVote requires an active institutional connection to verify student identities,
              query active ballots, and cryptographically seal votes into the campus ledger.
            </p>
          </div>

          {/* Live Connectivity Feedback */}
          {isOnline ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2 max-w-sm mx-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Internet connection restored! Click below to resume.</span>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-600 font-medium flex items-center justify-center gap-2 max-w-sm mx-auto">
              <WifiOff className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Waiting for local Wi-Fi or mobile data signal...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRetry}
              disabled={isChecking}
              className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Testing Connection...' : 'Check Connection'}</span>
            </button>

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Return to App</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-400 border-t border-slate-100">
        SecureVote Campus &bull; Cryptographic Zero-Knowledge Network Protocol
      </footer>
    </div>
  );
}
