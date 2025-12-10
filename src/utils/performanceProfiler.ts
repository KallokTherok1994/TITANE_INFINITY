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
 *   const profiler = PerformanceProfiler.getInstance();
 *   const stop = profiler.startMeasure('myFunction');
 *   // ... code ...
 *   stop(); // Returns duration in ms
 *   ```
 * ═══════════════════════════════════════════════════════════════════
 */

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
  samples: number[];
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
  private measurements: PerformanceMeasurement[] = [];
  private memorySnapshots: MemorySnapshot[] = [];
  private fpsBuffer: number[] = [];
  private lastFrameTime: number = 0;
  private fpsAnimationId: number | null = null;
  private statsCache: Map<string, PerformanceStats> = new Map();

  private constructor(config: Partial<ProfilerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<ProfilerConfig>): PerformanceProfiler {
    if (!PerformanceProfiler.instance) {
      PerformanceProfiler.instance = new PerformanceProfiler(config);
    }
    return PerformanceProfiler.instance;
  }

  /**
   * Start a performance measurement
   * @returns Stop function that returns duration
   */
  startMeasure(name: string, category = 'general'): () => number {
    if (!this.config.enabled) {
      return () => 0;
    }

    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      this.addMeasurement({
        name,
        duration,
        timestamp: Date.now(),
        category,
      });

      // Auto-log slow operations
      if (duration > this.config.autoLogThreshold) {
        console.warn(`⚠️ [Perf] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
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
    const stop = this.startMeasure(name, category);
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
    const stop = this.startMeasure(name, category);
    try {
      return fn();
    } finally {
      stop();
    }
  }

  /**
   * Add a measurement manually
   */
  private addMeasurement(measurement: PerformanceMeasurement): void {
    this.measurements.push(measurement);

    // Trim if exceeds max
    if (this.measurements.length > this.config.maxMeasurements) {
      this.measurements = this.measurements.slice(-this.config.maxMeasurements);
    }

    // Invalidate stats cache
    this.statsCache.delete(measurement.name);
    this.statsCache.delete(`category:${measurement.category}`);
  }

  /**
   * Get statistics for a specific measurement name
   */
  getStats(name: string): PerformanceStats | null {
    // Check cache
    const cached = this.statsCache.get(name);
    if (cached) {
      return cached;
    }

    const filtered = this.measurements.filter(m => m.name === name);
    if (filtered.length === 0) return null;

    const stats = this.calculateStats(filtered, name);
    this.statsCache.set(name, stats);
    return stats;
  }

  /**
   * Get statistics by category
   */
  getStatsByCategory(category: string): PerformanceStats | null {
    const cacheKey = `category:${category}`;
    const cached = this.statsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const filtered = this.measurements.filter(m => m.category === category);
    if (filtered.length === 0) return null;

    const stats = this.calculateStats(filtered, category);
    this.statsCache.set(cacheKey, stats);
    return stats;
  }

  /**
   * Calculate statistics from measurements
   */
  private calculateStats(
    measurements: PerformanceMeasurement[],
    name: string
  ): PerformanceStats {
    const durations = measurements.map(m => m.duration).sort((a, b) => a - b);
    const totalTime = durations.reduce((sum, d) => sum + d, 0);
    const count = durations.length;

    const percentile = (p: number): number => {
      const index = Math.ceil((p / 100) * count) - 1;
      return durations[Math.max(0, index)];
    };

    return {
      name,
      category: measurements[0]?.category || 'unknown',
      count,
      totalTime,
      avgTime: totalTime / count,
      minTime: durations[0],
      maxTime: durations[count - 1],
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
    const memory = performance.memory;
    if (!memory) return null;

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };

    this.memorySnapshots.push(snapshot);

    // Trim if exceeds max
    if (this.memorySnapshots.length > this.config.maxMemorySnapshots) {
      this.memorySnapshots = this.memorySnapshots.slice(-this.config.maxMemorySnapshots);
    }

    return snapshot;
  }

  /**
   * Get memory trend (MB used over time)
   */
  getMemoryTrend(): Array<{ timestamp: number; usedMB: number }> {
    return this.memorySnapshots.map(s => ({
      timestamp: s.timestamp,
      usedMB: s.usedJSHeapSize / (1024 * 1024),
    }));
  }

  /**
   * Detect potential memory leak
   */
  detectMemoryLeak(): { detected: boolean; growthRate: number } {
    if (this.memorySnapshots.length < 10) {
      return { detected: false, growthRate: 0 };
    }

    const recent = this.memorySnapshots.slice(-10);
    const first = recent[0].usedJSHeapSize;
    const last = recent[recent.length - 1].usedJSHeapSize;
    const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;

    // Growth rate in bytes per second
    const growthRate = ((last - first) / timeSpan) * 1000;

    // Consider leak if growing > 1MB per minute
    const detected = growthRate > (1024 * 1024) / 60;

    return { detected, growthRate };
  }

  /**
   * Start FPS monitoring
   */
  startFPSMonitoring(): void {
    if (this.fpsAnimationId !== null) return;

    const tick = (timestamp: number) => {
      if (this.lastFrameTime > 0) {
        const delta = timestamp - this.lastFrameTime;
        const fps = 1000 / delta;

        this.fpsBuffer.push(fps);

        // Keep buffer size limited
        if (this.fpsBuffer.length > this.config.fpsBufferSize) {
          this.fpsBuffer.shift();
        }
      }

      this.lastFrameTime = timestamp;
      this.fpsAnimationId = requestAnimationFrame(tick);
    };

    this.fpsAnimationId = requestAnimationFrame(tick);
  }

  /**
   * Stop FPS monitoring
   */
  stopFPSMonitoring(): void {
    if (this.fpsAnimationId !== null) {
      cancelAnimationFrame(this.fpsAnimationId);
      this.fpsAnimationId = null;
    }
  }

  /**
   * Get FPS data
   */
  getFPS(): FPSData {
    if (this.fpsBuffer.length === 0) {
      return { current: 0, avg: 0, min: 0, max: 0, samples: [] };
    }

    const sorted = [...this.fpsBuffer].sort((a, b) => a - b);
    const avg = this.fpsBuffer.reduce((sum, f) => sum + f, 0) / this.fpsBuffer.length;

    return {
      current: this.fpsBuffer[this.fpsBuffer.length - 1],
      avg: Math.round(avg),
      min: Math.round(sorted[0]),
      max: Math.round(sorted[sorted.length - 1]),
      samples: [...this.fpsBuffer],
    };
  }

  /**
   * Get all stats summary
   */
  getSummary(): {
    measurements: number;
    categories: string[];
    topSlow: PerformanceStats[];
    memory: MemorySnapshot | null;
    fps: FPSData;
  } {
    const categories = [...new Set(this.measurements.map(m => m.category))];

    // Get top 5 slowest operations
    const allStats: PerformanceStats[] = [];
    const uniqueNames = [...new Set(this.measurements.map(m => m.name))];
    for (const name of uniqueNames) {
      const stats = this.getStats(name);
      if (stats) allStats.push(stats);
    }

    const topSlow = allStats.sort((a, b) => b.avgTime - a.avgTime).slice(0, 5);

    return {
      measurements: this.measurements.length,
      categories,
      topSlow,
      memory: this.memorySnapshots[this.memorySnapshots.length - 1] || null,
      fps: this.getFPS(),
    };
  }

  /**
   * Export all data as JSON
   */
  exportJSON(): string {
    return JSON.stringify(
      {
        config: this.config,
        measurements: this.measurements,
        memorySnapshots: this.memorySnapshots,
        summary: this.getSummary(),
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
    this.measurements = [];
    this.memorySnapshots = [];
    this.fpsBuffer = [];
    this.statsCache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ProfilerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enable/disable profiler
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.stopFPSMonitoring();
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
    const originalMethod = descriptor.value;
    const measureName = name || propertyKey;

    descriptor.value = function (...args: unknown[]) {
      const profiler = PerformanceProfiler.getInstance();
      const stop = profiler.startMeasure(measureName, category);
      try {
        const result = originalMethod.apply(this, args);

        // Handle async methods
        if (result instanceof Promise) {
          return result.finally(() => stop());
        }

        stop();
        return result;
      } catch (error) {
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
export function time(label: string): () => void {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  };
}

// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

export const profiler = PerformanceProfiler.getInstance();
export default PerformanceProfiler;
