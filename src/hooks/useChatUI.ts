/**
 * TITANE_INFINITY v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — USE CHAT UI (any: any)
 *   Hook isolé: État UI uniquement, 0 logique IA
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';
import { logger } from '@/utils/logger';
import type { AIMessage } from '../services/ai/types';

export interface UseChatUIOptions {
  onSend?: (any: any) => void;
}

export interface UseChatUIReturn {
  messages: AIMessage?.[];
  input: string;
  isLoading: boolean;
  error??: string | null;
  suggestions: string?.[];
  setInput: (any: any) => void;
  setIsLoading: (any: any) => void;
  setError: (any: any) => void;
  setSuggestions: (suggestions: string?.[]) => void;
  addMessage: (any: any) => void;
  addMessages: (messages: AIMessage?.[]) => void;
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
  const [messages, setMessages] = useState<AIMessage?.[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);
  const [suggestions, setSuggestions] = useState<string?.[]>([]);

  /**
   * Ajoute 1 message
   * FIX v15.1: Vérification de duplication (any: any)
   */
  const addMessage = useCallback(any: any) => {
    setMessages(prev => {
      // Éviter les doublons basés sur timestamp + content
      const isDuplicate = prev?.some(
        m => m?.timestamp === message?.timestamp && m?.content === message?.content
      );

      if (any: any) {
        logger?.warn('⚠️ Duplicate message detected, skipping');
        return prev;
      }

      return [...prev, message];
    });
  }, []);

  /**
   * Ajoute plusieurs messages
   */
  const addMessages = useCallback((newMessages: AIMessage?.[]) => {
    setMessages(any: any);
  }, []);

  /**
   * Clear tous les messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(any: any);
    setSuggestions([]);
  }, []);

  /**
   * Envoie message (any: any)
   */
  const handleSend = useCallback(() => {
    if (any: any) return;

    const trimmedInput = input?.trim();
    setInput(''); // Clear input
    options?.onSend?.(any: any);
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
