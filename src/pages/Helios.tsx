/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — HELIOS PAGE (FIXED)
 *   Système vital avec sérialisation sécurisée des données
 * ═══════════════════════════════════════════════════════════════
 */

import { ModuleCard } from '../components/ModuleCard';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import { extractNumber, extractString } from '../utils/dataUtils';
import './ModulePages.css';

interface HeliosMetrics {
  bpm?: number;
  vitality_score?: number;
  vitality?: number;
  system_load?: number;
  load?: number;
  status?: string;
  temperature?: number;
  uptime?: number;
  [key: string]: any;
}

export const Helios = () => {
  const heliosData = useEngineSubscription('helios');
  const { data: metrics, loading } = heliosData as { data: HeliosMetrics | null; loading: boolean };  if (loading) {
    return (
      <div className="module-page">
        <div className="module-page__loading">
          <span className="module-page__loading-icon">⚡</span>
          <p>Chargement des métriques Helios...</p>
        </div>
      </div>
    );
  }

  // Sérialisation sécurisée des données
  const bpm = extractNumber(metrics?.bpm, 0);
  const vitalityScore = extractNumber(metrics?.vitality_score || metrics?.vitality, 0);
  const systemLoad = extractNumber(metrics?.system_load || metrics?.load, 0);
  const status = extractString(metrics?.status, 'Unknown');

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">💓</span>
          Helios — Système Vital
        </h1>
        <p className="module-page__subtitle">Métriques de vitalité et performances système</p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="BPM Système"
          icon="💓"
          value={bpm}
          unit="bpm"
          subtitle="Battements par minute"
          variant={bpm > 60 ? 'success' : 'warning'}
        />

        <ModuleCard
          title="Score de Vitalité"
          icon="⚡"
          value={vitalityScore}
          unit="%"
          status={status}
          subtitle="État global du système"
          variant={vitalityScore > 80 ? 'success' : vitalityScore > 50 ? 'warning' : 'error'}
        />

        <ModuleCard
          title="Charge Système"
          icon="📊"
          value={systemLoad}
          unit="%"
          subtitle="Utilisation des ressources"
          variant={systemLoad < 70 ? 'success' : systemLoad < 85 ? 'warning' : 'error'}
        />

        {/* Métriques additionnelles si disponibles */}
        {metrics?.temperature !== undefined && (
          <ModuleCard
            title="Température"
            icon="🌡️"
            value={extractNumber(metrics.temperature, 0)}
            unit="°C"
            subtitle="Température système"
          />
        )}

        {metrics?.uptime !== undefined && (
          <ModuleCard
            title="Uptime"
            icon="⏱️"
            value={extractString(metrics.uptime, '0h')}
            subtitle="Temps d'activité"
            variant="primary"
          />
        )}
      </div>
    </div>
  );
};
