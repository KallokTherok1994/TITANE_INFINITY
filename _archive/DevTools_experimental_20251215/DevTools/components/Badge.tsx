/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — Badge Component                                 ║
 * ║   Status badges for engines, logs, etc.                            ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import './Badge.css';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};
