import React, { useState, useEffect } from 'react';
import { SecurityEvent } from '../../lib/types';
import { fetchSecurityEvents } from '../../services/adminService';
import {
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Search,
  Filter,
} from 'lucide-react';

interface AdminSecurityEventsPageProps {
  onBack: () => void;
}

export function AdminSecurityEventsPage({ onBack }: AdminSecurityEventsPageProps) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const data = await fetchSecurityEvents();
      setEvents(data);
    }
    load();
  }, []);

  const filtered = events.filter(
    (e) =>
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.source_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.event_type.toLowerCase().includes(searchQuery.toLowerCase())
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
              Domain Guard & Security Incidents
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
              Access control enforcement & domain violation monitoring
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-5 space-y-4">
        {/* Domain Enforcement Status Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-rose-900 to-slate-900 text-white shadow-xl shadow-rose-950/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                Active Domain Perimeter: @kpriet.ac.in
              </h3>
              <p className="text-[11px] sm:text-xs text-rose-200/80 leading-relaxed">
                All OAuth callbacks non-conforming to the collegiate institutional domain are permanently blocked.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search security incidents by email or description..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-xs"
          />
        </div>

        {/* Incidents Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Intercepted Events ({filtered.length})
            </span>
            <span className="text-[11px] text-rose-600 font-bold">
              Automatic Quarantine Active
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Zero Security Incidents Detected</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Domain Guard is active and monitoring all authentication attempts. Unauthorized domain access attempts and policy violations will appear here.
                </p>
              </div>
            ) : (
              filtered.map((evt) => (
                <div key={evt.id} className="p-3.5 sm:p-4 hover:bg-slate-50 transition-colors space-y-1.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-mono font-bold text-[10px]">
                        {evt.event_type}
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-md font-bold text-[9px] ${
                          evt.severity === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {evt.severity}
                      </span>
                    </div>

                    <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0">
                      {new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed font-medium text-[11px] sm:text-xs">
                    {evt.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>Source IP: {evt.ip_address}</span>
                    {evt.source_email && (
                      <>
                        <span>&bull;</span>
                        <span className="truncate max-w-[220px]">Target: {evt.source_email}</span>
                      </>
                    )}
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
