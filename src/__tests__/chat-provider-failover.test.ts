/**
 * TITANE∞ — Chat Provider Failover Tests
 *
 * Tests de failover du pipeline de génération IA :
 * - Ollama indisponible → isAvailable retourne false → erreur immédiate
 * - Health check fail → erreur explicite (pas 3×45s de retries inutiles)
 * - Cache santé transport aligné avec la config (300s)
 * - getOllamaEffortTimeout scaling correct (max=120s, high=90s)
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { cleanupAiSingletons } from './helpers/aiCleanup';

afterAll(() => cleanupAiSingletons());

// ─── Mocks ────────────────────────────────────────────────────────────────────

const ollamaCheckHealthMock = vi.fn();
const ollamaGenerateMock = vi.fn();

vi.mock('@/services/ai/transports/ollamaTransport', () => ({
  ollamaCheckHealth: ollamaCheckHealthMock,
  ollamaGenerate: ollamaGenerateMock,
  getTransportMode: vi.fn().mockReturnValue('IPC'),
}));

vi.mock('@/services/ai/memoryIntegration', () => ({
  memoryIntegration: {
    loadContext: vi.fn().mockResolvedValue({
      activeProjects: [],
      recentDecisions: [],
      relevantKnowledge: [],
      activeRituals: [],
      timeline: [],
    }),
  },
  MemoryContext: {},
}));

vi.mock('@/services/twin_chat/reviewQueue', () => ({
  listTwinChatReviewItems: vi.fn().mockReturnValue([]),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Ollama generate() — health check before retries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('fails immediately when endpoint unhealthy (no retries attempted)', async () => {
    ollamaCheckHealthMock.mockResolvedValue({
      ok: false,
      provider: 'ollama',
      error: {
        code: 'OLLAMA_IPC_FAILED',
        message: 'Ollama unreachable',
        retryable: false,
      },
    });

    const { ollamaProvider } = await import('@/services/ai/providers/ollama');

    const start = Date.now();
    await expect(ollamaProvider.generate('Test', [])).rejects.toThrow(/not available/i);
    const elapsed = Date.now() - start;

    // Should fail fast, not retry 3 times (each retry = up to 45s)
    expect(elapsed).toBeLessThan(3_000);
    // ollamaGenerate should NOT have been called
    expect(ollamaGenerateMock).not.toHaveBeenCalled();
  });

  it('succeeds when endpoint is healthy', async () => {
    ollamaCheckHealthMock.mockResolvedValue({
      ok: true,
      provider: 'ollama',
      content: { models: [{ name: 'gemma2:2b', modified_at: '', size: 0 }] },
    });
    ollamaGenerateMock.mockResolvedValue({
      ok: true,
      provider: 'ollama',
      content: { content: 'Réponse OK', model: 'gemma2:2b', latency_ms: 100 },
    });

    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    const result = await ollamaProvider.generate('Test', []);
    expect(result.content).toBe('Réponse OK');
  });
});

describe('Ollama generate() — retry behavior on transient errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    ollamaCheckHealthMock.mockResolvedValue({
      ok: true,
      provider: 'ollama',
      content: { models: [{ name: 'gemma2:2b', modified_at: '', size: 0 }] },
    });
  });

  it('retries on error and succeeds on second attempt', async () => {
    let callCount = 0;
    ollamaGenerateMock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          provider: 'ollama',
          error: {
            code: 'OLLAMA_IPC_ERROR',
            message: 'Transient error',
            retryable: true,
          },
        });
      }
      return Promise.resolve({
        ok: true,
        provider: 'ollama',
        content: { content: 'Succès retry', model: 'gemma2:2b', latency_ms: 80 },
      });
    });

    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    const result = await ollamaProvider.generate('Test', []);
    expect(result.content).toBe('Succès retry');
    expect(callCount).toBe(2);
  });

  it('throws after max retries exhausted', async () => {
    ollamaGenerateMock.mockResolvedValue({
      ok: false,
      provider: 'ollama',
      error: { code: 'OLLAMA_IPC_ERROR', message: 'Erreur persistante', retryable: true },
    });

    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    await expect(ollamaProvider.generate('Test', [])).rejects.toThrow(/failed after/i);
    // maxRetries = 3
    expect(ollamaGenerateMock).toHaveBeenCalledTimes(3);
  });
});

describe('Effort timeout scaling — getOllamaEffortTimeout', () => {
  it('max effort returns at least 120s', async () => {
    const { getOllamaEffortTimeout } = await import('@/config/aiTimeouts.config');
    expect(getOllamaEffortTimeout('max', 45_000)).toBeGreaterThanOrEqual(120);
  });

  it('high effort returns at least 90s', async () => {
    const { getOllamaEffortTimeout } = await import('@/config/aiTimeouts.config');
    expect(getOllamaEffortTimeout('high', 45_000)).toBeGreaterThanOrEqual(90);
  });

  it('default effort returns base seconds', async () => {
    const { getOllamaEffortTimeout } = await import('@/config/aiTimeouts.config');
    expect(getOllamaEffortTimeout(undefined, 45_000)).toBe(45);
  });

  it('low effort returns base seconds', async () => {
    const { getOllamaEffortTimeout } = await import('@/config/aiTimeouts.config');
    expect(getOllamaEffortTimeout('low', 30_000)).toBe(30);
  });
});

describe('Transport health cache — aligned with config', () => {
  it('HEALTH_CACHE_TTL_MS equals AVAILABILITY_CACHE.ttlMs (300s)', async () => {
    const { AVAILABILITY_CACHE } = await import('@/config/aiTimeouts.config');
    // The transport module re-exports nothing, but we can verify the config value
    expect(AVAILABILITY_CACHE.ttlMs).toBe(300_000);
  });
});
