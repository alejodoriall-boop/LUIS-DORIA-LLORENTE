import React from 'react';

interface MilkGlassIconProps {
  className?: string;
}

/**
 * Custom SVG Icon representing a Glass of Milk (Vaso de Leche) for Lechería Especializada
 */
export const MilkGlassIcon: React.FC<MilkGlassIconProps> = ({ className = 'w-5 h-5' }) => {
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
      {/* Outer Glass Contour */}
      <path
        d="M6 3.5L7.6 19.1C7.8 20.2 8.8 21 9.9 21H14.1C15.2 21 16.2 20.2 16.4 19.1L18 3.5"
        strokeWidth="2"
      />
      
      {/* Top Glass Rim */}
      <ellipse cx="12" cy="3.5" rx="6" ry="1.2" strokeWidth="2" />
      
      {/* Milk Surface Wave */}
      <path
        d="M6.5 8C8.5 7 10 9 12 8C14 7 15.5 9 17.5 8"
        strokeWidth="1.8"
      />

      {/* Milk Liquid Fill / Highlight Lines */}
      <path
        d="M9 12V17"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
      <path
        d="M14 10V15"
        strokeWidth="1.2"
        opacity="0.7"
      />
    </svg>
  );
};
