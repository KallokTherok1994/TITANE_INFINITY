/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

// TITANE∞ v30.0.0 - Page Loading Fallback for Suspense boundaries
import React, { useEffect, useState } from 'react';
import { Skeleton, SkeletonText, SkeletonAvatar } from './Skeleton';
import './PageLoadingFallback.css';

export interface PageLoadingFallbackProps {
  variant?: 'default' | 'chat' | 'dashboard' | 'settings';
  className?: string;
}

const LONG_LOADING_TIMEOUT_MS = 12000;
const AUTO_RECOVERY_TIMEOUT_MS = 22000;
const AUTO_RECOVERY_KEY = 'titane_suspense_recovery_once';
const AUTO_RECOVERY_WINDOW_MS = 5 * 60 * 1000;

export const PageLoadingFallback = ({
  variant = 'default',
  className = '',
}: PageLoadingFallbackProps) => {
  const [isLongLoading, setIsLongLoading] = useState(false);
  const [autoRecoveryBlocked, setAutoRecoveryBlocked] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLongLoading(true);
    }, LONG_LOADING_TIMEOUT_MS);

    const isTauriDesktop =
      typeof window !== 'undefined' &&
      Boolean(
        (window as Window & { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown })
          .__TAURI__ ||
        (window as Window & { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown })
          .__TAURI_INTERNALS__
      );

    if (isTauriDesktop) {
      return () => {
        window.clearTimeout(timer);
      };
    }

    const autoRecoveryTimer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(AUTO_RECOVERY_KEY);
        const previousAttempt = raw ? Number(raw) : NaN;
        const hasRecentAttempt =
          Number.isFinite(previousAttempt) &&
          Date.now() - previousAttempt < AUTO_RECOVERY_WINDOW_MS;

        if (!hasRecentAttempt) {
          window.localStorage.setItem(AUTO_RECOVERY_KEY, String(Date.now()));
          window.location.reload();
          return;
        }

        setAutoRecoveryBlocked(true);
      } catch {
        window.location.reload();
      }
    }, AUTO_RECOVERY_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(autoRecoveryTimer);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

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

      {isLongLoading && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(0, 0, 0, 0.35)',
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            maxWidth: 520,
          }}
          data-testid="long-loading-warning"
        >
          <div style={{ marginBottom: '0.5rem' }}>
            Chargement plus long que prévu. Vérification en cours…
          </div>
          {autoRecoveryBlocked && (
            <div style={{ marginBottom: '0.5rem' }}>
              Récupération automatique déjà tentée. Relance manuelle recommandée.
            </div>
          )}
          {!autoRecoveryBlocked &&
            typeof window !== 'undefined' &&
            Boolean(
              (window as Window & { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown })
                .__TAURI__ ||
              (window as Window & { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown })
                .__TAURI_INTERNALS__
            ) && (
              <div style={{ marginBottom: '0.5rem' }}>
                En mode desktop Tauri, aucun rechargement automatique n’est forcé pour
                éviter les boucles de redémarrage silencieuses.
              </div>
            )}
          <button
            type="button"
            onClick={handleReload}
            style={{
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: '0.4rem',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              padding: '0.35rem 0.75rem',
              cursor: 'pointer',
            }}
          >
            Recharger l’interface
          </button>
        </div>
      )}
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
