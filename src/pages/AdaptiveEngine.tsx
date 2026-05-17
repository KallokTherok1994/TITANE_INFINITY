/**
 * TITANE∞ v35.1.8 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v35.1.8 — ADAPTIVE ENGINE PAGE (FIXED)
 *   Optimisation dynamique avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { ModuleCard } from '../components/ModuleCard';
import { SurfaceTruthBadge } from '../components/system/SurfaceTruthBadge';
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
      <div className="module-page" data-testid="page-adaptive-engine">
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
  const isConnected = data !== null;

  return (
    <div className="module-page" data-testid="page-adaptive-engine">
      <div className="module-page__header">
        <div
          className="module-page__header-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <h1 className="module-page__title" style={{ margin: 0 }}>
            <span className="module-page__icon">🎯</span>
            Adaptive Engine — Optimisation
          </h1>
          <SurfaceTruthBadge variant={isConnected ? 'LIVE' : 'DEGRADED'} />
        </div>
        <p className="module-page__subtitle">
          Ajustements dynamiques et apprentissage adaptatif
        </p>
        {!isConnected && (
          <p style={{ color: '#f59e0b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            ⚠️ Backend non répondant — les métriques seront actualisées automatiquement
          </p>
        )}
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
