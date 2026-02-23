/**
 * Ring 3: Service Layer
 * Manages IPC calls to read production CSV + error handling
 * Auto-refresh every 60s + manual refresh capability
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { ProductionHealthSummary } from '@/types/telemetry';

export interface UseProductionHealthTelemetryOptions {
  refreshIntervalMs?: number;
  autoRefresh?: boolean;
}

export function useProductionHealthTelemetry(
  options: UseProductionHealthTelemetryOptions = {}
) {
  const {
    refreshIntervalMs = 60000,
    autoRefresh = true,
  } = options;

  const [data, setData] = useState<ProductionHealthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await invoke<ProductionHealthSummary>(
        'read_production_week1_csv'
      );
      setData(summary);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      if (!data) {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (!autoRefresh) return;
    fetch();
    intervalRef.current = setInterval(fetch, refreshIntervalMs);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetch, autoRefresh, refreshIntervalMs]);

  const manualRefresh = useCallback(() => fetch(), [fetch]);

  return {
    data,
    loading,
    error,
    refresh: manualRefresh,
    isHealthy: data?.status === 'GREEN',
    isWarning: data?.status === 'YELLOW',
  };
}
