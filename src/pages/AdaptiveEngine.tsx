/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — ADAPTIVE ENGINE PAGE (FIXED)
 *   Optimisation dynamique avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { ModuleCard } from '../components/ModuleCard';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import { extractNumber } from '../utils/dataUtils';
import type { AdaptiveData } from '../core/ARCHITECTURE_TYPES_v∞';
import './ModulePages.css';

export const AdaptiveEngine = () => {
  const adaptiveData = useEngineSubscription('adaptive');
  const { data, loading } = adaptiveData as {
    data: AdaptiveData | null;
    loading: boolean;
  };
  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">🎯</span>
          <p>Chargement Adaptive Engine...</p>
        </div>
      </div>
    );
  }

  const adaptations = extractNumber(data?.adaptations, 0);
  const efficiency = extractNumber(data?.optimizationScore, 0);
  const confidence = extractNumber(data?.confidence, 0);

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">🎯</span>
          Adaptive Engine — Optimisation
        </h1>
        <p className="module-page__subtitle">
          Ajustements dynamiques et apprentissage adaptatif
        </p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Adaptations"
          icon="🎯"
          value={adaptations}
          subtitle="Ajustements réalisés"
          variant="primary"
        />

        <ModuleCard
          title="Efficacité"
          icon="⚡"
          value={efficiency}
          unit="%"
          subtitle="Score d'optimisation"
          variant={efficiency > 75 ? 'success' : 'warning'}
        />

        <ModuleCard
          title="Confiance"
          icon="📊"
          value={confidence}
          unit="%"
          subtitle="Niveau de confiance"
          variant="success"
        />
      </div>
    </div>
  );
};
