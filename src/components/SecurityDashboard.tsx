/**
 * TITANE∞ v17 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import React, { useState } from 'react';
import {
  runSecuritySelfTest,
  getSecurityStats,
  type HardeningReport,
} from '../lib/security';

// ────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────

const styles = {
  container: {
    padding: '24px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  runButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  runButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
  },
  runButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    borderRadius: '12px',
    border: '1px solid rgba(102, 126, 234, 0.2)',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    fontWeight: 500,
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  reportCard: {
    padding: '24px',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  passRate: {
    fontSize: '48px',
    fontWeight: 700,
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  passRateGood: {
    color: '#93b399', // TITANE success
  },
  passRateWarning: {
    color: '#a89f91', // TITANE warning
  },
  passRateBad: {
    color: '#8f7a7a', // TITANE danger
  },
  testsTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '16px',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    textAlign: 'left' as const,
    padding: '12px',
    fontWeight: 600,
    fontSize: '14px',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    padding: '12px',
    fontSize: '14px',
  },
  statusIcon: {
    fontSize: '20px',
    marginRight: '8px',
  },
  timestamp: {
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: '14px',
    marginTop: '16px',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '18px',
    color: '#6b7280',
  },
  error: {
    padding: '20px',
    background: '#2a2525',
    border: '1px solid #8f7a7a',
    borderRadius: '8px',
    color: '#8f7a7a', // TITANE danger
    marginBottom: '24px',
  },
};

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

export const SecurityDashboard: React.FC = () => {
  const [report, setReport] = useState<HardeningReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = getSecurityStats();

  const handleRunTest = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await runSecuritySelfTest();
      setReport(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Auto-test échoué : ${errorMsg}`);
      console.error('[SecurityDashboard] Self-test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPassRateColor = (passRate: number) => {
    if (passRate >= 0.9) return styles.passRateGood;
    if (passRate >= 0.7) return styles.passRateWarning;
    return styles.passRateBad;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🔒 Tableau de Bord Sécurité</h1>
        <button
          style={{
            ...styles.runButton,
            ...(loading ? styles.runButtonDisabled : {}),
          }}
          onClick={handleRunTest}
          disabled={loading}
        >
          {loading ? '⏳ Tests en cours...' : '🚀 Lancer l’Auto-Test Sécurité'}
        </button>
      </div>

      {/* Error Display */}
      {error && <div style={styles.error}>❌ {error}</div>}

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Commandes Autorisées</div>
          <div style={styles.statValue}>{stats.allowed_commands}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Appels Max/Seconde</div>
          <div style={styles.statValue}>{stats.max_calls_per_second}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Timeout Par Défaut</div>
          <div style={styles.statValue}>
            {(stats.default_timeout_ms / 1000).toFixed(0)}s
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Taille Max Payload</div>
          <div style={styles.statValue}>
            {(stats.max_payload_size_bytes / (1024 * 1024)).toFixed(0)}MB
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={styles.loading}>
          <div>⏳ Exécution des auto-tests de sécurité...</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Cela peut prendre jusqu'à 60 secondes
          </div>
        </div>
      )}

      {/* Report Display */}
      {report && !loading && (
        <div style={styles.reportCard}>
          {/* Pass Rate */}
          <div
            style={{
              ...styles.passRate,
              ...getPassRateColor(report.pass_rate),
            }}
          >
            {(report.pass_rate * 100).toFixed(1)}%
          </div>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <strong>Taux de Réussite</strong> ({report.tests.filter((t) => t.passed).length}/
            {report.tests.length} tests réussis)
          </div>

          {/* Tests Table */}
          <table style={styles.testsTable}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Statut</th>
                <th style={styles.tableHeader}>Nom du Test</th>
                <th style={styles.tableHeader}>Détails</th>
              </tr>
            </thead>
            <tbody>
              {report.tests.map((test, idx) => (
                <tr key={idx} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <span style={styles.statusIcon}>
                      {test.passed ? '✅' : '❌'}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <strong>{test.name}</strong>
                  </td>
                  <td style={styles.tableCell}>{test.details}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Timestamp */}
          <div style={styles.timestamp}>
            Dernière exécution : {new Date(report.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!report && !loading && (
        <div style={styles.loading}>
          <div>🛡️ Aucun rapport de sécurité</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Cliquez sur « Lancer l'Auto-Test Sécurité » pour valider le durcissement du système
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
