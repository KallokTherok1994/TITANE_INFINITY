/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v17.3.0 — USE CHAT HOOK (REFACTORED)
 *   Hook React pour Chat IA avec ChatEngine unifié + Memory Core
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';
import { chatEngine, type ChatMode, type ChatEngineResponse } from '../services/ai';
import type { AIMessage } from '../services/ai/types';
import {
  loadChatHistory,
  addMessageToHistory,
  clearChatHistory as clearHistoryStorage,
} from '../services/chatMemory';

interface UseChatOptions {
  mode?: ChatMode;
  emotionState?: { valence: number; intensity: number; energy: number };
}

interface UseChatReturn {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  currentMode: ChatMode;
  suggestions: string[];
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  setMode: (mode: ChatMode) => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<ChatMode>(options.mode || 'default');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Charge l'historique au montage
  useEffect(() => {
    const history = loadChatHistory();
    setMessages(history);
  }, []);

  // Configure le mode dans chatEngine
  useEffect(() => {
    chatEngine.setMode(currentMode, {
      emotionState: options.emotionState,
    });
  }, [currentMode, options.emotionState]);

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
      // Appelle chatEngine unifié
      const response: ChatEngineResponse = await chatEngine.generate(
        content.trim(),
        updatedMessages
      );

      // Ajoute réponse IA
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: response.timestamp,
      };

      const finalMessages = addMessageToHistory(aiMessage);
      setMessages([...finalMessages]);

      // Met à jour suggestions
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
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
    setSuggestions([]);
  }, []);

  // Change le mode de travail
  const setMode = useCallback((mode: ChatMode) => {
    setCurrentMode(mode);
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentMode,
    suggestions,
    sendMessage,
    clearChat,
    setMode,
  };
}
