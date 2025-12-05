/**
 * TITANE∞ v25 — Orchestration Types
 * Types transversaux pour l'orchestration système
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ═══════════════════════════════════════════════════════════════════════════
// ENGINES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Identifiants des moteurs TITANE
 */
export type EngineId =
  | 'hyper'
  | 'meta'
  | 'quantum'
  | 'identity'
  | 'memory'
  | 'evolution'
  | 'helios'
  | 'harmonia'
  | 'nexus'
  | 'sentinel'
  | 'watchdog'
  | 'selfheal'
  | 'adaptive';

/**
 * État d'un moteur
 */
export interface EngineState {
  id: EngineId;
  name: string;
  status: EngineStatus;
  priority: number;
  lastActivity: Date;
  metrics?: Record<string, number>;
  errors?: string[];
}

export type EngineStatus = 'active' | 'idle' | 'paused' | 'error' | 'disabled';

// ═══════════════════════════════════════════════════════════════════════════
// ORCHESTRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lane d'orchestration (pipeline de moteurs)
 */
export interface OrchestrationLane {
  id: string;
  name: string;
  engines: EngineId[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  flowType: 'sequential' | 'parallel' | 'conditional';
  active: boolean;
  metrics?: {
    throughput: number;
    latency: number;
    errors: number;
  };
}

/**
 * Flux d'orchestration
 */
export interface OrchestrationFlow {
  id: string;
  source: EngineId;
  target: EngineId;
  type: 'data' | 'signal' | 'command' | 'event';
  active: boolean;
  latency?: number;
}

/**
 * Priorités d'orchestration
 */
export interface OrchestrationPriorities {
  cognitive: number;
  system: number;
  maintenance: number;
  user: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUANTUM LAYER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Signal Quantum (faible ou fort)
 */
export interface QuantumSignal {
  id: string;
  type: 'weak' | 'strong';
  confidence: number;
  prediction: string;
  source: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Prédiction Quantum
 */
export interface QuantumPrediction {
  id: string;
  type: 'system' | 'cognitive' | 'user' | 'external';
  prediction: string;
  probability: number;
  timeframe: string;
  signals: QuantumSignal[];
  timestamp: Date;
}

/**
 * Métriques Quantum Layer
 */
export interface QuantumMetrics {
  fps: number;
  cacheHitRate: number;
  gpuUtilization: number;
  memoryUsage: number;
  activeSignals: number;
  predictions: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MULTI-IA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Profil d'un modèle IA
 */
export interface ModelProfile {
  id: string;
  name: string;
  provider: string;
  type: 'local' | 'cloud';
  capabilities: ModelCapability[];
  latency: number;
  cost: number;
  maxTokens: number;
  status: 'available' | 'busy' | 'offline' | 'error';
}

export type ModelCapability =
  | 'completion'
  | 'chat'
  | 'embedding'
  | 'code'
  | 'vision'
  | 'audio'
  | 'reasoning';

/**
 * Stratégie de sélection de modèle
 */
export interface ModelSelectionStrategy {
  preferLocal: boolean;
  fallbackCloud: boolean;
  maxLatency: number;
  maxCostPerRequest: number;
  priorityCapabilities: ModelCapability[];
}

/**
 * Trace d'exécution IA
 */
export interface IAExecutionTrace {
  id: string;
  modelId: string;
  request: string;
  response: string;
  latency: number;
  cost: number;
  tokensUsed: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

/**
 * Statistiques Multi-IA
 */
export interface MultiIAStats {
  totalRequests: number;
  totalCost: number;
  averageLatency: number;
  successRate: number;
  localUsage: number;
  cloudUsage: number;
  modelUsage: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════════
// QA MONITORING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Erreur système
 */
export interface SystemError {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'frontend' | 'backend' | 'engine' | 'ia' | 'network';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

/**
 * Métriques QA
 */
export interface QAMetrics {
  uptime: number;
  errorRate: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeEngines: number;
  healthScore: number;
}

/**
 * Résultat d'auto-heal
 */
export interface AutoHealResult {
  id: string;
  errorId: string;
  action: string;
  success: boolean;
  message: string;
  timestamp: Date;
}
