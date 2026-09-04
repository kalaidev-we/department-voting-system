import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  FileText,
  Upload,
  RefreshCw,
} from 'lucide-react';

interface AdminStudentsPageProps {
  onBack: () => void;
}

const SAMPLE_CSV_TEMPLATE = `student_id,full_name,email,department,year,section
26SCL01,Aravind Swaminathan,26scl01@kpriet.ac.in,Cybersecurity Department,1st Year,A
26SCL02,Bhavana Priya K,26scl02@kpriet.ac.in,Cybersecurity Department,1st Year,A
26SCL03,Charan Raj M,26scl03@kpriet.ac.in,Cybersecurity Department,1st Year,A
26CS101,Dharshini S,26cs101@kpriet.ac.in,Computer Science and Engineering,1st Year,B
26CS102,Eashwar Kumar V,26cs102@kpriet.ac.in,Computer Science and Engineering,1st Year,B
26AD101,Gokul Prasad N,26ad101@kpriet.ac.in,Artificial Intelligence and Data Science,1st Year,A`;

export function AdminStudentsPage({ onBack }: AdminStudentsPageProps) {
  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importStatus, setImportStatus] = useState<{ count: number; errors: string[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoadingList(true);
    const list = await fetchStudentRoster();
    setStudents(list);
    setIsLoadingList(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvContent(text);
        setImportStatus(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'students_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async () => {
    if (!csvContent.trim()) return;
    setIsProcessing(true);
    const result = await importStudentsFromCSV(csvContent);
    setIsProcessing(false);
    setImportStatus({ count: result.importedCount, errors: result.errors });
    await loadData();
    if (result.errors.length === 0) {
      setTimeout(() => {
        setIsImportModalOpen(false);
        setCsvContent('');
        setImportStatus(null);
      }, 1800);
    }
  };

  // Live parsed preview of CSV lines
  const parsedPreviewRows = React.useMemo(() => {
    if (!csvContent.trim()) return [];
    const lines = csvContent.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) return [];

    return lines.slice(1).map((line) => {
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      return {
        id: parts[0] || '',
        name: parts[1] || '',
        email: parts[2] || '',
        department: parts[3] || 'Cybersecurity',
        year: parts[4] || '1st Year',
        section: parts[5] || 'A',
      };
    }).filter((r) => r.id && r.email);
  }, [csvContent]);

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
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 sm:w-9 sm:h-9 -ml-1 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-bold text-slate-900 leading-none truncate">
              Student Voter Registry
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
              Verified institutional roster (@kpriet.ac.in)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            onClick={handleDownloadTemplate}
            className="h-8 sm:h-9 px-2 sm:px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1 sm:space-x-1.5 shadow-xs cursor-pointer"
            title="Download CSV Template"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Download Template</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="h-8 sm:h-9 px-2.5 sm:px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Import<span className="hidden sm:inline"> CSV</span></span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-5 space-y-4">
        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student by roll number, name, or email..."
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>
          <button
            onClick={loadData}
            disabled={isLoadingList}
            className="h-10 px-2.5 sm:px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
            title="Reload from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
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
            {filtered.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Student Records Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No student voters found in database. Click "Import CSV" above to bulk-register students with the CSV template.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Open CSV Importer</span>
                  </button>
                </div>
              </div>
            ) : (
              filtered.map((student) => (
                <div
                  key={student.id}
                  className="p-3 sm:p-4 hover:bg-slate-50 flex items-center justify-between gap-2.5 sm:gap-3 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {student.course_code}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {student.full_name}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 font-mono text-[9px] sm:text-[10px] font-bold">
                          {student.student_id}
                        </span>
                        {student.admission_type === 'LATERAL' && (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 text-[8px] sm:text-[9px] font-extrabold">
                            LATERAL
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                        {student.department} &bull; {student.year} &bull; {student.email}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-bold shrink-0">
                    Eligible
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Enhanced Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3.5 sm:space-y-4 max-h-[92vh] flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Import Student Roster (CSV)
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick action bar inside modal */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 pb-1 border-b border-slate-100 text-xs">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Template CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCsvContent(SAMPLE_CSV_TEMPLATE);
                  setImportStatus(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Load Sample Data</span>
              </button>

              <label className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload .csv File</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500">
              Paste or upload CSV with headers: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono font-bold">student_id,full_name,email,department,year,section</code>. All emails must end with <code className="font-bold text-slate-700">@kpriet.ac.in</code>.
            </p>

            <textarea
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={`student_id,full_name,email,department,year,section\n26SCL04,Deepak M,26scl04@kpriet.ac.in,Cybersecurity Department,1st Year,A\n26CS102,Ananya R,26cs102@kpriet.ac.in,Computer Science and Engineering,1st Year,B`}
              rows={4}
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 shrink-0"
            />

            {/* Live Parsed Preview Table */}
            {parsedPreviewRows.length > 0 && (
              <div className="overflow-hidden flex flex-col space-y-1.5 border border-slate-200 rounded-xl p-2.5 bg-slate-50/50">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>Data Preview ({parsedPreviewRows.length} valid students ready)</span>
                  <span className="text-emerald-600 font-semibold">Valid Format</span>
                </div>
                <div className="overflow-x-auto">
                  <div className="overflow-y-auto max-h-32 text-[11px] divide-y divide-slate-200 bg-white rounded-lg border border-slate-100 min-w-[340px]">
                    {parsedPreviewRows.map((r, i) => (
                      <div key={i} className="px-2.5 py-1.5 flex items-center justify-between gap-2">
                        <div className="font-mono font-bold text-slate-800 w-18 shrink-0">{r.id}</div>
                        <div className="truncate font-medium text-slate-900 flex-1">{r.name}</div>
                        <div className="truncate text-slate-500 text-[10px] w-36 shrink-0">{r.email}</div>
                        <div className="text-[10px] text-indigo-600 font-semibold shrink-0">{r.year}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Ingestion Status Result */}
            {importStatus && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Successfully imported and synced {importStatus.count} student voters into database.</span>
                </div>
                {importStatus.errors.length > 0 && (
                  <div className="text-rose-600 text-[11px] space-y-0.5 pt-1 border-t border-slate-200 max-h-24 overflow-y-auto">
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
                className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCSV}
                disabled={!csvContent.trim() || isProcessing}
                className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
              >
                {isProcessing ? 'Ingesting to DB...' : 'Ingest to Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
