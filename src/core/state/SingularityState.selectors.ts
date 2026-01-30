/**
 * TITANE∞ v29.0.0 — Singularity State Selectors
 * Optimized selectors with shallow equality for SingularityState
 * Prevents unnecessary rerenders by selecting only needed slices
 */

import { useSingularityStore } from './SingularityState';
import { shallow } from 'zustand/shallow';
import type { EngineName, EngineDataMap } from './SingularityState';

// ═══════════════════════════════════════════════════════════════
// UI STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useUIMode = () => useSingularityStore(state => state.ui.mode);
export const useUITheme = () => useSingularityStore(state => state.ui.theme);
export const useSoundEnabled = () => useSingularityStore(state => state.ui.soundEnabled);
export const useMicEnabled = () => useSingularityStore(state => state.ui.micEnabled);
export const useGlowIntensity = () => useSingularityStore(state => state.ui.glowIntensity);
export const useMotionEnabled = () => useSingularityStore(state => state.ui.motionEnabled);
export const useFPS = () => useSingularityStore(state => state.ui.fps);

/**
 * Complete UI state (shallow equality)
 * Use when component needs multiple UI values
 */
export const useUIState = () => useSingularityStore(state => state.ui, shallow);

// ═══════════════════════════════════════════════════════════════
// AI STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useAIModel = () => useSingularityStore(state => state.ai.model);
export const useAIStatus = () => useSingularityStore(state => state.ai.status);
export const useAIError = () => useSingularityStore(state => state.ai.error);
export const useFallbackActive = () => useSingularityStore(state => state.ai.fallbackActive);

/**
 * Complete AI state (shallow equality)
 * Use when component needs multiple AI values
 */
export const useAIState = () => useSingularityStore(state => state.ai, shallow);

// ═══════════════════════════════════════════════════════════════
// META-MODE STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useCurrentMode = () => useSingularityStore(state => state.metaMode.currentMode);
export const usePreviousMode = () =>
  useSingularityStore(state => state.metaMode.previousMode);
export const useIsTransitioning = () =>
  useSingularityStore(state => state.metaMode.transitioning);
export const useMetaModeLastUpdate = () =>
  useSingularityStore(state => state.metaMode.lastUpdate);

/**
 * Complete meta-mode state (shallow equality)
 * Use when component needs multiple meta-mode values
 */
export const useMetaModeState = () =>
  useSingularityStore(state => state.metaMode, shallow);

// ═══════════════════════════════════════════════════════════════
// AVATAR DISPLAY STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useAvatarDisplay = () => useSingularityStore(state => state.avatarDisplay);

/**
 * Has avatar display (boolean)
 * Use for conditional rendering
 */
export const useHasAvatarDisplay = () =>
  useSingularityStore(state => state.avatarDisplay !== null);

// ═══════════════════════════════════════════════════════════════
// ENGINES STATE SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useGlowEngine = () => useSingularityStore(state => state.engines.glow);
export const useMotionEngine = () => useSingularityStore(state => state.engines.motion);
export const usePersonaEngine = () => useSingularityStore(state => state.engines.persona);
export const useCognitiveEngine = () =>
  useSingularityStore(state => state.engines.cognitive);
export const useHolographyEngine = () =>
  useSingularityStore(state => state.engines.holography);
export const useHyperDepthEngine = () =>
  useSingularityStore(state => state.engines.hyperdepth);

/**
 * Complete engines state (shallow equality)
 * Use when component needs multiple engine states
 */
export const useEnginesState = () => useSingularityStore(state => state.engines, shallow);

// ═══════════════════════════════════════════════════════════════
// ENGINES DATA SELECTORS (Type-Safe)
// ═══════════════════════════════════════════════════════════════

/**
 * Generic engine data selector (type-safe)
 */
export const useEngineData = <T extends EngineName>(engine: T) =>
  useSingularityStore(state => state.enginesData[engine].data) as EngineDataMap[T] | null;

/**
 * Generic engine loading selector
 */
export const useEngineLoading = (engine: EngineName) =>
  useSingularityStore(state => state.enginesData[engine].loading);

/**
 * Generic engine state selector (data + loading, shallow equality)
 */
export const useEngineState = <T extends EngineName>(engine: T) =>
  useSingularityStore(state => state.enginesData[engine], shallow) as {
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

export const useCurrentPage = () => useSingularityStore(state => state.context.page);
export const useFocus = () => useSingularityStore(state => state.context.focus);
export const useFullscreen = () => useSingularityStore(state => state.context.fullscreen);
export const useSingularitySidebarCollapsed = () =>
  useSingularityStore(state => state.context.sidebarCollapsed);

/**
 * Complete context state (shallow equality)
 * Use when component needs multiple context values
 */
export const useContextState = () => useSingularityStore(state => state.context, shallow);

// ═══════════════════════════════════════════════════════════════
// GLOBAL HEALTH SELECTORS
// ═══════════════════════════════════════════════════════════════

export const useGlobalHealth = () => useSingularityStore(state => state.globalHealth);

// ═══════════════════════════════════════════════════════════════
// ACTION SELECTORS (Actions Only)
// ═══════════════════════════════════════════════════════════════

/**
 * UI actions
 */
export const useUIActions = () =>
  useSingularityStore(
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
  useSingularityStore(
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
  useSingularityStore(
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
  useSingularityStore(
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
  useSingularityStore(
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
  useSingularityStore(
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
  useSingularityStore(
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
  useSingularityStore(state => state.ai.status === 'active');

/**
 * Has AI error (error !== null)
 */
export const useHasAIError = () => useSingularityStore(state => state.ai.error !== null);

/**
 * Any engine loading (boolean)
 */
export const useAnyEngineLoading = () =>
  useSingularityStore(state =>
    Object.values(state.enginesData).some(engine => engine.loading)
  );

/**
 * All engines loaded (boolean)
 */
export const useAllEnginesLoaded = () =>
  useSingularityStore(state =>
    Object.values(state.enginesData).every(engine => engine.data !== null)
  );

/**
 * Engine data count (number of loaded engines)
 */
export const useLoadedEnginesCount = () =>
  useSingularityStore(
    state => Object.values(state.enginesData).filter(engine => engine.data !== null).length
  );

/**
 * Is sidebar expanded (inverse of collapsed)
 */
export const useSingularitySidebarExpanded = () =>
  useSingularityStore(state => !state.context.sidebarCollapsed);
