/**
 * TITANE∞ v∞ — TBadge Component
 * Super Prompt #3 - Phase 2: Badge/Tag design system
 *
 * Variants: default, success, warning, error, info
 * Sizes: sm, md, lg
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React from 'react';
import { colors, spacing, typography, borders } from '../tokens';

export type TBadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type TBadgeSize = 'sm' | 'md' | 'lg';

export interface TBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TBadgeVariant;
  size?: TBadgeSize;
  dot?: boolean;
}

const variantStyles: Record<TBadgeVariant, React.CSSProperties> = {
  default: {
    background: colors.titanium[700],
    color: colors.text.primary,
  },
  success: {
    background: `${colors.semantic.success}20`,
    color: colors.semantic.success,
    border: `${borders.width[1]} solid ${colors.semantic.success}40`,
  },
  warning: {
    background: `${colors.semantic.warning}20`,
    color: colors.semantic.warning,
    border: `${borders.width[1]} solid ${colors.semantic.warning}40`,
  },
  error: {
    background: `${colors.semantic.error}20`,
    color: colors.semantic.error,
    border: `${borders.width[1]} solid ${colors.semantic.error}40`,
  },
  info: {
    background: `${colors.semantic.info}20`,
    color: colors.semantic.info,
    border: `${borders.width[1]} solid ${colors.semantic.info}40`,
  },
};

const sizeStyles: Record<TBadgeSize, React.CSSProperties> = {
  sm: {
    padding: `${spacing[0.5]} ${spacing[2]}`,
    fontSize: typography.fontSize.xs,
    height: '20px',
  },
  md: {
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm,
    height: '24px',
  },
  lg: {
    padding: `${spacing[1.5]} ${spacing[4]}`,
    fontSize: typography.fontSize.base,
    height: '28px',
  },
};

export const TBadge: React.FC<TBadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  style,
  ...props
}) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing[1.5],
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.medium,
        borderRadius: borders.radius.full,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'currentColor',
          }}
        />
      )}
      {children}
    </span>
  );
};
