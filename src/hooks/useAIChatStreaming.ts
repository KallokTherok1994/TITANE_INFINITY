/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v19.0.0 — AI CHAT STREAMING HOOK
 * Hook React pour gérer streaming token-by-token avec typing indicators
 * ═══════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef } from 'react';
import { aiChatClient } from '../services/aiChatClient';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  requestId?: string;
};

export function useAIChatStreaming() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentRequestId = useRef<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setError(null);

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMessage]);
    setIsStreaming(true);

    try {
      const requestId = await aiChatClient.sendMessageStreaming(
        content,
        {
          onChunk: (chunk) => {
            setMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              const lastMsg = updated[lastIndex];
              if (lastMsg && lastMsg.role === 'assistant') {
                updated[lastIndex] = {
                  ...lastMsg,
                  content: lastMsg.content + chunk,
                  isStreaming: true,
                };
              }
              return updated;
            });
          },
          onComplete: (fullResponse) => {
            setMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              const lastMsg = updated[lastIndex];
              if (lastMsg && lastMsg.role === 'assistant') {
                updated[lastIndex] = {
                  ...lastMsg,
                  content: fullResponse,
                  isStreaming: false,
                };
              }
              return updated;
            });
            setIsStreaming(false);
            currentRequestId.current = null;
          },
          onError: (err) => {
            setError(err.message);
            setIsStreaming(false);
            setMessages(prev => prev.slice(0, -1));
            currentRequestId.current = null;
          },
        }
      );
      currentRequestId.current = requestId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsStreaming(false);
      setMessages(prev => prev.slice(0, -1));
    }
  }, []);

  const cancelStreaming = useCallback(() => {
    if (currentRequestId.current) {
      aiChatClient.cancelRequest(currentRequestId.current);
      setIsStreaming(false);
      currentRequestId.current = null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const sendMessageNoStreaming = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setError(null);

    try {
      const response = await aiChatClient.sendMessage(content);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    cancelStreaming,
    clearMessages,
    sendMessageNoStreaming,
  };
}
