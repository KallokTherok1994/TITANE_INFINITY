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
 * - State synchronization (subscribe pattern)
 * - Intent detection helpers
 * - Command execution wrappers
 * - Auto-healing triggers
 * - Mode management
 */

import { useState, useEffect, useCallback } from 'react';
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
  executionHistory: HybridExecution[];
  diagnostics: DevDiagnostic[];
  pendingPatches: AutoPatch[];
  isExecuting: boolean;
  lastError: string | null;

  // Intent Detection
  detectIntent: (message: string) => ReturnType<typeof hybridEngine.detectIntent>;

  // Command Execution
  executeCommand: (command: HybridCommand) => Promise<HybridExecution>;
  executeRawCommand: (input: string) => Promise<HybridExecution>;

  // Dev Operations
  inspectModule: (target: string) => Promise<HybridExecution>;
  applyPatch: (target: string) => Promise<HybridExecution>;
  getLogs: (filter?: string) => Promise<HybridExecution>;
  runDiagnostic: (target?: string) => Promise<HybridExecution>;

  // Auto-Healing
  detectIssues: (context?: string) => Promise<AutoPatch[]>;
  applyAutoPatch: (patch: AutoPatch) => Promise<boolean>;

  // Diagnostics
  runFullDiagnostic: () => Promise<DevDiagnostic[]>;

  // State Management
  setMode: (mode: HybridMode) => void;
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
  const [state, setState] = useState<HybridState>(hybridEngine.getState());

  // Subscribe to hybrid engine state changes
  useEffect(() => {
    const unsubscribe = hybridEngine.subscribe(newState => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ═══ INTENT DETECTION ═══

  const detectIntent = useCallback((message: string) => {
    return hybridEngine.detectIntent(message);
  }, []);

  // ═══ COMMAND EXECUTION ═══

  const executeCommand = useCallback(
    async (command: HybridCommand): Promise<HybridExecution> => {
      try {
        const result = await hybridEngine.executeCommand(command);
        return result;
      } catch (error) {
        console.error('[useHybridEngine] Execute failed:', error);
        throw error;
      }
    },
    []
  );

  const executeRawCommand = useCallback(
    async (input: string): Promise<HybridExecution> => {
      const command = hybridEngine.parseCommand(input);
      return executeCommand(command);
    },
    [executeCommand]
  );

  // ═══ DEV OPERATIONS ═══

  const inspectModule = useCallback(
    async (target: string): Promise<HybridExecution> => {
      const command = hybridEngine.parseCommand(`inspect ${target}`);
      return executeCommand(command);
    },
    [executeCommand]
  );

  const applyPatch = useCallback(
    async (target: string): Promise<HybridExecution> => {
      const command = hybridEngine.parseCommand(`fix ${target}`);
      return executeCommand(command);
    },
    [executeCommand]
  );

  const getLogs = useCallback(
    async (filter?: string): Promise<HybridExecution> => {
      const command = hybridEngine.parseCommand(`logs ${filter || ''}`);
      return executeCommand(command);
    },
    [executeCommand]
  );

  const runDiagnostic = useCallback(
    async (target?: string): Promise<HybridExecution> => {
      const command = hybridEngine.parseCommand(`diagnostic ${target || 'all'}`);
      return executeCommand(command);
    },
    [executeCommand]
  );

  // ═══ AUTO-HEALING ═══

  const detectIssues = useCallback(async (context?: string): Promise<AutoPatch[]> => {
    try {
      const patches = await hybridEngine.detectIssuesAndProposePatch(
        context || undefined
      );
      return patches;
    } catch (error) {
      console.error('[useHybridEngine] Detect issues failed:', error);
      return [];
    }
  }, []);

  const applyAutoPatch = useCallback(async (patch: AutoPatch): Promise<boolean> => {
    try {
      const success = await hybridEngine.applyAutoPatch(patch);
      return success;
    } catch (error) {
      console.error('[useHybridEngine] Apply auto-patch failed:', error);
      return false;
    }
  }, []);

  // ═══ DIAGNOSTICS ═══

  const runFullDiagnostic = useCallback(async (): Promise<DevDiagnostic[]> => {
    try {
      const diagnostics = await hybridEngine.runFullDiagnostic();
      return diagnostics;
    } catch (error) {
      console.error('[useHybridEngine] Full diagnostic failed:', error);
      return [];
    }
  }, []);

  // ═══ STATE MANAGEMENT ═══

  const setMode = useCallback((mode: HybridMode) => {
    hybridEngine.setState({ mode });
  }, []);

  const clearHistory = useCallback(() => {
    hybridEngine.setState({ executionHistory: [] });
  }, []);

  const clearError = useCallback(() => {
    hybridEngine.setState({ lastError: null });
  }, []);

  const reset = useCallback(() => {
    hybridEngine.reset();
  }, []);

  // ═══ RETURN ═══

  return {
    // State
    mode: state.mode,
    currentIntent: state.currentIntent,
    executionHistory: state.executionHistory,
    diagnostics: state.diagnostics,
    pendingPatches: state.pendingPatches,
    isExecuting: state.isExecuting,
    lastError: state.lastError,

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
