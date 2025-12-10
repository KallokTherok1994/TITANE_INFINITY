/**
 * TITANE∞ v20.0 — Skeleton Component
 * Super Prompt #2: Frontend Polish & UX Mastering
 * @license MIT
 */

import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect';
  width?: number | string;
  height?: number | string;
  className?: string;
}

/**
 * Skeleton - Skeleton loading avec shimmer
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="80%" height={20} />
 * <Skeleton variant="circle" width={48} height={48} />
 * <Skeleton variant="rect" width="100%" height={120} />
 * ```
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const baseStyle: React.CSSProperties = {
    background:
      'linear-gradient(90deg, var(--bg-surface, #181c21) 0%, var(--bg-panel, #101216) 50%, var(--bg-surface, #181c21) 100%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
    width: width || (variant === 'text' ? '100%' : variant === 'circle' ? 40 : '100%'),
    height: height || (variant === 'text' ? 16 : variant === 'circle' ? 40 : 80),
  };

  const variantStyle: React.CSSProperties =
    variant === 'circle'
      ? { borderRadius: '50%' }
      : variant === 'text'
        ? { borderRadius: '4px' }
        : { borderRadius: '8px' };

  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div
        className={`skeleton ${className}`}
        style={{ ...baseStyle, ...variantStyle }}
        aria-hidden="true"
      />
    </>
  );
}

/**
 * SkeletonGroup - Groupe de skeletons pour une liste
 */
export function SkeletonGroup({
  count = 3,
  children,
}: {
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{children}</div>
      ))}
    </div>
  );
}
