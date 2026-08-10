import React from 'react';

export interface CowIconProps {
  className?: string;
}

export const CowIcon: React.FC<CowIconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Left Horn */}
    <path d="M3 5C4.5 2.5 7 3.5 9 7" />
    {/* Right Horn */}
    <path d="M21 5C19.5 2.5 17 3.5 15 7" />
    {/* Left Ear */}
    <path d="M2.5 10.5C4.5 10 7 11.5 8 13" />
    {/* Right Ear */}
    <path d="M21.5 10.5C19.5 10 17 11.5 16 13" />
    {/* Head Contour */}
    <path d="M8 7H16C17.5 7 18.5 8.2 18.5 9.7V13.5C18.5 15.5 17.2 17 15.5 18L13.5 19.2C12.6 19.7 11.4 19.7 10.5 19.2L8.5 18C6.8 17 5.5 15.5 5.5 13.5V9.7C5.5 8.2 6.5 7 8 7Z" />
    {/* Muzzle / Snout Line */}
    <path d="M7 14.5C7 14 8 13.5 12 13.5C16 13.5 17 14 17 14.5V16C17 17.5 15.5 18.5 12 18.5C8.5 18.5 7 17.5 7 16V14.5Z" />
    {/* Nostrils */}
    <circle cx="9.8" cy="16.2" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="14.2" cy="16.2" r="0.8" fill="currentColor" stroke="none" />
    {/* Eyes */}
    <circle cx="9" cy="10.8" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);
