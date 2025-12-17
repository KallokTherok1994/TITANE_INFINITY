/**
 * TITANE_INFINITY v∞.42 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   useUnifiedMemory — React Hook for UnifiedMemory
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * React hook for accessing unified memory system
 * Provides reactive state management and automatic cleanup
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  UnifiedMemory,
  UnifiedMemoryEntry,
  UnifiedMemoryQuery,
  UnifiedMemoryResult,
  UnifiedMemoryContext,
  UnifiedMemoryStats,
} from '../services/unified';

/**
 * Hook state
 */
interface UseUnifiedMemoryState {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  stats: UnifiedMemoryStats | null;
}

/**
 * Hook return type
 */
interface UseUnifiedMemoryReturn extends UseUnifiedMemoryState {
  // Core operations
  createMemory: (
    params: Parameters<UnifiedMemory['createMemory']>[0]
  ) => Promise<UnifiedMemoryEntry | null>;
  retrieveMemories: (query: UnifiedMemoryQuery) => Promise<UnifiedMemoryResult[]>;
  updateMemory: (id: string, updates: Partial<UnifiedMemoryEntry>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;

  // Context building
  buildContext: (
    query: string,
    options?: UnifiedMemoryQuery
  ) => Promise<UnifiedMemoryContext | null>;

  // Maintenance
  cleanup: () => Promise<number>;
  consolidate: () => Promise<number>;
  decay: () => Promise<number>;

  // Statistics
  refreshStats: () => Promise<void>;

  // Utility
  reset: () => void;
}

/**
 * React hook for UnifiedMemory
 *
 * @param memory UnifiedMemory instance (must be initialized externally)
 * @param autoRefreshStats Auto-refresh stats interval (ms), default: 60000 (1min)
 */
// ✨ v24.3.7: Minimum interval to prevent excessive memory operations
const MIN_REFRESH_INTERVAL = 5000; // 5s minimum

export function useUnifiedMemory(
  memory: UnifiedMemory | null,
  autoRefreshStats = 60000
): UseUnifiedMemoryReturn {
  // ✨ v24.3.7: Validate and clamp refresh interval
  const safeRefreshInterval =
    autoRefreshStats > 0 ? Math.max(autoRefreshStats, MIN_REFRESH_INTERVAL) : 0;

  const [state, setState] = useState<UseUnifiedMemoryState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    stats: null,
  });

  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Refresh statistics
   */
  const refreshStats = useCallback(async (): Promise<void> => {
    if (!memory) return;

    try {
      const stats = await memory.getStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('[useUnifiedMemory] Failed to refresh stats:', error);
    }
  }, [memory]);

  // Initialize
  useEffect(() => {
    if (!memory) {
      setState(prev => ({ ...prev, isInitialized: false }));
      return;
    }

    setState(prev => ({ ...prev, isInitialized: true }));

    // Initial stats fetch
    refreshStats();

    // ✨ v24.3.7: Use validated interval (min 5s) to prevent excessive operations
    if (safeRefreshInterval > 0) {
      statsIntervalRef.current = setInterval(refreshStats, safeRefreshInterval);
    }

    // Cleanup on unmount
    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [memory, safeRefreshInterval, refreshStats]);

  /**
   * Create memory
   */
  const createMemory = useCallback(
    async (
      params: Parameters<UnifiedMemory['createMemory']>[0]
    ): Promise<UnifiedMemoryEntry | null> => {
      if (!memory) {
        setState(prev => ({ ...prev, error: new Error('Memory not initialized') }));
        return null;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const entry = await memory.createMemory(params);
        setState(prev => ({ ...prev, isLoading: false }));

        // Refresh stats
        refreshStats();

        return entry;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
        return null;
      }
    },
    [memory, refreshStats]
  );

  /**
   * Retrieve memories
   */
  const retrieveMemories = useCallback(
    async (query: UnifiedMemoryQuery): Promise<UnifiedMemoryResult[]> => {
      if (!memory) return [];

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const results = await memory.retrieveMemories(query);
        setState(prev => ({ ...prev, isLoading: false }));
        return results;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
        return [];
      }
    },
    [memory]
  );

  /**
   * Update memory
   */
  const updateMemory = useCallback(
    async (id: string, updates: Partial<UnifiedMemoryEntry>): Promise<void> => {
      if (!memory) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        await memory.updateMemory(id, updates);
        setState(prev => ({ ...prev, isLoading: false }));

        // Refresh stats
        refreshStats();
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
      }
    },
    [memory, refreshStats]
  );

  /**
   * Delete memory
   */
  const deleteMemory = useCallback(
    async (id: string): Promise<void> => {
      if (!memory) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        await memory.deleteMemory(id);
        setState(prev => ({ ...prev, isLoading: false }));

        // Refresh stats
        refreshStats();
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
      }
    },
    [memory, refreshStats]
  );

  /**
   * Build context for OMEGA
   */
  const buildContext = useCallback(
    async (
      query: string,
      options?: UnifiedMemoryQuery
    ): Promise<UnifiedMemoryContext | null> => {
      if (!memory) return null;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const context = await memory.buildContext(query, options);
        setState(prev => ({ ...prev, isLoading: false }));
        return context;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
        return null;
      }
    },
    [memory]
  );

  /**
   * Cleanup
   */
  const cleanup = useCallback(async (): Promise<number> => {
    if (!memory) return 0;

    try {
      const deleted = await memory.cleanup();

      // Refresh stats
      refreshStats();

      return deleted;
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
      return 0;
    }
  }, [memory, refreshStats]);

  /**
   * Consolidate
   */
  const consolidate = useCallback(async (): Promise<number> => {
    if (!memory) return 0;

    try {
      const merged = await memory.consolidate();

      // Refresh stats
      refreshStats();

      return merged;
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
      return 0;
    }
  }, [memory, refreshStats]);

  /**
   * Decay
   */
  const decay = useCallback(async (): Promise<number> => {
    if (!memory) return 0;

    try {
      const decayed = await memory.decay();

      // Refresh stats
      refreshStats();

      return decayed;
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
      return 0;
    }
  }, [memory, refreshStats]);

  /**
   * Reset state
   */
  const reset = useCallback((): void => {
    setState({
      isInitialized: false,
      isLoading: false,
      error: null,
      stats: null,
    });
  }, []);

  return {
    ...state,
    createMemory,
    retrieveMemories,
    updateMemory,
    deleteMemory,
    buildContext,
    cleanup,
    consolidate,
    decay,
    refreshStats,
    reset,
  };
}

/**
 * Hook for memory statistics only (lightweight)
 */
export function useUnifiedMemoryStats(
  memory: UnifiedMemory | null,
  refreshInterval = 60000
): {
  stats: UnifiedMemoryStats | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [stats, setStats] = useState<UnifiedMemoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!memory) return;

    setIsLoading(true);
    setError(null);

    try {
      const newStats = await memory.getStats();
      setStats(newStats);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [memory]);

  useEffect(() => {
    if (!memory) return;

    // Initial fetch
    refresh();

    // Setup interval
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(refresh, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [memory, refreshInterval, refresh]);

  return { stats, isLoading, error, refresh };
}
