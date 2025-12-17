/**
 * TITANE∞ v25.3.2 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v25.3.2 — PERFECT FUSION EXAMPLE
 *   Démonstration d'intégration complète:
 *   - useSingularitySync (Backend ↔ Frontend Singularity)
 *   - useMemoryEngine (Pipeline mémoire unifié)
 *   - useSystemHealth (Dashboard santé système)
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useEffect } from 'react';
import { useSingularitySync } from '@/hooks/useSingularitySync';
import { useMemoryEngine } from '@/hooks/useMemoryEngine';
import { useSystemHealth } from '@/hooks/useSystemHealth';

export function PerfectFusionDashboard() {
  // ═══ HOOKS INTÉGRATION ═══
  const {
    state: singularityState,
    isSyncing: singularityLoading,
    lastError: singularityError,
    metrics: singularityMetrics,
  } = useSingularitySync({
    autoSync: true,
    syncInterval: 1000,
    conflictResolution: 'merge',
  });

  const {
    stats: memoryStats,
    isLoading: memoryLoading,
    error: memoryError,
    saveToMemory,
  } = useMemoryEngine();

  const {
    health,
    isMonitoring,
    error: healthError,
    startMonitoring,
    resolveAlert,
    triggerRecovery,
  } = useSystemHealth();

  // ═══ START MONITORING ═══
  useEffect(() => {
    startMonitoring(5000); // Refresh every 5s
  }, [startMonitoring]);

  // ═══ AUTO-SAVE TO MEMORY ═══
  useEffect(() => {
    if (singularityState) {
      saveToMemory(
        JSON.stringify({
          consciousness: singularityState.consciousness,
          autoCoherence: singularityState.autoCoherence,
          timestamp: singularityState.timestamp,
        }),
        'short',
        { source: 'singularity', timestamp: Date.now() }
      ).catch(console.error);
    }
  }, [singularityState, saveToMemory]);

  // ═══ RENDER ═══
  return (
    <div className="perfect-fusion-dashboard">
      <h1>🌌 TITANE∞ Perfect Fusion Dashboard</h1>

      {/* ═══ GLOBAL HEALTH ═══ */}
      <section className="global-health">
        <h2>🏥 Global Health</h2>
        {health && (
          <div className={`status-badge status-${health.global_status}`}>
            {health.global_status.toUpperCase()}
          </div>
        )}
        {healthError && <div className="error">{healthError.message}</div>}
      </section>

      {/* ═══ SINGULARITY SYNC ═══ */}
      <section className="singularity-section">
        <h2>⚛️ Singularity Sync</h2>
        {singularityLoading && <div>Loading...</div>}
        {singularityError && <div className="error">{singularityError.message}</div>}
        {singularityState && (
          <div>
            <p>
              <strong>Consciousness:</strong> {singularityState.consciousness}
            </p>
            <p>
              <strong>Coherence:</strong>{' '}
              {(singularityState.autoCoherence * 100).toFixed(1)}%
            </p>
            {singularityMetrics && (
              <div className="metrics">
                <p>
                  <strong>Sync Time:</strong> {singularityMetrics.avgSyncTime}ms
                </p>
                <p>
                  <strong>Error Count:</strong> {singularityMetrics.errorCount}
                </p>
                <p>
                  <strong>Sync Count:</strong> {singularityMetrics.syncCount}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ═══ MEMORY ENGINE ═══ */}
      <section className="memory-section">
        <h2>🧠 Memory Engine</h2>
        {memoryLoading && <div>Loading...</div>}
        {memoryError && <div className="error">{memoryError.message}</div>}
        {memoryStats && (
          <div>
            <p>
              <strong>Total Entries:</strong> {memoryStats.total_entries}
            </p>
            <p>
              <strong>Short Term:</strong> {memoryStats.short_term}
            </p>
            <p>
              <strong>Medium Term:</strong> {memoryStats.medium_term}
            </p>
            <p>
              <strong>Long Term:</strong> {memoryStats.long_term}
            </p>
            <p>
              <strong>Total Size:</strong>{' '}
              {(memoryStats.total_size_bytes / 1024).toFixed(2)} KB
            </p>
            <p>
              <strong>Health Score:</strong> {(memoryStats.health_score * 100).toFixed(0)}
              %
            </p>
          </div>
        )}
      </section>

      {/* ═══ SYSTEM HEALTH DETAILS ═══ */}
      <section className="health-details">
        <h2>📊 Health Details</h2>
        {health && (
          <div className="health-grid">
            {/* Conversation */}
            <div className="health-card">
              <h3>💬 Conversation</h3>
              <div className={`status-badge status-${health.conversation.status}`}>
                {health.conversation.status}
              </div>
              <p>
                <strong>Active:</strong> {health.conversation.active_conversations}
              </p>
              <p>
                <strong>Total Messages:</strong> {health.conversation.total_messages}
              </p>
              <p>
                <strong>Avg Response:</strong> {health.conversation.avg_response_time_ms}
                ms
              </p>
              <p>
                <strong>Error Rate:</strong>{' '}
                {(health.conversation.error_rate * 100).toFixed(2)}%
              </p>
            </div>

            {/* Memory */}
            <div className="health-card">
              <h3>🧠 Memory</h3>
              <div className={`status-badge status-${health.memory.status}`}>
                {health.memory.status}
              </div>
              <p>
                <strong>Entries:</strong> {health.memory.total_entries}
              </p>
              <p>
                <strong>Size:</strong>{' '}
                {(health.memory.total_size_bytes / 1024).toFixed(2)} KB
              </p>
              <p>
                <strong>Fragmentation:</strong>{' '}
                {(health.memory.fragmentation * 100).toFixed(1)}%
              </p>
            </div>

            {/* Singularity */}
            <div className="health-card">
              <h3>⚛️ Singularity</h3>
              <div className={`status-badge status-${health.singularity.status}`}>
                {health.singularity.status}
              </div>
              <p>
                <strong>Active Engines:</strong> {health.singularity.active_engines} /{' '}
                {health.singularity.total_engines}
              </p>
              <p>
                <strong>Sync:</strong> {health.singularity.sync_status}
              </p>
              <p>
                <strong>Conflicts:</strong> {health.singularity.sync_conflicts}
              </p>
            </div>

            {/* System */}
            <div className="health-card">
              <h3>💻 System</h3>
              <div className={`status-badge status-${health.system.status}`}>
                {health.system.status}
              </div>
              <p>
                <strong>Uptime:</strong>{' '}
                {(health.system.uptime_ms / 1000 / 60).toFixed(0)}m
              </p>
              <p>
                <strong>CPU:</strong> {health.system.cpu_usage.toFixed(1)}%
              </p>
              <p>
                <strong>Memory:</strong> {health.system.memory_usage_mb.toFixed(0)}MB
              </p>
              <p>
                <strong>Network:</strong> {health.system.network_status}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ═══ ALERTS ═══ */}
      {health && health.alerts.length > 0 && (
        <section className="alerts-section">
          <h2>⚠️ Alerts</h2>
          <div className="alerts-list">
            {health.alerts.map(alert => (
              <div key={alert.id} className={`alert alert-${alert.severity}`}>
                <div className="alert-header">
                  <span className="alert-component">{alert.component}</span>
                  <span className="alert-severity">{alert.severity}</span>
                </div>
                <p>{alert.message}</p>
                <div className="alert-actions">
                  <button onClick={() => resolveAlert(alert.id)}>Resolve</button>
                  {alert.auto_recoverable && (
                    <button onClick={() => triggerRecovery(alert.component)}>
                      Auto-Recover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ MONITORING STATUS ═══ */}
      <footer className="monitoring-status">
        <p>
          <strong>Monitoring:</strong> {isMonitoring ? '🟢 Active' : '🔴 Inactive'}
        </p>
        {health && (
          <p>
            <strong>Last Update:</strong>{' '}
            {new Date(health.timestamp).toLocaleTimeString()}
          </p>
        )}
      </footer>

      <style>{`
        .perfect-fusion-dashboard {
          padding: 20px;
          font-family:
            system-ui,
            -apple-system,
            sans-serif;
        }

        section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #f9f9f9;
        }

        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-weight: bold;
          margin: 5px 0;
        }

        .status-healthy {
          background: #4caf50;
          color: white;
        }
        .status-degraded {
          background: #ff9800;
          color: white;
        }
        .status-critical {
          background: #f44336;
          color: white;
        }
        .status-unknown {
          background: #9e9e9e;
          color: white;
        }

        .health-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .health-card {
          padding: 15px;
          border: 1px solid #ccc;
          border-radius: 6px;
          background: white;
        }

        .metrics p {
          margin: 5px 0;
          font-size: 0.9em;
        }

        .error {
          color: #f44336;
          font-weight: bold;
          padding: 10px;
          background: #ffebee;
          border-radius: 4px;
          margin: 10px 0;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .alert {
          padding: 10px;
          border-radius: 4px;
          border-left: 4px solid;
        }

        .alert-info {
          background: #e3f2fd;
          border-color: #2196f3;
        }
        .alert-warning {
          background: #fff3e0;
          border-color: #ff9800;
        }
        .alert-error {
          background: #ffebee;
          border-color: #f44336;
        }
        .alert-critical {
          background: #fce4ec;
          border-color: #e91e63;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .alert-actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }

        button {
          padding: 5px 15px;
          border: none;
          border-radius: 4px;
          background: #2196f3;
          color: white;
          cursor: pointer;
        }

        button:hover {
          background: #1976d2;
        }

        .monitoring-status {
          margin-top: 20px;
          padding: 10px;
          background: #e8f5e9;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default PerfectFusionDashboard;
