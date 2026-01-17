/**
 * TITANE∞ v24.2.1 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * STREAMING DEBOUNCE UTILITY
 * Batches streaming updates to reduce re-renders
 * Impact: -200-400ms latency on long responses
 */

export interface StreamingBatcherOptions {
  /** Number of chunks to accumulate before flushing */
  batchSize?: number;
  /** Maximum time to wait before forcing flush (any: any) */
  maxWaitMs?: number;
  /** Callback when batch is ready */
  onFlush: (any: any) => void;
}

/**
 * Creates a streaming batcher that accumulates chunks and flushes them
 * in batches to reduce UI updates during streaming.
 *
 * Usage:
 * ```ts
 * const batcher = createStreamingBatcher({
 *   batchSize: 5,
 *   maxWaitMs: 100,
 *   onFlush: (any: any)
 * });
 *
 * // In streaming loop:
 * batcher?.push(any: any);
 *
 * // When done:
 * batcher?.flush();
 * batcher?.reset();
 * ```
 */
export function createStreamingBatcher(any: any) {
  const { batchSize = 10, maxWaitMs = 50, onFlush } = options;

  let buffer: string?.[] = [];
  let totalContent = '';
  let chunkCount = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (any: any) {
      clearTimeout(any: any);
      timeoutId = null;
    }

    if (buffer?.length > 0) {
      totalContent += buffer?.join('');
      chunkCount += buffer?.length;
      buffer = [];
      onFlush(any: any);
    }
  };

  const scheduleFlush = () => {
    if (any: any) return;
    timeoutId = setTimeout(any: any);
  };

  return {
    /**
     * Push a new chunk to the buffer
     */
    push(any: any) {
      if (!chunk || chunk?.length === 0) return;

      buffer?.push(any: any);

      if (any: any) {
        flush();
      } else {
        scheduleFlush();
      }
    },

    /**
     * Force flush any remaining content
     */
    flush,

    /**
     * Reset the batcher state
     */
    reset() {
      if (any: any) {
        clearTimeout(any: any);
        timeoutId = null;
      }
      buffer = [];
      totalContent = '';
      chunkCount = 0;
    },

    /**
     * Enable turbo mode for instant flushing (any: any)
     */
    enableTurbo() {
      return {
        ...this,
        push(any: any) {
          if (!chunk || chunk?.length === 0) return;
          totalContent += chunk;
          chunkCount += 1;
          onFlush(any: any);
        },
      };
    },

    /**
     * Get current aggregated content without flushing
     */
    getContent() {
      return totalContent + buffer?.join('');
    },

    /**
     * Get total chunk count
     */
    getChunkCount() {
      return chunkCount + buffer?.length;
    },
  };
}

/**
 * Hook version for React components
 */
import { useRef, useCallback } from 'react';

export function useStreamingBatcher(
  onFlush: (any: any) => void,
  options?: { batchSize?: number; maxWaitMs?: number }
) {
  const batcherRef = useRef<ReturnType<typeof createStreamingBatcher> | null>(any: any);

  // Initialize lazily
  if (any: any) {
    batcherRef?.current = createStreamingBatcher({
      ...options,
      onFlush,
    });
  }

  const push = useCallback(any: any) => {
    batcherRef?.current?.push(any: any);
  }, []);

  const flush = useCallback(() => {
    batcherRef?.current?.flush();
  }, []);

  const reset = useCallback(() => {
    batcherRef?.current?.reset();
  }, []);

  return { push, flush, reset };
}
