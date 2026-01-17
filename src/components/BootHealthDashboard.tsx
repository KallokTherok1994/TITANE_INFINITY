/**
 * TITANE∞ v26.3.0 — Boot Health Dashboard Component
 * © 2025 TITANE Team. All rights reserved.
 *
 * 📊 TABLEAU DE BORD DE SANTÉ DU SYSTÈME
 * Interface utilisateur pour le monitoring en temps réel
 */

import React, { useState, useEffect, useCallback } from 'react';
import { bootHealthMonitor } from '../utils/advancedBootMonitor';
import { performanceOptimizer } from '../utils/performanceOptimizer';

interface HealthMetrics {
  bootSuccessRate: number;
  averageBootTime: string;
  lastBootTime: string;
  totalBoots: number;
  failedModules: string[];
  memoryUsage: string;
  cacheHitRate: string;
  alertsCount: number;
}

interface SystemAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
}

const BootHealthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Récupérer les métriques depuis les moniteurs
  const fetchMetrics = useCallback(async () => {
    try {
      const healthReport = bootHealthMonitor.generateReport();
      const perfReport = performanceOptimizer.generatePerformanceReport();

      const combinedMetrics: HealthMetrics = {
        bootSuccessRate: (healthReport as any).overview?.bootSuccessRate || 0,
        averageBootTime: (healthReport as any).overview?.averageBootTime || '0ms',
        lastBootTime: (healthReport as any).overview?.lastBootTime || '0ms',
        totalBoots: (healthReport as any).overview?.totalBootAttempts || 0,
        failedModules: (healthReport as any).performance?.failedModules || [],
        memoryUsage: (healthReport as any).performance?.memoryUsage || '0MB',
        cacheHitRate: (perfReport as any).cache?.hitRate
          ? `${(((perfReport as any).cache.hitRate as number) * 100).toFixed(1)}%`
          : '0%',
        alertsCount: (healthReport as any).alerts?.total || 0,
      };

      setMetrics(combinedMetrics);

      // Récupérer les alertes critiques
      const criticalAlerts = (healthReport as any).alerts?.criticalAlerts || [];
      setAlerts(criticalAlerts);
    } catch (error) {
      console.warn('[HEALTH-DASHBOARD] Failed to fetch metrics:', error);
    }
  }, []);

  // Initialiser le dashboard
  useEffect(() => {
    fetchMetrics();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchMetrics, 30000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchMetrics]);

  // Détermine la couleur selon la santé globale
  const getHealthColor = (): string => {
    if (!metrics) return '#64748b';

    if (metrics.bootSuccessRate < 0.7 || alerts.some(a => a.severity === 'critical')) {
      return '#ef4444'; // Rouge
    } else if (metrics.bootSuccessRate < 0.9 || alerts.some(a => a.severity === 'high')) {
      return '#f59e0b'; // Orange
    } else if (
      metrics.bootSuccessRate < 0.95 ||
      alerts.some(a => a.severity === 'medium')
    ) {
      return '#eab308'; // Jaune
    }
    return '#22c55e'; // Vert
  };

  // Formate les timestamps
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Obtient l'icône de sévérité
  const getSeverityIcon = (severity: SystemAlert['severity']): string => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  if (!metrics) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <span>Loading health metrics...</span>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, borderLeftColor: getHealthColor() }}>
      {/* Header compacte */}
      <div style={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div style={styles.headerLeft}>
          <span style={styles.healthIndicator}>
            <div style={{ ...styles.statusDot, backgroundColor: getHealthColor() }}></div>
            System Health
          </span>
          <span style={styles.successRate}>
            {(metrics.bootSuccessRate * 100).toFixed(1)}%
          </span>
        </div>

        <div style={styles.headerRight}>
          <span style={styles.quickStats}>
            {metrics.averageBootTime} avg | {metrics.alertsCount} alerts
          </span>
          <span style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {/* Détails expandables */}
      {isExpanded && (
        <div style={styles.details}>
          <div style={styles.metricsGrid}>
            {/* Métriques de boot */}
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>🚀 Boot Performance</h4>
              <div style={styles.metricList}>
                <div style={styles.metricItem}>
                  <span>Success Rate:</span>
                  <span style={{ color: getHealthColor(), fontWeight: 'bold' }}>
                    {(metrics.bootSuccessRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={styles.metricItem}>
                  <span>Total Boots:</span>
                  <span>{metrics.totalBoots}</span>
                </div>
                <div style={styles.metricItem}>
                  <span>Average Time:</span>
                  <span>{metrics.averageBootTime}</span>
                </div>
                <div style={styles.metricItem}>
                  <span>Last Boot:</span>
                  <span>{metrics.lastBootTime}</span>
                </div>
              </div>
            </div>

            {/* Métriques de cache et performance */}
            <div style={styles.metricCard}>
              <h4 style={styles.metricTitle}>⚡ Performance</h4>
              <div style={styles.metricList}>
                <div style={styles.metricItem}>
                  <span>Cache Hit Rate:</span>
                  <span style={{ color: '#22c55e' }}>{metrics.cacheHitRate}</span>
                </div>
                <div style={styles.metricItem}>
                  <span>Memory Usage:</span>
                  <span>{metrics.memoryUsage}</span>
                </div>
                <div style={styles.metricItem}>
                  <span>Failed Modules:</span>
                  <span
                    style={{
                      color: metrics.failedModules.length > 0 ? '#ef4444' : '#22c55e',
                    }}
                  >
                    {metrics.failedModules.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modules en échec */}
          {metrics.failedModules.length > 0 && (
            <div style={styles.failedModules}>
              <h4 style={styles.sectionTitle}>❌ Failed Modules</h4>
              <div style={styles.moduleList}>
                {metrics.failedModules.map((module, index) => (
                  <span key={index} style={styles.moduleTag}>
                    {module}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Alertes récentes */}
          {alerts.length > 0 && (
            <div style={styles.alerts}>
              <h4 style={styles.sectionTitle}>🔔 Recent Alerts</h4>
              <div style={styles.alertList}>
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} style={styles.alertItem}>
                    <span style={styles.alertIcon}>
                      {getSeverityIcon(alert.severity)}
                    </span>
                    <span style={styles.alertMessage}>{alert.message}</span>
                    <span style={styles.alertTime}>
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions rapides */}
          <div style={styles.actions}>
            <button style={styles.actionButton} onClick={fetchMetrics}>
              🔄 Refresh
            </button>
            <button
              style={styles.actionButton}
              onClick={() => {
                console.log(
                  '[HEALTH-DASHBOARD] Full health report:',
                  bootHealthMonitor.generateReport()
                );
                console.log(
                  '[HEALTH-DASHBOARD] Performance report:',
                  performanceOptimizer.generatePerformanceReport()
                );
              }}
            >
              📊 Full Report
            </button>
            <button
              style={styles.actionButton}
              onClick={() => {
                performanceOptimizer.preloadCriticalModules();
              }}
            >
              🎯 Preload Critical
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles CSS-in-JS
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid #334155',
    borderLeft: '4px solid #64748b',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, Consolas, monospace',
    maxWidth: '400px',
    minWidth: '280px',
    zIndex: 1000,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)',
  },

  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    justifyContent: 'center',
  },

  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #334155',
    borderTop: '2px solid #22c55e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #334155',
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  healthIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 'bold',
  },

  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    boxShadow: '0 0 4px rgba(255, 255, 255, 0.3)',
  },

  successRate: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#22c55e',
  },

  quickStats: {
    fontSize: '10px',
    color: '#94a3b8',
  },

  expandIcon: {
    fontSize: '10px',
    color: '#64748b',
  },

  details: {
    padding: '16px',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },

  metricCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid #334155',
    borderRadius: '6px',
    padding: '12px',
  },

  metricTitle: {
    fontSize: '11px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#e2e8f0',
  },

  metricList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  metricItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
  },

  sectionTitle: {
    fontSize: '11px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#e2e8f0',
  },

  failedModules: {
    marginBottom: '16px',
  },

  moduleList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },

  moduleTag: {
    backgroundColor: '#dc2626',
    color: '#fee2e2',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9px',
  },

  alerts: {
    marginBottom: '16px',
  },

  alertList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  alertItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    padding: '4px',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: '4px',
  },

  alertIcon: {
    fontSize: '12px',
  },

  alertMessage: {
    flex: 1,
    color: '#cbd5e1',
  },

  alertTime: {
    color: '#64748b',
    fontSize: '9px',
  },

  actions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #334155',
  },

  actionButton: {
    flex: 1,
    padding: '6px 8px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid #3b82f6',
    borderRadius: '4px',
    color: '#60a5fa',
    fontSize: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

// Ajouter les keyframes pour l'animation du spinner
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default BootHealthDashboard;
