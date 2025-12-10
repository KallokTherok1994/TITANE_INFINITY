/**
 * TITANE∞ v∞ — HyperVision Tab
 *
 * Onglet de monitoring système temps réel
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useHyperVision } from '../hooks/useHyperVision';
import type { AnomalySeverity } from '../types/systemCenter.types';

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

const getSeverityClass = (severity: AnomalySeverity): string => {
  switch (severity) {
    case 'Critical':
      return 'sc-anomaly--critical';
    case 'High':
      return 'sc-anomaly--high';
    case 'Medium':
      return 'sc-anomaly--medium';
    case 'Low':
      return 'sc-anomaly--low';
    default:
      return '';
  }
};

const getSeverityIcon = (severity: AnomalySeverity): string => {
  switch (severity) {
    case 'Critical':
      return '🔴';
    case 'High':
      return '🟠';
    case 'Medium':
      return '🟡';
    case 'Low':
      return '🟢';
    default:
      return '⚪';
  }
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatMB = (mb: number): string => {
  if (mb < 1024) return `${mb.toFixed(0)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
};

// ══════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════

export const HyperVisionTab: React.FC = () => {
  const hvData = useHyperVision(true, 3000);

  const {
    metrics,
    layers,
    anomalies,
    isMonitoring,
    error,
    startMonitoring,
    stopMonitoring,
  } = hvData;

  // Active anomalies count
  const activeAnomalies = useMemo(
    () => anomalies.filter(a => !a.auto_resolved).length,
    [anomalies]
  );

  // Critical anomalies
  const criticalCount = useMemo(
    () => anomalies.filter(a => a.severity === 'Critical' && !a.auto_resolved).length,
    [anomalies]
  );

  return (
    <div className="sc-hypervision">
      {/* Control Header */}
      <div className="sc-hv-header">
        <div className="sc-hv-status">
          <span
            className={`sc-status-dot ${isMonitoring ? 'sc-status-dot--active' : ''}`}
          />
          <span>{isMonitoring ? 'Monitoring actif' : 'Monitoring inactif'}</span>
        </div>
        <div className="sc-hv-actions">
          {!isMonitoring ? (
            <button className="sc-btn sc-btn--primary" onClick={startMonitoring}>
              ▶️ Démarrer
            </button>
          ) : (
            <button className="sc-btn sc-btn--danger" onClick={stopMonitoring}>
              ⏹️ Arrêter
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="sc-error">
          <span className="sc-error-icon">⚠️</span>
          <span className="sc-error-message">{error}</span>
        </div>
      )}

      {/* Metrics Dashboard */}
      {metrics && (
        <motion.div
          className="sc-metrics-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="sc-section-title">📊 Métriques Système</h3>

          <div className="sc-metrics-grid">
            {/* CPU */}
            <div className="sc-metric-card">
              <div className="sc-metric-header">
                <span className="sc-metric-icon">🖥️</span>
                <span className="sc-metric-label">CPU</span>
              </div>
              <div className="sc-metric-gauge">
                <svg viewBox="0 0 100 50" className="sc-gauge-svg">
                  <path
                    d="M 5 50 A 45 45 0 0 1 95 50"
                    fill="none"
                    stroke="var(--color-bg-tertiary)"
                    strokeWidth="8"
                  />
                  <path
                    d="M 5 50 A 45 45 0 0 1 95 50"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="8"
                    strokeDasharray={`${metrics.cpu_usage * 1.41} 141.3`}
                  />
                </svg>
                <span className="sc-gauge-value">{metrics.cpu_usage.toFixed(1)}%</span>
              </div>
            </div>

            {/* Memory */}
            <div className="sc-metric-card">
              <div className="sc-metric-header">
                <span className="sc-metric-icon">🧠</span>
                <span className="sc-metric-label">Mémoire</span>
              </div>
              <div className="sc-metric-bar">
                <div
                  className="sc-metric-bar-fill"
                  style={{ width: `${metrics.memory_usage}%` }}
                />
                <span className="sc-metric-bar-text">
                  {formatMB(metrics.memory_used_mb)} / {formatMB(metrics.memory_total_mb)}
                </span>
              </div>
              <span className="sc-metric-value">{metrics.memory_usage.toFixed(1)}%</span>
            </div>

            {/* Disk */}
            <div className="sc-metric-card">
              <div className="sc-metric-header">
                <span className="sc-metric-icon">💾</span>
                <span className="sc-metric-label">Disque</span>
              </div>
              <div className="sc-metric-bar">
                <div
                  className="sc-metric-bar-fill"
                  style={{ width: `${metrics.disk_usage}%` }}
                />
                <span className="sc-metric-bar-text">
                  {metrics.disk_used_gb.toFixed(1)} GB /{' '}
                  {metrics.disk_total_gb.toFixed(1)} GB
                </span>
              </div>
              <span className="sc-metric-value">{metrics.disk_usage.toFixed(1)}%</span>
            </div>

            {/* Network */}
            <div className="sc-metric-card">
              <div className="sc-metric-header">
                <span className="sc-metric-icon">🌐</span>
                <span className="sc-metric-label">Réseau</span>
              </div>
              <div className="sc-metric-network">
                <div className="sc-network-stat">
                  <span className="sc-network-dir">↓</span>
                  <span>{formatBytes(metrics.network_rx_bytes)}/s</span>
                </div>
                <div className="sc-network-stat">
                  <span className="sc-network-dir">↑</span>
                  <span>{formatBytes(metrics.network_tx_bytes)}/s</span>
                </div>
              </div>
            </div>

            {/* Coherence */}
            <div className="sc-metric-card">
              <div className="sc-metric-header">
                <span className="sc-metric-icon">🔗</span>
                <span className="sc-metric-label">Cohérence</span>
              </div>
              <span className="sc-metric-value sc-metric-value--large">
                {(metrics.coherence * 100).toFixed(1)}%
              </span>
            </div>

            {/* Stability */}
            <div className="sc-metric-card">
              <div className="sc-metric-header">
                <span className="sc-metric-icon">⚖️</span>
                <span className="sc-metric-label">Stabilité</span>
              </div>
              <span className="sc-metric-value sc-metric-value--large">
                {(metrics.stability * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Layers Section */}
      {layers.length > 0 && (
        <motion.div
          className="sc-layers-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="sc-section-title">🔲 Couches Système ({layers.length})</h3>

          <div className="sc-layers-grid">
            {layers.map((layer, index) => (
              <motion.div
                key={layer.layer_id}
                className={`sc-layer-card ${layer.status === 'Healthy' ? 'sc-layer-card--active' : 'sc-layer-card--inactive'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="sc-layer-header">
                  <span
                    className={`sc-layer-status ${layer.status === 'Healthy' ? 'sc-layer-status--on' : ''}`}
                  />
                  <span className="sc-layer-name">{layer.name}</span>
                </div>
                <div className="sc-layer-stats">
                  <div className="sc-layer-stat">
                    <span className="sc-layer-stat-label">Santé</span>
                    <div className="sc-mini-progress">
                      <div
                        className="sc-mini-progress-bar"
                        style={{ width: `${layer.health}%` }}
                      />
                    </div>
                    <span className="sc-layer-stat-value">{layer.health}%</span>
                  </div>
                  <div className="sc-layer-stat">
                    <span className="sc-layer-stat-label">Charge</span>
                    <div className="sc-mini-progress">
                      <div
                        className="sc-mini-progress-bar sc-mini-progress-bar--load"
                        style={{ width: `${layer.load}%` }}
                      />
                    </div>
                    <span className="sc-layer-stat-value">{layer.load}%</span>
                  </div>
                </div>
                {(layer.errors > 0 || layer.warnings > 0) && (
                  <div className="sc-layer-alerts">
                    {layer.errors > 0 && (
                      <span className="sc-alert sc-alert--error">🔴 {layer.errors}</span>
                    )}
                    {layer.warnings > 0 && (
                      <span className="sc-alert sc-alert--warn">🟡 {layer.warnings}</span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Anomalies Section */}
      <motion.div
        className="sc-anomalies-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="sc-anomalies-header">
          <h3 className="sc-section-title">
            ⚠️ Anomalies
            {activeAnomalies > 0 && (
              <span className="sc-anomaly-badge">{activeAnomalies}</span>
            )}
            {criticalCount > 0 && (
              <span className="sc-anomaly-badge sc-anomaly-badge--critical">
                {criticalCount} critiques
              </span>
            )}
          </h3>
        </div>

        {anomalies.length === 0 ? (
          <div className="sc-empty-state">
            <span className="sc-empty-icon">✅</span>
            <p>Aucune anomalie détectée</p>
            <p className="sc-empty-hint">Le système fonctionne normalement</p>
          </div>
        ) : (
          <div className="sc-anomalies-list">
            {anomalies.map((anomaly, index) => (
              <motion.div
                key={anomaly.id}
                className={`sc-anomaly ${getSeverityClass(anomaly.severity)} ${anomaly.auto_resolved ? 'sc-anomaly--resolved' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
              >
                <div className="sc-anomaly-header">
                  <span className="sc-anomaly-severity">
                    {getSeverityIcon(anomaly.severity)} {anomaly.severity}
                  </span>
                  <span className="sc-anomaly-layer">{anomaly.layer}</span>
                  {anomaly.auto_resolved && (
                    <span className="sc-anomaly-resolved-badge">✓ Résolu</span>
                  )}
                </div>
                <p className="sc-anomaly-message">{anomaly.description}</p>
                <div className="sc-anomaly-footer">
                  <span className="sc-anomaly-time">
                    {new Date(anomaly.timestamp).toLocaleTimeString('fr-FR')}
                  </span>
                  {anomaly.metric && (
                    <span className="sc-anomaly-metric">
                      📊 {anomaly.metric}: {anomaly.value?.toFixed(2)} (seuil:{' '}
                      {anomaly.threshold})
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Not Monitoring State */}
      {!isMonitoring && !metrics && (
        <div className="sc-empty-state sc-empty-state--large">
          <span className="sc-empty-icon">👁️</span>
          <p>HyperVision désactivé</p>
          <p className="sc-empty-hint">
            Démarrez le monitoring pour surveiller le système en temps réel
          </p>
        </div>
      )}
    </div>
  );
};

export default HyperVisionTab;
