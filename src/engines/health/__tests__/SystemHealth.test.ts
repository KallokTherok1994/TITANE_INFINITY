/**
 * TITANE∞ v20Ω — SystemHealth Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { systemHealth } from '../SystemHealthEngine';
import { MetricsCollector } from '../monitoring/metricsCollector';
import { LatencyTracker } from '../monitoring/latencyTracker';
import { AutoHealer } from '../healing/autoHealer';
import { GuardrailsEngine } from '../security/guardrails';
import { LoadBalancer } from '../balance/loadBalancer';
import type { HealingContext } from '../types';

describe('SystemHealth', () => {
  beforeEach(() => {
    // Register test providers
    systemHealth.registerProvider('test-provider-1', 100);
    systemHealth.registerProvider('test-provider-2', 100);
  });

  describe('Provider Health Tracking', () => {
    it('should track provider success', () => {
      systemHealth.recordSuccess('test-provider-1', 150);

      const health = systemHealth.getProviderHealth('test-provider-1');

      expect(health.status).toBe('healthy');
      expect(health.metrics.requestCount).toBeGreaterThan(0);
    });

    it('should track provider errors', () => {
      systemHealth.recordError('test-provider-1', new Error('Test error'));

      const health = systemHealth.getProviderHealth('test-provider-1');

      expect(health.metrics.errorCount).toBeGreaterThan(0);
    });

    it('should degrade health on errors', () => {
      // Record multiple errors
      for (let i = 0; i < 5; i++) {
        systemHealth.recordError('test-provider-2', new Error('Error'));
      }

      const health = systemHealth.getProviderHealth('test-provider-2');

      expect(health.health).toBeLessThan(1);
    });
  });

  describe('Metrics', () => {
    it('should return system metrics', () => {
      const metrics = systemHealth.getMetrics();

      expect(metrics).toHaveProperty('cpu');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('providers');
      expect(metrics).toHaveProperty('latency');
      expect(metrics).toHaveProperty('errors');
    });

    it('should track latency', () => {
      systemHealth.trackLatency('operation1', 100);
      systemHealth.trackLatency('operation1', 150);
      systemHealth.trackLatency('operation1', 200);

      const metrics = systemHealth.getMetrics();

      expect(metrics.latency.samples).toBeGreaterThan(0);
    });
  });

  describe('Auto-Healing', () => {
    it('should trigger healing and return result', async () => {
      const context: HealingContext = {
        trigger: 'provider_failure',
        source: 'test-provider-1',
        severity: 'high',
        error: new Error('Provider failed'),
      };

      const result = await systemHealth.triggerHealing(context);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('duration');
    });

    it('should record healing history', async () => {
      await systemHealth.triggerHealing({
        trigger: 'timeout',
        source: 'test-provider-1',
        severity: 'medium',
      });

      const history = systemHealth.getHealingHistory();

      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('Security Validation', () => {
    it('should validate safe input', () => {
      const result = systemHealth.validateRequest('Hello, how are you?');

      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect script injection', () => {
      const result = systemHealth.validateRequest('<script>alert("xss")</script>');

      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should detect SQL injection patterns', () => {
      const result = systemHealth.validateRequest("'; DROP TABLE users; --");

      expect(result.violations.some(v => v.type === 'injection')).toBe(true);
    });
  });

  describe('Load Balancing', () => {
    it('should return load balance state', () => {
      const state = systemHealth.getLoadBalance();

      expect(state).toHaveProperty('providers');
      expect(state).toHaveProperty('totalLoad');
      expect(state).toHaveProperty('balanced');
    });

    it('should suggest best provider', () => {
      const provider = systemHealth.getBestProvider();

      // Should return one of our registered providers
      expect(['test-provider-1', 'test-provider-2', undefined]).toContain(provider);
    });
  });
});

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  it('should record and retrieve errors', () => {
    collector.recordError('test-source', 'Test error message', 'ERR001');

    const stats = collector.getErrors();

    expect(stats.total).toBe(1);
    expect(stats.recent[0].message).toBe('Test error message');
  });

  it('should create alerts', () => {
    collector.createAlert('high_error_rate', 'test', 'Error rate high', 'warning');

    const alerts = collector.getActiveAlerts();

    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('high_error_rate');
  });

  it('should resolve alerts', () => {
    const alert = collector.createAlert('provider_unhealthy', 'test', 'Provider down', 'critical');

    collector.resolveAlert(alert.id);

    const activeAlerts = collector.getActiveAlerts();
    expect(activeAlerts.length).toBe(0);
  });

  it('should notify anomaly handlers', () => {
    const handler = vi.fn();
    collector.onAnomaly(handler);

    // Record enough errors to trigger anomaly
    for (let i = 0; i < 100; i++) {
      collector.recordError('source', 'Error');
    }

    // Handler should have been called due to error rate anomaly
    expect(handler).toHaveBeenCalled();
  });
});

describe('LatencyTracker', () => {
  let tracker: LatencyTracker;

  beforeEach(() => {
    tracker = new LatencyTracker();
  });

  it('should track latency samples', () => {
    tracker.track('operation1', 100);
    tracker.track('operation1', 150);
    tracker.track('operation1', 200);

    const stats = tracker.getOperationStats('operation1');

    expect(stats).toBeDefined();
    expect(stats?.samples).toBe(3);
    expect(stats?.avg).toBeCloseTo(150);
  });

  it('should calculate percentiles', () => {
    // Add various latencies
    for (let i = 1; i <= 100; i++) {
      tracker.track('op', i);
    }

    const stats = tracker.getPercentiles();

    expect(stats.p50).toBe(50);
    expect(stats.p95).toBe(95);
    expect(stats.p99).toBe(99);
  });

  it('should detect anomalous latencies', () => {
    // Establish baseline
    for (let i = 0; i < 20; i++) {
      tracker.track('op', 100);
    }

    // Check if 500ms is anomalous (should be, as it's 5x baseline)
    const isAnomalous = tracker.isAnomalous('op', 500);

    expect(isAnomalous).toBe(true);
  });

  it('should detect trends', () => {
    // Degrading trend
    for (let i = 0; i < 20; i++) {
      tracker.track('degrading', 100 + i * 10);
    }

    expect(tracker.getTrend('degrading')).toBe('degrading');

    // Improving trend
    for (let i = 0; i < 20; i++) {
      tracker.track('improving', 300 - i * 10);
    }

    expect(tracker.getTrend('improving')).toBe('improving');
  });
});

describe('AutoHealer', () => {
  let healer: AutoHealer;

  beforeEach(() => {
    healer = new AutoHealer();
  });

  it('should execute healing strategies', async () => {
    const result = await healer.heal({
      trigger: 'provider_failure',
      source: 'test-provider',
      severity: 'high',
    });

    expect(result.success).toBe(true);
    expect(['provider_switch', 'provider_restart', 'graceful_degradation']).toContain(result.action);
  });

  it('should record healing history', async () => {
    await healer.heal({
      trigger: 'timeout',
      source: 'test',
      severity: 'medium',
    });

    const history = healer.getHistory();

    expect(history.length).toBe(1);
  });

  it('should track success rate', async () => {
    await healer.heal({ trigger: 'manual', source: 'test', severity: 'low' });
    await healer.heal({ trigger: 'manual', source: 'test', severity: 'low' });

    const rate = healer.getSuccessRate();

    expect(rate).toBe(1); // All should succeed in mock mode
  });
});

describe('GuardrailsEngine', () => {
  let guardrails: GuardrailsEngine;

  beforeEach(() => {
    guardrails = new GuardrailsEngine();
  });

  it('should pass safe input', () => {
    const result = guardrails.validate('Normal text message');

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('should block script injection', () => {
    const result = guardrails.validate('<script>malicious()</script>');

    expect(result.violations.some(v => v.type === 'xss')).toBe(true);
  });

  it('should block SQL injection', () => {
    const result = guardrails.validate("SELECT * FROM users WHERE id='1' OR '1'='1'");

    expect(result.violations.some(v => v.type === 'injection')).toBe(true);
  });

  it('should enforce size limits', () => {
    const largeInput = 'x'.repeat(200000); // 200KB
    const result = guardrails.validate(largeInput);

    expect(result.violations.some(v => v.type === 'size_limit')).toBe(true);
  });

  it('should sanitize output', () => {
    const output = guardrails.apply('<div>User content</div>');

    expect(output).not.toContain('<div>');
    expect(output).toContain('&lt;div&gt;');
  });
});

describe('LoadBalancer', () => {
  let balancer: LoadBalancer;

  beforeEach(() => {
    balancer = new LoadBalancer();
    balancer.registerProvider('provider-a', 100);
    balancer.registerProvider('provider-b', 100);
  });

  it('should track provider load', () => {
    balancer.updateLoad('provider-a', 50);

    const state = balancer.getState();

    expect(state.providers.get('provider-a')?.currentLoad).toBe(50);
  });

  it('should suggest best provider', () => {
    balancer.updateLoad('provider-a', 80);
    balancer.updateLoad('provider-b', 20);

    const best = balancer.getBestProvider();

    expect(best).toBe('provider-b'); // Lower load = better
  });

  it('should detect balanced state', () => {
    balancer.updateLoad('provider-a', 50);
    balancer.updateLoad('provider-b', 50);

    expect(balancer.isBalanced()).toBe(true);

    balancer.updateLoad('provider-a', 90);
    balancer.updateLoad('provider-b', 10);

    expect(balancer.isBalanced()).toBe(false);
  });

  it('should generate recommendations', () => {
    balancer.updateLoad('provider-a', 90);
    balancer.updateLoad('provider-b', 10);

    const state = balancer.getState();

    expect(state.recommendations.some(r => r.action === 'decrease')).toBe(true);
    expect(state.recommendations.some(r => r.action === 'increase')).toBe(true);
  });
});
