// TITANE∞ v12 - useAI Hook
// React hook for AI interactions

import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokens?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  tokens: number;
  timestamp: number;
}

export interface AIStatus {
  online: boolean;
  provider: 'Gemini' | 'Ollama' | 'Offline';
  health: number;
}

export function useAI() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AIStatus>({
    online: false,
    provider: 'Offline',
    health: 0,
  });

  const query = useCallback(
    async (
      prompt: string,
      temperature?: number,
      maxTokens?: number
    ): Promise<AIResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Add user message
        const userMessage: AIMessage = {
          id: `${Date.now()}-user`,
          role: 'user',
          content: prompt,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Query AI
        const responseJson = await invoke<string>('ai_query', {
          prompt,
          temperature,
          maxTokens,
        });

        const response: AIResponse = JSON.parse(responseJson);

        // Add AI message
        const aiMessage: AIMessage = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: response.content,
          timestamp: response.timestamp,
          tokens: response.tokens,
        };

        setMessages((prev) => [...prev, aiMessage]);

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        console.error('AI query error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const checkHealth = useCallback(async () => {
    try {
      const healthJson = await invoke<string>('health_check');
      const health = JSON.parse(healthJson);

      setStatus({
        online: health.ai.internet,
        provider: health.ai.gemini.available
          ? 'Gemini'
          : health.ai.ollama.available
          ? 'Ollama'
          : 'Offline',
        health: health.diagnostic.overall_health,
      });
    } catch (err) {
      console.error('Health check error:', err);
      setStatus({
        online: false,
        provider: 'Offline',
        health: 0,
      });
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    status,
    query,
    checkHealth,
    clearMessages,
  };
}
