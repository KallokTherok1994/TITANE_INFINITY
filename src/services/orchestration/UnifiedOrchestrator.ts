/**
 * TITANE∞ vΩ — Unified Orchestrator
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * 
 * Consolidates 5 orchestrators into 1 unified system:
 * - MCPOrchestrator (MCP-Ω governance)
 * - CognitiveOmegaOrchestrator (cognitive engines)
 * - AIOrchestrator (neural provider selection)
 * - AIOrchestrator OMNIS (cognitive provider selection)
 * - vsync_orchestrator (quantum/FPS)
 * 
 * Architecture: Strategy Pattern + Interface Segregation
 * Performance targets: -52% CPU, -42% latency
 * Code reduction: 3,382 lines → ~1,800 lines (-47%)
 */

import type {
  IOrchestrationStrategy,
  OrchestrationStrategyType,
  UnifiedOrchestratorConfig,
  OrchestratorState,
  HealthStatus,
  HealthCheckResult,
  MetricsSummary,
  Metric,
  OrchestrationResult
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: UnifiedOrchestratorConfig = {
  strategies: {
    mcp: { enabled: true, lazyLoad: true, priority: 100 },
    cognitive: { enabled: true, lazyLoad: true, priority: 90 },
    ai: { enabled: true, lazyLoad: true, priority: 80 },
    quantum: { enabled: false, lazyLoad: true, priority: 70 }
  },
  defaults: {
    timeout: 30000,
    enableRecovery: true,
    enableMetrics: true,
    enableHealthChecks: true
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class UnifiedOrchestrator {
  private config: UnifiedOrchestratorConfig;
  private strategies: Map<OrchestrationStrategyType, IOrchestrationStrategy>;
  private metrics: Metric[];
  private initialized: boolean;
  private initializationPromise: Promise<void> | null;

  constructor(config?: Partial<UnifiedOrchestratorConfig>) {
    this.config = this.mergeConfig(config);
    this.strategies = new Map();
    this.metrics = [];
    this.initialized = false;
    this.initializationPromise = null;

    this.log('UnifiedOrchestrator created (lazy init enabled)');
  }

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Initialize all enabled strategies
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.doInitialize();
    return this.initializationPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      this.log('Initializing enabled strategies...');

      // Initialize strategies in priority order
      const strategyTypes = this.getEnabledStrategies();
      
      for (const type of strategyTypes) {
        const strategy = await this.loadStrategy(type);
        if (strategy) {
          this.strategies.set(type, strategy);
          if (!this.config.strategies[type]?.lazyLoad) {
            await strategy.initialize();
          }
        }
      }

      this.initialized = true;
      this.log(`Initialized with ${this.strategies.size} strategies`);
    } catch (error) {
      this.logError('Initialization failed', error);
      throw error;
    }
  }

  /**
   * Get list of enabled strategies sorted by priority
   */
  private getEnabledStrategies(): OrchestrationStrategyType[] {
    return (Object.entries(this.config.strategies) as [OrchestrationStrategyType, any][])
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => (b.priority || 0) - (a.priority || 0))
      .map(([type]) => type);
  }

  /**
   * Load strategy dynamically (lazy loading)
   */
  private async loadStrategy(type: OrchestrationStrategyType): Promise<IOrchestrationStrategy | null> {
    try {
      this.log(`Loading strategy: ${type}`);
      
      switch (type) {
        case 'mcp':
          const { MCPStrategy } = await import('./strategies/MCPStrategy');
          return new MCPStrategy();
        
        case 'cognitive':
          const { CognitiveStrategy } = await import('./strategies/CognitiveStrategy');
          return new CognitiveStrategy();
        
        case 'ai':
          const { AIStrategy } = await import('./strategies/AIStrategy');
          return new AIStrategy();
        
        case 'quantum':
          const { QuantumStrategy } = await import('./strategies/QuantumStrategy');
          return new QuantumStrategy();
        
        default:
          this.logError(`Unknown strategy type: ${type}`);
          return null;
      }
    } catch (error) {
      this.logError(`Failed to load strategy ${type}`, error);
      return null;
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // STRATEGY ACCESS
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Get strategy by type (lazy load if needed)
   */
  async getStrategy<T extends IOrchestrationStrategy>(
    type: OrchestrationStrategyType
  ): Promise<T | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    let strategy = this.strategies.get(type);
    
    if (!strategy) {
      // Try to load strategy if not yet loaded
      strategy = await this.loadStrategy(type);
      if (strategy) {
        this.strategies.set(type, strategy);
      }
    }

    // Initialize strategy if lazy-loaded
    if (strategy && !strategy.isInitialized()) {
      await strategy.initialize();
    }

    return strategy as T | null;
  }

  /**
   * Check if strategy is available
   */
  hasStrategy(type: OrchestrationStrategyType): boolean {
    return this.strategies.has(type);
  }

  /**
   * Get all active strategy types
   */
  getActiveStrategies(): OrchestrationStrategyType[] {
    return Array.from(this.strategies.keys());
  }

  // ───────────────────────────────────────────────────────────────────────
  // HEALTH MONITORING
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Get overall health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    if (!this.initialized) {
      return 'unknown';
    }

    const healthChecks = await Promise.all(
      Array.from(this.strategies.values()).map(s => s.checkHealth())
    );

    const scores = healthChecks.map(h => h.score);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    if (avgScore >= 90) return 'healthy';
    if (avgScore >= 70) return 'degraded';
    if (avgScore >= 50) return 'critical';
    return 'unknown';
  }

  /**
   * Get detailed health check for all strategies
   */
  async checkHealth(): Promise<Record<OrchestrationStrategyType, HealthCheckResult>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const results: Record<string, HealthCheckResult> = {};

    for (const [type, strategy] of this.strategies.entries()) {
      try {
        results[type] = await strategy.checkHealth();
      } catch (error) {
        results[type] = {
          status: 'critical',
          score: 0,
          message: `Health check failed: ${error}`,
          timestamp: Date.now()
        };
      }
    }

    return results as Record<OrchestrationStrategyType, HealthCheckResult>;
  }

  // ───────────────────────────────────────────────────────────────────────
  // METRICS COLLECTION
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Get aggregated metrics from all strategies
   */
  getMetrics(): MetricsSummary {
    if (!this.initialized) {
      return {
        totalRequests: 0,
        successRate: 1.0,
        averageLatency: 0,
        errorCount: 0,
        timestamp: Date.now()
      };
    }

    const summaries = Array.from(this.strategies.values()).map(s => s.getSummary());
    
    const totalRequests = summaries.reduce((sum, s) => sum + s.totalRequests, 0);
    const errorCount = summaries.reduce((sum, s) => sum + s.errorCount, 0);
    const avgLatency = summaries.reduce((sum, s) => sum + s.averageLatency, 0) / summaries.length;
    const successRate = totalRequests > 0 ? (totalRequests - errorCount) / totalRequests : 1.0;

    return {
      totalRequests,
      successRate,
      averageLatency: avgLatency,
      errorCount,
      timestamp: Date.now(),
      details: {
        strategiesActive: this.strategies.size
      }
    };
  }

  /**
   * Get current orchestrator state
   */
  getState(): OrchestratorState {
    return {
      initialized: this.initialized,
      activeStrategies: this.getActiveStrategies(),
      healthStatus: 'unknown', // Will be computed async
      metrics: this.getMetrics(),
      lastUpdate: Date.now()
    };
  }

  // ───────────────────────────────────────────────────────────────────────
  // EXECUTION
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Execute operation using specified strategy
   */
  async execute<T = unknown>(
    strategyType: OrchestrationStrategyType,
    operation: string,
    params?: unknown
  ): Promise<OrchestrationResult<T>> {
    const startTime = Date.now();

    try {
      const strategy = await this.getStrategy(strategyType);
      
      if (!strategy) {
        return {
          success: false,
          error: `Strategy ${strategyType} not available`,
          metadata: {
            strategyUsed: strategyType,
            duration: Date.now() - startTime,
            timestamp: Date.now()
          }
        };
      }

      const result = await strategy.execute<T>(operation, params);
      
      // Record success metric
      this.recordMetric({
        name: 'orchestration.execute',
        type: 'counter',
        value: 1,
        timestamp: Date.now(),
        tags: { strategy: strategyType, success: 'true' }
      });

      return result;
    } catch (error) {
      this.logError(`Execution failed for ${strategyType}.${operation}`, error);
      
      // Record error metric
      this.recordMetric({
        name: 'orchestration.execute',
        type: 'counter',
        value: 1,
        timestamp: Date.now(),
        tags: { strategy: strategyType, success: 'false' }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          strategyUsed: strategyType,
          duration: Date.now() - startTime,
          timestamp: Date.now()
        }
      };
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // SHUTDOWN
  // ───────────────────────────────────────────────────────────────────────

  /**
   * Shutdown all strategies gracefully
   */
  async shutdown(): Promise<void> {
    this.log('Shutting down...');

    const shutdownPromises = Array.from(this.strategies.values()).map(s => 
      s.shutdown().catch(err => this.logError('Strategy shutdown error', err))
    );

    await Promise.all(shutdownPromises);

    this.strategies.clear();
    this.initialized = false;
    this.log('Shutdown complete');
  }

  // ───────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ───────────────────────────────────────────────────────────────────────

  private mergeConfig(partial?: Partial<UnifiedOrchestratorConfig>): UnifiedOrchestratorConfig {
    return {
      strategies: {
        ...DEFAULT_CONFIG.strategies,
        ...partial?.strategies
      },
      defaults: {
        ...DEFAULT_CONFIG.defaults,
        ...partial?.defaults
      }
    };
  }

  private recordMetric(metric: Metric): void {
    if (!this.config.defaults.enableMetrics) return;
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private log(message: string, ...args: unknown[]): void {
    console.log(`[UnifiedOrchestrator] ${message}`, ...args);
  }

  private logError(message: string, error?: unknown): void {
    console.error(`[UnifiedOrchestrator ERROR] ${message}`, error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const unifiedOrchestrator = new UnifiedOrchestrator();
