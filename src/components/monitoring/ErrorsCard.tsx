/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v20 — ERRORS CARD (Elegant & Non-Intrusive)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import './ErrorsCard.css';

export interface ErrorsCardProps {
  errorCount: number;
  latestError?: string;
  errorType?: 'critical' | 'warning' | 'info';
  onViewErrors?: () => void;
}

export const ErrorsCard: React.FC<ErrorsCardProps> = ({
  errorCount,
  latestError,
  errorType = 'info',
  onViewErrors
}) => {
  const hasErrors = errorCount > 0;
  const severity = hasErrors ? errorType : 'info';

  return (
    <div className={`errors-card errors-card--${severity}`}>
      {/* Header */}
      <div className="errors-card__header">
        <div className="errors-card__icon">
          {hasErrors ? '⚠' : '✓'}
        </div>
        <div className="errors-card__header-text">
          <h3 className="errors-card__title">Erreurs & Alertes</h3>
          <p className="errors-card__subtitle">
            {hasErrors ? 'Détectées' : 'Aucune erreur'}
          </p>
        </div>
      </div>

      {/* Count Display */}
      <div className="errors-card__count">
        {errorCount}
      </div>

      {/* Latest Error Preview */}
      {latestError && hasErrors && (
        <div className="errors-card__preview">
          <div className="errors-card__preview-label">Dernière erreur</div>
          <div className="errors-card__preview-text">{latestError}</div>
        </div>
      )}

      {/* View All Button */}
      {hasErrors && onViewErrors && (
        <button className="errors-card__action" onClick={onViewErrors}>
          <span>Voir les détails</span>
          <span className="errors-card__action-arrow">→</span>
        </button>
      )}
    </div>
  );
};
