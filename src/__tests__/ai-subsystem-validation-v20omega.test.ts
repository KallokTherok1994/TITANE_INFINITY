/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v20Ω — SELF-VALIDATION ENGINE
 *   Tests automatisés du sous-système IA
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import { aiOrchestrator } from '@/services/ai/orchestrator';
import { IAService } from '@/services/ia/ia.api';
import { metricsEngine } from '@/services/ai/metricsEngine';
import { autoHealEngine } from '@/services/ai/autoHealEngine';

describe('TITANE∞ v20Ω — Self-Validation Suite', () => {
  describe('Phase F.1 — Orchestrator Health', () => {
    it('should have all providers initialized', async () => {
      const status = await aiOrchestrator.getProvidersStatus();

      expect(status.providers).toBeDefined();
      expect(status.providers.length).toBeGreaterThan(0);

      // Vérifier que titane-local est toujours présent (fallback garanti)
      const titaneLocal = status.providers.find(p => p.name === 'titane-local');
      expect(titaneLocal).toBeDefined();
    });

    it('should perform health check correctly', async () => {
      const health = await aiOrchestrator.healthCheck();

      expect(health.overall).toMatch(/healthy|degraded|critical/);
      expect(health.providers).toBeInstanceOf(Array);
      expect(health.recommendations).toBeInstanceOf(Array);
    });

    it('should handle empty message gracefully', async () => {
      const response = await aiOrchestrator.generate('', []);

      // Ne doit jamais throw, toujours renvoyer une réponse
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.provider).toBeDefined();
    });

    it('should sanitize dangerous input', async () => {
      const dangerousInput = '<script>alert("xss")</script>Bonjour';
      const response = await aiOrchestrator.generate(dangerousInput, []);

      expect(response).toBeDefined();
      expect(response.content).not.toContain('<script>');
    });
  });

  describe('Phase F.2 — Providers Validation', () => {
    it('openai provider should have correct structure', async () => {
      const { openaiProvider } = await import('@/services/ai/providers/openai');

      expect(openaiProvider.name).toBe('openai');
      expect(typeof openaiProvider.isAvailable).toBe('function');
      expect(typeof openaiProvider.generate).toBe('function');
    });

    it('claude provider should have correct structure', async () => {
      const { claudeProvider } = await import('@/services/ai/providers/claude');

      expect(claudeProvider.name).toBe('claude');
      expect(typeof claudeProvider.isAvailable).toBe('function');
      expect(typeof claudeProvider.generate).toBe('function');
    });

    it('gemini provider should have correct structure', async () => {
      const { geminiProvider } = await import('@/services/ai/providers/gemini');

      expect(geminiProvider.name).toBe('gemini');
      expect(typeof geminiProvider.isAvailable).toBe('function');
      expect(typeof geminiProvider.generate).toBe('function');
    });
  });

  describe('Phase F.3 — IAService Validation', () => {
    it('should validate key format correctly - OpenAI', () => {
      const validKey = 'sk-proj-' + 'x'.repeat(40);
      const invalidKey = 'invalid';

      const validResult = IAService.validateKeyFormat('openai', validKey);
      const invalidResult = IAService.validateKeyFormat('openai', invalidKey);

      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
    });

    it('should validate key format correctly - Claude', () => {
      const validKey = 'sk-ant-' + 'x'.repeat(50);
      const invalidKey = 'sk-';

      const validResult = IAService.validateKeyFormat('claude', validKey);
      const invalidResult = IAService.validateKeyFormat('claude', invalidKey);

      expect(validResult.valid).toBe(true);
      expect(invalidResult.valid).toBe(false);
    });

    it('should mask API keys securely', () => {
      const key = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz';
      const masked = IAService.maskAPIKey(key);

      expect(masked).not.toBe(key);
      expect(masked).toContain('***');
      expect(masked.length).toBeLessThan(key.length);

      // Vérifier que seulement 3 premiers + 3 derniers chars sont visibles
      expect(masked.startsWith('sk-')).toBe(true);
      expect(masked.endsWith('xyz')).toBe(true);
    });
  });

  describe('Phase F.4 — Metrics Engine', () => {
    it('should record events correctly', () => {
      metricsEngine.reset();

      metricsEngine.recordEvent({
        type: 'response',
        provider: 'test-provider',
        latencyMs: 1000,
        success: true,
      });

      const metrics = metricsEngine.getAggregatedMetrics();

      expect(metrics.totalRequests).toBeGreaterThanOrEqual(1);
      expect(metrics.providers.length).toBeGreaterThan(0);
    });

    it('should calculate provider metrics', () => {
      metricsEngine.reset();

      metricsEngine.recordEvent({
        type: 'response',
        provider: 'openai',
        latencyMs: 2000,
        success: true,
      });

      metricsEngine.recordEvent({
        type: 'error',
        provider: 'openai',
        latencyMs: 3000,
        success: false,
      });

      const providerMetrics = metricsEngine.getProviderMetrics('openai');

      expect(providerMetrics.totalRequests).toBeGreaterThanOrEqual(2);
      expect(providerMetrics.avgLatency).toBeGreaterThan(0);
    });

    it('should provide health stats', () => {
      const health = metricsEngine.getHealthStats();

      expect(health.overall).toMatch(/healthy|degraded|critical/);
      expect(typeof health.successRate).toBe('number');
      expect(typeof health.avgLatency).toBe('number');
      expect(health.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Phase F.5 — Auto-Heal Engine', () => {
    it('should detect and classify errors', () => {
      const error = new Error('Provider timeout');
      const healError = autoHealEngine.detectError('test-provider', error, 'timeout');

      expect(healError.id).toBeDefined();
      expect(healError.type).toBe('timeout');
      expect(healError.severity).toBeDefined();
    });

    it('should provide stats', () => {
      const stats = autoHealEngine.getStats();

      expect(stats.totalErrors).toBeGreaterThanOrEqual(0);
      expect(stats.totalHeals).toBeGreaterThanOrEqual(0);
      expect(typeof stats.healthScore).toBe('number');
    });
  });

  describe('Phase F.6 — Integration Tests', () => {
    it('orchestrator should integrate with metrics', async () => {
      metricsEngine.reset();

      await aiOrchestrator.generate('Test integration', []);

      const metrics = metricsEngine.getAggregatedMetrics();

      // Doit avoir enregistré au moins 1 événement
      expect(metrics.totalRequests).toBeGreaterThan(0);
    });

    it('should handle provider fallback', async () => {
      const response = await aiOrchestrator.generate('Test fallback', []);

      // Doit toujours réussir même si certains providers échouent
      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.provider).toBeDefined();
    });
  });
});
