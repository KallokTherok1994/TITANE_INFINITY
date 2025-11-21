/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v16.0 — USE CHAT HOOK
 *   Hook React pour gestion Chat IA avec orchestrateur moderne
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { askTitan } from '../services/ai/orchestrator';
import type { AIMessage, AIResponse } from '../services/ai/types';
import {
  loadChatHistory,
  addMessageToHistory,
  clearChatHistory as clearHistoryStorage,
} from '../services/chatMemory';

interface UseChatReturn {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charge l'historique au montage
  useEffect(() => {
    const history = loadChatHistory();
    setMessages(history);
  }, []);

  // Envoie un message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Ajoute message utilisateur
    const userMessage: AIMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = addMessageToHistory(userMessage);
    setMessages([...updatedMessages]);

    try {
      // Appelle l'orchestrateur IA
      const response: AIResponse = await askTitan(content.trim(), updatedMessages);

      // Ajoute réponse IA
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
      };

      const finalMessages = addMessageToHistory(aiMessage);
      setMessages([...finalMessages]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);

      // Ajoute message d'erreur dans le chat
      const errorAiMessage: AIMessage = {
        role: 'assistant',
        content: `❌ Erreur: ${errorMessage}`,
        timestamp: Date.now(),
      };

      const finalMessages = addMessageToHistory(errorAiMessage);
      setMessages([...finalMessages]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Efface tout le chat
  const clearChat = useCallback(() => {
    clearHistoryStorage();
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}

export default useChat;
