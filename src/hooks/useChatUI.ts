/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE CHAT UI (État UI pur)
 *   Hook isolé: État UI uniquement, 0 logique IA
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import type { AIMessage } from '../services/ai/types';

export interface UseChatUIOptions {
  onSend?: (message: string) => void;
}

export interface UseChatUIReturn {
  messages: AIMessage[];
  input: string;
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  setInput: (value: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuggestions: (suggestions: string[]) => void;
  addMessage: (message: AIMessage) => void;
  addMessages: (messages: AIMessage[]) => void;
  clearMessages: () => void;
  handleSend: () => void;
}

/**
 * Hook état UI pur
 * - Messages affichés
 * - Input utilisateur
 * - Loading state
 * - Erreurs UI
 * - Suggestions UI
 * - 0 logique IA
 */
export function useChatUI(options: UseChatUIOptions = {}): UseChatUIReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  /**
   * Ajoute 1 message
   * FIX v15.1: Vérification de duplication (évite les doublons)
   */
  const addMessage = useCallback((message: AIMessage) => {
    setMessages((prev) => {
      // Éviter les doublons basés sur timestamp + content
      const isDuplicate = prev.some(
        (m) => m.timestamp === message.timestamp && m.content === message.content
      );

      if (isDuplicate) {
        console.warn('⚠️ Duplicate message detected, skipping');
        return prev;
      }

      return [...prev, message];
    });
  }, []);

  /**
   * Ajoute plusieurs messages
   */
  const addMessages = useCallback((newMessages: AIMessage[]) => {
    setMessages(newMessages);
  }, []);

  /**
   * Clear tous les messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setSuggestions([]);
  }, []);

  /**
   * Envoie message (délègue à callback parent)
   */
  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;

    const trimmedInput = input.trim();
    setInput(''); // Clear input
    options.onSend?.(trimmedInput);
  }, [input, isLoading, options]);

  return {
    messages,
    input,
    isLoading,
    error,
    suggestions,
    setInput,
    setIsLoading,
    setError,
    setSuggestions,
    addMessage,
    addMessages,
    clearMessages,
    handleSend,
  };
}
