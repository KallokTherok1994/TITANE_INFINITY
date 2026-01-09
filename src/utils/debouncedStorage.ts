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
  /** Storage backend (default: localStorage) */
  storage?: Storage;
  /** Callback on successful flush */
  onFlush?: (count: number) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Debounced localStorage writer that batches writes
 * Reduces I/O from 100 writes/sec to ~2-4 writes/sec
 *
 * @example
 * ```ts
 * const storage = createDebouncedStorage({ debounceMs: 500 });
 * storage.setItem('key1', 'value1'); // Queued
 * storage.setItem('key2', 'value2'); // Queued
 * // After 500ms, both writes happen in one batch
 * ```
 */
export function createDebouncedStorage(options: DebouncedStorageOptions = {}) {
  const {
    debounceMs = 500,
    maxPendingWrites = 50,
    storage = typeof window !== 'undefined' ? window.localStorage : null,
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
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }

    if (pendingWrites.size === 0 || !storage) {
      return;
    }

    const count = pendingWrites.size;

    try {
      // Write all pending items
      for (const [key, { value }] of pendingWrites) {
        storage.setItem(key, value);
      }

      pendingWrites.clear();
      onFlush?.(count);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  };

  /**
   * Schedule a flush after debounce delay
   */
  const scheduleFlush = (): void => {
    if (isDestroyed) return;

    // Force flush if too many pending writes
    if (pendingWrites.size >= maxPendingWrites) {
      flush();
      return;
    }

    // Clear existing timeout and schedule new one
    if (flushTimeout) {
      clearTimeout(flushTimeout);
    }

    flushTimeout = setTimeout(flush, debounceMs);
  };

  /**
   * Queue a write operation
   */
  const setItem = (key: string, value: string): void => {
    if (isDestroyed || !storage) return;

    pendingWrites.set(key, {
      key,
      value,
      timestamp: Date.now(),
    });

    scheduleFlush();
  };

  /**
   * Get item (reads from storage directly, checks pending first)
   */
  const getItem = (key: string): string | null => {
    // Check pending writes first
    const pending = pendingWrites.get(key);
    if (pending) {
      return pending.value;
    }

    return storage?.getItem(key) ?? null;
  };

  /**
   * Remove item (queues removal)
   */
  const removeItem = (key: string): void => {
    if (isDestroyed || !storage) return;

    // Remove from pending
    pendingWrites.delete(key);

    // Queue actual removal
    try {
      storage.removeItem(key);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
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
  const getPendingCount = (): number => pendingWrites.size;

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
  if (!globalDebouncedStorage) {
    globalDebouncedStorage = createDebouncedStorage({
      debounceMs: 500,
      maxPendingWrites: 100,
      onFlush: count => {
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`[DebouncedStorage] Flushed ${count} writes`);
        }
      },
    });

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
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
  setItem: <T>(key: string, value: T): void => {
    getDebouncedStorage().setItem(key, JSON.stringify(value));
  },

  getItem: <T>(key: string, defaultValue: T): T => {
    const raw = getDebouncedStorage().getItem(key);
    if (!raw) return defaultValue;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  removeItem: (key: string): void => {
    getDebouncedStorage().removeItem(key);
  },

  flush: (): void => {
    getDebouncedStorage().flush();
  },
};
