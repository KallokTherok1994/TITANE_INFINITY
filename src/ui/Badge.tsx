/**
 * TITANE∞ v8.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v8.0 - Badge Component (Tailwind CSS)
 * Badge de statut avec variants et tailles
 * Migration: Inline styles → Tailwind classes
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// VARIANT CLASSES
// ─────────────────────────────────────────────────────────────────

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-violet-500/20 text-violet-300 border border-violet-600/30',
  success: 'bg-success-500/20 text-success-300 border border-success-600/30',
  warning: 'bg-warning-500/20 text-warning-300 border border-warning-600/30',
  error: 'bg-error-500/20 text-error-300 border border-error-600/30',
  info: 'bg-info-500/20 text-info-300 border border-info-600/30',
  neutral: 'bg-bg-elevated text-text-muted border border-border-default',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-2',
  lg: 'px-4 py-2 text-base gap-2',
};

const dotSizes: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      dot = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center font-medium rounded-full whitespace-nowrap',
          // Variant styles
          variantClasses[variant],
          // Size styles
          sizeClasses[size],
          // Custom className
          className
        )}
        {...props}
      >
        {/* Dot Indicator */}
        {dot && (
          <span
            className={cn(
              'rounded-full bg-current',
              dotSizes[size]
            )}
          />
        )}

        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
