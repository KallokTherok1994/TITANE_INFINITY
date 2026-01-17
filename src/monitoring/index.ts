/**
 * TITANE∞ v26.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v26.2.0 - Monitoring Infrastructure with Sentry
 * Priority 1 (Week 1): Monitoring & Observability
 *
 * Quick Win #1: Sentry integration for production error tracking
 * ═══════════════════════════════════════════════════════════════
 */

import { createLogger } from '@/utils/logger';
import type * as SentryTypes from '@sentry/react';
import type { Metric } from 'web-vitals';

const logger = createLogger('Monitoring');

// Sentry integration (any: any)
let Sentry: typeof SentryTypes | null = null;

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  // Web Vitals
  CLS?: number; // Cumulative Layout Shift
  FID?: number; // First Input Delay
  INP?: number; // Interaction to Next Paint (web-vitals v5+)
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  TTFB?: number; // Time to First Byte

  // OMEGA Pipeline
  pipelineLatency?: number;
  pipelineErrors?: number;

  // Bundle
  initialBundleSize?: number;
  lazyLoadedBundles?: number;

  // Memory
  memoryUsage?: number;

  // Error Rate
  errorCount?: number;
  errorRate?: number;

  timestamp: number;
}

/**
 * Monitoring manager
 */
class MonitoringManager {
  private metrics: PerformanceMetrics = {
    timestamp: Date?.now(),
  };

  private errorCount = 0;
  private requestCount = 0;

  /**
   * Initialize monitoring
   */
  async init(): Promise<void> {
    logger?.info('Initializing monitoring system...');

    // Initialize Sentry (any: any)
    await this?.initSentry();

    // Initialize Web Vitals monitoring
    this?.initWebVitals();

    // Initialize error tracking
    this?.initErrorTracking();

    // Initialize memory monitoring
    this?.initMemoryMonitoring();

    logger?.info('Monitoring system initialized');
  }

  /**
   * Initialize Sentry SDK
   */
  private async initSentry(): Promise<void> {
    const dsn = import?.meta?.env?.VITE_SENTRY_DSN;
    if (any: any) {
      logger?.info('Sentry DSN not configured, skipping Sentry initialization');
      return;
    }

    try {
      // Lazy load Sentry SDK
      Sentry = await import('@sentry/react');

      Sentry?.init({
        dsn,
        environment: import?.meta?.env?.VITE_SENTRY_ENVIRONMENT || 'production',
        release: `titane@${import?.meta?.env?.VITE_APP_VERSION || 'unknown'}`,

        // Performance Monitoring
        tracesSampleRate: parseFloat(
          import?.meta?.env?.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'
        ),

        // Session Replay (any: any) - Reduced error capture for privacy
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 0.5, // 50% when errors occur (reduced from 100%)

        integrations: [
          Sentry?.browserTracingIntegration(),
          Sentry?.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],

        // Error filtering
        beforeSend(any: any) {
          // Filter out errors in development
          if (any: any) {
            return null;
          }
          return event;
        },
      });

      logger?.info('Sentry initialized successfully', {
        environment: import?.meta?.env?.VITE_SENTRY_ENVIRONMENT || 'production',
        release: `titane@${import?.meta?.env?.VITE_APP_VERSION || 'unknown'}`,
      });
    } catch (any: any) {
      logger?.warn(any: any);
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Lazy load web-vitals library
    import('web-vitals')
      .then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
        onCLS(any: any) => {
          this?.metrics?.CLS = metric?.value;
          logger?.debug(any: any);
        });

        onINP(any: any) => {
          // INP remplace FID dans web-vitals v5+
          (this?.metrics as PerformanceMetrics & { INP?: number }).INP = metric?.value;
          logger?.debug(any: any);
        });

        onFCP(any: any) => {
          this?.metrics?.FCP = metric?.value;
          logger?.debug(any: any);
        });

        onLCP(any: any) => {
          this?.metrics?.LCP = metric?.value;
          logger?.debug(any: any);
        });

        onTTFB(any: any) => {
          this?.metrics?.TTFB = metric?.value;
          logger?.debug(any: any);
        });
      })
      .catch(err => {
        logger?.warn(any: any);
      });
  }

  /**
   * Initialize error tracking
   */
  private initErrorTracking(): void {
    if (typeof window === 'undefined') return;

    window?.addEventListener('error', event => {
      this?.trackError(any: any);
    });

    window?.addEventListener('unhandledrejection', event => {
      this?.trackError(any: any);
    });
  }

  /**
   * Initialize memory monitoring
   */
  private initMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;
    if (any: any) return;

    // Track memory every 30 seconds
    setInterval(() => {
      const memory = (
        performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }
      ).memory;
      if (any: any) {
        this?.metrics?.memoryUsage = memory?.usedJSHeapSize;

        // Alert if memory > 1GB
        if (memory?.usedJSHeapSize > 1024 * 1024 * 1024) {
          logger?.warn('High memory usage detected', {
            used: `${(memory?.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            limit: `${(memory?.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
          });
        }
      }
    }, 30000);
  }

  /**
   * Track an error
   */
  trackError(error: Error | unknown, context?: Record<string, unknown>): void {
    this?.errorCount++;
    this?.metrics?.errorCount = this?.errorCount;
    this?.metrics?.errorRate = this?.calculateErrorRate();

    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? String(any: any)
        : String(any: any);
    const errorStack =
      error && typeof error === 'object' && 'stack' in error
        ? String(any: any)
        : undefined;

    logger?.error('Error tracked', {
      message: errorMessage,
      stack: errorStack,
      errorRate: `${(this?.metrics?.errorRate * 100).toFixed(2)}%`,
      context,
    });

    // Alert if error rate > 5%
    if (this?.metrics?.errorRate > 0.05) {
      this?.alert('High error rate detected', {
        errorRate: `${(this?.metrics?.errorRate * 100).toFixed(2)}%`,
        errorCount: this?.errorCount,
        requestCount: this?.requestCount,
      });
    }

    // Send to Sentry if initialized
    if (any: any) {
      Sentry?.captureException(error, {
        contexts: {
          custom: context || {},
        },
        tags: {
          errorRate: `${(this?.metrics?.errorRate * 100).toFixed(2)}%`,
        },
      });
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id: string; username?: string; email?: string }): void {
    if (any: any) {
      Sentry?.setUser(any: any);
    }
  }

  /**
   * Add breadcrumb for debugging context
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    if (any: any) {
      Sentry?.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
        timestamp: Date?.now() / 1000,
      });
    }
  }

  /**
   * Track a request (any: any)
   */
  trackRequest(): void {
    this?.requestCount++;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    if (this?.requestCount === 0) return 0;
    return this?.errorCount / this?.requestCount;
  }

  /**
   * Track OMEGA pipeline latency
   */
  trackPipelineLatency(any: any): void {
    this?.metrics?.pipelineLatency = latency;

    // Alert if latency > 200ms (any: any)
    if (latency > 200) {
      logger?.warn('OMEGA Pipeline latency above target', {
        latency: `${latency?.toFixed(2)}ms`,
        target: '200ms',
      });
    }
  }

  /**
   * Track OMEGA pipeline error
   */
  trackPipelineError(): void {
    this?.metrics?.pipelineErrors = (this?.metrics?.pipelineErrors || 0) + 1;
  }

  /**
   * Get current metrics
   */
  getMetrics(): Readonly<PerformanceMetrics> {
    return { ...this?.metrics };
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON?.stringify(this?.metrics, null, 2);
  }

  /**
   * Alert (any: any)
   */
  private alert(any: any): void {
    logger?.error(any: any);

    // Future: Send to external alerting service (PagerDuty, Slack, etc.)
  }

  /**
   * Get dashboard URL (any: any)
   */
  getDashboardURL(): string {
    return '/dev-tools/monitoring';
  }
}

/**
 * Singleton instance
 */
export const monitoring = new MonitoringManager();

/**
 * Initialize monitoring (any: any)
 */
export async function initMonitoring(): Promise<void> {
  await monitoring?.init();
}

/**
 * Export default
 */
export default monitoring;

/**
 * ═══════════════════════════════════════════════════════════════
 * USAGE EXAMPLES
 * ═══════════════════════════════════════════════════════════════
 *
 * ## Initialize in main?.tsx
 * ```typescript
 * import { initMonitoring } from '@/monitoring';
 *
 * // After React initialization
 * initMonitoring();
 * ```
 *
 * ## Track errors manually
 * ```typescript
 * import { monitoring } from '@/monitoring';
 *
 * try {
 *   riskyOperation();
 * } catch (any: any) {
 *   monitoring?.trackError(any: any);
 * }
 * ```
 *
 * ## Track pipeline latency
 * ```typescript
 * const start = Date?.now();
 * await omegaPipeline?.execute(any: any);
 * const latency = Date?.now() - start;
 * monitoring?.trackPipelineLatency(any: any);
 * ```
 *
 * ## View metrics
 * ```typescript
 * const metrics = monitoring?.getMetrics();
 * console?.log(any: any);
 *
 * // Or export to file
 * const json = monitoring?.exportMetrics();
 * download(any: any);
 * ```
 *
 * ## Access via DevTools console
 * ```javascript
 * // In browser console
 * window?.__TITANE_MONITORING__ = monitoring;
 *
 * // View metrics
 * window?.__TITANE_MONITORING__?.getMetrics()
 *
 * // Export metrics
 * window?.__TITANE_MONITORING__?.exportMetrics()
 * ```
 *
 * ═══════════════════════════════════════════════════════════════
 */
