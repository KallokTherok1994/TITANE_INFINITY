/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v17.2.0 - Backend Types (Auto-generated)
 * Types TypeScript pour la nouvelle architecture backend
 * ═══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────
// HELIOS - System Monitoring
// ─────────────────────────────────────────────────────────────────

export interface HeliosState {
  cpu_usage: number;
  ram_usage: number;
  disk_usage: [number, number, number]; // [used, total, percentage]
  uptime: number;
  load_average: [number, number, number]; // [1min, 5min, 15min]
  timestamp: number;
}

export type HealthStatus = 'Healthy' | 'Warning' | 'Critical';

// ─────────────────────────────────────────────────────────────────
// NEXUS - Module Coherence
// ─────────────────────────────────────────────────────────────────

export interface NexusState {
  modules: Record<string, ModuleStatus>;
  coherence_score: number;
  timestamp: number;
}

export interface ModuleStatus {
  name: string;
  health: ModuleHealth;
  last_check: number;
  error_count: number;
}

export type ModuleHealth = 'Healthy' | 'Degraded' | 'Failed';

// ─────────────────────────────────────────────────────────────────
// HARMONIA - System Balancing
// ─────────────────────────────────────────────────────────────────

export interface HarmoniaState {
  balance_score: number;
  stabilization_level: StabilizationLevel;
  adjustments_made: number;
  timestamp: number;
}

export type StabilizationLevel = 'Stable' | 'Adjusting' | 'Critical';

export interface BalanceAction {
  action_type: ActionType;
  target: string;
  priority: number;
  reason: string;
}

export type ActionType = 'Reduce' | 'Increase' | 'Maintain' | 'Alert';

// ─────────────────────────────────────────────────────────────────
// SENTINEL - Anomaly Detection
// ─────────────────────────────────────────────────────────────────

export interface SentinelState {
  integrity_score: number;
  alerts: Alert[];
  scans_performed: number;
  timestamp: number;
}

export interface Alert {
  id: string;
  severity: Severity;
  category: AlertCategory;
  message: string;
  timestamp: number;
  resolved: boolean;
}

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export type AlertCategory = 
  | 'Performance'
  | 'Security'
  | 'Stability'
  | 'Resource'
  | 'Unknown';

// ─────────────────────────────────────────────────────────────────
// MEMORY - Unified Storage
// ─────────────────────────────────────────────────────────────────

export interface MemoryState {
  snapshots_count: number;
  logs_count: number;
  timeline_count: number;
  last_snapshot?: Snapshot;
  last_event?: TimelineEvent;
}

export interface Snapshot {
  id: string;
  timestamp: number;
  helios: HeliosState;
  nexus: NexusState;
  harmonia: HarmoniaState;
  sentinel: SentinelState;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  module: string;
  message: string;
}

export type LogLevel = 'Info' | 'Warning' | 'Error' | 'Critical';

export interface TimelineEvent {
  id: string;
  timestamp: number;
  event_type: EventType;
  description: string;
  metadata?: Record<string, string>;
}

export type EventType = 
  | 'SystemStart'
  | 'SystemStop'
  | 'ModuleRegistered'
  | 'AlertCreated'
  | 'EvolutionComplete'
  | 'Custom';

// ─────────────────────────────────────────────────────────────────
// ENGINE - Auto-Evolution
// ─────────────────────────────────────────────────────────────────

export interface EvolutionReport {
  timestamp: number;
  issues: Issue[];
  recommendations: Recommendation[];
  health_score: number;
  duration_ms: number;
}

export interface Issue {
  severity: IssueSeverity;
  category: string;
  description: string;
  affected_module?: string;
}

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Recommendation {
  priority: number;
  action: string;
  reason: string;
  estimated_impact: string;
  target_module?: string;
}

export interface RepairResult {
  success: boolean;
  action: string;
  message: string;
  timestamp: number;
}

export interface EvolutionState {
  last_evolution?: EvolutionReport;
  history: EvolutionHistory[];
  total_evolutions: number;
}

export interface EvolutionHistory {
  timestamp: number;
  health_score: number;
  issues_count: number;
  repairs_count: number;
}

// ─────────────────────────────────────────────────────────────────
// SYSTEM - Full State
// ─────────────────────────────────────────────────────────────────

export interface SystemState {
  helios: HeliosState;
  nexus: NexusState;
  harmonia: HarmoniaState;
  sentinel: SentinelState;
  memory: MemoryState;
  evolution: EvolutionState;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────
// API RESPONSES
// ─────────────────────────────────────────────────────────────────

export type ApiResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: string };

export interface CommandError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
