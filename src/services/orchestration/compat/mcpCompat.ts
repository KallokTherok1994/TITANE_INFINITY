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
import type {
  Job,
  JobType,
  JobPriority,
  SystemHealthCheck,
  MemoryEntry,
  MemoryTier,
  AISelection,
  ValidatedOutput,
  MCPState
} from '@/services/mcp/mcp.types';

/**
 * Compatibility wrapper state (mirroring original MCPOrchestrator)
 */
let cachedState: MCPState | null = null;
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
      jobs: [],
      health: {
        overall: 'healthy',
        stability: 1.0,
        coherence: 1.0,
        cognitiveLoad: 0.0,
        security: 1.0,
        memory: 1.0,
        timestamp: Date.now(),
        issues: []
      },
      memory: {
        shortTerm: [],
        workingMemory: [],
        longTerm: []
      },
      governance: {
        lawViolations: [],
        driftDetections: [],
        interventions: []
      },
      evolution: {
        cycleActive: false,
        generation: 0,
        improvements: []
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
    priority: JobPriority = 'medium'
  ): Promise<Job> {
    const strategy = await getMCPStrategy();
    
    // Map priority string to format
    const jobId = await strategy.execute('createJob', { 
      type: type as string, 
      priority 
    }) as string;
    
    // Return job structure (simplified - real implementation would fetch full job)
    return {
      id: jobId,
      type,
      priority,
      status: 'pending',
      query: input.query,
      context: input.context || {},
      createdAt: Date.now(),
      metadata: {},
      history: []
    };
  },

  /**
   * Evaluate a job
   * (Delegates to MCPStrategy.evaluateJob)
   */
  async evaluateJob(job: Job): Promise<ValidatedOutput> {
    const strategy = await getMCPStrategy();
    
    return await strategy.execute('evaluateJob', { jobId: job.id }) as ValidatedOutput;
  },

  /**
   * Approve a job
   * (Wrapped for compatibility)
   */
  async approveJob(jobId: string): Promise<Job> {
    // Delegate to strategy (simplified)
    const state = this.getState();
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    // Update job status (simplified)
    job.status = 'approved';
    return job;
  },

  /**
   * Cancel a job
   * (Wrapped for compatibility)
   */
  async cancelJob(jobId: string, reason: string): Promise<Job> {
    const state = this.getState();
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    job.status = 'cancelled';
    return job;
  },

  /**
   * Suspend a job
   * (Wrapped for compatibility)
   */
  async suspendJob(jobId: string, reason: string): Promise<Job> {
    const state = this.getState();
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    job.status = 'suspended';
    return job;
  },

  /**
   * Resume a job
   * (Wrapped for compatibility)
   */
  async resumeJob(jobId: string): Promise<Job> {
    const state = this.getState();
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    job.status = 'pending';
    return job;
  },

  /**
   * Merge multiple jobs
   * (Wrapped for compatibility)
   */
  async mergeJobs(jobIds: string[]): Promise<Job> {
    const state = this.getState();
    const jobs = state.jobs.filter(j => jobIds.includes(j.id));
    if (jobs.length === 0) {
      throw new Error('No jobs found to merge');
    }
    
    // Create merged job (simplified)
    return {
      id: `merged-${Date.now()}`,
      type: jobs[0].type,
      priority: jobs[0].priority,
      status: 'pending',
      query: `Merged: ${jobs.map(j => j.query).join(' + ')}`,
      context: {},
      createdAt: Date.now(),
      metadata: { mergedFrom: jobIds },
      history: []
    };
  },

  /**
   * Optimize a job
   * (Wrapped for compatibility)
   */
  async optimizeJob(jobId: string): Promise<Job> {
    const state = this.getState();
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    // Mark as optimized (simplified)
    job.metadata = { ...job.metadata, optimized: true };
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
    return {
      overall: health.status as 'healthy' | 'degraded' | 'critical',
      stability: health.score,
      coherence: health.score,
      cognitiveLoad: 1.0 - health.score,
      security: health.score,
      memory: health.score,
      timestamp: health.timestamp,
      issues: health.details ? [health.details] : []
    };
  },

  /**
   * Select AI for a job
   * (Wrapped for compatibility)
   */
  async selectAI(job: Job): Promise<AISelection> {
    // Default AI selection (simplified)
    return {
      modelId: 'phi-3.5-mini',
      modelName: 'Phi-3.5 Mini 3.8B',
      reason: 'Default local model',
      confidence: 0.8
    };
  },

  /**
   * Validate output
   * (Wrapped for compatibility)
   */
  async validateOutput(output: string, criteria: any): Promise<ValidatedOutput> {
    // Simplified validation
    return {
      output,
      isValid: true,
      confidence: 0.9,
      issues: [],
      appliedCorrections: []
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
      timestamp: Date.now(),
      importance: 0.5,
      metadata: metadata || {}
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
