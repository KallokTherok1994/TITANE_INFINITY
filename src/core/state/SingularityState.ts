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

// ═══════════════════════════════════════════════════════════════
// ENGINE DATA MAPPING
// ═══════════════════════════════════════════════════════════════

// Type-safe engine name literals
export type EngineName = 'helios' | 'memory' | 'harmonia' | 'nexus' | 'sentinel' | 'watchdog' | 'selfheal' | 'adaptive';

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

interface SingularityFrontendState {
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
    error: string | null;
    fallbackActive: boolean;
  }

  // Meta-Mode State (NEW v19.0)
  metaMode: {
    currentMode: string;
    previousMode: string;
    transitioning: boolean;
    lastUpdate: number;
  }

  // Engines State
  engines: {
    glow: EngineState | null;
    motion: EngineState | null;
    persona: EngineState | null;
    cognitive: EngineState | null;
    holography: EngineState | null;
    hyperdepth: EngineState | null;
  }

  // Engines Data (NEW v19.0 - centralized data/loading with typed data)
  enginesData: {
    helios: { data: HeliosMetrics | null; loading: boolean };
    memory: { data: MemoryData | null; loading: boolean };
    harmonia: { data: HarmoniaFlows | null; loading: boolean };
    nexus: { data: NexusGraph | null; loading: boolean };
    sentinel: { data: SentinelAlerts | null; loading: boolean };
    watchdog: { data: WatchdogData | null; loading: boolean };
    selfheal: { data: SelfHealData | null; loading: boolean };
    adaptive: { data: AdaptiveData | null; loading: boolean };
  }

  // Context
  context: {
    page: string;
    focus: boolean;
    fullscreen: boolean;
    sidebarCollapsed: boolean; // NEW: sidebar state
  }

  // Global Health
  globalHealth: HealthStatus;

  // Actions
  setMode: (mode: UIMode) => void;
  setTheme: (theme: UITheme) => void;
  toggleSound: () => void;
  toggleMic: () => void;
  setGlowIntensity: (intensity: number) => void;
  toggleMotion: () => void;
  setAIModel: (model: AIModel) => void;
  setAIStatus: (status: AIStatus) => void;
  setAIError: (error: string | null) => void;
  updateEngine: (name: string, state: EngineState) => void;
  
  // Type-safe engine data setters
  setEngineData: <T extends EngineName>(engine: T, data: EngineDataMap[T] | null) => void;
  setEngineLoading: (engine: EngineName, loading: boolean) => void;
  
  setMetaMode: (mode: string) => void;
  setMetaModeTransition: (transitioning: boolean) => void;
  setPage: (page: string) => void;
  setFocus: (focus: boolean) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void; // NEW
  toggleSidebar: () => void; // NEW
  setGlobalHealth: (health: HealthStatus) => void;
}

// ═══════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════

export const useSingularityState = create<SingularityFrontendState>()(persist(
  (set) => ({
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
    lastUpdate: Date.now(),
  },

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
  setMode: (mode) => set((state) => ({ ui: { ...state.ui, mode } })),

  setTheme: (theme) => set((state) => ({ ui: { ...state.ui, theme } })),

  toggleSound: () => set((state) => ({
    ui: { ...state.ui, soundEnabled: !state.ui.soundEnabled }
  })),

  toggleMic: () => set((state) => ({
    ui: { ...state.ui, micEnabled: !state.ui.micEnabled }
  })),

  setGlowIntensity: (glowIntensity) => set((state) => ({
    ui: { ...state.ui, glowIntensity }
  })),

  toggleMotion: () => set((state) => ({
    ui: { ...state.ui, motionEnabled: !state.ui.motionEnabled }
  })),

  setAIModel: (model) => set((state) => ({
    ai: { ...state.ai, model }
  })),

  setAIStatus: (status) => set((state) => ({
    ai: { ...state.ai, status }
  })),

  setAIError: (error) => set((state) => ({
    ai: { ...state.ai, error }
  })),

  updateEngine: (name, engineState) => set((state) => ({
    engines: { ...state.engines, [name]: engineState }
  })),

  setEngineData: (engine, data) => set((state) => ({
    enginesData: {
      ...state.enginesData,
      [engine]: { ...state.enginesData[engine as keyof typeof state.enginesData], data }
    }
  })),

  setEngineLoading: (engine, loading) => set((state) => ({
    enginesData: {
      ...state.enginesData,
      [engine]: { ...state.enginesData[engine as keyof typeof state.enginesData], loading }
    }
  })),

  setMetaMode: (mode) => set((state) => ({
    metaMode: {
      currentMode: mode,
      previousMode: state.metaMode.currentMode,
      transitioning: mode !== state.metaMode.currentMode,
      lastUpdate: Date.now(),
    }
  })),

  setMetaModeTransition: (transitioning) => set((state) => ({
    metaMode: { ...state.metaMode, transitioning }
  })),

  setPage: (page) => set((state) => ({
    context: { ...state.context, page }
  })),

  setFocus: (focus) => set((state) => ({
    context: { ...state.context, focus }
  })),

  setFullscreen: (fullscreen) => set((state) => ({
    context: { ...state.context, fullscreen }
  })),

  setSidebarCollapsed: (collapsed) => set((state) => ({
    context: { ...state.context, sidebarCollapsed: collapsed }
  })),

  toggleSidebar: () => set((state) => ({
    context: { ...state.context, sidebarCollapsed: !state.context.sidebarCollapsed }
  })),

  setGlobalHealth: (globalHealth) => set({ globalHealth }),
  }),
  {
    name: 'titane-singularity-state-v19',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      ui: state.ui,
      context: { ...state.context, page: 'dashboard' }, // reset page on reload
      metaMode: state.metaMode,
      // Don't persist: ai (dynamic), engines (dynamic), enginesData (dynamic), globalHealth (dynamic)
    }),
  }
));

// ═══════════════════════════════════════════════════════════════
// SELECTORS (pour performance optimale avec typage strict)
// ═══════════════════════════════════════════════════════════════

export const selectUIMode = (state: SingularityFrontendState) => state.ui.mode;
export const selectAIStatus = (state: SingularityFrontendState) => state.ai.status;
export const selectEngine = (name: string) => (state: SingularityFrontendState) =>
  state.engines[name as keyof typeof state.engines];
export const selectGlobalHealth = (state: SingularityFrontendState) => state.globalHealth;
export const selectMetaMode = (state: SingularityFrontendState) => state.metaMode.currentMode;
export const selectMetaModeState = (state: SingularityFrontendState) => state.metaMode;

// Type-safe engine data selector
export const selectEngineData = <T extends EngineName>(engine: T) => (state: SingularityFrontendState) =>
  state.enginesData[engine];
