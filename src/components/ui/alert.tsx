/**
 * TITANE∞ v26.2.0 — Alert Component (Titanium Dark)
 * Alert/callout component with Titanium Dark design system
 * Monochrome default + semantic color variants
 * @license MIT
 */

import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
}

const variantStyles = {
  // Default - monochrome
  default: 'bg-titanium-bg-interactive border-titanium-border-default text-titanium-text-primary',
  
  // Semantic variants
  error: 'bg-error-100 border-error-500/30 text-error-700',
  success: 'bg-success-100 border-success-500/30 text-success-700',
  warning: 'bg-warning-100 border-warning-500/30 text-warning-700',
  info: 'bg-info-100 border-info-500/30 text-info-700',
};

export function Alert({
  variant = 'default',
  className = '',
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-lg border p-4 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={`mb-2 font-semibold leading-tight text-base ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
}

export function AlertDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={`text-sm leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
}
