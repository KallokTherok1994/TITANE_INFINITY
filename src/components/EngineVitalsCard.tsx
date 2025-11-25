/**
 * TITANE_INFINITY v14 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v14 — ENGINE VITALS CARD COMPONENT
 *   Component: Carte détaillée vitals moteur individuel
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useMemo } from 'react';
import './EngineVitalsCard.css';

export interface EngineVitalsCardProps {
  name: string;
  icon: string;
  health: number; // 0-100
  metrics: Array<{ label: string; value: string | number; color?: string }>;
  issues?: string[];
  className?: string;
}

export const EngineVitalsCard: React.FC<EngineVitalsCardProps> = React.memo(({
  name,
  icon,
  health,
  metrics,
  issues = [],
  className = '',
}) => {
  // Memoize health color calculation
  const healthColor = useMemo(() => {
    if (health >= 80) return 'var(--color-success-500)';
    if (health >= 60) return 'var(--color-warning-500)';
    return 'var(--color-danger-500)';
  }, [health]);

  // Memoize health status
  const healthStatus = useMemo(() => {
    if (health >= 80) return 'Optimal';
    if (health >= 60) return 'Degraded';
    return 'Critical';
  }, [health]);

  return (
    <div className={`engine-vitals-card ${className}`}>
      {/* Header */}
      <div className="engine-vitals-header">
        <div className="engine-vitals-name">
          <span className="engine-vitals-icon">{icon}</span>
          <span>{name}</span>
        </div>
        <div
          className="engine-vitals-health"
          style={{ color: healthColor }}
        >
          {health.toFixed(0)}%
        </div>
      </div>

      {/* Status Badge */}
      <div className="engine-vitals-status">
        <span
          className="engine-vitals-badge"
          style={{
            background: healthColor,
            color: 'var(--text-inverse)',
          }}
        >
          {healthStatus}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="engine-vitals-metrics">
        {metrics.map((metric, idx) => (
          <div key={idx} className="engine-vitals-metric">
            <span className="engine-vitals-metric-label">{metric.label}</span>
            <span
              className="engine-vitals-metric-value"
              style={{ color: metric.color || 'var(--text-primary)' }}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="engine-vitals-issues">
          <div className="engine-vitals-issues-title">⚠️ Issues</div>
          <ul className="engine-vitals-issues-list">
            {issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

EngineVitalsCard.displayName = 'EngineVitalsCard';
