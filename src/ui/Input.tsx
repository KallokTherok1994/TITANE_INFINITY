/**
 * TITANE∞ v8.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v8.0 - Input Component (Tailwind CSS)
 * Champ de saisie avec validation states
 * Migration: Inline styles → Tailwind classes
 * ═══════════════════════════════════════════════════════════════
 */

import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success' | 'warning';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  state?: InputState;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// VARIANT CLASSES
// ─────────────────────────────────────────────────────────────────

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm rounded',
  md: 'h-10 px-4 text-base rounded-md',
  lg: 'h-12 px-5 text-lg rounded-lg',
};

const stateClasses: Record<InputState, string> = {
  default: 'border-border-default focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30',
  error: 'border-error-500 ring-2 ring-error-500/20 focus:border-error-500 focus:ring-error-500/30',
  success: 'border-success-500 ring-2 ring-success-500/20 focus:border-success-500 focus:ring-success-500/30',
  warning: 'border-warning-500 ring-2 ring-warning-500/20 focus:border-warning-500 focus:ring-warning-500/30',
};

const helperTextColors: Record<InputState, string> = {
  default: 'text-text-muted',
  error: 'text-error-400',
  success: 'text-success-400',
  warning: 'text-warning-400',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      state = 'default',
      label,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto')}>
        {/* Label */}
        {label && (
          <label className="block mb-2 text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full bg-bg-secondary/50 border text-text-primary',
              'outline-none transition-all duration-250 ease-out font-inherit',
              // Size styles
              sizeClasses[size],
              // State styles
              stateClasses[state],
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              // Custom className
              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-text-muted pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helperText && (
          <div className={cn('mt-1 text-xs', helperTextColors[state])}>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
