/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — SELFHEAL PAGE (FIXED)
 *   Auto-réparation avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { ModuleCard } from '../components/ModuleCard';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import { extractNumber } from '../utils/dataUtils';
import type { SelfHealData } from '../core/ARCHITECTURE_TYPES_v∞';
import './ModulePages.css';

export const SelfHeal = () => {
  const selfhealData = useEngineSubscription('selfheal');
  const { data, loading } = selfhealData as {
    data: SelfHealData | null;
    loading: boolean;
  };
  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">🛡️</span>
          <p>Chargement SelfHeal...</p>
        </div>
      </div>
    );
  }

  const repairs = extractNumber(data?.totalHeals, 0);
  const successRate = extractNumber(data?.successRate, 0);
  const repairQueue = extractNumber(data?.repairQueue, 0);

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">🛡️</span>
          SelfHeal — Auto-Réparation
        </h1>
        <p className="module-page__subtitle">
          Système d&apos;auto-correction et maintenance
        </p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Réparations"
          icon="🔧"
          value={repairs}
          subtitle="Corrections appliquées"
          variant="primary"
        />

        <ModuleCard
          title="Taux de Succès"
          icon="✅"
          value={successRate}
          unit="%"
          subtitle="Réussites"
          variant={successRate > 80 ? 'success' : 'warning'}
        />

        <ModuleCard
          title="File d'Attente"
          icon="📝"
          value={repairQueue}
          subtitle="Réparations en attente"
          variant={repairQueue === 0 ? 'success' : 'warning'}
        />
      </div>
    </div>
  );
};
