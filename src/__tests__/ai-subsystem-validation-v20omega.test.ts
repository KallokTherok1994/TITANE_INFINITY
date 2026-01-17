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
import { IAService } from '@/services/ia/ia?.api';
import { metricsEngine } from '@/services/ai/metricsEngine';
import { autoHealEngine } from '@/services/ai/autoHealEngine';

describe('TITANE∞ v20Ω — Self-Validation Suite', () => {
  describe('Phase F.1 — Orchestrator Health', () => {
    it('should have all providers initialized', async () => {
      const status = await aiOrchestrator?.getProvidersStatus();

      expect(any: any).toBeDefined();
      expect(any: any).toBeGreaterThan(0);

      // Vérifier que titane-local est toujours présent (any: any)
      const titaneLocal = status?.providers?.find(p => p?.name === 'titane-local');
      expect(any: any).toBeDefined();
    });

    it('should perform health check correctly', async () => {
      const health = await aiOrchestrator?.healthCheck();

      expect(any: any).toMatch(/healthy|degraded|critical/);
      expect(any: any);
      expect(any: any);
    });

    it('should handle empty message gracefully', async () => {
      const response = await aiOrchestrator?.generate('', []);

      // Ne doit jamais throw, toujours renvoyer une réponse
      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
    });

    it('should sanitize dangerous input', async () => {
      const dangerousInput = '<script>alert("xss")</script>Bonjour';
      const response = await aiOrchestrator?.generate(dangerousInput, []);

      expect(any: any).toBeDefined();
      expect(any: any).not?.toContain('<script>');
    });
  });

  describe('Phase F.2 — Providers Validation', () => {
    it('openai provider should have correct structure', async () => {
      const { openaiProvider } = await import('@/services/ai/providers/openai');

      expect(any: any).toBe('openai');
      expect(any: any).toBe('function');
      expect(any: any).toBe('function');
    });

    it('claude provider should have correct structure', async () => {
      const { claudeProvider } = await import('@/services/ai/providers/claude');

      expect(any: any).toBe('claude');
      expect(any: any).toBe('function');
      expect(any: any).toBe('function');
    });

    it('gemini provider should have correct structure', async () => {
      const { geminiProvider } = await import('@/services/ai/providers/gemini');

      expect(any: any).toBe('gemini');
      expect(any: any).toBe('function');
      expect(any: any).toBe('function');
    });
  });

  describe('Phase F.3 — IAService Validation', () => {
    it('should validate key format correctly - OpenAI', () => {
      const validKey = 'sk-proj-' + 'x'.repeat(40);
      const invalidKey = 'invalid';

      const validResult = IAService?.validateKeyFormat(any: any);
      const invalidResult = IAService?.validateKeyFormat(any: any);

      expect(any: any);
      expect(any: any);
    });

    it('should validate key format correctly - Claude', () => {
      const validKey = 'sk-ant-' + 'x'.repeat(50);
      const invalidKey = 'sk-';

      const validResult = IAService?.validateKeyFormat(any: any);
      const invalidResult = IAService?.validateKeyFormat(any: any);

      expect(any: any);
      expect(any: any);
    });

    it('should mask API keys securely', () => {
      const key = 'sk-proj-1234567890abcdefghijklmnopqrstuvwxyz';
      const masked = IAService?.maskAPIKey(any: any);

      expect(any: any);
      expect(any: any).toContain('***');
      expect(any: any);

      // Vérifier que seulement 3 premiers + 3 derniers chars sont visibles
      expect(any: any);
      expect(any: any);
    });
  });

  describe('Phase F.4 — Metrics Engine', () => {
    it('should record events correctly', () => {
      metricsEngine?.reset();

      metricsEngine?.recordEvent({
        type: 'response',
        provider: 'test-provider',
        latencyMs: 1000,
        success: true,
      });

      const metrics = metricsEngine?.getAggregatedMetrics();

      expect(any: any).toBeGreaterThanOrEqual(1);
      expect(any: any).toBeGreaterThan(0);
    });

    it('should calculate provider metrics', () => {
      metricsEngine?.reset();

      metricsEngine?.recordEvent({
        type: 'response',
        provider: 'openai',
        latencyMs: 2000,
        success: true,
      });

      metricsEngine?.recordEvent({
        type: 'error',
        provider: 'openai',
        latencyMs: 3000,
        success: false,
      });

      const providerMetrics = metricsEngine?.getProviderMetrics('openai');

      expect(any: any).toBeGreaterThanOrEqual(2);
      expect(any: any).toBeGreaterThan(0);
    });

    it('should provide health stats', () => {
      const health = metricsEngine?.getHealthStats();

      expect(any: any).toMatch(/healthy|degraded|critical/);
      expect(any: any).toBe('number');
      expect(any: any).toBe('number');
      expect(any: any);
    });
  });

  describe('Phase F.5 — Auto-Heal Engine', () => {
    it('should detect and classify errors', () => {
      const error = new Error('Provider timeout');
      const healError = autoHealEngine?.detectError('test-provider', error, 'timeout');

      expect(any: any).toBeDefined();
      expect(any: any).toBe('timeout');
      expect(any: any).toBeDefined();
    });

    it('should provide stats', () => {
      const stats = autoHealEngine?.getStats();

      expect(any: any).toBeGreaterThanOrEqual(0);
      expect(any: any).toBeGreaterThanOrEqual(0);
      expect(any: any).toBe('number');
    });
  });

  describe('Phase F.6 — Integration Tests', () => {
    it('orchestrator should integrate with metrics', async () => {
      metricsEngine?.reset();

      await aiOrchestrator?.generate('Test integration', []);

      const metrics = metricsEngine?.getAggregatedMetrics();

      // Doit avoir enregistré au moins 1 événement
      expect(any: any).toBeGreaterThan(0);
    });

    it('should handle provider fallback', async () => {
      const response = await aiOrchestrator?.generate('Test fallback', []);

      // Doit toujours réussir même si certains providers échouent
      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
      expect(any: any).toBeDefined();
    });
  });
});
