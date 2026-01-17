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
  metrics: Metric[];
  profileSessions: ProfileSession[];
  suggestions: OptimizationSuggestion[];
  budgets: PerformanceBudget[];

  // Status
  isInitialized: boolean;
  isMonitoring: boolean;
  isProfiling: boolean;
  isLoading: boolean;
  error: string | null;

  // Stats
  stats: PerformanceStats;
}

interface PerformanceEngineActions {
  // Initialization
  initialize: () => Promise<void>;
  reset: () => void;

  // Metrics
  recordMetric: (name: string, type: MetricType, value: number, unit: string) => void;
  getMetrics: (type: MetricType, since?: number) => Metric[];
  clearMetrics: () => void;

  // Monitoring
  startMonitoring: () => void;
  stopMonitoring: () => void;

  // Profiling
  startProfiling: (name: string) => string;
  stopProfiling: (sessionId: string) => ProfileSession | null;

  // Suggestions
  generateSuggestions: () => Promise<void>;
  applySuggestion: (suggestionId: string) => Promise<boolean>;

  // Budgets
  addBudget: (budget: PerformanceBudget) => void;
  removeBudget: (budgetId: string) => void;

  // Error handling
  setError: (error: string | null) => void;
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
      immer((set, get) => ({
        ...initialState,

        // ========== Initialization ==========
        initialize: async () => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            set(state => {
              state.isInitialized = true;
              state.isLoading = false;
            });
          } catch (error) {
            set(state => {
              state.isLoading = false;
              state.error =
                error instanceof Error ? error.message : "Erreur d'initialisation";
            });
          }
        },

        reset: () => {
          set(initialState);
        },

        // ========== Metrics ==========
        recordMetric: (name, type, value, unit) => {
          const metric: Metric = {
            id: `metric_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            name,
            type,
            value,
            unit,
            timestamp: Date.now(),
            tags: {},
          };

          set(state => {
            state.metrics.push(metric);
            state.stats.totalMetrics = state.metrics.length;
            // Garder uniquement les 1000 dernières métriques
            if (state.metrics.length > 1000) {
              state.metrics = state.metrics.slice(-1000);
            }
          });
        },

        getMetrics: (type, since) => {
          const metrics = get().metrics.filter(m => m.type === type);
          if (since) {
            return metrics.filter(m => m.timestamp >= since);
          }
          return metrics;
        },

        clearMetrics: () => {
          set(state => {
            state.metrics = [];
            state.stats.totalMetrics = 0;
          });
        },

        // ========== Monitoring ==========
        startMonitoring: () => {
          set(state => {
            state.isMonitoring = true;
          });
        },

        stopMonitoring: () => {
          set(state => {
            state.isMonitoring = false;
          });
        },

        // ========== Profiling ==========
        startProfiling: name => {
          const sessionId = `profile_${Date.now()}`;

          const session: ProfileSession = {
            id: sessionId,
            name,
            startedAt: Date.now(),
            spans: [],
          };

          set(state => {
            state.profileSessions.push(session);
            state.isProfiling = true;
          });

          return sessionId;
        },

        stopProfiling: sessionId => {
          const session = get().profileSessions.find(s => s.id === sessionId);
          if (!session) return null;

          set(state => {
            const idx = state.profileSessions.findIndex(s => s.id === sessionId);
            if (idx !== -1) {
              const session = state.profileSessions[idx];
              if (session) {
                session.endedAt = Date.now();
              }
            }
            state.isProfiling = state.profileSessions.some(s => !s.endedAt);
          });

          return get().profileSessions.find(s => s.id === sessionId) || null;
        },

        // ========== Suggestions ==========
        generateSuggestions: async () => {
          set(state => {
            state.isLoading = true;
          });

          try {
            const suggestions: OptimizationSuggestion[] = [];
            const metrics = get().metrics;

            // Analyse simple des métriques pour suggestions
            const timerMetrics = metrics.filter(m => m.type === 'timer');
            if (timerMetrics.length > 0) {
              const avgTimer =
                timerMetrics.reduce((sum, m) => sum + m.value, 0) / timerMetrics.length;
              if (avgTimer > 100) {
                suggestions.push({
                  id: `suggestion_${Date.now()}`,
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
              state.suggestions = suggestions;
              state.isLoading = false;
            });
          } catch (error) {
            set(state => {
              state.isLoading = false;
              state.error =
                error instanceof Error ? error.message : 'Erreur de génération';
            });
          }
        },

        applySuggestion: async suggestionId => {
          const suggestion = get().suggestions.find(s => s.id === suggestionId);
          if (!suggestion || !suggestion.actionable) return false;

          try {
            set(state => {
              state.suggestions = state.suggestions.filter(s => s.id !== suggestionId);
              state.stats.optimizationsApplied += 1;
            });
            return true;
          } catch {
            return false;
          }
        },

        // ========== Budgets ==========
        addBudget: budget => {
          set(state => {
            state.budgets.push(budget);
          });
        },

        removeBudget: budgetId => {
          set(state => {
            state.budgets = state.budgets.filter(b => b.id !== budgetId);
          });
        },

        // ========== Error Handling ==========
        setError: error => {
          set(state => {
            state.error = error;
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

export const selectMetrics = (state: PerformanceEngineStore) => state.metrics;
export const selectSuggestions = (state: PerformanceEngineStore) => state.suggestions;
export const selectIsMonitoring = (state: PerformanceEngineStore) => state.isMonitoring;
export const selectStats = (state: PerformanceEngineStore) => state.stats;

export default usePerformanceStore;
