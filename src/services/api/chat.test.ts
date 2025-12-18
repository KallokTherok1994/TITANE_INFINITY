import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/serviceInvoker', () => {
  return {
    LONG_COMMAND_OPTIONS: {},
    invokeWithRetry: vi.fn(),
  };
});

import { invokeWithRetry } from '@/lib/serviceInvoker';
import { chatService, type ChatMessage } from '@/services/api/chat';

describe('ChatService normalizeResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('falls back provider/latency when backend omits them', async () => {
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

    const history: ChatMessage[] = [
      { role: 'user', content: 'hi', timestamp: new Date().toISOString() },
    ];

    const response = await chatService.sendMessageLegacy(history, { provider: 'auto' });

    expect(response.provider).toBe('auto');
    expect(response.latencyMs).toBe(0);
  });
});
