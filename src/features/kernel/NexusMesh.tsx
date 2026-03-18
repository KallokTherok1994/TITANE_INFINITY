/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Kernel Visuel — NexusMesh
 * Visualisation de la cohérence des modules
 * [FIX-005b] Adapted to NexusEngineState (engine_get_nexus_state)
 * Fields: health, coordination_count, active_connections, last_coordination_ms, initialized
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import { useNexusSnapshot, useFetchNexus } from '../../stores/systemStore.selectors';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export function NexusMesh() {
  const { nexus, loading, error } = useNexusSnapshot();
  const fetchNexus = useFetchNexus();

  useEffect(() => {
    fetchNexus();
    const interval = setInterval(() => {
      fetchNexus();
    }, 3000);
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
    if (health === 'Ready') return 'green';
    if (health === 'Degraded') return 'yellow';
    return 'red';
  };

  // [FIX-005b] coherence_score not in NexusEngineState — derive from health + connections
  const getCoherenceScore = (): number => {
    if (nexus.health === 'Ready') return nexus.active_connections > 0 ? 92 : 75;
    if (nexus.health === 'Degraded') return 55;
    return 20;
  };

  const coherenceScore = getCoherenceScore();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Nexus — Cohérence des Modules</h2>
        <Badge color={getHealthColor(nexus.health)} size="lg">
          {nexus.health}
        </Badge>
      </div>

      {/* Coherence Score (derived) */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Cohérence estimée</span>
          <span className="text-lg font-semibold">{coherenceScore}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              coherenceScore >= 90
                ? 'bg-green-500'
                : coherenceScore >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${coherenceScore}%` }}
          />
        </div>
      </Card>

      {/* Engine Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-400">
            {nexus.coordination_count}
          </div>
          <div className="text-sm text-gray-400 mt-1">Coordinations</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-400">
            {nexus.active_connections}
          </div>
          <div className="text-sm text-gray-400 mt-1">Connexions actives</div>
        </Card>
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-400">
            {nexus.initialized ? '✅' : '⏳'}
          </div>
          <div className="text-sm text-gray-400 mt-1">Initialisé</div>
        </Card>
      </div>

      {/* Status */}
      <Card className="p-4 bg-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Dernière coordination:</span>
          <span className="font-semibold">
            {nexus.last_coordination_ms > 0
              ? new Date(nexus.last_coordination_ms).toLocaleTimeString()
              : 'Aucune encore'}
          </span>
        </div>
      </Card>
    </div>
  );
}
