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
      await strategy.initialize({ mode: 'cognitive' });
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
      expect(selected.provider).toBeDefined();
    });

    it('should select local provider for fast latency', async () => {
      const selected = await strategy.selectProvider({
        mode: 'standard',
        latency: 'fast',
      });

      expect(selected.provider).toBe('ollama');
    });

    it('should select cloud provider for cognitive mode', async () => {
      const selected = await strategy.selectProvider({
        mode: 'cognitive',
        requiresCode: true,
      });

      expect(['anthropic', 'openai', 'google']).toContain(selected.provider);
    });

    it('should select vision-capable provider', async () => {
      const selected = await strategy.selectProvider({
        requiresVision: true,
      });

      expect(selected.provider).toBeDefined();
    });

    it('should provide selection reason', async () => {
      const selected = await strategy.selectProvider({
        mode: 'standard',
      });

      expect(selected.reason).toBeDefined();
      expect(typeof selected.reason).toBe('string');
    });

    it('should calculate confidence score', async () => {
      const selected = await strategy.selectProvider({
        mode: 'cognitive',
        requiresCode: true,
      });

      expect(selected.confidence).toBeGreaterThanOrEqual(0);
      expect(selected.confidence).toBeLessThanOrEqual(1);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // AVAILABLE PROVIDERS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Available Providers', () => {
    beforeEach(async () => {
      await strategy.initialize();
    });

    it('should get available providers', async () => {
      const providers = await strategy.getAvailableProviders();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should include provider details', async () => {
      const providers = await strategy.getAvailableProviders();
      const first = providers[0];

      expect(first.id).toBeDefined();
      expect(first.name).toBeDefined();
      expect(typeof first.available).toBe('boolean');
    });

    it('should list available models', async () => {
      const providers = await strategy.getAvailableProviders();
      const withModels = providers.find(p => p.models && p.models.length > 0);

      expect(withModels).toBeDefined();
      expect(Array.isArray(withModels?.models)).toBe(true);
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
      const response = await strategy.executeWithProvider('ollama', [
        { role: 'user', content: 'Hello' },
      ]);

      expect(response).toBeDefined();
      expect(response).toHaveProperty('response');
      expect(typeof response.response).toBe('string');
    });

    it('should execute with options', async () => {
      const response = await strategy.executeWithProvider(
        'ollama',
        [{ role: 'user', content: 'Test' }],
        {
          model: 'phi-3.5-mini',
          temperature: 0.7,
          maxTokens: 100,
        }
      );

      expect(response).toBeDefined();
    });

    it('should handle execution errors', async () => {
      // Invalid provider should fail gracefully
      const result = await strategy.executeWithProvider(
        'invalid-provider' as any,
        'Test prompt'
      );

      // Should still return a response object (with stub data)
      expect(result).toBeDefined();
      expect(typeof result.response).toBe('string');
    });

    it('should support streaming', async () => {
      const response = await strategy.executeWithProvider(
        'ollama',
        [{ role: 'user', content: 'Stream test' }],
        { stream: true }
      );

      expect(response).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // DUAL MODE TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Dual Mode Operation', () => {
    it('should switch to cognitive mode', async () => {
      await strategy.initialize({ mode: 'cognitive' });

      const selected = await strategy.selectProvider({
        mode: 'cognitive',
      });

      expect(selected.provider).toMatch(/anthropic|openai|google/);
    });

    it('should use standard mode by default', async () => {
      await strategy.initialize();

      const selected = await strategy.selectProvider({});

      expect(selected.provider).toBe('ollama');
    });

    it('should execute in cognitive mode', async () => {
      await strategy.initialize({ mode: 'cognitive' });

      const response = await strategy.executeWithProvider(
        'anthropic',
        [{ role: 'user', content: 'Cognitive test' }],
        { cognitiveMode: true }
      );

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
      await strategy.initialize({ mode: 'cognitive' });

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
      await strategy.executeWithProvider('ollama', [{ role: 'user', content: 'Test' }]);

      const metrics = strategy.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should get metrics summary', async () => {
      await strategy.selectProvider({ mode: 'standard' });

      const summary = strategy.getSummary();
      expect(summary.totalRequests).toBeGreaterThan(0);
    });

    it('should aggregate metrics from both modes', async () => {
      await strategy.initialize({ mode: 'cognitive' });
      await strategy.executeWithProvider('anthropic', [
        { role: 'user', content: 'Test' },
      ]);

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
      await strategy.initialize({ mode: 'cognitive' });
      await strategy.shutdown();

      expect(strategy.isInitialized()).toBe(false);
    });
  });
});
