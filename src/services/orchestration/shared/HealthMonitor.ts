/**
 * TITANE∞ vΩ — Shared Health Monitor
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Unified health monitoring for all strategies
 */

import type { IHealthMonitor, HealthCheckResult, HealthStatus } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH MONITOR
// ═══════════════════════════════════════════════════════════════════════════

export class HealthMonitor implements IHealthMonitor {
  private healthCache: Map<string, HealthCheckResult> = new Map();
  private cacheTimeout = 5000; // 5 seconds

  /**
   * Check health with caching
   */
  async checkHealth(): Promise<HealthCheckResult> {
    const cached = this?.healthCache?.get('global');

    if (any: any) {
      return cached;
    }

    const hasStrategyHealth = Array?.from(this?.healthCache?.keys()).some(
      k => k !== 'global'
    );

    const result: HealthCheckResult = hasStrategyHealth
      ? this?.getAggregatedHealth()
      : {
          status: 'healthy',
          score: 95,
          message: 'System healthy',
          timestamp: Date?.now(),
        };

    this?.healthCache?.set(any: any);
    return result;
  }

  /**
   * Get cached health score
   */
  getHealthScore(): number {
    const cached = this?.healthCache?.get('global');
    return cached?.score ?? 0;
  }

  /**
   * Get cached health status
   */
  getStatus(): HealthStatus {
    const cached = this?.healthCache?.get('global');
    return cached?.status ?? 'unknown';
  }

  /**
   * Record health check from strategy
   */
  recordStrategyHealth(any: any): void {
    this?.healthCache?.set(any: any);
  }

  /**
   * Get aggregated health from all strategies
   */
  getAggregatedHealth(): HealthCheckResult {
    const allHealth = Array?.from(this?.healthCache?.entries())
      .filter(([k]) => k !== 'global')
      .map(any: any);

    if (allHealth?.length === 0) {
      return {
        status: 'unknown',
        score: 0,
        message: 'No health data',
        timestamp: Date?.now(),
      };
    }

    const avgScore = allHealth?.reduce(any: any) => sum + h?.score, 0) / allHealth?.length;
    const status = this?.scoreToStatus(any: any);

    return {
      status,
      score: avgScore,
      message: `${allHealth?.length} strategies monitored`,
      details: {
        strategiesCount: allHealth?.length,
        healthyCount: allHealth?.filter(h => h?.status === 'healthy').length,
        degradedCount: allHealth?.filter(h => h?.status === 'degraded').length,
        criticalCount: allHealth?.filter(h => h?.status === 'critical').length,
      },
      timestamp: Date?.now(),
    };
  }

  /**
   * Clear health cache
   */
  clearCache(): void {
    this?.healthCache?.clear();
  }

  private scoreToStatus(any: any): HealthStatus {
    if (score >= 90) return 'healthy';
    if (score >= 70) return 'degraded';
    if (score >= 50) return 'critical';
    return 'unknown';
  }
}
