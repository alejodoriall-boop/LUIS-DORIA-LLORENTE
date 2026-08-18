import React from 'react';

export const BuffaloIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Curved Buffalo Horns (Bubalus bubalis - sweeps backward and outward) */}
      <path d="M4 8C2.5 5 3.5 2.5 7 3c3.5.5 4.5 3 5 5" />
      <path d="M20 8C21.5 5 20.5 2.5 17 3c-3.5.5-4.5 3-5 5" />
      
      {/* Head and Broad Muzzle */}
      <path d="M7 8h10v6c0 3.5-2 5.5-5 5.5s-5-2-5-5.5V8z" />
      <ellipse cx="12" cy="15.5" rx="3.5" ry="2" />
      <circle cx="10.5" cy="15.5" r="0.6" fill="currentColor" />
      <circle cx="13.5" cy="15.5" r="0.6" fill="currentColor" />

      {/* Eyes & Forehead */}
      <circle cx="9" cy="11" r="0.8" fill="currentColor" />
      <circle cx="15" cy="11" r="0.8" fill="currentColor" />
      <path d="M10 8.5h4" />

      {/* Horizontal Ears under horns */}
      <path d="M7 10C5 10 3 11.5 4 13c1 1.5 3 0 3-1" />
      <path d="M17 10C19 10 21 11.5 20 13c-1 1.5-3 0-3-1" />
    </svg>
  );
};
