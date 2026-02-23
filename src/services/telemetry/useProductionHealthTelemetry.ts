/**
 * Ring 3: Service Layer
 * Manages IPC calls to read production CSV + error handling
 * Auto-refresh every 60s + manual refresh capability
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import type { ProductionHealthSummary } from '@/types/telemetry';

export interface UseProductionHealthTelemetryOptions {
  refreshIntervalMs?: number;
  autoRefresh?: boolean;
}

function isProductionHealthSummary(value: unknown): value is ProductionHealthSummary {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.status === 'string' &&
    typeof candidate.windowStartIso === 'string' &&
    typeof candidate.windowEndIso === 'string' &&
    typeof candidate.initialRssMb === 'number' &&
    typeof candidate.growthMb === 'number' &&
    typeof candidate.growthPercent === 'number' &&
    typeof candidate.samplesCollected === 'number' &&
    candidate.lastSample !== null &&
    typeof candidate.lastSample === 'object'
  );
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
      const response = await tauriClient.readProductionWeek1Csv();
      if (
        response &&
        typeof response === 'object' &&
        'ok' in (response as Record<string, unknown>)
      ) {
        const envelope = response as {
          ok?: boolean;
          error?: { message?: string } | string;
        };
        if (!envelope.ok) {
          const envelopeError =
            typeof envelope.error === 'string'
              ? envelope.error
              : envelope.error?.message || 'IPC error';
          throw new Error(envelopeError);
        }
      }

      if (!isProductionHealthSummary(response)) {
        throw new Error('Invalid telemetry payload');
      }

      const summary = response;
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
