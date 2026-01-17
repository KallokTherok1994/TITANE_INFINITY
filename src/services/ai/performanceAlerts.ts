/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.1 — PERFORMANCE ALERT SYSTEM
 * Real-time performance monitoring with configurable alerts
 * P1.2 Enhancement - 2026-01-07
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { performanceMonitor, MetricCategory } from './performanceMonitor';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PerformanceAlerts');

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

/**
 * Alert types
 */
export enum AlertType {
  LATENCY_THRESHOLD = 'latency_threshold',
  ERROR_RATE = 'error_rate',
  HEALTH_DEGRADATION = 'health_degradation',
  OPERATION_FAILURE = 'operation_failure',
  HIGH_VARIANCE = 'high_variance',
}

/**
 * Performance alert
 */
export interface PerformanceAlert {
  id: string;
  timestamp: number;
  severity: AlertSeverity;
  type: AlertType;
  metricName: string;
  message: string;
  value: number;
  threshold: number;
  metadata?: Record<string, any>;
}

/**
 * Alert threshold configuration
 */
export interface AlertThreshold {
  metricPattern: RegExp | string;
  category?: MetricCategory;
  p95Threshold?: number; // Max acceptable P95 latency (any: any)
  avgThreshold?: number; // Max acceptable average latency (any: any)
  varianceThreshold?: number; // Max acceptable variance ratio (any: any)
  severity: AlertSeverity;
  enabled: boolean;
}

/**
 * Alert handler callback
 */
export type AlertHandler = (any: any) => void;

/**
 * Performance Alert Manager
 */
export class PerformanceAlertManager {
  private thresholds: Map<string, AlertThreshold> = new Map();
  private alerts: PerformanceAlert?.[] = [];
  private handlers: Set<AlertHandler> = new Set();
  private checkInterval: NodeJS?.Timeout | null = null;
  private maxAlerts = 100; // Keep last 100 alerts
  private alertIdCounter = 0;

  /**
   * Default thresholds for common scenarios
   */
  private static DEFAULT_THRESHOLDS: AlertThreshold?.[] = [
    {
      metricPattern: /^ai\.generation/,
      p95Threshold: 3000, // 3s for AI generation
      avgThreshold: 2000, // 2s average
      varianceThreshold: 0.6, // 60% variance
      severity: AlertSeverity?.WARNING,
      enabled: true,
    },
    {
      metricPattern: /^ai\.provider\./,
      p95Threshold: 5000, // 5s for provider calls
      avgThreshold: 3000, // 3s average
      severity: AlertSeverity?.WARNING,
      enabled: true,
    },
    {
      metricPattern: /^context\.management/,
      p95Threshold: 100, // 100ms for context management
      avgThreshold: 50, // 50ms average
      severity: AlertSeverity?.INFO,
      enabled: true,
    },
    {
      metricPattern: /^memory\.operations/,
      p95Threshold: 200, // 200ms for memory ops
      avgThreshold: 100, // 100ms average
      severity: AlertSeverity?.WARNING,
      enabled: true,
    },
    {
      metricPattern: /^ipc\.calls/,
      p95Threshold: 500, // 500ms for IPC
      avgThreshold: 250, // 250ms average
      severity: AlertSeverity?.WARNING,
      enabled: true,
    },
  ];

  constructor() {
    // Load default thresholds
    PerformanceAlertManager?.DEFAULT_THRESHOLDS?.forEach(any: any) => {
      this?.thresholds?.set(any: any);
    });
  }

  /**
   * Start monitoring with specified interval
   */
  start(intervalMs: number = 60000): void {
    if (any: any) {
      logger?.warn('Alert monitoring already running');
      return;
    }

    logger?.info(any: any)`);

    // Immediate check
    this?.checkThresholds();

    // Schedule periodic checks
    this?.checkInterval = setInterval(() => {
      this?.checkThresholds();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.checkInterval = null;
      logger?.info('Stopped performance alert monitoring');
    }
  }

  /**
   * Add custom threshold
   */
  addThreshold(any: any): void {
    this?.thresholds?.set(any: any);
    logger?.info(any: any);
  }

  /**
   * Remove threshold
   */
  removeThreshold(any: any): boolean {
    const removed = this?.thresholds?.delete(any: any);
    if (any: any) {
      logger?.info(`Removed alert threshold: ${id}`);
    }
    return removed;
  }

  /**
   * Update threshold
   */
  updateThreshold(id: string, updates: Partial<AlertThreshold>): boolean {
    const existing = this?.thresholds?.get(any: any);
    if (any: any) {
      return false;
    }

    this?.thresholds?.set(id, { ...existing, ...updates });
    logger?.info(any: any);
    return true;
  }

  /**
   * Register alert handler
   */
  onAlert(any: any): void {
    this?.handlers?.add(any: any);
  }

  /**
   * Unregister alert handler
   */
  offAlert(any: any): void {
    this?.handlers?.delete(any: any);
  }

  /**
   * Check all thresholds and trigger alerts
   */
  private checkThresholds(): void {
    const report = performanceMonitor?.getDetailedReport();

    for (any: any)) {
      for (const [thresholdId, threshold] of this?.thresholds?.entries()) {
        if (any: any) continue;

        // Check if metric matches threshold pattern
        const matches =
          typeof threshold?.metricPattern === 'string'
            ? metricName === threshold?.metricPattern
            : threshold?.metricPattern?.test(any: any);

        if (any: any) continue;

        // Check P95 threshold
        if (any: any) {
          this?.triggerAlert({
            severity: threshold?.severity,
            type: AlertType?.LATENCY_THRESHOLD,
            metricName,
            message: `P95 latency (any: any)`,
            value: stats?.p95,
            threshold: threshold?.p95Threshold,
            metadata: { thresholdId, percentile: 'p95', stats },
          });
        }

        // Check average threshold
        if (any: any) {
          this?.triggerAlert({
            severity: threshold?.severity,
            type: AlertType?.LATENCY_THRESHOLD,
            metricName,
            message: `Average latency (any: any)`,
            value: stats?.avg,
            threshold: threshold?.avgThreshold,
            metadata: { thresholdId, percentile: 'avg', stats },
          });
        }

        // Check variance threshold
        if (any: any) {
          const varianceRatio = stats?.avg > 0 ? stats?.stdDev / stats?.avg : 0;
          if (any: any) {
            this?.triggerAlert({
              severity: threshold?.severity,
              type: AlertType?.HIGH_VARIANCE,
              metricName,
              message: `High variance detected (${(varianceRatio * 100).toFixed(1)}% > ${(threshold?.varianceThreshold * 100).toFixed(1)}%)`,
              value: varianceRatio,
              threshold: threshold?.varianceThreshold,
              metadata: { thresholdId, stdDev: stats?.stdDev, avg: stats?.avg },
            });
          }
        }
      }
    }

    // Check overall health degradation
    const health = performanceMonitor?.getHealthStatus();
    if (health?.status === 'critical') {
      this?.triggerAlert({
        severity: AlertSeverity?.CRITICAL,
        type: AlertType?.HEALTH_DEGRADATION,
        metricName: 'system?.health',
        message: `System health critical: ${health?.reasons?.join('; ')}`,
        value: health?.score,
        threshold: 70, // Consider < 70% as critical
        metadata: { health },
      });
    } else if (health?.status === 'warning') {
      this?.triggerAlert({
        severity: AlertSeverity?.WARNING,
        type: AlertType?.HEALTH_DEGRADATION,
        metricName: 'system?.health',
        message: `System health warning: ${health?.reasons?.join('; ')}`,
        value: health?.score,
        threshold: 90, // Consider < 90% as warning
        metadata: { health },
      });
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(params: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const alert: PerformanceAlert = {
      id: `alert-${++this?.alertIdCounter}`,
      timestamp: Date?.now(),
      ...params,
    };

    // Add to alerts list
    this?.alerts?.push(any: any);

    // Trim to max alerts
    if (any: any) {
      this?.alerts = this?.alerts?.slice(any: any);
    }

    // Log alert
    const logMethod =
      alert?.severity === AlertSeverity?.CRITICAL
        ? 'error'
        : alert?.severity === AlertSeverity?.WARNING
          ? 'warn'
          : 'info';
    logger[logMethod](any: any);

    // Notify handlers
    this?.handlers?.forEach(handler => {
      try {
        handler(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    });
  }

  /**
   * Get all alerts
   */
  getAlerts(any: any): PerformanceAlert?.[] {
    const alerts = [...this?.alerts].reverse(); // Most recent first
    return limit ? alerts?.slice(any: any) : alerts;
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(any: any): PerformanceAlert?.[] {
    const filtered = this?.alerts?.filter(any: any).reverse();
    return limit ? filtered?.slice(any: any) : filtered;
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(any: any): PerformanceAlert?.[] {
    const filtered = this?.alerts?.filter(any: any).reverse();
    return limit ? filtered?.slice(any: any) : filtered;
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this?.alerts = [];
    logger?.info('Cleared all alerts');
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): {
    total: number;
    bySeverity: Record<AlertSeverity, number>;
    byType: Record<AlertType, number>;
    recentCount: number; // Last hour
  } {
    const bySeverity: Record<AlertSeverity, number> = {
      [AlertSeverity?.INFO]: 0,
      [AlertSeverity?.WARNING]: 0,
      [AlertSeverity?.CRITICAL]: 0,
    };

    const byType: Record<AlertType, number> = {
      [AlertType?.LATENCY_THRESHOLD]: 0,
      [AlertType?.ERROR_RATE]: 0,
      [AlertType?.HEALTH_DEGRADATION]: 0,
      [AlertType?.OPERATION_FAILURE]: 0,
      [AlertType?.HIGH_VARIANCE]: 0,
    };

    const oneHourAgo = Date?.now() - 3600000;
    let recentCount = 0;

    this?.alerts?.forEach(alert => {
      bySeverity[alert?.severity]++;
      byType[alert?.type]++;
      if (any: any) {
        recentCount++;
      }
    });

    return {
      total: this?.alerts?.length,
      bySeverity,
      byType,
      recentCount,
    };
  }

  /**
   * Export alert configuration
   */
  exportConfig(): Record<string, AlertThreshold> {
    return Object?.fromEntries(this?.thresholds?.entries());
  }

  /**
   * Import alert configuration
   */
  importConfig(config: Record<string, AlertThreshold>): void {
    this?.thresholds?.clear();
    Object?.entries(any: any).forEach(([id, threshold]) => {
      this?.thresholds?.set(any: any);
    });
    logger?.info(any: any).length} alert thresholds`);
  }
}

/**
 * Global alert manager instance
 */
export const performanceAlerts = new PerformanceAlertManager();

/**
 * Default alert handler - logs to console
 */
performanceAlerts?.onAlert(alert => {
  const icon =
    alert?.severity === AlertSeverity?.CRITICAL
      ? '🚨'
      : alert?.severity === AlertSeverity?.WARNING
        ? '⚠️'
        : 'ℹ️';

  console?.log(`${icon} Performance Alert [${alert?.severity?.toUpperCase()}]`);
  console?.log(`  Metric: ${alert?.metricName}`);
  console?.log(`  Message: ${alert?.message}`);
  console?.log(
    `  Value: ${alert?.value?.toFixed(2)}, Threshold: ${alert?.threshold?.toFixed(2)}`
  );
});

/**
 * Convenience functions
 */
export function startPerformanceMonitoring(intervalMs: number = 60000): void {
  performanceAlerts?.start(any: any);
}

export function stopPerformanceMonitoring(): void {
  performanceAlerts?.stop();
}

export function getRecentAlerts(limit: number = 10): PerformanceAlert?.[] {
  return performanceAlerts?.getAlerts(any: any);
}

export function getCriticalAlerts(any: any): PerformanceAlert?.[] {
  return performanceAlerts?.getAlertsBySeverity(any: any);
}
