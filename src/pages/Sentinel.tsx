/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — SENTINEL PAGE (FIXED)
 *   Gardien de l'intégrité avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { useTitaneCore } from '../hooks';
import { extractNumber, extractString } from '../utils/dataUtils';
import './ModulePages.css';

export const Sentinel = () => {
  const { getSentinelStatus } = useTitaneCore();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getSentinelStatus();
        setStatus(data);
      } catch (err) {
        console.error('Failed to fetch Sentinel status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [getSentinelStatus]);

  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">🛡️</span>
          <p>Chargement Sentinel...</p>
        </div>
      </div>
    );
  }

  const integrityScore = extractNumber(status?.integrity_score, 0);
  const alerts = extractNumber(status?.alerts, 0);
  const statusText = extractString(status?.status, 'Unknown');

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">🛡️</span>
          Sentinel — Gardien de l'Intégrité
        </h1>
        <p className="module-page__subtitle">Protection et surveillance de l'intégrité système</p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Score d'Intégrité"
          icon="🔒"
          value={integrityScore}
          unit="%"
          status={statusText}
          subtitle="Niveau de protection"
          variant={integrityScore > 90 ? 'success' : integrityScore > 70 ? 'warning' : 'error'}
        />

        <ModuleCard
          title="Alertes"
          icon="⚠️"
          value={alerts}
          status={alerts === 0 ? 'Aucune alerte' : `${alerts} alerte(s)`}
          subtitle="Notifications actives"
          variant={alerts === 0 ? 'success' : alerts < 5 ? 'warning' : 'error'}
        />

        <ModuleCard
          title="État"
          icon="✅"
          status={statusText}
          subtitle="Statut du gardien"
          variant="success"
        />
      </div>
    </div>
  );
};
