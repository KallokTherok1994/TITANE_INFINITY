/**
 * TITANE∞ v26.4.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v26.4.0 - Card Component with Performance Optimizations
import { ReactNode, memo, useMemo, useCallback, KeyboardEvent } from 'react';
import { clsx } from 'clsx';
import './Card.css';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

/**
 * Card component with memoization for optimal re-render performance.
 * Supports hover states and click interactions with keyboard accessibility.
 */
export const Card = memo(function Card({
  title,
  subtitle,
  children,
  className,
  onClick,
  hoverable = false,
}: CardProps) {
  const classes = useMemo(
    () =>
      clsx(
        'card',
        hoverable && 'card--hoverable',
        onClick && 'card--clickable',
        className
      ),
    [hoverable, onClick, className]
  );

  // Keyboard accessibility for clickable cards
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <div
      className={classes}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {(title || subtitle) && (
        <div className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
      )}
      {children && <div className="card__content">{children}</div>}
    </div>
  );
});
