// TITANE∞ v12 - Badge Component
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
