import React from 'react';

export function CampusIllustration({ className = "w-full text-blue-200/50" }: { className?: string }) {
  return (
    <div className={`overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 800 240"
        className="w-full h-auto"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="campusFade" x1="400" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Distant trees and foliage */}
        <g opacity="0.35">
          <circle cx="60" cy="180" r="45" />
          <circle cx="120" cy="175" r="50" />
          <circle cx="200" cy="185" r="40" />
          <circle cx="600" cy="185" r="40" />
          <circle cx="680" cy="175" r="50" />
          <circle cx="740" cy="180" r="45" />
        </g>

        {/* Left Wing of College Hall */}
        <path
          d="M100 240 L100 160 L140 145 L320 145 L320 240 Z"
          fill="url(#campusFade)"
        />
        {/* Left Wing Windows */}
        <g fill="#ffffff" opacity="0.65">
          <rect x="120" y="165" width="16" height="24" rx="2" />
          <rect x="150" y="165" width="16" height="24" rx="2" />
          <rect x="180" y="165" width="16" height="24" rx="2" />
          <rect x="210" y="165" width="16" height="24" rx="2" />
          <rect x="240" y="165" width="16" height="24" rx="2" />
          <rect x="270" y="165" width="16" height="24" rx="2" />

          <rect x="120" y="200" width="16" height="28" rx="2" />
          <rect x="150" y="200" width="16" height="28" rx="2" />
          <rect x="180" y="200" width="16" height="28" rx="2" />
          <rect x="210" y="200" width="16" height="28" rx="2" />
          <rect x="240" y="200" width="16" height="28" rx="2" />
          <rect x="270" y="200" width="16" height="28" rx="2" />
        </g>

        {/* Right Wing of College Hall */}
        <path
          d="M480 240 L480 145 L660 145 L700 160 L700 240 Z"
          fill="url(#campusFade)"
        />
        {/* Right Wing Windows */}
        <g fill="#ffffff" opacity="0.65">
          <rect x="510" y="165" width="16" height="24" rx="2" />
          <rect x="540" y="165" width="16" height="24" rx="2" />
          <rect x="570" y="165" width="16" height="24" rx="2" />
          <rect x="600" y="165" width="16" height="24" rx="2" />
          <rect x="630" y="165" width="16" height="24" rx="2" />
          <rect x="660" y="165" width="16" height="24" rx="2" />

          <rect x="510" y="200" width="16" height="28" rx="2" />
          <rect x="540" y="200" width="16" height="28" rx="2" />
          <rect x="570" y="200" width="16" height="28" rx="2" />
          <rect x="600" y="200" width="16" height="28" rx="2" />
          <rect x="630" y="200" width="16" height="28" rx="2" />
          <rect x="660" y="200" width="16" height="28" rx="2" />
        </g>

        {/* Central Administration Building */}
        <path
          d="M320 240 L320 120 L400 90 L480 120 L480 240 Z"
          fill="url(#campusFade)"
        />

        {/* Central Pediment / Portico Columns */}
        <g fill="#ffffff" opacity="0.8">
          {/* Triangular Pediment */}
          <polygon points="340,120 400,95 460,120" />
          {/* Grand Columns */}
          <rect x="350" y="125" width="10" height="115" rx="1" />
          <rect x="375" y="125" width="10" height="115" rx="1" />
          <rect x="415" y="125" width="10" height="115" rx="1" />
          <rect x="440" y="125" width="10" height="115" rx="1" />
          {/* Main Entrance Door */}
          <rect x="388" y="180" width="24" height="60" rx="3" fill="#3b82f6" opacity="0.4" />
        </g>

        {/* Clock Tower / Bell Dome */}
        <rect x="380" y="45" width="40" height="50" rx="2" fill="url(#campusFade)" />
        {/* Clock Tower Cupola */}
        <path d="M375 45 C375 25, 425 25, 425 45 Z" fill="#60a5fa" opacity="0.9" />
        <rect x="398" y="15" width="4" height="15" fill="#2563eb" />
        <circle cx="400" cy="14" r="3" fill="#2563eb" />
        {/* Clock Face */}
        <circle cx="400" cy="65" r="12" fill="#ffffff" />
        <circle cx="400" cy="65" r="10" fill="none" stroke="#64748b" strokeWidth="1.5" />
        <line x1="400" y1="65" x2="400" y2="59" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="400" y1="65" x2="404" y2="67" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />

        {/* Front Foreground Trees */}
        <g fill="#93c5fd" opacity="0.7">
          <circle cx="280" cy="205" r="25" />
          <circle cx="310" cy="215" r="20" />
          <circle cx="490" cy="215" r="20" />
          <circle cx="520" cy="205" r="25" />
        </g>
      </svg>
    </div>
  );
}
