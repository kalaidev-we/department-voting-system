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
  EyeOff,
  BarChart3,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  Lock,
  Building2,
  Mail,
  KeyRound,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export function LoginPage() {
  const { signInWithGoogle, signInWithEmailPassword, signOut, profile, isAuthenticated } = useAuth();
  const [loginTab, setLoginTab] = useState<'google' | 'password'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [rejectedEmail, setRejectedEmail] = useState('');
  const ALLOWED_DOMAIN = getAllowedDomain();

  // Check if already signed in with an unauthorized email
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!email.trim()) {
      setPasswordError('Please enter your official email address.');
      return;
    }
    if (!password) {
      setPasswordError('Please enter your password.');
      return;
    }

    setIsPasswordLoading(true);
    try {
      const { error } = await signInWithEmailPassword(email.trim(), password);
      if (error) {
        setPasswordError(error);
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleUnauthorizedSignOut = async () => {
    await signOut();
    setShowUnauthorizedModal(false);
    setRejectedEmail('');
  };

  return (
    <div className="flex-1 flex flex-col justify-between w-full min-h-screen relative z-10 selection:bg-brand-500 selection:text-white">
      {/* Top Website Header / Navbar for PC & Mobile */}
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

      {/* Main Content Area: Responsive PC Grid (Hero Left, Sign-in Right) or Mobile Stack */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-14 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Branding, 3D Shield Hero & Value Propositions */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Top Tagline pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-brand-700 text-xs font-semibold mb-4 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Official Campus Election Portal 2026-27</span>
            </div>

            {/* Glowing 3D Shield Graphic & Title */}
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

            {/* 4 Feature Badges in 2x2 Grid or 4 Columns */}
            <div className="w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 1. Secure */}
              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white/80 border border-blue-50/80 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-blue-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center mb-2">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Secure</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Verified Identity</span>
              </div>

              {/* 2. Fair */}
              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white/80 border border-blue-50/80 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-purple-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Fair</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">One Person One Vote</span>
              </div>

              {/* 3. Private */}
              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white/80 border border-blue-50/80 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Private</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Your Vote Stays Secret</span>
              </div>

              {/* 4. Transparent */}
              <div className="flex flex-col items-center lg:items-start p-3 rounded-2xl bg-white/80 border border-blue-50/80 shadow-xs transition-all hover:bg-white hover:shadow-md hover:border-amber-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <BarChart3 className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 leading-tight">Transparent</span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Trusted Results</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sign-in Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 border border-slate-200/70 backdrop-blur-sm relative">
              <div className="text-center mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Sign in to continue
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Access SecureVote Campus election governance portal
                </p>
              </div>

              {/* Login Mode Switcher Tabs */}
              <div className="flex p-1 bg-slate-100/90 rounded-2xl mb-5 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => {
                    setLoginTab('google');
                    setPasswordError(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    loginTab === 'google'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Student / Google SSO
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginTab('password');
                    setPasswordError(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    loginTab === 'password'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Admin &amp; Faculty
                </button>
              </div>

              {loginTab === 'google' ? (
                /* Google SSO Tab */
                <div className="space-y-4">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-13 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-700 hover:to-blue-700 text-white font-semibold text-sm sm:text-base shadow-md shadow-brand-500/25 flex items-center justify-between transition-all duration-200 active:scale-[0.98] group cursor-pointer"
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
                      {isLoading ? 'Connecting Google...' : 'Continue with Google'}
                    </span>

                    <ArrowRight className="w-5 h-5 text-white/90 transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white text-brand-600 flex items-center justify-center shrink-0 shadow-xs border border-blue-100">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-tight">
                        Use your official college email
                      </p>
                      <p className="text-[11px] font-medium text-brand-600 font-mono mt-0.5 truncate">
                        ({ALLOWED_DOMAIN}) <span className="text-slate-500 font-sans text-[11px]">to access the app</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-1.5 text-slate-500 text-xs pt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Only authorized college accounts are allowed</span>
                  </div>
                </div>
              ) : (
                /* Institutional / Master Admin Email & Password Form */
                <form onSubmit={handlePasswordSignIn} className="space-y-3.5 text-left">
                  {passwordError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span className="leading-snug">{passwordError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="skalaiarasu3@gmail.com or staff@kpriet.ac.in"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your institutional password"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
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

                  <button
                    type="submit"
                    disabled={isPasswordLoading}
                    className="w-full h-11 mt-1 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-slate-900/20 flex items-center justify-center space-x-2 transition-all duration-200 active:scale-[0.98] cursor-pointer"
                  >
                    {isPasswordLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>Sign In with Credentials</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-slate-400">
                      Master Administrator (<span className="font-mono text-slate-600">skalaiarasu3@gmail.com</span>) &amp; enrolled staff
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Full-width Campus Architecture Illustration & College Footer */}
      <footer className="w-full mt-auto pt-6 bg-gradient-to-b from-transparent to-blue-50/50 flex flex-col items-center">
        <div className="w-full max-w-5xl px-4 opacity-55">
          <CampusIllustration className="w-full text-blue-300/70 max-h-24 sm:max-h-32" />
        </div>

        <div className="w-full bg-white/90 border-t border-slate-200/80 py-4 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-[0.25em] flex items-center space-x-2">
              <span>STUDENTS</span>
              <span className="text-slate-300">|</span>
              <span>FACULTY</span>
              <span className="text-slate-300">|</span>
              <span>A STRONGER CAMPUS</span>
            </div>

            <p className="text-[11px] text-slate-400 text-center sm:text-right">
              &copy; {new Date().getFullYear()} KPR Institute of Engineering and Technology. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <UnauthorizedModal
        isOpen={showUnauthorizedModal}
        userEmail={rejectedEmail}
        onSignOut={handleUnauthorizedSignOut}
        onRetryWithCorrectEmail={() => {
          handleUnauthorizedSignOut();
          setTimeout(() => {
            signInWithGoogle();
          }, 400);
        }}
      />
    </div>
  );
}
