/**
 * TITANE∞ v20.0 — SectionHeader Component
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React from 'react';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * SectionHeader - En-tête de section DevTools
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title="Metrics"
 *   description="Temps réel des performances système"
 *   actions={<button>Refresh</button>}
 * />
 * ```
 */
export function SectionHeader({
  title,
  description,
  actions,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
