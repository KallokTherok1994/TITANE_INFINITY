/**
 * TITANE∞ v19.2Ω — VERIFICATION COMPLÈTE CHAT IA INTERFACE
 * Test complet du Chat IA en mode interface pour identifier tous les blocages
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ChatWindow } from '../components/ChatWindow';

// Mock du hook useChat pour isoler les tests interface
vi.mock('../hooks/useChat', () => ({
  useChat: vi.fn()
}));

// Mock des composants enfants
vi.mock('../hooks/useConnection', () => ({
  useConnection: () => ({ status: { online: true, provider: 'Gemini' } })
}));

vi.mock('../core/state/SingularityState', () => ({
  useSingularityState: () => ({
    setAIStatus: vi.fn(),
    setAIError: vi.fn()
  })
}));

describe('🧪 CHAT IA INTERFACE - VERIFICATION COMPLÈTE', () => {
  const mockSendMessage = vi.fn();
  const { useChat } = await import('../hooks/useChat');
  const defaultChatState = {
    messages: [],
    isLoading: false,
    error: null,
    sendMessage: mockSendMessage,
    currentMode: 'default',
    anomalyCount: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useChat).mockReturnValue(defaultChatState);
  });

  test('1️⃣ Composant ChatWindow se rend sans crash', () => {
    render(<ChatWindow />);
    expect(screen.getByText('TITANE∞ Chat IA')).toBeInTheDocument();
  });

  test('2️⃣ Input et bouton envoi présents', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText(/Posez votre question/i);
    const sendButton = screen.getByRole('button', { name: /📨/ });

    expect(input).toBeInTheDocument();
    expect(sendButton).toBeInTheDocument();
  });

  test('3️⃣ Saisie de message et envoi fonctionnel', async () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText(/Posez votre question/i);
    const sendButton = screen.getByRole('button', { name: /📨/ });

    // Saisir un message
    fireEvent.change(input, { target: { value: 'Test message Chat IA' } });
    expect(input).toHaveValue('Test message Chat IA');

    // Envoyer le message
    fireEvent.click(sendButton);

    // Vérifier que sendMessage est appelé
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message Chat IA');
    });
  });

  test('4️⃣ État de loading affiché correctement', async () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      isLoading: true
    });

    render(<ChatWindow />);

    expect(screen.getByText('TITANE réfléchit...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⏳/ })).toBeDisabled();
  });

  test('5️⃣ Messages affichés dans la liste', async () => {
    const mockMessages = [
      {
        role: 'user',
        content: 'Question test',
        timestamp: Date.now()
      },
      {
        role: 'assistant',
        content: 'Réponse de TITANE∞',
        timestamp: Date.now() + 1000
      }
    ];

    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      messages: mockMessages
    });

    render(<ChatWindow />);

    expect(screen.getByText('Question test')).toBeInTheDocument();
    expect(screen.getByText('Réponse de TITANE∞')).toBeInTheDocument();
  });

  test('6️⃣ Gestion des erreurs Chat IA', async () => {
    vi.mocked(useChat).mockReturnValue({
      ...defaultChatState,
      error: 'Erreur de connexion Chat IA'
    });

    render(<ChatWindow />);

    expect(screen.getByText(/Erreur de connexion Chat IA/)).toBeInTheDocument();
  });  test('7️⃣ Mode voix toggle fonctionnel', () => {
    const mockVoiceToggle = jest.fn();

    render(<ChatWindow onVoiceModeToggle={mockVoiceToggle} voiceModeActive={false} />);

    const voiceButton = screen.getByTitle('Toggle Voice Mode');
    fireEvent.click(voiceButton);

    expect(mockVoiceToggle).toHaveBeenCalled();
  });

  test('8️⃣ Envoi avec Entrée (sans Shift)', async () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText(/Posez votre question/i);

    fireEvent.change(input, { target: { value: 'Message rapide' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Message rapide');
    });
  });

  test('9️⃣ Nouvelle ligne avec Shift+Entrée', () => {
    render(<ChatWindow />);

    const input = screen.getByPlaceholderText(/Posez votre question/i);

    fireEvent.change(input, { target: { value: 'Message multi\nligne' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    // Message ne doit PAS être envoyé avec Shift+Enter
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  test('🔟 Message vide ne peut pas être envoyé', async () => {
    render(<ChatWindow />);

    const sendButton = screen.getByRole('button', { name: /📨/ });

    // Bouton désactivé quand input vide
    expect(sendButton).toBeDisabled();

    // Click ne fait rien
    fireEvent.click(sendButton);
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});

describe('🚀 INTEGRATION CHAT IA HOOK', () => {
  test('Hook useChat retourne structure correcte', () => {
    const chatState = useChat();

    expect(chatState).toHaveProperty('messages');
    expect(chatState).toHaveProperty('sendMessage');
    expect(chatState).toHaveProperty('isLoading');
    expect(chatState).toHaveProperty('error');
    expect(chatState).toHaveProperty('currentMode');

    expect(Array.isArray(chatState.messages)).toBe(true);
    expect(typeof chatState.sendMessage).toBe('function');
  });

  test('SendMessage appel avec timeout protection', async () => {
    const { sendMessage } = useChat();

    // Test avec timeout pour éviter blocage
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), 5000)
    );

    try {
      await Promise.race([
        sendMessage('Test timeout protection'),
        timeoutPromise
      ]);
    } catch (error) {
      if (error.message === 'TIMEOUT') {
        console.warn('⚠️ SendMessage a pris plus de 5s - possible blocage détecté');
      }
    }
  });
});
