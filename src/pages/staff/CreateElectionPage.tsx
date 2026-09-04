import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Calendar, Vote } from 'lucide-react';
import { createElection } from '../../services/electionService';
import { ElectionStatus } from '../../lib/types';

interface CreateElectionPageProps {
  onBack: () => void;
  onCreated: () => void;
}

export function CreateElectionPage({ onBack, onCreated }: CreateElectionPageProps) {
  const [title, setTitle] = useState('');
  const [electionType, setElectionType] = useState('Department Election');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [departmentName, setDepartmentName] = useState('All Departments');
  const [status, setStatus] = useState<ElectionStatus>('ACTIVE');
  const [eligibleVotersCount, setEligibleVotersCount] = useState<number>(0);

  const [startAt, setStartAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [endAt, setEndAt] = useState(() => {
    const d = new Date(Date.now() + 24 * 3600 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await createElection({
      title,
      description,
      election_type: electionType,
      academic_year: academicYear,
      department_name: departmentName,
      status,
      eligible_voters_count: Number(eligibleVotersCount) || 0,
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
    });

    setIsSubmitting(false);
    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => {
        onCreated();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Failed to create election');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-30 px-3.5 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-slate-400">Institutional Governance</span>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 w-full max-w-xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
        <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-indigo-600 flex items-center justify-center mb-2.5">
              <Vote className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Create New Election
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure parameters, voting schedules, and eligible electorate for this ballot.
            </p>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Election created successfully! Redirecting...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2 animate-fade-in">
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Election Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cybersecurity Association President"
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Type & Initial Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Election Scope / Type
                </label>
                <select
                  value={electionType}
                  onChange={(e) => setElectionType(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Department Election">Department Election</option>
                  <option value="Student Council Election">Student Council Election</option>
                  <option value="Faculty Senate Election">Faculty Senate Election</option>
                  <option value="Club Election">Club Election</option>
                  <option value="University General Poll">University General Poll</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ElectionStatus)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="ACTIVE">ACTIVE (Open for Voting)</option>
                  <option value="SCHEDULED">SCHEDULED (Upcoming)</option>
                  <option value="DRAFT">DRAFT (Hidden)</option>
                </select>
              </div>
            </div>

            {/* Academic Year & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Scope
                </label>
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Eligible Voters Count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Eligible Electorate (Voters)
              </label>
              <input
                type="number"
                min="0"
                value={eligibleVotersCount}
                onChange={(e) => setEligibleVotersCount(parseInt(e.target.value) || 0)}
                placeholder="e.g. 250"
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Timings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Voting Starts
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="datetime-local"
                    required
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Voting Ends
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="datetime-local"
                    required
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Guidelines
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details, eligible batches, and voting instructions..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>{isSubmitting ? 'Publishing...' : 'Create & Launch Election'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
