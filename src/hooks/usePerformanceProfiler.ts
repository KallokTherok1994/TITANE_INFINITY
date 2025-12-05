/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ usePerformanceProfiler v∞
 *
 *   Hook React pour le Performance Profiler
 *   - Mesure render time des composants
 *   - Monitoring FPS automatique
 *   - Memory tracking
 *   - Export métriques
 *
 *   Usage:
 *   ```tsx
 *   function MyComponent() {
 *     const { measure, fps, memory, stats } = usePerformanceProfiler('MyComponent');
 *
 *     const handleClick = useCallback(() => {
 *       const stop = measure('handleClick');
 *       // ... code ...
 *       stop();
 *     }, [measure]);
 *
 *     return <div>FPS: {fps.current}</div>;
 *   }
 *   ```
 * ═══════════════════════════════════════════════════════════════════
 */

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  PerformanceProfiler,
  profiler,
  type PerformanceStats,
  type FPSData,
  type MemorySnapshot,
} from '@/utils/performanceProfiler';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface UsePerformanceProfilerOptions {
  /** Enable profiling (default: true in dev, false in prod) */
  enabled?: boolean;
  /** Auto-start FPS monitoring */
  monitorFPS?: boolean;
  /** Auto-capture memory snapshots interval (ms, 0 to disable) */
  memoryInterval?: number;
  /** Refresh stats interval (ms) */
  statsInterval?: number;
}

export interface UsePerformanceProfilerReturn {
  /** Start a measurement, returns stop function */
  measure: (name: string, category?: string) => () => number;
  /** Measure an async function */
  measureAsync: <T>(name: string, fn: () => Promise<T>) => Promise<T>;
  /** Current FPS data */
  fps: FPSData;
  /** Latest memory snapshot */
  memory: MemorySnapshot | null;
  /** Stats for component */
  stats: PerformanceStats | null;
  /** All stats summary */
  summary: {
    measurements: number;
    topSlow: PerformanceStats[];
  };
  /** Profiler instance */
  profiler: PerformanceProfiler;
  /** Clear all measurements */
  clear: () => void;
  /** Export data as JSON */
  exportJSON: () => string;
}

// ═══════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════

export function usePerformanceProfiler(
  componentName: string,
  options: UsePerformanceProfilerOptions = {}
): UsePerformanceProfilerReturn {
  const {
    enabled = process.env.NODE_ENV === 'development',
    monitorFPS = false,
    memoryInterval = 0,
    statsInterval = 5000,
  } = options;

  const componentCategory = `component:${componentName}`;
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(performance.now());

  // State for reactive updates
  const [fps, setFPS] = useState<FPSData>({ current: 0, avg: 0, min: 0, max: 0, samples: [] });
  const [memory, setMemory] = useState<MemorySnapshot | null>(null);
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [summary, setSummary] = useState<{ measurements: number; topSlow: PerformanceStats[] }>({
    measurements: 0,
    topSlow: [],
  });

  // Track render performance
  useEffect(() => {
    if (!enabled) return;

    renderCountRef.current++;
    const currentTime = performance.now();
    const _renderTime = currentTime - lastRenderTimeRef.current;

    // Only track if this is a re-render (not initial mount)
    if (renderCountRef.current > 1) {
      profiler.startMeasure(`${componentName}:render`, componentCategory)();
    }

    lastRenderTimeRef.current = currentTime;
  });

  // FPS monitoring
  useEffect(() => {
    if (!enabled || !monitorFPS) return;

    profiler.startFPSMonitoring();

    return () => {
      profiler.stopFPSMonitoring();
    };
  }, [enabled, monitorFPS]);

  // Memory monitoring
  useEffect(() => {
    if (!enabled || memoryInterval <= 0) return;

    const interval = setInterval(() => {
      const snapshot = profiler.captureMemory();
      if (snapshot) {
        setMemory(snapshot);
      }
    }, memoryInterval);

    return () => clearInterval(interval);
  }, [enabled, memoryInterval]);

  // Stats refresh
  useEffect(() => {
    if (!enabled || statsInterval <= 0) return;

    const interval = setInterval(() => {
      setFPS(profiler.getFPS());
      setStats(profiler.getStatsByCategory(componentCategory));

      const fullSummary = profiler.getSummary();
      setSummary({
        measurements: fullSummary.measurements,
        topSlow: fullSummary.topSlow,
      });
    }, statsInterval);

    // Initial fetch
    setFPS(profiler.getFPS());
    setStats(profiler.getStatsByCategory(componentCategory));

    return () => clearInterval(interval);
  }, [enabled, statsInterval, componentCategory]);

  // Measure function
  const measure = useCallback(
    (name: string, category?: string) => {
      if (!enabled) return () => 0;
      return profiler.startMeasure(
        `${componentName}:${name}`,
        category || componentCategory
      );
    },
    [enabled, componentName, componentCategory]
  );

  // Measure async function
  const measureAsync = useCallback(
    async <T,>(name: string, fn: () => Promise<T>): Promise<T> => {
      if (!enabled) return fn();
      return profiler.measureAsync(`${componentName}:${name}`, fn, componentCategory);
    },
    [enabled, componentName, componentCategory]
  );

  // Clear
  const clear = useCallback(() => {
    profiler.clear();
    setStats(null);
    setSummary({ measurements: 0, topSlow: [] });
  }, []);

  // Export
  const exportJSON = useCallback(() => {
    return profiler.exportJSON();
  }, []);

  return useMemo(
    () => ({
      measure,
      measureAsync,
      fps,
      memory,
      stats,
      summary,
      profiler,
      clear,
      exportJSON,
    }),
    [measure, measureAsync, fps, memory, stats, summary, clear, exportJSON]
  );
}

// ═══════════════════════════════════════════════════════════════════
// ADDITIONAL HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook to measure component mount/unmount time
 */
export function useComponentLifecycle(componentName: string): void {
  useEffect(() => {
    const mountStop = profiler.startMeasure(
      `${componentName}:mount`,
      'lifecycle'
    );
    mountStop();

    return () => {
      profiler.startMeasure(`${componentName}:unmount`, 'lifecycle')();
    };
  }, [componentName]);
}

/**
 * Hook to track effect execution time
 */
export function useTrackedEffect(
  effectName: string,
  effect: () => void | (() => void),
  deps: React.DependencyList
): void {
  useEffect(() => {
    const stop = profiler.startMeasure(effectName, 'effect');
    const cleanup = effect();
    stop();

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook to measure callback execution time
 */
export function useTrackedCallback<T extends (...args: unknown[]) => unknown>(
  callbackName: string,
  callback: T,
  deps: React.DependencyList
): T {
   
  return useCallback(
    (...args: Parameters<T>) => {
      const stop = profiler.startMeasure(callbackName, 'callback');
      try {
        return callback(...args);
      } finally {
        stop();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callbackName, ...deps]
  ) as T;
}

export default usePerformanceProfiler;
