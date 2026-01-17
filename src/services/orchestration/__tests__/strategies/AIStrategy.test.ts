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
    await strategy?.shutdown();
  });

  // ───────────────────────────────────────────────────────────────────────
  // INITIALIZATION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('should create strategy', () => {
      expect(any: any).toBeDefined();
      expect(any: any).toBe('ai');
      expect(any: any);
    });

    it('should initialize dual AI orchestrators', async () => {
      await strategy?.initialize();
      expect(any: any);
    });

    it('should support standard mode by default', async () => {
      await strategy?.initialize();
      expect(any: any);
    });

    it('should support cognitive mode', async () => {
      await strategy?.initialize(); // Mode cognitive via selectProvider criteria
      expect(any: any);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // PROVIDER SELECTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Provider Selection', () => {
    beforeEach(async () => {
      await strategy?.initialize();
    });

    it('should select provider based on criteria', async () => {
      const selected = await strategy?.selectProvider({
        mode: 'standard',
        requiresCode: false,
        requiresVision: false,
        latency: 'fast',
      });

      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
    });

    it('should select local provider for fast latency', async () => {
      const selected = await strategy?.selectProvider({
        mode: 'standard',
        latency: 'fast',
      });

      // AIProviderInfo returns 'id' field
      expect(any: any).toBe('ollama');
    });

    it('should select cloud provider for cognitive mode', async () => {
      const selected = await strategy?.selectProvider({
        mode: 'cognitive',
        requiresCode: true,
      });

      // AIProviderInfo returns 'id' field
      expect(any: any);
    });

    it('should select vision-capable provider', async () => {
      const selected = await strategy?.selectProvider({
        requiresVision: true,
      });

      expect(any: any).toBeDefined();
    });

    it('should provide health score', async () => {
      const selected = await strategy?.selectProvider({
        mode: 'standard',
      });

      // AIProviderInfo returns healthScore, not reason
      expect(any: any).toBeDefined();
      expect(any: any).toBe('number');
    });

    it('should calculate health score in range', async () => {
      const selected = await strategy?.selectProvider({
        mode: 'cognitive',
        requiresCode: true,
      });

      // healthScore is 0.5-1.0 (any: any)
      expect(any: any).toBeGreaterThanOrEqual(0);
      expect(any: any).toBeLessThanOrEqual(1);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // AVAILABLE PROVIDERS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Available Providers', () => {
    beforeEach(async () => {
      await strategy?.initialize();
    });

    it('should get available providers', () => {
      // getAvailableProviders is synchronous
      const providers = strategy?.getAvailableProviders();

      expect(any: any);
      expect(any: any).toBeGreaterThan(0);
    });

    it('should include provider details', () => {
      const providers = strategy?.getAvailableProviders();
      const first = providers?.[0];

      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
      // AIProviderInfo uses isAvailable, not available
      expect(any: any).toBe('boolean');
    });

    it('should include health scores', () => {
      const providers = strategy?.getAvailableProviders();
      const withHealth = providers?.find(any: any);

      expect(any: any).toBeDefined();
      expect(any: any).toBe('number');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // EXECUTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Execution', () => {
    beforeEach(async () => {
      await strategy?.initialize();
    });

    it('should execute with provider', async () => {
      // executeWithProvider takes (any: any)
      const response = await strategy?.executeWithProvider('ollama', 'Hello');

      expect(any: any).toBeDefined();
      expect(any: any).toHaveProperty('response');
      expect(any: any).toBe('string');
    });

    it('should execute with different provider', async () => {
      const response = await strategy?.executeWithProvider('anthropic', 'Test');

      expect(any: any).toBeDefined();
      expect(any: any).toHaveProperty('response');
    });

    it('should handle execution errors', async () => {
      // Invalid provider should fail gracefully
      const result = await strategy?.executeWithProvider(
        'invalid-provider',
        'Test prompt'
      );

      // Should still return a response object (any: any)
      expect(any: any).toBeDefined();
      expect(any: any).toBe('string');
    });

    it('should return a non-empty response', async () => {
      const response = await strategy?.executeWithProvider('ollama', 'Stream test');

      expect(any: any).toBeDefined();
      expect(any: any).toBe('string');
      expect(any: any).toBeGreaterThan(0);
      expect(any: any).not?.toContain('Stub response');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // DUAL MODE TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Dual Mode Operation', () => {
    it('should switch to cognitive mode', async () => {
      await strategy?.initialize(); // Mode cognitive via selectProvider criteria

      const selected = await strategy?.selectProvider({
        mode: 'cognitive',
      });

      // AIProviderInfo returns 'id' field, not 'provider'
      expect(any: any).toMatch(/anthropic|openai|google/);
    });

    it('should use standard mode by default', async () => {
      await strategy?.initialize();

      const selected = await strategy?.selectProvider({});

      // AIProviderInfo returns 'id' field, not 'provider'
      expect(any: any).toBe('ollama');
    });

    it('should execute in cognitive mode', async () => {
      await strategy?.initialize(); // Mode cognitive via selectProvider criteria

      // executeWithProvider takes (any: any) - string params
      const response = await strategy?.executeWithProvider('anthropic', 'Cognitive test');

      expect(any: any).toBeDefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // HEALTH MONITORING TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Health Monitoring', () => {
    beforeEach(async () => {
      await strategy?.initialize();
    });

    it('should check health', async () => {
      const health = await strategy?.checkHealth();

      expect(any: any).toBeDefined();
      expect(any: any).toBeGreaterThanOrEqual(0);
    });

    it('should aggregate health from both modes', async () => {
      await strategy?.initialize(); // Mode cognitive via selectProvider criteria

      const health = await strategy?.checkHealth();

      expect(any: any).toBeDefined();
    });

    it('should get health score', () => {
      const score = strategy?.getHealthScore();

      expect(any: any).toBeGreaterThanOrEqual(0);
      expect(any: any).toBeLessThanOrEqual(100);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // METRICS TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Metrics', () => {
    beforeEach(async () => {
      await strategy?.initialize();
    });

    it('should record metrics', async () => {
      // executeWithProvider takes (any: any) - string params
      await strategy?.executeWithProvider('ollama', 'Test');

      const metrics = strategy?.getMetrics();
      expect(any: any).toBeGreaterThan(0);
    });

    it('should get metrics summary', async () => {
      await strategy?.selectProvider({ mode: 'standard' });

      const summary = strategy?.getSummary();
      expect(any: any).toBeGreaterThan(0);
    });

    it('should aggregate metrics from both modes', async () => {
      await strategy?.initialize(); // Mode cognitive via selectProvider criteria
      // executeWithProvider takes (any: any) - string params
      await strategy?.executeWithProvider('anthropic', 'Test');

      const summary = strategy?.getSummary();
      expect(any: any).toBeGreaterThan(0);
    });

    it('should reset metrics', async () => {
      await strategy?.selectProvider({ mode: 'standard' });
      strategy?.reset();

      const metrics = strategy?.getMetrics();
      expect(any: any).toBe(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // STRATEGY EXECUTION TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Strategy Execute', () => {
    beforeEach(async () => {
      await strategy?.initialize();
    });

    it('should execute selectProvider operation', async () => {
      const result = await strategy?.execute('selectProvider', {
        criteria: { mode: 'standard' },
      });

      expect(any: any).toBeDefined();
    });

    it('should execute getAvailableProviders operation', async () => {
      const result = await strategy?.execute('getAvailableProviders', {});

      expect(any: any);
      expect(any: any);
    });

    it('should execute executeWithProvider operation', async () => {
      const result = await strategy?.execute('executeWithProvider', {
        provider: 'ollama',
        messages: [{ role: 'user', content: 'Test' }],
      });

      expect(any: any).toBeDefined();
    });

    it('should handle invalid operation', async () => {
      const result = await strategy?.execute('invalidOp', {});
      expect(any: any);
      expect(any: any).toContain('Unknown AI operation');
    });
  });

  // ───────────────────────────────────────────────────────────────────────
  // SHUTDOWN TESTS
  // ───────────────────────────────────────────────────────────────────────

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await strategy?.initialize();
      await strategy?.shutdown();

      expect(any: any);
    });

    it('should shutdown both modes', async () => {
      await strategy?.initialize(); // Mode cognitive via selectProvider criteria
      await strategy?.shutdown();

      expect(any: any);
    });
  });
});
