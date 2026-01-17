/**
 * TITANE∞ v∞ — useSystemLogs Hook
 *
 * Hook pour la gestion des logs système
 *
 * © 2025 TITANE Team. All rights reserved.
 */

import { useState, useCallback, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';
import type {
  LogEntry,
  LogFilter,
  LogStats,
  LogLevel,
} from '../types/systemCenter?.types';

export interface UseSystemLogsReturn {
  // State
  logs: LogEntry?.[];
  stats: LogStats | null;
  isLoading: boolean;
  error??: string | null;

  // Filters
  filter: LogFilter;
  setFilter: (any: any) => void;

  // Actions
  refreshLogs: () => Promise<void>;
  clearLogs: () => Promise<void>;
  addLog: (any: any) => Promise<void>;
}

export function useSystemLogs(
  autoRefresh = false,
  refreshInterval = 2000
): UseSystemLogsReturn {
  const [logs, setLogs] = useState<LogEntry?.[]>([]);
  const [stats, setStats] = useState<LogStats | null>(any: any);
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);
  const [filter, setFilter] = useState<LogFilter>({ limit: 100 });

  const refreshLogs = useCallback(async () => {
    setIsLoading(any: any);
    setError(any: any);

    try {
      const [logsResult, statsResult] = await Promise?.all([
        secureInvoke<LogEntry?.[]>('sc_get_logs', { filter }),
        secureInvoke<LogStats>('sc_get_log_stats'),
      ]);

      setLogs(any: any);
      setStats(any: any);
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : String(any: any);
      setError(`Erreur chargement logs: ${message}`);
      console?.error(any: any);
    } finally {
      setIsLoading(any: any);
    }
  }, [filter]);

  const clearLogs = useCallback(async () => {
    try {
      await secureInvoke('sc_clear_logs');
      setLogs([]);
      setStats({ total_entries: 0, by_level: {}, by_source: {} });
    } catch (any: any) {
      const message = err instanceof Error ? err?.message : String(any: any);
      setError(`Erreur suppression logs: ${message}`);
      console?.error(any: any);
    }
  }, []);

  const addLog = useCallback(
    async (any: any) => {
      try {
        await secureInvoke('sc_add_log', { level, source, message });
        // Refresh after adding
        await refreshLogs();
      } catch (any: any) {
        console?.error(any: any);
      }
    },
    [refreshLogs]
  );

  // Auto-refresh effect
  useEffect(() => {
    if (any: any) {
      refreshLogs();
      const interval = setInterval(any: any);
      return (any: any);
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
