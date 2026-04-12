/**
 * TITANE∞ v32.0.0 — SelfHealing Store Selectors
 * Optimized selectors with shallow equality for useSelfHealingStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useShallow } from 'zustand/react/shallow';
import { useSelfHealingStore } from './useSelfHealingStore';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (Single Value)
// ═══════════════════════════════════════════════════════════════

export const useSelfHealingIssues = () => useSelfHealingStore(state => state.issues);
export const useSelfHealingRepairs = () => useSelfHealingStore(state => state.repairs);
export const useSelfHealingHealth = () =>
  useSelfHealingStore(state => state.healthStatus);
export const useSelfHealingInitialized = () =>
  useSelfHealingStore(state => state.isInitialized);
export const useSelfHealingScanning = () =>
  useSelfHealingStore(state => state.isScanning);
export const useSelfHealingRepairing = () =>
  useSelfHealingStore(state => state.isRepairing);
export const useSelfHealingLoading = () => useSelfHealingStore(state => state.isLoading);
export const useSelfHealingError = () => useSelfHealingStore(state => state.error);

// ═══════════════════════════════════════════════════════════════
// COMPOSITE SELECTORS (Multiple Values with Shallow Equality)
// ═══════════════════════════════════════════════════════════════

export const useSelfHealingSnapshot = () =>
  useSelfHealingStore(
    useShallow(state => ({
      issues: state.issues,
      repairs: state.repairs,
      healthStatus: state.healthStatus,
      isInitialized: state.isInitialized,
      isScanning: state.isScanning,
      isRepairing: state.isRepairing,
      isLoading: state.isLoading,
      error: state.error,
    }))
  );

export const useSelfHealingDiagnostics = () =>
  useSelfHealingStore(
    useShallow(state => ({
      watchdogs: state.watchdogs,
      recoveryPoints: state.recoveryPoints,
      healthByCategory: state.healthByCategory,
    }))
  );

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

export const useSelfHealingActions = () =>
  useSelfHealingStore(
    useShallow(state => ({
      initialize: state.initialize,
      reset: state.reset,
      resolveIssue: state.resolveIssue,
      clearResolvedIssues: state.clearResolvedIssues,
      runDiagnostics: state.runDiagnostics,
      checkHealth: state.checkHealth,
      attemptRepair: state.attemptRepair,
      cancelRepair: state.cancelRepair,
      executeRepairs: state.executeRepairs,
      createRecoveryPoint: state.createRecoveryPoint,
      deleteRecoveryPoint: state.deleteRecoveryPoint,
      updateStats: state.updateStats,
    }))
  );
