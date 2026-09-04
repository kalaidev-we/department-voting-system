import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllowedDomain, validateCollegeEmail } from '../lib/domainValidator';
import { HelpModal } from '../components/HelpModal';
import { UnauthorizedModal } from '../components/UnauthorizedModal';
import { BallotBoxIllustration } from '../components/auth/BallotBoxIllustration';
import {
  Shield,
  ShieldCheck,
  Users,
  Lock,
  GraduationCap,
  ArrowRight,
  Menu,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  KeyRound,
  Headphones,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export function LoginPage() {
  const {
    signInWithGoogle,
    signInWithGoogleEmail,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    sendMagicLink,
    signOut,
    profile,
    isAuthenticated,
    authError,
    clearAuthError,
  } = useAuth();

  // Dialog & Navigation States
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [rejectedEmail, setRejectedEmail] = useState('');

  // Student direct email fallback
  const [showStudentFallback, setShowStudentFallback] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');

  // Staff Form State
  const [staffAuthMode, setStaffAuthMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Common feedback states
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

  // Direct Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setFormError(null);
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.warn('Google sign-in error:', error?.message);
      setFormError(error?.message || 'Failed to connect to Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Student Direct Email Fallback Verification
  const handleStudentEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    clearAuthError();

    const cleanEmail = studentEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setFormError('Please enter your college email address.');
      return;
    }

    const { isValid } = validateCollegeEmail(cleanEmail);
    if (!isValid) {
      setFormError(`Access restricted: Email must end with ${ALLOWED_DOMAIN}`);
      return;
    }

    setIsLoading(true);
    const res = await signInWithGoogleEmail(cleanEmail);
    setIsLoading(false);

    if (res.error) {
      setFormError(res.error);
    }
  };

  // Staff / Admin Form Submit Handler
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    clearAuthError();

    const cleanEmail = staffEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setFormError('Please enter your institutional email address.');
      return;
    }

    setIsLoading(true);

    if (staffAuthMode === 'signin') {
      if (!staffPassword) {
        setIsLoading(false);
        setFormError('Please enter your password.');
        return;
      }
      const res = await signInWithEmailPassword(cleanEmail, staffPassword);
      setIsLoading(false);
      if (res.error) {
        setFormError(res.error);
      }
    } else if (staffAuthMode === 'signup') {
      if (!staffPassword || staffPassword.length < 6) {
        setIsLoading(false);
        setFormError('Password must be at least 6 characters long.');
        return;
      }
      if (signUpWithEmailPassword) {
        const res = await signUpWithEmailPassword(cleanEmail, staffPassword, fullName.trim());
        setIsLoading(false);
        if (res.error) {
          setFormError(res.error);
        } else {
          setSuccessMessage(res.message || 'Account registered successfully! You can now sign in.');
          setStaffAuthMode('signin');
        }
      }
    } else if (staffAuthMode === 'magic') {
      if (sendMagicLink) {
        const res = await sendMagicLink(cleanEmail);
        setIsLoading(false);
        if (res.error) {
          setFormError(res.error);
        } else {
          setSuccessMessage(res.message || `Magic login link sent to ${cleanEmail}! Check your inbox.`);
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-slate-50/60 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between select-none antialiased relative overflow-x-hidden transition-colors duration-200">
      {/* Decorative ambient lighting elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-indigo-400/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }} />

      {/* 1. Header Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between z-20">
        {/* Left Brand Logo */}
        <div className="flex items-center space-x-3 group cursor-default">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20 transition-transform group-hover:scale-105">
              <Shield className="w-5 h-5 fill-white/20" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center leading-none">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Secure</span>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Vote</span>
            </div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.38em] text-slate-400 dark:text-slate-500 mt-1">
              C A M P U S
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Staff Login Pill Button */}
          <button
            onClick={() => {
              setIsStaffModalOpen(true);
              setFormError(null);
              setSuccessMessage(null);
            }}
            className="group flex items-center space-x-2 px-4 py-2 rounded-full border border-blue-600/30 dark:border-blue-500/40 bg-white/80 dark:bg-slate-900/80 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all shadow-xs hover:shadow-md hover:shadow-blue-500/10 hover:border-blue-600 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Staff Login</span>
          </button>

          {/* Hamburger / Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-full bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer border border-slate-200/50 dark:border-slate-700/60"
            aria-label="Navigation menu"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Slide-down Menu Drawer */}
      {isMenuOpen && (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 z-30 mb-2">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300 animate-fadeIn">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsStaffModalOpen(true);
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">Staff & Returning Officer Console</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">Candidate review, roster uploads, and ballot controls</div>
              </div>
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsHelpOpen(true);
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">Election Support & FAQ</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">Need help voting or verifying your student domain?</div>
              </div>
            </button>
            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-slate-800/60 border border-blue-100/50 dark:border-slate-700/50 text-[11px] text-slate-600 dark:text-slate-400 font-mono flex items-center justify-between">
              <span className="font-sans font-medium">Domain Restriction:</span>
              <span className="font-bold text-blue-700 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">@{ALLOWED_DOMAIN}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-col justify-center">
        {/* Error notification banner if any */}
        {(formError || authError) && (
          <div className="w-full max-w-md mx-auto mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span className="font-medium leading-relaxed">{formError || authError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Copy & Google CTA */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Overline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold tracking-[0.2em] uppercase mb-4 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              OFFICIAL CAMPUS BALLOT PORTAL
            </div>

            {/* Headline with dynamic curved blue underline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-3">
              A Fairer<br />
              Campus<br />
              Starts with<br />
              <span className="relative inline-block text-blue-600 dark:text-blue-400">
                You
                {/* Curved hand-drawn blue underline swoosh */}
                <svg
                  className="absolute -bottom-2 sm:-bottom-3 left-0 w-[115%] h-3 sm:h-4 overflow-visible"
                  viewBox="0 0 100 14"
                  fill="none"
                >
                  <path
                    d="M2 9 C30 2, 70 2, 98 10"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="text-blue-600 dark:text-blue-400"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-normal leading-relaxed mt-3 mb-7 max-w-md">
              Secure, transparent, and cryptographic voting designed for legitimate student representation.
            </p>

            {/* Primary CTA: Continue with Google Button */}
            <div className="w-full max-w-sm">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/40 hover:shadow-2xl hover:border-blue-500/60 dark:hover:border-blue-500/60 flex items-center justify-between transition-all duration-200 active:scale-[0.98] cursor-pointer group disabled:opacity-60"
              >
                {/* Google Multi-Color G Icon */}
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700/60 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
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

                {/* Button Text */}
                <div className="flex flex-col items-start text-left px-2">
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Instant verified student access
                  </span>
                </div>

                {/* Arrow Right */}
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
              </button>

              {/* Sub-label */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mt-3 px-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>College Domain Protected</span>
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold text-[11px]">
                  @{ALLOWED_DOMAIN}
                </span>
              </div>

              {/* Fallback accordion for restrictive WiFi environments */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowStudentFallback(!showStudentFallback)}
                  className="text-[11px] text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Trouble connecting? Verify with college email</span>
                  {showStudentFallback ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showStudentFallback && (
                  <form onSubmit={handleStudentEmailSubmit} className="mt-2.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2.5 animate-fadeIn shadow-lg">
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder={`e.g. 26scl03@${ALLOWED_DOMAIN}`}
                        className="w-full h-9 pl-8 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-blue-500/25"
                    >
                      Verify Eligibility & Enter
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Acrylic Ballot Box & Hand Illustration */}
          <div className="lg:col-span-6 flex items-center justify-center -my-3 sm:my-0 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-3xl filter blur-2xl -z-10" />
            <BallotBoxIllustration className="w-full max-w-[380px] sm:max-w-[440px] drop-shadow-2xl" />
          </div>
        </div>

        {/* 3. Four Value Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12">
          {/* Card 1: Secure Voting */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Secure<br />Voting
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium hidden sm:block">
              Encrypted Ballot
            </span>
          </div>

          {/* Card 2: Transparent Process */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 group">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Transparent<br />Process
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium hidden sm:block">
              Open Audit Trail
            </span>
          </div>

          {/* Card 3: Fair Elections */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 group">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Fair<br />Elections
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium hidden sm:block">
              Anti-Tamper Logic
            </span>
          </div>

          {/* Card 4: Stronger Campus */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/5 group">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2.5 border border-orange-500/20 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Stronger<br />Campus
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium hidden sm:block">
              Democratic Voice
            </span>
          </div>
        </div>

        {/* 4. Stats / Metrics Container */}
        <div className="mt-4 sm:mt-6 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-around text-center shadow-xs">
          {/* 100% */}
          <div className="flex-1 px-2">
            <div className="text-lg sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
              100%
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Secure & Verified</div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

          {/* One Vote */}
          <div className="flex-1 px-2">
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              One Vote
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Per Student</div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

          {/* A Better */}
          <div className="flex-1 px-2">
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              A Better
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Tomorrow</div>
          </div>
        </div>
      </main>

      {/* 5. Footer Trust Badge & Subtle Wave */}
      <footer className="w-full relative z-10 pt-4 pb-4">
        <div className="flex items-center justify-center space-x-3 text-slate-500 dark:text-slate-400 text-xs font-medium px-4">
          <div className="h-px w-10 sm:w-20 bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Built for a Safer, Brighter Campus</span>
          </div>
          <div className="h-px w-10 sm:w-20 bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Soft Fluid SVG Waves at the bottom */}
        <div className="w-full overflow-hidden leading-none mt-2 opacity-50 dark:opacity-20">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-10 sm:h-14 text-blue-100/60 dark:text-blue-950/60 fill-current"
          >
            <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </footer>

      {/* 6. Staff / Admin Login Modal Dialog */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsStaffModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-900/50 shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Faculty & Staff Portal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Authorized election officers & administration</p>
              </div>
            </div>

            {/* Sub-mode Segmented Buttons */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-5 border border-slate-200/70 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setStaffAuthMode('signin');
                  setFormError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  staffAuthMode === 'signin'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setStaffAuthMode('signup');
                  setFormError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  staffAuthMode === 'signup'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => {
                  setStaffAuthMode('magic');
                  setFormError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  staffAuthMode === 'magic'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Magic Link
              </button>
            </div>

            {/* Modal Error/Success Messages */}
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span className="font-medium">{formError}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* Staff Form */}
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              {staffAuthMode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Prof. Jane Doe"
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder={`officer@${ALLOWED_DOMAIN}`}
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {staffAuthMode !== 'magic' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 pl-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : staffAuthMode === 'signin' ? (
                  'Sign In to Staff Console'
                ) : staffAuthMode === 'signup' ? (
                  'Register Staff Account'
                ) : (
                  'Send Magic Access Link'
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold cursor-pointer"
              >
                Return to Student Google Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Help Modal Dialog */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* 8. Unauthorized Domain Modal Dialog */}
      <UnauthorizedModal
        isOpen={showUnauthorizedModal}
        userEmail={rejectedEmail}
        onSignOut={async () => {
          await signOut();
          setShowUnauthorizedModal(false);
          setRejectedEmail('');
        }}
      />
    </div>
  );
}

export default LoginPage;
