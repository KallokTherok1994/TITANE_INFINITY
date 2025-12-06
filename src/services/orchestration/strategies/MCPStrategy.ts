/**
 * TITANE∞ vΩ — MCP Strategy
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * 
 * MCP-Ω Governance Strategy
 * Extracted from MCPOrchestrator (1,156 lines)
 */

import type {
  IOrchestrationStrategy,
  OrchestrationStrategyType,
  OrchestrationResult,
  HealthCheckResult,
  HealthStatus,
  MetricsSummary,
  Metric,
  MCPJobOperation,
  MCPHealthOperation
} from '../types';

// Import existing MCP Orchestrator
import { MCPOrchestrator } from '@/services/mcp/MCPOrchestrator';
import type { Job, JobType, JobPriority, SystemHealthCheck } from '@/services/mcp/mcp.types';

// ═══════════════════════════════════════════════════════════════════════════
// MCP STRATEGY
// ═══════════════════════════════════════════════════════════════════════════

export class MCPStrategy implements IOrchestrationStrategy, MCPJobOperation, MCPHealthOperation {
  readonly type: OrchestrationStrategyType = 'mcp';
  readonly name = 'MCP-Ω Governance Strategy';

  private initialized = false;
  private metrics: Metric[] = [];
  private healthScores: Record<string, number> = {}; // Add missing property
  private jobs: Map<string, any> = new Map(); // Add missing property
  
  // Reference to existing MCP Orchestrator (delegation pattern)
  private mcpOrchestrator = MCPOrchestrator;

  constructor() {
    this.log('MCPStrategy created (delegating to MCPOrchestrator)');
  }

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.log('Initializing MCP-Ω governance...');
    
    // MCP Orchestrator is already initialized as singleton
    // Just verify it's available
    if (!this.mcpOrchestrator) {
      throw new Error('MCPOrchestrator not available');
    }

    this.initialized = true;
    this.log('MCP-Ω governance initialized (delegating to existing orchestrator)');
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
        case 'createJob':
          result = await this.createJob(
            (params as any)?.type || 'generic',
            (params as any)?.priority || 'medium'
          );
          break;

        case 'evaluateJob':
          result = await this.evaluateJob((params as any)?.jobId);
          break;

        case 'listJobs':
          result = this.listJobs((params as any)?.filter);
          break;

        case 'scanStability':
          result = await this.scanStability();
          break;

        case 'scanCoherence':
          result = await this.scanCoherence();
          break;

        case 'scanCognitiveLoad':
          result = await this.scanCognitiveLoad();
          break;

        case 'scanSecurity':
          result = await this.scanSecurity();
          break;

        case 'scanMemory':
          result = await this.scanMemory();
          break;

        default:
          throw new Error(`Unknown MCP operation: ${operation}`);
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
      this.logError(`MCP operation ${operation} failed`, error);
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
  // MCP JOB OPERATIONS
  // ───────────────────────────────────────────────────────────────────────

  async createJob(type: string, priority: 'low' | 'medium' | 'high' | 'critical'): Promise<string> {
    // Map priority string to JobPriority enum
    const priorityMap: Record<string, JobPriority> = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };

    // Map type string to JobType enum
    const typeMap: Record<string, JobType> = {
      'reactive': 'REACTIVE' as JobType,
      'structural': 'STRUCTURAL' as JobType,
      'cognitive': 'COGNITIVE' as JobType,
      'creative': 'CREATIVE' as JobType,
      'strategic': 'STRATEGIC' as JobType,
      'evolutionary': 'EVOLUTIONARY' as JobType,
      'generic': 'REACTIVE' as JobType
    };

    const job = await this.mcpOrchestrator.createJob(
      { query: `Job type: ${type}`, context: {} },
      typeMap[type] || typeMap['generic']
    );

    this.recordMetric({
      name: 'mcp.job.created',
      type: 'counter',
      value: 1,
      timestamp: Date.now(),
      tags: { type, priority }
    });

    this.log(`Job created via MCPOrchestrator: ${job.id}`);
    return job.id;
  }

  async evaluateJob(jobId: string): Promise<{ status: string; result?: unknown }> {
    const state = this.mcpOrchestrator.getState();
    
    // Find job in state
    const allJobs = [
      ...state.jobs.pending,
      ...state.jobs.running,
      ...state.jobs.completed,
      ...state.jobs.suspended
    ];
    
    const job = allJobs.find(j => j.id === jobId);
    
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Evaluate if needed
    if (job.status === 'PENDING') {
      const evaluatedJob = await this.mcpOrchestrator.evaluateJob(job);
      
      this.recordMetric({
        name: 'mcp.job.evaluated',
        type: 'counter',
        value: 1,
        timestamp: Date.now()
      });
      
      return { 
        status: evaluatedJob.status,
        result: evaluatedJob.evaluation
      };
    }

    return { 
      status: job.status,
      result: job.execution.result
    };
  }

  listJobs(filter?: { status?: string }): { id: string; type: string; status: string }[] {
    const state = this.mcpOrchestrator.getState();
    
    let jobs: Job[] = [];
    
    if (filter?.status) {
      const statusMap: Record<string, keyof typeof state.jobs> = {
        'pending': 'pending',
        'running': 'running',
        'completed': 'completed',
        'suspended': 'suspended'
      };
      const key = statusMap[filter.status.toLowerCase()];
      if (key) {
        jobs = state.jobs[key];
      }
    } else {
      jobs = [
        ...state.jobs.pending,
        ...state.jobs.running,
        ...state.jobs.completed,
        ...state.jobs.suspended
      ];
    }

    return jobs.map(j => ({
      id: j.id,
      type: j.type,
      status: j.status
    }));
  }

  // ───────────────────────────────────────────────────────────────────────
  // MCP HEALTH SCANS
  // ───────────────────────────────────────────────────────────────────────

  async scanStability(): Promise<{ score: number; status: string }> {
    const health = await this.mcpOrchestrator.runHealthCheck();
    const helios = health.helios;
    
    return { 
      score: helios.score * 100, 
      status: helios.status === 'PASS' ? 'stable' : 'unstable' 
    };
  }

  async scanCoherence(): Promise<{ score: number; status: string }> {
    const health = await this.mcpOrchestrator.runHealthCheck();
    const nexus = health.nexus;
    
    return { 
      score: nexus.score * 100, 
      status: nexus.status === 'PASS' ? 'coherent' : 'incoherent' 
    };
  }

  async scanCognitiveLoad(): Promise<{ score: number; status: string }> {
    const health = await this.mcpOrchestrator.runHealthCheck();
    const harmonia = health.harmonia;
    
    return { 
      score: harmonia.score * 100, 
      status: harmonia.score > 0.7 ? 'high' : 'low' 
    };
  }

  async scanSecurity(): Promise<{ score: number; status: string }> {
    const health = await this.mcpOrchestrator.runHealthCheck();
    const sentinel = health.sentinel;
    
    return { 
      score: sentinel.score * 100, 
      status: sentinel.status === 'PASS' ? 'secure' : 'at-risk' 
    };
  }

  async scanMemory(): Promise<{ score: number; status: string }> {
    const health = await this.mcpOrchestrator.runHealthCheck();
    const memoryCore = health.memoryCore;
    
    return { 
      score: memoryCore.score * 100, 
      status: memoryCore.status === 'PASS' ? 'healthy' : 'degraded' 
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
        timestamp: Date.now()
      };
    }

    const scans = await Promise.all([
      this.scanStability(),
      this.scanCoherence(),
      this.scanCognitiveLoad(),
      this.scanSecurity(),
      this.scanMemory()
    ]);

    const avgScore = scans.reduce((sum, s) => sum + s.score, 0) / scans.length;

    return {
      status: this.scoreToStatus(avgScore),
      score: avgScore,
      details: {
        stability: scans[0].score,
        coherence: scans[1].score,
        cognitiveLoad: scans[2].score,
        security: scans[3].score,
        memory: scans[4].score
      },
      timestamp: Date.now()
    };
  }

  getHealthScore(): number {
    const scores = Object.values(this.healthScores);
    return scores.reduce((sum: number, s: number) => sum + s, 0) / (scores.length || 1);
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
    const jobsCreated = this.metrics.filter(m => m.name === 'mcp.job.created').length;
    const jobsEvaluated = this.metrics.filter(m => m.name === 'mcp.job.evaluated').length;

    return {
      totalRequests: jobsCreated,
      successRate: jobsCreated > 0 ? jobsEvaluated / jobsCreated : 1.0,
      averageLatency: 0, // TODO: Calculate from metrics
      errorCount: 0,
      timestamp: Date.now(),
      details: {
        jobsCreated,
        jobsEvaluated,
        jobsPending: this.jobs.size
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
    this.log('Shutting down MCP-Ω governance...');
    
    // MCP Orchestrator is a singleton, don't shut it down
    // Just mark this strategy as not initialized
    this.initialized = false;
    this.log('MCP-Ω governance shutdown complete (orchestrator preserved)');
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
    console.log(`[MCPStrategy] ${message}`, ...args);
  }

  private logError(message: string, error?: unknown): void {
    console.error(`[MCPStrategy ERROR] ${message}`, error);
  }
}
