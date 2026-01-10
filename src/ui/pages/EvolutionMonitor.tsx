/**
 * TITANE∞ v∞ Phase 10 - Evolution Monitor
 * Super-Prompt U: Auto-evolution tracking & control
 */

import React, { useState, useCallback, useEffect, memo } from 'react';
import { secureInvoke } from '@/lib/security';

interface EvolutionMetrics {
  stability: number;
  coherence: number;
  performance: number;
  cognitive_depth: number;
}

interface _Mutation {
  id: string;
  mutation_type: 'Optimize' | 'Refactor' | 'Simplify' | 'Enhance' | 'Fix';
  target: string;
  description: string;
  expected_improvement: number;
  risk_level: 'P0' | 'P1' | 'P2' | 'P3';
}

interface EvolutionReport {
  cycle: number;
  timestamp: number;
  metrics: EvolutionMetrics;
  mutations_proposed: number;
  mutations_applied: number;
  improvements: Record<string, number>;
}

interface EvolutionStats {
  total_cycles: number;
  total_mutations: number;
  current_metrics: EvolutionMetrics;
  improvement_history: Record<string, number>;
}

const EvolutionMonitor = memo(function EvolutionMonitor() {
  const [stats, setStats] = useState<EvolutionStats | null>(null);
  const [lastReport, setLastReport] = useState<EvolutionReport | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await secureInvoke<EvolutionStats>('evolution_get_stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const runEvolutionCycle = useCallback(async () => {
    setIsEvolving(true);
    try {
      const report = await secureInvoke<EvolutionReport>('evolution_run_cycle');
      setLastReport(report);
      await fetchStats();
    } catch (err) {
      console.error('Evolution cycle failed:', err);
    } finally {
      setIsEvolving(false);
    }
  }, [fetchStats]);

  const getMetricColor = useCallback((value: number, threshold: number = 80) => {
    if (value >= threshold + 10) return 'text-green-400';
    if (value >= threshold) return 'text-yellow-400';
    if (value >= threshold - 10) return 'text-orange-400';
    return 'text-red-400';
  }, []);

  const getMetricBg = useCallback((value: number) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 80) return 'bg-yellow-500';
    if (value >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  }, []);

  const getRiskColor = useCallback((risk: string) => {
    switch (risk) {
      case 'P0':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'P1':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'P2':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'P3':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  }, []);

  const _getMutationIcon = useCallback((type: string) => {
    switch (type) {
      case 'Optimize':
        return '⚡';
      case 'Refactor':
        return '🔄';
      case 'Simplify':
        return '✂️';
      case 'Enhance':
        return '✨';
      case 'Fix':
        return '🔧';
      default:
        return '🔀';
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-green-900 to-gray-900 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-600">
            Moniteur d&apos;Évolution
          </h1>
          <p className="text-gray-400 mt-2">
            Phase 10 : Suivi & Contrôle de l&apos;Auto-Évolution
          </p>
        </div>

        <button
          onClick={runEvolutionCycle}
          disabled={isEvolving}
          className="bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
        >
          {isEvolving ? '⏳ Évolution...' : '🧬 Lancer un Cycle d’Évolution'}
        </button>
      </div>

      {stats ? (
        <>
          {/* Heuristics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-linear-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
              <div className="text-gray-400 text-sm mb-2">Stabilité</div>
              <div
                className={`text-3xl font-bold ${getMetricColor(stats.current_metrics.stability, 90)}`}
              >
                {stats.current_metrics.stability.toFixed(1)}%
              </div>
              <div className="mt-3 bg-gray-600 rounded-full h-2">
                <div
                  className={`${getMetricBg(stats.current_metrics.stability)} rounded-full h-2 transition-all`}
                  style={{ width: `${stats.current_metrics.stability}%` }}
                />
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
              <div className="text-gray-400 text-sm mb-2">Cohérence</div>
              <div
                className={`text-3xl font-bold ${getMetricColor(stats.current_metrics.coherence, 95)}`}
              >
                {stats.current_metrics.coherence.toFixed(1)}%
              </div>
              <div className="mt-3 bg-gray-600 rounded-full h-2">
                <div
                  className={`${getMetricBg(stats.current_metrics.coherence)} rounded-full h-2 transition-all`}
                  style={{ width: `${stats.current_metrics.coherence}%` }}
                />
              </div>
            </div>

            <div className="bg-linear-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
              <div className="text-gray-400 text-sm mb-2">Performance</div>
              <div
                className={`text-3xl font-bold ${getMetricColor(stats.current_metrics.performance, 85)}`}
              >
                {stats.current_metrics.performance.toFixed(1)}%
              </div>
              <div className="mt-3 bg-gray-600 rounded-full h-2">
                <div
                  className={`${getMetricBg(stats.current_metrics.performance)} rounded-full h-2 transition-all`}
                  style={{ width: `${stats.current_metrics.performance}%` }}
                />
              </div>
            </div>

            <div className="bg-linear-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
              <div className="text-gray-400 text-sm mb-2">Profondeur Cognitive</div>
              <div
                className={`text-3xl font-bold ${getMetricColor(stats.current_metrics.cognitive_depth, 80)}`}
              >
                {stats.current_metrics.cognitive_depth.toFixed(1)}%
              </div>
              <div className="mt-3 bg-gray-600 rounded-full h-2">
                <div
                  className={`${getMetricBg(stats.current_metrics.cognitive_depth)} rounded-full h-2 transition-all`}
                  style={{ width: `${stats.current_metrics.cognitive_depth}%` }}
                />
              </div>
            </div>
          </div>

          {/* Evolution Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">
                Statistiques d&apos;Évolution
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Cycles Totaux</span>
                  <span className="text-white text-xl font-bold">
                    {stats.total_cycles}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Mutations Totales</span>
                  <span className="text-white text-xl font-bold">
                    {stats.total_mutations}
                  </span>
                </div>

                {lastReport && (
                  <>
                    <div className="border-t border-gray-700 pt-4">
                      <div className="text-gray-400 text-sm mb-2">Dernier Cycle</div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Proposées</span>
                        <span className="text-yellow-400 font-bold">
                          {lastReport.mutations_proposed}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400">Appliquées</span>
                        <span className="text-green-400 font-bold">
                          {lastReport.mutations_applied}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Improvement Tracking */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">Améliorations</h2>

              <div className="space-y-3">
                {Object.entries(stats.improvement_history).length > 0 ? (
                  Object.entries(stats.improvement_history).map(([metric, delta]) => (
                    <div key={metric} className="bg-gray-700/30 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white capitalize">{metric}</span>
                        <span className={delta >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucune amélioration enregistrée
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Last Evolution Report */}
          {lastReport && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">
                Dernier Cycle d&apos;Évolution #{lastReport.cycle}
              </h2>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Stabilité</div>
                  <div
                    className={`text-xl font-bold ${getMetricColor(lastReport.metrics.stability, 90)}`}
                  >
                    {lastReport.metrics.stability.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Cohérence</div>
                  <div
                    className={`text-xl font-bold ${getMetricColor(lastReport.metrics.coherence, 95)}`}
                  >
                    {lastReport.metrics.coherence.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Performance</div>
                  <div
                    className={`text-xl font-bold ${getMetricColor(lastReport.metrics.performance, 85)}`}
                  >
                    {lastReport.metrics.performance.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Profondeur Cognitive</div>
                  <div
                    className={`text-xl font-bold ${getMetricColor(lastReport.metrics.cognitive_depth, 80)}`}
                  >
                    {lastReport.metrics.cognitive_depth.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                Timestamp: {new Date(lastReport.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 border border-green-500/30 text-center">
          <div className="text-6xl mb-4">🧬</div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Moteur d&apos;Évolution Prêt
          </h2>
          <p className="text-gray-400">
            Lancez un cycle d&apos;évolution pour démarrer le suivi des améliorations
          </p>
        </div>
      )}

      {/* Risk Level Legend */}
      <div className="mt-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
        <h3 className="text-lg font-semibold text-white mb-3">
          Guide des Niveaux de Risque
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`rounded-lg p-3 border ${getRiskColor('P0')}`}>
            <div className="font-semibold mb-1">P0 - Sûr</div>
            <div className="text-xs">Appliqué automatiquement</div>
          </div>
          <div className={`rounded-lg p-3 border ${getRiskColor('P1')}`}>
            <div className="font-semibold mb-1">P1 - Risque Faible</div>
            <div className="text-xs">Changements mineurs, vérification suggérée</div>
          </div>
          <div className={`rounded-lg p-3 border ${getRiskColor('P2')}`}>
            <div className="font-semibold mb-1">P2 - Risque Moyen</div>
            <div className="text-xs">Nécessite une vérification avant application</div>
          </div>
          <div className={`rounded-lg p-3 border ${getRiskColor('P3')}`}>
            <div className="font-semibold mb-1">P3 - Risque Élevé</div>
            <div className="text-xs">
              Changements majeurs, approbation manuelle requise
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EvolutionMonitor;
