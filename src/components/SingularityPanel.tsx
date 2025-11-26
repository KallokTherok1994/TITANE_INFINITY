// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v15 — SingularityPanel Component
//   Phase 6-7: UI Synchronisation + OS Cognitif Unifié
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import {
  useSingularityState,
  getHealthColor,
  getHealthEmoji,
  calculateUptime,
  formatTimestamp,
} from '../hooks/useSingularityState';
import '../styles/SingularityPanel.css';

// ═══════════════════════════════════════════════════════════════
//   COMPONENT — SingularityPanel
// ═══════════════════════════════════════════════════════════════

export interface SingularityPanelProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  compact?: boolean;
}

export const SingularityPanel: React.FC<SingularityPanelProps> = ({
  autoRefresh = false,
  refreshInterval = 5000,
  compact = false,
}) => {
  const {
    singularityState,
    nexusState,
    harmoniaState,
    sentinelState,
    cognitionState,
    evolutionState,
    loading,
    error,
    refreshState,
    initEngine,
    tickEngine,
    enableAutoRefresh,
    disableAutoRefresh,
    autoRefreshEnabled,
  } = useSingularityState(autoRefresh, refreshInterval);

  // ═══════════════════════════════════════════════════════════════
  //   RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════

  const renderModuleCard = (
    title: string,
    health: string,
    metrics: Array<{ label: string; value: string | number }>,
    initialized: boolean
  ) => (
    <div className="singularity-module-card">
      <div className="module-header">
        <h3>{title}</h3>
        <div className="module-status">
          <span className="health-emoji">{getHealthEmoji(health)}</span>
          <span
            className="health-text"
            style={{ color: getHealthColor(health) }}
          >
            {health}
          </span>
        </div>
      </div>
      <div className="module-metrics">
        {metrics.map((metric, idx) => (
          <div key={idx} className="metric-row">
            <span className="metric-label">{metric.label}:</span>
            <span className="metric-value">{metric.value}</span>
          </div>
        ))}
        <div className="metric-row">
          <span className="metric-label">Initialized:</span>
          <span className="metric-value">{initialized ? '✅' : '❌'}</span>
        </div>
      </div>
    </div>
  );

  const renderCognitionCard = () => {
    if (!cognitionState) return null;

    const loadPercent = (cognitionState.load * 100).toFixed(1);
    const loadColor = cognitionState.load < 0.5 ? '#00ff88' : cognitionState.load < 0.8 ? '#ffaa00' : '#ff3344';

    return (
      <div className="singularity-module-card cognition-card">
        <div className="module-header">
          <h3>🧠 Cognition</h3>
          <div className="cognition-depth">
            Depth: <span className="depth-value">{cognitionState.depth}/10</span>
          </div>
        </div>
        <div className="module-metrics">
          <div className="metric-row">
            <span className="metric-label">Load:</span>
            <div className="load-bar-container">
              <div
                className="load-bar"
                style={{
                  width: `${loadPercent}%`,
                  backgroundColor: loadColor
                }}
              />
              <span className="load-text">{loadPercent}%</span>
            </div>
          </div>
          <div className="metric-row">
            <span className="metric-label">Active Thoughts:</span>
            <span className="metric-value">{cognitionState.active_thoughts}</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Last Update:</span>
            <span className="metric-value metric-time">
              {formatTimestamp(cognitionState.last_update_ms)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //   RENDER
  // ═══════════════════════════════════════════════════════════════

  if (loading && !singularityState) {
    return (
      <div className="singularity-panel loading">
        <div className="loading-spinner" />
        <p>Loading Singularity State...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="singularity-panel error">
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={refreshState}>Retry</button>
      </div>
    );
  }

  if (!singularityState) {
    return (
      <div className="singularity-panel empty">
        <p>No Singularity State available</p>
        <button onClick={initEngine}>Initialize Engine</button>
      </div>
    );
  }

  const uptime = calculateUptime(singularityState.init_timestamp_ms);

  return (
    <div className={`singularity-panel ${compact ? 'compact' : ''}`}>
      {/* Header */}
      <div className="singularity-header">
        <div className="header-left">
          <h1>🔮 Singularity Engine</h1>
          <div className="header-meta">
            <span className="uptime">Uptime: {uptime}</span>
            <span className="events">Events: {singularityState.timeline_events}</span>
          </div>
        </div>
        <div className="header-right">
          <button
            onClick={refreshState}
            disabled={loading}
            className="btn-refresh"
          >
            🔄 Refresh
          </button>
          <button
            onClick={tickEngine}
            disabled={loading}
            className="btn-tick"
          >
            ⚡ Tick
          </button>
          <button
            onClick={autoRefreshEnabled ? disableAutoRefresh : enableAutoRefresh}
            className={`btn-auto-refresh ${autoRefreshEnabled ? 'active' : ''}`}
          >
            {autoRefreshEnabled ? '⏸️ Pause Auto' : '▶️ Auto Refresh'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="singularity-grid">
        {/* Nexus Module */}
        {nexusState && renderModuleCard(
          '🔗 Nexus',
          nexusState.health,
          [
            { label: 'Coordinations', value: nexusState.coordination_count },
            { label: 'Connections', value: nexusState.active_connections },
            { label: 'Last Coord', value: formatTimestamp(nexusState.last_coordination_ms) },
          ],
          nexusState.initialized
        )}

        {/* Harmonia Module */}
        {harmoniaState && renderModuleCard(
          '⚖️ Harmonia',
          harmoniaState.health,
          [
            { label: 'Harmony Index', value: `${(harmoniaState.harmony_index * 100).toFixed(1)}%` },
            { label: 'Balance Score', value: `${(harmoniaState.balance_score * 100).toFixed(1)}%` },
            { label: 'Last Check', value: formatTimestamp(harmoniaState.last_check_ms) },
          ],
          harmoniaState.initialized
        )}

        {/* Sentinel Module */}
        {sentinelState && renderModuleCard(
          '🛡️ Sentinel',
          sentinelState.health,
          [
            { label: 'Alert Count', value: sentinelState.alert_count },
            { label: 'Active Monitors', value: sentinelState.active_monitors },
            { label: 'Protection Level', value: `${sentinelState.protection_level}/10` },
            { label: 'Last Check', value: formatTimestamp(sentinelState.last_check_ms) },
          ],
          sentinelState.initialized
        )}

        {/* Cognition */}
        {renderCognitionCard()}
      </div>

      {/* Evolution Status (if available) */}
      {evolutionState && (
        <div className="evolution-status">
          <h3>🧬 Auto-Evolution</h3>
          <div className="evolution-info">
            <span>Status: {evolutionState.status}</span>
            <span>Cycles: {evolutionState.evolution_count}</span>
            <span>Running: {evolutionState.is_running ? '✅' : '❌'}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="singularity-footer">
        <span className="last-sync">
          Last Sync: {formatTimestamp(singularityState.last_sync_ms)}
        </span>
      </div>
    </div>
  );
};

export default SingularityPanel;
