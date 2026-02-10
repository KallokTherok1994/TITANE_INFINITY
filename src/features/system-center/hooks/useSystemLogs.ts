/**
 * TITANE∞ v∞ — useSystemLogs Hook
 *
 * Hook pour la gestion des logs système
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback, useEffect } from 'react';
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

  const refreshLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [logsResult, statsResult] = await Promise.all([
        tauriClient.scGetLogs({ filter }) as Promise<LogEntry[]>,
        tauriClient.scGetLogStats() as Promise<LogStats>,
      ]);

      setLogs(logsResult);
      setStats(statsResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Erreur chargement logs: ${message}`);
      console.error('[useSystemLogs] Refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
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

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      refreshLogs();
      const interval = setInterval(refreshLogs, refreshInterval);
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
