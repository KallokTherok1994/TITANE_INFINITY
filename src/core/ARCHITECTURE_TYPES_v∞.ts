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

export interface EngineHealth {
  status: HealthStatus;
  cpu: number;
  memory: number;
  latency: number;
  errors: number;
  lastUpdate: number;
}

export interface EngineState<T = any> {
  id: string;
  name: string;
  version: string;
  initialized: boolean;
  running: boolean;
  health: EngineHealth;
  config: T;
  metrics: EngineMetrics;
  data?: any;
}

export interface EngineMetrics {
  tickCount: number;
  avgLatency: number;
  peakLatency: number;
  errorCount: number;
  uptime: number;
  lastTick: number;
}

export interface EnginePulse {
  timestamp: number;
  engineId: string;
  health: EngineHealth;
  data?: any;
}

export interface EngineAction<T = any> {
  type: string;
  payload: T;
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
export type AIStatus = 'idle' | 'processing' | 'thinking' | 'streaming' | 'error' | 'fallback';

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
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export type {
  // Re-export all for convenience
  EngineState as Engine,
  SingularityState as Singularity,
  UIState as UI,
  AIState as AI,
};
