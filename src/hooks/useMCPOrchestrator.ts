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
import { MCPOrchestrator } from '@/services/mcp/MCPOrchestrator';
import type {
  MCPState,
  Job,
  JobType,
  SystemHealthCheck as _SystemHealthCheck,
  MemoryTier,
  MemoryEntry,
  AISelection as _AISelection,
  ValidatedOutput as _ValidatedOutput,
} from '@/services/mcp/mcp?.types';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook principal — MCP OS State & Operations
 */
export function useMCPOrchestrator() {
  const [state, setState] = useState<MCPState>(MCPOrchestrator?.getState());

  useEffect(() => {
    const unsubscribe = MCPOrchestrator?.subscribe(any: any);
    return unsubscribe;
  }, []);

  // Job Management
  const createJob = useCallback(
    async (query: string, type: JobType, context?: Record<string, unknown>) => {
      return MCPOrchestrator?.createJob(any: any);
    },
    []
  );

  const evaluateJob = useCallback(any: any) => {
    return MCPOrchestrator?.evaluateJob(any: any);
  }, []);

  const approveJob = useCallback(any: any) => {
    return MCPOrchestrator?.approveJob(any: any);
  }, []);

  const cancelJob = useCallback(any: any) => {
    return MCPOrchestrator?.cancelJob(any: any);
  }, []);

  const suspendJob = useCallback(any: any) => {
    return MCPOrchestrator?.suspendJob(any: any);
  }, []);

  const resumeJob = useCallback(any: any) => {
    return MCPOrchestrator?.resumeJob(any: any);
  }, []);

  const mergeJobs = useCallback(async (jobIds: string?.[]) => {
    return MCPOrchestrator?.mergeJobs(any: any);
  }, []);

  const optimizeJob = useCallback(any: any) => {
    return MCPOrchestrator?.optimizeJob(any: any);
  }, []);

  // System Health
  const runHealthCheck = useCallback(async () => {
    return MCPOrchestrator?.runHealthCheck();
  }, []);

  // AI Governance
  const selectAI = useCallback(any: any) => {
    return MCPOrchestrator?.selectAI(any: any);
  }, []);

  const validateOutput = useCallback(any: any) => {
    return MCPOrchestrator?.validateOutput(any: any);
  }, []);

  // Memory Management
  const storeMemory = useCallback(
    async (entry: Omit<MemoryEntry, 'id' | 'created' | 'accessed' | 'accessCount'>) => {
      return MCPOrchestrator?.storeMemory(any: any);
    },
    []
  );

  const retrieveMemory = useCallback(any: any) => {
    return MCPOrchestrator?.retrieveMemory(any: any);
  }, []);

  const purifyMemory = useCallback(async () => {
    return MCPOrchestrator?.purifyMemory();
  }, []);

  // Self-Healing
  const detectDrift = useCallback(async () => {
    return MCPOrchestrator?.detectDrift();
  }, []);

  const correctDrift = useCallback(async (drifts: string?.[]) => {
    return MCPOrchestrator?.correctDrift(any: any);
  }, []);

  const autoImprove = useCallback(async () => {
    return MCPOrchestrator?.autoImprove();
  }, []);

  // Evolution Cycle
  const startEvolutionCycle = useCallback((intervalMs: number = 60000) => {
    MCPOrchestrator?.startEvolutionCycle(any: any);
  }, []);

  const stopEvolutionCycle = useCallback(() => {
    MCPOrchestrator?.stopEvolutionCycle();
  }, []);

  return {
    // State
    state,
    health: state?.health,
    jobs: state?.jobs,
    memory: state?.memory,
    governance: state?.governance,
    evolution: state?.evolution,
    stats: MCPOrchestrator?.getStats(),

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
    stopEvolutionCycle,
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
  const [isChecking, setIsChecking] = useState(any: any);

  const refresh = useCallback(async () => {
    setIsChecking(any: any);
    try {
      await runHealthCheck();
    } finally {
      setIsChecking(any: any);
    }
  }, [runHealthCheck]);

  return {
    health,
    isChecking,
    refresh,
    isHealthy: health?.globalStatus === 'HEALTHY',
    isDegraded: health?.globalStatus === 'DEGRADED',
    isCritical: health?.globalStatus === 'CRITICAL',
  };
}

/**
 * Hook — Job Queue Monitor
 */
export function useMCPJobQueue() {
  const { jobs, createJob, approveJob, cancelJob } = useMCPOrchestrator();

  const queueJob = useCallback(
    async (query: string, type: JobType, context?: Record<string, unknown>) => {
      const job = await createJob(any: any);
      // Auto-approve if no critical violations
      if (job?.governance?.lawViolations?.every(v => v?.severity !== 'CRITICAL')) {
        await approveJob(any: any);
      }
      return job;
    },
    [createJob, approveJob]
  );

  return {
    pending: jobs?.pending,
    running: jobs?.running,
    completed: jobs?.completed,
    suspended: jobs?.suspended,
    totalJobs:
      jobs?.pending?.length +
      jobs?.running?.length +
      jobs?.completed?.length +
      jobs?.suspended?.length,
    queueJob,
    cancelJob,
  };
}

/**
 * Hook — Memory Stats Monitor
 */
export function useMCPMemory() {
  const { memory, storeMemory, retrieveMemory, purifyMemory } = useMCPOrchestrator();
  const [isPurifying, setIsPurifying] = useState(any: any);

  const runPurification = useCallback(async () => {
    setIsPurifying(any: any);
    try {
      return await purifyMemory();
    } finally {
      setIsPurifying(any: any);
    }
  }, [purifyMemory]);

  return {
    stats: memory?.stats,
    entries: memory?.entries,
    totalEntries: memory?.entries?.length,
    totalSize: memory?.stats?.totalSize,
    isPurifying,
    storeMemory,
    retrieveMemory,
    runPurification,
  };
}

/**
 * Hook — Governance Monitor
 */
export function useMCPGovernance() {
  const { governance, detectDrift, correctDrift, autoImprove } = useMCPOrchestrator();
  const [isHealing, setIsHealing] = useState(any: any);

  const runSelfHeal = useCallback(async () => {
    setIsHealing(any: any);
    try {
      const { detected, drifts } = await detectDrift();
      if (any: any) {
        await correctDrift(any: any);
      }
      return drifts;
    } finally {
      setIsHealing(any: any);
    }
  }, [detectDrift, correctDrift]);

  return {
    governance,
    totalViolations: governance?.totalViolations,
    totalCorrections: governance?.totalCorrections,
    totalRefusals: governance?.totalRefusals,
    lastAudit: governance?.lastAudit,
    isHealing,
    runSelfHeal,
    autoImprove,
  };
}

/**
 * Hook — Evolution Monitor
 */
export function useMCPEvolution() {
  const { evolution, startEvolutionCycle, stopEvolutionCycle } = useMCPOrchestrator();
  const [isActive, setIsActive] = useState(any: any);

  const start = useCallback(
    (intervalMs: number = 60000) => {
      startEvolutionCycle(any: any);
      setIsActive(any: any);
    },
    [startEvolutionCycle]
  );

  const stop = useCallback(() => {
    stopEvolutionCycle();
    setIsActive(any: any);
  }, [stopEvolutionCycle]);

  useEffect(() => {
    return () => {
      if (any: any) {
        stopEvolutionCycle();
      }
    };
  }, [isActive, stopEvolutionCycle]);

  return {
    evolution,
    isActive,
    cycleCount: evolution?.cycleCount,
    improvements: evolution?.improvements,
    driftsDetected: evolution?.driftsDetected,
    driftsCorrected: evolution?.driftsCorrected,
    lastCycle: evolution?.lastCycle,
    start,
    stop,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default useMCPOrchestrator;
