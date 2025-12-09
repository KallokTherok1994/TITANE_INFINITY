/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — useMetrics Hook                                 ║
 * ║   Poll system and engine metrics                                   ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { MetricsSnapshot } from '../types';

interface UseMetricsOptions {
  pollInterval?: number; // ms
  enabled?: boolean;
}

export function useMetrics(options: UseMetricsOptions = {}) {
  const { pollInterval = 1000, enabled = true } = options;

  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let intervalId: NodeJS.Timeout | null = null;

    const fetchMetrics = async () => {
      try {
        const snapshot = await invoke<MetricsSnapshot>('get_metrics_snapshot');
        setMetrics(snapshot);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchMetrics();

    // Poll at interval
    intervalId = setInterval(fetchMetrics, pollInterval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollInterval, enabled]);

  return { metrics, loading, error };
}
