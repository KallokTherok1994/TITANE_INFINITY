/**
 * TITANE∞ v19.5 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * CENTRE D'ORCHESTRATION COGNITIVE TITANE∞ (OPUS #5/6/7)
 * Fusion: Multi-AI + Nexus + Harmonia + Timeline + Cognitive State
 */

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useIdentityMatrix } from '@/hooks/useIdentityMatrix';
import { useSingularityStateSafe } from '@/hooks/useSingularityStateSafe';
import { secureInvoke } from '@/lib/security';
import './OrchestrationCenterPage.css';

// Types
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

interface TimelineEvent {
  id: string;
  timestamp: number;
  category: string;
  message: string;
  severity: string;
  metadata: Record<string, unknown>;
}

interface TimelineState {
  events: TimelineEvent[];
  totalEvents: number;
  categories: Record<string, number>;
  oldestEvent: number;
  newestEvent: number;
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

interface OrchestrationUnifiedState {
  multiAi: MultiAIState;
  nexus: NexusState;
  harmonia: HarmoniaState;
  timeline: TimelineState;
  cognitive: CognitiveState;
  globalScore: number;
  systemStatus: string;
  lastUpdate: number;
}

type TabId = 'overview' | 'multi-ai' | 'nexus' | 'harmonia' | 'timeline' | 'cognitive';

// Components - Memoized for performance v24.7
const ScoreGauge = memo(function ScoreGauge(props: {
  value: number;
  label: string;
  color?: string;
}): JSX.Element {
  const { value, label, color } = props;

  const gaugeColor = useMemo(() => {
    if (color) return color;
    if (value >= 80) return 'var(--success)';
    if (value >= 60) return 'var(--warning)';
    return 'var(--error)';
  }, [color, value]);

  const strokeDasharray = useMemo(() => `${value * 2.83} 283`, [value]);

  return (
    <div className="score-gauge">
      <div className="score-gauge__ring">
        <svg viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={gaugeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="score-gauge__value">{value}</div>
      </div>
      <div className="score-gauge__label">{label}</div>
    </div>
  );
});

const StatusBadge = memo(function StatusBadge(props: { status: string }): JSX.Element {
  const { status } = props;

  const badgeClass = useMemo(() => {
    switch (status) {
      case 'optimal':
      case 'available':
      case 'active':
        return 'status-badge--success';
      case 'stable':
      case 'balanced':
      case 'idle':
      case 'auto':
        return 'status-badge--warning';
      case 'degraded':
      case 'throttled':
        return 'status-badge--error';
      case 'critical':
      case 'offline':
        return 'status-badge--critical';
      default:
        return 'status-badge--neutral';
    }
  }, [status]);

  return <span className={`status-badge ${badgeClass}`}>{status.toUpperCase()}</span>;
});

// Tab Components
function OverviewTab(props: {
  state: OrchestrationUnifiedState | null;
  onRefresh: () => void;
}): JSX.Element {
  const { state, onRefresh } = props;

  if (!state) return <div className="tab-loading">Chargement...</div>;

  return (
    <div className="overview-tab">
      <div className="overview-header">
        <ScoreGauge value={state.globalScore} label="Score Global" />
        <div className="overview-header__status">
          <h2>État Système</h2>
          <StatusBadge status={state.systemStatus} />
          <p>Mis à jour: {new Date(state.lastUpdate).toLocaleTimeString('fr-FR')}</p>
          <button className="btn-refresh" onClick={onRefresh}>
            🔄 Actualiser
          </button>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-card">
          <div className="overview-card__icon">🤖</div>
          <h3>Multi-AI Engine</h3>
          <div className="overview-card__value">{state.multiAi.globalScore}%</div>
          <p>
            Provider: <strong>{state.multiAi.bestProvider}</strong>
          </p>
        </div>

        <div className="overview-card">
          <div className="overview-card__icon">🧠</div>
          <h3>Nexus Engine</h3>
          <div className="overview-card__value">{state.nexus.coherenceScore}%</div>
          <p>
            Nœuds: {state.nexus.activeNodes}/{state.nexus.totalNodes}
          </p>
        </div>

        <div className="overview-card">
          <div className="overview-card__icon">⚖️</div>
          <h3>Harmonia Engine</h3>
          <div className="overview-card__value">{state.harmonia.harmonyScore}%</div>
          <p>
            CPU: {state.harmonia.cpuUsage.toFixed(1)}% | RAM:{' '}
            {state.harmonia.ramUsage.toFixed(1)}%
          </p>
        </div>

        <div className="overview-card">
          <div className="overview-card__icon">⏱️</div>
          <h3>Timeline</h3>
          <div className="overview-card__value">{state.timeline.totalEvents}</div>
          <p>Événements</p>
        </div>

        <div className="overview-card">
          <div className="overview-card__icon">💭</div>
          <h3>État Cognitif</h3>
          <div className="overview-card__value">{state.cognitive.cognitiveScore}%</div>
          <p>Mode: {state.cognitive.mode}</p>
        </div>
      </div>
    </div>
  );
}

function MultiAITab(props: {
  state: MultiAIState | null;
  onPing: () => void;
  onForce: (p: string) => void;
  onAutoMode: (e: boolean) => void;
}): JSX.Element {
  const { state, onPing, onForce, onAutoMode } = props;

  if (!state) return <div className="tab-loading">Chargement...</div>;

  return (
    <div className="multi-ai-tab">
      <div className="multi-ai-header">
        <h2>🤖 Multi-AI Engine</h2>
        <div className="multi-ai-controls">
          <button className="btn-primary" onClick={onPing}>
            🔍 Test Providers
          </button>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={state.autoMode}
              onChange={e => onAutoMode(e.target.checked)}
            />
            Mode Auto
          </label>
        </div>
      </div>

      <div className="provider-grid">
        {state.providers.map((provider: ProviderStatus) => (
          <div
            key={provider.name}
            className={`provider-card ${provider.name === state.bestProvider ? 'provider-card--best' : ''}`}
          >
            <div className="provider-card__header">
              <span className="provider-card__name">{provider.name}</span>
              <StatusBadge status={provider.available ? 'available' : 'offline'} />
            </div>
            <div className="provider-card__metrics">
              <div className="metric">
                <span>Score</span>
                <span>{provider.score}</span>
              </div>
              <div className="metric">
                <span>Latence</span>
                <span>{provider.latencyMs}ms</span>
              </div>
            </div>
            {provider.model && (
              <div className="provider-card__model">Modèle: {provider.model}</div>
            )}
            {provider.error && (
              <div className="provider-card__error">⚠️ {provider.error}</div>
            )}
            <div className="provider-card__capabilities">
              {provider.capabilities.map((cap: string) => (
                <span key={cap} className="capability-tag">
                  {cap}
                </span>
              ))}
            </div>
            <button
              className="btn-force"
              onClick={() => onForce(provider.name)}
              disabled={!provider.available || provider.name === state.bestProvider}
            >
              Forcer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NexusTab(props: { state: NexusState | null }): JSX.Element {
  const { state } = props;

  if (!state) return <div className="tab-loading">Chargement...</div>;

  return (
    <div className="nexus-tab">
      <div className="nexus-header">
        <h2>🧠 Nexus Engine — Cohérence Cognitive</h2>
        <ScoreGauge value={state.coherenceScore} label="Cohérence" />
      </div>

      <div className="nexus-stats">
        <div className="stat-card">
          <div className="stat-card__value">{state.activeNodes}</div>
          <div className="stat-card__label">Nœuds Actifs</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{state.totalNodes}</div>
          <div className="stat-card__label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{state.linkCount}</div>
          <div className="stat-card__label">Connexions</div>
        </div>
      </div>

      <div className="nexus-nodes">
        <h3>Architecture Neurale</h3>
        <div className="nodes-grid">
          {state.nodes.map((node: NexusNode) => (
            <div
              key={node.id}
              className={`node-card node-card--${node.nodeType} ${node.active ? '' : 'node-card--inactive'}`}
            >
              <div className="node-card__header">
                <span className="node-card__name">{node.name}</span>
                <span
                  className={`node-card__status ${node.active ? 'active' : 'inactive'}`}
                >
                  {node.active ? '●' : '○'}
                </span>
              </div>
              <div className="node-card__type">{node.nodeType}</div>
              <div className="node-card__health">
                <div
                  className="health-bar"
                  style={{
                    width: `${node.health}%`,
                    backgroundColor:
                      node.health >= 80 ? 'var(--success)' : 'var(--warning)',
                  }}
                />
              </div>
              <div className="node-card__connections">
                {node.connections.length} connexions
              </div>
            </div>
          ))}
        </div>
      </div>

      {state.anomalies.length > 0 && (
        <div className="nexus-anomalies">
          <h3>⚠️ Anomalies</h3>
          <ul>
            {state.anomalies.map((a: string, i: number) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function HarmoniaTab(props: {
  state: HarmoniaState | null;
  onThrottle: (id: string, t: boolean) => void;
}): JSX.Element {
  const { state, onThrottle } = props;

  if (!state) return <div className="tab-loading">Chargement...</div>;

  return (
    <div className="harmonia-tab">
      <div className="harmonia-header">
        <h2>⚖️ Harmonia Engine</h2>
        <ScoreGauge value={state.harmonyScore} label="Harmonie" />
        <StatusBadge status={state.mode} />
      </div>

      <div className="harmonia-metrics">
        <div className="metric-card">
          <div className="metric-card__icon">💻</div>
          <div className="metric-card__value">{state.cpuUsage.toFixed(1)}%</div>
          <div className="metric-card__label">CPU</div>
          <div
            className="metric-bar"
            style={{
              width: `${Math.min(state.cpuUsage, 100)}%`,
              backgroundColor: state.cpuUsage > 80 ? 'var(--error)' : 'var(--success)',
            }}
          />
        </div>
        <div className="metric-card">
          <div className="metric-card__icon">🧠</div>
          <div className="metric-card__value">{state.ramUsage.toFixed(1)}%</div>
          <div className="metric-card__label">RAM</div>
          <div
            className="metric-bar"
            style={{
              width: `${Math.min(state.ramUsage, 100)}%`,
              backgroundColor: state.ramUsage > 85 ? 'var(--error)' : 'var(--success)',
            }}
          />
        </div>
      </div>

      <div className="harmonia-flows">
        <h3>Flux Actifs</h3>
        <table className="flows-table">
          <thead>
            <tr>
              <th>Flux</th>
              <th>CPU</th>
              <th>RAM</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {state.activeFlows.map((flow: FlowMetrics) => (
              <tr key={flow.id}>
                <td>{flow.name}</td>
                <td>{flow.cpuUsage.toFixed(1)}%</td>
                <td>{flow.ramUsage.toFixed(1)}%</td>
                <td>
                  <StatusBadge status={flow.status} />
                </td>
                <td>
                  <button
                    className="btn-small"
                    onClick={() => onThrottle(flow.id, flow.status !== 'throttled')}
                  >
                    {flow.status === 'throttled' ? 'Reprendre' : 'Throttle'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TimelineTab(props: {
  state: TimelineState | null;
  onAdd: (c: string, m: string) => void;
  onClear: (d?: number) => void;
}): JSX.Element {
  const { state, onAdd, onClear } = props;
  const [cat, setCat] = useState('system');
  const [msg, setMsg] = useState('');

  if (!state) return <div className="tab-loading">Chargement...</div>;

  const handleAdd = (): void => {
    if (msg.trim()) {
      onAdd(cat, msg.trim());
      setMsg('');
    }
  };

  const formatTime = (ts: number): string => new Date(ts).toLocaleString('fr-FR');
  const getSeverityIcon = (s: string): string => {
    switch (s) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="timeline-tab">
      <div className="timeline-header">
        <h2>⏱️ Timeline</h2>
        <span>{state.totalEvents} événements</span>
      </div>

      <div className="timeline-add">
        <select value={cat} onChange={e => setCat(e.target.value)}>
          <option value="system">Système</option>
          <option value="chat">Chat IA</option>
          <option value="memory">Mémoire</option>
          <option value="healing">Auto-Repair</option>
        </select>
        <input
          type="text"
          placeholder="Message..."
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn-primary" onClick={handleAdd}>
          Ajouter
        </button>
        <button className="btn-danger" onClick={() => onClear(7)}>
          Purger +7j
        </button>
      </div>

      <div className="timeline-categories">
        {Object.entries(state.categories).map(([category, count]) => (
          <span key={category} className="category-badge">
            {category}: {count as number}
          </span>
        ))}
      </div>

      <div className="timeline-events">
        {state.events.length === 0 ? (
          <div className="no-events">Aucun événement</div>
        ) : (
          state.events.map((event: TimelineEvent) => (
            <div key={event.id} className={`event-card event-card--${event.severity}`}>
              <div className="event-card__header">
                <span>{getSeverityIcon(event.severity)}</span>
                <span className="event-card__category">{event.category}</span>
                <span className="event-card__time">{formatTime(event.timestamp)}</span>
              </div>
              <div className="event-card__message">{event.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CognitiveTab(props: {
  state: CognitiveState | null;
  onSetMode: (m: string) => void;
  onAnalyze: () => void;
}): JSX.Element {
  const { state, onSetMode, onAnalyze } = props;

  if (!state) return <div className="tab-loading">Chargement...</div>;

  return (
    <div className="cognitive-tab">
      <div className="cognitive-header">
        <h2>💭 État Cognitif</h2>
        <button className="btn-primary" onClick={onAnalyze}>
          🔬 Analyser
        </button>
      </div>

      <div className="cognitive-gauges">
        <ScoreGauge value={state.cognitiveScore} label="Score Cognitif" />
        <ScoreGauge value={state.stability} label="Stabilité" />
        <ScoreGauge value={state.reasoningQuality} label="Qualité" />
        <ScoreGauge value={100 - state.mentalLoad} label="Capacité" />
      </div>

      <div className="cognitive-mode">
        <h3>Mode Cognitif</h3>
        <div className="mode-buttons">
          {['fast', 'balanced', 'deep'].map(mode => (
            <button
              key={mode}
              className={`mode-btn ${state.mode === mode ? 'mode-btn--active' : ''}`}
              onClick={() => onSetMode(mode)}
            >
              {mode === 'fast' && '⚡ Rapide'}
              {mode === 'balanced' && '⚖️ Équilibré'}
              {mode === 'deep' && '🧠 Profond'}
            </button>
          ))}
        </div>
        <div className="mode-info">
          <p>
            <strong>Profondeur:</strong> {state.depth}/10
          </p>
          <p>
            <strong>Provider:</strong> {state.provider}
          </p>
          <p>
            <strong>Charge:</strong> {state.mentalLoad}%
          </p>
        </div>
      </div>

      <div className="cognitive-processes">
        <h3>Processus Actifs</h3>
        <div className="process-tags">
          {state.activeProcesses.map((p: string) => (
            <span key={p} className="process-tag">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Component
function OrchestrationCenterPageContent(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [unifiedState, setUnifiedState] = useState<OrchestrationUnifiedState | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { matrix: _matrix, isLoaded: _isLoaded } = useIdentityMatrix();
  const _singularityState = useSingularityStateSafe();

  const fetchState = useCallback(async () => {
    try {
      setLoading(true);
      const s = await secureInvoke<OrchestrationUnifiedState>(
        'orchestration_get_unified_state'
      );
      setUnifiedState(s);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 10000);
    return () => clearInterval(id);
  }, [fetchState]);

  const handlePing = async (): Promise<void> => {
    try {
      const s = await secureInvoke<MultiAIState>('orchestration_ping_providers');
      setUnifiedState(p => (p ? { ...p, multiAi: s } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const handleForce = async (provider: string): Promise<void> => {
    try {
      const s = await secureInvoke<MultiAIState>('orchestration_force_provider', {
        providerName: provider,
      });
      setUnifiedState(p => (p ? { ...p, multiAi: s } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoMode = async (enabled: boolean): Promise<void> => {
    try {
      const s = await secureInvoke<MultiAIState>('orchestration_set_auto_mode', {
        enabled,
      });
      setUnifiedState(p => (p ? { ...p, multiAi: s } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const handleThrottle = async (flowId: string, throttle: boolean): Promise<void> => {
    try {
      const s = await secureInvoke<HarmoniaState>('orchestration_throttle_flow', {
        flowId,
        throttle,
      });
      setUnifiedState(p => (p ? { ...p, harmonia: s } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddEvent = async (category: string, message: string): Promise<void> => {
    try {
      await secureInvoke('orchestration_add_timeline_event', { category, message });
      fetchState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearTimeline = async (days?: number): Promise<void> => {
    try {
      await secureInvoke('orchestration_clear_timeline', { olderThanDays: days });
      fetchState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetMode = async (mode: string): Promise<void> => {
    try {
      const s = await secureInvoke<CognitiveState>('orchestration_set_cognitive_mode', {
        mode,
      });
      setUnifiedState(p => (p ? { ...p, cognitive: s } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyze = async (): Promise<void> => {
    try {
      const s = await secureInvoke<CognitiveState>('orchestration_analyze_cognitive');
      setUnifiedState(p => (p ? { ...p, cognitive: s } : null));
    } catch (e) {
      console.error(e);
    }
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: "Vue d'ensemble", icon: '📊' },
    { id: 'multi-ai', label: 'Multi-IA', icon: '🤖' },
    { id: 'nexus', label: 'Nexus', icon: '🧠' },
    { id: 'harmonia', label: 'Harmonia', icon: '⚖️' },
    { id: 'timeline', label: 'Timeline', icon: '⏱️' },
    { id: 'cognitive', label: 'État Cognitif', icon: '💭' },
  ];

  const matrixLoading = false; // TODO: Add actual matrix loading state
  if ((loading && !unifiedState) || matrixLoading) {
    return (
      <div className="orchestration-center loading">
        <div className="loading-spinner" />
        <p>Initialisation Centre Orchestration...</p>
      </div>
    );
  }

  if (error && !unifiedState) {
    return (
      <div className="orchestration-center error">
        <p>❌ {error}</p>
        <button onClick={fetchState}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="orchestration-center">
      <header className="orchestration-center__header">
        <h1>🌌 Centre d'Orchestration Cognitive TITANE∞</h1>
        <p>Multi-AI + Nexus + Harmonia + Timeline + État Cognitif</p>
      </header>

      <nav className="orchestration-center__tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-btn__icon">{tab.icon}</span>
            <span className="tab-btn__label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="orchestration-center__content">
        {activeTab === 'overview' && (
          <OverviewTab state={unifiedState} onRefresh={fetchState} />
        )}
        {activeTab === 'multi-ai' && (
          <MultiAITab
            state={unifiedState?.multiAi ?? null}
            onPing={handlePing}
            onForce={handleForce}
            onAutoMode={handleAutoMode}
          />
        )}
        {activeTab === 'nexus' && <NexusTab state={unifiedState?.nexus ?? null} />}
        {activeTab === 'harmonia' && (
          <HarmoniaTab
            state={unifiedState?.harmonia ?? null}
            onThrottle={handleThrottle}
          />
        )}
        {activeTab === 'timeline' && (
          <TimelineTab
            state={unifiedState?.timeline ?? null}
            onAdd={handleAddEvent}
            onClear={handleClearTimeline}
          />
        )}
        {activeTab === 'cognitive' && (
          <CognitiveTab
            state={unifiedState?.cognitive ?? null}
            onSetMode={handleSetMode}
            onAnalyze={handleAnalyze}
          />
        )}
      </main>
    </div>
  );
}

// Export with ErrorBoundary
export function OrchestrationCenterPage(): JSX.Element {
  return (
    <ErrorBoundary context="OrchestrationCenter">
      <OrchestrationCenterPageContent />
    </ErrorBoundary>
  );
}

export default OrchestrationCenterPage;
