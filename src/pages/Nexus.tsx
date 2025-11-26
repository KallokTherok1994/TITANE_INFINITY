/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — NEXUS PAGE (FIXED)
 *   Réseau cognitif avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { ModuleCard } from '../components/ModuleCard';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import { extractNumber } from '../utils/dataUtils';
import type { NexusGraph } from '../core/ARCHITECTURE_TYPES_v∞';
import './ModulePages.css';

export const Nexus = () => {
  const nexusData = useEngineSubscription('nexus');
  const { data: graph, loading } = nexusData as { data: NexusGraph | null; loading: boolean };  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">🧠</span>
          <p>Chargement du graphe Nexus...</p>
        </div>
      </div>
    );
  }

  const nodes = extractNumber(graph?.nodeCount, 0);
  const connections = extractNumber(graph?.edgeCount, 0);

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">🧠</span>
          Nexus — Réseau Cognitif
        </h1>
        <p className="module-page__subtitle">Architecture neurale et connexions actives</p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Nœuds Actifs"
          icon="🔵"
          value={nodes}
          subtitle="Points de traitement"
          variant="primary"
        />

        <ModuleCard
          title="Connexions"
          icon="🔗"
          value={connections}
          subtitle="Liens actifs"
          variant="success"
        />

        <ModuleCard
          title="Densité du Réseau"
          icon="📊"
          value={nodes > 0 ? Math.round((connections / nodes) * 100) : 0}
          unit="%"
          subtitle="Interconnectivité"
          variant="warning"
        />
      </div>
    </div>
  );
};
