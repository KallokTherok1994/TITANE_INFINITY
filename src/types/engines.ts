/**
 * TITANE∞ v16.2.2 — Types Centralisés Engines & State
 * Remplace tous les `any` sauvages par des types propres
 */

// ═══════════════════════════════════════════════════════════════
// ENGINES STATE TYPES
// ═══════════════════════════════════════════════════════════════

export type EngineName =
  | 'helios'
  | 'nexus'
  | 'harmonia'
  | 'sentinel'
  | 'watchdog'
  | 'memory'
  | 'cognitive'
  | 'adaptive'
  | 'narrative'
  | 'avatar'
  | 'fusion'
  | 'singularity';

export interface EngineHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  cpu: number; // 0-100
  memory: number; // MB
  errors: number;
  uptime: number; // seconds
  last_check: string; // ISO timestamp
}

export interface EngineMetrics {
  fps?: number;
  latency?: number; // ms
  throughput?: number; // ops/sec
  success_rate?: number; // 0-1
  queue_size?: number;
}

export interface EngineState<T = unknown> {
  name: EngineName;
  initialized: boolean;
  health: EngineHealth;
  metrics: EngineMetrics;
  data?: T; // Engine-specific data
}

// ═══════════════════════════════════════════════════════════════
// COGNITIVE ENGINE TYPES
// ═══════════════════════════════════════════════════════════════

export interface IntentionAnalysis {
  primary: string;
  secondary?: string[];
  confidence: number; // 0-1
  context: Record<string, unknown>;
  timestamp: string;
}

export interface CognitiveResponse {
  text: string;
  confidence: number; // 0-1
  sources?: string[];
  reasoning?: string[];
  metadata?: Record<string, unknown>;
}

export interface CognitiveState {
  load: number; // 0-1 (cognitive load)
  focus: string[]; // Active concepts
  inconsistencies_detected: number;
  last_analysis?: IntentionAnalysis;
  last_response?: CognitiveResponse;
}

// ═══════════════════════════════════════════════════════════════
// SINGULARITY FUSION TYPES
// ═══════════════════════════════════════════════════════════════

export interface FusionState {
  fusion_integrity: number; // 0-1
  active_pipelines: number;
  sync_status: 'synced' | 'syncing' | 'diverged' | 'error';
  last_sync: string;
  metrics: {
    sync_duration?: number; // ms
    data_size?: number; // bytes
    conflicts?: number;
  };
}

export interface PipelineStats {
  total_executions: number;
  success_rate: number; // 0-1
  average_duration: number; // ms
  errors: Array<{
    timestamp: string;
    stage: string;
    error: string;
  }>;
}

export interface PerformanceMetrics {
  fps: number;
  cpu: number; // 0-100
  memory_mb: number;
  gpu?: number; // 0-100
  latency_ms: number;
}

export interface ThreatInfo {
  type: 'memory_leak' | 'infinite_loop' | 'crash' | 'deadlock' | 'overflow';
  severity: 'low' | 'medium' | 'high' | 'critical';
  module: string;
  timestamp: string;
  details: string;
}

export interface AutoFixStats {
  total_fixes: number;
  success_rate: number; // 0-1
  categories: Record<string, number>;
  last_fix?: {
    timestamp: string;
    issue: string;
    resolution: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// AVATAR & TTS TYPES
// ═══════════════════════════════════════════════════════════════

export interface TTSStatus {
  provider: 'hybrid' | 'edge' | 'espeak' | 'offline';
  available: boolean;
  voice: string;
  rate: number; // 0-2
  pitch: number; // 0-2
}

export interface AvatarMorph {
  viseme: string; // A, E, I, O, U, etc.
  intensity: number; // 0-1
  duration: number; // ms
}

export interface AvatarExpression {
  type: 'neutral' | 'happy' | 'thinking' | 'excited' | 'concerned';
  intensity: number; // 0-1
}

export interface AvatarState {
  speaking: boolean;
  current_morph?: AvatarMorph;
  expression: AvatarExpression;
  immersion_mode: boolean;
}

// ═══════════════════════════════════════════════════════════════
// MEMORY & KNOWLEDGE TYPES
// ═══════════════════════════════════════════════════════════════

export interface MemoryEntry {
  id: string;
  content: string;
  category: 'conversation' | 'knowledge' | 'event' | 'decision';
  timestamp: string;
  tags: string[];
  importance: number; // 0-1
  references?: string[]; // IDs of related entries
}

export interface MemoryStats {
  total_entries: number;
  size_mb: number;
  categories: Record<string, number>;
  oldest_entry?: string; // ISO timestamp
  newest_entry?: string;
}

// ═══════════════════════════════════════════════════════════════
// EVENT & STATE DIFF TYPES
// ═══════════════════════════════════════════════════════════════

export interface StateSnapshot<T = unknown> {
  timestamp: string;
  version: string;
  data: T;
  hash?: string;
}

export interface StateDelta<T = unknown> {
  changed: Array<{
    path: string;
    old: unknown;
    new: unknown;
  }>;
  added: Array<{
    path: string;
    value: unknown;
  }>;
  removed: Array<{
    path: string;
    old: unknown;
  }>;
  metadata?: T;
}

export interface EventData {
  type: string;
  payload: Record<string, unknown>;
  source: EngineName | 'system' | 'user';
  timestamp: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

// ═══════════════════════════════════════════════════════════════
// DIAGNOSTIC & TEST TYPES
// ═══════════════════════════════════════════════════════════════

export interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'skipped';
  data?: unknown;
  error?: string;
  duration?: number; // ms
  timestamp?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  engines: Record<EngineName, EngineHealth>;
  alerts: Array<{
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    source: string;
    timestamp: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════
// CHAT & AI TYPES
// ═══════════════════════════════════════════════════════════════

export interface ChatProvider {
  name: 'gemini' | 'ollama' | 'local';
  available: boolean;
  latency?: number; // ms
  model?: string;
  config?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  provider?: ChatProvider['name'];
  metadata?: {
    tokens?: number;
    latency?: number;
    confidence?: number;
  };
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  title?: string;
  summary?: string;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export interface Timestamped<T> {
  data: T;
  timestamp: string;
}

export interface Versioned<T> {
  data: T;
  version: string;
  prev_version?: string;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS & TYPE GUARDS
// ═══════════════════════════════════════════════════════════════

export function isEngineName(name: string): name is EngineName {
  const validNames: EngineName[] = [
    'helios',
    'nexus',
    'harmonia',
    'sentinel',
    'watchdog',
    'memory',
    'cognitive',
    'adaptive',
    'narrative',
    'avatar',
    'fusion',
    'singularity',
  ];
  return validNames.includes(name as EngineName);
}

export function isResult<T>(value: unknown): value is Result<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ok' in value &&
    typeof (value as { ok: unknown }).ok === 'boolean'
  );
}
