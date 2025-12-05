/**
 * TITANE∞ OS - Section Singularité
 * Contrôle du moteur de singularité
 */

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const singularityStatus = await secureInvoke<SingularityStatus>('get_singularity_status');
      setStatus(singularityStatus);
    } catch (error) {
      console.error('Erreur chargement statut singularité:', error);
    }
  };

  const toggleSingularity = async () => {
    setLoading(true);
    try {
      await secureInvoke('toggle_singularity');
      await loadStatus();
    } catch (error) {
      console.error('Erreur toggle singularité:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-section">
      <div className="cp-section-header">
        <h2 className="cp-section-title">Singularité</h2>
        <button
          className={`cp-button ${status?.active ? 'danger' : ''}`}
          onClick={toggleSingularity}
          disabled={loading}
        >
          {loading ? '⏳ Traitement...' : status?.active ? '⏸️ Désactiver' : '▶️ Activer'}
        </button>
      </div>

      <div className="cp-grid cp-grid-2">
        <div className="cp-card cp-stat-card">
          <span className="cp-stat-label">État Singularité</span>
          <span className={`cp-badge ${status?.active ? 'success' : ''}`}>
            <span className="cp-badge-dot" />
            {status?.active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className="cp-card cp-stat-card">
          <span className="cp-stat-label">Niveau de puissance</span>
          <span className="cp-stat-value">{status?.power_level || 0}%</span>
          <div className="cp-stat-progress">
            <div
              className="cp-stat-progress-bar"
              style={{ width: `${status?.power_level || 0}%` }}
            />
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
