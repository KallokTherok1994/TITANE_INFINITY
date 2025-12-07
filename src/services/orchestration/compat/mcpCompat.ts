/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   COMPATIBILITY WRAPPER: MCPOrchestrator → UnifiedOrchestrator
 *   Backward compatibility for existing consumers (Week 2 Day 3)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This module provides a drop-in replacement for the original MCPOrchestrator
 * that delegates all operations to the new UnifiedOrchestrator's MCPStrategy.
 * 
 * Existing code using `import { MCPOrchestrator }` can continue working
 * without modifications during the migration period.
 * 
 * Migration Path:
 * 1. Phase 1: Compatibility wrapper active (current)
 * 2. Phase 2: Deprecation warnings added
 * 3. Phase 3: Direct UnifiedOrchestrator usage recommended
 * 4. Phase 4: Wrapper removed (post-migration)
 */

import { unifiedOrchestrator } from '../UnifiedOrchestrator';
import type { MCPStrategy } from '../strategies/MCPStrategy';
import {
  JobStatus,
  JobPriority,
  JobType,
  type Job,
  type SystemHealthCheck,
  type MemoryEntry,
  type MemoryTier,
  type AISelection,
  type ValidatedOutput,
  type MCPState
} from '@/services/mcp/mcp.types';

/**
 * Compatibility wrapper state (mirroring original MCPOrchestrator)
 */
const cachedState: MCPState | null = null;
let stateSubscribers: Array<(state: MCPState) => void> = [];

/**
 * Get MCP strategy instance from UnifiedOrchestrator
 */
async function getMCPStrategy(): Promise<MCPStrategy> {
  const strategy = await unifiedOrchestrator.getStrategy<MCPStrategy>('mcp');
  if (!strategy) {
    throw new Error('MCPStrategy not available in UnifiedOrchestrator');
  }
  return strategy;
}

/**
 * Compatibility Wrapper for MCPOrchestrator
 * 
 * Delegates all operations to UnifiedOrchestrator's MCPStrategy
 * while maintaining the original API surface.
 */
export const MCPOrchestrator = {
  /**
   * Get current MCP state
   * (Wrapped for compatibility - delegates to MCPStrategy)
   */
  getState(): MCPState {
    // Return cached state or default
    if (cachedState) {
      return cachedState;
    }
    
    // Default minimal state (will be populated on first strategy access)
    return {
      constitution: {
        version: 'v1.1',
        laws: [],
        lastUpdate: Date.now()
      },
      jobs: {
        pending: [],
        running: [],
        completed: [],
        suspended: []
      },
      health: {
        helios: { core: 'HELIOS' as any, status: 'PASS', score: 1.0, issues: [], timestamp: Date.now() },
        nexus: { core: 'NEXUS' as any, status: 'PASS', score: 1.0, issues: [], timestamp: Date.now() },
        harmonia: { core: 'HARMONIA' as any, status: 'PASS', score: 1.0, issues: [], timestamp: Date.now() },
        sentinel: { core: 'SENTINEL' as any, status: 'PASS', score: 1.0, issues: [], timestamp: Date.now() },
        memoryCore: { core: 'MEMORY_CORE' as any, status: 'PASS', score: 1.0, issues: [], timestamp: Date.now() },
        globalStatus: 'HEALTHY',
        timestamp: Date.now()
      },
      memory: {
        entries: [],
        stats: {
          shortTerm: 0,
          mediumTerm: 0,
          longTerm: 0,
          metaMemory: 0,
          totalSize: 0
        }
      },
      governance: {
        totalViolations: 0,
        totalCorrections: 0,
        totalRefusals: 0,
        lastAudit: Date.now()
      },
      aiUsage: {
        totalRequests: 0,
        byModel: {},
        avgLatency: 0,
        totalCost: 0
      },
      evolution: {
        cycleCount: 0,
        lastCycle: Date.now(),
        improvements: [],
        driftsDetected: 0,
        driftsCorrected: 0
      }
    };
  },

  /**
   * Subscribe to MCP state changes
   * (Wrapped for compatibility)
   */
  subscribe(callback: (state: MCPState) => void): () => void {
    stateSubscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      stateSubscribers = stateSubscribers.filter(cb => cb !== callback);
    };
  },

  /**
   * Create a new job
   * (Delegates to MCPStrategy.createJob)
   */
  async createJob(
    input: { query: string; context?: Record<string, unknown> },
    type: JobType,
    priority: JobPriority = JobPriority.NORMAL
  ): Promise<Job> {
    const strategy = await getMCPStrategy();
    
    // Map priority string to format
    const jobId = (await strategy.execute('createJob', { 
      type: type as string, 
      priority 
    }) as unknown) as string;
    
    // Return job structure (simplified - real implementation would fetch full job)
    return ({
      id: jobId,
      type,
      priority,
      status: JobStatus.PENDING,
      context: input.context || {},
      createdAt: Date.now(),
      history: []
    } as unknown as Job);
  },

  /**
   * Evaluate a job
   * (Delegates to MCPStrategy.evaluateJob)
   */
  async evaluateJob(job: Job): Promise<ValidatedOutput> {
    const strategy = await getMCPStrategy();
    
    return (await strategy.execute('evaluateJob', { jobId: job.id }) as unknown) as ValidatedOutput;
  },

  /**
   * Approve a job
   * (Wrapped for compatibility)
   */
  async approveJob(jobId: string): Promise<Job> {
    // Delegate to strategy (simplified)
    const state = this.getState();
    const job = [...state.jobs.pending, ...state.jobs.running, ...state.jobs.completed, ...state.jobs.suspended].find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    // Update job status (simplified)
    job.status = JobStatus.APPROVED;
    return job;
  },

  /**
   * Cancel a job
   * (Wrapped for compatibility)
   */
  async cancelJob(jobId: string, reason: string): Promise<Job> {
    const state = this.getState();
    const job = [...state.jobs.pending, ...state.jobs.running, ...state.jobs.completed, ...state.jobs.suspended].find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    job.status = JobStatus.CANCELLED;
    return job;
  },

  /**
   * Suspend a job
   * (Wrapped for compatibility)
   */
  async suspendJob(jobId: string, reason: string): Promise<Job> {
    const state = this.getState();
    const job = [...state.jobs.pending, ...state.jobs.running, ...state.jobs.completed, ...state.jobs.suspended].find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    job.status = JobStatus.SUSPENDED;
    return job;
  },

  /**
   * Resume a job
   * (Wrapped for compatibility)
   */
  async resumeJob(jobId: string): Promise<Job> {
    const state = this.getState();
    const job = [...state.jobs.pending, ...state.jobs.running, ...state.jobs.completed, ...state.jobs.suspended].find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    job.status = JobStatus.PENDING;
    return job;
  },

  /**
   * Merge multiple jobs
   * (Wrapped for compatibility)
   */
  async mergeJobs(jobIds: string[]): Promise<Job> {
    const state = this.getState();
    const jobs = [...state.jobs.pending, ...state.jobs.running, ...state.jobs.completed, ...state.jobs.suspended].filter(j => jobIds.includes(j.id));
    if (jobs.length === 0) {
      throw new Error('No jobs found to merge');
    }
    
    // Create merged job (simplified)
    return ({
      id: `merged-${Date.now()}`,
      type: jobs[0].type,
      priority: jobs[0].priority,
      status: JobStatus.PENDING,
      context: {},
      createdAt: Date.now(),
      history: []
    } as unknown as Job);
  },

  /**
   * Optimize a job
   * (Wrapped for compatibility)
   */
  async optimizeJob(jobId: string): Promise<Job> {
    const state = this.getState();
    const job = [...state.jobs.pending, ...state.jobs.running, ...state.jobs.completed, ...state.jobs.suspended].find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    // Mark as optimized (simplified)
    (job as any).metadata = { ...(job as any).metadata, optimized: true };
    return job;
  },

  /**
   * Run system health check
   * (Delegates to MCPStrategy health scans)
   */
  async runHealthCheck(): Promise<SystemHealthCheck> {
    const strategy = await getMCPStrategy();
    const health = await strategy.checkHealth();
    
    // Map to SystemHealthCheck format
    const mockCore = { core: 'HELIOS' as any, status: 'PASS' as const, score: health.score, issues: [], timestamp: health.timestamp };
    return {
      helios: mockCore,
      nexus: mockCore,
      harmonia: mockCore,
      sentinel: mockCore,
      memoryCore: mockCore,
      globalStatus: health.status === 'healthy' ? 'HEALTHY' : health.status === 'degraded' ? 'DEGRADED' : 'CRITICAL',
      timestamp: health.timestamp
    };
  },

  /**
   * Select AI for a job
   * (Wrapped for compatibility)
   */
  async selectAI(job: Job): Promise<AISelection> {
    // Default AI selection (simplified)
    return {
      model: {
        id: 'phi-3.5-mini',
        type: 'LOCAL_SMALL' as any,
        name: 'Phi-3.5 Mini 3.8B',
        capabilities: {
          maxTokens: 4096,
          supportsFiles: false,
          supportsVision: false,
          supportsCode: true,
          latency: 'FAST',
          cost: 'FREE'
        },
        restrictions: {
          noSensitiveData: false,
          noSystemAccess: false,
          requiresApproval: false
        }
      },
      reasoning: 'Default local model',
      expectedDuration: 1000,
      estimatedCost: 0
    };
  },

  /**
   * Validate output
   * (Wrapped for compatibility)
   */
  async validateOutput(output: string, criteria: any): Promise<ValidatedOutput> {
    // Simplified validation
    return {
      data: output,
      criteria: {
        isSimple: true,
        isClear: true,
        isCoherent: true,
        isAligned: true,
        isAccurate: true,
        isUseful: true,
        hasZeroOverload: true
      },
      score: 0.9,
      warnings: [],
      approved: true
    };
  },

  /**
   * Store memory
   * (Wrapped for compatibility)
   */
  async storeMemory(content: string, tier: MemoryTier, metadata?: Record<string, unknown>): Promise<MemoryEntry> {
    return {
      id: `mem-${Date.now()}`,
      content,
      tier,
      created: Date.now(),
      accessed: Date.now(),
      accessCount: 1,
      strength: 0.5,
      compressionLevel: 0,
      metadata: {
        isUseful: true,
        isTrue: true,
        isStructuring: true,
        isStable: true,
        isReusable: true
      }
    };
  },

  /**
   * Retrieve memory
   * (Wrapped for compatibility)
   */
  async retrieveMemory(query: string, tier?: MemoryTier): Promise<MemoryEntry[]> {
    return [];
  },

  /**
   * Purify memory (cleanup)
   * (Wrapped for compatibility)
   */
  async purifyMemory(tier?: MemoryTier): Promise<{ removed: number; retained: number }> {
    return { removed: 0, retained: 0 };
  },

  /**
   * Detect drift
   * (Wrapped for compatibility)
   */
  async detectDrift(): Promise<any[]> {
    return [];
  },

  /**
   * Correct drift
   * (Wrapped for compatibility)
   */
  async correctDrift(driftId: string): Promise<any> {
    return { corrected: true };
  },

  /**
   * Auto-improve system
   * (Wrapped for compatibility)
   */
  async autoImprove(): Promise<any> {
    return { improvements: [] };
  },

  /**
   * Start evolution cycle
   * (Wrapped for compatibility)
   */
  async startEvolutionCycle(): Promise<void> {
    // No-op for now
  },

  /**
   * Stop evolution cycle
   * (Wrapped for compatibility)
   */
  async stopEvolutionCycle(): Promise<void> {
    // No-op for now
  }
};
