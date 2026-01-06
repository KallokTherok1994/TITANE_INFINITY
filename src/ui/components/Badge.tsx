/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Badge Component with Performance Optimizations
import { ReactNode, memo, useMemo } from 'react';
import { clsx } from 'clsx';
import './Badge.css';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: ReactNode;
  className?: string;
}

/**
 * Badge component for status indicators and labels.
 * Memoized for optimal re-render performance.
 */
export const Badge = memo(function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  const classes = useMemo(
    () => clsx('badge', `badge--${variant}`, className),
    [variant, className]
  );

  return <span className={classes}>{children}</span>;
});
