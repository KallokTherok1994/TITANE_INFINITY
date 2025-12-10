/**
 * TITANE∞ v20.1 — DevTools OS Tab
 *
 * Enhanced DevTools with:
 * - Live Debugger (OMEGA + Singularity + Engines timing)
 * - Memory Explorer (STM/MTM/LTM, embeddings)
 * - System Metrics (latency, CPU, RAM, tokens)
 * - Analyzer Engine (coherence, risks, stability)
 *
 * Super Prompt #9: DevTools OS — Observabilité complète
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import { LogViewer } from '@/components/devtools/LogViewer';
import { MetricsDisplay } from '@/components/devtools/MetricsDisplay';
import { CoreHealthMonitor } from '@/components/devtools/CoreHealthMonitor';

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

type DevToolsSubTab = 'debugger' | 'memory' | 'metrics' | 'cores' | 'analyzer' | 'logs';

interface DebuggerEvent {
  id: string;
  timestamp: number;
  engine: string;
  event_type: string;
  duration_ms: number;
  details: string;
  metadata: Record<string, unknown>;
}

interface DebuggerStats {
  session_start: number;
  total_events: number;
  error_count: number;
  events_by_engine: Record<string, number>;
  avg_duration_ms: number;
  max_duration_ms: number;
  slowest_engine: string;
}

interface LayerStats {
  layer: string;
  total_entries: number;
  total_size_bytes: number;
  avg_importance: number;
  oldest_entry_age_ms: number;
  newest_entry_age_ms: number;
  top_tags: string[];
}

interface MemorySystemStats {
  stm: LayerStats;
  mtm: LayerStats;
  ltm: LayerStats;
  total_entries: number;
  total_size_bytes: number;
  embeddings_count: number;
  indexed_count: number;
}

interface MemoryHealthReport {
  healthy: boolean;
  issues: string[];
  recommendations: string[];
  stm_health: number;
  mtm_health: number;
  ltm_health: number;
}

interface AnalyzerWarning {
  category: string;
  severity: string;
  message: string;
  component: string;
  impact: string;
  action?: string;
}

interface AnalyzerReport {
  timestamp: number;
  warnings: AnalyzerWarning[];
  suggestions: Array<{
    category: string;
    priority: number;
    message: string;
    expected_improvement: string;
    effort: string;
  }>;
  risk_score: number;
  stability_score: number;
  coherence_score: number;
  performance_score: number;
  analysis_duration_ms: number;
}

interface _SystemMetrics {
  cpu_pct: number;
  ram_mb: number;
  latency_ms: number;
  ttft_ms: number;
  uptime_ms: number;
  engine_health: string;
}

interface DevToolsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

interface DevToolsStatus {
  enabled: boolean;
  debugger_enabled: boolean;
  debugger_events: number;
  memory_entries: number;
  analyzer_available: boolean;
  version: string;
}

// ══════════════════════════════════════════════════════════════════
// SUB-TAB CONFIG
// ══════════════════════════════════════════════════════════════════

const DEVTOOLS_SUBTABS: Array<{
  id: DevToolsSubTab;
  label: string;
  icon: string;
  description: string;
}> = [
  { id: 'debugger', label: 'Debugger', icon: '🐛', description: 'Live event debugging' },
  { id: 'memory', label: 'Memory', icon: '🧠', description: 'Memory inspection' },
  { id: 'metrics', label: 'Metrics', icon: '📊', description: 'System metrics' },
  { id: 'cores', label: 'Cores', icon: '⚙️', description: 'Engine health monitor' },
  { id: 'analyzer', label: 'Analyzer', icon: '🔍', description: 'System analysis' },
  { id: 'logs', label: 'Logs', icon: '📋', description: 'System logs' },
];

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

const formatDuration = (ms: number): string => {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
};

const formatTimestamp = (ts: number): string => {
  const date = new Date(ts);
  return (
    date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) +
    '.' +
    String(date.getMilliseconds()).padStart(3, '0')
  );
};

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'Critical':
      return 'var(--color-error)';
    case 'High':
      return 'var(--color-warning)';
    case 'Medium':
      return 'var(--color-info)';
    case 'Low':
      return 'var(--color-text-tertiary)';
    default:
      return 'var(--color-text-secondary)';
  }
};

const getScoreColor = (score: number): string => {
  if (score >= 0.8) return 'var(--color-success)';
  if (score >= 0.6) return 'var(--color-warning)';
  return 'var(--color-error)';
};

// ══════════════════════════════════════════════════════════════════
// DEBUGGER PANEL
// ══════════════════════════════════════════════════════════════════

const DebuggerPanel: React.FC = () => {
  const [events, setEvents] = useState<DebuggerEvent[]>([]);
  const [stats, setStats] = useState<DebuggerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDebugger = useCallback(async () => {
    try {
      const [eventsRes, statsRes] = await Promise.all([
        invoke<DevToolsResponse<DebuggerEvent[]>>('devtools_debug_last', { n: 50 }),
        invoke<DevToolsResponse<DebuggerStats>>('devtools_debug_stats'),
      ]);
      if (eventsRes.success && eventsRes.data) setEvents(eventsRes.data);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
    } catch {
      // Silently fail - DevTools may not be enabled
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDebugger();
    if (autoRefresh) {
      const interval = setInterval(fetchDebugger, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchDebugger]);

  const handleClear = async () => {
    await invoke('devtools_debug_clear');
    fetchDebugger();
  };

  return (
    <div className="dt-panel dt-debugger">
      {/* Stats Header */}
      {stats && (
        <div className="dt-stats-row">
          <div className="dt-stat">
            <span className="dt-stat-value">{stats.total_events}</span>
            <span className="dt-stat-label">Events</span>
          </div>
          <div className="dt-stat dt-stat--error">
            <span className="dt-stat-value">{stats.error_count}</span>
            <span className="dt-stat-label">Errors</span>
          </div>
          <div className="dt-stat">
            <span className="dt-stat-value">{formatDuration(stats.avg_duration_ms)}</span>
            <span className="dt-stat-label">Avg Duration</span>
          </div>
          <div className="dt-stat">
            <span className="dt-stat-value">{formatDuration(stats.max_duration_ms)}</span>
            <span className="dt-stat-label">Max Duration</span>
          </div>
          <div className="dt-stat">
            <span className="dt-stat-value">{stats.slowest_engine || '-'}</span>
            <span className="dt-stat-label">Slowest</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="dt-controls">
        <label className="dt-toggle">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={e => setAutoRefresh(e.target.checked)}
          />
          <span>Auto-refresh</span>
        </label>
        <button className="dt-btn" onClick={fetchDebugger} disabled={loading}>
          🔄 Refresh
        </button>
        <button className="dt-btn dt-btn--danger" onClick={handleClear}>
          🗑️ Clear
        </button>
      </div>

      {/* Events Timeline */}
      <div className="dt-events-list">
        {events.length === 0 ? (
          <div className="dt-empty">
            <span>🐛</span>
            <p>No debug events recorded</p>
          </div>
        ) : (
          events.map(event => (
            <motion.div
              key={event.id}
              className={`dt-event ${event.event_type === 'Error' ? 'dt-event--error' : ''}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="dt-event-time">{formatTimestamp(event.timestamp)}</span>
              <span className="dt-event-engine">{event.engine}</span>
              <span className="dt-event-type">{event.event_type}</span>
              <span className="dt-event-duration">
                {formatDuration(event.duration_ms)}
              </span>
              <span className="dt-event-details">{event.details}</span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// MEMORY PANEL
// ══════════════════════════════════════════════════════════════════

const MemoryPanel: React.FC = () => {
  const [stats, setStats] = useState<MemorySystemStats | null>(null);
  const [health, setHealth] = useState<MemoryHealthReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMemory = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, healthRes] = await Promise.all([
        invoke<DevToolsResponse<MemorySystemStats>>('devtools_memory_stats'),
        invoke<DevToolsResponse<MemoryHealthReport>>('devtools_memory_health'),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (healthRes.success && healthRes.data) setHealth(healthRes.data);
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await invoke<DevToolsResponse<unknown[]>>('devtools_memory_search', {
        query: searchQuery,
        limit: 10,
      });
      if (res.success && res.data) setSearchResults(res.data);
    } catch {
      // Silently fail
    }
  };

  const handleKNN = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await invoke<DevToolsResponse<unknown[]>>('devtools_knn', {
        text: searchQuery,
        k: 5,
      });
      if (res.success && res.data) setSearchResults(res.data);
    } catch {
      // Silently fail
    }
  };

  return (
    <div className="dt-panel dt-memory">
      {/* Memory Stats */}
      {stats && (
        <div className="dt-memory-grid">
          {/* STM Card */}
          <div className="dt-memory-card">
            <div className="dt-memory-card-header">
              <span className="dt-memory-icon">⚡</span>
              <span className="dt-memory-title">STM (Short-Term)</span>
            </div>
            <div className="dt-memory-stats">
              <div className="dt-memory-stat">
                <span>{stats.stm.total_entries}</span>
                <label>Entries</label>
              </div>
              <div className="dt-memory-stat">
                <span>{formatBytes(stats.stm.total_size_bytes)}</span>
                <label>Size</label>
              </div>
              <div className="dt-memory-stat">
                <span>{(stats.stm.avg_importance * 100).toFixed(0)}%</span>
                <label>Avg Importance</label>
              </div>
            </div>
            {health && (
              <div
                className="dt-memory-health"
                style={{ color: getScoreColor(health.stm_health) }}
              >
                Health: {(health.stm_health * 100).toFixed(0)}%
              </div>
            )}
          </div>

          {/* MTM Card */}
          <div className="dt-memory-card">
            <div className="dt-memory-card-header">
              <span className="dt-memory-icon">🔄</span>
              <span className="dt-memory-title">MTM (Medium-Term)</span>
            </div>
            <div className="dt-memory-stats">
              <div className="dt-memory-stat">
                <span>{stats.mtm.total_entries}</span>
                <label>Entries</label>
              </div>
              <div className="dt-memory-stat">
                <span>{formatBytes(stats.mtm.total_size_bytes)}</span>
                <label>Size</label>
              </div>
              <div className="dt-memory-stat">
                <span>{(stats.mtm.avg_importance * 100).toFixed(0)}%</span>
                <label>Avg Importance</label>
              </div>
            </div>
            {health && (
              <div
                className="dt-memory-health"
                style={{ color: getScoreColor(health.mtm_health) }}
              >
                Health: {(health.mtm_health * 100).toFixed(0)}%
              </div>
            )}
          </div>

          {/* LTM Card */}
          <div className="dt-memory-card">
            <div className="dt-memory-card-header">
              <span className="dt-memory-icon">💾</span>
              <span className="dt-memory-title">LTM (Long-Term)</span>
            </div>
            <div className="dt-memory-stats">
              <div className="dt-memory-stat">
                <span>{stats.ltm.total_entries}</span>
                <label>Entries</label>
              </div>
              <div className="dt-memory-stat">
                <span>{formatBytes(stats.ltm.total_size_bytes)}</span>
                <label>Size</label>
              </div>
              <div className="dt-memory-stat">
                <span>
                  {stats.indexed_count}/{stats.ltm.total_entries}
                </span>
                <label>Indexed</label>
              </div>
            </div>
            {health && (
              <div
                className="dt-memory-health"
                style={{ color: getScoreColor(health.ltm_health) }}
              >
                Health: {(health.ltm_health * 100).toFixed(0)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {stats && (
        <div className="dt-memory-summary">
          <span>Total: {stats.total_entries} entries</span>
          <span>•</span>
          <span>{formatBytes(stats.total_size_bytes)}</span>
          <span>•</span>
          <span>{stats.embeddings_count} embeddings</span>
        </div>
      )}

      {/* Health Issues */}
      {health && !health.healthy && (
        <div className="dt-health-issues">
          <h4>⚠️ Issues</h4>
          <ul>
            {health.issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Search */}
      <div className="dt-search-section">
        <h4>Memory Search</h4>
        <div className="dt-search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="dt-input"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="dt-btn" onClick={handleSearch}>
            🔍 Search
          </button>
          <button className="dt-btn" onClick={handleKNN}>
            🎯 KNN
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="dt-search-results">
            <pre>{JSON.stringify(searchResults, null, 2)}</pre>
          </div>
        )}
      </div>

      <button className="dt-btn dt-btn--full" onClick={fetchMemory} disabled={loading}>
        🔄 Refresh Memory Stats
      </button>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// METRICS PANEL (Integrated MetricsDisplay Component)
// ══════════════════════════════════════════════════════════════════

const MetricsPanel: React.FC = () => {
  return <MetricsDisplay />;
};

// ══════════════════════════════════════════════════════════════════
// ANALYZER PANEL
// ══════════════════════════════════════════════════════════════════

const AnalyzerPanel: React.FC = () => {
  const [report, setReport] = useState<AnalyzerReport | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await invoke<DevToolsResponse<AnalyzerReport>>('devtools_analyze', {
        systemMetrics: null,
      });
      if (res.success && res.data) setReport(res.data);
    } catch {
      // Silently fail
    }
    setLoading(false);
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  return (
    <div className="dt-panel dt-analyzer">
      <div className="dt-controls">
        <button
          className="dt-btn dt-btn--primary"
          onClick={runAnalysis}
          disabled={loading}
        >
          {loading ? '⏳ Analyzing...' : '🔍 Run Analysis'}
        </button>
      </div>

      {report && (
        <>
          {/* Scores */}
          <div className="dt-scores-grid">
            <div className="dt-score-card">
              <div className="dt-score-label">Risk Score</div>
              <div
                className="dt-score-value"
                style={{ color: getScoreColor(1 - report.risk_score) }}
              >
                {(report.risk_score * 100).toFixed(0)}%
              </div>
              <div className="dt-score-bar">
                <div
                  className="dt-score-fill"
                  style={{
                    width: `${report.risk_score * 100}%`,
                    background: getScoreColor(1 - report.risk_score),
                  }}
                />
              </div>
            </div>

            <div className="dt-score-card">
              <div className="dt-score-label">Stability</div>
              <div
                className="dt-score-value"
                style={{ color: getScoreColor(report.stability_score) }}
              >
                {(report.stability_score * 100).toFixed(0)}%
              </div>
              <div className="dt-score-bar">
                <div
                  className="dt-score-fill"
                  style={{
                    width: `${report.stability_score * 100}%`,
                    background: getScoreColor(report.stability_score),
                  }}
                />
              </div>
            </div>

            <div className="dt-score-card">
              <div className="dt-score-label">Coherence</div>
              <div
                className="dt-score-value"
                style={{ color: getScoreColor(report.coherence_score) }}
              >
                {(report.coherence_score * 100).toFixed(0)}%
              </div>
              <div className="dt-score-bar">
                <div
                  className="dt-score-fill"
                  style={{
                    width: `${report.coherence_score * 100}%`,
                    background: getScoreColor(report.coherence_score),
                  }}
                />
              </div>
            </div>

            <div className="dt-score-card">
              <div className="dt-score-label">Performance</div>
              <div
                className="dt-score-value"
                style={{ color: getScoreColor(report.performance_score) }}
              >
                {(report.performance_score * 100).toFixed(0)}%
              </div>
              <div className="dt-score-bar">
                <div
                  className="dt-score-fill"
                  style={{
                    width: `${report.performance_score * 100}%`,
                    background: getScoreColor(report.performance_score),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div className="dt-warnings-section">
              <h4>⚠️ Warnings ({report.warnings.length})</h4>
              <div className="dt-warnings-list">
                {report.warnings.map((warning, i) => (
                  <div
                    key={i}
                    className="dt-warning"
                    style={{ borderLeftColor: getSeverityColor(warning.severity) }}
                  >
                    <div className="dt-warning-header">
                      <span
                        className="dt-warning-severity"
                        style={{ color: getSeverityColor(warning.severity) }}
                      >
                        {warning.severity}
                      </span>
                      <span className="dt-warning-category">{warning.category}</span>
                      <span className="dt-warning-component">{warning.component}</span>
                    </div>
                    <div className="dt-warning-message">{warning.message}</div>
                    <div className="dt-warning-impact">{warning.impact}</div>
                    {warning.action && (
                      <div className="dt-warning-action">💡 {warning.action}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {report.suggestions.length > 0 && (
            <div className="dt-suggestions-section">
              <h4>💡 Suggestions ({report.suggestions.length})</h4>
              <div className="dt-suggestions-list">
                {report.suggestions.map((suggestion, i) => (
                  <div key={i} className="dt-suggestion">
                    <div className="dt-suggestion-header">
                      <span className="dt-suggestion-priority">
                        P{suggestion.priority}
                      </span>
                      <span className="dt-suggestion-category">
                        {suggestion.category}
                      </span>
                      <span className="dt-suggestion-effort">{suggestion.effort}</span>
                    </div>
                    <div className="dt-suggestion-message">{suggestion.message}</div>
                    <div className="dt-suggestion-improvement">
                      Expected: {suggestion.expected_improvement}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dt-analysis-meta">
            Analysis completed in {formatDuration(report.analysis_duration_ms)}
          </div>
        </>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// LOGS PANEL (Integrated LogViewer Component)
// ══════════════════════════════════════════════════════════════════

const LogsPanel: React.FC = () => {
  return <LogViewer />;
};

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export const DevToolsTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<DevToolsSubTab>('debugger');
  const [status, setStatus] = useState<DevToolsStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await invoke<DevToolsResponse<DevToolsStatus>>('devtools_status');
        if (res.success && res.data) setStatus(res.data);
      } catch {
        // DevTools may not be available
      }
    };
    fetchStatus();
  }, []);

  const toggleDevTools = async () => {
    try {
      if (status?.enabled) {
        await invoke('devtools_disable');
      } else {
        await invoke('devtools_enable');
      }
      const res = await invoke<DevToolsResponse<DevToolsStatus>>('devtools_status');
      if (res.success && res.data) setStatus(res.data);
    } catch {
      // Silently fail
    }
  };

  const renderContent = () => {
    switch (activeSubTab) {
      case 'debugger':
        return <DebuggerPanel />;
      case 'memory':
        return <MemoryPanel />;
      case 'metrics':
        return <MetricsPanel />;
      case 'cores':
        return <CoreHealthMonitor />;
      case 'analyzer':
        return <AnalyzerPanel />;
      case 'logs':
        return <LogsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="sc-devtools-os">
      {/* Status Header */}
      <div className="dt-header">
        <div className="dt-header-info">
          <h3>🛠️ DevTools OS</h3>
          {status && <span className="dt-version">{status.version}</span>}
        </div>
        <div className="dt-header-actions">
          {status && (
            <button
              className={`dt-btn ${status.enabled ? 'dt-btn--success' : 'dt-btn--muted'}`}
              onClick={toggleDevTools}
            >
              {status.enabled ? '✅ Enabled' : '⏸️ Disabled'}
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <nav className="dt-subtabs">
        {DEVTOOLS_SUBTABS.map(tab => (
          <button
            key={tab.id}
            className={`dt-subtab ${activeSubTab === tab.id ? 'dt-subtab--active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
            title={tab.description}
          >
            <span className="dt-subtab-icon">{tab.icon}</span>
            <span className="dt-subtab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="dt-content"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DevToolsTab;
