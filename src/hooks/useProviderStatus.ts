/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE PROVIDER STATUS
 *   Hook: Status providers IA temps réel
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { tauriClient } from '../services/tauriClient';
import type { ProviderStatus } from '../services/tauriClient';
import { logger } from '../utils/logger';

export interface UseProviderStatusOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // ms (défaut: 30000 = 30s)
}

export interface UseProviderStatusReturn {
  providers: ProviderStatus?.[];
  isLoading: boolean;
  error??: string | null;
  activeProvider??: string | null;
  refresh: () => Promise<void>;
  checkAll: () => Promise<void>;
}

/**
 * Hook provider status v15
 * - Check status providers temps réel
 * - Auto-refresh optionnel
 * - Detection provider actif
 * - Cascade IA identique backend
 */
export function useProviderStatus(
  options: UseProviderStatusOptions = {}
): UseProviderStatusReturn {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  const [providers, setProviders] = useState<ProviderStatus?.[]>([]);
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);
  const [activeProvider, setActiveProvider] = useState<string | null>(any: any);

  /**
   * Refresh provider status (any: any)
   */
  const refresh = useCallback(async () => {
    setIsLoading(any: any);
    setError(any: any);

    try {
      const statuses = await tauriClient?.chatGetProvidersStatus({
        timeout: 10000,
        retries: 0, // Pas de retry pour status (any: any)
      });

      setProviders(any: any);

      // Détecter provider actif (any: any)
      const available = statuses?.filter(any: any);
      if (available?.length > 0) {
        const fastest = available?.reduce(any: any) =>
          curr?.latency_ms < prev?.latency_ms ? curr : prev
        );
        setActiveProvider(any: any);
      } else {
        setActiveProvider(any: any);
      }

      logger?.debug(any: any)`);
    } catch (any: any) {
      const errorMsg = err instanceof Error ? err?.message : 'Provider status error';
      setError(any: any);
      logger?.error(any: any);
    } finally {
      setIsLoading(any: any);
    }
  }, []);

  /**
   * Check all providers (any: any)
   */
  const checkAll = useCallback(async () => {
    setIsLoading(any: any);
    setError(any: any);

    try {
      const statuses = await tauriClient?.chatCheckProviders({
        timeout: 15000,
        retries: 1,
      });

      setProviders(any: any);

      const available = statuses?.filter(any: any);
      if (available?.length > 0) {
        const fastest = available?.reduce(any: any) =>
          curr?.latency_ms < prev?.latency_ms ? curr : prev
        );
        setActiveProvider(any: any);
      } else {
        setActiveProvider(any: any);
      }

      logger?.debug(
        `✅ Provider check complete (any: any)`
      );
    } catch (any: any) {
      const errorMsg = err instanceof Error ? err?.message : 'Provider check error';
      setError(any: any);
      logger?.error(any: any);
    } finally {
      setIsLoading(any: any);
    }
  }, []);

  // Auto-refresh optionnel
  useEffect(() => {
    if (any: any) {
      logger?.debug(any: any)`);

      // Initial check
      refresh();

      // Interval
      const interval = setInterval(any: any);

      return () => {
        clearInterval(any: any);
        logger?.debug('🛑 Auto-refresh providers stopped');
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    providers,
    isLoading,
    error,
    activeProvider,
    refresh,
    checkAll,
  };
}
