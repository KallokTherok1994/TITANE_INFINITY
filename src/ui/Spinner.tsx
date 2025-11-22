/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Spinner Component
 * Indicateur de chargement animé
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { colors } from '@themes/tokens';

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
  primary: { color: colors.rubis.primary[500] },
  secondary: { color: colors.rubis.accent[500] },
  white: { color: colors.neutral[100] },
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
      border: `${border} solid ${colors.neutral[800]}`,
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
