/**
 * TITANE_INFINITY v∞.40 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.40 — METRICS COLLECTOR (Phase 10)
 *   Collecteur de métriques Prometheus-compatible
 * ═══════════════════════════════════════════════════════════════════
 */

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

class MetricsCollector {
  private config: MetricsCollectorConfig;
  private metrics: Map<string, Metric> = new Map();
  private histogramData: Map<string, number[]> = new Map();
  private readonly STORAGE_KEY = 'titane_metrics';

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
   */
  recordHistogram(
    name: string,
    value: number,
    labels?: Record<string, string>,
    help?: string
  ): void {
    const key = this.getMetricKey(name, labels);

    // Store raw observations
    const dataKey = `${key}_data`;
    const data = this.histogramData.get(dataKey) || [];
    data.push(value);
    this.histogramData.set(dataKey, data);

    // Calculate buckets
    const buckets = this.config.histogramBuckets.map(le => ({
      le,
      count: data.filter(v => v <= le).length,
    }));

    const sum = data.reduce((acc, v) => acc + v, 0);
    const count = data.length;

    const histogramMetric: HistogramMetric = {
      name,
      type: 'histogram',
      value: 0, // Not used for histograms
      labels,
      timestamp: Date.now(),
      help,
      buckets,
      sum,
      count,
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
    const dataKey = `${key}_data`;
    const data = this.histogramData.get(dataKey) || [];
    data.push(value);
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
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.histogramData.clear();
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
   */
  private saveMetricsToStorage(): void {
    if (!this.config.enableStorage) return;

    try {
      const metricsArray = this.getAllMetrics().slice(-this.config.maxStoredMetrics);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(metricsArray));
    } catch (error) {
      console.error('[MetricsCollector] Failed to save metrics to storage:', error);
    }
  }

  /**
   * Load metrics from localStorage
   */
  private loadMetricsFromStorage(): void {
    if (!this.config.enableStorage) return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
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
