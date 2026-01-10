/**
 * TITANE∞ v26.2.0 — Skeleton Loader Component (Titanium Dark)
 * Loading skeleton with Titanium Dark design system
 * Improves perceived performance during content loading
 * @license MIT
 */

import React from 'react';

export interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'message';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  'aria-label'?: string;
}

const variantStyles = {
  text: 'rounded h-4',
  circular: 'rounded-full',
  rectangular: 'rounded',
  message: 'rounded-lg h-16',
};

const animationStyles = {
  pulse: 'animate-pulse',
  wave: 'animate-shimmer',
  none: '',
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  'aria-label': ariaLabel = 'Loading',
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`
        bg-titanium-bg-interactive
        ${variantStyles[variant]}
        ${animationStyles[animation]}
        ${className}
      `}
      style={style}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Skeleton for chat message being typed
 */
export const MessageSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="flex gap-3 p-4" role="status" aria-label="Message loading">
      <div className="shrink-0">
        <SkeletonLoader variant="circular" width={40} height={40} />
      </div>
      <div className="flex-1 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLoader
            key={i}
            variant="text"
            width={i === lines - 1 ? '60%' : '100%'}
            height={16}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for conversation list
 */
export const ConversationListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-2">
          <SkeletonLoader variant="rectangular" height={60} />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
