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
  private metrics: Metric[] = [];
  private maxMetrics = 10000; // Keep last 10k metrics
  private strategySummaries: Map<string, MetricsSummary> = new Map();

  /**
   * Record a metric
   */
  recordMetric(metric: Metric): void {
    this.metrics.push(metric);

    // Trim if exceeded max
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  /**
   * Get aggregated summary
   */
  getSummary(): MetricsSummary {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        successRate: 1.0,
        averageLatency: 0,
        errorCount: 0,
        timestamp: Date.now(),
      };
    }

    // Count requests by tags
    const requests = this.metrics.filter(m => m.type === 'counter');
    const totalRequests = requests.length;

    // Count errors (success=false tags)
    const errorCount = requests.filter(m => m.tags?.success === 'false').length;
    const successRate =
      totalRequests > 0 ? (totalRequests - errorCount) / totalRequests : 1.0;

    // Calculate average latency from histogram metrics
    const latencies = this.metrics
      .filter(m => m.type === 'histogram' && m.name.includes('latency'))
      .map(m => m.value);

    const averageLatency =
      latencies.length > 0
        ? latencies.reduce((sum, v) => sum + v, 0) / latencies.length
        : 0;

    return {
      totalRequests,
      successRate,
      averageLatency,
      errorCount,
      timestamp: Date.now(),
      details: {
        metricsCount: this.metrics.length,
        strategiesReporting: this.strategySummaries.size,
      },
    };
  }

  /**
   * Record strategy summary
   */
  recordStrategySummary(strategyType: string, summary: MetricsSummary): void {
    this.strategySummaries.set(strategyType, summary);
  }

  /**
   * Get strategy-specific summary
   */
  getStrategySummary(strategyType: string): MetricsSummary | undefined {
    return this.strategySummaries.get(strategyType);
  }

  /**
   * Get all strategy summaries
   */
  getAllStrategySummaries(): Record<string, MetricsSummary> {
    const result: Record<string, MetricsSummary> = {};
    this.strategySummaries.forEach((summary, type) => {
      result[type] = summary;
    });
    return result;
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): Metric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: MetricType): Metric[] {
    return this.metrics.filter(m => m.type === type);
  }

  /**
   * Get metrics by time range
   */
  getMetricsInRange(startTime: number, endTime: number): Metric[] {
    return this.metrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime);
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = [];
    this.strategySummaries.clear();
  }

  /**
   * Reset specific strategy metrics
   */
  resetStrategy(strategyType: string): void {
    this.strategySummaries.delete(strategyType);
    this.metrics = this.metrics.filter(m => m.tags?.strategy !== strategyType);
  }
}
