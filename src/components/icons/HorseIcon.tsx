import React from 'react';

export interface HorseIconProps {
  className?: string;
}

export const HorseIcon: React.FC<HorseIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Horse Head Silhouette with Ears and Muzzle */}
    <path d="M19 19c0-2-1.5-4-3-5l-1-4-2-6-4 1-1 4-3 5c-1 1.5-1.5 3.5-1.5 5.5v1.5h15.5V19z" />
    <path d="M8 5l1.5-3 2 1.5" />
    <path d="M10 13c1.5 0 2.5 1 2.5 2s-1 2-2.5 2" />
    <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
