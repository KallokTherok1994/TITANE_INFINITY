import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/serviceInvoker', () => {
  return {
    LONG_COMMAND_OPTIONS: {},
    invokeWithRetry: vi.fn(),
  };
});

vi.mock('@/utils/tauriProtector', () => {
  return {
    isTauriRuntimeAvailable: vi.fn(() => true),
  };
});

import { invokeWithRetry } from '@/lib/serviceInvoker';
import { chatService, type ChatMessage } from '@/services/api/chat';

describe('ChatService normalizeResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('falls back provider/latency when backend omits them (OMEGA)', async () => {
    vi.mocked(invokeWithRetry).mockResolvedValueOnce({
      success: true,
      message: {
        id: 'm1',
        content: 'hello',
        model: 'auto',
        provider: undefined,
        timestamp: 'now',
      },
      latency_ms: undefined,
      omega_metadata: {},
    } as any);

    const response = await chatService.sendMessage('hi', 'conv-1', { provider: 'auto' });

    expect(response.provider).toBe('auto');
    expect(response.latencyMs).toBe(0);
  });

  it('forwards the canonical output ceiling when no maxTokens override is provided', async () => {
    vi.mocked(invokeWithRetry).mockResolvedValueOnce({
      ok: true,
      content: 'Réponse complète.',
      conversationId: 'conv-budget',
      messageId: 'msg-budget',
      latencyMs: 80,
      metadata: {},
      meta: {
        provider_used: 'ollama',
      },
    } as any);

    await chatService.sendMessage('hi', 'conv-budget', { provider: 'auto' });

    const conversationGenerateCall = vi
      .mocked(invokeWithRetry)
      .mock.calls.find(([command]) => command === 'conversation_generate');

    expect(conversationGenerateCall).toBeDefined();
    expect(
      (conversationGenerateCall?.[1] as { args?: { maxTokens?: number } }).args?.maxTokens
    ).toBe(32768);
  });
});

// ═══════════════════════════════════════════════════════════════
// LOCK1-REPAIR — PROVIDER_TRUTH_CHAIN runtime proof tests
// Proves: backend meta.provider_used → ChatResponse.provider → metadata.provider_used
// Constitutional invariant: UI must show truth (actual backend provider), not preference
// ═══════════════════════════════════════════════════════════════

describe('LOCK1 — Provider truth chain: backend meta → ChatResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * RUNTIME PROOF 1:
   * Backend returns meta.provider_used="gemini" with top-level provider="ollama" (legacy field).
   * Proves the chain reads from meta (truth), not from legacy provider field.
   */
  it('RP1: uses meta.provider_used as truth when it differs from legacy provider field', async () => {
    vi.mocked(invokeWithRetry).mockResolvedValueOnce({
      ok: true,
      content: 'Bonjour!',
      conversationId: 'conv-rp1',
      messageId: 'msg-rp1',
      latencyMs: 120,
      // REAL truth: meta.provider_used = gemini
      meta: {
        provider_used: 'gemini',
        mode: 'REMOTE',
        network_used: true,
        reason_code: 'REMOTE_PREFERRED',
        latency_ms_total: 120,
      },
      // Legacy field says ollama (should be ignored in favour of meta)
      metadata: {
        provider: 'ollama',
        intention: 'Question',
      },
    } as any);

    const response = await chatService.sendMessage('test', 'conv-rp1');

    // Provider must be the real one from meta, not the legacy 'ollama'
    expect(response.provider).toBe('gemini');
    // metadata.provider_used must also carry the truth
    expect((response.metadata as Record<string, unknown>).provider_used).toBe('gemini');
    // provider_meta must be preserved for richer downstream consumers
    expect(
      (
        (response.metadata as Record<string, unknown>).provider_meta as Record<
          string,
          unknown
        >
      )?.provider_used
    ).toBe('gemini');
  });

  /**
   * RUNTIME PROOF 2:
   * Backend returns meta.provider_used="ollama" with no legacy provider field.
   * Standard case — local model, local-only mode.
   */
  it('RP2: propagates ollama as actual provider when meta.provider_used=ollama', async () => {
    vi.mocked(invokeWithRetry).mockResolvedValueOnce({
      ok: true,
      content: 'Réponse locale.',
      conversationId: 'conv-rp2',
      messageId: 'msg-rp2',
      latencyMs: 45,
      meta: {
        provider_used: 'ollama',
        mode: 'LOCAL',
        network_used: false,
        reason_code: 'LOCAL_PREFERRED',
        latency_ms_total: 45,
      },
      metadata: {
        intention: 'Question',
      },
    } as any);

    const response = await chatService.sendMessage('test', 'conv-rp2');

    expect(response.provider).toBe('ollama');
    expect((response.metadata as Record<string, unknown>).provider_used).toBe('ollama');
  });

  /**
   * RUNTIME PROOF 3:
   * Backend returns empty meta (degraded case) — must not lie, fall back to 'tauri-backend'.
   */
  it('RP3: falls back to tauri-backend when meta is absent (no invention)', async () => {
    vi.mocked(invokeWithRetry).mockResolvedValueOnce({
      ok: true,
      content: 'Réponse dégradée.',
      conversationId: 'conv-rp3',
      messageId: 'msg-rp3',
      latencyMs: 500,
      // No meta field at all
      metadata: {
        intention: 'Question',
      },
    } as any);

    const response = await chatService.sendMessage('test', 'conv-rp3');

    expect(response.provider).toBe('tauri-backend');
    expect((response.metadata as Record<string, unknown>).provider_used).toBe(
      'tauri-backend'
    );
    // Must NOT claim a real provider
    expect(response.provider).not.toBe('gemini');
    expect(response.provider).not.toBe('ollama');
  });

  /**
   * RUNTIME PROOF 4:
   * The critical mismatch scenario from the audit:
   * preferred = 'ollama' but backend actually used 'gemini' (fallback scenario).
   * Proves metadata.provider_used carries the real provider for badge display.
   */
  it('RP4: CRITICAL — preferred=ollama but backend used gemini → metadata.provider_used=gemini', async () => {
    vi.mocked(invokeWithRetry).mockResolvedValueOnce({
      ok: true,
      content: 'Fallback via Gemini.',
      conversationId: 'conv-rp4',
      messageId: 'msg-rp4',
      latencyMs: 200,
      meta: {
        provider_used: 'gemini', // actual truth
        mode: 'REMOTE',
        network_used: true,
        reason_code: 'FALLBACK_OFFLINE',
        latency_ms_total: 200,
      },
      metadata: {
        intention: 'Question',
        // Note: no 'provider' field in metadata — only in meta
      },
    } as any);

    // User had selected 'ollama' as preferred (config.provider)
    const response = await chatService.sendMessage('test', 'conv-rp4', {
      provider: 'ollama',
    });

    // Truth: the actual provider used
    expect(response.provider).toBe('gemini');
    expect((response.metadata as Record<string, unknown>).provider_used).toBe('gemini');

    // The preferred provider (ollama) is NOT visible in these fields — correct, it belongs
    // to the UI layer (requestedProvider in metadataPatch), not the response truth.
    expect(response.provider).not.toBe('ollama');
  });
});
