import React from 'react';

// Flying audit sheet of paper
function Paper({ className }) {
  return (
    <div className={`paper-wrap ${className}`}>
      <svg className="paper-svg" viewBox="0 0 40 50" width="36" height="45" aria-hidden="true">
        {/* Page outline */}
        <rect x="3" y="3" width="34" height="44" rx="3" stroke="currentColor" strokeWidth="2.5" fill="none" />
        {/* Simple textual line indicators */}
        <line x1="9" y1="12" x2="31" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="9" y1="22" x2="31" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="9" y1="32" x2="23" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// Realistic neon fish
function Fish({ className, flip }) {
  return (
    <div className={`fish-wrap ${className}`}>
      <div className={flip ? 'fish-inner-flip' : ''}>
        <svg className="fish-svg" viewBox="0 0 130 60" width="78" height="38" aria-hidden="true">
          {/* Tail — wiggles */}
          <path className="fish-tail" d="M20,30 L2,10 L11,30 L2,50 Z" fill="currentColor" />
          {/* Body */}
          <ellipse cx="70" cy="30" rx="50" ry="19" fill="currentColor" />
          {/* Belly highlight */}
          <ellipse cx="66" cy="37" rx="30" ry="9" fill="rgba(255,255,255,0.13)" />
          {/* Top fin */}
          <path d="M55,11 Q70,1 85,11" stroke="currentColor" strokeWidth="2.5" fill="none" />
          {/* Eye */}
          <circle cx="106" cy="25" r="4.5" fill="rgba(0,0,0,0.75)" />
          <circle cx="107.5" cy="23.5" r="1.5" fill="rgba(255,255,255,0.95)" />
          {/* Mouth */}
          <path d="M120,29 Q125,31 120,33" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    </div>
  );
}

export default function ThemeBackdrop() {
  return (
    <div className="backdrop-animations" aria-hidden="true">

      {/* ── DAY MODE : Flying Papers (10 sheets) ── */}
      <div className="papers-container">
        <Paper className="paper-1"  />
        <Paper className="paper-2"  />
        <Paper className="paper-3"  />
        <Paper className="paper-4"  />
        <Paper className="paper-5"  />
        <Paper className="paper-6"  />
        <Paper className="paper-7"  />
        <Paper className="paper-8"  />
        <Paper className="paper-9"  />
        <Paper className="paper-10" />
      </div>

      {/* ── NIGHT MODE : Neon Swimming Fishes (6 fish) ── */}
      <div className="fishes-container">
        <Fish className="fish-1" flip={false} />
        <Fish className="fish-2" flip={true}  />
        <Fish className="fish-3" flip={false} />
        <Fish className="fish-4" flip={true}  />
        <Fish className="fish-5" flip={false} />
        <Fish className="fish-6" flip={true}  />
      </div>

    </div>
  );
}
