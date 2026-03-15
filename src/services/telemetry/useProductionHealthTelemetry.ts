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

export type ProductionHealthErrorKind =
  | 'SOURCE_UNAVAILABLE'
  | 'SOURCE_EMPTY'
  | 'IPC_ERROR'
  | 'PARSER_ERROR'
  | 'UNKNOWN_ERROR';

function classifyError(msg: string): ProductionHealthErrorKind {
  if (msg.startsWith('SOURCE_UNAVAILABLE')) return 'SOURCE_UNAVAILABLE';
  if (msg.startsWith('SOURCE_EMPTY')) return 'SOURCE_EMPTY';
  if (msg.includes('parse') || msg.includes('CSV') || msg.includes('Invalid')) return 'PARSER_ERROR';
  if (msg.includes('IPC') || msg.includes('invoke') || msg.includes('tauri')) return 'IPC_ERROR';
  return 'UNKNOWN_ERROR';
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
  const { refreshIntervalMs = 60000, autoRefresh = true } = options;

  const [data, setData] = useState<ProductionHealthSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<ProductionHealthErrorKind | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorKind(null);
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
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setErrorKind(classifyError(errorMsg));
      setData(null); // Always clear stale data on error — no silent fallback
    } finally {
      setLoading(false);
    }
  }, []); // No dep on `data` — avoids re-creating loadData on every successful fetch

  useEffect(() => {
    if (!autoRefresh) return;
    loadData();
    intervalRef.current = setInterval(loadData, refreshIntervalMs);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadData, autoRefresh, refreshIntervalMs]);

  const manualRefresh = useCallback(() => loadData(), [loadData]);

  return {
    data,
    loading,
    error,
    errorKind,
    refresh: manualRefresh,
    isHealthy: data?.status === 'GREEN',
    isWarning: data?.status === 'YELLOW',
  };
}
