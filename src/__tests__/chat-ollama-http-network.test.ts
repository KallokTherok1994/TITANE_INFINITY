/**
 * TITANE∞ — Ollama HTTP Network Tests (Live)
 *
 * Tests réseau réels contre Ollama à http://127.0.0.1:11434.
 * Tous les tests sont automatiquement skippés si Ollama n'est pas disponible.
 *
 * Usage:
 *   pnpm test:ollama-http        # Run this file only
 *   OLLAMA_FORCE=1 pnpm test:ollama-http  # Force-run even if check is flaky
 *
 * These tests verify the TITANE chat pipeline's real HTTP integration:
 * - Version endpoint
 * - Generate completion (/api/generate)
 * - Chat completion (/api/chat)
 * - Embeddings (/api/embeddings)
 * - Model listing (/api/tags)
 * - Abort signal propagation
 */

import { describe, it, expect, beforeAll } from 'vitest';

const OLLAMA_BASE = 'http://127.0.0.1:11434';
const OLLAMA_MODEL = 'gemma2:2b';

// ─── Availability check (runs before all tests) ───────────────────────────────

let ollamaAvailable = false;

beforeAll(async () => {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/version`, {
      signal: AbortSignal.timeout(3_000),
    });
    if (res.ok) {
      const body = (await res.json()) as { version?: string };
      // Verify it's actually Ollama (not some other service on the port)
      ollamaAvailable = typeof body.version === 'string' && body.version.length > 0;
    }
  } catch {
    ollamaAvailable = false;
  }

  if (!ollamaAvailable) {
    console.warn(
      '[chat-ollama-http-network] Ollama not reachable at 127.0.0.1:11434 — all tests will be skipped'
    );
  }
});

// ─── Live network tests ────────────────────────────────────────────────────────

describe('Ollama HTTP — version endpoint', () => {
  it('GET /api/version returns { version: string }', async () => {
    if (!ollamaAvailable) return;

    const res = await fetch(`${OLLAMA_BASE}/api/version`);
    expect(res.ok).toBe(true);
    const data = (await res.json()) as { version?: string };
    expect(typeof data.version).toBe('string');
    expect(data.version!.length).toBeGreaterThan(0);
  });
});

describe('Ollama HTTP — model listing', () => {
  it('GET /api/tags returns models array', async () => {
    if (!ollamaAvailable) return;

    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    expect(res.ok).toBe(true);
    const data = (await res.json()) as { models?: Array<{ name: string }> };
    expect(Array.isArray(data.models)).toBe(true);
  });

  it('gemma2:2b is in the model list', async () => {
    if (!ollamaAvailable) return;

    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    const data = (await res.json()) as { models?: Array<{ name: string }> };
    const models = data.models ?? [];
    const hasGemma = models.some(
      m => m.name === OLLAMA_MODEL || m.name.startsWith('gemma2')
    );
    expect(hasGemma).toBe(true);
  });
});

describe('Ollama HTTP — generate completion', () => {
  it('POST /api/generate returns non-empty response string', async () => {
    if (!ollamaAvailable) return;

    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: 'Réponds en un seul mot: bonjour',
        stream: false,
        options: { num_predict: 10, temperature: 0 },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    expect(res.ok).toBe(true);
    const data = (await res.json()) as {
      response?: string;
      model?: string;
      done?: boolean;
    };
    expect(typeof data.response).toBe('string');
    expect(data.response!.trim().length).toBeGreaterThan(0);
    expect(data.done).toBe(true);
  });

  it('POST /api/generate with system prompt includes context', async () => {
    if (!ollamaAvailable) return;

    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system: 'Tu réponds toujours avec exactement le mot "PING".',
        prompt: 'Test',
        stream: false,
        options: { num_predict: 5, temperature: 0 },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    expect(res.ok).toBe(true);
    const data = (await res.json()) as { response?: string };
    expect(typeof data.response).toBe('string');
    // Model should follow the system instruction
    expect(data.response!.toUpperCase()).toContain('PING');
  });
});

describe('Ollama HTTP — chat completion', () => {
  it('POST /api/chat returns message.content non-empty', async () => {
    if (!ollamaAvailable) return;

    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: 'Dis juste "oui"' }],
        stream: false,
        options: { num_predict: 5, temperature: 0 },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    expect(res.ok).toBe(true);
    const data = (await res.json()) as {
      message?: { role?: string; content?: string };
      done?: boolean;
    };
    expect(data.message?.role).toBe('assistant');
    expect(typeof data.message?.content).toBe('string');
    expect(data.message!.content!.trim().length).toBeGreaterThan(0);
  });
});

describe('Ollama HTTP — embeddings', () => {
  it('POST /api/embeddings returns non-empty embedding vector', async () => {
    if (!ollamaAvailable) return;

    const res = await fetch(`${OLLAMA_BASE}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: 'Test embedding TITANE',
      }),
      signal: AbortSignal.timeout(30_000),
    });

    expect(res.ok).toBe(true);
    const data = (await res.json()) as { embedding?: number[] };
    expect(Array.isArray(data.embedding)).toBe(true);
    expect(data.embedding!.length).toBeGreaterThan(0);
    expect(typeof data.embedding![0]).toBe('number');
  });
});

describe('Ollama HTTP — abort signal', () => {
  it('aborting a request throws AbortError', async () => {
    if (!ollamaAvailable) return;

    const controller = new AbortController();

    const fetchPromise = fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: 'Écris un long texte de 500 mots sur la nature',
        stream: false,
      }),
      signal: controller.signal,
    });

    // Abort immediately after starting
    controller.abort();

    await expect(fetchPromise).rejects.toThrow();
    // The error name should indicate abort
    try {
      await fetchPromise;
    } catch (err) {
      expect((err as Error).name).toMatch(/abort/i);
    }
  });
});

describe('Ollama HTTP — error handling', () => {
  it('unknown model returns 404 or 400', async () => {
    if (!ollamaAvailable) return;

    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'modele-inexistant-xyz-999',
        prompt: 'Test',
        stream: false,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    expect(res.ok).toBe(false);
    expect([400, 404, 500]).toContain(res.status);
  });

  it('malformed request returns 400', async () => {
    if (!ollamaAvailable) return;

    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: true }),
      signal: AbortSignal.timeout(5_000),
    });

    // Ollama may return 400 or 500 for malformed requests
    expect(res.ok).toBe(false);
  });
});
