/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Badge Component
 * Badge de statut avec variants et tailles
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { colors, spacing, radius, fontSizes } from '@themes/tokens';

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
// STYLES
// ─────────────────────────────────────────────────────────────────

const baseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontWeight: 500,
  borderRadius: radius.full,
  whiteSpace: 'nowrap',
};

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  primary: {
    background: `${colors.rubis.primary[500]}33`,
    color: colors.rubis.primary[300],
    border: `1px solid ${colors.rubis.primary[600]}`,
  },
  success: {
    background: `${colors.semantic.success[500]}33`,
    color: colors.semantic.success[300],
    border: `1px solid ${colors.semantic.success[600]}`,
  },
  warning: {
    background: `${colors.semantic.warning[500]}33`,
    color: colors.semantic.warning[300],
    border: `1px solid ${colors.semantic.warning[600]}`,
  },
  error: {
    background: `${colors.semantic.error[500]}33`,
    color: colors.semantic.error[300],
    border: `1px solid ${colors.semantic.error[600]}`,
  },
  info: {
    background: `${colors.semantic.info[500]}33`,
    color: colors.semantic.info[300],
    border: `1px solid ${colors.semantic.info[600]}`,
  },
  neutral: {
    background: `${colors.neutral[700]}`,
    color: colors.neutral[300],
    border: `1px solid ${colors.neutral[600]}`,
  },
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: {
    padding: `${spacing[1]} ${spacing[2]}`,
    fontSize: fontSizes.xs,
    gap: spacing[1],
  },
  md: {
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: fontSizes.sm,
    gap: spacing[2],
  },
  lg: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: fontSizes.base,
    gap: spacing[2],
  },
};

const dotSizes: Record<BadgeSize, string> = {
  sm: '6px',
  md: '8px',
  lg: '10px',
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = 'primary', size = 'md', dot = false, className, style, children, ...props },
    ref
  ) => {
    const badgeStyles: React.CSSProperties = {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    const dotStyle: React.CSSProperties = {
      width: dotSizes[size],
      height: dotSizes[size],
      borderRadius: '50%',
      background: 'currentColor',
    };

    return (
      <span
        ref={ref}
        className={clsx('titane-badge', className)}
        style={badgeStyles}
        {...props}
      >
        {dot && <span style={dotStyle} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
