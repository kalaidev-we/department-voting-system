import React, { useState } from 'react';
import { addStaffCandidate } from '../../services/votingService';
import {
  ChevronLeft,
  UserPlus,
  Award,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
  Image,
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
  const [electionId, setElectionId] = useState('el-001');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Cybersecurity Department');
  const [slogan, setSlogan] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [symbol, setSymbol] = useState(SYMBOL_OPTIONS[0]);
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTOS[0].url);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !slogan.trim() || !manifesto.trim()) {
      setError('Please fill in candidate name, slogan, and manifesto.');
      return;
    }

    setIsSubmitting(true);

    const res = await addStaffCandidate({
      election_id: electionId,
      name: name.trim(),
      student_id: studentId.trim().toUpperCase() || '25SC050',
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
      setError(res.error || 'Failed to register candidate.');
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
              Staff candidate nomination & ballot placement
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target Election */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Election Contest
            </label>
            <select
              value={electionId}
              onChange={(e) => setElectionId(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-brand-500"
            >
              <option value="el-001">Cybersecurity Association President (Active)</option>
              <option value="el-002">Student Council General Secretary (Scheduled)</option>
            </select>
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
                placeholder="e.g. Vignesh R"
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Student ID / Roll No.
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 25SC050"
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
              <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
              <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
            </select>
          </div>

          {/* Slogan */}
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

          {/* Manifesto */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Candidate Manifesto Summary
            </label>
            <textarea
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
              required
              rows={3}
              placeholder="Summary of proposed initiatives, lab access policies, student representation goals..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Ballot Symbol Selection */}
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
                      ? 'border-brand-600 bg-brand-50/40 text-brand-700 ring-1 ring-brand-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Avatar Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Candidate Photo Portrait
            </label>
            <div className="flex items-center space-x-3">
              {SAMPLE_PHOTOS.map((photo, i) => (
                <div
                  key={i}
                  onClick={() => setPhotoUrl(photo.url)}
                  className={`relative rounded-full cursor-pointer transition-all ${
                    photoUrl === photo.url
                      ? 'ring-3 ring-brand-600 ring-offset-2'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.label}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {photoUrl === photo.url && (
                    <div className="absolute inset-0 bg-brand-600/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
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
              <span>Adding Candidate to Ballot...</span>
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
