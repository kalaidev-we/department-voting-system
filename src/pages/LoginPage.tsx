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
  Info,
  ChevronDown,
  CheckCircle2,
  User,
  KeyRound,
} from 'lucide-react';

export function LoginPage() {
  const {
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    sendMagicLink,
    signOut,
    profile,
    isAuthenticated,
    authError,
    clearAuthError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  const [staffAuthMode, setStaffAuthMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [rejectedEmail, setRejectedEmail] = useState('');

  // Staff Authentication State
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffFullName, setStaffFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSuccess, setStaffSuccess] = useState<string | null>(null);
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

  // 1. Direct Google OAuth Handler (Students)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    clearAuthError();
    setStaffError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.warn('Google sign-in attempt notice:', error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Manual Staff Login / Supabase Email Authentication
  const handleStaffAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);
    setStaffSuccess(null);
    clearAuthError();

    const cleanEmail = staffEmail.trim();
    if (!cleanEmail) {
      setStaffError('Please enter your official institutional email.');
      return;
    }

    setIsLoading(true);

    if (staffAuthMode === 'signin') {
      if (!staffPassword) {
        setIsLoading(false);
        setStaffError('Please enter your password.');
        return;
      }
      const res = await signInWithEmailPassword(cleanEmail, staffPassword);
      setIsLoading(false);
      if (res.error) {
        setStaffError(res.error);
      }
    } else if (staffAuthMode === 'signup') {
      if (!staffPassword || staffPassword.length < 6) {
        setIsLoading(false);
        setStaffError('Password must be at least 6 characters long.');
        return;
      }
      if (signUpWithEmailPassword) {
        const res = await signUpWithEmailPassword(cleanEmail, staffPassword, staffFullName.trim());
        setIsLoading(false);
        if (res.error) {
          setStaffError(res.error);
        } else {
          setStaffSuccess(res.message || 'Account created successfully! You can now sign in.');
          setStaffAuthMode('signin');
        }
      }
    } else if (staffAuthMode === 'magic') {
      if (sendMagicLink) {
        const res = await sendMagicLink(cleanEmail);
        setIsLoading(false);
        if (res.error) {
          setStaffError(res.error);
        } else {
          setStaffSuccess(res.message || `Magic login link sent to ${cleanEmail}! Check your inbox.`);
        }
      }
    }
  };

  // Quick fill helper for Super Admin
  const handleQuickFillAdmin = () => {
    setStaffEmail('skalaiarasu3@gmail.com');
    setStaffPassword('kprietsckalai');
    setStaffError(null);
    setStaffSuccess(null);
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

          {/* Right Column: Portal Cards with Segmented Switcher */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 border border-slate-200/70 backdrop-blur-sm relative">
              
              {/* Portal Segmented Tabs */}
              <div className="flex rounded-2xl bg-slate-100 p-1.5 mb-6 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('student');
                    clearAuthError();
                    setStaffError(null);
                    setStaffSuccess(null);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'student'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className={`w-4 h-4 ${activeTab === 'student' ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>Student (Google)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('staff');
                    clearAuthError();
                    setStaffError(null);
                    setStaffSuccess(null);
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'staff'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Lock className={`w-4 h-4 ${activeTab === 'staff' ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>Manual Staff Login</span>
                </button>
              </div>

              {/* ================= TAB 1: STUDENT DIRECT GOOGLE OAUTH ================= */}
              {activeTab === 'student' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center mx-auto mb-3 border border-blue-100/80 shadow-xs">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Student Voter Access
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Sign in directly with your official Google account to access voting and elections
                    </p>
                  </div>

                  {/* Domain Badge */}
                  <div className="p-2.5 rounded-2xl bg-blue-50/80 border border-blue-200/70 text-center">
                    <span className="text-[11px] font-semibold text-brand-800">
                      Authorized Campus Domain: <strong className="font-mono font-bold text-brand-900">{ALLOWED_DOMAIN}</strong>
                    </span>
                  </div>

                  {/* Direct Google OAuth Primary Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-14 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border-2 border-slate-200 hover:border-slate-300 shadow-md hover:shadow-lg flex items-center justify-between transition-all duration-200 active:scale-[0.98] group cursor-pointer disabled:opacity-60"
                  >
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0 border border-slate-100">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
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

                    <span className="font-bold text-slate-800 tracking-wide text-sm">
                      {isLoading ? 'Connecting to Google...' : 'Sign in with Google'}
                    </span>

                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>

                  {/* Auth Error Notification */}
                  {authError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 text-left animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div className="flex-1">
                        <p className="font-bold">Authentication Notice</p>
                        <p className="mt-0.5">{authError}</p>
                      </div>
                    </div>
                  )}

                  {/* Google Cloud / Supabase Provider Diagnostic Toggle */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSetupGuide(!showSetupGuide)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      <span>Google OAuth setup instructions</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSetupGuide ? 'rotate-180' : ''}`} />
                    </button>

                    {showSetupGuide && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-left space-y-2 animate-fadeIn">
                        <p className="font-bold text-slate-800">
                          To enable Google Single Sign-On:
                        </p>
                        <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                          <li>Go to Google Cloud Console &rarr; <strong>Credentials</strong> &rarr; <strong>OAuth Client ID</strong>.</li>
                          <li>Add redirect URI: <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-600 font-mono text-[10px]">https://rewhbcfmcvriulagkqhy.supabase.co/auth/v1/callback</code></li>
                          <li>Save the Client ID & Secret in <a href="https://supabase.com/dashboard/project/rewhbcfmcvriulagkqhy/auth/providers" target="_blank" rel="noreferrer" className="text-brand-600 underline font-semibold">Supabase Dashboard &rarr; Google Provider</a>.</li>
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* Student Security Badges */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-[10px] text-slate-500 font-medium">
                    <div className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-slate-50">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>1 Voter = 1 Ballot</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-slate-50">
                      <Lock className="w-3 h-3 text-brand-600" />
                      <span>Encrypted & Secret</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: MANUAL STAFF LOGIN (SUPABASE EMAIL AUTH) ================= */}
              {activeTab === 'staff' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100/80 shadow-xs">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Manual Staff Login
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      Supabase email authentication for faculty, election officers, and administrators
                    </p>
                  </div>

                  {/* Submode Switcher: Sign In vs Register vs Magic Link */}
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => { setStaffAuthMode('signin'); setStaffError(null); setStaffSuccess(null); }}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        staffAuthMode === 'signin' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Password Login
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => { setStaffAuthMode('signup'); setStaffError(null); setStaffSuccess(null); }}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        staffAuthMode === 'signup' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Sign Up
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => { setStaffAuthMode('magic'); setStaffError(null); setStaffSuccess(null); }}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        staffAuthMode === 'magic' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Magic Link
                    </button>
                  </div>

                  {/* Staff Form */}
                  <form onSubmit={handleStaffAuthSubmit} className="space-y-3.5 text-left">
                    {/* Full Name field if Sign Up */}
                    {staffAuthMode === 'signup' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Full Name & Title</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={staffFullName}
                            onChange={(e) => setStaffFullName(e.target.value)}
                            placeholder="e.g. Dr. Ramesh K / Election Officer"
                            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email field */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Staff Email</label>
                        <button
                          type="button"
                          onClick={handleQuickFillAdmin}
                          className="text-[10px] font-bold text-brand-600 hover:text-brand-800 hover:underline cursor-pointer"
                        >
                          Fill Super Admin
                        </button>
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={staffEmail}
                          onChange={(e) => setStaffEmail(e.target.value)}
                          required
                          placeholder="e.g. faculty@kpriet.ac.in or skalaiarasu3@gmail.com"
                          className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-brand-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Password field (Sign in & Sign up) */}
                    {staffAuthMode !== 'magic' && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Password</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={staffPassword}
                            onChange={(e) => setStaffPassword(e.target.value)}
                            required
                            placeholder={staffAuthMode === 'signup' ? 'Create a secure password (min 6 chars)' : 'Enter your password'}
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
                    {staffError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <span>{staffError}</span>
                      </div>
                    )}

                    {/* Success Banner */}
                    {staffSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                        <span>{staffSuccess}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 px-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:via-indigo-900 hover:to-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4 text-indigo-300" />
                          <span>
                            {staffAuthMode === 'signin' && 'Sign In to Staff Console'}
                            {staffAuthMode === 'signup' && 'Create Staff Account'}
                            {staffAuthMode === 'magic' && 'Send Supabase Magic Link'}
                          </span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Super Admin helper badge */}
                  <div className="pt-2 text-center">
                    <p className="text-[10px] text-slate-400">
                      Master Administrator: <strong className="text-slate-600 font-mono">skalaiarasu3@gmail.com</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom security assurance */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center space-x-2 text-slate-400 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Supabase 256-bit encrypted authentication handshake</span>
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
