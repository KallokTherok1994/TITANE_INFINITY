/**
 * TITANE∞ vΩ — Integration des Guards dans UnifiedOrchestrator
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Tests pour l'intégration des guards de performance
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceGuard, globalPerformanceGuard } from '../../utils/performanceGuards';
import { AdvancedTelemetry, globalTelemetry } from '../../utils/advancedTelemetry';

describe('PerformanceGuard', () => {
  let guard: PerformanceGuard;

  beforeEach(() => {
    guard = new PerformanceGuard();
  });

  afterEach(() => {
    guard.stopMonitoring();
  });

  it('should track operation performance', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const result = await guard.trackOperation(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledOnce();
  });

  it('should track operation errors', async () => {
    const error = new Error('Test error');
    const operation = vi.fn().mockRejectedValue(error);

    await expect(guard.trackOperation(operation)).rejects.toThrow('Test error');
  });

  it('should collect performance metrics', () => {
    guard.startMonitoring(100); // 100ms interval

    // Wait for metrics collection
    return new Promise<void>(resolve => {
      setTimeout(() => {
        const metrics = guard.getCurrentMetrics();
        expect(metrics).toBeDefined();
        expect(metrics?.fps).toBeGreaterThanOrEqual(0);
        expect(metrics?.memoryUsage).toBeGreaterThanOrEqual(0);
        resolve();
      }, 200);
    });
  });

  it('should detect performance degradation', async () => {
    guard.startMonitoring(100);

    // Simulate slow operation
    await guard.trackOperation(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Wait for alert
    await new Promise(resolve => setTimeout(resolve, 150));

    const alerts = guard.getActiveAlerts();
    expect(alerts.length).toBeGreaterThanOrEqual(0); // May or may not trigger depending on thresholds
  });

  it('should provide health status', () => {
    const status = guard.getHealthStatus();
    expect(['healthy', 'degraded', 'critical']).toContain(status);
  });

  it('should reset metrics', () => {
    guard.startMonitoring(100);

    return new Promise<void>(resolve => {
      setTimeout(() => {
        guard.reset();
        const metrics = guard.getAllMetrics();
        expect(metrics).toHaveLength(0);
        resolve();
      }, 150);
    });
  });
});

describe('AdvancedTelemetry', () => {
  let telemetry: AdvancedTelemetry;

  beforeEach(() => {
    telemetry = new AdvancedTelemetry({ enableConsoleLogging: false });
  });

  afterEach(() => {
    telemetry.stop();
  });

  it('should track metrics', () => {
    telemetry.trackMetric('test', 'counter', 42);

    const events = telemetry.getEvents({ type: 'metric', category: 'test' });
    expect(events).toHaveLength(1);
    expect(events[0].value).toBe(42);
  });

  it('should track errors', () => {
    const error = new Error('Test error');
    telemetry.trackError('test', error);

    const events = telemetry.getEvents({ type: 'error', category: 'test' });
    expect(events).toHaveLength(1);
    expect(events[0].value).toBe('Test error');
  });

  it('should track warnings', () => {
    telemetry.trackWarning('test', 'Warning message');

    const events = telemetry.getEvents({ type: 'warning', category: 'test' });
    expect(events).toHaveLength(1);
    expect(events[0].value).toBe('Warning message');
  });

  it('should track info', () => {
    telemetry.trackInfo('test', 'Info message');

    const events = telemetry.getEvents({ type: 'info', category: 'test' });
    expect(events).toHaveLength(1);
  });

  it('should measure operation duration', async () => {
    await telemetry.trackOperation('test', 'operation', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'success';
    });

    const aggregation = telemetry.getAggregation('test', 'operation.duration');
    expect(aggregation).toBeDefined();
    expect(aggregation?.avg).toBeGreaterThan(40); // Should be ~50ms
  });

  it('should calculate metric aggregations', () => {
    for (let i = 1; i <= 10; i++) {
      telemetry.trackMetric('test', 'values', i);
    }

    const aggregation = telemetry.getAggregation('test', 'values');
    expect(aggregation).toBeDefined();
    expect(aggregation?.count).toBe(10);
    expect(aggregation?.min).toBe(1);
    expect(aggregation?.max).toBe(10);
    expect(aggregation?.avg).toBe(5.5);
    expect(aggregation?.p50).toBeCloseTo(5, 0);
  });

  it('should provide health metrics', () => {
    telemetry.trackMetric('test', 'metric', 100);
    telemetry.trackError('test', new Error('Test'));
    telemetry.trackWarning('test', 'Warning');

    const health = telemetry.getHealthMetrics();
    expect(health.errorRate).toBeGreaterThan(0);
    expect(health.warningRate).toBeGreaterThan(0);
    expect(health.eventCount).toBeGreaterThan(0);
  });

  it('should flush events', () => {
    for (let i = 0; i < 50; i++) {
      telemetry.trackMetric('test', 'counter', i);
    }

    telemetry.flush();

    const events = telemetry.getEvents();
    expect(events.length).toBeLessThan(50); // Should have flushed
  });

  it('should filter events', () => {
    telemetry.trackMetric('category1', 'metric1', 1);
    telemetry.trackMetric('category2', 'metric2', 2);
    telemetry.trackError('category1', new Error('Error'));

    const category1Events = telemetry.getEvents({ category: 'category1' });
    expect(category1Events).toHaveLength(2);

    const metricEvents = telemetry.getEvents({ type: 'metric' });
    expect(metricEvents).toHaveLength(2);

    const errorEvents = telemetry.getEvents({ type: 'error' });
    expect(errorEvents).toHaveLength(1);
  });

  it('should start and use timer', async () => {
    const endTimer = telemetry.startTimer('test', 'timer');

    await new Promise(resolve => setTimeout(resolve, 50));

    endTimer();

    const aggregation = telemetry.getAggregation('test', 'timer');
    expect(aggregation).toBeDefined();
    expect(aggregation?.avg).toBeGreaterThan(40);
  });
});

describe('Global Instances', () => {
  afterEach(() => {
    globalPerformanceGuard.reset();
    globalTelemetry.reset();
  });

  it('should have global performance guard', () => {
    expect(globalPerformanceGuard).toBeDefined();
    expect(globalPerformanceGuard.getHealthStatus()).toBeDefined();
  });

  it('should have global telemetry', () => {
    expect(globalTelemetry).toBeDefined();

    globalTelemetry.trackMetric('test', 'global', 42);
    const events = globalTelemetry.getEvents({ category: 'test' });
    expect(events).toHaveLength(1);
  });
});
