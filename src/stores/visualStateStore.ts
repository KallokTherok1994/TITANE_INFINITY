/**
 * TITANE_INFINITY v19.3.0 — Visual State Store
 * Zustand store for global visual engine state management
 *
 * Features:
 * - Singleton TitaneVisualEngine instance
 * - Global visual state access
 * - Performance metrics tracking
 * - Configuration management
 */

import { create } from 'zustand';
import { TitaneVisualEngine, VisualEngineConfig, PerformanceMetrics } from '@/visual-engine/TitaneVisualEngine';
import type { VisualState } from '@/design-system/visual-states';

interface VisualStateStore {
  // Engine instance
  engine: TitaneVisualEngine | null;

  // State
  currentState: VisualState;
  isTransitioning: boolean;

  // Performance
  performanceMetrics: PerformanceMetrics;

  // Actions
  initEngine: (config?: Partial<VisualEngineConfig>) => void;
  destroyEngine: () => void;
  startEngine: () => void;
  stopEngine: () => void;
  setState: (state: VisualState, duration?: number) => void;
  setStateImmediate: (state: VisualState) => void;
  updateConfig: (config: Partial<VisualEngineConfig>) => void;
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => void;
}

export const useVisualStateStore = create<VisualStateStore>((set, get) => ({
  // Initial state
  engine: null,
  currentState: 'idle',
  isTransitioning: false,
  performanceMetrics: {
    fps: 60,
    frameTime: 16.67,
    particleCount: 0,
    effectsActive: 0,
    memoryUsage: 0,
  },

  // Initialize engine
  initEngine: (config = {}) => {
    const { engine } = get();

    // Destroy existing engine if any
    if (engine) {
      engine.destroy();
    }

    // Create new engine
    const newEngine = new TitaneVisualEngine(config);

    // Subscribe to engine events
    newEngine.on('visualStateChange', (state: VisualState) => {
      set({ currentState: state });
    });

    newEngine.on('transitionStart', () => {
      set({ isTransitioning: true });
    });

    newEngine.on('transitionComplete', () => {
      set({ isTransitioning: false });
    });

    newEngine.on('performanceUpdate', (metrics: PerformanceMetrics) => {
      set({ performanceMetrics: metrics });
    });

    set({
      engine: newEngine,
      currentState: newEngine.getCurrentState(),
    });
  },

  // Destroy engine
  destroyEngine: () => {
    const { engine } = get();
    if (engine) {
      engine.destroy();
      set({ engine: null, currentState: 'idle' });
    }
  },

  // Start engine
  startEngine: () => {
    const { engine } = get();
    if (engine) {
      engine.start();
    }
  },

  // Stop engine
  stopEngine: () => {
    const { engine } = get();
    if (engine) {
      engine.stop();
    }
  },

  // Set state with transition
  setState: (state: VisualState, duration?: number) => {
    const { engine } = get();
    if (engine) {
      engine.setState(state, duration);
    }
  },

  // Set state immediately
  setStateImmediate: (state: VisualState) => {
    const { engine } = get();
    if (engine) {
      engine.setStateImmediate(state);
    }
  },

  // Update configuration
  updateConfig: (config: Partial<VisualEngineConfig>) => {
    const { engine } = get();
    if (engine) {
      engine.updateConfig(config);
    }
  },

  // Set performance mode
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => {
    const { engine } = get();
    if (engine) {
      engine.setPerformanceMode(mode);
    }
  },
}));

export default useVisualStateStore;
