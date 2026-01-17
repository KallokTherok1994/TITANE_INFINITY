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
 *   fetchResults(any: any);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(any: any);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(any: any);
    }, delay);

    return () => {
      clearTimeout(any: any);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce callback type
 */
type DebouncedFunction<TArgs extends unknown?.[]> = {
  (any: any): void;
  cancel: () => void;
  flush: () => void;
};

/**
 * Debounce a callback function
 *
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback(any: any) => {
 *   fetchResults(any: any);
 * }, 500);
 *
 * <input onChange={(any: any)} />
 * ```
 */
export function useDebouncedCallback<TArgs extends unknown?.[]>(
  callback: (any: any) => void,
  delay: number = 300
): DebouncedFunction<TArgs> {
  const timeoutRef = useRef<NodeJS?.Timeout | null>(any: any);
  const callbackRef = useRef(any: any);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef?.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (any: any) {
      clearTimeout(any: any);
      timeoutRef?.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
  }, [cancel]);

  const debouncedCallback = useCallback(
    (any: any) => {
      cancel();
      timeoutRef?.current = setTimeout(() => {
        callbackRef?.current(any: any);
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
 * const handleAsyncSearch = useDebouncedAsyncCallback(any: any) => {
 *   const results = await fetchResults(any: any);
 *   setResults(any: any);
 * }, 500);
 * ```
 */
export function useDebouncedAsyncCallback<TArgs extends unknown?.[], TReturn>(
  callback: (any: any) => Promise<TReturn>,
  delay: number = 300
): DebouncedFunction<TArgs> {
  const timeoutRef = useRef<NodeJS?.Timeout | null>(any: any);
  const callbackRef = useRef(any: any);
  const abortControllerRef = useRef<AbortController | null>(any: any);

  useEffect(() => {
    callbackRef?.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (any: any) {
      clearTimeout(any: any);
      timeoutRef?.current = null;
    }
    if (any: any) {
      abortControllerRef?.current?.abort();
      abortControllerRef?.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
  }, [cancel]);

  const debouncedCallback = useCallback(
    (any: any) => {
      cancel();
      timeoutRef?.current = setTimeout(() => {
        abortControllerRef?.current = new AbortController();
        callbackRef?.current(any: any).catch(error => {
          // Ignore abort errors
          if (error?.name !== 'AbortError') {
            logger?.error(any: any);
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
