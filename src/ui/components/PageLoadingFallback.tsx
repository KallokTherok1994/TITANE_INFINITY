/**
 * TITANE∞ v19 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v19 - Page Loading Fallback for Suspense boundaries
import { Skeleton, SkeletonText, SkeletonAvatar } from './Skeleton';
import './PageLoadingFallback.css';

export interface PageLoadingFallbackProps {
  variant?: 'default' | 'chat' | 'dashboard' | 'settings';
  className?: string;
}

export const PageLoadingFallback = ({
  variant = 'default',
  className = '',
}: PageLoadingFallbackProps) => {
  const classes = [
    'page-loading-fallback',
    `page-loading-fallback--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="progressbar" aria-label="Chargement de la page">
      {variant === 'chat' && <ChatLoadingSkeleton />}
      {variant === 'dashboard' && <DashboardLoadingSkeleton />}
      {variant === 'settings' && <SettingsLoadingSkeleton />}
      {variant === 'default' && <DefaultLoadingSkeleton />}
    </div>
  );
};

const DefaultLoadingSkeleton = () => (
  <div className="page-loading-fallback__default">
    <div className="page-loading-fallback__logo">
      <div className="page-loading-fallback__logo-icon">
        <span className="page-loading-fallback__pulse">T</span>
      </div>
      <span className="page-loading-fallback__text">Chargement...</span>
    </div>
    <div className="page-loading-fallback__progress">
      <div className="page-loading-fallback__progress-bar" />
    </div>
  </div>
);

const ChatLoadingSkeleton = () => (
  <div className="page-loading-fallback__chat">
    {/* Chat Messages Skeleton */}
    <div className="page-loading-fallback__messages">
      {/* AI Message */}
      <div className="page-loading-fallback__message page-loading-fallback__message--ai">
        <SkeletonAvatar size="sm" />
        <div className="page-loading-fallback__message-content">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>

      {/* User Message */}
      <div className="page-loading-fallback__message page-loading-fallback__message--user">
        <div className="page-loading-fallback__message-content">
          <Skeleton variant="text" width="70%" />
        </div>
        <SkeletonAvatar size="sm" />
      </div>

      {/* AI Message */}
      <div className="page-loading-fallback__message page-loading-fallback__message--ai">
        <SkeletonAvatar size="sm" />
        <div className="page-loading-fallback__message-content">
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="75%" />
        </div>
      </div>
    </div>

    {/* Input Skeleton */}
    <div className="page-loading-fallback__input">
      <Skeleton variant="rounded" height={48} />
    </div>
  </div>
);

const DashboardLoadingSkeleton = () => (
  <div className="page-loading-fallback__dashboard">
    {/* Header */}
    <div className="page-loading-fallback__header">
      <Skeleton variant="text" width={200} height={32} />
      <Skeleton variant="circular" width={40} height={40} />
    </div>

    {/* Stats Cards */}
    <div className="page-loading-fallback__stats">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="page-loading-fallback__stat-card">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={28} />
        </div>
      ))}
    </div>

    {/* Main Content */}
    <div className="page-loading-fallback__grid">
      <div className="page-loading-fallback__card page-loading-fallback__card--large">
        <Skeleton variant="text" width={150} />
        <Skeleton variant="rectangular" height={200} />
      </div>
      <div className="page-loading-fallback__sidebar-cards">
        <div className="page-loading-fallback__card">
          <Skeleton variant="text" width={120} />
          <SkeletonText lines={3} />
        </div>
        <div className="page-loading-fallback__card">
          <Skeleton variant="text" width={100} />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  </div>
);

const SettingsLoadingSkeleton = () => (
  <div className="page-loading-fallback__settings">
    {/* Settings Header */}
    <div className="page-loading-fallback__settings-header">
      <Skeleton variant="text" width={180} height={28} />
    </div>

    {/* Settings Sections */}
    {[1, 2, 3].map(section => (
      <div key={section} className="page-loading-fallback__settings-section">
        <Skeleton variant="text" width={140} />
        <div className="page-loading-fallback__settings-items">
          {[1, 2, 3].map(item => (
            <div key={item} className="page-loading-fallback__settings-item">
              <div className="page-loading-fallback__settings-item-text">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" />
              </div>
              <Skeleton variant="rounded" width={48} height={24} />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
