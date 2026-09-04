import React from 'react';

export function ShieldLogo({ className = "w-28 h-28", hasGlow = true }: { className?: string; hasGlow?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Glow effect */}
      {hasGlow && (
        <div className="absolute inset-0 bg-gradient-to-b from-blue-400/40 via-brand-500/30 to-indigo-600/20 rounded-full blur-2xl scale-125 pointer-events-none" />
      )}

      <svg
        viewBox="0 0 200 240"
        className="w-full h-full drop-shadow-xl relative z-10 transition-transform duration-500 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Shield Gradients */}
          <linearGradient id="shieldBorder" x1="100" y1="0" x2="100" y2="240" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4f8cff" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="shieldBg" x1="100" y1="12" x2="100" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="40%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          <linearGradient id="shieldInnerGlow" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="boxFront" x1="100" y1="130" x2="100" y2="185" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id="boxSide" x1="100" y1="130" x2="160" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shield Path with 3D Bevel */}
        <path
          d="M100 8 C145 8, 185 24, 185 55 C185 140, 145 200, 100 232 C55 200, 15 140, 15 55 C15 24, 55 8, 100 8 Z"
          fill="url(#shieldBorder)"
          stroke="#93c5fd"
          strokeWidth="3.5"
          filter="url(#softGlow)"
        />

        {/* Inner Shield Body */}
        <path
          d="M100 16 C140 16, 175 30, 175 58 C175 135, 140 190, 100 220 C60 190, 25 135, 25 58 C25 30, 60 16, 100 16 Z"
          fill="url(#shieldBg)"
        />

        {/* Inner Shield Highlight Glow */}
        <path
          d="M100 20 C136 20, 168 33, 168 60 C168 130, 136 182, 100 210 C64 182, 32 130, 32 60 C32 33, 64 20, 100 20 Z"
          fill="url(#shieldInnerGlow)"
        />

        {/* Isometric Ballot Box Container */}
        <g transform="translate(0, 5)">
          {/* Ballot Paper inserted into slot */}
          <g transform="translate(100, 110) rotate(-10) translate(-28, -52)">
            <rect
              x="0"
              y="0"
              width="56"
              height="52"
              rx="4"
              fill="#ffffff"
              stroke="#bfdbfe"
              strokeWidth="2"
              className="drop-shadow-md"
            />
            {/* Blue checkmark on ballot */}
            <path
              d="M18 26 L25 33 L38 18"
              fill="none"
              stroke="#2563eb"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Isometric Box Top Face */}
          <polygon
            points="100,105 150,125 100,145 50,125"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Slot on Top Face */}
          <polygon
            points="85,123 115,123 112,127 82,127"
            fill="#1e3a8a"
          />

          {/* Isometric Box Left Front Face */}
          <polygon
            points="50,125 100,145 100,185 50,165"
            fill="url(#boxFront)"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Isometric Box Right Front Face */}
          <polygon
            points="100,145 150,125 150,165 100,185"
            fill="url(#boxSide)"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Front Box Shadow/Corner Line */}
          <line
            x1="100"
            y1="145"
            x2="100"
            y2="185"
            stroke="#94a3b8"
            strokeWidth="1"
          />
        </g>
      </svg>
    </div>
  );
}
