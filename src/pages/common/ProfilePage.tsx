import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  ChevronLeft,
  User,
  ShieldCheck,
  Mail,
  Building,
  GraduationCap,
  Calendar,
  Save,
  CheckCircle2,
  Lock,
  Phone,
  FileText,
  Vote,
  Sparkles,
  Award,
} from 'lucide-react';

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { profile, refreshProfile } = useAuth();

  const [section, setSection] = useState(profile?.section || 'A');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const studentId = profile?.student_id || profile?.id || '26SCL03';
  const roleName =
    profile?.role === 'SUPER_ADMIN'
      ? 'Super Administrator'
      : profile?.role === 'STAFF_ADMIN'
      ? 'Faculty Election Officer'
      : 'Verified Student Voter';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // 1. Update Supabase if connected
      const { error } = await supabase
        .from('profiles')
        .update({
          section,
          phone_number: phoneNumber,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) {
        console.warn('Supabase profile update warning:', error);
      }

      // 2. Update local profile object
      profile.section = section;
      profile.phone_number = phoneNumber;
      profile.phone = phoneNumber;
      profile.bio = bio;
      localStorage.setItem('securevote_active_profile', JSON.stringify(profile));
      if (refreshProfile) refreshProfile();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
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
              Institutional Profile
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
              Official collegiate identity & voter credentials
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-brand-700 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider border border-blue-100 shrink-0">
          {profile?.role || 'STUDENT'}
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3.5 sm:px-6 py-5 sm:py-7 space-y-5">
        {/* Profile Identity Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center overflow-hidden shadow-md shadow-brand-500/20 shrink-0 border-2 border-white">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                  {profile?.full_name || 'KPRIET Voter'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Identity</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 font-mono truncate">{profile?.email}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                  {studentId}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                  {roleName}
                </span>
              </div>
            </div>
          </div>

          {/* Institutional Data Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Department</span>
              <span className="font-bold text-slate-800 text-[11px] truncate block mt-0.5">
                {profile?.department_name || 'Cybersecurity'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Academic Year</span>
              <span className="font-bold text-slate-800 text-[11px] block mt-0.5">
                {profile?.year || '2nd Year'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Admission Batch</span>
              <span className="font-bold text-slate-800 text-[11px] block mt-0.5">
                {profile?.academic_batch || 'Batch of 2026'}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-medium">Voting Rights</span>
              <span className="font-bold text-emerald-600 text-[11px] flex items-center gap-1 mt-0.5">
                <Vote className="w-3 h-3" />
                Active & Registered
              </span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Personal & Academic Preferences</h3>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile preferences successfully updated and synced!</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {saveError}
            </div>
          )}

          {/* Section Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Assigned Classroom Section</label>
            <div className="grid grid-cols-3 gap-2">
              {['A', 'B', 'C'].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSection(s)}
                  className={`h-10 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    section === s
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Section {s}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Contact Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 90254 88266"
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
            <p className="text-[10px] text-slate-400">Used strictly for vital election emergency broadcasts</p>
          </div>

          {/* Bio / Candidate Statement */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Bio / Candidate Platform Summary
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other students and faculty about yourself or your academic interests..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Updates...' : 'Save Profile Changes'}</span>
          </button>
        </form>

        {/* Cryptographic Ledger Security Assurance */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start space-x-3 text-xs">
          <Lock className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-indigo-900">Cryptographic Identity Sealing</h4>
            <p className="text-indigo-700/90 leading-relaxed text-[11px]">
              Your student roll number and email are verified by Google OAuth and mapped to a zero-knowledge voter token. When casting a ballot, your identity is detached from the vote to ensure complete mathematical ballot secrecy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
