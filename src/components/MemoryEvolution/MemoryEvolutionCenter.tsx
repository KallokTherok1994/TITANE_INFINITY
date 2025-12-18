/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — MEMORY EVOLUTION CENTER
 *   OPUS #14 - Memory Evolution Engine++ UI
 *   Pyramide visuelle CT→MT→LT→ELT→Core + Contrôles
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/lib/logger';
import './MemoryEvolutionCenter.css';

// Types
interface MemoryLevel {
  name: string;
  description: string;
  color: string;
  count: number;
}

interface EvolutionResult {
  timestamp: string;
  status: string;
  items_parsed: number;
  items_synthesized: number;
  clusters_created: number;
  items_compressed: number;
  patterns_extracted: number;
  stability_score: number;
  growth_achieved: boolean;
  duration_ms: number;
  errors: string[];
}

interface MemoryEvolutionStatus {
  total_items: number;
  items_by_level: Record<string, number>;
  clusters_count: number;
  last_evolution: EvolutionResult | null;
  config: {
    auto_evolution_enabled: boolean;
    kevin_only_full_evolution: boolean;
  };
}

interface HierarchyHealth {
  ct_health: number;
  mt_health: number;
  lt_health: number;
  elt_health: number;
  core_health: number;
  overall_health: number;
  balance_score: number;
  flow_efficiency: number;
  recommendations: string[];
}

interface MemoryCluster {
  id: string;
  name: string;
  topic: string;
  item_count: number;
  coherence: number;
}

// Composant Pyramide Mémoire
const MemoryPyramid: React.FC<{ levels: Record<string, number> }> = ({ levels }) => {
  const pyramidLevels: MemoryLevel[] = [
    {
      name: 'Core',
      description: 'Essence cognitive',
      color: '#10B981',
      count: levels['Core'] || 0,
    },
    {
      name: 'ELT',
      description: 'Enhanced Long-Term',
      color: '#F59E0B',
      count: levels['ELT'] || 0,
    },
    { name: 'LT', description: 'Long-Terme', color: '#EC4899', count: levels['LT'] || 0 },
    {
      name: 'MT',
      description: 'Moyen-Terme',
      color: '#8B5CF6',
      count: levels['MT'] || 0,
    },
    {
      name: 'CT',
      description: 'Court-Terme',
      color: '#3B82F6',
      count: levels['CT'] || 0,
    },
  ];

  const maxCount = Math.max(...pyramidLevels.map(l => l.count), 1);

  return (
    <div className="memory-pyramid">
      <h3 className="pyramid-title">Pyramide Mnésique</h3>
      <div className="pyramid-container">
        {pyramidLevels.map((level, index) => {
          const width = 20 + (4 - index) * 20; // Core = 20%, CT = 100%
          const fillWidth = Math.max(10, (level.count / maxCount) * 100);

          return (
            <div
              key={level.name}
              className="pyramid-level"
              style={{ width: `${width}%` }}
            >
              <div
                className="pyramid-level-fill"
                style={{
                  width: `${fillWidth}%`,
                  backgroundColor: level.color,
                }}
              />
              <div className="pyramid-level-info">
                <span className="level-name">{level.name}</span>
                <span className="level-count">{level.count}</span>
              </div>
              <div className="pyramid-level-tooltip">{level.description}</div>
            </div>
          );
        })}
      </div>
      <div className="pyramid-flow">
        <span>▲ Distillation</span>
        <span className="flow-arrow">⬆</span>
        <span>▼ Accumulation</span>
      </div>
    </div>
  );
};

// Composant Santé Hiérarchie
const HierarchyHealthPanel: React.FC<{ health: HierarchyHealth | null }> = ({
  health,
}) => {
  if (!health) return null;

  const getHealthColor = (value: number) => {
    if (value >= 0.8) return '#10B981';
    if (value >= 0.6) return '#F59E0B';
    if (value >= 0.4) return '#F97316';
    return '#EF4444';
  };

  const healthMetrics = [
    { name: 'CT', value: health.ct_health },
    { name: 'MT', value: health.mt_health },
    { name: 'LT', value: health.lt_health },
    { name: 'ELT', value: health.elt_health },
    { name: 'Core', value: health.core_health },
  ];

  return (
    <div className="hierarchy-health-panel">
      <h3>Santé Hiérarchique</h3>

      <div className="overall-health">
        <div
          className="health-ring"
          style={{
            background: `conic-gradient(${getHealthColor(health.overall_health)} ${health.overall_health * 360}deg, #1e293b 0deg)`,
          }}
        >
          <span>{Math.round(health.overall_health * 100)}%</span>
        </div>
        <span className="health-label">Global</span>
      </div>

      <div className="health-metrics">
        {healthMetrics.map(metric => (
          <div key={metric.name} className="health-metric">
            <span className="metric-name">{metric.name}</span>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${metric.value * 100}%`,
                  backgroundColor: getHealthColor(metric.value),
                }}
              />
            </div>
            <span className="metric-value">{Math.round(metric.value * 100)}%</span>
          </div>
        ))}
      </div>

      <div className="flow-metrics">
        <div className="flow-metric">
          <span>Balance</span>
          <span style={{ color: getHealthColor(health.balance_score) }}>
            {Math.round(health.balance_score * 100)}%
          </span>
        </div>
        <div className="flow-metric">
          <span>Flux</span>
          <span style={{ color: getHealthColor(health.flow_efficiency) }}>
            {Math.round(health.flow_efficiency * 100)}%
          </span>
        </div>
      </div>

      {health.recommendations.length > 0 && (
        <div className="recommendations">
          <h4>💡 Recommandations</h4>
          <ul>
            {health.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Composant Clusters
const ClustersPanel: React.FC<{ clusters: MemoryCluster[] }> = ({ clusters }) => {
  return (
    <div className="clusters-panel">
      <h3>🎯 Clusters Thématiques</h3>
      {clusters.length === 0 ? (
        <p className="no-clusters">Aucun cluster formé</p>
      ) : (
        <div className="clusters-grid">
          {clusters.slice(0, 8).map(cluster => (
            <div key={cluster.id} className="cluster-card">
              <div className="cluster-header">
                <span className="cluster-topic">{cluster.topic}</span>
                <span className="cluster-count">{cluster.item_count}</span>
              </div>
              <div className="cluster-coherence">
                <div
                  className="coherence-bar"
                  style={{ width: `${cluster.coherence * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Composant Contrôles
const EvolutionControls: React.FC<{
  onParse: () => void;
  onSynthesize: () => void;
  onCluster: () => void;
  onCompress: () => void;
  onPatterns: () => void;
  onStability: () => void;
  onGrow: () => void;
  onFullEvolution: () => void;
  onBackup: () => void;
  isLoading: boolean;
  kevinAuthorized: boolean;
}> = props => {
  const {
    onParse,
    onSynthesize,
    onCluster,
    onCompress,
    onPatterns,
    onStability,
    onGrow,
    onFullEvolution,
    onBackup,
    isLoading,
    kevinAuthorized,
  } = props;

  return (
    <div className="evolution-controls">
      <h3>⚙️ Contrôles d&apos;Évolution</h3>

      <div className="controls-grid">
        <button onClick={onParse} disabled={isLoading} className="control-btn parse">
          <span className="btn-icon">📊</span>
          <span>Analyser</span>
        </button>

        <button
          onClick={onSynthesize}
          disabled={isLoading}
          className="control-btn synthesize"
        >
          <span className="btn-icon">🔮</span>
          <span>Synthétiser</span>
        </button>

        <button onClick={onCluster} disabled={isLoading} className="control-btn cluster">
          <span className="btn-icon">🎯</span>
          <span>Clusteriser</span>
        </button>

        <button
          onClick={onCompress}
          disabled={isLoading}
          className="control-btn compress"
        >
          <span className="btn-icon">📦</span>
          <span>Compresser</span>
        </button>

        <button
          onClick={onPatterns}
          disabled={isLoading}
          className="control-btn patterns"
        >
          <span className="btn-icon">🔄</span>
          <span>Patterns</span>
        </button>

        <button
          onClick={onStability}
          disabled={isLoading}
          className="control-btn stability"
        >
          <span className="btn-icon">🛡️</span>
          <span>Stabilité</span>
        </button>

        <button onClick={onGrow} disabled={isLoading} className="control-btn grow">
          <span className="btn-icon">🌱</span>
          <span>Croissance</span>
        </button>

        <button onClick={onBackup} disabled={isLoading} className="control-btn backup">
          <span className="btn-icon">💾</span>
          <span>Backup</span>
        </button>
      </div>

      <div className="full-evolution">
        <button
          onClick={onFullEvolution}
          disabled={isLoading || !kevinAuthorized}
          className="control-btn full-evolution-btn"
        >
          <span className="btn-icon">🚀</span>
          <span>Évolution Complète</span>
          {!kevinAuthorized && <span className="kevin-lock">🔒 Kevin Only</span>}
        </button>
      </div>
    </div>
  );
};

// Composant Résultat Évolution
const EvolutionResultPanel: React.FC<{ result: EvolutionResult | null }> = ({
  result,
}) => {
  if (!result) return null;

  const statusColors: Record<string, string> = {
    Complete: '#10B981',
    Error: '#EF4444',
    Parsing: '#3B82F6',
    Synthesizing: '#8B5CF6',
    Clustering: '#EC4899',
    Compressing: '#F59E0B',
    Stabilizing: '#6366F1',
    Growing: '#14B8A6',
    Idle: '#6B7280',
  };

  return (
    <div className="evolution-result-panel">
      <h3>📈 Dernière Évolution</h3>

      <div className="result-header">
        <span
          className="result-status"
          style={{ color: statusColors[result.status] || '#6B7280' }}
        >
          {result.status}
        </span>
        <span className="result-time">
          {new Date(result.timestamp).toLocaleString('fr-FR')}
        </span>
      </div>

      <div className="result-metrics">
        <div className="result-metric">
          <span className="metric-label">Analysés</span>
          <span className="metric-value">{result.items_parsed}</span>
        </div>
        <div className="result-metric">
          <span className="metric-label">Synthétisés</span>
          <span className="metric-value">{result.items_synthesized}</span>
        </div>
        <div className="result-metric">
          <span className="metric-label">Clusters</span>
          <span className="metric-value">{result.clusters_created}</span>
        </div>
        <div className="result-metric">
          <span className="metric-label">Compressés</span>
          <span className="metric-value">{result.items_compressed}</span>
        </div>
        <div className="result-metric">
          <span className="metric-label">Patterns</span>
          <span className="metric-value">{result.patterns_extracted}</span>
        </div>
        <div className="result-metric">
          <span className="metric-label">Stabilité</span>
          <span className="metric-value">
            {Math.round(result.stability_score * 100)}%
          </span>
        </div>
      </div>

      <div className="result-footer">
        <span className="duration">⏱️ {result.duration_ms}ms</span>
        {result.growth_achieved && <span className="growth-badge">🌱 Croissance</span>}
      </div>

      {result.errors.length > 0 && (
        <div className="result-errors">
          <h4>⚠️ Erreurs</h4>
          <ul>
            {result.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Composant Principal
export const MemoryEvolutionCenter: React.FC = () => {
  const [status, setStatus] = useState<MemoryEvolutionStatus | null>(null);
  const [health, setHealth] = useState<HierarchyHealth | null>(null);
  const [clusters, setClusters] = useState<MemoryCluster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [kevinAuthorized, setKevinAuthorized] = useState(false);
  const [lastResult, setLastResult] = useState<EvolutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  const fetchStatus = useCallback(async () => {
    try {
      const statusData = await secureInvoke<MemoryEvolutionStatus>('memory_evolution_status');
      setStatus(statusData);
      if (statusData.last_evolution) {
        setLastResult(statusData.last_evolution);
      }
    } catch (err) {
      logger.error(
        'Failed to fetch memory evolution status',
        { component: 'MemoryEvolutionCenter', action: 'fetchStatus' },
        err as Error
      );
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const healthData = await secureInvoke<HierarchyHealth>('memory_hierarchy_health');
      setHealth(healthData);
    } catch (err) {
      logger.error(
        'Failed to fetch memory hierarchy health',
        { component: 'MemoryEvolutionCenter', action: 'fetchHealth' },
        err as Error
      );
    }
  }, []);

  const fetchClusters = useCallback(async () => {
    try {
      const clustersData = await secureInvoke<MemoryCluster[]>('memory_get_clusters');
      setClusters(clustersData);
    } catch (err) {
      logger.error(
        'Failed to fetch memory clusters',
        { component: 'MemoryEvolutionCenter', action: 'fetchClusters' },
        err as Error
      );
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchHealth();
    fetchClusters();

    // Auto-refresh every 30s
    const interval = setInterval(() => {
      fetchStatus();
      fetchHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchHealth, fetchClusters]);

  // Action handlers
  const handleAction = async (action: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      switch (action) {
        case 'parse':
          result = await secureInvoke('memory_parse');
          break;
        case 'synthesize':
          result = await secureInvoke('memory_synthesize');
          break;
        case 'cluster':
          result = await secureInvoke('memory_cluster');
          await fetchClusters();
          break;
        case 'compress':
          result = await secureInvoke('memory_compress');
          break;
        case 'patterns':
          result = await secureInvoke('memory_extract_patterns');
          break;
        case 'stability':
          result = await secureInvoke('memory_check_and_repair');
          break;
        case 'grow':
          result = await secureInvoke('memory_grow');
          break;
        case 'backup':
          result = await secureInvoke('memory_create_backup');
          break;
        case 'full':
          result = await secureInvoke<EvolutionResult>('memory_evolve_full', {
            kevin_authorized: kevinAuthorized,
          });
          if (result) setLastResult(result);
          break;
      }

      // Refresh data after action
      await fetchStatus();
      await fetchHealth();
    } catch (err) {
      logger.error(
        'Memory evolution action failed',
        {
          component: 'MemoryEvolutionCenter',
          action: 'handleAction',
          actionType: action,
        },
        err as Error
      );
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="memory-evolution-center">
      <header className="evolution-header">
        <h1>🧠 Memory Evolution Engine++ v∞</h1>
        <p>OPUS #14 — Évolution cognitive, stabilisation, compression intelligente</p>

        <div className="kevin-auth">
          <label>
            <input
              type="checkbox"
              checked={kevinAuthorized}
              onChange={e => setKevinAuthorized(e.target.checked)}
            />
            <span>Kevin Authorization</span>
          </label>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="evolution-grid">
        {/* Pyramide Mémoire */}
        <div className="grid-item pyramid-section">
          <MemoryPyramid levels={status?.items_by_level || {}} />
          <div className="total-items">
            <span className="total-label">Total</span>
            <span className="total-value">{status?.total_items || 0}</span>
          </div>
        </div>

        {/* Santé Hiérarchique */}
        <div className="grid-item health-section">
          <HierarchyHealthPanel health={health} />
        </div>

        {/* Clusters */}
        <div className="grid-item clusters-section">
          <ClustersPanel clusters={clusters} />
        </div>

        {/* Contrôles */}
        <div className="grid-item controls-section">
          <EvolutionControls
            onParse={() => handleAction('parse')}
            onSynthesize={() => handleAction('synthesize')}
            onCluster={() => handleAction('cluster')}
            onCompress={() => handleAction('compress')}
            onPatterns={() => handleAction('patterns')}
            onStability={() => handleAction('stability')}
            onGrow={() => handleAction('grow')}
            onFullEvolution={() => handleAction('full')}
            onBackup={() => handleAction('backup')}
            isLoading={isLoading}
            kevinAuthorized={kevinAuthorized}
          />
        </div>

        {/* Résultat */}
        <div className="grid-item result-section">
          <EvolutionResultPanel result={lastResult} />
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <span>Évolution en cours...</span>
        </div>
      )}
    </div>
  );
};

export default MemoryEvolutionCenter;
