/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v15 - Badge Component
import { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: ReactNode;
  className?: string;
}

export const Badge = ({ variant = 'default', children, className = '' }: BadgeProps) => {
  const classes = [
    'badge',
    `badge--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};
