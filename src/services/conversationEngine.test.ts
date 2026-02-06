import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/security', () => {
  return {
    secureInvoke: vi.fn(),
  };
});

import { secureInvoke } from '@/lib/security';
import { processMessage } from '@/services/conversationEngine';

describe('conversationEngine.processMessage', () => {
  it('normalizes missing metadata with safe defaults', async () => {
    vi.mocked(secureInvoke).mockResolvedValueOnce('c1').mockResolvedValueOnce({
      content: 'Hello',
      conversationId: 'c1',
      messageId: 'm1',
      metadata: undefined,
    });

    const response = await processMessage('Hi');

    expect(response.metadata).toBeDefined();
    expect(response.metadata.provider_used).toBe('fallback');
    expect(response.metadata.latency_ms).toBe(0);
    expect(response.metadata.tokens_used).toBe(0);
    expect(response.metadata.memory_effect).toBe('New');
    expect(Array.isArray(response.metadata.links_to_contexts)).toBe(true);
  });

  it('preserves provided metadata values when valid', async () => {
    vi.mocked(secureInvoke)
      .mockResolvedValueOnce('c2')
      .mockResolvedValueOnce({
        content: 'Ok',
        conversationId: 'c2',
        messageId: 'm2',
        metadata: {
          timestamp: 123,
          provider_used: 'local',
          latency_ms: 42,
          tokens_used: 7,
          memory_effect: 'Recall',
          links_to_contexts: ['a', 1, null, 'b'],
        },
      });

    const response = await processMessage('Hi');

    expect(response.metadata.timestamp).toBe(123);
    expect(response.metadata.provider_used).toBe('local');
    expect(response.metadata.latency_ms).toBe(42);
    expect(response.metadata.tokens_used).toBe(7);
    expect(response.metadata.memory_effect).toBe('Recall');
    expect(response.metadata.links_to_contexts).toEqual(['a', 'b']);
  });
});
