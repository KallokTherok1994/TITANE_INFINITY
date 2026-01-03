/**
 * TITANE∞ v26.2.0 — Button Component (Titanium Dark)
 * Interactive button with Titanium Dark design system
 * WCAG 2.2 AA compliant with 3px focus indicators
 * @license MIT
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  // Default (ghost) - transparent with hover
  default: 'bg-transparent text-titanium-text-secondary hover:bg-titanium-bg-interactive hover:text-titanium-text-primary',
  
  // Primary CTA - cool gray accent
  primary: 'bg-titanium-accent-cool text-titanium-bg-base hover:bg-titanium-accent-bright',
  
  // Destructive - error color
  destructive: 'bg-error-500 text-white hover:bg-error-700',
  
  // Outline - border with transparent background
  outline: 'border border-titanium-border-default bg-transparent text-titanium-text-primary hover:bg-titanium-bg-interactive hover:border-titanium-border-strong',
  
  // Ghost - minimal styling
  ghost: 'bg-transparent text-titanium-text-secondary hover:bg-titanium-bg-interactive hover:text-titanium-text-primary',
  
  // Link - text only with underline
  link: 'bg-transparent text-titanium-accent-cool underline-offset-4 hover:underline',
};

const sizeStyles = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3 py-1.5 text-sm',
  lg: 'h-11 px-6 py-3 text-lg',
  icon: 'h-10 w-10 p-0',
};

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded font-medium
        transition-colors duration-200
        focus-visible:outline-none focus-visible:shadow-focus
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
