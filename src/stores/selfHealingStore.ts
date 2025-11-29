/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — Self-Healing Store (Zustand)
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  triggerSelfHealing,
  summarizeSelfHealing,
  type SelfHealingRunResult,
} from '@/services/selfHealing/selfHealingService';

const MAX_HISTORY = 12;

export interface SelfHealingSummary {
  timestamp: number;
  symptoms: string;
  diagnostic: string;
  confidence: number;
  patchApplied: boolean;
  steps: string[];
  escalation: string;
}

interface SelfHealingStoreState {
  isRunning: boolean;
  lastResult: SelfHealingRunResult | null;
  history: SelfHealingSummary[];
  error: string | null;
  run: (symptoms: string) => Promise<SelfHealingRunResult | null>;
  clearHistory: () => void;
  clearError: () => void;
}

export const useSelfHealingStore = create<SelfHealingStoreState>()(
  devtools(
    (set, get) => ({
      isRunning: false,
      lastResult: null,
      history: [],
      error: null,

      run: async (symptoms: string) => {
        if (get().isRunning) {
          return null;
        }

        try {
          set({ isRunning: true, error: null });
          const result = await triggerSelfHealing(symptoms);
          const summary = summarizeSelfHealing(result);

          set((state) => ({
            lastResult: result,
            history: [summary, ...state.history].slice(0, MAX_HISTORY),
            isRunning: false,
          }));

          return result;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Self-healing run failed',
            isRunning: false,
          });
          return null;
        }
      },

      clearHistory: () => set({ history: [] }),
      clearError: () => set({ error: null }),
    }),
    { name: 'SelfHealingStore' }
  )
);
