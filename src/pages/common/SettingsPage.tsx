import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ChevronLeft,
  Settings,
  Bell,
  Lock,
  Moon,
  Shield,
  Eye,
  CheckCircle2,
  Save,
  Laptop,
  Flame,
  AlertTriangle,
  WifiOff,
  Hourglass,
  HelpCircle,
} from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
  onSimulatePage?: (type: '404' | 'offline' | 'error' | 'slow_internet') => void;
}

export function SettingsPage({ onBack, onSimulatePage }: SettingsPageProps) {
  const { profile } = useAuth();

  // Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [countdownReminders, setCountdownReminders] = useState(true);
  const [candidateUpdates, setCandidateUpdates] = useState(true);
  const [hideVoterId, setHideVoterId] = useState(true);
  const [compactLayout, setCompactLayout] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = () => {
    localStorage.setItem(
      'securevote_user_settings',
      JSON.stringify({
        emailAlerts,
        countdownReminders,
        candidateUpdates,
        hideVoterId,
        compactLayout,
      })
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-bold text-slate-900 leading-none truncate">
              Account & System Settings
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
              Notification controls, cryptographic privacy & diagnostics
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3.5 sm:px-6 py-5 sm:py-7 space-y-5">
        {isSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Settings and preferences successfully saved!</span>
          </div>
        )}

        {/* Section 1: Notifications */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Election Notification Preferences</h3>
              <p className="text-[11px] text-slate-400">Manage email notifications sent to {profile?.email}</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 block">Election Opening Broadcasts</span>
                <span className="text-[11px] text-slate-400 block">
                  Receive email alerts when polls open for your department
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 block">Closing Countdown Reminders</span>
                <span className="text-[11px] text-slate-400 block">
                  Alert 2 hours before election voting window closes
                </span>
              </div>
              <input
                type="checkbox"
                checked={countdownReminders}
                onChange={(e) => setCountdownReminders(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 block">Candidate Nomination Status</span>
                <span className="text-[11px] text-slate-400 block">
                  Updates on application approvals, manifesto verification, and campaign notices
                </span>
              </div>
              <input
                type="checkbox"
                checked={candidateUpdates}
                onChange={(e) => setCandidateUpdates(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
              />
            </label>
          </div>
        </div>

        {/* Section 2: Cryptographic Privacy */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cryptographic Privacy & Anonymity</h3>
              <p className="text-[11px] text-slate-400">Zero-knowledge voter rights and transparency settings</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 block">Mask Student Roll Number in Public Counters</span>
                <span className="text-[11px] text-slate-400 block">
                  Live voter turnout dashboards only display total counts without identifying roll sequences
                </span>
              </div>
              <input
                type="checkbox"
                checked={hideVoterId}
                onChange={(e) => setHideVoterId(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
              />
            </label>
          </div>
        </div>

        {/* Section 3: Diagnostics & Page Simulator */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Network & System Status Pages</h3>
              <p className="text-[11px] text-slate-400">Test and preview standard system response screens</p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            SecureVote includes dedicated illustrated pages for connection issues, system maintenance, and route not found conditions. You can preview them here:
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onSimulatePage && onSimulatePage('404')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 flex items-center space-x-2.5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 block">Error 404</span>
                <span className="text-[10px] text-slate-400 block">Page Not Found</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSimulatePage && onSimulatePage('offline')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 flex items-center space-x-2.5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 block">Offline Page</span>
                <span className="text-[10px] text-slate-400 block">No Connection</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSimulatePage && onSimulatePage('error')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center space-x-2.5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-rose-700 block">Error 500</span>
                <span className="text-[10px] text-slate-400 block">Server Exception</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSimulatePage && onSimulatePage('slow_internet')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 flex items-center space-x-2.5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Hourglass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 block">Slow Network</span>
                <span className="text-[10px] text-slate-400 block">High Latency</span>
              </div>
            </button>
          </div>
        </div>

        {/* Save Settings CTA */}
        <button
          onClick={handleSaveSettings}
          className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>

        {/* Institutional System Metadata */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between font-mono">
            <span>Platform: SecureVote Campus</span>
            <span className="font-bold text-slate-700">v2.4.0 (Enterprise)</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span>Institutional Node:</span>
            <span>KPRIET Coimbatore Edge</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span>Encrypted Ledger:</span>
            <span className="text-emerald-600 font-bold">SHA-256 Validated</span>
          </div>
        </div>
      </main>
    </div>
  );
}
