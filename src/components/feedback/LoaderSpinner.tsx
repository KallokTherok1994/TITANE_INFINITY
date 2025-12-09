/**
 * TITANE∞ v20.0 — LoaderSpinner Component
 * Super Prompt #2: Frontend Polish & UX Mastering
 * @license MIT
 */

import React from 'react';

export interface LoaderSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeStyles = {
  sm: { size: 16, border: 2 },
  md: { size: 24, border: 3 },
  lg: { size: 32, border: 4 },
};

/**
 * LoaderSpinner - Spinner réacteur TITANE∞
 * 
 * @example
 * ```tsx
 * <LoaderSpinner size="md" label="Chargement..." />
 * ```
 */
export function LoaderSpinner({ size = 'md', label }: LoaderSpinnerProps) {
  const sizeStyle = sizeStyles[size];

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className="animate-spin rounded-full"
        style={{
          width: `${sizeStyle.size}px`,
          height: `${sizeStyle.size}px`,
          border: `${sizeStyle.border}px solid var(--border, rgba(196,196,196,0.12))`,
          borderTopColor: 'var(--bg-primary, #727b81)',
        }}
        role="status"
        aria-label={label || 'Chargement en cours'}
      />

      {label && (
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
