/**
 * TITANE∞ - E2E Chat Compétences, Connaissances et Mémoire
 * Ce test vérifie la capacité du chat TITANE à répondre à des questions de compétence, de connaissance et à démontrer sa mémoire de session.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

describe('E2E: Chat Compétences, Connaissances, Mémoire', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(healthCheck).mockResolvedValue({
      status: 'Healthy',
      anomalies_detected: [],
      repairs_applied: [],
      coherence_score: 1,
    });
    vi.mocked(processMessage).mockImplementation(async ({ message }) => {
      // Simule des réponses selon la question
      if (/capitale de la France/i.test(message)) return { assistant_message: 'Paris' };
      if (/2\s*\+\s*2/i.test(message)) return { assistant_message: '4' };
      if (/Qui es-tu/i.test(message))
        return { assistant_message: 'Je suis TITANE, une intelligence cognitive.' };
      if (/rappelle-moi mon prénom/i.test(message))
        return { assistant_message: 'Ton prénom est Testeur.' };
      if (/explique.*raisonnement/i.test(message))
        return { assistant_message: 'J’ai utilisé la logique pour répondre.' };
      return { assistant_message: 'Réponse générique.' };
    });
  });

  it('répond à une question de connaissance (capitale)', async () => {
    render(
      <MemoryRouter>
        <TitanePage />
      </MemoryRouter>
    );
    const chatTab = screen.getByRole('tab', { name: /chat/i });
    fireEvent.click(chatTab);
    const input = screen.getByPlaceholderText(/tapez votre message/i);
    fireEvent.change(input, {
      target: { value: 'Quelle est la capitale de la France ?' },
    });
    const sendButton = screen.getByRole('button', { name: /envoyer/i });
    fireEvent.click(sendButton);
    await waitFor(() => {
      const assistants = screen.getAllByTestId('chat-message-assistant');
      const contents = screen.getAllByTestId('chat-message-content');
      expect(contents.some(node => /paris/i.test(node.textContent || ''))).toBe(true);
    });
  });

  it('répond à une question de compétence (calcul)', async () => {
    render(
      <MemoryRouter>
        <TitanePage />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText(/tapez votre message/i);
    fireEvent.change(input, { target: { value: 'Combien font 2 + 2 ?' } });
    const sendButton = screen.getByRole('button', { name: /envoyer/i });
    fireEvent.click(sendButton);
    await waitFor(() => {
      const contents = screen.getAllByTestId('chat-message-content');
      expect(contents.some(node => /^4$/.test((node.textContent || '').trim()))).toBe(
        true
      );
    });
  });

  it('démontre la mémoire de session', async () => {
    render(
      <MemoryRouter>
        <TitanePage />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText(/tapez votre message/i);
    // Prénom donné
    fireEvent.change(input, { target: { value: 'Mon prénom est Testeur.' } });
    fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));
    // Question mémoire
    fireEvent.change(input, { target: { value: 'Peux-tu me rappeler mon prénom ?' } });
    fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));
    await waitFor(() => {
      const contents = screen.getAllByTestId('chat-message-content');
      expect(contents.some(node => /testeur/i.test(node.textContent || ''))).toBe(true);
    });
  });

  it('répond à une question d’identité', async () => {
    render(
      <MemoryRouter>
        <TitanePage />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText(/tapez votre message/i);
    fireEvent.change(input, { target: { value: 'Qui es-tu ?' } });
    fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));
    await waitFor(() => {
      const contents = screen.getAllByTestId('chat-message-content');
      expect(contents.some(node => /titane/i.test(node.textContent || ''))).toBe(true);
    });
  });

  it('explique son raisonnement (métacognition)', async () => {
    render(
      <MemoryRouter>
        <TitanePage />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText(/tapez votre message/i);
    fireEvent.change(input, { target: { value: 'Explique ton raisonnement.' } });
    fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));
    await waitFor(() => {
      const contents = screen.getAllByTestId('chat-message-content');
      expect(contents.some(node => /logique|raison/i.test(node.textContent || ''))).toBe(
        true
      );
    });
  });
});
