/**
 * TITANE∞ v26.2.0 — Badge Component (Titanium Dark)
 * Small label/tag component with Titanium Dark design system
 * Monochrome approach with semantic color variants
 * @license MIT
 */

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'default';
  children: React.ReactNode;
}

const variantStyles = {
  // Default - monochrome
  default:
    'bg-titanium-bg-interactive text-titanium-text-primary border border-titanium-border-default',

  // Semantic colors (for status only)
  success: 'bg-success-100 text-success-700 border border-success-500/30',
  error: 'bg-error-100 text-error-700 border border-error-500/30',
  warning: 'bg-warning-100 text-warning-700 border border-warning-500/30',
  info: 'bg-info-100 text-info-700 border border-info-500/30',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  default: 'px-3 py-1 text-sm',
};

export function Badge({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center 
        rounded-full 
        font-medium 
        transition-colors
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
