/**
 * TITANE_INFINITY v14 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v14 — USE ENGINE STATE HOOK
 * Hook React pour accès état SingularityEngine temps réel
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { tauriClient } from '../services/tauriClient';

export interface PhysicalState {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
}

export interface CognitiveState {
  mode: string;
  coherence: number;
  load: number;
  focus: string[];
}

export interface SymbolicState {
  active_patterns: number;
  connections: number;
  depth: number;
}

export interface AdaptiveState {
  learning_rate: number;
  patterns_learned: number;
  adaptations: number;
}

export interface MetaState {
  self_awareness: number;
  meta_patterns: number;
  evolution_level: number;
}

export interface SingularityState {
  physical: PhysicalState;
  cognitive: CognitiveState;
  symbolic: SymbolicState;
  adaptive: AdaptiveState;
  meta: MetaState;
  global_coherence: number;
  is_critical: boolean;
  timestamp: number;
}

export interface EngineStateHook {
  state: SingularityState | null;
  isLoading: boolean;
  error: string | null;
  fetchState: () => Promise<SingularityState | null>;
  refresh: () => void;
}

const DEFAULT_STATE: SingularityState = {
  physical: { cpu: 0, memory: 0, disk: 0, uptime: 0 },
  cognitive: { mode: 'default', coherence: 1.0, load: 0, focus: [] },
  symbolic: { active_patterns: 0, connections: 0, depth: 0 },
  adaptive: { learning_rate: 0.1, patterns_learned: 0, adaptations: 0 },
  meta: { self_awareness: 0.5, meta_patterns: 0, evolution_level: 1 },
  global_coherence: 1.0,
  is_critical: false,
  timestamp: Date.now(),
};

export function useEngineState(options: { pollInterval?: number; enabled?: boolean } = {}): EngineStateHook {
  const { pollInterval = 10000, enabled = true } = options;

  const [state, setState] = useState<SingularityState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère l'état Singularity complet
   */
  const fetchState = useCallback(async (): Promise<SingularityState | null> => {
    if (!enabled) return null;

    setIsLoading(true);
    setError(null);

    try {
      const data = await tauriClient.getSingularityState();

      // Parser les données (format peut varier)
      const singularityState: SingularityState = {
        physical: data.physical || DEFAULT_STATE.physical,
        cognitive: data.cognitive || DEFAULT_STATE.cognitive,
        symbolic: data.symbolic || DEFAULT_STATE.symbolic,
        adaptive: data.adaptive || DEFAULT_STATE.adaptive,
        meta: data.meta || DEFAULT_STATE.meta,
        global_coherence: data.global_coherence ?? DEFAULT_STATE.global_coherence,
        is_critical: data.is_critical ?? false,
        timestamp: Date.now(),
      };

      setState(singularityState);
      setIsLoading(false);

      return singularityState;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch engine state';
      console.error('❌ Engine state fetch error:', err);

      setError(errorMessage);
      setIsLoading(false);

      // Fallback sur état par défaut
      setState(DEFAULT_STATE);

      return null;
    }
  }, [enabled]);

  /**
   * Force le rafraîchissement
   */
  const refresh = useCallback(() => {
    fetchState();
  }, [fetchState]);

  // Poll automatiquement
  useEffect(() => {
    if (!enabled) return;

    // Première récupération
    fetchState();

    // Poll régulier
    const interval = setInterval(fetchState, pollInterval);

    return () => clearInterval(interval);
  }, [fetchState, pollInterval, enabled]);

  return {
    state,
    isLoading,
    error,
    fetchState,
    refresh,
  };
}
