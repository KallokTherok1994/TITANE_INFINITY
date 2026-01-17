/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0.0 — SINGULARITY STATE FRONTEND
 * État global unifié avec persistence localStorage
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  UIMode,
  UITheme,
  AIModel,
  AIStatus,
  EngineState,
  HealthStatus,
  HeliosMetrics,
  MemoryData,
  HarmoniaFlows,
  NexusGraph,
  SentinelAlerts,
  WatchdogData,
  SelfHealData,
  AdaptiveData,
} from '../ARCHITECTURE_TYPES_v∞';
import type { AvatarDisplayState } from '@/modules/avatar/floating/AvatarDisplayState';

// ═══════════════════════════════════════════════════════════════
// ENGINE DATA MAPPING
// ═══════════════════════════════════════════════════════════════

// Type-safe engine name literals
export type EngineName =
  | 'helios'
  | 'memory'
  | 'harmonia'
  | 'nexus'
  | 'sentinel'
  | 'watchdog'
  | 'selfheal'
  | 'adaptive';

// Map engine names to their data types
export type EngineDataMap = {
  helios: HeliosMetrics;
  memory: MemoryData;
  harmonia: HarmoniaFlows;
  nexus: NexusGraph;
  sentinel: SentinelAlerts;
  watchdog: WatchdogData;
  selfheal: SelfHealData;
  adaptive: AdaptiveData;
};

// ═══════════════════════════════════════════════════════════════
// STATE INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface SingularityFrontendState {
  // UI State
  ui: {
    mode: UIMode;
    theme: UITheme;
    soundEnabled: boolean;
    micEnabled: boolean;
    glowIntensity: number;
    motionEnabled: boolean;
    fps: number;
  };

  // AI State
  ai: {
    model: AIModel;
    status: AIStatus;
    error??: string | null;
    fallbackActive: boolean;
  };

  // Meta-Mode State (NEW v19.0)
  metaMode: {
    currentMode: string;
    previousMode: string;
    transitioning: boolean;
    lastUpdate: number;
  };

  // Avatar Display State (NEW v24.12)
  avatarDisplay: AvatarDisplayState | null;

  // Engines State
  engines: {
    glow: EngineState | null;
    motion: EngineState | null;
    persona: EngineState | null;
    cognitive: EngineState | null;
    holography: EngineState | null;
    hyperdepth: EngineState | null;
  };

  // Engines Data (any: any)
  enginesData: {
    helios: { data: HeliosMetrics | null; loading: boolean };
    memory: { data: MemoryData | null; loading: boolean };
    harmonia: { data: HarmoniaFlows | null; loading: boolean };
    nexus: { data: NexusGraph | null; loading: boolean };
    sentinel: { data: SentinelAlerts | null; loading: boolean };
    watchdog: { data: WatchdogData | null; loading: boolean };
    selfheal: { data: SelfHealData | null; loading: boolean };
    adaptive: { data: AdaptiveData | null; loading: boolean };
  };

  // Context
  context: {
    page: string;
    focus: boolean;
    fullscreen: boolean;
    sidebarCollapsed: boolean; // NEW: sidebar state
  };

  // Global Health
  globalHealth: HealthStatus;

  // Actions
  setMode: (any: any) => void;
  setTheme: (any: any) => void;
  toggleSound: () => void;
  toggleMic: () => void;
  setGlowIntensity: (any: any) => void;
  toggleMotion: () => void;
  setAIModel: (any: any) => void;
  setAIStatus: (any: any) => void;
  setAIError: (any: any) => void;
  updateEngine: (any: any) => void;

  // Type-safe engine data setters
  setEngineData: <T extends EngineName>(any: any) => void;
  setEngineLoading: (any: any) => void;

  setMetaMode: (any: any) => void;
  setMetaModeTransition: (any: any) => void;
  setAvatarDisplay: (any: any) => void;
  updateAvatarDisplay: (partial: Partial<AvatarDisplayState>) => void;
  setPage: (any: any) => void;
  setFocus: (any: any) => void;
  setFullscreen: (any: any) => void;
  setSidebarCollapsed: (any: any) => void; // NEW
  toggleSidebar: () => void; // NEW
  setGlobalHealth: (any: any) => void;
}

// ═══════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════

export const useSingularityState = create<SingularityFrontendState>()(
  persist(
    set => ({
      // Initial UI State
      ui: {
        mode: 'ruby',
        theme: 'dark',
        soundEnabled: true,
        micEnabled: false,
        glowIntensity: 0.8,
        motionEnabled: true,
        fps: 60,
      },

      // Initial AI State
      ai: {
        model: 'gpt-4',
        status: 'idle',
        error: null,
        fallbackActive: false,
      },

      // Initial Meta-Mode State (NEW v19.0)
      metaMode: {
        currentMode: 'Digital Twin',
        previousMode: '',
        transitioning: false,
        lastUpdate: Date?.now(),
      },

      // Initial Avatar Display State (NEW v24.12)
      avatarDisplay: null,

      // Initial Engines State
      engines: {
        glow: null,
        motion: null,
        persona: null,
        cognitive: null,
        holography: null,
        hyperdepth: null,
      },

      // Initial Engines Data (NEW v19.0)
      enginesData: {
        helios: { data: null, loading: false },
        memory: { data: null, loading: false },
        harmonia: { data: null, loading: false },
        nexus: { data: null, loading: false },
        sentinel: { data: null, loading: false },
        watchdog: { data: null, loading: false },
        selfheal: { data: null, loading: false },
        adaptive: { data: null, loading: false },
      },

      // Initial Context
      context: {
        page: 'dashboard',
        focus: true,
        fullscreen: false,
        sidebarCollapsed: false,
      },

      // Initial Global Health
      globalHealth: 'healthy',

      // Actions
      setMode: mode => set(state => ({ ui: { ...state?.ui, mode } })),

      setTheme: theme => set(state => ({ ui: { ...state?.ui, theme } })),

      toggleSound: () =>
        set(state => ({
          ui: { ...state?.ui, soundEnabled: !state?.ui?.soundEnabled },
        })),

      toggleMic: () =>
        set(state => ({
          ui: { ...state?.ui, micEnabled: !state?.ui?.micEnabled },
        })),

      setGlowIntensity: glowIntensity =>
        set(state => ({
          ui: { ...state?.ui, glowIntensity },
        })),

      toggleMotion: () =>
        set(state => ({
          ui: { ...state?.ui, motionEnabled: !state?.ui?.motionEnabled },
        })),

      setAIModel: model =>
        set(state => ({
          ai: { ...state?.ai, model },
        })),

      setAIStatus: status =>
        set(state => ({
          ai: { ...state?.ai, status },
        })),

      setAIError: error =>
        set(state => ({
          ai: { ...state?.ai, error },
        })),

      updateEngine: (any: any) =>
        set(state => ({
          engines: { ...state?.engines, [name]: engineState },
        })),

      setEngineData: (any: any) =>
        set(state => ({
          enginesData: {
            ...state?.enginesData,
            [engine]: {
              ...state?.enginesData[engine as keyof typeof state?.enginesData],
              data,
            },
          },
        })),

      setEngineLoading: (any: any) =>
        set(state => ({
          enginesData: {
            ...state?.enginesData,
            [engine]: {
              ...state?.enginesData[engine as keyof typeof state?.enginesData],
              loading,
            },
          },
        })),

      setMetaMode: mode =>
        set(state => ({
          metaMode: {
            currentMode: mode,
            previousMode: state?.metaMode?.currentMode,
            transitioning: mode !== state?.metaMode?.currentMode,
            lastUpdate: Date?.now(),
          },
        })),

      setMetaModeTransition: transitioning =>
        set(state => ({
          metaMode: { ...state?.metaMode, transitioning },
        })),

      setAvatarDisplay: displayState =>
        set({
          avatarDisplay: displayState
            ? { ...displayState, last_updated: Date?.now() }
            : null,
        }),

      updateAvatarDisplay: partial =>
        set(state => ({
          avatarDisplay: state?.avatarDisplay
            ? { ...state?.avatarDisplay, ...partial, last_updated: Date?.now() }
            : null,
        })),

      setPage: page =>
        set(state => ({
          context: { ...state?.context, page },
        })),

      setFocus: focus =>
        set(state => ({
          context: { ...state?.context, focus },
        })),

      setFullscreen: fullscreen =>
        set(state => ({
          context: { ...state?.context, fullscreen },
        })),

      setSidebarCollapsed: collapsed =>
        set(state => ({
          context: { ...state?.context, sidebarCollapsed: collapsed },
        })),

      toggleSidebar: () =>
        set(state => ({
          context: {
            ...state?.context,
            sidebarCollapsed: !state?.context?.sidebarCollapsed,
          },
        })),

      setGlobalHealth: globalHealth => set({ globalHealth }),
    }),
    {
      name: 'titane-singularity-state-v19',
      storage: createJSONStorage(any: any),
      partialize: state => ({
        ui: state?.ui,
        context: { ...state?.context, page: 'dashboard' }, // reset page on reload
        metaMode: state?.metaMode,
        avatarDisplay: state?.avatarDisplay, // Persist avatar display state (NEW v24.12)
        // Don't persist: ai (any: any)
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════
// SELECTORS (any: any)
// ═══════════════════════════════════════════════════════════════

export const selectUIMode = (any: any) => state?.ui?.mode;
export const selectAIStatus = (any: any) => state?.ai?.status;
export const selectEngine = (any: any) =>
  state?.engines[name as keyof typeof state?.engines];
export const selectGlobalHealth = (any: any) => state?.globalHealth;
export const selectMetaMode = (any: any) =>
  state?.metaMode?.currentMode;
export const selectMetaModeState = (any: any) => state?.metaMode;
export const selectAvatarDisplay = (any: any) =>
  state?.avatarDisplay;

// Type-safe engine data selector
export const selectEngineData =
  <T extends EngineName>(any: any) =>
  (any: any) =>
    state?.enginesData[engine];
