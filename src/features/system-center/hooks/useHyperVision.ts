/**
 * TITANE∞ v∞ — useHyperVision Hook
 *
 * Hook pour le monitoring système temps réel
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import type {
  HyperVisionState,
  SystemMetrics,
  LayerHealth,
  Anomaly,
} from '../types/systemCenter.types';

export interface UseHyperVisionReturn {
  // State
  state: HyperVisionState | null;
  metrics: SystemMetrics | null;
  metricsHistory: SystemMetrics[];
  layers: LayerHealth[];
  anomalies: Anomaly[];
  isMonitoring: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  refreshLayers: () => Promise<void>;
  refreshAnomalies: (includeResolved?: boolean) => Promise<void>;
  clearAnomalies: () => Promise<void>;
  resolveAnomaly: (id: string) => Promise<void>;
}

export function useHyperVision(
  autoRefresh = true,
  refreshInterval = 2000
): UseHyperVisionReturn {
  const [state, setState] = useState<HyperVisionState | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<SystemMetrics[]>([]);
  const [layers, setLayers] = useState<LayerHealth[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshState = useCallback(async () => {
    try {
      const result = (await tauriClient.scHypervisionGetState()) as HyperVisionState;
      setState(result);
      setIsMonitoring(result.is_monitoring);
    } catch (err) {
      console.error('[useHyperVision] State refresh failed:', err);
    }
  }, []);

  const refreshMetrics = useCallback(async () => {
    try {
      const result = (await tauriClient.scHypervisionGetMetrics()) as SystemMetrics;
      setMetrics(result);

      // Update history (keep last 60 entries = 2 minutes at 2s interval)
      setMetricsHistory(prev => {
        const newHistory = [...prev, result];
        return newHistory.slice(-60);
      });
    } catch (err) {
      console.error('[useHyperVision] Metrics refresh failed:', err);
    }
  }, []);

  const refreshLayers = useCallback(async () => {
    try {
      const result = (await tauriClient.scHypervisionGetLayers()) as LayerHealth[];
      setLayers(result);
    } catch (err) {
      console.error('[useHyperVision] Layers refresh failed:', err);
    }
  }, []);

  const refreshAnomalies = useCallback(async (includeResolved = false) => {
    try {
      const result = (await tauriClient.scHypervisionGetAnomalies({
        includeResolved,
      })) as Anomaly[];
      setAnomalies(result);
    } catch (err) {
      console.error('[useHyperVision] Anomalies refresh failed:', err);
    }
  }, []);

  const startMonitoring = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = (await tauriClient.scHypervisionStart()) as HyperVisionState;
      setState(result);
      setIsMonitoring(true);

      // Start polling
      if (autoRefresh && !intervalRef.current) {
        intervalRef.current = setInterval(async () => {
          await Promise.all([refreshMetrics(), refreshLayers(), refreshAnomalies()]);
        }, refreshInterval);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Erreur démarrage: ${message}`);
      console.error('[useHyperVision] Start failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [autoRefresh, refreshInterval, refreshMetrics, refreshLayers, refreshAnomalies]);

  const stopMonitoring = useCallback(async () => {
    try {
      await tauriClient.scHypervisionStop();
      setIsMonitoring(false);

      // Stop polling
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      await refreshState();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Erreur arrêt: ${message}`);
      console.error('[useHyperVision] Stop failed:', err);
    }
  }, [refreshState]);

  const clearAnomalies = useCallback(async () => {
    try {
      await tauriClient.scHypervisionClearAnomalies();
      setAnomalies([]);
    } catch (err) {
      console.error('[useHyperVision] Clear anomalies failed:', err);
    }
  }, []);

  const resolveAnomaly = useCallback(
    async (id: string) => {
      try {
        await tauriClient.scHypervisionResolveAnomaly({ anomalyId: id });
        await refreshAnomalies();
      } catch (err) {
        console.error('[useHyperVision] Resolve anomaly failed:', err);
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
