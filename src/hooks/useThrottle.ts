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
 *   updateScrollEffects(throttledScrollY);
 * }, [throttledScrollY]);
 * ```
 */
export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRanRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeElapsed = now - lastRanRef.current;

    if (timeElapsed >= interval) {
      setThrottledValue(value);
      lastRanRef.current = now;
    } else {
      const handler = setTimeout(() => {
        setThrottledValue(value);
        lastRanRef.current = Date.now();
      }, interval - timeElapsed);

      return () => clearTimeout(handler);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Throttled callback type
 */
type ThrottledFunction<TArgs extends unknown[]> = {
  (...args: TArgs): void;
  cancel: () => void;
};

/**
 * Throttle a callback function - executes at most once per interval
 *
 * @example
 * ```tsx
 * const handleScroll = useThrottledCallback((event: Event) => {
 *   updateScrollPosition(window.scrollY);
 * }, 100);
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 * ```
 */
export function useThrottledCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  interval: number = 300
): ThrottledFunction<TArgs> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRanRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  const lastArgsRef = useRef<TArgs | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  const throttledCallback = useCallback(
    (...args: TArgs) => {
      const now = Date.now();
      const timeElapsed = now - lastRanRef.current;

      lastArgsRef.current = args;

      if (timeElapsed >= interval) {
        callbackRef.current(...args);
        lastRanRef.current = now;
        lastArgsRef.current = null;
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current);
            lastRanRef.current = Date.now();
            lastArgsRef.current = null;
          }
          timeoutRef.current = null;
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
 * const handleAsyncUpdate = useThrottledAsyncCallback(async (data: Data) => {
 *   await saveToBackend(data);
 * }, 1000);
 * ```
 */
export function useThrottledAsyncCallback<TArgs extends unknown[], TReturn>(
  callback: (...args: TArgs) => Promise<TReturn>,
  interval: number = 300
): ThrottledFunction<TArgs> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRanRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  const lastArgsRef = useRef<TArgs | null>(null);
  const executingRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  const throttledCallback = useCallback(
    (...args: TArgs) => {
      const now = Date.now();
      const timeElapsed = now - lastRanRef.current;

      lastArgsRef.current = args;

      if (timeElapsed >= interval && !executingRef.current) {
        executingRef.current = true;
        callbackRef
          .current(...args)
          .catch(error => {
            logger.error('Throttled async callback error:', error);
          })
          .finally(() => {
            executingRef.current = false;
            lastRanRef.current = Date.now();
            lastArgsRef.current = null;
          });
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (lastArgsRef.current && !executingRef.current) {
            executingRef.current = true;
            callbackRef
              .current(...lastArgsRef.current)
              .catch(error => {
                logger.error('Throttled async callback error:', error);
              })
              .finally(() => {
                executingRef.current = false;
                lastRanRef.current = Date.now();
                lastArgsRef.current = null;
              });
          }
          timeoutRef.current = null;
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
