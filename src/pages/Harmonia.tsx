/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — HARMONIA PAGE (FIXED)
 *   Équilibre des flux avec sérialisation sécurisée
 * ═══════════════════════════════════════════════════════════════
 */

import { ModuleCard } from '../components/ModuleCard';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import { extractNumber, extractString } from '../utils/dataUtils';
import './ModulePages.css';

export const Harmonia = () => {
  const harmoniaData = useEngineSubscription('harmonia');
  const { data: flows, loading } = harmoniaData as { data: any; loading: boolean };  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">⚖️</span>
          <p>Chargement des flux Harmonia...</p>
        </div>
      </div>
    );
  }

  const activeFlows = extractNumber(flows?.active_flows, 0);
  const balanceScore = extractNumber(flows?.balance_score, 0);
  const status = extractString(flows?.status, 'Unknown');

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">⚖️</span>
          Harmonia — Équilibre des Flux
        </h1>
        <p className="module-page__subtitle">Harmonisation et équilibre des processus système</p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Flux Actifs"
          icon="🌊"
          value={activeFlows}
          subtitle="Processus en cours"
          variant="primary"
        />

        <ModuleCard
          title="Score d'Équilibre"
          icon="⚖️"
          value={balanceScore}
          unit="%"
          status={status}
          subtitle="Niveau d'harmonisation"
          variant={balanceScore > 75 ? 'success' : balanceScore > 50 ? 'warning' : 'error'}
        />

        <ModuleCard
          title="État Système"
          icon="💫"
          status={status}
          subtitle="Statut global"
          variant="success"
        />
      </div>
    </div>
  );
};
