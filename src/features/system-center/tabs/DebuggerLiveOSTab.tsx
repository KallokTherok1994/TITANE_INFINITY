/**
 * TITANE∞ v21 — Debugger Live OS Tab
 *
 * Interface principale du débogueur temps réel TITANE∞
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { useState } from 'react';
import { useDebuggerLiveOS } from '../hooks/useDebuggerLiveOS';
import type {
  DebuggerMode,
  RiskLevel,
  SnapshotDiff,
} from '../types/debuggerLiveOS.types';

export function DebuggerLiveOSTab() {
  const debugPanel = useDebuggerLiveOS();
  const [selectedMode, setSelectedMode] = useState<DebuggerMode>('LiveMonitor');
  const [selectedSnapshotA, setSelectedSnapshotA] = useState<string>('');
  const [selectedSnapshotB, setSelectedSnapshotB] = useState<string>('');
  const [snapshotDiff, setSnapshotDiff] = useState<SnapshotDiff | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'html'>('json');

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const handleStart = async () => {
    await debugPanel.start(selectedMode);
  };

  const handleStop = async () => {
    await debugPanel.stop();
  };

  const handleSwitchMode = async (mode: DebuggerMode) => {
    setSelectedMode(mode);
    if (debugPanel.isActive) {
      await debugPanel.switchMode(mode);
    }
  };

  const handleSnapshot = async () => {
    const label = prompt('Label pour le snapshot (optionnel):');
    await debugPanel.snapshot(label || undefined);
  };

  const handleCompareSnapshots = async () => {
    if (!selectedSnapshotA || !selectedSnapshotB) {
      alert('Sélectionnez deux snapshots à comparer');
      return;
    }
    const diff = await debugPanel.compareSnapshots(selectedSnapshotA, selectedSnapshotB);
    setSnapshotDiff(diff);
  };

  const handleExport = async () => {
    const data = await debugPanel.export(exportFormat);
    const blob = new Blob([data], {
      type:
        exportFormat === 'json'
          ? 'application/json'
          : exportFormat === 'csv'
            ? 'text/csv'
            : 'text/html',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titane-debugger-${Date.now()}.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAutoFix = async (riskId?: string) => {
    const result = await debugPanel.autoFix(riskId);
    alert(
      `Auto-fix terminé:\n✅ Fixes appliqués: ${result.fixes_applied}\n❌ Fixes échoués: ${result.fixes_failed}`
    );
  };

  const handleSanityCheck = async () => {
    const report = await debugPanel.sanityCheck();
    const passed = report.checks.filter(c => c.status === 'Pass').length;
    const failed = report.checks.filter(c => c.status === 'Fail').length;
    alert(
      `Sanity Check:\nStatut: ${report.overall_status}\n✅ Passés: ${passed}\n❌ Échoués: ${failed}`
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════

  const getRiskLevelColor = (level: RiskLevel): string => {
    switch (level) {
      case 'Critical':
        return '#ff0040';
      case 'High':
        return '#ff6b00';
      case 'Medium':
        return '#ffaa00';
      case 'Low':
        return '#ffee00';
      case 'None':
        return '#00ff00';
      default:
        return '#888';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER MODE-SPECIFIC CONTENT
  // ═══════════════════════════════════════════════════════════════

  const renderLiveMonitor = () => {
    if (!debugPanel.state.liveMetrics)
      return <div className="dbg-empty">Aucune donnée disponible</div>;

    const metrics = debugPanel.state.liveMetrics;

    return (
      <div className="dbg-live-monitor">
        <div className="dbg-metric-grid">
          {/* System Health */}
          <div className="dbg-metric-card">
            <div className="dbg-metric-header">
              <span className="dbg-metric-icon">💚</span>
              <h4>Santé Système</h4>
            </div>
            <div className="dbg-metric-content">
              <div
                className="dbg-status-badge"
                style={{
                  background: metrics.systemHealth?.healthy ? '#00ff0020' : '#ff004020',
                  color: metrics.systemHealth?.healthy ? '#00ff00' : '#ff0040',
                }}
              >
                {metrics.systemHealth?.healthy ? '✓ Sain' : '✗ Dégradé'}
              </div>
              {metrics.systemHealth?.issues && metrics.systemHealth.issues.length > 0 && (
                <div className="dbg-issues-list">
                  {metrics.systemHealth.issues.map((issue, i) => (
                    <div key={i} className="dbg-issue">
                      {issue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Module Health */}
          <div className="dbg-metric-card">
            <div className="dbg-metric-header">
              <span className="dbg-metric-icon">🧩</span>
              <h4>Modules</h4>
            </div>
            <div className="dbg-metric-content">
              <div className="dbg-metric-value">
                {metrics.moduleHealth?.healthy_count || 0} /{' '}
                {metrics.moduleHealth?.total_count || 0}
              </div>
              <div className="dbg-metric-label">Modules sains</div>
              {metrics.moduleHealth?.unhealthy_modules &&
                metrics.moduleHealth.unhealthy_modules.length > 0 && (
                  <div className="dbg-unhealthy-list">
                    {metrics.moduleHealth.unhealthy_modules.map((mod, i) => (
                      <div key={i} className="dbg-unhealthy-module">
                        ⚠️ {mod}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* CPU/Memory */}
          {metrics.heliosMetrics && (
            <>
              {typeof metrics.heliosMetrics.cpu_usage === 'number' && (
                <div className="dbg-metric-card">
                  <div className="dbg-metric-header">
                    <span className="dbg-metric-icon">⚡</span>
                    <h4>CPU</h4>
                  </div>
                  <div className="dbg-metric-content">
                    <div className="dbg-metric-value">
                      {(metrics.heliosMetrics.cpu_usage * 100).toFixed(1)}%
                    </div>
                    <div className="dbg-progress-bar">
                      <div
                        className="dbg-progress-fill"
                        style={{
                          width: `${metrics.heliosMetrics.cpu_usage * 100}%`,
                          background:
                            metrics.heliosMetrics.cpu_usage > 0.8 ? '#ff0040' : '#00ff00',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {typeof metrics.heliosMetrics.memory_usage === 'number' && (
                <div className="dbg-metric-card">
                  <div className="dbg-metric-header">
                    <span className="dbg-metric-icon">💾</span>
                    <h4>Mémoire</h4>
                  </div>
                  <div className="dbg-metric-content">
                    <div className="dbg-metric-value">
                      {(metrics.heliosMetrics.memory_usage * 100).toFixed(1)}%
                    </div>
                    <div className="dbg-progress-bar">
                      <div
                        className="dbg-progress-fill"
                        style={{
                          width: `${metrics.heliosMetrics.memory_usage * 100}%`,
                          background:
                            metrics.heliosMetrics.memory_usage > 0.85
                              ? '#ff0040'
                              : '#00ff00',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {typeof metrics.heliosMetrics.coherence === 'number' && (
                <div className="dbg-metric-card">
                  <div className="dbg-metric-header">
                    <span className="dbg-metric-icon">🎯</span>
                    <h4>Cohérence</h4>
                  </div>
                  <div className="dbg-metric-content">
                    <div className="dbg-metric-value">
                      {(metrics.heliosMetrics.coherence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {typeof metrics.heliosMetrics.stability === 'number' && (
                <div className="dbg-metric-card">
                  <div className="dbg-metric-header">
                    <span className="dbg-metric-icon">🛡️</span>
                    <h4>Stabilité</h4>
                  </div>
                  <div className="dbg-metric-content">
                    <div className="dbg-metric-value">
                      {(metrics.heliosMetrics.stability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Engines Health */}
          {metrics.enginesHealth && (
            <div className="dbg-metric-card dbg-metric-card--wide">
              <div className="dbg-metric-header">
                <span className="dbg-metric-icon">🔧</span>
                <h4>Engines</h4>
              </div>
              <div className="dbg-metric-content">
                <div className="dbg-metric-value">
                  Santé Globale: {(metrics.enginesHealth.overall_health * 100).toFixed(0)}
                  %
                </div>
                <div className="dbg-engines-list">
                  {metrics.enginesHealth.engines?.map((engine, i) => (
                    <div key={i} className="dbg-engine-item">
                      <span
                        className={
                          engine.healthy ? 'dbg-engine-healthy' : 'dbg-engine-unhealthy'
                        }
                      >
                        {engine.healthy ? '✓' : '✗'}
                      </span>
                      <span className="dbg-engine-name">{engine.name}</span>
                      <span className="dbg-engine-load">
                        Load: {(engine.load * 100).toFixed(0)}%
                      </span>
                      {engine.errors > 0 && (
                        <span className="dbg-engine-errors">Errors: {engine.errors}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRiskAssessment = () => {
    if (!debugPanel.state.riskAssessment)
      return <div className="dbg-empty">Aucune évaluation disponible</div>;

    const assessment = debugPanel.state.riskAssessment;

    return (
      <div className="dbg-risk-assessment">
        {/* Overall Risk */}
        <div className="dbg-risk-overall">
          <div className="dbg-risk-score-circle">
            <div
              className="dbg-risk-score-fill"
              style={{
                background: `conic-gradient(${getRiskLevelColor(assessment.overall_risk)} ${
                  assessment.risk_score * 3.6
                }deg, #222 0deg)`,
              }}
            >
              <div className="dbg-risk-score-inner">
                <div className="dbg-risk-score-value">{assessment.risk_score}</div>
                <div className="dbg-risk-score-label">{assessment.overall_risk}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="dbg-risk-factors">
          <h3>Facteurs de Risque ({assessment.factors.length})</h3>
          {assessment.factors.map(factor => (
            <div
              key={factor.id}
              className="dbg-risk-factor"
              style={{ borderLeft: `4px solid ${getRiskLevelColor(factor.level)}` }}
            >
              <div className="dbg-risk-factor-header">
                <span
                  className="dbg-risk-level"
                  style={{ color: getRiskLevelColor(factor.level) }}
                >
                  {factor.level}
                </span>
                <span className="dbg-risk-category">{factor.category}</span>
              </div>
              <div className="dbg-risk-description">{factor.description}</div>
              {factor.mitigation && (
                <div className="dbg-risk-mitigation">💡 {factor.mitigation}</div>
              )}
              {factor.auto_fixable && (
                <button
                  className="dbg-btn dbg-btn-small"
                  onClick={() => handleAutoFix(factor.id)}
                >
                  🔧 Auto-Fix
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {assessment.recommendations.length > 0 && (
          <div className="dbg-recommendations">
            <h3>Recommandations</h3>
            {assessment.recommendations.map((rec, i) => (
              <div key={i} className="dbg-recommendation">
                💡 {rec}
              </div>
            ))}
          </div>
        )}

        {/* Auto-fixes */}
        {assessment.auto_fixes_available > 0 && (
          <div className="dbg-auto-fix-section">
            <button className="dbg-btn dbg-btn-primary" onClick={() => handleAutoFix()}>
              🔧 Appliquer Tous les Auto-Fixes ({assessment.auto_fixes_available})
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSnapshotDiff = () => {
    const snapshots = debugPanel.state.snapshots || [];

    return (
      <div className="dbg-snapshot-diff">
        {/* Snapshot Controls */}
        <div className="dbg-snapshot-controls">
          <div className="dbg-snapshot-select-group">
            <label>Snapshot A:</label>
            <select
              value={selectedSnapshotA}
              onChange={e => setSelectedSnapshotA(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {snapshots.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label || s.id} - {formatTimestamp(s.timestamp)}
                </option>
              ))}
            </select>
          </div>

          <div className="dbg-snapshot-select-group">
            <label>Snapshot B:</label>
            <select
              value={selectedSnapshotB}
              onChange={e => setSelectedSnapshotB(e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {snapshots.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label || s.id} - {formatTimestamp(s.timestamp)}
                </option>
              ))}
            </select>
          </div>

          <button className="dbg-btn" onClick={handleCompareSnapshots}>
            🔍 Comparer
          </button>
        </div>

        {/* Diff Results */}
        {snapshotDiff && (
          <div className="dbg-diff-results">
            <div className="dbg-diff-summary">
              <h3>Résumé des Changements</h3>
              <div className="dbg-diff-stats">
                <div className="dbg-diff-stat">
                  <span className="dbg-diff-stat-value" style={{ color: '#00ff00' }}>
                    {snapshotDiff.summary.added_count}
                  </span>
                  <span className="dbg-diff-stat-label">Ajouts</span>
                </div>
                <div className="dbg-diff-stat">
                  <span className="dbg-diff-stat-value" style={{ color: '#ff0040' }}>
                    {snapshotDiff.summary.removed_count}
                  </span>
                  <span className="dbg-diff-stat-label">Suppressions</span>
                </div>
                <div className="dbg-diff-stat">
                  <span className="dbg-diff-stat-value" style={{ color: '#ffaa00' }}>
                    {snapshotDiff.summary.modified_count}
                  </span>
                  <span className="dbg-diff-stat-label">Modifications</span>
                </div>
              </div>
            </div>

            <div className="dbg-diff-changes">
              {snapshotDiff.changes.map((change, _i) => (
                <div
                  key={_i}
                  className="dbg-diff-change"
                  style={{
                    borderLeft: `4px solid ${
                      change.type === 'added'
                        ? '#00ff00'
                        : change.type === 'removed'
                          ? '#ff0040'
                          : '#ffaa00'
                    }`,
                  }}
                >
                  <div className="dbg-diff-change-header">
                    <span className="dbg-diff-change-type">
                      {change.type.toUpperCase()}
                    </span>
                    <span className="dbg-diff-change-path">{change.path}</span>
                    <span className="dbg-diff-change-impact">
                      {(change as { impact?: string }).impact || 'medium'}
                    </span>
                  </div>
                  {change.old_value !== undefined && (
                    <div className="dbg-diff-change-value">
                      <strong>Ancien:</strong> {JSON.stringify(change.old_value)}
                    </div>
                  )}
                  {change.new_value !== undefined && (
                    <div className="dbg-diff-change-value">
                      <strong>Nouveau:</strong> {JSON.stringify(change.new_value)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Snapshot List */}
        <div className="dbg-snapshot-list">
          <h3>Snapshots Disponibles ({snapshots.length})</h3>
          {snapshots.map(snapshot => (
            <div key={snapshot.id} className="dbg-snapshot-item">
              <div className="dbg-snapshot-header">
                <span className="dbg-snapshot-label">
                  {snapshot.label || 'Sans label'}
                </span>
                <span className="dbg-snapshot-timestamp">
                  {formatTimestamp(snapshot.timestamp)}
                </span>
              </div>
              <div className="dbg-snapshot-meta">
                <span>Taille: {(snapshot.size_bytes / 1024).toFixed(1)} KB</span>
                <span>Durée capture: {formatDuration(snapshot.capture_duration_ms)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    return (
      <div className="dbg-history">
        <h3>Historique ({debugPanel.state.history.length})</h3>
        <div className="dbg-history-list">
          {debugPanel.state.history
            .slice()
            .reverse()
            .map((entry, i) => (
              <div key={i} className="dbg-history-entry">
                <span className="dbg-history-timestamp">
                  {formatTimestamp(entry.timestamp)}
                </span>
                <span className="dbg-history-mode">{entry.mode}</span>
                <span className="dbg-history-action">{entry.action}</span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="dbg-live-os-tab">
      {/* Header */}
      <div className="dbg-header">
        <div className="dbg-title-section">
          <h2 className="dbg-title">🔍 TITANE∞ DEBUGGER LIVE OS v21</h2>
          <div className="dbg-subtitle">
            Système de débogage temps réel et introspection profonde
          </div>
        </div>

        {/* Status */}
        <div className="dbg-status-section">
          <div
            className={`dbg-status-indicator ${debugPanel.isActive ? 'dbg-status-active' : ''}`}
          >
            {debugPanel.isActive ? '🟢 Actif' : '⚪ Inactif'}
          </div>
          {debugPanel.isActive && debugPanel.state.started_at && (
            <div className="dbg-uptime">
              Uptime: {formatDuration(Date.now() - debugPanel.state.started_at)}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {debugPanel.error && debugPanel.errorDetails && (
        <div className="dbg-error-banner">
          <div className="dbg-error-message">
            <span className="dbg-error-icon">⚠️</span>
            {debugPanel.error}
          </div>
          <button className="dbg-error-close" onClick={debugPanel.clearError}>
            ✕
          </button>
          <details className="dbg-error-details">
            <summary>🛠️ Détails techniques</summary>
            <div className="dbg-error-technical">
              <p>
                <strong>Détails:</strong> {debugPanel.errorDetails.technicalDetails}
              </p>
              <strong>Suggestions:</strong>
              <ul>
                {debugPanel.errorDetails.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      )}

      {/* Controls */}
      <div className="dbg-controls">
        <div className="dbg-mode-selector">
          <button
            className={`dbg-mode-btn ${selectedMode === 'LiveMonitor' ? 'dbg-mode-btn-active' : ''}`}
            onClick={() => handleSwitchMode('LiveMonitor')}
          >
            📊 Live Monitor
          </button>
          <button
            className={`dbg-mode-btn ${selectedMode === 'DeepTrace' ? 'dbg-mode-btn-active' : ''}`}
            onClick={() => handleSwitchMode('DeepTrace')}
          >
            🔬 Deep Trace
          </button>
          <button
            className={`dbg-mode-btn ${selectedMode === 'RiskAssessment' ? 'dbg-mode-btn-active' : ''}`}
            onClick={() => handleSwitchMode('RiskAssessment')}
          >
            ⚠️ Risk Assessment
          </button>
          <button
            className={`dbg-mode-btn ${selectedMode === 'CognitiveReplay' ? 'dbg-mode-btn-active' : ''}`}
            onClick={() => handleSwitchMode('CognitiveReplay')}
          >
            🧠 Cognitive Replay
          </button>
          <button
            className={`dbg-mode-btn ${selectedMode === 'OSSnapshotDiff' ? 'dbg-mode-btn-active' : ''}`}
            onClick={() => handleSwitchMode('OSSnapshotDiff')}
          >
            📸 Snapshot Diff
          </button>
          <button
            className={`dbg-mode-btn ${selectedMode === 'VisualSync' ? 'dbg-mode-btn-active' : ''}`}
            onClick={() => handleSwitchMode('VisualSync')}
          >
            🎨 Visual Sync
          </button>
        </div>

        <div className="dbg-action-buttons">
          {!debugPanel.isActive ? (
            <button
              className="dbg-btn dbg-btn-primary"
              onClick={handleStart}
              disabled={debugPanel.isLoading}
            >
              ▶️ Démarrer
            </button>
          ) : (
            <button className="dbg-btn dbg-btn-danger" onClick={handleStop}>
              ⏹️ Arrêter
            </button>
          )}

          <button
            className="dbg-btn"
            onClick={handleSnapshot}
            disabled={debugPanel.isCapturing}
          >
            📸 Snapshot
          </button>

          <button className="dbg-btn" onClick={handleSanityCheck}>
            🔍 Sanity Check
          </button>

          <div className="dbg-export-group">
            <select
              className="dbg-export-format"
              value={exportFormat}
              onChange={e => setExportFormat(e.target.value as 'json' | 'csv' | 'html')}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="html">HTML</option>
            </select>
            <button className="dbg-btn" onClick={handleExport}>
              💾 Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="dbg-stats-bar">
        <div className="dbg-stat">
          <span className="dbg-stat-label">Traces:</span>
          <span className="dbg-stat-value">{debugPanel.state.stats.total_traces}</span>
        </div>
        <div className="dbg-stat">
          <span className="dbg-stat-label">Snapshots:</span>
          <span className="dbg-stat-value">{debugPanel.state.stats.total_snapshots}</span>
        </div>
        <div className="dbg-stat">
          <span className="dbg-stat-label">Erreurs:</span>
          <span className="dbg-stat-value">{debugPanel.state.stats.total_errors}</span>
        </div>
        <div className="dbg-stat">
          <span className="dbg-stat-label">Fixes:</span>
          <span className="dbg-stat-value">
            {debugPanel.state.stats.total_fixes_applied}
          </span>
        </div>
      </div>

      {/* Mode Content */}
      <div className="dbg-mode-content">
        {debugPanel.currentMode === 'LiveMonitor' && renderLiveMonitor()}
        {debugPanel.currentMode === 'RiskAssessment' && renderRiskAssessment()}
        {debugPanel.currentMode === 'OSSnapshotDiff' && renderSnapshotDiff()}
        {debugPanel.currentMode === 'DeepTrace' && renderHistory()}
        {debugPanel.currentMode === 'CognitiveReplay' && (
          <div className="dbg-empty">Mode Cognitive Replay (À implémenter)</div>
        )}
        {debugPanel.currentMode === 'VisualSync' && (
          <div className="dbg-empty">Mode Visual Sync (À implémenter)</div>
        )}
      </div>
    </div>
  );
}
