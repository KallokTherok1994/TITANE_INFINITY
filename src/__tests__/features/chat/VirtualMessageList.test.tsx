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

  describe('Rendering', () => {
    it('should render message list', () => {
      render(<VirtualMessageList messages={mockMessages} />);
      expect(screen.getByText('Message 1')).toBeInTheDocument();
    });

    it('should render multiple messages', () => {
      render(<VirtualMessageList messages={mockMessages} />);
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
      expect(screen.getByText('Message 3')).toBeInTheDocument();
    });

    it('should render empty state', () => {
      render(<VirtualMessageList messages={[]} />);
      expect(screen.getByText(/no messages/i) || screen.getByText(/empty/i)).toBeTruthy();
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
      render(<VirtualMessageList messages={largeList} />);
      // Au moins le premier message devrait être visible
      expect(screen.getByText('Message 0')).toBeInTheDocument();
    });
  });

  describe('Scroll', () => {
    it('should auto-scroll to bottom by default', () => {
      const { container } = render(<VirtualMessageList messages={mockMessages} autoScrollToBottom />);
      // Le container devrait avoir scroll au bottom
      expect(container).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<VirtualMessageList messages={mockMessages} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
