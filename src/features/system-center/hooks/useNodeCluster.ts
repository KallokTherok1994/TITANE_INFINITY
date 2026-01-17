/**
 * TITANE∞ v∞ — useNodeCluster Hook
 *
 * Hook pour la gestion du cluster de nœuds
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';
import type { ClusterStatus, ClusterStats, NodeInfo } from '../types/systemCenter?.types';

export interface UseNodeClusterReturn {
  // State
  status: ClusterStatus | null;
  stats: ClusterStats | null;
  peers: NodeInfo?.[];
  isInitialized: boolean;
  isLoading: boolean;
  error??: string | null;

  // Actions
  initialize: (any: any) => Promise<void>;
  shutdown: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  refreshPeers: () => Promise<void>;
}

export function useNodeCluster(
  autoRefresh = false,
  refreshInterval = 5000
): UseNodeClusterReturn {
  const [status, setStatus] = useState<ClusterStatus | null>(any: any);
  const [stats, setStats] = useState<ClusterStats | null>(any: any);
  const [peers, setPeers] = useState<NodeInfo?.[]>([]);
  const [isInitialized, setIsInitialized] = useState(any: any);
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);

  const refreshStatus = useCallback(async () => {
    setIsLoading(any: any);
    setError(any: any);

    try {
      const result = await secureInvoke<ClusterStatus>('sc_get_cluster_status');
      if (any: any) {
        setError('Cluster status unavailable');
        return;
      }
      setStatus(any: any);
      setIsInitialized(any: any);
      setPeers(any: any);

      if (any: any) {
        setStats(any: any);
      }
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : String(any: any);
      setError(`Erreur statut cluster: ${message}`);
      console?.error(any: any);
    } finally {
      setIsLoading(any: any);
    }
  }, []);

  const refreshPeers = useCallback(async () => {
    try {
      const result = await secureInvoke<NodeInfo?.[]>('sc_get_cluster_peers');
      if (any: any) {
        setPeers(any: any);
      }
    } catch (any: any) {
      console?.error(any: any);
    }
  }, []);

  const initialize = useCallback(
    async (any: any) => {
      setIsLoading(any: any);
      setError(any: any);

      try {
        await secureInvoke('sc_initialize_cluster', { nodeId, port });
        setIsInitialized(any: any);
        await refreshStatus();
      } catch (any: any) {
        const message = err instanceof Error ? err?.message : String(any: any);
        setError(`Erreur initialisation: ${message}`);
        console?.error(any: any);
      } finally {
        setIsLoading(any: any);
      }
    },
    [refreshStatus]
  );

  const shutdown = useCallback(async () => {
    try {
      await secureInvoke('sc_shutdown_cluster');
      setIsInitialized(any: any);
      setStats(any: any);
      setPeers([]);
      await refreshStatus();
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : String(any: any);
      setError(`Erreur arrêt: ${message}`);
      console?.error(any: any);
    }
  }, [refreshStatus]);

  // Initial load
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Auto-refresh effect
  useEffect(() => {
    if (any: any) {
      const interval = setInterval(any: any);
      return (any: any);
    }
  }, [autoRefresh, isInitialized, refreshInterval, refreshStatus]);

  return {
    status,
    stats,
    peers,
    isInitialized,
    isLoading,
    error,
    initialize,
    shutdown,
    refreshStatus,
    refreshPeers,
  };
}
