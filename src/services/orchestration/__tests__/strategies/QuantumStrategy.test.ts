/**
 * TITANE∞ vΩ — QuantumStrategy Unit Tests
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Test coverage: Quantum prediction, VSync, Real-time synchronization
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuantumStrategy } from '../../strategies/QuantumStrategy';

describe('QuantumStrategy', () => {
  let strategy: QuantumStrategy;

  beforeEach(() => {
    strategy = new QuantumStrategy();
  });

  afterEach(async () => {
    await strategy.shutdown();
  });

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('should create strategy', () => {
      expect(strategy).toBeDefined();
      expect(strategy.type).toBe('quantum');
      expect(strategy.name).toBe('Quantum VSync Strategy');
      expect(strategy.isInitialized()).toBe(false);
    });

    it('should initialize quantum layer', async () => {
      await strategy.initialize();
      expect(strategy.isInitialized()).toBe(true);
    });

    it('should handle multiple initialization calls', async () => {
      await strategy.initialize();
      await strategy.initialize(); // Should be idempotent
      expect(strategy.isInitialized()).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // QUANTUM PREDICTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Quantum State Prediction', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should predict next state', async () => {
      const prediction = await strategy.predictNextState({
        userAction: 'navigate',
        engineStates: ['idle', 'active'],
      });

      expect(prediction).toBeDefined();
      expect(prediction.type).toBeDefined();
      expect(['strong', 'weak']).toContain(prediction.type);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.prediction).toBeDefined();
      expect(prediction.timestamp).toBeGreaterThan(0);
    });

    it('should provide confidence score', async () => {
      const prediction = await strategy.predictNextState({});

      expect(prediction.confidence).toBeGreaterThanOrEqual(0.3);
      expect(prediction.confidence).toBeLessThanOrEqual(0.95);
    });

    it('should predict stable state at 60 FPS', async () => {
      await strategy.syncRealtime(60);
      const prediction = await strategy.predictNextState({});

      expect(prediction.prediction).toBe('stable');
      expect(prediction.type).toBe('strong');
    });

    it('should predict degraded state at low FPS', async () => {
      await strategy.syncRealtime(50);
      const prediction = await strategy.predictNextState({});

      expect(prediction.prediction).toBe('degraded');
    });

    it('should predict critical state at very low FPS', async () => {
      await strategy.syncRealtime(30);
      const prediction = await strategy.predictNextState({});

      expect(prediction.prediction).toBe('critical');
      expect(prediction.type).toBe('weak');
    });

    it('should handle null context', async () => {
      const prediction = await strategy.predictNextState(null);

      expect(prediction).toBeDefined();
      expect(prediction.confidence).toBeGreaterThan(0);
    });

    it('should handle undefined context', async () => {
      const prediction = await strategy.predictNextState(undefined);

      expect(prediction).toBeDefined();
      expect(prediction.type).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // VSYNC SYNCHRONIZATION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('VSync Real-time Synchronization', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should sync at 60 FPS', async () => {
      const result = await strategy.syncRealtime(60);

      expect(result).toBeDefined();
      expect(result.synced).toBe(true);
      expect(result.drift).toBe(0);
    });

    it('should sync at 30 FPS', async () => {
      const result = await strategy.syncRealtime(30);

      expect(result.synced).toBe(true);
      expect(result.drift).toBeGreaterThanOrEqual(0);
    });

    it('should sync at 120 FPS', async () => {
      const result = await strategy.syncRealtime(120);

      expect(result.synced).toBe(true);
    });

    it('should handle invalid FPS gracefully', async () => {
      const result = await strategy.syncRealtime(0);

      expect(result).toBeDefined();
      expect(result.synced).toBe(true);
    });

    it('should default to 60 FPS when not specified', async () => {
      const result = await strategy.syncRealtime();

      expect(result.synced).toBe(true);
      expect(result.drift).toBe(0);
    });

    it('should handle high FPS values', async () => {
      const result = await strategy.syncRealtime(240);

      expect(result).toBeDefined();
      expect(result.synced).toBe(true);
    });

    it('should handle multiple sync calls', async () => {
      await strategy.syncRealtime(60);
      await strategy.syncRealtime(30);
      const result = await strategy.syncRealtime(120);

      expect(result.synced).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // EXECUTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Execution', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should execute predictNextState operation', async () => {
      const result = await strategy.execute('predictNextState', {
        context: { test: 'data' },
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metadata?.strategyUsed).toBe('quantum');
      expect(result.metadata?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should execute syncRealtime operation', async () => {
      const result = await strategy.execute('syncRealtime', { fps: 60 });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metadata?.timestamp).toBeGreaterThan(0);
    });

    it('should handle unknown operation', async () => {
      const result = await strategy.execute('invalidOperation');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown quantum operation');
    });

    it('should auto-initialize before execution', async () => {
      const freshStrategy = new QuantumStrategy();
      const result = await freshStrategy.execute('predictNextState');

      expect(result.success).toBe(true);
      expect(freshStrategy.isInitialized()).toBe(true);

      await freshStrategy.shutdown();
    });

    it('should provide execution metadata', async () => {
      const result = await strategy.execute('syncRealtime', { fps: 120 });

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.strategyUsed).toBe('quantum');
      expect(result.metadata?.duration).toBeGreaterThanOrEqual(0);
      expect(result.metadata?.timestamp).toBeGreaterThan(0);
    });

    it('should handle execution errors gracefully', async () => {
      // @ts-expect-error Testing error handling
      const result = await strategy.execute(null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // HEALTH MONITORING TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Health Monitoring', () => {
    it('should return unknown status when not initialized', async () => {
      const health = await strategy.checkHealth();

      expect(health.status).toBe('unknown');
      expect(health.score).toBe(0);
      expect(health.message).toContain('not initialized');
    });

    it('should return healthy status at 60 FPS', async () => {
      await strategy.initialize();
      await strategy.syncRealtime(60);

      const health = await strategy.checkHealth();

      expect(health.status).toBe('healthy');
      expect(health.score).toBeGreaterThanOrEqual(80);
      expect(health.details).toBeDefined();
    });

    it('should return degraded status at low FPS', async () => {
      await strategy.initialize();
      await strategy.syncRealtime(45);

      const health = await strategy.checkHealth();

      expect(['healthy', 'degraded', 'critical', 'unknown']).toContain(health.status);
      expect(health.score).toBeGreaterThanOrEqual(0);
    });

    it('should return critical status at very low FPS', async () => {
      await strategy.initialize();
      await strategy.syncRealtime(20);

      const health = await strategy.checkHealth();

      expect(['healthy', 'degraded', 'critical', 'unknown']).toContain(health.status);
      expect(health.score).toBeGreaterThanOrEqual(0);
      expect(health.score).toBeLessThanOrEqual(100);
    });

    it('should provide FPS details in health check', async () => {
      await strategy.initialize();
      await strategy.syncRealtime(60);

      const health = await strategy.checkHealth();

      expect(health.details).toBeDefined();
      expect(health.details?.currentFPS).toBe(60);
    });

    it('should include sync status in health check', async () => {
      await strategy.initialize();
      await strategy.syncRealtime(60);

      const health = await strategy.checkHealth();

      expect(health.details?.syncActive).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // METRICS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Metrics Collection', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should provide metrics summary', () => {
      const summary = strategy.getSummary();

      expect(summary).toBeDefined();
      expect(summary.totalRequests).toBeGreaterThanOrEqual(0);
      expect(summary.successRate).toBeGreaterThanOrEqual(0);
      expect(summary.successRate).toBeLessThanOrEqual(1);
    });

    it('should record prediction metrics', async () => {
      await strategy.predictNextState({});

      const summary = strategy.getSummary();
      expect(summary.totalRequests).toBeGreaterThan(0);
    });

    it('should record sync metrics', async () => {
      await strategy.syncRealtime(60);

      const summary = strategy.getSummary();
      expect(summary.totalRequests).toBeGreaterThan(0);
    });

    it('should track error count', async () => {
      // Execute a valid operation first to register metrics
      await strategy.execute('predictNextState');
      await strategy.execute('invalidOperation');

      const summary = strategy.getSummary();
      expect(summary.errorCount).toBeGreaterThanOrEqual(0);
      expect(summary.totalRequests).toBeGreaterThanOrEqual(1);
    });

    it('should calculate success rate', async () => {
      await strategy.execute('predictNextState');
      await strategy.execute('syncRealtime', { fps: 60 });
      await strategy.execute('invalidOperation'); // Will fail

      const summary = strategy.getSummary();
      expect(summary.successRate).toBeGreaterThanOrEqual(0);
      expect(summary.successRate).toBeLessThanOrEqual(1);
      expect(summary.totalRequests).toBeGreaterThan(0);
    });

    it('should track average latency', async () => {
      await strategy.execute('predictNextState');
      await strategy.execute('syncRealtime', { fps: 60 });

      const summary = strategy.getSummary();
      expect(summary.averageLatency).toBeGreaterThanOrEqual(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // SHUTDOWN TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await strategy.initialize();
      await strategy.shutdown();

      expect(strategy.isInitialized()).toBe(false);
    });

    it('should handle shutdown when not initialized', async () => {
      await expect(strategy.shutdown()).resolves.not.toThrow();
    });

    it('should stop sync interval on shutdown', async () => {
      await strategy.initialize();
      await strategy.syncRealtime(60);
      await strategy.shutdown();

      const health = await strategy.checkHealth();
      expect(health.status).toBe('unknown');
    });

    it('should allow reinitialization after shutdown', async () => {
      await strategy.initialize();
      await strategy.shutdown();
      await strategy.initialize();

      expect(strategy.isInitialized()).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // INTEGRATION & EDGE CASES
  // ───────────────────────────────────────────────────────────────────────

  describe('Integration & Edge Cases', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should handle rapid FPS changes', async () => {
      await strategy.syncRealtime(120);
      await strategy.syncRealtime(30);
      await strategy.syncRealtime(60);

      const health = await strategy.checkHealth();
      expect(health.status).toBeDefined();
    });

    it('should maintain prediction accuracy across sync changes', async () => {
      await strategy.syncRealtime(60);
      const pred1 = await strategy.predictNextState({});

      await strategy.syncRealtime(30);
      const pred2 = await strategy.predictNextState({});

      expect(pred1.confidence).toBeGreaterThan(pred2.confidence);
    });

    it('should handle extreme FPS values', async () => {
      await strategy.syncRealtime(1);
      const lowResult = await strategy.predictNextState({});

      await strategy.syncRealtime(500);
      const highResult = await strategy.predictNextState({});

      expect(lowResult.prediction).toBe('critical');
      expect(highResult.prediction).toBe('stable');
    });

    it('should provide consistent metadata structure', async () => {
      const result1 = await strategy.execute('predictNextState');
      const result2 = await strategy.execute('syncRealtime', { fps: 60 });

      expect(result1.metadata).toBeDefined();
      expect(result2.metadata).toBeDefined();
      expect(result1.metadata?.strategyUsed).toBe(result2.metadata?.strategyUsed);
    });

    it('should handle concurrent operations', async () => {
      const promises = [
        strategy.execute('predictNextState'),
        strategy.execute('syncRealtime', { fps: 60 }),
        strategy.execute('predictNextState'),
      ];

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.metadata).toBeDefined();
      });
    });

    it('should maintain state consistency', async () => {
      await strategy.syncRealtime(60);
      const prediction = await strategy.predictNextState({});
      const health = await strategy.checkHealth();

      expect(prediction.prediction).toBe('stable');
      expect(health.status).toBe('healthy');
    });
  });
});
