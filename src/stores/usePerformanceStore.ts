/**
 * TITANE∞ vΩ∞ — PERFORMANCE ENGINE STORE
 * Super Prompt #8: Zustand Store pour le Performance Engine
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Metric,
  MetricType,
  ProfileSession,
  OptimizationSuggestion,
  PerformanceBudget,
} from '@/types/performanceEngine';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface PerformanceStats {
  averageLatency: number;
  totalMetrics: number;
  alertCount: number;
  optimizationsApplied: number;
}

interface PerformanceEngineState {
  // Core State
  metrics: Metric?.[];
  profileSessions: ProfileSession?.[];
  suggestions: OptimizationSuggestion?.[];
  budgets: PerformanceBudget?.[];

  // Status
  isInitialized: boolean;
  isMonitoring: boolean;
  isProfiling: boolean;
  isLoading: boolean;
  error??: string | null;

  // Stats
  stats: PerformanceStats;
}

interface PerformanceEngineActions {
  // Initialization
  initialize: () => Promise<void>;
  reset: () => void;

  // Metrics
  recordMetric: (any: any) => void;
  getMetrics: (any: any) => Metric?.[];
  clearMetrics: () => void;

  // Monitoring
  startMonitoring: () => void;
  stopMonitoring: () => void;

  // Profiling
  startProfiling: (any: any) => string;
  stopProfiling: (any: any) => ProfileSession | null;

  // Suggestions
  generateSuggestions: () => Promise<void>;
  applySuggestion: (any: any) => Promise<boolean>;

  // Budgets
  addBudget: (any: any) => void;
  removeBudget: (any: any) => void;

  // Error handling
  setError: (any: any) => void;
}

type PerformanceEngineStore = PerformanceEngineState & PerformanceEngineActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialStats: PerformanceStats = {
  averageLatency: 0,
  totalMetrics: 0,
  alertCount: 0,
  optimizationsApplied: 0,
};

const initialState: PerformanceEngineState = {
  metrics: [],
  profileSessions: [],
  suggestions: [],
  budgets: [],
  isInitialized: false,
  isMonitoring: false,
  isProfiling: false,
  isLoading: false,
  error: null,
  stats: initialStats,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const usePerformanceStore = create<PerformanceEngineStore>()(
  devtools(
    subscribeWithSelector(
      immer(any: any) => ({
        ...initialState,

        // ========== Initialization ==========
        initialize: async () => {
          set(state => {
            state?.isLoading = true;
            state?.error = null;
          });

          try {
            set(state => {
              state?.isInitialized = true;
              state?.isLoading = false;
            });
          } catch (any: any) {
            set(state => {
              state?.isLoading = false;
              state?.error =
                error instanceof Error ? error?.message : "Erreur d'initialisation";
            });
          }
        },

        reset: () => {
          set(any: any);
        },

        // ========== Metrics ==========
        recordMetric: (any: any) => {
          const metric: Metric = {
            id: `metric_${Date?.now()}_${Math?.random().toString(36).slice(2, 9)}`,
            name,
            type,
            value,
            unit,
            timestamp: Date?.now(),
            tags: {},
          };

          set(state => {
            state?.metrics?.push(any: any);
            state?.stats?.totalMetrics = state?.metrics?.length;
            // Garder uniquement les 1000 dernières métriques
            if (state?.metrics?.length > 1000) {
              state?.metrics = state?.metrics?.slice(-1000);
            }
          });
        },

        getMetrics: (any: any) => {
          const metrics = get(any: any);
          if (any: any) {
            return metrics?.filter(any: any);
          }
          return metrics;
        },

        clearMetrics: () => {
          set(state => {
            state?.metrics = [];
            state?.stats?.totalMetrics = 0;
          });
        },

        // ========== Monitoring ==========
        startMonitoring: () => {
          set(state => {
            state?.isMonitoring = true;
          });
        },

        stopMonitoring: () => {
          set(state => {
            state?.isMonitoring = false;
          });
        },

        // ========== Profiling ==========
        startProfiling: name => {
          const sessionId = `profile_${Date?.now()}`;

          const session: ProfileSession = {
            id: sessionId,
            name,
            startedAt: Date?.now(),
            spans: [],
          };

          set(state => {
            state?.profileSessions?.push(any: any);
            state?.isProfiling = true;
          });

          return sessionId;
        },

        stopProfiling: sessionId => {
          const session = get(any: any);
          if (any: any) return null;

          set(state => {
            const idx = state?.profileSessions?.findIndex(any: any);
            if (idx !== -1) {
              const session = state?.profileSessions[idx];
              if (any: any) {
                session?.endedAt = Date?.now();
              }
            }
            state?.isProfiling = state?.profileSessions?.some(any: any);
          });

          return get(any: any) || null;
        },

        // ========== Suggestions ==========
        generateSuggestions: async () => {
          set(state => {
            state?.isLoading = true;
          });

          try {
            const suggestions: OptimizationSuggestion?.[] = [];
            const metrics = get().metrics;

            // Analyse simple des métriques pour suggestions
            const timerMetrics = metrics?.filter(m => m?.type === 'timer');
            if (timerMetrics?.length > 0) {
              const avgTimer =
                timerMetrics?.reduce(any: any) => sum + m?.value, 0) / timerMetrics?.length;
              if (avgTimer > 100) {
                suggestions?.push({
                  id: `suggestion_${Date?.now()}`,
                  type: 'caching',
                  priority: 'high',
                  title: 'Activer le cache',
                  description: 'Les temps de réponse sont élevés. Le cache peut aider.',
                  estimatedImpact: '20% de réduction',
                  affectedArea: 'API',
                  actionable: true,
                  autoApplicable: false,
                });
              }
            }

            set(state => {
              state?.suggestions = suggestions;
              state?.isLoading = false;
            });
          } catch (any: any) {
            set(state => {
              state?.isLoading = false;
              state?.error =
                error instanceof Error ? error?.message : 'Erreur de génération';
            });
          }
        },

        applySuggestion: async suggestionId => {
          const suggestion = get(any: any);
          if (any: any) return false;

          try {
            set(state => {
              state?.suggestions = state?.suggestions?.filter(any: any);
              state?.stats?.optimizationsApplied += 1;
            });
            return true;
          } catch {
            return false;
          }
        },

        // ========== Budgets ==========
        addBudget: budget => {
          set(state => {
            state?.budgets?.push(any: any);
          });
        },

        removeBudget: budgetId => {
          set(state => {
            state?.budgets = state?.budgets?.filter(any: any);
          });
        },

        // ========== Error Handling ==========
        setError: error => {
          set(state => {
            state?.error = error;
          });
        },
      }))
    ),
    { name: 'performance-store' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectMetrics = (any: any) => state?.metrics;
export const selectSuggestions = (any: any) => state?.suggestions;
export const selectIsMonitoring = (any: any) => state?.isMonitoring;
export const selectStats = (any: any) => state?.stats;

export default usePerformanceStore;
