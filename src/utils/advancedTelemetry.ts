/**
 * TITANE∞ vΩ — Advanced Telemetry System (Infaillibilité)
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Système de télémétrie avancé pour monitoring en temps réel
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface TelemetryEvent {
  type: 'metric' | 'error' | 'warning' | 'info';
  category: string;
  name: string;
  value?: number | string | boolean;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface MetricAggregation {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

interface TelemetryConfig {
  enabled: boolean;
  batchSize: number;
  flushIntervalMs: number;
  retentionMs: number;
  enableConsoleLogging: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// ADVANCED TELEMETRY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export class AdvancedTelemetry {
  private events: TelemetryEvent[] = [];
  private config: TelemetryConfig;
  private flushInterval: NodeJS.Timeout | null = null;
  private aggregations: Map<string, number[]> = new Map();

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = {
      enabled: true,
      batchSize: 100,
      flushIntervalMs: 10000, // 10 seconds
      retentionMs: 3600000, // 1 hour
      enableConsoleLogging: false,
      ...config,
    };

    if (this.config.enabled) {
      this.startAutoFlush();
    }
  }

  /**
   * Track metric value
   */
  trackMetric(
    category: string,
    name: string,
    value: number,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.config.enabled) return;

    this.addEvent({
      type: 'metric',
      category,
      name,
      value,
      metadata,
      timestamp: Date.now(),
    });

    // Store for aggregation
    const key = `${category}.${name}`;
    if (!this.aggregations.has(key)) {
      this.aggregations.set(key, []);
    }
    const aggregationArray = this.aggregations.get(key);
    if (aggregationArray) {
      aggregationArray.push(value);
    }
  }

  /**
   * Track error
   */
  trackError(category: string, error: Error, metadata?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    this.addEvent({
      type: 'error',
      category,
      name: error.name,
      value: error.message,
      metadata: {
        stack: error.stack,
        ...metadata,
      },
      timestamp: Date.now(),
    });

    if (this.config.enableConsoleLogging) {
      console.error(`[Telemetry Error] ${category}.${error.name}:`, error);
    }
  }

  /**
   * Track warning
   */
  trackWarning(category: string, message: string, metadata?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    this.addEvent({
      type: 'warning',
      category,
      name: 'warning',
      value: message,
      metadata,
      timestamp: Date.now(),
    });

    if (this.config.enableConsoleLogging) {
      console.warn(`[Telemetry Warning] ${category}: ${message}`);
    }
  }

  /**
   * Track info event
   */
  trackInfo(category: string, message: string, metadata?: Record<string, unknown>): void {
    if (!this.config.enabled) return;

    this.addEvent({
      type: 'info',
      category,
      name: 'info',
      value: message,
      metadata,
      timestamp: Date.now(),
    });

    if (this.config.enableConsoleLogging) {
      console.info(`[Telemetry Info] ${category}: ${message}`);
    }
  }

  /**
   * Start timing an operation
   */
  startTimer(category: string, name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.trackMetric(category, name, duration, { unit: 'ms' });
    };
  }

  /**
   * Track operation with automatic timing
   */
  async trackOperation<T>(
    category: string,
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const endTimer = this.startTimer(category, `${name}.duration`);

    try {
      const result = await operation();
      this.trackMetric(category, `${name}.success`, 1, metadata);
      return result;
    } catch (error) {
      this.trackMetric(category, `${name}.failure`, 1, metadata);
      this.trackError(category, error as Error, metadata);
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Get metric aggregation
   */
  getAggregation(category: string, name: string): MetricAggregation | null {
    const key = `${category}.${name}`;
    const values = this.aggregations.get(key);

    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const count = sorted.length;

    return {
      count,
      sum,
      min: sorted[0] ?? 0,
      max: sorted[count - 1] ?? 0,
      avg: sum / count,
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) return 0;

    const index = Math.ceil((p / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))] ?? 0;
  }

  /**
   * Add event to buffer
   */
  private addEvent(event: TelemetryEvent): void {
    this.events.push(event);

    // Auto-flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Start auto-flush interval
   */
  private startAutoFlush(): void {
    if (this.flushInterval) return;

    this.flushInterval = setInterval(() => {
      this.flush();
      this.cleanup();
    }, this.config.flushIntervalMs);
  }

  /**
   * Flush events to storage/backend
   */
  flush(): void {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    // In production, send to backend/storage
    if (this.config.enableConsoleLogging) {
      console.log('[Telemetry Flush]', {
        eventCount: eventsToFlush.length,
        timestamp: Date.now(),
      });
    }

    // For now, log summary
    this.logSummary(eventsToFlush);
  }

  /**
   * Log summary of events
   */
  private logSummary(events: TelemetryEvent[]): void {
    const summary = {
      total: events.length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      errors: events.filter(e => e.type === 'error').length,
      warnings: events.filter(e => e.type === 'warning').length,
    };

    events.forEach(e => {
      summary.byType[e.type] = (summary.byType[e.type] || 0) + 1;
      summary.byCategory[e.category] = (summary.byCategory[e.category] || 0) + 1;
    });

    if (this.config.enableConsoleLogging) {
      console.log('[Telemetry Summary]', summary);
    }
  }

  /**
   * Cleanup old events
   */
  private cleanup(): void {
    const cutoff = Date.now() - this.config.retentionMs;
    this.events = this.events.filter(e => e.timestamp > cutoff);

    // Cleanup aggregations (keep last 1000 values per metric)
    this.aggregations.forEach((values, key) => {
      if (values.length > 1000) {
        this.aggregations.set(key, values.slice(-1000));
      }
    });
  }

  /**
   * Get all events
   */
  getEvents(filter?: { type?: string; category?: string; since?: number }): TelemetryEvent[] {
    let filtered = [...this.events];

    if (filter?.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }

    if (filter?.category) {
      filtered = filtered.filter(e => e.category === filter.category);
    }

    if (filter?.since !== undefined) {
      const sinceValue = filter.since;
      filtered = filtered.filter(e => e.timestamp >= sinceValue);
    }

    return filtered;
  }

  /**
   * Get health metrics
   */
  getHealthMetrics(): {
    errorRate: number;
    warningRate: number;
    avgResponseTime: number;
    eventCount: number;
  } {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentEvents = this.events.filter(e => e.timestamp > fiveMinutesAgo);

    const errors = recentEvents.filter(e => e.type === 'error').length;
    const warnings = recentEvents.filter(e => e.type === 'warning').length;

    const responseTimes = this.aggregations.get('performance.responseTime') || [];
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    return {
      errorRate: recentEvents.length > 0 ? errors / recentEvents.length : 0,
      warningRate: recentEvents.length > 0 ? warnings / recentEvents.length : 0,
      avgResponseTime,
      eventCount: recentEvents.length,
    };
  }

  /**
   * Stop telemetry
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }

  /**
   * Reset all data
   */
  reset(): void {
    this.events = [];
    this.aggregations.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

export const globalTelemetry = new AdvancedTelemetry({
  enableConsoleLogging: import.meta.env.DEV,
});

// ═══════════════════════════════════════════════════════════════════════════
// DECORATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Decorator to track method execution
 */
export function TrackTelemetry(category: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return globalTelemetry.trackOperation(
        category,
        propertyKey,
        () => originalMethod.apply(this, args),
        { args: args.length }
      );
    };

    return descriptor;
  };
}
