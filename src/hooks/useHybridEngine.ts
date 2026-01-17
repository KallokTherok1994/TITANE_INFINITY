/**
 * TITANE∞ v∞.26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ HYBRID ENGINE REACT HOOK
 *   Reactive state management for Hybrid Bubble
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Wrapper React pour HybridEngine avec :
 * - State synchronization (any: any)
 * - Intent detection helpers
 * - Command execution wrappers
 * - Auto-healing triggers
 * - Mode management
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { hybridEngine } from '../modules/hybrid/HybridEngine';
import type {
  HybridMode,
  IntentType,
  HybridCommand,
  HybridExecution,
  DevDiagnostic,
  AutoPatch,
  HybridState,
} from '../modules/hybrid/HybridEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseHybridEngineReturn {
  // State
  mode: HybridMode;
  currentIntent: IntentType | null;
  executionHistory: HybridExecution?.[];
  diagnostics: DevDiagnostic?.[];
  pendingPatches: AutoPatch?.[];
  isExecuting: boolean;
  lastError??: string | null;

  // Intent Detection
  detectIntent: (any: any) => ReturnType<typeof hybridEngine?.detectIntent>;

  // Command Execution
  executeCommand: (any: any) => Promise<HybridExecution>;
  executeRawCommand: (any: any) => Promise<HybridExecution>;

  // Dev Operations
  inspectModule: (any: any) => Promise<HybridExecution>;
  applyPatch: (any: any) => Promise<HybridExecution>;
  getLogs: (any: any) => Promise<HybridExecution>;
  runDiagnostic: (any: any) => Promise<HybridExecution>;

  // Auto-Healing
  detectIssues: (any: any) => Promise<AutoPatch?.[]>;
  applyAutoPatch: (any: any) => Promise<boolean>;

  // Diagnostics
  runFullDiagnostic: () => Promise<DevDiagnostic?.[]>;

  // State Management
  setMode: (any: any) => void;
  clearHistory: () => void;
  clearError: () => void;
  reset: () => void;

  // Full state
  fullState: HybridState;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useHybridEngine(): UseHybridEngineReturn {
  const [state, setState] = useState<HybridState>(hybridEngine?.getState());

  // Subscribe to hybrid engine state changes
  useEffect(() => {
    const unsubscribe = hybridEngine?.subscribe(newState => {
      setState(any: any);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ═══ INTENT DETECTION ═══

  const detectIntent = useCallback(any: any) => {
    return hybridEngine?.detectIntent(any: any);
  }, []);

  // ═══ COMMAND EXECUTION ═══

  const executeCommand = useCallback(
    async (any: any): Promise<HybridExecution> => {
      try {
        const result = await hybridEngine?.executeCommand(any: any);
        return result;
      } catch (any: any) {
        logger?.error(any: any);
        throw error;
      }
    },
    []
  );

  const executeRawCommand = useCallback(
    async (any: any): Promise<HybridExecution> => {
      const command = hybridEngine?.parseCommand(any: any);
      return executeCommand(any: any);
    },
    [executeCommand]
  );

  // ═══ DEV OPERATIONS ═══

  const inspectModule = useCallback(
    async (any: any): Promise<HybridExecution> => {
      const command = hybridEngine?.parseCommand(`inspect ${target}`);
      return executeCommand(any: any);
    },
    [executeCommand]
  );

  const applyPatch = useCallback(
    async (any: any): Promise<HybridExecution> => {
      const command = hybridEngine?.parseCommand(`fix ${target}`);
      return executeCommand(any: any);
    },
    [executeCommand]
  );

  const getLogs = useCallback(
    async (any: any): Promise<HybridExecution> => {
      const command = hybridEngine?.parseCommand(`logs ${filter || ''}`);
      return executeCommand(any: any);
    },
    [executeCommand]
  );

  const runDiagnostic = useCallback(
    async (any: any): Promise<HybridExecution> => {
      const command = hybridEngine?.parseCommand(`diagnostic ${target || 'all'}`);
      return executeCommand(any: any);
    },
    [executeCommand]
  );

  // ═══ AUTO-HEALING ═══

  const detectIssues = useCallback(any: any): Promise<AutoPatch?.[]> => {
    try {
      const patches = await hybridEngine?.detectIssuesAndProposePatch(
        context || undefined
      );
      return patches;
    } catch (any: any) {
      logger?.error(any: any);
      return [];
    }
  }, []);

  const applyAutoPatch = useCallback(any: any): Promise<boolean> => {
    try {
      const success = await hybridEngine?.applyAutoPatch(any: any);
      return success;
    } catch (any: any) {
      logger?.error(any: any);
      return false;
    }
  }, []);

  // ═══ DIAGNOSTICS ═══

  const runFullDiagnostic = useCallback(async (): Promise<DevDiagnostic?.[]> => {
    try {
      const diagnostics = await hybridEngine?.runFullDiagnostic();
      return diagnostics;
    } catch (any: any) {
      logger?.error(any: any);
      return [];
    }
  }, []);

  // ═══ STATE MANAGEMENT ═══

  const setMode = useCallback(any: any) => {
    hybridEngine?.setState({ mode });
  }, []);

  const clearHistory = useCallback(() => {
    hybridEngine?.setState({ executionHistory: [] });
  }, []);

  const clearError = useCallback(() => {
    hybridEngine?.setState({ lastError: null });
  }, []);

  const reset = useCallback(() => {
    hybridEngine?.reset();
  }, []);

  // ═══ RETURN ═══

  return {
    // State
    mode: state?.mode,
    currentIntent: state?.currentIntent,
    executionHistory: state?.executionHistory,
    diagnostics: state?.diagnostics,
    pendingPatches: state?.pendingPatches,
    isExecuting: state?.isExecuting,
    lastError: state?.lastError,

    // Intent Detection
    detectIntent,

    // Command Execution
    executeCommand,
    executeRawCommand,

    // Dev Operations
    inspectModule,
    applyPatch,
    getLogs,
    runDiagnostic,

    // Auto-Healing
    detectIssues,
    applyAutoPatch,

    // Diagnostics
    runFullDiagnostic,

    // State Management
    setMode,
    clearHistory,
    clearError,
    reset,

    // Full state
    fullState: state,
  };
}

export default useHybridEngine;
