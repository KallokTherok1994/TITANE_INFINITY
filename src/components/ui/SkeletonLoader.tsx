/**
 * TITANE∞ v26.2.3 — Skeleton Loader Component
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Composant de chargement pour améliorer la performance perçue
 */

import React from 'react';
import './SkeletonLoader.css';

export interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'message';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
  'aria-label'?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'wave',
  className = '',
  'aria-label': ariaLabel = 'Chargement en cours',
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`skeleton skeleton--${variant} skeleton--${animation} ${className}`}
      style={style}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    >
      <span className="skeleton__sr-only">Chargement...</span>
    </div>
  );
};

/**
 * Skeleton pour message de chat en cours de réponse
 */
export const MessageSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="message-skeleton" role="status" aria-label="Message en cours de chargement">
      <div className="message-skeleton__avatar">
        <SkeletonLoader variant="circular" width={40} height={40} />
      </div>
      <div className="message-skeleton__content">
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
 * Skeleton pour liste de conversations
 */
export const ConversationListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="conversation-list-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="conversation-item-skeleton">
          <SkeletonLoader variant="rectangular" height={60} />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
