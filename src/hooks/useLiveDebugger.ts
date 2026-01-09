/**
 * TITANE_INFINITY v∞.29.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — useLiveDebugger Hook
 *   React Hook for Live Debugger Vocal Engine
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import {
  liveDebugger,
  type LiveDebuggerState,
  type LiveDebuggerConfig,
  type LiveDebuggerMode,
  type LiveDiagnostic,
  type MicroPatch,
} from '@/modules/liveDebugger/LiveDebuggerEngine';

export interface UseLiveDebuggerReturn {
  // State
  state: LiveDebuggerState;
  config: LiveDebuggerConfig;

  // Lifecycle
  activate: (mode?: LiveDebuggerMode) => Promise<void>;
  deactivate: () => Promise<void>;

  // Listening
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;

  // Analysis
  isAnalyzing: boolean;
  isPatching: boolean;

  // Diagnostics
  diagnostics: LiveDiagnostic[];
  recentDiagnostics: LiveDiagnostic[];
  lastDiagnostic: LiveDiagnostic | null;

  // Patches
  appliedPatches: MicroPatch[];
  recentPatches: MicroPatch[];

  // Modes
  mode: LiveDebuggerMode;
  setMode: (mode: LiveDebuggerMode) => void;

  // Health
  healthScore: number;

  // Transcript
  currentTranscript: string;
  segmentBuffer: string[];

  // Stats
  stats: {
    sessionDuration: number;
    totalSegments: number;
    totalDiagnostics: number;
    totalPatches: number;
    averageConfidence: number;
  };

  // Utilities
  reset: () => void;
  clearDiagnostics: () => void;
  configure: (config: Partial<LiveDebuggerConfig>) => void;
}

/**
 * Hook React pour le Live Debugger Vocal Engine
 *
 * Expose toutes les fonctionnalités du Live Debugger avec
 * auto-subscription aux changements d'état.
 *
 * @example
 * ```tsx
 * const {
 *   activate,
 *   startListening,
 *   diagnostics,
 *   healthScore
 * } = useLiveDebugger();
 *
 * // Activer en mode shadow
 * await activate('shadow');
 * await startListening();
 *
 * // Diagnostics apparaissent automatiquement
 * logger.debug(diagnostics);
 * ```
 */
export function useLiveDebugger(): UseLiveDebuggerReturn {
  const [state, setState] = useState<LiveDebuggerState>(liveDebugger.getState());
  const [config, setConfig] = useState<LiveDebuggerConfig>(liveDebugger.getConfig());

  // Auto-subscribe to engine changes
  useEffect(() => {
    const unsubscribe = liveDebugger.subscribe(newState => {
      setState(newState);
      setConfig(liveDebugger.getConfig());
    });

    return unsubscribe;
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  const activate = useCallback(async (mode: LiveDebuggerMode = 'shadow') => {
    await liveDebugger.activate(mode);
  }, []);

  const deactivate = useCallback(async () => {
    await liveDebugger.deactivate();
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // LISTENING
  // ═══════════════════════════════════════════════════════════════

  const startListening = useCallback(async () => {
    await liveDebugger.startListening();
  }, []);

  const stopListening = useCallback(() => {
    liveDebugger.stopListening();
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // MODES
  // ═══════════════════════════════════════════════════════════════

  const setMode = useCallback((mode: LiveDebuggerMode) => {
    liveDebugger.setMode(mode);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  const reset = useCallback(() => {
    liveDebugger.reset();
  }, []);

  const clearDiagnostics = useCallback(() => {
    liveDebugger.clearDiagnostics();
  }, []);

  const configure = useCallback((newConfig: Partial<LiveDebuggerConfig>) => {
    liveDebugger.configure(newConfig);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════

  const recentDiagnostics = liveDebugger.getRecentDiagnostics(10);
  const lastDiagnostic =
    state.diagnostics.length > 0 ? state.diagnostics[state.diagnostics.length - 1] : null;
  const recentPatches = state.appliedPatches.slice(-10);
  const stats = liveDebugger.getStats();

  // ═══════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════

  return {
    // State
    state,
    config,

    // Lifecycle
    activate,
    deactivate,

    // Listening
    startListening,
    stopListening,
    isListening: state.isListening,

    // Analysis
    isAnalyzing: state.isAnalyzing,
    isPatching: state.isPatching,

    // Diagnostics
    diagnostics: state.diagnostics,
    recentDiagnostics,
    lastDiagnostic: lastDiagnostic ?? null,

    // Patches
    appliedPatches: state.appliedPatches,
    recentPatches,

    // Modes
    mode: state.mode,
    setMode,

    // Health
    healthScore: state.healthScore,

    // Transcript
    currentTranscript: state.currentTranscript,
    segmentBuffer: state.segmentBuffer,

    // Stats
    stats,

    // Utilities
    reset,
    clearDiagnostics,
    configure,
  };
}
