/**
 * E2E Tests: Chat Workflow
 * Coverage: Chat → Memory → Response flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '@/App';

describe('E2E: Chat Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Chat Flow', () => {
    it('should complete full chat interaction', async () => {
      render(<App />);
      
      // Navigate to Chat
      const chatTab = screen.getByRole('button', { name: /chat/i });
      fireEvent.click(chatTab);
      
      // Type message
      const input = screen.getByPlaceholderText(/type.*message/i);
      fireEvent.change(input, { target: { value: 'Hello TITANE' } });
      
      // Send message
      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);
      
      // Wait for response
      await waitFor(() => {
        expect(screen.getByText('Hello TITANE')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should store chat in memory', async () => {
      render(<App />);
      
      // Send chat message
      const input = screen.getByPlaceholderText(/type.*message/i);
      fireEvent.change(input, { target: { value: 'Remember this' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Remember this')).toBeInTheDocument();
      });
      
      // Navigate to Memory
      fireEvent.click(screen.getByRole('button', { name: /memory/i }));
      
      // Verify memory stored
      await waitFor(() => {
        expect(screen.getByText(/remember this/i)).toBeInTheDocument();
      });
    });

    it('should handle streaming responses', async () => {
      render(<App />);
      
      const input = screen.getByPlaceholderText(/type.*message/i);
      fireEvent.change(input, { target: { value: 'Long response test' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      // Should show typing indicator
      await waitFor(() => {
        expect(screen.getByText(/typing|generating/i)).toBeInTheDocument();
      });
      
      // Should complete streaming
      await waitFor(() => {
        expect(screen.queryByText(/typing|generating/i)).not.toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });

  describe('Chat History', () => {
    it('should persist chat history', async () => {
      const { unmount } = render(<App />);
      
      // Send message
      const input = screen.getByPlaceholderText(/type.*message/i);
      fireEvent.change(input, { target: { value: 'Persistent message' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Persistent message')).toBeInTheDocument();
      });
      
      // Unmount and remount
      unmount();
      render(<App />);
      
      // History should be restored
      expect(screen.getByText('Persistent message')).toBeInTheDocument();
    });

    it('should clear chat history', async () => {
      render(<App />);
      
      // Send message
      const input = screen.getByPlaceholderText(/type.*message/i);
      fireEvent.change(input, { target: { value: 'To be cleared' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      await waitFor(() => {
        expect(screen.getByText('To be cleared')).toBeInTheDocument();
      });
      
      // Clear history
      const clearButton = screen.getByRole('button', { name: /clear|delete/i });
      fireEvent.click(clearButton);
      
      // Confirm
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);
      
      expect(screen.queryByText('To be cleared')).not.toBeInTheDocument();
    });
  });

  describe('Multi-turn Conversation', () => {
    it('should maintain context across turns', async () => {
      render(<App />);
      
      const input = screen.getByPlaceholderText(/type.*message/i);
      
      // Turn 1
      fireEvent.change(input, { target: { value: 'My name is Alice' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      await waitFor(() => {
        expect(screen.getByText('My name is Alice')).toBeInTheDocument();
      });
      
      // Turn 2 - should remember context
      fireEvent.change(input, { target: { value: 'What is my name?' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/alice/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle send errors gracefully', async () => {
      render(<App />);
      
      // Simulate network error
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));
      
      const input = screen.getByPlaceholderText(/type.*message/i);
      fireEvent.change(input, { target: { value: 'Error test' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
      });
    });

    it('should retry failed messages', async () => {
      render(<App />);
      
      // First attempt fails
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Fail'));
      
      const input = screen.getByPlaceholderText(/type.*message/i);
      fireEvent.change(input, { target: { value: 'Retry test' } });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
      
      // Retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Retry test')).toBeInTheDocument();
      });
    });
  });
});
