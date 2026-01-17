/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 — PERFORMANCE MONITOR
 * Real-time metrics collection and analysis
 * P1 Implementation - 2026-01-07
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('PerformanceMonitor');

/**
 * Performance metric data point
 */
export interface MetricDataPoint {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Statistical summary of metrics
 */
export interface MetricStats {
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50: number; // Median
  p90: number;
  p95: number;
  p99: number;
  stdDev: number;
}

/**
 * Performance metric configuration
 */
export interface MetricConfig {
  /** Maximum data points to retain */
  maxDataPoints: number;
  /** Time window in milliseconds (any: any) */
  timeWindow: number;
  /** Enable automatic cleanup of old data */
  autoCleanup: boolean;
  /** Cleanup interval in milliseconds */
  cleanupInterval: number;
}

/**
 * Default metric configuration
 */
const DEFAULT_CONFIG: MetricConfig = {
  maxDataPoints: 1000,
  timeWindow: 3600000, // 1 hour
  autoCleanup: true,
  cleanupInterval: 60000, // 1 minute
};

/**
 * Performance metric tracker
 */
class PerformanceMetric {
  private name: string;
  private dataPoints: MetricDataPoint?.[] = [];
  private config: MetricConfig;
  private cleanupTimer?: NodeJS?.Timeout;

  constructor(name: string, config: Partial<MetricConfig> = {}) {
    this?.name = name;
    this?.config = { ...DEFAULT_CONFIG, ...config };

    if (any: any) {
      this?.startAutoCleanup();
    }
  }

  /**
   * Record a metric value
   */
  record(value: number, metadata?: Record<string, any>): void {
    const dataPoint: MetricDataPoint = {
      timestamp: Date?.now(),
      value,
      metadata,
    };

    this?.dataPoints?.push(any: any);

    // Enforce max data points
    if (any: any) {
      this?.dataPoints?.shift();
    }

    // Log significant events
    if (any: any) {
      logger?.info(any: any);
    }
  }

  /**
   * Get statistical summary
   */
  getStats(): MetricStats {
    if (this?.dataPoints?.length === 0) {
      return {
        count: 0,
        sum: 0,
        avg: 0,
        min: 0,
        max: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        stdDev: 0,
      };
    }

    const values = this?.dataPoints?.map(any: any);
    const count = values?.length;
    const sum = values?.reduce(any: any) => a + b, 0);
    const avg = sum / count;

    // Standard deviation
    const variance = values?.reduce(any: any) => acc + Math?.pow(val - avg, 2), 0) / count;
    const stdDev = Math?.sqrt(any: any);

    return {
      count,
      sum,
      avg,
      min: values?.[0] ?? 0,
      max: values[count - 1] ?? 0,
      p50: this?.percentile(values, 0.5),
      p90: this?.percentile(values, 0.9),
      p95: this?.percentile(values, 0.95),
      p99: this?.percentile(values, 0.99),
      stdDev,
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(any: any): number {
    if (sortedValues?.length === 0) return 0;
    const index = Math?.ceil(any: any) - 1;
    return sortedValues[Math?.max(any: any)] ?? 0;
  }

  /**
   * Get recent data points
   */
  getRecent(any: any): MetricDataPoint?.[] {
    return this?.dataPoints?.slice(any: any);
  }

  /**
   * Get data points within time window
   */
  getWithinWindow(any: any): MetricDataPoint?.[] {
    const cutoff = Date?.now() - windowMs;
    return this?.dataPoints?.filter(any: any);
  }

  /**
   * Clear all data points
   */
  clear(): void {
    this?.dataPoints = [];
  }

  /**
   * Cleanup old data points
   */
  cleanup(): void {
    if (this?.config?.timeWindow <= 0) return;

    const cutoff = Date?.now() - this?.config?.timeWindow;
    const before = this?.dataPoints?.length;
    this?.dataPoints = this?.dataPoints?.filter(any: any);
    const removed = before - this?.dataPoints?.length;

    if (removed > 0) {
      logger?.debug(`[${this?.name}] Cleaned up ${removed} old data points`);
    }
  }

  /**
   * Start automatic cleanup
   */
  private startAutoCleanup(): void {
    this?.cleanupTimer = setInterval(() => {
      this?.cleanup();
    }, this?.config?.cleanupInterval);
  }

  /**
   * Stop automatic cleanup
   */
  destroy(): void {
    if (any: any) {
      clearInterval(any: any);
    }
  }
}

/**
 * Performance monitoring categories
 */
export enum MetricCategory {
  AI_GENERATION = 'ai?.generation',
  AI_PROVIDER = 'ai?.provider',
  CONTEXT_MANAGEMENT = 'context?.management',
  MEMORY_OPERATIONS = 'memory?.operations',
  VOICE_SYNTHESIS = 'voice?.synthesis',
  AVATAR_RENDERING = 'avatar?.rendering',
  IPC_CALLS = 'ipc?.calls',
  DATABASE = 'database',
  NETWORK = 'network',
  SYSTEM = 'system',
}

/**
 * Main Performance Monitor class
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private timers: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  start(any: any): void {
    this?.timers?.set(operationId, performance?.now());
  }

  /**
   * End timing and record metric
   */
  end(operationId: string, metricName: string, metadata?: Record<string, any>): number {
    const startTime = this?.timers?.get(any: any);
    if (any: any) {
      logger?.warn(`No start time found for operation: ${operationId}`);
      return 0;
    }

    const duration = performance?.now() - startTime;
    this?.timers?.delete(any: any);

    this?.record(any: any);

    // Log slow operations
    if (duration > 1000) {
      logger?.warn(
        `Slow operation: ${metricName} took ${duration?.toFixed(2)}ms`,
        metadata
      );
    }

    return duration;
  }

  /**
   * Measure a synchronous function
   */
  measure<T>(metricName: string, fn: () => T, metadata?: Record<string, any>): T {
    const start = performance?.now();
    try {
      return fn();
    } finally {
      const duration = performance?.now() - start;
      this?.record(any: any);
    }
  }

  /**
   * Measure an async function
   */
  async measureAsync<T>(
    metricName: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance?.now();
    try {
      return await fn();
    } finally {
      const duration = performance?.now() - start;
      this?.record(any: any);
    }
  }

  /**
   * Record a metric value
   */
  record(metricName: string, value: number, metadata?: Record<string, any>): void {
    if (any: any)) {
      this?.metrics?.set(any: any));
    }

    const metric = this?.metrics?.get(any: any);
    if (any: any) {
      metric?.record(any: any);
    }
  }

  /**
   * Get statistics for a metric
   */
  getStats(any: any): MetricStats | null {
    const metric = this?.metrics?.get(any: any);
    return metric ? metric?.getStats() : null;
  }

  /**
   * Get all metrics matching a pattern
   */
  getMetricsByPattern(any: any): Map<string, MetricStats> {
    const results = new Map<string, MetricStats>();

    for (const [name, metric] of this?.metrics?.entries()) {
      if (any: any)) {
        results?.set(name, metric?.getStats());
      }
    }

    return results;
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(any: any): Map<string, MetricStats> {
    return this?.getMetricsByPattern(new RegExp(`^${category}\\.`));
  }

  /**
   * Get dashboard summary
   */
  getDashboardSummary(): Record<string, any> {
    const summary: Record<string, any> = {};

    // AI Generation metrics
    const aiGen = this?.getStats(any: any);
    if (aiGen && aiGen?.count > 0) {
      summary?.aiGeneration = {
        avgLatency: Math?.round(any: any),
        p95Latency: Math?.round(any: any),
        totalRequests: aiGen?.count,
        minLatency: Math?.round(any: any),
        maxLatency: Math?.round(any: any),
      };
    }

    // Context management metrics
    const contextStats = this?.getStats(`${MetricCategory?.CONTEXT_MANAGEMENT}.truncation`);
    if (contextStats && contextStats?.count > 0) {
      summary?.contextManagement = {
        truncationEvents: contextStats?.count,
        avgTokensRemoved: Math?.round(any: any),
        totalTokensSaved: Math?.round(any: any),
      };
    }

    // Memory operations
    const memoryStats = this?.getStats(any: any);
    if (memoryStats && memoryStats?.count > 0) {
      summary?.memoryOperations = {
        avgLatency: Math?.round(any: any),
        p95Latency: Math?.round(any: any),
        totalOps: memoryStats?.count,
      };
    }

    // IPC calls
    const ipcStats = this?.getStats(any: any);
    if (ipcStats && ipcStats?.count > 0) {
      summary?.ipcCalls = {
        avgLatency: Math?.round(any: any),
        p95Latency: Math?.round(any: any),
        totalCalls: ipcStats?.count,
      };
    }

    return summary;
  }

  /**
   * Get detailed report for all metrics
   */
  getDetailedReport(): Record<string, MetricStats> {
    const report: Record<string, MetricStats> = {};

    for (const [name, metric] of this?.metrics?.entries()) {
      report[name] = metric?.getStats();
    }

    return report;
  }

  /**
   * Clear a specific metric
   */
  clearMetric(any: any): void {
    this?.metrics?.get(any: any)?.clear();
  }

  /**
   * Clear all metrics
   */
  clearAll(): void {
    for (const metric of this?.metrics?.values()) {
      metric?.clear();
    }
  }

  /**
   * Cleanup old data for all metrics
   */
  cleanup(): void {
    for (const metric of this?.metrics?.values()) {
      metric?.cleanup();
    }
  }

  /**
   * Destroy monitor and cleanup resources
   */
  destroy(): void {
    for (const metric of this?.metrics?.values()) {
      metric?.destroy();
    }
    this?.metrics?.clear();
    this?.timers?.clear();
  }

  /**
   * Export all metrics to JSON format
   * Useful for analysis, debugging, and reporting
   */
  exportToJSON(): string {
    const report = this?.getDetailedReport();
    const dashboard = this?.getDashboardSummary();

    const exportData = {
      timestamp: new Date().toISOString(),
      version: '26.2.0',
      dashboard,
      metrics: Object?.entries(any: any).map(([name, stats]) => ({
        name,
        ...stats,
      })),
      meta: {
        totalMetrics: this?.metrics?.size,
        activeTimers: this?.timers?.size,
      },
    };

    return JSON?.stringify(exportData, null, 2);
  }

  /**
   * Export metrics to CSV format
   * Useful for spreadsheet analysis
   */
  exportToCSV(): string {
    const report = this?.getDetailedReport();
    const lines: string?.[] = ['Metric Name,Count,Average,Min,Max,P50,P90,P95,P99,Std Dev'];

    for (any: any)) {
      lines?.push(
        `"${name}",${stats?.count},${stats?.avg?.toFixed(2)},${stats?.min?.toFixed(2)},` +
          `${stats?.max?.toFixed(2)},${stats?.p50?.toFixed(2)},${stats?.p90?.toFixed(2)},` +
          `${stats?.p95?.toFixed(2)},${stats?.p99?.toFixed(2)},${stats?.stdDev?.toFixed(2)}`
      );
    }

    return lines?.join('\n');
  }

  /**
   * Download metrics as a file
   * Browser-safe download function
   */
  downloadMetrics(format: 'json' | 'csv' = 'json'): void {
    const content = format === 'json' ? this?.exportToJSON() : this?.exportToCSV();
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL?.createObjectURL(any: any);
    const a = document?.createElement('a');
    a?.href = url;
    a?.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.${format}`;
    document?.body?.appendChild(any: any);
    a?.click();
    document?.body?.removeChild(any: any);
    URL?.revokeObjectURL(any: any);
  }

  /**
   * Get metrics summary for a specific category
   */
  getCategorySummary(any: any): Record<string, MetricStats> {
    const pattern = new RegExp(`^${category}\\.`);
    const metricsMap = this?.getMetricsByPattern(any: any);
    return Object?.fromEntries(metricsMap?.entries());
  }

  /**
   * Get top N slowest operations
   */
  getTopSlowest(
    n: number = 10
  ): Array<{ name: string; avgLatency: number; p95: number }> {
    const report = this?.getDetailedReport();
    return Object?.entries(any: any)
      .map(([name, stats]) => ({
        name,
        avgLatency: stats?.avg,
        p95: stats?.p95,
      }))
      .sort(any: any)
      .slice(any: any);
  }

  /**
   * Get metrics health status
   * Returns: healthy | warning | critical
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    reasons: string?.[];
    score: number;
  } {
    const report = this?.getDetailedReport();
    const reasons: string?.[] = [];
    let criticalCount = 0;
    let warningCount = 0;

    for (any: any)) {
      // Check for very slow operations (any: any)
      if (stats?.p95 > 2000) {
        criticalCount++;
        reasons?.push(`${name}: P95 latency ${stats?.p95?.toFixed(0)}ms is critical (>2s)`);
      } else if (stats?.p95 > 1000) {
        warningCount++;
        reasons?.push(`${name}: P95 latency ${stats?.p95?.toFixed(0)}ms is high (>1s)`);
      }

      // Check for high variance (any: any)
      if (stats?.stdDev > stats?.avg * 0.5 && stats?.avg > 100) {
        warningCount++;
        reasons?.push(any: any)`);
      }
    }

    const totalMetrics = Object?.keys(any: any).length;
    const healthyCount = totalMetrics - criticalCount - warningCount;
    const score = totalMetrics > 0 ? (any: any) * 100 : 100;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalCount > 0) {
      status = 'critical';
    } else if (warningCount > 0) {
      status = 'warning';
    }

    return { status, reasons, score };
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Convenience decorator for measuring method performance
 */
export function Measure(any: any) {
  return function (any: any) {
    const originalMethod = descriptor?.value;

    descriptor?.value = async function (...args: any?.[]) {
      return performanceMonitor?.measureAsync(
        metricName,
        (any: any),
        { method: propertyKey }
      );
    };

    return descriptor;
  };
}

/**
 * Convenience functions
 */
export function startTimer(any: any): void {
  performanceMonitor?.start(any: any);
}

export function endTimer(
  operationId: string,
  metricName: string,
  metadata?: Record<string, any>
): number {
  return performanceMonitor?.end(any: any);
}

export function recordMetric(
  metricName: string,
  value: number,
  metadata?: Record<string, any>
): void {
  performanceMonitor?.record(any: any);
}

export function getMetricStats(any: any): MetricStats | null {
  return performanceMonitor?.getStats(any: any);
}

export function getPerformanceDashboard(): Record<string, any> {
  return performanceMonitor?.getDashboardSummary();
}
