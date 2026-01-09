/**
 * TITANE∞ vΩ — Cognitive Strategy
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Cognitive Engines Orchestration Strategy
 * Extracted from CognitiveOmegaOrchestrator (718 lines)
 */

import type {
  IOrchestrationStrategy,
  OrchestrationStrategyType,
  OrchestrationResult,
  HealthCheckResult,
  HealthStatus,
  MetricsSummary,
  Metric,
  CognitiveMemoryOperation,
  CognitiveGoalOperation,
} from '../types';
import { logger } from '@/utils/logger';

// Import existing Cognitive Omega Orchestrator
import { cognitiveOmega } from '@/services/cognitive/cognitiveOmegaIntegration';
import type { ChatMode } from '@/services/ai/chatEngine';

// ═══════════════════════════════════════════════════════════════════════════
// COGNITIVE STRATEGY
// ═══════════════════════════════════════════════════════════════════════════

export class CognitiveStrategy
  implements IOrchestrationStrategy, CognitiveMemoryOperation, CognitiveGoalOperation
{
  readonly type: OrchestrationStrategyType = 'cognitive';
  readonly name = 'Cognitive Engines Strategy';

  private initialized = false;
  private metrics: Metric[] = [];

  // Reference to existing Cognitive Omega Orchestrator (delegation pattern)
  private cognitiveOrchestrator = cognitiveOmega;

  constructor() {
    this.log('CognitiveStrategy created (delegating to CognitiveOmegaOrchestrator)');
  }

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.log('Initializing cognitive engines...');

    // Cognitive Omega Orchestrator uses lazy initialization
    // Just verify it's available
    if (!this.cognitiveOrchestrator) {
      throw new Error('CognitiveOmegaOrchestrator not available');
    }

    this.initialized = true;
    this.log('Cognitive engines initialized (delegating to existing orchestrator)');
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // ───────────────────────────────────────────────────────────────────────
  // EXECUTION
  // ───────────────────────────────────────────────────────────────────────

  async execute<T = unknown>(
    operation: string,
    params?: unknown
  ): Promise<OrchestrationResult<T>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      let result: unknown;

      switch (operation) {
        case 'storeMemory':
          result = await this.storeMemory(
            (params as any)?.content,
            (params as any)?.importance
          );
          break;

        case 'retrieveMemories':
          result = await this.retrieveMemories(
            (params as any)?.query,
            (params as any)?.limit
          );
          break;

        case 'processConversation':
          result = await this.processConversation((params as any)?.messages);
          break;

        case 'setGoal':
          result = await this.setGoal(
            (params as any)?.description,
            (params as any)?.context
          );
          break;

        case 'checkGoalProgress':
          result = await this.checkGoalProgress((params as any)?.goalId);
          break;

        case 'validateConsistency':
          result = await this.validateConsistency((params as any)?.text);
          break;

        default:
          throw new Error(`Unknown cognitive operation: ${operation}`);
      }

      return {
        success: true,
        data: result as T,
        metadata: {
          strategyUsed: this.type,
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      this.logError(`Cognitive operation ${operation} failed`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          strategyUsed: this.type,
          duration: Date.now() - startTime,
          timestamp: Date.now(),
        },
      };
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // MEMORY OPERATIONS
  // ───────────────────────────────────────────────────────────────────────

  async storeMemory(content: string, importance?: number): Promise<string> {
    const storedId = await this.cognitiveOrchestrator.storeTextMemory(
      'unified-orchestrator',
      content,
      {
        importance: importance ?? 0.5,
        tags: ['orchestration', 'cognitive'],
        sourceContext: 'CognitiveStrategy.storeMemory',
      }
    );

    this.recordMetric({
      name: 'cognitive.memory.stored',
      type: 'counter',
      value: 1,
      timestamp: Date.now(),
    });

    this.log(`Memory stored: ${storedId}`);
    return storedId;
  }

  async retrieveMemories(
    query: string,
    limit = 5
  ): Promise<Array<{ content: string; score: number }>> {
    // Use semantic memory engine to retrieve
    const enrichment = await this.cognitiveOrchestrator.enrichContext(
      query,
      'unified-orchestrator',
      'default' as ChatMode
    );

    this.recordMetric({
      name: 'cognitive.memory.retrieved',
      type: 'counter',
      value: 1,
      timestamp: Date.now(),
      tags: { count: enrichment.metadata?.memoryCount.toString() },
    });

    // Parse memories from enrichment (simplified)
    const memories = enrichment.memories
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => ({
        content: line
          .replace(/^\d+\.\s*/, '')
          .replace(/\(pertinence:.*\)/, '')
          .trim(),
        score: parseFloat(line.match(/pertinence:\s*(\d+)%/)?.[1] || '0') / 100,
      }))
      .slice(0, limit);

    return memories;
  }

  async processConversation(messages: unknown[]): Promise<void> {
    // Minimal: treat the last user/assistant turn as an interaction to persist + evaluate.
    const arr = Array.isArray(messages) ? (messages as Array<any>) : [];
    const lastUser = [...arr].reverse().find(m => m?.role === 'user')?.content;
    const lastAssistant = [...arr].reverse().find(m => m?.role === 'assistant')?.content;

    if (typeof lastUser === 'string' && typeof lastAssistant === 'string') {
      await this.cognitiveOrchestrator.saveInteraction(
        'unified-orchestrator',
        lastUser,
        lastAssistant,
        'default'
      );
    }

    this.recordMetric({
      name: 'cognitive.conversation.processed',
      type: 'counter',
      value: 1,
      timestamp: Date.now(),
      tags: { messageCount: messages.length.toString() },
    });
  }

  // ───────────────────────────────────────────────────────────────────────
  // GOAL OPERATIONS
  // ───────────────────────────────────────────────────────────────────────

  async setGoal(_description: string, _context?: string): Promise<string> {
    const conversationId = 'unified-orchestrator';
    await this.cognitiveOrchestrator.createGoal(conversationId, _description, {
      description: _context,
      constraints: _context ? [_context] : undefined,
    });

    const goalId = conversationId;

    this.recordMetric({
      name: 'cognitive.goal.set',
      type: 'counter',
      value: 1,
      timestamp: Date.now(),
    });

    this.log(`Goal set: ${goalId}`);
    return goalId;
  }

  async checkGoalProgress(
    _goalId: string
  ): Promise<{ achieved: boolean; progress: number }> {
    const progress = await this.cognitiveOrchestrator.getGoalProgress(_goalId);
    return { achieved: progress >= 1.0, progress };
  }

  async validateConsistency(
    text: string
  ): Promise<{ violations: string[]; score: number }> {
    // Validate consistency with goal engine
    const check = await this.cognitiveOrchestrator.checkConsistency(
      'unified-orchestrator',
      text,
      { userMessage: '', mode: 'default' }
    );

    return {
      violations: check.violations.map(v => v.description),
      score: check.consistencyScore,
    };
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
        timestamp: Date.now(),
      };
    }

    // Get stats from cognitive orchestrator
    const stats = this.cognitiveOrchestrator.getStats();

    // Compute health score from stats
    const avgConsistency = stats.avgConsistencyScore;
    const avgQuality = stats.avgQualityScore;
    const score = ((avgConsistency + avgQuality) / 2) * 100;

    return {
      status: this.scoreToStatus(score),
      score,
      details: {
        totalInteractions: stats.totalInteractions,
        memoriesCreated: stats.totalMemoriesCreated,
        avgConsistencyScore: avgConsistency,
        avgQualityScore: avgQuality,
      },
      timestamp: Date.now(),
    };
  }

  getHealthScore(): number {
    if (!this.initialized) return 0;

    const stats = this.cognitiveOrchestrator.getStats();
    return ((stats.avgConsistencyScore + stats.avgQualityScore) / 2) * 100;
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
    const stats = this.cognitiveOrchestrator.getStats();
    const memoriesStored = this.metrics.filter(
      m => m.name === 'cognitive.memory.stored'
    ).length;
    const memoriesRetrieved = this.metrics.filter(
      m => m.name === 'cognitive.memory.retrieved'
    ).length;
    const operationExecuted = this.metrics.filter(m =>
      m.name.startsWith('cognitive.operation')
    ).length;
    const consistencyChecks = this.metrics.filter(
      m => m.name === 'cognitive.consistency.checked'
    ).length;
    const _totalMetricsRecorded = this.metrics.length;

    // Use local metrics if cognitiveOrchestrator stats are empty
    const totalRequests = Math.max(
      stats.totalInteractions,
      memoriesStored + memoriesRetrieved + operationExecuted + consistencyChecks
    );

    return {
      totalRequests,
      successRate: stats.totalViolationsDetected === 0 ? 1.0 : 0.9,
      averageLatency: 0,
      errorCount: 0,
      timestamp: Date.now(),
      details: {
        memoriesStored: Math.max(stats.totalMemoriesCreated, memoriesStored),
        memoriesRetrieved,
        totalCorrections: stats.totalCorrectionsApplied,
        avgConsistency: stats.avgConsistencyScore,
      },
    };
  }

  reset(): void {
    this.metrics = [];
  }

  // ───────────────────────────────────────────────────────────────────────
  // SHUTDOWN
  // ───────────────────────────────────────────────────────────────────────

  async shutdown(): Promise<void> {
    this.log('Shutting down cognitive engines...');

    // Cognitive Omega Orchestrator is a singleton, preserve it
    // Just mark this strategy as not initialized
    this.initialized = false;
    this.log('Cognitive engines shutdown complete (orchestrator preserved)');
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
    logger.debug(`[CognitiveStrategy] ${message}`, ...args);
  }

  private logError(message: string, error?: unknown): void {
    logger.error(`[CognitiveStrategy ERROR] ${message}`, error);
  }
}
