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
    vi.mocked(secureInvoke).mockResolvedValueOnce({
      assistant_message: 'Hello',
      conversation_id: 'c1',
      message_id: 'm1',
      detected_intention: 'Question',
      detected_emotion: { valence: 0, intensity: 0, energy: 0 },
      cognitive_tags: [],
      cognitive_summary: '',
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
    vi.mocked(secureInvoke).mockResolvedValueOnce({
      assistant_message: 'Ok',
      conversation_id: 'c2',
      message_id: 'm2',
      detected_intention: 'Action',
      detected_emotion: { valence: 0.2, intensity: 0.3, energy: 0.4 },
      cognitive_tags: ['tag'],
      cognitive_summary: 'sum',
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
