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

const logger = createLogger('Monitoring');

// Sentry integration (lazy-loaded)
let Sentry: any = null;

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  // Web Vitals
  CLS?: number; // Cumulative Layout Shift
  FID?: number; // First Input Delay
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
    timestamp: Date.now(),
  };

  private errorCount = 0;
  private requestCount = 0;

  /**
   * Initialize monitoring
   */
  async init(): Promise<void> {
    logger.info('Initializing monitoring system...');

    // Initialize Sentry (if DSN provided)
    await this.initSentry();

    // Initialize Web Vitals monitoring
    this.initWebVitals();

    // Initialize error tracking
    this.initErrorTracking();

    // Initialize memory monitoring
    this.initMemoryMonitoring();

    logger.info('Monitoring system initialized');
  }

  /**
   * Initialize Sentry SDK
   */
  private async initSentry(): Promise<void> {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn) {
      logger.info('Sentry DSN not configured, skipping Sentry initialization');
      return;
    }

    try {
      // Lazy load Sentry SDK
      const SentryModule = await import('@sentry/react');
      Sentry = SentryModule;

      Sentry.init({
        dsn,
        environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
        release: `titane@${import.meta.env.VITE_APP_VERSION || 'unknown'}`,
        
        // Performance Monitoring
        tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
        
        // Session Replay (optional)
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% when errors occur
        
        integrations: [
          new Sentry.BrowserTracing({
            // Set sampling rate for performance monitoring
            tracePropagationTargets: ['localhost', /^\//],
          }),
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],

        // Error filtering
        beforeSend(event, hint) {
          // Filter out errors in development
          if (import.meta.env.DEV) {
            return null;
          }
          return event;
        },
      });

      logger.info('Sentry initialized successfully', {
        environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
        release: `titane@${import.meta.env.VITE_APP_VERSION || 'unknown'}`,
      });
    } catch (error) {
      logger.warn('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Lazy load web-vitals library
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        this.metrics.CLS = metric.value;
        logger.debug('CLS:', metric.value);
      });

      getFID((metric) => {
        this.metrics.FID = metric.value;
        logger.debug('FID:', metric.value);
      });

      getFCP((metric) => {
        this.metrics.FCP = metric.value;
        logger.debug('FCP:', metric.value);
      });

      getLCP((metric) => {
        this.metrics.LCP = metric.value;
        logger.debug('LCP:', metric.value);
      });

      getTTFB((metric) => {
        this.metrics.TTFB = metric.value;
        logger.debug('TTFB:', metric.value);
      });
    }).catch(err => {
      logger.warn('Failed to load web-vitals:', err);
    });
  }

  /**
   * Initialize error tracking
   */
  private initErrorTracking(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.trackError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason);
    });
  }

  /**
   * Initialize memory monitoring
   */
  private initMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;
    if (!(performance as any).memory) return;

    // Track memory every 30 seconds
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        this.metrics.memoryUsage = memory.usedJSHeapSize;

        // Alert if memory > 1GB
        if (memory.usedJSHeapSize > 1024 * 1024 * 1024) {
          logger.warn('High memory usage detected', {
            used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
          });
        }
      }
    }, 30000);
  }

  /**
   * Track an error
   */
  trackError(error: Error | any, context?: Record<string, any>): void {
    this.errorCount++;
    this.metrics.errorCount = this.errorCount;
    this.metrics.errorRate = this.calculateErrorRate();

    logger.error('Error tracked', {
      message: error?.message || String(error),
      stack: error?.stack,
      errorRate: `${(this.metrics.errorRate * 100).toFixed(2)}%`,
      context,
    });

    // Alert if error rate > 5%
    if (this.metrics.errorRate > 0.05) {
      this.alert('High error rate detected', {
        errorRate: `${(this.metrics.errorRate * 100).toFixed(2)}%`,
        errorCount: this.errorCount,
        requestCount: this.requestCount,
      });
    }

    // Send to Sentry if initialized
    if (Sentry) {
      Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
        tags: {
          errorRate: `${(this.metrics.errorRate * 100).toFixed(2)}%`,
        },
      });
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id: string; username?: string; email?: string }): void {
    if (Sentry) {
      Sentry.setUser(user);
    }
  }

  /**
   * Add breadcrumb for debugging context
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    if (Sentry) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
        timestamp: Date.now() / 1000,
      });
    }
  }

  /**
   * Track a request (for error rate calculation)
   */
  trackRequest(): void {
    this.requestCount++;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    if (this.requestCount === 0) return 0;
    return this.errorCount / this.requestCount;
  }

  /**
   * Track OMEGA pipeline latency
   */
  trackPipelineLatency(latency: number): void {
    this.metrics.pipelineLatency = latency;

    // Alert if latency > 200ms (target)
    if (latency > 200) {
      logger.warn('OMEGA Pipeline latency above target', {
        latency: `${latency.toFixed(2)}ms`,
        target: '200ms',
      });
    }
  }

  /**
   * Track OMEGA pipeline error
   */
  trackPipelineError(): void {
    this.metrics.pipelineErrors = (this.metrics.pipelineErrors || 0) + 1;
  }

  /**
   * Get current metrics
   */
  getMetrics(): Readonly<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Alert (console for now, can be extended to external service)
   */
  private alert(message: string, data: any): void {
    logger.error(`[ALERT] ${message}`, data);

    // TODO: Send to external alerting service (PagerDuty, Slack, etc.)
  }

  /**
   * Get dashboard URL (if implemented)
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
 * Initialize monitoring (call from main.tsx)
 */
export async function initMonitoring(): Promise<void> {
  await monitoring.init();
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
 * ## Initialize in main.tsx
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
 * } catch (error) {
 *   monitoring.trackError(error);
 * }
 * ```
 *
 * ## Track pipeline latency
 * ```typescript
 * const start = Date.now();
 * await omegaPipeline.execute(message);
 * const latency = Date.now() - start;
 * monitoring.trackPipelineLatency(latency);
 * ```
 *
 * ## View metrics
 * ```typescript
 * const metrics = monitoring.getMetrics();
 * console.log('Performance Metrics:', metrics);
 * 
 * // Or export to file
 * const json = monitoring.exportMetrics();
 * download('metrics.json', json);
 * ```
 *
 * ## Access via DevTools console
 * ```javascript
 * // In browser console
 * window.__TITANE_MONITORING__ = monitoring;
 * 
 * // View metrics
 * window.__TITANE_MONITORING__.getMetrics()
 * 
 * // Export metrics
 * window.__TITANE_MONITORING__.exportMetrics()
 * ```
 *
 * ═══════════════════════════════════════════════════════════════
 */
