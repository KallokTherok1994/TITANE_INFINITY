/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Kernel Visuel — MemoryGraph
 * Visualisation de la mémoire système (snapshots, logs, timeline)
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import { useMemoryStore } from '../../stores/memoryStore';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export function MemoryGraph() {
  const { state, logs, fetchState, fetchLogs } = useMemoryStore();

  useEffect(() => {
    fetchState();
    fetchLogs(50);
    
    const interval = setInterval(() => {
      fetchState();
    }, 5000); // Update every 5s

    return () => clearInterval(interval);
  }, [fetchState, fetchLogs]);

  if (!state) {
    return <Card className="p-8 text-center">Chargement...</Card>;
  }

  const getLogLevelColor = (level: string): string => {
    switch (level) {
      case 'Info': return 'blue';
      case 'Warning': return 'yellow';
      case 'Error': return 'red';
      case 'Critical': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <h2 className="text-2xl font-bold">Memory — Mémoire Système</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">{state.snapshots_count}</div>
            <div className="text-sm text-gray-400 mt-2">Snapshots</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">{state.logs_count}</div>
            <div className="text-sm text-gray-400 mt-2">Logs</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500">{state.timeline_count}</div>
            <div className="text-sm text-gray-400 mt-2">Événements</div>
          </div>
        </Card>
      </div>

      {/* Last Snapshot */}
      {state.last_snapshot && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            📸 Dernier Snapshot
            <Badge color="blue" size="sm">
              {new Date(state.last_snapshot.timestamp).toLocaleString()}
            </Badge>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-400">CPU</div>
              <div className="font-semibold">{state.last_snapshot.helios.cpu_usage.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">RAM</div>
              <div className="font-semibold">{state.last_snapshot.helios.ram_usage.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Cohérence</div>
              <div className="font-semibold">{state.last_snapshot.nexus.coherence_score.toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Équilibre</div>
              <div className="font-semibold">{state.last_snapshot.harmonia.balance_score.toFixed(0)}%</div>
            </div>
          </div>
        </Card>
      )}

      {/* Last Event */}
      {state.last_event && (
        <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            ⚡ Dernier Événement
            <Badge color="purple" size="sm">{state.last_event.event_type}</Badge>
          </h3>
          <p className="text-sm text-gray-300">{state.last_event.description}</p>
          <div className="text-xs text-gray-500 mt-2">
            {new Date(state.last_event.timestamp).toLocaleString()}
          </div>
        </Card>
      )}

      {/* Recent Logs */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">📋 Logs Récents ({logs.length})</h3>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">Aucun log disponible</div>
          ) : (
            logs.slice(0, 20).map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Badge color={getLogLevelColor(log.level)} size="sm">
                    {log.level}
                  </Badge>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-blue-400 font-mono">{log.module}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{log.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Memory Usage */}
      <Card className="p-6 bg-gray-800">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Snapshots:</span>
            <span className="font-semibold">{state.snapshots_count} / 100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Logs:</span>
            <span className="font-semibold">{state.logs_count} / 1000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Timeline:</span>
            <span className="font-semibold">{state.timeline_count}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
