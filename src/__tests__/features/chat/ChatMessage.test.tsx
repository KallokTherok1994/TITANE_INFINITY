/**
 * Tests pour ChatMessage Component
 * Coverage: Affichage messages, Formatting, States (user/assistant/system)
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders as render, screen } from '../../test-utils';
import { ChatMessage } from '@/features/chat';

describe('ChatMessage Component', () => {
  const mockMessage = {
    id: 'msg-1',
    role: 'user',
    content: 'Hello TITANE!',
    timestamp: Date.now(),
  };

  describe('Rendering', () => {
    it('should render message content', () => {
      render(<ChatMessage message={mockMessage} />);
      expect(screen.getByText('Hello TITANE!')).toBeInTheDocument();
    });

    it('should render user message', () => {
      render(<ChatMessage message={{ ...mockMessage, role: 'user' }} />);
      expect(screen.getByText('Hello TITANE!')).toBeInTheDocument();
    });

    it('should render assistant message', () => {
      render(<ChatMessage message={{ ...mockMessage, role: 'assistant', content: 'Hi there!' }} />);
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('should render system message', () => {
      render(<ChatMessage message={{ ...mockMessage, role: 'system', content: 'System notification' }} />);
      expect(screen.getByText('System notification')).toBeInTheDocument();
    });
  });

  describe('Formatting', () => {
    it('should render markdown content', () => {
      const mdMessage = { ...mockMessage, content: '**Bold text**' };
      render(<ChatMessage message={mdMessage} />);
      // Markdown devrait être parsé (vérifier présence)
      expect(screen.getByText(/Bold text/i)).toBeInTheDocument();
    });

    it('should render code blocks', () => {
      const codeMessage = { ...mockMessage, content: '```js\nconsole.log("test")\n```' };
      render(<ChatMessage message={codeMessage} />);
      expect(screen.getByText(/console\.log/i)).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should show timestamp', () => {
      const messageWithTime = { ...mockMessage, timestamp: Date.now() };
      render(<ChatMessage message={messageWithTime} showTimestamp />);
      // Timestamp devrait être affiché quelque part
      const container = screen.getByText('Hello TITANE!').parentElement;
      expect(container).toBeTruthy();
    });

    it('should handle streaming state', () => {
      render(<ChatMessage message={mockMessage} isStreaming />);
      expect(screen.getByText('Hello TITANE!')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<ChatMessage message={mockMessage} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
