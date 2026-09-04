import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { parseStudentId, COURSE_MAPPINGS } from '../lib/studentParser';
import { completeStudentProfile } from '../services/profileService';
import {
  User,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface ProfileCompletionPageProps {
  onCompleted: () => void;
}

export function ProfileCompletionPage({ onCompleted }: ProfileCompletionPageProps) {
  const { profile, refreshProfile } = useAuth();

  const [studentId, setStudentId] = useState(profile?.student_id || '');
  const [department, setDepartment] = useState(profile?.department_name || 'Cybersecurity');
  const [academicBatch, setAcademicBatch] = useState(profile?.academic_batch || 'Batch of 2025');
  const [year, setYear] = useState(profile?.year || '2nd Year');
  const [section, setSection] = useState(profile?.section || 'A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoParsedNote, setAutoParsedNote] = useState<string | null>(null);

  // Auto-parse student ID on input
  useEffect(() => {
    if (studentId.trim().length >= 5) {
      const parsed = parseStudentId(studentId);
      if (parsed.isValid) {
        setDepartment(parsed.departmentName);
        setAcademicBatch(parsed.admissionBatch);
        setYear(parsed.suggestedYear);
        setAutoParsedNote(
          `Detected: ${parsed.departmentName} &bull; ${parsed.admissionBatch}`
        );
      } else {
        setAutoParsedNote(null);
      }
    } else {
      setAutoParsedNote(null);
    }
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSubmitting(true);
    await completeStudentProfile(profile.id, {
      studentId,
      department,
      academicBatch,
      year,
      section,
    });

    // Update local profile state
    profile.student_id = studentId;
    profile.department_name = department;
    profile.academic_batch = academicBatch;
    profile.year = year;
    profile.section = section;
    profile.is_profile_complete = true;
    localStorage.setItem('securevote_active_profile', JSON.stringify(profile));

    setIsSubmitting(false);
    onCompleted();
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/70 border border-slate-200/80 animate-fadeIn">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-2xs">
            <GraduationCap className="w-6 h-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Complete your profile
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            We need a few details to determine which elections you can participate in.
          </p>
        </div>

        {/* Read-only Google Verified Info Box */}
        <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center space-x-3">
          <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-2xs">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-brand-600" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-bold text-slate-900 truncate">
                {profile?.full_name || 'Student'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">
              {profile?.email}
            </p>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700">
            Verified
          </span>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Student ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student ID / Roll No.
            </label>
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.toUpperCase())}
              placeholder="e.g. 25SC003"
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
            {autoParsedNote ? (
              <p
                className="text-[10px] text-brand-600 font-medium mt-1 flex items-center gap-1"
                dangerouslySetInnerHTML={{ __html: autoParsedNote }}
              />
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">
                Format: Year (25) + Dept (SC) + Number (003)
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            >
              {Object.values(COURSE_MAPPINGS).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Batch & Year Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Batch
              </label>
              <select
                value={academicBatch}
                onChange={(e) => setAcademicBatch(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
              >
                <option value="Batch of 2026">Batch of 2026</option>
                <option value="Batch of 2025">Batch of 2025</option>
                <option value="Batch of 2024">Batch of 2024</option>
                <option value="Batch of 2023">Batch of 2023</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Year of Study
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          {/* Section Selection (Segmented Control) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Section
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['A', 'B', 'C'].map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setSection(sec)}
                  className={`h-10 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    section === sec
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Section {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !studentId.trim()}
              className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>{isSubmitting ? 'Saving Profile...' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
