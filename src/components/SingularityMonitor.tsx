/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — SINGULARITY ENGINE MONITOR
 * Composant pour monitorer le SingularityEngine v14 en temps réel
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface EngineMetrics {
  ticks: number;
  stability: number;
  latency_ms: number;
  last_update_ms: number;
  error_count: number;
  success_rate: number;
}

interface ModuleInfo {
  name: string;
  version: string;
  initialized: boolean;
  health: any;
}

export function SingularityMonitor() {
  const [metrics, setMetrics] = useState<EngineMetrics | null>(null);
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [health, setHealth] = useState<string>('Unknown');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    const init = async () => {
      try {
        await invoke('engine_init');
        if (mounted) {
          console.log('✅ SingularityEngine v14 initialized');
        }

        // Poll engine state
        interval = setInterval(async () => {
          if (!mounted) return;

          try {
            // Tick the engine
            await invoke('engine_tick');

            // Get metrics
            const m = await invoke<EngineMetrics>('engine_metrics');
            setMetrics(m);

            // Get health
            const h = await invoke<any>('engine_health');
            setHealth(Object.keys(h)[0] || 'Unknown');

            // Get modules (less frequently)
            if (m.ticks % 5 === 0) {
              const mods = await invoke<ModuleInfo[]>('engine_modules');
              setModules(mods);
            }

            setLastUpdate(new Date());
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
      invoke('engine_stop').catch(console.error);
    };
  }, []);

  if (!metrics) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>🌟 SingularityEngine v14</h2>
          <span style={styles.badge}>Initializing...</span>
        </div>
        <p style={styles.loading}>Starting unified engine...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🌌 SingularityEngine v14</h2>
        <span style={{
          ...styles.badge,
          background: health === 'Healthy' ? '#10b981' : health === 'Degraded' ? '#f59e0b' : '#ef4444',
        }}>
          {health === 'Healthy' ? '✅ HEALTHY' : health === 'Degraded' ? '⚠️ DEGRADED' : '❌ FAILING'}
        </span>
      </div>

      {/* Global Metrics */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🎯 Global Metrics</h3>
        <div style={styles.metrics}>
          <MetricCard
            label="Ticks"
            value={metrics.ticks.toString()}
            color="#6366f1"
          />
          <MetricCard
            label="Stability"
            value={`${(metrics.stability * 100).toFixed(1)}%`}
            color={metrics.stability > 0.8 ? '#10b981' : metrics.stability > 0.5 ? '#f59e0b' : '#ef4444'}
          />
          <MetricCard
            label="Latency"
            value={`${metrics.latency_ms}ms`}
            color={metrics.latency_ms < 100 ? '#10b981' : metrics.latency_ms < 500 ? '#f59e0b' : '#ef4444'}
          />
          <MetricCard
            label="Success Rate"
            value={`${(metrics.success_rate * 100).toFixed(1)}%`}
            color={metrics.success_rate > 0.9 ? '#10b981' : metrics.success_rate > 0.7 ? '#f59e0b' : '#ef4444'}
          />
          <MetricCard
            label="Last Update"
            value={lastUpdate.toLocaleTimeString()}
            color="#6366f1"
          />
        </div>
      </div>

      {/* Modules */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚙️ Modules ({modules.length})</h3>
        <div style={styles.modules}>
          {modules.map((mod) => (
            <div key={mod.name} style={styles.moduleCard}>
              <div style={styles.moduleName}>{mod.name}</div>
              <div style={styles.moduleVersion}>{mod.version}</div>
              <div style={{
                ...styles.moduleStatus,
                background: mod.initialized ? '#10b981' : '#6b7280',
              }}>
                {mod.initialized ? '✓ Ready' : '○ Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  color: string;
}

function MetricCard({ label, value, color }: MetricCardProps) {
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
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '2px solid #334155',
    paddingBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    background: '#6366f1',
  },
  loading: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '16px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#cbd5e1',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
  },
  metricCard: {
    background: '#1e293b',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  modules: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
  },
  moduleCard: {
    background: '#1e293b',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
  },
  moduleName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  moduleVersion: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '8px',
  },
  moduleStatus: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#fff',
  },
};

export default SingularityMonitor;
