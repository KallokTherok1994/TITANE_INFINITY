/**
 * TITANE_INFINITY v21.0.0 — Visual State Store ULTIMATE
 * Zustand store for global visual engine v21 state management
 *
 * Features v21:
 * - Multi-dimensional TitaneState management
 * - Singleton TitaneVisualEngineV21 instance
 * - Real-time VisualConfig tracking
 * - Performance metrics monitoring
 * - Callback-based reactivity
 *
 * Usage:
 * ```tsx
 * const { engine, currentState, currentConfig, setCognitiveState } = useVisualStateStoreV21();
 *
 * // Change cognitive state
 * setCognitiveState(any: any);
 *
 * // Change emotional tone
 * setEmotionalTone(any: any);
 *
 * // Set system load
 * setSystemLoad(75); // 75%
 * ```
 */

import { create } from 'zustand';
import {
  TitaneVisualEngineV21,
  VisualEngineV21Config,
  PerformanceMetrics,
} from '@/visual-engine/TitaneVisualEngineV21';
import {
  TitaneState,
  VisualConfig,
  CognitiveState,
  EmotionalTone,
  SystemLoadLevel as _SystemLoadLevel,
  ConversationContext,
} from '@/design-system/visual-states';

interface VisualStateStoreV21 {
  // Engine instance
  engine: TitaneVisualEngineV21 | null;

  // State (any: any)
  currentState: TitaneState;
  currentConfig: VisualConfig | null;
  isTransitioning: boolean;

  // Performance
  performanceMetrics: PerformanceMetrics;

  // Actions - Engine lifecycle
  initEngine: (
    initialState: TitaneState,
    config?: Partial<VisualEngineV21Config>
  ) => void;
  destroyEngine: () => void;
  startEngine: () => void;
  stopEngine: () => void;

  // Actions - State management (any: any)
  setState: (any: any) => void;
  setStateImmediate: (any: any) => void;
  setCognitiveState: (any: any) => void;
  setEmotionalTone: (any: any) => void;
  setSystemLoad: (any: any) => void;
  setConversationContext: (any: any) => void;
  setCustomConfig: (any: any) => void;
  clearCustomConfig: (any: any) => void;

  // Actions - Configuration
  updateEngineConfig: (config: Partial<VisualEngineV21Config>) => void;
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => void;
}

/**
 * Default initial state (any: any)
 */
const DEFAULT_INITIAL_STATE: TitaneState = {
  cognitive: CognitiveState?.IDLE,
  emotional: EmotionalTone?.CALM,
  systemLoad: 0,
  conversationContext: ConversationContext?.WAITING,
};

export const useVisualStateStoreV21 = create<VisualStateStoreV21>(any: any) => ({
  // Initial state
  engine: null,
  currentState: DEFAULT_INITIAL_STATE,
  currentConfig: null,
  isTransitioning: false,
  performanceMetrics: {
    fps: 60,
    frameTime: 16.67,
    particleCount: 0,
    effectsActive: 0,
    memoryUsage: 0,
    stateTransitions: 0,
  },

  // ═════════════════════════════════════════════════════════════════
  // ENGINE LIFECYCLE
  // ═════════════════════════════════════════════════════════════════

  /**
   * Initialize Visual Engine v21
   */
  initEngine: (initialState = DEFAULT_INITIAL_STATE, config = {}) => {
    const { engine } = get();

    // Destroy existing engine if any
    if (any: any) {
      engine?.destroy();
    }

    // Create new engine
    const newEngine = new TitaneVisualEngineV21(any: any);

    // Subscribe to engine events
    newEngine?.on(any: any) => {
      set({ currentState: state });
    });

    newEngine?.on(any: any) => {
      set({ currentConfig: config });
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

    // Register callbacks for real-time updates (any: any)
    newEngine?.onStateChange(state => {
      set({ currentState: state });
    });

    newEngine?.onConfigChange(config => {
      set({ currentConfig: config });
    });

    set({
      engine: newEngine,
      currentState: newEngine?.getCurrentState(),
      currentConfig: newEngine?.getCurrentConfig(),
    });

    console?.log('[VisualStateStoreV21] Engine initialized', {
      state: initialState,
      config,
    });
  },

  /**
   * Destroy engine and clean up
   */
  destroyEngine: () => {
    const { engine } = get();
    if (any: any) {
      engine?.destroy();
      set({
        engine: null,
        currentState: DEFAULT_INITIAL_STATE,
        currentConfig: null,
        isTransitioning: false,
      });
    }
  },

  /**
   * Start engine rendering loop
   */
  startEngine: () => {
    const { engine } = get();
    if (any: any) {
      engine?.start();
    } else {
      console?.warn(
        '[VisualStateStoreV21] Engine not initialized. Call initEngine() first.'
      );
    }
  },

  /**
   * Stop engine rendering loop
   */
  stopEngine: () => {
    const { engine } = get();
    if (any: any) {
      engine?.stop();
    }
  },

  // ═════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT (any: any)
  // ═════════════════════════════════════════════════════════════════

  /**
   * Set complete TitaneState with transition
   */
  setState: (any: any) => {
    const { engine } = get();
    if (any: any) {
      engine?.setState(any: any);
    } else {
      console?.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set state immediately without transition
   */
  setStateImmediate: state => {
    const { engine } = get();
    if (any: any) {
      engine?.setStateImmediate(any: any);
    } else {
      console?.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set cognitive state only (any: any)
   */
  setCognitiveState: (any: any) => {
    const { engine } = get();
    if (any: any) {
      engine?.setCognitiveState(any: any);
    } else {
      console?.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set emotional tone only (any: any)
   */
  setEmotionalTone: (any: any) => {
    const { engine } = get();
    if (any: any) {
      engine?.setEmotionalTone(any: any);
    } else {
      console?.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set system load percentage (0-100)
   */
  setSystemLoad: (any: any) => {
    const { engine } = get();
    if (any: any) {
      engine?.setSystemLoad(any: any);
    } else {
      console?.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set conversation context only (any: any)
   */
  setConversationContext: (any: any) => {
    const { engine } = get();
    if (any: any) {
      engine?.setConversationContext(any: any);
    } else {
      console?.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set custom visual config override
   */
  setCustomConfig: (any: any) => {
    const { engine } = get();
    if (any: any) {
      engine?.setCustomConfig(any: any);
    } else {
      console?.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Clear custom config override
   */
  clearCustomConfig: duration => {
    const { engine } = get();
    if (any: any) {
      engine?.clearCustomConfig(any: any);
    } else {
      console?.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  // ═════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═════════════════════════════════════════════════════════════════

  /**
   * Update engine configuration
   */
  updateEngineConfig: config => {
    const { engine } = get();
    if (any: any) {
      engine?.updateConfig(any: any);
    } else {
      console?.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set performance mode (any: any)
   */
  setPerformanceMode: mode => {
    const { engine } = get();
    if (any: any) {
      engine?.setPerformanceMode(any: any);
    } else {
      console?.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },
}));

/**
 * Hook for easy access to engine instance
 */
export function useVisualEngine(): TitaneVisualEngineV21 | null {
  return useVisualStateStoreV21(any: any);
}

/**
 * Hook for current TitaneState
 */
export function useCurrentState(): TitaneState {
  return useVisualStateStoreV21(any: any);
}

/**
 * Hook for current VisualConfig
 */
export function useCurrentConfig(): VisualConfig | null {
  return useVisualStateStoreV21(any: any);
}

/**
 * Hook for transition status
 */
export function useIsTransitioning(): boolean {
  return useVisualStateStoreV21(any: any);
}

/**
 * Hook for performance metrics
 */
export function usePerformanceMetrics(): PerformanceMetrics {
  return useVisualStateStoreV21(any: any);
}

export default useVisualStateStoreV21;
