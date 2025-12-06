/**
 * TITANE∞ vΩ — AI Strategy
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * 
 * AI Provider Selection & Orchestration Strategy
 * Consolidates orchestrator.ts (998 lines) + orchestrator_OMNIS_v1.ts (510 lines)
 */

import type {
  IOrchestrationStrategy,
  OrchestrationStrategyType,
  OrchestrationResult,
  HealthCheckResult,
  HealthStatus,
  MetricsSummary,
  Metric,
  AIProviderOperation,
  AIProviderInfo
} from '../types';

// Import existing AI Orchestrators
import { aiOrchestrator } from '@/services/ai/orchestrator';
import { omnisOrchestrator } from '@/services/ai/orchestrator_OMNIS_v1';
import type { AIMessage } from '@/services/ai/types';

// ═══════════════════════════════════════════════════════════════════════════
// AI STRATEGY
// ═══════════════════════════════════════════════════════════════════════════

export class AIStrategy implements IOrchestrationStrategy, AIProviderOperation {
  readonly type: OrchestrationStrategyType = 'ai';
  readonly name = 'AI Provider Strategy';

  private initialized = false;
  private metrics: Metric[] = [];
  
  // References to existing AI Orchestrators (delegation pattern)
  private standardOrchestrator = aiOrchestrator;
  private cognitiveOrchestrator = omnisOrchestrator;
  
  // Mode selection: 'standard' (neural order) or 'cognitive' (OMNIS)
  private mode: 'standard' | 'cognitive' = 'standard';

  constructor() {
    this.log('AIStrategy created (delegating to AI Orchestrators)');
  }

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.log('Initializing AI providers...');
    
    // AI Orchestrators are already initialized as singletons
    // Just verify they're available
    if (!this.standardOrchestrator || !this.cognitiveOrchestrator) {
      throw new Error('AI Orchestrators not available');
    }

    this.initialized = true;
    this.log('AI providers initialized (delegating to existing orchestrators)');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // ───────────────────────────────────────────────────────────────────────
  // EXECUTION
  // ───────────────────────────────────────────────────────────────────────

  async execute<T = unknown>(operation: string, params?: unknown): Promise<OrchestrationResult<T>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      let result: unknown;

      switch (operation) {
        case 'selectProvider':
          result = await this.selectProvider((params as any)?.criteria);
          break;

        case 'getAvailableProviders':
          result = this.getAvailableProviders();
          break;

        case 'executeWithProvider':
          result = await this.executeWithProvider(
            (params as any)?.providerId,
            (params as any)?.prompt
          );
          break;

        default:
          throw new Error(`Unknown AI operation: ${operation}`);
      }

      return {
        success: true,
        data: result as T,
        metadata: {
          strategyUsed: this.type,
          duration: Date.now() - startTime,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      this.logError(`AI operation ${operation} failed`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          strategyUsed: this.type,
          duration: Date.now() - startTime,
          timestamp: Date.now()
        }
      };
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // PROVIDER OPERATIONS
  // ───────────────────────────────────────────────────────────────────────

  async selectProvider(criteria?: { 
    preferLocal?: boolean; 
    maxLatency?: number 
  }): Promise<AIProviderInfo> {
    // Determine which orchestrator to use based on criteria
    const useCognitive = criteria?.maxLatency && criteria.maxLatency < 1000;
    this.mode = useCognitive ? 'cognitive' : 'standard';
    
    const orchestrator = this.mode === 'cognitive' 
      ? this.cognitiveOrchestrator 
      : this.standardOrchestrator;
    
    // Get provider stats from orchestrator
    const stats = orchestrator.getMetrics();
    
    // Local-first priority
    const selectedProvider: AIProviderInfo = {
      id: 'titane-local',
      name: 'TITANE Local Provider',
      isAvailable: true,
      healthScore: stats.healthScore || 95,
      latency: stats.avgResponseTime || 100
    };

    this.recordMetric({
      name: 'ai.provider.selected',
      type: 'counter',
      value: 1,
      timestamp: Date.now(),
      tags: { 
        provider: selectedProvider.id,
        mode: this.mode
      }
    });

    return selectedProvider;
  }

  getAvailableProviders(): AIProviderInfo[] {
    // Get stats from both orchestrators
    const standardStats = this.standardOrchestrator.getMetrics();
    const cognitiveStats = this.cognitiveOrchestrator.getMetrics();
    
    return [
      {
        id: 'titane-local',
        name: 'TITANE Local (Standard)',
        isAvailable: true,
        healthScore: standardStats.healthScore || 95,
        latency: standardStats.avgResponseTime || 100
      },
      {
        id: 'titane-cognitive',
        name: 'TITANE Cognitive (OMNIS)',
        isAvailable: true,
        healthScore: cognitiveStats.healthScore || 90,
        latency: cognitiveStats.avgResponseTime || 150
      }
    ];
  }

  async executeWithProvider(providerId: string, prompt: string): Promise<{ response: string }> {
    // Select orchestrator based on provider ID
    const orchestrator = providerId.includes('cognitive')
      ? this.cognitiveOrchestrator
      : this.standardOrchestrator;
    
    // Execute chat request
    const messages: AIMessage[] = [
      { role: 'user', content: prompt }
    ];
    
    const response = await orchestrator.chat(messages, {
      conversationId: 'unified-orchestrator',
      mode: 'chat',
      enableOmegaPipeline: false
    });
    
    this.recordMetric({
      name: 'ai.request.executed',
      type: 'counter',
      value: 1,
      timestamp: Date.now(),
      tags: { provider: providerId }
    });

    return { response: response.content };
  }

  // ───────────────────────────────────────────────────────────────────────
  // HEALTH MONITORING
  // ───────────────────────────────────────────────────────────────────────

  async checkHealth(): Promise<HealthCheckResult> {
    if (!this.initialized) {
      return {
        status: 'unknown',
        score: 0,
        message: 'Strategy not initialized',
        timestamp: Date.now()
      };
    }

    // Get health from both orchestrators
    const standardMetrics = this.standardOrchestrator.getMetrics();
    const cognitiveMetrics = this.cognitiveOrchestrator.getMetrics();
    
    const standardHealth = standardMetrics.healthScore || 90;
    const cognitiveHealth = cognitiveMetrics.healthScore || 85;
    const avgScore = (standardHealth + cognitiveHealth) / 2;

    return {
      status: this.scoreToStatus(avgScore),
      score: avgScore,
      details: {
        standardOrchestrator: {
          healthScore: standardHealth,
          totalRequests: standardMetrics.totalRequests,
          successRate: standardMetrics.successRate
        },
        cognitiveOrchestrator: {
          healthScore: cognitiveHealth,
          totalRequests: cognitiveMetrics.totalRequests,
          successRate: cognitiveMetrics.successRate
        }
      },
      timestamp: Date.now()
    };
  }

  getHealthScore(): number {
    if (!this.initialized) return 0;
    
    const standardMetrics = this.standardOrchestrator.getMetrics();
    const cognitiveMetrics = this.cognitiveOrchestrator.getMetrics();
    
    return ((standardMetrics.healthScore || 90) + (cognitiveMetrics.healthScore || 85)) / 2;
  }

  getStatus(): HealthStatus {
    return this.scoreToStatus(this.getHealthScore());
  }

  // ───────────────────────────────────────────────────────────────────────
  // METRICS
  // ───────────────────────────────────────────────────────────────────────

  recordMetric(metric: Metric): void {
    this.metrics.push(metric);
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  getSummary(): MetricsSummary {
    const standardMetrics = this.standardOrchestrator.getMetrics();
    const cognitiveMetrics = this.cognitiveOrchestrator.getMetrics();
    
    const selections = this.metrics.filter(m => m.name === 'ai.provider.selected').length;
    const requests = this.metrics.filter(m => m.name === 'ai.request.executed').length;
    
    const totalRequests = standardMetrics.totalRequests + cognitiveMetrics.totalRequests;
    const avgSuccessRate = (standardMetrics.successRate + cognitiveMetrics.successRate) / 2;
    const avgLatency = (standardMetrics.avgResponseTime + cognitiveMetrics.avgResponseTime) / 2;

    return {
      totalRequests,
      successRate: avgSuccessRate,
      averageLatency: avgLatency,
      errorCount: standardMetrics.totalErrors + cognitiveMetrics.totalErrors,
      timestamp: Date.now(),
      details: {
        providerSelections: selections,
        requestsExecuted: requests,
        standardRequests: standardMetrics.totalRequests,
        cognitiveRequests: cognitiveMetrics.totalRequests
      }
    };
  }

  reset(): void {
    this.metrics = [];
  }

  // ───────────────────────────────────────────────────────────────────────
  // SHUTDOWN
  // ───────────────────────────────────────────────────────────────────────

  async shutdown(): Promise<void> {
    this.log('Shutting down AI providers...');
    
    // AI Orchestrators are singletons, preserve them
    // Just mark this strategy as not initialized
    this.initialized = false;
    this.log('AI providers shutdown complete (orchestrators preserved)');
  }

  // ───────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ───────────────────────────────────────────────────────────────────────

  private scoreToStatus(score: number): HealthStatus {
    if (score >= 90) return 'healthy';
    if (score >= 70) return 'degraded';
    if (score >= 50) return 'critical';
    return 'unknown';
  }

  private log(message: string, ...args: unknown[]): void {
    console.log(`[AIStrategy] ${message}`, ...args);
  }

  private logError(message: string, error?: unknown): void {
    console.error(`[AIStrategy ERROR] ${message}`, error);
  }
}
