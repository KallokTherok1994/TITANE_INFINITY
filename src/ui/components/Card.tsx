/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v12 - Card Component
import { ReactNode } from 'react';
import './Card.css';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card = ({
  title,
  subtitle,
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) => {
  const classes = [
    'card',
    hoverable && 'card--hoverable',
    onClick && 'card--clickable',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {(title || subtitle) && (
        <div className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
      )}
      {children && <div className="card__content">{children}</div>}
    </div>
  );
};
