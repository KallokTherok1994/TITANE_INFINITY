import React, { useRef } from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock useChatCore to provide a stream implementation
vi.mock('@hooks/useChatCore', () => {
  return {
    useChatCore: () => ({
      currentMode: 'default',
      anomalyCount: 0,
      currentProvider: 'test-provider',
      generate: async () => ({ content: 'fallback response', provider: 'test-provider' }),
      async *stream() {
        yield 'Hello';
        yield ' world';
        return {
          content: 'Hello world',
          provider: 'test-provider',
          timestamp: Date.now(),
          mode: 'default',
          contextUsed: [],
          suggestions: [],
        };
      },
      setMode: () => {},
      setProvider: () => {},
      validateResponse: () => ({ isValid: true, score: 1, issues: [] }),
    }),
  };
});

import { useChat } from '@/hooks/useChat';

function TestHost(props: { onReady: (api: any) => void }) {
  const api = useChat();
  React.useEffect(() => props.onReady(api), [api]);
  return null;
}

describe('useChat streaming flow', () => {
  test('streaming updates replace placeholder with final content', async () => {
    let apiRef: any = null;

    render(React.createElement(TestHost, { onReady: (api: any) => { apiRef = api; } }));

    await act(async () => {
      // send 10 messages sequentially and verify final responses
      for (let i = 0; i < 10; i++) {
        const promise = apiRef.sendMessage(`test streaming ${i}`);
        // wait a bit for streaming to push updates
        await new Promise(resolve => setTimeout(resolve, 50));
        const assistantMessage = await promise;

        expect(assistantMessage).toBeDefined();
        expect(assistantMessage.content).toContain('Hello world');
      }
    });
  });
});
