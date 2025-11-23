/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — SINGULARITY MONITOR
 * Composant démo pour monitorer SingularityState en temps réel
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import { useSingularityState } from '@/services/singularityBridge';
import type { SingularityState } from '@/types/singularityState';

export function SingularityMonitor() {
  const {
    state,
    coherence,
    isCritical,
    physical,
    cognitive,
    symbolic,
    adaptive,
    meta,
  } = useSingularityState();

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Track state changes
  useEffect(() => {
    if (state) {
      setLastUpdate(new Date());
    }
  }, [state]);

  if (!state) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>🌌 SingularityState Monitor</h2>
          <span style={styles.badge}>Loading...</span>
        </div>
        <p style={styles.loading}>Synchronizing with backend Rust...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🌌 SingularityState Monitor</h2>
        <span style={{
          ...styles.badge,
          background: isCritical ? '#ef4444' : coherence > 0.8 ? '#10b981' : '#f59e0b',
        }}>
          {isCritical ? '⚠️ CRITICAL' : coherence > 0.8 ? '✅ HEALTHY' : '⚠️ WARNING'}
        </span>
      </div>

      {/* Global Metrics */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🎯 Global Metrics</h3>
        <div style={styles.metrics}>
          <MetricCard
            label="Global Coherence"
            value={`${(coherence * 100).toFixed(1)}%`}
            color={coherence > 0.8 ? '#10b981' : coherence > 0.5 ? '#f59e0b' : '#ef4444'}
          />
          <MetricCard
            label="Timestamp"
            value={new Date(state.timestamp).toLocaleTimeString()}
            color="#6366f1"
          />
          <MetricCard
            label="Last Update"
            value={lastUpdate.toLocaleTimeString()}
            color="#8b5cf6"
          />
          <MetricCard
            label="Signature"
            value={state.signature.slice(0, 12) + '...'}
            color="#ec4899"
          />
        </div>
      </div>

      {/* Physical Layer */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚡ Physical Layer</h3>
        <div style={styles.metrics}>
          <MetricCard
            label="CPU Usage"
            value={`${((physical?.metrics.cpu_usage ?? 0) * 100).toFixed(1)}%`}
            color="#ef4444"
          />
          <MetricCard
            label="Memory Usage"
            value={`${((physical?.metrics.memory_usage ?? 0) * 100).toFixed(1)}%`}
            color="#f59e0b"
          />
          <MetricCard
            label="Performance Score"
            value={`${((physical?.metrics.performance_score ?? 0) * 100).toFixed(0)}%`}
            color="#10b981"
          />
          <MetricCard
            label="System Health"
            value={`${((physical?.system_health.global_health ?? 0) * 100).toFixed(0)}%`}
            color="#3b82f6"
          />
        </div>
      </div>

      {/* Cognitive Layer */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🧠 Cognitive Layer</h3>
        <div style={styles.metrics}>
          <MetricCard
            label="Total Memories"
            value={cognitive?.memory.total_memories.toString() || '0'}
            color="#8b5cf6"
          />
          <MetricCard
            label="Active Memories"
            value={cognitive?.memory.active_memories.toString() || '0'}
            color="#ec4899"
          />
          <MetricCard
            label="Knowledge Entries"
            value={cognitive?.knowledge.total_entries.toString() || '0'}
            color="#6366f1"
          />
          <MetricCard
            label="Coherence"
            value={`${(cognitive?.coherence * 100).toFixed(0)}%`}
            color="#10b981"
          />
        </div>
      </div>

      {/* Symbolic Layer */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🎭 Symbolic Layer</h3>
        <div style={styles.metrics}>
          <MetricCard
            label="Persona"
            value={symbolic?.persona.name || 'Unknown'}
            color="#ec4899"
          />
          <MetricCard
            label="Mood"
            value={symbolic?.persona.mood || 'neutre'}
            color="#f59e0b"
          />
          <MetricCard
            label="Archetype"
            value={symbolic?.archetype.active_archetype || 'helios'}
            color="#8b5cf6"
          />
          <MetricCard
            label="Stability"
            value={`${(symbolic?.stability * 100).toFixed(0)}%`}
            color="#10b981"
          />
        </div>
      </div>

      {/* Adaptive Layer */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔄 Adaptive Layer</h3>
        <div style={styles.metrics}>
          <MetricCard
            label="Generation"
            value={adaptive?.evolution.generation.toString() || '0'}
            color="#6366f1"
          />
          <MetricCard
            label="Fitness Score"
            value={`${(adaptive?.evolution.fitness_score * 100).toFixed(0)}%`}
            color="#10b981"
          />
          <MetricCard
            label="Auto-Heal"
            value={adaptive?.auto_heal.active ? '✅ Active' : '❌ Inactive'}
            color={adaptive?.auto_heal.active ? '#10b981' : '#ef4444'}
          />
          <MetricCard
            label="Errors Healed"
            value={adaptive?.auto_heal.errors_healed.toString() || '0'}
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* Meta Layer */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔧 Meta Layer</h3>
        <div style={styles.metrics}>
          <MetricCard
            label="Active Page"
            value={meta?.ui.active_page || '/'}
            color="#3b82f6"
          />
          <MetricCard
            label="Runtime Version"
            value={meta?.runtime.version || '17.3.0'}
            color="#6366f1"
          />
          <MetricCard
            label="Environment"
            value={meta?.runtime.environment || 'dev'}
            color="#f59e0b"
          />
          <MetricCard
            label="Runtime Health"
            value={`${(meta?.runtime_health * 100).toFixed(0)}%`}
            color="#10b981"
          />
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          🔄 Real-time sync: Backend Rust ↔ Frontend React via Tauri Events
        </p>
        <p style={styles.footerText}>
          ⚡ Latency target: &lt; 50ms | 📡 16 Commands | 🎯 5 Layers
        </p>
      </div>
    </div>
  );
}

// Helper component
function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={{ ...styles.metricValue, color }}>{value}</div>
    </div>
  );
}

// Inline styles (production: move to CSS modules)
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
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
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  badge: {
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    background: '#10b981',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#a78bfa',
    fontSize: '16px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#e0e7ff',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#a5b4fc',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
  },
  footerText: {
    margin: '6px 0',
    fontSize: '13px',
    color: '#a5b4fc',
  },
};

export default SingularityMonitor;
