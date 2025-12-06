/**
 * TITANE∞ v19.4 — Badge Component
 * Small label/tag component for status indicators
 * @license MIT
 */

import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'
  children: React.ReactNode
}

const variantStyles = {
  default: 'bg-blue-500 text-white',
  secondary: 'bg-gray-500 text-white',
  destructive: 'bg-red-500 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-gray-900',
  outline: 'border border-gray-300 text-gray-700 bg-transparent'
}

export function Badge({ 
  variant = 'default', 
  className = '', 
  children, 
  ...props 
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
