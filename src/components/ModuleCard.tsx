/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — MODULE CARD COMPONENT
 *   Composant moderne pour affichage des modules système
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { safeDisplay, extractNumber, extractString, formatValue, getStatusVariant } from '../utils/dataUtils';
import './ModuleCard.css';

export interface ModuleCardProps {
  title: string;
  icon?: string;
  value?: unknown;
  unit?: string;
  status?: unknown;
  subtitle?: string;
  metrics?: Record<string, unknown>;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  icon = '⚡',
  value,
  unit,
  status,
  subtitle,
  metrics,
  variant,
  onClick,
}) => {
  // Sérialisation sécurisée des données
  const numericValue = extractNumber(value, 0);
  const displayValue = typeof value === 'number' ? formatValue(numericValue, unit) : safeDisplay(value);
  const displayStatus = extractString(status, 'Actif');
  
  // Détermination automatique de la variante si non fournie
  const autoVariant = variant || (typeof value === 'number' ? getStatusVariant(numericValue) : 'default');

  return (
    <div 
      className={`module-card module-card--${autoVariant}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      <div className="module-card__header">
        <span className="module-card__icon">{icon}</span>
        <div className="module-card__title-group">
          <h3 className="module-card__title">{title}</h3>
          {subtitle && <p className="module-card__subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* Valeur principale */}
      {value !== undefined && (
        <div className="module-card__value">
          {displayValue}
        </div>
      )}

      {/* Status badge */}
      {status !== undefined && (
        <div className={`module-card__status module-card__status--${autoVariant}`}>
          {displayStatus}
        </div>
      )}

      {/* Métriques additionnelles */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="module-card__metrics">
          {Object.entries(metrics).slice(0, 3).map(([key, val]) => (
            <div key={key} className="module-card__metric">
              <span className="module-card__metric-label">{key}:</span>
              <span className="module-card__metric-value">{safeDisplay(val)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Hover overlay */}
      {onClick && <div className="module-card__overlay" />}
    </div>
  );
};
