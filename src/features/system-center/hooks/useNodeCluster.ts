/**
 * TITANE∞ v∞ — useNodeCluster Hook
 *
 * Hook pour la gestion du cluster de nœuds
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';
import type { ClusterStatus, ClusterStats, NodeInfo } from '../types/systemCenter.types';

export interface UseNodeClusterReturn {
  // State
  status: ClusterStatus | null;
  stats: ClusterStats | null;
  peers: NodeInfo[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: (nodeId: string, port: number) => Promise<void>;
  shutdown: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  refreshPeers: () => Promise<void>;
}

export function useNodeCluster(
  autoRefresh = false,
  refreshInterval = 5000
): UseNodeClusterReturn {
  const [status, setStatus] = useState<ClusterStatus | null>(null);
  const [stats, setStats] = useState<ClusterStats | null>(null);
  const [peers, setPeers] = useState<NodeInfo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await secureInvoke<ClusterStatus>('sc_get_cluster_status');
      if (!result) {
        setError('Cluster status unavailable');
        return;
      }
      setStatus(result);
      setIsInitialized(result.initialized);
      setPeers(result.peers);

      if (result.stats) {
        setStats(result.stats);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Erreur statut cluster: ${message}`);
      console.error('[useNodeCluster] Status refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshPeers = useCallback(async () => {
    try {
      const result = await secureInvoke<NodeInfo[]>('sc_get_cluster_peers');
      if (result) {
        setPeers(result);
      }
    } catch (err) {
      console.error('[useNodeCluster] Peers refresh failed:', err);
    }
  }, []);

  const initialize = useCallback(
    async (nodeId: string, port: number) => {
      setIsLoading(true);
      setError(null);

      try {
        await secureInvoke('sc_initialize_cluster', { nodeId, port });
        setIsInitialized(true);
        await refreshStatus();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Erreur initialisation: ${message}`);
        console.error('[useNodeCluster] Initialize failed:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshStatus]
  );

  const shutdown = useCallback(async () => {
    try {
      await secureInvoke('sc_shutdown_cluster');
      setIsInitialized(false);
      setStats(null);
      setPeers([]);
      await refreshStatus();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Erreur arrêt: ${message}`);
      console.error('[useNodeCluster] Shutdown failed:', err);
    }
  }, [refreshStatus]);

  // Initial load
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && isInitialized) {
      const interval = setInterval(refreshStatus, refreshInterval);
      return () => clearInterval(interval);
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
