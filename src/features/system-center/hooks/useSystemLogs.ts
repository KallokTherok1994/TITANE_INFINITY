/**
 * TITANE∞ v∞ — useSystemLogs Hook
 *
 * Hook pour la gestion des logs système
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import type {
  LogEntry,
  LogFilter,
  LogStats,
  LogLevel,
} from '../types/systemCenter.types';

export interface UseSystemLogsReturn {
  // State
  logs: LogEntry[];
  stats: LogStats | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filter: LogFilter;
  setFilter: (filter: LogFilter) => void;

  // Actions
  refreshLogs: () => Promise<void>;
  clearLogs: () => Promise<void>;
  addLog: (level: LogLevel, source: string, message: string) => Promise<void>;
}

export function useSystemLogs(
  autoRefresh = false,
  refreshInterval = 2000
): UseSystemLogsReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LogFilter>({ limit: 100 });
  const mountedRef = useRef(true);
  const refreshRequestRef = useRef<Promise<void> | null>(null);

  const refreshLogs = useCallback(async () => {
    if (refreshRequestRef.current) {
      return refreshRequestRef.current;
    }

    const request = (async () => {
      if (mountedRef.current) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const [logsResult, statsResult] = await Promise.all([
          tauriClient.scGetLogs({ filter }) as Promise<LogEntry[]>,
          tauriClient.scGetLogStats() as Promise<LogStats>,
        ]);

        if (!mountedRef.current) {
          return;
        }

        setLogs(logsResult);
        setStats(statsResult);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (mountedRef.current) {
          setError(`Erreur chargement logs: ${message}`);
        }
        console.error('[useSystemLogs] Refresh failed:', err);
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
        refreshRequestRef.current = null;
      }
    })();

    refreshRequestRef.current = request;
    return request;
  }, [filter]);

  const clearLogs = useCallback(async () => {
    try {
      await tauriClient.scClearLogs();
      setLogs([]);
      setStats({ total_entries: 0, by_level: {}, by_source: {} });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Erreur suppression logs: ${message}`);
      console.error('[useSystemLogs] Clear failed:', err);
    }
  }, []);

  const addLog = useCallback(
    async (level: LogLevel, source: string, message: string) => {
      try {
        await tauriClient.scAddLog({ level, source, message });
        // Refresh after adding
        await refreshLogs();
      } catch (err) {
        console.error('[useSystemLogs] Add log failed:', err);
      }
    },
    [refreshLogs]
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      void refreshLogs();
      const interval = setInterval(() => {
        void refreshLogs();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshLogs]);

  return {
    logs,
    stats,
    isLoading,
    error,
    filter,
    setFilter,
    refreshLogs,
    clearLogs,
    addLog,
  };
}
