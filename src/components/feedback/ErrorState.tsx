/**
 * TITANE∞ v20.0 — ErrorState Component
 * Super Prompt #2: Frontend Polish & UX Mastering
 * @license MIT
 */

import React from 'react';

export interface ErrorStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  details?: string;
  actionLabel?: string;
  onRetry?: () => void;
}

/**
 * ErrorState - Affichage d'erreur avec retry
 * 
 * @example
 * ```tsx
 * <ErrorState
 *   icon={<AlertTriangle size={48} />}
 *   title="Erreur de connexion"
 *   message="Impossible de joindre le Kernel Helios"
 *   details="Timeout after 30s"
 *   actionLabel="Réessayer"
 *   onRetry={handleRetry}
 * />
 * ```
 */
export function ErrorState({
  icon,
  title = 'Une erreur est survenue',
  message,
  details,
  actionLabel = 'Réessayer',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div
          className="mb-4"
          style={{ color: 'var(--text-danger, #8b5f5f)' }}
        >
          {icon}
        </div>
      )}

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--text-danger, #8b5f5f)' }}
      >
        {title}
      </h3>

      <p
        className="text-sm max-w-md mb-2"
        style={{ color: 'var(--text-primary, #e0e0e0)' }}
      >
        {message}
      </p>

      {details && (
        <p
          className="text-xs max-w-md mb-6 font-mono"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
        >
          {details}
        </p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
                     focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
          style={{
            background: 'var(--bg-danger, #8b5f5f)',
            color: 'var(--text-inverse, #ffffff)',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
