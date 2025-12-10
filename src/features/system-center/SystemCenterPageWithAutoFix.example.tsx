/**
 * TITANE_INFINITY v21.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   EXEMPLE INTÉGRATION — SystemCenterPage avec AutoFix v21
 *   Démonstration complète de l'auto-réparation du Centre Système
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSystemCenterAutoFix } from '@/hooks/useSystemCenterAutoFix';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './SystemCenterPage.css';

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT avec AutoFix Integration
// ═══════════════════════════════════════════════════════════════

export const SystemCenterPageWithAutoFix: React.FC = () => {
  const {
    systemHealth,
    monitoringMetrics,
    detectedErrors,
    fixHistory,
    uxOutput,
    loading,
    error,
    hasErrors,
    hasAutoFixes,
    isHealthy,
    runDiagnostic,
    getMonitoring,
    autoRepair,
    clearErrors,
  } = useSystemCenterAutoFix();

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showAutoFixHistory, setShowAutoFixHistory] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Render Functions
  // ─────────────────────────────────────────────────────────────

  /**
   * Status Badge basé sur système health
   */
  const renderStatusBadge = () => {
    if (loading) {
      return (
        <span className="status-badge status-loading">🔄 Diagnostic en cours...</span>
      );
    }

    if (hasAutoFixes) {
      return (
        <span className="status-badge status-auto-fixed">
          ✅ Auto-réparé ({fixHistory.filter(f => f.success).length} correction(s))
        </span>
      );
    }

    if (isHealthy) {
      return <span className="status-badge status-healthy">✅ Système sain</span>;
    }

    if (hasErrors) {
      return (
        <span className="status-badge status-errors">
          ⚠️ {detectedErrors.length} anomalie(s) détectée(s)
        </span>
      );
    }

    return <span className="status-badge status-unknown">ℹ️ État inconnu</span>;
  };

  /**
   * Panel UX propre généré automatiquement
   */
  const renderCleanUX = () => {
    if (!uxOutput) {
      return (
        <div className="ux-panel">
          <h2>🎯 Centre Système TITANE∞</h2>
          <p>Aucun diagnostic disponible. Lancez un diagnostic pour commencer.</p>
        </div>
      );
    }

    return (
      <div className="ux-panel">
        <div
          className="ux-content"
          dangerouslySetInnerHTML={{ __html: uxOutput.ux_final }}
        />
      </div>
    );
  };

  /**
   * Panel détails techniques (repliable)
   */
  const renderTechnicalDetails = () => {
    if (!showTechnicalDetails || !uxOutput) return null;

    return (
      <motion.div
        className="technical-panel"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
      >
        <h3>🔍 Détails Techniques</h3>

        {/* Tech Notes */}
        <div className="tech-section">
          <h4>📝 Notes Développeur</h4>
          <ul>
            {uxOutput.tech_notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>

        {/* Command Fixes */}
        <div className="tech-section">
          <h4>🔧 Commandes Corrigées</h4>
          <pre>{JSON.stringify(uxOutput.command_fixes, null, 2)}</pre>
        </div>

        {/* Frontend Patch */}
        <div className="tech-section">
          <h4>⚛️ Frontend Patch</h4>
          <pre>
            <code>{uxOutput.frontend_patch}</code>
          </pre>
        </div>

        {/* AutoFix Playbook */}
        <div className="tech-section">
          <h4>📋 AutoFix Playbook</h4>
          {uxOutput.autofix_playbook.map((workflow, i) => (
            <details key={i}>
              <summary>Workflow {i + 1}</summary>
              <pre>{workflow}</pre>
            </details>
          ))}
        </div>
      </motion.div>
    );
  };

  /**
   * Panel historique auto-fix
   */
  const renderAutoFixHistory = () => {
    if (!showAutoFixHistory || fixHistory.length === 0) return null;

    return (
      <motion.div
        className="autofix-history-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3>🔧 Historique Auto-Réparations</h3>
        <div className="fix-list">
          {fixHistory.map((fix, i) => (
            <div
              key={i}
              className={`fix-item ${fix.success ? 'fix-success' : 'fix-failed'}`}
            >
              <div className="fix-header">
                <span className="fix-icon">{fix.success ? '✅' : '❌'}</span>
                <span className="fix-type">{fix.appliedFix}</span>
                {fix.fallbackApplied && <span className="fix-badge">Fallback</span>}
              </div>
              <div className="fix-details">
                <p>
                  <strong>Erreur:</strong> {fix.errorFixed.errorMessage}
                </p>
                <p>
                  <strong>Solution:</strong> {fix.message}
                </p>
                {fix.newCommand && (
                  <p>
                    <strong>Commande:</strong>{' '}
                    <code>{fix.errorFixed.originalCommand}</code>
                    {' → '}
                    <code>{fix.newCommand}</code>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  /**
   * Action buttons
   */
  const renderActions = () => (
    <div className="action-buttons">
      <button className="btn btn-primary" onClick={runDiagnostic} disabled={loading}>
        🔍 Lancer Diagnostic
      </button>

      <button className="btn btn-secondary" onClick={getMonitoring} disabled={loading}>
        📈 Métriques Monitoring
      </button>

      {hasErrors && (
        <button className="btn btn-warning" onClick={autoRepair} disabled={loading}>
          🔧 Auto-Réparer ({detectedErrors.length})
        </button>
      )}

      {(hasErrors || hasAutoFixes) && (
        <button className="btn btn-ghost" onClick={clearErrors}>
          🗑️ Clear Historique
        </button>
      )}

      <button
        className="btn btn-ghost"
        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
      >
        {showTechnicalDetails ? '👁️ Masquer' : '🔍 Détails'} Techniques
      </button>

      <button
        className="btn btn-ghost"
        onClick={() => setShowAutoFixHistory(!showAutoFixHistory)}
      >
        {showAutoFixHistory ? '👁️ Masquer' : '📋 Voir'} Historique Auto-Fix
      </button>
    </div>
  );

  /**
   * System Health Summary
   */
  const renderHealthSummary = () => {
    if (!systemHealth) return null;

    return (
      <div className="health-summary">
        <div className="health-score">
          <span className="score-label">Score Général</span>
          <span className="score-value">
            {Math.round(systemHealth.overallScore * 100)}%
          </span>
        </div>
        <div className="health-modules">
          {systemHealth.modules.map((module, i) => (
            <div key={i} className={`module-status module-${module.status}`}>
              <span className="module-icon">
                {module.status === 'active'
                  ? '✅'
                  : module.status === 'inactive'
                    ? '⏸️'
                    : '❌'}
              </span>
              <span className="module-name">{module.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Monitoring Metrics Summary
   */
  const renderMonitoringSummary = () => {
    if (!monitoringMetrics) return null;

    return (
      <div className="monitoring-summary">
        <div className="metric-card">
          <span className="metric-icon">🖥️</span>
          <span className="metric-label">CPU</span>
          <span className="metric-value">{monitoringMetrics.cpu}%</span>
        </div>
        <div className="metric-card">
          <span className="metric-icon">💾</span>
          <span className="metric-label">Memory</span>
          <span className="metric-value">{monitoringMetrics.memory}%</span>
        </div>
        <div className="metric-card">
          <span className="metric-icon">⚙️</span>
          <span className="metric-label">Engines</span>
          <span className="metric-value">
            {monitoringMetrics.engines.filter(e => e.active).length}/
            {monitoringMetrics.engines.length}
          </span>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // Main Render
  // ─────────────────────────────────────────────────────────────

  if (error && !hasAutoFixes) {
    return (
      <div className="system-center-error">
        <h2>⚠️ Erreur Système</h2>
        <p>{error}</p>
        <button onClick={runDiagnostic}>🔄 Réessayer</button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="system-center-crashed">
          <h2>🔥 Centre Système temporairement indisponible</h2>
          <p>Une erreur technique critique est survenue.</p>
          <button onClick={() => window.location.reload()}>🔄 Recharger la page</button>
        </div>
      }
    >
      <div className="system-center-page system-center-autofix">
        {/* Header */}
        <motion.header
          className="sc-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="sc-header-title">
            <span className="sc-header-icon">⚙️</span>
            <h1>Centre Système TITANE∞</h1>
            {renderStatusBadge()}
          </div>
          <p className="sc-header-subtitle">
            Observabilité, diagnostics et auto-réparation intelligente
          </p>
        </motion.header>

        {/* Actions */}
        {renderActions()}

        {/* Health Summary */}
        {systemHealth && renderHealthSummary()}

        {/* Monitoring Summary */}
        {monitoringMetrics && renderMonitoringSummary()}

        {/* Clean UX Output */}
        <motion.main
          className="sc-main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {renderCleanUX()}
        </motion.main>

        {/* Technical Details (collapsible) */}
        {renderTechnicalDetails()}

        {/* AutoFix History (collapsible) */}
        {renderAutoFixHistory()}

        {/* Loading Overlay */}
        {loading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner" />
            <p>Diagnostic en cours...</p>
          </motion.div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SystemCenterPageWithAutoFix;
