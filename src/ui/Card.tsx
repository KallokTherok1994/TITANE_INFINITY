/**
 * TITANE∞ v8.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v8.0 - Card Component (Tailwind CSS)
 * Container avec élévation et variants
 * Migration: Inline styles → Tailwind classes
 * ═══════════════════════════════════════════════════════════════
 */

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

export type CardVariant = 'solid' | 'glass' | 'translucent' | 'bordered';
export type CardElevation = 'none' | 'sm' | 'md' | 'lg';
export type CardPadding = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  elevation?: CardElevation;
  padding?: CardPadding;
  hoverable?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// VARIANT CLASSES
// ─────────────────────────────────────────────────────────────────

const variantClasses: Record<CardVariant, string> = {
  solid: 'bg-bg-secondary border border-border-default',
  glass: 'glass-strong border border-violet-800',
  translucent: 'bg-bg-secondary/50 backdrop-blur-md border border-violet-900',
  bordered: 'bg-transparent border border-border-subtle',
};

const elevationClasses: Record<CardElevation, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

const paddingClasses: Record<CardPadding, string> = {
  0: 'p-0',
  1: 'p-1',
  2: 'p-2',
  3: 'p-3',
  4: 'p-4',
  5: 'p-5',
  6: 'p-6',
  8: 'p-8',
  10: 'p-10',
  12: 'p-12',
  16: 'p-16',
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
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg relative overflow-hidden',
          'transition-all duration-250 ease-out',
          // Variant styles
          variantClasses[variant],
          // Elevation styles
          elevationClasses[elevation],
          // Padding styles
          paddingClasses[padding],
          // Hoverable state
          hoverable && 'hover:-translate-y-1 hover:shadow-glow-violet cursor-pointer',
          // Custom className
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
