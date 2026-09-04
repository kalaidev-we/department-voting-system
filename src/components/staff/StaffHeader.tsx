import React from 'react';
import { Shield, Bell, ArrowLeft } from 'lucide-react';
import { ProfileDropdown } from '../common/ProfileDropdown';
import { useAuth } from '../../context/AuthContext';

interface StaffHeaderProps {
  onNotificationClick?: () => void;
  onNavigate?: (tab: string) => void;
}

export function StaffHeader({ onNotificationClick, onNavigate }: StaffHeaderProps) {
  const { role } = useAuth();

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs select-none">
      {/* Brand Logo & Super Admin Return Link */}
      <div className="flex items-center space-x-3">
        <div 
          onClick={() => onNavigate && onNavigate(role === 'SUPER_ADMIN' ? 'admin_home' : 'home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-black tracking-tight text-slate-900 leading-none">
                Secure<span className="text-brand-600">Vote</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-brand-700 text-[9px] font-extrabold uppercase tracking-wider border border-blue-100">
                CAMPUS
              </span>
            </div>
          </div>
        </div>

        {role === 'SUPER_ADMIN' && (
          <button
            onClick={() => onNavigate && onNavigate('admin_home')}
            className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Governance Center</span>
          </button>
        )}
      </div>

      {/* Right Controls: Notification Icon & Profile Avatar */}
      <div className="flex items-center space-x-2.5">
        {/* Notification Bell */}
        <button
          onClick={onNotificationClick}
          aria-label="View notifications"
          className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center relative transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        >
          <Bell className="w-4.5 h-4.5" />
          {/* Unread indicator dot */}
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
        </button>

        {/* Profile Dropdown */}
        <ProfileDropdown onNavigate={onNavigate} />
      </div>
    </header>
  );
}
