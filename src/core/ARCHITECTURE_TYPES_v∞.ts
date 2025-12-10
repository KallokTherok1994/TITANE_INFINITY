/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v18.0.0 — ARCHITECTURE TYPES v∞
 * Types unifiés pour tous les moteurs et états
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
// CORE ENGINE TYPES
// ═══════════════════════════════════════════════════════════════

export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'offline';

// Core status for engines
export type CoreStatus =
  | 'Running'
  | 'Ready'
  | 'Initializing'
  | 'Stopped'
  | 'Uninitialized';

// Core health with timestamp
export interface CoreHealth {
  status: CoreStatus;
  level: number; // 0.0 - 1.0
  message: string;
  timestamp: number;
}

// Core result type (sync or async)
export type CoreResult<T> = Promise<Result<T, CoreError>> | Result<T, CoreError>;

// Core error type
export interface CoreError {
  category: 'validation' | 'internal' | 'network' | 'timeout';
  message: string;
  details?: string;
  timestamp: number;
}

// Result type for Rust-style error handling
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export interface EngineHealth {
  status: HealthStatus;
  cpu: number;
  memory: number;
  latency: number;
  errors: number;
  lastUpdate: number;
}

export interface EngineState<TConfig = unknown, TData = unknown> {
  id: string;
  name: string;
  version: string;
  initialized: boolean;
  running: boolean;
  health: EngineHealth;
  config: TConfig;
  metrics: EngineMetrics;
  data?: TData;
}

export interface EngineMetrics {
  tickCount: number;
  avgLatency: number;
  peakLatency: number;
  errorCount: number;
  uptime: number;
  lastTick: number;
}

export interface EnginePulse<TData = unknown> {
  timestamp: number;
  engineId: string;
  health: EngineHealth;
  data?: TData;
}

export interface EngineAction<TPayload = unknown> {
  type: string;
  payload: TPayload;
  timestamp: number;
  engineId?: string;
}

// ═══════════════════════════════════════════════════════════════
// SINGULARITY STATE
// ═══════════════════════════════════════════════════════════════

export interface SingularityState {
  // Meta
  version: string;
  timestamp: number;

  // Consciousness
  consciousness: number;
  autoCoherence: number;
  resonance: number;

  // Engines
  engines: {
    [key: string]: EngineState;
  };

  // Global Health
  globalHealth: EngineHealth;

  // Connections
  connections: number;
  activeConnections: string[];
}

export interface SingularityPulse {
  timestamp: number;
  state: Partial<SingularityState>;
  events: string[];
}

// ═══════════════════════════════════════════════════════════════
// FRONTEND UI STATE
// ═══════════════════════════════════════════════════════════════

export type UIMode = 'ruby' | 'sapphire' | 'emerald' | 'diamond' | 'titanium';
export type UITheme = 'dark' | 'light' | 'auto';

export interface UIState {
  mode: UIMode;
  theme: UITheme;
  soundEnabled: boolean;
  micEnabled: boolean;
  glowIntensity: number;
  motionEnabled: boolean;
  fps: number;
}

export interface UIContext {
  page: string;
  focus: boolean;
  fullscreen: boolean;
  devicePixelRatio: number;
}

// ═══════════════════════════════════════════════════════════════
// AI/LLM TYPES
// ═══════════════════════════════════════════════════════════════

export type AIModel = 'gpt-4' | 'claude-3' | 'llama2' | 'ollama' | 'local';
export type AIStatus =
  | 'idle'
  | 'processing'
  | 'thinking'
  | 'streaming'
  | 'error'
  | 'fallback';

export interface AIState {
  model: AIModel;
  status: AIStatus;
  error: string | null;
  fallbackActive: boolean;
  temperature: number;
  maxTokens: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: AIModel;
  tokens?: number;
}

// Alias for MessageBubble compatibility
export type Message = AIMessage;

// ═══════════════════════════════════════════════════════════════
// AUDIO/VISUAL TYPES
// ═══════════════════════════════════════════════════════════════

export interface AudioMetrics {
  volume: number;
  frequency: number;
  tempo: number;
  energy: number;
}

export interface VisualMetrics {
  fps: number;
  drawCalls: number;
  vertices: number;
  cpuUsage: number;
}

// ═══════════════════════════════════════════════════════════════
// TAURI RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface CoreResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface CommandResult<T = any> extends CoreResponse<T> {
  command: string;
  duration: number;
}

// ═══════════════════════════════════════════════════════════════
// ENGINE-SPECIFIC DATA TYPES
// ═══════════════════════════════════════════════════════════════

// Helios (Solar) Engine - Metrics & Performance
export interface HeliosMetrics {
  uptime: number;
  temperature: number;
  powerLevel: number;
  efficiency: number;
  cycles: number;
  lastSync: number;
}

// Memory Engine - Storage & Retrieval
export interface MemoryData {
  totalEntries: number;
  usedSpace: number;
  maxSpace: number;
  indexedCount: number;
  recentAccess: string[];
  cacheHitRate: number;
}

// Harmonia Engine - Flow & Balance
export interface HarmoniaFlows {
  balance: number;
  coherence: number;
  resonance: number;
  flowRate: number;
  activeFlows: string[];
  harmonics: number[];
}

// Nexus Engine - Connections & Graph
export interface NexusGraph {
  nodeCount: number;
  edgeCount: number;
  clusters: number;
  connectivity: number;
  centralNodes: string[];
  graphDensity: number;
}

// Sentinel Engine - Monitoring & Alerts
export interface SentinelAlerts {
  activeAlerts: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  lastScan: number;
  threatLevel: number;
}

// Watchdog Engine - Health & Auto-Heal
export interface WatchdogData {
  monitored: number;
  healthy: number;
  degraded: number;
  critical: number;
  autoHealEnabled: boolean;
  lastCheck: number;
}

// SelfHeal Engine - Recovery & Repair
export interface SelfHealData {
  healingActive: boolean;
  repairQueue: number;
  successRate: number;
  lastHeal: number;
  totalHeals: number;
  failedHeals: number;
}

// Adaptive Engine - Learning & Optimization
export interface AdaptiveData {
  learningRate: number;
  optimizationScore: number;
  adaptations: number;
  patterns: string[];
  confidence: number;
  lastAdaptation: number;
}

// Union type for all engine data
export type EngineData =
  | HeliosMetrics
  | MemoryData
  | HarmoniaFlows
  | NexusGraph
  | SentinelAlerts
  | WatchdogData
  | SelfHealData
  | AdaptiveData;

// ═══════════════════════════════════════════════════════════════
// TAURI BRIDGE TYPES
// ═══════════════════════════════════════════════════════════════

// Chat message types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// Voice recording result
export interface VoiceRecordingResult {
  text: string;
  confidence: number;
  duration: number;
}

// System status and metrics
export interface SystemStatus {
  version: string;
  uptime: number;
  platform: string;
  architecture: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkActivity: number;
}

// Module info
export interface ModuleInfo {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
  description?: string;
}

// Project info
export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  lastAccess: number;
  status: 'active' | 'archived';
}

// Persona multipliers
export interface PersonaMultipliers {
  creativity: number;
  precision: number;
  speed: number;
  complexity: number;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════

// Type for highly dynamic data (controlled replacement for 'any')
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Type for dynamic module data
export type DynamicDataValue = JsonValue | undefined;

// Memory entry type
export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: number;
  encrypted?: boolean;
  tags?: string[];
  metadata?: Record<string, JsonValue>;
}

// Persona speed type
export type PersonaSpeed = 'slow' | 'normal' | 'fast';

// Tauri window API types
export interface TauriWindow {
  getCurrent(): {
    openDevtools(): Promise<void>;
  };
}

export interface TauriAPI {
  window: TauriWindow;
}

// Global window extension for Tauri runtime
declare global {
  interface Window {
    __TAURI__?: TauriAPI;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export type {
  // Re-export all for convenience
  EngineState as Engine,
  SingularityState as Singularity,
  UIState as UI,
  AIState as AI,
};
