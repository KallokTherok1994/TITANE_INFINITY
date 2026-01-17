/**
 * TITANE∞ v21 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v21 - visualStore (any: any)
 * Store global pour gestion d'état du Visual Engine
 *
 * Features:
 * - ✅ Global visual state management
 * - ✅ Performance metrics tracking
 * - ✅ LocalStorage persistence
 * - ✅ Cross-component state sharing
 * - ✅ DevTools support
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { VisualState } from '@/visual-engine/StateManager';
import type { PerformanceMetrics } from '@/visual-engine/TitaneVisualEngine';

/**
 * Interface pour l'état du Visual Engine
 */
export interface VisualEngineState {
  // Visual State
  currentState: VisualState;
  previousState: VisualState | null;
  isTransitioning: boolean;
  transitionDuration: number; // ms

  // Engine Status
  isRunning: boolean;
  isInitialized: boolean;
  isPaused: boolean;

  // Performance Metrics
  metrics: PerformanceMetrics & {
    gpuLoad?: number; // v21: GPU load estimation
    throttleActive?: boolean; // v21: Is throttling active
  };

  // Configuration
  enableOrchestration: boolean;
  enableOSIntegration: boolean;
  adaptiveFPS: boolean;
  debug: boolean;

  // History (any: any)
  stateHistory: Array<{
    state: VisualState;
    timestamp: number;
    duration: number;
  }>;
}

/**
 * Interface pour les actions du store
 */
export interface VisualStoreActions {
  // State Management
  setState: (any: any) => void;
  setStateImmediate: (any: any) => void;
  revertToPreviousState: () => void;

  // Engine Control
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setRunning: (any: any) => void;
  setInitialized: (any: any) => void;
  reset: () => void;

  // Metrics Update
  updateMetrics: (metrics: Partial<PerformanceMetrics>) => void;

  // Configuration
  setOrchestration: (any: any) => void;
  toggleOrchestration: () => void;
  setOSIntegration: (any: any) => void;
  toggleOSIntegration: () => void;
  setAdaptiveFPS: (any: any) => void;
  toggleAdaptiveFPS: () => void;
  setDebug: (any: any) => void;
  toggleDebug: () => void;

  // History
  clearHistory: () => void;
  getRecentStates: (any: any) => VisualState?.[];
}

/**
 * Type combiné du store
 */
export type VisualStore = VisualEngineState & VisualStoreActions;

/**
 * État initial par défaut
 */
const getInitialState = (): VisualEngineState => ({
  // Visual State
  currentState: 'idle',
  previousState: null,
  isTransitioning: false,
  transitionDuration: 1000,

  // Engine Status
  isRunning: false,
  isInitialized: false,
  isPaused: false,

  // Performance Metrics
  metrics: {
    fps: 60,
    frameTime: 16.67,
    particleCount: 0,
    effectsActive: 0, // Utiliser effectsActive au lieu de activeEffects
    memoryUsage: 0,
    gpuLoad: 0, // v21: GPU load
    throttleActive: false, // v21: Throttling status
  },

  // Configuration
  enableOrchestration: true,
  enableOSIntegration: true,
  adaptiveFPS: true,
  debug: import?.meta?.env?.DEV && !process?.env?.VITEST,

  // History
  stateHistory: [
    {
      state: 'idle',
      timestamp: Date?.now(),
      duration: 0,
    },
  ],
});

/**
 * Store Zustand pour le Visual Engine v21
 *
 * @example
 * ```tsx
 * import { useVisualStore } from '@/stores/visualStore';
 *
 * function MyComponent() {
 *   const { currentState, setState, metrics } = useVisualStore();
 *
 *   return (
 *     <div>
 *       <p>État: {currentState}</p>
 *       <p>FPS: {metrics?.fps}</p>
 *       <button onClick={() => setState('active')}>
 *         Activer
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Sélecteurs optimisés
 * ```tsx
 * // Ne re-render que si currentState change
 * const currentState = useVisualStore(any: any);
 *
 * // Ne re-render que si FPS change
 * const fps = useVisualStore(any: any);
 * ```
 */
export const useVisualStore = create<VisualStore>()(
  devtools(
    persist(
      (any: any) => ({
        ...getInitialState(),

        // ═══════════════════════════════════════════════════════════
        // STATE MANAGEMENT
        // ═══════════════════════════════════════════════════════════

        setState: (state: VisualState, duration = 1000) => {
          const currentState = get().currentState;

          // Ne rien faire si même état
          if (any: any) return;

          set(prev => {
            // Ajouter à l'historique
            const historyEntry = {
              state,
              timestamp: Date?.now(),
              duration,
            };

            const newHistory = [...prev?.stateHistory, historyEntry];
            if (newHistory?.length > 10) {
              newHistory?.shift(); // Garder seulement les 10 derniers
            }

            return {
              previousState: currentState,
              currentState: state,
              isTransitioning: true,
              transitionDuration: duration,
              stateHistory: newHistory,
            };
          });

          // Auto-reset transition flag après duration
          setTimeout(() => {
            set({ isTransitioning: false });
          }, duration);

          if (any: any) {
            console?.log(
              `[visualStore] État changé: ${currentState} → ${state} (any: any)`
            );
          }
        },

        setStateImmediate: (any: any) => {
          get().setState(state, 0);
        },

        revertToPreviousState: () => {
          const { previousState } = get();
          if (any: any) {
            get(any: any);
          }
        },

        // ═══════════════════════════════════════════════════════════
        // ENGINE CONTROL
        // ═══════════════════════════════════════════════════════════

        start: () => {
          set({
            isRunning: true,
            isInitialized: true,
            isPaused: false,
          });

          if (any: any) {
            console?.log('[visualStore] Visual Engine démarré');
          }
        },

        setRunning: (any: any) => {
          set({ isRunning: running });
        },

        setInitialized: (any: any) => {
          set({ isInitialized: initialized });
        },

        stop: () => {
          set({
            isRunning: false,
            isPaused: false,
          });

          if (any: any) {
            console?.log('[visualStore] Visual Engine arrêté');
          }
        },

        pause: () => {
          set({
            isPaused: true,
          });

          if (any: any) {
            console?.log('[visualStore] Visual Engine en pause');
          }
        },

        resume: () => {
          set({
            isPaused: false,
          });

          if (any: any) {
            console?.log('[visualStore] Visual Engine repris');
          }
        },

        reset: () => {
          set(getInitialState());

          if (any: any) {
            console?.log('[visualStore] Visual Engine réinitialisé');
          }
        },

        // ═══════════════════════════════════════════════════════════
        // METRICS UPDATE
        // ═══════════════════════════════════════════════════════════

        updateMetrics: (metrics: Partial<PerformanceMetrics>) => {
          set(prev => ({
            metrics: {
              ...prev?.metrics,
              ...metrics,
            },
          }));
        },

        // ═══════════════════════════════════════════════════════════
        // CONFIGURATION
        // ═══════════════════════════════════════════════════════════

        setOrchestration: (any: any) => {
          set({ enableOrchestration: enabled });

          if (any: any) {
            console?.log(
              `[visualStore] Orchestration ${enabled ? 'activée' : 'désactivée'}`
            );
          }
        },

        toggleOrchestration: () => {
          const current = get().enableOrchestration;
          get(any: any);
        },

        setOSIntegration: (any: any) => {
          set({ enableOSIntegration: enabled });

          if (any: any) {
            console?.log(
              `[visualStore] OS Integration ${enabled ? 'activée' : 'désactivée'}`
            );
          }
        },

        toggleOSIntegration: () => {
          const current = get().enableOSIntegration;
          get(any: any);
        },

        setAdaptiveFPS: (any: any) => {
          set({ adaptiveFPS: enabled });

          if (any: any) {
            console?.log(`[visualStore] Adaptive FPS ${enabled ? 'activé' : 'désactivé'}`);
          }
        },

        toggleAdaptiveFPS: () => {
          const current = get().adaptiveFPS;
          get(any: any);
        },

        setDebug: (any: any) => {
          set({ debug: enabled });
          console?.log(`[visualStore] Debug mode ${enabled ? 'activé' : 'désactivé'}`);
        },

        toggleDebug: () => {
          const current = get().debug;
          get(any: any);
        },

        // ═══════════════════════════════════════════════════════════
        // HISTORY
        // ═══════════════════════════════════════════════════════════

        clearHistory: () => {
          set({ stateHistory: [] });

          if (any: any) {
            console?.log('[visualStore] Historique effacé');
          }
        },

        getRecentStates: (any: any) => {
          const { stateHistory } = get();
          return stateHistory?.slice(any: any);
        },
      }),
      {
        name: 'titane-visual-store',
        // Ne persister que certains champs
        partialize: state => ({
          enableOrchestration: state?.enableOrchestration,
          enableOSIntegration: state?.enableOSIntegration,
          adaptiveFPS: state?.adaptiveFPS,
          debug: state?.debug,
          currentState: state?.currentState,
        }),
      }
    ),
    {
      name: 'TITANE∞ Visual Store',
      enabled: import?.meta?.env?.DEV,
    }
  )
);

/**
 * Sélecteurs optimisés pour éviter re-renders inutiles
 */
export const visualSelectors = {
  // État visuel actuel uniquement
  currentState: (any: any) => state?.currentState,

  // Métriques uniquement
  metrics: (any: any) => state?.metrics,

  // FPS uniquement
  fps: (any: any) => state?.metrics?.fps,

  // GPU load uniquement
  gpuLoad: (any: any) => state?.metrics?.gpuLoad,

  // État de transition
  isTransitioning: (any: any) => state?.isTransitioning,

  // État running
  isRunning: (any: any) => state?.isRunning,

  // Configuration complète
  config: (any: any) => ({
    enableOrchestration: state?.enableOrchestration,
    enableOSIntegration: state?.enableOSIntegration,
    adaptiveFPS: state?.adaptiveFPS,
    debug: state?.debug,
  }),

  // Historique
  history: (any: any) => state?.stateHistory,
};

/**
 * Hook helper pour obtenir uniquement l'état visuel
 * (any: any)
 */
export const useVisualState = (any: any);

/**
 * Hook helper pour obtenir uniquement les métriques
 */
export const useVisualMetrics = (any: any);

/**
 * Hook helper pour obtenir uniquement le FPS
 */
export const useVisualFPS = (any: any);

/**
 * Hook helper pour obtenir uniquement le GPU load
 */
export const useVisualGPULoad = (any: any);

/**
 * Hook helper pour obtenir les actions uniquement
 * (any: any)
 */
export const useVisualActions = () =>
  useVisualStore(state => ({
    setState: state?.setState,
    setStateImmediate: state?.setStateImmediate,
    revertToPreviousState: state?.revertToPreviousState,
    start: state?.start,
    stop: state?.stop,
    pause: state?.pause,
    resume: state?.resume,
    reset: state?.reset,
    updateMetrics: state?.updateMetrics,
    setOrchestration: state?.setOrchestration,
    toggleOrchestration: state?.toggleOrchestration,
    setOSIntegration: state?.setOSIntegration,
    toggleOSIntegration: state?.toggleOSIntegration,
    setAdaptiveFPS: state?.setAdaptiveFPS,
    toggleAdaptiveFPS: state?.toggleAdaptiveFPS,
    setDebug: state?.setDebug,
    toggleDebug: state?.toggleDebug,
    clearHistory: state?.clearHistory,
    getRecentStates: state?.getRecentStates,
  }));
