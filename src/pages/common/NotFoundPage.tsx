import React from 'react';
import { Home, ArrowLeft, Search, HelpCircle, Shield } from 'lucide-react';

interface NotFoundPageProps {
  onBackToHome: () => void;
  onOpenHelp?: () => void;
}

export function NotFoundPage({ onBackToHome, onOpenHelp }: NotFoundPageProps) {
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

        <button
          onClick={onBackToHome}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Return to Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
        </button>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg text-center space-y-6 animate-fadeIn">
          {/* Custom Modern 404 Vector Illustration */}
          <div className="w-64 h-48 sm:w-80 sm:h-56 mx-auto relative flex items-center justify-center">
            <svg
              viewBox="0 0 320 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-sm"
            >
              {/* Soft background glow */}
              <ellipse cx="160" cy="180" rx="120" ry="24" fill="#EEF2FF" />
              
              {/* Floating Geometric Elements */}
              <circle cx="50" cy="60" r="10" fill="#E0E7FF" opacity="0.6" />
              <circle cx="280" cy="80" r="14" fill="#DBEAFE" opacity="0.7" />
              <rect x="250" y="40" width="12" height="12" rx="3" transform="rotate(25 250 40)" fill="#C7D2FE" />
              <rect x="65" y="140" width="10" height="10" rx="2" transform="rotate(-15 65 140)" fill="#BAE6FD" />

              {/* Big 4 - 0 - 4 Typography with Graphic Integration */}
              <text
                x="35"
                y="110"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="76"
                fontWeight="900"
                fill="#E2E8F0"
              >
                4
              </text>
              <text
                x="220"
                y="110"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="76"
                fontWeight="900"
                fill="#E2E8F0"
              >
                4
              </text>

              {/* Center Holographic Ballot Box representing missing page */}
              <g transform="translate(105, 35)">
                {/* Box base shadow */}
                <rect x="10" y="115" width="90" height="10" rx="5" fill="#CBD5E1" opacity="0.4" />

                {/* Main ballot box container */}
                <rect x="15" y="45" width="80" height="70" rx="16" fill="#4F46E5" />
                <rect x="19" y="49" width="72" height="62" rx="12" fill="url(#boxGradient)" />

                {/* Ballot slot at top */}
                <rect x="25" y="38" width="60" height="12" rx="6" fill="#3730A3" />
                <rect x="35" y="42" width="40" height="4" rx="2" fill="#1E1B4B" />

                {/* Glowing question mark holographic floating paper */}
                <g transform="translate(28, 0)">
                  <rect x="0" y="5" width="54" height="40" rx="8" fill="#FFFFFF" stroke="#818CF8" strokeWidth="2" />
                  <line x1="10" y1="16" x2="32" y2="16" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                  <line x1="10" y1="23" x2="25" y2="23" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="42" cy="24" r="7" fill="#EEF2FF" />
                  <text x="39" y="28" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill="#4F46E5">?</text>
                </g>

                {/* Magnifying Glass Searching */}
                <g transform="translate(55, 65)">
                  <circle cx="20" cy="20" r="15" fill="#FFFFFF" fillOpacity="0.85" stroke="#3B82F6" strokeWidth="3.5" />
                  <line x1="31" y1="31" x2="45" y2="45" stroke="#1D4ED8" strokeWidth="4.5" strokeLinecap="round" />
                  {/* Glass Glare */}
                  <path d="M 12 15 Q 16 10 22 11" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
              </g>

              {/* Definitions */}
              <defs>
                <linearGradient id="boxGradient" x1="19" y1="49" x2="91" y2="111" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1" />
                  <stop offset="1" stopColor="#4338CA" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Heading and Explanatory Text */}
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              Error 404 &bull; Missing Route
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Ballot or Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              The election ballot, administrative console, or resource you requested does not exist,
              has expired, or may have been archived by the returning officer.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onBackToHome}
              className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>

            {onOpenHelp && (
              <button
                onClick={onOpenHelp}
                className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Election Helpdesk</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-400 border-t border-slate-100">
        SecureVote Campus &bull; KPR Institute of Engineering and Technology
      </footer>
    </div>
  );
}
