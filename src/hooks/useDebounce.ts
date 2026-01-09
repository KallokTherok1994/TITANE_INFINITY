/**
 * 🛡️ TITANE∞ - useDebounce Hook
 *
 * Performance hook pour debouncer les valeurs et fonctions
 * Réduit les re-renders inutiles et optimise les event handlers
 *
 * @version 24.5.0
 * @date 2025-12-15
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

/**
 * Debounce a value - updates only after delay without changes
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 *
 * useEffect(() => {
 *   // API call avec valeur debouncée
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce callback type
 */
type DebouncedFunction<TArgs extends unknown[]> = {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => void;
};

/**
 * Debounce a callback function
 *
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   fetchResults(query);
 * }, 500);
 *
 * <input onChange={(e) => handleSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number = 300
): DebouncedFunction<TArgs> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
  }, [cancel]);

  const debouncedCallback = useCallback(
    (...args: TArgs) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, cancel]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  // Attach utility methods
  (debouncedCallback as DebouncedFunction<TArgs>).cancel = cancel;
  (debouncedCallback as DebouncedFunction<TArgs>).flush = flush;

  return debouncedCallback as DebouncedFunction<TArgs>;
}

/**
 * Debounce async callback with cancellation support
 *
 * @example
 * ```tsx
 * const handleAsyncSearch = useDebouncedAsyncCallback(async (query: string) => {
 *   const results = await fetchResults(query);
 *   setResults(results);
 * }, 500);
 * ```
 */
export function useDebouncedAsyncCallback<TArgs extends unknown[], TReturn>(
  callback: (...args: TArgs) => Promise<TReturn>,
  delay: number = 300
): DebouncedFunction<TArgs> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
  }, [cancel]);

  const debouncedCallback = useCallback(
    (...args: TArgs) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        abortControllerRef.current = new AbortController();
        callbackRef.current(...args).catch(error => {
          // Ignore abort errors
          if (error.name !== 'AbortError') {
            logger.error('Debounced async callback error:', error);
          }
        });
      }, delay);
    },
    [delay, cancel]
  );

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  (debouncedCallback as DebouncedFunction<TArgs>).cancel = cancel;
  (debouncedCallback as DebouncedFunction<TArgs>).flush = flush;

  return debouncedCallback as DebouncedFunction<TArgs>;
}
