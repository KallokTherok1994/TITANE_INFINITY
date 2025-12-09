/**
 * TITANE∞ v20.0 — IconButton Component
 * Super Prompt #2: Frontend Polish & UX Mastering
 * @license MIT
 */

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
  'aria-label': string; // Required pour a11y
}

const variantStyles = {
  default: {
    bg: 'var(--bg-primary, #727b81)',
    bgHover: 'var(--bg-primary-hover, #60676d)',
    color: 'var(--text-inverse, #ffffff)',
    border: undefined,
  },
  destructive: {
    bg: 'var(--bg-danger, #8b5f5f)',
    bgHover: 'var(--bg-danger-hover, #744e4e)',
    color: 'var(--text-inverse, #ffffff)',
    border: undefined,
  },
  outline: {
    bg: 'transparent',
    bgHover: 'var(--bg-hover, rgba(255,255,255,0.04))',
    color: 'var(--text-primary, #e0e0e0)',
    border: 'var(--border, rgba(196,196,196,0.12))',
  },
  secondary: {
    bg: 'var(--bg-secondary, #505050)',
    bgHover: 'var(--bg-secondary-hover, #707070)',
    color: 'var(--text-inverse, #ffffff)',
    border: undefined,
  },
  ghost: {
    bg: 'transparent',
    bgHover: 'var(--bg-hover, rgba(255,255,255,0.04))',
    color: 'var(--text-primary, #e0e0e0)',
    border: undefined,
  },
};

const sizeStyles = {
  sm: { size: 32, icon: 16 },
  md: { size: 40, icon: 20 },
  lg: { size: 48, icon: 24 },
};

/**
 * IconButton - Bouton circulaire/carré avec icône uniquement
 * 
 * @example
 * ```tsx
 * <IconButton
 *   icon={<SearchIcon size={20} />}
 *   aria-label="Rechercher"
 *   variant="ghost"
 *   size="md"
 *   onClick={handleSearch}
 * />
 * ```
 */
export function IconButton({
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  disabled,
  'aria-label': ariaLabel,
  ...props
}: IconButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-full
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-0
        focus:ring-blue-500
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      style={{
        width: `${sizeStyle.size}px`,
        height: `${sizeStyle.size}px`,
        background: variantStyle.bg,
        border: variantStyle.border ? `1px solid ${variantStyle.border}` : 'none',
        color: variantStyle.color,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = variantStyle.bgHover;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = variantStyle.bg;
      }}
      {...props}
    >
      <div style={{ width: `${sizeStyle.icon}px`, height: `${sizeStyle.icon}px` }}>
        {icon}
      </div>
    </button>
  );
}
