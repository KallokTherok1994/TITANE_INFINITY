/**
 * Tests pour VirtualMessageList Component
 * Coverage: Virtualisation, Scroll, Performance
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualMessageList } from '@/components/chat/VirtualMessageList';

describe('VirtualMessageList Component', () => {
  const mockMessages = [
    { id: '1', role: 'user', content: 'Message 1', timestamp: Date.now() },
    { id: '2', role: 'assistant', content: 'Message 2', timestamp: Date.now() },
    { id: '3', role: 'user', content: 'Message 3', timestamp: Date.now() },
  ];

  const renderMessage = (message: { content: string }) => <div>{message.content}</div>;

  describe('Rendering', () => {
    it('should render message list', () => {
      render(
        <VirtualMessageList messages={mockMessages} renderMessage={renderMessage} />
      );
      expect(screen.getByText('Message 1')).toBeInTheDocument();
    });

    it('should render multiple messages', () => {
      render(
        <VirtualMessageList messages={mockMessages} renderMessage={renderMessage} />
      );
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
      expect(screen.getByText('Message 3')).toBeInTheDocument();
    });

    it('should render empty list without messages', () => {
      render(<VirtualMessageList messages={[]} renderMessage={renderMessage} />);
      expect(screen.queryByText(/Message/i)).not.toBeInTheDocument();
    });
  });

  describe('Virtualization', () => {
    it('should handle large message lists', () => {
      const largeList = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`,
        timestamp: Date.now(),
      }));
      render(<VirtualMessageList messages={largeList} renderMessage={renderMessage} />);
      // Au moins le premier message devrait être visible
      expect(screen.getByText('Message 0')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <VirtualMessageList messages={mockMessages} renderMessage={renderMessage} />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
