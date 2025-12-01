/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v15 — SINGULARITY ENGINE MONITOR (Simplifié)
 * Composant React pour monitorer le SingularityEngine v15
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { secureInvoke } from '@/lib/security';

interface EngineMetrics {
  ticks: number;
  stability: number;
  latency_ms: number;
  last_update_ms: number;
  error_count: number;
  success_rate: number;
}

interface EngineHealth {
  [key: string]: unknown;
}

interface ModuleInfo {
  name: string;
  version: string;
  initialized: boolean;
  health: string;
}

export function SingularityMonitorV14() {
  const [metrics, setMetrics] = useState<EngineMetrics | null>(null);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [health, setHealth] = useState<string>('Unknown');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout | undefined;

    const init = async () => {
      try {
        await secureInvoke('engine_init');
        console.log('✅ SingularityEngine v15 initialized');

        // Poll engine state every second
        interval = setInterval(async () => {
          if (!mounted) return;

          try {
            await secureInvoke('engine_tick');
            const m = await secureInvoke<EngineMetrics>('engine_metrics');
            const h = await secureInvoke<EngineHealth>('engine_health');

            setMetrics(m);
            setHealth(Object.keys(h || {})[0] || 'Unknown');
            setLastUpdate(new Date());

            // Fetch modules less frequently
            if (m.ticks % 5 === 0) {
              const mods = await secureInvoke<ModuleInfo[]>('engine_modules');
              setModules(mods || []);
            }
          } catch (error) {
            console.error('Engine poll error:', error);
          }
        }, 1000);
      } catch (error) {
        console.error('Engine init error:', error);
      }
    };

    init();

    return () => {
      mounted = false;
      clearInterval(interval);
      secureInvoke('engine_stop').catch(console.error);
    };
  }, []);

  if (!metrics) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>🌟 SingularityEngine v15</h2>
          <span style={{ ...styles.badge, background: '#6b7280' }}>
            Initializing...
          </span>
        </div>
        <p style={{ textAlign: 'center', color: '#9ca3af' }}>
          Starting unified engine...
        </p>
      </div>
    );
  }

  const healthColor =
    health === 'Healthy' ? '#10b981' :
    health === 'Degraded' ? '#f59e0b' :
    health === 'Failing' ? '#ef4444' : '#6b7280';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🌟 SingularityEngine v15</h2>
        <span style={{ ...styles.badge, background: healthColor }}>
          {health.toUpperCase()}
        </span>
      </div>

      {/* Global Metrics */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚡ Global Metrics</h3>
        <div style={styles.metricsGrid}>
          <MetricCard
            label="Ticks"
            value={metrics.ticks.toString()}
            color="#6366f1"
          />
          <MetricCard
            label="Stability"
            value={`${(metrics.stability * 100).toFixed(1)}%`}
            color={metrics.stability > 0.8 ? '#10b981' : '#f59e0b'}
          />
          <MetricCard
            label="Latency"
            value={`${metrics.latency_ms}ms`}
            color="#3b82f6"
          />
          <MetricCard
            label="Taux Réussite"
            value={`${(metrics.success_rate * 100).toFixed(1)}%`}
            color={metrics.success_rate > 0.9 ? '#10b981' : '#ef4444'}
          />
          <MetricCard
            label="Errors"
            value={metrics.error_count.toString()}
            color={metrics.error_count > 0 ? '#ef4444' : '#10b981'}
          />
          <MetricCard
            label="Dernière MAJ"
            value={lastUpdate.toLocaleTimeString()}
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* Active Modules */}
      {modules.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔧 Modules Actifs</h3>
          <div style={styles.modulesList}>
            {modules.map((module) => (
              <div key={module.name} style={styles.moduleCard}>
                <div style={styles.moduleName}>{module.name}</div>
                <div style={styles.moduleVersion}>v{module.version}</div>
                <div
                  style={{
                    ...styles.moduleStatus,
                    background: module.initialized ? '#10b981' : '#6b7280',
                  }}
                >
                  {module.initialized ? '✅' : '⏳'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <p>🔄 Monitoring temps réel via commandes Tauri</p>
        <p>🚀 TITANE∞ v15 - Architecture Statique Unifiée</p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={{ ...styles.metricValue, color }}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    borderRadius: '12px',
    color: '#fff',
    maxWidth: '1200px',
    margin: '20px auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #a78bfa, #ec4899)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  badge: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#e5e7eb',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '8px',
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  modulesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  moduleCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  moduleName: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  moduleVersion: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  moduleStatus: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    fontSize: '12px',
    color: '#9ca3af',
  },
};
