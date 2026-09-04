import React, { useState } from 'react';
import { Election, ElectionStatus } from '../../lib/types';
import { updateElection } from '../../services/electionService';
import {
  ChevronLeft,
  Edit3,
  CheckCircle2,
  Calendar,
  Vote,
  Save,
  Building,
  Users,
} from 'lucide-react';

interface AdminEditElectionPageProps {
  election: Election;
  onBack: () => void;
  onUpdated: () => void;
}

export function AdminEditElectionPage({
  election,
  onBack,
  onUpdated,
}: AdminEditElectionPageProps) {
  const [title, setTitle] = useState(election.title);
  const [electionType, setElectionType] = useState(election.election_type || 'Department Election');
  const [academicYear, setAcademicYear] = useState(election.academic_year || '2026-2027');
  const [departmentName, setDepartmentName] = useState(
    election.department_name || 'All Departments'
  );
  const [status, setStatus] = useState<ElectionStatus>(election.status || 'ACTIVE');
  const [eligibleVotersCount, setEligibleVotersCount] = useState<number>(
    election.eligible_voters_count || 0
  );

  const formatForInput = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const [startAt, setStartAt] = useState(() => formatForInput(election.start_at));
  const [endAt, setEndAt] = useState(() => formatForInput(election.end_at));
  const [description, setDescription] = useState(election.description || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await updateElection(election.id, {
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
        onUpdated();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Failed to update election');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1 rounded-lg cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Elections</span>
        </button>

        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-extrabold uppercase tracking-wider border border-purple-100">
          SUPER ADMIN EDIT
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-6 sm:py-8">
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Edit Election Parameters
              </h2>
              <p className="text-xs text-slate-400">
                Modify title, schedules, eligible voters count, or voting status
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Election updated successfully! Returning...</span>
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
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Type & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Election Type
                </label>
                <select
                  value={electionType}
                  onChange={(e) => setElectionType(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Department Election">Department Election</option>
                  <option value="Student Council Election">Student Council Election</option>
                  <option value="Faculty Senate Election">Faculty Senate Election</option>
                  <option value="Club / Association Election">Club / Association Election</option>
                  <option value="University-wide General Poll">University-wide General Poll</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ballot Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ElectionStatus)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="DRAFT">DRAFT (Hidden)</option>
                  <option value="SCHEDULED">SCHEDULED (Upcoming)</option>
                  <option value="ACTIVE">ACTIVE (Open for Voting)</option>
                  <option value="CLOSED">CLOSED (Voting Ended)</option>
                  <option value="RESULTS_VERIFIED">RESULTS VERIFIED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
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
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
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
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Eligible Voters Count */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Eligible Electorate Size (Voters Count)
              </label>
              <input
                type="number"
                min="0"
                value={eligibleVotersCount}
                onChange={(e) => setEligibleVotersCount(parseInt(e.target.value) || 0)}
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Start & End Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Voting Starts
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="datetime-local"
                    required
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Voting Ends
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="datetime-local"
                    required
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Rules
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
