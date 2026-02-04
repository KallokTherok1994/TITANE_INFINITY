/**
 * Tests pour ChatMessage Component
 * Coverage: Affichage messages, rôles, streaming
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render, screen } from '../../test-helpers';
import { ChatMessage } from '@/features/chat';

vi.mock('@/contexts/AnimationContext', () => ({
  useAnimation: () => ({
    animationConfig: { duration: 0 },
  }),
}));

vi.mock('@/hooks/useTTS', () => ({
  useTTS: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
    isSpeaking: false,
  }),
}));

describe('ChatMessage Component', () => {
  const baseMessage = {
    role: 'user' as const,
    content: 'Hello TITANE!',
    timestamp: new Date('2026-02-02T12:00:00Z'),
  };

  describe('Rendering', () => {
    it('should render message content', () => {
      render(<ChatMessage {...baseMessage} />);
      expect(screen.getByText('Hello TITANE!')).toBeInTheDocument();
    });

    it('should render user message', () => {
      render(<ChatMessage {...baseMessage} role="user" />);
      expect(screen.getByText('Hello TITANE!')).toBeInTheDocument();
    });

    it('should render assistant message', () => {
      render(
        <ChatMessage
          {...baseMessage}
          role="assistant"
          content="Hi there!"
          provider="local"
        />
      );
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
      expect(screen.getByText(/local/i)).toBeInTheDocument();
    });

    it('should render system message', () => {
      render(
        <ChatMessage {...baseMessage} role="system" content="System notification" />
      );
      expect(screen.getByText('System notification')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should show timestamp', () => {
      render(<ChatMessage {...baseMessage} />);
      expect(screen.getByText('12:00')).toBeInTheDocument();
    });

    it('should handle streaming state', () => {
      render(<ChatMessage {...baseMessage} streaming />);
      expect(screen.getByText('Hello TITANE!')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<ChatMessage {...baseMessage} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
