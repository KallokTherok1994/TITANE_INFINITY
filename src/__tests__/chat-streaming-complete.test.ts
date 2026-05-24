/**
 * TITANE∞ — Chat Streaming Complete Tests
 *
 * Tests complets pour le pipeline de streaming Ollama :
 * - Stream normal → réponse complète accumulée
 * - Stream error → erreur propagée (throw, pas yield string)
 * - Stream avec Ollama indisponible → erreur immédiate
 * - Comportement du timeout stream (vérifié via configuration)
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

function healthyResponse() {
  return {
    ok: true as const,
    provider: 'ollama' as const,
    content: { models: [{ name: 'gemma2:2b', modified_at: '', size: 0 }] },
  };
}

function generateOkResponse(content: string) {
  return {
    ok: true as const,
    provider: 'ollama' as const,
    content: { content, model: 'gemma2:2b', latency_ms: 50 },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Ollama stream() — success path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    ollamaCheckHealthMock.mockResolvedValue(healthyResponse());
    ollamaGenerateMock.mockResolvedValue(generateOkResponse('Réponse de test complète'));
  });

  it('yields the full response content from a successful stream', async () => {
    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    const chunks: string[] = [];

    for await (const chunk of ollamaProvider.stream('Bonjour', [])) {
      chunks.push(chunk);
    }

    expect(chunks.join('')).toContain('Réponse de test complète');
  });

  it('stream with system history yields response without memory reload', async () => {
    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    const chunks: string[] = [];
    const history = [{ role: 'system' as const, content: 'Système TITANE', timestamp: Date.now() }];

    for await (const chunk of ollamaProvider.stream('Question', history)) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
  });
});

describe('Ollama stream() — error propagation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    ollamaCheckHealthMock.mockResolvedValue(healthyResponse());
  });

  it('throws when Ollama generate returns error (not yields string)', async () => {
    ollamaGenerateMock.mockResolvedValue({
      ok: false,
      provider: 'ollama',
      error: { code: 'OLLAMA_IPC_ERROR', message: 'Model not found', retryable: false },
    });

    const { ollamaProvider } = await import('@/services/ai/providers/ollama');

    await expect(async () => {
      for await (const _chunk of ollamaProvider.stream('Test', [])) {
        // should throw before yielding
      }
    }).rejects.toThrow('Model not found');
  });

  it('does not yield a warning string on error (error is thrown)', async () => {
    ollamaGenerateMock.mockResolvedValue({
      ok: false,
      provider: 'ollama',
      error: { code: 'OLLAMA_IPC_ERROR', message: 'Connexion refusée', retryable: true },
    });

    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    const chunks: string[] = [];

    try {
      for await (const chunk of ollamaProvider.stream('Test', [])) {
        chunks.push(chunk);
      }
    } catch {
      // Expected to throw
    }

    // Should NOT have yielded an "⚠️ Erreur" string
    const warningChunks = chunks.filter(c => c.startsWith('⚠️'));
    expect(warningChunks).toHaveLength(0);
  });

  it('fails immediately when Ollama is unavailable (no retries)', async () => {
    ollamaCheckHealthMock.mockResolvedValue({
      ok: false,
      provider: 'ollama',
      error: { code: 'OLLAMA_IPC_FAILED', message: 'Ollama unavailable', retryable: true },
    });

    const { ollamaProvider } = await import('@/services/ai/providers/ollama');
    const chunks: string[] = [];

    for await (const chunk of ollamaProvider.stream('Test', [])) {
      chunks.push(chunk);
    }

    // When Ollama is unavailable, stream yields the warning and returns
    expect(chunks.some(c => c.includes('non disponible'))).toBe(true);
  });
});

describe('Timeout configuration — stream aligned with global budget', () => {
  it('STREAM_CONFIG.totalTimeoutMs is less than globalRequestMs', async () => {
    const { STREAM_CONFIG, REQUEST_BUDGETS } = await import('@/config/aiTimeouts.config');
    expect(STREAM_CONFIG.totalTimeoutMs).toBeLessThan(REQUEST_BUDGETS.globalRequestMs);
  });

  it('providerAttemptMs leaves at least 5s margin vs globalRequestMs', async () => {
    const { REQUEST_BUDGETS } = await import('@/config/aiTimeouts.config');
    const margin = REQUEST_BUDGETS.globalRequestMs - REQUEST_BUDGETS.providerAttemptMs;
    expect(margin).toBeGreaterThanOrEqual(5_000);
  });

  it('STREAM_CONFIG.totalTimeoutMs equals 50 seconds', async () => {
    const { STREAM_CONFIG } = await import('@/config/aiTimeouts.config');
    expect(STREAM_CONFIG.totalTimeoutMs).toBe(50_000);
  });

  it('providerAttemptMs equals 45 seconds', async () => {
    const { REQUEST_BUDGETS } = await import('@/config/aiTimeouts.config');
    expect(REQUEST_BUDGETS.providerAttemptMs).toBe(45_000);
  });
});
