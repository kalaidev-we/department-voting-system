import React from 'react';

interface WebLayoutProps {
  children: React.ReactNode;
}

export function WebLayout({ children }: WebLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 flex flex-col text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Full width responsive web container */}
      <div className="w-full flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

// Retain alias for backwards compatibility
export const MobileContainer = WebLayout;
