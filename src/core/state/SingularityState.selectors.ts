/**
 * TITANE∞ v29.0.0 — Singularity State Selectors
 * Optimized selectors with shallow equality for SingularityState
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useSingularityState } from './SingularityState';
import { shallow } from 'zustand/shallow';
import type { EngineName, EngineDataMap } from './SingularityState';

// ═══════════════════════════════════════════════════════════════
// UI STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useUIMode = () => useSingularityState(state => state.ui.mode);
export const useUITheme = () => useSingularityState(state => state.ui.theme);
export const useSoundEnabled = () => useSingularityState(state => state.ui.soundEnabled);
export const useMicEnabled = () => useSingularityState(state => state.ui.micEnabled);
export const useGlowIntensity = () => useSingularityState(state => state.ui.glowIntensity);
export const useMotionEnabled = () => useSingularityState(state => state.ui.motionEnabled);
export const useFPS = () => useSingularityState(state => state.ui.fps);

/**
 * Complete UI state (shallow equality)
 * Use when component needs multiple UI values
 */
export const useUIState = () => useSingularityState(state => state.ui, shallow);

// ═══════════════════════════════════════════════════════════════
// AI STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useAIModel = () => useSingularityState(state => state.ai.model);
export const useAIStatus = () => useSingularityState(state => state.ai.status);
export const useAIError = () => useSingularityState(state => state.ai.error);
export const useFallbackActive = () => useSingularityState(state => state.ai.fallbackActive);

/**
 * Complete AI state (shallow equality)
 * Use when component needs multiple AI values
 */
export const useAIState = () => useSingularityState(state => state.ai, shallow);

// ═══════════════════════════════════════════════════════════════
// META-MODE STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useCurrentMode = () => useSingularityState(state => state.metaMode.currentMode);
export const usePreviousMode = () =>
  useSingularityState(state => state.metaMode.previousMode);
export const useIsTransitioning = () =>
  useSingularityState(state => state.metaMode.transitioning);
export const useMetaModeLastUpdate = () =>
  useSingularityState(state => state.metaMode.lastUpdate);

/**
 * Complete meta-mode state (shallow equality)
 * Use when component needs multiple meta-mode values
 */
export const useMetaModeState = () =>
  useSingularityState(state => state.metaMode, shallow);

// ═══════════════════════════════════════════════════════════════
// AVATAR DISPLAY STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useAvatarDisplay = () => useSingularityState(state => state.avatarDisplay);

/**
 * Has avatar display (boolean)
 * Use for conditional rendering
 */
export const useHasAvatarDisplay = () =>
  useSingularityState(state => state.avatarDisplay !== null);

// ═══════════════════════════════════════════════════════════════
// ENGINES STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useGlowEngine = () => useSingularityState(state => state.engines.glow);
export const useMotionEngine = () => useSingularityState(state => state.engines.motion);
export const usePersonaEngine = () => useSingularityState(state => state.engines.persona);
export const useCognitiveEngine = () =>
  useSingularityState(state => state.engines.cognitive);
export const useHolographyEngine = () =>
  useSingularityState(state => state.engines.holography);
export const useHyperDepthEngine = () =>
  useSingularityState(state => state.engines.hyperdepth);

/**
 * Complete engines state (shallow equality)
 * Use when component needs multiple engine states
 */
export const useEnginesState = () => useSingularityState(state => state.engines, shallow);

// ═══════════════════════════════════════════════════════════════
// ENGINES DATA SELECTORS (Type-Safe)
// ═══════════════════════════════════════════════════════════════

/**
 * Generic engine data selector (type-safe)
 */
export const useEngineData = <T extends EngineName>(engine: T) =>
  useSingularityState(state => state.enginesData[engine].data) as EngineDataMap[T] | null;

/**
 * Generic engine loading selector
 */
export const useEngineLoading = (engine: EngineName) =>
  useSingularityState(state => state.enginesData[engine].loading);

/**
 * Generic engine state selector (data + loading, shallow equality)
 */
export const useEngineState = <T extends EngineName>(engine: T) =>
  useSingularityState(state => state.enginesData[engine], shallow) as {
    data: EngineDataMap[T] | null;
    loading: boolean;
  };

// Specific engine data selectors
export const useHeliosData = () => useEngineData('helios');
export const useMemoryData = () => useEngineData('memory');
export const useHarmoniaData = () => useEngineData('harmonia');
export const useNexusData = () => useEngineData('nexus');
export const useSentinelData = () => useEngineData('sentinel');
export const useWatchdogData = () => useEngineData('watchdog');
export const useSelfHealData = () => useEngineData('selfheal');
export const useAdaptiveData = () => useEngineData('adaptive');

// Specific engine loading selectors
export const useHeliosLoading = () => useEngineLoading('helios');
export const useMemoryLoading = () => useEngineLoading('memory');
export const useHarmoniaLoading = () => useEngineLoading('harmonia');
export const useNexusLoading = () => useEngineLoading('nexus');
export const useSentinelLoading = () => useEngineLoading('sentinel');
export const useWatchdogLoading = () => useEngineLoading('watchdog');
export const useSelfHealLoading = () => useEngineLoading('selfheal');
export const useAdaptiveLoading = () => useEngineLoading('adaptive');

// ═══════════════════════════════════════════════════════════════
// CONTEXT STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useCurrentPage = () => useSingularityState(state => state.context.page);
export const useFocus = () => useSingularityState(state => state.context.focus);
export const useFullscreen = () => useSingularityState(state => state.context.fullscreen);
export const useSingularitySidebarCollapsed = () =>
  useSingularityState(state => state.context.sidebarCollapsed);

/**
 * Complete context state (shallow equality)
 * Use when component needs multiple context values
 */
export const useContextState = () => useSingularityState(state => state.context, shallow);

// ═══════════════════════════════════════════════════════════════
// GLOBAL HEALTH SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useGlobalHealth = () => useSingularityState(state => state.globalHealth);

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

/**
 * UI actions
 */
export const useUIActions = () =>
  useSingularityState(
    state => ({
      setMode: state.setMode,
      setTheme: state.setTheme,
      toggleSound: state.toggleSound,
      toggleMic: state.toggleMic,
      setGlowIntensity: state.setGlowIntensity,
      toggleMotion: state.toggleMotion,
    }),
    shallow
  );

/**
 * AI actions
 */
export const useAIActions = () =>
  useSingularityState(
    state => ({
      setAIModel: state.setAIModel,
      setAIStatus: state.setAIStatus,
      setAIError: state.setAIError,
    }),
    shallow
  );

/**
 * Meta-mode actions
 */
export const useMetaModeActions = () =>
  useSingularityState(
    state => ({
      setMetaMode: state.setMetaMode,
      setMetaModeTransition: state.setMetaModeTransition,
    }),
    shallow
  );

/**
 * Avatar display actions
 */
export const useAvatarDisplayActions = () =>
  useSingularityState(
    state => ({
      setAvatarDisplay: state.setAvatarDisplay,
      updateAvatarDisplay: state.updateAvatarDisplay,
    }),
    shallow
  );

/**
 * Engine actions
 */
export const useEngineActions = () =>
  useSingularityState(
    state => ({
      updateEngine: state.updateEngine,
      setEngineData: state.setEngineData,
      setEngineLoading: state.setEngineLoading,
    }),
    shallow
  );

/**
 * Context actions
 */
export const useContextActions = () =>
  useSingularityState(
    state => ({
      setPage: state.setPage,
      setFocus: state.setFocus,
      setFullscreen: state.setFullscreen,
      setSidebarCollapsed: state.setSidebarCollapsed,
      toggleSidebar: state.toggleSidebar,
    }),
    shallow
  );

/**
 * Global health actions
 */
export const useGlobalHealthActions = () =>
  useSingularityState(
    state => ({
      setGlobalHealth: state.setGlobalHealth,
    }),
    shallow
  );

// ═══════════════════════════════════════════════════════════════
// COMPUTED SELECTORS (Derived State with Memoization)
// ═══════════════════════════════════════════════════════════════

/**
 * Is AI active (status === 'active')
 */
export const useIsAIActive = () =>
  useSingularityState(state => state.ai.status === 'active');

/**
 * Has AI error (error !== null)
 */
export const useHasAIError = () => useSingularityState(state => state.ai.error !== null);

/**
 * Any engine loading (boolean)
 */
export const useAnyEngineLoading = () =>
  useSingularityState(state =>
    Object.values(state.enginesData).some(engine => engine.loading)
  );

/**
 * All engines loaded (boolean)
 */
export const useAllEnginesLoaded = () =>
  useSingularityState(state =>
    Object.values(state.enginesData).every(engine => engine.data !== null)
  );

/**
 * Engine data count (number of loaded engines)
 */
export const useLoadedEnginesCount = () =>
  useSingularityState(
    state => Object.values(state.enginesData).filter(engine => engine.data !== null).length
  );

/**
 * Is sidebar expanded (inverse of collapsed)
 */
export const useSingularitySidebarExpanded = () =>
  useSingularityState(state => !state.context.sidebarCollapsed);
