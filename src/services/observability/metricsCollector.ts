/**
 * TITANE_INFINITY v∞.40 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.40 — METRICS COLLECTOR (Phase 10)
 *   Collecteur de métriques Prometheus-compatible
 *   ✨ v24.2.1: Debounced storage to reduce I/O from 100+/sec to ~2/sec
 * ═══════════════════════════════════════════════════════════════════
 */

import { getDebouncedStorage } from '@/utils/debouncedStorage';

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
  help?: string;
}

export interface HistogramBucket {
  le: number; // "less than or equal"
  count: number;
}

export interface HistogramMetric extends Metric {
  type: 'histogram';
  buckets: HistogramBucket[];
  sum: number;
  count: number;
}

export interface SummaryMetric extends Metric {
  type: 'summary';
  quantiles: Record<string, number>; // e.g., { "0.5": 123, "0.9": 456, "0.99": 789 }
  sum: number;
  count: number;
}

export interface MetricsCollectorConfig {
  enableStorage: boolean;
  maxStoredMetrics: number;
  histogramBuckets: number[];
  summaryQuantiles: number[];
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * Metrics Collector
 * ═══════════════════════════════════════════════════════════════════
 */

// ✨ v24.2.1: Pre-computed histogram bucket counts for O(buckets) instead of O(n*buckets)
interface HistogramBucketState {
  bucketCounts: number[]; // Count per bucket (incremental)
  sum: number;
  count: number;
}

class MetricsCollector {
  private config: MetricsCollectorConfig;
  private metrics: Map<string, Metric> = new Map();
  private histogramData: Map<string, number[]> = new Map();
  // ✨ v24.2.1: Pre-computed bucket states for O(1) bucket updates
  private histogramBucketStates: Map<string, HistogramBucketState> = new Map();
  private readonly STORAGE_KEY = 'titane_metrics';
  // ✨ v24.2.1: Debounced storage instance
  private debouncedStorage = getDebouncedStorage();

  constructor(config?: Partial<MetricsCollectorConfig>) {
    this.config = {
      enableStorage: true,
      maxStoredMetrics: 10000,
      histogramBuckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      summaryQuantiles: [0.5, 0.9, 0.95, 0.99],
      ...config,
    };

    this.loadMetricsFromStorage();
  }

  /**
   * Increment counter metric
   */
  incrementCounter(
    name: string,
    value = 1,
    labels?: Record<string, string>,
    help?: string
  ): void {
    const key = this.getMetricKey(name, labels);
    const existing = this.metrics.get(key);

    if (existing && existing.type === 'counter') {
      existing.value += value;
      existing.timestamp = Date.now();
    } else {
      this.metrics.set(key, {
        name,
        type: 'counter',
        value,
        labels,
        timestamp: Date.now(),
        help,
      });
    }

    this.saveMetricsToStorage();
  }

  /**
   * Set gauge metric (absolute value)
   */
  setGauge(
    name: string,
    value: number,
    labels?: Record<string, string>,
    help?: string
  ): void {
    const key = this.getMetricKey(name, labels);

    this.metrics.set(key, {
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: Date.now(),
      help,
    });

    this.saveMetricsToStorage();
  }

  /**
   * Record histogram observation (e.g., request duration)
   * ✨ v24.2.1: Optimized from O(n*buckets) to O(buckets) per observation
   */
  recordHistogram(
    name: string,
    value: number,
    labels?: Record<string, string>,
    help?: string
  ): void {
    const key = this.getMetricKey(name, labels);

    // Store raw observations (still needed for exports)
    // ✨ v24.2.1: Limit raw observations to prevent unbounded growth
    const MAX_HISTOGRAM_OBSERVATIONS = 1000;
    const dataKey = `${key}_data`;
    const data = this.histogramData.get(dataKey) || [];
    data.push(value);
    // Enforce size limit (sliding window)
    if (data.length > MAX_HISTOGRAM_OBSERVATIONS) {
      data.splice(0, data.length - MAX_HISTOGRAM_OBSERVATIONS);
    }
    this.histogramData.set(dataKey, data);

    // ✨ v24.2.1: Use incremental bucket state instead of recalculating all
    let bucketState = this.histogramBucketStates.get(key);
    if (!bucketState) {
      bucketState = {
        bucketCounts: new Array(this.config.histogramBuckets.length).fill(0),
        sum: 0,
        count: 0,
      };
      this.histogramBucketStates.set(key, bucketState);
    }

    // ✨ v24.2.1: O(buckets) update - increment only buckets where value fits
    bucketState.sum += value;
    bucketState.count++;
    for (let i = 0; i < this.config.histogramBuckets.length; i++) {
      if (value <= this.config.histogramBuckets[i]) {
        bucketState.bucketCounts[i]++;
      }
    }

    // Build buckets from pre-computed state
    const currentState = bucketState; // Already guaranteed to exist
    const buckets = this.config.histogramBuckets.map((le, i) => ({
      le,
      count: currentState.bucketCounts[i],
    }));

    const histogramMetric: HistogramMetric = {
      name,
      type: 'histogram',
      value: 0, // Not used for histograms
      labels,
      timestamp: Date.now(),
      help,
      buckets,
      sum: bucketState.sum,
      count: bucketState.count,
    };

    this.metrics.set(key, histogramMetric);
    this.saveMetricsToStorage();
  }

  /**
   * Record summary observation (with quantiles)
   */
  recordSummary(
    name: string,
    value: number,
    labels?: Record<string, string>,
    help?: string
  ): void {
    const key = this.getMetricKey(name, labels);

    // Store raw observations
    // ✨ v24.2.1: Limit raw observations to prevent unbounded growth
    const MAX_SUMMARY_OBSERVATIONS = 1000;
    const dataKey = `${key}_data`;
    const data = this.histogramData.get(dataKey) || [];
    data.push(value);
    // Enforce size limit (sliding window)
    if (data.length > MAX_SUMMARY_OBSERVATIONS) {
      data.splice(0, data.length - MAX_SUMMARY_OBSERVATIONS);
    }
    this.histogramData.set(dataKey, data);

    // Calculate quantiles
    const sortedData = [...data].sort((a, b) => a - b);
    const quantiles: Record<string, number> = {};

    this.config.summaryQuantiles.forEach(q => {
      const index = Math.ceil(sortedData.length * q) - 1;
      quantiles[q.toString()] = sortedData[Math.max(0, index)];
    });

    const sum = data.reduce((acc, v) => acc + v, 0);
    const count = data.length;

    const summaryMetric: SummaryMetric = {
      name,
      type: 'summary',
      value: 0, // Not used for summaries
      labels,
      timestamp: Date.now(),
      help,
      quantiles,
      sum,
      count,
    };

    this.metrics.set(key, summaryMetric);
    this.saveMetricsToStorage();
  }

  /**
   * Get metric by name and labels
   */
  getMetric(name: string, labels?: Record<string, string>): Metric | undefined {
    const key = this.getMetricKey(name, labels);
    return this.metrics.get(key);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics by name (all label combinations)
   */
  getMetricsByName(name: string): Metric[] {
    return this.getAllMetrics().filter(m => m.name === name);
  }

  /**
   * Clear all metrics
   * ✨ v24.2.1: Also clear bucket states
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.histogramData.clear();
    this.histogramBucketStates.clear();
    this.saveMetricsToStorage();
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusFormat(): string {
    const lines: string[] = [];

    const metricGroups = new Map<string, Metric[]>();

    // Group by name
    this.getAllMetrics().forEach(metric => {
      const group = metricGroups.get(metric.name) || [];
      group.push(metric);
      metricGroups.set(metric.name, group);
    });

    // Format each group
    metricGroups.forEach((metrics, name) => {
      const firstMetric = metrics[0];

      // HELP
      if (firstMetric.help) {
        lines.push(`# HELP ${name} ${firstMetric.help}`);
      }

      // TYPE
      lines.push(`# TYPE ${name} ${firstMetric.type}`);

      // Values
      metrics.forEach(metric => {
        const labelsStr = this.formatLabels(metric.labels);

        if (metric.type === 'histogram') {
          const hist = metric as HistogramMetric;

          hist.buckets.forEach(bucket => {
            lines.push(`${name}_bucket{${labelsStr}le="${bucket.le}"} ${bucket.count}`);
          });

          lines.push(`${name}_bucket{${labelsStr}le="+Inf"} ${hist.count}`);
          lines.push(`${name}_sum{${labelsStr}} ${hist.sum}`);
          lines.push(`${name}_count{${labelsStr}} ${hist.count}`);
        } else if (metric.type === 'summary') {
          const summ = metric as SummaryMetric;

          Object.entries(summ.quantiles).forEach(([quantile, value]) => {
            lines.push(`${name}{${labelsStr}quantile="${quantile}"} ${value}`);
          });

          lines.push(`${name}_sum{${labelsStr}} ${summ.sum}`);
          lines.push(`${name}_count{${labelsStr}} ${summ.count}`);
        } else {
          lines.push(`${name}{${labelsStr}} ${metric.value}`);
        }
      });

      lines.push(''); // Empty line between metrics
    });

    return lines.join('\n');
  }

  /**
   * Export metrics as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.getAllMetrics(), null, 2);
  }

  /**
   * Get metrics summary
   */
  getSummary(): {
    total: number;
    byType: Record<MetricType, number>;
    byName: Record<string, number>;
  } {
    const byType: Record<MetricType, number> = {
      counter: 0,
      gauge: 0,
      histogram: 0,
      summary: 0,
    };

    const byName: Record<string, number> = {};

    this.getAllMetrics().forEach(metric => {
      byType[metric.type]++;
      byName[metric.name] = (byName[metric.name] || 0) + 1;
    });

    return {
      total: this.metrics.size,
      byType,
      byName,
    };
  }

  /**
   * Generate metric key from name and labels
   */
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const sortedLabels = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');

    return `${name}{${sortedLabels}}`;
  }

  /**
   * Format labels for Prometheus export
   */
  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }

    return (
      Object.entries(labels)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}="${value}"`)
        .join(',') + ','
    );
  }

  /**
   * Save metrics to localStorage
   * ✨ v24.2.1: Uses debounced storage to reduce I/O from 100+/sec to ~2/sec
   */
  private saveMetricsToStorage(): void {
    if (!this.config.enableStorage) return;

    try {
      const metricsArray = this.getAllMetrics().slice(-this.config.maxStoredMetrics);
      // ✨ v24.2.1: Use debounced storage instead of direct localStorage
      this.debouncedStorage.setItem(this.STORAGE_KEY, JSON.stringify(metricsArray));
    } catch (error) {
      console.error('[MetricsCollector] Failed to save metrics to storage:', error);
    }
  }

  /**
   * Load metrics from localStorage
   * ✨ v24.2.1: Uses debounced storage for consistent read-after-write
   */
  private loadMetricsFromStorage(): void {
    if (!this.config.enableStorage) return;

    try {
      // ✨ v24.2.1: Use debounced storage (checks pending writes first)
      const stored = this.debouncedStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const metricsArray: Metric[] = JSON.parse(stored);
        metricsArray.forEach(metric => {
          const key = this.getMetricKey(metric.name, metric.labels);
          this.metrics.set(key, metric);
        });
      }
    } catch (error) {
      console.error('[MetricsCollector] Failed to load metrics from storage:', error);
    }
  }

  /**
   * ✨ v24.2.1: Force flush pending writes (call before shutdown)
   */
  flushStorage(): void {
    this.debouncedStorage.flush();
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * Singleton Export
 * ═══════════════════════════════════════════════════════════════════
 */

export const metricsCollector = new MetricsCollector();

/**
 * ═══════════════════════════════════════════════════════════════════
 * HOF: Measure Operation Duration
 * ═══════════════════════════════════════════════════════════════════
 */

export async function measureOperation<T>(
  name: string,
  fn: () => Promise<T>,
  labels?: Record<string, string>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds

    metricsCollector.recordHistogram(
      `${name}_duration_seconds`,
      duration,
      { ...labels, status: 'success' },
      `Duration of ${name} operation`
    );

    metricsCollector.incrementCounter(
      `${name}_total`,
      1,
      { ...labels, status: 'success' },
      `Total ${name} operations`
    );

    return result;
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;

    metricsCollector.recordHistogram(
      `${name}_duration_seconds`,
      duration,
      { ...labels, status: 'error' },
      `Duration of ${name} operation`
    );

    metricsCollector.incrementCounter(
      `${name}_total`,
      1,
      { ...labels, status: 'error' },
      `Total ${name} operations`
    );

    throw error;
  }
}
