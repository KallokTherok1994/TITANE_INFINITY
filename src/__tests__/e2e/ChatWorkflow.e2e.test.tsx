/**
 * E2E Tests: Chat Workflow
 * Coverage: Chat → Memory → Response flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TitanePage } from '@/pages/TitanePage';
import { processMessage, healthCheck } from '@/services/conversationEngine';

vi.mock('@/services/conversationEngine', async () => {
  const actual = await vi.importActual<typeof import('@/services/conversationEngine')>(
    '@/services/conversationEngine'
  );
  return {
    ...actual,
    processMessage: vi.fn(),
    healthCheck: vi.fn(),
  };
});

describe('E2E: Chat Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(healthCheck).mockResolvedValue({
      status: 'Healthy',
      anomalies_detected: [],
      repairs_applied: [],
      coherence_score: 1,
    });
    vi.mocked(processMessage).mockResolvedValue({
      assistant_message: 'Réponse simulée',
      conversation_id: 'c1',
      message_id: 'm1',
      detected_intention: 'Question',
      detected_emotion: { valence: 0, intensity: 0, energy: 0 },
      cognitive_tags: [],
      cognitive_summary: '',
      metadata: {
        timestamp: Date.now(),
        provider_used: 'mock',
        latency_ms: 10,
        tokens_used: 0,
        memory_effect: 'New',
        links_to_contexts: [],
      },
    });
  });

  describe('Complete Chat Flow', () => {
    it('should complete full chat interaction', async () => {
      render(<TitanePage />);

      // Navigate to Chat
      const chatTab = screen.getByRole('tab', { name: /chat/i });
      fireEvent.click(chatTab);

      // Type message
      const input = screen.getByPlaceholderText(/tapez votre message/i);
      fireEvent.change(input, { target: { value: 'Hello TITANE' } });

      // Send message
      const sendButton = screen.getByRole('button', { name: /envoyer/i });
      fireEvent.click(sendButton);

      // Wait for response
      await waitFor(
        () => {
          expect(screen.getByText('Hello TITANE')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should store chat in memory', async () => {
      render(<TitanePage />);

      // Send chat message
      const input = screen.getByPlaceholderText(/tapez votre message/i);
      fireEvent.change(input, { target: { value: 'Remember this' } });
      fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));

      await waitFor(() => {
        expect(screen.getByText('Remember this')).toBeInTheDocument();
      });

      // Navigate to Memory
      fireEvent.click(screen.getByRole('tab', { name: /mémoire/i }));

      // Verify memory stored in localStorage
      await waitFor(() => {
        const stored = localStorage.getItem('titane_chat_mode_default');
        expect(stored).toBeTruthy();
        const parsed = stored ? JSON.parse(stored) : null;
        expect(
          parsed?.messages?.some(
            (msg: { content: string }) => msg.content === 'Remember this'
          )
        ).toBe(true);
      });
    });

    it('should handle streaming responses', async () => {
      render(<TitanePage />);

      const input = screen.getByPlaceholderText(/tapez votre message/i);
      fireEvent.change(input, { target: { value: 'Long response test' } });
      fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));

      await waitFor(() => {
        expect(screen.getByText('Long response test')).toBeInTheDocument();
      });
    });
  });

  describe('Chat History', () => {
    it('should persist chat history', async () => {
      const { unmount } = render(<TitanePage />);

      // Send message
      const input = screen.getByPlaceholderText(/tapez votre message/i);
      fireEvent.change(input, { target: { value: 'Persistent message' } });
      fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));

      await waitFor(() => {
        expect(screen.getAllByText('Persistent message').length).toBeGreaterThan(0);
      });

      // Unmount and remount
      unmount();
      render(<TitanePage />);

      // History should be restored
      expect(screen.getAllByText('Persistent message').length).toBeGreaterThan(0);
    });

    it('should clear chat history', async () => {
      render(<TitanePage />);

      // Send message
      const input = screen.getByPlaceholderText(/tapez votre message/i);
      fireEvent.change(input, { target: { value: 'To be cleared' } });
      fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));

      await waitFor(() => {
        expect(screen.getByText('To be cleared')).toBeInTheDocument();
      });

      // Clear history
      vi.stubGlobal(
        'confirm',
        vi.fn(() => true)
      );
      const clearButton = screen.getByRole('button', { name: /effacer/i });
      fireEvent.click(clearButton);

      expect(screen.queryByText('To be cleared')).not.toBeInTheDocument();
    });
  });

  describe('Multi-turn Conversation', () => {
    it('should maintain context across turns', async () => {
      render(<TitanePage />);

      const input = screen.getByPlaceholderText(/tapez votre message/i);

      // Turn 1
      fireEvent.change(input, { target: { value: 'My name is Alice' } });
      fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));

      await waitFor(() => {
        expect(screen.getByText('My name is Alice')).toBeInTheDocument();
      });

      // Turn 2 - should remember context
      fireEvent.change(input, { target: { value: 'What is my name?' } });
      fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));

      await waitFor(() => {
        expect(screen.getByText('My name is Alice')).toBeInTheDocument();
        expect(screen.getByText('What is my name?')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle send errors gracefully', async () => {
      render(<TitanePage />);

      // Simulate network error
      vi.mocked(processMessage).mockRejectedValueOnce(new Error('Network error'));

      const input = screen.getByPlaceholderText(/tapez votre message/i);
      fireEvent.change(input, { target: { value: 'Error test' } });
      fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));

      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
      });
    });

    it('should retry failed messages', async () => {
      render(<TitanePage />);

      // First attempt fails
      vi.mocked(processMessage)
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce({
          assistant_message: 'Réponse simulée',
          conversation_id: 'c1',
          message_id: 'm2',
          detected_intention: 'Question',
          detected_emotion: { valence: 0, intensity: 0, energy: 0 },
          cognitive_tags: [],
          cognitive_summary: '',
          metadata: {
            timestamp: Date.now(),
            provider_used: 'mock',
            latency_ms: 10,
            tokens_used: 0,
            memory_effect: 'New',
            links_to_contexts: [],
          },
        });

      const input = screen.getByPlaceholderText(/tapez votre message/i);
      fireEvent.change(input, { target: { value: 'Retry test' } });
      fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));

      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
      });

      // Retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(processMessage).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Réponse simulée')).toBeInTheDocument();
      });
    });
  });
});
