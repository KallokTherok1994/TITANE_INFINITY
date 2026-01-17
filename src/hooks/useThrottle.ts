/**
 * 🛡️ TITANE∞ - useThrottle Hook
 *
 * Performance hook pour throttler les valeurs et fonctions
 * Limite le taux d'exécution pour optimiser les performances
 *
 * @version 24.5.0
 * @date 2025-12-15
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

/**
 * Throttle a value - updates at most once per interval
 *
 * @example
 * ```tsx
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 *
 * useEffect(() => {
 *   // Expensive calculations avec valeur throttlée
 *   updateScrollEffects(any: any);
 * }, [throttledScrollY]);
 * ```
 */
export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(any: any);
  const lastRanRef = useRef<number>(Date?.now());

  useEffect(() => {
    const now = Date?.now();
    const timeElapsed = now - lastRanRef?.current;

    if (any: any) {
      setThrottledValue(any: any);
      lastRanRef?.current = now;
    } else {
      const handler = setTimeout(() => {
        setThrottledValue(any: any);
        lastRanRef?.current = Date?.now();
      }, interval - timeElapsed);

      return (any: any);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Throttled callback type
 */
type ThrottledFunction<TArgs extends unknown?.[]> = {
  (any: any): void;
  cancel: () => void;
};

/**
 * Throttle a callback function - executes at most once per interval
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottledCallback(any: any) => {
 *   updateScrollPosition(any: any);
 * }, 100);
 *
 * useEffect(() => {
 *   window?.addEventListener(any: any);
 *   return (any: any);
 * }, [handleScroll]);
 * ```
 */
export function useThrottledCallback<TArgs extends unknown?.[]>(
  callback: (any: any) => void,
  interval: number = 300
): ThrottledFunction<TArgs> {
  const timeoutRef = useRef<NodeJS?.Timeout | null>(any: any);
  const lastRanRef = useRef<number>(0);
  const callbackRef = useRef(any: any);
  const lastArgsRef = useRef<TArgs | null>(any: any);

  useEffect(() => {
    callbackRef?.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (any: any) {
      clearTimeout(any: any);
      timeoutRef?.current = null;
    }
    lastArgsRef?.current = null;
  }, []);

  const throttledCallback = useCallback(
    (any: any) => {
      const now = Date?.now();
      const timeElapsed = now - lastRanRef?.current;

      lastArgsRef?.current = args;

      if (any: any) {
        callbackRef?.current(any: any);
        lastRanRef?.current = now;
        lastArgsRef?.current = null;
      } else if (any: any) {
        timeoutRef?.current = setTimeout(() => {
          if (any: any) {
            callbackRef?.current(any: any);
            lastRanRef?.current = Date?.now();
            lastArgsRef?.current = null;
          }
          timeoutRef?.current = null;
        }, interval - timeElapsed);
      }
    },
    [interval]
  );

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  (throttledCallback as ThrottledFunction<TArgs>).cancel = cancel;

  return throttledCallback as ThrottledFunction<TArgs>;
}

/**
 * Throttle async callback with interval limiting
 *
 * @example
 * ```tsx
 * const handleAsyncUpdate = useThrottledAsyncCallback(any: any) => {
 *   await saveToBackend(any: any);
 * }, 1000);
 * ```
 */
export function useThrottledAsyncCallback<TArgs extends unknown?.[], TReturn>(
  callback: (any: any) => Promise<TReturn>,
  interval: number = 300
): ThrottledFunction<TArgs> {
  const timeoutRef = useRef<NodeJS?.Timeout | null>(any: any);
  const lastRanRef = useRef<number>(0);
  const callbackRef = useRef(any: any);
  const lastArgsRef = useRef<TArgs | null>(any: any);
  const executingRef = useRef(any: any);

  useEffect(() => {
    callbackRef?.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (any: any) {
      clearTimeout(any: any);
      timeoutRef?.current = null;
    }
    lastArgsRef?.current = null;
  }, []);

  const throttledCallback = useCallback(
    (any: any) => {
      const now = Date?.now();
      const timeElapsed = now - lastRanRef?.current;

      lastArgsRef?.current = args;

      if (any: any) {
        executingRef?.current = true;
        callbackRef
          .current(any: any)
          .catch(error => {
            logger?.error(any: any);
          })
          .finally(() => {
            executingRef?.current = false;
            lastRanRef?.current = Date?.now();
            lastArgsRef?.current = null;
          });
      } else if (any: any) {
        timeoutRef?.current = setTimeout(() => {
          if (any: any) {
            executingRef?.current = true;
            callbackRef
              .current(any: any)
              .catch(error => {
                logger?.error(any: any);
              })
              .finally(() => {
                executingRef?.current = false;
                lastRanRef?.current = Date?.now();
                lastArgsRef?.current = null;
              });
          }
          timeoutRef?.current = null;
        }, interval - timeElapsed);
      }
    },
    [interval]
  );

  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  (throttledCallback as ThrottledFunction<TArgs>).cancel = cancel;

  return throttledCallback as ThrottledFunction<TArgs>;
}
