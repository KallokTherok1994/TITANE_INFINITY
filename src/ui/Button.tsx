/**
 * TITANE∞ v8.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v8.0 - Button Component (Tailwind CSS)
 * Primitive UI avec variants, sizes, states
 * Migration: Inline styles → Tailwind classes
 * ═══════════════════════════════════════════════════════════════
 */

import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────
// VARIANT CLASSES
// ─────────────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-md hover:shadow-glow-violet hover:-translate-y-0.5',
  secondary:
    'bg-bg-tertiary/50 text-violet-400 border border-violet-700 backdrop-blur-md hover:bg-bg-tertiary hover:border-violet-500',
  ghost:
    'bg-transparent text-text-secondary border border-transparent hover:bg-bg-tertiary hover:border-border-default',
  danger:
    'bg-gradient-to-br from-error-500 to-error-600 text-white shadow-md hover:shadow-error hover:-translate-y-0.5',
  outline:
    'bg-transparent text-text-primary border border-border-default hover:bg-bg-tertiary hover:border-border-strong',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-4 text-sm rounded-md',
  md: 'h-10 px-6 text-base rounded-md',
  lg: 'h-12 px-8 text-lg rounded-lg',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-in-out',
          'cursor-pointer select-none relative',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
          // Variant styles
          variantClasses[variant],
          // Size styles
          sizeClasses[size],
          // Full width
          fullWidth && 'w-full',
          // Disabled state
          (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          // Custom className
          className
        )}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <span className="inline-block mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}

        {/* Left Icon */}
        {!loading && leftIcon && (
          <span className="mr-2 flex items-center">{leftIcon}</span>
        )}

        {/* Content */}
        {children}

        {/* Right Icon */}
        {!loading && rightIcon && (
          <span className="ml-2 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
