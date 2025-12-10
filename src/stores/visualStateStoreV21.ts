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
 * setCognitiveState(CognitiveState.THINKING);
 *
 * // Change emotional tone
 * setEmotionalTone(EmotionalTone.EXCITED);
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

  // State (multi-dimensional)
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

  // Actions - State management (multi-dimensional)
  setState: (state: TitaneState, duration?: number) => void;
  setStateImmediate: (state: TitaneState) => void;
  setCognitiveState: (cognitive: CognitiveState, duration?: number) => void;
  setEmotionalTone: (emotional: EmotionalTone, duration?: number) => void;
  setSystemLoad: (load: number, duration?: number) => void;
  setConversationContext: (context: ConversationContext, duration?: number) => void;
  setCustomConfig: (override: Partial<VisualConfig>, duration?: number) => void;
  clearCustomConfig: (duration?: number) => void;

  // Actions - Configuration
  updateEngineConfig: (config: Partial<VisualEngineV21Config>) => void;
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => void;
}

/**
 * Default initial state (IDLE + CALM)
 */
const DEFAULT_INITIAL_STATE: TitaneState = {
  cognitive: CognitiveState.IDLE,
  emotional: EmotionalTone.CALM,
  systemLoad: 0,
  conversationContext: ConversationContext.WAITING,
};

export const useVisualStateStoreV21 = create<VisualStateStoreV21>((set, get) => ({
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
    if (engine) {
      engine.destroy();
    }

    // Create new engine
    const newEngine = new TitaneVisualEngineV21(initialState, config);

    // Subscribe to engine events
    newEngine.on('stateChange', (state: TitaneState) => {
      set({ currentState: state });
    });

    newEngine.on('configChange', (config: VisualConfig) => {
      set({ currentConfig: config });
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

    // Register callbacks for real-time updates (more efficient than events)
    newEngine.onStateChange(state => {
      set({ currentState: state });
    });

    newEngine.onConfigChange(config => {
      set({ currentConfig: config });
    });

    set({
      engine: newEngine,
      currentState: newEngine.getCurrentState(),
      currentConfig: newEngine.getCurrentConfig(),
    });

    console.log('[VisualStateStoreV21] Engine initialized', {
      state: initialState,
      config,
    });
  },

  /**
   * Destroy engine and clean up
   */
  destroyEngine: () => {
    const { engine } = get();
    if (engine) {
      engine.destroy();
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
    if (engine) {
      engine.start();
    } else {
      console.warn(
        '[VisualStateStoreV21] Engine not initialized. Call initEngine() first.'
      );
    }
  },

  /**
   * Stop engine rendering loop
   */
  stopEngine: () => {
    const { engine } = get();
    if (engine) {
      engine.stop();
    }
  },

  // ═════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT (MULTI-DIMENSIONAL)
  // ═════════════════════════════════════════════════════════════════

  /**
   * Set complete TitaneState with transition
   */
  setState: (state, duration) => {
    const { engine } = get();
    if (engine) {
      engine.setState(state, duration);
    } else {
      console.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set state immediately without transition
   */
  setStateImmediate: state => {
    const { engine } = get();
    if (engine) {
      engine.setStateImmediate(state);
    } else {
      console.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set cognitive state only (keep other dimensions)
   */
  setCognitiveState: (cognitive, duration) => {
    const { engine } = get();
    if (engine) {
      engine.setCognitiveState(cognitive, duration);
    } else {
      console.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set emotional tone only (keep other dimensions)
   */
  setEmotionalTone: (emotional, duration) => {
    const { engine } = get();
    if (engine) {
      engine.setEmotionalTone(emotional, duration);
    } else {
      console.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set system load percentage (0-100)
   */
  setSystemLoad: (load, duration) => {
    const { engine } = get();
    if (engine) {
      engine.setSystemLoad(load, duration);
    } else {
      console.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set conversation context only (keep other dimensions)
   */
  setConversationContext: (context, duration) => {
    const { engine } = get();
    if (engine) {
      engine.setConversationContext(context, duration);
    } else {
      console.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set custom visual config override
   */
  setCustomConfig: (override, duration) => {
    const { engine } = get();
    if (engine) {
      engine.setCustomConfig(override, duration);
    } else {
      console.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Clear custom config override
   */
  clearCustomConfig: duration => {
    const { engine } = get();
    if (engine) {
      engine.clearCustomConfig(duration);
    } else {
      console.warn('[VisualStateStoreV21] Engine not initialized');
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
    if (engine) {
      engine.updateConfig(config);
    } else {
      console.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },

  /**
   * Set performance mode (adjusts visual quality)
   */
  setPerformanceMode: mode => {
    const { engine } = get();
    if (engine) {
      engine.setPerformanceMode(mode);
    } else {
      console.warn('[VisualStateStoreV21] Engine not initialized');
    }
  },
}));

/**
 * Hook for easy access to engine instance
 */
export function useVisualEngine(): TitaneVisualEngineV21 | null {
  return useVisualStateStoreV21(state => state.engine);
}

/**
 * Hook for current TitaneState
 */
export function useCurrentState(): TitaneState {
  return useVisualStateStoreV21(state => state.currentState);
}

/**
 * Hook for current VisualConfig
 */
export function useCurrentConfig(): VisualConfig | null {
  return useVisualStateStoreV21(state => state.currentConfig);
}

/**
 * Hook for transition status
 */
export function useIsTransitioning(): boolean {
  return useVisualStateStoreV21(state => state.isTransitioning);
}

/**
 * Hook for performance metrics
 */
export function usePerformanceMetrics(): PerformanceMetrics {
  return useVisualStateStoreV21(state => state.performanceMetrics);
}

export default useVisualStateStoreV21;
