/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * LatencyTracker - Latency tracking and percentile calculation
 */

import type { LatencyStats } from '../types';

/**
 * LatencyTracker - Tracks operation latencies and computes percentiles
 *
 * Features:
 * - Per-operation tracking
 * - Rolling window statistics
 * - Percentile calculation (p50, p95, p99)
 * - Trend detection
 */
export class LatencyTracker {
  private samples: Map<string, number[]> = new Map();
  private readonly maxSamples = 1000;
  private readonly windowMs = 5 * 60 * 1000; // 5 minutes

  /**
   * Track a latency sample
   */
  track(operation: string, latencyMs: number): void {
    if (!this.samples.has(operation)) {
      this.samples.set(operation, []);
    }

    const samples = this.samples.get(operation)!;
    samples.push(latencyMs);

    // Trim old samples
    if (samples.length > this.maxSamples) {
      samples.shift();
    }
  }

  /**
   * Get percentile statistics for all operations
   */
  getPercentiles(): LatencyStats {
    const allSamples = this.getAllSamples();

    if (allSamples.length === 0) {
      return { p50: 0, p95: 0, p99: 0, avg: 0, samples: 0 };
    }

    // Sort for percentile calculation
    const sorted = [...allSamples].sort((a, b) => a - b);

    return {
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
      avg: allSamples.reduce((a, b) => a + b, 0) / allSamples.length,
      samples: allSamples.length,
    };
  }

  /**
   * Get statistics for a specific operation
   */
  getOperationStats(operation: string): LatencyStats | undefined {
    const samples = this.samples.get(operation);
    if (!samples || samples.length === 0) {
      return undefined;
    }

    const sorted = [...samples].sort((a, b) => a - b);

    return {
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
      avg: samples.reduce((a, b) => a + b, 0) / samples.length,
      samples: samples.length,
    };
  }

  /**
   * Get all tracked operations
   */
  getOperations(): string[] {
    return Array.from(this.samples.keys());
  }

  /**
   * Clear all samples
   */
  clear(): void {
    this.samples.clear();
  }

  /**
   * Clear samples for a specific operation
   */
  clearOperation(operation: string): void {
    this.samples.delete(operation);
  }

  /**
   * Check if latency is anomalous
   */
  isAnomalous(operation: string, latencyMs: number): boolean {
    const stats = this.getOperationStats(operation);
    if (!stats || stats.samples < 10) {
      return false;
    }

    // Consider anomalous if > 3x p95
    return latencyMs > stats.p95 * 3;
  }

  /**
   * Get trend direction
   */
  getTrend(operation: string): 'improving' | 'stable' | 'degrading' {
    const samples = this.samples.get(operation);
    if (!samples || samples.length < 20) {
      return 'stable';
    }

    // Compare first half to second half
    const mid = Math.floor(samples.length / 2);
    const firstHalf = samples.slice(0, mid);
    const secondHalf = samples.slice(mid);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = (secondAvg - firstAvg) / firstAvg;

    if (change < -0.1) return 'improving';
    if (change > 0.1) return 'degrading';
    return 'stable';
  }

  /**
   * Get all samples combined
   */
  private getAllSamples(): number[] {
    const all: number[] = [];
    this.samples.forEach(samples => {
      all.push(...samples);
    });
    return all;
  }

  /**
   * Calculate percentile value
   */
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }
}
