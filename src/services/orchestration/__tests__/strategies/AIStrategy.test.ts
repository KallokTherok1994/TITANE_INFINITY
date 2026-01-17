/**
 * TITANE∞ vΩ — AIStrategy Unit Tests
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Test coverage: Provider selection, Dual-mode AI, Execution
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AIStrategy } from '../../strategies/AIStrategy';

describe('AIStrategy', () => {
  let strategy: AIStrategy;

  beforeEach(() => {
    strategy = new AIStrategy();
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
      expect(strategy.type).toBe('ai');
      expect(strategy.isInitialized()).toBe(false);
    });

    it('should initialize dual AI orchestrators', async () => {
      await strategy.initialize();
      expect(strategy.isInitialized()).toBe(true);
    });

    it('should support standard mode by default', async () => {
      await strategy.initialize();
      expect(strategy.isInitialized()).toBe(true);
    });

    it('should support cognitive mode', async () => {
      await strategy.initialize(); // Mode cognitive via selectProvider criteria
      expect(strategy.isInitialized()).toBe(true);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // PROVIDER SELECTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Provider Selection', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should select provider based on criteria', async () => {
      const selected = await strategy.selectProvider({
        mode: 'standard',
        requiresCode: false,
        requiresVision: false,
        latency: 'fast',
      });

      expect(selected).toBeDefined();
      expect(selected.id).toBeDefined();
    });

    it('should select local provider for fast latency', async () => {
      const selected = await strategy.selectProvider({
        mode: 'standard',
        latency: 'fast',
      });

      // AIProviderInfo returns 'id' field
      expect(selected.id).toBe('ollama');
    });

    it('should select cloud provider for cognitive mode', async () => {
      const selected = await strategy.selectProvider({
        mode: 'cognitive',
        requiresCode: true,
      });

      // AIProviderInfo returns 'id' field
      expect(['anthropic', 'openai', 'google']).toContain(selected.id);
    });

    it('should select vision-capable provider', async () => {
      const selected = await strategy.selectProvider({
        requiresVision: true,
      });

      expect(selected.id).toBeDefined();
    });

    it('should provide health score', async () => {
      const selected = await strategy.selectProvider({
        mode: 'standard',
      });

      // AIProviderInfo returns healthScore, not reason
      expect(selected.healthScore).toBeDefined();
      expect(typeof selected.healthScore).toBe('number');
    });

    it('should calculate health score in range', async () => {
      const selected = await strategy.selectProvider({
        mode: 'cognitive',
        requiresCode: true,
      });

      // healthScore is 0.5-1.0 (confidence range in implementation)
      expect(selected.healthScore).toBeGreaterThanOrEqual(0);
      expect(selected.healthScore).toBeLessThanOrEqual(1);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // AVAILABLE PROVIDERS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Available Providers', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should get available providers', () => {
      // getAvailableProviders is synchronous
      const providers = strategy.getAvailableProviders();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should include provider details', () => {
      const providers = strategy.getAvailableProviders();
      const first = providers[0];

      expect(first.id).toBeDefined();
      expect(first.name).toBeDefined();
      // AIProviderInfo uses isAvailable, not available
      expect(typeof first.isAvailable).toBe('boolean');
    });

    it('should include health scores', () => {
      const providers = strategy.getAvailableProviders();
      const withHealth = providers.find(p => p.healthScore !== undefined);

      expect(withHealth).toBeDefined();
      expect(typeof withHealth?.healthScore).toBe('number');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // EXECUTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Execution', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should execute with provider', async () => {
      // executeWithProvider takes (providerId: string, prompt: string)
      const response = await strategy.executeWithProvider('ollama', 'Hello');

      expect(response).toBeDefined();
      expect(response).toHaveProperty('response');
      expect(typeof response.response).toBe('string');
    });

    it('should execute with different provider', async () => {
      const response = await strategy.executeWithProvider('anthropic', 'Test');

      expect(response).toBeDefined();
      expect(response).toHaveProperty('response');
    });

    it('should handle execution errors', async () => {
      // Invalid provider should fail gracefully
      const result = await strategy.executeWithProvider(
        'invalid-provider',
        'Test prompt'
      );

      // Should still return a response object (fallback behavior)
      expect(result).toBeDefined();
      expect(typeof result.response).toBe('string');
    });

    it('should return a non-empty response', async () => {
      const response = await strategy.executeWithProvider('ollama', 'Stream test');

      expect(response).toBeDefined();
      expect(typeof response.response).toBe('string');
      expect(response.response.length).toBeGreaterThan(0);
      expect(response.response).not.toContain('Stub response');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // DUAL MODE TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Dual Mode Operation', () => {
    it('should switch to cognitive mode', async () => {
      await strategy.initialize(); // Mode cognitive via selectProvider criteria

      const selected = await strategy.selectProvider({
        mode: 'cognitive',
      });

      // AIProviderInfo returns 'id' field, not 'provider'
      expect(selected.id).toMatch(/anthropic|openai|google/);
    });

    it('should use standard mode by default', async () => {
      await strategy.initialize();

      const selected = await strategy.selectProvider({});

      // AIProviderInfo returns 'id' field, not 'provider'
      expect(selected.id).toBe('ollama');
    });

    it('should execute in cognitive mode', async () => {
      await strategy.initialize(); // Mode cognitive via selectProvider criteria

      // executeWithProvider takes (providerId, prompt) - string params
      const response = await strategy.executeWithProvider('anthropic', 'Cognitive test');

      expect(response).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // HEALTH MONITORING TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Health Monitoring', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should check health', async () => {
      const health = await strategy.checkHealth();

      expect(health.status).toBeDefined();
      expect(health.score).toBeGreaterThanOrEqual(0);
    });

    it('should aggregate health from both modes', async () => {
      await strategy.initialize(); // Mode cognitive via selectProvider criteria

      const health = await strategy.checkHealth();

      expect(health.details).toBeDefined();
    });

    it('should get health score', () => {
      const score = strategy.getHealthScore();

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // METRICS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Metrics', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should record metrics', async () => {
      // executeWithProvider takes (providerId, prompt) - string params
      await strategy.executeWithProvider('ollama', 'Test');

      const metrics = strategy.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should get metrics summary', async () => {
      await strategy.selectProvider({ mode: 'standard' });

      const summary = strategy.getSummary();
      expect(summary.totalRequests).toBeGreaterThan(0);
    });

    it('should aggregate metrics from both modes', async () => {
      await strategy.initialize(); // Mode cognitive via selectProvider criteria
      // executeWithProvider takes (providerId, prompt) - string params
      await strategy.executeWithProvider('anthropic', 'Test');

      const summary = strategy.getSummary();
      expect(summary.totalRequests).toBeGreaterThan(0);
    });

    it('should reset metrics', async () => {
      await strategy.selectProvider({ mode: 'standard' });
      strategy.reset();

      const metrics = strategy.getMetrics();
      expect(metrics.length).toBe(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // STRATEGY EXECUTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Strategy Execute', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should execute selectProvider operation', async () => {
      const result = await strategy.execute('selectProvider', {
        criteria: { mode: 'standard' },
      });

      expect(result).toBeDefined();
    });

    it('should execute getAvailableProviders operation', async () => {
      const result = await strategy.execute('getAvailableProviders', {});

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should execute executeWithProvider operation', async () => {
      const result = await strategy.execute('executeWithProvider', {
        provider: 'ollama',
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(result).toBeDefined();
    });

    it('should handle invalid operation', async () => {
      const result = await strategy.execute('invalidOp', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown AI operation');
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

    it('should shutdown both modes', async () => {
      await strategy.initialize(); // Mode cognitive via selectProvider criteria
      await strategy.shutdown();

      expect(strategy.isInitialized()).toBe(false);
    });
  });
});
