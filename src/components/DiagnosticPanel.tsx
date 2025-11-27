/**
 * TITANE∞ v19.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v19.1.0 - DIAGNOSTIC PANEL UI
 *   Panneau auto-diagnostic système avec tests intégrés
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import {
  runAllTests,
  getSystemDiagnostic,
  loadLastTestResults,
  saveTestResults,
  exportTestResults,
  type SystemSelfTestResult,
  type ModuleStatus,
} from '../services/selftest/systemSelfTest';
import './DiagnosticPanel.css';

export const DiagnosticPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SystemSelfTestResult | null>(null);
  const [quickDiagnostic, setQuickDiagnostic] = useState<{
    status: 'ok' | 'warn' | 'error';
    message: string;
  } | null>(null);

  // Charger derniers résultats au mount
  useEffect(() => {
    const lastResults = loadLastTestResults();
    if (lastResults) {
      setResults(lastResults);
    }

    // Quick diagnostic initial
    getSystemDiagnostic().then(setQuickDiagnostic);
  }, []);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const testResults = await runAllTests();
      setResults(testResults);
      saveTestResults(testResults);

      // Update quick diagnostic
      const diagnostic = await getSystemDiagnostic();
      setQuickDiagnostic(diagnostic);
    } catch (error) {
      console.error('Failed to run tests:', error);
      alert(`Erreur tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportJSON = () => {
    if (!results) return;

    const json = exportTestResults(results);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titane-diagnostic-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: ModuleStatus): string => {
    switch (status) {
      case 'ok':
        return '#00ff00';
      case 'warn':
        return '#ffa500';
      case 'error':
        return '#ff0000';
      case 'skip':
        return '#888888';
      default:
        return '#ffffff';
    }
  };

  const getStatusIcon = (status: ModuleStatus): string => {
    switch (status) {
      case 'ok':
        return '✓';
      case 'warn':
        return '⚠';
      case 'error':
        return '✗';
      case 'skip':
        return '○';
      default:
        return '?';
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  return (
    <div className="diagnostic-panel">
      <div className="diagnostic-header">
        <h2>TITANE∞ System Diagnostics</h2>
        <p className="diagnostic-version">v19.1.0</p>
      </div>

      {/* Quick Status */}
      {quickDiagnostic && (
        <div
          className="quick-status"
          style={{
            backgroundColor:
              quickDiagnostic.status === 'ok'
                ? 'rgba(0, 255, 0, 0.1)'
                : quickDiagnostic.status === 'warn'
                ? 'rgba(255, 165, 0, 0.1)'
                : 'rgba(255, 0, 0, 0.1)',
            borderLeft: `4px solid ${
              quickDiagnostic.status === 'ok'
                ? '#00ff00'
                : quickDiagnostic.status === 'warn'
                ? '#ffa500'
                : '#ff0000'
            }`,
          }}
        >
          <span className="quick-status-icon">
            {quickDiagnostic.status === 'ok'
              ? '✓'
              : quickDiagnostic.status === 'warn'
              ? '⚠'
              : '✗'}
          </span>
          <span className="quick-status-message">{quickDiagnostic.message}</span>
        </div>
      )}

      {/* Actions */}
      <div className="diagnostic-actions">
        <button
          className="btn-run-tests"
          onClick={handleRunTests}
          disabled={isRunning}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>

        {results && (
          <button className="btn-export" onClick={handleExportJSON}>
            Export JSON
          </button>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="diagnostic-results">
          <div className="results-header">
            <h3>Test Results</h3>
            <span className="results-timestamp">{formatDate(results.timestamp)}</span>
          </div>

          {/* Summary */}
          <div className="results-summary">
            <div className="summary-item">
              <span className="summary-label">Total Latency:</span>
              <span className="summary-value">{results.totalLatency_ms}ms</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Modules:</span>
              <span className="summary-value">{results.modulesCount}</span>
            </div>
            <div className="summary-stats">
              <span className="stat-ok" style={{ color: '#00ff00' }}>
                OK: {results.summary.ok}
              </span>
              <span className="stat-warn" style={{ color: '#ffa500' }}>
                WARN: {results.summary.warn}
              </span>
              <span className="stat-error" style={{ color: '#ff0000' }}>
                ERROR: {results.summary.error}
              </span>
            </div>
          </div>

          {/* Modules */}
          <div className="modules-list">
            {Object.entries(results.modules).map(([key, module]) => (
              <div
                key={key}
                className="module-item"
                style={{
                  borderLeft: `4px solid ${getStatusColor(module.status)}`,
                }}
              >
                <div className="module-header">
                  <span
                    className="module-icon"
                    style={{ color: getStatusColor(module.status) }}
                  >
                    {getStatusIcon(module.status)}
                  </span>
                  <span className="module-name">{module.name}</span>
                  <span className="module-latency">{module.latency_ms}ms</span>
                </div>
                <div className="module-message">{module.message}</div>
                {module.error && (
                  <div className="module-error">Error: {module.error}</div>
                )}
                {module.details && (
                  <details className="module-details">
                    <summary>Details</summary>
                    <pre>{JSON.stringify(module.details, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isRunning && (
        <div className="diagnostic-loading">
          <div className="spinner"></div>
          <p>Running diagnostic tests...</p>
        </div>
      )}

      {/* No Results */}
      {!results && !isRunning && (
        <div className="diagnostic-empty">
          <p>No test results available.</p>
          <p>Click "Run All Tests" to start diagnostics.</p>
        </div>
      )}
    </div>
  );
};
