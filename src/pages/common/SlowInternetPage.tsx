import React, { useState } from 'react';
import { Hourglass, RefreshCw, Zap, ArrowLeft, Shield, CheckCircle2, Wifi } from 'lucide-react';

interface SlowInternetPageProps {
  onRetry?: () => void;
  onContinueLowBandwidth?: () => void;
  onBackToHome?: () => void;
}

export function SlowInternetPage({
  onRetry,
  onContinueLowBandwidth,
  onBackToHome,
}: SlowInternetPageProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(1850);

  const handleTestSpeed = async () => {
    setIsRetrying(true);
    const start = Date.now();
    try {
      await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' });
      const duration = Date.now() - start;
      setLatencyMs(duration);
    } catch {
      setLatencyMs(null);
    }
    setIsRetrying(false);
    if (onRetry) onRetry();
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

        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold font-mono">
          <Hourglass className="w-3 h-3 text-amber-600 animate-pulse" />
          <span>SLOW CONNECTION</span>
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg text-center space-y-6 animate-fadeIn">
          {/* Custom Slow Internet / High Latency Vector Illustration */}
          <div className="w-64 h-48 sm:w-80 sm:h-56 mx-auto relative flex items-center justify-center">
            <svg
              viewBox="0 0 320 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-sm"
            >
              {/* Soft ground shadow */}
              <ellipse cx="160" cy="185" rx="120" ry="24" fill="#FEF3C7" opacity="0.6" />

              {/* Central Glowing Digital Hourglass */}
              <g transform="translate(115, 30)">
                {/* Outer frame */}
                <rect x="10" y="5" width="70" height="8" rx="4" fill="#64748B" />
                <rect x="10" y="117" width="70" height="8" rx="4" fill="#64748B" />

                {/* Glass Chamber */}
                <path
                  d="M 16 13 L 74 13 L 53 60 A 8 8 0 0 0 53 70 L 74 117 L 16 117 L 37 70 A 8 8 0 0 0 37 60 Z"
                  fill="#F8FAFC"
                  stroke="#94A3B8"
                  strokeWidth="2.5"
                />

                {/* Top Amber Liquid / Sand */}
                <path
                  d="M 22 25 L 68 25 L 49 58 L 41 58 Z"
                  fill="url(#sandGradient)"
                />

                {/* Falling stream */}
                <line x1="45" y1="60" x2="45" y2="90" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3 3" />

                {/* Bottom Sand Accumulation */}
                <path
                  d="M 24 110 L 66 110 L 55 92 L 35 92 Z"
                  fill="url(#sandGradient)"
                />
              </g>

              {/* Antenna with Low Signal Bars */}
              <g transform="translate(60, 80)">
                {/* 1 active bar, 3 faint bars */}
                <rect x="0" y="24" width="6" height="12" rx="3" fill="#F59E0B" />
                <rect x="10" y="18" width="6" height="18" rx="3" fill="#E2E8F0" />
                <rect x="20" y="10" width="6" height="26" rx="3" fill="#E2E8F0" />
                <rect x="30" y="0" width="6" height="36" rx="3" fill="#E2E8F0" />
                <text x="5" y="48" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#F59E0B">1 BAR</text>
              </g>

              {/* Latency / Speed Indicator Pill */}
              <g transform="translate(210, 85)">
                <rect x="0" y="0" width="65" height="42" rx="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                <text x="12" y="18" fontFamily="sans-serif" fontSize="10" fontWeight="bold" fill="#64748B">LATENCY</text>
                <text x="12" y="34" fontFamily="monospace" fontSize="13" fontWeight="900" fill="#D97706">&gt; 1.8s</text>
              </g>

              {/* Pulsing Slow Waves */}
              <circle cx="160" cy="95" r="55" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />

              <defs>
                <linearGradient id="sandGradient" x1="45" y1="25" x2="45" y2="110" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FBBF24" />
                  <stop offset="1" stopColor="#D97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
              High Latency Detected
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Slow Internet Connection
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              We detected severe network latency. While SecureVote is loading, cryptographic ballot
              verification and receipt generation may take several moments to conclude.
            </p>
          </div>

          {/* Latency Metric Card */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-center justify-between max-w-sm mx-auto">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-amber-600" />
              <span className="font-semibold">Current Network Delay:</span>
            </div>
            <span className="font-mono font-bold text-amber-700">
              {latencyMs ? `~${latencyMs} ms` : 'High Delay'}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleTestSpeed}
              disabled={isRetrying}
              className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Testing Network...' : 'Retry Connection'}</span>
            </button>

            {onContinueLowBandwidth && (
              <button
                onClick={onContinueLowBandwidth}
                className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Lightweight Mode</span>
              </button>
            )}

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto h-11 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
              >
                <span>Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-400 border-t border-slate-100">
        SecureVote Campus &bull; Automated Adaptive Bandwidth Optimization
      </footer>
    </div>
  );
}
