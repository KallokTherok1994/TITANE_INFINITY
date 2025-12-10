/**
 * TITANE∞ v19.4 — Button Component
 * Interactive button with multiple variants
 * @license MIT
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

const variantStyles = {
  default: 'bg-blue-500 text-white hover:bg-blue-600',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600',
  ghost: 'hover:bg-gray-100 hover:text-gray-900',
  link: 'text-blue-500 underline-offset-4 hover:underline',
};

const sizeStyles = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

export function Button({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
