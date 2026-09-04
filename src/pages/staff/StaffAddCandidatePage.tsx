import React, { useState, useEffect } from 'react';
import { addStaffCandidate } from '../../services/votingService';
import { fetchStaffElections } from '../../services/electionService';
import { fetchStudentRoster } from '../../services/adminService';
import { supabase } from '../../lib/supabase';
import { Election, StudentRosterItem } from '../../lib/types';
import { parseStudentId } from '../../lib/studentParser';
import {
  ChevronLeft,
  Award,
  CheckCircle2,
  AlertCircle,
  Shield,
  Search,
  UserCheck,
  Mail,
  GraduationCap,
  Sparkles,
  Link2,
  Image,
  RefreshCw,
} from 'lucide-react';

interface StaffAddCandidatePageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const SYMBOL_OPTIONS = [
  '🛡️ Shield of Trust',
  '⚡ Spark of Innovation',
  '💡 Beacon of Light',
  '🚀 Horizon Rocket',
  '🌟 Student Star',
  '🎯 Target Focus',
  '🌱 Growth & Unity',
  '🔥 Torch of Leadership',
];

const SAMPLE_PHOTOS = [
  { label: 'Avatar 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80' },
  { label: 'Avatar 2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80' },
  { label: 'Avatar 3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { label: 'Avatar 4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
];

export function StaffAddCandidatePage({ onBack, onSuccess }: StaffAddCandidatePageProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [electionId, setElectionId] = useState('');
  const [registeredStudents, setRegisteredStudents] = useState<StudentRosterItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Candidate Details
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Cybersecurity Department');
  const [slogan, setSlogan] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [symbol, setSymbol] = useState(SYMBOL_OPTIONS[0]);
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTOS[0].url);

  // Google profile state
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState<string | null>(null);
  const [isRegisteredUser, setIsRegisteredUser] = useState<boolean>(false);
  const [isSearchingProfile, setIsSearchingProfile] = useState<boolean>(false);
  const [lookupMessage, setLookupMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load elections and enrolled student roster on mount
  useEffect(() => {
    async function initData() {
      const [elList, roster] = await Promise.all([
        fetchStaffElections(),
        fetchStudentRoster(),
      ]);
      setElections(elList);
      if (elList.length > 0) {
        setElectionId(elList[0].id);
      }
      setRegisteredStudents(roster);
    }
    initData();
  }, []);

  // Handle selecting an already registered student from dropdown
  const handleSelectRegisteredUser = (studentIdVal: string) => {
    setSelectedStudentId(studentIdVal);
    if (!studentIdVal) {
      setIsRegisteredUser(false);
      setGoogleAvatarUrl(null);
      setLookupMessage(null);
      return;
    }

    const student = registeredStudents.find((s) => s.student_id === studentIdVal || s.id === studentIdVal);
    if (student) {
      setEmail(student.email);
      setName(student.full_name);
      setStudentId(student.student_id);
      setDepartment(student.department || 'Cybersecurity Department');
      setIsRegisteredUser(true);

      // Check if this student has a Google avatar in profiles
      if (student.avatar_url) {
        setGoogleAvatarUrl(student.avatar_url);
        setPhotoUrl(student.avatar_url);
        setLookupMessage({
          type: 'success',
          text: `Linked to enrolled student ${student.full_name}. Google/Gmail avatar applied.`,
        });
      } else {
        // Query profiles table for Google avatar
        checkGoogleProfileByEmail(student.email, student.full_name);
      }
    }
  };

  // Look up profile by email directly in Supabase profiles
  const checkGoogleProfileByEmail = async (queryEmail: string, knownName?: string) => {
    const cleanEmail = queryEmail.trim().toLowerCase();
    if (!cleanEmail) return;

    setIsSearchingProfile(true);
    setLookupMessage(null);

    try {
      // 1. Query Supabase profiles table
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (prof) {
        setIsRegisteredUser(true);
        if (!name || name === studentId) setName(prof.full_name);
        if (prof.student_id && !studentId) setStudentId(prof.student_id);

        if (prof.avatar_url) {
          setGoogleAvatarUrl(prof.avatar_url);
          setPhotoUrl(prof.avatar_url);
          setLookupMessage({
            type: 'success',
            text: `Google account found! Profile picture from Gmail applied for ${prof.full_name}.`,
          });
        } else {
          setLookupMessage({
            type: 'info',
            text: `Registered user profile located for ${prof.full_name}.`,
          });
        }
        setIsSearchingProfile(false);
        return;
      }

      // 2. Query students table
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (student) {
        setIsRegisteredUser(true);
        if (!name) setName(student.full_name);
        if (!studentId) setStudentId(student.student_id);
        if (student.department_name) setDepartment(student.department_name);
        setLookupMessage({
          type: 'info',
          text: `Enrolled student record found in database (${student.student_id}).`,
        });
        setIsSearchingProfile(false);
        return;
      }

      // 3. Fallback: Parse from college email if valid
      if (cleanEmail.endsWith('@kpriet.ac.in')) {
        const parsed = parseStudentId(cleanEmail.split('@')[0]);
        if (parsed.isValid) {
          if (!studentId) setStudentId(parsed.studentId);
          if (parsed.departmentName) setDepartment(parsed.departmentName);
          setLookupMessage({
            type: 'info',
            text: `Valid college domain format (@kpriet.ac.in). Auto-detected roll number ${parsed.studentId}.`,
          });
        }
      } else {
        setLookupMessage({
          type: 'info',
          text: 'Email entered. Fill in the remaining candidate details.',
        });
      }
    } catch (e) {
      console.warn('Profile search exception:', e);
    } finally {
      setIsSearchingProfile(false);
    }
  };

  const handleEmailBlur = () => {
    if (email.trim()) {
      checkGoogleProfileByEmail(email.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slogan.trim() || !manifesto.trim()) {
      setError('Please fill in candidate name, campaign slogan, and manifesto.');
      return;
    }

    setIsSubmitting(true);

    const res = await addStaffCandidate({
      election_id: electionId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      student_id: studentId.trim().toUpperCase() || '26SCL01',
      department,
      slogan: slogan.trim(),
      manifesto: manifesto.trim(),
      symbol,
      photo_url: photoUrl,
    });

    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Failed to register candidate on official ballot.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
              Add Election Candidate
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Select registered user or lookup Google profile by email
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          
          {/* Target Election */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Election Contest
            </label>
            {elections.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                No elections found in database. Create an election first before adding candidates.
              </div>
            ) : (
              <select
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
              >
                {elections.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quick Select: Already Registered Students */}
          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Select from Already Registered Students</span>
              </label>
              <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                {registeredStudents.length} Students in Roster
              </span>
            </div>

            <select
              value={selectedStudentId}
              onChange={(e) => handleSelectRegisteredUser(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-indigo-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose an enrolled student (or enter email below) --</option>
              {registeredStudents.map((s) => (
                <option key={s.student_id || s.id} value={s.student_id}>
                  {s.full_name} ({s.student_id}) &bull; {s.department} &bull; {s.email}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-indigo-700/80">
              Selecting a registered student automatically fills their details and applies their Google/Gmail profile photo.
            </p>
          </div>

          {/* Or: Add Candidate by Email Address */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-600" />
                <span>Candidate Email Address (Gmail / College Account)</span>
              </label>
              {isSearchingProfile && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin text-brand-600" />
                  Searching database...
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="e.g. 26scl01@kpriet.ac.in or student@gmail.com"
                className="flex-1 h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500 font-mono"
              />
              <button
                type="button"
                onClick={() => checkGoogleProfileByEmail(email)}
                disabled={!email.trim() || isSearchingProfile}
                className="h-11 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Lookup</span>
              </button>
            </div>

            {/* Profile Lookup Feedback */}
            {lookupMessage && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center space-x-2 ${
                  lookupMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium">{lookupMessage.text}</span>
              </div>
            )}
          </div>

          {/* Candidate Name & Roll ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Candidate Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Aravind Swaminathan"
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Student ID / Roll Number
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 26SCL01"
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Academic Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-brand-500"
            >
              <option value="Cybersecurity Department">Cybersecurity Department</option>
              <option value="Computer Science and Engineering">Computer Science and Engineering</option>
              <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
              <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          {/* Photo Portrait & Google Avatar Integration */}
          <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-brand-600" />
                <span>Candidate Ballot Portrait</span>
              </label>
              {googleAvatarUrl && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Using Gmail Profile Photo
                </span>
              )}
            </div>

            {/* Current Active Photo Preview */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={photoUrl}
                  alt="Candidate preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500 shadow-sm"
                  onError={(e) => {
                    // Fallback to sample photo if image link is invalid
                    (e.target as HTMLImageElement).src = SAMPLE_PHOTOS[0].url;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  ✓
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {name || 'Candidate Preview'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {department}
                </p>
                <p className="text-[10px] text-brand-600 font-mono mt-0.5">
                  {email || 'No email attached'}
                </p>
              </div>
            </div>

            {/* Google / Gmail Avatar shortcut button if available */}
            {googleAvatarUrl && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoUrl(googleAvatarUrl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    photoUrl === googleAvatarUrl
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Use Gmail Profile Picture</span>
                </button>
              </div>
            )}

            {/* Alternative preset avatars */}
            <div className="pt-2 border-t border-slate-200">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                Or select from standard portrait presets:
              </label>
              <div className="flex items-center space-x-3">
                {SAMPLE_PHOTOS.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => setPhotoUrl(photo.url)}
                    className={`relative rounded-xl cursor-pointer transition-all ${
                      photoUrl === photo.url
                        ? 'ring-2 ring-brand-600 ring-offset-2 scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-11 h-11 rounded-xl object-cover"
                    />
                    {photoUrl === photo.url && (
                      <div className="absolute inset-0 bg-brand-600/20 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Slogan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Campaign Slogan / Tagline
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              required
              placeholder='e.g. "Innovate, Protect, Lead."'
              className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Candidate Manifesto Summary */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Candidate Manifesto Summary
            </label>
            <textarea
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
              required
              rows={3}
              placeholder="Summary of proposed initiatives, student representation goals, lab access improvements..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Ballot Symbol */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Ballot Symbol
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SYMBOL_OPTIONS.map((sym) => (
                <button
                  type="button"
                  key={sym}
                  onClick={() => setSymbol(sym)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    symbol === sym
                      ? 'border-brand-600 bg-brand-50/60 text-brand-700 ring-1 ring-brand-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Placing Candidate on Ballot...</span>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Place Candidate on Official Ballot</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
