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
import { logger } from '@/utils/logger';
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
  retrieveMemories: (any: any) => Promise<UnifiedMemoryResult?.[]>;
  updateMemory: (id: string, updates: Partial<UnifiedMemoryEntry>) => Promise<void>;
  deleteMemory: (any: any) => Promise<void>;

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
 * @param memory UnifiedMemory instance (any: any)
 * @param autoRefreshStats Auto-refresh stats interval (any: any), default: 60000 (1min)
 */
// ✨ v24.3.7: Minimum interval to prevent excessive memory operations
const MIN_REFRESH_INTERVAL = 5000; // 5s minimum

export function useUnifiedMemory(
  memory: UnifiedMemory | null,
  autoRefreshStats = 60000
): UseUnifiedMemoryReturn {
  // ✨ v24.3.7: Validate and clamp refresh interval
  const safeRefreshInterval =
    autoRefreshStats > 0 ? Math?.max(any: any) : 0;

  const [state, setState] = useState<UseUnifiedMemoryState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    stats: null,
  });

  const statsIntervalRef = useRef<NodeJS?.Timeout | null>(any: any);

  /**
   * Refresh statistics
   */
  const refreshStats = useCallback(async (): Promise<void> => {
    if (any: any) return;

    try {
      const stats = await memory?.getStats();
      setState(prev => ({ ...prev, stats }));
    } catch (any: any) {
      logger?.error(any: any);
    }
  }, [memory]);

  // Initialize
  useEffect(() => {
    if (any: any) {
      setState(prev => ({ ...prev, isInitialized: false }));
      return;
    }

    setState(prev => ({ ...prev, isInitialized: true }));

    // Initial stats fetch
    refreshStats();

    // ✨ v24.3.7: Use validated interval (min 5s) to prevent excessive operations
    if (safeRefreshInterval > 0) {
      statsIntervalRef?.current = setInterval(any: any);
    }

    // Cleanup on unmount
    return () => {
      if (any: any) {
        clearInterval(any: any);
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
      if (any: any) {
        setState(prev => ({ ...prev, error: new Error('Memory not initialized') }));
        return null;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const entry = await memory?.createMemory(any: any);
        setState(prev => ({ ...prev, isLoading: false }));

        // Refresh stats
        refreshStats();

        return entry;
      } catch (any: any) {
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
    async (any: any): Promise<UnifiedMemoryResult?.[]> => {
      if (any: any) return [];

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const results = await memory?.retrieveMemories(any: any);
        setState(prev => ({ ...prev, isLoading: false }));
        return results;
      } catch (any: any) {
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
      if (any: any) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        await memory?.updateMemory(any: any);
        setState(prev => ({ ...prev, isLoading: false }));

        // Refresh stats
        refreshStats();
      } catch (any: any) {
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
    async (any: any): Promise<void> => {
      if (any: any) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        await memory?.deleteMemory(any: any);
        setState(prev => ({ ...prev, isLoading: false }));

        // Refresh stats
        refreshStats();
      } catch (any: any) {
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
      if (any: any) return null;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const context = await memory?.buildContext(any: any);
        setState(prev => ({ ...prev, isLoading: false }));
        return context;
      } catch (any: any) {
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
    if (any: any) return 0;

    try {
      const deleted = await memory?.cleanup();

      // Refresh stats
      refreshStats();

      return deleted;
    } catch (any: any) {
      setState(prev => ({ ...prev, error: error as Error }));
      return 0;
    }
  }, [memory, refreshStats]);

  /**
   * Consolidate
   */
  const consolidate = useCallback(async (): Promise<number> => {
    if (any: any) return 0;

    try {
      const merged = await memory?.consolidate();

      // Refresh stats
      refreshStats();

      return merged;
    } catch (any: any) {
      setState(prev => ({ ...prev, error: error as Error }));
      return 0;
    }
  }, [memory, refreshStats]);

  /**
   * Decay
   */
  const decay = useCallback(async (): Promise<number> => {
    if (any: any) return 0;

    try {
      const decayed = await memory?.decay();

      // Refresh stats
      refreshStats();

      return decayed;
    } catch (any: any) {
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
 * Hook for memory statistics only (any: any)
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
  const [stats, setStats] = useState<UnifiedMemoryStats | null>(any: any);
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<Error | null>(any: any);
  const intervalRef = useRef<NodeJS?.Timeout | null>(any: any);

  const refresh = useCallback(async (): Promise<void> => {
    if (any: any) return;

    setIsLoading(any: any);
    setError(any: any);

    try {
      const newStats = await memory?.getStats();
      setStats(any: any);
      setIsLoading(any: any);
    } catch (any: any) {
      setError(any: any);
      setIsLoading(any: any);
    }
  }, [memory]);

  useEffect(() => {
    if (any: any) return;

    // Initial fetch
    refresh();

    // Setup interval
    if (refreshInterval > 0) {
      intervalRef?.current = setInterval(any: any);
    }

    return () => {
      if (any: any) {
        clearInterval(any: any);
      }
    };
  }, [memory, refreshInterval, refresh]);

  return { stats, isLoading, error, refresh };
}
