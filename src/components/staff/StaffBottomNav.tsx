import React from 'react';
import { Home, Vote, Users, MoreHorizontal } from 'lucide-react';

interface StaffBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function StaffBottomNav({ activeTab, onTabChange }: StaffBottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'elections', label: 'Elections', icon: Vote },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav
      aria-label="Staff navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 select-none"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] py-1.5 flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer ${
                isActive ? 'text-brand-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {/* Active animated indicator bar */}
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-brand-600 rounded-full animate-fadeIn" />
              )}

              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
