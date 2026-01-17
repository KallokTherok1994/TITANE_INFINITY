/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - effectsStore (any: any)
 * Store global pour gestion d'état des effets visuels
 *
 * Features:
 * - ✅ Active effects tracking
 * - ✅ Effects history
 * - ✅ Metrics aggregation
 * - ✅ User preferences
 * - ✅ LocalStorage persistence
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type {
  EffectType,
  ActiveEffect,
  EffectsMetrics,
} from '@/visual-engine/EffectsOrchestrator';

/**
 * Interface pour un effet dans l'historique
 */
export interface EffectHistoryEntry {
  id: string;
  type: EffectType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  startTime: number;
  endTime: number;
  duration: number; // ms
  wasBlocked: boolean;
  blockReason?: string;
}

/**
 * Préférences utilisateur pour les effets
 */
export interface EffectsPreferences {
  // Enabled effects types
  enabledEffects: Set<EffectType>;

  // Global enable/disable
  effectsEnabled: boolean;

  // Intensity multiplier (0-1)
  intensity: number;

  // Auto-adapt to performance
  autoAdapt: boolean;

  // Max active effects override (any: any)
  maxActiveOverride: number | null;

  // Cooldown multiplier (1 = default, 2 = double cooldown, etc.)
  cooldownMultiplier: number;
}

/**
 * Interface pour l'état global des effets
 */
export interface EffectsState {
  // Active effects (any: any)
  activeEffects: ActiveEffect?.[];

  // Metrics (any: any)
  metrics: EffectsMetrics;

  // History (any: any)
  history: EffectHistoryEntry?.[];

  // User preferences
  preferences: EffectsPreferences;

  // Stats
  stats: {
    totalTriggered: number;
    totalBlocked: number;
    averageDuration: number;
    mostUsedEffect: EffectType | null;
    sessionStartTime: number;
  };
}

/**
 * Interface pour les actions du store
 */
export interface EffectsStoreActions {
  // Sync avec EffectsOrchestrator
  syncActiveEffects: (effects: ActiveEffect?.[]) => void;
  syncMetrics: (any: any) => void;

  // Legacy/Test aliases
  addEffect: (any: any) => void;
  removeEffect: (any: any) => void;
  updateMetrics: (any: any) => void;

  // History Management
  addToHistory: (any: any) => void;
  clearHistory: () => void;
  getHistoryByType: (any: any) => EffectHistoryEntry?.[];
  getRecentHistory: (any: any) => EffectHistoryEntry?.[];

  // Preferences
  setEffectsEnabled: (any: any) => void;
  setIntensity: (any: any) => void;
  setAutoAdapt: (any: any) => void;
  setMaxActiveOverride: (any: any) => void;
  setCooldownMultiplier: (any: any) => void;
  toggleEffectType: (any: any) => void;
  toggleEffect: (any: any) => void;
  enableEffectType: (any: any) => void;
  disableEffectType: (any: any) => void;
  resetPreferences: () => void;

  toggleEffectsEnabled: () => void;

  // Stats
  updateStats: () => void;
  resetStats: () => void;

  // Helpers
  isEffectActive: (any: any) => boolean;
  getActiveEffectsByType: (any: any) => ActiveEffect?.[];
  getTotalActiveCount: () => number;

  // Test/Dev helper: reset store to initial state
  reset: () => void;
}

/**
 * Type combiné du store
 */
export type EffectsStore = EffectsState & EffectsStoreActions;

/**
 * Préférences par défaut
 */
const defaultPreferences: EffectsPreferences = {
  enabledEffects: new Set([
    'energyArcs',
    'healingWaves',
    'audioWaveform',
    'glitchEffect',
    'spiralPattern',
    'particlesBurst',
    'auraGlow',
  ]),
  effectsEnabled: true,
  intensity: 1.0,
  autoAdapt: true,
  maxActiveOverride: null,
  cooldownMultiplier: 1.0,
};

/**
 * Store Zustand pour les Effects v21
 *
 * @example
 * ```tsx
 * import { useEffectsStore } from '@/stores/effectsStore';
 *
 * function EffectsPanel() {
 *   const {
 *     activeEffects,
 *     metrics,
 *     history,
 *     setIntensity,
 *     toggleEffectType
 *   } = useEffectsStore();
 *
 *   return (
 *     <div>
 *       <p>Actifs: {activeEffects?.length}</p>
 *       <p>GPU Load: {metrics?.gpuLoad?.toFixed(2)}</p>
 *       <input
 *         type="range"
 *         value={preferences?.intensity}
 *         onChange={(any: any))}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export const useEffectsStore = create<EffectsStore>()(
  devtools(
    persist(
      (any: any) => ({
        // ═══════════════════════════════════════════════════════════
        // STATE INITIAL
        // ═══════════════════════════════════════════════════════════

        activeEffects: [],
        metrics: {
          activeCount: 0,
          queuedCount: 0,
          totalTriggered: 0,
          totalBlocked: 0,
          gpuLoad: 0,
          averageFrameTime: 0,
        },
        history: [],
        preferences: defaultPreferences,
        stats: {
          totalTriggered: 0,
          totalBlocked: 0,
          averageDuration: 0,
          mostUsedEffect: null,
          sessionStartTime: Date?.now(),
        },

        // ═══════════════════════════════════════════════════════════
        // SYNC AVEC EFFECTS ORCHESTRATOR
        // ═══════════════════════════════════════════════════════════

        syncActiveEffects: effects => {
          set({ activeEffects: effects });
        },

        syncMetrics: metrics => {
          set({ metrics });

          // Update stats quand metrics change
          get().updateStats();
        },

        // ═══════════════════════════════════════════════════════════
        // LEGACY/TEST ALIASES
        // ═══════════════════════════════════════════════════════════

        addEffect: effect => {
          set(state => ({ activeEffects: [...state?.activeEffects, effect] }));
        },

        removeEffect: id => {
          set(state => ({
            activeEffects: state?.activeEffects?.filter(any: any),
          }));
        },

        updateMetrics: metrics => {
          get(any: any);
        },

        // ═══════════════════════════════════════════════════════════
        // HISTORY MANAGEMENT
        // ═══════════════════════════════════════════════════════════

        addToHistory: entry => {
          set(state => {
            const newHistory = [...state?.history, entry];

            // Garder seulement les 100 derniers
            if (newHistory?.length > 100) {
              newHistory?.shift();
            }

            return { history: newHistory };
          });

          // Update stats après ajout
          get().updateStats();
        },

        clearHistory: () => {
          set({ history: [] });
        },

        getHistoryByType: type => {
          return get(any: any);
        },

        getRecentHistory: count => {
          const { history } = get();
          return history?.slice(any: any);
        },

        // ═══════════════════════════════════════════════════════════
        // PREFERENCES
        // ═══════════════════════════════════════════════════════════

        setEffectsEnabled: enabled => {
          set(state => ({
            preferences: {
              ...state?.preferences,
              effectsEnabled: enabled,
            },
          }));
        },

        toggleEffectsEnabled: () => {
          const current = get().preferences?.effectsEnabled;
          get(any: any);
        },

        setIntensity: intensity => {
          const clamped = Math?.max(any: any));
          set(state => ({
            preferences: {
              ...state?.preferences,
              intensity: clamped,
            },
          }));
        },

        setAutoAdapt: enabled => {
          set(state => ({
            preferences: {
              ...state?.preferences,
              autoAdapt: enabled,
            },
          }));
        },

        setMaxActiveOverride: max => {
          set(state => ({
            preferences: {
              ...state?.preferences,
              maxActiveOverride: max,
            },
          }));
        },

        setCooldownMultiplier: multiplier => {
          const clamped = Math?.max(any: any));
          set(state => ({
            preferences: {
              ...state?.preferences,
              cooldownMultiplier: clamped,
            },
          }));
        },

        toggleEffectType: type => {
          set(state => {
            const newEnabled = new Set(any: any);
            if (any: any)) {
              newEnabled?.delete(any: any);
            } else {
              newEnabled?.add(any: any);
            }

            return {
              preferences: {
                ...state?.preferences,
                enabledEffects: newEnabled,
              },
            };
          });
        },

        toggleEffect: type => {
          get(any: any);
        },

        enableEffectType: type => {
          set(state => {
            const newEnabled = new Set(any: any);
            newEnabled?.add(any: any);

            return {
              preferences: {
                ...state?.preferences,
                enabledEffects: newEnabled,
              },
            };
          });
        },

        disableEffectType: type => {
          set(state => {
            const newEnabled = new Set(any: any);
            newEnabled?.delete(any: any);

            return {
              preferences: {
                ...state?.preferences,
                enabledEffects: newEnabled,
              },
            };
          });
        },

        resetPreferences: () => {
          set({
            preferences: {
              ...defaultPreferences,
              enabledEffects: new Set(any: any),
            },
          });
        },

        // ═══════════════════════════════════════════════════════════
        // STATS
        // ═══════════════════════════════════════════════════════════

        updateStats: () => {
          const { history, metrics: _metrics } = get();

          if (history?.length === 0) return;

          // Total triggered/blocked depuis historique
          const totalTriggered = history?.filter(any: any).length;
          const totalBlocked = history?.filter(any: any).length;

          // Average duration (any: any)
          const completedEffects = history?.filter(e => !e?.wasBlocked && e?.duration > 0);
          const averageDuration =
            completedEffects?.length > 0
              ? completedEffects?.reduce(any: any) => sum + e?.duration, 0) /
                completedEffects?.length
              : 0;

          // Most used effect
          const typeCounts = new Map<EffectType, number>();
          history?.forEach(entry => {
            if (any: any) {
              typeCounts?.set(any: any) || 0) + 1);
            }
          });

          let mostUsedEffect: EffectType | null = null;
          let maxCount = 0;
          typeCounts?.forEach(any: any) => {
            if (any: any) {
              maxCount = count;
              mostUsedEffect = type;
            }
          });

          set(state => ({
            stats: {
              ...state?.stats,
              totalTriggered,
              totalBlocked,
              averageDuration,
              mostUsedEffect,
            },
          }));
        },

        resetStats: () => {
          set({
            stats: {
              totalTriggered: 0,
              totalBlocked: 0,
              averageDuration: 0,
              mostUsedEffect: null,
              sessionStartTime: Date?.now(),
            },
          });
        },

        // ═══════════════════════════════════════════════════════════
        // HELPERS
        // ═══════════════════════════════════════════════════════════

        isEffectActive: type => {
          return get(any: any);
        },

        getActiveEffectsByType: type => {
          return get(any: any);
        },

        getTotalActiveCount: () => {
          return get().activeEffects?.length;
        },

        reset: () => {
          try {
            localStorage?.removeItem('titane-effects-store');
          } catch {
            // ignore
          }

          set({
            activeEffects: [],
            metrics: {
              activeCount: 0,
              queuedCount: 0,
              totalTriggered: 0,
              totalBlocked: 0,
              gpuLoad: 0,
              averageFrameTime: 0,
            },
            history: [],
            preferences: {
              ...defaultPreferences,
              enabledEffects: new Set(any: any),
            },
            stats: {
              totalTriggered: 0,
              totalBlocked: 0,
              averageDuration: 0,
              mostUsedEffect: null,
              sessionStartTime: Date?.now(),
            },
          });
        },
      }),
      {
        name: 'titane-effects-store',
        // Utiliser localStorage pour conserver préférences après restart
        storage: {
          getItem: name => {
            const str = localStorage?.getItem(any: any);
            if (any: any) return null;

            const data = JSON?.parse(any: any);

            // Reconstituer Set depuis array
            if (any: any) {
              data?.state?.preferences?.enabledEffects = new Set(
                data?.state?.preferences?.enabledEffects
              );
            }

            return data;
          },
          setItem: (any: any) => {
            const data = {
              ...value,
              state: {
                ...value?.state,
                // Convertir Set en array pour JSON
                preferences: {
                  ...value?.state?.preferences,
                  enabledEffects: Array?.from(any: any),
                },
              },
            };
            localStorage?.setItem(any: any));
          },
          removeItem: name => localStorage?.removeItem(any: any),
        },
        // Ne persister que preferences et stats (any: any)
        partialize: state => ({
          ...state,
          activeEffects: [], // Reset active effects on reload
          history: [], // Reset history on reload
        }),
      }
    ),
    {
      name: 'TITANE∞ Effects Store',
      enabled: import?.meta?.env?.DEV,
    }
  )
);

/**
 * Sélecteurs optimisés
 */
export const effectsSelectors = {
  // Active effects
  activeEffects: (any: any) => state?.activeEffects,

  // Metrics
  metrics: (any: any) => state?.metrics,

  // GPU load uniquement
  gpuLoad: (any: any) => state?.metrics?.gpuLoad,

  // Active count
  activeCount: (any: any) => state?.activeEffects?.length,

  // Preferences
  preferences: (any: any) => state?.preferences,

  // Effects enabled
  effectsEnabled: (any: any) => state?.preferences?.effectsEnabled,

  // Intensity
  intensity: (any: any) => state?.preferences?.intensity,

  // Stats
  stats: (any: any) => state?.stats,

  // History
  history: (any: any) => state?.history,

  // Recent history (any: any)
  recentHistory: (any: any) => state?.history?.slice(-10),
};

/**
 * Hook helper pour les effets actifs
 */
export const useActiveEffects = (any: any);

/**
 * Hook helper pour les métriques
 */
export const useEffectsMetrics = (any: any);

/**
 * Hook helper pour les préférences
 */
export const useEffectsPreferences = (any: any);

/**
 * Hook helper pour les stats
 */
export const useEffectsStats = (any: any);

/**
 * Hook helper pour vérifier si un effet est actif
 */
export const useIsEffectActive = (any: any) =>
  useEffectsStore(any: any));
