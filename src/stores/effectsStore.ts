/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - effectsStore (Zustand)
 * Store global pour gestion d'état des effets visuels
 *
 * Features:
 * - ✅ Active effects tracking
 * - ✅ Effects history
 * - ✅ Metrics aggregation
 * - ✅ User preferences
 * - ✅ SessionStorage persistence
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

  // Max active effects override (null = use orchestrator default)
  maxActiveOverride: number | null;

  // Cooldown multiplier (1 = default, 2 = double cooldown, etc.)
  cooldownMultiplier: number;
}

/**
 * Interface pour l'état global des effets
 */
export interface EffectsState {
  // Active effects (sync avec EffectsOrchestrator)
  activeEffects: ActiveEffect[];

  // Metrics (sync avec EffectsOrchestrator)
  metrics: EffectsMetrics;

  // History (100 derniers effets)
  history: EffectHistoryEntry[];

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
  syncActiveEffects: (effects: ActiveEffect[]) => void;
  syncMetrics: (metrics: EffectsMetrics) => void;

  // History Management
  addToHistory: (entry: EffectHistoryEntry) => void;
  clearHistory: () => void;
  getHistoryByType: (type: EffectType) => EffectHistoryEntry[];
  getRecentHistory: (count: number) => EffectHistoryEntry[];

  // Preferences
  setEffectsEnabled: (enabled: boolean) => void;
  setIntensity: (intensity: number) => void;
  setAutoAdapt: (enabled: boolean) => void;
  setMaxActiveOverride: (max: number | null) => void;
  setCooldownMultiplier: (multiplier: number) => void;
  toggleEffectType: (type: EffectType) => void;
  enableEffectType: (type: EffectType) => void;
  disableEffectType: (type: EffectType) => void;
  resetPreferences: () => void;

  // Stats
  updateStats: () => void;
  resetStats: () => void;

  // Helpers
  isEffectActive: (type: EffectType) => boolean;
  getActiveEffectsByType: (type: EffectType) => ActiveEffect[];
  getTotalActiveCount: () => number;
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
 *       <p>Actifs: {activeEffects.length}</p>
 *       <p>GPU Load: {metrics.gpuLoad.toFixed(2)}</p>
 *       <input
 *         type="range"
 *         value={preferences.intensity}
 *         onChange={(e) => setIntensity(parseFloat(e.target.value))}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export const useEffectsStore = create<EffectsStore>()(
  devtools(
    persist(
      (set, get) => ({
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
          sessionStartTime: Date.now(),
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
        // HISTORY MANAGEMENT
        // ═══════════════════════════════════════════════════════════

        addToHistory: entry => {
          set(state => {
            const newHistory = [...state.history, entry];

            // Garder seulement les 100 derniers
            if (newHistory.length > 100) {
              newHistory.shift();
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
          return get().history.filter(entry => entry.type === type);
        },

        getRecentHistory: count => {
          const { history } = get();
          return history.slice(-count);
        },

        // ═══════════════════════════════════════════════════════════
        // PREFERENCES
        // ═══════════════════════════════════════════════════════════

        setEffectsEnabled: enabled => {
          set(state => ({
            preferences: {
              ...state.preferences,
              effectsEnabled: enabled,
            },
          }));
        },

        setIntensity: intensity => {
          const clamped = Math.max(0, Math.min(1, intensity));
          set(state => ({
            preferences: {
              ...state.preferences,
              intensity: clamped,
            },
          }));
        },

        setAutoAdapt: enabled => {
          set(state => ({
            preferences: {
              ...state.preferences,
              autoAdapt: enabled,
            },
          }));
        },

        setMaxActiveOverride: max => {
          set(state => ({
            preferences: {
              ...state.preferences,
              maxActiveOverride: max,
            },
          }));
        },

        setCooldownMultiplier: multiplier => {
          const clamped = Math.max(0.1, Math.min(10, multiplier));
          set(state => ({
            preferences: {
              ...state.preferences,
              cooldownMultiplier: clamped,
            },
          }));
        },

        toggleEffectType: type => {
          set(state => {
            const newEnabled = new Set(state.preferences.enabledEffects);
            if (newEnabled.has(type)) {
              newEnabled.delete(type);
            } else {
              newEnabled.add(type);
            }

            return {
              preferences: {
                ...state.preferences,
                enabledEffects: newEnabled,
              },
            };
          });
        },

        enableEffectType: type => {
          set(state => {
            const newEnabled = new Set(state.preferences.enabledEffects);
            newEnabled.add(type);

            return {
              preferences: {
                ...state.preferences,
                enabledEffects: newEnabled,
              },
            };
          });
        },

        disableEffectType: type => {
          set(state => {
            const newEnabled = new Set(state.preferences.enabledEffects);
            newEnabled.delete(type);

            return {
              preferences: {
                ...state.preferences,
                enabledEffects: newEnabled,
              },
            };
          });
        },

        resetPreferences: () => {
          set({
            preferences: {
              ...defaultPreferences,
              enabledEffects: new Set(defaultPreferences.enabledEffects),
            },
          });
        },

        // ═══════════════════════════════════════════════════════════
        // STATS
        // ═══════════════════════════════════════════════════════════

        updateStats: () => {
          const { history, metrics } = get();

          if (history.length === 0) return;

          // Total triggered/blocked depuis historique
          const totalTriggered = history.filter(e => !e.wasBlocked).length;
          const totalBlocked = history.filter(e => e.wasBlocked).length;

          // Average duration (effets non-bloqués uniquement)
          const completedEffects = history.filter(e => !e.wasBlocked && e.duration > 0);
          const averageDuration =
            completedEffects.length > 0
              ? completedEffects.reduce((sum, e) => sum + e.duration, 0) /
                completedEffects.length
              : 0;

          // Most used effect
          const typeCounts = new Map<EffectType, number>();
          history.forEach(entry => {
            if (!entry.wasBlocked) {
              typeCounts.set(entry.type, (typeCounts.get(entry.type) || 0) + 1);
            }
          });

          let mostUsedEffect: EffectType | null = null;
          let maxCount = 0;
          typeCounts.forEach((count, type) => {
            if (count > maxCount) {
              maxCount = count;
              mostUsedEffect = type;
            }
          });

          set(state => ({
            stats: {
              ...state.stats,
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
              sessionStartTime: Date.now(),
            },
          });
        },

        // ═══════════════════════════════════════════════════════════
        // HELPERS
        // ═══════════════════════════════════════════════════════════

        isEffectActive: type => {
          return get().activeEffects.some(effect => effect.type === type);
        },

        getActiveEffectsByType: type => {
          return get().activeEffects.filter(effect => effect.type === type);
        },

        getTotalActiveCount: () => {
          return get().activeEffects.length;
        },
      }),
      {
        name: 'titane-effects-store',
        // Utiliser sessionStorage au lieu de localStorage
        storage: {
          getItem: name => {
            const str = sessionStorage.getItem(name);
            if (!str) return null;

            const data = JSON.parse(str);

            // Reconstituer Set depuis array
            if (data.state?.preferences?.enabledEffects) {
              data.state.preferences.enabledEffects = new Set(
                data.state.preferences.enabledEffects
              );
            }

            return data;
          },
          setItem: (name, value) => {
            const data = {
              ...value,
              state: {
                ...value.state,
                // Convertir Set en array pour JSON
                preferences: {
                  ...value.state.preferences,
                  enabledEffects: Array.from(value.state.preferences.enabledEffects),
                },
              },
            };
            sessionStorage.setItem(name, JSON.stringify(data));
          },
          removeItem: name => sessionStorage.removeItem(name),
        },
        // Ne persister que preferences et stats (pas activeEffects/metrics/history)
        partialize: state => ({
          ...state,
          activeEffects: [], // Reset active effects on reload
          history: [], // Reset history on reload
        }),
      }
    ),
    {
      name: 'TITANE∞ Effects Store',
      enabled: import.meta.env.DEV,
    }
  )
);

/**
 * Sélecteurs optimisés
 */
export const effectsSelectors = {
  // Active effects
  activeEffects: (state: EffectsStore) => state.activeEffects,

  // Metrics
  metrics: (state: EffectsStore) => state.metrics,

  // GPU load uniquement
  gpuLoad: (state: EffectsStore) => state.metrics.gpuLoad,

  // Active count
  activeCount: (state: EffectsStore) => state.activeEffects.length,

  // Preferences
  preferences: (state: EffectsStore) => state.preferences,

  // Effects enabled
  effectsEnabled: (state: EffectsStore) => state.preferences.effectsEnabled,

  // Intensity
  intensity: (state: EffectsStore) => state.preferences.intensity,

  // Stats
  stats: (state: EffectsStore) => state.stats,

  // History
  history: (state: EffectsStore) => state.history,

  // Recent history (10 derniers)
  recentHistory: (state: EffectsStore) => state.history.slice(-10),
};

/**
 * Hook helper pour les effets actifs
 */
export const useActiveEffects = () => useEffectsStore(effectsSelectors.activeEffects);

/**
 * Hook helper pour les métriques
 */
export const useEffectsMetrics = () => useEffectsStore(effectsSelectors.metrics);

/**
 * Hook helper pour les préférences
 */
export const useEffectsPreferences = () => useEffectsStore(effectsSelectors.preferences);

/**
 * Hook helper pour les stats
 */
export const useEffectsStats = () => useEffectsStore(effectsSelectors.stats);

/**
 * Hook helper pour vérifier si un effet est actif
 */
export const useIsEffectActive = (type: EffectType) =>
  useEffectsStore(state => state.isEffectActive(type));
