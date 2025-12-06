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
    const cached = this.healthCache.get('global');
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }

    // Compute global health (placeholder - will be aggregated from strategies)
    const result: HealthCheckResult = {
      status: 'healthy',
      score: 95,
      message: 'System healthy',
      timestamp: Date.now()
    };

    this.healthCache.set('global', result);
    return result;
  }

  /**
   * Get cached health score
   */
  getHealthScore(): number {
    const cached = this.healthCache.get('global');
    return cached?.score ?? 0;
  }

  /**
   * Get cached health status
   */
  getStatus(): HealthStatus {
    const cached = this.healthCache.get('global');
    return cached?.status ?? 'unknown';
  }

  /**
   * Record health check from strategy
   */
  recordStrategyHealth(strategyType: string, result: HealthCheckResult): void {
    this.healthCache.set(strategyType, result);
  }

  /**
   * Get aggregated health from all strategies
   */
  getAggregatedHealth(): HealthCheckResult {
    const allHealth = Array.from(this.healthCache.values());
    
    if (allHealth.length === 0) {
      return {
        status: 'unknown',
        score: 0,
        message: 'No health data',
        timestamp: Date.now()
      };
    }

    const avgScore = allHealth.reduce((sum, h) => sum + h.score, 0) / allHealth.length;
    const status = this.scoreToStatus(avgScore);

    return {
      status,
      score: avgScore,
      message: `${allHealth.length} strategies monitored`,
      details: {
        strategiesCount: allHealth.length,
        healthyCount: allHealth.filter(h => h.status === 'healthy').length,
        degradedCount: allHealth.filter(h => h.status === 'degraded').length,
        criticalCount: allHealth.filter(h => h.status === 'critical').length
      },
      timestamp: Date.now()
    };
  }

  /**
   * Clear health cache
   */
  clearCache(): void {
    this.healthCache.clear();
  }

  private scoreToStatus(score: number): HealthStatus {
    if (score >= 90) return 'healthy';
    if (score >= 70) return 'degraded';
    if (score >= 50) return 'critical';
    return 'unknown';
  }
}
