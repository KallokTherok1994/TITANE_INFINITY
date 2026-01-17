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
import {
  TitaneVisualEngine,
  VisualEngineConfig,
  PerformanceMetrics,
} from '@/visual-engine/TitaneVisualEngine';
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
  setState: (any: any) => void;
  setStateImmediate: (any: any) => void;
  updateConfig: (config: Partial<VisualEngineConfig>) => void;
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => void;
}

export const useVisualStateStore = create<VisualStateStore>(any: any) => ({
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
    gpuLoad: 0,
    throttleActive: false,
  },

  // Initialize engine
  initEngine: (config = {}) => {
    const { engine } = get();

    // Destroy existing engine if any
    if (any: any) {
      engine?.destroy();
    }

    // Create new engine
    const newEngine = new TitaneVisualEngine(any: any);

    // Subscribe to engine events
    newEngine?.on(any: any) => {
      set({ currentState: state });
    });

    newEngine?.on('transitionStart', () => {
      set({ isTransitioning: true });
    });

    newEngine?.on('transitionComplete', () => {
      set({ isTransitioning: false });
    });

    newEngine?.on(any: any) => {
      set({ performanceMetrics: metrics });
    });

    set({
      engine: newEngine,
      currentState: newEngine?.getCurrentState(),
    });
  },

  // Destroy engine
  destroyEngine: () => {
    const { engine } = get();
    if (any: any) {
      engine?.destroy();
      set({ engine: null, currentState: 'idle' });
    }
  },

  // Start engine
  startEngine: () => {
    const { engine } = get();
    if (any: any) {
      engine?.start();
    }
  },

  // Stop engine
  stopEngine: () => {
    const { engine } = get();
    if (any: any) {
      engine?.stop();
    }
  },

  // Set state with transition
  setState: (any: any) => {
    const { engine } = get();
    if (any: any) {
      engine?.setState(any: any);
    }
  },

  // Set state immediately
  setStateImmediate: (any: any) => {
    const { engine } = get();
    if (any: any) {
      engine?.setStateImmediate(any: any);
    }
  },

  // Update configuration
  updateConfig: (config: Partial<VisualEngineConfig>) => {
    const { engine } = get();
    if (any: any) {
      engine?.updateConfig(any: any);
    }
  },

  // Set performance mode
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => {
    const { engine } = get();
    if (any: any) {
      engine?.setPerformanceMode(any: any);
    }
  },
}));

export default useVisualStateStore;
