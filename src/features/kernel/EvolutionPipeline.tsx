/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Kernel Visuel — EvolutionPipeline
 * Visualisation du pipeline d'auto-évolution
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useEffect } from 'react';
import { useEvolutionStore } from '../../stores/evolutionStore';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export function EvolutionPipeline() {
  const { state, lastReport, health, running, loading, fetchState, runEvolution, quickHealthCheck } = useEvolutionStore();

  useEffect(() => {
    fetchState();
    quickHealthCheck();
    
    const interval = setInterval(() => {
      fetchState();
      quickHealthCheck();
    }, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, [fetchState, quickHealthCheck]);

  const handleRunEvolution = async () => {
    await runEvolution();
    await fetchState();
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'Low': return 'blue';
      case 'Medium': return 'yellow';
      case 'High': return 'orange';
      case 'Critical': return 'red';
      default: return 'gray';
    }
  };

  const getHealthColor = (status: string | null): string => {
    switch (status) {
      case 'Healthy': return 'green';
      case 'Warning': return 'yellow';
      case 'Critical': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Engine — Auto-Évolution</h2>
        <div className="flex items-center gap-3">
          {health && (
            <Badge color={getHealthColor(health)} size="lg">
              {health}
            </Badge>
          )}
          <Button 
            onClick={handleRunEvolution} 
            disabled={running || loading}
            variant="primary"
          >
            {running ? '⚡ Évolution en cours...' : '🚀 Lancer Évolution'}
          </Button>
        </div>
      </div>

      {/* Evolution State */}
      {state && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{state.total_evolutions}</div>
              <div className="text-sm text-gray-400 mt-1">Évolutions totales</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {state.history.length > 0 
                  ? state.history[state.history.length - 1]?.health_score.toFixed(0) 
                  : '-'}%
              </div>
              <div className="text-sm text-gray-400 mt-1">Score de santé</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {state.history.length > 0 
                  ? state.history[state.history.length - 1]?.repairs_count 
                  : '-'}
              </div>
              <div className="text-sm text-gray-400 mt-1">Réparations</div>
            </div>
          </div>
        </Card>
      )}

      {/* Last Report */}
      {lastReport && (
        <>
          {/* Issues */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              🔍 Issues Détectés ({lastReport.issues.length})
              <Badge color={lastReport.issues.length > 0 ? 'yellow' : 'green'} size="sm">
                {lastReport.issues.length === 0 ? 'Aucun problème' : `${lastReport.issues.length} problèmes`}
              </Badge>
            </h3>
            
            {lastReport.issues.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                ✅ Aucun problème détecté
              </div>
            ) : (
              <div className="space-y-3">
                {lastReport.issues.map((issue, idx) => (
                  <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Badge color={getSeverityColor(issue.severity)} size="sm">
                        {issue.severity}
                      </Badge>
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-1">{issue.category}</div>
                        <p className="text-sm text-gray-300">{issue.description}</p>
                        {issue.affected_module && (
                          <div className="text-xs text-blue-400 mt-1">
                            Module: {issue.affected_module}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">💡 Recommandations ({lastReport.recommendations.length})</h3>
            
            {lastReport.recommendations.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                Aucune recommandation
              </div>
            ) : (
              <div className="space-y-3">
                {lastReport.recommendations.sort((a, b) => b.priority - a.priority).map((rec, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Badge color="blue" size="sm">
                        Priorité {rec.priority}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">{rec.action}</div>
                        <p className="text-xs text-gray-400 mb-2">{rec.reason}</p>
                        <div className="text-xs text-green-400">
                          Impact estimé: {rec.estimated_impact}
                        </div>
                        {rec.target_module && (
                          <div className="text-xs text-blue-400 mt-1">
                            Cible: {rec.target_module}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Report Info */}
          <Card className="p-4 bg-gray-800">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Score de santé:</span>
                <span className="font-semibold">{lastReport.health_score.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Durée:</span>
                <span className="font-semibold">{lastReport.duration_ms}ms</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center mt-3">
              Dernière évolution: {new Date(lastReport.timestamp).toLocaleString()}
            </div>
          </Card>
        </>
      )}

      {/* Pipeline Visualization */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">🔄 Pipeline d'Évolution</h3>
        <div className="flex items-center justify-between gap-4">
          {['Collect', 'Diagnose', 'Decide', 'Repair', 'Record'].map((step, idx) => (
            <React.Fragment key={step}>
              <div className="flex-1 text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl ${
                  running ? 'bg-blue-600 animate-pulse' : 'bg-gray-700'
                }`}>
                  {idx + 1}
                </div>
                <div className="text-xs text-gray-400 mt-2">{step}</div>
              </div>
              {idx < 4 && (
                <div className="w-8 h-0.5 bg-gray-700" />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* History */}
      {state && state.history.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">📊 Historique (Dernières évolutions)</h3>
          <div className="space-y-2">
            {state.history.slice(-10).reverse().map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-xs text-gray-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <div className="flex items-center gap-4 text-sm">
                  <span>Score: <span className="font-semibold">{entry.health_score.toFixed(0)}%</span></span>
                  <span className="text-yellow-500">{entry.issues_count} issues</span>
                  <span className="text-green-500">{entry.repairs_count} réparations</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
