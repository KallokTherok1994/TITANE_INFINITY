/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ Kernel Visuel — MemoryGraph
 * Visualisation de la mémoire système (snapshots, logs, timeline)
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import {
  useMemoryState,
  useLogs,
  useTelemetry,
  useMemoryActions,
} from '../../stores/memoryStore.selectors';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export function MemoryGraph() {
  const state = useMemoryState();
  const logs = useLogs();
  const telemetry = useTelemetry();
  const { fetchState, fetchLogs, fetchTelemetry } = useMemoryActions();

  useEffect(() => {
    fetchState();
    fetchLogs(50);
    fetchTelemetry();

    const interval = setInterval(() => {
      fetchState();
    }, 5000); // Update every 5s
    const telemetryInterval = setInterval(() => {
      fetchTelemetry();
    }, 30000); // Audit disk every 30s

    return () => {
      clearInterval(interval);
      clearInterval(telemetryInterval);
    };
  }, [fetchState, fetchLogs, fetchTelemetry]);

  if (!state) {
    return <Card className="p-8 text-center">Chargement...</Card>;
  }

  const getLogLevelColor = (level: string): string => {
    switch (level) {
      case 'Info':
        return 'blue';
      case 'Warning':
        return 'yellow';
      case 'Error':
        return 'red';
      case 'Critical':
        return 'red';
      default:
        return 'gray';
    }
  };

  const logCount = state.log_entries_count ?? state.logs_count ?? 0;
  const timelineCount = state.timeline_events ?? state.timeline_count ?? 0;

  const diskModeLabel = state.disk_mode?.replace(/_/g, ' ').toUpperCase() ?? 'UNKNOWN';
  const lastValidation = state.last_validation_ts
    ? new Date(state.last_validation_ts).toLocaleString()
    : 'Jamais';
  const lastCompaction = state.last_compaction_ts
    ? new Date(state.last_compaction_ts).toLocaleString()
    : 'Inconnu';

  return (
    <div className="space-y-4">
      {/* Header */}
      <h2 className="text-2xl font-bold">Memory — Mémoire Système</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500">
              {state.snapshots_count}
            </div>
            <div className="text-sm text-gray-400 mt-2">Snapshots</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">{logCount}</div>
            <div className="text-sm text-gray-400 mt-2">Logs</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-500">{timelineCount}</div>
            <div className="text-sm text-gray-400 mt-2">Événements</div>
          </div>
        </Card>
      </div>

      {/* Disk Health */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-semibold mb-2">🧬 Mode disque</h3>
            <div className="text-2xl font-bold">{diskModeLabel}</div>
            <p className="text-sm text-gray-400 mt-1">
              {state.synthetic_mode
                ? 'Mode synthétique (aucune écriture persistante)'
                : 'Persistance disque active'}
            </p>
          </div>
          <div className="space-y-1 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Dernière validation:</span>
              <Badge color="blue" size="sm">
                {lastValidation}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Dernière compaction:</span>
              <Badge color="purple" size="sm">
                {lastCompaction}
              </Badge>
            </div>
            {state.issues.length > 0 && (
              <div className="text-red-400 text-xs">
                ⚠️ Problèmes détectés: {state.issues.join(', ')}
              </div>
            )}
          </div>
        </div>
      </Card>

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
              <div className="font-semibold">
                {state.last_snapshot.helios.cpu_usage.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">RAM</div>
              <div className="font-semibold">
                {state.last_snapshot.helios.ram_usage.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Cohérence</div>
              <div className="font-semibold">
                {state.last_snapshot.nexus.coherence_score.toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Équilibre</div>
              <div className="font-semibold">
                {state.last_snapshot.harmonia.balance_score.toFixed(0)}%
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Last Event */}
      {state.last_event && (
        <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            ⚡ Dernier Événement
            <Badge color="purple" size="sm">
              {state.last_event.event_type}
            </Badge>
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
            logs.slice(0, 20).map(log => (
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
                      <span className="text-xs text-blue-400 font-mono">
                        {log.module}
                      </span>
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
            <span className="font-semibold">{logCount} / 1000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Timeline:</span>
            <span className="font-semibold">{timelineCount}</span>
          </div>
        </div>
      </Card>

      {/* Telemetry List */}
      {telemetry && (
        <Card className="p-6">
          <h3 className="font-semibold mb-2">📂 Audit disque</h3>
          <p className="text-xs text-gray-400 mb-4">
            {telemetry.base_path} — {telemetry.files.length} fichiers —{' '}
            {(telemetry.total_size_bytes / (1024 * 1024)).toFixed(2)} MB
          </p>
          {telemetry.files.length === 0 ? (
            <div className="text-sm text-gray-400">Aucun fichier mémoire détecté</div>
          ) : (
            <div className="space-y-2">
              {telemetry.files.slice(0, 5).map(file => (
                <div
                  key={file.name}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm"
                >
                  <div className="font-mono text-gray-200">{file.name}</div>
                  <div className="text-gray-400">
                    {(file.size_bytes / 1024).toFixed(1)} KB ·{' '}
                    {new Date(file.modified_ts).toLocaleString()}
                    {file.version && ` · v${file.version}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
