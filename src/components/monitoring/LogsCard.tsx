/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v20 — LOGS CARD (Compact & Élégant)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import './LogsCard.css';

export interface LogsCardProps {
  totalLogs: number;
  recentLogs?: string[];
  onViewAll?: () => void;
}

export const LogsCard: React.FC<LogsCardProps> = ({
  totalLogs,
  recentLogs = [],
  onViewAll,
}) => {
  return (
    <div className="logs-card">
      {/* Header */}
      <div className="logs-card__header">
        <div className="logs-card__icon">📋</div>
        <div className="logs-card__header-text">
          <h3 className="logs-card__title">Logs Système</h3>
          <p className="logs-card__subtitle">Entrées totales</p>
        </div>
      </div>

      {/* Count Display */}
      <div className="logs-card__count">{totalLogs.toLocaleString()}</div>

      {/* Recent Logs Preview */}
      {recentLogs.length > 0 && (
        <div className="logs-card__preview">
          {recentLogs.slice(0, 3).map((log, index) => (
            <div key={index} className="logs-card__log-item">
              <span className="logs-card__log-dot" />
              <span className="logs-card__log-text">{log}</span>
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      {onViewAll && (
        <button className="logs-card__action" onClick={onViewAll}>
          <span>Voir tous les logs</span>
          <span className="logs-card__action-arrow">→</span>
        </button>
      )}
    </div>
  );
};
