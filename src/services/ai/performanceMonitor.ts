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
  p50: number;  // Median
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
  /** Time window in milliseconds (0 = unlimited) */
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
  cleanupInterval: 60000 // 1 minute
};

/**
 * Performance metric tracker
 */
class PerformanceMetric {
  private name: string;
  private dataPoints: MetricDataPoint[] = [];
  private config: MetricConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(name: string, config: Partial<MetricConfig> = {}) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.autoCleanup) {
      this.startAutoCleanup();
    }
  }

  /**
   * Record a metric value
   */
  record(value: number, metadata?: Record<string, any>): void {
    const dataPoint: MetricDataPoint = {
      timestamp: Date.now(),
      value,
      metadata
    };

    this.dataPoints.push(dataPoint);

    // Enforce max data points
    if (this.dataPoints.length > this.config.maxDataPoints) {
      this.dataPoints.shift();
    }

    // Log significant events
    if (metadata?.significant) {
      logger.info(`[${this.name}] Significant event: ${value}`, metadata);
    }
  }

  /**
   * Get statistical summary
   */
  getStats(): MetricStats {
    if (this.dataPoints.length === 0) {
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
        stdDev: 0
      };
    }

    const values = this.dataPoints.map(dp => dp.value).sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / count;

    // Standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return {
      count,
      sum,
      avg,
      min: values[0],
      max: values[count - 1],
      p50: this.percentile(values, 0.50),
      p90: this.percentile(values, 0.90),
      p95: this.percentile(values, 0.95),
      p99: this.percentile(values, 0.99),
      stdDev
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil(sortedValues.length * percentile) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Get recent data points
   */
  getRecent(count: number): MetricDataPoint[] {
    return this.dataPoints.slice(-count);
  }

  /**
   * Get data points within time window
   */
  getWithinWindow(windowMs: number): MetricDataPoint[] {
    const cutoff = Date.now() - windowMs;
    return this.dataPoints.filter(dp => dp.timestamp >= cutoff);
  }

  /**
   * Clear all data points
   */
  clear(): void {
    this.dataPoints = [];
  }

  /**
   * Cleanup old data points
   */
  cleanup(): void {
    if (this.config.timeWindow <= 0) return;

    const cutoff = Date.now() - this.config.timeWindow;
    const before = this.dataPoints.length;
    this.dataPoints = this.dataPoints.filter(dp => dp.timestamp >= cutoff);
    const removed = before - this.dataPoints.length;

    if (removed > 0) {
      logger.debug(`[${this.name}] Cleaned up ${removed} old data points`);
    }
  }

  /**
   * Start automatic cleanup
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop automatic cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

/**
 * Performance monitoring categories
 */
export enum MetricCategory {
  AI_GENERATION = 'ai.generation',
  AI_PROVIDER = 'ai.provider',
  CONTEXT_MANAGEMENT = 'context.management',
  MEMORY_OPERATIONS = 'memory.operations',
  VOICE_SYNTHESIS = 'voice.synthesis',
  AVATAR_RENDERING = 'avatar.rendering',
  IPC_CALLS = 'ipc.calls',
  DATABASE = 'database',
  NETWORK = 'network',
  SYSTEM = 'system'
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
  start(operationId: string): void {
    this.timers.set(operationId, performance.now());
  }

  /**
   * End timing and record metric
   */
  end(operationId: string, metricName: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(operationId);
    if (!startTime) {
      logger.warn(`No start time found for operation: ${operationId}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(operationId);

    this.record(metricName, duration, metadata);

    // Log slow operations
    if (duration > 1000) {
      logger.warn(`Slow operation: ${metricName} took ${duration.toFixed(2)}ms`, metadata);
    }

    return duration;
  }

  /**
   * Measure a synchronous function
   */
  measure<T>(metricName: string, fn: () => T, metadata?: Record<string, any>): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.record(metricName, duration, metadata);
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
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.record(metricName, duration, metadata);
    }
  }

  /**
   * Record a metric value
   */
  record(metricName: string, value: number, metadata?: Record<string, any>): void {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, new PerformanceMetric(metricName));
    }

    this.metrics.get(metricName)!.record(value, metadata);
  }

  /**
   * Get statistics for a metric
   */
  getStats(metricName: string): MetricStats | null {
    const metric = this.metrics.get(metricName);
    return metric ? metric.getStats() : null;
  }

  /**
   * Get all metrics matching a pattern
   */
  getMetricsByPattern(pattern: RegExp): Map<string, MetricStats> {
    const results = new Map<string, MetricStats>();

    for (const [name, metric] of this.metrics.entries()) {
      if (pattern.test(name)) {
        results.set(name, metric.getStats());
      }
    }

    return results;
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: MetricCategory): Map<string, MetricStats> {
    return this.getMetricsByPattern(new RegExp(`^${category}\\.`));
  }

  /**
   * Get dashboard summary
   */
  getDashboardSummary(): Record<string, any> {
    const summary: Record<string, any> = {};

    // AI Generation metrics
    const aiGen = this.getStats(MetricCategory.AI_GENERATION);
    if (aiGen && aiGen.count > 0) {
      summary.aiGeneration = {
        avgLatency: Math.round(aiGen.avg),
        p95Latency: Math.round(aiGen.p95),
        totalRequests: aiGen.count,
        minLatency: Math.round(aiGen.min),
        maxLatency: Math.round(aiGen.max)
      };
    }

    // Context management metrics
    const contextStats = this.getStats(`${MetricCategory.CONTEXT_MANAGEMENT}.truncation`);
    if (contextStats && contextStats.count > 0) {
      summary.contextManagement = {
        truncationEvents: contextStats.count,
        avgTokensRemoved: Math.round(contextStats.avg),
        totalTokensSaved: Math.round(contextStats.sum)
      };
    }

    // Memory operations
    const memoryStats = this.getStats(MetricCategory.MEMORY_OPERATIONS);
    if (memoryStats && memoryStats.count > 0) {
      summary.memoryOperations = {
        avgLatency: Math.round(memoryStats.avg),
        p95Latency: Math.round(memoryStats.p95),
        totalOps: memoryStats.count
      };
    }

    // IPC calls
    const ipcStats = this.getStats(MetricCategory.IPC_CALLS);
    if (ipcStats && ipcStats.count > 0) {
      summary.ipcCalls = {
        avgLatency: Math.round(ipcStats.avg),
        p95Latency: Math.round(ipcStats.p95),
        totalCalls: ipcStats.count
      };
    }

    return summary;
  }

  /**
   * Get detailed report for all metrics
   */
  getDetailedReport(): Record<string, MetricStats> {
    const report: Record<string, MetricStats> = {};

    for (const [name, metric] of this.metrics.entries()) {
      report[name] = metric.getStats();
    }

    return report;
  }

  /**
   * Clear a specific metric
   */
  clearMetric(metricName: string): void {
    this.metrics.get(metricName)?.clear();
  }

  /**
   * Clear all metrics
   */
  clearAll(): void {
    for (const metric of this.metrics.values()) {
      metric.clear();
    }
  }

  /**
   * Cleanup old data for all metrics
   */
  cleanup(): void {
    for (const metric of this.metrics.values()) {
      metric.cleanup();
    }
  }

  /**
   * Destroy monitor and cleanup resources
   */
  destroy(): void {
    for (const metric of this.metrics.values()) {
      metric.destroy();
    }
    this.metrics.clear();
    this.timers.clear();
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Convenience decorator for measuring method performance
 */
export function Measure(metricName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measureAsync(
        metricName,
        () => originalMethod.apply(this, args),
        { method: propertyKey }
      );
    };

    return descriptor;
  };
}

/**
 * Convenience functions
 */
export function startTimer(operationId: string): void {
  performanceMonitor.start(operationId);
}

export function endTimer(operationId: string, metricName: string, metadata?: Record<string, any>): number {
  return performanceMonitor.end(operationId, metricName, metadata);
}

export function recordMetric(metricName: string, value: number, metadata?: Record<string, any>): void {
  performanceMonitor.record(metricName, value, metadata);
}

export function getMetricStats(metricName: string): MetricStats | null {
  return performanceMonitor.getStats(metricName);
}

export function getPerformanceDashboard(): Record<string, any> {
  return performanceMonitor.getDashboardSummary();
}
