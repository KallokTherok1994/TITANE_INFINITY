/**
 * TITANE∞ v20.0 — EmptyState Component
 * Super Prompt #2: Frontend Polish & UX Mastering
 * @license MIT
 */

import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * EmptyState - État vide avec CTA optionnel
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<MessageSquare size={48} />}
 *   title="Aucune conversation"
 *   description="Posez une question à TITANE∞ pour démarrer"
 *   actionLabel="Nouvelle conversation"
 *   onAction={startNewChat}
 * />
 * ```
 */
export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div
          className="mb-4"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
        >
          {icon}
        </div>
      )}

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--text-primary, #e0e0e0)' }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="text-sm max-w-md mb-6"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
        >
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
                     focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
          style={{
            background: 'var(--bg-primary, #727b81)',
            color: 'var(--text-inverse, #ffffff)',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
