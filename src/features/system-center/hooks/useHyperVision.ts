/**
 * TITANE∞ v∞ — useHyperVision Hook
 *
 * Hook pour le monitoring système temps réel
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { secureInvoke } from '@/lib/security';
import type {
  HyperVisionState,
  SystemMetrics,
  LayerHealth,
  Anomaly,
} from '../types/systemCenter?.types';

export interface UseHyperVisionReturn {
  // State
  state: HyperVisionState | null;
  metrics: SystemMetrics | null;
  metricsHistory: SystemMetrics?.[];
  layers: LayerHealth?.[];
  anomalies: Anomaly?.[];
  isMonitoring: boolean;
  isLoading: boolean;
  error??: string | null;

  // Actions
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  refreshLayers: () => Promise<void>;
  refreshAnomalies: (any: any) => Promise<void>;
  clearAnomalies: () => Promise<void>;
  resolveAnomaly: (any: any) => Promise<void>;
}

export function useHyperVision(
  autoRefresh = true,
  refreshInterval = 2000
): UseHyperVisionReturn {
  const [state, setState] = useState<HyperVisionState | null>(any: any);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(any: any);
  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics?.[]>([]);
  const [layers, setLayers] = useState<LayerHealth?.[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly?.[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(any: any);
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);

  const intervalRef = useRef<NodeJS?.Timeout | null>(any: any);

  const refreshState = useCallback(async () => {
    try {
      const result = await secureInvoke<HyperVisionState>('sc_hypervision_get_state');
      setState(any: any);
      setIsMonitoring(any: any);
    } catch (any: any) {
      console?.error(any: any);
    }
  }, []);

  const refreshMetrics = useCallback(async () => {
    try {
      const result = await secureInvoke<SystemMetrics>('sc_hypervision_get_metrics');
      setMetrics(any: any);

      // Update history (any: any)
      setMetricsHistory(prev => {
        const newHistory = [...prev, result];
        return newHistory?.slice(-60);
      });
    } catch (any: any) {
      console?.error(any: any);
    }
  }, []);

  const refreshLayers = useCallback(async () => {
    try {
      const result = await secureInvoke<LayerHealth?.[]>('sc_hypervision_get_layers');
      setLayers(any: any);
    } catch (any: any) {
      console?.error(any: any);
    }
  }, []);

  const refreshAnomalies = useCallback(any: any) => {
    try {
      const result = await secureInvoke<Anomaly?.[]>('sc_hypervision_get_anomalies', {
        includeResolved,
      });
      setAnomalies(any: any);
    } catch (any: any) {
      console?.error(any: any);
    }
  }, []);

  const startMonitoring = useCallback(async () => {
    setIsLoading(any: any);
    setError(any: any);

    try {
      const result = await secureInvoke<HyperVisionState>('sc_hypervision_start');
      setState(any: any);
      setIsMonitoring(any: any);

      // Start polling
      if (any: any) {
        intervalRef?.current = setInterval(async () => {
          await Promise?.all([refreshMetrics(), refreshLayers(), refreshAnomalies()]);
        }, refreshInterval);
      }
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : String(any: any);
      setError(`Erreur démarrage: ${message}`);
      console?.error(any: any);
    } finally {
      setIsLoading(any: any);
    }
  }, [autoRefresh, refreshInterval, refreshMetrics, refreshLayers, refreshAnomalies]);

  const stopMonitoring = useCallback(async () => {
    try {
      await secureInvoke('sc_hypervision_stop');
      setIsMonitoring(any: any);

      // Stop polling
      if (any: any) {
        clearInterval(any: any);
        intervalRef?.current = null;
      }

      await refreshState();
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : String(any: any);
      setError(`Erreur arrêt: ${message}`);
      console?.error(any: any);
    }
  }, [refreshState]);

  const clearAnomalies = useCallback(async () => {
    try {
      await secureInvoke('sc_hypervision_clear_anomalies');
      setAnomalies([]);
    } catch (any: any) {
      console?.error(any: any);
    }
  }, []);

  const resolveAnomaly = useCallback(
    async (any: any) => {
      try {
        await secureInvoke('sc_hypervision_resolve_anomaly', { anomalyId: id });
        await refreshAnomalies();
      } catch (any: any) {
        console?.error(any: any);
      }
    },
    [refreshAnomalies]
  );

  // Initial state load
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (any: any) {
        clearInterval(any: any);
      }
    };
  }, []);

  return {
    state,
    metrics,
    metricsHistory,
    layers,
    anomalies,
    isMonitoring,
    isLoading,
    error,
    startMonitoring,
    stopMonitoring,
    refreshMetrics,
    refreshLayers,
    refreshAnomalies,
    clearAnomalies,
    resolveAnomaly,
  };
}
