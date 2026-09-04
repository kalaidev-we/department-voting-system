import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitCandidateApplication } from '../../services/candidateService';
import {
  ChevronLeft,
  ShieldCheck,
  Award,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';

interface CandidateApplyPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CandidateApplyPage({ onBack, onSuccess }: CandidateApplyPageProps) {
  const { profile } = useAuth();

  const [electionId, setElectionId] = useState('el-001');
  const [cgpa, setCgpa] = useState('8.65');
  const [slogan, setSlogan] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [promise1, setPromise1] = useState('');
  const [promise2, setPromise2] = useState('');
  const [promise3, setPromise3] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numCgpa = parseFloat(cgpa);
    if (isNaN(numCgpa) || numCgpa < 7.5) {
      setError('College election regulations require a minimum CGPA of 7.50 to contest.');
      return;
    }

    if (!slogan.trim() || !manifesto.trim()) {
      setError('Please provide your campaign slogan and manifesto vision.');
      return;
    }

    if (!acceptedTerms) {
      setError('You must confirm the code of conduct declaration.');
      return;
    }

    setIsSubmitting(true);

    const result = await submitCandidateApplication({
      election_id: electionId,
      election_title: 'Cybersecurity Association President',
      student_id: profile?.student_id || '26SCL03',
      full_name: profile?.full_name || 'KPRIET Student',
      email: profile?.email || '26scl03@kpriet.ac.in',
      department: profile?.department_name || 'Cybersecurity Department',
      year: profile?.year || '2nd Year',
      cgpa: numCgpa,
      slogan: slogan.trim(),
      manifesto: manifesto.trim(),
      key_promises: [promise1, promise2, promise3].filter((p) => p.trim().length > 0),
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || 'Failed to submit candidate nomination.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 select-none">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Nomination Submitted!
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed">
            Your candidate application for <span className="font-semibold text-slate-800">Cybersecurity Association President</span> has been forwarded to the Staff Election Officers for credential and conduct verification.
          </p>

          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-left text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-blue-900">
              <span>Application Status</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-200 text-blue-800 text-[10px] uppercase">
                Under Review
              </span>
            </div>
            <p className="text-blue-700/80 text-[11px]">
              You will receive an automated alert once faculty verification is complete.
            </p>
          </div>

          <button
            onClick={onSuccess}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="w-9 h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
              Candidate Nomination
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Submit your platform for student leadership
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Verified Student Credentials Banner */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {profile?.full_name || 'KPRIET Student'}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {profile?.student_id || '26SCL03'} &bull; {profile?.department_name || 'Cybersecurity'} &bull; {profile?.email}
              </p>
            </div>
          </div>

          {/* Target Election */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Contesting Election
            </label>
            <select
              value={electionId}
              onChange={(e) => setElectionId(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="el-001">Cybersecurity Association President (Active)</option>
              <option value="el-002">Student Council General Secretary (Scheduled)</option>
            </select>
          </div>

          {/* Academic Eligibility (CGPA) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Cumulative GPA (CGPA)</span>
              <span className="text-[10px] text-slate-400 font-normal">Min 7.50 required</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              required
              className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              placeholder="e.g. 8.65"
            />
          </div>

          {/* Campaign Slogan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Campaign Tagline / Slogan
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              required
              maxLength={100}
              className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              placeholder='e.g. "A Safer, Smarter, Stronger Cyber Community"'
            />
          </div>

          {/* Full Manifesto */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Full Campaign Manifesto
            </label>
            <textarea
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
              required
              rows={4}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              placeholder="Describe your vision, proposed workshops, peer support networks, and commitment to the student body..."
            />
          </div>

          {/* Key Promises */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Three Key Campaign Priorities
            </label>
            <input
              type="text"
              value={promise1}
              onChange={(e) => setPromise1(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              placeholder="Priority 1: e.g. 24/7 Red Teaming Lab Access"
            />
            <input
              type="text"
              value={promise2}
              onChange={(e) => setPromise2(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              placeholder="Priority 2: e.g. Monthly Bug-Bounty Bootcamps"
            />
            <input
              type="text"
              value={promise3}
              onChange={(e) => setPromise3(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              placeholder="Priority 3: e.g. Department-Sponsored Security+ Certifications"
            />
          </div>

          {/* Code of Conduct Checkbox */}
          <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs space-y-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 leading-snug">
                I formally confirm that I hold no disciplinary backlogs, have adhered to KPRIET student conduct rules, and agree that all campaign materials will respect college dignity.
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/25 flex items-center justify-center space-x-2 text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Application...</span>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Submit Candidate Nomination</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
