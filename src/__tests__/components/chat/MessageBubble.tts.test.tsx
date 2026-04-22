import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageBubble } from '@/components/chat/MessageBubble';
import {
  messageSpeechController,
  useMessageSpeechState,
} from '@/services/tts/messageSpeechController';

vi.mock('@/components/chat/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => (
    <div data-testid="markdown-content">{content}</div>
  ),
}));

vi.mock('@/components/chat/ChatFallback', () => ({
  ChatFallback: () => <div data-testid="chat-fallback">fallback</div>,
}));

vi.mock('@/components/chat/MessageReactions', () => ({
  MessageReactions: () => <div data-testid="message-reactions" />,
}));

vi.mock('@/services/tts/messageSpeechController', () => ({
  useMessageSpeechState: vi.fn(),
  messageSpeechController: {
    playMessage: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
  },
}));

describe('MessageBubble TTS controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le bouton Lire à haute voix sous une réponse assistant', () => {
    vi.mocked(useMessageSpeechState).mockReturnValue({
      messageId: 'assistant-1',
      status: 'idle',
      provider: null,
      error: null,
      supportsPause: true,
      canPlay: true,
    });

    render(
      <MessageBubble role="assistant" content="Bonjour depuis TITANE" timestamp={1} />
    );

    const button = screen.getByRole('button', { name: 'Lire à haute voix' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(messageSpeechController.playMessage).toHaveBeenCalledWith(
      'assistant-1',
      'Bonjour depuis TITANE'
    );
  });

  it('affiche pause et stop pendant la lecture', () => {
    vi.mocked(useMessageSpeechState).mockReturnValue({
      messageId: 'assistant-2',
      status: 'speaking',
      provider: 'tauri',
      error: null,
      supportsPause: true,
      canPlay: true,
    });

    render(<MessageBubble role="assistant" content="Lecture en cours" timestamp={2} />);

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));

    expect(messageSpeechController.pause).toHaveBeenCalledTimes(1);
    expect(messageSpeechController.stop).toHaveBeenCalledTimes(1);
  });

  it('affiche reprendre quand la lecture est en pause', () => {
    vi.mocked(useMessageSpeechState).mockReturnValue({
      messageId: 'assistant-3',
      status: 'paused',
      provider: 'tauri',
      error: null,
      supportsPause: true,
      canPlay: true,
    });

    render(<MessageBubble role="assistant" content="Lecture suspendue" timestamp={3} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reprendre' }));
    expect(messageSpeechController.resume).toHaveBeenCalledTimes(1);
  });

  it('rend les citations en ligne sur la bulle assistant canonique', () => {
    vi.mocked(useMessageSpeechState).mockReturnValue({
      messageId: 'assistant-4',
      status: 'idle',
      provider: null,
      error: null,
      supportsPause: true,
      canPlay: false,
    });

    render(
      <MessageBubble
        role="assistant"
        content="Synthèse avec sources"
        timestamp={4}
        metadata={{
          citations: [
            {
              url: 'https://example.com/a',
              title: 'Source A',
              excerpt: 'Extrait A',
              accessed_at: '2026-04-18T10:00:00Z',
              locator_text: 'p=2, c≈40',
            },
          ],
        }}
      />
    );

    expect(screen.getByTestId('message-citations-4')).toBeInTheDocument();
    expect(screen.getByTestId('message-citation-4-0')).toHaveTextContent('Source A');
    expect(screen.getByText('[1]')).toBeInTheDocument();
    expect(screen.getByText('Extrait A')).toBeInTheDocument();
    expect(screen.getByText('p=2, c≈40')).toBeInTheDocument();
    expect(screen.getByText('accessed: 2026-04-18T10:00:00Z')).toBeInTheDocument();
  });

  it('rend la vérité modèle requested-used-fallback sur la surface de compatibilité', () => {
    vi.mocked(useMessageSpeechState).mockReturnValue({
      messageId: 'assistant-7',
      status: 'idle',
      provider: null,
      error: null,
      supportsPause: true,
      canPlay: false,
    });

    render(
      <MessageBubble
        role="assistant"
        content="Compat model truth"
        timestamp={7}
        metadata={{
          providerUsed: 'Ollama (OMEGA+Singularity)',
          requestedProvider: 'Ollama',
          modelRequested: 'llama3.1:latest',
          modelUsed: 'llama3.2:latest',
          fallbackUsed: true,
        }}
      />
    );

    expect(screen.getByTestId('message-provider-badge-7')).toHaveTextContent(
      'Ollama (OMEGA+Singularity)'
    );
    expect(screen.getByTestId('message-provider-mismatch-7')).toBeInTheDocument();
    expect(screen.getByTestId('message-model-used-7')).toHaveTextContent(
      'Model: llama3.2:latest'
    );
    expect(screen.getByTestId('message-model-requested-7')).toHaveTextContent(
      'Requested: llama3.1:latest'
    );
    expect(screen.getByTestId('message-model-fallback-7')).toHaveTextContent(
      'Fallback'
    );
  });
});
