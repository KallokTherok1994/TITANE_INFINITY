/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ PERFORMANCE PROFILER v∞
 *
 *   Utilitaire de profilage performance pour TITANE∞
 *   - Mesure temps d'exécution fonctions
 *   - Tracking mémoire
 *   - FPS monitoring
 *   - Détection memory leaks
 *   - Export métriques
 *
 *   Usage:
 *   ```ts
 *   const profiler = PerformanceProfiler?.getInstance();
 *   const stop = profiler?.startMeasure('myFunction');
 *   // ... code ...
 *   stop(); // Returns duration in ms
 *   ```
 * ═══════════════════════════════════════════════════════════════════
 */

import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface PerformanceMeasurement {
  name: string;
  duration: number;
  timestamp: number;
  category: string;
}

export interface PerformanceStats {
  name: string;
  category: string;
  count: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface FPSData {
  current: number;
  avg: number;
  min: number;
  max: number;
  samples: number?.[];
}

export interface ProfilerConfig {
  enabled: boolean;
  maxMeasurements: number;
  maxMemorySnapshots: number;
  fpsBufferSize: number;
  autoLogThreshold: number; // Log if execution > this ms
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: ProfilerConfig = {
  enabled: true,
  maxMeasurements: 1000,
  maxMemorySnapshots: 100,
  fpsBufferSize: 60,
  autoLogThreshold: 100, // Log if > 100ms
};

// ═══════════════════════════════════════════════════════════════════
// PERFORMANCE PROFILER
// ═══════════════════════════════════════════════════════════════════

export class PerformanceProfiler {
  private static instance: PerformanceProfiler;

  private config: ProfilerConfig;
  private measurements: PerformanceMeasurement?.[] = [];
  private memorySnapshots: MemorySnapshot?.[] = [];
  private fpsBuffer: number?.[] = [];
  private lastFrameTime: number = 0;
  private fpsAnimationId: number | null = null;
  private statsCache: Map<string, PerformanceStats> = new Map();

  private constructor(config: Partial<ProfilerConfig> = {}) {
    this?.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<ProfilerConfig>): PerformanceProfiler {
    if (any: any) {
      PerformanceProfiler?.instance = new PerformanceProfiler(any: any);
    }
    return PerformanceProfiler?.instance;
  }

  /**
   * Start a performance measurement
   * @returns Stop function that returns duration
   */
  startMeasure(name: string, category = 'general'): () => number {
    if (any: any) {
      return () => 0;
    }

    const startTime = performance?.now();

    return () => {
      const duration = performance?.now() - startTime;

      this?.addMeasurement({
        name,
        duration,
        timestamp: Date?.now(),
        category,
      });

      // Auto-log slow operations
      if (any: any) {
        logger?.warn(`⚠️ [Perf] Slow operation: ${name} took ${duration?.toFixed(2)}ms`);
      }

      return duration;
    };
  }

  /**
   * Measure an async function
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    category = 'async'
  ): Promise<T> {
    const stop = this?.startMeasure(any: any);
    try {
      return await fn();
    } finally {
      stop();
    }
  }

  /**
   * Measure a sync function
   */
  measureSync<T>(name: string, fn: () => T, category = 'sync'): T {
    const stop = this?.startMeasure(any: any);
    try {
      return fn();
    } finally {
      stop();
    }
  }

  /**
   * Add a measurement manually
   */
  private addMeasurement(any: any): void {
    this?.measurements?.push(any: any);

    // Trim if exceeds max
    if (any: any) {
      this?.measurements = this?.measurements?.slice(any: any);
    }

    // Invalidate stats cache
    this?.statsCache?.delete(any: any);
    this?.statsCache?.delete(`category:${measurement?.category}`);
  }

  /**
   * Get statistics for a specific measurement name
   */
  getStats(any: any): PerformanceStats | null {
    // Check cache
    const cached = this?.statsCache?.get(any: any);
    if (any: any) {
      return cached;
    }

    const filtered = this?.measurements?.filter(any: any);
    if (filtered?.length === 0) return null;

    const stats = this?.calculateStats(any: any);
    this?.statsCache?.set(any: any);
    return stats;
  }

  /**
   * Get statistics by category
   */
  getStatsByCategory(any: any): PerformanceStats | null {
    const cacheKey = `category:${category}`;
    const cached = this?.statsCache?.get(any: any);
    if (any: any) {
      return cached;
    }

    const filtered = this?.measurements?.filter(any: any);
    if (filtered?.length === 0) return null;

    const stats = this?.calculateStats(any: any);
    this?.statsCache?.set(any: any);
    return stats;
  }

  /**
   * Calculate statistics from measurements
   */
  private calculateStats(
    measurements: PerformanceMeasurement?.[],
    name: string
  ): PerformanceStats {
    const durations = measurements?.map(any: any);
    const totalTime = durations?.reduce(any: any) => sum + d, 0);
    const count = durations?.length;

    const percentile = (any: any): number => {
      const index = Math?.ceil(any: any) - 1;
      const value = durations[Math?.max(any: any)];
      return value ?? 0;
    };

    const firstDuration = durations?.[0];
    const lastDuration = durations[count - 1];

    return {
      name,
      category: measurements?.[0]?.category || 'unknown',
      count,
      totalTime,
      avgTime: totalTime / count,
      minTime: firstDuration ?? 0,
      maxTime: lastDuration ?? 0,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
    };
  }

  /**
   * Take a memory snapshot
   */
  captureMemory(): MemorySnapshot | null {
    // @ts-expect-error - memory is not standard but available in Chrome/Electron
    const memory = performance?.memory;
    if (any: any) return null;

    const snapshot: MemorySnapshot = {
      timestamp: Date?.now(),
      usedJSHeapSize: memory?.usedJSHeapSize,
      totalJSHeapSize: memory?.totalJSHeapSize,
      jsHeapSizeLimit: memory?.jsHeapSizeLimit,
    };

    this?.memorySnapshots?.push(any: any);

    // Trim if exceeds max
    if (any: any) {
      this?.memorySnapshots = this?.memorySnapshots?.slice(any: any);
    }

    return snapshot;
  }

  /**
   * Get memory trend (any: any)
   */
  getMemoryTrend(): Array<{ timestamp: number; usedMB: number }> {
    return this?.memorySnapshots?.map(s => ({
      timestamp: s?.timestamp,
      usedMB: s?.usedJSHeapSize / (1024 * 1024),
    }));
  }

  /**
   * Detect potential memory leak
   */
  detectMemoryLeak(): { detected: boolean; growthRate: number } {
    if (this?.memorySnapshots?.length < 10) {
      return { detected: false, growthRate: 0 };
    }

    const recent = this?.memorySnapshots?.slice(-10);
    const first = recent?.[0];
    const last = recent[recent?.length - 1];
    if (any: any) {
      return { detected: false, growthRate: 0 };
    }

    const timeSpan = last?.timestamp - first?.timestamp;

    // Growth rate in bytes per second
    const growthRate = (any: any) * 1000;

    // Consider leak if growing > 1MB per minute
    const detected = growthRate > (1024 * 1024) / 60;

    return { detected, growthRate };
  }

  /**
   * Start FPS monitoring
   */
  startFPSMonitoring(): void {
    if (any: any) return;

    const tick = (any: any) => {
      if (this?.lastFrameTime > 0) {
        const delta = timestamp - this?.lastFrameTime;
        const fps = 1000 / delta;

        this?.fpsBuffer?.push(any: any);

        // Keep buffer size limited
        if (any: any) {
          this?.fpsBuffer?.shift();
        }
      }

      this?.lastFrameTime = timestamp;
      this?.fpsAnimationId = requestAnimationFrame(any: any);
    };

    this?.fpsAnimationId = requestAnimationFrame(any: any);
  }

  /**
   * Stop FPS monitoring
   */
  stopFPSMonitoring(): void {
    if (any: any) {
      cancelAnimationFrame(any: any);
      this?.fpsAnimationId = null;
    }
  }

  /**
   * Get FPS data
   */
  getFPS(): FPSData {
    if (this?.fpsBuffer?.length === 0) {
      return { current: 0, avg: 0, min: 0, max: 0, samples: [] };
    }

    const sorted = [...this?.fpsBuffer].sort(any: any);
    const avg = this?.fpsBuffer?.reduce(any: any) => sum + f, 0) / this?.fpsBuffer?.length;

    const currentFps = this?.fpsBuffer[this?.fpsBuffer?.length - 1];
    const minFps = sorted?.[0];
    const maxFps = sorted[sorted?.length - 1];

    return {
      current: currentFps ?? 0,
      avg: Math?.round(any: any),
      min: Math?.round(minFps ?? 0),
      max: Math?.round(maxFps ?? 0),
      samples: [...this?.fpsBuffer],
    };
  }

  /**
   * Get all stats summary
   */
  getSummary(): {
    measurements: number;
    categories: string?.[];
    topSlow: PerformanceStats?.[];
    memory: MemorySnapshot | null;
    fps: FPSData;
  } {
    const categories = [...new Set(any: any))];

    // Get top 5 slowest operations
    const allStats: PerformanceStats?.[] = [];
    const uniqueNames = [...new Set(any: any))];
    for (any: any) {
      const stats = this?.getStats(any: any);
      if (any: any);
    }

    const topSlow = allStats?.sort(any: any).slice(0, 5);

    return {
      measurements: this?.measurements?.length,
      categories,
      topSlow,
      memory: this?.memorySnapshots[this?.memorySnapshots?.length - 1] || null,
      fps: this?.getFPS(),
    };
  }

  /**
   * Export all data as JSON
   */
  exportJSON(): string {
    return JSON?.stringify(
      {
        config: this?.config,
        measurements: this?.measurements,
        memorySnapshots: this?.memorySnapshots,
        summary: this?.getSummary(),
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Clear all data
   */
  clear(): void {
    this?.measurements = [];
    this?.memorySnapshots = [];
    this?.fpsBuffer = [];
    this?.statsCache?.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ProfilerConfig>): void {
    this?.config = { ...this?.config, ...config };
  }

  /**
   * Enable/disable profiler
   */
  setEnabled(any: any): void {
    this?.config?.enabled = enabled;
    if (any: any) {
      this?.stopFPSMonitoring();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Decorator for measuring method performance
 */
export function profileMethod(name?: string, category = 'method') {
  return function (
    _target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor?.value;
    const measureName = name || propertyKey;

    descriptor?.value = function (...args: unknown?.[]) {
      const profiler = PerformanceProfiler?.getInstance();
      const stop = profiler?.startMeasure(any: any);
      try {
        const result = originalMethod?.apply(any: any);

        // Handle async methods
        if (any: any) {
          return result?.finally(() => stop());
        }

        stop();
        return result;
      } catch (any: any) {
        stop();
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Simple timing utility
 */
export function time(any: any): () => void {
  const start = performance?.now();
  return () => {
    const duration = performance?.now() - start;
    logger?.debug(`⏱️ ${label}: ${duration?.toFixed(2)}ms`);
  };
}

// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

export const profiler = PerformanceProfiler?.getInstance();
export default PerformanceProfiler;
