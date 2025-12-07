/**
 * TITANE∞ v19 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v19 - Skeleton Loading Component
import './Skeleton.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const Skeleton = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
}: SkeletonProps) => {
  const classes = [
    'skeleton',
    `skeleton--${variant}`,
    animation !== 'none' && `skeleton--${animation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <span className={classes} style={style} aria-hidden="true" data-testid="skeleton" />
  );
};

// Preset skeleton compositions
export interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonText = ({
  lines = 3,
  lastLineWidth = '60%',
  animation = 'pulse',
  className = '',
}: SkeletonTextProps) => {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          animation={animation}
        />
      ))}
    </div>
  );
};

export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonAvatar = ({
  size = 'md',
  animation = 'pulse',
  className = '',
}: SkeletonAvatarProps) => {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return (
    <Skeleton
      variant="circular"
      width={sizeMap[size]}
      height={sizeMap[size]}
      animation={animation}
      className={className}
    />
  );
};

export interface SkeletonCardProps {
  showAvatar?: boolean;
  showImage?: boolean;
  textLines?: number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonCard = ({
  showAvatar = true,
  showImage = false,
  textLines = 3,
  animation = 'pulse',
  className = '',
}: SkeletonCardProps) => {
  return (
    <div className={`skeleton-card ${className}`}>
      {showImage && (
        <Skeleton variant="rectangular" width="100%" height={180} animation={animation} />
      )}
      <div className="skeleton-card__body">
        {showAvatar && (
          <div className="skeleton-card__header">
            <SkeletonAvatar size="md" animation={animation} />
            <div className="skeleton-card__meta">
              <Skeleton variant="text" width="120px" animation={animation} />
              <Skeleton variant="text" width="80px" animation={animation} />
            </div>
          </div>
        )}
        <SkeletonText lines={textLines} animation={animation} />
      </div>
    </div>
  );
};

// Full page loading skeleton
export interface SkeletonPageProps {
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonPage = ({
  animation = 'pulse',
  className = '',
}: SkeletonPageProps) => {
  return (
    <div className={`skeleton-page ${className}`}>
      <div className="skeleton-page__header">
        <Skeleton variant="rounded" width={140} height={32} animation={animation} />
        <Skeleton variant="circular" width={40} height={40} animation={animation} />
      </div>
      <div className="skeleton-page__content">
        <SkeletonCard showImage textLines={4} animation={animation} />
        <div className="skeleton-page__sidebar">
          <Skeleton variant="rounded" width="100%" height={200} animation={animation} />
          <SkeletonText lines={5} animation={animation} />
        </div>
      </div>
    </div>
  );
};
