/**
 * TITANE∞ v19.4 — Alert Component
 * Simple alert/callout component for displaying important messages
 * @license MIT
 */

import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-900 border-gray-300',
  destructive: 'bg-red-50 text-red-900 border-red-300',
  success: 'bg-green-50 text-green-900 border-green-300',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-300',
  info: 'bg-blue-50 text-blue-900 border-blue-300',
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
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
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
    <div className={`text-sm opacity-90 ${className}`} {...props}>
      {children}
    </div>
  );
}
