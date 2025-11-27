// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v19.8 - QA PANEL UI
//   Interface de contrôle système de tests automatisés
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './TitaneQAPanel.css';

// ═══════════════════════════════════════════════════════════════
// Types Rust → TypeScript
// ═══════════════════════════════════════════════════════════════

interface QaSubResult {
  name: string;
  status: 'OK' | 'WARN' | 'ERROR';
  message: string;
  latency_ms: number;
}

interface QaResult {
  module: string;
  status: 'OK' | 'WARN' | 'ERROR';
  latency_ms: number;
  error_message?: string;
  anomalies_detected: string[];
  subtests: QaSubResult[];
  timestamp: string;
}

interface QaSummary {
  total_tests: number;
  passed: number;
  warnings: number;
  errors: number;
  anomalies_count: number;
}

interface QaReport {
  version: string;
  timestamp: string;
  duration_ms: number;
  results: QaResult[];
  global_score: number;
  summary: QaSummary;
}

// ═══════════════════════════════════════════════════════════════
// Composant principal TitaneQAPanel
// ═══════════════════════════════════════════════════════════════

export const TitaneQAPanel: React.FC = () => {
  const [report, setReport] = useState<QaReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger dernier rapport au montage
  useEffect(() => {
    loadLastReport();
  }, []);

  /**
   * Charge le dernier rapport QA disponible
   */
  const loadLastReport = async () => {
    try {
      const lastReport = await invoke<QaReport | null>('qa_get_last_report');
      if (lastReport) {
        setReport(lastReport);
      }
    } catch (error) {
      console.error('[QA Panel] Failed to load last report:', error);
    }
  };

  /**
   * Lance tous les tests QA
   */
  const runFullQA = async () => {
    setLoading(true);
    try {
      const newReport = await invoke<QaReport>('qa_run_all');
      setReport(newReport);
      console.log('[QA Panel] Full QA completed:', newReport);
    } catch (error) {
      console.error('[QA Panel] Full QA failed:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lance un test de module spécifique
   */
  const runModuleQA = async (moduleName: string) => {
    setLoading(true);
    try {
      const result = await invoke<QaResult>('qa_run_module', { moduleName });
      console.log(`[QA Panel] Module ${moduleName} tested:`, result);

      // Mise à jour partielle du rapport
      if (report) {
        const updatedResults = report.results.map((r) =>
          r.module === result.module ? result : r
        );
        setReport({ ...report, results: updatedResults });
      }
    } catch (error) {
      console.error(`[QA Panel] Module ${moduleName} test failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exporte le rapport en JSON
   */
  const exportReportJSON = () => {
    if (!report) return;

    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `titane_qa_report_${report.timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('[QA Panel] Report exported');
  };

  /**
   * Obtient la couleur selon le status
   */
  const getStatusColor = (status: 'OK' | 'WARN' | 'ERROR'): string => {
    switch (status) {
      case 'OK':
        return '#00ff88';
      case 'WARN':
        return '#ffaa00';
      case 'ERROR':
        return '#ff4444';
    }
  };

  /**
   * Obtient l'icône selon le status
   */
  const getStatusIcon = (status: 'OK' | 'WARN' | 'ERROR'): string => {
    switch (status) {
      case 'OK':
        return '✓';
      case 'WARN':
        return '⚠';
      case 'ERROR':
        return '✗';
    }
  };

  return (
    <div className="titane-qa-panel">
      {/* Header */}
      <div className="qa-header">
        <h1>🧪 TITANE∞ QA SYSTEM v19.8</h1>
        <div className="qa-actions">
          <button
            className="btn-primary"
            onClick={runFullQA}
            disabled={loading}
          >
            {loading ? '⏳ RUNNING...' : '▶ RUN FULL QA'}
          </button>
          <button
            className="btn-secondary"
            onClick={loadLastReport}
            disabled={loading}
          >
            🔄 REFRESH
          </button>
          <button
            className="btn-secondary"
            onClick={exportReportJSON}
            disabled={!report || loading}
          >
            💾 EXPORT JSON
          </button>
        </div>
      </div>

      {/* Global Status */}
      {report && (
        <div className="qa-global-status">
          <div className="status-card">
            <h3>GLOBAL SCORE</h3>
            <div
              className="score-display"
              style={{
                color:
                  report.global_score >= 80
                    ? '#00ff88'
                    : report.global_score >= 50
                    ? '#ffaa00'
                    : '#ff4444',
              }}
            >
              {report.global_score.toFixed(1)}%
            </div>
          </div>

          <div className="status-card">
            <h3>TESTS</h3>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{report.summary.total_tests}</span>
              </div>
              <div className="stat">
                <span className="stat-label">✓ Passed:</span>
                <span className="stat-value" style={{ color: '#00ff88' }}>
                  {report.summary.passed}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">⚠ Warnings:</span>
                <span className="stat-value" style={{ color: '#ffaa00' }}>
                  {report.summary.warnings}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">✗ Errors:</span>
                <span className="stat-value" style={{ color: '#ff4444' }}>
                  {report.summary.errors}
                </span>
              </div>
            </div>
          </div>

          <div className="status-card">
            <h3>PERFORMANCE</h3>
            <div className="stats-grid">
              <div className="stat">
                <span className="stat-label">Duration:</span>
                <span className="stat-value">{report.duration_ms}ms</span>
              </div>
              <div className="stat">
                <span className="stat-label">Anomalies:</span>
                <span className="stat-value" style={{ color: '#ffaa00' }}>
                  {report.summary.anomalies_count}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module Results */}
      {report && (
        <div className="qa-modules">
          <h2>MODULE TESTS</h2>
          <div className="modules-grid">
            {report.results.map((result) => (
              <div
                key={result.module}
                className="module-card"
                style={{ borderColor: getStatusColor(result.status) }}
              >
                <div className="module-header">
                  <h3>
                    <span
                      className="status-icon"
                      style={{ color: getStatusColor(result.status) }}
                    >
                      {getStatusIcon(result.status)}
                    </span>
                    {result.module}
                  </h3>
                  <button
                    className="btn-small"
                    onClick={() => runModuleQA(result.module.toLowerCase())}
                    disabled={loading}
                  >
                    🔄 RE-TEST
                  </button>
                </div>

                <div className="module-stats">
                  <div className="stat-row">
                    <span>Status:</span>
                    <span style={{ color: getStatusColor(result.status) }}>
                      {result.status}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span>Latency:</span>
                    <span
                      style={{
                        color:
                          result.latency_ms < 100
                            ? '#00ff88'
                            : result.latency_ms < 500
                            ? '#ffaa00'
                            : '#ff4444',
                      }}
                    >
                      {result.latency_ms}ms
                    </span>
                  </div>
                  {result.error_message && (
                    <div className="error-message">
                      ❌ {result.error_message}
                    </div>
                  )}
                </div>

                {/* Subtests */}
                {result.subtests.length > 0 && (
                  <div className="subtests">
                    <h4>Subtests:</h4>
                    {result.subtests.map((subtest, idx) => (
                      <div key={idx} className="subtest-row">
                        <span
                          className="subtest-icon"
                          style={{ color: getStatusColor(subtest.status) }}
                        >
                          {getStatusIcon(subtest.status)}
                        </span>
                        <span className="subtest-name">{subtest.name}</span>
                        <span className="subtest-latency">
                          {subtest.latency_ms}ms
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Anomalies */}
                {result.anomalies_detected.length > 0 && (
                  <div className="anomalies">
                    <h4>⚠ Anomalies:</h4>
                    {result.anomalies_detected.map((anomaly, idx) => (
                      <div key={idx} className="anomaly-row">
                        • {anomaly}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Logs */}
      {report && (
        <div className="qa-logs">
          <h2>📋 STRUCTURED LOGS</h2>
          <div className="logs-container">
            <pre>{JSON.stringify(report, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!report && !loading && (
        <div className="qa-empty-state">
          <div className="empty-icon">🧪</div>
          <h2>No QA Report Available</h2>
          <p>Run your first QA test to see results here</p>
          <button className="btn-primary" onClick={runFullQA}>
            ▶ RUN FULL QA
          </button>
        </div>
      )}
    </div>
  );
};

export default TitaneQAPanel;
