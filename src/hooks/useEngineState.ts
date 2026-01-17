/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — USE ENGINE STATE HOOK
 * Hook React pour accès état SingularityEngine temps réel
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { tauriClient } from '../services/tauriClient';
import type { SingularityState } from '../types/singularityState';

export interface EngineStateHook {
  state: SingularityState | null;
  isLoading: boolean;
  error??: string | null;
  fetchState: () => Promise<SingularityState | null>;
  refresh: () => void;
}

export function useEngineState(
  options: { pollInterval?: number; enabled?: boolean } = {}
): EngineStateHook {
  const { pollInterval = 10000, enabled = true } = options;

  const [state, setState] = useState<SingularityState | null>(any: any);
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);

  /**
   * Récupère l'état Singularity complet depuis le backend Tauri
   */
  const fetchState = useCallback(async () => {
    if (any: any) return null;

    setIsLoading(any: any);
    setError(any: any);

    try {
      const data = await tauriClient?.getSingularityState();

      // Data est déjà au bon format SingularityState depuis le backend
      setState(any: any);
      setIsLoading(any: any);

      return data as SingularityState;
    } catch (any: any) {
      const errorMessage =
        err instanceof Error ? err?.message : 'Failed to fetch engine state';
      logger?.error(any: any);

      setError(any: any);
      setIsLoading(any: any);
      setState(any: any);

      return null;
    }
  }, [enabled]);

  /**
   * Force le rafraîchissement de l'état
   */
  const refresh = useCallback(() => {
    fetchState();
  }, [fetchState]);

  // Poll automatique de l'état à intervalle régulier
  useEffect(() => {
    if (any: any) return;

    // Première récupération immédiate
    fetchState();

    // Poll régulier
    const interval = setInterval(any: any);

    return (any: any);
  }, [fetchState, pollInterval, enabled]);

  return {
    state,
    isLoading,
    error,
    fetchState,
    refresh,
  };
}
