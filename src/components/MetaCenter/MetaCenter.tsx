/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — META CENTER
 * Interface de contrôle du Meta Orchestrator v∞
 * SUPER PROMPT OPUS #18
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './MetaCenter.css';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface MetaOrchestratorState {
  initialized: boolean;
  awareness_level: string;
  system_health: SystemHealth;
  active_engines: EngineStatus[];
  resource_allocation: ResourceAllocation;
  priority_queue: PriorityTask[];
  orchestration_mode: string;
  last_cycle_ms: number;
  total_cycles: number;
  uptime_seconds: number;
}

interface SystemHealth {
  overall_score: number;
  cpu_usage: number;
  memory_usage: number;
  gpu_usage: number;
  disk_io: number;
  network_latency_ms: number;
  error_rate: number;
  warnings: string[];
  critical_issues: string[];
}

interface EngineStatus {
  name: string;
  engine_type: string;
  status: string;
  priority: number;
  cpu_percent: number;
  memory_mb: number;
  last_activity_ms: number;
  error_count: number;
  tasks_completed: number;
}

interface ResourceAllocation {
  cpu_quota_percent: number;
  memory_limit_mb: number;
  gpu_enabled: boolean;
  gpu_quota_percent: number;
  io_priority: string;
  network_bandwidth_kbps: number;
  thread_pool_size: number;
}

interface PriorityTask {
  id: string;
  name: string;
  priority: string;
  engine: string;
  status: string;
  created_at: number;
  started_at: number | null;
  deadline_ms: number | null;
  progress_percent: number;
}

interface MetaMetrics {
  uptime_seconds: number;
  total_cycles: number;
  avg_cycle_ms: number;
  active_engines: number;
  pending_tasks: number;
  health_score: number;
  awareness_level: string;
  orchestration_mode: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const HealthBar: React.FC<{ value: number; label: string; color?: string }> = ({
  value,
  label,
  color = 'var(--accent-primary)',
}) => (
  <div className="meta-health-bar">
    <div className="meta-health-bar-label">
      <span>{label}</span>
      <span>{value.toFixed(1)}%</span>
    </div>
    <div className="meta-health-bar-track">
      <div
        className="meta-health-bar-fill"
        style={{
          width: `${Math.min(value, 100)}%`,
          backgroundColor: value > 80 ? 'var(--error)' : value > 60 ? 'var(--warning)' : color,
        }}
      />
    </div>
  </div>
);

const EngineCard: React.FC<{ engine: EngineStatus }> = ({ engine }) => {
  const statusColor =
    engine.status === 'Running'
      ? 'var(--success)'
      : engine.status === 'Error'
      ? 'var(--error)'
      : 'var(--text-secondary)';

  return (
    <div className="meta-engine-card">
      <div className="meta-engine-header">
        <span className="meta-engine-name">{engine.name}</span>
        <span className="meta-engine-status" style={{ color: statusColor }}>
          {engine.status}
        </span>
      </div>
      <div className="meta-engine-stats">
        <div className="meta-engine-stat">
          <span className="meta-engine-stat-label">Type</span>
          <span className="meta-engine-stat-value">{engine.engine_type}</span>
        </div>
        <div className="meta-engine-stat">
          <span className="meta-engine-stat-label">Priority</span>
          <span className="meta-engine-stat-value">{engine.priority}</span>
        </div>
        <div className="meta-engine-stat">
          <span className="meta-engine-stat-label">Tasks</span>
          <span className="meta-engine-stat-value">{engine.tasks_completed}</span>
        </div>
      </div>
    </div>
  );
};

const TaskRow: React.FC<{ task: PriorityTask }> = ({ task }) => {
  const priorityColors: Record<string, string> = {
    Emergency: 'var(--error)',
    Critical: 'var(--warning)',
    High: 'var(--accent-primary)',
    Normal: 'var(--text-primary)',
    Low: 'var(--text-secondary)',
    Background: 'var(--text-muted)',
  };

  return (
    <div className="meta-task-row">
      <span className="meta-task-name">{task.name}</span>
      <span className="meta-task-engine">{task.engine}</span>
      <span
        className="meta-task-priority"
        style={{ color: priorityColors[task.priority] || 'var(--text-primary)' }}
      >
        {task.priority}
      </span>
      <span className="meta-task-status">{task.status}</span>
      <div className="meta-task-progress">
        <div
          className="meta-task-progress-bar"
          style={{ width: `${task.progress_percent}%` }}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const MetaCenter: React.FC = () => {
  const [state, setState] = useState<MetaOrchestratorState | null>(null);
  const [metrics, setMetrics] = useState<MetaMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('balanced');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const MODES = [
    { id: 'minimal', label: 'Minimal', icon: '🔋' },
    { id: 'balanced', label: 'Balanced', icon: '⚖️' },
    { id: 'performance', label: 'Performance', icon: '🚀' },
    { id: 'powersave', label: 'Power Save', icon: '🌙' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  ];

  // Load initial state
  useEffect(() => {
    loadState();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadState, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadState = async () => {
    try {
      // Try to get state, if not initialized, init first
      let currentState = await invoke<MetaOrchestratorState>('orchestrator_get_state').catch(
        async () => {
          // Initialize if not done
          return invoke<MetaOrchestratorState>('orchestrator_init');
        }
      );

      setState(currentState);

      const currentMetrics = await invoke<MetaMetrics>('orchestrator_get_metrics').catch(
        () => null
      );
      if (currentMetrics) {
        setMetrics(currentMetrics);
        setSelectedMode(currentMetrics.orchestration_mode.toLowerCase());
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = async (mode: string) => {
    try {
      await invoke('orchestrator_set_mode', { mode });
      setSelectedMode(mode);
      await loadState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRunCycle = async () => {
    try {
      await invoke('orchestrator_run_cycle');
      await loadState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="meta-center meta-center-loading">
        <div className="meta-loading-spinner" />
        <p>Initializing Meta Orchestrator...</p>
      </div>
    );
  }

  return (
    <div className="meta-center">
      {/* Header */}
      <div className="meta-header">
        <div className="meta-header-title">
          <h1>🎛️ Meta Orchestrator</h1>
          <span className="meta-version">OPUS #18 v∞</span>
        </div>
        <div className="meta-header-actions">
          <button className="meta-btn meta-btn-primary" onClick={handleRunCycle}>
            ▶️ Run Cycle
          </button>
          <button
            className={`meta-btn ${autoRefresh ? 'meta-btn-active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            🔄 Auto {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {error && (
        <div className="meta-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="meta-quick-stats">
        <div className="meta-stat-card">
          <div className="meta-stat-value">
            {state?.system_health.overall_score
              ? (state.system_health.overall_score * 100).toFixed(0)
              : '0'}
            %
          </div>
          <div className="meta-stat-label">Health Score</div>
        </div>
        <div className="meta-stat-card">
          <div className="meta-stat-value">{state?.active_engines.length || 0}</div>
          <div className="meta-stat-label">Active Engines</div>
        </div>
        <div className="meta-stat-card">
          <div className="meta-stat-value">{state?.priority_queue.length || 0}</div>
          <div className="meta-stat-label">Pending Tasks</div>
        </div>
        <div className="meta-stat-card">
          <div className="meta-stat-value">{metrics?.total_cycles || 0}</div>
          <div className="meta-stat-label">Total Cycles</div>
        </div>
        <div className="meta-stat-card">
          <div className="meta-stat-value">
            {formatUptime(state?.uptime_seconds || 0)}
          </div>
          <div className="meta-stat-label">Uptime</div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="meta-section">
        <h2>Orchestration Mode</h2>
        <div className="meta-mode-selector">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              className={`meta-mode-btn ${selectedMode === mode.id ? 'active' : ''}`}
              onClick={() => handleModeChange(mode.id)}
            >
              <span className="meta-mode-icon">{mode.icon}</span>
              <span className="meta-mode-label">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="meta-section">
        <h2>System Health</h2>
        <div className="meta-health-grid">
          <HealthBar
            value={state?.system_health.cpu_usage || 0}
            label="CPU Usage"
            color="var(--accent-primary)"
          />
          <HealthBar
            value={state?.system_health.memory_usage || 0}
            label="Memory Usage"
            color="var(--accent-secondary)"
          />
          <HealthBar
            value={state?.system_health.gpu_usage || 0}
            label="GPU Usage"
            color="var(--info)"
          />
          <HealthBar
            value={state?.system_health.disk_io || 0}
            label="Disk I/O"
            color="var(--success)"
          />
        </div>
        {state?.system_health.warnings.length ? (
          <div className="meta-warnings">
            {state.system_health.warnings.map((w, i) => (
              <div key={i} className="meta-warning-item">
                ⚠️ {w}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Resource Allocation */}
      <div className="meta-section">
        <h2>Resource Allocation</h2>
        <div className="meta-resources-grid">
          <div className="meta-resource-item">
            <span className="meta-resource-label">CPU Quota</span>
            <span className="meta-resource-value">
              {state?.resource_allocation.cpu_quota_percent.toFixed(0)}%
            </span>
          </div>
          <div className="meta-resource-item">
            <span className="meta-resource-label">Memory Limit</span>
            <span className="meta-resource-value">
              {state?.resource_allocation.memory_limit_mb} MB
            </span>
          </div>
          <div className="meta-resource-item">
            <span className="meta-resource-label">GPU</span>
            <span className="meta-resource-value">
              {state?.resource_allocation.gpu_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="meta-resource-item">
            <span className="meta-resource-label">Thread Pool</span>
            <span className="meta-resource-value">
              {state?.resource_allocation.thread_pool_size} threads
            </span>
          </div>
        </div>
      </div>

      {/* Active Engines */}
      <div className="meta-section">
        <h2>Active Engines ({state?.active_engines.length || 0})</h2>
        <div className="meta-engines-grid">
          {state?.active_engines.map((engine, i) => (
            <EngineCard key={i} engine={engine} />
          ))}
        </div>
      </div>

      {/* Priority Queue */}
      <div className="meta-section">
        <h2>Priority Queue ({state?.priority_queue.length || 0})</h2>
        {state?.priority_queue.length ? (
          <div className="meta-task-list">
            <div className="meta-task-header">
              <span>Name</span>
              <span>Engine</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Progress</span>
            </div>
            {state.priority_queue.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="meta-empty">No tasks in queue</div>
        )}
      </div>
    </div>
  );
};

export default MetaCenter;
