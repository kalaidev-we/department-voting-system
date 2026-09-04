import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllowedDomain, validateCollegeEmail } from '../lib/domainValidator';
import { ShieldLogo } from '../components/ShieldLogo';
import { HelpModal } from '../components/HelpModal';
import { UnauthorizedModal } from '../components/UnauthorizedModal';
import {
  Headphones,
  Shield,
  Users,
  Eye,
  EyeOff,
  BarChart3,
  ArrowRight,
  GraduationCap,
  Lock,
  Building2,
  AlertCircle,
  Loader2,
  Mail,
  CheckCircle2,
  User,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export function LoginPage() {
  const {
    signInWithEmailPassword,
    signUpWithEmailPassword,
    sendMagicLink,
    signOut,
    profile,
    isAuthenticated,
    authError,
    clearAuthError,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [rejectedEmail, setRejectedEmail] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const ALLOWED_DOMAIN = getAllowedDomain();

  // Check if signed in with an unauthorized email
  React.useEffect(() => {
    if (isAuthenticated && profile?.email) {
      const userEmail = profile.email;
      const { isValid } = validateCollegeEmail(userEmail);
      if (!isValid) {
        setRejectedEmail(userEmail);
        setShowUnauthorizedModal(true);
      }
    }
  }, [isAuthenticated, profile]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    clearAuthError();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFormError('Please enter your institutional email address.');
      return;
    }

    setIsLoading(true);

    if (authMode === 'signin') {
      if (!password) {
        setIsLoading(false);
        setFormError('Please enter your password.');
        return;
      }
      const res = await signInWithEmailPassword(cleanEmail, password);
      setIsLoading(false);
      if (res.error) {
        setFormError(res.error);
      }
    } else if (authMode === 'signup') {
      if (!password || password.length < 6) {
        setIsLoading(false);
        setFormError('Password must be at least 6 characters long.');
        return;
      }
      if (signUpWithEmailPassword) {
        const res = await signUpWithEmailPassword(cleanEmail, password, fullName.trim());
        setIsLoading(false);
        if (res.error) {
          setFormError(res.error);
        } else {
          setSuccessMessage(res.message || 'Account registered in Supabase! You can now sign in.');
          setAuthMode('signin');
        }
      }
    } else if (authMode === 'magic') {
      if (sendMagicLink) {
        const res = await sendMagicLink(cleanEmail);
        setIsLoading(false);
        if (res.error) {
          setFormError(res.error);
        } else {
          setSuccessMessage(res.message || `Magic login link dispatched to ${cleanEmail}! Check your inbox.`);
        }
      }
    }
  };

  // Quick 1-Click Profile Fillers
  const fillStudent = () => {
    setEmail('26scl03@kpriet.ac.in');
    setPassword('kprietsckalai');
    setFullName('Student Voter (26SCL03)');
    setFormError(null);
    setSuccessMessage(null);
  };

  const fillStaff = () => {
    setEmail('staff.cse@kpriet.ac.in');
    setPassword('kprietsckalai');
    setFullName('Dr. Ramanathan K (Staff Admin)');
    setFormError(null);
    setSuccessMessage(null);
  };

  const fillAdmin = () => {
    setEmail('skalaiarasu3@gmail.com');
    setPassword('kprietsckalai');
    setFullName('Kalai Arasu (Master Admin)');
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleUnauthorizedSignOut = async () => {
    await signOut();
    setShowUnauthorizedModal(false);
    setRejectedEmail('');
  };

  return (
    <div className="flex-1 flex flex-col justify-between w-full min-h-screen relative z-10 selection:bg-brand-500 selection:text-white bg-slate-50">
      {/* Top Website Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
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
              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white border border-blue-50 shadow-xs transition-all hover:shadow-md hover:border-blue-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center mb-2">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Secure</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Verified Identity</span>
              </div>

              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white border border-blue-50 shadow-xs transition-all hover:shadow-md hover:border-purple-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Fair</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">One Person One Vote</span>
              </div>

              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white border border-blue-50 shadow-xs transition-all hover:shadow-md hover:border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Private</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Your Vote Stays Secret</span>
              </div>

              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white border border-blue-50 shadow-xs transition-all hover:shadow-md hover:border-amber-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <BarChart3 className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Transparent</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Trusted Results</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pure Supabase Login Portal Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 border border-slate-200/80 backdrop-blur-sm relative">
              
              {/* Header */}
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand-500/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Campus Voter Portal
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Supabase institutional authentication for Students, Staff, and Administrators
                </p>
              </div>

              {/* Mode Switcher: Sign In vs Sign Up vs Magic Link */}
              <div className="flex rounded-2xl bg-slate-100 p-1 mb-5 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setFormError(null); setSuccessMessage(null); }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setFormError(null); setSuccessMessage(null); }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('magic'); setFormError(null); setSuccessMessage(null); }}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'magic'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Magic Link
                </button>
              </div>

              {/* Quick 1-Click Fast Profile Switchers */}
              <div className="mb-4 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>1-Click Test Access:</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={fillStudent}
                    className="py-1 px-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-700 text-[10px] font-bold border border-blue-200/70 transition-colors cursor-pointer text-center truncate"
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={fillStaff}
                    className="py-1 px-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200/70 transition-colors cursor-pointer text-center truncate"
                  >
                    👨‍🏫 Staff
                  </button>
                  <button
                    type="button"
                    onClick={fillAdmin}
                    className="py-1 px-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold border border-indigo-200/70 transition-colors cursor-pointer text-center truncate"
                  >
                    👑 Super Admin
                  </button>
                </div>
              </div>

              {/* Main Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
                {/* Full Name field (Sign Up mode only) */}
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="e.g. S. Kalai Arasu"
                        className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Institutional Email</label>
                    <span className="text-[10px] font-semibold text-brand-600 font-mono">
                      {ALLOWED_DOMAIN}
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. 26scl03@kpriet.ac.in or skalaiarasu3@gmail.com"
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                </div>

                {/* Password field (Sign In & Sign Up) */}
                {authMode !== 'magic' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={authMode === 'signup' ? 'Create a secure password (min 6 chars)' : 'Enter your password'}
                        className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {(formError || authError) && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{formError || authError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMessage && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-600 hover:from-brand-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Authenticating with Supabase...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 text-white/90" />
                      <span>
                        {authMode === 'signin' && 'Sign In to Campus Portal'}
                        {authMode === 'signup' && 'Register Account in Supabase'}
                        {authMode === 'magic' && 'Send Supabase Magic Link'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white/90 ml-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom security assurance */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center space-x-2 text-slate-400 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Supabase Auth Handshake • Secret Ballot Guarantee</span>
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
