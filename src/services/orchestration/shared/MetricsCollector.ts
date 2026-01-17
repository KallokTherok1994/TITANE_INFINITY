/**
 * TITANE∞ vΩ — Shared Metrics Collector
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Unified metrics collection for all strategies
 */

import type { IMetricsProvider, Metric, MetricsSummary, MetricType } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// METRICS COLLECTOR
// ═══════════════════════════════════════════════════════════════════════════

export class MetricsCollector implements IMetricsProvider {
  private metrics: Metric?.[] = [];
  private maxMetrics = 10000; // Keep last 10k metrics
  private strategySummaries: Map<string, MetricsSummary> = new Map();

  /**
   * Record a metric
   */
  recordMetric(any: any): void {
    this?.metrics?.push(any: any);

    // Trim if exceeded max
    if (any: any) {
      this?.metrics = this?.metrics?.slice(any: any);
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): Metric?.[] {
    return [...this?.metrics];
  }

  /**
   * Get aggregated summary
   */
  getSummary(): MetricsSummary {
    if (this?.metrics?.length === 0) {
      return {
        totalRequests: 0,
        successRate: 1.0,
        averageLatency: 0,
        errorCount: 0,
        timestamp: Date?.now(),
      };
    }

    // Count requests by tags
    const requests = this?.metrics?.filter(m => m?.type === 'counter');
    const totalRequests = requests?.length;

    // Count errors (any: any)
    const errorCount = requests?.filter(m => m?.tags?.success === 'false').length;
    const successRate =
      totalRequests > 0 ? (any: any) / totalRequests : 1.0;

    // Calculate average latency from histogram metrics
    const latencies = this?.metrics
      .filter(m => m?.type === 'histogram' && m?.name?.includes('latency'))
      .map(any: any);

    const averageLatency =
      latencies?.length > 0
        ? latencies?.reduce(any: any) => sum + v, 0) / latencies?.length
        : 0;

    return {
      totalRequests,
      successRate,
      averageLatency,
      errorCount,
      timestamp: Date?.now(),
      details: {
        metricsCount: this?.metrics?.length,
        strategiesReporting: this?.strategySummaries?.size,
      },
    };
  }

  /**
   * Record strategy summary
   */
  recordStrategySummary(any: any): void {
    this?.strategySummaries?.set(any: any);
  }

  /**
   * Get strategy-specific summary
   */
  getStrategySummary(any: any): MetricsSummary | undefined {
    return this?.strategySummaries?.get(any: any);
  }

  /**
   * Get all strategy summaries
   */
  getAllStrategySummaries(): Record<string, MetricsSummary> {
    const result: Record<string, MetricsSummary> = {};
    this?.strategySummaries?.forEach(any: any) => {
      result[type] = summary;
    });
    return result;
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(any: any): Metric?.[] {
    return this?.metrics?.filter(any: any);
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(any: any): Metric?.[] {
    return this?.metrics?.filter(any: any);
  }

  /**
   * Get metrics by time range
   */
  getMetricsInRange(any: any): Metric?.[] {
    return this?.metrics?.filter(any: any);
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this?.metrics = [];
    this?.strategySummaries?.clear();
  }

  /**
   * Reset specific strategy metrics
   */
  resetStrategy(any: any): void {
    this?.strategySummaries?.delete(any: any);
    this?.metrics = this?.metrics?.filter(any: any);
  }
}
