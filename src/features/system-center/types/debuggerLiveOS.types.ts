/**
 * TITANE∞ v21 — Debugger Live OS Types
 *
 * Types pour le système de débogage en temps réel
 *
 * © 2025 TITANE Team. All rights reserved.
 */

// ══════════════════════════════════════════════════════════════════
// DEBUGGER MODES
// ══════════════════════════════════════════════════════════════════

export type DebuggerMode =
  | 'LiveMonitor' // Surveillance temps réel
  | 'DeepTrace' // Trace approfondie des appels
  | 'RiskAssessment' // Évaluation des risques
  | 'CognitiveReplay' // Rejeu des états cognitifs
  | 'OSSnapshotDiff' // Comparaison de snapshots
  | 'VisualSync'; // Synchronisation Visual Engine

export interface DebuggerModeConfig {
  mode: DebuggerMode;
  autoRefresh: boolean;
  refreshInterval?: number; // ms
  captureStackTraces: boolean;
  maxHistorySize: number;
}

// ══════════════════════════════════════════════════════════════════
// LIVE MONITOR
// ══════════════════════════════════════════════════════════════════

export interface LiveMetrics {
  timestamp: number;

  // System Health
  systemHealth: {
    healthy: boolean;
    status: string;
    issues?: string[];
  };

  // Module Health
  moduleHealth: {
    all_healthy: boolean;
    healthy_count: number;
    total_count: number;
    unhealthy_modules?: string[];
  };

  // Helios Metrics
  heliosMetrics: {
    cpu_usage?: number;
    memory_usage?: number;
    coherence?: number;
    stability?: number;
    [key: string]: unknown;
  };

  // Singularity State
  singularityState?: {
    physical?: Record<string, unknown>;
    cognitive?: Record<string, unknown>;
    symbolic?: Record<string, unknown>;
    adaptive?: Record<string, unknown>;
    meta?: Record<string, unknown>;
  };

  // Engines Monitoring
  enginesHealth?: {
    overall_health: number;
    engines: Array<{
      name: string;
      healthy: boolean;
      load: number;
      errors: number;
    }>;
  };
}

// ══════════════════════════════════════════════════════════════════
// DEEP TRACE
// ══════════════════════════════════════════════════════════════════

export interface TraceEntry {
  id: string;
  timestamp: number;
  type: 'command' | 'state_change' | 'error' | 'event';
  source: string;
  command?: string;
  args?: unknown;
  result?: unknown;
  error?: string;
  stackTrace?: string;
  duration_ms?: number;
  metadata?: Record<string, unknown>;
}

export interface TraceSession {
  id: string;
  started_at: number;
  ended_at?: number;
  entries: TraceEntry[];
  totalDuration: number;
  errorCount: number;
  commandCount: number;
}

// ══════════════════════════════════════════════════════════════════
// RISK ASSESSMENT
// ══════════════════════════════════════════════════════════════════

export type RiskLevel = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';

export type RiskCategory =
  | 'MemoryLeak'
  | 'StateInconsistency'
  | 'HighCPU'
  | 'HighMemory'
  | 'ErrorRate'
  | 'SlowPerformance'
  | 'SecurityVulnerability'
  | 'DataCorruption';

export interface RiskFactor {
  id: string;
  category: RiskCategory;
  level: RiskLevel;
  description: string;
  detected_at: number;
  metrics: Record<string, number>;
  threshold: Record<string, number>;
  mitigation?: string;
  auto_fixable: boolean;
}

export interface RiskAssessmentReport {
  timestamp: number;
  overall_risk: RiskLevel;
  risk_score: number; // 0-100
  factors: RiskFactor[];
  recommendations: string[];
  auto_fixes_available: number;
}

// ══════════════════════════════════════════════════════════════════
// COGNITIVE REPLAY
// ══════════════════════════════════════════════════════════════════

export interface CognitiveSnapshot {
  id: string;
  timestamp: number;
  cognitive_mode: string;
  confidence: number;
  intensity: number;
  active_kernels: string[];
  memory_state: {
    usage_percent: number;
    active_connections: number;
  };
  singularity: {
    physical: Record<string, unknown>;
    cognitive: Record<string, unknown>;
    symbolic: Record<string, unknown>;
    adaptive: Record<string, unknown>;
    meta: Record<string, unknown>;
  };
  decision_context?: Record<string, unknown>;
}

export interface ReplaySession {
  id: string;
  snapshots: CognitiveSnapshot[];
  started_at: number;
  duration_ms: number;
  current_index: number;
  is_playing: boolean;
  playback_speed: number; // 1.0 = normal, 2.0 = 2x, etc.
}

// ══════════════════════════════════════════════════════════════════
// OS SNAPSHOT DIFF
// ══════════════════════════════════════════════════════════════════

export interface OSSnapshot {
  id: string;
  timestamp: number;
  label?: string;

  // Full system state
  systemState: {
    health: Record<string, unknown>;
    modules: Record<string, unknown>;
    metrics: Record<string, unknown>;
    singularity: Record<string, unknown>;
    runtime_config: Record<string, unknown>;
  };

  // Persistence info
  persistence?: {
    snapshot_id: string;
    events_count: number;
    integrity_hash: string;
  };

  // Metadata
  size_bytes: number;
  capture_duration_ms: number;
}

export interface SnapshotDiff {
  snapshot_a: OSSnapshot;
  snapshot_b: OSSnapshot;
  changes: Array<{
    path: string;
    type: 'added' | 'removed' | 'modified';
    old_value?: unknown;
    new_value?: unknown;
    impact: 'critical' | 'major' | 'minor';
  }>;
  summary: {
    added_count: number;
    removed_count: number;
    modified_count: number;
    total_changes: number;
  };
}

// ══════════════════════════════════════════════════════════════════
// VISUAL SYNC
// ══════════════════════════════════════════════════════════════════

export interface VisualSyncState {
  // Visual Engine State
  visualEngine: {
    active: boolean;
    current_state: string;
    intensity: number;
    particle_count: number;
    effects_active: number;
  };

  // OS State
  osState: {
    cognitive_mode: string;
    emotional_state: string;
    system_load: number;
  };

  // Synchronization
  sync: {
    is_synced: boolean;
    last_sync_at: number;
    drift_ms: number;
    sync_quality: number; // 0-1
  };

  // Performance
  performance: {
    fps: number;
    frame_time_ms: number;
    render_latency_ms: number;
  };
}

export interface VisualSyncEvent {
  timestamp: number;
  type: 'state_change' | 'effect_trigger' | 'sync_drift' | 'performance_drop';
  description: string;
  visual_state: string;
  os_state: string;
  metadata?: Record<string, unknown>;
}

// ══════════════════════════════════════════════════════════════════
// DEBUGGER STATE
// ══════════════════════════════════════════════════════════════════

export interface DebuggerState {
  // Configuration
  mode: DebuggerMode;
  config: DebuggerModeConfig;

  // Status
  is_active: boolean;
  started_at?: number;

  // Data by mode
  liveMetrics?: LiveMetrics;
  traceSession?: TraceSession;
  riskAssessment?: RiskAssessmentReport;
  replaySession?: ReplaySession;
  snapshots?: OSSnapshot[];
  visualSync?: VisualSyncState;

  // History
  history: Array<{
    timestamp: number;
    mode: DebuggerMode;
    action: string;
    data?: unknown;
  }>;

  // Statistics
  stats: {
    total_traces: number;
    total_snapshots: number;
    total_errors: number;
    total_fixes_applied: number;
    uptime_ms: number;
  };
}

// ══════════════════════════════════════════════════════════════════
// DEBUGGER API
// ══════════════════════════════════════════════════════════════════

export interface DebuggerAPI {
  // Control
  start: (mode: DebuggerMode, config?: Partial<DebuggerModeConfig>) => Promise<void>;
  stop: () => Promise<void>;
  switchMode: (mode: DebuggerMode) => Promise<void>;

  // Snapshots
  snapshot: (label?: string) => Promise<OSSnapshot>;
  compareSnapshots: (id_a: string, id_b: string) => Promise<SnapshotDiff>;

  // Export
  export: (format: 'json' | 'csv' | 'html') => Promise<string>;

  // Auto-fix
  autoFix: (riskId?: string) => Promise<AutoFixResult>;

  // State
  getState: () => DebuggerState;
  getTimeline: () => TraceEntry[];

  // Analysis
  explain: (traceId: string) => Promise<string>;
  sanityCheck: () => Promise<SanityCheckReport>;

  // Sync
  syncWithSingularity: () => Promise<void>;
  syncWithVisualEngine: () => Promise<void>;
}

// ══════════════════════════════════════════════════════════════════
// AUTO-FIX
// ══════════════════════════════════════════════════════════════════

export interface AutoFixResult {
  success: boolean;
  fixes_applied: number;
  fixes_failed: number;
  fixed_risks: string[];
  errors: string[];
  recommendations: string[];
  duration_ms: number;
}

// ══════════════════════════════════════════════════════════════════
// SANITY CHECK
// ══════════════════════════════════════════════════════════════════

export interface SanityCheckReport {
  timestamp: number;
  overall_status: 'Healthy' | 'Warning' | 'Critical';
  checks: Array<{
    id: string;
    name: string;
    status: 'Pass' | 'Fail' | 'Warning';
    message: string;
    details?: string;
  }>;
  recommendations: string[];
  auto_fixes_available: number;
}

// ══════════════════════════════════════════════════════════════════
// EXPORT FORMATS
// ══════════════════════════════════════════════════════════════════

export interface ExportData {
  format: 'json' | 'csv' | 'html';
  timestamp: number;
  mode: DebuggerMode;
  data: unknown;
  metadata: {
    version: string;
    generated_by: string;
    duration_captured_ms: number;
  };
}
