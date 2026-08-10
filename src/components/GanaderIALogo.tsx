import React from 'react';

interface GanaderIALogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'banner';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showSubtitle?: boolean;
}

export const GanaderIALogo: React.FC<GanaderIALogoProps> = ({
  variant = 'compact',
  theme = 'auto',
  className = '',
  size = 'md',
  onClick,
  showSubtitle,
}) => {
  // Sizing definitions for icon badge
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  // Theme color mapping
  const textColor =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-[#012d1d]'
      : 'text-[#012d1d] dark:text-white';

  const subtitleColor =
    theme === 'dark'
      ? 'text-white/80'
      : theme === 'light'
      ? 'text-[#2d6a4f]'
      : 'text-[#2d6a4f] dark:text-white/80';

  const isBanner = variant === 'banner';
  const shouldDisplaySubtitle = showSubtitle ?? (variant === 'full' || variant === 'banner');

  return (
    <div
      onClick={onClick}
      className={`inline-flex ${
        isBanner ? 'flex-col items-center text-center' : 'items-center gap-3'
      } select-none ${
        onClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''
      } ${className}`}
    >
      {/* Golden Circle Emblem with Pure Zebu/Brahman Line Art (NO AI features) */}
      <div
        className={`relative shrink-0 flex items-center justify-center ${iconSizes[size]} ${
          isBanner ? 'mb-2' : ''
        }`}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm">
          {/* Golden Yellow Circle */}
          <circle cx="100" cy="100" r="92" fill="#f2a900" />

          {/* Pure Zebu / Brahman Bovine Line Art */}
          <g
            fill="none"
            stroke="#012d1d"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Top Crown / Dome */}
            <path d="M72,38 C84,32 116,32 128,38" />
            <path d="M80,44 C90,40 110,40 120,44" />

            {/* Left Drooping Brahman Ear */}
            <path d="M68,52 C42,58 12,88 18,118 C24,136 46,122 70,92" />
            <path d="M26,88 C34,106 48,114 62,106" />

            {/* Right Drooping Brahman Ear */}
            <path d="M132,52 C158,58 188,88 182,118 C176,136 154,122 130,92" />
            <path d="M174,88 C166,106 152,114 138,106" />

            {/* Head Contour & Facial Ridges */}
            <path d="M72,62 C70,90 76,120 78,132" />
            <path d="M128,62 C130,90 124,120 122,132" />
            <path d="M80,78 C82,100 84,120 86,132" />
            <path d="M120,78 C118,100 116,120 114,132" />

            {/* Forehead Curves */}
            <path d="M80,68 C92,74 108,74 120,68" />

            {/* Slanted Eyes */}
            <path
              d="M72,80 C76,74 84,78 82,84 C80,88 74,86 72,80 Z"
              fill="#012d1d"
            />
            <path
              d="M128,80 C124,74 116,78 118,84 C120,88 126,86 128,80 Z"
              fill="#012d1d"
            />

            {/* Muzzle & Snout Pad */}
            <path d="M78,132 C84,122 116,122 122,132 C126,142 118,154 100,154 C82,154 74,142 78,132 Z" />
            <ellipse cx="90" cy="140" rx="3.5" ry="5" fill="#012d1d" />
            <ellipse cx="110" cy="140" rx="3.5" ry="5" fill="#012d1d" />
            <path d="M92,148 C96,150 104,150 108,148" />

            {/* Chin / Jaw Fold */}
            <path d="M86,154 C92,170 100,182 100,182 C100,182 108,170 114,154" />

            {/* Neck / Dewlap Lines Flowing Down */}
            <path d="M58,110 C48,136 38,165 36,190" />
            <path d="M68,122 C60,148 54,172 52,192" />
            <path d="M76,134 C72,156 68,178 66,194" />
            <path d="M124,134 C128,156 132,178 134,194" />
            <path d="M132,122 C140,148 146,172 148,192" />
            <path d="M142,110 C152,136 162,165 164,190" />
          </g>
        </svg>
      </div>

      {/* Typography: "GanaderIA." + Subtitle */}
      {variant !== 'icon' && (
        <div
          className={`flex flex-col leading-none ${
            isBanner ? 'items-center text-center' : ''
          }`}
        >
          <div className={`font-black tracking-tight ${textSizes[size]} ${textColor}`}>
            Ganader<span className="text-[#f2a900]">IA.</span>
          </div>

          {shouldDisplaySubtitle && (
            <span
              className={`font-medium tracking-wide ${
                isBanner ? 'mt-1.5' : 'mt-0.5'
              } ${subSizes[size]} ${subtitleColor}`}
            >
              Software Inteligente para Ganadería
            </span>
          )}
        </div>
      )}
    </div>
  );
};

