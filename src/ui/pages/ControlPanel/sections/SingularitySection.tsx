/**
 * TITANE∞ OS v24.7 - Section Singularité
 * Contrôle du moteur de singularité
 * Optimisé avec useCallback et useMemo
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { secureInvoke } from '@/lib/security';

interface SingularityStatus {
  active: boolean;
  power_level: number;
  iterations: number;
  phase: string;
}

export const SingularitySection: React.FC = () => {
  const [status, setStatus] = useState<SingularityStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const singularityStatus = await secureInvoke<SingularityStatus>(
        'get_singularity_status'
      );
      setStatus(singularityStatus);
    } catch (error) {
      console.error('Erreur chargement statut singularité:', error);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const toggleSingularity = useCallback(async () => {
    setLoading(true);
    try {
      await secureInvoke('toggle_singularity');
      await loadStatus();
    } catch (error) {
      console.error('Erreur toggle singularité:', error);
    } finally {
      setLoading(false);
    }
  }, [loadStatus]);

  const buttonText = useMemo(() => {
    if (loading) return '⏳ Traitement...';
    return status?.active ? '⏸️ Désactiver' : '▶️ Activer';
  }, [loading, status?.active]);

  const progressStyle = useMemo(
    () => ({ width: `${status?.power_level || 0}%` }),
    [status?.power_level]
  );

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Singularité</h2>
        <button
          className={`cp-button ${status?.active ? 'danger' : ''}`}
          onClick={toggleSingularity}
          disabled={loading}
          aria-busy={loading}
          aria-pressed={status?.active}
        >
          {buttonText}
        </button>
      </div>

      <div className="cp-grid cp-grid-2">
        <div className="cp-card cp-stat-card">
          <span className="cp-stat-label">État Singularité</span>
          <span className={`cp-badge ${status?.active ? 'success' : ''}`} role="status">
            <span className="cp-badge-dot" />
            {status?.active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className="cp-card cp-stat-card">
          <span className="cp-stat-label">Niveau de puissance</span>
          <span className="cp-stat-value">{status?.power_level || 0}%</span>
          <div
            className="cp-stat-progress"
            role="progressbar"
            aria-valuenow={status?.power_level || 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="cp-stat-progress-bar" style={progressStyle} />
          </div>
        </div>
      </div>

      <div className="cp-card">
        <h3 className="cp-card-title">Métriques</h3>
        <div className="cp-card-content">
          <div className="cp-info-row">
            <span className="cp-info-label">Itérations</span>
            <span className="cp-info-value">{status?.iterations || 0}</span>
          </div>
          <div className="cp-info-row">
            <span className="cp-info-label">Phase actuelle</span>
            <span className="cp-info-value">{status?.phase || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
