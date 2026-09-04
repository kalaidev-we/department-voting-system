import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme, Theme } from '../../context/ThemeContext';
import {
  ChevronLeft,
  Settings,
  Bell,
  Lock,
  Moon,
  Sun,
  Laptop,
  Shield,
  Eye,
  CheckCircle2,
  Save,
  Flame,
  AlertTriangle,
  WifiOff,
  Hourglass,
  HelpCircle,
  Palette,
  Sparkles,
} from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
  onSimulatePage?: (type: '404' | 'offline' | 'error' | 'slow_internet') => void;
}

export function SettingsPage({ onBack, onSimulatePage }: SettingsPageProps) {
  const { profile } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [countdownReminders, setCountdownReminders] = useState(true);
  const [candidateUpdates, setCandidateUpdates] = useState(true);
  const [hideVoterId, setHideVoterId] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = () => {
    localStorage.setItem(
      'securevote_user_settings',
      JSON.stringify({
        emailAlerts,
        countdownReminders,
        candidateUpdates,
        hideVoterId,
      })
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const THEME_OPTIONS: {
    id: Theme;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'light',
      label: 'Light Mode',
      description: 'Clean, crisp surfaces for daytime clarity',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      description: 'Deep charcoal & slate surfaces to ease eye strain',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'System Sync',
      description: 'Automatically follows your operating system theme',
      icon: Laptop,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col select-none antialiased transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs transition-colors duration-200">
        <div className="flex items-center space-x-2 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white leading-none truncate">
              Account & System Settings
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 truncate">
              Appearance, notifications, privacy controls & diagnostics
            </p>
          </div>
        </div>

        {/* Quick status indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
          {resolvedTheme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="capitalize">{theme} Theme</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3.5 sm:px-6 py-5 sm:py-7 space-y-5">
        {/* Success Alert */}
        {isSaved && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-fadeIn shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Settings and preferences successfully saved!</span>
          </div>
        )}

        {/* SECTION 1: APPEARANCE & THEME SELECTOR */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Appearance & Interface Theme
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  Switch between Dark Theme, Light Theme, or Device Synchronization
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800/60">
              Live Preview
            </span>
          </div>

          {/* Theme Option Cards (3-Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {THEME_OPTIONS.map((opt) => {
              const IconComp = opt.icon;
              const isSelected = theme === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <IconComp className="w-4.5 h-4.5" />
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-indigo-950 dark:text-indigo-200'
                            : 'text-slate-900 dark:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  {/* Visual mockup thumbnail preview */}
                  <div
                    className={`mt-3 pt-2 border-t text-[9px] font-mono flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-slate-200/60 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{isSelected ? 'Active Mode' : 'Click to Apply'}</span>
                    {opt.id === 'system' && (
                      <span className="text-[8px] opacity-75">Auto</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>
              Theme setting is saved locally and applies instantly across all election, ballot, and admin views.
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 ml-2 shrink-0">
              {resolvedTheme === 'dark' ? 'Dark Active' : 'Light Active'}
            </span>
          </div>
        </section>

        {/* SECTION 2: NOTIFICATIONS */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors duration-200">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Election Notification Preferences
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400">
                Manage email notifications sent to {profile?.email}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Election Opening Broadcasts
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 block">
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

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Closing Countdown Reminders
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 block">
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

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Candidate Nomination Status
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 block">
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
        </section>

        {/* SECTION 3: CRYPTOGRAPHIC PRIVACY */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors duration-200">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cryptographic Privacy & Anonymity
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400">
                Zero-knowledge voter rights and transparency settings
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Mask Student Roll Number in Public Counters
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 block">
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
        </section>

        {/* SECTION 4: DIAGNOSTICS & SYSTEM PAGE SIMULATORS */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5 transition-colors duration-200">
          <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Network & System Status Pages
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400">
                Test and preview standard system response screens
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            SecureVote includes dedicated illustrated pages for connection issues, system maintenance, and route not found conditions. You can preview them here:
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onSimulatePage && onSimulatePage('404')}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700/60 flex items-center space-x-2.5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 block">
                  Error 404
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  Page Not Found
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSimulatePage && onSimulatePage('offline')}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-700/60 flex items-center space-x-2.5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-300 block">
                  Offline Page
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  No Connection
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSimulatePage && onSimulatePage('error')}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-700/60 flex items-center space-x-2.5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-700 dark:group-hover:text-rose-300 block">
                  Error 500
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  Server Exception
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSimulatePage && onSimulatePage('slow_internet')}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-700/60 flex items-center space-x-2.5 text-left transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Hourglass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-300 block">
                  Slow Network
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                  High Latency
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Save Settings CTA */}
        <button
          onClick={handleSaveSettings}
          className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>

        {/* Institutional System Metadata */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center justify-between font-mono">
            <span>Platform: SecureVote Campus</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">v2.4.0 (Enterprise)</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span>Institutional Node:</span>
            <span>KPRIET Coimbatore Edge</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span>Encrypted Ledger:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">SHA-256 Validated</span>
          </div>
        </div>
      </main>
    </div>
  );
}
