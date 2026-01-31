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

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  /**
   * Refresh provider status (rapide, cache backend)
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const statuses = await tauriClient.chatGetProvidersStatus({
        timeout: 10000,
        retries: 0, // Pas de retry pour status (temps réel)
      });

      setProviders(statuses);

      // Note: Active provider now computed via useMemo as derived state
      // (v33.0.0 optimization - eliminates redundant filter/reduce)

      console.log(`✅ Provider status refreshed (${statuses.length} providers)`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Provider status error';
      setError(errorMsg);
      console.error('❌ Provider status refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check all providers (lent, test réseau complet)
   */
  const checkAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const statuses = await tauriClient.chatCheckProviders({
        timeout: 15000,
        retries: 1,
      });

      setProviders(statuses);

      // Note: Active provider now computed via useMemo as derived state
      // (v33.0.0 optimization - eliminates redundant filter/reduce)

      const available = statuses.filter(p => p.available);
      console.log(
        `✅ Provider check complete (${available.length}/${statuses.length} available)`
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Provider check error';
      setError(errorMsg);
      console.error('❌ Provider check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  // Auto-refresh optionnel
  useEffect(() => {
    if (autoRefresh) {
      console.log(`🔄 Auto-refresh providers enabled (${refreshInterval}ms)`);

      // Initial check
      refresh();

      // Interval
      const interval = setInterval(refresh, refreshInterval);

      return () => {
        clearInterval(interval);
        console.log('🛑 Auto-refresh providers stopped');
      };
    }
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
