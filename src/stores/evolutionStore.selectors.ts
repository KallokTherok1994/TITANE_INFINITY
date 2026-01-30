/**
 * TITANE∞ v32.0.0 — Evolution Store Selectors
 * Optimized selectors with shallow equality for evolutionStore
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { shallow } from 'zustand/shallow';
import { useEvolutionStore } from './evolutionStore';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVE SELECTORS (Single Value)
// ═══════════════════════════════════════════════════════════════

export const useEvolutionState = () => useEvolutionStore(state => state.state);
export const useEvolutionLastReport = () =>
  useEvolutionStore(state => state.lastReport);
export const useEvolutionHealth = () => useEvolutionStore(state => state.health);
export const useEvolutionRunning = () => useEvolutionStore(state => state.running);
export const useEvolutionLoading = () => useEvolutionStore(state => state.loading);

// ═══════════════════════════════════════════════════════════════
// COMPOSITE SELECTORS (Multiple Values with Shallow Equality)
// ═══════════════════════════════════════════════════════════════

export const useEvolutionSnapshot = () =>
  useEvolutionStore(
    state => ({
      state: state.state,
      lastReport: state.lastReport,
      health: state.health,
      running: state.running,
      loading: state.loading,
    }),
    shallow
  );

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

export const useEvolutionActions = () =>
  useEvolutionStore(
    state => ({
      fetchState: state.fetchState,
      runEvolution: state.runEvolution,
      quickHealthCheck: state.quickHealthCheck,
      reset: state.reset,
    }),
    shallow
  );
