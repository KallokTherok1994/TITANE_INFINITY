/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — Evolution Store (Zustand)
 * Store pour l'engine d'auto-évolution
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  EvolutionReport,
  EvolutionState,
  HealthStatus,
} from '../services/tauri/backend-v17.2.types';
import { backendV17 } from '../services/tauri/backend-v17.2.commands';

interface EvolutionStore {
  // State
  state: EvolutionState | null;
  lastReport: EvolutionReport | null;
  health: HealthStatus | null;
  running: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  fetchState: () => Promise<void>;
  runEvolution: () => Promise<void>;
  quickHealthCheck: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  state: null,
  lastReport: null,
  health: null,
  running: false,
  loading: false,
  error: null,
};

export const useEvolutionStore = create<EvolutionStore>()(
  devtools(
    (set) => ({
      ...initialState,

      fetchState: async () => {
        try {
          set({ loading: true, error: null });
          const state = await backendV17.engine.getState();
          set({ state, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch evolution state',
            loading: false,
          });
        }
      },

      runEvolution: async () => {
        try {
          set({ running: true, loading: true, error: null });
          const report = await backendV17.engine.runEvolution();
          
          // Fetch updated state
          const state = await backendV17.engine.getState();
          
          set({ 
            lastReport: report, 
            state, 
            running: false, 
            loading: false 
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Evolution failed',
            running: false,
            loading: false,
          });
        }
      },

      quickHealthCheck: async () => {
        try {
          set({ loading: true, error: null });
          const health = await backendV17.engine.quickHealthCheck();
          set({ health, loading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Health check failed',
            loading: false,
          });
        }
      },

      reset: () => set(initialState),
    }),
    { name: 'EvolutionStore' }
  )
);
