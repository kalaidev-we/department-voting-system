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
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-blue-50/20 to-slate-50 flex flex-col justify-between select-none antialiased relative overflow-x-hidden">
      {/* 1. Header Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between z-20">
        {/* Left Brand Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center leading-none">
              <span className="text-xl font-black tracking-tight text-slate-900">Secure</span>
              <span className="text-xl font-black tracking-tight text-blue-600">Vote</span>
            </div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-slate-400 mt-0.5">
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
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border-2 border-blue-600 bg-white hover:bg-blue-50 text-blue-600 text-xs font-bold transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Staff Login</span>
          </button>

          {/* Hamburger / Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Navigation menu"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Slide-down Menu Drawer */}
      {isMenuOpen && (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 z-30 mb-2">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/80 space-y-2 text-xs font-semibold text-slate-700 animate-fadeIn">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsStaffModalOpen(true);
              }}
              className="w-full flex items-center space-x-2 p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Staff & Returning Officer Console</span>
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsHelpOpen(true);
              }}
              className="w-full flex items-center space-x-2 p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <Headphones className="w-4 h-4 text-indigo-600" />
              <span>Election Support & FAQ</span>
            </button>
            <div className="p-2.5 rounded-xl bg-blue-50/60 text-[11px] text-slate-500 font-mono flex items-center justify-between">
              <span>Domain Restriction:</span>
              <span className="font-bold text-blue-700">@{ALLOWED_DOMAIN}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-col justify-center">
        {/* Error notification banner if any */}
        {(formError || authError) && (
          <div className="w-full max-w-md mx-auto mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium leading-relaxed">{formError || authError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Hero Copy & Google CTA */}
          <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
            {/* Overline Tag */}
            <span className="text-[11px] font-bold tracking-[0.25em] text-slate-500 uppercase mb-2">
              YOUR VOICE MATTERS
            </span>

            {/* Headline with dynamic curved blue underline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] mb-3">
              A Fairer<br />
              Campus<br />
              Starts with<br />
              <span className="relative inline-block text-blue-600">
                You
                {/* Curved hand-drawn blue underline swoosh */}
                <svg
                  className="absolute -bottom-2 sm:-bottom-3 left-0 w-[110%] h-3 sm:h-4 overflow-visible"
                  viewBox="0 0 100 14"
                  fill="none"
                >
                  <path
                    d="M2 9 C30 2, 70 2, 98 10"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed mt-2 sm:mt-3 mb-6 max-w-sm">
              Secure, transparent and hassle-free elections for a stronger tomorrow.
            </p>

            {/* Primary CTA: Continue with Google Button */}
            <div className="w-full max-w-xs">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-13 sm:h-14 px-4 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 shadow-lg shadow-slate-200/70 hover:shadow-xl hover:border-blue-400 flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer group disabled:opacity-60"
              >
                {/* Google Multi-Color G Icon */}
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-2xs shrink-0">
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
                <span className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                  {isLoading ? 'Connecting...' : 'Continue with Google'}
                </span>

                {/* Arrow Right */}
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                )}
              </button>

              {/* Sub-label */}
              <p className="text-xs text-slate-400 font-medium mt-2.5 text-left">
                Sign in with your college Google account
              </p>

              {/* Fallback accordion for restrictive WiFi environments */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowStudentFallback(!showStudentFallback)}
                  className="text-[11px] text-slate-400 hover:text-blue-600 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Trouble connecting? Verify with college email</span>
                  {showStudentFallback ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showStudentFallback && (
                  <form onSubmit={handleStudentEmailSubmit} className="mt-2 p-3 rounded-2xl bg-white border border-slate-200 text-left space-y-2 animate-fadeIn shadow-xs">
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder={`e.g. 26scl03@${ALLOWED_DOMAIN}`}
                        className="w-full h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Verify Eligibility
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Acrylic Ballot Box & Hand Illustration */}
          <div className="lg:col-span-6 flex items-center justify-center -my-4 sm:my-0">
            <BallotBoxIllustration className="w-full max-w-[360px] sm:max-w-[420px]" />
          </div>
        </div>

        {/* 3. Four Value Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-10">
          {/* Card 1: Secure Voting */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/80 border border-blue-100/60 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
              Secure<br />Voting
            </span>
          </div>

          {/* Card 2: Transparent Process */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100/60 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
              Transparent<br />Process
            </span>
          </div>

          {/* Card 3: Fair Elections */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/80 border border-purple-100/60 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
              Fair<br />Elections
            </span>
          </div>

          {/* Card 4: Stronger Campus */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-50/80 border border-orange-100/60 flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-2 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
              Stronger<br />Campus
            </span>
          </div>
        </div>

        {/* 4. Stats / Metrics Container */}
        <div className="mt-4 sm:mt-6 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-100/70 border border-slate-200/60 flex items-center justify-around text-center">
          {/* 100% */}
          <div className="flex-1 px-2">
            <div className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">100%</div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Secure & Verified</div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-300/80" />

          {/* One Vote */}
          <div className="flex-1 px-2">
            <div className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">One Vote</div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Per Student</div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-300/80" />

          {/* A Better */}
          <div className="flex-1 px-2">
            <div className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">A Better</div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Tomorrow</div>
          </div>
        </div>
      </main>

      {/* 5. Footer Trust Badge & Subtle Wave */}
      <footer className="w-full relative z-10 pt-4 pb-4">
        <div className="flex items-center justify-center space-x-3 text-slate-500 text-xs font-medium px-4">
          <div className="h-px w-10 sm:w-20 bg-slate-200" />
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Built for a Safer, Brighter Campus</span>
          </div>
          <div className="h-px w-10 sm:w-20 bg-slate-200" />
        </div>

        {/* Soft Fluid SVG Waves at the bottom */}
        <div className="w-full overflow-hidden leading-none mt-2">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="w-full h-10 sm:h-14 text-blue-50/50 fill-current"
          >
            <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </footer>

      {/* 6. Staff / Admin Login Modal Dialog */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsStaffModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Faculty & Staff Portal</h3>
                <p className="text-xs text-slate-500">Authorized election officers & administration</p>
              </div>
            </div>

            {/* Sub-mode Segmented Buttons */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setStaffAuthMode('signin');
                  setFormError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  staffAuthMode === 'signin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
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
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
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
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Magic Link
              </button>
            </div>

            {/* Modal Error/Success Messages */}
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium">{formError}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* Staff Form */}
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              {staffAuthMode === 'signup' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Prof. Jane Doe"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder={`officer@${ALLOWED_DOMAIN}`}
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {staffAuthMode !== 'magic' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 pl-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-600"
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

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
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
