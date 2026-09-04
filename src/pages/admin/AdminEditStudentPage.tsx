import React, { useState } from 'react';
import { StudentRosterItem } from '../../lib/types';
import { updateStudent } from '../../services/adminService';
import { parseStudentId } from '../../lib/studentParser';
import {
  ChevronLeft,
  UserCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Building,
  Mail,
  Shield,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AdminEditStudentPageProps {
  student: StudentRosterItem;
  onBack: () => void;
  onUpdated: (updatedStudent: StudentRosterItem) => void;
}

const DEPARTMENTS = [
  'Cybersecurity Department',
  'Computer Science and Engineering',
  'Artificial Intelligence and Data Science',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biomedical Engineering',
  'Mechatronics Engineering',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', 'Final Year'];
const SECTIONS = ['A', 'B', 'C', 'D'];

export function AdminEditStudentPage({
  student,
  onBack,
  onUpdated,
}: AdminEditStudentPageProps) {
  const [fullName, setFullName] = useState(student.full_name);
  const [studentId, setStudentId] = useState(student.student_id);
  const [email, setEmail] = useState(student.email);
  const [department, setDepartment] = useState(student.department || 'Cybersecurity Department');
  const [year, setYear] = useState(student.year || '1st Year');
  const [section, setSection] = useState(student.section || 'A');
  const [admissionType, setAdmissionType] = useState<'REGULAR' | 'LATERAL'>(
    student.admission_type || 'REGULAR'
  );
  const [isEligible, setIsEligible] = useState(student.is_eligible_to_vote !== false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-detect lateral entry when student ID changes
  const handleStudentIdChange = (newId: string) => {
    setStudentId(newId);
    const parsed = parseStudentId(newId);
    if (parsed.isLateralEntry) {
      setAdmissionType('LATERAL');
      if (year === '1st Year') {
        setYear('2nd Year');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = studentId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanId || !cleanName || !cleanEmail) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (!cleanEmail.endsWith('@kpriet.ac.in') && cleanEmail !== 'skalaiarasu3@gmail.com') {
      setErrorMessage('Collegiate email must end with @kpriet.ac.in');
      return;
    }

    setIsSubmitting(true);

    const res = await updateStudent(student.student_id, {
      id: student.id,
      student_id: cleanId,
      full_name: cleanName,
      email: cleanEmail,
      department,
      year,
      section,
      admission_type: admissionType,
      is_eligible_to_vote: isEligible,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      setSuccessMessage('Student voter record updated successfully.');
      setTimeout(() => {
        if (res.data) onUpdated(res.data);
      }, 1000);
    } else {
      setErrorMessage(res.error || 'Failed to update student voter record.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col select-none antialiased">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Return to Student Registry"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-bold text-slate-900 leading-none truncate">
              Edit Student Record
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
              Update details & voting eligibility for {student.student_id}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold">
            {student.student_id}
          </span>
          {admissionType === 'LATERAL' && (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
              LATERAL (2nd Year)
            </span>
          )}
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
          {/* Form Header Info Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Institutional Student Governance
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                Changes made here reflect immediately on live voter eligibility checks, candidate nomination submissions, and election tallies.
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="font-medium leading-relaxed">{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Student Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aravind Swaminathan"
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Roll Number & Email in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Roll Number / Student ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => handleStudentIdChange(e.target.value)}
                    placeholder="e.g. 26SCL01"
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs uppercase"
                  />
                  {studentId.toUpperCase().includes('L') && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Lateral
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Collegiate Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. 26scl01@kpriet.ac.in"
                    className="w-full h-11 pl-9 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Department Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Department Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-11 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs appearance-none cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year of Study, Section, and Admission Type in 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Year of Study <span className="text-rose-500">*</span>
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs cursor-pointer"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Section <span className="text-rose-500">*</span>
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs cursor-pointer"
                >
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      Section {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Admission Type
                </label>
                <select
                  value={admissionType}
                  onChange={(e) => setAdmissionType(e.target.value as 'REGULAR' | 'LATERAL')}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs cursor-pointer"
                >
                  <option value="REGULAR">Regular Entry</option>
                  <option value="LATERAL">Lateral Entry (Direct 2nd Yr)</option>
                </select>
              </div>
            </div>

            {/* Voting Eligibility Toggle Card */}
            <div className={`p-4 rounded-2xl border transition-colors flex items-center justify-between gap-4 ${
              isEligible ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isEligible ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {isEligible ? <Shield className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Voter Eligibility Status: {isEligible ? 'Authorized & Active' : 'Restricted / Revoked'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isEligible
                      ? 'Student is officially registered and permitted to cast votes in campus elections.'
                      : 'Voting rights have been temporarily revoked. Student cannot access the ballot booth.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEligible(!isEligible)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  isEligible
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {isEligible ? 'Revoke Rights' : 'Restore Eligibility'}
              </button>
            </div>

            {/* Submit & Cancel Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-2/3 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Save Student Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
