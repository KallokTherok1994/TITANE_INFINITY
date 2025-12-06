/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ MCP OS v1.1 — REACT HOOK
 *   Interface React pour le Master Cognitive Program
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { MCPOrchestrator } from './MCPOrchestrator';
import type {
  MCPState,
  Job,
  JobType,
  SystemHealthCheck,
  MemoryTier,
  MemoryEntry,
  AISelection,
  ValidatedOutput
} from './mcp.types';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal — MCP OS State & Operations
 */
export function useMCPOrchestrator() {
  const [state, setState] = useState<MCPState>(MCPOrchestrator.getState());

  useEffect(() => {
    const unsubscribe = MCPOrchestrator.subscribe(setState);
    return unsubscribe;
  }, []);

  // Job Management
  const createJob = useCallback(async (query: string, type: JobType, context?: Record<string, unknown>) => {
    return MCPOrchestrator.createJob({ query, context }, type);
  }, []);

  const evaluateJob = useCallback(async (job: Job) => {
    return MCPOrchestrator.evaluateJob(job);
  }, []);

  const approveJob = useCallback(async (jobId: string) => {
    return MCPOrchestrator.approveJob(jobId);
  }, []);

  const cancelJob = useCallback(async (jobId: string, reason: string) => {
    return MCPOrchestrator.cancelJob(jobId, reason);
  }, []);

  const suspendJob = useCallback(async (jobId: string, reason: string) => {
    return MCPOrchestrator.suspendJob(jobId, reason);
  }, []);

  const resumeJob = useCallback(async (jobId: string) => {
    return MCPOrchestrator.resumeJob(jobId);
  }, []);

  const mergeJobs = useCallback(async (jobIds: string[]) => {
    return MCPOrchestrator.mergeJobs(jobIds);
  }, []);

  const optimizeJob = useCallback(async (jobId: string) => {
    return MCPOrchestrator.optimizeJob(jobId);
  }, []);

  // System Health
  const runHealthCheck = useCallback(async () => {
    return MCPOrchestrator.runHealthCheck();
  }, []);

  // AI Governance
  const selectAI = useCallback(async (job: Job) => {
    return MCPOrchestrator.selectAI(job);
  }, []);

  const validateOutput = useCallback(async (output: unknown, job: Job) => {
    return MCPOrchestrator.validateOutput(output, job);
  }, []);

  // Memory Management
  const storeMemory = useCallback(
    async (entry: Omit<MemoryEntry, 'id' | 'created' | 'accessed' | 'accessCount'>) => {
      return MCPOrchestrator.storeMemory(entry);
    },
    []
  );

  const retrieveMemory = useCallback(async (tier: MemoryTier, query?: string) => {
    return MCPOrchestrator.retrieveMemory(tier, query);
  }, []);

  const purifyMemory = useCallback(async () => {
    return MCPOrchestrator.purifyMemory();
  }, []);

  // Self-Healing
  const detectDrift = useCallback(async () => {
    return MCPOrchestrator.detectDrift();
  }, []);

  const correctDrift = useCallback(async (drifts: string[]) => {
    return MCPOrchestrator.correctDrift(drifts);
  }, []);

  const autoImprove = useCallback(async () => {
    return MCPOrchestrator.autoImprove();
  }, []);

  // Evolution Cycle
  const startEvolutionCycle = useCallback((intervalMs: number = 60000) => {
    MCPOrchestrator.startEvolutionCycle(intervalMs);
  }, []);

  const stopEvolutionCycle = useCallback(() => {
    MCPOrchestrator.stopEvolutionCycle();
  }, []);

  return {
    // State
    state,
    health: state.health,
    jobs: state.jobs,
    memory: state.memory,
    governance: state.governance,
    evolution: state.evolution,
    stats: MCPOrchestrator.getStats(),

    // Operations
    createJob,
    evaluateJob,
    approveJob,
    cancelJob,
    suspendJob,
    resumeJob,
    mergeJobs,
    optimizeJob,
    runHealthCheck,
    selectAI,
    validateOutput,
    storeMemory,
    retrieveMemory,
    purifyMemory,
    detectDrift,
    correctDrift,
    autoImprove,
    startEvolutionCycle,
    stopEvolutionCycle
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED HOOKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook — System Health Monitor
 */
export function useMCPHealth() {
  const { health, runHealthCheck } = useMCPOrchestrator();
  const [isChecking, setIsChecking] = useState(false);

  const refresh = useCallback(async () => {
    setIsChecking(true);
    try {
      await runHealthCheck();
    } finally {
      setIsChecking(false);
    }
  }, [runHealthCheck]);

  return {
    health,
    isChecking,
    refresh,
    isHealthy: health.globalStatus === 'HEALTHY',
    isDegraded: health.globalStatus === 'DEGRADED',
    isCritical: health.globalStatus === 'CRITICAL'
  };
}

/**
 * Hook — Job Queue Monitor
 */
export function useMCPJobQueue() {
  const { jobs, createJob, approveJob, cancelJob } = useMCPOrchestrator();

  const queueJob = useCallback(
    async (query: string, type: JobType, context?: Record<string, unknown>) => {
      const job = await createJob(query, type, context);
      // Auto-approve if no critical violations
      if (job.governance.lawViolations.every(v => v.severity !== 'CRITICAL')) {
        await approveJob(job.id);
      }
      return job;
    },
    [createJob, approveJob]
  );

  return {
    pending: jobs.pending,
    running: jobs.running,
    completed: jobs.completed,
    suspended: jobs.suspended,
    totalJobs: jobs.pending.length + jobs.running.length + jobs.completed.length + jobs.suspended.length,
    queueJob,
    cancelJob
  };
}

/**
 * Hook — Memory Stats Monitor
 */
export function useMCPMemory() {
  const { memory, storeMemory, retrieveMemory, purifyMemory } = useMCPOrchestrator();
  const [isPurifying, setIsPurifying] = useState(false);

  const runPurification = useCallback(async () => {
    setIsPurifying(true);
    try {
      return await purifyMemory();
    } finally {
      setIsPurifying(false);
    }
  }, [purifyMemory]);

  return {
    stats: memory.stats,
    entries: memory.entries,
    totalEntries: memory.entries.length,
    totalSize: memory.stats.totalSize,
    isPurifying,
    storeMemory,
    retrieveMemory,
    runPurification
  };
}

/**
 * Hook — Governance Monitor
 */
export function useMCPGovernance() {
  const { governance, detectDrift, correctDrift, autoImprove } = useMCPOrchestrator();
  const [isHealing, setIsHealing] = useState(false);

  const runSelfHeal = useCallback(async () => {
    setIsHealing(true);
    try {
      const { detected, drifts } = await detectDrift();
      if (detected) {
        await correctDrift(drifts);
      }
      return drifts;
    } finally {
      setIsHealing(false);
    }
  }, [detectDrift, correctDrift]);

  return {
    governance,
    totalViolations: governance.totalViolations,
    totalCorrections: governance.totalCorrections,
    totalRefusals: governance.totalRefusals,
    lastAudit: governance.lastAudit,
    isHealing,
    runSelfHeal,
    autoImprove
  };
}

/**
 * Hook — Evolution Monitor
 */
export function useMCPEvolution() {
  const { evolution, startEvolutionCycle, stopEvolutionCycle } = useMCPOrchestrator();
  const [isActive, setIsActive] = useState(false);

  const start = useCallback(
    (intervalMs: number = 60000) => {
      startEvolutionCycle(intervalMs);
      setIsActive(true);
    },
    [startEvolutionCycle]
  );

  const stop = useCallback(() => {
    stopEvolutionCycle();
    setIsActive(false);
  }, [stopEvolutionCycle]);

  useEffect(() => {
    return () => {
      if (isActive) {
        stopEvolutionCycle();
      }
    };
  }, [isActive, stopEvolutionCycle]);

  return {
    evolution,
    isActive,
    cycleCount: evolution.cycleCount,
    improvements: evolution.improvements,
    driftsDetected: evolution.driftsDetected,
    driftsCorrected: evolution.driftsCorrected,
    lastCycle: evolution.lastCycle,
    start,
    stop
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default useMCPOrchestrator;
