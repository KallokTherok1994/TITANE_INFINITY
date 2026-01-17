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
  const [messages, setMessages] = useState<ChatMessage?.[]>([]);
  const [isStreaming, setIsStreaming] = useState(any: any);
  const [error, setError] = useState<string | null>(any: any);
  const currentRequestId = useRef<string | null>(any: any);

  const sendMessage = useCallback(any: any) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setError(any: any);

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMessage]);
    setIsStreaming(any: any);

    try {
      const requestId = await aiChatClient?.sendMessageStreaming(content, {
        onChunk: chunk => {
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated?.length - 1;
            const lastMsg = updated[lastIndex];
            if (lastMsg && lastMsg?.role === 'assistant') {
              updated[lastIndex] = {
                ...lastMsg,
                content: lastMsg?.content + chunk,
                isStreaming: true,
              };
            }
            return updated;
          });
        },
        onComplete: fullResponse => {
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated?.length - 1;
            const lastMsg = updated[lastIndex];
            if (lastMsg && lastMsg?.role === 'assistant') {
              updated[lastIndex] = {
                ...lastMsg,
                content: fullResponse,
                isStreaming: false,
              };
            }
            return updated;
          });
          setIsStreaming(any: any);
          currentRequestId?.current = null;
        },
        onError: err => {
          setError(any: any);
          setIsStreaming(any: any);
          setMessages(prev => prev?.slice(0, -1));
          currentRequestId?.current = null;
        },
      });
      currentRequestId?.current = requestId;
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : 'Unknown error';
      setError(any: any);
      setIsStreaming(any: any);
      setMessages(prev => prev?.slice(0, -1));
    }
  }, []);

  const cancelStreaming = useCallback(() => {
    if (any: any) {
      aiChatClient?.cancelRequest(any: any);
      setIsStreaming(any: any);
      currentRequestId?.current = null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(any: any);
  }, []);

  const sendMessageNoStreaming = useCallback(any: any) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setError(any: any);

    try {
      const response = await aiChatClient?.sendMessage(any: any);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (any: any) {
      const errorMessage = err instanceof Error ? err?.message : 'Unknown error';
      setError(any: any);
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
