/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v20 — MONITORING HEADER COMPONENT
 * HUD Header Premium avec Status Badge Intelligent
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import './MonitoringHeader.css';

export interface MonitoringHeaderProps {
  title?: string;
  subtitle?: string;
  onDebugClick?: () => void;
  debugActive?: boolean;
}

export const MonitoringHeader: React.FC<MonitoringHeaderProps> = ({
  title = "Monitoring & Debugging",
  subtitle = "Surveillance système avancée et diagnostics temps réel",
  onDebugClick,
  debugActive = false
}) => {
  return (
    <div className="monitoring-header">
      <div className="monitoring-header__content">
        <div className="monitoring-header__text">
          <h1 className="monitoring-header__title">
            <span className="monitoring-header__icon">⚡</span>
            {title}
          </h1>
          <p className="monitoring-header__subtitle">{subtitle}</p>
        </div>

        <div className="monitoring-header__actions">
          {onDebugClick && (
            <button
              className={`monitoring-header__debug-btn ${debugActive ? 'monitoring-header__debug-btn--active' : ''}`}
              onClick={onDebugClick}
              aria-label="Toggle debug mode"
            >
              <span className="monitoring-header__debug-icon">🔧</span>
              <span className="monitoring-header__debug-text">Debug Mode</span>
              {debugActive && (
                <span className="monitoring-header__debug-indicator" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Gradient Line */}
      <div className="monitoring-header__line" />
    </div>
  );
};
