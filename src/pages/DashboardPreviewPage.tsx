import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, findStudentByEmail, getActiveElections } from '../lib/supabase';
import {
  ShieldCheck,
  Vote,
  Calendar,
  LogOut,
  CheckCircle2,
  ChevronRight,
  User,
  Award,
  Building,
  Sparkles,
  Shield,
  Clock,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function DashboardPreviewPage() {
  const { profile, signOut } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [elections, setElections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const email = profile?.email || 'student@kpriet.ac.in';

  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    async function loadData() {
      setIsLoading(false);
      try {
        const student = await findStudentByEmail(email);
        if (student) {
          setStudentData(student);
        }
        const electionList = await getActiveElections();
        setElections(electionList);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [email]);

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                Secure<span className="text-brand-600">Vote</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-brand-700 text-[10px] font-extrabold uppercase tracking-wider">
                CAMPUS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Student Voting Portal
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => signOut()}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Verified Student Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white overflow-hidden shadow-md shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-xs font-semibold text-emerald-200 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Verified College Voter</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {profile?.full_name || 'KPRIET Student'}
                </h2>

                <p className="text-xs sm:text-sm text-blue-100 font-mono">
                  {email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 w-full sm:w-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15">
                <span className="text-blue-200 text-xs block font-medium">Voter Status</span>
                <span className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Eligible to Vote
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15">
                <span className="text-blue-200 text-xs block font-medium">Campus Node</span>
                <span className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm mt-0.5">
                  <Building className="w-4 h-4 text-blue-200" /> KPRIET Campus
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page-by-Page Progress Banner */}
        <div className="p-4 sm:p-5 bg-blue-50/90 rounded-2xl border border-blue-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Page 1 (Login & Auth) Complete!</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Supabase Authentication + strict @kpriet.ac.in domain verification + database connection active.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white text-brand-700 text-xs font-bold border border-blue-200 shadow-2xs shrink-0">
            <span>Next: Page 2 (Elections Dashboard)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Elections Section Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Active Campus Elections</h3>
              <p className="text-xs text-slate-500">Live elections eligible for your voting district</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Balloting Open
            </span>
          </div>

          {/* Election Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Vote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Student Council General Election 2026</h4>
                    <p className="text-xs text-slate-400 mt-0.5">President, Vice President, General Secretary</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Closes Today at 5:00 PM
                </span>
                <span className="font-semibold text-brand-600 flex items-center gap-0.5">
                  Ballot Page 2 <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Department Representative Election</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Computer Science & Engineering (CSE)</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Closes Tomorrow at 12:00 PM
                </span>
                <span className="font-semibold text-brand-600 flex items-center gap-0.5">
                  Ballot Page 2 <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
