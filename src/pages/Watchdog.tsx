/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — WATCHDOG PAGE (FIXED)
 *   Surveillance temps réel avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { ModuleCard } from '../components/ModuleCard';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import { extractNumber } from '../utils/dataUtils';
import type { WatchdogData } from '../core/ARCHITECTURE_TYPES_v∞';
import './ModulePages.css';

export const Watchdog = () => {
  const watchdogData = useEngineSubscription('watchdog');
  const { data, loading } = watchdogData as {
    data: WatchdogData | null;
    loading: boolean;
  };
  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">👁️</span>
          <p>Chargement Watchdog...</p>
        </div>
      </div>
    );
  }

  const monitored = extractNumber(data?.monitored, 0);
  const healthy = extractNumber(data?.healthy, 0);
  const critical = extractNumber(data?.critical, 0);

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">👁️</span>
          Watchdog — Surveillance Temps Réel
        </h1>
        <p className="module-page__subtitle">
          Monitoring continu et détection d'anomalies
        </p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Éléments Surveillés"
          icon="👁️"
          value={monitored}
          subtitle="Composants actifs"
          variant="primary"
        />

        <ModuleCard
          title="Santé"
          icon="✅"
          value={healthy}
          subtitle="Composants sains"
          variant="success"
        />

        <ModuleCard
          title="Critiques"
          icon="❌"
          value={critical}
          subtitle="Incidents critiques"
          variant={critical === 0 ? 'success' : 'error'}
        />
      </div>
    </div>
  );
};
