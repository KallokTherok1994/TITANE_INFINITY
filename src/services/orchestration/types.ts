/**
 * TITANE∞ vΩ — Unified Orchestration Types
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Interface Segregation Pattern for UnifiedOrchestrator
 * Zero circular dependencies, maximum composability
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE ORCHESTRATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Strategy type identifiers
 */
export type OrchestrationStrategyType = 'mcp' | 'cognitive' | 'ai' | 'quantum';

/**
 * Orchestration operation result
 */
export interface OrchestrationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    strategyUsed: OrchestrationStrategyType;
    duration: number;
    timestamp: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH MONITORING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Health status levels
 */
export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown';

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: HealthStatus;
  score: number; // 0-100
  message?: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Health monitor interface
 */
export interface IHealthMonitor {
  checkHealth(): Promise<HealthCheckResult>;
  getHealthScore(): number;
  getStatus(): HealthStatus;
}

// ═══════════════════════════════════════════════════════════════════════════
// METRICS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Metric types
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

/**
 * Single metric value
 */
export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

/**
 * Aggregated metrics
 */
export interface MetricsSummary {
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  errorCount: number;
  timestamp: number;
  details?: Record<string, number>;
}

/**
 * Metrics provider interface
 */
export interface IMetricsProvider {
  recordMetric(metric: Metric): void;
  getMetrics(): Metric[];
  getSummary(): MetricsSummary;
  reset(): void;
}

// ═══════════════════════════════════════════════════════════════════════════
// RECOVERY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Recovery action types
 */
export type RecoveryAction =
  | 'retry'
  | 'fallback'
  | 'circuit-break'
  | 'escalate'
  | 'abort';

/**
 * Recovery policy
 */
export interface RecoveryPolicy {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  fallbackEnabled: boolean;
  circuitBreakerThreshold: number;
}

/**
 * Recovery result
 */
export interface RecoveryResult<T = unknown> {
  recovered: boolean;
  action: RecoveryAction;
  result?: T;
  attempts: number;
  error?: string;
}

/**
 * Recovery handler interface
 */
export interface IRecoveryHandler {
  recover<T>(
    operation: () => Promise<T>,
    policy?: Partial<RecoveryPolicy>
  ): Promise<RecoveryResult<T>>;
  getRecoveryStats(): {
    totalAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Validation issue
 */
export interface ValidationIssue {
  severity: ValidationSeverity;
  message: string;
  field?: string;
  code?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  score?: number; // 0-100
}

/**
 * Validator interface
 */
export interface IValidator<T = unknown> {
  validate(data: T): ValidationResult;
  validateAsync(data: T): Promise<ValidationResult>;
}

// ═══════════════════════════════════════════════════════════════════════════
// ORCHESTRATION STRATEGY INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base orchestration strategy interface
 */
export interface IOrchestrationStrategy extends IHealthMonitor, IMetricsProvider {
  readonly type: OrchestrationStrategyType;
  readonly name: string;

  /**
   * Initialize strategy (lazy loading)
   */
  initialize(): Promise<void>;

  /**
   * Check if strategy is initialized
   */
  isInitialized(): boolean;

  /**
   * Execute strategy-specific operation
   */
  execute<T = unknown>(
    operation: string,
    params?: unknown
  ): Promise<OrchestrationResult<T>>;

  /**
   * Shutdown strategy gracefully
   */
  shutdown(): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MCP STRATEGY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MCP Job operations
 */
export interface MCPJobOperation {
  createJob(
    type: string,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<string>;
  evaluateJob(jobId: string): Promise<{ status: string; result?: unknown }>;
  listJobs(filter?: { status?: string }): { id: string; type: string; status: string }[];
}

/**
 * MCP Health scan operations
 */
export interface MCPHealthOperation {
  scanStability(): Promise<{ score: number; status: string }>;
  scanCoherence(): Promise<{ score: number; status: string }>;
  scanCognitiveLoad(): Promise<{ score: number; status: string }>;
  scanSecurity(): Promise<{ score: number; status: string }>;
  scanMemory(): Promise<{ score: number; status: string }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// COGNITIVE STRATEGY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Memory operation types
 */
export interface CognitiveMemoryOperation {
  storeMemory(content: string, importance?: number): Promise<string>;
  retrieveMemories(
    query: string,
    limit?: number
  ): Promise<Array<{ content: string; score: number }>>;
  processConversation(messages: unknown[]): Promise<void>;
}

/**
 * Goal tracking operations
 */
export interface CognitiveGoalOperation {
  setGoal(description: string, context?: string): Promise<string>;
  checkGoalProgress(goalId: string): Promise<{ achieved: boolean; progress: number }>;
  validateConsistency(text: string): Promise<{ violations: string[]; score: number }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// AI STRATEGY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AI Provider info
 */
export interface AIProviderInfo {
  id: string;
  name: string;
  isAvailable: boolean;
  healthScore: number;
  latency?: number;
}

/**
 * AI Provider operations
 */
export interface AIProviderOperation {
  selectProvider(criteria?: {
    preferLocal?: boolean;
    maxLatency?: number;
  }): Promise<AIProviderInfo>;
  getAvailableProviders(): AIProviderInfo[];
  executeWithProvider(providerId: string, prompt: string): Promise<{ response: string }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// QUANTUM STRATEGY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Quantum signal types
 */
export interface QuantumSignal {
  type: 'weak' | 'strong';
  confidence: number;
  prediction: string;
  timestamp: number;
}

/**
 * Quantum operations
 */
export interface QuantumOperation {
  predictNextState(context: unknown): Promise<QuantumSignal>;
  syncRealtime(fps?: number): Promise<{ synced: boolean; drift: number }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED ORCHESTRATOR CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Strategy configuration
 */
export interface StrategyConfig {
  enabled: boolean;
  lazyLoad: boolean;
  priority: number;
  timeout?: number;
  retryPolicy?: Partial<RecoveryPolicy>;
}

/**
 * Unified orchestrator configuration
 */
export interface UnifiedOrchestratorConfig {
  strategies: {
    mcp?: StrategyConfig;
    cognitive?: StrategyConfig;
    ai?: StrategyConfig;
    quantum?: StrategyConfig;
  };
  defaults: {
    timeout: number;
    enableRecovery: boolean;
    enableMetrics: boolean;
    enableHealthChecks: boolean;
  };
}

/**
 * Orchestrator state
 */
export interface OrchestratorState {
  initialized: boolean;
  activeStrategies: OrchestrationStrategyType[];
  healthStatus: HealthStatus;
  metrics: MetricsSummary;
  lastUpdate: number;
}
