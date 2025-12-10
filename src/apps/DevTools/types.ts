/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — DevTools Types                                  ║
 * ║   SUPER PROMPT #5: Console Cognitive & Diagnostic Suite           ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════
// OMEGA PIPELINE EVENTS
// ═══════════════════════════════════════════════════════════════

export interface OmegaStepEvent {
  step_id: number;
  step_name: string;
  engine_id: string;
  started_at: number;
  completed_at?: number;
  duration_ms?: number;
  status: 'running' | 'completed' | 'failed';
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface OmegaCompleteEvent {
  pipeline_id: string;
  total_duration_ms: number;
  steps: OmegaStepEvent[];
  success: boolean;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// METRICS
// ═══════════════════════════════════════════════════════════════

export interface EngineMetrics {
  engine_id: string;
  engine_name: string;
  latency_ms: number;
  p50: number;
  p95: number;
  p99: number;
  error_rate: number;
  call_count: number;
  last_called: number;
}

export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  memory_total: number;
  disk_usage: number;
  process_count: number;
  uptime_seconds: number;
  timestamp: number;
}

export interface MetricsSnapshot {
  system: SystemMetrics;
  engines: EngineMetrics[];
  omega_latency_ms: number;
  asr_latency_ms?: number;
  tts_latency_ms?: number;
}

// ═══════════════════════════════════════════════════════════════
// LOGS
// ═══════════════════════════════════════════════════════════════

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  source: string; // 'rust' | 'frontend' | engine name
  message: string;
  metadata?: Record<string, unknown>;
  stack_trace?: string;
}

// ═══════════════════════════════════════════════════════════════
// MEMORY
// ═══════════════════════════════════════════════════════════════

export interface MemoryNode {
  id: string;
  content: string;
  tier: 'STM' | 'MTM' | 'LTM';
  importance: number;
  access_count: number;
  created_at: number;
  last_accessed: number;
  context?: string;
  metadata?: Record<string, unknown>;
}

export interface MemorySnapshot {
  stm_count: number;
  mtm_count: number;
  ltm_count: number;
  stm_nodes: MemoryNode[];
  mtm_nodes: MemoryNode[];
  ltm_nodes: MemoryNode[];
  total_nodes: number;
}

// ═══════════════════════════════════════════════════════════════
// ENGINES
// ═══════════════════════════════════════════════════════════════

export type EngineStatus = 'idle' | 'running' | 'error' | 'disabled';

export interface EngineState {
  id: string;
  name: string;
  status: EngineStatus;
  health: 'healthy' | 'degraded' | 'critical';
  initialized_at: number;
  last_run: number;
  latency_ms: number;
  error_count: number;
  last_error?: string;
  config: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// SELF-HEALING
// ═══════════════════════════════════════════════════════════════

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type HealingAction =
  | 'ClearSTM'
  | 'RestartEngine'
  | 'ResetState'
  | 'Fallback'
  | 'NoOp';

export interface Incident {
  id: string;
  timestamp: number;
  severity: IncidentSeverity;
  source: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface HealingEvent {
  incident_id: string;
  action: HealingAction;
  timestamp: number;
  success: boolean;
  duration_ms: number;
  details?: string;
}

export interface SelfHealingSnapshot {
  incidents: Incident[];
  healing_events: HealingEvent[];
  stability_score: number;
  auto_heal_enabled: boolean;
  repairs_performed: number;
  success_rate: number;
}

// ═══════════════════════════════════════════════════════════════
// VOICE MONITOR
// ═══════════════════════════════════════════════════════════════

export interface VoiceMetrics {
  vad_active: boolean;
  input_level: number; // 0-1 amplitude
  asr_latency_ms: number;
  tts_latency_ms: number;
  asr_errors: number;
  tts_errors: number;
  last_asr_result?: string;
  last_tts_duration_ms?: number;
}

// ═══════════════════════════════════════════════════════════════
// EVENTS TIMELINE
// ═══════════════════════════════════════════════════════════════

export type EventType =
  | 'omega_step'
  | 'omega_complete'
  | 'memory_store'
  | 'memory_recall'
  | 'engine_started'
  | 'engine_finished'
  | 'voice_input'
  | 'voice_output'
  | 'self_healing'
  | 'system_health';

export interface TimelineEvent {
  id: string;
  type: EventType;
  timestamp: number;
  source: string;
  summary: string;
  details?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// CONSOLE
// ═══════════════════════════════════════════════════════════════

export interface ConsoleCommand {
  command: string;
  timestamp: number;
}

export interface ConsoleResult {
  command: string;
  result: unknown;
  success: boolean;
  error?: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════
// DEVTOOLS STATE
// ═══════════════════════════════════════════════════════════════

export interface DevToolsState {
  connected: boolean;
  recording: boolean;
  paused: boolean;
  filter_level: LogLevel;
  selected_engine?: string;
  timeline_window_ms: number;
}
