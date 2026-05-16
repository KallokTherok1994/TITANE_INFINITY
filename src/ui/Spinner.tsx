/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Spinner Component
 * Indicateur de chargement animé
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const sizeStyles: Record<SpinnerSize, { size: string; border: string }> = {
  sm: { size: '16px', border: '2px' },
  md: { size: '24px', border: '3px' },
  lg: { size: '32px', border: '4px' },
  xl: { size: '48px', border: '5px' },
};

const variantStyles: Record<SpinnerVariant, { color: string }> = {
  primary: { color: 'var(--color-violet-600)' },
  secondary: { color: 'var(--color-text-secondary)' },
  white: { color: '#ffffff' },
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', variant = 'primary', className, style, ...props }, ref) => {
    const { size: spinnerSize, border } = sizeStyles[size];
    const { color } = variantStyles[variant];

    const spinnerStyles: React.CSSProperties = {
      display: 'inline-block',
      width: spinnerSize,
      height: spinnerSize,
      border: `${border} solid var(--color-border-default)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      ...style,
    };

    return (
      <div
        ref={ref}
        className={clsx('titane-spinner', className)}
        style={spinnerStyles}
        role="status"
        aria-label="Chargement"
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';
