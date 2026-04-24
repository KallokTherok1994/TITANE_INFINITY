/**
 * TITANE_INFINITY v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v30.0.0 — USE PROVIDER STATUS
 *   Hook: Status providers IA temps réel
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { tauriClient } from '../services/tauriClient';
import type { ProviderStatus } from '../services/tauriClient';

export interface UseProviderStatusOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // ms (défaut: 30000 = 30s)
}

export interface UseProviderStatusReturn {
  providers: ProviderStatus[];
  isLoading: boolean;
  error: string | null;
  activeProvider: string | null;
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

  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestInFlightRef = useRef<Promise<void> | null>(null);

  const runProviderRequest = useCallback(
    async (
      requestFactory: () => Promise<ProviderStatus[]>,
      successLog: (statuses: ProviderStatus[]) => void,
      failureMessage: string
    ): Promise<void> => {
      if (requestInFlightRef.current) {
        return requestInFlightRef.current;
      }

      const request = (async () => {
        if (mountedRef.current) {
          setIsLoading(true);
          setError(null);
        }

        try {
          const statuses = await requestFactory();

          if (mountedRef.current) {
            setProviders(statuses);
          }

          if (import.meta.env.DEV) {
            successLog(statuses);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : failureMessage;

          if (mountedRef.current) {
            setError(errorMsg);
          }

          if (import.meta.env.DEV) {
            console.error(`❌ ${failureMessage}:`, err);
          }
        } finally {
          requestInFlightRef.current = null;

          if (mountedRef.current) {
            setIsLoading(false);
          }
        }
      })();

      requestInFlightRef.current = request;
      return request;
    },
    []
  );

  /**
   * Refresh provider status (rapide, cache backend)
   */
  const refresh = useCallback(async () => {
    await runProviderRequest(
      () =>
        tauriClient.chatGetProvidersStatus({
          timeout: 10000,
          retries: 0, // Pas de retry pour status (temps réel)
        }),
      statuses => {
        console.warn(`✅ Provider status refreshed (${statuses.length} providers)`);
      },
      'Provider status error'
    );
  }, [runProviderRequest]);

  /**
   * Check all providers (lent, test réseau complet)
   */
  const checkAll = useCallback(async () => {
    await runProviderRequest(
      () =>
        tauriClient.chatCheckProviders({
          timeout: 15000,
          retries: 1,
        }),
      statuses => {
        const available = statuses.filter(p => p.available);
        console.warn(
          `✅ Provider check complete (${available.length}/${statuses.length} available)`
        );
      },
      'Provider check error'
    );
  }, [runProviderRequest]);

  // ═══ MEMOIZED ACTIVE PROVIDER DETECTION (v33.0.0 Phase 2 optimization) ═══
  // Previously computed twice in refresh/checkAll callbacks
  // Now memoized as derived state to eliminate redundant .filter() + .reduce()
  const activeProviderMemo = useMemo(() => {
    const available = providers.filter(p => p.available);
    if (available.length === 0) return null;
    const fastest = available.reduce((prev, curr) =>
      curr.latency_ms < prev.latency_ms ? curr : prev
    );
    return fastest.provider;
  }, [providers]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestInFlightRef.current = null;
    };
  }, []);

  // Auto-refresh optionnel
  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    if (import.meta.env.DEV) {
      console.warn(`🔄 Auto-refresh providers enabled (${refreshInterval}ms)`);
    }

    // Initial check
    void refresh();

    // Interval
    const interval = setInterval(() => {
      void refresh();
    }, refreshInterval);

    return () => {
      clearInterval(interval);
      if (import.meta.env.DEV) {
        console.warn('🛑 Auto-refresh providers stopped');
      }
    };
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    providers,
    isLoading,
    error,
    activeProvider: activeProviderMemo,
    refresh,
    checkAll,
  };
}
