/**
 * TITANE∞ vΩ — Performance Guards (Infaillibilité)
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Guards de performance critiques pour garantir l'infaillibilité
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  responseTime: number;
  errorRate: number;
  timestamp: number;
}

interface PerformanceThresholds {
  minFps: number;
  maxMemoryMB: number;
  maxResponseTimeMs: number;
  maxErrorRate: number;
}

interface PerformanceAlert {
  severity: 'warning' | 'critical';
  metric: keyof PerformanceThresholds;
  value: number;
  threshold: number;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFps: 55, // Minimum 55 FPS (proche de 60)
  maxMemoryMB: 512, // Maximum 512 MB
  maxResponseTimeMs: 100, // Maximum 100ms response time
  maxErrorRate: 0.01, // Maximum 1% error rate
};

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE GUARD
// ═══════════════════════════════════════════════════════════════════════════

export class PerformanceGuard {
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds: PerformanceThresholds;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private frameCount = 0;
  private lastFrameTime = 0;
  private errorCount = 0;
  private operationCount = 0;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(intervalMs = 1000): void {
    if (this.monitoringInterval) {
      return; // Already monitoring
    }

    // Monitor FPS
    this.startFpsMonitoring();

    // Monitor metrics
    this.monitoringInterval = setInterval(() => {
      const metrics = this.collectMetrics();
      this.metrics.push(metrics);

      // Keep last 60 metrics (1 minute at 1s interval)
      if (this.metrics.length > 60) {
        this.metrics.shift();
      }

      // Check thresholds
      this.checkThresholds(metrics);
    }, intervalMs);
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Collect current performance metrics
   */
  private collectMetrics(): PerformanceMetrics {
    const fps = this.calculateFps();
    const memoryUsage = this.getMemoryUsage();
    const responseTime = this.getAverageResponseTime();
    const errorRate = this.calculateErrorRate();

    return {
      fps,
      memoryUsage,
      responseTime,
      errorRate,
      timestamp: Date.now(),
    };
  }

  /**
   * Start FPS monitoring using requestAnimationFrame
   */
  private startFpsMonitoring(): void {
    const measureFps = (timestamp: number) => {
      if (this.lastFrameTime > 0) {
        const delta = timestamp - this.lastFrameTime;
        if (delta < 1000) {
          // Count frames within 1 second window
          this.frameCount++;
        } else {
          // Reset after 1 second
          this.frameCount = 0;
        }
      }

      this.lastFrameTime = timestamp;
      requestAnimationFrame(measureFps);
    };

    requestAnimationFrame(measureFps);
  }

  /**
   * Calculate current FPS
   */
  private calculateFps(): number {
    return this.frameCount;
  }

  /**
   * Get memory usage (MB)
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  /**
   * Get average response time from recent operations
   */
  private getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;

    const recentMetrics = this.metrics.slice(-10); // Last 10 metrics
    const sum = recentMetrics.reduce((acc, m) => acc + m.responseTime, 0);
    return sum / recentMetrics.length;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    if (this.operationCount === 0) return 0;
    return this.errorCount / this.operationCount;
  }

  /**
   * Check if metrics exceed thresholds
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    // Check FPS
    if (metrics.fps < this.thresholds.minFps) {
      this.addAlert({
        severity: metrics.fps < 30 ? 'critical' : 'warning',
        metric: 'minFps',
        value: metrics.fps,
        threshold: this.thresholds.minFps,
        timestamp: Date.now(),
      });
    }

    // Check memory
    if (metrics.memoryUsage > this.thresholds.maxMemoryMB) {
      this.addAlert({
        severity:
          metrics.memoryUsage > this.thresholds.maxMemoryMB * 1.5
            ? 'critical'
            : 'warning',
        metric: 'maxMemoryMB',
        value: metrics.memoryUsage,
        threshold: this.thresholds.maxMemoryMB,
        timestamp: Date.now(),
      });
    }

    // Check response time
    if (metrics.responseTime > this.thresholds.maxResponseTimeMs) {
      this.addAlert({
        severity:
          metrics.responseTime > this.thresholds.maxResponseTimeMs * 2
            ? 'critical'
            : 'warning',
        metric: 'maxResponseTimeMs',
        value: metrics.responseTime,
        threshold: this.thresholds.maxResponseTimeMs,
        timestamp: Date.now(),
      });
    }

    // Check error rate
    if (metrics.errorRate > this.thresholds.maxErrorRate) {
      this.addAlert({
        severity:
          metrics.errorRate > this.thresholds.maxErrorRate * 2 ? 'critical' : 'warning',
        metric: 'maxErrorRate',
        value: metrics.errorRate,
        threshold: this.thresholds.maxErrorRate,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    // Log critical alerts
    if (alert.severity === 'critical') {
      console.error(
        `[PerformanceGuard CRITICAL] ${alert.metric}: ${alert.value} (threshold: ${alert.threshold})`
      );
    } else {
      console.warn(
        `[PerformanceGuard WARNING] ${alert.metric}: ${alert.value} (threshold: ${alert.threshold})`
      );
    }
  }

  /**
   * Track operation for performance metrics
   */
  trackOperation<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    this.operationCount++;

    return operation()
      .then(result => {
        const duration = performance.now() - startTime;

        // Update response time metric
        if (this.metrics.length > 0) {
          const lastMetric = this.metrics[this.metrics.length - 1];
          if (lastMetric) {
            lastMetric.responseTime = duration;
          }
        }

        return result;
      })
      .catch(error => {
        this.errorCount++;
        throw error;
      });
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0
      ? (this.metrics[this.metrics.length - 1] ?? null)
      : null;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    // Return alerts from last 5 minutes
    return this.alerts.filter(a => a.timestamp > fiveMinutesAgo);
  }

  /**
   * Get performance health status
   */
  getHealthStatus(): 'healthy' | 'degraded' | 'critical' {
    const activeAlerts = this.getActiveAlerts();

    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      return 'critical';
    }

    const warningAlerts = activeAlerts.filter(a => a.severity === 'warning');
    if (warningAlerts.length > 3) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Reset all metrics and alerts
   */
  reset(): void {
    this.metrics = [];
    this.alerts = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.errorCount = 0;
    this.operationCount = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

export const globalPerformanceGuard = new PerformanceGuard();

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Decorator to track function performance
 */
export function TrackPerformance() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return globalPerformanceGuard.trackOperation(() =>
        originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}

/**
 * Check if system is healthy for critical operations
 */
export function isSystemHealthy(): boolean {
  const status = globalPerformanceGuard.getHealthStatus();
  return status === 'healthy';
}

/**
 * Wait for system to be healthy (with timeout)
 */
export async function waitForHealthySystem(timeoutMs = 5000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (isSystemHealthy()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return false;
}
