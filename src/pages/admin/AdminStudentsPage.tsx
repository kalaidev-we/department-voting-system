import React, { useState, useEffect } from 'react';
import { StudentRosterItem } from '../../lib/types';
import { fetchStudentRoster, importStudentsFromCSV } from '../../services/adminService';
import {
  ChevronLeft,
  Users,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';

interface AdminStudentsPageProps {
  onBack: () => void;
}

export function AdminStudentsPage({ onBack }: AdminStudentsPageProps) {
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importStatus, setImportStatus] = useState<{ count: number; errors: string[] } | null>(null);

  const loadData = async () => {
    const list = await fetchStudentRoster();
    setStudents(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImportCSV = async () => {
    if (!csvContent.trim()) return;
    const result = await importStudentsFromCSV(csvContent);
    setImportStatus({ count: result.importedCount, errors: result.errors });
    await loadData();
    if (result.errors.length === 0) {
      setTimeout(() => {
        setIsImportModalOpen(false);
        setCsvContent('');
        setImportStatus(null);
      }, 1500);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Student Voter Registry
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Verified institutional roster (@kpriet.ac.in)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Import CSV</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by roll number, name, or email..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Student Roster Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Students ({filtered.length})
            </span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              All Verified
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map((student) => (
              <div
                key={student.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {student.course_code}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {student.full_name}
                      </h4>
                      <span className="px-2 py-0.2 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {student.student_id}
                      </span>
                      {student.admission_type === 'LATERAL' && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 text-[9px] font-extrabold">
                          LATERAL
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {student.department} &bull; {student.year} &bull; {student.email}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold shrink-0">
                  Eligible
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Import Student Roster (CSV)
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste CSV data with headers: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">student_id,full_name,email,department</code>. All emails must end with <code className="font-bold">@kpriet.ac.in</code>.
            </p>

            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={`student_id,full_name,email,department\n26SCL04,Deepak M,26scl04@kpriet.ac.in,Cybersecurity Department\n26CS102,Ananya R,26cs102@kpriet.ac.in,Computer Science and Engineering`}
              rows={6}
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
            />

            {importStatus && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Successfully imported {importStatus.count} student voters.</span>
                </div>
                {importStatus.errors.length > 0 && (
                  <div className="text-rose-600 text-[11px] space-y-0.5 pt-1 border-t border-slate-200">
                    {importStatus.errors.map((err, i) => (
                      <p key={i}>&bull; {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus(null);
                }}
                className="flex-1 h-10 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                disabled={!csvContent.trim()}
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Process & Ingest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
