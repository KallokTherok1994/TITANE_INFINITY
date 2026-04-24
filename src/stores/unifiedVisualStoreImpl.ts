/**
 * TITANE∞ v31.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v31.2.0 — Unified Visual Store Implementation
 * Consolidation complète des 3 stores visuels en une seule source de vérité
 *
 * Replaces:
 * - visualStore.ts (v21 orchestrated store)
 * - visualStateStore.ts (v19 engine wrapper)
 * - visualStateStoreV21.ts (multi-dimensional TitaneState)
 *
 * Architecture:
 * - Single canonical store with all functionality merged
 * - Selector layer for optimized component updates
 * - Backward compatible exports for gradual migration
 * - DevTools support for debugging
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { persist, devtools, subscribeWithSelector } from 'zustand/middleware';
import { createLogger } from '@/utils/logger';

const logger = createLogger('UnifiedVisualStore');

/**
 * Unified Visual Store State
 * Consolidates all visual state management concerns
 */
export interface UnifiedVisualState {
  // ─────────────────────────────────────────────────────────────────
  // CORE VISUAL STATE (from visualStore + visualStateStore)
  // ─────────────────────────────────────────────────────────────────
  
  // Current state and transitions
  currentState: string; // e.g. 'thinking', 'responding', 'idle'
  previousState: string | null;
  isTransitioning: boolean;
  transitionDuration: number; // ms

  // Engine lifecycle
  isRunning: boolean;
  isInitialized: boolean;
  isPaused: boolean;

  // Configuration
  enableOrchestration: boolean;
  enableOSIntegration: boolean;
  adaptiveFPS: boolean;
  debug: boolean;

  // ─────────────────────────────────────────────────────────────────
  // PERFORMANCE METRICS (from visualStore + visualStateStoreV21)
  // ─────────────────────────────────────────────────────────────────
  
  metrics: {
    fps: number;
    cpuLoad: number;
    gpuLoad: number;
    memoryUsage: number;
    throttleActive: boolean;
    frameTime: number;
    lastUpdate: number;
  };

  // ─────────────────────────────────────────────────────────────────
  // STATE HISTORY (from visualStore)
  // ─────────────────────────────────────────────────────────────────
  
  stateHistory: Array<{
    state: string;
    timestamp: number;
    duration: number;
  }>;

  // ─────────────────────────────────────────────────────────────────
  // TITANE STATE CONFIG (from visualStateStoreV21)
  // ─────────────────────────────────────────────────────────────────
  
  config: {
    [key: string]: any;
  };
}

/**
 * Unified Visual Store Actions
 * Single interface for all visual state mutations
 */
export interface UnifiedVisualActions {
  // State transitions
  setState: (state: string, duration?: number) => void;
  setStateImmediate: (state: string) => void;
  revertToPreviousState: () => void;

  // Engine control
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;

  // Metrics updates
  updateMetrics: (metrics: Partial<UnifiedVisualState['metrics']>) => void;
  setMetrics: (metrics: UnifiedVisualState['metrics']) => void;
  recordFrameTime: (frameTime: number) => void;

  // Configuration
  updateConfig: (config: Partial<UnifiedVisualState['config']>) => void;
  setEnableOrchestration: (enable: boolean) => void;
  setAdaptiveFPS: (enable: boolean) => void;
  setDebug: (enable: boolean) => void;

  // Reset and cleanup
  reset: () => void;
  clearHistory: () => void;

  // Logging and diagnostics
  getStateSnapshot: () => UnifiedVisualState;
  getPerformanceSummary: () => string;
}

/**
 * Full store type
 */
export type UnifiedVisualStore = UnifiedVisualState & UnifiedVisualActions;

/**
 * Initial state
 */
const initialState: UnifiedVisualState = {
  currentState: 'idle',
  previousState: null,
  isTransitioning: false,
  transitionDuration: 300,

  isRunning: false,
  isInitialized: false,
  isPaused: false,

  enableOrchestration: true,
  enableOSIntegration: true,
  adaptiveFPS: true,
  debug: false,

  metrics: {
    fps: 60,
    cpuLoad: 0,
    gpuLoad: 0,
    memoryUsage: 0,
    throttleActive: false,
    frameTime: 16.67,
    lastUpdate: Date.now(),
  },

  stateHistory: [],

  config: {},
};

/**
 * Create unified visual store with all functionality
 */
export const useUnifiedVisualStore = create<UnifiedVisualStore>()(
  persist(
    subscribeWithSelector(
      devtools(
        (set, get) => ({
          ...initialState,

          // ─────────────────────────────────────────────────────────────────
          // STATE TRANSITIONS
          // ─────────────────────────────────────────────────────────────────

          setState: (state: string, duration = 300) => {
            const { currentState, stateHistory } = get();
            if (currentState === state) return;

            set((prevState) => ({
              previousState: prevState.currentState,
              currentState: state,
              isTransitioning: true,
              transitionDuration: duration,
              stateHistory: [
                ...stateHistory.slice(-9), // Keep last 10
                {
                  state,
                  timestamp: Date.now(),
                  duration,
                },
              ],
            }));

            // Auto-complete transition
            setTimeout(() => {
              set({ isTransitioning: false });
            }, duration);
          },

          setStateImmediate: (state: string) => {
            const { stateHistory } = get();
            set((prevState) => ({
              previousState: prevState.currentState,
              currentState: state,
              isTransitioning: false,
              stateHistory: [
                ...stateHistory.slice(-9),
                {
                  state,
                  timestamp: Date.now(),
                  duration: 0,
                },
              ],
            }));
          },

          revertToPreviousState: () => {
            const { previousState, stateHistory } = get();
            if (previousState) {
              set((prevState) => ({
                currentState: previousState,
                previousState: prevState.currentState,
                stateHistory: [...stateHistory.slice(-9)],
              }));
            }
          },

          // ─────────────────────────────────────────────────────────────────
          // ENGINE CONTROL
          // ─────────────────────────────────────────────────────────────────

          start: () => {
            set({ isRunning: true, isInitialized: true });
            logger.info('Visual engine started');
          },

          stop: () => {
            set({ isRunning: false });
            logger.info('Visual engine stopped');
          },

          pause: () => {
            set({ isPaused: true, isRunning: false });
            logger.info('Visual engine paused');
          },

          resume: () => {
            set({ isPaused: false, isRunning: true });
            logger.info('Visual engine resumed');
          },

          // ─────────────────────────────────────────────────────────────────
          // METRICS
          // ─────────────────────────────────────────────────────────────────

          updateMetrics: (updates) => {
            set((prevState) => ({
              metrics: {
                ...prevState.metrics,
                ...updates,
                lastUpdate: Date.now(),
              },
            }));
          },

          setMetrics: (metrics) => {
            set({ metrics: { ...metrics, lastUpdate: Date.now() } });
          },

          recordFrameTime: (frameTime: number) => {
            set((prevState) => ({
              metrics: {
                ...prevState.metrics,
                frameTime,
                fps: 1000 / frameTime, // Calculate FPS from frame time
                lastUpdate: Date.now(),
              },
            }));
          },

          // ─────────────────────────────────────────────────────────────────
          // CONFIGURATION
          // ─────────────────────────────────────────────────────────────────

          updateConfig: (config) => {
            set((prevState) => ({
              config: {
                ...prevState.config,
                ...config,
              },
            }));
          },

          setEnableOrchestration: (enable) => {
            set({ enableOrchestration: enable });
          },

          setAdaptiveFPS: (enable) => {
            set({ adaptiveFPS: enable });
          },

          setDebug: (enable) => {
            set({ debug: enable });
          },

          // ─────────────────────────────────────────────────────────────────
          // RESET AND CLEANUP
          // ─────────────────────────────────────────────────────────────────

          reset: () => {
            set(initialState);
            logger.info('Visual store reset to initial state');
          },

          clearHistory: () => {
            set({ stateHistory: [] });
          },

          // ─────────────────────────────────────────────────────────────────
          // DIAGNOSTICS
          // ─────────────────────────────────────────────────────────────────

          getStateSnapshot: () => {
            return get() as UnifiedVisualState;
          },

          getPerformanceSummary: () => {
            const state = get();
            const { metrics } = state;
            return `
            Visual Engine Performance Summary:
            - FPS: ${metrics.fps.toFixed(1)}
            - Frame Time: ${metrics.frameTime.toFixed(2)}ms
            - CPU Load: ${(metrics.cpuLoad * 100).toFixed(1)}%
            - GPU Load: ${(metrics.gpuLoad * 100).toFixed(1)}%
            - Memory: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
            - Throttle Active: ${metrics.throttleActive}
            - Current State: ${state.currentState}
            - Engine Running: ${state.isRunning}
          `.trim();
          },
        }),
        { name: 'UnifiedVisualStore' }
      )
    ),
    {
      name: 'unified-visual-store',
      partialize: (state) => ({
        currentState: state.currentState,
        config: state.config,
        debug: state.debug,
        adaptiveFPS: state.adaptiveFPS,
      }),
    }
  )
);

// ─────────────────────────────────────────────────────────────────
// OPTIMIZED SELECTOR HOOKS
// ─────────────────────────────────────────────────────────────────

/**
 * Select only current state (minimal re-renders)
 */
export const useVisualCurrentState = () =>
  useUnifiedVisualStore((state) => state.currentState);

/**
 * Select only metrics (for performance monitoring)
 */
export const useVisualMetrics = () =>
  useUnifiedVisualStore((state) => state.metrics);

/**
 * Select only engine status
 */
export const useVisualEngineStatus = () =>
  useUnifiedVisualStore((state) => ({
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    isInitialized: state.isInitialized,
    isTransitioning: state.isTransitioning,
  }));

/**
 * Select only FPS
 */
export const useVisualFPS = () =>
  useUnifiedVisualStore((state) => state.metrics.fps);

/**
 * Select actions only
 */
export const useVisualActions = () =>
  useUnifiedVisualStore((state) => ({
    setState: state.setState,
    start: state.start,
    stop: state.stop,
    pause: state.pause,
    resume: state.resume,
    updateMetrics: state.updateMetrics,
    reset: state.reset,
  }));
