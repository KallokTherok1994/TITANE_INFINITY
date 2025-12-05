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
import { colors, spacing, typography, radius, text } from '../tokens';

export type TBadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type TBadgeSize = 'sm' | 'md' | 'lg';

export interface TBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TBadgeVariant;
  size?: TBadgeSize;
  dot?: boolean;
}

const variantStyles: Record<TBadgeVariant, React.CSSProperties> = {
  default: {
    background: colors.primary[700],
    color: text.primary,
  },
  success: {
    background: `${colors.semantic.success[500]}20`,
    color: colors.semantic.success[600],
    border: `1px solid ${colors.semantic.success[500]}40`,
  },
  warning: {
    background: `${colors.semantic.warning[500]}20`,
    color: colors.semantic.warning[600],
    border: `1px solid ${colors.semantic.warning[500]}40`,
  },
  error: {
    background: `${colors.semantic.danger[500]}20`,
    color: colors.semantic.danger[600],
    border: `1px solid ${colors.semantic.danger[500]}40`,
  },
  info: {
    background: `${colors.semantic.info[500]}20`,
    color: colors.semantic.info[600],
    border: `1px solid ${colors.semantic.info[500]}40`,
  },
};

const sizeStyles: Record<TBadgeSize, React.CSSProperties> = {
  sm: {
    padding: `${spacing[1]} ${spacing[2]}`,
    fontSize: typography.fontSize.xs,
    height: '20px',
  },
  md: {
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm,
    height: '24px',
  },
  lg: {
    padding: `${spacing[2]} ${spacing[4]}`,
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
        gap: spacing[2],
        fontFamily: typography.fontFamily.sans,
        fontWeight: typography.fontWeight.medium,
        borderRadius: radius.full,
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
