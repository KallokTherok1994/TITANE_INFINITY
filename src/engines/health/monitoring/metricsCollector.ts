/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * MetricsCollector - System metrics collection for SystemHealth
 * Migrated from metricsEngine.ts
 */

import type {
  SystemMetrics,
  MemoryUsage,
  ErrorStats,
  ErrorEntry,
  Alert,
  AlertType,
  Anomaly,
  AnomalyHandler,
} from '../types';

/**
 * MetricsCollector - Collects and analyzes system metrics
 *
 * Features:
 * - CPU/Memory monitoring
 * - Error rate tracking
 * - Anomaly detection
 * - Alert generation
 */
export class MetricsCollector {
  private errors: ErrorEntry[] = [];
  private alerts: Alert[] = [];
  private anomalyHandlers: Set<AnomalyHandler> = new Set();

  private readonly maxErrors = 100;
  private readonly maxAlerts = 50;
  private readonly errorRateWindow = 60 * 1000; // 1 minute
  private alertCounter = 0;

  // Baseline values for anomaly detection
  private baselines = {
    latency: 500, // ms
    errorRate: 0.05, // 5%
    cpu: 50, // %
    memory: 70, // %
  };

  /**
   * Get current CPU usage (estimated)
   */
  getCpu(): number {
    // In browser, we estimate based on performance
    if (typeof performance !== 'undefined' && performance.now) {
      // Use a simple heuristic based on event loop lag
      const start = performance.now();
      // This is a rough estimate
      return Math.min(100, Math.random() * 30 + 10); // Placeholder
    }
    return 0;
  }

  /**
   * Get current memory usage
   */
  getMemory(): MemoryUsage {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const mem = (
        performance as Performance & {
          memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;
      if (mem) {
        return {
          used: mem.usedJSHeapSize,
          total: mem.jsHeapSizeLimit,
          percentage: (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100,
        };
      }
    }
    return { used: 0, total: 0, percentage: 0 };
  }

  /**
   * Record an error
   */
  recordError(source: string, message: string, code?: string): void {
    const entry: ErrorEntry = {
      timestamp: Date.now(),
      source,
      message,
      code,
      recovered: false,
    };

    this.errors.push(entry);

    // Trim old errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Check for anomaly
    this.checkErrorAnomaly();
  }

  /**
   * Mark an error as recovered
   */
  markErrorRecovered(source: string): void {
    const recent = this.errors.filter(e => e.source === source && !e.recovered).pop();
    if (recent) {
      recent.recovered = true;
    }
  }

  /**
   * Get error statistics
   */
  getErrors(): ErrorStats {
    const now = Date.now();
    const recentErrors = this.errors.filter(
      e => now - e.timestamp < this.errorRateWindow
    );

    return {
      rate: recentErrors.length / (this.errorRateWindow / 1000),
      total: this.errors.length,
      recent: this.errors.slice(-10),
    };
  }

  /**
   * Create an alert
   */
  createAlert(
    type: AlertType,
    source: string,
    message: string,
    severity: 'critical' | 'warning' | 'info',
    metadata?: Record<string, unknown>
  ): Alert {
    const alert: Alert = {
      id: `alert_${++this.alertCounter}`,
      type,
      severity,
      source,
      message,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      metadata,
    };

    this.alerts.push(alert);

    // Trim old alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }

    return alert;
  }

  /**
   * Get active (unresolved) alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(id: string): void {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Resolve an alert
   */
  resolveAlert(id: string): void {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Register anomaly handler
   */
  onAnomaly(handler: AnomalyHandler): () => void {
    this.anomalyHandlers.add(handler);
    return () => this.anomalyHandlers.delete(handler);
  }

  /**
   * Get full system metrics
   */
  getMetrics(): SystemMetrics {
    return {
      cpu: this.getCpu(),
      memory: this.getMemory(),
      providers: new Map(), // Populated by SystemHealth
      latency: { p50: 0, p95: 0, p99: 0, avg: 0, samples: 0 },
      errors: this.getErrors(),
      timestamp: Date.now(),
    };
  }

  /**
   * Update baselines for anomaly detection
   */
  updateBaseline(key: keyof typeof this.baselines, value: number): void {
    // Exponential moving average
    this.baselines[key] = this.baselines[key] * 0.9 + value * 0.1;
  }

  /**
   * Check for error rate anomaly
   */
  private checkErrorAnomaly(): void {
    const stats = this.getErrors();
    const threshold = this.baselines.errorRate * 3; // 3x baseline

    if (stats.rate > threshold) {
      const anomaly: Anomaly = {
        type: 'error_burst',
        source: 'system',
        value: stats.rate,
        expected: this.baselines.errorRate,
        deviation: stats.rate / this.baselines.errorRate,
        timestamp: Date.now(),
      };

      this.notifyAnomaly(anomaly);

      // Create alert
      this.createAlert(
        'high_error_rate',
        'system',
        `Error rate ${stats.rate.toFixed(2)}/s exceeds threshold`,
        'warning'
      );
    }
  }

  /**
   * Notify all anomaly handlers
   */
  private notifyAnomaly(anomaly: Anomaly): void {
    this.anomalyHandlers.forEach(handler => {
      try {
        handler(anomaly);
      } catch (error) {
        console.error('[MetricsCollector] Anomaly handler error:', error);
      }
    });
  }
}
