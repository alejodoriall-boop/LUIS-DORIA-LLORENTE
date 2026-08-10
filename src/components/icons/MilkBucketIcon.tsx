import React from 'react';

interface MilkBucketIconProps {
  className?: string;
}

/**
 * Custom SVG Icon representing a Milk Bucket / Pail (Balde de Leche) for Lechería Especializada
 */
export const MilkBucketIcon: React.FC<MilkBucketIconProps> = ({ className = 'w-5 h-5' }) => {
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
      {/* Curved Overhead Metal Handle */}
      <path d="M6 9C6 4.5 8.7 2.5 12 2.5C15.3 2.5 18 4.5 18 9" strokeWidth="1.8" />
      
      {/* Top Rim of Bucket */}
      <ellipse cx="12" cy="9" rx="7" ry="2" strokeWidth="2" />
      
      {/* Tapered Bucket Body */}
      <path d="M5 9L6.8 19.2C6.9 19.7 7.3 20.1 7.8 20.1H16.2C16.7 20.1 17.1 19.7 17.2 19.2L19 9" strokeWidth="2" />
      
      {/* Metallic Rim Ring / Ridge */}
      <path d="M5.8 14H18.2" strokeWidth="1.5" />
      
      {/* Handle Rivets / Ears */}
      <circle cx="5" cy="9" r="1" fill="currentColor" />
      <circle cx="19" cy="9" r="1" fill="currentColor" />
    </svg>
  );
};
