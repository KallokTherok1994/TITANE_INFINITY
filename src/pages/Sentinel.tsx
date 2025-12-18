/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — SENTINEL PAGE (FIXED)
 *   Gardien de l&apos;intégrité avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { ModuleCard } from '../components/ModuleCard';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import { extractNumber } from '../utils/dataUtils';
import type { SentinelAlerts } from '../core/ARCHITECTURE_TYPES_v∞';
import './ModulePages.css';

export const Sentinel = () => {
  const sentinelData = useEngineSubscription('sentinel');
  const { data: status, loading } = sentinelData as {
    data: SentinelAlerts | null;
    loading: boolean;
  };
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

  const threatLevel = extractNumber(status?.threatLevel, 0);
  const activeAlerts = extractNumber(status?.activeAlerts, 0);
  const criticalCount = extractNumber(status?.criticalCount, 0);

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">🛡️</span>
          Sentinel — Gardien de l&apos;Intégrité
        </h1>
        <p className="module-page__subtitle">
          Protection et surveillance de l&apos;intégrité système
        </p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Niveau de Menace"
          icon="🚨"
          value={threatLevel}
          unit="%"
          subtitle="Menaces détectées"
          variant={threatLevel < 30 ? 'success' : threatLevel < 60 ? 'warning' : 'error'}
        />

        <ModuleCard
          title="Alertes Actives"
          icon="⚠️"
          value={activeAlerts}
          subtitle="Alertes en cours"
          variant={activeAlerts === 0 ? 'success' : 'warning'}
        />

        <ModuleCard
          title="Alertes Critiques"
          icon="🔴"
          value={criticalCount}
          subtitle="Incidents critiques"
          variant={criticalCount === 0 ? 'success' : 'error'}
        />
      </div>
    </div>
  );
};
