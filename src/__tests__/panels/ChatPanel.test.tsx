/**
 * Tests pour ChatPanel Component
 * Coverage: Panel principal chat, Messages, Input, Actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatPanel } from '@/panels/ChatPanel';

describe('ChatPanel Component', () => {
  const mockOnSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render chat panel', () => {
      render(<ChatPanel onSend={mockOnSend} />);
      expect(screen.getByRole('region') || screen.getByPlaceholderText(/message/i)).toBeTruthy();
    });

    it('should render message input', () => {
      render(<ChatPanel onSend={mockOnSend} />);
      expect(screen.getByPlaceholderText(/message|type/i)).toBeInTheDocument();
    });

    it('should render send button', () => {
      render(<ChatPanel onSend={mockOnSend} />);
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });
  });

  describe('Messages', () => {
    it('should display message list', () => {
      const messages = [
        { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() },
        { id: '2', role: 'assistant', content: 'Hi!', timestamp: Date.now() },
      ];
      render(<ChatPanel onSend={mockOnSend} messages={messages} />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi!')).toBeInTheDocument();
    });

    it('should show empty state', () => {
      render(<ChatPanel onSend={mockOnSend} messages={[]} />);
      expect(screen.getByText(/no messages|start conversation|empty/i)).toBeTruthy();
    });
  });

  describe('Input Actions', () => {
    it('should handle message input', () => {
      render(<ChatPanel onSend={mockOnSend} />);
      const input = screen.getByPlaceholderText(/message|type/i);
      fireEvent.change(input, { target: { value: 'Test message' } });
      expect(input).toHaveValue('Test message');
    });

    it('should send message', () => {
      render(<ChatPanel onSend={mockOnSend} />);
      const input = screen.getByPlaceholderText(/message|type/i);
      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      expect(mockOnSend).toHaveBeenCalledWith('Test');
    });

    it('should clear input after send', () => {
      render(<ChatPanel onSend={mockOnSend} />);
      const input = screen.getByPlaceholderText(/message|type/i);
      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      expect(input).toHaveValue('');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<ChatPanel onSend={mockOnSend} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
