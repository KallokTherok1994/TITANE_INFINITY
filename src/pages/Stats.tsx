/**
 * TITANE∞ v25 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v25.2.0 — PAGE STATS UNIFIÉE
 * Fusion complète: Nexus + Helios + Harmonia + État Cognitif
 * Vue consolidée de tous les moteurs en temps réel
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useMemo, useState, useEffect } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { useEngineSubscription } from '../hooks/useEngineSubscription';
import { useResponsive } from '@/hooks/useResponsive';
import { extractNumber } from '../utils/dataUtils';
import '../pages/ModulePages.css';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

interface NexusGraph {
  nodeCount?: number;
  edgeCount?: number;
  // autres propriétés possibles
}

interface HeliosMetrics {
  bpm?: number;
  vitality_score?: number;
  system_load?: number;
  status?: string;
  temperature?: number;
  uptime?: number;
  // autres propriétés possibles
}

interface HarmoniaFlows {
  activeFlows?: Array<unknown>;
  balance?: number;
  coherence?: number;
  // autres propriétés possibles
}

interface CognitiveMetrics {
  provider?: string;
  mode?: string;
  depth?: number;
  stability?: number;
  cognitiveScore?: number;
  mentalLoad?: number;
  reasoningQuality?: number;
  activeProcesses?: string[];
  lastUpdate?: number;
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT PRINCIPAL
// ─────────────────────────────────────────────────────────────────

export const Stats: React.FC = () => {
  // ✨ v25.7.4 - Responsive hook
  const { isMobile: _isMobile } = useResponsive();

  // ═══ Souscriptions aux 3 moteurs ═══
  const nexusData = useEngineSubscription('nexus');
  const heliosData = useEngineSubscription('helios');
  const harmoniaData = useEngineSubscription('harmonia');

  // ═══ État Cognitif (polling direct) ═══
  const [cognitiveMetrics, setCognitiveMetrics] = useState<CognitiveMetrics | null>(null);
  const [cognitiveLoading, setCognitiveLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchCognitive = async () => {
      try {
        const data = await invoke<CognitiveMetrics>('orchestration_get_cognitive_state');
        if (mounted) {
          setCognitiveMetrics(data);
          setCognitiveLoading(false);
        }
      } catch (error) {
        console.error('[Stats] Error fetching cognitive state:', error);
        if (mounted) {
          setCognitiveLoading(false);
        }
      }
    };

    // Initial fetch
    fetchCognitive();

    // Polling every 5s
    const intervalId = setInterval(fetchCognitive, 5000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // ═══ Extraction des données typées ═══
  const { data: nexusGraph, loading: nexusLoading } = nexusData as {
    data: NexusGraph | null;
    loading: boolean;
  };

  const { data: heliosMetrics, loading: heliosLoading } = heliosData as {
    data: HeliosMetrics | null;
    loading: boolean;
  };

  const { data: harmoniaFlows, loading: harmoniaLoading } = harmoniaData as {
    data: HarmoniaFlows | null;
    loading: boolean;
  };

  // ═══ État de chargement global ═══
  const isLoading = nexusLoading || heliosLoading || harmoniaLoading || cognitiveLoading;

  // ═══ Extraction des métriques NEXUS ═══
  const nodeCount = extractNumber(nexusGraph?.nodeCount, 0);
  const edgeCount = extractNumber(nexusGraph?.edgeCount, 0);
  const networkDensity = useMemo(
    () => (nodeCount > 0 ? (edgeCount / nodeCount) * 100 : 0),
    [nodeCount, edgeCount]
  );

  // ═══ Extraction des métriques HELIOS ═══
  const bpm = extractNumber(heliosMetrics?.bpm, 0);
  const vitalityScore = extractNumber(heliosMetrics?.vitality_score, 0);
  const systemLoad = extractNumber(heliosMetrics?.system_load, 0);
  const temperature = extractNumber(heliosMetrics?.temperature);
  const uptime = extractNumber(heliosMetrics?.uptime);

  // ═══ Extraction des métriques HARMONIA ═══
  const activeFlowsCount = harmoniaFlows?.activeFlows?.length ?? 0;
  const balance = extractNumber(harmoniaFlows?.balance, 0);
  const coherence = extractNumber(harmoniaFlows?.coherence, 0);

  // ═══ Extraction des métriques COGNITIVE ═══
  const cognitiveScore = extractNumber(cognitiveMetrics?.cognitiveScore, 0);
  const stability = extractNumber(cognitiveMetrics?.stability, 0);
  const mentalLoad = extractNumber(cognitiveMetrics?.mentalLoad, 0);
  const reasoningQuality = extractNumber(cognitiveMetrics?.reasoningQuality, 0);
  const cognitiveDepth = extractNumber(cognitiveMetrics?.depth, 0);
  const cognitiveMode = cognitiveMetrics?.mode ?? 'balanced';
  const activeProcessesCount = cognitiveMetrics?.activeProcesses?.length ?? 0;

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="module-page">
        <div className="module-header">
          <div className="module-title-group">
            <h1 className="module-title">
              <span className="module-icon">📊</span>
              Statistiques Système
            </h1>
            <p className="module-subtitle">Chargement des métriques en temps réel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-page">
      {/* ═══ HEADER ═══ */}
      <div className="module-header">
        <div className="module-title-group">
          <h1 className="module-title">
            <span className="module-icon">📊</span>
            Statistiques Système
          </h1>
          <p className="module-subtitle">
            Vue consolidée : Réseau Cognitif • Système Vital • Équilibre des Flux • État
            Cognitif
          </p>
        </div>
      </div>

      {/* ═══ SECTION 1: RÉSEAU COGNITIF (NEXUS) ═══ */}
      <div className="stats-section">
        <h2 className="stats-section-title">
          <span className="stats-section-icon">🧠</span>
          Réseau Cognitif
        </h2>
        <div className="module-grid grid-responsive-3">
          <ModuleCard
            title="Nœuds Actifs"
            value={nodeCount.toFixed(0)}
            icon="🔵"
            subtitle="Nombre de nœuds dans le graphe"
            variant="primary"
          />
          <ModuleCard
            title="Connexions"
            value={edgeCount.toFixed(0)}
            icon="🔗"
            subtitle="Liens entre les nœuds"
            variant="success"
          />
          <ModuleCard
            title="Densité du Réseau"
            value={`${networkDensity.toFixed(1)}%`}
            icon="📊"
            subtitle="Ratio connexions/nœuds"
            variant="warning"
          />
        </div>
      </div>

      {/* ═══ SECTION 2: SYSTÈME VITAL (HELIOS) ═══ */}
      <div className="stats-section">
        <h2 className="stats-section-title">
          <span className="stats-section-icon">💓</span>
          Système Vital
        </h2>
        <div className="module-grid">
          <ModuleCard
            title="BPM Système"
            value={bpm.toFixed(0)}
            icon="💓"
            subtitle="Battements par minute"
            variant={bpm > 60 ? 'success' : 'warning'}
          />
          <ModuleCard
            title="Score de Vitalité"
            value={`${vitalityScore.toFixed(1)}%`}
            icon="⚡"
            subtitle="Niveau de santé global"
            variant={
              vitalityScore > 80 ? 'success' : vitalityScore > 50 ? 'warning' : 'error'
            }
          />
          <ModuleCard
            title="Charge Système"
            value={`${systemLoad.toFixed(1)}%`}
            icon="📊"
            subtitle="Utilisation des ressources"
            variant={systemLoad < 70 ? 'success' : systemLoad < 85 ? 'warning' : 'error'}
          />
          {temperature !== undefined && temperature > 0 && (
            <ModuleCard
              title="Température"
              value={`${temperature.toFixed(1)}°C`}
              icon="🌡️"
              subtitle="Température système"
              variant={temperature < 70 ? 'success' : 'warning'}
            />
          )}
          {uptime !== undefined && uptime > 0 && (
            <ModuleCard
              title="Uptime"
              value={`${(uptime / 3600).toFixed(1)}h`}
              icon="⏱️"
              subtitle="Temps de fonctionnement"
              variant="primary"
            />
          )}
        </div>
      </div>

      {/* ═══ SECTION 3: ÉQUILIBRE DES FLUX (HARMONIA) ═══ */}
      <div className="stats-section">
        <h2 className="stats-section-title">
          <span className="stats-section-icon">⚖️</span>
          Équilibre des Flux
        </h2>
        <div className="module-grid">
          <ModuleCard
            title="Flux Actifs"
            value={activeFlowsCount.toFixed(0)}
            icon="🌊"
            subtitle="Processus en cours"
            variant="primary"
          />
          <ModuleCard
            title="Score d'Équilibre"
            value={`${balance.toFixed(1)}%`}
            icon="⚖️"
            subtitle="Niveau d'équilibre global"
            variant={balance > 75 ? 'success' : balance > 50 ? 'warning' : 'error'}
          />
          <ModuleCard
            title="Cohérence"
            value={`${coherence.toFixed(1)}%`}
            icon="🔗"
            subtitle="Synchronisation des flux"
            variant={coherence > 75 ? 'success' : 'warning'}
          />
        </div>
      </div>

      {/* ═══ SECTION 4: ÉTAT COGNITIF ═══ */}
      <div className="stats-section">
        <h2 className="stats-section-title">
          <span className="stats-section-icon">🧠</span>
          État Cognitif
        </h2>
        <div className="module-grid">
          <ModuleCard
            title="Score Cognitif"
            value={`${cognitiveScore.toFixed(0)}%`}
            icon="🎯"
            subtitle="Performance cognitive globale"
            variant={
              cognitiveScore > 80 ? 'success' : cognitiveScore > 60 ? 'warning' : 'error'
            }
          />
          <ModuleCard
            title="Stabilité"
            value={`${stability.toFixed(0)}%`}
            icon="⚖️"
            subtitle="Stabilité du système cognitif"
            variant={stability > 85 ? 'success' : stability > 70 ? 'warning' : 'error'}
          />
          <ModuleCard
            title="Charge Mentale"
            value={`${mentalLoad.toFixed(0)}%`}
            icon="🧠"
            subtitle="Niveau de charge cognitive"
            variant={mentalLoad < 50 ? 'success' : mentalLoad < 75 ? 'warning' : 'error'}
          />
          <ModuleCard
            title="Qualité du Raisonnement"
            value={`${reasoningQuality.toFixed(0)}%`}
            icon="💡"
            subtitle="Qualité d'analyse et réflexion"
            variant={
              reasoningQuality > 85
                ? 'success'
                : reasoningQuality > 70
                  ? 'warning'
                  : 'error'
            }
          />
          <ModuleCard
            title="Profondeur Cognitive"
            value={`${cognitiveDepth.toFixed(0)}/10`}
            icon="🔍"
            subtitle={`Mode: ${cognitiveMode}`}
            variant={
              cognitiveDepth >= 7
                ? 'success'
                : cognitiveDepth >= 4
                  ? 'warning'
                  : 'primary'
            }
          />
          <ModuleCard
            title="Processus Actifs"
            value={activeProcessesCount.toFixed(0)}
            icon="⚙️"
            subtitle="Processus cognitifs en cours"
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
};

export default Stats;
