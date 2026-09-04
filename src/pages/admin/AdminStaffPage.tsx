import React, { useState, useEffect } from 'react';
import { StaffMember } from '../../lib/types';
import { fetchStaffMembers } from '../../services/adminService';
import {
  ChevronLeft,
  UserCheck,
  Search,
  Plus,
  ShieldCheck,
  Mail,
  Briefcase,
  CheckCircle2,
  Vote,
} from 'lucide-react';

interface AdminStaffPageProps {
  onBack: () => void;
  onAddNewStaff: () => void;
}

export function AdminStaffPage({ onBack, onAddNewStaff }: AdminStaffPageProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const data = await fetchStaffMembers();
      setStaffList(data);
    }
    load();
  }, []);

  const filtered = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              Faculty & Staff Administration
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Authorized election officers, committee leads & staff voters
            </p>
          </div>
        </div>

        <button
          onClick={onAddNewStaff}
          className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, email, or employee ID..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Staff List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Staff ({filtered.length})
            </span>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <Vote className="w-3.5 h-3.5" />
              Eligible to Vote
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Staff Members Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No staff election officers or faculty members enrolled yet. Click "Add Staff Member" to add authorized personnel.
                </p>
              </div>
            ) : (
              filtered.map((staff) => (
                <div
                  key={staff.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-100/70 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-200/60">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{staff.name}</h4>
                        <span className="px-2 py-0.2 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                          {staff.employee_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {staff.designation} &bull; {staff.department}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {staff.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-center">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60 flex items-center gap-1">
                      <Vote className="w-3 h-3 text-blue-600" />
                      Voter Eligible
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Staff Admin
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
