/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v18.0.0 — SINGULARITY STATE FRONTEND
 * État global unifié pour toute l'application
 * ═══════════════════════════════════════════════════════════════
 */

import { create } from 'zustand';
import type {
  UIMode,
  UITheme,
  AIModel,
  AIStatus,
  EngineState,
  HealthStatus,
} from '../ARCHITECTURE_TYPES_v∞';

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

  // Engines State
  engines: {
    glow: EngineState | null;
    motion: EngineState | null;
    persona: EngineState | null;
    cognitive: EngineState | null;
    holography: EngineState | null;
    hyperdepth: EngineState | null;
  }

  // Context
  context: {
    page: string;
    focus: boolean;
    fullscreen: boolean;
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
  setPage: (page: string) => void;
  setFocus: (focus: boolean) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setGlobalHealth: (health: HealthStatus) => void;
}

// ═══════════════════════════════════════════════════════════════
// STORE CREATION
// ═══════════════════════════════════════════════════════════════

export const useSingularityState = create<SingularityFrontendState>((set) => ({
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

  // Initial Engines State
  engines: {
    glow: null,
    motion: null,
    persona: null,
    cognitive: null,
    holography: null,
    hyperdepth: null,
  },

  // Initial Context
  context: {
    page: 'dashboard',
    focus: true,
    fullscreen: false,
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

  setPage: (page) => set((state) => ({
    context: { ...state.context, page }
  })),

  setFocus: (focus) => set((state) => ({
    context: { ...state.context, focus }
  })),

  setFullscreen: (fullscreen) => set((state) => ({
    context: { ...state.context, fullscreen }
  })),

  setGlobalHealth: (globalHealth) => set({ globalHealth }),
}));

// ═══════════════════════════════════════════════════════════════
// SELECTORS (pour performance optimale)
// ═══════════════════════════════════════════════════════════════

export const selectUIMode = (state: SingularityFrontendState) => state.ui.mode;
export const selectAIStatus = (state: SingularityFrontendState) => state.ai.status;
export const selectEngine = (name: string) => (state: SingularityFrontendState) =>
  state.engines[name as keyof typeof state.engines];
export const selectGlobalHealth = (state: SingularityFrontendState) => state.globalHealth;
