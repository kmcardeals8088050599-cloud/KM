import React from 'react';

interface KmLogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'gold' | 'white' | 'dark' | 'amber';
  showSubtext?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const KmLogo: React.FC<KmLogoProps> = ({
  className = '',
  iconOnly = false,
  variant = 'gold',
  showSubtext = true,
  size = 'md'
}) => {
  // Color configuration matching exact user specification
  let primaryFill = '#0f172a'; // Pure rich dark slate/black as requested
  let textPrimary = '#0f172a'; // Deep slate
  let textSecondary = '#64748b'; // Slate muted

  if (variant === 'white') {
    primaryFill = '#ffffff';
    textPrimary = '#ffffff';
    textSecondary = '#94a3b8';
  } else if (variant === 'dark') {
    primaryFill = '#0f172a';
    textPrimary = '#0f172a';
    textSecondary = '#475569';
  } else if (variant === 'amber' || variant === 'gold') {
    primaryFill = '#0f172a';
    textPrimary = '#0f172a';
    textSecondary = '#475569';
  }

  // Dimensions
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  }[size];

  const titleSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl sm:text-4xl'
  }[size];

  const subtextSizes = {
    xs: 'text-[7px]',
    sm: 'text-[8px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-[13px]'
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Exact GM Monogram Logo matching user image */}
      <div className={`relative shrink-0 flex items-center justify-center ${iconDimensions}`}>
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full filter drop-shadow-[0_1px_4px_rgba(15,23,42,0.1)] transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* G (Left Half) */}
          <path
            d="M 100 550 V 380 L 485 100 V 550 Z
               M 485 170 L 320 290 V 360 L 485 240 Z
               M 170 480 H 415 V 410 H 340 L 260 335 L 170 400 Z"
            fill={primaryFill}
            fillRule="evenodd"
          />

          {/* M (Right Half) */}
          <path
            d="M 515 100 L 900 380 V 550 H 515 Z
               M 580 550 V 217 L 645 264 V 550 Z
               M 710 550 V 311 L 775 358 V 550 Z"
            fill={primaryFill}
            fillRule="evenodd"
          />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col text-left justify-center">
          <span
            className={`font-black tracking-tight leading-none  ${titleSizes}`}
            style={{ color: textPrimary }}
          >
            KM CAR DEALS
          </span>
          {showSubtext && (
            <span
              className={`uppercase font-extrabold tracking-[0.22em] mt-1 leading-none ${subtextSizes}`}
              style={{ color: textSecondary }}
            >
              MULTI BRAND PRE OWNED CARS
            </span>
          )}
        </div>
      )}
    </div>
  );
};
