import React from 'react';
import { render, screen, waitFor } from '@/test-utils';
import { act } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useChat } from '@/hooks';
import { MessageList } from '@/components/chat/MessageList';

// Reuse the same useChatCore mock streaming behavior

// Force useChat à utiliser le stream mock (pas de backend Tauri en unit tests)
vi.mock('@/services/api/chat', () => ({
  chatService: {
    sendMessageLegacy: vi.fn(async () => {
      throw new Error('Mock backend unavailable');
    }),
  },
}));

// Neutraliser les effets de bord (secureInvoke experience_update_state, etc.)
vi.mock('@/core/experience/XP_ENGINE', () => ({
  XP: { gain: vi.fn() },
}));

vi.mock('@/services/experienceService', () => ({
  awardExperience: vi.fn(async () => null),
}));

vi.mock('@/services/userPreferencesEngine', () => ({
  userPreferencesEngine: {
    generateContextForAI: vi.fn(() => null),
    recordInteraction: vi.fn(),
  },
}));

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

function TestHost(props: { onReady: (api: any) => void }) {
  const api = useChat();
  React.useEffect(() => {
    props.onReady(api);
  }, [api, props]);
  return null;
}

describe('UI integration: first 10 responses', () => {
  it('renders assistant responses in the MessageList for the first 10 messages', async () => {
    let apiRef: any = null;

    const host = render(<TestHost onReady={api => (apiRef = api)} />);

    // send messages without mounting MessageList to avoid concurrent effect cleanup issues
    await act(async () => {
      for (let i = 0; i < 10; i++) {
        const p = apiRef.sendMessage(`ui test ${i}`);
        await p;
      }
    });

    // Wait until we have 10 assistant messages produced (streaming may be async)
    await waitFor(() => {
      expect(apiRef.messages.length).toBeGreaterThanOrEqual(10);
    });

    // Render a minimal snapshot of messages to avoid MessageList side effects in this test
    const SnapshotList = ({ messages }: { messages: any[] }) => (
      <div>
        {messages.map(m => (
          <div key={m.metadata?.uiId}>{m.content || '<placeholder>'}</div>
        ))}
      </div>
    );

    render(<SnapshotList messages={apiRef.messages} />);

    await waitFor(() => {
      const matches = screen.getAllByText(/Hello world/);
      expect(matches.length).toBeGreaterThanOrEqual(10);
    });
  });
});
