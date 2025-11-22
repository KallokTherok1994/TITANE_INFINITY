/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Kernel Visuel — NexusMesh
 * Visualisation de la cohérence des modules
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import { useSystemStore } from '../../stores/systemStore';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export function NexusMesh() {
  const { nexus, loading, error, fetchNexus } = useSystemStore();

  useEffect(() => {
    fetchNexus();
    
    const interval = setInterval(() => {
      fetchNexus();
    }, 3000); // Update every 3s

    return () => clearInterval(interval);
  }, [fetchNexus]);

  if (loading && !nexus) {
    return <Card className="p-8 text-center">Chargement...</Card>;
  }

  if (error) {
    return <Card className="p-8 text-center text-red-500">Erreur: {error}</Card>;
  }

  if (!nexus) {
    return null;
  }

  const getHealthColor = (health: string): string => {
    switch (health) {
      case 'Healthy': return 'green';
      case 'Degraded': return 'yellow';
      case 'Failed': return 'red';
      default: return 'gray';
    }
  };

  const getCoherenceColor = (score: number): string => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  };

  const modulesList = Object.entries(nexus.modules);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Nexus — Cohérence des Modules</h2>
        <Badge color={getCoherenceColor(nexus.coherence_score)} size="lg">
          Cohérence: {nexus.coherence_score.toFixed(1)}%
        </Badge>
      </div>

      {/* Coherence Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Score Global</span>
          <span className="text-lg font-semibold">{nexus.coherence_score.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              nexus.coherence_score >= 90
                ? 'bg-green-500'
                : nexus.coherence_score >= 70
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${nexus.coherence_score}%` }}
          />
        </div>
      </Card>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modulesList.map(([name, status]) => (
          <Card key={name} className="p-4 hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{status.name}</h3>
              <Badge color={getHealthColor(status.health)} size="sm">
                {status.health}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Dernière vérification:</span>
                <span>{new Date(status.last_check).toLocaleTimeString()}</span>
              </div>
              
              {status.error_count > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Erreurs:</span>
                  <span>{status.error_count}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">
              {modulesList.filter(([, s]) => s.health === 'Healthy').length}
            </div>
            <div className="text-sm text-gray-400">Healthy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {modulesList.filter(([, s]) => s.health === 'Degraded').length}
            </div>
            <div className="text-sm text-gray-400">Degraded</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">
              {modulesList.filter(([, s]) => s.health === 'Failed').length}
            </div>
            <div className="text-sm text-gray-400">Failed</div>
          </div>
        </div>
      </Card>

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center">
        Dernière mise à jour: {new Date(nexus.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
