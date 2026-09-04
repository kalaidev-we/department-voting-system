import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllowedDomain, validateCollegeEmail } from '../lib/domainValidator';
import { ShieldLogo } from '../components/ShieldLogo';
import { CampusIllustration } from '../components/CampusIllustration';
import { HelpModal } from '../components/HelpModal';
import { UnauthorizedModal } from '../components/UnauthorizedModal';
import {
  Headphones,
  Shield,
  Users,
  Eye,
  BarChart3,
  ArrowRight,
  GraduationCap,
  Lock,
  Building2,
  AlertCircle,
  Loader2,
  Mail,
  Info,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

export function LoginPage() {
  const {
    signInWithGoogle,
    signInWithGoogleEmail,
    signOut,
    profile,
    isAuthenticated,
    authError,
    clearAuthError,
  } = useAuth();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [rejectedEmail, setRejectedEmail] = useState('');
  const [directEmail, setDirectEmail] = useState('26scl03@kpriet.ac.in');
  const [directEmailError, setDirectEmailError] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const ALLOWED_DOMAIN = getAllowedDomain();

  // Check if signed in with an unauthorized email
  React.useEffect(() => {
    if (isAuthenticated && profile?.email) {
      const email = profile.email;
      const { isValid } = validateCollegeEmail(email);
      if (!isValid) {
        setRejectedEmail(email);
        setShowUnauthorizedModal(true);
      }
    }
  }, [isAuthenticated, profile]);

  const handleDirectEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDirectEmailError(null);
    clearAuthError();

    if (!directEmail.trim()) {
      setDirectEmailError('Please enter your Google account email.');
      return;
    }

    setIsLoading(true);
    const res = await signInWithGoogleEmail(directEmail.trim());
    setIsLoading(false);

    if (res.error) {
      setDirectEmailError(res.error);
    }
  };

  const handleExternalGoogleOAuth = async () => {
    setIsLoading(true);
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.warn('External Google sign-in attempt notice:', error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnauthorizedSignOut = async () => {
    await signOut();
    setShowUnauthorizedModal(false);
    setRejectedEmail('');
  };

  return (
    <div className="flex-1 flex flex-col justify-between w-full min-h-screen relative z-10 selection:bg-brand-500 selection:text-white">
      {/* Top Website Header */}
      <header className="w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                Secure<span className="text-brand-600">Vote</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-100/70 text-brand-700 text-[10px] font-extrabold uppercase tracking-wider">
                CAMPUS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              KPR Institute of Engineering and Technology
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Domain: <strong>{ALLOWED_DOMAIN}</strong></span>
          </div>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-brand-700 text-xs font-semibold shadow-xs border border-blue-200/80 hover:border-blue-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-brand-600" />
            <span>Need Help?</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-14 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Branding & Value Propositions */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-brand-700 text-xs font-semibold mb-4 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Official Campus Election Portal 2026-27</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 mb-4">
              <div className="shrink-0 transform transition-transform duration-500 hover:scale-105">
                <ShieldLogo className="w-24 h-28 sm:w-28 sm:h-32" />
              </div>
              
              <div className="flex flex-col items-center sm:items-start">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-slate-900">
                  Secure<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600">Vote</span>
                </h1>
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.35em] text-slate-400 mt-1.5">
                  C A M P U S
                </p>
                <p className="text-sm sm:text-base font-semibold text-slate-600 mt-1">
                  Your Voice. A Safer Tomorrow.
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
              Participate in college student governance with end-to-end cryptographic voter verification, guaranteed secret ballots, and live real-time turnout auditability.
            </p>

            {/* 4 Feature Badges */}
            <div className="w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white/80 border border-blue-50/80 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-blue-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center mb-2">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Secure</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Verified Identity</span>
              </div>

              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white/80 border border-blue-50/80 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-purple-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Fair</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">One Person One Vote</span>
              </div>

              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white/80 border border-blue-50/80 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Private</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Your Vote Stays Secret</span>
              </div>

              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white/80 border border-blue-50/80 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-amber-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <BarChart3 className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Transparent</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Trusted Results</span>
              </div>
            </div>
          </div>

          {/* Right Column: Google Institutional Login Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 border border-slate-200/70 backdrop-blur-sm relative">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center mx-auto mb-3 border border-blue-100/80 shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Institutional Login
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Sign in with your official Google account to access voting and elections
                </p>
              </div>

              {/* Direct Google Institutional Login Form */}
              <form onSubmit={handleDirectEmailSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Google Account Email</span>
                    <span className="text-[10px] font-semibold text-brand-600 font-mono">
                      {ALLOWED_DOMAIN}
                    </span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      required
                      placeholder="e.g. 26scl03@kpriet.ac.in or skalaiarasu3@gmail.com"
                      className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                </div>

                {/* Quick 1-Click Profile Switchers */}
                <div className="flex flex-wrap items-center gap-1.5 text-left">
                  <span className="text-[10px] text-slate-400 font-bold">Quick test:</span>
                  <button
                    type="button"
                    onClick={() => setDirectEmail('26scl03@kpriet.ac.in')}
                    className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-700 text-[10px] font-bold border border-blue-200 transition-colors cursor-pointer"
                  >
                    26scl03 (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectEmail('skalaiarasu3@gmail.com')}
                    className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200 transition-colors cursor-pointer"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectEmail('26scl01@kpriet.ac.in')}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    26scl01
                  </button>
                </div>

                {directEmailError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left">
                    {directEmailError}
                  </div>
                )}

                {/* Primary Google Login Button */}
                <button
                  type="submit"
                  disabled={isLoading || !directEmail.trim()}
                  className="w-full h-13 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 hover:from-brand-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-between transition-all duration-200 active:scale-[0.98] group cursor-pointer disabled:opacity-60"
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>

                  <span className="text-center font-bold tracking-wide">
                    {isLoading ? 'Connecting...' : 'Continue with Google Account'}
                  </span>

                  {isLoading ? (
                    <Loader2 className="w-4.5 h-4.5 text-white/90 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4.5 h-4.5 text-white/90 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              {/* Alternative: Browser Redirect OAuth */}
              <div className="pt-3 mt-3 border-t border-slate-100 text-center space-y-2">
                <button
                  type="button"
                  onClick={handleExternalGoogleOAuth}
                  disabled={isLoading}
                  className="text-[11px] text-slate-400 hover:text-brand-600 font-medium transition-colors cursor-pointer"
                >
                  Or redirect to external Google Cloud OAuth &rarr;
                </button>

                {/* Google Cloud Setup Info Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowSetupGuide(!showSetupGuide)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <Info className="w-3 h-3 text-slate-400" />
                    <span>How to enable Google OAuth in Supabase Dashboard</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showSetupGuide ? 'rotate-180' : ''}`} />
                  </button>

                  {showSetupGuide && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-left space-y-1.5 animate-fadeIn">
                      <p className="font-bold text-slate-800">
                        Fixing "Error 401: invalid_client":
                      </p>
                      <ol className="list-decimal pl-4 space-y-1 text-[10px]">
                        <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-brand-600 underline">Google Cloud Console</a> &rarr; <strong>Create Credentials</strong> &rarr; <strong>OAuth Client ID</strong>.</li>
                        <li>Set Application type to <strong>Web application</strong>.</li>
                        <li>Add Authorized redirect URI: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-600 font-mono">https://rewhbcfmcvriulagkqhy.supabase.co/auth/v1/callback</code></li>
                        <li>Copy the Client ID and Secret to your <a href="https://supabase.com/dashboard/project/rewhbcfmcvriulagkqhy/auth/providers" target="_blank" rel="noreferrer" className="text-brand-600 underline">Supabase Dashboard &rarr; Google Provider</a>.</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom security assurance */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center space-x-2 text-slate-400 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>256-bit encrypted authentication handshake</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white/70 backdrop-blur-sm border-t border-slate-200/60 py-4 px-4 sm:px-8 text-center text-xs text-slate-400">
        <p>
          &copy; 2026-2027 KPR Institute of Engineering and Technology. All rights reserved. SecureVote Campus Governance Platform.
        </p>
      </footer>

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <UnauthorizedModal
        isOpen={showUnauthorizedModal}
        userEmail={rejectedEmail}
        onSignOut={handleUnauthorizedSignOut}
      />
    </div>
  );
}
