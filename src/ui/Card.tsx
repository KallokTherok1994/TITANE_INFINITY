/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.1 - Card Component
 * Container avec élévation et variants
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { colors, spacing, radius, shadows } from '@themes/tokens';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type CardVariant = 'solid' | 'glass' | 'translucent' | 'bordered';
export type CardElevation = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  elevation?: CardElevation;
  padding?: keyof typeof spacing;
  hoverable?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────

const baseStyles: React.CSSProperties = {
  borderRadius: radius.lg,
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
};

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  solid: {
    background: colors.rubis.surface.solid,
    border: `1px solid ${colors.neutral[800]}`,
  },
  glass: {
    background: colors.rubis.surface.glass,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${colors.rubis.primary[800]}`,
  },
  translucent: {
    background: colors.rubis.surface.translucent,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.rubis.primary[900]}`,
  },
  bordered: {
    background: 'transparent',
    border: `1px solid ${colors.neutral[700]}`,
  },
};

const elevationStyles: Record<CardElevation, React.CSSProperties> = {
  none: { boxShadow: 'none' },
  sm: { boxShadow: shadows.sm },
  md: { boxShadow: shadows.md },
  lg: { boxShadow: shadows.lg },
};

const hoverStyles: React.CSSProperties = {
  transform: 'translateY(-4px)',
  boxShadow: shadows.glowRubis,
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'solid',
      elevation = 'md',
      padding = 6,
      hoverable = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const cardStyles: React.CSSProperties = {
      ...baseStyles,
      ...variantStyles[variant],
      ...elevationStyles[elevation],
      padding: spacing[padding],
      ...style,
    };

    return (
      <div
        ref={ref}
        className={clsx('titane-card', className)}
        style={cardStyles}
        onMouseEnter={e => {
          if (hoverable) {
            Object.assign(e.currentTarget.style, hoverStyles);
          }
        }}
        onMouseLeave={e => {
          if (hoverable) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = elevationStyles[elevation].boxShadow || '';
          }
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
