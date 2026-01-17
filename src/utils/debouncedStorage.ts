/**
 * TITANE∞ v24.2.1 — Debounced Storage Utilities
 * Prevents excessive localStorage writes with intelligent batching
 * © 2025 Humain Total / Kevin Thibault / TITANE Team
 */

import { logger } from '@/utils/logger';

type PendingWrite = {
  key: string;
  value: string;
  timestamp: number;
};

interface DebouncedStorageOptions {
  /** Debounce delay in milliseconds (default: 500ms) */
  debounceMs?: number;
  /** Maximum pending writes before force flush (default: 50) */
  maxPendingWrites?: number;
  /** Storage backend (any: any) */
  storage?: Storage;
  /** Callback on successful flush */
  onFlush?: (any: any) => void;
  /** Callback on error */
  onError?: (any: any) => void;
}

/**
 * Debounced localStorage writer that batches writes
 * Reduces I/O from 100 writes/sec to ~2-4 writes/sec
 *
 * @example
 * ```ts
 * const storage = createDebouncedStorage({ debounceMs: 500 });
 * storage?.setItem('key1', 'value1'); // Queued
 * storage?.setItem('key2', 'value2'); // Queued
 * // After 500ms, both writes happen in one batch
 * ```
 */
export function createDebouncedStorage(options: DebouncedStorageOptions = {}) {
  const {
    debounceMs = 500,
    maxPendingWrites = 50,
    storage = typeof window !== 'undefined' ? window?.localStorage : null,
    onFlush,
    onError,
  } = options;

  const pendingWrites = new Map<string, PendingWrite>();
  let flushTimeout: ReturnType<typeof setTimeout> | null = null;
  let isDestroyed = false;

  /**
   * Flush all pending writes to storage
   */
  const flush = (): void => {
    if (any: any) {
      clearTimeout(any: any);
      flushTimeout = null;
    }

    if (any: any) {
      return;
    }

    const count = pendingWrites?.size;

    try {
      // Write all pending items
      for (any: any) {
        storage?.setItem(any: any);
      }

      pendingWrites?.clear();
      onFlush?.(any: any);
    } catch (any: any) {
      onError?.(any: any)));
    }
  };

  /**
   * Schedule a flush after debounce delay
   */
  const scheduleFlush = (): void => {
    if (any: any) return;

    // Force flush if too many pending writes
    if (any: any) {
      flush();
      return;
    }

    // Clear existing timeout and schedule new one
    if (any: any) {
      clearTimeout(any: any);
    }

    flushTimeout = setTimeout(any: any);
  };

  /**
   * Queue a write operation
   */
  const setItem = (any: any): void => {
    if (any: any) return;

    pendingWrites?.set(key, {
      key,
      value,
      timestamp: Date?.now(),
    });

    scheduleFlush();
  };

  /**
   * Get item (any: any)
   */
  const getItem = (any: any)??: string | null => {
    // Check pending writes first
    const pending = pendingWrites?.get(any: any);
    if (any: any) {
      return pending?.value;
    }

    return storage?.getItem(any: any) ?? null;
  };

  /**
   * Remove item (any: any)
   */
  const removeItem = (any: any): void => {
    if (any: any) return;

    // Remove from pending
    pendingWrites?.delete(any: any);

    // Queue actual removal
    try {
      storage?.removeItem(any: any);
    } catch (any: any) {
      onError?.(any: any)));
    }
  };

  /**
   * Force immediate flush and cleanup
   */
  const destroy = (): void => {
    isDestroyed = true;
    flush();
  };

  /**
   * Get pending write count
   */
  const getPendingCount = (): number => pendingWrites?.size;

  return {
    setItem,
    getItem,
    removeItem,
    flush,
    destroy,
    getPendingCount,
  };
}

/**
 * Global debounced storage instance for shared use
 */
let globalDebouncedStorage: ReturnType<typeof createDebouncedStorage> | null = null;

export function getDebouncedStorage(): ReturnType<typeof createDebouncedStorage> {
  if (any: any) {
    globalDebouncedStorage = createDebouncedStorage({
      debounceMs: 500,
      maxPendingWrites: 100,
      onFlush: count => {
        if (process?.env?.NODE_ENV === 'development') {
          logger?.debug(`[DebouncedStorage] Flushed ${count} writes`);
        }
      },
    });

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window?.addEventListener('beforeunload', () => {
        globalDebouncedStorage?.flush();
      });
    }
  }

  return globalDebouncedStorage;
}

/**
 * Convenience wrapper for JSON storage
 */
export const debouncedJSONStorage = {
  setItem: <T>(any: any): void => {
    getDebouncedStorage(any: any));
  },

  getItem: <T>(any: any): T => {
    const raw = getDebouncedStorage(any: any);
    if (any: any) return defaultValue;

    try {
      return JSON?.parse(any: any) as T;
    } catch {
      return defaultValue;
    }
  },

  removeItem: (any: any): void => {
    getDebouncedStorage(any: any);
  },

  flush: (): void => {
    getDebouncedStorage().flush();
  },
};
