import React from 'react';

export function BallotBoxIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 440 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-[420px] drop-shadow-xl overflow-visible"
      >
        <defs>
          {/* Radial glow for campus dome portal */}
          <radialGradient id="campusDomeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#DBEAFE" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.2" />
          </radialGradient>

          {/* Building silhouettes gradient */}
          <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.05" />
          </linearGradient>

          {/* Leaf gradients */}
          <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>

          {/* 3D Acrylic Glass Box Gradients */}
          <linearGradient id="glassFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="30%" stopColor="#BAE6FD" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#7DD3FC" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.55" />
          </linearGradient>

          <linearGradient id="glassLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="glassTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.5" />
          </linearGradient>

          {/* Hand 3D Skin Gradient */}
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="50%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>

          {/* Royal Blue Sleeve Gradient */}
          <linearGradient id="sleeveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>

          {/* Ballot Paper Gradient */}
          <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>

          {/* Ground Shadow */}
          <radialGradient id="boxGroundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
          </radialGradient>

          {/* Filter for glass glow */}
          <filter id="glassGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Filter for soft shadow */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1E3A8A" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 1. Circular Dome / Campus Portal Backdrop */}
        <circle cx="270" cy="220" r="170" fill="url(#campusDomeGrad)" />

        {/* Campus Architectural Silhouettes inside portal */}
        <g opacity="0.6">
          {/* Main Hall Colonnade */}
          <rect x="220" y="140" width="90" height="130" rx="4" fill="url(#buildingGrad)" />
          <rect x="235" y="125" width="60" height="15" rx="2" fill="url(#buildingGrad)" />
          {/* Clock Tower / Spire */}
          <path d="M255 125 L265 95 L275 125 Z" fill="url(#buildingGrad)" />
          {/* Windows */}
          <rect x="232" y="150" width="14" height="22" rx="7" fill="#FFFFFF" fillOpacity="0.7" />
          <rect x="258" y="150" width="14" height="22" rx="7" fill="#FFFFFF" fillOpacity="0.7" />
          <rect x="284" y="150" width="14" height="22" rx="7" fill="#FFFFFF" fillOpacity="0.7" />
          <rect x="232" y="185" width="14" height="22" rx="7" fill="#FFFFFF" fillOpacity="0.7" />
          <rect x="258" y="185" width="14" height="22" rx="7" fill="#FFFFFF" fillOpacity="0.7" />
          <rect x="284" y="185" width="14" height="22" rx="7" fill="#FFFFFF" fillOpacity="0.7" />
          {/* Additional Campus Building on Right */}
          <rect x="320" y="170" width="80" height="110" rx="4" fill="url(#buildingGrad)" />
          <rect x="335" y="185" width="12" height="18" rx="2" fill="#FFFFFF" fillOpacity="0.6" />
          <rect x="355" y="185" width="12" height="18" rx="2" fill="#FFFFFF" fillOpacity="0.6" />
          <rect x="375" y="185" width="12" height="18" rx="2" fill="#FFFFFF" fillOpacity="0.6" />
          {/* Trees in background */}
          <circle cx="210" cy="230" r="28" fill="#86EFAC" fillOpacity="0.4" />
          <circle cx="315" cy="240" r="32" fill="#86EFAC" fillOpacity="0.45" />
        </g>

        {/* 2. Floating Green Leaves (Catching the breeze) */}
        {/* Top Right Leaf */}
        <g transform="translate(365, 80) rotate(25) scale(0.9)">
          <path
            d="M0 0 C15 -10 35 -5 40 15 C42 32 25 38 10 30 C-5 22 -10 10 0 0 Z"
            fill="url(#leafGrad1)"
            filter="drop-shadow(0px 4px 6px rgba(22, 163, 74, 0.25))"
          />
          <path d="M5 5 Q20 15 35 15" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
        </g>

        {/* Mid-Right Leaf */}
        <g transform="translate(380, 150) rotate(-15) scale(0.8)">
          <path
            d="M0 0 C12 -8 30 -4 35 12 C37 25 22 30 8 24 C-4 18 -8 8 0 0 Z"
            fill="url(#leafGrad2)"
            filter="drop-shadow(0px 3px 5px rgba(22, 163, 74, 0.2))"
          />
          <path d="M4 4 Q18 12 30 12" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
        </g>

        {/* Left Floating Leaf */}
        <g transform="translate(195, 235) rotate(-35) scale(0.75)">
          <path
            d="M0 0 C14 -9 32 -4 38 14 C40 28 24 35 10 28 C-4 20 -9 9 0 0 Z"
            fill="url(#leafGrad1)"
            filter="drop-shadow(0px 3px 5px rgba(22, 163, 74, 0.2))"
          />
          <path d="M5 5 Q19 14 32 14" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.5" strokeLinecap="round" />
        </g>

        {/* 3. Handwritten Script: "Same Campus Brighter Future" */}
        <g transform="translate(270, 125) rotate(-10)">
          <text
            x="0"
            y="0"
            fontFamily="'Brush Script MT', 'Dancing Script', 'Caveat', cursive, sans-serif"
            fontSize="19"
            fontWeight="bold"
            fill="#2563EB"
            letterSpacing="0.04em"
            textAnchor="middle"
          >
            Same Campus
          </text>
          <text
            x="8"
            y="20"
            fontFamily="'Brush Script MT', 'Dancing Script', 'Caveat', cursive, sans-serif"
            fontSize="19"
            fontWeight="bold"
            fill="#2563EB"
            letterSpacing="0.04em"
            textAnchor="middle"
          >
            Brighter Future
          </text>
          {/* Subtle curved underline flourish */}
          <path
            d="M-40 28 Q10 36 60 27"
            stroke="#3B82F6"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.8"
            fill="none"
          />
        </g>

        {/* 4. Ground Shadow Under Acrylic Box */}
        <ellipse cx="280" cy="385" rx="115" ry="24" fill="url(#boxGroundShadow)" />

        {/* 5. Modern Translucent 3D Acrylic Glass Ballot Box */}
        <g filter="url(#softShadow)">
          {/* Back / Inside Wall of Glass Box */}
          <polygon points="190,265 370,265 350,230 210,230" fill="#BAE6FD" fillOpacity="0.25" />
          <polygon points="190,265 210,230 210,345 190,380" fill="#93C5FD" fillOpacity="0.2" />

          {/* Front Glass Panel */}
          <polygon
            points="190,265 370,265 370,380 190,380"
            fill="url(#glassFront)"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeOpacity="0.8"
          />

          {/* Left Beveled Glass Depth */}
          <polygon
            points="170,245 190,265 190,380 170,360"
            fill="url(#glassLeft)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* Top Glass Cover with Ballot Slot */}
          <polygon
            points="170,245 350,245 370,265 190,265"
            fill="url(#glassTop)"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeOpacity="0.9"
          />

          {/* The Ballot Ingestion Slot on Top */}
          <polygon
            points="235,253 305,253 310,257 240,257"
            fill="#0369A1"
            fillOpacity="0.75"
            stroke="#E0F2FE"
            strokeWidth="1"
          />

          {/* Specular Light Reflection Streak on Front Face */}
          <path
            d="M200 275 L360 275 L350 282 L200 282 Z"
            fill="#FFFFFF"
            fillOpacity="0.5"
          />
          <path
            d="M195 290 L210 290 L205 370 L195 370 Z"
            fill="#FFFFFF"
            fillOpacity="0.3"
          />

          {/* Box Front Typography: "Students Choose A Better Tomorrow" */}
          <g transform="translate(280, 310)" textAnchor="middle">
            <text
              x="0"
              y="0"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="13"
              fontWeight="700"
              fill="#1E40AF"
              fillOpacity="0.8"
              letterSpacing="0.01em"
            >
              Students
            </text>
            <text
              x="0"
              y="16"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="13"
              fontWeight="700"
              fill="#1E40AF"
              fillOpacity="0.8"
              letterSpacing="0.01em"
            >
              Choose
            </text>
            <text
              x="0"
              y="32"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="13"
              fontWeight="700"
              fill="#1E40AF"
              fillOpacity="0.8"
              letterSpacing="0.01em"
            >
              A Better
            </text>
            <text
              x="0"
              y="48"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize="13"
              fontWeight="700"
              fill="#1E40AF"
              fillOpacity="0.8"
              letterSpacing="0.01em"
            >
              Tomorrow
            </text>
          </g>

          {/* Glass Corner Highlights */}
          <circle cx="190" cy="265" r="3" fill="#FFFFFF" />
          <circle cx="370" cy="265" r="3" fill="#FFFFFF" />
          <circle cx="170" cy="245" r="3" fill="#FFFFFF" />
          <circle cx="350" cy="245" r="3" fill="#FFFFFF" />
        </g>

        {/* 6. The White Voting Ballot Card (Entering Slot) */}
        <g transform="translate(245, 180) rotate(-6)">
          {/* Card Body */}
          <rect
            x="0"
            y="0"
            width="68"
            height="92"
            rx="8"
            fill="url(#paperGrad)"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            filter="drop-shadow(0px 8px 12px rgba(15, 23, 42, 0.15))"
          />

          {/* Blue Verified Checkmark Seal on the Ballot */}
          <circle cx="34" cy="46" r="17" fill="#2563EB" />
          {/* Inner ring */}
          <circle cx="34" cy="46" r="14" fill="#3B82F6" />
          {/* White Checkmark */}
          <path
            d="M28 46 L32 50 L40 41"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* 7. Stylized 3D Hand Inserting Ballot */}
        <g>
          {/* Royal Blue Sleeve & Arm entering from top-right */}
          <path
            d="M390 165 C390 165 420 170 440 175 L440 220 C410 215 390 205 380 200 Z"
            fill="url(#sleeveGrad)"
            filter="drop-shadow(-4px 6px 8px rgba(30, 58, 138, 0.25))"
          />
          {/* White shirt cuff */}
          <path
            d="M382 175 C378 185 378 195 382 205 L387 203 C384 195 384 185 387 177 Z"
            fill="#FFFFFF"
          />

          {/* Hand Palm and Knuckles */}
          <path
            d="M330 170 C315 170 295 180 290 195 C285 210 295 220 310 222 C330 225 365 215 380 198 C382 195 382 185 375 180 C365 172 345 170 330 170 Z"
            fill="url(#skinGrad)"
            filter="drop-shadow(0px 6px 8px rgba(194, 65, 12, 0.2))"
          />

          {/* Thumb holding the ballot card */}
          <path
            d="M305 200 C295 198 285 203 283 210 C280 217 288 223 298 222 C308 220 318 214 316 205 C314 199 308 198 305 200 Z"
            fill="url(#skinGrad)"
          />

          {/* Index Finger pressing ballot top */}
          <path
            d="M320 172 C308 172 296 177 292 185 C288 192 294 198 304 197 C314 195 330 188 332 180 C332 174 326 172 320 172 Z"
            fill="url(#skinGrad)"
          />

          {/* Middle & Ring Finger folds */}
          <path
            d="M338 173 C330 173 322 178 322 186 C322 194 332 196 342 193 C352 190 354 181 350 175 C346 173 342 173 338 173 Z"
            fill="#FB923C"
            fillOpacity="0.5"
          />
        </g>
      </svg>
    </div>
  );
}
