/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — MODULE CARD V2 (Universal Component)
 *   Carte universelle pour tous les modules avec données mappées
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
import './ModuleCard.v2.css';

interface ModuleCardV2Props {
  title: string;
  data: {
    name?: string | number;
    status?: string | number;
    uptime?: string | number;
    last_tick?: string | number;
    message?: string | number;
    raw?: unknown;
  };
  icon?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export const ModuleCardV2: React.FC<ModuleCardV2Props> = ({ 
  title, 
  data, 
  icon = '📦',
  variant = 'default' 
}) => {
  return (
    <div className={`module-card-v2 module-card-v2--${variant}`}>
      <div className="module-card-v2__header">
        <span className="module-card-v2__icon">{icon}</span>
        <h3 className="module-card-v2__title">{title}</h3>
      </div>

      <div className="module-card-v2__info">
        {data.status && (
          <div className="module-card-v2__row">
            <span className="module-card-v2__label">Status :</span>
            <span className="module-card-v2__value">{data.status}</span>
          </div>
        )}

        {data.message && (
          <div className="module-card-v2__row">
            <span className="module-card-v2__label">Message :</span>
            <span className="module-card-v2__value">{data.message}</span>
          </div>
        )}

        {data.uptime !== undefined && (
          <div className="module-card-v2__row">
            <span className="module-card-v2__label">Uptime :</span>
            <span className="module-card-v2__value">{data.uptime}s</span>
          </div>
        )}

        {data.last_tick !== undefined && (
          <div className="module-card-v2__row">
            <span className="module-card-v2__label">Dernier Tick :</span>
            <span className="module-card-v2__value">{data.last_tick}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleCardV2;
