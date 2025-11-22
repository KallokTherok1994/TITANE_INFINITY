/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v20 — SYSTEM STATUS CARD (HUD Cognitif)
 * Badge Intelligent avec Glow Data-Driven
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import './SystemStatusCard.css';

export type SystemStatus = 'stable' | 'attention' | 'warning' | 'critical' | 'unknown';

export interface SystemStatusCardProps {
  status: SystemStatus;
  value?: string | number;
  subtitle?: string;
  lastUpdate?: string;
  metrics?: {
    cpu?: number;
    memory?: number;
    uptime?: string;
  };
}

const statusConfig = {
  stable: {
    label: 'Stable',
    color: 'emeraude',
    icon: '✓',
    glow: 'var(--titane-emeraude-glow)'
  },
  attention: {
    label: 'Attention',
    color: 'saphir',
    icon: '◉',
    glow: 'var(--titane-saphir-glow)'
  },
  warning: {
    label: 'Surcharge',
    color: 'helios',
    icon: '⚠',
    glow: 'var(--helios-glow)'
  },
  critical: {
    label: 'Critique',
    color: 'rubis',
    icon: '✕',
    glow: 'var(--titane-rubis-glow)'
  },
  unknown: {
    label: 'Inconnu',
    color: 'diamant',
    icon: '?',
    glow: 'rgba(255, 255, 255, 0.1)'
  }
};

export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  status,
  value,
  subtitle = "État du système",
  lastUpdate,
  metrics
}) => {
  const config = statusConfig[status];

  return (
    <div className={`system-status-card system-status-card--${config.color}`}>
      {/* Glow Background */}
      <div 
        className="system-status-card__glow"
        style={{ '--glow-color': config.glow } as React.CSSProperties}
      />

      {/* Header */}
      <div className="system-status-card__header">
        <span className="system-status-card__icon">{config.icon}</span>
        <div className="system-status-card__header-text">
          <h3 className="system-status-card__title">État Système</h3>
          <p className="system-status-card__subtitle">{subtitle}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`system-status-card__badge system-status-card__badge--${config.color}`}>
        <span className="system-status-card__badge-pulse" />
        <span className="system-status-card__badge-label">{config.label}</span>
      </div>

      {/* Value Display */}
      {value !== undefined && (
        <div className="system-status-card__value">
          {value}
        </div>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="system-status-card__metrics">
          {metrics.cpu !== undefined && (
            <div className="system-status-card__metric">
              <span className="system-status-card__metric-label">CPU</span>
              <span className="system-status-card__metric-value">{metrics.cpu}%</span>
            </div>
          )}
          {metrics.memory !== undefined && (
            <div className="system-status-card__metric">
              <span className="system-status-card__metric-label">RAM</span>
              <span className="system-status-card__metric-value">{metrics.memory}%</span>
            </div>
          )}
          {metrics.uptime && (
            <div className="system-status-card__metric">
              <span className="system-status-card__metric-label">Uptime</span>
              <span className="system-status-card__metric-value">{metrics.uptime}</span>
            </div>
          )}
        </div>
      )}

      {/* Last Update */}
      {lastUpdate && (
        <div className="system-status-card__footer">
          <span className="system-status-card__timestamp">
            Dernière mise à jour : {lastUpdate}
          </span>
        </div>
      )}
    </div>
  );
};
