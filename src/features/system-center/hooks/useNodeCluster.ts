/**
 * TITANE∞ v∞ — useNodeCluster Hook
 *
 * Hook pour la gestion du cluster de nœuds
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { tauriClient } from '@/lib/tauriClient';
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
  const mountedRef = useRef(true);
  const statusRequestRef = useRef<Promise<void> | null>(null);

  const refreshStatus = useCallback(async () => {
    if (statusRequestRef.current) {
      return statusRequestRef.current;
    }

    const request = (async () => {
      if (mountedRef.current) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const result = (await tauriClient.scGetClusterStatus()) as ClusterStatus;
        if (!result) {
          if (mountedRef.current) {
            setError('Cluster status unavailable');
          }
          return;
        }

        if (!mountedRef.current) {
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
        if (mountedRef.current) {
          setError(`Erreur statut cluster: ${message}`);
        }
        console.error('[useNodeCluster] Status refresh failed:', err);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        statusRequestRef.current = null;
      }
    })();

    statusRequestRef.current = request;
    return request;
  }, []);

  const refreshPeers = useCallback(async () => {
    try {
      const result = (await tauriClient.scGetClusterPeers()) as NodeInfo[];
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
        await tauriClient.scInitializeCluster({ nodeId, port });
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
      await tauriClient.scShutdownCluster();
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

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initial load
  useEffect(() => {
    void refreshStatus();
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
