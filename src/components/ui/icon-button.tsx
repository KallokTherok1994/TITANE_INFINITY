/**
 * TITANE∞ v26.2.0 — IconButton Component (Titanium Dark)
 * Icon-only button with Titanium Dark design system
 * WCAG 2.2 AA compliant - requires aria-label
 * @license MIT
 */

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
  'aria-label': string; // Required for accessibility
}

const variantStyles = {
  // Default (ghost) - transparent with hover
  default:
    'bg-transparent text-titanium-text-secondary hover:bg-titanium-bg-interactive hover:text-titanium-text-primary',

  // Primary CTA - cool gray accent
  primary:
    'bg-titanium-accent-cool text-titanium-bg-base hover:bg-titanium-accent-bright',

  // Destructive - error color
  destructive: 'bg-error-500 text-white hover:bg-error-700',

  // Outline - border with transparent background
  outline:
    'border border-titanium-border-default bg-transparent text-titanium-text-primary hover:bg-titanium-bg-interactive hover:border-titanium-border-strong',

  // Ghost - minimal styling
  ghost:
    'bg-transparent text-titanium-text-secondary hover:bg-titanium-bg-interactive hover:text-titanium-text-primary',
};

const sizeStyles = {
  sm: 'h-8 w-8 p-1.5',
  md: 'h-10 w-10 p-2',
  lg: 'h-12 w-12 p-3',
};

/**
 * IconButton - Square/circular button with icon only
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon={<SearchIcon size={20} />}
 *   aria-label="Search"
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
  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        rounded-full
        transition-colors duration-200
        focus-visible:outline-none focus-visible:shadow-focus
        disabled:cursor-not-allowed disabled:opacity-50
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
