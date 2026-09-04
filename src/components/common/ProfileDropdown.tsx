import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Building,
  Moon,
  Sun,
} from 'lucide-react';

interface ProfileDropdownProps {
  onNavigate?: (tab: string) => void;
}

export function ProfileDropdown({ onNavigate }: ProfileDropdownProps) {
  const { profile, signOut } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (tab: string) => {
    setIsOpen(false);
    if (onNavigate) onNavigate(tab);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button: Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center overflow-hidden shadow-xs border border-white dark:border-slate-700">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Modern Floating Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-300/40 dark:shadow-slate-950/80 border border-slate-100 dark:border-slate-800 p-2 z-50 animate-scaleUp select-none">
          {/* User Info Header */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl mb-1.5 flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 font-bold text-sm flex items-center justify-center overflow-hidden shrink-0 border border-white dark:border-slate-700">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {profile?.full_name || 'Staff User'}
                </h4>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                {profile?.email}
              </p>

              <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>
                  {profile?.role === 'SUPER_ADMIN'
                    ? 'Super Admin (Institution Lead)'
                    : profile?.role === 'STAFF_ADMIN'
                    ? 'Staff Administrator'
                    : 'Student Voter'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-0.5 text-xs font-medium text-slate-700 dark:text-slate-200">
            <button
              onClick={() => handleAction('profile')}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => handleAction('settings')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 capitalize flex items-center gap-1">
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-3 h-3 text-indigo-400" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-500" />
                )}
                {theme}
              </span>
            </button>

            <button
              onClick={() => handleAction('help')}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help & Support</span>
            </button>

            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors text-left font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
