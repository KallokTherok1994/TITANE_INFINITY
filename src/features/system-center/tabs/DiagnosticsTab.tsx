/**
 * TITANE∞ v∞ — Diagnostics Tab
 *
 * Onglet des diagnostics système
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSystemDiagnostics } from '../hooks/useSystemDiagnostics';
import type { DiagnosticStatus } from '../types/systemCenter.types';

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

const getStatusIcon = (status: DiagnosticStatus): string => {
  switch (status) {
    case 'Success':
      return '✅';
    case 'Warning':
      return '⚠️';
    case 'Error':
      return '❌';
    case 'Pending':
      return '⏳';
    case 'Skipped':
      return '⏭️';
    default:
      return '❓';
  }
};

const getStatusClass = (status: DiagnosticStatus): string => {
  switch (status) {
    case 'Success':
      return 'sc-status--success';
    case 'Warning':
      return 'sc-status--warning';
    case 'Error':
      return 'sc-status--error';
    case 'Pending':
      return 'sc-status--pending';
    case 'Skipped':
      return 'sc-status--skipped';
    default:
      return '';
  }
};

// ══════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════

export const DiagnosticsTab: React.FC = () => {
  const {
    diagnostics,
    status,
    isRunning,
    error,
    runQuickDiagnostics,
    runFullDiagnostics,
    clearError,
  } = useSystemDiagnostics();

  // Auto-refresh status on mount
  useEffect(() => {
    // Initial quick diagnostic
    runQuickDiagnostics();
  }, [runQuickDiagnostics]);

  return (
    <div className="sc-diagnostics">
      {/* Status Banner */}
      <motion.div
        className={`sc-status-banner sc-status-banner--${status?.toLowerCase() || 'unknown'}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="sc-status-banner-content">
          <span className="sc-status-banner-icon">
            {status === 'Healthy' ? '💚' : status === 'Degraded' ? '💛' : '🔴'}
          </span>
          <span className="sc-status-banner-text">
            {status === 'Healthy'
              ? 'Système fonctionnel'
              : status === 'Degraded'
                ? 'Système dégradé'
                : status === 'Critical'
                  ? 'Système critique'
                  : 'Statut inconnu'}
          </span>
        </div>
        {diagnostics && (
          <span className="sc-status-banner-duration">
            {diagnostics.total_duration_ms}ms
          </span>
        )}
      </motion.div>

      {/* Error Display */}
      {error && (
        <div className="sc-error">
          <span className="sc-error-icon">⚠️</span>
          <span className="sc-error-message">{error}</span>
          <button className="sc-error-close" onClick={clearError}>
            ✕
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="sc-actions">
        <button
          className="sc-btn sc-btn--primary"
          onClick={runQuickDiagnostics}
          disabled={isRunning}
        >
          {isRunning ? '⏳ En cours...' : '⚡ Diagnostic Rapide'}
        </button>
        <button
          className="sc-btn sc-btn--secondary"
          onClick={runFullDiagnostics}
          disabled={isRunning}
        >
          {isRunning ? '⏳ En cours...' : '🔬 Diagnostic Complet'}
        </button>
      </div>

      {/* Results */}
      {diagnostics && (
        <motion.div
          className="sc-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="sc-results-title">
            Résultats ({diagnostics.results.length} tests)
          </h3>

          <div className="sc-results-list">
            {diagnostics.results.map((result, index) => (
              <motion.div
                key={result.id}
                className={`sc-result ${getStatusClass(result.status)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="sc-result-header">
                  <span className="sc-result-icon">{getStatusIcon(result.status)}</span>
                  <span className="sc-result-title">{result.title}</span>
                  {result.duration_ms !== undefined && (
                    <span className="sc-result-duration">{result.duration_ms}ms</span>
                  )}
                </div>
                <p className="sc-result-message">{result.message}</p>
                {result.data != null && (
                  <pre className="sc-result-data">
                    {JSON.stringify(result.data as Record<string, unknown>, null, 2)}
                  </pre>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!diagnostics && !isRunning && (
        <div className="sc-empty-state">
          <span className="sc-empty-icon">🔬</span>
          <p>Cliquez sur un bouton pour lancer les diagnostics</p>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsTab;
