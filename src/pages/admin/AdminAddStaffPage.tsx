import React, { useState } from 'react';
import { createStaffMember } from '../../services/adminService';
import {
  ChevronLeft,
  UserPlus,
  Briefcase,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Vote,
} from 'lucide-react';

interface AdminAddStaffPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AdminAddStaffPage({ onBack, onSuccess }: AdminAddStaffPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Cybersecurity Department');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [canVote, setCanVote] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([
    'create_election',
    'manage_candidates',
    'view_reports',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.toLowerCase().endsWith('@kpriet.ac.in')) {
      setError('Staff email must be an official collegiate address ending with @kpriet.ac.in');
      return;
    }

    if (!name.trim() || !employeeId.trim()) {
      setError('Please provide the full name and employee registration ID.');
      return;
    }

    setIsSubmitting(true);

    const res = await createStaffMember({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      employee_id: employeeId.trim().toUpperCase(),
      department,
      designation,
      permissions,
      can_vote: canVote,
      is_active: true,
    });

    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Failed to create staff member.');
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
              Enroll Staff & Faculty Officer
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Assign administrative permissions and voting credentials
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Faculty / Staff Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Dr. S. Kumar or Prof. Anitha M"
              className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Employee ID & Official Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Employee Registration ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                placeholder="e.g. EMP-SC-042"
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Official College Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g. staff.kumar@kpriet.ac.in"
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Department & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="Cybersecurity Department">Cybersecurity Department</option>
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Academic Designation
              </label>
              <select
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="Professor & Head of Department">Professor & HoD</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Election Returning Officer">Election Returning Officer</option>
              </select>
            </div>
          </div>

          {/* Staff Voter Eligibility Option */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Vote className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Voter Participation Rights
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Enable this staff member to cast anonymous ballots in active campus elections
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={canVote}
                onChange={(e) => setCanVote(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Permissions Group */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Administrative Capabilities
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'create_election', label: 'Schedule Elections' },
                { id: 'manage_candidates', label: 'Add & Manage Candidates' },
                { id: 'review_applications', label: 'Review Nominations' },
                { id: 'view_reports', label: 'View Full Result Analytics' },
              ].map((item) => (
                <label
                  key={item.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(item.id)}
                    onChange={() => togglePermission(item.id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-800 font-medium text-[11px]">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Enrolling Staff Member...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Confirm & Enroll Staff</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
