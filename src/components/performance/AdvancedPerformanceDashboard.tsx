/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.5.0 — Advanced Performance Dashboard
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Dashboard de monitoring de performance avancé avec:
 * - Graphiques temps réel
 * - Détection bottlenecks
 * - Suggestions d'optimisation
 * - Analyse prédictive
 * - Heatmaps visuelles
 *
 * @version 25.5.0
 * @created 2025-12-16
 */

import React, { useState } from 'react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';
import type {
  PerformanceBottleneck,
  OptimizationSuggestion,
} from '@/modules/performance/AdvancedPerformanceMonitor';
import './AdvancedPerformanceDashboard.css';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const AdvancedPerformanceDashboard: React.FC = () => {
  const {
    isMonitoring,
    snapshots,
    bottlenecks,
    predictive,
    currentMetrics,
    healthScores,
    start,
    stop,
    clear,
    refresh,
    applyOptimization,
  } = useAdvancedPerformance({
    enabled: true,
    interval: 1000,
    onBottleneckDetected: bottleneck => {
      console.warn('[Performance] Bottleneck detected:', bottleneck.description);
    },
    onCriticalIssue: issue => {
      console.error('[Performance] CRITICAL:', issue.description);
    },
  });

  const [selectedBottleneck, setSelectedBottleneck] =
    useState<PerformanceBottleneck | null>(null);
  const [autoOptimEnabled, setAutoOptimEnabled] = useState(false);

  /**
   * Rendu de la jauge de santé
   */
  const renderHealthGauge = (score: number, label: string) => {
    let color = 'var(--color-success)';
    let status = 'Excellent';

    if (score < 50) {
      color = 'var(--color-error)';
      status = 'Critique';
    } else if (score < 70) {
      color = 'var(--color-warning)';
      status = 'Attention';
    } else if (score < 85) {
      color = 'var(--color-info)';
      status = 'Bon';
    }

    return (
      <div className="health-gauge">
        <div className="health-gauge-header">
          <span className="health-gauge-label">{label}</span>
          <span className="health-gauge-status" style={{ color }}>
            {status}
          </span>
        </div>
        <div className="health-gauge-bar">
          <div
            className="health-gauge-fill"
            style={{
              width: `${score}%`,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
            }}
          />
        </div>
        <div className="health-gauge-score">{score}/100</div>
      </div>
    );
  };

  /**
   * Rendu du graphique simplifié
   */
  const renderMiniChart = (
    data: number[],
    label: string,
    unit: string,
    color: string
  ) => {
    if (data.length === 0) return null;

    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <div className="mini-chart">
        <div className="mini-chart-header">
          <span className="mini-chart-label">{label}</span>
          <span className="mini-chart-value" style={{ color }}>
            {(data[data.length - 1] ?? 0).toFixed(1)} {unit}
          </span>
        </div>
        <svg className="mini-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <polygon points={`0,100 ${points} 100,100`} fill={`url(#gradient-${label})`} />
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    );
  };

  /**
   * Rendu de la carte bottleneck
   */
  const renderBottleneckCard = (bottleneck: PerformanceBottleneck) => {
    const severityColors = {
      critical: 'var(--color-error)',
      high: 'var(--color-warning)',
      medium: 'var(--color-info)',
      low: 'var(--color-success)',
    };

    const severityIcons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    };

    return (
      <div
        key={bottleneck.id}
        className={`bottleneck-card ${selectedBottleneck?.id === bottleneck.id ? 'selected' : ''}`}
        onClick={() => setSelectedBottleneck(bottleneck)}
        style={{ borderLeft: `4px solid ${severityColors[bottleneck.severity]}` }}
      >
        <div className="bottleneck-header">
          <span className="bottleneck-icon">{severityIcons[bottleneck.severity]}</span>
          <span className="bottleneck-category">{bottleneck.category.toUpperCase()}</span>
          <span className="bottleneck-severity">{bottleneck.severity}</span>
        </div>
        <div className="bottleneck-description">{bottleneck.description}</div>
        <div className="bottleneck-impact">Impact: {bottleneck.impact.toFixed(0)}%</div>
        <div className="bottleneck-suggestions-count">
          {bottleneck.suggestions.length} suggestion
          {bottleneck.suggestions.length > 1 ? 's' : ''}
        </div>
      </div>
    );
  };

  /**
   * Rendu de la carte suggestion
   */
  const renderSuggestionCard = (suggestion: OptimizationSuggestion) => {
    const difficultyColors = {
      easy: 'var(--color-success)',
      medium: 'var(--color-warning)',
      hard: 'var(--color-error)',
    };

    return (
      <div key={suggestion.id} className="suggestion-card">
        <div className="suggestion-header">
          <span className="suggestion-title">{suggestion.title}</span>
          <span
            className="suggestion-difficulty"
            style={{ background: difficultyColors[suggestion.difficulty] }}
          >
            {suggestion.difficulty}
          </span>
        </div>
        <div className="suggestion-description">{suggestion.description}</div>
        <div className="suggestion-footer">
          <div className="suggestion-impact">Impact: +{suggestion.estimatedImpact}%</div>
          <div className="suggestion-priority">Priorité: {suggestion.priority}/10</div>
          {suggestion.autoApplicable && (
            <button
              className="suggestion-apply-btn"
              onClick={() => applyOptimization(suggestion.id)}
            >
              Appliquer
            </button>
          )}
        </div>
        {suggestion.codeExample && (
          <details className="suggestion-code">
            <summary>Voir code exemple</summary>
            <pre>{suggestion.codeExample}</pre>
          </details>
        )}
      </div>
    );
  };

  // Préparer les données des graphiques
  const cpuData = snapshots.map(s => s.cpu.usage);
  const memoryData = snapshots.map(s => s.memory.heapUsed / 1024 / 1024); // MB
  const fpsData = snapshots.map(s => s.rendering.fps);
  const latencyData = snapshots.map(s => s.network.latency);

  return (
    <div className="advanced-performance-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          ⚡ Advanced Performance Monitor
          <span className="dashboard-version">v25.5.0</span>
        </h1>

        <div className="dashboard-controls">
          <button
            className={`control-btn ${isMonitoring ? 'active' : ''}`}
            onClick={isMonitoring ? stop : start}
          >
            {isMonitoring ? '⏸️ Pause' : '▶️ Start'}
          </button>
          <button className="control-btn" onClick={refresh}>
            🔄 Refresh
          </button>
          <button className="control-btn" onClick={clear}>
            🗑️ Clear
          </button>
          <label className="control-toggle">
            <input
              type="checkbox"
              checked={autoOptimEnabled}
              onChange={e => setAutoOptimEnabled(e.target.checked)}
            />
            <span>Auto-Optim</span>
          </label>
        </div>
      </div>

      {/* Overall Health */}
      <div className="dashboard-section">
        <h2 className="section-title">🏥 Santé Globale</h2>
        <div className="health-grid">
          {renderHealthGauge(healthScores.overall, 'Overall')}
          {renderHealthGauge(healthScores.cpu, 'CPU')}
          {renderHealthGauge(healthScores.memory, 'Memory')}
          {renderHealthGauge(healthScores.rendering, 'Rendering')}
          {renderHealthGauge(healthScores.network, 'Network')}
        </div>
      </div>

      {/* Current Metrics */}
      <div className="dashboard-section">
        <h2 className="section-title">📊 Métriques Temps Réel</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">CPU Usage</div>
            <div className="metric-value">{currentMetrics.cpu.toFixed(1)}%</div>
            <div className="metric-trend">
              {renderMiniChart(cpuData.slice(-30), 'cpu', '%', '#3b82f6')}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Memory</div>
            <div className="metric-value">
              {(currentMetrics.memory / 1024 / 1024).toFixed(0)} MB
            </div>
            <div className="metric-trend">
              {renderMiniChart(memoryData.slice(-30), 'memory', 'MB', '#10b981')}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">FPS</div>
            <div className="metric-value">{currentMetrics.fps.toFixed(0)}</div>
            <div className="metric-trend">
              {renderMiniChart(fpsData.slice(-30), 'fps', 'FPS', '#f59e0b')}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">Latency</div>
            <div className="metric-value">{currentMetrics.latency.toFixed(0)} ms</div>
            <div className="metric-trend">
              {renderMiniChart(latencyData.slice(-30), 'latency', 'ms', '#ef4444')}
            </div>
          </div>
        </div>
      </div>

      {/* Bottlenecks */}
      {bottlenecks.length > 0 && (
        <div className="dashboard-section">
          <h2 className="section-title">
            🚨 Bottlenecks Détectés ({bottlenecks.length})
          </h2>
          <div className="bottlenecks-grid">{bottlenecks.map(renderBottleneckCard)}</div>
        </div>
      )}

      {/* Selected Bottleneck Suggestions */}
      {selectedBottleneck && (
        <div className="dashboard-section">
          <h2 className="section-title">
            💡 Suggestions pour: {selectedBottleneck.category}
          </h2>
          <div className="suggestions-grid">
            {selectedBottleneck.suggestions.map(renderSuggestionCard)}
          </div>
        </div>
      )}

      {/* Predictive Analysis */}
      {predictive && (
        <div className="dashboard-section">
          <h2 className="section-title">🔮 Analyse Prédictive</h2>
          <div className="predictive-panel">
            <div className="predictive-card">
              <div className="predictive-label">Crash Probability (1h)</div>
              <div
                className="predictive-value"
                style={{
                  color:
                    predictive.crashProbability > 0.7
                      ? 'var(--color-error)'
                      : predictive.crashProbability > 0.3
                        ? 'var(--color-warning)'
                        : 'var(--color-success)',
                }}
              >
                {(predictive.crashProbability * 100).toFixed(1)}%
              </div>
            </div>

            <div className="predictive-card">
              <div className="predictive-label">Performance Trend</div>
              <div className="predictive-value">
                {predictive.performanceTrend === 'improving' && '📈 Amélioration'}
                {predictive.performanceTrend === 'degrading' && '📉 Dégradation'}
                {predictive.performanceTrend === 'stable' && '📊 Stable'}
              </div>
            </div>

            <div className="predictive-card">
              <div className="predictive-label">Confiance</div>
              <div className="predictive-value">
                {(predictive.confidence * 100).toFixed(0)}%
              </div>
            </div>

            {predictive.recommendedActions.length > 0 && (
              <div className="predictive-actions">
                <h3>Actions Recommandées</h3>
                {predictive.recommendedActions.slice(0, 3).map(action => {
                  if (!action) return null;
                  return (
                    <div key={action.id} className="predictive-action">
                      • {action.title} (+{action.estimatedImpact}%)
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="dashboard-footer">
        <div className="footer-stat">
          <span className="footer-label">Snapshots:</span>
          <span className="footer-value">{snapshots.length}</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">Monitoring:</span>
          <span className="footer-value">{isMonitoring ? '🟢 Active' : '🔴 Paused'}</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">Auto-Optim:</span>
          <span className="footer-value">{autoOptimEnabled ? '✅ ON' : '❌ OFF'}</span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPerformanceDashboard;
