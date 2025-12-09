/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * CoherenceEngine Types - Fusion Moteur #2 + Nexus
 */

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM STATE & VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export interface SystemState {
  engines: Map<string, EngineState>;
  providers: Map<string, ProviderState>;
  memory: MemoryState;
  coherenceScore: number;
  timestamp: number;
}

export interface EngineState {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'stopped';
  lastActivity: number;
  metrics: EngineMetrics;
}

export interface ProviderState {
  id: string;
  health: number;
  latency: number;
  available: boolean;
}

export interface MemoryState {
  stmCount: number;
  mtmCount: number;
  ltmCount: number;
  totalSize: number;
}

export interface EngineMetrics {
  requestCount: number;
  errorCount: number;
  avgLatency: number;
}

export interface ValidationResult {
  valid: boolean;
  coherenceScore: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  source: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TASK COORDINATION
// ═══════════════════════════════════════════════════════════════════════════

export interface Task {
  id: string;
  type: TaskType;
  priority: number;
  payload: unknown;
  createdAt: number;
  deadline?: number;
  dependencies?: string[];
}

export type TaskType =
  | 'conversation'
  | 'memory'
  | 'analysis'
  | 'healing'
  | 'sync'
  | 'cleanup';

export interface PrioritizedTasks {
  immediate: Task[];
  high: Task[];
  normal: Task[];
  low: Task[];
  deferred: Task[];
}

export interface CoordinationResult {
  success: boolean;
  coordinatedEngines: string[];
  conflicts: Conflict[];
  resolution?: string;
}

export interface Conflict {
  engines: [string, string];
  type: 'resource' | 'state' | 'priority';
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export interface Engine {
  id: string;
  name: string;
  version: string;
  start(): void | Promise<void>;
  stop(): void | Promise<void>;
  getState(): EngineState;
}

export interface Service {
  id: string;
  name: string;
  init(): Promise<void>;
  destroy(): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT BUS
// ═══════════════════════════════════════════════════════════════════════════

export type EventType =
  | 'engine:started'
  | 'engine:stopped'
  | 'engine:error'
  | 'coherence:validated'
  | 'coherence:enforced'
  | 'coherence:violation'
  | 'task:created'
  | 'task:completed'
  | 'task:failed'
  | 'memory:stored'
  | 'memory:recalled'
  | 'provider:healthy'
  | 'provider:unhealthy'
  | 'system:ready'
  | 'system:shutdown';

export interface SystemEvent<T = unknown> {
  type: EventType;
  data: T;
  timestamp?: number;
  source?: string;
}

export type EventHandler<T = unknown> = (event: SystemEvent<T>) => void;

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE BUS
// ═══════════════════════════════════════════════════════════════════════════

export interface Message<T = unknown> {
  id: string;
  from: string;
  to: string;
  type: string;
  payload: T;
  timestamp: number;
  replyTo?: string;
}

export type MessageHandler<T = unknown> = (message: Message<T>) => void | Promise<void>;

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

export interface CoherenceContext {
  conversationId?: string;
  userId?: string;
  sessionId?: string;
  mode: 'strict' | 'normal' | 'relaxed';
  constraints?: CoherenceConstraint[];
}

export interface CoherenceConstraint {
  type: 'tone' | 'topic' | 'length' | 'format';
  value: unknown;
  priority: number;
}
