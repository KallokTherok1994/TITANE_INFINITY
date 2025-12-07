/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ MCP OS v1.1 — MASTER COGNITIVE PROGRAM ORCHESTRATOR
 *   Noyau décisionnel et gouverneur suprême du système TITANE∞
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { nanoid } from 'nanoid';
import type {
  MCPState,
  MCPOperations,
  MCPPersona,
  Job,
  SystemHealthCheck,
  CoreScanResult,
  LawViolation,
  MemoryEntry,
  MemoryOperations,
  AIModel,
  AISelection,
  ValidatedOutput,
  OutputCriteria
} from './mcp.types';
import {
  MCPBehaviorTrait,
  JobStatus,
  CognitiveCore,
  FundamentalLaw,
  AIModelType,
  JobType,
  JobPriority,
  MemoryTier
} from './mcp.types';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const MCP_CONSTITUTION_VERSION = 'v1.1';

const MCP_PERSONA: MCPPersona = {
  traits: [
    MCPBehaviorTrait.STRUCTURED,
    MCPBehaviorTrait.COHERENT,
    MCPBehaviorTrait.STABLE,
    MCPBehaviorTrait.SYNTHETIC,
    MCPBehaviorTrait.PRECISE,
    MCPBehaviorTrait.ALIGNED,
    MCPBehaviorTrait.STRATEGIC,
    MCPBehaviorTrait.CALM,
    MCPBehaviorTrait.PROTECTIVE,
    MCPBehaviorTrait.EVOLUTIONARY
  ],
  style: {
    eliminateSuperfluity: true,
    transformComplexityToSimplicity: true,
    alwaysForwardProgress: true,
    maintainConsistency: true
  },
  mission: 'Augmenter la clarté, réduire la charge mentale, renforcer la cohérence, optimiser les décisions, structurer la créativité, soutenir l\'évolution continue.',
  principles: [
    'Simplicité durable',
    'Alignement interne',
    'Impact long terme',
    'Autonomie',
    'Modularité évolutive'
  ]
};

const AI_MODELS: Record<string, AIModel> = {
  'phi-3.5-mini': {
    id: 'phi-3.5-mini',
    type: AIModelType.LOCAL_SMALL,
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
      noSystemAccess: true,
      requiresApproval: false
    }
  },
  'claude-haiku': {
    id: 'claude-haiku',
    type: AIModelType.CLOUD_FAST,
    name: 'Claude 3.5 Haiku',
    capabilities: {
      maxTokens: 8192,
      supportsFiles: true,
      supportsVision: true,
      supportsCode: true,
      latency: 'FAST',
      cost: 'LOW'
    },
    restrictions: {
      noSensitiveData: true,
      noSystemAccess: true,
      requiresApproval: false
    }
  },
  'claude-sonnet': {
    id: 'claude-sonnet',
    type: AIModelType.CLOUD_BALANCED,
    name: 'Claude 3.5 Sonnet',
    capabilities: {
      maxTokens: 200000,
      supportsFiles: true,
      supportsVision: true,
      supportsCode: true,
      latency: 'MEDIUM',
      cost: 'MEDIUM'
    },
    restrictions: {
      noSensitiveData: true,
      noSystemAccess: true,
      requiresApproval: false
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MCP ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════

class MCPOrchestratorClass implements MCPOperations {
  private state: MCPState;
  private subscribers: Set<(state: MCPState) => void> = new Set();
  private evolutionInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.state = this.createInitialState();
    this.log('MCP OS v1.1 initialized — Constitution active');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOGGING
  // ─────────────────────────────────────────────────────────────────────────

  private log(message: string, ...args: unknown[]) {
    console.log(`[MCP OS v1.1] ${message}`, ...args);
  }

  private warn(message: string, ...args: unknown[]) {
    console.warn(`[MCP OS v1.1] ⚠️ ${message}`, ...args);
  }

  private error(message: string, ...args: unknown[]) {
    console.error(`[MCP OS v1.1] 💥 ${message}`, ...args);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  private createInitialState(): MCPState {
    return {
      constitution: {
        version: MCP_CONSTITUTION_VERSION,
        laws: Object.values(FundamentalLaw),
        lastUpdate: Date.now()
      },
      health: this.createInitialHealth(),
      jobs: {
        pending: [],
        running: [],
        completed: [],
        suspended: []
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
  }

  private createInitialHealth(): SystemHealthCheck {
    const now = Date.now();
    const perfectCore: CoreScanResult = {
      core: CognitiveCore.HELIOS,
      status: 'PASS',
      score: 1.0,
      issues: [],
      timestamp: now
    };

    return {
      helios: { ...perfectCore, core: CognitiveCore.HELIOS },
      nexus: { ...perfectCore, core: CognitiveCore.NEXUS },
      harmonia: { ...perfectCore, core: CognitiveCore.HARMONIA },
      sentinel: { ...perfectCore, core: CognitiveCore.SENTINEL },
      memoryCore: { ...perfectCore, core: CognitiveCore.MEMORY_CORE },
      globalStatus: 'HEALTHY',
      timestamp: now
    };
  }

  private updateState(updater: (state: MCPState) => Partial<MCPState>) {
    this.state = { ...this.state, ...updater(this.state) };
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  public subscribe(callback: (state: MCPState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // JOB MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  public async createJob(input: Job['input'], type: JobType): Promise<Job> {
    const job: Job = {
      id: `job_${nanoid()}`,
      type,
      status: JobStatus.PENDING,
      priority: this.calculatePriority(type),
      permissions: this.determinePermissions(input),
      input,
      evaluation: {
        cognitiveLoad: 0,
        coherenceScore: 1.0,
        alignmentScore: 1.0,
        securityRisk: 0,
        impact: 'MICRO'
      },
      execution: {},
      governance: {
        approvedBy: 'MCP',
        lawViolations: []
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Add job to pending queue
    this.state.jobs.pending.push(job);

    this.log(`Job created: ${job.id} (${type})`);
    return job;
  }

  public async evaluateJob(job: Job): Promise<Job> {
    this.log(`Evaluating job ${job.id}...`);

    // Run all scans
    const healthCheck = await this.runHealthCheck();
    const violations: LawViolation[] = [];

    // 1. Coherence scan (Nexus)
    if (healthCheck.nexus.status === 'FAIL') {
      violations.push({
        law: FundamentalLaw.GLOBAL_COHERENCE,
        severity: 'HIGH',
        description: 'Job creates incoherence in system state',
        jobId: job.id,
        timestamp: Date.now(),
        suggestedAction: 'REFORM'
      });
    }

    // 2. Cognitive load scan (Harmonia)
    const cognitiveLoad = this.estimateCognitiveLoad(job);
    if (cognitiveLoad > 0.8) {
      violations.push({
        law: FundamentalLaw.MINIMAL_COGNITIVE_LOAD,
        severity: 'MEDIUM',
        description: `Cognitive load too high: ${(cognitiveLoad * 100).toFixed(0)}%`,
        jobId: job.id,
        timestamp: Date.now(),
        suggestedAction: 'OPTIMIZE'
      });
    }

    // 3. Security scan (Sentinel)
    const securityRisk = this.assessSecurityRisk(job);
    if (securityRisk > 0.5 && !job.permissions.requiresSensitiveData) {
      violations.push({
        law: FundamentalLaw.SYSTEM_PRESERVATION,
        severity: 'CRITICAL',
        description: 'Job requires sensitive data without permission',
        jobId: job.id,
        timestamp: Date.now(),
        suggestedAction: 'CANCEL'
      });
    }

    // 4. Alignment scan
    const alignmentScore = this.calculateAlignment(job);
    if (alignmentScore < 0.5) {
      violations.push({
        law: FundamentalLaw.STRATEGIC_ALIGNMENT,
        severity: 'LOW',
        description: 'Job not well aligned with mission',
        jobId: job.id,
        timestamp: Date.now(),
        suggestedAction: 'REFORM'
      });
    }

    // Update job evaluation
    job.evaluation = {
      cognitiveLoad,
      coherenceScore: healthCheck.nexus.score,
      alignmentScore,
      securityRisk,
      impact: this.estimateImpact(job)
    };

    job.governance.lawViolations = violations;
    job.updatedAt = Date.now();

    if (violations.length > 0) {
      this.warn(`Job ${job.id} has ${violations.length} violation(s)`, violations);
      this.updateState(s => ({
        governance: {
          ...s.governance,
          totalViolations: s.governance.totalViolations + violations.length
        }
      }));
    }

    return job;
  }

  public async approveJob(jobId: string): Promise<void> {
    const job = this.findJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.governance.lawViolations.some(v => v.severity === 'CRITICAL')) {
      throw new Error(`Cannot approve job with CRITICAL violations`);
    }

    job.status = JobStatus.APPROVED;
    job.updatedAt = Date.now();
    this.log(`Job ${jobId} approved`);
  }

  public async cancelJob(jobId: string, reason: string): Promise<void> {
    const job = this.findJob(jobId);
    if (!job) return;

    job.status = JobStatus.CANCELLED;
    job.execution.error = reason;
    job.updatedAt = Date.now();

    this.updateState(s => ({
      governance: {
        ...s.governance,
        totalRefusals: s.governance.totalRefusals + 1
      }
    }));

    this.log(`Job ${jobId} cancelled: ${reason}`);
  }

  public async suspendJob(jobId: string, reason: string): Promise<void> {
    const job = this.findJob(jobId);
    if (!job) return;

    job.status = JobStatus.SUSPENDED;
    job.execution.error = reason;
    job.updatedAt = Date.now();
    this.log(`Job ${jobId} suspended: ${reason}`);
  }

  public async resumeJob(jobId: string): Promise<void> {
    const job = this.findJob(jobId);
    if (!job || job.status !== JobStatus.SUSPENDED) return;

    job.status = JobStatus.PENDING;
    job.execution.error = undefined;
    job.updatedAt = Date.now();
    this.log(`Job ${jobId} resumed`);
  }

  public async mergeJobs(jobIds: string[]): Promise<Job> {
    const jobs = jobIds.map(id => this.findJob(id)).filter(Boolean) as Job[];
    if (jobs.length < 2) {
      throw new Error('Need at least 2 jobs to merge');
    }

    // Create merged job
    const mergedJob = await this.createJob(
      {
        query: `Merged: ${jobs.map(j => j.input.query).join(' + ')}`,
        context: jobs.reduce((acc, j) => ({ ...acc, ...j.input.context }), {})
      },
      jobs[0].type
    );

    // Cancel original jobs
    for (const job of jobs) {
      await this.cancelJob(job.id, 'Merged into ' + mergedJob.id);
    }

    this.log(`Merged ${jobs.length} jobs into ${mergedJob.id}`);
    return mergedJob;
  }

  public async optimizeJob(jobId: string): Promise<Job> {
    const job = this.findJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Optimize cognitive load
    if (job.evaluation.cognitiveLoad > 0.6) {
      job.input.query = this.simplifyQuery(job.input.query);
      job.evaluation.cognitiveLoad *= 0.7; // Reduce by 30%
    }

    job.updatedAt = Date.now();
    this.log(`Job ${jobId} optimized`);
    return job;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SYSTEM HEALTH
  // ─────────────────────────────────────────────────────────────────────────

  public async runHealthCheck(): Promise<SystemHealthCheck> {
    const now = Date.now();

    const helios = await this.scanStability();
    const nexus = await this.scanCoherence(this.state);
    const harmonia = await this.scanCognitiveLoad(this.state.jobs.running[0] || null);
    const sentinel = await this.scanSecurity(this.state.jobs.running[0] || null);
    const memoryCore = await this.scanMemory();

    const allScores = [helios, nexus, harmonia, sentinel, memoryCore];
    const avgScore = allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length;
    const hasCritical = allScores.some(s => s.status === 'FAIL');
    const hasWarning = allScores.some(s => s.status === 'WARNING');

    const globalStatus: SystemHealthCheck['globalStatus'] = hasCritical
      ? 'CRITICAL'
      : hasWarning
      ? 'DEGRADED'
      : 'HEALTHY';

    const health: SystemHealthCheck = {
      helios,
      nexus,
      harmonia,
      sentinel,
      memoryCore,
      globalStatus,
      timestamp: now
    };

    this.updateState(s => ({ health }));
    return health;
  }

  public async scanCoherence(input: unknown): Promise<CoreScanResult> {
    // Simplified coherence check
    const issues: string[] = [];
    let score = 1.0;

    // Check for contradictions in jobs
    const activeJobs = [...this.state.jobs.pending, ...this.state.jobs.running];
    if (activeJobs.length > 10) {
      issues.push('Too many active jobs (>10)');
      score -= 0.2;
    }

    return {
      core: CognitiveCore.NEXUS,
      status: score > 0.7 ? 'PASS' : score > 0.4 ? 'WARNING' : 'FAIL',
      score,
      issues,
      timestamp: Date.now()
    };
  }

  public async scanStability(): Promise<CoreScanResult> {
    const issues: string[] = [];
    let score = 1.0;

    // Check for rapid changes
    const recentJobs = this.state.jobs.completed.filter(
      j => (j as any).completedAt && Date.now() - (j as any).completedAt < 60000 // Last minute
    );

    if (recentJobs.length > 20) {
      issues.push('High job throughput (>20/min)');
      score -= 0.3;
    }

    return {
      core: CognitiveCore.HELIOS,
      status: score > 0.7 ? 'PASS' : score > 0.4 ? 'WARNING' : 'FAIL',
      score,
      issues,
      timestamp: Date.now()
    };
  }

  public async scanCognitiveLoad(job: Job | null): Promise<CoreScanResult> {
    const issues: string[] = [];
    let score = 1.0;

    if (job) {
      const load = job.evaluation.cognitiveLoad;
      if (load > 0.8) {
        issues.push(`High cognitive load: ${(load * 100).toFixed(0)}%`);
        score = 1 - load;
      }
    }

    // Check global memory usage
    const memorySize = this.state.memory.stats.totalSize;
    if (memorySize > 100 * 1024 * 1024) {
      // >100MB
      issues.push('Memory usage high (>100MB)');
      score -= 0.2;
    }

    return {
      core: CognitiveCore.HARMONIA,
      status: score > 0.7 ? 'PASS' : score > 0.4 ? 'WARNING' : 'FAIL',
      score,
      issues,
      timestamp: Date.now()
    };
  }

  public async scanSecurity(job: Job | null): Promise<CoreScanResult> {
    const issues: string[] = [];
    let score = 1.0;

    if (job) {
      const risk = job.evaluation.securityRisk;
      if (risk > 0.5) {
        issues.push(`High security risk: ${(risk * 100).toFixed(0)}%`);
        score = 1 - risk;
      }
    }

    return {
      core: CognitiveCore.SENTINEL,
      status: score > 0.7 ? 'PASS' : score > 0.4 ? 'WARNING' : 'FAIL',
      score,
      issues,
      timestamp: Date.now()
    };
  }

  public async scanMemory(): Promise<CoreScanResult> {
    const issues: string[] = [];
    let score = 1.0;

    const { entries } = this.state.memory;
    const invalidEntries = entries.filter(e => !this.isValidMemory(e));

    if (invalidEntries.length > 0) {
      issues.push(`${invalidEntries.length} invalid memory entries`);
      score -= 0.1 * Math.min(invalidEntries.length / 10, 1);
    }

    return {
      core: CognitiveCore.MEMORY_CORE,
      status: score > 0.7 ? 'PASS' : score > 0.4 ? 'WARNING' : 'FAIL',
      score,
      issues,
      timestamp: Date.now()
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AI GOVERNANCE
  // ─────────────────────────────────────────────────────────────────────────

  public async selectAI(job: Job): Promise<AISelection> {
    let selectedModel: AIModel;
    let reasoning: string;

    // Priority: Security > Complexity > Speed
    if (job.permissions.requiresSensitiveData) {
      selectedModel = AI_MODELS['phi-3.5-mini'];
      reasoning = 'Local model required for sensitive data';
    } else if (job.evaluation.cognitiveLoad > 0.7) {
      selectedModel = AI_MODELS['claude-sonnet'];
      reasoning = 'High complexity task requires deep model';
    } else if (job.priority === JobPriority.CRITICAL) {
      selectedModel = AI_MODELS['claude-haiku'];
      reasoning = 'Fast response required for critical priority';
    } else {
      selectedModel = AI_MODELS['phi-3.5-mini'];
      reasoning = 'Default local model for standard tasks';
    }

    const expectedDuration =
      selectedModel.capabilities.latency === 'FAST'
        ? 500
        : selectedModel.capabilities.latency === 'MEDIUM'
        ? 2000
        : 5000;

    const estimatedCost =
      selectedModel.capabilities.cost === 'FREE'
        ? 0
        : selectedModel.capabilities.cost === 'LOW'
        ? 1
        : selectedModel.capabilities.cost === 'MEDIUM'
        ? 5
        : 20;

    this.log(`AI selected for job ${job.id}: ${selectedModel.name} (${reasoning})`);

    return {
      model: selectedModel,
      reasoning,
      expectedDuration,
      estimatedCost
    };
  }

  public async validateOutput(output: unknown, job: Job): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check output meets criteria
    const criteria = this.evaluateOutput(output);

    if (criteria.score < 0.7) {
      issues.push(`Output quality too low: ${(criteria.score * 100).toFixed(0)}%`);
    }

    if (!criteria.isCoherent) {
      issues.push('Output lacks coherence');
    }

    if (!criteria.isUseful) {
      issues.push('Output not useful');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MEMORY MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  public async storeMemory(
    entry: Omit<MemoryEntry, 'id' | 'created' | 'accessed' | 'accessCount'>
  ): Promise<string> {
    const memory: MemoryEntry = {
      ...entry,
      id: nanoid(),
      created: Date.now(),
      accessed: Date.now(),
      accessCount: 1
    };

    // Validate memory before storing
    if (!this.isValidMemory(memory)) {
      this.warn('Invalid memory rejected', memory);
      throw new Error('Memory does not meet criteria');
    }

    this.updateState(s => ({
      memory: {
        ...s.memory,
        entries: [...s.memory.entries, memory],
        stats: this.calculateMemoryStats([...s.memory.entries, memory])
      }
    }));

    this.log(`Memory stored: ${memory.id} (${memory.tier})`);
    return memory.id;
  }

  public async retrieveMemory(tier: MemoryTier, query?: string): Promise<MemoryEntry[]> {
    let memories = this.state.memory.entries.filter(m => m.tier === tier);

    if (query) {
      // Simple text matching (can be enhanced with semantic search)
      memories = memories.filter(m => JSON.stringify(m.content).toLowerCase().includes(query.toLowerCase()));
    }

    // Update access stats
    memories.forEach(m => {
      m.accessed = Date.now();
      m.accessCount++;
    });

    return memories;
  }

  public async purifyMemory(): Promise<MemoryOperations> {
    let cleanupCount = 0;
    let compressCount = 0;
    const fuseCount = 0;
    let archiveCount = 0;
    let normalizeCount = 0;

    const entries = this.state.memory.entries;

    // 1. Cleanup: Remove invalid memories
    const validEntries = entries.filter(e => {
      if (this.isValidMemory(e)) return true;
      cleanupCount++;
      return false;
    });

    // 2. Compress: Reduce memory size for old entries
    validEntries.forEach(e => {
      if (Date.now() - e.accessed > 30 * 24 * 60 * 60 * 1000 && e.compressionLevel < 0.8) {
        // 30 days
        e.compressionLevel = Math.min(1, e.compressionLevel + 0.2);
        compressCount++;
      }
    });

    // 3. Fuse: Combine similar memories (simplified)
    // TODO: Implement semantic similarity fusion

    // 4. Archive: Move old to higher tier
    validEntries.forEach(e => {
      if (e.tier === MemoryTier.SHORT_TERM && Date.now() - e.accessed > 24 * 60 * 60 * 1000) {
        e.tier = MemoryTier.MEDIUM_TERM;
        archiveCount++;
      } else if (e.tier === MemoryTier.MEDIUM_TERM && Date.now() - e.accessed > 7 * 24 * 60 * 60 * 1000) {
        e.tier = MemoryTier.LONG_TERM;
        archiveCount++;
      }
    });

    // 5. Normalize: Strengthen frequently accessed
    validEntries.forEach(e => {
      const expectedAccess = (Date.now() - e.created) / (24 * 60 * 60 * 1000); // days
      if (e.accessCount > expectedAccess * 2) {
        e.strength = Math.min(1, e.strength + 0.1);
        normalizeCount++;
      }
    });

    this.updateState(s => ({
      memory: {
        ...s.memory,
        entries: validEntries,
        stats: this.calculateMemoryStats(validEntries)
      }
    }));

    this.log(`Memory purified: ${cleanupCount} cleaned, ${compressCount} compressed, ${archiveCount} archived`);

    return {
      cleanup: async () => cleanupCount,
      compress: async () => compressCount,
      fuse: async () => fuseCount,
      archive: async () => archiveCount,
      normalize: async () => normalizeCount
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SELF-HEALING
  // ─────────────────────────────────────────────────────────────────────────

  public async detectDrift(): Promise<{ detected: boolean; drifts: string[] }> {
    const drifts: string[] = [];

    // Check for behavior drifts
    const recentJobs = this.state.jobs.completed.slice(-10);
    if (recentJobs.length > 0) {
      const avgComplexity =
        recentJobs.reduce((sum, j) => sum + j.evaluation.cognitiveLoad, 0) / recentJobs.length;

      if (avgComplexity > 0.7) {
        drifts.push('Cognitive load drift: tasks becoming too complex');
      }

      const avgCoherence =
        recentJobs.reduce((sum, j) => sum + j.evaluation.coherenceScore, 0) / recentJobs.length;

      if (avgCoherence < 0.7) {
        drifts.push('Coherence drift: outputs losing consistency');
      }
    }

    // Check for memory drift
    const memorySize = this.state.memory.stats.totalSize;
    if (memorySize > 200 * 1024 * 1024) {
      // >200MB
      drifts.push('Memory drift: excessive memory accumulation');
    }

    if (drifts.length > 0) {
      this.updateState(s => ({
        evolution: {
          ...s.evolution,
          driftsDetected: s.evolution.driftsDetected + drifts.length
        }
      }));
    }

    return {
      detected: drifts.length > 0,
      drifts
    };
  }

  public async correctDrift(drifts: string[]): Promise<number> {
    let corrections = 0;

    for (const drift of drifts) {
      if (drift.includes('Cognitive load')) {
        // Optimize pending jobs
        const pending = this.state.jobs.pending;
        for (const job of pending) {
          await this.optimizeJob(job.id);
        }
        corrections++;
      }

      if (drift.includes('Memory drift')) {
        // Run memory purification
        await this.purifyMemory();
        corrections++;
      }

      if (drift.includes('Coherence drift')) {
        // Reset coherence baseline
        await this.runHealthCheck();
        corrections++;
      }
    }

    this.updateState(s => ({
      governance: {
        ...s.governance,
        totalCorrections: s.governance.totalCorrections + corrections
      },
      evolution: {
        ...s.evolution,
        driftsCorrected: s.evolution.driftsCorrected + corrections
      }
    }));

    this.log(`Corrected ${corrections} drift(s)`);
    return corrections;
  }

  public async autoImprove(): Promise<string[]> {
    const improvements: string[] = [];

    // 1. Detect drifts
    const { detected, drifts } = await this.detectDrift();

    if (detected) {
      await this.correctDrift(drifts);
      improvements.push(`Corrected ${drifts.length} drift(s)`);
    }

    // 2. Optimize job queue
    if (this.state.jobs.pending.length > 5) {
      // Try to merge similar jobs
      const jobs = this.state.jobs.pending;
      const similar = this.findSimilarJobs(jobs);

      if (similar.length >= 2) {
        await this.mergeJobs(similar.map(j => j.id));
        improvements.push(`Merged ${similar.length} similar jobs`);
      }
    }

    // 3. Purify memory if needed
    const memorySize = this.state.memory.stats.totalSize;
    if (memorySize > 50 * 1024 * 1024) {
      // >50MB
      await this.purifyMemory();
      improvements.push('Purified memory');
    }

    this.updateState(s => ({
      evolution: {
        ...s.evolution,
        improvements: [...s.evolution.improvements, ...improvements],
        cycleCount: s.evolution.cycleCount + 1,
        lastCycle: Date.now()
      }
    }));

    if (improvements.length > 0) {
      this.log(`Auto-improvement cycle completed: ${improvements.join(', ')}`);
    }

    return improvements;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE GETTERS
  // ─────────────────────────────────────────────────────────────────────────

  public getState(): MCPState {
    return { ...this.state };
  }

  public getHealth(): SystemHealthCheck {
    return { ...this.state.health };
  }

  public getStats() {
    return {
      jobs: {
        total:
          this.state.jobs.pending.length +
          this.state.jobs.running.length +
          this.state.jobs.completed.length +
          this.state.jobs.suspended.length,
        pending: this.state.jobs.pending.length,
        running: this.state.jobs.running.length,
        completed: this.state.jobs.completed.length
      },
      memory: this.state.memory.stats,
      governance: this.state.governance,
      evolution: this.state.evolution
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────

  private findJob(jobId: string): Job | undefined {
    return [
      ...this.state.jobs.pending,
      ...this.state.jobs.running,
      ...this.state.jobs.completed,
      ...this.state.jobs.suspended
    ].find(j => j.id === jobId);
  }

  private calculatePriority(type: JobType): JobPriority {
    switch (type) {
      case JobType.REACTIVE:
        return JobPriority.HIGH;
      case JobType.STRATEGIC:
      case JobType.EVOLUTIONARY:
        return JobPriority.CRITICAL;
      case JobType.COGNITIVE:
      case JobType.CREATIVE:
        return JobPriority.NORMAL;
      case JobType.STRUCTURAL:
        return JobPriority.LOW;
      default:
        return JobPriority.NORMAL;
    }
  }

  private determinePermissions(input: Job['input']): Job['permissions'] {
    const query = input.query.toLowerCase();

    return {
      requiresFileAccess: query.includes('file') || query.includes('read') || query.includes('write'),
      requiresMemoryAccess: query.includes('memory') || query.includes('remember'),
      requiresSensitiveData: query.includes('password') || query.includes('secret') || query.includes('private'),
      requiresSystemModification: query.includes('install') || query.includes('delete') || query.includes('modify'),
      allowedCores: Object.values(CognitiveCore),
      allowedAIModels: Object.keys(AI_MODELS)
    };
  }

  private estimateCognitiveLoad(job: Job): number {
    let load = 0.2; // Base load

    // Query complexity
    const wordCount = job.input.query.split(' ').length;
    load += Math.min(wordCount / 100, 0.3);

    // Context complexity
    if (job.input.context) {
      load += Math.min(Object.keys(job.input.context).length / 20, 0.2);
    }

    // Type impact
    if (job.type === JobType.COGNITIVE || job.type === JobType.STRATEGIC) {
      load += 0.2;
    }

    return Math.min(load, 1.0);
  }

  private assessSecurityRisk(job: Job): number {
    let risk = 0.0;

    if (job.permissions.requiresFileAccess) risk += 0.2;
    if (job.permissions.requiresSensitiveData) risk += 0.4;
    if (job.permissions.requiresSystemModification) risk += 0.4;

    return Math.min(risk, 1.0);
  }

  private calculateAlignment(job: Job): number {
    let score = 0.5; // Neutral

    // Check if job aligns with MCP principles
    const query = job.input.query.toLowerCase();

    if (query.includes('clarify') || query.includes('simplify')) score += 0.2;
    if (query.includes('optimize') || query.includes('improve')) score += 0.2;
    if (query.includes('structure') || query.includes('organize')) score += 0.1;

    return Math.min(score, 1.0);
  }

  private estimateImpact(job: Job): Job['evaluation']['impact'] {
    const load = job.evaluation.cognitiveLoad;

    if (load < 0.2) return 'MICRO';
    if (load < 0.4) return 'SMALL';
    if (load < 0.6) return 'MEDIUM';
    if (load < 0.8) return 'LARGE';
    return 'TRANSFORMATIVE';
  }

  private simplifyQuery(query: string): string {
    // Simple heuristic: remove filler words
    const fillers = ['please', 'could you', 'would you', 'i want', 'i need'];
    let simplified = query.toLowerCase();

    fillers.forEach(filler => {
      simplified = simplified.replace(new RegExp(filler, 'g'), '');
    });

    return simplified.trim();
  }

  private isValidMemory(memory: MemoryEntry): boolean {
    const { metadata } = memory;
    return (
      metadata.isUseful &&
      metadata.isTrue &&
      metadata.isStructuring &&
      metadata.isStable &&
      metadata.isReusable
    );
  }

  private calculateMemoryStats(entries: MemoryEntry[]): MCPState['memory']['stats'] {
    return {
      shortTerm: entries.filter(e => e.tier === MemoryTier.SHORT_TERM).length,
      mediumTerm: entries.filter(e => e.tier === MemoryTier.MEDIUM_TERM).length,
      longTerm: entries.filter(e => e.tier === MemoryTier.LONG_TERM).length,
      metaMemory: entries.filter(e => e.tier === MemoryTier.META_MEMORY).length,
      totalSize: entries.reduce((sum, e) => sum + JSON.stringify(e).length, 0)
    };
  }

  private evaluateOutput<T>(output: T): OutputCriteria & { score: number } {
    // Simplified output evaluation
    const outputStr = JSON.stringify(output);

    const criteria = {
      isSimple: outputStr.length < 5000,
      isClear: true, // TODO: Implement clarity check
      isCoherent: true, // TODO: Implement coherence check
      isAligned: true, // TODO: Implement alignment check
      isAccurate: true, // TODO: Implement accuracy check
      isUseful: true, // TODO: Implement usefulness check
      hasZeroOverload: outputStr.length < 10000
    };

    // Calculate score based on criteria
    const score = Object.values(criteria).filter(Boolean).length / Object.values(criteria).length;

    return { ...criteria, score };
  }

  private findSimilarJobs(jobs: Job[]): Job[] {
    // Simple heuristic: jobs with similar query strings
    if (jobs.length < 2) return [];

    const first = jobs[0];
    const similar = jobs.filter(j => {
      if (j.id === first.id) return false;
      const similarity = this.calculateStringSimilarity(first.input.query, j.input.query);
      return similarity > 0.7;
    });

    return similar.length > 0 ? [first, ...similar] : [];
  }

  private calculateStringSimilarity(a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(' '));
    const wordsB = new Set(b.toLowerCase().split(' '));
    const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));

    return intersection.size / Math.max(wordsA.size, wordsB.size);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────────────

  public startEvolutionCycle(intervalMs: number = 60000) {
    if (this.evolutionInterval) return;

    this.evolutionInterval = setInterval(async () => {
      await this.autoImprove();
    }, intervalMs);

    this.log(`Evolution cycle started (${intervalMs}ms interval)`);
  }

  public stopEvolutionCycle() {
    if (this.evolutionInterval) {
      clearInterval(this.evolutionInterval);
      this.evolutionInterval = null;
      this.log('Evolution cycle stopped');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const MCPOrchestrator = new MCPOrchestratorClass();
export default MCPOrchestrator;
