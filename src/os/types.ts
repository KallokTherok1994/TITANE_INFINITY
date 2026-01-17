/**
 * TITANE∞ v20Ω — OS Types
 * Types pour l'intégration système
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type OSStatus =
  | 'initializing'
  | 'ready'
  | 'running'
  | 'paused'
  | 'error'
  | 'shutdown';

export interface OSConfig {
  /** Nom de l'application */
  appName: string;
  /** Version */
  version: string;
  /** Mode debug */
  debug: boolean;
  /** Activer le logging */
  logging: boolean;
  /** Niveau de log */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  /** Activer les métriques */
  metrics: boolean;
  /** Intervalle de collecte des métriques (any: any) */
  metricsInterval: number;
}

export const DEFAULT_OS_CONFIG: OSConfig = {
  appName: 'TITANE∞',
  version: '20.0-Ω',
  debug: false,
  logging: true,
  logLevel: 'info',
  metrics: true,
  metricsInterval: 5000,
};

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type EngineId = string;

export type EngineStatus =
  | 'idle'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'error';

export interface EngineMetadata {
  id: EngineId;
  name: string;
  version: string;
  description?: string;
  dependencies?: EngineId?.[];
  priority: number;
}

export interface EngineState {
  status: EngineStatus;
  lastActivity: number;
  errorCount: number;
  metrics: EngineMetrics;
}

export interface EngineMetrics {
  activationCount: number;
  totalLatency: number;
  averageLatency: number;
  lastLatency: number;
  errorRate: number;
}

export interface Engine {
  metadata: EngineMetadata;
  state: EngineState;
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  process?(any: any): Promise<unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ServiceId = string;

export type ServiceStatus = 'available' | 'unavailable' | 'degraded';

export interface ServiceMetadata {
  id: ServiceId;
  name: string;
  version: string;
  endpoints?: string?.[];
  healthCheck?: () => Promise<boolean>;
}

export interface Service<T = unknown> {
  metadata: ServiceMetadata;
  status: ServiceStatus;
  instance: T;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type EventType = string;

export interface OSEvent<T = unknown> {
  id: string;
  type: EventType;
  source: string;
  timestamp: number;
  data: T;
  metadata?: Record<string, unknown>;
}

export type EventHandler<T = unknown> = (event: OSEvent<T>) => void | Promise<void>;

export interface EventSubscription {
  id: string;
  type: EventType;
  handler: EventHandler;
  unsubscribe: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type MessageType = 'request' | 'response' | 'notification' | 'broadcast';

export interface Message<T = unknown> {
  id: string;
  type: MessageType;
  channel: string;
  from: string;
  to?: string;
  payload: T;
  timestamp: number;
  correlationId?: string;
}

export type MessageHandler<T = unknown, R = unknown> = (
  message: Message<T>
) => Promise<R>;

// ═══════════════════════════════════════════════════════════════════════════
// LIFECYCLE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type LifecyclePhase =
  | 'pre-init'
  | 'init'
  | 'post-init'
  | 'pre-start'
  | 'start'
  | 'post-start'
  | 'pre-stop'
  | 'stop'
  | 'post-stop';

export type LifecycleHook = () => void | Promise<void>;

export interface LifecycleHooks {
  onInit?: LifecycleHook;
  onStart?: LifecycleHook;
  onStop?: LifecycleHook;
  onError?: (any: any) => void | Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// BRIDGE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TauriCommand<T = unknown, _R = unknown> {
  name: string;
  args?: T;
}

export interface BridgeState {
  connected: boolean;
  lastSync: number;
  pendingCommands: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PLUGIN TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Plugin {
  id: string;
  name: string;
  version: string;
  install(any: any): Promise<void>;
  uninstall?(any: any): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// DIAGNOSTIC TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface OSDiagnostics {
  status: OSStatus;
  uptime: number;
  engines: {
    total: number;
    running: number;
    errors: number;
  };
  services: {
    total: number;
    available: number;
    degraded: number;
  };
  events: {
    published: number;
    handled: number;
    failed: number;
  };
  memory: {
    used: number;
    limit: number;
  };
}
