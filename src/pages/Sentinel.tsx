/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — SENTINEL PAGE (FIXED)
 *   Gardien de l'intégrité avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { ModuleCard } from '../components/ModuleCard';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import { extractNumber, extractString } from '../utils/dataUtils';
import './ModulePages.css';

export const Sentinel = () => {
  const sentinelData = useEngineSubscription('sentinel');
  const { data: status, loading } = sentinelData as { data: any; loading: boolean };  if (loading) {
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
