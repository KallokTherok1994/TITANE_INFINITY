/**
 * TITANE∞ v∞ — Introspection Tab
 *
 * Onglet d'analyse de code et auto-fix
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useIntrospection } from '../hooks/useIntrospection';
import type { IssueSeverity, IssueCategory } from '../types/systemCenter.types';

const SEVERITY_OPTIONS: Array<IssueSeverity | 'all'> = ['all', 'Critical', 'Error', 'Warning', 'Info'];

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

const getSeverityIcon = (severity: IssueSeverity): string => {
  switch (severity) {
    case 'Critical': return '🔴';
    case 'Error': return '🟠';
    case 'Warning': return '🟡';
    case 'Info': return '🔵';
    default: return '⚪';
  }
};

const getCategoryIcon = (category: IssueCategory): string => {
  switch (category) {
    case 'DeadCode': return '☠️';
    case 'BrokenImport': return '🔗';
    case 'TypeError': return '📝';
    case 'PerformanceIssue': return '⚡';
    case 'SecurityVulnerability': return '🔒';
    case 'CodeSmell': return '👃';
    case 'MemoryLeak': return '💧';
    case 'UnusedDependency': return '📦';
    default: return '❓';
  }
};

// ══════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════

export const IntrospectionTab: React.FC = () => {
  const {
    report,
    isScanning,
    isFixing,
    error,
    severityFilter,
    setSeverityFilter,
    runQuickScan,
    runFullScan,
    runAutoFix,
    clearReport,
  } = useIntrospection();

  const [projectPath, setProjectPath] = useState('/home/titane/Documents/TITANE_INFINITY');

  // Filtered issues
  const filteredIssues = useMemo(() => {
    if (!report) return [];
    if (severityFilter === 'all') return report.issues;
    return report.issues.filter(issue => issue.severity === severityFilter);
  }, [report, severityFilter]);

  const handleQuickScan = () => runQuickScan(projectPath);
  const handleFullScan = () => runFullScan(projectPath);
  const handleAutoFix = () => runAutoFix(projectPath);

  return (
    <div className="sc-introspection">
      {/* Project Path Input */}
      <div className="sc-input-group">
        <label>Chemin du projet</label>
        <input
          type="text"
          value={projectPath}
          onChange={(e) => setProjectPath(e.target.value)}
          className="sc-input sc-input--wide"
          placeholder="/path/to/project"
        />
      </div>

      {/* Actions */}
      <div className="sc-actions">
        <button
          className="sc-btn sc-btn--primary"
          onClick={handleQuickScan}
          disabled={isScanning}
        >
          {isScanning ? '⏳ Analyse...' : '⚡ Scan Rapide'}
        </button>
        <button
          className="sc-btn sc-btn--secondary"
          onClick={handleFullScan}
          disabled={isScanning}
        >
          {isScanning ? '⏳ Analyse...' : '🔍 Scan Complet'}
        </button>
        <button
          className="sc-btn sc-btn--success"
          onClick={handleAutoFix}
          disabled={!report || isFixing || report.auto_fixes_available === 0}
        >
          {isFixing ? '⏳ Correction...' : `🔧 Auto-Fix (${report?.auto_fixes_available || 0})`}
        </button>
        {report && (
          <button
            className="sc-btn sc-btn--ghost"
            onClick={clearReport}
          >
            🗑️ Effacer
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="sc-error">
          <span className="sc-error-icon">⚠️</span>
          <span className="sc-error-message">{error}</span>
        </div>
      )}

      {/* Report Results */}
      {report && (
        <motion.div
          className="sc-report"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Summary Stats */}
          <div className="sc-summary-grid">
            <div className="sc-summary-card">
              <span className="sc-summary-value">{report.total_files_scanned}</span>
              <span className="sc-summary-label">Fichiers analysés</span>
            </div>
            <div className="sc-summary-card sc-summary-card--issues">
              <span className="sc-summary-value">{report.total_issues}</span>
              <span className="sc-summary-label">Problèmes détectés</span>
            </div>
            <div className="sc-summary-card sc-summary-card--fixable">
              <span className="sc-summary-value">{report.auto_fixes_available}</span>
              <span className="sc-summary-label">Auto-corrigibles</span>
            </div>
            <div className="sc-summary-card">
              <span className="sc-summary-value">{report.scan_duration_ms}ms</span>
              <span className="sc-summary-label">Durée</span>
            </div>
          </div>

          {/* Severity Filter */}
          <div className="sc-filter-bar">
            <span className="sc-filter-label">Filtrer par sévérité:</span>
            <div className="sc-filter-buttons">
              {SEVERITY_OPTIONS.map((sev) => (
                <button
                  key={sev}
                  className={`sc-filter-btn ${severityFilter === sev ? 'sc-filter-btn--active' : ''}`}
                  onClick={() => setSeverityFilter(sev)}
                >
                  {sev === 'all' ? 'Tous' : `${getSeverityIcon(sev as IssueSeverity)} ${sev}`}
                </button>
              ))}
            </div>
          </div>

          {/* Issues List */}
          <div className="sc-issues-list">
            {filteredIssues.length === 0 ? (
              <div className="sc-empty-state">
                <span className="sc-empty-icon">✨</span>
                <p>Aucun problème détecté</p>
              </div>
            ) : (
              filteredIssues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  className={`sc-issue sc-issue--${issue.severity.toLowerCase()}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.5) }}
                >
                  <div className="sc-issue-header">
                    <span className="sc-issue-severity">{getSeverityIcon(issue.severity)}</span>
                    <span className="sc-issue-category">
                      {getCategoryIcon(issue.category)} {issue.category}
                    </span>
                    {issue.auto_fixable && (
                      <span className="sc-issue-fixable">🔧 Auto-fix</span>
                    )}
                  </div>
                  <p className="sc-issue-desc">{issue.description}</p>
                  <div className="sc-issue-location">
                    <span className="sc-issue-file">📁 {issue.file_path}</span>
                    {issue.line && (
                      <span className="sc-issue-line">Ligne {issue.line}</span>
                    )}
                  </div>
                  {issue.suggestion && (
                    <p className="sc-issue-suggestion">
                      💡 {issue.suggestion}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!report && !isScanning && (
        <div className="sc-empty-state">
          <span className="sc-empty-icon">🔍</span>
          <p>Lancez un scan pour analyser le code</p>
        </div>
      )}
    </div>
  );
};

export default IntrospectionTab;
