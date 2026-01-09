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
  error: string | null;
  fetchState: () => Promise<SingularityState | null>;
  refresh: () => void;
}

export function useEngineState(
  options: { pollInterval?: number; enabled?: boolean } = {}
): EngineStateHook {
  const { pollInterval = 10000, enabled = true } = options;

  const [state, setState] = useState<SingularityState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère l'état Singularity complet depuis le backend Tauri
   */
  const fetchState = useCallback(async () => {
    if (!enabled) return null;

    setIsLoading(true);
    setError(null);

    try {
      const data = await tauriClient.getSingularityState();

      // Data est déjà au bon format SingularityState depuis le backend
      setState(data as SingularityState);
      setIsLoading(false);

      return data as SingularityState;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch engine state';
      logger.error('❌ [useEngineState] Fetch error:', err);

      setError(errorMessage);
      setIsLoading(false);
      setState(null);

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
    if (!enabled) return;

    // Première récupération immédiate
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
