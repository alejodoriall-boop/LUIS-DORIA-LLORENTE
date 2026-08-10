import React from 'react';

interface GrassIconProps {
  className?: string;
}

/**
 * Custom SVG Icon representing Pasture Grass / Forage (Grass Blades) for Aforo de Pastos
 */
export const GrassIcon: React.FC<GrassIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Soil base */}
      <path d="M2 20H22" strokeWidth="2.2" />
      
      {/* Central tall grass blade */}
      <path d="M12 20C12 13 14 7 17 3C14.5 8 13.5 14 13 20" />
      
      {/* Left grass blade curved */}
      <path d="M7 20C7 14 4 9 1 6C4.5 10 6 15 6.5 20" />
      
      {/* Right grass blade curved */}
      <path d="M17 20C17 15 19.5 10 23 7C20 11 18.5 15 18 20" />

      {/* Inner accent blade left */}
      <path d="M9.5 20C9.5 15.5 8 12 6 9C8 12 8.8 16 9 20" />

      {/* Inner accent blade right */}
      <path d="M14.5 20C14.5 15.5 16 12 18 9C16 12 15.2 16 15 20" />
    </svg>
  );
};
