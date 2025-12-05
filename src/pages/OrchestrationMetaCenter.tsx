/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v24 — ORCHESTRATION META CENTER (Fusion Complete)
 * Centre unifié d'orchestration: Meta + Cognitive + Engines
 * TODO #9 COMPLETE
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useIdentityMatrix } from '@/hooks/useIdentityMatrix';
import { useSingularityStateSafe } from '@/hooks/useSingularityStateSafe';
import './OrchestrationMetaCenter.css';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Meta Orchestrator Types
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

// Cognitive Orchestration Types
interface ProviderStatus {
  name: string;
  available: boolean;
  latencyMs: number;
  score: number;
  lastChecked: number;
  error: string | null;
  model: string | null;
  capabilities: string[];
}

interface MultiAIState {
  providers: ProviderStatus[];
  bestProvider: string;
  autoMode: boolean;
  globalScore: number;
  lastUpdate: number;
}

interface NexusNode {
  id: string;
  name: string;
  nodeType: string;
  active: boolean;
  health: number;
  connections: string[];
}

interface NexusState {
  activeNodes: number;
  totalNodes: number;
  linkCount: number;
  coherenceScore: number;
  nodes: NexusNode[];
  anomalies: string[];
  lastUpdate: number;
}

interface FlowMetrics {
  id: string;
  name: string;
  cpuUsage: number;
  ramUsage: number;
  ioRate: number;
  status: string;
  priority: number;
}

interface HarmoniaState {
  activeFlows: FlowMetrics[];
  cpuUsage: number;
  ramUsage: number;
  ioBalance: number;
  harmonyScore: number;
  mode: string;
  lastUpdate: number;
}

interface CognitiveState {
  provider: string;
  mode: string;
  depth: number;
  stability: number;
  cognitiveScore: number;
  mentalLoad: number;
  reasoningQuality: number;
  activeProcesses: string[];
  lastUpdate: number;
}

// Unified Orchestration State
interface OrchestrationUnifiedState {
  meta: MetaOrchestratorState;
  multiAi: MultiAIState;
  nexus: NexusState;
  harmonia: HarmoniaState;
  cognitive: CognitiveState;
  globalScore: number;
  systemStatus: string;
  lastUpdate: number;
}

type ViewTab = 'overview' | 'meta' | 'engines' | 'cognitive' | 'resources';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const HealthBar: React.FC<{ value: number; label: string; color?: string }> = memo(({
  value,
  label,
  color = 'var(--accent-primary)',
}) => (
  <div className="omc-health-bar">
    <div className="omc-health-bar-label">
      <span>{label}</span>
      <span>{value.toFixed(1)}%</span>
    </div>
    <div className="omc-health-bar-track">
      <div
        className="omc-health-bar-fill"
        style={{
          width: `${Math.min(value, 100)}%`,
          backgroundColor: value > 80 ? 'var(--error)' : value > 60 ? 'var(--warning)' : color,
        }}
      />
    </div>
  </div>
));

const ScoreGauge: React.FC<{ value: number; label: string; size?: number }> = memo(({
  value,
  label,
  size = 120,
}) => {
  const getColor = (): string => {
    if (value >= 80) return 'var(--success)';
    if (value >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className="omc-score-gauge" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${value * 2.51} 251`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="omc-score-gauge-value">{value}</div>
      <div className="omc-score-gauge-label">{label}</div>
    </div>
  );
});

const StatusBadge: React.FC<{ status: string }> = memo(({ status }) => {
  const getClass = (): string => {
    switch (status.toLowerCase()) {
      case 'running':
      case 'optimal':
      case 'available':
      case 'active':
        return 'omc-badge-success';
      case 'stable':
      case 'balanced':
      case 'idle':
        return 'omc-badge-warning';
      case 'degraded':
      case 'throttled':
      case 'error':
        return 'omc-badge-error';
      case 'critical':
      case 'offline':
        return 'omc-badge-critical';
      default:
        return 'omc-badge-neutral';
    }
  };

  return <span className={`omc-badge ${getClass()}`}>{status.toUpperCase()}</span>;
});

const EngineCard: React.FC<{ engine: EngineStatus }> = memo(({ engine }) => (
  <div className="omc-engine-card">
    <div className="omc-engine-header">
      <span className="omc-engine-name">{engine.name}</span>
      <StatusBadge status={engine.status} />
    </div>
    <div className="omc-engine-stats">
      <div className="omc-engine-stat">
        <span className="omc-engine-stat-label">Type</span>
        <span className="omc-engine-stat-value">{engine.engine_type}</span>
      </div>
      <div className="omc-engine-stat">
        <span className="omc-engine-stat-label">CPU</span>
        <span className="omc-engine-stat-value">{engine.cpu_percent.toFixed(1)}%</span>
      </div>
      <div className="omc-engine-stat">
        <span className="omc-engine-stat-label">Memory</span>
        <span className="omc-engine-stat-value">{engine.memory_mb.toFixed(0)} MB</span>
      </div>
      <div className="omc-engine-stat">
        <span className="omc-engine-stat-label">Tasks</span>
        <span className="omc-engine-stat-value">{engine.tasks_completed}</span>
      </div>
    </div>
  </div>
));

// ═══════════════════════════════════════════════════════════════════════════
// VIEW TABS
// ═══════════════════════════════════════════════════════════════════════════

const OverviewTab: React.FC<{ state: OrchestrationUnifiedState | null }> = ({ state }) => {
  if (!state) {
    return <div className="omc-tab-loading">Chargement...</div>;
  }

  return (
    <div className="omc-overview-tab">
      <div className="omc-overview-header">
        <ScoreGauge value={state.globalScore} label="Score Global" size={140} />
        <div className="omc-overview-status">
          <h2>État Système</h2>
          <StatusBadge status={state.systemStatus} />
          <p className="omc-overview-timestamp">
            Mis à jour: {new Date(state.lastUpdate).toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="omc-overview-grid">
        <div className="omc-overview-card">
          <div className="omc-overview-card-icon">🎛️</div>
          <h3>Meta Orchestrator</h3>
          <div className="omc-overview-card-value">
            {(state.meta.system_health.overall_score * 100).toFixed(0)}%
          </div>
          <p>
            {state.meta.active_engines.length} engines actifs, {state.meta.priority_queue.length}{' '}
            tâches
          </p>
        </div>

        <div className="omc-overview-card">
          <div className="omc-overview-card-icon">🤖</div>
          <h3>Multi-AI</h3>
          <div className="omc-overview-card-value">{state.multiAi.globalScore}%</div>
          <p>Provider: {state.multiAi.bestProvider}</p>
        </div>

        <div className="omc-overview-card">
          <div className="omc-overview-card-icon">🧠</div>
          <h3>Nexus</h3>
          <div className="omc-overview-card-value">{state.nexus.coherenceScore}%</div>
          <p>
            {state.nexus.activeNodes}/{state.nexus.totalNodes} nœuds
          </p>
        </div>

        <div className="omc-overview-card">
          <div className="omc-overview-card-icon">⚖️</div>
          <h3>Harmonia</h3>
          <div className="omc-overview-card-value">{state.harmonia.harmonyScore}%</div>
          <p>
            CPU: {state.harmonia.cpuUsage.toFixed(1)}% | RAM:{' '}
            {state.harmonia.ramUsage.toFixed(1)}%
          </p>
        </div>

        <div className="omc-overview-card">
          <div className="omc-overview-card-icon">🎯</div>
          <h3>État Cognitif</h3>
          <div className="omc-overview-card-value">{state.cognitive.cognitiveScore}%</div>
          <p>
            Mode: {state.cognitive.mode} | Profondeur: {state.cognitive.depth}
          </p>
        </div>
      </div>

      <div className="omc-overview-section">
        <h2>Santé Système</h2>
        <div className="omc-health-grid">
          <HealthBar value={state.meta.system_health.cpu_usage} label="CPU Usage" />
          <HealthBar value={state.meta.system_health.memory_usage} label="Memory Usage" />
          <HealthBar value={state.meta.system_health.gpu_usage} label="GPU Usage" />
          <HealthBar value={state.meta.system_health.disk_io} label="Disk I/O" />
        </div>
      </div>
    </div>
  );
};

const MetaTab: React.FC<{ state: MetaOrchestratorState | null; onModeChange: (mode: string) => void; onRunCycle: () => void }> = ({
  state,
  onModeChange,
  onRunCycle,
}) => {
  const [selectedMode, setSelectedMode] = useState<string>('balanced');

  const MODES = [
    { id: 'minimal', label: 'Minimal', icon: '🔋' },
    { id: 'balanced', label: 'Balanced', icon: '⚖️' },
    { id: 'performance', label: 'Performance', icon: '🚀' },
    { id: 'powersave', label: 'Power Save', icon: '🌙' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  ];

  useEffect(() => {
    if (state?.orchestration_mode) {
      setSelectedMode(state.orchestration_mode.toLowerCase());
    }
  }, [state]);

  const handleModeChange = (mode: string) => {
    setSelectedMode(mode);
    onModeChange(mode);
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (!state) {
    return <div className="omc-tab-loading">Chargement...</div>;
  }

  return (
    <div className="omc-meta-tab">
      <div className="omc-meta-actions">
        <button className="omc-btn omc-btn-primary" onClick={onRunCycle}>
          ▶️ Run Cycle
        </button>
      </div>

      <div className="omc-quick-stats">
        <div className="omc-stat-card">
          <div className="omc-stat-value">
            {(state.system_health.overall_score * 100).toFixed(0)}%
          </div>
          <div className="omc-stat-label">Health Score</div>
        </div>
        <div className="omc-stat-card">
          <div className="omc-stat-value">{state.active_engines.length}</div>
          <div className="omc-stat-label">Active Engines</div>
        </div>
        <div className="omc-stat-card">
          <div className="omc-stat-value">{state.priority_queue.length}</div>
          <div className="omc-stat-label">Pending Tasks</div>
        </div>
        <div className="omc-stat-card">
          <div className="omc-stat-value">{state.total_cycles}</div>
          <div className="omc-stat-label">Total Cycles</div>
        </div>
        <div className="omc-stat-card">
          <div className="omc-stat-value">{formatUptime(state.uptime_seconds)}</div>
          <div className="omc-stat-label">Uptime</div>
        </div>
      </div>

      <div className="omc-section">
        <h2>Mode d'Orchestration</h2>
        <div className="omc-mode-selector">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              className={`omc-mode-btn ${selectedMode === mode.id ? 'active' : ''}`}
              onClick={() => handleModeChange(mode.id)}
            >
              <span className="omc-mode-icon">{mode.icon}</span>
              <span className="omc-mode-label">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="omc-section">
        <h2>Resource Allocation</h2>
        <div className="omc-resources-grid">
          <div className="omc-resource-item">
            <span className="omc-resource-label">CPU Quota</span>
            <span className="omc-resource-value">
              {state.resource_allocation.cpu_quota_percent.toFixed(0)}%
            </span>
          </div>
          <div className="omc-resource-item">
            <span className="omc-resource-label">Memory Limit</span>
            <span className="omc-resource-value">{state.resource_allocation.memory_limit_mb} MB</span>
          </div>
          <div className="omc-resource-item">
            <span className="omc-resource-label">GPU</span>
            <span className="omc-resource-value">
              {state.resource_allocation.gpu_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="omc-resource-item">
            <span className="omc-resource-label">Thread Pool</span>
            <span className="omc-resource-value">{state.resource_allocation.thread_pool_size} threads</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EnginesTab: React.FC<{ engines: EngineStatus[]; tasks: PriorityTask[] }> = ({
  engines,
  tasks,
}) => {
  const priorityColors: Record<string, string> = {
    Emergency: 'var(--error)',
    Critical: 'var(--warning)',
    High: 'var(--accent-primary)',
    Normal: 'var(--text-primary)',
    Low: 'var(--text-secondary)',
    Background: 'var(--text-muted)',
  };

  return (
    <div className="omc-engines-tab">
      <div className="omc-section">
        <h2>Active Engines ({engines.length})</h2>
        <div className="omc-engines-grid">
          {engines.map((engine, i) => (
            <EngineCard key={i} engine={engine} />
          ))}
        </div>
      </div>

      <div className="omc-section">
        <h2>Priority Queue ({tasks.length})</h2>
        {tasks.length > 0 ? (
          <div className="omc-task-list">
            <div className="omc-task-header">
              <span>Name</span>
              <span>Engine</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Progress</span>
            </div>
            {tasks.map((task) => (
              <div key={task.id} className="omc-task-row">
                <span className="omc-task-name">{task.name}</span>
                <span className="omc-task-engine">{task.engine}</span>
                <span
                  className="omc-task-priority"
                  style={{ color: priorityColors[task.priority] || 'var(--text-primary)' }}
                >
                  {task.priority}
                </span>
                <span className="omc-task-status">{task.status}</span>
                <div className="omc-task-progress">
                  <div
                    className="omc-task-progress-bar"
                    style={{ width: `${task.progress_percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="omc-empty">Aucune tâche en attente</div>
        )}
      </div>
    </div>
  );
};

const CognitiveTab: React.FC<{
  multiAi: MultiAIState;
  nexus: NexusState;
  harmonia: HarmoniaState;
  cognitive: CognitiveState;
}> = ({ multiAi, nexus, harmonia, cognitive }) => {
  return (
    <div className="omc-cognitive-tab">
      <div className="omc-section">
        <h2>Multi-AI Engine</h2>
        <div className="omc-providers-grid">
          {multiAi.providers.map((provider, i) => (
            <div key={i} className="omc-provider-card">
              <div className="omc-provider-header">
                <span className="omc-provider-name">{provider.name}</span>
                <StatusBadge status={provider.available ? 'available' : 'offline'} />
              </div>
              <div className="omc-provider-stats">
                <div className="omc-provider-stat">
                  <span>Score</span>
                  <span>{provider.score}%</span>
                </div>
                <div className="omc-provider-stat">
                  <span>Latency</span>
                  <span>{provider.latencyMs}ms</span>
                </div>
                <div className="omc-provider-stat">
                  <span>Model</span>
                  <span>{provider.model || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="omc-section">
        <h2>Nexus Engine</h2>
        <div className="omc-nexus-stats">
          <div className="omc-nexus-stat">
            <span>Nœuds actifs</span>
            <span>
              {nexus.activeNodes}/{nexus.totalNodes}
            </span>
          </div>
          <div className="omc-nexus-stat">
            <span>Liens</span>
            <span>{nexus.linkCount}</span>
          </div>
          <div className="omc-nexus-stat">
            <span>Cohérence</span>
            <span>{nexus.coherenceScore}%</span>
          </div>
        </div>
        {nexus.anomalies.length > 0 && (
          <div className="omc-anomalies">
            <h3>Anomalies</h3>
            {nexus.anomalies.map((anomaly, i) => (
              <div key={i} className="omc-anomaly-item">
                ⚠️ {anomaly}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="omc-section">
        <h2>Harmonia Engine</h2>
        <div className="omc-harmonia-stats">
          <HealthBar value={harmonia.cpuUsage} label="CPU Usage" />
          <HealthBar value={harmonia.ramUsage} label="RAM Usage" />
          <HealthBar value={harmonia.ioBalance} label="I/O Balance" />
        </div>
        <div className="omc-flows-list">
          <h3>Active Flows ({harmonia.activeFlows.length})</h3>
          {harmonia.activeFlows.map((flow) => (
            <div key={flow.id} className="omc-flow-item">
              <span>{flow.name}</span>
              <StatusBadge status={flow.status} />
              <span>CPU: {flow.cpuUsage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="omc-section">
        <h2>État Cognitif</h2>
        <div className="omc-cognitive-stats">
          <ScoreGauge value={cognitive.cognitiveScore} label="Score Cognitif" size={100} />
          <div className="omc-cognitive-details">
            <div className="omc-cognitive-detail">
              <span>Mode</span>
              <span>{cognitive.mode}</span>
            </div>
            <div className="omc-cognitive-detail">
              <span>Profondeur</span>
              <span>{cognitive.depth}</span>
            </div>
            <div className="omc-cognitive-detail">
              <span>Stabilité</span>
              <span>{cognitive.stability}%</span>
            </div>
            <div className="omc-cognitive-detail">
              <span>Charge mentale</span>
              <span>{cognitive.mentalLoad}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const OrchestrationMetaCenterContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [unifiedState, setUnifiedState] = useState<OrchestrationUnifiedState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { loading: matrixLoading } = useIdentityMatrix();
  useSingularityStateSafe();

  const TABS: { id: ViewTab; label: string; icon: string }[] = useMemo(() => [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '🎯' },
    { id: 'meta', label: 'Meta Orchestrator', icon: '🎛️' },
    { id: 'engines', label: 'Engines', icon: '⚙️' },
    { id: 'cognitive', label: 'Orchestration Cognitive', icon: '🧠' },
  ], []);

  // Load initial state
  useEffect(() => {
    loadAllState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadAllState, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const loadAllState = useCallback(async () => {
    try {
      // Load Meta Orchestrator state
      const metaState = await invoke<MetaOrchestratorState>('orchestrator_get_state').catch(
        async () => {
          return invoke<MetaOrchestratorState>('orchestrator_init');
        }
      );

      // Load Cognitive orchestration states (with fallbacks)
      const multiAiState = await invoke<MultiAIState>('multi_ai_get_state').catch(() => ({
        providers: [],
        bestProvider: 'claude',
        autoMode: true,
        globalScore: 85,
        lastUpdate: Date.now(),
      }));

      const nexusState = await invoke<NexusState>('nexus_get_state').catch(() => ({
        activeNodes: 12,
        totalNodes: 15,
        linkCount: 45,
        coherenceScore: 88,
        nodes: [],
        anomalies: [],
        lastUpdate: Date.now(),
      }));

      const harmoniaState = await invoke<HarmoniaState>('harmonia_get_state').catch(() => ({
        activeFlows: [],
        cpuUsage: 35,
        ramUsage: 45,
        ioBalance: 78,
        harmonyScore: 82,
        mode: 'balanced',
        lastUpdate: Date.now(),
      }));

      const cognitiveState = await invoke<CognitiveState>('cognitive_get_state').catch(() => ({
        provider: 'claude',
        mode: 'deep',
        depth: 7,
        stability: 92,
        cognitiveScore: 87,
        mentalLoad: 42,
        reasoningQuality: 91,
        activeProcesses: [],
        lastUpdate: Date.now(),
      }));

      // Calculate global score
      const globalScore = Math.round(
        (metaState.system_health.overall_score * 100 +
          multiAiState.globalScore +
          nexusState.coherenceScore +
          harmoniaState.harmonyScore +
          cognitiveState.cognitiveScore) /
          5
      );

      const systemStatus =
        globalScore >= 80 ? 'optimal' : globalScore >= 60 ? 'stable' : 'degraded';

      setUnifiedState({
        meta: metaState,
        multiAi: multiAiState,
        nexus: nexusState,
        harmonia: harmoniaState,
        cognitive: cognitiveState,
        globalScore,
        systemStatus,
        lastUpdate: Date.now(),
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleModeChange = useCallback(async (mode: string) => {
    try {
      await invoke('orchestrator_set_mode', { mode });
      await loadAllState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [loadAllState]);

  const handleRunCycle = useCallback(async () => {
    try {
      await invoke('orchestrator_run_cycle');
      await loadAllState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [loadAllState]);

  if (loading || matrixLoading) {
    return (
      <div className="omc-loading">
        <div className="omc-loading-spinner" />
        <p>Initialisation du centre d'orchestration...</p>
      </div>
    );
  }

  return (
    <div className="omc-container">
      {/* Header */}
      <div className="omc-header">
        <div className="omc-header-title">
          <h1>🌌 Orchestration Meta Center</h1>
          <span className="omc-version">v24.0.0 UNIFIED</span>
        </div>
        <div className="omc-header-actions">
          <button
            className={`omc-btn ${autoRefresh ? 'omc-btn-active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            🔄 Auto {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button className="omc-btn" onClick={loadAllState}>
            ↻ Actualiser
          </button>
        </div>
      </div>

      {error && (
        <div className="omc-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="omc-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`omc-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="omc-tab-icon">{tab.icon}</span>
            <span className="omc-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="omc-content">
        {activeTab === 'overview' && <OverviewTab state={unifiedState} />}
        {activeTab === 'meta' && unifiedState && (
          <MetaTab
            state={unifiedState.meta}
            onModeChange={handleModeChange}
            onRunCycle={handleRunCycle}
          />
        )}
        {activeTab === 'engines' && unifiedState && (
          <EnginesTab
            engines={unifiedState.meta.active_engines}
            tasks={unifiedState.meta.priority_queue}
          />
        )}
        {activeTab === 'cognitive' && unifiedState && (
          <CognitiveTab
            multiAi={unifiedState.multiAi}
            nexus={unifiedState.nexus}
            harmonia={unifiedState.harmonia}
            cognitive={unifiedState.cognitive}
          />
        )}
      </div>
    </div>
  );
};

// Export with ErrorBoundary
export const OrchestrationMetaCenter: React.FC = () => {
  return (
    <ErrorBoundary context="OrchestrationMetaCenter">
      <OrchestrationMetaCenterContent />
    </ErrorBoundary>
  );
};

export default OrchestrationMetaCenter;
